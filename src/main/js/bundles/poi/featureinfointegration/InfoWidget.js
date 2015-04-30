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
        "ct/array",
        "ct/util/css",
        "ct/request",
        "ct/_when",
        "ct/_Connect",
        "dijit/_Widget",
        "dijit/_TemplatedMixin",
        "dijit/_WidgetsInTemplateMixin",
        "dojo/text!./templates/InfoWidget.html",
        "ct/ui/controls/MessagePane"
    ],
    function (
        declare,
        d_array,
        d_lang,
        d_string,
        ct_array,
        ct_css,
        ct_request,
        ct_when,
        Connect,
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
                        title: [
                            {
                                node: "labelNode",
                                type: "innerHTML"
                            }
                        ],
                        address: [
                            {
                                node: "addressNode",
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
                    this.messagePane.clearMessages();
                },

                postCreate: function () {
                    this.inherited(arguments);
                    this.set("address", this.content.address);
                    this.set("title", this.content.primaryLabel);
                },
                resize: function (dim) {
                    if (dim) {
                        this.mainContainer.resize({
                            h: dim.h
                        });
                    } else {
                        this.mainContainer.resize();
                    }
                }
            }
        );
        InfoWidget.createWidget = function (
            params,
            contentFactory
            ) {
            return new InfoWidget({
                content: params.content,
                context: params.context
//                i18n:contentFactory.get("ui").FeatureInfoWidget,
//                maxTextLength:contentFactory.get("maxTextLength")
            });
        };
        return InfoWidget;
    }
);