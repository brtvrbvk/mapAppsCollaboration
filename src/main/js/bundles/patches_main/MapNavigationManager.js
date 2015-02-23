define([
    "esri/MapNavigationManager",
    "dojo/sniff",
    "esri/lang"
], function (
    MapNavigationManager,
    d_sniff,
    e_lang
    ) {
    //PATCHED for IE11 mousewheel scrolling
    MapNavigationManager.prototype._wheelZoom = function (
        a,
        b
        ) {
        var c = this.map;
        if (!b) {
            if (c.smartNavigation && !a.shiftKey && !c._isPanningOrZooming()) {
                c.disableScrollWheelZoom();
                this._setScrollWheelPan(!0);
                this._wheelPan(a);
                return
            }
            var d = a.timeStamp;
            if (!e_lang.isDefined(d) || 0 >= d)d = (new Date).getTime();
            if (100 > (this._mwts ? d - this._mwts : d))return;
            this._mwts = d
        }

        //PATCH
        //there is currently no better way to identify an IE11 instead of mspointer
        if (!d_sniff("ie") && d_sniff("mspointer")) {
            //make the value correction for negative zooming
            a.value = a.value * a.wheelDelta / Math.abs(a.wheelDelta);
        }

        c._canZoom(a.value) && c._extentUtil({numLevels: a.value, mapAnchor: a.mapPoint, screenAnchor: a.screenPoint})
    };
    return MapNavigationManager;
});