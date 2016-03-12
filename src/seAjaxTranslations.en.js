angular.module("seAjax.translations.en", ["pascalprecht.translate"]).config(function($translateProvider) {
	"use strict";
	$translateProvider.translations("en", {
		"httperrors.400": "Error handling the request.",
		"httperrors.401": "Login required.",
		"httperrors.403": "Access denied.",
		"httperrors.404": "Not found.",
		"httperrors.500": "Server error, refresh the page, please.",
		"httperrors.0": "Check the Internet conectivity.",
		"httperrors.unknown": "Unknown error, refresh the page, please."
	});
});
