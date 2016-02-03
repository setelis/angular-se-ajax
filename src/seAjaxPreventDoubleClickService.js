//based on http://codingsmackdown.tv/blog/2013/04/20/using-response-interceptors-to-show-and-hide-a-loading-widget-redux/
// blur is based on http://stackoverflow.com/questions/9416556/jquery-how-to-disable-the-entire-page
angular.module("seAjax.doubleclick", ["seAjax.sniffer"]).service("SeAjaxPreventDoubleClickService", function (SeAjaxRequestsSnifferService, $rootScope) {
	"use strict";
	var service = this;

	service.$$init = function() {
		var pendingRequests = 0;
		var modal;

		function blur() {
			if (modal) {
				throw "SeAjaxPreventDoubleClickService: blur with modal";
			}

			modal = $("<div />").dialog({
				modal: true,
				dialogClass: "no-titlebar",
				show: {
					effect: "drop",
					duration: 1000
				},
				hide: {
					effect: "drop",
					duration: 1000
				}
			});
			// modal.dialog("widget").empty();
			// modal.dialog("widget").append($("<div />", {"class": "loading"}));
			// modal.dialog("widget").hide();
		}
		function deblur() {
			if (!modal) {
				throw "SeAjaxPreventDoubleClickService: deblur with no modal";
			}
			modal.dialog("close");
			modal = null;
		}
		function isRequestWithoutBlur(config) {
			if (config.$$SeAjaxPreventDoubleClickService && config.$$SeAjaxPreventDoubleClickService.withoutBlur === true) {
				return true;
			}
			return false;
		}
		function checkRequestStarted(config) {
			if (config.method === "GET" || isRequestWithoutBlur(config)) {
				return;
			}
			service.requestStarted();
		}
		function checkRequestEnded(response) {
			if ((response.config && response.config.method === "GET") || isRequestWithoutBlur(response.config)) {
				return;
			}
			service.requestEnded();
		}
		service.requestStarted = function() {
			pendingRequests++;

			if (pendingRequests !== 1) {
				// already disabled
				return;
			}
			blur();
		};
		service.requestEnded = function() {
			pendingRequests--;

			if (pendingRequests > 0) {
				// there are still pending requests
				return;
			}
			// in case that response.config is not set and pendingRequests is decreased for GET
			if (pendingRequests < 0) {
				pendingRequests = 0;
				return;
			}

			deblur();
		};

		SeAjaxRequestsSnifferService.onRequestStarted($rootScope, checkRequestStarted);
		SeAjaxRequestsSnifferService.onRequestSuccess($rootScope, checkRequestEnded);
		SeAjaxRequestsSnifferService.onRequestError($rootScope, checkRequestEnded);
	};

	service.restangularWithoutBlur = function(restangularizedElement) {
		return restangularizedElement.withHttpConfig({$$SeAjaxPreventDoubleClickService: {withoutBlur: true}});
	};
}).run(function(SeAjaxPreventDoubleClickService) {
	"use strict";

	SeAjaxPreventDoubleClickService.$$init();
});
