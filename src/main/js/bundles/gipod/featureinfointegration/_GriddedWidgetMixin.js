/**
 * COPYRIGHT 2012-2013 con terra GmbH Germany
 *
 * User: fba
 * Date: 17.10.13
 * Time: 14:48
 */
define([
        "dojo/_base/declare",
        "dojo/store/Memory",
        "ct/_when"
    ],
    function (
        declare,
        Memory,
        ct_when
        ) {
        return declare([],
            {
                constructor: function () {

                },

                postCreate: function () {

                    this.inherited(arguments);

                    this._initGrid(this.content);

                },

                _initGrid: function (item) {

                    var meta = this.metadata;

                    var store = this.store = new Memory({
                        data: [item],
                        getMetadata: function () {
                            return meta;
                        }
                    });

                    this._gridContext.store = store;
                    this._gridContext.i18n = this.i18n;

                    ct_when(this.contentviewer.resolveContentWidget(item,
                            this._gridContext),
                        function (w) {

                            if (w) {
                                this.gridNode.set("content", w);
                            }

                        }, function (err) {
                        }, this);

                }
            }
        )
    }
);