/**
 * COPYRIGHT 2012-2013 con terra GmbH Germany
 *
 * User: fba
 * Date: 09.07.13
 * Time: 14:33
 */
define([
        "dojo/_base/declare",
        "dojo/_base/array",
        "ct/Stateful",
        "ct/_when",
        "base/store/poi/POIServerStore",
        "base/mapping/MappingResourceUtils",
        "ct/mapping/mapcontent/MappingResourceFactory",
        "ct/mapping/mapcontent/ServiceTypes"
    ],
    function (
        declare,
        d_array,
        Stateful,
        ct_when,
        POIServerStore,
        MappingResourceUtils,
        MappingResourceFactory,
        ServiceTypes
        ) {
        return declare([Stateful],
            {
                CONTENT_MODEL_LAYER_ADD: "contentModelLayerAdd",

                constructor: function () {

                },

                activate: function () {
                    this._mrFactory = new MappingResourceFactory();
                    this.insertionNode = this.mapModel.getOperationalLayer();
                    this._nodes = [];
                },

                _handleResultSelection: function (evt) {
                    var item = evt && evt._properties && evt._properties.entries.result,
                        type = evt && evt._properties && evt._properties.entries.type;
                    if (item && type === "POISUGGEST") {
                        if (item.id) {

//                            var service = MappingResourceUtils.getServiceResource(this.mrr,
//                                this._mrFactory,
//                                "testpoi",
//                                ServiceTypes.POI);
//
//                            var store = new POIServerStore({
//                                target: service.serviceUrl,
//                                poiID:item.id
//                            });
//
//                            ct_when(store.query(),function(resp){
//
//                                debugger;
//
//                            },function(error){
//                                //TODO
//                            },this);

//                            var priority = MappingResourceUtils.getHighestRenderPriorityOfChildren(this.insertionNode) + 1;
//
//                            var serviceId = item.id + "_" + item.poitype + (new Date().getTime());
//                            this._nodes.push(serviceId);
//                            var serviceMapModelNode = MappingResourceUtils.addServiceMapModelNodeAt(0,
//                                service,
//                                item.title,
//                                this.insertionNode,
//                                serviceId,
//                                priority
//                            );
//
//                            var layerId = item.id + "_" + item.poitype + "_layer";
//                            MappingResourceUtils.addLayerAt(0, this.mrr, this._mrFactory, service, {
//                                    id: layerId,
//                                    title: "my poi"
//                                },
//                                type,
//                                serviceMapModelNode,
//                                {
//                                    poiID: item.id,
//                                    lookupTable: this.symbolTableProvier.get("symbolTable"),
//                                    lookupAttributeName: this.symbolTableProvier.get("lookupAttributeName")
//                                });
//
//                            this.mapModel.fireModelStructureChanged({
//                                source: this,
//                                action: this.CONTENT_MODEL_LAYER_ADD
//                            });
//
//                            this.mapState.centerAndZoomToScale(item.geometry, this.pointZoomScale);
                        }
                    }
                },

                _handleResultClear: function () {
                    d_array.forEach(this._nodes, function (n) {
                        this.mapModel.removeNodeById(n);
                    }, this);
                    this._nodes = [];
                    this.mapModel.fireModelStructureChanged({
                        source: this
                    });
                }
            }
        );
    }
);