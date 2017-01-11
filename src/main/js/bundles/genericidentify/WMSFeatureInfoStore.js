define([
        "dojo/_base/declare",
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
        "ct/_when",
        "ct/array",
        "ct/_string",
        "base/util/XMLUtils"
    ],
    function (
        declare,
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
        ct_when,
        ct_array,
        ct_string,
        XMLUtils
        ) {
        /*
         * COPYRIGHT 2012 con terra GmbH Germany
         */
        /**
         * @fileOverview This file provides the means to perform feature info requests for WMS services.
         */
        return declare([],
            /**
             * @lends ct.bundles.featureinfo.WMSFeatureInfoStore.prototype
             */
            {
                id: null,
                /**
                 * QUERY_LAYERS
                 */
                queryLayers: null,
                serviceId: null,

                idProperty: "ctID",

                supportedSpatialOperators: {
                    "$envelopeintersects": true,
                    "$intersects": true,
                    "$contains": true,
                    "$within": true
                },

                _mapState: null,

                constructor: function (
                    storeId,
                    mapState,
                    esriLayer,
                    format,
                    resultType,
                    generalTypeMapping,
                    appLayerTypeMapping,
                    identifyConfigUrl,
                    identifyMappingStore,
                    serviceId,
                    layerId,
                    url,
                    configuredServices,
                    configHelper,
                    areaAndLengthAttrNames
                    ) {
                    this._mapState = mapState;
                    this.queryLayers = [];
                    this.id = storeId;
                    this.esriLayer = esriLayer;
                    this.format = format || "text/xml";
                    this.generalTypeMapping = generalTypeMapping;
                    this.appLayerTypeMapping = appLayerTypeMapping;
                    this.identifyConfigUrl = identifyConfigUrl;
                    this.identifyMappingStore = identifyMappingStore;
                    this.serviceId = serviceId;
                    this.layerId = layerId;
                    this.idCounter = 0;
                    this.serviceUrl = url;
                    this.resultType = resultType;
                    this.configuredServices = configuredServices;
                    this.configHelper = configHelper;
                    this.areaAndLengthAttrNames = areaAndLengthAttrNames;
                },

                getLastQueryUrl: function () {

                    return this._lastQueryUrl;

                },

                query: function (
                    query,
                    queryOptions
                    ) {
                    var geom = this._getGeometryFromQuery(query,
                        queryOptions);
                    if (geom.type && geom.type === "extent") {
                        geom = geom.getCenter();
                    }
                    var props = this._props = {
                        geoExtent: this._mapState.getViewPort().getGeo(),
                        screenPoint: this._toScreen(geom),
                        width: this._getScreenWidth(),
                        height: this._getScreenHeight()
                    };
                    var layerList = this.queryLayers;
                    var requestUrl;
                    try {
                        if (this.esriLayer) {
                            requestUrl = this.esriLayer.getFeatureInfoUrl(props.screenPoint,
                                props.geoExtent,
                                props.width,
                                props.height,
                                layerList,
                                this.format);
                        } else {
                            requestUrl = this.getFeatureInfoUrl(props.screenPoint,
                                props.geoExtent,
                                props.width,
                                props.height,
                                layerList,
                                this.format,
                                this.serviceUrl);
                        }
                    } catch (e) {
                        return new QueryResults([]);
                    }

                    this._hasOtherAttributes = false;
                    var d = new Deferred();
                    this._lastQueryUrl = requestUrl;
                    ct_when(this._getResult(requestUrl, []),
                        function (result) {
                            if (result.error) {
                                d.reject(result);
                                return;
                            }
                            if (result.length > 0) {
                                // check if there are attributes from other services defined
                                var otherConfig = this.configHelper.getMergedOtherAttributes(this.generalTypeMapping,
                                    this.layerTypeMapping);
                                if (otherConfig.mapping.length > 0) {
                                    var mapping = otherConfig.mapping;
                                    this._hasOtherAttributes = true;
                                    ct_when(this._getResultFromOtherServices(mapping),
                                        function (resultFromAnotherService) {
                                            d.resolve(this._mergeResult(mapping,
                                                result,
                                                resultFromAnotherService));
                                        }, this);
                                } else {
                                    d.resolve(result);
                                }
                            } else {
                                d.resolve(result);
                            }
                        }, this);
                    return new QueryResults(d);
                },

                _getResult: function (
                    requestUrl,
                    otherAttributes
                    ) {
                    var d = new Deferred();
                    ct_when(ct_request.request({
                        url: requestUrl,
                        handleAs: this.resultType
                    }), function (response) {
                        if (response) {
                            ct_when(this._getLayerTypeMapping(),
                                function (resp) {
                                    // merge app config and config from database
                                    var mapping;
                                    if (resp && resp.error) {
                                        console.log("WMSFeatureInfoStore: Error getting layer type mapping: ",
                                            resp.error);
                                    } else {
                                        mapping = resp;
                                    }
                                    this.layerTypeMapping = this.configHelper.mergeAttributes(this.appLayerTypeMapping,
                                        mapping);
                                    var result = this["_processSearchData_" + this.resultType](response,
                                        otherAttributes);
                                    d.resolve(result);
                                }, this);
                        } else {
                            d.resolve([]);
                        }
                    }, function (error) {
                        return d.resolve({
                            error: error
                        });
                    }, this);
                    return d;
                },

                _getResultFromOtherServices: function (mapping) {
                    var resultList = [];
                    d_array.forEach(mapping, function (item) {
                        var d = new Deferred();
                        try {

                            var splitIds = item.id.split("/");
                            var layerList = splitIds.splice(1, 1);
                            var serviceUrl = "";
                            var infoformat=null;
//BartVerbeeck Bug32185                             
                            var serviceQuerystring = ";"
                            d_array.some(this.configuredServices,
                                function (service) {
                                    if (service.item.getLocalId() === splitIds[0]) {
                                        serviceUrl = service.serviceUrl;
                                        serviceQuerystring = service.serviceQuerystring;
//BartVerbeeck Bug32185 
if(serviceQuerystring){
    var pairs = serviceQuerystring.slice(0).split('&');
    var result = {};
    pairs.forEach(function(pair) {
            pair = pair.split('=');
            result[pair[0]] = decodeURIComponent(pair[1] || '');
    });
    infoformat = JSON.parse(JSON.stringify(result));
}else
    infoformat=null;
                                        return true;
                                    }
                                });
//BartVerbeeck Bug32185                                
                            if(infoformat && infoformat.info_format){
                                this.format=infoformat.info_format;
                                if (this.format == "application/json") {
                                    this.resultType = "json";
                                }
                                if (this.format == "text/html") {
                                    this.resultType = "text";
                                }
                                if (this.format == "text/plain") {
                                    this.resultType = "text";
                                }
                            }
                            var props = this._props;
                            var url = this.getFeatureInfoUrl(props.screenPoint,
                                props.geoExtent,
                                props.width,
                                props.height,
                                layerList,
                                this.format,
                                serviceUrl
                                );
                            ct_when(this._getResult(url, item),
                                function (result) {
                                    if (result.error) {
                                        d.reject(result);
                                        return;
                                    }
                                    if (result.length > 0) {
                                        // only get the first result
                                        result[0].configId = item.id;
                                        d.resolve(result[0]);
                                    } else {
                                        d.resolve({});
                                    }
                                }, this);
                            resultList.push(d);
                        } catch (error) {
                            d.reject({
                                error: error
                            });
                        }
                    }, this);
                    return new DeferredList(resultList);
                },

                _mergeResult: function (
                    mapping,
                    result,
                    otherResult
                    ) {
                    d_array.forEach(otherResult, function (item) {
                        if (item[0]) {
                            var config = ct_array.arraySearchFirst(mapping,
                                {
                                    id: item[1].configId
                                });
                            if (config) {
                                // merge only the required attributes
                                var attributeNames = config.attributes;
                                d_array.forEach(attributeNames,
                                    function (attr) {
                                        d_array.forEach(result,
                                            function (res) {
                                                res[attr] = item[1][attr];
                                            });
                                    }, this);
                            }
                        } else {
                            result = item[1];
                        }
                    }, this);
                    return result;
                },

                _getLayerTypeMapping: function () {
                    var d = new Deferred();
                    // internal services
                    if (this.identifyConfigUrl) {
                        ct_when(ct_request.requestJSON({
                                url: this.identifyConfigUrl
                            }),
                            function (mapping) {
                                d.resolve(mapping);
                            }, function (err) {
                                d.resolve({error: err});
                            }, this);
                    } else if (this.serviceId && this.layerId && this.serviceId.indexOf("http:__") === -1) { // see loadServiceController
                        // external services and services with no configured layermapping in themepanel
                        ct_when(this.identifyMappingStore.query({service: this.serviceId, layer: this.layerId, defaultMapping: true},
                                {}),
                            function (resp) {
                                d.resolve(resp[0]); // use the first config
                            }, function (err) {
                                d.resolve({error: err});
                            }, this);
                    } else {
                        // no layerTypeMapping available
                        d.resolve();
                    }
                    return d;
                },

                _processSearchData_json: function (
                    data,
                    otherAttributes
                    ) {
                    var lRet = [];
                    var features = data.features;
                    if (features && features.length > 0) {
                        d_array.forEach(features, function (feature) {
                            var obj = this._processItemJSON(feature.properties,
                                otherAttributes);
                            lRet.push(obj);
                        }, this);
                    }
                    this._sortMetadata();
                    return lRet;
                },

                _processSearchData_text: function (data) {
                    return [data];
                },

                _parseExceptionsXML: function (data) {

                    var exceptions = XMLUtils.getTags("ServiceException ", data),
                        error;
                    d_array.forEach(exceptions, function (e) {
                        var text = XMLUtils.getTextContent(e);
                        if (text.indexOf("width") > -1 || text.indexOf("height") > -1) {
                            error = {error: "Invalid screensize", type: "SCREENSIZE"};
                        }
                    }, this);

                    return error;

                },

                _processSearchData_xml: function (
                    data,
                    otherAttributes
                    ) {
                    var lRet = [];
                    var items;
                    var error = this._parseExceptionsXML(data);
                    if (error) {
                        return error;
                    }
                    // text/xml has different output xml format
                    if (this.format === "text/xml") {
                        items = XMLUtils.getTags("FIELDS", data);
                        d_array.forEach(items, function (item) {
                            var fields = item.attributes;
                            if (fields && fields.length > 0) {
                                var obj = this._processItem(fields,
                                    otherAttributes);
                                lRet.push(obj);
                            }
                        }, this);
                    } else {
                        items = XMLUtils.getTags("FeatureInfo", data);
                        d_array.forEach(items, function (item) {
                            var fields = XMLUtils.getTags("Field",
                                item);
                            if (fields && fields.length > 0) {
                                var obj = this._processItem(fields,
                                    otherAttributes);
                                lRet.push(obj);
                            }
                        }, this);
                    }
                    this._sortMetadata();
                    return lRet;
                },

                _processItem: function (
                    fields,
                    otherAttributes
                    ) {
                    var obj = {};
                    d_array.forEach(fields, function (field) {
                        var fieldNameText, val;
                        if (this.format === "text/xml") {
                            fieldNameText = field.nodeName;
                            val = field.nodeValue;
                        } else {
                            var fieldName = XMLUtils.getFirstTag("FieldName",
                                field);
                            fieldNameText = XMLUtils.getTextContent(fieldName);
                            var fieldValue = XMLUtils.getFirstTag("FieldValue",
                                field);
                            val = XMLUtils.getTextContent(fieldValue);
                        }
                        var fieldValueText = this._findValueMapping(fieldNameText,
                            val);

                        var effectiveMapping = this._getEffectiveMappingForField(fieldNameText);
                        if (!effectiveMapping || !effectiveMapping.hideFieldWhenBlank || !this._isValueBlank(fieldValueText)) {
                            this._addFieldToMetadata(fieldNameText, otherAttributes);
                        }

                        //"." in strings are problematic
                        if (fieldNameText.indexOf(".") > -1) {
                            fieldNameText = fieldNameText.replace(".",
                                "#");
                        }
                        obj[fieldNameText] = fieldValueText;
                    }, this);
                    obj = this._addExtraInfoToMetadata(obj);
                    obj[this.idProperty] = this.idCounter++ + "";
                    return obj;
                },

                _isValueBlank: function (fieldValue) {
                    // BartVerbeeck : let null be null or not
                    return fieldValue === null || fieldValue === undefined || d_lang.trim(fieldValue) === "" || fieldValue.toLowerCase() === "null";
                },

                _processItemJSON: function (
                    fields,
                    otherAttributes
                    ) {
                    var hasNoAttributes = true;
                    var obj = {};
                    for (var attr in fields) {
                        var fieldNameText = attr;
                        var fieldValueText = this._findValueMapping(fieldNameText,
                            fields[attr]);

                        var effectiveMapping = this._getEffectiveMappingForField(fieldNameText);
                        if (!effectiveMapping || !effectiveMapping.hideFieldWhenBlank || !this._isValueBlank(fieldValueText)) {
                            this._addFieldToMetadata(fieldNameText, otherAttributes);
                        }

                        //"." in strings are problematic
                        if (fieldNameText.indexOf(".") > -1) {
                            fieldNameText = fieldNameText.replace(".",
                                "#");
                        }
                        obj[fieldNameText] = fieldValueText;
                        hasNoAttributes = false;
                    }
                    if (!hasNoAttributes) {
                        obj = this._addExtraInfoToMetadata(obj);
                        obj[this.idProperty] = this.idCounter++ + "";
                    } else {
                        obj.hasNoAttributes = hasNoAttributes;
                    }
                    return obj;
                },

                _formatNumber: function (
                    field,
                    value
                    ) {
                    if (ct_array.arrayFirstIndexOf(this.areaAndLengthAttrNames,
                        field) > -1) {
//BartVerbeeck Bug35988                            
                        value = value.toString().replace(",", ".");
                        return d_number.format(Number(value), {
                            places: 2
                        }).replace(/\./g, " ");
                    }
                    return value;
                },
//BartVerbeeck Bug32722 
                _formatHyperlinkedItemOld: function (value) {
                    if (value && value.match) {
                        // simple test for email address
                        
                        if (value.match(/\S*@\S*/)) {
                            value = "<a href='mailto:" + value + "'>" + value + "</a>";
                        } else
                        // simple test for website
                        if (value.match(/www/)) {
                            value = "<a href='" + value + "' target='_blank'>" + value + "</a>";
                        } else
                            if (value.match(/http/)) {
                                value = "<a href='" + value + "' target='_blank'>" + value + "</a>";
                        }
                    
                    }
                    return value;
                },
 //BartVerbeeck Bug32722               
                _formatHyperlinkedItem: function (value) {
                    if(value && value.replace){
                        value=value.replace(":443","");
                        value=value.replace(":80","");
                    }
                    if (value && value.match) {
                        // simple test for email address
                        
                        if (value.match(/^([a-z0-9_\.-]+)@([\da-z\.-]+)\.([a-z\.]{2,6})$/)) {
                            value = "<a href='mailto:" + value + "'>" + value + "</a>";
                        } else
                        // simple test for website
//BartVerbeeck Bug32722 split toegevoegd                            
                        if (value.split('?')[0].split('#')[0].match(/^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/)) {
                            value = "<a href='" + value + "' target='_blank'>" + value + "</a>";
                        } 
//BartVerbeeck Bug51733 split toegevoegd                          
                        else {
                            if (value.split('?')[0].split('#')[0].match(/^(https?):\/\/([A-Z\d\.-]{2,})\.([A-Z]{2,})(:\d{2,4})?/)) {
                                value = "<a href='" + value + "' target='_blank'>" + value + "</a>";
                            }
                        }
                    
                    }
                    return value;
                },

                _sortMetadata: function () {
                    if (this.metadata && this.metadata.fields) {
                        this.metadata.fields = ct_array.arraySort(this.metadata.fields,
                            this.__renderPriorityComparator);
                    }
                },

                get: function () {
                },

                getIdProperty: function () {
                    return this.idProperty;
                },

                getIdentity: function (object) {
                    return object[this.idProperty];
                },

                _getEffectiveMappingForField: function (fieldName) {
                    var layerMapping = this.layerTypeMapping;
                    var generalMapping = this.generalTypeMapping;
                    var layerFieldMapping, generalFieldMapping;
                    if (layerMapping) {
                        layerFieldMapping = this._getFieldMappingFromMappingList(layerMapping.mapping, fieldName);
                    }
                    if (generalMapping) {
                        generalFieldMapping = this._getFieldMappingFromMappingList(generalMapping.mapping, fieldName);
                    }
                    return layerFieldMapping || generalFieldMapping;
                },

                _getFieldMappingFromMappingList: function (
                    mappingList,
                    fieldName
                    ) {
                    if (mappingList && mappingList.length > 0) {
                        for (var i = 0; i < mappingList.length; i++) {
                            if (mappingList[i].attributeName === fieldName) {
                                return mappingList[i];
                            }
                        }
                    } else {
                        return [];
                    }

                },

                _addFieldToMetadata: function (
                    field,
                    otherAttributes
                    ) {
                    if (!this.metadata || !this.metadata.fields) {
                        this.metadata = {
                            fields: []
                        };
                    }

                    var layerMapping = this.layerTypeMapping;
                    if (layerMapping && layerMapping.ignoreAttributes) {
                        var ignoreAttributes = layerMapping.ignoreAttributes.split(";");
                        if (ignoreAttributes && ignoreAttributes.length && ct_array.arrayFirstIndexOf(ignoreAttributes,
                            field) > -1) {
                            return;
                        }
                    }

                    var generalMapping = this.generalTypeMapping;
                    if (generalMapping && generalMapping.ignoreAttributes) {
                        var generalIgnoreAttributes = generalMapping.ignoreAttributes.split(";");
                        if (generalIgnoreAttributes && generalIgnoreAttributes.length && ct_array.arrayFirstIndexOf(generalIgnoreAttributes,
                            field) > -1) {
                            return;
                        }
                    }

                    var obj;
                    if (!this._hasOtherAttributes || this._hasOtherAttributes && otherAttributes && ct_array.arraySearchFirst(otherAttributes.attributes,
                        field)) {
                        obj = this._findTitleMapping(field);
                    }

                    if (obj) {
                        //"." in strings are problematic
                        if (field.indexOf(".") > -1) {
                            field = field.replace(".", "#");
                        }
                        var index = ct_array.arrayFirstIndexOf(this.metadata.fields,
                            {
                                name: field
                            });
                        if (index > -1) {
                            return;
                        }
                        var newField = {
                            name: field,
                            length: 10,
                            title: obj.title,
                            order: obj.index,
                            type: "string"
                        };
                        this.metadata.fields.push(newField);
                    }
                },

                _findTitleMapping: function (field) {
                    var title = field;
                    var index = 100;

                    var generalMapping = this.generalTypeMapping;
                    if (generalMapping && generalMapping.mapping && generalMapping.mapping.length) {
                        d_array.some(generalMapping.mapping,
                            function (item) {
                                if (item.attributeName === field && item.displayName !== "") {
                                    title = item.displayName;
                                    return true;
                                }
                            });
                    }

                    var layerMapping = this.layerTypeMapping;
                    if (layerMapping && layerMapping.mapping && layerMapping.mapping.length) {
                        d_array.some(layerMapping.mapping,
                            function (item) {
                                if (item.attributeName === field) {
                                    if (item.displayName !== "") {
                                        title = item.displayName;
                                    }
                                    index = item.index;
                                    return true;
                                }
                            });
                    }
                    return {
                        title: title,
                        index: index
                    };
                },

                _findValueMapping: function (
                    field,
                    value
                    ) {
                    var result = value;

                    result = this._applyValueMapping(this.generalTypeMapping, field, value) || result;
                    result = this._applyValueMapping(this.layerTypeMapping, field, value) || result;

                    result = this._formatNumber(field, result);
                    result = this._formatHyperlinkedItem(result);
                    return result;
                },

                _applyValueMapping: function (
                    mapping,
                    field,
                    value
                    ) {
                    var result;
                    if (mapping && mapping.mapping && mapping.mapping.length) {
                        d_array.some(mapping.mapping,
                            function (item) {
                                if (item.attributeName === field && (item.attributeValue === value || item.attributeValue === value.toString()) && item.displayValue !== "") {
                                    result = item.displayValue;
                                    return true;
                                }

                                var mapEmptyValue = item.attributeValue === "EMPTY" ? true : false;
                                if (item.attributeName === field && mapEmptyValue && (!value || value === " ") && value !== 0 && item.displayValue !== "") {
                                    result = item.displayValue;
                                    return true;
                                }
                            });
                    }
                    return result;
                },

                _addExtraInfoToMetadata: function (item) {
                    if (!this.metadata || !this.metadata.fields) {
                        this.metadata = {
                            fields: []
                        };
                    }
                    var generalMapping = this.generalTypeMapping;
                    if (generalMapping && generalMapping.extraInfo) {
                        d_array.forEach(generalMapping.extraInfo,
                            function (info) {
                                var index = ct_array.arrayFirstIndexOf(this.metadata.fields,
                                    {
                                        name: info.title
                                    });
                                if (index === -1) {
                                    this.metadata.fields.push({
                                        name: info.title,
                                        length: 10,
                                        title: info.title,
                                        order: info.index || 100,
                                        type: "string"
                                    });
                                }
                                item[info.title] = info.description;
                            }, this);
                    }

                    var layerMapping = this.layerTypeMapping;
                    if (layerMapping && layerMapping.extraInfo) {
                        d_array.forEach(layerMapping.extraInfo,
                            function (info) {
                                var index = ct_array.arrayFirstIndexOf(this.metadata.fields,
                                    {
                                        name: info.title
                                    });
                                if (index === -1) {
                                    this.metadata.fields.push({
                                        name: info.title,
                                        length: 10,
                                        title: info.title,
                                        order: info.index || 100,
                                        type: "string"
                                    });
                                }
                                item[info.title] = info.description;
                            }, this);
                    }
                    return item;
                },

                __renderPriorityComparator: function (
                    a,
                    b
                    ) {
                    a = Number(a.order);
                    b = Number(b.order);
                    if (!a && !b) {
                        return 0;
                    }
                    if (!a && b) {
                        return 1;
                    }
                    else if (!b && a) {
                        return -1;
                    }
                    else if (a < b) {
                        return -1;
                    }
                    else if (a === b) {
                        return 0;
                    }
                    return 1;
                },

                getMetadata: function () {
                    return this.metadata;
                },

                _getGeometryFromQuery: function (
                    query,
                    options
                    ) {
                    var ast = SpatialQuery.parse(query, options).ast;
                    var walker = ast.walker();
                    if (!walker.toFirstChild()) {
                        // no query (or) query for all features
                        throw Exception.illegalArgumentError("WMSFeatureInfoStore: empty query is not supported!");
                    }
                    var astNode = walker.current;
                    var spatialOperator = astNode.o;
                    if (!this.supportedSpatialOperators[spatialOperator]) {
                        throw Exception.illegalArgumentError("WMSFeatureInfoStore: a spatial query is required with one of following operators: " + this.supportedSpatialOperators);
                    }
                    return astNode.v;
                },

                setQueryLayers: function (layerNames) {
                    this.queryLayers = layerNames;
                },

                _getScreenWidth: function () {
                    var screenViewport = this._mapState.getViewPort().getScreen();
                    return screenViewport.getWidth();
                },

                _getScreenHeight: function () {
                    var screenViewport = this._mapState.getViewPort().getScreen();
                    return screenViewport.getHeight();
                },

                _toScreen: function (geoPoint) {
                    return this._mapState.getViewPort().toScreen(geoPoint);
                },

                getFeatureInfoUrl: function (
                    pixPoint,
                    extent,
                    width,
                    height,
                    layerIds,
                    format,
                    url
                    ) {
                    this.version = '1.3.0';
                    format = format ? format : "text/html";
                    var featureCount = this.infoFeatureCount ? this.infoFeatureCount : 10,
                        additionalParams = {
                            SERVICE: "WMS",
                            REQUEST: "GetFeatureInfo",
                            VERSION: this.version,
                            WIDTH: width,
                            HEIGHT: height,
                            INFO_FORMAT: format,
                            QUERY_LAYERS: layerIds.join(','),
//BartVerbeeck Bug                            
                            LAYERS: layerIds.join(','),
                            FEATURE_COUNT: featureCount
                        },
                        xParam = 'X',
                        yParam = 'Y';
                    var refSysParam = 'SRS';
                    if (this.version === '1.3.0') {
                        xParam = 'I';
                        yParam = 'J';
                        refSysParam = 'CRS';
                    }
                    // here we uning dojo round because of error in some browsers, were pixpoint is not an int!
                    additionalParams[xParam] = d_number.round(pixPoint.x,
                        0);
                    additionalParams[yParam] = d_number.round(pixPoint.y,
                        0);

                    var code = extent.spatialReference.wkid;
                    additionalParams[refSysParam] = "EPSG:" + code;

                    var xmin = extent.xmin;
                    var xmax = extent.xmax;
                    var ymin = extent.ymin;
                    var ymax = extent.ymax;
                    additionalParams.BBOX = xmin + "," + ymin + "," + xmax + "," + ymax;

                    var additionalQueryPart = d_ioq.objectToQuery(additionalParams);

                    url = url.concat('?').concat(additionalQueryPart);
                    return url;
                }
            });
    });