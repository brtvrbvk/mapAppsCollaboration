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
        "dojo/dom-construct",
        "dojo/number",
        "dojo/string",
        "dijit/form/Button",
        "ct/util/css",
        "ct/_Connect",
        "dijit/_Widget",
        "dijit/_Templated",
        "./RoutingStopoverWidget",
        "ct/util/css",
        "dojo/text!./templates/RoutingResultWidget.html"
    ],
    function (
        declare,
        d_lang,
        d_array,
        d_domconstruct,
        d_number,
        d_string,
        Button,
        css,
        Connect,
        _Widget,
        _Templated,
        RoutingStopoverWidget,
        ct_css,
        templateString
        ) {
        var RoutingResultWidget = declare([
            _Widget,
            _Templated
        ], {

            templateString: templateString,
            widgetsInTemplate: true,

            topics: {
                GET_ELEVATION_INFO: "ct/elevation/GET_ELEVATION_INFO_FOR_ROUTE"
            },

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
//                ,
//                instructions: [
//                {
//                    node: "instructionsNode",
//                    type: "innerHTML"
//                }
//                ]
            }),

            postCreate: function () {
                if (this.type && this.type == "nonprint") {
                    var listeners = new Connect({
                        defaultConnectScope: this
                    });
                    listeners.connect(this.clickableNode, "onclick", this,
                        this._onClick);
                    listeners.connect(this.elevationButton, "onClick", this,
                        this._getElevationInfo);
                }
                this.inherited(arguments);
                this.set("title",
                        this.i18n.transport[this.transportMode] + ", " + this.i18n.types[this.transportType] + " route");
                var distance = d_string.substitute(this.i18n.distance, {
                    distance: d_number.format(this.route.distance / 1000, {})
                });
                
                //BartVerbeeck Bug29968 60 minuten is een uur
                var min = this.route.time / 60;
                var hour = Math.floor(min / 60);
                min = Math.round(min % 60);
                if(min == 60){
                    min = 0;
                    hour = hour + 1;
                }
                //var duration = d_string.substitute(this.i18n.duration, {
                //    hour: Math.floor(min / 60),
                //    min: d_number.format(Math.round(min % 60), {
                //        pattern: "00"
                //    })
                //});
                var duration = d_string.substitute(this.i18n.duration, {
                    hour: hour,
                    min: d_number.format(min, {
                        pattern: "00"
                    })
                });
                this.set("subtitle", distance + "<br/>" + duration);
                var stopover = this.route.stopovers;
                d_array.forEach(this.targets, function (
                    target,
                    idx
                    ) {
                    var so = new RoutingStopoverWidget({
                        type: this.type,
                        stopover: stopover[idx] ? stopover[idx] : null,
                        i18n: this.i18n,
                        title: target.title,
                        markerUrl: this.markerUrls[idx]
                    });
                    d_domconstruct.place(so.domNode, this.instructionsNode);
                }, this);
                if (!this.elevationTool) {
                    ct_css.switchHidden(this.elevationButton.domNode, true);
                }
                if (this.elevationTool && this.elevationTool.get("active")) {
                    this._getElevationInfo();
                }
                
            },

            _getElevationInfo: function () {
                var mergedPoints = [];
                var stopovers = this.route.stopovers;
                d_array.forEach(stopovers, function (stopover) {
                    var parts = stopover.parts;
                    d_array.forEach(parts, function (part) {
                        mergedPoints = mergedPoints.concat(part.geometry.paths[0]);
                    });
                }, this);
                var graphic = {
                    geometry: {
                        spatialReference: this.route.stopovers[0].parts[0].geometry.spatialReference,
                        paths: [mergedPoints],
                        type: "polyline"
                    }
                };
                this.eventService.postEvent(this.topics.GET_ELEVATION_INFO, {
                    geometry: {
                        graphic: graphic
                    }
                });
            },


            _onClick: function () {
                this.onClick();
            },
            onClick: function () {
            }

        });
        return RoutingResultWidget;
    });
