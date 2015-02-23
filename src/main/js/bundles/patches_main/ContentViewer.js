/**
 * COPYRIGHT 2014 con terra GmbH Germany
 *
 * Created by fba on 18.08.2014.
 */
define([
        "dojo/_base/declare",
        "dojo/_base/lang",
        "contentviewer/ContentViewer",
        "ct/_lang"
    ],
    function (
        declare,
        d_lang,
        ContentViewer,
        ct_lang
        ) {

        d_lang.extend(ContentViewer, {
            //PATCH to ensure relative sizing of windows from contentviewer
            //https://issuetracker02.eggits.net/browse/MAPAPPS-2902
            _displayWindow: function (
                widget,
                point,
                rule,
                infoWindow
                ) {
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
                var title = widget.get("title");
                var windowTitle = title || windowProps.title || rule.windowTitle || "";
                if (infoWindow) {
                    return this.infoViewer.showNewInfoWindow(windowTitle, widget, windowProps, point);
                }
                var w = this.windowManager.createWindow(ct_lang.merge({
                    title: windowTitle,
                    content: widget,
                    geometry: point,
                    draggable: false,
                    dndDraggable: true,
                    closable: true
                }, windowProps));
                w.show();
                return w;
            }
        });

    }
);