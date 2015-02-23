/**
 * COPYRIGHT 2012-2013 con terra GmbH Germany
 *
 * User: fba
 * Date: 09.07.13
 * Time: 14:33
 */
define([
        "..",
        "dojo/_base/declare",
        "ct/Stateful"
    ],
    function (
        mr,
        declare,
        Stateful
        ) {
        return mr.ContentModelLayerSelectionHandler = declare([Stateful],
            {
                _handleResultSelection: function (evt) {
                    var modelController = this.modelctrl;
                    if (this.compareContentModelController && this.compareContentModelController.isSwitchedOn) {
                        modelController = this.compareContentModelController;
                    }

                    if (modelController) {
                        var item = evt && evt._properties && evt._properties.entries.result;
                        var type = evt && evt._properties && evt._properties.entries.type;
                        if (item && type === "CONTENTMODEL") {
                            modelController.enableLayerInContentModel(item);
                        }
                    }
                }
            }
        )
    }
);