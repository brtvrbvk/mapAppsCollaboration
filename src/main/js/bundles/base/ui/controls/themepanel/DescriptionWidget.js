define([
        "dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/_base/array",
        "dojo/_base/html",
        "dijit/_WidgetBase",
        "dijit/_TemplatedMixin"
    ],
    function (
        declare,
        d_lang,
        d_array,
        d_html,
        _WidgetBase,
        _TemplatedMixin
        ) {
        /*
         * COPYRIGHT 2011 con terra GmbH Germany
         */

        return declare([
                _WidgetBase,
                _TemplatedMixin
            ],
            {
                templateString: "<div data-dojo-attach-point='containerNode'></div>",

                constructor: function (args) {
                    this._content = args.description;
                },

                postCreate: function () {
                    this.inherited(arguments);
                    this.containerNode.innerHTML = this._content;
                },

                destroy: function () {
                    this.inherited(arguments);
                }

            });
    });
