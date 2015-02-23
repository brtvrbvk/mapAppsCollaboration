define([
        "dojo/_base/lang",
        "dojo/_base/declare",
        "ct/Stateful",
        "ct/mapping/map/NodeTypes"
    ],
    function (
        d_lang,
        declare,
        Stateful,
        NodeTypes
        ) {
        /*
         * COPYRIGHT 2011-2012 con terra GmbH Germany
         */

        return declare(
            [Stateful],
            /**
             * @lends .prototype
             */
            {
                /**
                 * @constructor
                 */
                constructor: function () {

                },

                onExtraClick: function () {
                    if (this.categoryDependent) {
                        this.showDynamicURL();
                    }
                    else {
                        this.showStaticURL();
                    }

                },
                _getEnabledCategory: function () {
                    var filter = function (node) {
                        if (node.get("type") == nodeTypes.CATEGORY && node.get("enabled")) {
                            return true;
                        }
                        return false;
                    };
                    return this.mapModel.filterNodes(filter).shift();
                },
                _openNewWindow: function (url) {
                    window.open(url);
                },
                showStaticURL: function () {
                    if (!this.infoURL) {
                        console.log("NO static infoURL given. This parameter must be configured, if it is not categoryDependent or no categoryURL is configured!");
                        return;
                    }
                    this._openNewWindow(this.infoURL);
                },
                showDynamicURL: function () {
                    var cat = this._getEnabledCategory();
                    if (cat && cat.get("category")) {
                        var category = cat.get("category");
                        if (category.extraInformationURL) {
                            var url = category.extraInformationURL;
                            console.log("Dynamic url for theme '" + cat.get("title") + "': " + url);
                            this._openNewWindow(url);
                        }
                        else {
                            console.log("No URL for category configured. Using the configured URL");
                            this.showStaticURL();
                        }
                    } else {
                        console.log("No data theme is selected. Please select a theme. Showing the configured URL");
                        this.showStaticURL();
                    }
                }

            });

    });