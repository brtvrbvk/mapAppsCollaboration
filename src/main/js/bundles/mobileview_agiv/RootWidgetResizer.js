define([
        "dojo/_base/declare",
        "dojo/query",
        "dojo/dom-geometry",
        "ct/_Connect",
        "ct/async"
    ],
    function (
        declare,
        query,
        domGeometry,
        _Connect,
        async
        ) {
        /*
         * COPYRIGHT 2010-2011 con terra GmbH Germany
         */
        return declare([],
            /**
             * @lends mobileview.RootView.prototype
             */
            {
                /**
                 * @constructs
                 */
                constructor: function () {
                    this._listeners = new _Connect();
                },

                activate: function () {
                    var that = this;
                    this._listeners.connect(window, "onscroll", function () {
                        var rootWidget = that._findRootWidget();
                        if (!rootWidget) {
                            return;
                        }
                        var appRoot = query(".ctAppRoot")[0];
                        async(function () {
                            var contentBox = domGeometry.getContentBox(appRoot);
                            if (rootWidget.resize) {
                                rootWidget.resize(contentBox);
                            }
                        }, 200);
                    });
                },

                _findRootWidget: function () {
                    var templateLayout = this.templateLayout;
                    var templateRenderer = templateLayout._templateRenderer;
                    var rootWidget = templateRenderer.templateWidget;

                    return rootWidget;
                },

                deactivate: function () {
                    this._listeners.disconnect();
                }
            });
    });