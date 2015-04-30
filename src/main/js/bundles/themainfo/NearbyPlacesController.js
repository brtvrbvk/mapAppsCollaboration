/**
 * COPYRIGHT 2014 con terra GmbH Germany
 *
 * Created by tfu on 05.08.2014.
 */
define([
        "dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/query",
        "dojo/dom-geometry",
        "ct/Stateful",
        "ct/_Connect",
        "base/util/GraphicsRenderer",
        "esri/geometry/Circle",
        "esri/symbols/TextSymbol",
        "esri/geometry/jsonUtils"
    ],
    function (
        declare,
        d_lang,
        query,
        d_domgeom,
        Stateful,
        _Connect,
        GraphicsRenderer,
        Circle,
        TextSymbol,
        jsonUtils
        ) {
        return declare([
                Stateful,
                _Connect
            ],
            {
                topics: {
                    UPDATE_QUERY: "agiv/themainfo/UPDATE_QUERY",
                    UPDATE_QUERY_FROM_IDENTIFY: "agiv/themainfo/UPDATE_QUERY_FROM_IDENTIFY"
                },

                rootNodeId: "__glasspane__",
                radiusNodeId: {
                    circle: "radiusCircle",
                    label: "radiusLabel_IGNORE"
                },
                radiusGeometryType: {
                    circle: "CIRCLE",
                    label: "POINT"
                },

                constructor: function () {

                },

                activate: function () {
                    this._radius = this.nearbyPlacesWidget.selector.get("value");
                    this.connect(this.nearbyPlacesWidget.selector, "onChange", this, this._handleOnRadiusChange);
                    this._circleRenderer = GraphicsRenderer.createForGraphicsNode(this.radiusNodeId.circle,
                        this._mapModel,
                        this.radiusGeometryType.circle,
                            "DRAWING_" + this.radiusGeometryType.circle, this.rootNodeId, 1);
                    this._labelRenderer = GraphicsRenderer.createForGraphicsNode(this.radiusNodeId.label,
                        this._mapModel,
                        this.radiusGeometryType.label,
                            "DRAWING_" + this.radiusGeometryType.label, this.rootNodeId, 2);
                },

                _handleOnRadiusChange: function (val) {
                    this._radius = val;
                    if (!this._position) {
                        return;
                    }
                    this._renderRadius();
                    this._broadcastEvent(this.topics.UPDATE_QUERY);
                },

                _renderRadius: function () {
                    this._clearRadius();

                    var centerPoint = this._coordinateTransformer.transform(this._position,
                        this._mapState.getSpatialReference().wkid);
                    var circle = this._circle = new Circle({
                        center: centerPoint,
                        geodesic: true,
                        radius: this._radius * 1000
                    });
                    var circleGeom = {
                        geometry: circle.toJson(),
                        symbol: this.symbolTable.circle
                    };
                    this._circleRenderer.draw(circleGeom);

                    var viewport = this._mapState.viewport.createViewPortForGeoExtent(circle.getExtent());
                    var screenWidth = viewport.screen.xmax;
                    var themePanel = query(".themainfo")[0];
                    var themePanelWidth = themePanel ? d_domgeom.getContentBox(themePanel).w : 0;

                    if (themePanelWidth > 0) {
                        var ratio = screenWidth / themePanelWidth;

                        var lodLevel = this._mapState.findFittingLodIndex(viewport);
                        var lods = this._mapState.lods;
                        if (lodLevel > -1) {
                            viewport = viewport.createViewPortForLOD(lods[lodLevel]);
                            if (ratio <= 3) {
                                viewport = viewport.createViewPortForLOD(lods[lodLevel - 1]);
                            }
                        }

                        var geo = viewport.geo;
                        var shift = (geo.xmax - geo.xmin) / ratio / 2;
                        geo.xmin = geo.xmin + shift;
                        geo.xmax = geo.xmax + shift;
                        this._mapState.setViewPort(viewport);
                    } else {
                        this._mapState.setExtent(circle.getExtent());
                    }

                    var label = new TextSymbol(d_lang.mixin(this.symbolTable.text, {
                        "text": this._radius + " km"
                    }));
                    var labelGeom = {
                        geometry: this._getHighestPoint(circle),
                        symbol: label
                    };
                    this._labelRenderer.draw(labelGeom);

                    this._mapModel.fireModelStructureChanged({
                        source: this
                    });
                },

                _getHighestPoint: function (circle) {
                    var rings = circle.rings[0];
                    var point = {
                        x: rings[0][0],
                        y: rings[0][1],
                        spatialReference: this._mapState.getSpatialReference()
                    };
                    return jsonUtils.fromJson(point);
                },

                _clearRadius: function () {
                    this._circleRenderer.clear();
                    this._labelRenderer.clear();
                    this._circle = null;
                },

                _clearPosition: function () {
                    this._position = null;
                },

                _handleResultSelectionFromIdentify: function (evt) {
                    this._position = evt.getProperty("result") && evt.getProperty("result").geometry;
                    if (!this._radius) {
                        return;
                    }
                    this._renderRadius();
                    this._broadcastEvent(this.topics.UPDATE_QUERY);
                },

                _handleResultSelection: function (evt) {
                    this._position = evt.getProperty("result") && evt.getProperty("result").geometry;
                    if (this._position.type === "polygon") {
                        this._position = this._position.getCentroid();
                    }
                    if (!this._radius) {
                        return;
                    }
                    this._renderRadius();
                    this._broadcastEvent(this.topics.UPDATE_QUERY);
                },

                _broadcastEvent: function (evt) {
                    this.eventService.postEvent(evt, {
                        position: this._position,
                        radius: this._radius
                    });
                },

                deactivate: function () {
                    this.disconnect();
                },

                getExtent: function () {
                    if (this._circle) {
                        return this._circle.getExtent();
                    }
                }
            }
        );
    }
);