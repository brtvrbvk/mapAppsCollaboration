/**
 * COPYRIGHT 2016 con terra GmbH Germany
 * Created by fba on 04-11-16.
 */
define([
        "dojo/_base/declare",
        "dijit/_WidgetBase",
        "dijit/_TemplatedMixin",
        "dijit/_WidgetsInTemplateMixin",
        "ct/util/css",
        "dojo/text!./templates/ReportResponseWidget.html",
        "dijit/form/Button"
    ],
    function (declare, _WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, ct_css, templateString) {
        return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin],
            {

                templateString: templateString,
                baseClass: "ProblemResponse",

                constructor: function () {

                },

                postCreate: function () {
                    this.inherited(arguments);
                },

                _setSuccessAttr: function (val) {
                    if (val) {
                        ct_css.toggleClass(this.loaderNode, "dijitHidden", true);
                        ct_css.toggleClass(this.errorNode, "dijitHidden", true);
                        ct_css.toggleClass(this.successNode, "dijitHidden", false);
                    }
                },
                _setErrorAttr: function (val) {
                    if (val) {
                        ct_css.toggleClass(this.loaderNode, "dijitHidden", true);
                        ct_css.toggleClass(this.errorNode, "dijitHidden", false);
                        ct_css.toggleClass(this.successNode, "dijitHidden", true);
                    }
                },
                _setLoadingAttr: function (val) {
                    if (val) {
                        ct_css.toggleClass(this.loaderNode, "dijitHidden", false);
                        ct_css.toggleClass(this.errorNode, "dijitHidden", true);
                        ct_css.toggleClass(this.successNode, "dijitHidden", true);
                    }
                },

                _back: function () {
                    this.eventService.postEvent("ct/tool/set/DEACTIVATE", {toolId: "report_response_toggletool"});
                },

                startup: function () {
                    this.inherited(arguments);
                }
            }
        );
    }
);