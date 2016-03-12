describe("seLoading", function() {
	"use strict";

	beforeEach(module("seAjax.loading"));
	var element, scope, $timeout;

	var TIMEOUT_JUST_BEFORE_SHOW = 495;
	var TIMEOUT_JUST_AFTER_SHOW = 10;

	beforeEach(inject(function($rootScope, _$timeout_) {
		scope = $rootScope.$new();
		scope.someobj = {};
		scope.somecollection = [];
		$timeout = _$timeout_;

		expectNoWaiter($("body"));
	}));
	afterEach(inject(function() {
		var waiter = $("body").children().last();
		if (waiter.is("div") && waiter.hasClass("loader-wrap")) {
			waiter.remove();
		}
		$(".loader-wrap").remove();
	}));

	it("should add css class when no elements after given time", inject(function($compile) {
		element = angular.element("<div data-se-loading='someobj.someproperty'></div>");
		element = $compile(element)(scope);
		expectNoWaiter(element);
		scope.$digest();
		expectNoWaiter(element);
		$timeout.flush(TIMEOUT_JUST_BEFORE_SHOW);
		expectNoWaiter(element);
		$timeout.flush(TIMEOUT_JUST_AFTER_SHOW);
		expectWaiter(element);
	}));
	it("should not add css class if element is available", inject(function($compile) {
		element = angular.element("<div data-se-loading='someobj.someproperty'></div>");
		element = $compile(element)(scope);
		expectNoWaiter(element);
		scope.$digest();
		expectNoWaiter(element);
		$timeout.flush(TIMEOUT_JUST_BEFORE_SHOW);
		expectNoWaiter(element);
		scope.someobj.someproperty = 10;
		expectNoWaiter(element);
		scope.$digest();
		expectNoWaiter(element);
		$timeout.flush(TIMEOUT_JUST_AFTER_SHOW);
		expectNoWaiter(element);
	}));
	it("should remove css when element is available", inject(function($compile) {
		element = angular.element("<div data-se-loading='someobj.someproperty'></div>");
		element = $compile(element)(scope);
		expectNoWaiter(element);
		scope.$digest();
		expectNoWaiter(element);
		$timeout.flush(TIMEOUT_JUST_BEFORE_SHOW);
		expectNoWaiter(element);
		$timeout.flush(TIMEOUT_JUST_AFTER_SHOW);
		expectWaiter(element);
		scope.someobj.someproperty = 10;
		scope.$digest();
		expectNoWaiter(element);
	}));

	it("should not add css class if collection is available", inject(function($compile) {
		element = angular.element("<div data-se-loading='somecollection'></div>");
		element = $compile(element)(scope);
		expectNoWaiter(element);
		scope.$digest();
		expectNoWaiter(element);
		$timeout.flush(TIMEOUT_JUST_BEFORE_SHOW);
		expectNoWaiter(element);
		scope.somecollection.push(10);
		expectNoWaiter(element);
		scope.$digest();
		expectNoWaiter(element);
		$timeout.flush(TIMEOUT_JUST_AFTER_SHOW);
		expectNoWaiter(element);
	}));
	function expectWaiter(element) {
		expect(element.hasClass("se-loading")).toBe(true);
	}

	function expectNoWaiter(element) {
		expect(element.hasClass("se-loading")).toBe(false);
	}

});
