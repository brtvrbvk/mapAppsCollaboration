define([
        "dojo/_base/lang",
        "dojo/_base/declare",
        "dojo/string",
        "dojo/number",
        "dijit/_WidgetBase",
        "dijit/_TemplatedMixin",
        "dijit/_WidgetsInTemplateMixin",
        "ct/_Connect",
        "base/util/ScaleHelper"
    ],
    function (
        d_lang,
        declare,
        d_string,
        d_number,
        _WidgetBase,
        _TemplatedMixin,
        _WidgetsInTemplateMixin,
        _Connect,
        scaleHelper
        ) {
        /*
         * COPYRIGHT 2011 con terra GmbH Germany
         */
        var substitute = d_string.substitute;

        return declare([
                _WidgetBase,
                _TemplatedMixin,
                _WidgetsInTemplateMixin
            ],
            {
                templateString: "<div><div class='ctScaleViewer' data-dojo-attach-point='scaleNode'></div></div>",

                constructor: function () {
                    this._listeners = new _Connect({
                        defaultConnectScope: this
                    });
                },

                postCreate: function () {
                    this.inherited(arguments);
                    this._updateScale({
                        scale: scaleHelper.getScale(this.mapState.getViewPort())
                    });
                    this._listeners.connect("mapstate", this.mapState, "onViewPortChange",
                        this._handleViewPortChange);
                },

                _handleViewPortChange: function (evt) {
                    //var s=scaleHelper.getOriScale(this.mapState);
                    this._updateScale({
                        scale: scaleHelper.getScale(this.mapState.getViewPort())
                    });
                },

                _updateScale: function (evt) {
                    if (evt.scale === Infinity) {
                        return;
                    }
                    var s = d_number.format(evt.scale, {
                        pattern: "#,###,###"
                    });
                    var lastchar = s.charAt(s.length - 1);
                    if (!(/[0-9]/.test(lastchar))) {
                        // WORKAROUND for MAPAPPS-557 (in compressed build a , or . is appended at the end
                        s = s.substring(0, s.length - 1);
                    }
                    s = s.replace(/\./g, " ");
                    this.scaleNode.innerHTML = substitute(this.scaleTemplate, {
                        scale: s
                    });
                    this._scaleString = s;
                },

                destroy: function () {

                    this._listeners.disconnect();
                    this.inherited(arguments);

                }

            });
    });