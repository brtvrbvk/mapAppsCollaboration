define([
        "dojo/_base/declare",
        "dojo/dom-construct",
        "dojo/dom-geometry",
        "dojo/dom-class",
        "dojo/_base/array",
        "dojo/_base/lang",
        "ct/util/css",
        "dijit/_Widget",
        "dijit/_Templated",
        "dojo/text!./templates/CopyrightTextWidget.html",
        "."
    ],
    function (
        declare,
        d_domconstruct,
        d_domgeom,
        domNode,
        d_array,
        d_lang,
        css,
        _Widget,
        _Templated,
        templateStringContent,
        _moduleRoot
        ) {
        /*
         * COPYRIGHT 2011-2012 con terra GmbH Germany
         */
        /**
         * @fileOverview
         * @author gli
         */
        return _moduleRoot.CopyrightWidgetTextWidget = declare(
            [
                _Widget,
                _Templated
            ],
            {
                templateString: templateStringContent,
                i18n: {
                    "title": "Copyright"
                },

                postCreate: function () {
                    this.inherited(arguments);
                },

                setText: function (items) {
                    this.copyrightNode.innerHTML = "";
                    d_array.forEach(items, function (item) {
                        if (item.text && item.text != "") {
                            if (this.copyrightNode.innerHTML == "") {
                                this.copyrightNode.innerHTML = item.text;
                            } else {
                                this.copyrightNode.innerHTML = this.copyrightNode.innerHTML + "<br>" + item.text;
                            }
                        }
                    }, this);
                    d_domgeom.setMarginBox(this.domNode, d_domgeom.getMarginBox(this.copyrightNode));
                }
            });
    });