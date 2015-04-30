/**
 * COPYRIGHT 2012-2013 con terra GmbH Germany
 *
 * User: fba
 * Date: 13.09.13
 * Time: 10:35
 */
define([
        "dojo/_base/declare",
        "dojo/_base/array",
        "dojo/_base/lang",
        "dojo/string",
        "dojo/number",
        "dijit/_Widget",
        "dijit/_TemplatedMixin",
        "dijit/_WidgetsInTemplateMixin",
        "dojo/text!./templates/FeatureInfoWidget.html",
        "ct/ui/controls/MessagePane"
    ],
    function (
        declare,
        d_array,
        d_lang,
        d_string,
        d_number,
        _Widget,
        _TemplatedMixin,
        _WidgetsInTemplateMixin,
        templateString
        ) {
        var FeatureInfoWidget = declare([
                _Widget,
                _TemplatedMixin,
                _WidgetsInTemplateMixin
            ],
            {
                templateString: templateString,

                attributeMap: d_lang.delegate(_Widget.prototype.attributeMap, {
                        description: [
                            {
                                node: "descriptionNode",
                                type: "innerHTML"
                            }
                        ],
                        duration: [
                            {
                                node: "durationNode",
                                type: "innerHTML"
                            }
                        ],
                        distance: [
                            {
                                node: "distanceNode",
                                type: "innerHTML"
                            }
                        ]
                    }
                ),

                constructor: function () {

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
                    if (this.messagePane.messages.length > 0) {
                        this.messagePane.clearMessages();
                    }
                },

                postCreate: function () {
                    this.inherited(arguments);
                    var attr = this.content && this.content.graphic && this.content.graphic.attributes;
                    if (attr.targets && attr.targets.length === 1) {
                        this.set("description", attr.targets[0].title);
                        return;
                    }
                    if (attr.route) {
                        var routeDesc = d_string.substitute(this.i18n.descriptionLabel, {
                            start: attr.route.start.title,
                            destination: attr.route.destination.title
                        });
                        if (attr.route.stopovers) {
                            var count = attr.route.stopovers.length;
                            d_array.forEach(attr.route.stopovers, function (
                                stopover,
                                index
                                ) {
                                if (index !== count - 1) {
                                    routeDesc = routeDesc + " via " + stopover.end.label
                                }
                            });
                        }
                        this.set("description", routeDesc);

                        var min = attr.route.time / 60;
                        this.set("duration", d_string.substitute(this.i18n.duration, {
                            hour: Math.floor(min / 60),
                            min: d_number.format(Math.round(min % 60), {
                                pattern: "00"
                            })
                        }));

                        this.set("distance", d_string.substitute(this.i18n.distance, {
                            distance: d_number.format(attr.route.distance / 1000, {})
                        }));
                    } else
                        this.set("title", this.i18n.title);
                }
            }
        );
        FeatureInfoWidget.createWidget = function (
            params,
            contentFactory
            ) {
            var opts = contentFactory.get("FeatureInfoWidget");
            return new FeatureInfoWidget({
                content: params.content,
                context: params.context,
                i18n: opts.i18n
            });
        };
        return FeatureInfoWidget;
    }
);