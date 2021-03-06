//based on http://codingsmackdown.tv/blog/2013/04/20/using-response-interceptors-to-show-and-hide-a-loading-widget-redux/
angular.module("seAjax.errors",
	["seAjax.translations", "seAjax.sniffer", "seNotifications.service", "ui.router", "restangular"])
.provider("SeAjaxDisplayRequestErrorsService", function SeAjaxDisplayRequestErrorsServiceProvider() {
	"use strict";
	var provider = this;
	/*jshint -W072 */
	function SeAjaxDisplayRequestErrorsService(SeAjaxRequestsSnifferService, $rootScope, $translate, SeNotificationsService,
		$injector, Restangular, effectiveOptions) {
		/*jshint +W072 */
		var service = this;

		var PREFIX_STRIPPED_URL = "~";

		function postNotification(errorResponse) {
			function shouldSkipAjaxError(config) {
				if (config.$$SeAjaxDisplayRequestErrorsService && config.$$SeAjaxDisplayRequestErrorsService.restangularSkipAjaxError === true) {
					return true;
				}
				return false;
			}

			function translateOrNext(errorResponse, possibleTranslations) {
				if (possibleTranslations.length === 0) {
					SeNotificationsService.showNotificationError("httperrors.unknown", null, null, angular.toJson(errorResponse));
					return;
				}
				var next = possibleTranslations.shift();
				$translate(next).then(function() {
					SeNotificationsService.showNotificationError(next, null, null, angular.toJson(errorResponse));
				}, function() {
					translateOrNext(errorResponse, possibleTranslations);
				});
			}
			function removeParameters(url) {
				var index = url.lastIndexOf("?");
				if (index === -1) {
					return url;
				}

				return url.substring(0, index);
			}
			function getStrippedUrl(url) {
				if (url.indexOf(Restangular.configuration.baseUrl) !== 0) {
					return;
				}
				return PREFIX_STRIPPED_URL + url.substring(Restangular.configuration.baseUrl.length);
			}
			function processUrl(url) {
				var strippedUrl = getStrippedUrl(url);
				var result = url;
				_.forEach(effectiveOptions.urlPatterns, function(nextValue) {
					if (nextValue.pattern.test(url)) {
						result = nextValue.newUrl;
						return false;
					}
					if (strippedUrl && nextValue.pattern.test(strippedUrl)) {
						result = "~" + nextValue.newUrl;
						return false;
					}
				});

				return result;
			}

			if (shouldSkipAjaxError(errorResponse.config)) {
				return;
			}

			var url = processUrl(removeParameters(errorResponse.config.url));
			var strippedUrl = getStrippedUrl(url);

			var possibleTranslations;
			var currentStateName = $injector.get("$state").current.name;

			// WARNING: if you update if part you should update else part, too!
			if (strippedUrl) {
				possibleTranslations = [
					"httperrors." + errorResponse.config.method + ".[" + currentStateName + "]." + errorResponse.status + "." + url,
					"httperrors." + errorResponse.config.method + ".[" + currentStateName + "]." + errorResponse.status + "." + strippedUrl,
					"httperrors." + errorResponse.config.method + "." + errorResponse.status + "." + url,
					"httperrors." + errorResponse.config.method + "." + errorResponse.status + "." + strippedUrl,
					"httperrors." + errorResponse.config.method + "." + url,
					"httperrors." + errorResponse.config.method + "." + strippedUrl,
					"httperrors." + errorResponse.status
				];
			} else {
				// method full url code state
				// method url code state
				// method url code
				// method url
				// "/cashexpress/api/v1/authenticate?noCache=1453299840493"

				possibleTranslations = [
					"httperrors." + errorResponse.config.method + ".[" + currentStateName + "]." + errorResponse.status + "." + url,
					"httperrors." + errorResponse.config.method + "." + errorResponse.status + "." + url,
					"httperrors." + errorResponse.config.method + "." + url,
					"httperrors." + errorResponse.status
				];
			}
			translateOrNext(errorResponse, possibleTranslations);
		}

		service.$$init = function() {
			SeAjaxRequestsSnifferService.onRequestError($rootScope, postNotification);
		};
		service.restangularSkipAjaxError = function(restangularizedElement) {
			return restangularizedElement.withHttpConfig({$$SeAjaxDisplayRequestErrorsService: {restangularSkipAjaxError: true}});
		};
	}

	var DEFAULT_OPTIONS = {
		urlPatterns: []
	};
	var customizedOptions;

	provider.setCustomizedOptions = function(options) {
		customizedOptions = options;
	};
	provider.getDefaultOptions = function() {
		return angular.copy(DEFAULT_OPTIONS);
	};

	/*jshint -W072 */
	provider.$get = ["SeAjaxRequestsSnifferService", "$rootScope", "$translate", "SeNotificationsService", "$injector", "Restangular",
		function SeAjaxDisplayRequestErrorsServiceFactory(SeAjaxRequestsSnifferService, $rootScope, $translate, SeNotificationsService, $injector, Restangular) {
		/*jshint +W072 */
		var effectiveOptions = _.assign({}, DEFAULT_OPTIONS, customizedOptions);
		return new SeAjaxDisplayRequestErrorsService(SeAjaxRequestsSnifferService, $rootScope, $translate, SeNotificationsService,
			$injector, Restangular, effectiveOptions);
	}];
}).run(function(SeAjaxDisplayRequestErrorsService) {
	"use strict";
	SeAjaxDisplayRequestErrorsService.$$init();
});
