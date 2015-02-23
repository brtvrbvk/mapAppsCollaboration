/**
 * COPYRIGHT 2014 con terra GmbH Germany
 *
 * Created by tfu on 15.08.2014.
 */
define([
        "dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/_base/array",
        "dijit/_WidgetBase",
        "dijit/_TemplatedMixin",
        "dijit/_WidgetsInTemplateMixin",
        "./_GriddedWidgetMixin",
        "dojo/text!./templates/CalendarWidget.html",
        "dijit/layout/ContentPane",
        "dijit/layout/BorderContainer"
    ],
    function (
        declare,
        d_lang,
        d_array,
        _WidgetBase,
        _TemplatedMixin,
        _WidgetsInTemplateMixin,
        _GriddedWidgetMixin,
        templateString
        ) {
        var CalendarWidget = declare([
                _WidgetBase,
                _TemplatedMixin,
                _WidgetsInTemplateMixin,
                _GriddedWidgetMixin
            ],
            {

                baseClass: "ctGipodResultCalendar",
                templateString: templateString,

                _gridContext: {
                    infotype: "GIPOD_CALENDAR_GRID"
                },

                _dateFormat: "EEE dd/MM/yyyy",
                _timeFormat: "HH:mm",

                constructor: function () {

                },

                postCreate: function () {
                    this.labelNode.innerHTML = this.content.recurrencePattern;
                    this._createRecurrenceData();

                    this.inherited(arguments);

                    this.title = this.i18n.title;
                    this.eventService.postEvent("agiv/calendar/UPDATE_PRINT_INFO", {hasCalendar: true});
                },

                destroyRecursive: function () {
                    if (this._registration) {
                        this._registration.unregister();
                        this._registration = null;
                        this.eventService.postEvent("agiv/calendar/UPDATE_PRINT_INFO", {hasCalendar: false});
                    }
                    this.inherited(arguments);
                },

                destroy: function () {
                    if (this._registration) {
                        this._registration.unregister();
                        this._registration = null;
                        this.eventService.postEvent("agiv/calendar/UPDATE_PRINT_INFO", {hasCalendar: false});
                    }
                    this.inherited(arguments);
                },

                _createRecurrenceData: function () {
                    var fields = [];
                    var recurrenceObj = {};

                    var periods = this.content.periods;
                    d_array.some(periods, function (
                        period,
                        index
                        ) {
                        var num = index + 1;
                        if (num > this.maxAllowed) {
                            return true;
                        }
                        fields.push({
                            name: num,
                            title: period.startdate
                        });
                        recurrenceObj[num] = period.enddate;
                        return false;
                    }, this);

                    this.metadata = {
                        fields: fields
                    };
                    this.content = d_lang.mixin({
                        description: this.content.recurrencePattern
                    }, recurrenceObj);

                    if (periods.length > this.maxAllowed) {
                        this.maxAllowedNode.innerHTML = this.i18n.exceedAllowed;
                        return;
                    }
                },

                resize: function (dim) {
                    if (this.mainnode) {
                        this.mainnode.resize(dim);
                    }
                }
            });

        CalendarWidget.createWidget = function (
            params,
            contentFactory
            ) {
            var opts = contentFactory.get("CalendarWidget");
            var widget = new CalendarWidget({
                content: params.content,
                context: params.context,
                i18n: opts.i18n,
                maxAllowed: opts.maxAllowed,
                contentviewer: contentFactory.get("contentviewer"),
                eventService: contentFactory.get("eventService")
            });

            var bundleCtx = contentFactory._componentContext.getBundleContext();
            widget._registration = bundleCtx.registerService(["gipod.CalendarWidget"], widget);

            return widget;
        };
        return CalendarWidget;
    });