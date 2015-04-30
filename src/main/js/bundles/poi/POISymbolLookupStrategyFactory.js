/**
 * COPYRIGHT 2012-2013 con terra GmbH Germany
 *
 * User: mma
 * Date: 02.08.13
 * Time: 14:16
 */
define([
        "dojo/_base/declare",
        "./POISymbolLookupStrategy",
        "dojo/_base/lang",
        "ct/Stateful",
        "."
    ],
    function (
        declare,
        POISymbolLookupStrategy,
        d_lang,
        Stateful,
        _moduleRoot
        ) {
        return _moduleRoot.POISymbolLookupStrategyFactory = declare([Stateful],
            {
                currentColor: 0,
                colorArray: [
                    [
                        0,
                        255,
                        0,
                        160
                    ],
                    [
                        255,
                        0,
                        0,
                        160
                    ],
                    [
                        0,
                        255,
                        255,
                        160
                    ]
                ],
                generalizationThreshold: 500,
                generalizationScale: 100000,
                generate: function () {
                    var colorArray = this.colorArray;
                    var color = colorArray[this.currentColor++];
                    if (this.currentColor >= colorArray.length) this.currentColor = 0;
                    var lookupTable = d_lang.clone(this.lookupTable);
                    //TODO maybe do it recursive?
                    for (var k in lookupTable) {
                        if (lookupTable[k].color && lookupTable[k].color === "colorPlaceholder") {
                            lookupTable[k].color = color;
                        }
                    }
                    var sls = new POISymbolLookupStrategy();
                    sls.configure(this, lookupTable);
                    return sls;
                }
            }
        );
    });