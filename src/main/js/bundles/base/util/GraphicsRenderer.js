/**
 * COPYRIGHT 2012-2013 con terra GmbH Germany
 *
 * User: fba
 * Date: 31.07.13
 * Time: 10:25
 */
define([
        "dojo/_base/lang",
        "dojo/_base/declare",
        "ct/_lang",
        "ct/Stateful",
        "ct/Exception",
        "ct/mapping/edit/LookupGraphicResolver",
        "ct/mapping/map/GraphicsLayerNode"
    ],
    function (
        d_lang,
        declare,
        ct_lang,
        Stateful,
        Exception,
        LookupGraphicResolver,
        GraphicsLayerNode
        ) {
        /**
         * @fileOverview This is file provides an helper for graphics rendering.
         */
        var GraphicsRenderer = declare([Stateful],
            /**
             * @lends ct.mapping.edit.GraphicsRenderer.prototype
             */
            {
                /**
                 * Flag if this render has created the given node.
                 * Set by the createForGraphicsNode factory method.
                 * @type Boolean
                 */
                hasNodeCreated: false,
                /**
                 * The node which contains the graphics methods.
                 * Normaly a GraphicsLayerNode.
                 * @type ct.mapping.map._HasGraphicsContainer
                 */
                graphicsNode: null,
                /**
                 * the resolver to use to convert non graphics into graphic instances.
                 * By default a LookupGraphicResolver is used.
                 */
                graphicResolver: null,
                /**
                 * This attribute is only used if no graphicResolver is configured.
                 * @see ct.mapping.edit.LookupGraphicResolver
                 */
                symbolLookupStrategy: null,
                /**
                 * This attribute is only used if no graphicResolver is configured.
                 * @see ct.mapping.edit.LookupGraphicResolver
                 */
                templateLookupStrategy: null,
                /**
                 * This class is an helper for geometry/graphic drawing tasks against a "GrapicsLayerNode".
                 * @constructs
                 */
                constructor: function (opts) {
                },
                validateInternalState: function () {
                    if (!this.graphicsNode) {
                        throw Exception.illegalArgumentException("ct.mapping.edit.GraphicsRenderer: no 'graphicsNode' defined in initializer.");
                    }
                    if (!this.graphicResolver) {
                        this._createDefaultGraphicResolver();
                    }
                },
                _createDefaultGraphicResolver: function () {
                    this.graphicResolver = new LookupGraphicResolver({
                        symbolLookupStrategy: this.symbolLookupStrategy,
                        templateLookupStrategy: this.templateLookupStrategy
                    });
                },
                _setSymbolLookupStrategy: function (symbolLookupStrategy) {
                    this.symbolLookupStrategy = symbolLookupStrategy;
                    this._createDefaultGraphicResolver();
                },
                _setTemplateLookupStrategy: function (templateLookupStrategy) {
                    this.templateLookupStrategy = templateLookupStrategy;
                    this._createDefaultGraphicResolver();
                },
                /**
                 * Draws a thing with a geometry attribute.
                 * Geometry, attributes, symbol and infotemplate of the thingWithGeometry are looked up by the _createGraphic method.
                 * @returns {esri.Graphic} the rendered/created graphic instance
                 * @example
                 *   // common usage
                 *   renderer.draw({
             *      geometry: aPoint,
             *      attributes: {
             *          name: "what ever"
             *      }
             *   });
                 *
                 *   // you can also provide symbol and infotemplate directly, then the lookup are not used.
                 *   renderer.draw({
             *      geometry: aPoint,
             *      attributes: {
             *          name: "what ever"
             *      },
             *      symbol : aEsriSymbol,
             *      infoTemplate : aEsriInfoTemplate
             *   });
                 */
                draw: function (
                /**Object*/
                    thingWithGeometry
                    ) {
                    var gNode = this.graphicsNode,
                        context = thingWithGeometry.context,
                        graphic = this.graphicResolver.resolve(thingWithGeometry
                            /*, context*/);
                    if (graphic) {
                        gNode.addGraphic(graphic);
                    }
                    return graphic;
                },
                /**
                 * Use the graphic returned by draw to delete it.
                 */
                erase: function (graphic) {
                    var gNode = this.graphicsNode;
                    gNode.removeGraphic(graphic);
                },
                /**
                 * Removes all graphics from the node.
                 */
                clear: function () {
                    var gNode = this.graphicsNode;
                    gNode.clearGraphics();
                },
                enableNode: function () {
                    this.graphicsNode.set("enabled", true);
                },
                disableNode: function () {
                    this.graphicsNode.set("enabled", false);
                },
                getGraphicsCount: function () {
                    return this.graphicsNode.getGraphicsCount();
                },
                detachNode: function () {
                    var gNode = this.graphicsNode,
                        parent = gNode.get("parent");
                    if (parent) {
                        this._oldParent = parent;
                        parent.removeChild(gNode);
                    }
                },
                attachNode: function (parent) {
                    parent = parent || this._oldParent;
                    parent.addChild(this.graphicsNode);
                    delete this._oldParent;
                }
            });

        /**
         * Factory method for GraphicsRenderer instance.
         * You can use it in 3,2 or 1 parameter style.
         * @example
         *      // creates renderer for an existing graphic node.
         *      var renderer = GraphicsRenderer.createForGraphicsNode(node);
         *
         *      // creates renderer by searching for an node with id 'node' id in the mapmodel and creates a new if not found.
         *      // The new node is put on top of all other glass pane nodes.
         *      var renderer = GraphicsRenderer.createForGraphicsNode(nodeId, mapModel);
         *
         *      // creates renderer by searching for an node with id 'node' id in the mapmodel.
         *      // The last parameter says that the node should not be created if not existing.
         *      var renderer = GraphicsRenderer.createForGraphicsNode(nodeId, mapModel,false);
         */
        GraphicsRenderer.createForGraphicsNode = function (
            nodeId,
            mapModel,
            title,
            type,
            rootNodeId,
            renderPriority
            ) {
            var g = d_lang.isObject(nodeId) ? nodeId : mapModel.getNodeById(nodeId),
                created = false;
            if (!g) {
                created = true;
                if (renderPriority !== undefined) {
                    g = new GraphicsLayerNode({
                        id: nodeId,
                        title: title || "",
                        nodeType: type || "GRAPHIC",
                        renderPriority: renderPriority
                    });
                } else {
                    g = new GraphicsLayerNode({
                        id: nodeId,
                        title: title || "",
                        nodeType: type || "GRAPHIC"
                    });
                }
                if (rootNodeId) {
                    mapModel.getNodeById(rootNodeId).addChildAt(g, 0);
                } else {
                    mapModel.getGlassPaneLayer().addChildAt(g, 0);
                }
            }
            return g && new GraphicsRenderer({
                hasNodeCreated: created,
                graphicsNode: g
            });
        };
        return GraphicsRenderer;
    }
);