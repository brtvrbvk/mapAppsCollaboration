/**
 * COPYRIGHT 2012-2013 con terra GmbH Germany
 *
 * User: fba
 * Date: 06.11.13
 * Time: 10:10
 */
define([
        "dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/_base/array",
        "contentviewer/GridContent",
        "ct/ui/controls/dataview/DataView",
        "ct/ui/controls/dataview/DataViewModel",
        "ct/_when",
        "dojo/store/Memory"
    ],
    function (
        declare,
        d_lang,
        d_array,
        GridContent,
        DataView,
        DataViewModel,
        ct_when,
        Memory
        ) {
        var GridContentWidget = declare([GridContent],
            {
                constructor: function () {

                },

                _createGrid: function (memory) {
                    var model = new DataViewModel({
                        store: memory,
                        itemsPerPage: 200
                    });
                    var dataView = new DataView({
                        showPager: false,
                        showFilter: false,
                        showViewButtons: false,
                        DGRID: {
                            checkboxSelection: false,
                            columns: [
                                {
                                    "matches": {
                                        "name": "attribute"
                                    },
                                    "width": "140"
                                },
                                {
                                    "matches": {
                                        "name": "value"
                                    }
                                }
                            ]
                        }
                    });
                    dataView.set("model", model);
                    this._model = model;
                    return dataView;
                },

                getStore: function () {
                    return this._model.store;
                },

                _getStructure: function () {
                    // width parameter is ignored
                    var i18n = this.i18n;
                    return [
                        {
                            title: i18n.key,
                            name: 'attribute',
                            width: '50%',
                            sortable: false,
                            type: "HTML"
                        },
                        {
                            title: i18n.value,
                            name: 'value',
                            width: '50%',
                            sortable: false,
                            type: "HTML"
                        }
                    ];
                },

                buildMemoryStoreFromContent: function () {
                    var that = this;
                    return ct_when(this._getFields(), function (fields) {
                        var contentItem = this.content;
                        // prepare items
                        return ct_when(this.replaceDomainValuesAndDates(contentItem), function (contentItem) {
                            var items = d_array.map(d_array.filter(fields, function (field) {
                                //patch: check for splitting

                                if (field.name.split) {
                                    var parts = field.name.split("."),
                                        contains = false,
                                        currentItem = contentItem;
                                    d_array.some(parts, function (part) {

                                        if (currentItem[part]) {
                                            contains = true;
                                            currentItem = currentItem[part];
                                            return false;
                                        } else {
                                            contains = false;
                                            return true;
                                        }

                                    }, this);
                                    if (contains) { // patch: check if the attribute value exists
                                        return this._shouldFieldBeDisplayed(field.name);
                                    }
                                } else {
                                    if (contentItem[field.name]) { // patch: check if the attribute value exists
                                        return this._shouldFieldBeDisplayed(field.name);
                                    }
                                }
                            }, this), function (
                                field,
                                index
                                ) {
                                return {
                                    id: index,
                                    attribute: field.title || field.name,
                                    value: this.replace("{" + field.name + "}", contentItem)
                                };
                            }, this);
                            return new Memory({
                                idProperty: "id",
                                data: items,
                                getMetadata: function () {
                                    return {
                                        fields: that._getStructure()
                                    };
                                }
                            });
                        }, this);
                    }, this);
                }
            }
        );
        GridContentWidget.createWidget = function (
            params,
            contentFactory
            ) {
            var i18n = d_lang.mixin({}, contentFactory.get("GridContentWidget").i18n, params.context.i18n);
            params.i18n = d_lang.mixin({}, GridContentWidget.prototype.i18n, i18n);
            params.storeResolver = contentFactory.storeResolver;
            return new GridContentWidget(params);
        };

        return GridContentWidget;
    }
);