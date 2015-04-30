/**
 * COPYRIGHT 2012-2013 con terra GmbH Germany
 *
 * User: fba
 * Date: 24.10.13
 * Time: 09:54
 */
define([
        "dojo/_base/declare",
        "dojo/_base/lang",
        "ct/_when"
    ],
    function (
        declare,
        d_lang,
        ct_when
        ) {
        return declare([],
            {
                dataModel: null,       // injected

                /**
                 * @constructs
                 */
                constructor: function () {
                },

                handleOnItemClicked: function (evt) {
                    var dataModel = this.dataModel;
                    var itemId = evt.itemId;
                    var item = dataModel.get(itemId,
                        {fromCache: true});
                    ct_when(item, function (item) {
                        if (d_lang.isArray(item)) {
                            item = item[0];
                        }
                        //we fake a graphic to show the correct FI
                        var graphic = {
                            attributes: item,
                            context: {
                                store: dataModel
                            }
                        };
                        this.fiController.executeFeatureInfo({
                            mapPoint: item.geometry,
                            graphic: graphic
                        });
                    }, this);
                }
            }
        );
    }
);