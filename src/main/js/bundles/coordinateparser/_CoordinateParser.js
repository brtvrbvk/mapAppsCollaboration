/**
 * COPYRIGHT 2012-2013 con terra GmbH Germany
 *
 * User: fba
 * Date: 09.07.13
 * Time: 07:53
 */
define([
        "dojo/_base/declare",
        "dojo/string",
        "base/search/_Handler",
        "base/search/SearchTopics",
        "esri/geometry/jsonUtils",
        "dojo/number"
    ],
    function (
        declare,
        d_string,
        _Handler,
        SearchTopics,
        e_geometryUtils,
        d_number
        ) {
        return declare([_Handler],
            {

                priority: 50,
                template: "${x} - ${y}",
                decimals: 2,

                constructor: function () {

                },

                activate: function () {
                    this.i18n = this._i18n.get();
                },

                isCoordinate: function (val) {
                    throw Error("NOT IMPLEMENTED");
                },

                _formatCoordinate: function (coord) {
                    var xString = d_number.format(coord.x, {
                        places: this.decimals
                    });
                    var yString = d_number.format(coord.y, {
                        places: this.decimals
                    });
                    xString = xString.replace(".", " ").replace(".", " ");
                    yString = yString.replace(".", " ").replace(".", " ");
                    return d_string.substitute(this.template, {
                        x: xString,
                        y: yString
                    });
                },

                _rehandleResult: function (evt) {
                    var result = evt.getProperty("result");
                    if (result.coordType === this.type) {
                        this._onSelectItem(result);
                    }
                },

                _handleValueChange: function (evt) {

                    this._broadCast(SearchTopics.HANDLER_START);
                    var val = evt && evt.getProperty("newValue"),
                        validPair = this.isValidCoordinatePair(val),
                        coord = this.isCoordinate(val);
                    if (validPair && coord && !coord.isNaN && coord.x && coord.y) {
                        this._broadCast(SearchTopics.NEW_RESULT, {
                            resultset: {
                                results: [
                                    {
                                        geometry: e_geometryUtils.fromJson(coord),
                                        title: this._formatCoordinate(coord),
                                        type: "SEARCH_RESULT_COORDINATE",
                                        coordType: this.type
                                    }
                                ],
                                query: val,
                                typeLabel: this.i18n.ui.searchTypes[this.type],
                                priority: this.priority
                            }
                        });
                    }

                    this._broadCast(SearchTopics.HANDLER_COMPLETE);
                },

                _onSelectItem: function (item) {
                    this.inherited(arguments);
                    //ok, now we query our complete result or display it directly if we have a geometry
                    if (item) {
                        if (item.geometry) {
                            this._broadCast(SearchTopics.SELECTED_RESULT, {result: item});
                        }
                    }
                },

                parseFloatingPointNumber: function (val) {
                    val = this._removeSpecialCharacters(val);
//                    if (val.search(/[a-z]/ig) > -1) {
//                        return {
//                            x: Number.NaN,
//                            y: Number.NaN
//                        };
//                    }
                    try {
                        var separatorsToTry = [
                            " ",
                            "-",
                            ",",
                            ";",
                            ".",
                            "--"
                        ];
                        var num;
                        for (var i = 0; i < separatorsToTry.length; i++) {
                            num = this._parseFloatingPointNumber(val, separatorsToTry[i]);
                            if (!isNaN(num.x) && !isNaN(num.y)) {
                                break;
                            }
                        }
                        return num;
                    } catch (e) {
                        return {
                            x: Number.NaN,
                            y: Number.NaN
                        };
                    }
                },

                _removeSpecialCharacters: function (val) {
                    var charactersToRemove = [
                        "°",
                        "m",
                        "km"
                    ];
                    for (var i = 0; i < charactersToRemove.length; i++) {
                        var regexp = new RegExp(charactersToRemove[i], "g");
                        val = val.replace(regexp, "");
                    }
                    return val;
                },

                _parseFloatingPointNumber: function (
                    val,
                    separator
                    ) {
                    try {
                        var values = val.split(separator);
                        if (values.length > 2) {
                            return {
                                x: Number.NaN,
                                y: Number.NaN
                            };
                        }
                        var regexp = new RegExp("\\s", "g");
                        var x = values[0];
                        x = x.replace(regexp, "");
                        x = d_string.trim(x);
                        x = x.replace(",", ".");
                        var items = x.split(".");
                        if (items.length === 2) {
                            if (items[0] === "" && items[1]) {
                                x = "0." + items[1];
                            }
                            if (items[0] && items[1] === "") {
                                x = items[0] + ".0";
                            }
                        }

                        var y = values[1];
                        if (y !== undefined) {
                            y = y.replace(regexp, "");
                            y = d_string.trim(y);
                            y = y.replace(",", ".");
                            var items = y.split(".");
                            if (items.length === 2) {
                                if (items[0] === "" && items[1]) {
                                    y = "0." + items[1];
                                }
                                if (items[0] && items[1] === "") {
                                    y = items[0] + ".0";
                                }
                            }
                        }

                        return {
                            x: new Number(x),
                            y: y !== undefined ? new Number(y) : y
                        };
                    } catch (e) {
                        return {
                            x: Number.NaN,
                            y: Number.NaN
                        };
                    }
                }
            }
        )
    }
);