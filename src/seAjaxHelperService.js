angular.module("seAjax.helper", ["restangular"]).service("SeAjaxHelperService", function(Restangular) {
	"use strict";

	var service = this;

	function attachMethods() {
		service.restangularChild = function(parent, childName, method) {
			var endpoint = parent.one(childName);
			return endpoint[method || "get"]().then(function(response) {
				return service.fixRestangularUrl(response, endpoint);
			});
		};

		// hack because URL of address is something like /members/1 or /members/1/address/1
		// but we need /members/1/address
		service.fixRestangularUrl = function(response, restangularPath, parent) {
			if (!response) {
				return response;
			}
			response[Restangular.configuration.restangularFields.selfLink] = restangularPath.getRequestedUrl();

			Restangular.restangularizeElement(parent, response);
			return response;
		};
	}

	attachMethods();
});
