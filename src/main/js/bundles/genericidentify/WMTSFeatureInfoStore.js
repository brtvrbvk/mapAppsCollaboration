/**
 * COPYRIGHT 2014 con terra GmbH Germany
 *
 * Created by fba on 22.07.2014.
 */
define([
        "dojo/_base/declare",
        "./WMSFeatureInfoStore",
        "dojo/_base/array",
        "dojo/_base/lang",
        "dojo/number",
        "dojo/io-query",
        "dojo/Deferred",
        "dojo/DeferredList",
        "ct/Exception",
        "ct/store/SpatialQuery",
        "dojo/store/util/QueryResults",
        "ct/request",
        "ct/_when"
    ],
    function (
        declare,
        WMSFeatureInfoStore,
        d_array,
        d_lang,
        d_number,
        d_ioq,
        Deferred,
        DeferredList,
        Exception,
        SpatialQuery,
        QueryResults,
        ct_request,
        ct_when
        ) {
        return declare([WMSFeatureInfoStore],
            {
                constructor: function () {

                },

                query: function (
                    query,
                    queryOptions
                    ) {
                    var geom = this._getGeometryFromQuery(query, queryOptions);
                    if (geom.type && geom.type == "extent") {
                        geom = geom.getCenter();
                    }
                    //we need this for the WMS requests
                    this._props = {
                        geoExtent: this._mapState.getViewPort().getGeo(),
                        screenPoint: this._toScreen(geom),
                        width: this._getScreenWidth(),
                        height: this._getScreenHeight()
                    }

                    var d = new Deferred();

                    ct_when(this._getLayerTypeMapping(), function (resp) {
                        // merge app config and config from database
                        var mapping;
                        if (resp && resp.error) {
                            console.log("WMSFeatureInfoStore: Error getting layer type mapping: ", resp.error);
                        } else {
                            mapping = resp;
                        }
                        this.layerTypeMapping = this.configHelper.mergeAttributes(this.appLayerTypeMapping, mapping);

                        this._hasOtherAttributes = false;
                        var result = this._addExtraInfoToMetadata({});
                        // check if there are attributes from other services defined
                        var otherConfig = this.configHelper.getMergedOtherAttributes(this.generalTypeMapping,
                            this.layerTypeMapping);
                        if (otherConfig.mapping.length > 0) {
                            var mapping = otherConfig.mapping;
                            this._hasOtherAttributes = true;
                            ct_when(this._getResultFromOtherServices(mapping), function (resultFromAnotherService) {
                                var res = this._mergeResult(mapping, [result], resultFromAnotherService);
                                if (res.error) {
                                    d.reject(res);
                                    return;
                                }
                                d.resolve(res);
                            }, this);
                        } else {

                            if (this.isEmpty(result)) {
                                d.resolve([]);
                            } else {
                                d.resolve([result]);
                            }

                        }

                    }, this);

                    return new QueryResults(d);
                },

                isEmpty: function (myObject) {
                    for (var key in myObject) {
                        if (myObject.hasOwnProperty(key)) {
                            return false;
                        }
                    }

                    return true;
                },

                _getLayerTypeMapping: function () {
                    var d = new Deferred();
                    // internal services
                    if (this.identifyConfigUrl) {
                        ct_when(ct_request.requestJSON({
                            url: this.identifyConfigUrl
                        }), function (mapping) {
                            d.resolve(mapping);
                        }, function (err) {
                            d.resolve({error: err});
                        }, this);
                    } else if (this.serviceId && this.layerId && this.serviceId.indexOf("http:__") === -1) { // see loadServiceController
                        // external services and services with no configured layermapping in themepanel
                        ct_when(this.identifyMappingStore.query({service: this.serviceId, layer: this.layerId, defaultMapping: true},
                            {}), function (resp) {
                            d.resolve(resp[0]); // use the first config
                        }, function (err) {
                            d.resolve({error: err});
                        }, this);
                    } else {
                        // no layerTypeMapping available
                        d.resolve();
                    }
                    return d;
                }
            }
        );
    }
);