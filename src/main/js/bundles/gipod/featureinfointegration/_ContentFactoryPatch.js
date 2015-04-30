/**
 * COPYRIGHT 2012-2013 con terra GmbH Germany
 *
 * User: fba
 * Date: 17.01.14
 * Time: 09:31
 */
define([
        "contentviewer/_ContentWidgetFactory",
        "dojo/window",
        "dojo/_base/html",
        "ct/util/css"
    ],
    function (
        ContentWidgetFactory,
        d_window,
        d_html,
        css
        ) {
        ContentWidgetFactory.prototype._openFullScreenWindow = function (
            params,
            widget,
            managed
            ) {
            // this is a hack, change the kind of full screen windows by fixing the "maximize" method in WindowBase
            var windowTitle = widget.get("title") || params.rule.windowTitle;
            var wm = this.windowManager;
            //var screensize = d_window.getBox();
            var w = wm.createWindow({
                maximizable: false,
                closable: true,
                resizable: false,
                draggable: false,
                content: widget,
                title: windowTitle,
                modal: true,
                windowClass: this.detailWindowCSSClass,
                marginBox: {
                    t: 75,
                    b: 75,
                    l: 0,
                    r: 0
                }
            });

            var handle = widget.watch("title", function () {
                w.set("title", widget.get("title"));
            });
            w.connect("onClose", function () {
                handle.unwatch();
            });

            w.show();
            w.window._getViewPort = function () {
                if (!this.allParentWindowsOpen()) {
                    return {
                        w: 0,
                        h: 0
                    };
                }
                var containingWidget = this._containingWidget;
                if (containingWidget) {
                    var box = d_html.contentBox(containingWidget.containerNode || containingWidget.domNode);
                    return {
                        w: box.w,
                        h: box.h - 150
                    }
                }
                // TODO: what is a good decision?
                // here we look for the next relative or absolute parent
                // maybe this isn't a good idea..
                var absoluteParent = css.findRelativeOrAbsoluteParentNode(this.domNode);
                var box = d_window.getBox();
                return absoluteParent ? d_html.contentBox(absoluteParent) : {
                    w: box.w,
                    h: box.h - 150
                };
            };
            w.maximize();
            return w;
        };
    }
);