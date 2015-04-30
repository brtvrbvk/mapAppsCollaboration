/**
 * COPYRIGHT 2014 con terra GmbH Germany
 *
 * Created by fba on 05.03.14.
 */
define([
        "dojo/_base/declare",
        "dijit/_Widget",
        "dijit/_TemplatedMixin",
        "dijit/_WidgetsInTemplateMixin",
        "dojo/text!./templates/ShareURLWidget.html",
        "ct/ui/controls/MessagePane",
        "dijit/form/TextBox",
        "dijit/form/Button"
    ],
    function (
        declare,
        _Widget,
        _TemplatedMixin,
        _WidgetsInTemplateMixin,
        templateString
        ) {
        return declare([
                _Widget,
                _TemplatedMixin,
                _WidgetsInTemplateMixin
            ],
            {

                templateString: templateString,

                constructor: function () {

                },

                postCreate: function () {

                    this.inherited(arguments);

                    this.messagePane.addMessage({
                        type: "info",
                        value: this.i18n.ui.urlMessage
                    }, true);

                },

                _setUrlAttr: function (url) {
                    this.textbox.set("value", url);
                    this.textbox.focus();
                    this.textbox.textbox.select();
                },

                _onOk: function () {
                    this.onOk();
                },

                onOk: function () {
                },

                destroy: function () {
                    this.inherited(arguments);
                    this.messagePane && this.messagePane.destroy();
                    this.textbox && this.textbox.destroy();
                    this.button && this.button.destroy();
                }
            }
        )
    }
);