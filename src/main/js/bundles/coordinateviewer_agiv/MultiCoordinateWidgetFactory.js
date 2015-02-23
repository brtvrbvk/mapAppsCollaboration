/**
 * COPYRIGHT 2014 con terra GmbH Germany
 *
 * Created by fba on 16.07.2014.
 */
define([
        "dojo/_base/declare",
        "ct/Stateful",
        "ct/_Connect",
        "./MultiCoordinateWidget"
    ],
    function (
        declare,
        Stateful,
        _Connect,
        MultiCoordinateWidget
        ) {
        return declare([
                Stateful,
                _Connect
            ],
            {
                constructor: function () {

                },

                createInstance: function () {
                    return new MultiCoordinateWidget({
                        i18n: this._i18n.get()
                    });
                },

                destroyInstance: function (i) {
                    if (i) {
                        i.destroy();
                    }
                }
            }
        );
    }
);