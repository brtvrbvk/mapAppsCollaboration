/**
 * COPYRIGHT 2012-2013 con terra GmbH Germany
 *
 * User: fba
 * Date: 09.01.14
 * Time: 14:08
 */
define([
        "dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/_base/array",
        "dojo/query",
        "dojo/keys",
        "dojo/window",
        "dijit/_Widget",
        "dijit/_TemplatedMixin",
        "dijit/_WidgetsInTemplateMixin",
        "dojo/dom-geometry",
        "ct/_Connect",
        "ct/util/css",
        "ct/ui/desktop/util",
        "dojo/dom-construct",
        "dojo/text!./templates/LoadServiceWidget.html",
        "dijit/form/TextBox",
        "dijit/form/Button",
        "dijit/layout/BorderContainer",
        "dijit/layout/ContentPane",
        "dijit/form/RadioButton",
        "ct/ui/controls/MessagePane"
    ],
    function (
        declare,
        d_lang,
        d_array,
        d_query,
        d_keys,
        d_window,
        _Widget,
        _TemplatedMixin,
        _WidgetsInTemplateMixin,
        d_domgeom,
        Connect,
        ct_css,
        ct_dutil,
        d_domConstruct,
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
                    this._listeners = new Connect({
                        defaultConnectScope: this
                    });
                },

                postCreate: function () {
                    this.inherited(arguments);

                    ct_css.switchVisibility(this.infoPane.domNode, false);

                },

                _setTypeSelectionAttr: function (st) {

                    this.typeSelection.set("content", st);

                },

                startup: function () {

                    this.inherited(arguments);
                    if (!this._window) {
                        this._window = ct_dutil.findEnclosingWindow(this);
                        this._initialSize = this._window.marginBox;
                        this._currentHeight = this._initialSize.h;
                    }
                    if (this.extensionWidget && this.extensionWidget.get("showImmediately")) {
                        this.showExtensionWidget();
                    }
                },

                showMessage: function (
                    msg,
                    type
                    ) {
                    this.infoPane.clearMessages();
                    if (!this._infoPaneShown) {
                        this._showPane(this.infoPane.domNode, 25);
                        this._infoPaneShown = true;
                    }
                    this.infoPane.addMessage({
                        type: type || "info",
                        value: msg
                    }, true);
                },

                _showPane: function (
                    node,
                    height
                    ) {
                    if (!this._started) {
                        return;
                    }
                    this._resizeWindowHeightBy(height);
                    ct_css.switchVisibility(node, true);
                },

                _hidePane: function (
                    node,
                    height
                    ) {
                    if (!this._started) {
                        return;
                    }
                    this._resizeWindowHeightBy(height);
                    ct_css.switchVisibility(node, false);
                },

                removeMessages: function () {
                    if (this._infoPaneShown) {
                        this._infoPaneShown = false;
                        this._hidePane(this.infoPane.domNode, -25);
                    }
                    this.infoPane.clearMessages();
                },

                _resizeWindowHeightBy: function (height) {
                    if (!height) {
                        this._currentHeight = this._initialSize.h;
                    } else {
                        this._currentHeight += height;
                    }
                    var windowHeight = d_window.getBox().h;
                    var dim = {
                        w: this._initialSize.w,
                        h: this._currentHeight,
                        t: Math.round(windowHeight / 2) - Math.round(this._currentHeight / 2)
                    };
                    this._window.resize(dim);
                    //workaround to make the dgrid render correctly
                    setTimeout(d_lang.hitch(this, function () {
                        this.resize();
                    }), 50);
                },

                _setExtensionWidgetAttr: function (ew) {
                    this._listeners.disconnect("resize");
                    if (this._started) {
                        this.hideExtensionWidget();
                    }
                    this.extensionWidget = ew;
                    this.extensionWidgetNode.set("content", ew);
                    if (this._started) {
                        this.showExtensionWidget();
                    }
                    this._listeners.connect("resize", this.extensionWidget, "onResizeWindow", this._onResizeWindow);
                },

                _onResizeWindow: function (height) {
                    this._resizeWindowHeightBy(height);
                },

                showExtensionWidget: function () {
                    this._showPane(this.extensionWidgetNode.domNode, this.extensionWidget.getHeight());
                },
                hideExtensionWidget: function () {
                    this._hidePane(this.extensionWidgetNode.domNode);
                },

                _setUrlAttr: function (val) {
                    this.textBox.set("value", val);
                },

//                _onTextBoxKeyUp: function (evt) {
////                    ct_css.switchVisibility(this.clearSearch.domNode, true);
//                    var key = evt.charOrCode;
//                    switch (key) {
//                        case d_keys.ENTER:
//                            this.onSubmit({url: this.textBox.get("value")});
//                    }
//                },

//                _onSubmitClicked: function (evt) {
//                    this.onSubmit({url: evt.valueval});
//                },

//                _onClearClicked: function (evt) {
//                    this.textBox.set("value", "");
//                    this.removeMessages();
//                    this._hidePane(this.extensionWidgetNode.domNode, -400);
////                    this._hidePane(this.bottomPanel.domNode, 0);
////                    ct_css.switchVisibility(this.clearSearch.domNode, false);
//                },

                resize: function (args) {
                    this.inherited(arguments);
                    this.baseNode.resize(args);
                }

            }
        );
    }
);