define([
        "dojo/_base/lang",
        "dojo/_base/declare",
        "base/ui/controls/management/_ExportImportController"
    ],
    function (
        d_lang,
        declare,
        _ExportImportController
        ) {

        return declare([_ExportImportController],
            {
                updateTopic: "ct/identifymanagement/IDENTIFY_CONFIG_UPDATED",

                constructor: function () {
                },

                activate: function () {
                    var i18n = this.i18n = this._i18n.get();
                    this.effectiveImportWidgetDefinition = this._substituteDefintion(this.importWidgetDefinition,
                        i18n.identifyConfigsImportView);
                    this.effectiveImportFromOldWidgetDefinition = this._substituteDefintion(this.importWidgetDefinition,
                        i18n.identifyConfigsImportFromOldView);
                },

                importAll: function () {
                    this._createWindow(this.importAllTarget, this.i18n.identifyConfigsImportView,
                        this.effectiveImportWidgetDefinition);
                },

                importOld: function () {
                    this._createWindow(this.importOldTarget, this.i18n.identifyConfigsImportFromOldView,
                        this.effectiveImportFromOldWidgetDefinition);
                }

            });
    });