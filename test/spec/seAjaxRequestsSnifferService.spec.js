describe("SeAjaxRequestsSnifferService", function () {
	"use strict";
	beforeEach(module("seAjax.sniffer"));

	var scope, $rootScope, SeAjaxRequestsSnifferService, handler;

	beforeEach(inject(function (_$rootScope_, _SeAjaxRequestsSnifferService_) {
		$rootScope = _$rootScope_;
		SeAjaxRequestsSnifferService = _SeAjaxRequestsSnifferService_;
		spyOn($rootScope, "$broadcast");
		scope = jasmine.createSpyObj("scope", ["$on"]);
		handler = jasmine.createSpy("handler");
	}));

	it("should receive start request broadcasts", inject(function () {
		testCallbacks(SeAjaxRequestsSnifferService.onRequestStarted, "$$SeAjaxRequestsSnifferService_START_REQUEST_");
	}));

	it("should receive success end request broadcasts", inject(function () {
		testCallbacks(SeAjaxRequestsSnifferService.onRequestSuccess, "$$SeAjaxRequestsSnifferService_END_REQUEST_SUCCESS_");
	}));
	it("should receive failure end request broadcasts", inject(function () {
		testCallbacks(SeAjaxRequestsSnifferService.onRequestError, "$$SeAjaxRequestsSnifferService_END_REQUEST_ERROR_");
	}));

	it("should fire start request broadcast", inject(function () {
		testBroadcasts(SeAjaxRequestsSnifferService.$$requestStarted, "$$SeAjaxRequestsSnifferService_START_REQUEST_");
	}));
	it("should fire success end request broadcast", inject(function () {
		testBroadcasts(SeAjaxRequestsSnifferService.$$requestSuccess, "$$SeAjaxRequestsSnifferService_END_REQUEST_SUCCESS_");
	}));
	it("should fire failure end request broadcast", inject(function () {
		testBroadcasts(SeAjaxRequestsSnifferService.$$requestError, "$$SeAjaxRequestsSnifferService_END_REQUEST_ERROR_");
	}));

	function testBroadcasts(methodToTest, eventName) {
		var parameter = {some: "oth"};
		expect($rootScope.$broadcast.calls.any()).toBe(false);
		methodToTest(parameter);
		expect($rootScope.$broadcast.calls.count()).toBe(1);
		expect($rootScope.$broadcast).toHaveBeenCalledWith(eventName, parameter);
	}
	function testCallbacks(methodToTest, eventName) {
		expect(scope.$on.calls.any()).toBe(false);
		methodToTest(scope, handler);
		expect(scope.$on.calls.count()).toBe(1);
		expect(scope.$on.calls.first().args.length).toBe(2);
		expect(scope.$on.calls.first().args[0]).toBe(eventName);

		expect(handler.calls.any()).toBe(false);


		var wrappedHandler = scope.$on.calls.first().args[1];
		var args = {some: "oth"};
		wrappedHandler(null, args);
		expect(handler.calls.count()).toBe(1);
		expect(handler).toHaveBeenCalledWith(args);
	}


});
