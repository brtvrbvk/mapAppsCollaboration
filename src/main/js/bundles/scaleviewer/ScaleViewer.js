/**
 * COPYRIGHT 2012-2013 con terra GmbH Germany
 *
 * User: fba
 * Date: 08.10.13
 * Time: 13:09
 */
define([
        "dojo/_base/declare",
        "ct/Stateful",
        "./ScaleViewerWidget"
    ],
    function (
        declare,
        Stateful,
        ScaleViewerWidget
        ) {
        return declare([Stateful],
            {

                constructor: function () {
                },

                activate: function () {
                    this.i18n = this._i18n.get();
                },

                createInstance: function () {
                    return new ScaleViewerWidget({
                        mapState: this._mapState,
                        secondMapState: this._secondMapState,
                        scaleTemplate: this.i18n.ui.scale
                    });
                },

                destroyInstance: function (w) {
                    if (w)
                        w.destroyRecursive();
                }
            }
        )
    }
);