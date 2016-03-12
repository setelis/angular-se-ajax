angular.module("seAjax.translations.bg", ["pascalprecht.translate"]).config(function($translateProvider) {
	"use strict";
	$translateProvider.translations("bg", {
		"httperrors.400": "Грешка при обработката на заявката.",
		"httperrors.401": "Необходимо е да влезете в системата.",
		"httperrors.403": "Нямате достъп.",
		"httperrors.404": "Информацията не съществува",
		"httperrors.500": "Възникна грешка, моля презаредете страницата.",
		"httperrors.0": "Проверете Вашата Интернет свързаност",
		"httperrors.unknown": "Възникна грешка, моля презаредете страницата."
	});
});
