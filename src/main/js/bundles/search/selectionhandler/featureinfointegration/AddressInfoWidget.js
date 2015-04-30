/**
 * COPYRIGHT 2012-2013 con terra GmbH Germany
 *
 * User: fba
 * Date: 16.09.13
 * Time: 08:14
 */
define([
        "dojo/_base/declare",
        "dojo/_base/array",
        "dojo/_base/lang",
        "dojo/string",
        "ct/array",
        "ct/util/css",
        "ct/request",
        "ct/_when",
        "ct/_Connect",
        "base/ui/genericidentify/RandomClickFeatureInfoWidget"
    ],
    function (
        declare,
        d_array,
        d_lang,
        d_string,
        ct_array,
        ct_css,
        ct_request,
        ct_when,
        Connect,
        RandomClickFeatureInfoWidget
        ) {
        var AddressInfoWidget = declare([
                RandomClickFeatureInfoWidget
            ],
            {

                baseClass: "ctFeatureInfoResult ctAddressInfoWidget",

                constructor: function () {

                },

                postCreate: function () {
                    this.inherited(arguments);
                    var attr = this.content && this.content.graphic && this.content.graphic.attributes;
                    if (attr) {
                        this.set("title", this.i18n[attr.type]);
                    }
                }
            }
        );
        AddressInfoWidget.createWidget = function (
            params,
            contentFactory
            ) {
            if (params.context.showTrashCan) {
                var tool = contentFactory.get("deleteTool");
                tool.managedLayerId = params.context.managedLayerId;
                params.rule.window.tools.push(tool);
            }
            return new AddressInfoWidget({
                content: params.content,
                context: params.context,
                geocodeDeferred: params.content.geocodeDeferred,
                geometry: params.content.geometry,
                i18n: contentFactory.get("AddressInfoWidget").i18n,
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
        return AddressInfoWidget;
    }
);