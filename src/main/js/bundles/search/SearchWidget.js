/**
 * COPYRIGHT 2012-2013 con terra GmbH Germany
 *
 * User: fba
 * Date: 04.07.13
 * Time: 15:47
 */
define([
        "dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/sniff",
        "dojo/keys",
        "dijit/_Widget",
        "dijit/_TemplatedMixin",
        "dijit/_WidgetsInTemplateMixin",
        "dijit/Tooltip",
        "ct/util/css",
        "ct/_Connect",
        "dijit/form/TextBox",
        "dojo/text!./templates/SearchWidget.html",
        "dijit/form/Button"
    ],
    function (
        declare,
        d_lang,
        d_sniff,
        d_keys,
        _Widget,
        _TemplatedMixin,
        _WidgetsInTemplateMixin,
        Tooltip,
        css,
        Connect,
        TextBox,
        templateString
        ) {
        return declare([
                _Widget,
                _TemplatedMixin,
                _WidgetsInTemplateMixin
            ],
            {
                templateString: templateString,
                baseClass: "ctSearch",

                constructor: function () {

                },

                postCreate: function () {
                    this.inherited(arguments);

                    this._listeners = new Connect({
                        defaultConnectScope: this
                    });

                    if (!d_sniff("ios") && !d_sniff("android")) {
                        //we want the dropdown to disappear on blur, but only on non touch devices
                        this._listeners.connect("blur", this, "onBlur", "_onSearchBlur");
                        //there is currently no better way to identify an IE11 instead of mspointer
                        if (d_sniff("mspointer")) {
                            //IE10/11 won´t work with the selectonclick in dojo 1.9.1
                            this._textbox = new TextBox({
                                selectOnClick: false,
                                placeHolder: this.i18n.ui.placeHolder,
                                onKeyUp: d_lang.hitch(this, this._onKeyPress)
                            }, this.textbox);
                        } else {
                            this._textbox = new TextBox({
                                selectOnClick: true,
                                placeHolder: this.i18n.ui.placeHolder,
                                onKeyUp: d_lang.hitch(this, this._onKeyPress)
                            }, this.textbox);
                        }
                    } else {
                        this._textbox = new TextBox({
                            selectOnClick: false,
//                            placeHolder: this.i18n.ui.placeHolder,
                            onKeyUp: d_lang.hitch(this, this._onKeyPress)
                        }, this.textbox);
                    }

                },

                _onSearchBlur: function () {

                    this.eventService.postEvent("agiv/search/widget/BLUR", {});
                    this.hideTooltip();

                },

                showTooltip: function (label) {
                    Tooltip.show(label, this.domNode, [
                        "before",
                        "below"
                    ]);
                },

                hideTooltip: function () {
                    Tooltip.hide(this.domNode);
                },

                _onKeyPress: function (evt) {
                    var val = this._textbox.get("displayedValue");
                    css.switchHidden(this.clearButton.domNode, val === "");
                    val = d_lang.trim(val);
                    this.onValueChange({
                        newValue: val,
                        oldValue: this._oldVal,
                        //IE8 does not allow complete event copying...
                        _evt: {
                            keyCode: evt.keyCode,
                            altKey: evt.altKey,
                            ctrlKey: evt.ctrlKey
                        }
                    });
                    this._oldVal = val;
                },

                switchLoading: function (enabled) {
                    css.switchLoading(this.loadingNode, enabled);
                },

                reset: function () {
                    this._textbox.reset();
                },

                _setValueAttr: function (val) {
                    this._textbox.set("value", val);
                },

                _onClearClick: function () {
                    css.switchHidden(this.clearButton.domNode, true);
                    this.onClear();
                },

                onClear: function () {
                },

                _onSearchClick: function () {
                    //we mock enter here
                    this._onKeyPress({
                        keyCode: d_keys.ENTER,
                        altKey: false,
                        ctrlKey: false
                    });
                },

                onValueChange: function (evt) {
                }
            }
        );
    }
);