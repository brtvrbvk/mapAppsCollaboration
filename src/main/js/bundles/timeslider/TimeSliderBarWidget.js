/**
 * COPYRIGHT 2012-2013 con terra GmbH Germany
 *
 * User: fba
 * Date: 17.12.13
 * Time: 08:27
 */
define([
        "dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/_base/array",
        "dojo/dom-geometry",
        "dijit/_Widget",
        "dijit/_TemplatedMixin",
        "dijit/_WidgetsInTemplateMixin",
        "ct/_Connect",
        "dojo/Evented",
        "dojo/text!./templates/TimeSliderBarWidget.html",
        "dijit/form/HorizontalSlider",
        "dijit/form/ToggleButton",
        "dijit/form/HorizontalRule",
        "dijit/form/HorizontalRuleLabels"

    ],
    function (
        declare,
        d_lang,
        d_array,
        d_domgeom,
        _Widget,
        _TemplatedMixin,
        _WidgetsInTemplateMixin,
        Connect,
        Evented,
        templateString
        ) {
        return declare([
                _Widget,
                _TemplatedMixin,
                _WidgetsInTemplateMixin,
                Evented
            ],
            {

                templateString: templateString,

                baselayerCount: 1,

                constructor: function () {

                    this._listener = new Connect({
                        defaultConnectScope: this
                    });

                },

                postCreate: function () {
                    this.inherited(arguments);

                    this._listener.connect("slider", this.slider, "onChange", "_onSliderChange");

                    this._listener.connect("play", this.playbutton, "onClick", "_onClick");

                },

                resize: function (dim) {
                    this.inherited(arguments);

                    if (dim && dim.w) {
                        d_domgeom.setMarginBox(this.domNode, {w: dim.w});//,h:d_domgeom.getMarginBox(this.domNode).h});
                    }

                },

                _setValueAttr: function (val) {
                    this.slider.set("value", val);
                },

                _setMaximumAttr: function (val) {
                    this._set("maximum", val);
                    this.slider.set("maximum", val);
                },
                _getMaximumAttr: function () {
                    return this.maximum;
                },
                _setMinimumAttr: function (val) {
                    this._set("minimum", val);
                    this.slider.set("minimum", val);
                },
                _getMinimumAttr: function () {
                    return this.minimum;
                },

                _getValueAttr: function () {
                    return this.slider.get("value");
                },

                _onClick: function () {

                    if (this.playbutton.get("checked")) {

                        this.playbutton.set("iconClass", "icon-agiv-pause");
                        this.emit("start", {});

                    } else {

                        this.playbutton.set("iconClass", "icon-agiv-play");
                        this.emit("pause", {});

                    }

                },

                _onSliderChange: function (value) {

                    this.emit("sliderChange", {value: value});

                }

            }
        )
    }
);