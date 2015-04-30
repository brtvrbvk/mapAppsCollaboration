/**
 * COPYRIGHT 2014 con terra GmbH Germany
 *
 * Created by fba on 04.04.2014.
 */
define([
        "dojo/_base/declare",
        "./_Adapter"
    ],
    function (
        declare,
        _Adapter
        ) {
        return declare([_Adapter],
            {

                store: null,
                query: {id: {$eqw: "*"}},
                options: {},
                selectionTopic: "ct",

                constructor: function () {

                },

                activate: function () {

                },

                getItems: function () {

                    return this.store.query(this.query, this.options);

                },

                deselectItem: function (item) {

                },

                selectItem: function (item) {
                    if (this.eventService) {
                        this.eventService.postEvent(this.selectionTopic, {
                            id: item.id
                        });
                    }
                }
            }
        );
    }
);