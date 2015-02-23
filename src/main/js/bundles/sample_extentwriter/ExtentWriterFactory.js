define([
    "dojo/_base/declare", "./ExtentWriter", "ct/_Connect"
], function(declare, ExtentWriter, _Connect) {

    return declare([_Connect], /** @lends sample.extentwriter.ExtentWriterFactory.prototype*/{
        _mapState: null,
        _widget: null,
        /**
         * @constructs
         */
        constructor: function() {
        },
        activate: function(componentCtx) {
            // properties are injected
            var props = this._properties;
            // i18n is injected
            var i18n = this._i18n.get().ui;
            // mapstate is injected
            var mapState = this._mapState;

            this._widget = new ExtentWriter({
                extentTemplate: i18n.extentTemplate,
                decimalPlaces: !isNaN(props.decimalPlaces) ? props.decimalPlaces : 3
            });

            this.connect(mapState, "onViewPortChange", this._updateExtent);
            this._updateExtent({
                extent: mapState.getExtent()
            });
        },
        _updateExtent: function(evt) {
            this._widget.set("extent", evt.extent);
        },
        createInstance: function() {
            return this._widget;
        },
        deactivate: function() {
            this.disconnect();
            this._widget.destroy();
            this._widget = null;
        }
    });
});