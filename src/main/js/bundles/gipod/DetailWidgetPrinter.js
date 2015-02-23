define([
        "dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/_base/array",
        "ct/Stateful",
        "esri/geometry/Extent",
        "jasperprinting/MapPrinter"
    ],
    function (
        declare,
        d_lang,
        d_array,
        Stateful,
        Extent,
        MapPrinter
        ) {
        return declare([MapPrinter],
            {

                KEY: "detail",
                EMPTY_TYPE: [],

                activate: function () {
                    this.i18n = this._i18n.get().ui;
                },

                readPrintData: function (
                    opts,
                    mapsettings
                    ) {
                    if (!this._widget) {
                        return{};
                    }
                    var json = {};
                    json[this.KEY] = [
                        d_lang.mixin(this.createDetailMapJson(opts, this._widget), {
                            tables: [
                                {table: this.createDetailTableJson()}
                            ]
                        })
                    ];
                    return json;
                },

                _calculateUnifiedExtent: function (graphics) {
                    var unifiedExtent;
                    d_array.forEach(graphics, function (graphic) {
                        var extent;
                        var geometry = graphic.geometry;
                        if (geometry.getExtent) {
                            extent = geometry.getExtent();
                        } else if (graphic.type === "point") {
                            extent = new Extent(geometry.x, geometry.y, geometry.x, geometry.y,
                                geometry.spatialReference);
                        } else {
                            extent = null;
                        }

                        if (extent) {
                            if (!unifiedExtent) {
                                unifiedExtent = extent;
                            } else {
                                unifiedExtent = unifiedExtent.union(extent);
                            }
                        }
                    });
                    return unifiedExtent;
                },

                _renderGraphicsLayerManual: function (
                    preserveScale,
                    mapExtent,
                    targetExtent,
                    targetWidth,
                    targetHeight,
                    graphics,
                    features
                    ) {

                    this._renderGraphicsLayer(preserveScale,
                        mapExtent,
                        targetExtent,
                        targetWidth,
                        targetHeight,
                        {graphics: graphics},
                        null, null,
                        features);

                },

                createDetailMapJson: function (
                    opts,
                    widget
                    ) {
                    var mapComponents = widget.getDetailMap().getMapComponents();
                    this._mapState = mapComponents.mapState;
                    this._mapModel = mapComponents.mapModel;
                    this.esriMap = mapComponents.esriMap;
                    var graphics = widget.getGraphics();

                    var infos = this.getPrintInfos(false, opts.selectedTemplate.mapsize.w,
                        opts.selectedTemplate.mapsize.h, graphics, this._calculateUnifiedExtent(graphics));
                    return infos;
                },

                _getFieldValueRecursive: function (parts, item, idx) {

                    idx = idx || 0;
                    item = item[parts[idx]]
                    if (idx === parts.length - 1) {
                        return item;
                    }
                    return this._getFieldValueRecursive(parts, item, ++idx);

                },

                _getFieldValue: function (field, item) {

                    var value;
                    if (field.name.indexOf(".") > -1) {
                        var parts = field.name.split(".");
                        value = this._getFieldValueRecursive(parts, item);
                    } else {
                        value = item[field.name + "Plain"] || item[field.name];
                    }
                    return value;

                },

                _getFilteredAttributes: function (item, metadata) {
                    var that = this;
                    var itemsList = [];
                    var fields = metadata.fields;
                    d_array.forEach(fields, function (field) {
                        var value = this._getFieldValue(field, item);
                        if (value) {
                            if (d_lang.isArray(value)) {
                                value = that._serializeArray(value, ", ");
                            }
                            itemsList.push({
                                attribute: field.title,
                                value: value
                            });
                        }
                    }, this);
                    return itemsList;
                },

                _serializeArray: function (
                    array,
                    separator
                    ) {
                    var output = "";
                    for (var i = 0; i < array.length; i++) {
                        output += array[i];
                        if (i < array.length - 1) {
                            output += separator;
                        }
                    }
                    return output;
                }

            });
    });