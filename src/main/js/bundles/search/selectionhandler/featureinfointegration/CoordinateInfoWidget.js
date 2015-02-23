/**
 * COPYRIGHT 2014 con terra GmbH Germany
 *
 * Created by fba on 30.06.2014.
 */
define([
        "dojo/_base/declare",
        "./AddressInfoWidget"
    ],
    function (
        declare,
        AddressInfoWidget
        ) {
        var CoordinateInfoWidget = declare([AddressInfoWidget],
            {
                constructor: function () {

                },

                postCreate: function () {
                    this.inherited(arguments);
                    var attr = this.content && this.content.graphic && this.content.graphic.attributes;
                    if (attr) {
                        this.set("title", this.i18n[attr.type]);
                        this.infoNode.innerHTML = this.i18n[attr.type] + ": " + attr.title;
                    }
                },

                _showGeocodeResult: function (item) {
                    this.inherited(arguments);
                    this.labelNode.innerHTML = this.i18n.addressLevel + ":";
                }
            }
        );
        CoordinateInfoWidget.createWidget = function (
            params,
            contentFactory
            ) {
            if (params.context.showTrashCan) {
                var tool = contentFactory.get("deleteTool");
                tool.managedLayerId = params.context.managedLayerId;
                params.rule.window.tools.push(tool);
            }
            return new CoordinateInfoWidget({
                content: params.content,
                context: params.context,
                geocodeDeferred: params.content.geocodeDeferred,
                geometry: params.content.geometry,
                i18n: contentFactory.get("CoordinateInfoWidget").i18n,
                eventService: contentFactory.get("eventService"),
                storeQueries: params.content.storeQueries,
                graphic: params.content.graphic,
                poiFocus: params.content.poiFocus,
                hideEmptyLayerResults: params.rule.hideEmptyLayerResults,
                layerFeatureCount: params.rule.layerFeatureCount || 0,
                contentViewer: contentFactory.get("contentViewer"),
                addressLevelSwitch: contentFactory.get("addressLevelSwitch"),
                showDetailsButton: params.rule.showDetailsButton,
                transformer: contentFactory.get("transformer"),
                mapState: contentFactory.get("mapState"),
                metadataMapping: contentFactory.get("metadataMapping"),
                expandInfoHeight: contentFactory.get("expandInfoHeight"),
                routingTool: contentFactory.get("routingTool"),
                showNearby: contentFactory.get("locationInfoController"),
                skipButtons: params.rule.skipButtons
            });
        };
        return CoordinateInfoWidget;
    }
);