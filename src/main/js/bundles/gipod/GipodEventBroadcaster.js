/**
 * COPYRIGHT 2012-2013 con terra GmbH Germany
 *
 * User: fba
 * Date: 10.10.13
 * Time: 15:21
 */
define([
        "dojo/_base/declare",
        "dojo/_base/lang",
        "ct/array",
        "ct/_Connect"
    ],
    function (
        declare,
        d_lang,
        ct_array,
        Connect
        ) {
        return declare([Connect],
            {
                topics: {
                    UPDATE_START: "ct/map/UPDATE_START",
                    UPDATE_END: "ct/map/UPDATE_END"
                },

                stores: null,

                constructor: function (opts) {
                    this.store = opts && opts.store;
                    this.stores = [];
                },

                addStores: function (store) {
                    ct_array.arrayAdd(this.stores, store);
                    this._connectBroadcasts(store);
                },

                removeStores: function (store) {
                    ct_array.arrayRemove(this.stores, store);
                    this._disconnectBroadcasts(store);
                },

                activate: function () {
                    if (this.store) {
                        this._connectBroadcasts(this.store);
                    }
                },

                _broadcast: function (
                    topic,
                    evt
                    ) {
                    console.debug("GipodEventBroadcaster: " + topic);
                    this._eventService.postEvent(topic, evt);
                },

                _connectBroadcasts: function (store) {
                    var id = "boradcasts" + (store.id || store.datasource.id);
                    console.debug("GipodEventBroadcaster: Connecting store " + id);
                    this.connect(id, store, "onUpdateStart",
                        d_lang.partial(this._broadcast,
                            this.topics.UPDATE_START));
                    this.connect(id, store, "onUpdateEnd",
                        d_lang.partial(this._broadcast,
                            this.topics.UPDATE_END));
                },

                _disconnectBroadcasts: function (store) {
                    var id = "boradcasts" + (store.id || store.datasource.id);
                    console.debug("GipodEventBroadcaster: Disconnecting store " + id);
                    this.disconnect(id);
                },

                deactivate: function () {
                    this.disconnect();
                }

            }
        )
    }
);