//based on http://codingsmackdown.tv/blog/2013/04/20/using-response-interceptors-to-show-and-hide-a-loading-widget-redux/
// http://stackoverflow.com/questions/16098430/angular-ie-caching-issue-for-http
angular.module("seAjax.caching", ["seAjax.sniffer", "restangular"]).service("SeAjaxPreventCachingService", function (SeAjaxRequestsSnifferService, $rootScope, Restangular) {
	"use strict";
	var service = this;

	service.$$init = function() {
		SeAjaxRequestsSnifferService.onRequestStarted($rootScope, function(config) {
			// because IE caches GET requests and user is not logged in or not logged out
			if(config.method === "GET" && config.url.indexOf(Restangular.configuration.baseUrl) > -1) {
				var separator = config.url.indexOf("?") === -1 ? "?" : "&";
				config.url = config.url + separator + "noCache=" + new Date().getTime();
			}
			return config;
		});
	};
}).run(function(SeAjaxPreventCachingService) {
	"use strict";

	SeAjaxPreventCachingService.$$init();
}).config(function ($httpProvider) {
	"use strict";

	//http://www.oodlestechnologies.com/blogs/AngularJS-caching-issue-for-Internet-Explorer
	if (!$httpProvider.defaults.headers.get) {
		$httpProvider.defaults.headers.get = {};
	}
	// disable IE ajax request caching
	$httpProvider.defaults.headers.get["If-Modified-Since"] = "0";
});
