define([
    "dojo/_base/lang", "dojo/_base/declare", "dojo/string", "dojo/number", "dijit/_Widget", "dijit/_TemplatedMixin"
], function(d_lang, declare, d_string, d_number, _Widget, _TemplatedMixin) {

    var substitute = d_string.substitute;
    var format = d_number.format;

    return declare([_Widget, _TemplatedMixin], /** @lends sample.extentwriter.ExtentWriter.prototype*/{
        baseClass: "ctExtentWriter",
        templateString: "<div><span class='${baseClass}Extent' dojoAttachPoint='extentNode'></span></div>",
        attributeMap: d_lang.delegate(_Widget.prototype.attributeMap, {
            extenttxt: [
                {
                    node: "extentNode",
                    type: "innerHTML"
                }]
        }),
        extentTemplate: "${extent.xmin}; ${extent.ymin} - ${extent.xmax}; ${extent.ymax}",
        extent: {
            xmin: -1,
            ymin: -1,
            xmax: -1,
            ymax: -1
        },
        decimalPlaces: 3,
        /**
         * @constructs
         */
        constructor: function() {
        },
        postCreate: function() {
            this.inherited(arguments);
        },
        _setExtentAttr: function(extent) {
            // in initial case don't try to format strings
            this.extent = extent;
            var decimalPlaces = this.decimalPlaces;
            var ext = {
                xmin: this._format(extent.xmin, decimalPlaces),
                xmax: this._format(extent.xmax, decimalPlaces),
                ymin: this._format(extent.ymin, decimalPlaces),
                ymax: this._format(extent.ymax, decimalPlaces)
            };
            var txt = substitute(this.extentTemplate, {
                extent: ext
            });
            this.set("extenttxt", txt);
        },
        _format: function(num, places) {
            return format(num, {
                places: places
            });
        }
    });
});