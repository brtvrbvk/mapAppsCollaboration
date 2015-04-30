define([
        "dojo/_base/declare",
        "dojo/_base/array",
        "dojo/_base/lang",
        "dojo/string",
        "ct/array",
        "ct/util/css",
        "ct/_when",
        "ct/_Connect",
        "dijit/_Widget",
        "dijit/_TemplatedMixin",
        "dijit/_WidgetsInTemplateMixin",
        "base/analytics/AnalyticsConstants",
        "base/util/css",
        "dojo/text!./templates/FeatureInfoWidget.html",
        "dijit/layout/TabContainer"
    ],
    function (declare, d_array, d_lang, d_string, ct_array, ct_css, ct_when, Connect, _Widget, _TemplatedMixin, _WidgetsInTemplateMixin, AnalyticsConstants, agiv_css, templateStringContent) {
        /*
         * COPYRIGHT 2012 con terra GmbH Germany
         */
        /**
         * @fileOverview This file provides a feature info widget.
         */
        var FeatureInfoWidget = declare([
                _Widget,
                _TemplatedMixin,
                _WidgetsInTemplateMixin
            ],
            {
                baseClass: "ctGipodInfoResult",
                templateString: templateStringContent,

                attributeMap: d_lang.delegate(_Widget.prototype.attributeMap, {
                    }
                ),

                constructor: function () {
                },

                postCreate: function () {

                    this.inherited(arguments);

                    var store = this.context.store;
                    var g = this.content.graphic;

                    if (g && g.attributes && !g.attributes.isCluster) {

                        var item = g.attributes.items[0];
                        var title = d_string.substitute(this.i18n.title, {
                            city: item.cities && item.cities[0],
                            eventType: item.eventType || this.i18n.workEventType
                        });
                        this.title = title;

                        var icon = g.symbol;
                        agiv_css.createSelector("." + this.windowName.split(" ").join(".") + " .dijitDialogTitle:before",
                                "background-image:url('" + icon.url + "');background-position:0px 0px;");
                        ct_when(store.query({}, {
                            rest: "/" + item.gipodId
                        }), function (res) {

                            var item = res[0].items[0];

                            d_array.forEach(this.tabs, function (tabname) {

                                var add = true;

                                if (tabname === "GIPOD_DIVERSIONS_TAB") {

                                    if (!item.diversions || item.diversions.length === 0) {
                                        add = false;
                                    }

                                }

                                if (tabname === "GIPOD_CALENDAR_TAB" && !item.recurrencePattern) {
                                    add = false;
                                }

                                if (add) {

                                    var c = d_lang.mixin({
                                    }, this.context);
                                    c.infotype = tabname;

                                    ct_when(this.contentviewer.resolveContentWidget(item,
                                            c),
                                        function (w) {

                                            if (w && this.tabcontainer) {
                                                this.tabcontainer.addChild(w);
                                            }

                                        }, function (err) {

                                        }, this);

                                }

                            }, this);

                        }, function (err) {
                            console.error(err);
                        }, this);

                        if (this.eventService) {
                            this.eventService.postEvent(AnalyticsConstants.TOPICS.TRACK_EVENT, {
                                eventType: AnalyticsConstants.EVENT_TYPES["IDENTIFY_DETAIL_" + item.gipodType.toUpperCase()],
                                eventCategory: AnalyticsConstants.CATEGORIES.IDENTIFY_DETAIL,
                                eventValue: ""
                            });
                            this.eventService.postEvent("agiv/print/SHOW_DIALOG", {printDialog: "hik"});
                        }

                    }

                },

                destroy: function () {
                    this.eventService.postEvent("agiv/print/SHOW_DIALOG", {printDialog: "basic"});
                    this.inherited(arguments);
                },

                startup: function () {
                    this.inherited(arguments);

                },

                resize: function (dim) {
                    this.tabcontainer.resize(dim);
                }
            });
        FeatureInfoWidget.createWidget = function (params, contentFactory) {
            var opts = contentFactory.get("FeatureInfoWidget");
            return new FeatureInfoWidget({
                content: params.content,
                context: params.context,
                windowName: params.rule.window.windowName,
                i18n: opts.i18n,
                tabs: opts.tabs,
                contentviewer: contentFactory.get("contentviewer"),
                eventService: contentFactory.get("eventService")
            });
        };
        return FeatureInfoWidget;
    });