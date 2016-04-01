define([
        "ct/_Connect",
        "dojo/_base/lang",
        "dojo/_base/kernel",
        "dojo/_base/declare",
        "dijit/_Widget",
        "dijit/_Templated",
        "dijit/layout/BorderContainer",
        "dijit/layout/ContentPane",
        "dijit/form/Button",
        "dojo/text!./templates/ReversecapakeyWidget.html",
        "."
    ],
    function (
        _Connect,
        d_lang,
        d_kernel,
        declare,
        _Widget,
        _Templated,
        BorderContainer,
        ContentPane,
        Button,
        templateStringContent,
        _moduleRoot
        ) {
        d_lang.getObject("ReversecapakeyWidget", true, _moduleRoot);
        /*
         * COPYRIGHT 2011-2012 con terra GmbH Germany
         */
        /**
         * @fileOverview
         * @author fba
         */


        _moduleRoot.ReversecapakeyWidget = declare(
            [
                _Widget,
                _Templated
            ],
            /**
             * @lends .prototype
             */
            {
                reversecapakeyHTML: "",
                templateString: templateStringContent,
                widgetsInTemplate: true,

                /**
                 * @constructor
                 */
                constructor: function () {
                    this.handler = new _Connect({
                        defaultConnectScope: this
                    });
                },

                _onOkClick: function () {
                    this.onCloseReversecapakey();
                },

                postCreate: function () {
                    this.inherited(arguments);
                    this.reversecapakeyHTML = this.i18n.ui.reversecapakey;
                    this.htmlnode.set("content", this.reversecapakeyHTML);
                },

                resize: function (args) {
                    this.inherited(arguments);
                    if (this.mainNode) {
                        this.mainNode.resize(args);
                    }
                },
                onCloseReversecapakey: function () {
                }


            });

        return _moduleRoot.ReversecapakeyWidget;
    });