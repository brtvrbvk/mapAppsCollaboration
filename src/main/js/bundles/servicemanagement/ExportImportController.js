define([
        "dojo/_base/lang",
        "dojo/_base/declare",
        "base/ui/controls/management/_ExportImportController",
        "ct/request"
    ],
    function (
        d_lang,
        declare,
        _ExportImportController,
        ct_request
        ) {

        return declare([_ExportImportController],
            {
                updateTopic: "ct/servicemanagement/SERVICE_CONFIG_UPDATED",

                constructor: function () {
                },

                activate: function () {
                    this.exportAllTarget = ct_request.getProxiedUrl(this.exportAllTarget, true);
                    this.exportIdentifyMappingsTarget = ct_request.getProxiedUrl(this.exportIdentifyMappingsTarget, true);
                    this.importIdentifyMappingsTarget = ct_request.getProxiedUrl(this.importIdentifyMappingsTarget, true);
                    this.importAllTarget = ct_request.getProxiedUrl(this.importAllTarget, true);

                    var i18n = this.i18n = this._i18n.get();
                    this.effectiveImportWidgetDefinition = this._substituteDefintion(this.importWidgetDefinition,
                        i18n.serviceConfigsImportView);
                },

                importAll: function () {
                    this._createWindow(this.importAllTarget, this.i18n.serviceConfigsImportView,
                        this.effectiveImportWidgetDefinition);
                },

                exportAllIdentifyMappings: function () {
                    this._exportAll(this.exportIdentifyMappingsTarget);
                },

                importAllIdentifyMappings: function () {
                    this._createWindow(this.importIdentifyMappingsTarget, this.i18n.serviceConfigsImportView,
                        this.effectiveImportWidgetDefinition);
                }

            });
    });