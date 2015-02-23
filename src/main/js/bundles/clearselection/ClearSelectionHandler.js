define([
        "dojo/_base/lang",
        "dojo/_base/declare",
        "dojo/_base/array",
        "ct/mapping/edit/GraphicsRenderer",
        "ct/Stateful",
        "."
    ],
    function (
        d_lang,
        declare,
        d_array,
        GraphicsRenderer,
        Stateful,
        _moduleRoot
        ) {
        d_lang.getObject("ClearSelectionHandler", true, _moduleRoot);
        /*
         * COPYRIGHT 2011-2012 con terra GmbH Germany
         */

        _moduleRoot.ClearSelectionHandler = declare(
            [Stateful],
            {
                constructor: function () {
                },

                onClearSelectionClick: function () {
                    this.clear();
                },
                clear: function (clearResultCenter) {
                    var nodesToClear = this.clearNodes;
                    d_array.forEach(nodesToClear, d_lang.hitch(this, function (nodeToClear) {
                        if (this._mapModel.getNodeById(nodeToClear)) {
                            GraphicsRenderer.createForGraphicsNode(nodeToClear, this._mapModel).clear();
                            this._mapModel.fireModelNodeStateChanged({
                                source: this
                            });
                        }
                    }));
                    if (this.removeResultsCommand && !clearResultCenter) {
                        this.removeResultsCommand.removeAll();
                    }
                    if (this._resultcenterToggleTool) {
                        this._resultcenterToggleTool.set("active", false);
                        this._resultcenterToggleTool.set("visibility", false);
                    }
                    if (this._omniSearchModel) {
                        this._omniSearchModel.clearSelectedItem();
                    }
                    if (this._accessPanel) {
                        this._accessPanel.hideAndClearPanel();
                    }
                    if (this.searchUI) {
                        this.searchUI._onResetClick();
                    }
                },

                clearResultCenter: function () {
                    if (this.removeResultsCommand) {
                        this.removeResultsCommand.removeAll();
                    }
                }

            });

        return _moduleRoot.ClearSelectionHandler;
    });