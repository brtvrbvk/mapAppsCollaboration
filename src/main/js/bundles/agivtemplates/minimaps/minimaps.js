define([
    "dojo/text!./minimaps.html",
    "dojo/i18n!./nls/bundle"
], function (
    templateStringContent,
    i18n
    ) {
    return {
        templateString: templateStringContent,
        i18n: [i18n]
    }
});