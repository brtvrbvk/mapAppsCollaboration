define([
        "dojo/_base/lang",
        "dojo/_base/declare",
        "esri/geometry/jsonUtils",
        "ct/Stateful",
        "."
    ],
    function (
        d_lang,
        declare,
        e_jsonUtils,
        Stateful,
        _moduleRoot
        ) {
        /*
         * COPYRIGHT 2011-2012 con terra GmbH Germany
         */
        /**
         * @fileOverview
         * @author fba
         */


        _moduleRoot.ToExtentHandler = declare(
            [Stateful],
            /**
             * @lends .prototype
             */
            {
                ZOOM_TO_EXTENT: "agiv/toextent/ZOOM_TO_EXTENT",

                /**
                 * @constructor
                 */
                constructor: function () {

                },

                activate: function () {
                    this._extent = e_jsonUtils.fromJson(this.extent);
                },

                toExtent: function () {
                    this._mapState.setExtent(this._extent);
                    if (this._secondMapState) {
                        this._secondMapState.setExtent(this._extent);
                    }
                }


            });

        return _moduleRoot.ToExtentHandler;
    });