/**
 * COPYRIGHT 2014 con terra GmbH Germany
 *
 * Created by fba on 25.02.14.
 */
define([
        "dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/_base/connect",
        "dojo/has",
        "dojo/dom-style",
        "ct/mapping/edit/DrawStateController",
        "esri/toolbars/draw",
        "esri/geometry/Point",
        "esri/geometry/Polygon",
        "esri/geometry/Polyline",
        "esri/graphic",
//    "esri/symbols/jsonUtils",
        "ct/mapping/geometry",
        "ct/_lang",
        "dijit/form/Button",
        "dojo/i18n!esri/nls/jsapi"
    ],
    function (
        declare,
        d_lang,
        d_connect,
        d_has,
        d_domStyle,
        DrawStateController,
        Draw,
        Point,
        Polygon,
        Polyline,
        Graphic,
        ct_geometry,
        ct_lang,
        Button,
        bundle
        ) {
        //
        // UNFORTUANTELY we need to patch again the esri draw to fit in out eventing...
        //
        var EsriDrawPatched = declare([Draw], {
            constructor: function () {
                this.setPreviewMarker(this._options.previewMarker);
                this.finishWithButton = this._options.finishWithButton || false;
            },
            setPreviewMarker: function (preview) {
                //TODO:this helps arround bug MAPAPPS-2430 but, exactly why is not clear
                // the mouse move is executed but following mousedown/mouseclick events not (or better only each second "tap")
                this.previewMarker = d_has("esri-touch") ? false : (preview || false);
            },
            deactivate: function () {
                this.inherited(arguments);
            },
            _drawEnd: function (geom) {
                // Patched for 3.5 api, because Circle and Ellipse are not correctly deleted from map.graphics
                // -> fixes also wrong start drag point if you mix click/drag rendering
                this._clear();

                if (geom instanceof Polygon) {

                    // ensure that polygon has no duplicated adjacent points
                    ct_geometry.removeAdjacentPoints(geom);
                    // prevent drawing of polygons with less then 3 edges
                    // 4 is used because start point is also last point in ring
                    if (!geom.rings[0] || geom.rings[0].length < 4) {
                        return;
                    }
                } else if (geom instanceof Polyline) {
                    ct_geometry.removeAdjacentPoints(geom);

                }

                this.inherited(arguments);
            },
            activate: function () {
                this.inherited(arguments);
                if (this.previewMarker && this._geometryType === Draw.POINT) {
                    var map = this.map;
                    this._onMouseMoveHandler_connect = d_connect.connect(map, "onMouseMove",
                        this._onMouseMoveHandler);
                }
            },
            _onMouseMoveHandler: function (evt) {
                if (!this.previewMarker || this._geometryType !== Draw.POINT) {
                    this.inherited(arguments);
                    return;
                }
                var point;
                var map = this.map;
                if (map.snappingManager) {
                    point = map.snappingManager._snappingPoint;
                }
                point = point || evt.mapPoint;
                var markerSymbol = this.markerSymbol;
                var tGraphic = this._tGraphic || (this._tGraphic = map.graphics.add(new Graphic(new Point(point.x,
                            point.y,
                            map.spatialReference),
                        markerSymbol),
                    true));
                this.inherited(arguments);
                var tGeom = tGraphic.geometry;
                tGeom.update(point.x, point.y);
                tGraphic.setGeometry(tGeom);
                if (tGraphic.symbol !== markerSymbol) {
                    tGraphic.setSymbol(markerSymbol);
                }
            },
            _onKeyDownHandler: function () {
                if (this.previewMarker && this._geometryType === Draw.POINT) {
                    return;
                }
                this.inherited(arguments);
            },
            _setTooltipMessage: function () {
                var toolbarMessages = bundle.toolbars;
                var orgMessages = toolbarMessages.draw;
                try {
                    var names = {};
                    var opts = this._options;
                    var toolmessages = opts.tooltipMessages;
                    if (this.finishWithButton) {
                        names = {
                            complete: toolmessages && toolmessages.resume || orgMessages.resume,
                            finish: toolmessages && toolmessages.resume || orgMessages.resume
                        };
                    }
                    toolbarMessages.draw = ct_lang.merge({}, orgMessages, opts.tooltipMessages || {}, names);
                    this.inherited(arguments);
                } finally {
                    toolbarMessages.draw = orgMessages;
                }
            },
            _onClickHandler: function (evt) {
                this.inherited(arguments);
                this.onNewGeometryPart({graphic: this._graphic});
                if (this.finishWithButton) {
                    var points = this._points;
                    switch (this._geometryType) {
                        case Draw.POLYGON:
                            if (points.length < 3) {
                                return;
                            }
                        case Draw.POLYLINE:
                            if (points.length < 2) {
                                return;
                            }
                        case Draw.MULTI_POINT:
                            this._updateFinishBtnPosition(evt);
                    }
                }
            },

            onNewGeometryPart: function (evt) {
            },

            _onDblClickHandler: function () {
                if (this.finishWithButton) {
                    return;
                }
                this.inherited(arguments);
            },
            _clear: function () {
                this._destroyFinishBtn();
                this.inherited(arguments);
            },
            _createFinishBtn: function () {
                var opts = this._options;
                var label = (opts && opts.tooltipMessages && opts.tooltipMessages.finishLabel) || "Finish";
                var btn = new Button({label: label, "class": "ctFinishButton", iconClass: "icon-checkbox-checked"});
                btn.on("click", d_lang.hitch(this, "_onFinishBtnClick"));
                return btn;
            },
            _destroyFinishBtn: function () {
                var btn = this._finishBtn;
                if (btn) {
                    this._finishBtn = undefined;
                    btn.destroyRecursive();
                }
            },
            _onFinishBtnClick: function () {
                this._destroyFinishBtn();
                this.finishDrawing();
            },
            _updateFinishBtnPosition: function (evt) {
                var point = evt && evt.screenPoint;
                var map = this.map;
                var btn = this._finishBtn || (this._finishBtn = this._createFinishBtn());
                btn.placeAt(map.container).startup();
                d_domStyle.set(btn.domNode, {
                    "position": "absolute", "left": point.x + "px",
                    "top": point.y + "px"
                });
            }
        });

        return declare([DrawStateController],
            {
                constructor: function () {

                },

                activate: function () {
                    var props = this._properties || {};
                    var opts = this._drawToolbarOpts = ct_lang.chk(props.drawToolbarOpts,
                            this._drawToolbarOpts || {});
                    this.ensureOutlineWhileDrawingPolygon = ct_lang.chk(props.ensureOutlineWhileDrawingPolygon,
                        this.ensureOutlineWhileDrawingPolygon);
                    // patch i18n of draw toolbar
                    if (this._i18n) {
                        var tooltips = this._i18n.get()[opts.tooltipI18nKey || "drawTooltips"];
                        opts.tooltipMessages = tooltips;
                    }

                    var toolbar = this._drawToolbar = new EsriDrawPatched(this._esriMap, opts);
                    // store deault configuration for client code.
                    this.defaultMarkerSymbol = toolbar.markerSymbol;
                    this.defaultLineSymbol = toolbar.lineSymbol;
                    this.defaultFillSymbol = toolbar.fillSymbol;
                    this.connect(toolbar, "onDrawComplete", this._handleOnDrawEnd);
                    this.connect(toolbar, "onActivate", this._handleOnActivate);
                    this.connect(toolbar, "onDeactivate", this._handleOnDeactivate);
                    this.connect(toolbar, "onNewGeometryPart", this._handleOnNewGeometryPart);
                    this.connectP(this, "activeGeometryType", this._handleActiveGeometryTypeChange);
                },

                onNewGeometryPart: function (evt) {
                },

                _handleOnNewGeometryPart: function (evt) {
                    this.onNewGeometryPart(evt);
                }
            }
        )
    }
);