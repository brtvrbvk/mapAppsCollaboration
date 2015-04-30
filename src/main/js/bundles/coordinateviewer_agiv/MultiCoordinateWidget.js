/**
 * COPYRIGHT 2014 con terra GmbH Germany
 *
 * Created by fba on 16.07.2014.
 */
define([
        "dojo/_base/declare",
        "dijit/_WidgetBase",
        "dijit/_TemplatedMixin",
        "dijit/_WidgetsInTemplateMixin",
        "base/ui/genericidentify/_BackEnabledFIWidgetMixin",
        "dojo/text!./templates/MultiCoordinateWidget.html",
        "dijit/form/Select",
        "dijit/form/Button"
    ],
    function (
        declare,
        _WidgetBase,
        _TemplatedMixin,
        _WidgetsInTemplateMixin,
        _BackEnabledFIWidgetMixin,
        templateString
        ) {
        var MultiCoordinateWidget = declare([
                _WidgetBase,
                _TemplatedMixin,
                _WidgetsInTemplateMixin,
                _BackEnabledFIWidgetMixin
            ],
            {

                baseClass: "multiCoordinateViewer",
                templateString: templateString,

                constructor: function () {

                },

                postCreate: function () {
                    this.inherited(arguments);
                    this.set("title", this.i18n.ui.coordinates);
                },

                startup: function () {
                    this.inherited(arguments);
                },

                _setWgs84Attr: function (coord) {
                    this.wgs84Node.innerHTML = coord;
                },

                _setWebMercatorAttr: function (coord) {
                    this.webMercatorNode.innerHTML = coord;
                },

                _setLambert72Attr: function (coord) {
                    this.lambert72Node.innerHTML = coord;
                },

                _onTypeChange: function (evt) {
                    this["onSwitch" + evt]();
                },

                onSwitchDMS: function () {
                },
                onSwitchDEGREE: function () {
                }
            }
        );

        MultiCoordinateWidget.createWidget = function (
            params,
            contentFactory
            ) {
            var ctrl = contentFactory.get("multiCoordinateController");
            var w = new MultiCoordinateWidget({
                i18n: contentFactory.get("ui").MultiCoordinateWidget,
                backEnabled: params.context.backEnabled,
                eventService: contentFactory.get("eventService")
            });
            ctrl.set("widget", w);
            ctrl.getCoordinateInfo(params.content.geometry);
            return w;
        };

        return MultiCoordinateWidget;
    }
);