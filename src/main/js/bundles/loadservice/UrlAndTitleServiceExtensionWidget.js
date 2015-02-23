/**
 * COPYRIGHT 2014 con terra GmbH Germany
 *
 * Created by fba on 24.09.2014.
 */
define([
        "dojo/_base/declare",
        "dijit/_WidgetBase",
        "dijit/_TemplatedMixin",
        "dijit/_WidgetsInTemplateMixin",
        "./_ServiceExtensionWidget",
        "dojo/text!./templates/UrlAndTitleServiceExtensionWidget.html",
        "dijit/form/TextBox",
        "dijit/form/Button",
        "dijit/layout/BorderContainer",
        "dijit/layout/ContentPane"
    ],
    function (
        declare,
        _WidgetBase,
        _TemplatedMixin,
        _WidgetsInTemplateMixin,
        _ServiceExtensionWidget,
        templateString
        ) {
        return declare([
                _WidgetBase,
                _TemplatedMixin,
                _WidgetsInTemplateMixin,
                _ServiceExtensionWidget
            ],
            {
                initialHeight: 85,
                showImmediately: true,
                templateString: templateString,

                _onSubmitClicked: function () {
                    var val = this.textBox.get("value");
                    var title = this.textBoxTitle.get("value");
                    this.onSubmitClick({url: val, title: title});
                },

                getHeight: function () {
                    return this.initialHeight;
                },

                resize: function (args) {
                    this.inherited(arguments);
                    this.mainBorderContainer.resize(args);
                }
            }
        );
    }
);