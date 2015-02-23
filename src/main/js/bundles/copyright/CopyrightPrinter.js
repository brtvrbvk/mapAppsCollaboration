/**
 * COPYRIGHT 2014 con terra GmbH Germany
 *
 * Created by fba on 27.05.2014.
 */
define([
        "dojo/_base/declare",
        "dojo/_base/array",
        "ct/Stateful",
        "ct/_Connect"
    ],
    function (
        declare,
        d_array,
        Stateful,
        _Connect
        ) {
        return declare([
                Stateful,
                _Connect
            ],
            {
                constructor: function () {

                },

                _handleCopyrightsChanged: function (evt) {
                    this._copyrights = evt.getProperty("copyrights");
                },

                readPrintData: function (opts) {
                    var result = {};
                    if (this._copyrights && this._copyrights.length > 0) {

                        d_array.forEach(this._copyrights, function (elem) {
                            result.copyright = elem.copyright + ".png";
                        }, this);
                    }
                    return result;
                }
            }
        );
    }
);