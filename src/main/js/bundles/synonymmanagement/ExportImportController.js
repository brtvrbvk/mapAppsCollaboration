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
                updateTopic: "ct/synonymmanagement/SYNONYM_CONFIG_UPDATED",

                constructor: function () {
                },

                activate: function () {
                    this.exportTarget = ct_request.getProxiedUrl(this.exportTarget, true);
                    var i18n = this.i18n = this._i18n.get();
                    this.effectiveImportWidgetDefinition = this._substituteDefintion(this.importWidgetDefinition,
                        i18n.synonymConfigsImportView);
                },

                importAll: function () {
                    this._createWindow(this.importAllTarget, this.i18n.synonymConfigsImportView,
                        this.effectiveImportWidgetDefinition);
                }

            });
    });