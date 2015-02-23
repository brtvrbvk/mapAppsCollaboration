/**
 * COPYRIGHT 2014 con terra GmbH Germany
 *
 * Created by fba on 10.03.14.
 */
define([
        "dojo/_base/declare",
        "dojo/string",
        "dijit/_Widget",
        "dijit/_TemplatedMixin",
        "dijit/_WidgetsInTemplateMixin",
        "dojo/text!./templates/ShareMinimapWidget.html",
        "ct/ui/controls/MessagePane",
        "dijit/form/TextBox",
        "dijit/form/NumberTextBox",
        "dijit/form/Button"
    ],
    function (
        declare,
        d_string,
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
                        value: this.i18n.ui.minimapMessage
                    }, true);

                },

                _setUrlAttr: function (url) {

                    this._updateTextbox(url);

                    this.textbox.focus();
                    this.textbox.textbox.select();

                },

                _updateTextbox: function (url) {
                    this.url = url;

                    url = d_string.substitute(url, {
                        width: this.widthNode.get("value"),
                        height: this.heightNode.get("value")
                    });

                    this.textbox.set("value", url);
                },

                _onSizeChange: function (evt) {
                    this._updateTextbox(this.url);
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