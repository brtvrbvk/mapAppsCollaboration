/**
 * COPYRIGHT 2014 con terra GmbH Germany
 *
 * Created by fba on 16.07.2014.
 */
define([
        "dojo/_base/declare",
        "dojo/_base/lang",
        "ct/Stateful",
        "ct/_Connect",
        "dojo/number",
        "dojo/string",
        "ct/_lang",
        "ct/mapping/LatLon"
    ],
    function (
        declare,
        d_lang,
        Stateful,
        _Connect,
        d_number,
        d_string,
        ct_lang,
        LatLon
        ) {
        return declare([
                Stateful,
                _Connect
            ],
            {

                wgs84Template: "${y}  -  ${x}",
                wgs84TemplateDegree: "${y}\u00B0  -  ${x}\u00B0",
                wgs84DecimalPlaces: 2,
                wgs84DecimalPlacesDegree: 4,
                lambert72Template: "${x} m - ${y} m",
                lambertDecimalPlaces: 2,
                webMercatorTemplate: "${x} m - ${y} m",
                webMercatorDecimalPlaces: 2,
                useDegree: false,

                hemispheres: {
                    north: "NB",
                    south: "Z",
                    east: "OL",
                    west: "W"
                },

                constructor: function () {

                },

                activate: function () {
                    if (this._i18n) {
                        this.i18n = this._i18n.get();
                        this.hemispheres = this.i18n.hemispheres;
                    }
                    this._transformHitch = d_lang.hitch(this, this._updateCoordInfo);
                    if (this.widget) {
                        this.connect("widget", this.widget, "onSwitchDEGREE", "_switchDegree");
                        this.connect("widget", this.widget, "onSwitchDMS", "_switchDms");
                    }
                },

                _setWidget: function (widget) {
                    this.disconnect();
                    this.useDegree = false;
                    this.widget = widget;
                    this._connectWidget();
                },

                _connectWidget: function () {
                    if (this.widget) {
                        this.connect("widget", this.widget, "onSwitchDEGREE", "_switchDegree");
                        this.connect("widget", this.widget, "onSwitchDMS", "_switchDms");
                    }
                },

                _switchDegree: function () {
                    this.useDegree = true;
                    this._updateCoordInfo(this.p);
                },

                _switchDms: function () {
                    this.useDegree = false;
                    this._updateCoordInfo(this.p);
                },

                deactivate: function () {

                },
                _onPosition: function (evt) {
                    if (evt && evt.mapPoint) {
                        // here a bit more check, so that html updates don't break the performance
                        var now = new Date().getTime();
                        var last = this._lastUpdated;
                        var timer = this.timer;
                        this.p = evt.mapPoint;
                        if (!timer || !last || (now - last) > 100) {
                            this._lastUpdated = now;
                            clearTimeout(timer);
                            this.timer = setTimeout(this._transformHitch, 50);
                        }
                    }
                },

                getCoordinateInfo: function (geom) {
                    return this._updateCoordInfo(geom);
                },

                _updateCoordInfo: function (p) {

                    this.p = p || this.p;

                    if (!this.p) {
                        return;
                    }

                    var items = {
                        wgs84: this._transform(this.p, "EPSG:4326", "wgs84Template", "wgs84DecimalPlaces",
                            !this.useDegree, this.useDegree),
                        webMercator: this._transform(this.p, "EPSG:3857", "webMercatorTemplate",
                            "webMercatorDecimalPlaces"),
                        lambert72: this._transform(this.p, "EPSG:31370", "lambert72Template", "lambertDecimalPlaces")
                    };
                    if (this.widget) {
                        this.widget.set(items);
                    }

                    return items;

                },

                _transform: function (
                    geom,
                    srs,
                    template,
                    decimals,
                    asDMS,
                    isDegree
                    ) {

                    decimals = this[decimals + (isDegree ? "Degree" : "")];

                    var point = this.ct.transform(geom, srs),
                        x = point.x,
                        y = point.y;

                    var xString, yString;

                    if (asDMS) {
                        xString = LatLon.parse(x, {
                            hemispheres: this.hemispheres,
                            decimalPlaces: decimals
                        }).asDegree();
                        yString = LatLon.parse(y, {
                            latitudeFirst: true,
                            hemispheres: this.hemispheres,
                            decimalPlaces: decimals
                        }).asDegree();
                        var pattern = /0*/;
                        xString = xString.replace(pattern, "");
                        yString = yString.replace(pattern, "");
                    } else {
                        xString = d_number.format(x, {
                            places: decimals
                        });
                        yString = d_number.format(y, {
                            places: decimals
                        });
                    }

                    xString = xString.replace(".", " ").replace(".", " ");
                    yString = yString.replace(".", " ").replace(".", " ");
                    return d_string.substitute(this[template + (isDegree ? "Degree" : "")], {
                        x: xString,
                        y: yString
                    });

                }

            }
        );
    }
);