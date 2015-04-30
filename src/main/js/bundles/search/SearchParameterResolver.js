/**
 * COPYRIGHT 2014 con terra GmbH Germany
 *
 * Created by tfu on 11.07.2014.
 */
define([
        "dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/keys",
        "dojo/string",
        "ct/Stateful",
        "ct/_Connect",
        "base/search/SearchParametrizable"
    ],
    function (
        declare,
        d_lang,
        d_keys,
        d_string,
        Stateful,
        _Connect,
        SearchParametrizable
        ) {
        return declare([
                SearchParametrizable
            ],
            {
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
                        var searchController = this._searchController;
                        if (searchController._isCoordinate(searchObj) && searchController.isValidCoordinatePair(searchObj)) {
                            searchController._onValueChange({
                                newValue: searchObj,
                                _evt: {
                                    keyCode: d_keys.ENTER
                                }
                            })
                        } else {
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