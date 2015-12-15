angular.module("seAjaxDemoApp", ["seAjax", "restangular", "seNotifications"]).controller("DemoCtrl", function (SeNotificationsService, Restangular) {
	"use strict";
	var controller = this;

	function initState() {
		Restangular.one("posts", 1).get().then(function(response) {
			controller.post = response;
		});
	}
	function atachMethods() {
		controller.doPost = function() {
			Restangular.all("posts").post({some: "data"});
		};
		controller.get404 = function() {
			Restangular.one("notfound", 1).get();
		};
	}

	initState();
	atachMethods();
}).config(function(RestangularProvider) {
	"use strict";
	// Set default server URL for 'logs/' and posts/ endpoint
	RestangularProvider.setBaseUrl("http://private-878ea-seajax.apiary-mock.com");
}).config(function($translateProvider) {
	"use strict";
	$translateProvider.preferredLanguage("en");
	$translateProvider.useSanitizeValueStrategy("escape");
}).factory("waitInterceptor", function($q, $timeout, $log) {
	"use strict";
	// add latency for ajax handling demonstration
	return {
		"response": function(response) {
			if ((response.config.url.indexOf("http://private-878ea-seajax.apiary-mock.com/posts/1") === -1) &&
				(response.config.url.indexOf("http://private-878ea-seajax.apiary-mock.com/posts") === -1)) {
				return response;
			}
			$log.log("latency", response.config.url);
			return $timeout(function() {
				return response;
			}, 6000);
		},
		"responseError": function(response) {
			if (response.config.url.indexOf("http://private-878ea-seajax.apiary-mock.com/notfound/1") !== -1) {
				return $q.reject(response);
			}

			$log.log("err latency", response.config.url);
			return $timeout(function() {
				return $q.reject(response);
			}, 6000);
		}
	};
}).config(function ($httpProvider) {
	"use strict";
	$httpProvider.interceptors.push("waitInterceptor");
});
