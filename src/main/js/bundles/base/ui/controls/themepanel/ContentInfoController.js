/**
 * COPYRIGHT 2012-2013 con terra GmbH Germany
 *
 * User: fba
 * Date: 14.01.14
 * Time: 15:07
 */
define([
        "dojo/_base/declare",
        "dojo/_base/array",
        "dojo/_base/lang",
        "dojo/query",
        "dojo/io-query",
        "ct/Stateful",
        "ct/_Connect",
        "ct/mapping/mapcontent/ServiceTypes",
        "ct/Locale",
        "ct/request",
        "ct/_when",
        "dojo/Deferred",
        "dojo/DeferredList",
        "base/util/XMLUtils"
    ],
    function (
        declare,
        d_array,
        d_lang,
        query,
        ioQuery,
        Stateful,
        Connect,
        ServiceTypes,
        Locale,
        ct_request,
        ct_when,
        Deferred,
        DeferredList,
        XMLUtils
        ) {
        return declare([
                Stateful,
                Connect
            ],
            {
                constructor: function () {

                },

                _handleInfoClick: function (evt) {

                    var contentViewer = this._contentViewer;
                    var node = evt.getProperty("item");
                    if (node) {

                        var service = node.service;
                        var capabilitiesURL;
                        if (service && (service.serviceType === ServiceTypes.WMS || service.serviceType === ServiceTypes.INSPIRE_VIEW)) {
                            capabilitiesURL = service.serviceUrl;
                            var query = {};
                            if (capabilitiesURL.indexOf("?") !== -1) {
                                query = capabilitiesURL.split("?");
                                query = query.length > 1 ? query[1] : "";
                                query = ioQuery.queryToObject(query);
                                delete query.request;
                                delete query.Request;
                                delete query.REQUEST;
                                delete query.service;
                                delete query.Service;
                                delete query.SERVICE;
                            }
                            query.REQUEST = "GetCapabilities";
                            query.SERVICE = "WMS";
                            query.LANGUAGE = Locale.getCurrent().getLanguageISO6392B();
                            capabilitiesURL = capabilitiesURL.split("?")[0] + "?" + ioQuery.objectToQuery(query);
                        }

                        var content = {
                            title: node.title,
                            description: node.category ? node.category.description : node.props ? node.props.description : "",
                            metadataURL: node.props && node.props.metadataUrl,
                            capabilitiesURL: capabilitiesURL,
                            serviceURL: service ? service.serviceUrl : null,
                            infoController: this,
                            layers: d_array.map(node.get("children"), function (child) {
                                return child.layer.layerId;
                            }),
                            pro: this.pro,
                            type: service ? service.serviceTyp : node.type
                        };
                        var context = {
                            type: "NODE_INFO"
                        };

                        var contentInfo = contentViewer.findContentInfoById("nodeInfo");
                        contentViewer.closeContentInfo(contentInfo);
                        content.id = "nodeInfo";
                        contentViewer.showContentInfo(content, context);

                    }

                },

                retrieveMetadataLinks: function (content) {

                    var d = new Deferred();
                    var capabilitiesURL = content.capabilitiesURL;
                    var serviceURL = content.serviceURL;

                    if (content.metadataURL) {

                        d.resolve([
                            {
                                link: content.metadataURL
                            }
                        ]);

                    } else if (capabilitiesURL) {

                        if (!window.capabilitiesMap) {
                            window.capabilitiesMap = {};
                        }
                        var cap = window.capabilitiesMap[serviceURL];
                        if (cap) {
                            ct_when(this._parseMetadataResult(cap, content), function (resp) {
                                var respList = [];
                                d_array.forEach(resp, function (item) {
                                    if (item[0])
                                        respList = respList.concat(item[1]);
                                });
                                d.resolve(respList);
                            });
                            return d;
                        }

                        var e = ct_request.request({
                            url: capabilitiesURL,
                            content: {},
                            handleAs: "xml"
                        });
                        ct_when(e, function (result) {

                            window.capabilitiesMap[serviceURL] = result;
                            ct_when(this._parseMetadataResult(result, content), function (resp) {
                                var respList = [];
                                d_array.forEach(resp, function (item) {
                                    if (item[0])
                                        respList = respList.concat(item[1]);
                                });
                                d.resolve(respList);
                            });

                        }, function (err) {

                            d.reject(err);

                        }, this);
                    } else {

                        d.reject("no metadata");

                    }

                    return d;

                },

                retrieveDescritpion: function (content) {

                    var d = new Deferred();
                    var capabilitiesURL = content.capabilitiesURL;
                    var serviceURL = content.serviceURL;

                    if (capabilitiesURL) {

                        if (!window.capabilitiesMap) {
                            window.capabilitiesMap = {};
                        }
                        var cap = window.capabilitiesMap[serviceURL];
                        if (cap) {
                            d.resolve(this._parseDescriptionResult(cap, content));
                            return d;
                        }

                        var e = ct_request.request({
                            url: capabilitiesURL,
                            content: {},
                            handleAs: "xml"
                        });
                        ct_when(e, function (result) {

                            window.capabilitiesMap[serviceURL] = result;
                            d.resolve(this._parseDescriptionResult(result, content));

                        }, function (err) {

                            d.reject(err);

                        }, this);
                    } else {

                        d.resolve("");

                    }

                    return d;

                },

                _parseDescriptionResult: function (
                    result,
                    content
                    ) {

                    var queryLayers = this._getQueryableLayers(result);
                    var abstracts = [];
                    d_array.forEach(content.layers, function (layerID) {
                        var a = this._retrieveAbstract(layerID, queryLayers);
                        if (a) {
                            abstracts.push(a);
                        }
                    }, this);

                    return abstracts;

                },

                _retrieveAbstract: function (
                    layerID,
                    queryLayers
                    ) {
                    var abstract;

                    d_array.some(queryLayers, function (qLayer) {

                        var nameTag = query("Name", qLayer)[0],
                            name = XMLUtils.getTextContent(nameTag);

                        if (name === layerID) {

                            abstract = XMLUtils.getTagValue("Abstract", qLayer);
                            return true;
                        }

                    }, this);

                    return abstract;
                },

                _parseMetadataResult: function (
                    result,
                    content
                    ) {
                    var queryLayers = this._getQueryableLayers(result);
                    var metaLinks = [];
                    d_array.forEach(content.layers, function (layerID) {
                        var d = new Deferred();
                        //retrieveLayer Infos from service capabilities
                        ct_when(this._retrieveOnlineResources(layerID, queryLayers), function (resp) {
                            var respList = [];
                            d_array.forEach(resp, function (item) {
                                if (item[0])
                                    respList = respList.concat(item[1]);
                            });
                            d.resolve(respList);
                        }, function (err) {
                            d.resolve(err);
                        }, this);
                        metaLinks.push(d);
                    }, this);
                    return new DeferredList(metaLinks);
                },

                _getQueryableLayers: function (result) {
                    var layers = [];
                    var items = XMLUtils.getTags("WMS_Capabilities>Capability Layer", result);
                    d_array.forEach(items, function (item) {
                        if (item.getAttribute("queryable")) {
                            layers.push(item);
                        }
                    });
                    return layers;
                },

                _retrieveOnlineResources: function (
                    layerID,
                    queryLayers
                    ) {

                    var links = [];

                    d_array.forEach(queryLayers, function (qLayer) {

                        var nameTag = query("Name", qLayer)[0],
                            name = XMLUtils.getTextContent(nameTag);

                        if (name === layerID) {

                            //get metadataURL
                            var metadataTags = query("MetadataURL", qLayer);

                            d_array.forEach(metadataTags, function (metaTag) {
                                var d = new Deferred();
                                var onlineResource = query("OnlineResource", metaTag)[0];
                                var format = XMLUtils.getTagValue("Format", metaTag);
                                var urlString = XMLUtils.getAttributeValue(onlineResource, "xlink:href");
                                var newUrlString = "";
                                var urlParams = ioQuery.queryToObject(urlString.substring(urlString.indexOf("?") + 1,
                                    urlString.length));
                                if (urlParams["id"] || urlParams["ID"] || urlParams["uuid"] || urlParams["UUID"]) {
                                    var id = urlParams["id"] || urlParams["ID"] || urlParams["uuid"] || urlParams["UUID"];
                                    newUrlString = this.metadataBaseUrl + id;
                                }
                                // check if the page exist
                                ct_when(ct_request.request({
                                    url: urlString,
                                    content: {},
                                    handleAs: "text"
                                }), function (success) {
                                    d.resolve({
                                        link: newUrlString,
                                        format: format
                                    });
                                }, function (error) {
                                    if (error.status = "404")
                                        d.resolve({
                                            link: urlString,
                                            format: format
                                        });
                                }, this);
                                links.push(d);

                            }, this);

                        }

                    }, this);

                    return new DeferredList(links);
                }
            }
        )
    }
);