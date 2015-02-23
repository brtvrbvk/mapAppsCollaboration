/*
 * COPYRIGHT 2011-2012 con terra GmbH Germany
 */
/**
 * @fileOverview
 * @author fba
 * Definition like
 * {
        "id":"navteq",
        "type":"NAVTEQ",
        "url":"NAVTEQ",
        "options":{
            "tileServers":[
            "http://1.maps.nlp.nokia.com/maptiler/v2/maptile/newest",
            "http://2.maps.nlp.nokia.com/maptiler/v2/maptile/newest",
            "http://3.maps.nlp.nokia.com/maptiler/v2/maptile/newest",
            "http://4.maps.nlp.nokia.com/maptiler/v2/maptile/newest"
            ],
            "appID":"APPID",
            "token":"TOKEN"
            ,
            "lods": [
            {
                "level":0,
                "scale":591657527.591555,
                "resolution":156543.033928
            },{
                "level":1,
                "scale":295828763.795777,
                "resolution":78271.5169639999
            },{
                "level":2,
                "scale":147914381.897889,
                "resolution":39135.7584820001
            },{
                "level":3,
                "scale":73957190.948944,
                "resolution":19567.8792409999
            },{
                "level":4,
                "scale":36978595.474472,
                "resolution":9783.93962049996
            },{
                "level":5,
                "scale":18489297.737236,
                "resolution":4891.96981024998
            },{
                "level":6,
                "scale":9244648.868618,
                "resolution":2445.98490512499
            },{
                "level":7,
                "scale":4622324.434309,
                "resolution":1222.99245256249
            },
            {
                "level":8,
                "scale":2311162.217155,
                "resolution":611.49622628138
            },{
                "level":9,
                "scale":1155581.108577,
                "resolution":305.748113140558
            },{
                "level":10,
                "scale":577790.554289,
                "resolution":152.874056570411
            },
            {
                "level":11,
                "scale":288895.277144,
                "resolution":76.4370282850732
            },{
                "level":12,
                "scale":144447.638572,
                "resolution":38.2185141425366
            },{
                "level":13,
                "scale":72223.819286,
                "resolution":19.1092570712683
            },{
                "level":14,
                "scale":36111.909643,
                "resolution":9.55462853563415
            },{
                "level":15,
                "scale":18055.954822,
                "resolution":4.77731426794937
            },{
                "level":16,
                "scale":9027.977411,
                "resolution":2.38865713397468
            },{
                "level":17,
                "scale":4513.988705,
                "resolution":1.19432856685505
            },{
                "level":18,
                "scale":2256.994353,
                "resolution":0.597164283559817
            }
            ,{
                "level":19,
                "scale":1128.4971765,
                "resolution":0.2985821417389698
            },{
                "level":20,
                "scale":564.24858825,
                "resolution":0.1492910708694849
            }
            ]
        },
        "layers":[
        {
            "id":"normal.day"
        },
        {
            "id":"normal.day.grey"
        },
        {
            "id":"satellite.day"
        },
        {
            "id":"hybrid.day"
        },
        {
            "id":"terrain.day"
        }
        ]
    }
 */
define([
        "dojo/_base/declare",
        "ct/Locale",
        "base/mapping/layers/TiledWebMercatorLayer"
    ],
    function (
        declare,
        Locale,
        TiledWebMercatorLayer
        ) {
        return declare([TiledWebMercatorLayer], {

            constructor: function (
                mock,
                options
                ) {
                //defaultvalues for dev mode
                this._token = options.token || "TOKEN";
                this._appID = options.appid || "APPID";
                this._lang = Locale.getCurrent().getLanguageInspire();
            },

            getTileUrl: function (
                zoom,
                row,
                col
                ) {
                return this.tileServers[row % this.serversLength] + "/" + this._layer + "/" + zoom + "/" + col + "/" + row + "/256/png8?app_id=" + this._appID + "&token=" + this._token + "&lg=" + this._lang;
            }

        });
    });
