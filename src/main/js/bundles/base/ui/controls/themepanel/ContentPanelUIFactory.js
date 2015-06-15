define([
        "dojo/_base/declare",
        "ct/_Connect",
        "./ContentPanelUI",
        "./CompareContentPanelUI"
    ],
    function (
        declare,
        _Connect,
        ContentPanelUI,
        CompareContentPanelUI
        ) {
        /*
         * COPYRIGHT 2010-2011 con terra GmbH Germany
         */
        return declare([_Connect],
            {
                constructor: function () {
                },

                activate: function () {
                    var props = this._properties;
                    var widgetProperties = {
                        props: props,
                        contentModel: this._contentModel,
                        eventService: this._eventService,
                        contentModelController: this._contentModelController,
                        layermanagerWidget: this.layermanagerWidget,
                        featurelayermanagerWidget: this.featurelayermanagerWidget,
                        overlayToolbar: this.overlayToolbar,
                        combicontentmanagerTool: this.combicontentmanagerTool,
                        openWindowOnNewData: this._properties.openWindowOnNewData,
                        i18n: this._i18n.get(),
                        _mrr: this._mrr,
                        _mapModel: this._mapModel,
//BartVerbeeck Bug32154                        
                        _mapState: this._mapState,
                        treeContent: this.treeContent,
                        nearbyPlacesWidget: this.nearbyPlacesWidget
                    };

                    this._treeWidget = props.isCompareContentPanel ? new CompareContentPanelUI(widgetProperties) : new ContentPanelUI(widgetProperties);
                },

                createInstance: function () {
                    return this._treeWidget;
                },

                destroyInstance: function (w) {
                    this.disconnect();
                    if (w) {
                        w.destroyRecursive();
                    }
                    this._treeWidget = null;
                },

                deactivate: function () {
                    this.disconnect();
                }
            });
    });