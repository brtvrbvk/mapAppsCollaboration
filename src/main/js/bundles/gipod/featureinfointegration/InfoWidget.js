/**
 * COPYRIGHT 2012-2013 con terra GmbH Germany
 *
 * User: fba
 * Date: 02.10.13
 * Time: 13:17
 */
define([
        "dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/date/locale",
        "dojo/string",
        "base/util/css",
        "dijit/_Widget",
        "dijit/_TemplatedMixin",
        "dijit/_WidgetsInTemplateMixin",
        "dojo/text!./templates/InfoWidget.html",
        "ct/ui/controls/MessagePane",
        "dijit/form/Button"
    ],
    function (
        declare,
        d_lang,
        locale,
        d_string,
        agiv_css,
        _Widget,
        _TemplatedMixin,
        _WidgetsInTemplateMixin,
        templateString
        ) {
        var InfoWidget = declare([
                _Widget,
                _TemplatedMixin,
                _WidgetsInTemplateMixin
            ],
            {

                templateString: templateString,

                attributeMap: d_lang.delegate(_Widget.prototype.attributeMap, {
                        city: [
                            {
                                node: "cityNode",
                                type: "innerHTML"
                            }
                        ],
                        desc: [
                            {
                                node: "descriptionNode",
                                type: "innerHTML"
                            }
                        ],
                        date: [
                            {
                                node: "dateNode",
                                type: "innerHTML"
                            }
                        ],
                        recurrence: [
                            {
                                node: "recurrenceNode",
                                type: "innerHTML"
                            }
                        ]
                    }
                ),

                constructor: function () {

                },

                postCreate: function () {
                    this.inherited(arguments);
                    var graphic = this.content && this.content.graphic && this.content.graphic;
                    if (graphic) {
                        var attr = graphic.attributes;
                        if (attr) {
                            var item = attr.items && attr.items[0];
                            var title = d_string.substitute(this.i18n.title, {
                                city: item.cities && item.cities[0],
                                eventType: item.eventType || this.i18n.workEventType
                            });
                            this.set("title", title);
                            this.set("city", item.cities && item.cities[0]);
                            this.set("desc", item.description);
                            if (item.recurrencePattern) {
                                this.set("recurrence", item.recurrencePattern);
                            } else {
                                this.set("date", item.activePeriod);
                            }
                        }
                        var icon = graphic.symbol;
                        if (icon) {
                            agiv_css.createSelector("." + this.windowName + " .dijitDialogTitle:before",
                                    "background-image:url('" + icon.url + "');background-position:0px 0px;");
                        }
                    }
                },

                _showMessage: function (
                    type,
                    message
                    ) {
                    this._hideMessage();
                    this.messagePane.addMessage({
                        type: type,
                        value: message
                    }, true);
                },

                _hideMessage: function () {
                    this.messagePane.clearMessages();
                },

                _onClick: function () {
                    var ctx = d_lang.mixin({}, this.context);
                    var array = ctx.infotype.split("_");
                    array.pop();
                    ctx.infotype = array.join("_");
                    this.eventService.postEvent("agiv/genericidentify/SHOW_NEXT", {
                        nextContent: this.content,
                        nextContext: ctx
                    });
                },

                onShowDetail: function () {
                },

                resize: function (dim) {
                    if (this.mainnode) {
                        this.mainnode.resize(dim);
                    }
                }
            }
        );
        InfoWidget.createWidget = function (
            params,
            contentFactory
            ) {
            var opts = contentFactory.get("InfoWidget");
            return new InfoWidget({
                content: params.content,
                context: params.context,
                windowName: params.rule.window.windowName,
                i18n: opts.i18n,
                eventService: contentFactory.get("eventService")
            });
        };
        return InfoWidget;
    }
);