/*
 * COPYRIGHT 2011-2012 con terra GmbH Germany
 */
/**
 * @fileOverview
 * @author fba
 */
define([
        "dojo/_base/lang",
        "resultcenter/FocusGraphicOnDataModel"
    ],
    function (
        d_lang,
        FocusGraphicOnDataModel
        ) {
        d_lang.extend(FocusGraphicOnDataModel, {
            handleOnGraphicOver: function (evt) {
                if (this.active) {
                    console.debug("FocusGraphicOnDataModel.handleOnGraphicOver");
                    var graphic = evt.graphic;
                    var dataModel = this.dataModel;
                    var gStore = graphic.context && graphic.context.store;
                    var dmStore = dataModel.datasource;
                    if (gStore && gStore.id === dmStore.id) {
                        if (graphic.attributes) {
                            var id = dataModel.getIdentity(graphic.attributes);
                            if (id !== undefined) {
                                dataModel.setFocused(id);
                            }
                        }
                    }
                }
            }
        });

    });