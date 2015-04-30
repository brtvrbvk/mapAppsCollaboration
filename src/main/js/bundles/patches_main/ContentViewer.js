/**
 * COPYRIGHT 2014 con terra GmbH Germany
 *
 * Created by fba on 18.08.2014.
 */
define([
        "dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/aspect",
        "contentviewer/ContentViewer",
        "ct/_lang"
    ],
    function (declare, d_lang, d_aspect, ContentViewer, ct_lang) {

        d_aspect.around(ContentViewer.prototype, "_displayWindow", function (origDisplay) {

            return function (widget, point, rule) {
                var windowProps = rule.window || {};
                if (!windowProps.marginBox) {
                    var marginBox = rule.windowSize || {};
                    windowProps.marginBox = {
                        w: marginBox.width || marginBox.w || undefined,
                        h: marginBox.height || marginBox.h || undefined,
                        l: ct_lang.chk(marginBox.left || marginBox.l, undefined),
                        t: ct_lang.chk(marginBox.top || marginBox.t, undefined),
                        r: ct_lang.chk(marginBox.right || marginBox.r, undefined),
                        b: ct_lang.chk(marginBox.bottom || marginBox.b, undefined)
                    };
                }
                rule.window = windowProps;
                return origDisplay.apply(this, [widget, point, rule]);
            }

        });

//        d_lang.extend(ContentViewer, {
//            //PATCH to ensure relative sizing of windows from contentviewer
//            //https://issuetracker02.eggits.net/browse/MAPAPPS-2902
//            _displayWindow: function (widget, point, rule) {
//                var windowProps = rule.window || {};
//                if (!windowProps.marginBox) {
//                    var marginBox = rule.windowSize || {};
//                    windowProps.marginBox = {
//                        w: marginBox.width || marginBox.w || undefined,
//                        h: marginBox.height || marginBox.h || undefined,
//                        l: ct_lang.chk(marginBox.left || marginBox.l, undefined),
//                        t: ct_lang.chk(marginBox.top || marginBox.t, undefined),
//                        r: ct_lang.chk(marginBox.right || marginBox.r, undefined),
//                        b: ct_lang.chk(marginBox.bottom || marginBox.b, undefined)
//                    };
//                }
//            }
//        });

    }
);