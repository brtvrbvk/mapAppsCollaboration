define([
    "dojo/text!./auskunfttemplate.html",
    "dojo/text!./auskunfttemplate_small.html",
    "dojo/i18n!./nls/bundle",
    // ensure that widgets used in template are loaded
    "dijit/layout/BorderContainer",
    "dijit/layout/ContentPane"
], function(auskunfttemplate, auskunfttemplate_small, i18n) {
    return {
        layouts: [
            
                    {
                        maxWidth:800,
                templateString: auskunfttemplate_small
                    },
            {
                templateString: auskunfttemplate
                
            }
        ],
        i18n: [i18n]
    };
});