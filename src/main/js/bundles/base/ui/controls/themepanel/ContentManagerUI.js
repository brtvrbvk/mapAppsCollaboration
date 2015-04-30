/**
 * COPYRIGHT 2014 con terra GmbH Germany
 *
 * Created by fba on 17.04.2014.
 */
define([
        "dojo/_base/declare",
        "dojo/dom-class",
        "dojo/_base/html",
        "dijit/_WidgetBase",
        "dijit/_TemplatedMixin",
        "dijit/_WidgetsInTemplateMixin",
        "ct/util/css",
        "dojo/text!./templates/ContentManagerUI.html",
        "dijit/Tooltip",
        "dijit/layout/ContentPane",
        "dijit/layout/BorderContainer",
        "dojox/mobile/Switch"
    ],
    function (
        declare,
        d_class,
        d_html,
        _WidgetBase,
        _TemplatedMixin,
        _WidgetsInTemplateMixin,
        ct_css,
        templateString,
        Tooltip
        ) {
        return declare([
                _WidgetBase,
                _TemplatedMixin,
                _WidgetsInTemplateMixin
            ],
            {

                templateString: templateString,
                rightMapControls: null,
                leftMapControls: null,
                showRightControls: true,

                constructor: function () {

                },

                activate: function () {

                    this.i18n = this._i18n.get();
                    this.leftLabel.innerHTML = this.i18n.ui.mapLeft;
                    new Tooltip({
                        connectId: [this.leftLabel],
                        label: this.i18n.ui.switcher.mapLeftTooltip
                    });
                    this.rightLabel.innerHTML = this.i18n.ui.mapRight;
                    new Tooltip({
                        connectId: [this.rightLabel],
                        label: this.i18n.ui.switcher.mapRightTooltip
                    });
                    new Tooltip({
                        connectId: [this.mapSwitch.domNode],
                        label: this.i18n.ui.switcher.switchButtonTooltip
                    });
                    this.showRightControls ? this.mapSwitch.set("value",
                        "on") : this.mapSwitch.set("value",
                        "off");
                    this._onMapSwitchStateChanged(this.showRightControls ? "on" : "off");
                    this.connect(this.leftLabel, "onclick", "_onLeftClick");
                    this.connect(this.rightLabel, "onclick", "_onRightClick");
                    //this.showRightControls?d_class.add(this.leftLabel, "mapThemeActive"):d_class.add(this.rightLabel, "mapThemeActive");
                    this._organizeControls();

                },

                deactivate: function () {
                    //remove children before destroy so the reference stays alive
                    this.controlsPane.destroyDescendants();
                },

                setLeftMapControls: function (lc) {

                    this.leftMapControls = lc;
                    this._organizeControls();

                },

                _organizeControls: function () {

                    var child, child2;

                    if (!this.leftMapControls) {
                        ct_css.switchHidden(this.switcherPane.domNode, true);
                        child = this.rightMapControls;
                    } else {
                        ct_css.switchHidden(this.switcherPane.domNode, false);
                        if (this.showRightControls) {
                            child = this.rightMapControls;
                            child2 = this.leftMapControls;
                        } else {
                            child = this.leftMapControls;
                            child2 = this.rightMapControls;
                        }
                    }

                    if (this.controlsPane.hasChildren()) {
                        this.controlsPane.removeChild(this.controlsPane.getChildren()[0]);
                    }
                    this.controlsPane.addChild(child);
                    child.startup();
                    child.onShow();
                    child2 && child2.onHide();
                    this.resize();

                },

                _onLeftClick: function () {
                    this.mapSwitch.set("value", "off");
                },

                _onRightClick: function () {
                    this.mapSwitch.set("value", "on");
                },

                _onMapSwitchStateChanged: function (evt) {
                    evt === "off" ? this.showRightControls = false : this.showRightControls = true;
                    if (this.showRightControls === true) {
                        ct_css.toggleClass(this.rightLabel, "mapThemeActive", true);
                        ct_css.toggleClass(this.leftLabel, "mapThemeActive", false);
                    }
                    else {
                        ct_css.toggleClass(this.rightLabel, "mapThemeActive", false);
                        ct_css.toggleClass(this.leftLabel, "mapThemeActive", true);
                    }
                    this._organizeControls();
                },

                _onShow: function () {
                    if (this.showRightControls) {
                        this.rightMapControls.onShow();
                    } else {
                        this.leftMapControls.onShow();
                    }
                },

                _onHide: function () {
                    if (this.showRightControls) {
                        this.rightMapControls.onHide();
                    } else {
                        this.leftMapControls.onHide();
                    }
                },

                startup: function () {
                    this.inherited(arguments);
                    if (this.rightMapControls) {
                        this.rightMapControls.startup();
                    }
                    if (this.leftMapControls) {
                        this.leftMapControls.startup();
                    }
                },

                resize: function (d) {
                    this.mainContainer.resize(d);
                }
            }
        );
    }
);