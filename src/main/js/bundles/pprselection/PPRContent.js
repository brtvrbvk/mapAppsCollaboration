define([
        "dojo/_base/lang",
        "dojo/_base/declare",
        "dojo/date/locale",
        "dojo/string",
        "dijit/_Widget",
        "dijit/_Templated",
        "dojo/text!./templates/PPRContent.html"
    ],
    function (
        d_lang,
        declare,
        d_locale,
        d_string,
        _Widget,
        _Templated,
        templateStringContent
        ) {
        /*
         * COPYRIGHT 2011-2012 con terra GmbH Germany
         */
        /**
         * @fileOverview
         * @author fba
         */


        var PPRInfoContent = declare(
            [
                _Widget,
                _Templated
            ],
            /**
             * @lends .prototype
             */
            {
                baseClass: "ctInfoContent",
                templateString: templateStringContent,
                widgetsInTemplate: true,

                attributeMap: d_lang.delegate(_Widget.prototype.attributeMap, {
                    beneficiary: [
                        {
                            node: "beneficiaryNode",
                            type: "innerHTML"
                        }
                    ],
                    municipality: [
                        {
                            node: "municipalityNode",
                            type: "innerHTML"
                        }
                    ],
                    order: [
                        {
                            node: "orderNode",
                            type: "innerHTML"
                        }
                    ],
                    parcelID: [
                        {
                            node: "parcelIDNode",
                            type: "innerHTML"
                        }
                    ],
                    type: [
                        {
                            node: "typeNode",
                            type: "innerHTML"
                        }
                    ]
                }),

                /**
                 * @constructor
                 */
                constructor: function () {

                },

                _setContentAttr: function (content) {
                    this._set("content", content);
                    this.set("beneficiary", content.beneficiary || "--");
                    this.set("municipality", content.municipality || "--");
                    this.set("type", content.ppr_type || "--");
                    this.set("order", content.order || "--");
                    this.set("parcelID", content.parcelID || "--");
                    var d = d_locale.format(new Date(), {
                        datePattern: this.parameters.dateFormatter,
                        selector: "date"
                    });
                    var res = d_string.substitute(this.ui.result, {
                        index: content.idx,
                        total: content.totalCount
                    });
                    this.set("title", res + ": " + content.municipality + ", " + content.parcelID + ", " + d);
                },

                _handleOpenDetailsClick: function (btnEvt) {
                    // fire onShowDetail, intercepted by _ContentWidgetFactory
                    this.onShowDetail();
                },

                onShowDetail: function () {
                }


            });
        PPRInfoContent.createWidget = function (
            params,
            contentFactory
            ) {
            return new PPRInfoContent(d_lang.mixin(params, {
                ui: contentFactory.get("ui").PPR,
                parameters: contentFactory.get("parameters").PPR.info
            }));
        };

        return PPRInfoContent;
    });
