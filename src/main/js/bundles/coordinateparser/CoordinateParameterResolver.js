/**
 * COPYRIGHT 2015 con terra GmbH Germany
 *
 * Created by fba on 08.05.2015.
 */
define([
        "dojo/_base/declare",
        "dojo/_base/array",
        "dojo/_base/lang",
        "dojo/keys",
        "dojo/string",
        "ct/Stateful",
        "ct/_Connect",
        "base/search/SearchParametrizable",
        "esri/geometry/jsonUtils"
    ],
    function (declare, d_array, d_lang, d_keys, d_string, Stateful, _Connect, SearchParametrizable, e_geometryUtils) {
        return declare([
                SearchParametrizable
            ],
            {
                constructor: function () {
                    this.parsers = [];
                },

                addParsers: function (parser) {
                    this.parsers.push(parser);
                    if (this.searchObj) {
                        var coord;
                        if ((coord = parser.isCoordinate(this.searchObj)) && parser.isValidCoordinatePair(this.searchObj)) {
                            parser.selectItem({
                                geometry: e_geometryUtils.fromJson(coord),
                                title: parser.formatCoordinate(coord),
                                type: "SEARCH_RESULT_COORDINATE",
                                coordType: this.type
                            });
                        }
                    }

                },

                decodeURLParameter: function (urlObject) {
                    if (urlObject.id) {
                        return;
                    }
                    var searchObj = urlObject[this.searchTerm];
                    if (searchObj) {
                        if (d_lang.isArray(searchObj) && searchObj.length > 1) {
                            this._showNotificationWindow(this._i18n.errorMessage);
                            return;
                        }
                        this.searchObj = searchObj;
                        var found = false;
                        d_array.some(this.parsers, function (parser) {
                            var coord;
                            if ((coord = parser.isCoordinate(searchObj)) && parser.isValidCoordinatePair(searchObj)) {
                                parser.selectItem({
                                    geometry: e_geometryUtils.fromJson(coord),
                                    title: parser.formatCoordinate(coord),
                                    type: "SEARCH_RESULT_COORDINATE",
                                    coordType: this.type
                                });
                                found = true;
                                return true;
                            }

                        }, this);

                        if (!found) {
                            this._showNotificationWindow(d_string.substitute(this._i18n.invalidMessage, {
                                coordinate: searchObj
                            }));
                        }
                    }
                }
            }
        );
    }
);