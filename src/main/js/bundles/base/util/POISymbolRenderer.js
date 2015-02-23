/**
 * COPYRIGHT 2012-2013 con terra GmbH Germany
 *
 * User: fba
 * Date: 19.09.13
 * Time: 13:19
 */
define([
        "dojo/_base/declare",
        "dojo/_base/lang",
        "dojox/gfx",
        "ct/Stateful"
    ],
    function (
        declare,
        d_lang,
        d_gfx,
        Stateful
        ) {
        return declare([Stateful],
            {
                _table: {
                    simplemarkersymbol: {
                        circle: {
                            renderfunc: "createCircle",
                            options: {
                                r: 10,
                                cx: 10,
                                cy: 10
                            }
                        }
                    }
                },

                constructor: function () {

                },

                renderSymbol: function (
                    node,
                    symbol
                    ) {
                    //create surface with 2px border to the symbol
                    var surfaceSize = symbol.size + 4;
                    var s = d_gfx.createSurface(node, surfaceSize, surfaceSize);
                    var rendertype = this._table[symbol.type];
                    rendertype = rendertype ? rendertype[symbol.style] : null;
                    var renderFunc = rendertype ? rendertype.renderfunc : null;
                    if (renderFunc) {
                        var opts = rendertype.options;
                        var outline = symbol.outline;
                        var radius = symbol.size / 2;
//                        var radius = symbol.size/2-(outline?outline.width:0);
                        opts = d_lang.mixin(opts, {
                            r: radius,
                            cx: surfaceSize / 2,
                            cy: surfaceSize / 2
                        })
                        var obj = s[renderFunc] ? s[renderFunc].call(s, opts) : null;
                        if (obj) {
                            obj = obj.setFill(symbol.color.toRgba());
                            if (outline) {
                                obj.setStroke({
                                    style: outline.style,
                                    width: outline.width,
                                    color: outline.color.toRgba()
                                })
                            }
                        }
                    }
                }
            }
        )
    }
);