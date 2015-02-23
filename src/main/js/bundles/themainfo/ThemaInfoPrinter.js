/**
 * COPYRIGHT 2014 con terra GmbH Germany
 *
 * Created by fba on 22.09.2014.
 */
define([
        "dojo/_base/declare",
        "dojo/_base/array",
        "ct/Stateful",
        "ct/_Connect",
        "ct/_when",
        "base/util/units"
    ],
    function (
        declare,
        d_array,
        Stateful,
        _Connect,
        ct_when,
        units
        ) {
        return declare([
                Stateful,
                _Connect
            ],
            {

                KEY: "themainfo",
                NAME: "Thema Info",
                EMPTY_TYPE: [],
                DATAFORM_ELEMENT: [
                    {
                        "type": "checkbox",
                        "disabled": true,
                        "field": "print.themainfo",
                        "label": "Info in de buurt",
                        "checkedIfEnabled": true
                    }
                ],

                constructor: function () {

                },

                reset: function () {

                    this.DATAFORM_ELEMENT[0].disabled = true;
                    this._eventService.postEvent("agiv/printing/UPDATE_DIALOG");

                },

                _updatePrintInfo: function (evt) {

                    var hasThemainfo = this.locationInfoController.get("lastResults");
                    hasThemainfo = hasThemainfo && hasThemainfo.length > 0;
                    this.DATAFORM_ELEMENT[0].disabled = !hasThemainfo;
                    this._eventService.postEvent("agiv/printing/UPDATE_DIALOG");

                },

                readPrintData: function () {
                    var lic = this.locationInfoController;
                    var themainfos = lic.get("lastResults");
                    var categories = {}, results = [];
                    d_array.forEach(themainfos, function (ti) {
                        categories[ti.category] = categories[ti.category] || [];
                        var elem = {
                            distance: units.getDistanceStringMetric(ti.distance / 1000, 1),
                            title: ti.title,
                            category: ti.category,
                            layer: ti.poitypetitle || ti.layer
                        };
                        categories[ti.category].push(elem);
                    }, this);

                    for (var key in categories) {
                        results.push({
                            category: key,
                            themainfos: categories[key]
                        });
                    }

                    return {
                        themainfo: [
                            {
                                radius: units.getDistanceStringMetric(lic.get("radius") / 1000, 1),
                                themainfos: results,
                                address: this.address,
                                markerNumber: this.resultNumber < 10 ? "0" + this.resultNumber : this.resultNumber + ""
                            }
                        ]
                    };
                },

                _saveResult: function (evt) {

                    var pos = evt.getProperty("result");
                    if (pos.title || pos.FormattedAddress) {
                        this.address = pos.title || pos.FormattedAddress;
                        this.resultNumber = pos.resultNumber;
                    } else {
                        ct_when(pos.geocodeDeferred, function (res) {
                            this.address = res.title || res.FormattedAddress;
                            this.resultNumber = res.resultNumber;
                        }, function (error) {
                            //TODO
                        }, this);
                    }

                    this.reset();

                },

                activate: function () {

                },

                deactivate: function () {

                }
            }
        );
    }
);