/*
 * COPYRIGHT 2011-2012 con terra GmbH Germany
 */
/**
 * @fileOverview
 * @author fba
 */
define([
        "dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/_base/array",
        "dojo/dom-class",
        "dojo/dom-construct",
        "dojo/number",
        "ct/_Connect",
        "dijit/_Widget",
        "dijit/_Templated",
        "dojo/text!./templates/RoutingStopoverWidget.html"
    ],
    function (
        declare,
        d_lang,
        d_array,
        dom_class,
        d_domconstruct,
        d_number,
        Connect,
        _Widget,
        _Templated,
        templateString
        ) {
        var RoutingStopoverWidget = declare([
            _Widget,
            _Templated
        ], {

            templateString: templateString,
            widgetsInTemplate: false,
            showInstructions: true,

            attributeMap: d_lang.delegate(_Widget.prototype.attributeMap, {
                title: [
                    {
                        node: "titleNode",
                        type: "innerHTML"
                    }
                ],
                subtitle: [
                    {
                        node: "subtitleNode",
                        type: "innerHTML"
                    }
                ]
            }),

            postCreate: function () {
                if (this.type && this.type == "nonprint" && this.stopover) {
                    var _listeners = new Connect({
                        defaultConnectScope: this
                    });
                    _listeners.connect(this.clickableNode, "onclick", this,
                        this._onClick);
                }
                this.inherited(arguments);

                this.marker.src = this.markerUrl;
                this.set("title", this.title);
                var cumm = 0;
                if (this.stopover) {
                    d_array.forEach(this.stopover.parts, function (
                        p,
                        idx
                        ) {
                        var inst;
                        if (cumm === 0) {
                            inst = p.instruction;
                        } else {
                            if (cumm > 1000) {
                                var t = d_number.format(cumm / 1000, {});
                                inst = t + " km: " + p.instruction
                            } else {
                                inst = cumm + " m: " + p.instruction
                            }
                        }
                        cumm += p.distance;
                        d_domconstruct.place(d_domconstruct.create("li", {
                            innerHTML: inst
                        }), this.instructionsNode);
                    }, this);
                }
            },

            _setShowInstructionsAttr: function (vis) {
                this.showInstructions = vis;
                if (vis) {
                    dom_class.remove(this.instructionsNode, "dijitHidden");
                } else {
                    dom_class.add(this.instructionsNode, "dijitHidden");
                }
            },

            _onClick: function () {
                this.set("showInstructions", !this.get("showInstructions"));
                this.onClick();
            },
            onClick: function () {
            }

        });
        return RoutingStopoverWidget;
    });
