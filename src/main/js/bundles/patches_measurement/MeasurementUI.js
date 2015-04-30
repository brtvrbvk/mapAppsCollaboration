define([
    "dojo/_base/lang",
    "measurement/MeasurementUI",
    "dijit/registry",
    "dojo/number",
    "dojo/text!./templates/Measurement.html"
], function (
    d_lang,
    MeasurementUI,
    e,
    t,
    templateString
    ) {
    /*
     * COPYRIGHT 2010-2011 con terra GmbH Germany
     */
    d_lang.extend(MeasurementUI, {
        _outputResult: function (
            a,
            b
            ) {
            var c = a * this.unitDictionary[b];
            // patch: replace dot with space
            //remove format from content
            0 === c ? e.byNode(this.resultValue.domNode).setAttribute("content",
                "") : 1E6 < c ? e.byNode(this.resultValue.domNode).setAttribute("content",
                t.format(c.toPrecision(9), {pattern: this.numberPattern}).replace(/\./g,
                    " ")) : e.byNode(this.resultValue.domNode).setAttribute("content",
                t.format(c.toFixed(2), {pattern: this.numberPattern}).replace(/\./g, " "));
        },
        templateString: templateString
    });
});