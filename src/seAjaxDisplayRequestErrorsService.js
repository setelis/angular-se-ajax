//based on http://codingsmackdown.tv/blog/2013/04/20/using-response-interceptors-to-show-and-hide-a-loading-widget-redux/
angular.module("seAjax.errors", ["seAjax.translations", "seAjax.sniffer", "seNotifications.service"]).service("SeAjaxDisplayRequestErrorsService",
	function (SeAjaxRequestsSnifferService, $rootScope, $translate, SeNotificationsService) {
	"use strict";
	var service = this;

	// user is navigated to login, so it will be notified
	// this should be moved to config section (hidden error codes to be configurable)
	var HIDDEN_ERROR_CODES = [401, 403];

	function postNotification(errorResponse) {
		if (HIDDEN_ERROR_CODES.indexOf(errorResponse.status) !== -1) {
			return;
		}

		var template = "httperrors." + errorResponse.status;

		$translate(template).then(function() {
			SeNotificationsService.showNotificationError(template);
		}, function() {
			template = "httperrors.unknown";
			SeNotificationsService.showNotificationError(template);
		});
	}

	service.$$init = function() {
		SeAjaxRequestsSnifferService.onRequestError($rootScope, postNotification);
	};
}).run(function(SeAjaxDisplayRequestErrorsService) {
	"use strict";

	SeAjaxDisplayRequestErrorsService.$$init();
});
