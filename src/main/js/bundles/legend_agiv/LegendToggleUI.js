/**
 * COPYRIGHT 2014 con terra GmbH Germany
 *
 * Created by fba on 06.05.2014.
 */
define([
        "dojo/_base/declare",
        "dojo/dom-class",
        "dojo/dom-construct",
        "dijit/_WidgetBase",
        "dijit/_TemplatedMixin",
        "dijit/_WidgetsInTemplateMixin",
        "ct/util/css",
        "./LegendUI",
        "dojo/text!./templates/LegendToggleUI.html",
        "dijit/layout/ContentPane",
        "dojox/mobile/Switch"
    ],
    function (
        declare,
        d_class,
        d_domConstruct,
        _WidgetBase,
        _TemplatedMixin,
        _WidgetsInTemplateMixin,
        ct_css,
        LegendUI,
        templateString
        ) {
        return declare([
                _WidgetBase,
                _TemplatedMixin,
                _WidgetsInTemplateMixin
            ],
            {

                templateString: templateString,
                rightMapLegend: null,
                leftMapLegend: null,
                showRightControls: true,

                constructor: function () {

                },

                activate: function () {
                    this.i18n = this._i18n.get();
                    this.leftLabel.innerHTML = this.i18n.ui.mapLeft;
                    this.rightLabel.innerHTML = this.i18n.ui.mapRight;
                },

                setLeftMapLegend: function (lml) {
                    this.leftMapLegend = lml;
                },

                deactivate: function () {
                    //remove children before destroy so the reference stays alive
                    var cn = this.controlsNode;
                    while (cn.hasChildNodes()) {
                        cn.removeChild(cn.firstChild);
                    }
                },

                startup: function () {

                    this.inherited(arguments);
                    var template = this._templateModel.getSelectedTemplate().name;
                    if (template !== "light" && template !== "splitview") {
                        //we are in printmode!
                        this._printModeInit();
                    } else {
                        this.showRightControls ? this.mapSwitch.set("value",
                            "on") : this.mapSwitch.set("value",
                            "off");
                    }

                },

                _printModeInit: function () {

                    this.deactivate();

                    ct_css.switchHidden(this.switcherPane.domNode, true);

                    if (this.leftMapLegend) {
                        this.controlsNode.appendChild(d_domConstruct.create("h1", {
                            innerHTML: this.i18n.ui.mapTop
                        }));
                        this.controlsNode.appendChild(this.leftMapLegend.domNode);
                        this.leftMapLegend.show();
                        this.controlsNode.appendChild(d_domConstruct.create("h1", {
                            innerHTML: this.i18n.ui.mapBottom
                        }));
                    }

                    this.controlsNode.appendChild(this.rightMapLegend.domNode);
                    this.rightMapLegend.show();

                },

                _organizeControls: function () {

                    var cn = this.controlsNode, child, orphan;

                    if (!this.leftMapLegend) {
                        ct_css.switchHidden(this.switcherPane.domNode, true);
                        child = this.rightMapLegend;
                    } else {
                        ct_css.switchHidden(this.switcherPane.domNode, false);
                        if (this.showRightControls) {
                            child = this.rightMapLegend;
                            orphan = this.leftMapLegend;
                        } else {
                            child = this.leftMapLegend;
                            orphan = this.rightMapLegend;
                        }
                    }

                    if (cn.hasChildNodes()) {
                        cn.replaceChild(child.domNode, cn.firstChild);
                    } else {
                        cn.appendChild(child.domNode);
                    }
                    child.show();
                    if (orphan) {
                        orphan.hide();
                    }

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

                show: function () {
                    this._onMapSwitchStateChanged(this.showRightControls ? "on" : "off");
                    //this.showRightControls?d_class.add(this.leftLabel, "mapThemeActive"):d_class.add(this.rightLabel, "mapThemeActive");
                    this._organizeControls();
                },

                hide: function () {
                    if (this.leftMapLegend) {
                        this.leftMapLegend.hide();
                    }
                    this.rightMapLegend.hide();
                }
            }
        )
    }
);