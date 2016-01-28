describe("SeAjaxPreventDoubleClickService", function () {
	"use strict";
	var SeAjaxPreventDoubleClickService, SeAjaxRequestsSnifferService;
	var mockedDialog;

	function expectDisabledInput() {
		var expectedDialogCall = {
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
		};

		expect(mockedDialog.dialog.calls.count()).toBe(0);
		expect($.fn.dialog.calls.count()).toBe(1);
		expect($.fn.dialog.calls.first().args.length).toBe(1);
		expect($.fn.dialog.calls.first().args[0]).toEqual(expectedDialogCall);
		$.fn.dialog.calls.reset();
	}

	function expectNoAction() {
		expect($.fn.dialog.calls.count()).toBe(0);
		expect(mockedDialog.dialog.calls.count()).toBe(0);
	}

	function expectReenabledInput() {
		expect($.fn.dialog.calls.count()).toBe(0);
		expect(mockedDialog.dialog.calls.count()).toBe(1);
		expect(mockedDialog.dialog.calls.count()).toBe(1);
		expect(mockedDialog.dialog.calls.first().args.length).toBe(1);
		expect(mockedDialog.dialog.calls.first().args[0]).toBe("close");
		mockedDialog.dialog.calls.reset();
	}

	beforeEach(module("seAjax.doubleclick", function($provide){
		SeAjaxRequestsSnifferService = jasmine.createSpyObj("SeAjaxRequestsSnifferService", ["onRequestStarted", "onRequestSuccess", "onRequestError"]);
		$provide.value("SeAjaxRequestsSnifferService", SeAjaxRequestsSnifferService);
	}));

	beforeEach(inject(function (_SeAjaxPreventDoubleClickService_) {
		SeAjaxPreventDoubleClickService = _SeAjaxPreventDoubleClickService_;
	}));

	beforeEach(function() {
		$.fn.dialog = jasmine.createSpy("dialog");
		mockedDialog = jasmine.createSpyObj("mockedDialog", ["dialog"]);
		$.fn.dialog.and.returnValue(mockedDialog);
	});
	it("should register for requests", inject(function () {
		expect(SeAjaxRequestsSnifferService.onRequestStarted.calls.count()).toBe(1);
		expect(SeAjaxRequestsSnifferService.onRequestSuccess.calls.count()).toBe(1);
		expect(SeAjaxRequestsSnifferService.onRequestError.calls.count()).toBe(1);
	}));
	it("should disable button on PUT and reenable on success", inject(function () {
		expectNoAction();

		SeAjaxRequestsSnifferService.onRequestStarted.calls.first().args[1]({method: "PUT"});
		expectDisabledInput();
		SeAjaxRequestsSnifferService.onRequestSuccess.calls.first().args[1]({config: {method: "PUT"}});
		expectReenabledInput();
	}));
	it("should disable button on PUT and reenable on error", inject(function () {
		expectNoAction();

		SeAjaxRequestsSnifferService.onRequestStarted.calls.first().args[1]({method: "PUT"});
		expectDisabledInput();
		SeAjaxRequestsSnifferService.onRequestError.calls.first().args[1]({config: {method: "PUT"}});
		expectReenabledInput();
	}));
	it("should not disable button on GET", inject(function () {
		expectNoAction();

		SeAjaxRequestsSnifferService.onRequestStarted.calls.first().args[1]({method: "GET"});
		expectNoAction();
		SeAjaxRequestsSnifferService.onRequestError.calls.first().args[1]({config: {method: "GET"}});
		expectNoAction();
	}));
	it("should handle two requests at a time - two success", inject(function () {
		expectNoAction();

		SeAjaxRequestsSnifferService.onRequestStarted.calls.first().args[1]({method: "PUT"});
		expectDisabledInput();

		//second call
		SeAjaxRequestsSnifferService.onRequestStarted.calls.first().args[1]({method: "POST"});
		expectNoAction();

		// success on first call
		SeAjaxRequestsSnifferService.onRequestSuccess.calls.first().args[1]({config: {method: "PUT"}});
		// but elements remains disabled
		expectNoAction();

		// success on second call
		SeAjaxRequestsSnifferService.onRequestSuccess.calls.first().args[1]({config: {method: "POST"}});

		expectReenabledInput();
	}));

	it("should handle two requests at a time - second error success", inject(function () {
		expectNoAction();

		SeAjaxRequestsSnifferService.onRequestStarted.calls.first().args[1]({method: "PUT"});
		expectDisabledInput();

		//second call
		SeAjaxRequestsSnifferService.onRequestStarted.calls.first().args[1]({method: "POST"});
		expectNoAction();

		// success on first call
		SeAjaxRequestsSnifferService.onRequestSuccess.calls.first().args[1]({config: {method: "PUT"}});
		// but elements remains disabled
		expectNoAction();

		// success on second call
		SeAjaxRequestsSnifferService.onRequestError.calls.first().args[1]({config: {method: "POST"}});

		expectReenabledInput();
	}));

	it("should handle two requests at a time - second error success but first come", inject(function () {
		expectNoAction();

		SeAjaxRequestsSnifferService.onRequestStarted.calls.first().args[1]({method: "PUT"});
		expectDisabledInput();

		//second call
		SeAjaxRequestsSnifferService.onRequestStarted.calls.first().args[1]({method: "POST"});
		expectNoAction();

		// error on second call
		SeAjaxRequestsSnifferService.onRequestError.calls.first().args[1]({config: {method: "POST"}});
		// but elements remains disabled
		expectNoAction();

		// success on first call
		SeAjaxRequestsSnifferService.onRequestSuccess.calls.first().args[1]({config: {method: "PUT"}});
		expectReenabledInput();
	}));

	it("should handle two requests at a time - two success - last get", inject(function () {
		expectNoAction();
		SeAjaxRequestsSnifferService.onRequestStarted.calls.first().args[1]({method: "PUT"});
		expectDisabledInput();

		//second call
		SeAjaxRequestsSnifferService.onRequestStarted.calls.first().args[1]({method: "GET"});
		expectNoAction();
		// success on first call
		SeAjaxRequestsSnifferService.onRequestSuccess.calls.first().args[1]({config: {method: "PUT"}});

		// elements is enabled, because second is GET
		expectReenabledInput();
		// success on second call
		SeAjaxRequestsSnifferService.onRequestSuccess.calls.first().args[1]({config: {method: "GET"}});

		expectNoAction();
	}));

	it("should handle two requests at a time - second error success - last get", inject(function () {
		expectNoAction();
		SeAjaxRequestsSnifferService.onRequestStarted.calls.first().args[1]({method: "PUT"});
		expectDisabledInput();
		//second call
		SeAjaxRequestsSnifferService.onRequestStarted.calls.first().args[1]({method: "GET"});
		expectNoAction();
		// success on first call
		SeAjaxRequestsSnifferService.onRequestSuccess.calls.first().args[1]({config: {method: "PUT"}});

		// elements is enabled, because second is GET
		expectReenabledInput();
		// error on second call
		SeAjaxRequestsSnifferService.onRequestError.calls.first().args[1]({config: {method: "GET"}});
		expectNoAction();
	}));

	it("should handle two requests at a time - second error success but first come - last get", inject(function () {
		expectNoAction();
		SeAjaxRequestsSnifferService.onRequestStarted.calls.first().args[1]({method: "GET"});
		expectNoAction();

		//second call
		SeAjaxRequestsSnifferService.onRequestStarted.calls.first().args[1]({method: "POST"});
		expectDisabledInput();

		// error on second call
		SeAjaxRequestsSnifferService.onRequestError.calls.first().args[1]({config: {method: "POST"}});
		// elements is enabled, because second is GET
		expectReenabledInput();

		// success on first call
		SeAjaxRequestsSnifferService.onRequestSuccess.calls.first().args[1]({config: {method: "GET"}});
		expectNoAction();
	}));
});
