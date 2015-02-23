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
        "dojo/text!./templates/DisclaimerWidget.html",
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
        d_lang.getObject("DisclaimerWidget", true, _moduleRoot);
        /*
         * COPYRIGHT 2011-2012 con terra GmbH Germany
         */
        /**
         * @fileOverview
         * @author fba
         */


        _moduleRoot.DisclaimerWidget = declare(
            [
                _Widget,
                _Templated
            ],
            /**
             * @lends .prototype
             */
            {
                disclaimerHTML: "",
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
                    this.onCloseDisclaimer();
                },

                postCreate: function () {
                    this.inherited(arguments);
                    this.disclaimerHTML = this.i18n.ui.disclaimer;
                    this.htmlnode.set("content", this.disclaimerHTML);
                },

                resize: function (args) {
                    this.inherited(arguments);
                    if (this.mainNode) {
                        this.mainNode.resize(args);
                    }
                },
                onCloseDisclaimer: function () {
                }


            });

        return _moduleRoot.DisclaimerWidget;
    });