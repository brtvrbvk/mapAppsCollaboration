/**
 * COPYRIGHT 2012-2013 con terra GmbH Germany
 *
 * User: fba
 * Date: 16.05.13
 * Time: 15:18
 */
define([
        "dojo/_base/declare",
        "dojo/dom-construct",
        "dijit/_WidgetBase"
    ],
    function (
        declare,
        d_dom,
        _WidgetBase
        ) {
        return declare([_WidgetBase],
            {


                constructor: function () {

                },

                activate: function (compCtx) {
                    this._compCtx = compCtx;
                },

                createInstance: function () {
                    this.baseClass = this.imgClass;
                    var url = this._compCtx.getResourceURL(this.img);
                    d_dom.create("img", {
                        src: url,
                        "class": this.imgClass
                    }, this.domNode);

                    return this;
                }
            }
        )
    }
);