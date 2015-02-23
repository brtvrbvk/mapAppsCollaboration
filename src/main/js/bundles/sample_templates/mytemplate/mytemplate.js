define([
    "dojo/text!./mytemplate.html",
    "dojo/i18n!./nls/bundle",
    // ensure that widgets used in template are loaded
    "dijit/layout/BorderContainer",
    "dijit/layout/ContentPane"
], function(templateStringContent, i18n) {
    return {
        templateString: templateStringContent,
        i18n: [i18n]
    };
});