//based on http://codingsmackdown.tv/blog/2013/04/20/using-response-interceptors-to-show-and-hide-a-loading-widget-redux/
angular.module("seAjax.errors",
	["seAjax.translations", "seAjax.sniffer", "seNotifications.service", "ui.router", "restangular"])
.provider("SeAjaxDisplayRequestErrorsService", function SeAjaxDisplayRequestErrorsServiceProvider() {
	"use strict";
	var provider = this;
	/*jshint -W072 */
	function SeAjaxDisplayRequestErrorsService(SeAjaxRequestsSnifferService, $rootScope, $translate, SeNotificationsService, $state, Restangular) {
	/*jshint +W072 */
		var service = this;

		// user is navigated to login, so it will be notified
		// this should be moved to config section (hidden error codes to be configurable)
		var HIDDEN_ERROR_CODES = [401, 403];

		function postNotification(errorResponse) {
			function translateOrNext(possibleTranslations) {
				if (possibleTranslations.length === 0) {
					SeNotificationsService.showNotificationError("httperrors.unknown");
					return;
				}
				var next = possibleTranslations.shift();
				$translate(next).then(function() {
					SeNotificationsService.showNotificationError(next);
				}, function() {
					translateOrNext(possibleTranslations);
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
				return url.substring(Restangular.configuration.baseUrl.length);
			}
			if (HIDDEN_ERROR_CODES.indexOf(errorResponse.status) !== -1) {
				return;
			}

			var url = removeParameters(errorResponse.config.url);
			var strippedUrl = getStrippedUrl(url);

			var possibleTranslations;

			// WARNING: if you update if part you should update else part, too!
			if (strippedUrl) {
				possibleTranslations = [
					"httperrors."+errorResponse.config.method+".["+$state.current.name+"]."+errorResponse.status+"."+url,
					"httperrors."+errorResponse.config.method+".["+$state.current.name+"]."+errorResponse.status+".~"+strippedUrl,
					"httperrors."+errorResponse.config.method+"."+errorResponse.status+"."+url,
					"httperrors."+errorResponse.config.method+"."+errorResponse.status+".~"+strippedUrl,
					"httperrors."+errorResponse.config.method+"."+url,
					"httperrors."+errorResponse.config.method+".~"+strippedUrl,
					"httperrors." + errorResponse.status
				];
			} else {
				// method full url code state
				// method url code state
				// method url code
				// method url
				// "/cashexpress/api/v1/authenticate?noCache=1453299840493"

				possibleTranslations = [
					"httperrors."+errorResponse.config.method+".["+$state.current.name+"]."+errorResponse.status+"."+url,
					"httperrors."+errorResponse.config.method+"."+errorResponse.status+"."+url,
					"httperrors."+errorResponse.config.method+"."+url,
					"httperrors." + errorResponse.status
				];
			}
			translateOrNext(possibleTranslations);
		}

		service.$$init = function() {
			SeAjaxRequestsSnifferService.onRequestError($rootScope, postNotification);
		};
	}
	/*jshint -W072 */
	provider.$get = ["SeAjaxRequestsSnifferService", "$rootScope", "$translate", "SeNotificationsService", "$state", "Restangular",
		function SeAjaxDisplayRequestErrorsServiceFactory(SeAjaxRequestsSnifferService, $rootScope, $translate, SeNotificationsService, $state, Restangular) {
	/*jshint +W072 */
		return new SeAjaxDisplayRequestErrorsService(SeAjaxRequestsSnifferService, $rootScope, $translate, SeNotificationsService, $state, Restangular);
	}];
}).run(function(SeAjaxDisplayRequestErrorsService) {
	"use strict";
	SeAjaxDisplayRequestErrorsService.$$init();
});
