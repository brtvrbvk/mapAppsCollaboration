define([
        "doh",
        "dojo/_base/Deferred",
        "dojo/io-query",
        "ct/array",
        "ct/mapping/map/MapModel",
        "ct/mapping/map/MapState",
        "ct/mapping/map/GraphicsLayerNode",
        "../GeometryRendererModifier",
        "../GeometryParameterResolver",
        "coordinatetransformer/CoordinateTransformer"
    ],
    function (
        doh,
        Deferred,
        d_ioq,
        ct_array,
        MapModel,
        MapState,
        GraphicsLayerNode,
        GeometryRendererModifier,
        GeometryParameterResolver,
        CoordinateTransformer
        ) {

        doh.register("agiv.bundles.drawing_agiv.GeometryParameterResolver Tests", [
            {
                name: "Test for encoding/decoding params - no params",
                setUp: function () {
                    this.mapModel = new MapModel();
                },
                runTest: function () {
                    var resolver = this.resolver = new GeometryParameterResolver();
                    resolver._isEsriMapLoaded = function () {
                        var def = new Deferred();
                        def.callback();
                    }
                    resolver._mapModel = this.mapModel;

                    // encode params
                    var url = resolver.encodeURLParameter();
                    var tmp = {
                        drawing: '[]'
                    };
                    doh.assertEqual(tmp, url, "Expected empty array");

                    // decode params
                    url = d_ioq.queryToObject('&drawing=' + tmp.drawing);
                    resolver.decodeURLParameter(url);
                    doh.assertEqual(0, resolver._mapModel.getGlassPaneLayer().children.length, "Expected 0");
                },
                tearDown: function () {
                    this.mapModel = null;
                    this.resolver = null;
                }
            },
            {
                name: "Test for encoding/decoding params",
                setUp: function () {
                    var mapModel = this.mapModel = new MapModel();
                    var g = new GraphicsLayerNode({
                        id: "drawingtoolsetNode123",
                        nodeType: "POINT",
                        graphics: [
                            {
                                geometry: {
                                    x: 519836.9424419109,
                                    y: 6645908.073111366,
                                    spatialReference: {
                                        wkid: 3857
                                    }
                                },
                                symbol: {
                                    color: [
                                        190,
                                        190,
                                        0,
                                        128
                                    ],
                                    size: 12,
                                    angle: 0,
                                    xoffset: 0,
                                    yoffset: 0,
                                    type: "esriSMS",
                                    style: "esriSMSCircle",
                                    outline: {
                                        color: [
                                            0,
                                            0,
                                            0,
                                            255
                                        ],
                                        width: 1,
                                        type: "esriSLS",
                                        style: "esriSLSSolid"
                                    }
                                },
                                attributes: {
                                    type: "DRAWING",
                                    nodeid: "drawingtoolsetNode123",
                                    //comment: "Test",
                                    id: 0,
                                    geometryType: "point",
                                    geometry: {
                                        x: 519836.9424419109,
                                        y: 6645908.073111366,
                                        spatialReference: {
                                            wkid: 3857
                                        }
                                    }
                                }
                            }
                        ]
                    });
                    mapModel.getGlassPaneLayer().addChild(g);
                    mapModel.fireModelStructureChanged({
                        source: this
                    });
                    var mapState = this.mapState = new MapState();
                    mapState.getExtent = function () {
                        return {
                            spatialReference: {
                                wkid: "3857"
                            }
                        }
                    }
                },
                runTest: function () {
                    var resolver = this.resolver = new GeometryParameterResolver();
                    resolver._isEsriMapLoaded = function () {
                        var def = new Deferred();
                        def.callback();
                    }
                    var mapModel = this.mapModel;
                    resolver._mapModel = mapModel;

                    // encode params
                    var url = resolver.encodeURLParameter();
                    var tmp = {
                        drawing: '[{"graphics":[{"geometry":{"x":519836.9424419109,"y":6645908.073111366},"symbol":{"color":[190,190,0,128],"size":12,"angle":0,"xoffset":0,"yoffset":0,"type":"esriSMS","style":"esriSMSCircle","outline":{"color":[0,0,0,255],"width":1,"type":"esriSLS","style":"esriSLSSolid"}},"attributes":{"type":"DRAWING","nodeid":"drawingtoolsetNode123","id":0,"geometryType":"point","geometry":{"x":519836.9424419109,"y":6645908.073111366,"spatialReference":{"wkid":3857}}}}],"wkid":3857,"id":"drawingtoolsetNode123","title":"","nodeType":"POINT"}]'
                    };
                    doh.assertEqual(tmp, url, "Expected same attributes");

                    mapModel.getGlassPaneLayer().removeChildren();
                    mapModel.fireModelStructureChanged({
                        source: this
                    });

                    // decode params
                    resolver._mapState = this.mapState;
                    resolver._coordinateTransformer = new CoordinateTransformer();
                    resolver._renderer = new GeometryRendererModifier();

                    url = d_ioq.queryToObject('&drawing=' + tmp.drawing);
                    resolver.decodeURLParameter(url);
                    doh.assertEqual(1, resolver._mapModel.getGlassPaneLayer().children.length, "Expected 1");
                    doh.assertNotEqual(-1, ct_array.arraySearchFirst(resolver._mapModel.getGlassPaneLayer().children,
                            {nodeType: "POINT"}).id.indexOf("drawingtoolsetNode"),
                        "Expected drawing layer");
                },
                tearDown: function () {
                    this.mapModel = null;
                    this.mapState = null;
                    this.resolver = null;
                }
            }
        ]);
    });