/**
 * COPYRIGHT 2014 con terra GmbH Germany
 *
 * Created by tfu on 26.08.2014.
 */
define([
        "dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/_base/array"
    ],
    function (
        declare,
        d_lang,
        d_array
        ) {
        return declare([],
            {
                KEY: "calendar",
                NAME: "Calendar",
                EMPTY_TYPE: [],
                DATAFORM_ELEMENT: [
                    {
                        "type": "checkbox",
                        "disabled": true,
                        "field": "print.calendar",
                        "label": "Kalender"
                    }
                ],

                constructor: function () {

                },

                _updatePrintInfo: function (evt) {

                    var hasCalendar = evt.getProperty("hasCalendar");
                    this.DATAFORM_ELEMENT[0].disabled = !hasCalendar;
                    this._eventService.postEvent("agiv/hik/UPDATE_DIALOG");

                },

                readPrintData: function () {
                    return this.createCalendarJson();
                },

                createCalendarJson: function () {
                    var w = this._calendarWidget;
                    if (!w) {
                        return{};
                    }
                    var items = w.store && w.store.data;
                    var calendarItem = {
                        description: w.content.description,
                        tables: [
                            {table: this._getFilteredAttributes(items, w.metadata)}
                        ]
                    };
                    var json = {
                        calendar: [calendarItem]
                    };
                    return json;
                },

                _getFilteredAttributes: function (
                    items,
                    metadata
                    ) {
                    var itemsList = [];
                    // items has only one element
                    var item = items[0];
                    var fields = metadata.fields;
                    d_array.forEach(fields, d_lang.hitch(this, function (field) {
                        itemsList.push({
                            attribute: field.title,
                            value: item[field.name]
                        });
                    }));
                    return itemsList;
                }
            }
        );
    }
);