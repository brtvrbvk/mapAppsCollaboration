/**
 * COPYRIGHT 2014 con terra GmbH Germany
 *
 * Created by fba on 06.08.2014.
 */
define([
        "dojo/_base/declare",
        "dojo/Deferred",
        "dojo/_base/array",
        "ct/_when",
        "ct/array",
        "ct/Stateful",
        "base/store/poi/POIServerStore"
    ],
    function (
        declare,
        Deferred,
        d_array,
        ct_when,
        ct_array,
        Stateful,
        POIServerStore
        ) {
        return declare([Stateful],
            {
                constructor: function () {
                    this._stores = {};
                },

                canHandleRequest: function (
                    node,
                    service
                    ) {

                    return true;

                },

                requestInfo: function (
                    node,
                    service,
                    position,
                    radius
                    ) {

                    var d = new Deferred();

                    if (!node.layer) {
                        d.reject();
                        return d;
                    }

                    var store = this._stores[node.id] || new POIServerStore({
                        target: service.serviceUrl,
                        poitype: node.layer.layerId,
                        srs: this.mapState.getSpatialReference().wkid
                    });
                    this._stores[node.id] = store;
                    node.store = store;

                    var q = {
                        geometry: {
                            $intersects: position
                        }
                    };

                    ct_when(store.query(q, {
                        radius: radius,
                        count: 30
                    }), function (res) {
                        if (res && res.length > 0) {
                            res = ct_array.arraySort(res, ct_array.arrayComparator([
                                {
                                    attribute: "distance"
                                }
                            ]));
                        }
                        var cat = node.parent.parent.title;
                        d_array.forEach(res, function (result) {
                            result.category = cat;
                            result.layer = result.poitype;
                        }, this);
                        d.resolve(res);
                    }, function (error) {
                        d.reject(error);
                    }, this);

                    return d;

                }
            }
        );
    }
);