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
        "loadservice/_ServiceExtensionWidget",
        "dojo/text!./templates/KMLServiceExtensionWidget.html",
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
                showImmediately: true,
                templateString: templateString,

                constructor: function () {

                },

                postCreate: function () {
                    this.inherited(arguments);
                },

                _onSubmitClicked: function () {
                    var val = this.textBox.get("value");
                    var title = this.textBoxTitle.get("value");
                    this.onSubmitClick({url: val, title: title});
                },

                startup: function () {
                    this.inherited(arguments);
                },

                getHeight: function () {

                    return 85;

                },

                resize: function (args) {
                    this.inherited(arguments);
                    this.baseNode.resize(args);
                }
            }
        );
    }
);