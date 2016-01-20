describe("SeAjaxDisplayRequestErrorsService", function () {
	"use strict";
	var EXPECTED_TRANSLATION = {
		UNKNOWN: {
			name: "UNKNOWN",
			generate: function() {
				return "httperrors.unknown";
			}
		},
		CODE: {
			name: "CODE",
			generate: function(method, url, statusCode) {
				return "httperrors."+statusCode;
			}
		},
		METHOD_STRIPPED_URL: {
			name: "METHOD_STRIPPED_URL",
			generate: function(method, url) {
				return "httperrors."+method+".~"+url.substring(Restangular.configuration.baseUrl.length);
			}
		},
		METHOD_URL: {
			name: "METHOD_URL",
			generate: function(method, url) {
				return "httperrors."+method+"."+url;
			}
		},
		METHOD_STRIPPED_URL_CODE: {
			name: "METHOD_STRIPPED_URL_CODE",
			generate: function(method, url, statusCode) {
				return "httperrors."+method+"."+statusCode+".~"+url.substring(Restangular.configuration.baseUrl.length);
			}
		},
		METHOD_URL_CODE: {
			name: "METHOD_URL_CODE",
			generate: function(method, url, statusCode) {
				return "httperrors."+method+"."+statusCode+"."+url;
			}
		},
		METHOD_STRIPPED_URL_CODE_STATE: {
			name: "METHOD_STRIPPED_URL_CODE_STATE",
			generate: function(method, url, statusCode) {
				return "httperrors."+method+".[hello.state]."+statusCode+".~"+url.substring(Restangular.configuration.baseUrl.length);
			}
		},
		METHOD_URL_CODE_STATE: {
			name: "METHOD_URL_CODE_STATE",
			generate: function(method, url, statusCode) {
				return "httperrors."+method+".[hello.state]."+statusCode+"."+url;
			}
		}
	};
	var EXPECTED_TRANSLATION_ORDER = [
		EXPECTED_TRANSLATION.METHOD_URL_CODE_STATE,
		EXPECTED_TRANSLATION.METHOD_STRIPPED_URL_CODE_STATE,
		EXPECTED_TRANSLATION.METHOD_URL_CODE,
		EXPECTED_TRANSLATION.METHOD_STRIPPED_URL_CODE,
		EXPECTED_TRANSLATION.METHOD_URL,
		EXPECTED_TRANSLATION.METHOD_STRIPPED_URL,
		EXPECTED_TRANSLATION.CODE,
		EXPECTED_TRANSLATION.UNKNOWN
	];

	var SeAjaxRequestsSnifferService, $translate, SeNotificationsService, $state, Restangular;
	var translateCheck;
	var $q, $rootScope;

	function generateTranslations(method, url, statusCode, expectedTranslation) {
		var result = [];
		_.forEach(EXPECTED_TRANSLATION_ORDER, function(nextValue) {
			var key = nextValue.generate(method, url, statusCode);
			if (key === EXPECTED_TRANSLATION.UNKNOWN.generate()) {
				// unknown is not in translations
				return;
			}
			if (nextValue === expectedTranslation) {
				result.push(key);
				return false;
			}
			result.push({
				key: key,
				reject: true
			});
		});

		return result;
	}

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
	function expectBehaviour(method, url, statusCode, expectedTranslation) {
		expect(SeAjaxRequestsSnifferService.onRequestError.calls.count()).toBe(1);

		SeAjaxRequestsSnifferService.onRequestError.calls.first().args[1]({
			status: statusCode,
			config: {
				method: method,
				url: url
			}
		});
		expect(SeNotificationsService.showNotificationError.calls.count()).toBe(0);
		// translation:
		_.forEach(EXPECTED_TRANSLATION_ORDER, function(nextValue) {
			$rootScope.$digest();
			if (nextValue === expectedTranslation) {
				return false;
			}
		});
		expect(SeNotificationsService.showNotificationError.calls.count()).toBe(1);
		expect(SeNotificationsService.showNotificationError.calls.first().args.length).toBe(1);
		var expectedCall = expectedTranslation.generate(method, url, statusCode);
		expect(SeNotificationsService.showNotificationError.calls.first().args[0]).toBe(expectedCall);
	}

	beforeEach(module("seAjax.errors", function($provide) {
		SeAjaxRequestsSnifferService = jasmine.createSpyObj("SeAjaxRequestsSnifferService",
			["onRequestError", "$$requestStarted", "$$requestSuccess"]);
		$provide.value("SeAjaxRequestsSnifferService", SeAjaxRequestsSnifferService);

		$translate = jasmine.createSpy("$translate");
		$translate.storageKey = function() {};
		$translate.storage = function() {};
		$translate.preferredLanguage = function() {};
		$provide.value("$translate", $translate);

		SeNotificationsService = jasmine.createSpyObj("SeNotificationsService", ["showNotificationError"]);
		$provide.value("SeNotificationsService", SeNotificationsService);

		$state = {
			current: {
				name: "hello.state"
			}
		};
		$provide.value("$state", $state);

		Restangular = {
			configuration: {
				baseUrl: "http://mock.url/api/v1/"
			}
		};
		$provide.value("Restangular", Restangular);
	}));
	beforeEach(inject(function (_$q_, _$rootScope_) {
		$q = _$q_;
		$rootScope = _$rootScope_;
	}));
	afterEach(inject(function () {
		translateCheck();
	}));
	describe("Common scenario", function () {
		it("should display specific error if there is translation", inject(function () {
			configureTranslate(generateTranslations("GET", "http://mock.url/api/v1/members", 405, EXPECTED_TRANSLATION.CODE));
			expectBehaviour("GET", "http://mock.url/api/v1/members", 405, EXPECTED_TRANSLATION.CODE);
		}));
		it("should display generic error if there is no translation", inject(function () {
			configureTranslate(generateTranslations("GET", "http://mock.url/api/v1/members", 405, EXPECTED_TRANSLATION.UNKNOWN));
			expectBehaviour("GET", "http://mock.url/api/v1/members", 405, EXPECTED_TRANSLATION.UNKNOWN);
		}));
		it("should not display error on 401", inject(function () {
			// should not be called:
			$translate.and.callFake(function() {
				expect(1).toBe(2);
			});
			translateCheck = function() {};

			expect(SeAjaxRequestsSnifferService.onRequestError.calls.count()).toBe(1);

			SeAjaxRequestsSnifferService.onRequestError.calls.first().args[1]({status: 401});
			expect(SeNotificationsService.showNotificationError.calls.count()).toBe(0);
			// translation:
			$rootScope.$digest();
			expect(SeNotificationsService.showNotificationError.calls.count()).toBe(0);
		}));
		it("should not display error on 403", inject(function () {
			// should not be called:
			$translate.and.callFake(function() {
				expect(1).toBe(2);
			});
			translateCheck = function() {};

			expect(SeAjaxRequestsSnifferService.onRequestError.calls.count()).toBe(1);

			SeAjaxRequestsSnifferService.onRequestError.calls.first().args[1]({status: 403});
			expect(SeNotificationsService.showNotificationError.calls.count()).toBe(0);
			// translation:
			$rootScope.$digest();
			expect(SeNotificationsService.showNotificationError.calls.count()).toBe(0);
		}));
	});

	describe("Display different errors depending on url and state name", function () {
		it("method url state code", inject(function () {
			configureTranslate([
				{key: "httperrors.GET.[hello.state].405.http://mock.url/api/v1/members", reject: true},
				{key: "httperrors.GET.[hello.state].405.~members", reject: true},
				{key: "httperrors.GET.405.http://mock.url/api/v1/members", reject: true},
				{key: "httperrors.GET.405.~members", reject: true},
				{key: "httperrors.GET.http://mock.url/api/v1/members", reject: true},
				{key: "httperrors.GET.~members", reject: true},
				{key: "httperrors.405", reject: true}
			]);
			expectBehaviour("GET", "http://mock.url/api/v1/members", 405, EXPECTED_TRANSLATION.UNKNOWN);
		}));
		it("method url state code - with params", inject(function () {
			configureTranslate([
				{key: "httperrors.GET.[hello.state].405.http://mock.url/api/v1/members", reject: true},
				{key: "httperrors.GET.[hello.state].405.~members", reject: true},
				{key: "httperrors.GET.405.http://mock.url/api/v1/members", reject: true},
				{key: "httperrors.GET.405.~members", reject: true},
				{key: "httperrors.GET.http://mock.url/api/v1/members", reject: true},
				{key: "httperrors.GET.~members", reject: true},
				{key: "httperrors.405", reject: true}
			]);
			expectBehaviour("GET", "http://mock.url/api/v1/members?hello=world", 405, EXPECTED_TRANSLATION.UNKNOWN);
		}));
		it("method url state code", inject(function () {
			configureTranslate(generateTranslations("GET", "http://mock.url/api/v1/members", 405, EXPECTED_TRANSLATION.METHOD_URL_CODE_STATE));
			expectBehaviour("GET", "http://mock.url/api/v1/members", 405, EXPECTED_TRANSLATION.METHOD_URL_CODE_STATE);
		}));
		it("method stripped url state code", inject(function () {
			configureTranslate(generateTranslations("GET", "http://mock.url/api/v1/members", 405, EXPECTED_TRANSLATION.METHOD_STRIPPED_URL_CODE_STATE));
			expectBehaviour("GET", "http://mock.url/api/v1/members", 405, EXPECTED_TRANSLATION.METHOD_STRIPPED_URL_CODE_STATE);
		}));
		it("method url state code", inject(function () {
			configureTranslate(generateTranslations("GET", "http://mock.url/api/v1/members", 405, EXPECTED_TRANSLATION.METHOD_URL_CODE_STATE));
			expectBehaviour("GET", "http://mock.url/api/v1/members", 405, EXPECTED_TRANSLATION.METHOD_URL_CODE_STATE);
		}));
		it("method url code", inject(function () {
			configureTranslate(generateTranslations("GET", "http://mock.url/api/v1/members", 405, EXPECTED_TRANSLATION.METHOD_URL_CODE));
			expectBehaviour("GET", "http://mock.url/api/v1/members", 405, EXPECTED_TRANSLATION.METHOD_URL_CODE);
		}));
		it("method url", inject(function () {
			configureTranslate(generateTranslations("GET", "http://mock.url/api/v1/members", 405, EXPECTED_TRANSLATION.METHOD_URL));
			expectBehaviour("GET", "http://mock.url/api/v1/members", 405, EXPECTED_TRANSLATION.METHOD_URL);
		}));

	});
});
