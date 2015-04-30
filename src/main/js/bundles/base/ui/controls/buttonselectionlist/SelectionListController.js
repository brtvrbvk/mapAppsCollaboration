/**
 * COPYRIGHT 2014 con terra GmbH Germany
 *
 * Created by fba on 04.04.2014.
 */
define([
        "dojo/_base/declare",
        "dojo/_base/array",
        "ct/_Connect",
        "ct/Stateful",
        "ct/_when",
        "base/analytics/AnalyticsConstants"
    ],
    function (
        declare,
        d_array,
        Connect,
        Stateful,
        ct_when,
        AnalyticsConstants
        ) {
        return declare([
                Connect,
                Stateful
            ],
            {

                adapter: null,
                model: null,
                selectionTopics: null,

                constructor: function () {

                },

                activate: function () {

                    this.connect("adapter", this.adapter, "onUpdate", "_onUpdate");
                    this.connect("model", this.model, "onSelectionChanged", "_onSelectionChange");

                    ct_when(this.adapter.getItems(), function (items) {

                        this.model.syncItems(items, false, true);
                        this.model.fireUpdateEvent();
                        this._onSelectionChange();

                    }, function (error) {
                        //TODO
                    }, this);

                },

                _onSelectionChange: function () {

                    ct_when(this.model.getSelected(), function (selectedElements) {

                        d_array.forEach(selectedElements, function (elem) {

                            if (this._eventService) {
                                this._eventService.postEvent(AnalyticsConstants.TOPICS.TRACK_EVENT, {
                                    eventType: AnalyticsConstants.EVENT_TYPES[this.eventType],
                                    eventCategory: AnalyticsConstants.CATEGORIES[this.eventCategory],
                                    eventValue: elem.title,
                                    eventCallback: function () {
                                        this.adapter.selectItem(elem);
                                    },
                                    eventCallbackScope: this
                                });
                            } else {
                                this.adapter.selectItem(elem);
                            }

                        }, this);

                    }, function (error) {
                        //TODO
                    }, this);

                    ct_when(this.model.getUnselected(), function (unselectedElements) {

                        d_array.forEach(unselectedElements, function (elem) {

                            this.adapter.deselectItem(elem);

                        }, this);

                    }, function (error) {
                        //TODO
                    }, this);

                },

                _onUpdate: function () {

                    ct_when(this.adapter.getItems(), function (items) {

                        this.model.syncItems(items);

                    }, function (error) {
                        //TODO
                    }, this);

                }
            }
        );
    }
);