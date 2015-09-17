/*
 * COPYRIGHT 2011-2012 con terra GmbH Germany
 */
/**
 * @fileOverview
 * @author fba
 */
define([
        "dojo/_base/lang",
        "dojo/_base/kernel",
        "dojo/_base/array",
        "dojo/query",
        "dojox/xml/parser",
        "esri/geometry/Extent",
        "esri/layers/WMTSLayer",
        "esri/layers/TileInfo",
        "esri/SpatialReference",
        "esri/lang"
    ],
    function (
        d_lang,
        d_kernel,
        d_array,
        query,
        dx_parser,
        Extent,
        WMTS,
        TileInfo,
        SpatialReference,
        e_lang
        ) {

        var oldGetCaps = WMTS.prototype._getCapabilities,
            oldParseCaps = WMTS.prototype._parseCapabilities,
            old_initTiledLayer = WMTS.prototype._initTiledLayer;
        d_lang.extend(WMTS, {
            _initTiledLayer: function () {
                old_initTiledLayer.apply(this, arguments);
                this._hasMin = false;
                this._hasMax = false;
                this.setMinScale(null);
                this.setMaxScale(null);
                this.minScale = 0;
                this.maxScale = 0;
            },
            _getCapabilities: function () {
                if (window.capabilitiesMap && window.capabilitiesMap[this._url] && d_lang.isString(window.capabilitiesMap[this._url])) {
                    this._parseCapabilities(window.capabilitiesMap[this._url]);
                } else {
                    oldGetCaps.apply(this, arguments);
                }
            },
            _parseCapabilities: function (_e) {
                if (!window.capabilitiesMap) {
                    window.capabilitiesMap = {};
                }
                window.capabilitiesMap[this._url] = _e;
                oldParseCaps.apply(this, arguments);
            },
            //PATCHED new method, splits EPSG correctly
            _getTagWithChildTagValue: function (
                _3e,
                _3f,
                _40,
                xml
                ) {
                var _41 = xml.childNodes;
                var _42;
                for (var j = 0; j < _41.length; j++) {
                    if (_41[j].nodeName === _3e) {
                        if (d_kernel.isIE) {
                            if (e_lang.isDefined(query(_3f, _41[j])[0])) {
                                _42 = query(_3f, _41[j])[0].childNodes[0].nodeValue;
                            }
                        } else {
                            if (e_lang.isDefined(query(_3f, _41[j])[0])) {
                                _42 = query(_3f, _41[j])[0].textContent;
                            }
                        }
                        if (_42 === _40 || _42 === _40.split(":")[1]) {
                            return _41[j];
                        }
                    }
                }
            },
            //PATCHED to make KVP loading the default method
            _getTileUrlTemplate: function (
                a,
                b,
                e,
                c
                ) {
                var d;
                a || (a = this._identifier);
                b || (b = this._tileMatrixSetId);
                e || (e = this.format);
                c || (c = this._style);
                if ("KVP" === this.serviceMode) {
                    d = this._url + "SERVICE\x3dWMTS\x26VERSION\x3d" + this.version + "\x26REQUEST\x3dGetTile\x26LAYER\x3d" +
                        a + "\x26STYLE\x3d" + c + "\x26FORMAT\x3d" + e + "\x26TILEMATRIXSET\x3d" + b + "\x26TILEMATRIX\x3d{level}\x26TILEROW\x3d{row}\x26TILECOL\x3d{col}";
                } else if ("RESTful" === this.serviceMode) {
                    d = "",
                        this._formatDictionary[e.toLowerCase()] && (d = this._formatDictionary[e.toLowerCase()]),
                        d = this._url + a + "/" + c + "/" + b + "/{level}/{row}/{col}" + d;
                } else {
                    if (this.resourceUrls && 0 < this.resourceUrls.length) {
                        d = this.resourceUrls[0].template, d = d.replace(/\{Style\}/gi,
                            c), d = d.replace(/\{TileMatrixSet\}/gi, b), d = d.replace(/\{TileMatrix\}/gi,
                            "{level}"), d = d.replace(/\{TileRow\}/gi, "{row}"), d = d.replace(/\{TileCol\}/gi,
                            "{col}");
                    }
                }
                return d;
            },
            //PATCHED to make KVP loading the default method
            getTileUrl: function (
                a,
                b,
                e
                ) {
                a = this._levelToLevelValue[a];
                a = this.UrlTemplate.replace(/\{level\}/gi, a).replace(/\{row\}/gi, b).replace(/\{col\}/gi, e);
                return a = this.addTimestampToURL(a);
            }
        });
        //PATCHED to not flip axis for 900913
        WMTS.prototype._flippingAxisForWkids = [
            [
                3819,
                3819
            ],
            [
                3821,
                3824
            ],
            [
                3889,
                3889
            ],
            [
                3906,
                3906
            ],
            [
                4001,
                4025
            ],
            [
                4027,
                4036
            ],
            [
                4039,
                4047
            ],
            [
                4052,
                4055
            ],
            [
                4074,
                4075
            ],
            [
                4080,
                4081
            ],
            [
                4120,
                4176
            ],
            [
                4178,
                4185
            ],
            [
                4188,
                4216
            ],
            [
                4218,
                4289
            ],
            [
                4291,
                4304
            ],
            [
                4306,
                4319
            ],
            [
                4322,
                4326
            ],
            [
                4463,
                4463
            ],
            [
                4470,
                4470
            ],
            [
                4475,
                4475
            ],
            [
                4483,
                4483
            ],
            [
                4490,
                4490
            ],
            [
                4555,
                4558
            ],
            [
                4600,
                4646
            ],
            [
                4657,
                4765
            ],
            [
                4801,
                4811
            ],
            [
                4813,
                4821
            ],
            [
                4823,
                4824
            ],
            [
                4901,
                4904
            ],
            [
                5013,
                5013
            ],
            [
                5132,
                5132
            ],
            [
                5228,
                5229
            ],
            [
                5233,
                5233
            ],
            [
                5246,
                5246
            ],
            [
                5252,
                5252
            ],
            [
                5264,
                5264
            ],
            [
                5324,
                5340
            ],
            [
                5354,
                5354
            ],
            [
                5360,
                5360
            ],
            [
                5365,
                5365
            ],
            [
                5370,
                5373
            ],
            [
                5381,
                5381
            ],
            [
                5393,
                5393
            ],
            [
                5451,
                5451
            ],
            [
                5464,
                5464
            ],
            [
                5467,
                5467
            ],
            [
                5489,
                5489
            ],
            [
                5524,
                5524
            ],
            [
                5527,
                5527
            ],
            [
                5546,
                5546
            ],
            [
                2044,
                2045
            ],
            [
                2081,
                2083
            ],
            [
                2085,
                2086
            ],
            [
                2093,
                2093
            ],
            [
                2096,
                2098
            ],
            [
                2105,
                2132
            ],
            [
                2169,
                2170
            ],
            [
                2176,
                2180
            ],
            [
                2193,
                2193
            ],
            [
                2200,
                2200
            ],
            [
                2206,
                2212
            ],
            [
                2319,
                2319
            ],
            [
                2320,
                2462
            ],
            [
                2523,
                2549
            ],
            [
                2551,
                2735
            ],
            [
                2738,
                2758
            ],
            [
                2935,
                2941
            ],
            [
                2953,
                2953
            ],
            [
                3006,
                3030
            ],
            [
                3034,
                3035
            ],
            [
                3038,
                3051
            ],
            [
                3058,
                3059
            ],
            [
                3068,
                3068
            ],
            [
                3114,
                3118
            ],
            [
                3126,
                3138
            ],
            [
                3150,
                3151
            ],
            [
                3300,
                3301
            ],
            [
                3328,
                3335
            ],
            [
                3346,
                3346
            ],
            [
                3350,
                3352
            ],
            [
                3366,
                3366
            ],
            [
                3389,
                3390
            ],
            [
                3416,
                3417
            ],
            [
                3833,
                3841
            ],
            [
                3844,
                3850
            ],
            [
                3854,
                3854
            ],
            [
                3873,
                3885
            ],
            [
                3907,
                3910
            ],
            [
                4026,
                4026
            ],
            [
                4037,
                4038
            ],
            [
                4417,
                4417
            ],
            [
                4434,
                4434
            ],
            [
                4491,
                4554
            ],
            [
                4839,
                4839
            ],
            [
                5048,
                5048
            ],
            [
                5105,
                5130
            ],
            [
                5253,
                5259
            ],
            [
                5269,
                5275
            ],
            [
                5343,
                5349
            ],
            [
                5479,
                5482
            ],
            [
                5518,
                5519
            ],
            [
                5520,
                5520
            ],
            [
                20004,
                20032
            ],
            [
                20064,
                20092
            ],
            [
                21413,
                21423
            ],
            [
                21473,
                21483
            ],
            [
                21896,
                21899
            ],
            [
                22171,
                22177
            ],
            [
                22181,
                22187
            ],
            [
                22191,
                22197
            ],
            [
                25884,
                25884
            ],
            [
                27205,
                27232
            ],
            [
                27391,
                27398
            ],
            [
                27492,
                27492
            ],
            [
                28402,
                28432
            ],
            [
                28462,
                28492
            ],
            [
                30161,
                30179
            ],
            [
                30800,
                30800
            ],
            [
                31251,
                31259
            ],
            [
                31275,
                31279
            ],
            [
                31281,
                31290
            ],
            [
                31466,
                31700
            ]
//            [900913, 900913]
        ];

    });
