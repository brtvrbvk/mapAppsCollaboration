/**
 * COPYRIGHT 2014 con terra GmbH Germany
 *
 * Created by fba on 17.04.2014.
 */
define([
        "dojo/_base/declare",
        "dojo/_base/array",
        "dojo/number",
        "dojo/string",
        "ct/Stateful"
    ],
    function (
        declare,
        d_array,
        d_number,
        d_string,
        Stateful
        ) {

        /*
         * COPYRIGHT 2011-2012 con terra GmbH Germany
         */

        return declare([Stateful],
            {

                KEY: "routing",
                NAME: "Routing",
                EMPTY_TYPE: [],
                DATAFORM_ELEMENT: [
                    {
                        "type": "checkbox",
                        "disabled": true,
                        "field": "print.routing",
                        "label": "Routing"
                    }
//                    ,{
//                    "type": "label",
//                    "value": "Routing"
//                }
                ],

                constructor: function () {
                },

                _updatePrintInfo: function (evt) {

                    var hasRoute = evt.getProperty("hasRoute");
                    this.DATAFORM_ELEMENT[0].disabled = !hasRoute;
                    this._eventService.postEvent("agiv/printing/UPDATE_DIALOG");

                },

                activate: function () {
                    this.i18n = this._i18n.get().ui;
                },

                readPrintData: function (opts) {
                    return this.createRoutingJson();
                },

                createRoutingJson: function () {
                    var routingItems = {
                        transportation: "",
                        distance: "",
                        duration: "",
                        routes: []
                    }
                    var hasData = false;
                    var info = this._routingWidget.getRoutingResultInfo();
                    if (info) {
                        var rr = info.routes[0];

                        var transportMode = rr.transportation[0];
                        var transportType = rr.type;
                        routingItems.transportation = d_string.substitute(this.i18n.transportation, {
                            mode: this.i18n.transport[transportMode],
                            type: this.i18n.types[transportType]
                        });

                        routingItems.distance = d_string.substitute(this.i18n.distance, {
                            distance: d_number.format(rr.distance / 1000, {})
                        });

                        var min = rr.time / 60;
                        routingItems.duration = d_string.substitute(this.i18n.duration, {
                            hour: Math.floor(min / 60),
                            min: d_number.format(Math.round(min % 60), {
                                pattern: "00"
                            })
                        });

                        var stopover = rr.stopovers;
                        var totalDistance = 0;
                        var stopoverInstruction = function (stopover) {
                            var parts = [];
                            d_array.forEach(stopover.parts, function (
                                part,
                                index
                                ) {
                                var p = {};
                                if (index === 0) {
                                    p["step"] = part.instruction;
                                } else {
                                    if (totalDistance > 1000) {
                                        var t = d_number.format(totalDistance / 1000, {});
                                        p["step"] = t + " km: " + part.instruction;
                                    } else {
                                        p["step"] = totalDistance + " m: " + part.instruction;
                                    }
                                }
                                totalDistance += part.distance;
                                parts.push(p);
                            });
                            return parts;
                        };
                        d_array.forEach(info.targets, function (
                            target,
                            idx
                            ) {
                            var route = {
                                target: target.title,
                                markerUrl: info.markerUrls[idx],
                                instructions: stopover[idx] ? stopoverInstruction(stopover[idx]) : []
                            };
                            routingItems.routes.push(route);
                        });

                        hasData = true;
                    }
                    return hasData ? {
                        routing: [routingItems]
                    } : null;
                }
            });
    });