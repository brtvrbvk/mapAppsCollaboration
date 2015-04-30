/**
 * COPYRIGHT 2012-2013 con terra GmbH Germany
 *
 * User: fba
 * Date: 16.05.13
 * Time: 08:47
 */
define([
        ".",
        "dojo/_base/declare",
        "dojo/_base/lang",
        "ct/array",
        "ct/_Connect"
    ],
    function (
        _moduleroot,
        declare,
        d_lang,
        ct_array,
        Connect
        ) {
        return _moduleroot.POIStoreEventBroadcaster = declare([Connect],
            {
                topics: {
                    UPDATE_START: "ct/map/UPDATE_START",
                    UPDATE_END: "ct/map/UPDATE_END",
                    SCALE_CHANGED: "ct/mapstate/SCALE_CHANGED"
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
                    console.debug("POIStoreEventBroadcaster: " + topic);
                    this._eventService.postEvent(topic, evt);
                },

                _connectBroadcasts: function (store) {
                    var id = "boradcasts" + store.id;
                    console.debug("POIStoreEventBroadcaster: Connecting store " + id);
                    this.connect(id, store, "onUpdateStart",
                        function () {
                            //we need to trigger this to update the scale in the stores after first startup
                            this._onExtentChange();
                            this._broadcast(this.topics.UPDATE_START);
                        });
                    this.connect(id, store, "onUpdateEnd",
                        d_lang.partial(this._broadcast,
                            this.topics.UPDATE_END));
                },

                _disconnectBroadcasts: function (store) {
                    var id = "boradcasts" + store.id;
                    console.debug("POIStoreEventBroadcaster: Disconnecting store " + id);
                    this.disconnect(id);
                },

                _onExtentChange: function (e) {
                    var s = this.mapstate.getViewPort().getScale();
                    this._broadcast(this.topics.SCALE_CHANGED,
                        {scale: s});
                },

                deactivate: function () {
                    this.disconnect();
                }
            }
        )
    });