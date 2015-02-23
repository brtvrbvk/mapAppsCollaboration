define([
        "esri/layers/DynamicMapServiceLayer",
        "dojo/_base/lang",
        "dojo"
    ],
    function (
        DynamicMapServiceLayer,
        d_lang,
        dojo
        ) {
        d_lang.extend(DynamicMapServiceLayer, {
            _opacityChangeHandler: function (_3f) {
                dojo.style(this._div, "opacity", _3f);
                //fixed for IE8
                if (dojo.isIE && this._img) {
                    dojo.style(this._img, "opacity", _3f);
                }
            }
        });

    });
