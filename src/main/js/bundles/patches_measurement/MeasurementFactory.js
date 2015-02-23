define([
    "dojo/_base/lang",
    "measurement/MeasurementFactory",
    "measurement/MeasurementUI",
    "esri/tasks/GeometryService",
    "esri/units"
], function (
    d_lang,
    MeasurementFactory,
    MeasurementUI,
    GeometryService,
    units,
    undefined
    ) {
    /*
     * COPYRIGHT 2010-2011 con terra GmbH Germany
     */
    d_lang.extend(MeasurementFactory, {
        createInstance: function () {
            var i18n = this._i18n.get(),
                map = this._esriMap,
                props = this._properties || {},
            // deprecated property
                geometryServiceURL = props.geometryServiceURL;

            var geometryService = this._geometryService;
            if (geometryServiceURL && (!geometryService || geometryService.url !== geometryServiceURL)) {
                // replace geometry service only if urls are different
                geometryService = new GeometryService(geometryServiceURL);
            }
            // patch: add the numberPattern parameter
            return new MeasurementUI({
                map: map,
                i18n: i18n,
                _geometryService: geometryService,
                defaultLengthUnit: units[props.defaultLengthUnit],
                defaultAreaUnit: units[props.defaultAreaUnit],
                defaultLocationUnit: units[props.defaultLocationUnit],
                pointSymbol: props.pointSymbol,
                lineSymbol: props.lineSymbol,
                finishWithButton: props.finishWithButton,
                showTools: props.showTools || [],
                defaultTool: props.defaultTool,
                skipAreaUnits: props.skipAreaUnits,
                skipLengthUnits: props.skipLengthUnits,
                skipLocationUnits: props.skipLocationUnits,
                numberPattern: props.numberPattern
            });
        }
    });
});