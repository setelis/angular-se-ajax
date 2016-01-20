describe("SeAjaxDisplayRequestErrorsService", function () {
	"use strict";

	var SeAjaxRequestsSnifferService, $translate, SeNotificationsService;
	var translateCheck;
	var $q, $rootScope;

	function configureTranslate(translations) {
		if (translateCheck) {
			translateCheck();
		}
		$translate.and.callFake(function(name) {
			var expected = translations.shift();
			if (angular.isString(expected)) {
				expected = {
					key: expected
				};
			}
			expect(name).toBe(expected.key);
			if (expected.reject) {
				return $q.reject("nottranslated:" + name);
			}
			return $q.when("translated:" + name);
		});
		translateCheck = function() {
			expect(translations).toEqual([]);
		};
	}

	beforeEach(module("seAjax.errors", function($provide) {
		SeAjaxRequestsSnifferService = jasmine.createSpyObj("SeAjaxRequestsSnifferService",
			["onRequestError", "$$requestStarted", "$$requestSuccess"]);
		SeNotificationsService = jasmine.createSpyObj("SeNotificationsService", ["showNotificationError"]);

		$translate = jasmine.createSpy("$translate");

		$translate.storageKey = function() {};
		$translate.storage = function() {};
		$translate.preferredLanguage = function() {};


		$provide.value("SeAjaxRequestsSnifferService", SeAjaxRequestsSnifferService);
		$provide.value("$translate", $translate);
		$provide.value("SeNotificationsService", SeNotificationsService);
	}));
	beforeEach(inject(function (_$q_, _$rootScope_) {
		$q = _$q_;
		$rootScope = _$rootScope_;
	}));
	afterEach(inject(function () {
		translateCheck();
	}));

	it("should display specific error if there is translation", inject(function () {
		configureTranslate(["httperrors.405"]);
		expect(SeAjaxRequestsSnifferService.onRequestError.calls.count()).toBe(1);

		SeAjaxRequestsSnifferService.onRequestError.calls.first().args[1]({status: 405});
		expect(SeNotificationsService.showNotificationError.calls.count()).toBe(0);
		// translation:
		$rootScope.$digest();
		expect(SeNotificationsService.showNotificationError.calls.count()).toBe(1);
		expect(SeNotificationsService.showNotificationError.calls.first().args.length).toBe(1);
		expect(SeNotificationsService.showNotificationError.calls.first().args[0]).toBe("httperrors.405");
	}));
	it("should display generic error if there is no translation", inject(function () {
		configureTranslate([{key: "httperrors.405", reject: true}]);
		expect(SeAjaxRequestsSnifferService.onRequestError.calls.count()).toBe(1);

		SeAjaxRequestsSnifferService.onRequestError.calls.first().args[1]({status: 405});
		expect(SeNotificationsService.showNotificationError.calls.count()).toBe(0);
		// translation:
		$rootScope.$digest();
		expect(SeNotificationsService.showNotificationError.calls.count()).toBe(1);
		expect(SeNotificationsService.showNotificationError.calls.first().args.length).toBe(1);
		expect(SeNotificationsService.showNotificationError.calls.first().args[0]).toBe("httperrors.unknown");
	}));
	it("should not display error on 401", inject(function () {
		configureTranslate([]);
		expect(SeAjaxRequestsSnifferService.onRequestError.calls.count()).toBe(1);

		SeAjaxRequestsSnifferService.onRequestError.calls.first().args[1]({status: 401});
		expect(SeNotificationsService.showNotificationError.calls.count()).toBe(0);
		// translation:
		$rootScope.$digest();
		expect(SeNotificationsService.showNotificationError.calls.count()).toBe(0);
	}));
	it("should not display error on 403", inject(function () {
		configureTranslate([]);
		expect(SeAjaxRequestsSnifferService.onRequestError.calls.count()).toBe(1);

		SeAjaxRequestsSnifferService.onRequestError.calls.first().args[1]({status: 403});
		expect(SeNotificationsService.showNotificationError.calls.count()).toBe(0);
		// translation:
		$rootScope.$digest();
		expect(SeNotificationsService.showNotificationError.calls.count()).toBe(0);
	}));
});
