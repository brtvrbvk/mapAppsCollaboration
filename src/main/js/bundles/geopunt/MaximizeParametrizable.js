/**
 * COPYRIGHT 2014 con terra GmbH Germany
 *
 * Created by fba on 11.07.2014.
 */
define([
        "dojo/_base/declare",
        "ct/Stateful",
        "ct/_Connect"
    ],
    function (
        declare,
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

                encodeURLParameter: function () {
                    return {
                        maximize: this.tool.get("active") ? 1 : 0
                    };
                },

                decodeURLParameter: function (parameterObject) {

                    this._maximize = parameterObject.maximize;
                    if (parameterObject.maximize === "1" || parameterObject.maximize === 1) {
                        this.tool.set("active", true);
                    }

                },

                activate: function () {

                },

                deactivate: function () {

                }
            }
        );
    }
);