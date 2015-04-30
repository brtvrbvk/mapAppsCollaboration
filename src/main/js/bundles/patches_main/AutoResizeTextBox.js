define([
        "ct/ui/controls/forms/AutoResizeTextBox",
        "dojo/_base/lang",
        "dojo/dom-construct",
        "dojo/_base/html",
        "dojo/_base/window"
    ],
    function (
        AutoResizeTextBox,
        d_lang,
        d_domconstruct,
        d_html,
        d_win
        ) {
        var sizeCalcDiv;
        d_lang.extend(AutoResizeTextBox, {
            _calculateWidth: function () {
                var s = d_html.style;
                var node = this.domNode;
                //creating a temp div with current box style to get the value width
                var tmpDiv = sizeCalcDiv || (sizeCalcDiv = d_domconstruct.create("div", {
                    style: {
                        "zIndex": -1000,
                        "position": "absolute",
                        "visibility": "hidden",
                        "border": "none",
                        "margin": "0",
                        "padding": "0"
                    },
                    "class": "stupidDiv"
                }, d_win.body()));

                s(tmpDiv, {
                    "fontSize": s(node, "fontSize") || "12px",
                    "fontFamily": s(node, "fontFamily") || "Arial",
                    "fontWeight": s(node, "fontWeight") || "normal",
                    "fontStyle": s(node, "fontStyle") || "normal"
                });

                var value = this.get("value") || "";
                var placeholder = this.get("placeholder") || "";

                // need "_" at end to precalculate next char into size
                var divVal = (value.length < placeholder.length ? placeholder : value) + "_";
                tmpDiv.innerHTML = divVal.replace(/ /g, '&nbsp;');
                return d_html.contentBox(tmpDiv).w;
            }
        });

    });
