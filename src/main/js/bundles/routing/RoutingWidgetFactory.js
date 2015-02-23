/*
 * COPYRIGHT 2011-2012 con terra GmbH Germany
 */
/**
 * @fileOverview
 * @author fba
 */
define([
        "dojo/_base/declare",
        "ct/Stateful",
        "./RoutingWidget"
    ],
    function (
        declare,
        Stateful,
        RoutingWidget
        ) {
        var RoutingWidgetFactory = declare([Stateful], {

            activate: function () {
                var i18n = this._i18n.get();
                this._ui = new RoutingWidget({
                    i18n: i18n.ui,
                    searchStore: this.searchStore,
//                    primaryGeocoderStore:this.primaryGeocoder,
//                    secondaryGeocoderStore:this.secondaryGeocoder,
//                    thirdGeocoderStore:this.thirdGeocoder,
                    comboboxOpts: this.comboboxOpts,
                    markerUrls: this.markerUrls,
                    parameterManager: this.parameterManager,
                    printTargetTemplate: this.printTargetTemplate,
                    templateModel: this.templateModel,
                    esriMap: this.esriMap,
                    topToolbar: this.topToolbar,
                    printTool: this.printTool,
                    eventService: this._eventService,
                    elevationTool: this._elevationTool
                });
            },
            createInstance: function () {
                return this._ui;
            }

        });
        return RoutingWidgetFactory;
    });
