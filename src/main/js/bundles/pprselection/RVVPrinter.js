/**
 * COPYRIGHT 2014 con terra GmbH Germany
 *
 * Created by fba on 17.04.2014.
 */
define([
        "dojo/_base/lang",
        "dojo/_base/declare",
        "dojo/_base/array",
        "dojo/string",
        "ct/Stateful"
    ],
    function (
        d_lang,
        declare,
        d_array,
        d_string,
        Stateful
    ) {

        /*
         * COPYRIGHT 2011-2012 con terra GmbH Germany
         */

        return declare([Stateful],
            {

                KEY: "rvv",
                NAME: "Resultaat bevraging",
                EMPTY_TYPE: [],
                DATAFORM_ELEMENT: [
                    {
                        "type": "checkbox",
                        "disabled": true,
                        "label": "Resultaat bevraging",
                        "field": "print.rvv"
                    }
                ],

                activate: function () {
                    this.i18n = this._i18n.get().ui;
                },

                readPrintData: function (opts) {
                    return this.createRVVTableJson();
                },

                _enablePrintInfo: function () {
                    this.DATAFORM_ELEMENT[0].disabled = false;
                    this._eventService.postEvent("agiv/printing/UPDATE_DIALOG", {
                        updateBindingValues: {
                            print: {
                                rvv: true
                            }
                        }
                    });
                },

                _disablePrintInfo: function () {
                    this.DATAFORM_ELEMENT[0].disabled = true;
                    this._eventService.postEvent("agiv/printing/UPDATE_DIALOG", {
                        updateBindingValues: {
                            print: {
                                rvv: false
                            }
                        }
                    });

                },

                createRVVTableJson: function () {
                    if (this.DATAFORM_ELEMENT[0].disabled) {
                        return null;
                    }
                    var rvvItems = {
                        metadata: [],
                        addressText: ""
                    }
                    var hasData = false;
                    if (this.tool.get("active")) {
                        var dm = this._dataModel;
                        if (dm.datasource) {
                            if (!dm.datasource.empty) {
                                var items = dm.query();
                                var params = this._dataView.DGRID.columns;
                                rvvItems.metadata = this._getFilteredAttributes(items, params);
                                rvvItems.addressText = this._getAddressText(this.i18n.addressTextPPR,
                                    dm.datasource.data[0].parcelID);
                            } else {
                                var id = dm.datasource.data[0] ? dm.datasource.data[0].parcelID : "-";
                                rvvItems.addressText = this._getAddressText(this.i18n.addressTextNoPPR,
                                    id);
                            }
                            hasData = true;
                        }
                    }
                    return hasData ? {
                        rvv: [rvvItems]
                    } : null;
                },

                _getAddressText: function (
                    pattern,
                    parcelID
                ) {
                    return d_string.substitute(pattern, {
                        date: this._getFullDate("/", "{dd}{splitter}{mm}{splitter}{yyyy}"),
                        parcelnumber: parcelID
                    });
                },

                _getFilteredAttributes: function (
                    items,
                    params
                ) {
                    var itemsList = [];
                    d_array.forEach(items, d_lang.hitch(this, function (item) {
                        var rowItem = {};
                        d_array.forEach(params, d_lang.hitch(this, function (attribute) {
                            if (attribute.title && attribute.matches && !attribute.skip) {
                                var attr = attribute.matches.name;
                                rowItem[attr] = item[attr];
                            }
                        }));
                        itemsList.push(rowItem);
                    }));
                    return itemsList;
                },

                _getFullDate: function (
                    splitter,
                    format
                ) {
                    var today = new Date();
                    var dd = today.getDate();
                    var mm = today.getMonth() + 1; //January is 0!

                    var yyyy = today.getFullYear();
                    if (dd < 10) {
                        dd = '0' + dd
                    }
                    if (mm < 10) {
                        mm = '0' + mm
                    }
                    return d_lang.replace(format, {
                        mm: mm,
                        dd: dd,
                        yyyy: yyyy,
                        splitter: splitter
                    });
                }
            });
    });