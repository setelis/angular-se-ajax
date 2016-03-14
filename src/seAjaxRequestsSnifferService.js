angular.module("seAjax.sniffer", []).service("SeAjaxRequestsSnifferService", function($rootScope) {
	"use strict";

	var service = this;

	// private notification messages
	var _START_REQUEST_ = "$$SeAjaxRequestsSnifferService_START_REQUEST_";
	var _END_REQUEST_SUCCESS_ = "$$SeAjaxRequestsSnifferService_END_REQUEST_SUCCESS_";
	var _END_REQUEST_ERROR_ = "$$SeAjaxRequestsSnifferService_END_REQUEST_ERROR_";

	// invoke
	service.$$requestStarted = function(config) {
		// events are used to easily detach when component is removed
		$rootScope.$broadcast(_START_REQUEST_, config);
	};
	service.$$requestSuccess = function(response) {
		$rootScope.$broadcast(_END_REQUEST_SUCCESS_, response);
	};
	service.$$requestError = function(response) {
		$rootScope.$broadcast(_END_REQUEST_ERROR_, response);
	};

	// register
	service.onRequestStarted = function($scope, handler) {
		$scope.$on(_START_REQUEST_, function(event, args) {
			handler(args);
		});
	};
	service.onRequestSuccess = function($scope, handler) {
		$scope.$on(_END_REQUEST_SUCCESS_, function(event, args) {
			handler(args);
		});
	};
	service.onRequestError = function($scope, handler) {
		$scope.$on(_END_REQUEST_ERROR_, function(event, args) {
			handler(args);
		});
	};
}).factory("SeAjaxRequestsSnifferInterceptor", function($q, SeAjaxRequestsSnifferService) {
	"use strict";
	return {
		"request": function(config) {
			SeAjaxRequestsSnifferService.$$requestStarted(config);
			return config;
		},
		"response": function(response) {
			SeAjaxRequestsSnifferService.$$requestSuccess(response);
			return response;
		},
		"responseError": function(rejection) {
			SeAjaxRequestsSnifferService.$$requestError(rejection);
			return $q.reject(rejection);
		}
	};
}).config(function($httpProvider) {
	"use strict";
	$httpProvider.interceptors.push("SeAjaxRequestsSnifferInterceptor");
});
