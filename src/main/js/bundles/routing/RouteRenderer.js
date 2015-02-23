/*
 * COPYRIGHT 2011-2012 con terra GmbH Germany
 */
/**
 * @fileOverview
 * @author fba
 */
define([
        "esri/geometry/Polyline",
        "esri/geometry/jsonUtils",
        "dojo/_base/declare",
        "dojo/_base/array",
        "dojo/_base/lang",
        "ct/Stateful",
        "ct/mapping/edit/GraphicsRenderer",
        "ct/mapping/edit/SymbolTableLookupStrategy"
    ],

    function (
        Polyline,
        e_geometryUtils,
        declare,
        d_array,
        d_lang,
        Stateful,
        GraphicsRenderer,
        MultipleSymbolLookupStrategy
        ) {

        return declare([Stateful], {

            id: null,
            markerCounter: 0,

            activate: function () {
                var grapicLayerId = this._graphicNodeId || "highlighterPane",
                    symbolTable = this._symbolTable;
                this._renderer = GraphicsRenderer.createForGraphicsNode(grapicLayerId, this._mapModel);
                this.points = this._properties._routingMarkerSymbols.points;
                var ms = new MultipleSymbolLookupStrategy({
                    lookupByGeometryType: true,
                    lookupTable: symbolTable
                });
                this._renderer.set({
                    symbolLookupStrategy: ms
                });
                if (this._renderer.get("hasNodeCreated")) {
                    this._mapModel.fireModelStructureChanged({
                        source: this
                    });
                }
            },

            deactivate: function () {
                this._renderer = null;
            },

            drawRoute: function (
                route,
                zoom
                ) {
                this._route = route;
                this.extent = route.extent;
                if (zoom) {
                    this._zoomToExtent();
                }
                var markers = [];
                var firstPath = route.stopovers[0].parts[0].geometry.paths[0];
                var start = new e_geometryUtils.fromJson({
                    spatialReference: {
                        wkid: 3857
                    },
                    x: firstPath[0][0],
                    y: firstPath[0][1]
                });
                markers.push(start);
                this._renderer.clear();
                d_array.forEach(route.stopovers, d_lang.hitch(function (
                        s,
                        idx
                        ) {
                        var lastPath = s.parts[s.parts.length - 1].geometry.paths;
                        var stopover = new e_geometryUtils.fromJson({
                            spatialReference: {
                                wkid: 3857
                            },
                            x: lastPath[lastPath.length - 1][0][0],
                            y: lastPath[lastPath.length - 1][0][1]
                        });
                        markers.push(stopover);
                        var polyline = Polyline(3857);
                        var line = [];
                        d_array.forEach(s.parts, function (part) {
                            line = line.concat(part.geometry.paths[0]);
                        }, this);
                        polyline.addPath(line);
                        this._renderer.draw({
                            geometry: polyline,
                            attributes: {
                                route: route,
                                type: "ROUTING",
                                startIndex: idx,
                                endIndex: idx + 1
                            }
                        });
                    }), this
                )
                ;

                this._mapModel.fireModelNodeStateChanged({
                    source: this
                });
//                this._drawMarkers(markers);
            },

            getRouteExtent: function () {
                return this.extent;
            },

            _draw: function (
                geometry,
                idx
                ) {
                if (!geometry) {
                    console.warn("DrawHandler.handle: Unable to draw item since no geometry is found.");
                    return;
                }
                this._renderer.draw({
                    geometry: geometry,
                    attributes: {}
                });
            },

            drawMarkers: function (targets) {
                d_array.forEach(targets, d_lang.hitch(function (marker) {
                    var geometry = this.transformer.transform(marker.geometry, 3857),
                        symbol = this.points[marker.index];
                    symbol.index = marker.index;
                    this._renderer.draw({
                        geometry: geometry,
                        attributes: {
                            targets: targets,
                            route: this._route,
                            type: "ROUTING"
                        },
                        symbol: symbol
                    });
                }), this);
            },

            drawNeutralMarker: function (geometry) {

                var symbol = this.points[this.points.length - 1];
                return this._renderer.draw({
                    geometry: geometry,
                    attributes: {
                    },
                    symbol: symbol
                });

            },

            removeMarker: function (graphic) {
                this._renderer.erase(graphic);
            },

            getMarker: function () {
                var markers = [];
                d_array.forEach(this._renderer.graphicsNode.graphics, d_lang.hitch(function (marker) {
                    if (marker.symbol.type === "picturemarkersymbol") {
                        markers.push(marker);
                    }
                }), this);
                return markers;
            },

            _zoomToExtent: function () {
                var winWidth = this._routingWidget.domNode.clientWidth;
                var screenWidth = this._mapState.viewport.getScreen().xmax;
                var factor = screenWidth / (screenWidth - winWidth);
                var extent = d_lang.clone(this.extent);
                extent.xmax = extent.xmin + (extent.xmax - extent.xmin) * factor;
//                if (!this._mapState.getExtent().contains(extent)) {
                this._mapState.setExtent(extent);
//                }
            },

            clear: function () {
                this._renderer.clear();
                this._mapModel.fireModelNodeStateChanged({
                    source: this
                });
            }
        });
    });