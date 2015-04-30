define([
        "doh",
        "dojo/_base/array",
        "dojo/io-query",
        "dojo/number",
        "ct/mapping/map/MapState",
        "ct/mapping/map/MapModel",
        "ct/mapping/map/ServiceNode",
        "ct/mapping/map/RasterLayerNode",
        "ct/mapping/map/CategoryNode",
        "ct/mapping/mapcontent/MappingResourceRegistryInitializer",
        "ct/array",
        "ct/_when",
        "ct/request",
        "ct/_url",
        "base/util/XMLUtils",
        "base/store/IdentifyConfigStore",
        "esri/geometry/Point",
        "esri/layers/WMSLayer",
        "../WMSFeatureInfoStore",
        "../AttributeConfigHelper"
    ],
    function (
        doh,
        d_array,
        d_ioq,
        d_number,
        MapState,
        MapModel,
        ServiceNode,
        RasterLayerNode,
        CategoryNode,
        MappingResourceRegistryInitializer,
        ct_array,
        ct_when,
        ct_request,
        ct_url,
        XMLUtils,
        IdentifyConfigStore,
        Point,
        WMSLayer,
        WMSFeatureInfoStore,
        AttributeConfigHelper
        ) {

        var mappingResourceRegistry = new MappingResourceRegistryInitializer().initFromData({
            "services": [
                {
                    "id": "anbitf",
                    "type": "WMS",
                    "url": "http://geo.agiv.be/ogc/wms/product/ANB",
                    "layers": [
                        {
                            "id": "Bos",
                            "title": "Bosreferentielaag 2000"
                        }
                    ]
                }
            ]
        });

        var service1 = new ServiceNode({
            id: "anbitf/Bos_386354039081",
            service: mappingResourceRegistry.getMappingResourceByUniqueId("anbitf"),
            children: [
                new RasterLayerNode({
                    id: "anbitf/Bos_386354039081/Bos",
                    layer: mappingResourceRegistry.getMappingResourceByUniqueId("anbitf/Bos")
                })
            ]
        });

        var cat1 = new CategoryNode({
            id: "1382437879394_1042365360298",
            enabled: true,
            renderPriority: 2
        });

        cat1.addChild(service1);

        doh.register("agiv.bundles.genericidentify.WMSFeatureInfoStore Tests", [
            {
                name: "Test for parsing application/vnd.esri.wms_featureinfo_xml stored locally",
                setUp: function () {
                    this.mapState = new MapState();
                    this.esriLayer = {};
                },
                runTest: function () {
                    var testDeferred = new doh.Deferred();

                    var storeId = "temporaryFeatureInfoStore_layer1";
                    var format = "application/vnd.esri.wms_featureinfo_xml";
                    var resultType = "xml";
                    var generalTypeMapping = {
                        extraInfo: [],
                        ignoreAttributes: "",
                        mapping: []
                    };
                    var appLayerTypeMapping = {
                        extraInfo: [],
                        ignoreAttributes: "",
                        mapping: []
                    };
                    var identifyConfigUrl = "/resources/identify/{id}.json";
                    var url = "http://geo.agiv.be/ogc/wms/product/ANB";

                    var identifyMappingStore = new IdentifyConfigStore();
                    var serviceId = "";
                    var layerId = "";
                    var configuredServices = [];
                    var areaAndLengthAttrNames = [];
                    this.store = new WMSFeatureInfoStore(storeId, this.mapState, this.esriLayer, format, resultType,
                        generalTypeMapping, appLayerTypeMapping, identifyConfigUrl,
                        identifyMappingStore, serviceId, layerId, url,
                        configuredServices, this._configHelper,
                        areaAndLengthAttrNames);

                    try {

                        ct_when(ct_request.request({
                            url: ct_url.resourceURL("genericidentify:tests/request_esri_wms_xml.xml"),
                            handleAs: resultType
                        }), function (response) {

                            try {
                                var featureInfo = XMLUtils.getTags("FeatureInfo", response);
                                var result = this.store._processSearchData_xml(response);
                                d_array.forEach(result, function (
                                    item,
                                    idx
                                    ) {
                                    var fields = XMLUtils.getTags("Field", featureInfo[idx]);
                                    var i = 0;
                                    for (var attr in item) {
                                        if (attr !== "ctID") {
                                            var fieldName = XMLUtils.getFirstTag("FieldName", fields[i]);
                                            var fieldNameText = XMLUtils.getTextContent(fieldName);
                                            doh.assertEqual(fieldNameText, attr, "Expected " + fieldNameText);
                                            var fieldValue = XMLUtils.getFirstTag("FieldValue", fields[i]);
                                            var fieldValueText = XMLUtils.getTextContent(fieldValue);
                                            doh.assertEqual(fieldValueText, item[attr],
                                                    "Expected " + fieldValueText);
                                            i++;
                                        }
                                    }
                                }, this);

                                var res = this.store._processItem(XMLUtils.getTags("Field", featureInfo[0]));
                                var tmp = {"OBJECTID": "29243", "UIDN": "189133", "OIDN": "36110", "BMS": "13", "BMSOMSCHR": "loofhout - populier", "ONT": "13", "ONTOMSCHR": "oud loofhout", "SLG": "3", "SLGOMSCHR": "meer dan 2/3", "BED": "2", "BEDOMSCHR": "hooghout", "NISCODE": "42003", "GEMEENTE": "Berlare", "POLNR": "66559", "KLASSE": "500", "KLASSEOMSCHR": "Bos", "SHAPE": "Null"};
                                for (var attr in res) {
                                    if (tmp[attr]) {
                                        doh.assertEqual(tmp[attr], res[attr], "Expected " + tmp[attr]);
                                    } else {
                                        doh.assertEqual(tmp[attr], undefined, "Expected undefined");
                                    }
                                }

                            } catch (error) {
                                testDeferred.reject(error);
                            }
                            testDeferred.callback(true);

                        }, function (error) {
                            testDeferred.reject(error);
                        }, this);

                    } catch (error) {
                        testDeferred.reject(error);
                    }
                    return testDeferred;
                },
                tearDown: function () {
                    this.mapState = null;
                    this.esriLayer = null;
                }
            },
            {
                name: "Test for parsing text/xml result stored locally",
                setUp: function () {
                    this.mapState = new MapState();
                    this.esriLayer = {};
                },
                runTest: function () {
                    var testDeferred = new doh.Deferred();

                    var storeId = "temporaryFeatureInfoStore_layer1";
                    var format = "text/xml";
                    var resultType = "xml";
                    var generalTypeMapping = {
                        extraInfo: [],
                        ignoreAttributes: "",
                        mapping: []
                    };
                    var appLayerTypeMapping = {
                        extraInfo: [],
                        ignoreAttributes: "",
                        mapping: []
                    };
                    var identifyConfigUrl = "/resources/identify/{id}.json";
                    var url = "http://nlbtest.agiv.be/ogc/wms/product/ANB";

                    var identifyMappingStore = new IdentifyConfigStore();
                    var serviceId = "";
                    var layerId = "";
                    var configuredServices = [];
                    var areaAndLengthAttrNames = [];
                    this.store = new WMSFeatureInfoStore(storeId, this.mapState, this.esriLayer, format, resultType,
                        generalTypeMapping, appLayerTypeMapping, identifyConfigUrl,
                        identifyMappingStore, serviceId, layerId, url,
                        configuredServices, this._configHelper,
                        areaAndLengthAttrNames);

                    try {

                        ct_when(ct_request.request({
                            url: ct_url.resourceURL("genericidentify:tests/request_text_xml.xml"),
                            handleAs: resultType
                        }), function (response) {

                            try {
                                var fields = XMLUtils.getTags("FIELDS", response);
                                var result = this.store._processSearchData_xml(response);
                                d_array.forEach(result, function (
                                    item,
                                    idx
                                    ) {
                                    var node = fields[idx].attributes;
                                    var i = 0;
                                    for (var attr in item) {
                                        if (attr !== "ctID") {
                                            var fieldNameText = node[i].nodeName;
                                            doh.assertEqual(fieldNameText, attr, "Expected " + fieldNameText);
                                            var fieldValueText = node[i].nodeValue;
                                            doh.assertEqual(fieldValueText, item[attr],
                                                    "Expected " + fieldValueText);
                                            i++;
                                        }
                                    }
                                }, this);

                                var res = this.store._processItem(fields[0].attributes);
                                var tmp = {"OBJECTID": "29243", "UIDN": "189133", "OIDN": "36110", "BMS": "13", "BMSOMSCHR": "loofhout - populier", "ONT": "13", "ONTOMSCHR": "oud loofhout", "SLG": "3", "SLGOMSCHR": "meer dan 2/3", "BED": "2", "BEDOMSCHR": "hooghout", "NISCODE": "42003", "GEMEENTE": "Berlare", "POLNR": "66559", "KLASSE": "500", "KLASSEOMSCHR": "Bos", "SHAPE": "Null"};
                                for (var attr in res) {
                                    if (tmp[attr]) {
                                        doh.assertEqual(tmp[attr], res[attr], "Expected " + tmp[attr]);
                                    } else {
                                        doh.assertEqual(tmp[attr], undefined, "Expected undefined");
                                    }
                                }

                            } catch (error) {
                                testDeferred.reject(error);
                            }
                            testDeferred.callback(true);

                        }, function (error) {
                            testDeferred.reject(error);
                        }, this);

                    } catch (error) {
                        testDeferred.reject(error);
                    }
                    return testDeferred;
                },
                tearDown: function () {
                    this.mapState = null;
                    this.esriLayer = null;
                }
            },
            {
                name: "Test for parsing erroneous xml result stored locally",
                setUp: function () {
                    this.mapState = new MapState();
                    this.esriLayer = {};
                },
                runTest: function () {
                    var testDeferred = new doh.Deferred();

                    var storeId = "temporaryFeatureInfoStore_layer1";
                    var format = "text/xml";
                    var resultType = "xml";
                    var generalTypeMapping = {
                        extraInfo: [],
                        ignoreAttributes: "",
                        mapping: []
                    };
                    var appLayerTypeMapping = {
                        extraInfo: [],
                        ignoreAttributes: "",
                        mapping: []
                    };
                    var identifyConfigUrl = "/resources/identify/{id}.json";
                    var url = "http://nlbtest.agiv.be/ogc/wms/product/ANB";

                    var identifyMappingStore = new IdentifyConfigStore();
                    var serviceId = "";
                    var layerId = "";
                    var configuredServices = [];
                    var areaAndLengthAttrNames = [];
                    this.store = new WMSFeatureInfoStore(storeId, this.mapState, this.esriLayer, format, resultType,
                        generalTypeMapping, appLayerTypeMapping, identifyConfigUrl,
                        identifyMappingStore, serviceId, layerId, url,
                        configuredServices, this._configHelper,
                        areaAndLengthAttrNames);

                    try {

                        ct_when(ct_request.request({
                            url: ct_url.resourceURL("genericidentify:tests/request_text_xml_wrong.xml"),
                            handleAs: resultType
                        }), function (response) {

                            try {
                                var fields = XMLUtils.getTags("FIELDS", response);
                                var result = this.store._processSearchData_xml(response);
                                var item = result[0];
                                for (var attr in item) {
                                    if (attr !== "ctID") {
                                        doh.assertNotEqual("Test", attr, "Expected Test");
                                        doh.assertNotEqual(12345, item[attr], "Expected 12345");
                                    }
                                }

                                var res = this.store._processItem(fields[0].attributes);
                                var tmp = {"OBJECTID": "29243", "UIDN": "189133", "OIDN": "36110", "BMS": "13", "BMSOMSCHR": "loofhout - populier", "ONT": "13", "ONTOMSCHR": "oud loofhout", "SLG": "3", "SLGOMSCHR": "meer dan 2/3", "BED": "2", "BEDOMSCHR": "hooghout", "NISCODE": "42003", "GEMEENTE": "Berlare", "POLNR": "66559", "KLASSE": "500", "KLASSEOMSCHR": "Bos", "SHAPE": "Null"};
                                for (var attr in res) {
                                    if (tmp[attr]) {
                                        doh.assertEqual(tmp[attr], res[attr], "Expected " + tmp[attr]);
                                    } else {
                                        doh.assertEqual(tmp[attr], undefined, "Expected undefined");
                                    }
                                }

                            } catch (error) {
                                testDeferred.reject(error);
                            }
                            testDeferred.callback(true);

                        }, function (error) {
                            testDeferred.reject(error);
                        }, this);

                    } catch (error) {
                        testDeferred.reject(error);
                    }
                    return testDeferred;
                },
                tearDown: function () {
                    this.mapState = null;
                    this.esriLayer = null;
                }
            },
            {
                name: "Test for parsing xml result stored locally using WMSFeatureInfoStore",
                setUp: function () {
                    var mapState = this.mapState = new MapState();
                    mapState.getViewPort = function () {
                        return {
                            getGeo: function () {
                                return {
                                    spatialReference: {
                                        wkid: 3857
                                    },
                                    type: "extent",
                                    xmax: 763518.1886149356,
                                    xmin: 176481.8113850644,
                                    ymax: 6786857.953269162,
                                    ymin: 6488142.046730838
                                }
                            },
                            getScreen: function () {
                                return {
                                    type: "extent",
                                    xmax: 1920,
                                    xmin: 0,
                                    ymax: 977,
                                    ymin: 0,
                                    getWidth: function () {
                                        return Math.abs(this.xmax - this.xmin);
                                    },
                                    getHeight: function () {
                                        return Math.abs(this.ymax - this.ymin);
                                    }
                                }
                            },
                            toScreen: function (point) {
                                return {
                                    type: "point",
                                    x: 874,
                                    y: 520
                                }
                            }
                        }
                    }

                    var mapModel = this.mapModel = new MapModel();
                    mapModel.getOperationalLayer().addChild(cat1);
                    mapModel.fireModelStructureChanged({
                        source: this
                    });

                    this.esriLayer = {
                        visibleLayers: ["Bos"],
                        getLayerInfo: function (
                            name,
                            rootLayer
                            ) {
                            if (rootLayer && rootLayer.name && rootLayer.name === name) {
                                return rootLayer;
                            }
                            var sublayers = rootLayer ? rootLayer.subLayers : this.layerInfos,
                                matchLayer,
                                found = d_array.some(sublayers, function (l) {
                                    matchLayer = this.getLayerInfo(name, l);
                                    return matchLayer;
                                }, this);
                            if (found) {
                                return matchLayer;
                            }
                            return null;
                        },
                        infoFormat: [
                            "application/vnd.esri.wms_raw_xml",
                            "application/vnd.esri.wms_featureinfo_xml",
                            "application/vnd.ogc.wms_xml",
                            "text/xml",
                            "text/html",
                            "text/plain"
                        ],
                        infoFeatureCount: 10,
                        version: "1.3.0",
                        _useLatLong: function () {
                            return true;
                        },
                        getMapURL: ct_url.resourceURL("genericidentify:tests/request_text_xml.xml"),
                        styles: [],
                        imageFormat: "image/png",
                        getImageUrl: function (
                            extent,
                            width,
                            height,
                            callback
                            ) {
                            var that = this;
                            var oldGetImageUrl = WMSLayer.prototype.getImageUrl;
                            oldGetImageUrl.apply(this, [
                                extent,
                                width,
                                height,
                                function (imageUrl) {
                                    if (that.styles.length == 0 || that.styles.length != that.visibleLayers.length) {
                                        // found correct style names, if not directly defined by the "styles" property
                                        that.styles = [];
                                        for (var i = 0; i < that.visibleLayers.length; ++i) {
                                            var l = that.getLayerInfo(that.visibleLayers[i]);
                                            that.styles[that.styles.length] = l ? l.styles[0].name : "";
                                        }
                                    }
                                    var stylesStr = that.styles.join(",");
                                    // add styles to url
                                    imageUrl = imageUrl.replace(/(STYLES=)[^&]*&/i, "$1" + stylesStr + "&");
                                    // remove next line if org wms handles it correct
                                    //PATCHED
                                    //imageUrl = ct_request.getProxiedUrl(imageUrl);
                                    console.debug('GetMap ---->> ' + imageUrl);
                                    callback(imageUrl);
                                }
                            ]);
                        },
                        getFeatureInfoUrl: function (
                            pixPoint,
                            extent,
                            width,
                            height,
                            layerIds,
                            format
                            ) {
                            var infoLayers = this.infoLayers && this.infoLayers.length > 0 ? this.infoLayers : this.visibleLayers;
                            // check if all queryable
                            infoLayers = d_array.filter(infoLayers, function (name) {
                                var l = this.getLayerInfo(name);
                                // if layer info not found, accept it
                                return !l || l.queryable;
                            }, this);
                            if (infoLayers.length == 0) {
                                // TODO: what if no layer is queryable ?
                                throw new Error("no wms layer is queryable!");
                            }

                            // filter layer ids if set
                            layerIds = layerIds || [];
                            if (layerIds.length) {
                                infoLayers = d_array.filter(infoLayers, function (name) {
                                    return d_array.indexOf(layerIds, name) >= 0;
                                }, this);
                            }

                            if (infoLayers.length == 0) {
                                throw new Error("WMS layer(s) '" + layerIds.join(",") + "' not found!");
                            }
                            format = format ? format : "text/html";
                            var selFormat = ct_array.arraySearchFirst(this.infoFormat, format);
                            if (!selFormat) {
                                throw new Error("WMS does not support '" + format + "' format for getFeatureInfo operation! Supported types are: " + this.infoFormat.join(", "));
                            }

                            var featureCount = this.infoFeatureCount ? this.infoFeatureCount : 10,
                                additionalParams = {
                                    INFO_FORMAT: selFormat,
                                    QUERY_LAYERS: infoLayers.join(','),
                                    FEATURE_COUNT: featureCount
                                },
                                xParam = 'X',
                                yParam = 'Y';
                            if (this.version === '1.3.0') {
                                xParam = 'I';
                                yParam = 'J';
                            }
                            // here we uning dojo round because of error in some browsers, were pixpoint is not an int!
                            additionalParams[xParam] = d_number.round(pixPoint.x, 0);
                            additionalParams[yParam] = d_number.round(pixPoint.y, 0);

                            var additionalQueryPart = d_ioq.objectToQuery(additionalParams);

                            var url;
                            this.getImageUrl(extent, width, height, function (imageUrl) {
                                var featureUrl = imageUrl.replace(/(REQUEST=)[^&]*&/i, "$1GetFeatureInfo&");
                                featureUrl = featureUrl.concat('&').concat(additionalQueryPart);
                                console.debug('GetFeatureInfo ---->> ' + featureUrl);
                                url = featureUrl;
                            });
                            return url;
                        }
                    };

                    this._configHelper = new AttributeConfigHelper();
                },
                runTest: function () {
                    var testDeferred = new doh.Deferred();

                    var layerNode = this.mapModel.getNodeById("anbitf/Bos_386354039081").children[0];
                    var storeId = "temporaryFeatureInfoStore_" + layerNode.get("id");

                    var format = "text/xml";
                    var resultType = "xml";
                    var generalTypeMapping = {
                        extraInfo: [],
                        ignoreAttributes: "",
                        mapping: []
                    };
                    var appLayerTypeMapping = {
                        extraInfo: [],
                        ignoreAttributes: "",
                        mapping: []
                    };
                    var identifyConfigUrl = "/resources/identify/anbitf_Bos.json";
                    var url = ct_url.resourceURL("genericidentify:tests/request_text_xml.xml");

                    var identifyMappingStore = new IdentifyConfigStore();
                    var serviceId = "";
                    var layerId = "";
                    var configuredServices = [];
                    var areaAndLengthAttrNames = [];

                    this.store = new WMSFeatureInfoStore(storeId, this.mapState, this.esriLayer, format, resultType,
                        generalTypeMapping, appLayerTypeMapping, identifyConfigUrl,
                        identifyMappingStore, serviceId, layerId, url,
                        configuredServices, this._configHelper,
                        areaAndLengthAttrNames);
                    this.store.queryLayers = ["Bos"];

                    var query = {
                        geometry: {
                            $intersects: {
                                spatialReference: {},
                                type: "extent",
                                xmax: 492166.7382026904,
                                xmin: 490637.9976369876,
                                ymax: 6581853.843408418,
                                ymin: 6580325.102842716,
                                getCenter: function () {
                                    return new Point((this.xmin + this.xmax) / 2, (this.ymin + this.ymax) / 2,
                                        this.spatialReference);
                                }
                            }
                        }
                    };
                    var opts = {
                        count: 15,
                        fields: {
                            geometry: false
                        },
                        maxmodel: true,
                        queryRadius: 200
                    };

                    try {
                        ct_when(this.store.query(query, opts), function (result) {

                            try {
                                if (!result.error) {
                                    doh.assertEqual(10, result.length, "Expected 10");

                                    var res = result[0];
                                    doh.assertEqual("29243", res["OBJECTID"], "Expected 29243");
                                    doh.assertEqual("189133", res["UIDN"], "Expected 189133");
                                    doh.assertEqual("Berlare", res["GEMEENTE"], "Expected Berlare");
                                }
                            } catch (error) {
                                testDeferred.reject(error);
                            }
                            testDeferred.callback(true);

                        }, function (error) {
                            testDeferred.reject(error);
                        }, this);

                    } catch (error) {
                        testDeferred.reject(error);
                    }
                    return testDeferred;
                },
                tearDown: function () {
                    this.mapState = null;
                }
            },
            {
                name: "Test for parsing application/json result stored locally",
                setUp: function () {
                    this.mapState = new MapState();
                    this.esriLayer = {};
                },
                runTest: function () {
                    var testDeferred = new doh.Deferred();

                    var storeId = "temporaryFeatureInfoStore_layer1";
                    var format = "application/json";
                    var resultType = "json";
                    var generalTypeMapping = {
                        extraInfo: [],
                        ignoreAttributes: "",
                        mapping: []
                    };
                    var appLayerTypeMapping = {
                        extraInfo: [],
                        ignoreAttributes: "",
                        mapping: []
                    };
                    var identifyConfigUrl = "/resources/identify/{id}.json";
                    var url = "https://www.mercator.vlaanderen.be/raadpleegdienstenmercatorpubliek/lu/lu_wug/wms";

                    var identifyMappingStore = new IdentifyConfigStore();
                    var serviceId = "";
                    var layerId = "";
                    var configuredServices = [];
                    var areaAndLengthAttrNames = [];

                    this.store = new WMSFeatureInfoStore(storeId, this.mapState, this.esriLayer, format, resultType,
                        generalTypeMapping, appLayerTypeMapping, identifyConfigUrl,
                        identifyMappingStore, serviceId, layerId, url,
                        configuredServices, this._configHelper,
                        areaAndLengthAttrNames);

                    try {

                        ct_when(ct_request.request({
                            url: ct_url.resourceURL("genericidentify:tests/request_application_json.json"),
                            handleAs: resultType
                        }), function (response) {

                            try {
                                var features = response.features;
                                var result = this.store._processSearchData_json(response);
                                d_array.forEach(result, function (
                                    item,
                                    idx
                                    ) {
                                    var props = features[idx].properties;
                                    for (var attr in item) {
                                        if (attr !== "ctID") {
                                            var fieldValueText = props[attr];
                                            doh.assertEqual(fieldValueText, item[attr],
                                                    "Expected " + fieldValueText);
                                        }
                                    }
                                }, this);

                                var res = this.store._processItemJSON(features[0].properties);
                                var tmp = {"TERREIN": "Centrum 2/6", "GEMEENTE": "Destelbergen", "TerID": 441250, "NISCODE": "44013", "Ontwikkeld": "Ja", "Laagste_kavelprijs": null, "Hoogste_kavelprijs": null, "Memoveld": null, "Beschikbare_kavels": null};
                                for (var attr in res) {
                                    if (tmp[attr]) {
                                        doh.assertEqual(tmp[attr], res[attr], "Expected " + tmp[attr]);
                                    } else {
                                        doh.assertEqual(tmp[attr], undefined, "Expected undefined");
                                    }
                                }

                            } catch (error) {
                                testDeferred.reject(error);
                            }
                            testDeferred.callback(true);

                        }, function (error) {
                            testDeferred.reject(error);
                        }, this);

                    } catch (error) {
                        testDeferred.reject(error);
                    }
                    return testDeferred;
                },
                tearDown: function () {
                    this.mapState = null;
                    this.esriLayer = null;
                }
            }
        ]);
    });