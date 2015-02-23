define([
        "dojo/_base/declare",
        "dojo/_base/lang",
        "ct/_Connect",
        "./LegendBuilderWidget",
        "."
    ],

    function (
        declare,
        d_lang,
        _Connect,
        LegendBuilderWidget,
        _moduleRoot
        ) {
        /*
         * COPYRIGHT 2012 con terra GmbH Germany
         */
        return _moduleRoot.LegendBuilderController = declare([_Connect],
            {

                constructor: function () {
                },

                createInstance: function () {
                    var i18n = this._i18n.get().legendBuilderWidget;
                    var wp = this._properties.widgetProperties;
                    var p = this._configAdminService.getConfiguration(wp.pid,
                        wp.bid) || {};
                    var opts = d_lang.mixin({
                        i18n: i18n,
                        configAdminService: this._configAdminService
                    }, p.properties);
                    opts = d_lang.mixin(opts, wp);
                    var widget = this._builderWidget = new LegendBuilderWidget(opts);
                    this.connect("onUpdateConfig", widget,
                        "onUpdateConfig", "_updateConfig");
                    return widget;
                },

                _updateConfig: function (evt) {
                    this._builderWidget.fireConfigChangeEvent(evt);
                }

            });
    });