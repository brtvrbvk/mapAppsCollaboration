/**
 * COPYRIGHT 2014 con terra GmbH Germany
 *
 * Created by tfu on 04.08.2014.
 */
define([
        "dojo/_base/declare",
        "ct/Stateful",
        "ct/_Connect",
        "./NearbyPlacesWidget"
    ],
    function (
        declare,
        Stateful,
        _Connect,
        NearbyPlacesWidget
        ) {
        return declare([
                Stateful,
                _Connect
            ],
            {
                constructor: function () {

                },

                createInstance: function () {
                    var w = new NearbyPlacesWidget({
                        radiusOpts: this._properties.radiusOpts,
                        comboBoxOpts: this._properties.comboBoxOpts,
                        i18n: this.i18n.ui.nearbyPlaces,
                        eventService: this.eventService
                    });
                    return w;
                },

                activate: function () {
                    this.i18n = this._i18n.get();
                },

                deactivate: function () {

                }
            }
        );
    }
);