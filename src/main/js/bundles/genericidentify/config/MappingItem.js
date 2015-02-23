define([
        "ct",
        "dojo/_base/lang",
        "dojo/_base/declare",
        "dojo/_base/array",
        "dojo/store/Memory",
        "dijit/_Widget",
        "dijit/_TemplatedMixin",
        "ct/util/css",
        "dijit/Tooltip",
        "dijit/form/CheckBox",
        "dijit/form/TextBox",
        "dijit/form/ComboBox",
        "dojo/text!./templates/MappingItemWidget.html",
        "."
    ],
    function (
        ct,
        d_lang,
        declare,
        d_array,
        MemoryStore,
        _Widget,
        _TemplatedMixin,
        css,
        Tooltip,
        CheckBox,
        TextBox,
        ComboBox,
        templateStringContent,
        _moduleRoot
        ) {
        /*
         * COPYRIGHT 2011-2012 con terra GmbH Germany
         */
        /**
         * @fileOverview
         * @author tik
         */
        var css_replaceClass = css.replaceClass;
        _moduleRoot.MappingItem = declare(
            [
                _Widget,
                _TemplatedMixin
            ],
            /**
             * @lends .prototype
             */
            {
                baseClass: "mappingItem",
                templateString: templateStringContent,
                toolTip: null,
                /**
                 * @constructor
                 */
                constructor: function (args) {
                    this._boxes = [];
                    this._i18n = args.i18n;
                },

                postCreate: function (evt) {
                    this.inherited(arguments);
                    this.checkbox = new CheckBox({
                        checked: false
                    }, this.checkBoxNode);
                    this._boxes.push(this.checkbox);

                    this.attributeNameBox = new TextBox({
                        placeHolder: this._i18n.attrNamePlaceholder,
                        selectOnClick: true
                    }, this.attributeNameNode);
                    this._boxes.push(this.attributeNameBox);
                    this.attributeNameBox.watch('value', d_lang.hitch(this, function (obj) {
                        this.onChange();
                    }));

                    this.displayNameBox = new TextBox({
                        placeHolder: this._i18n.dispNamePlaceholder,
                        selectOnClick: true
                    }, this.displayNameNode);
                    this._boxes.push(this.displayNameBox);
                    this.displayNameBox.watch('value', d_lang.hitch(this, function (obj) {
                        this.onChange();
                    }));

                    this.attributeValueBox = new TextBox({
                        placeHolder: this._i18n.attrValuePlaceholder,
                        selectOnClick: true
                    }, this.attributeValueNode);
                    this._boxes.push(this.attributeValueBox);
                    this.attributeValueBox.watch('value', d_lang.hitch(this, function (obj) {
                        this.onChange();
                    }));

                    this.displayValueBox = new TextBox({
                        placeHolder: this._i18n.dispValuePlaceholder,
                        selectOnClick: true
                    }, this.displayValueNode);
                    this._boxes.push(this.displayValueBox);
                    this.displayValueBox.watch('value', d_lang.hitch(this, function (obj) {
                        this.onChange();
                    }));

                    var serviceStore = new MemoryStore({
                        data: this.services
                    })
                    this.serviceIdBox = new ComboBox({
                        placeHolder: this._i18n.serviceIdPlaceholder,
                        store: serviceStore,
                        labelAttr: "id",
                        searchAttr: "id",
                        "class": "ctServiceIdTextBox",
                        queryExpr: "*${0}*",
                        ignoreCase: true,
                        highlightMatch: 'first',
                        autoComplete: false
                    }, this.serviceIdNode);
                    this._boxes.push(this.serviceIdBox);
                    this.serviceIdBox.watch('value', d_lang.hitch(this, function (obj) {
                        this._showLayers(this.serviceIdBox.get("value"));
                    }));

                    var layerStore = this._layerStore = new MemoryStore({
                        data: []
                    });
                    this.layerIdBox = new ComboBox({
                        placeHolder: this._i18n.layerIdPlaceholder,
                        store: layerStore,
                        labelAttr: "id",
                        searchAttr: "id",
                        "class": "ctLayerIdTextBox",
                        queryExpr: "*${0}*",
                        ignoreCase: true,
                        highlightMatch: 'first',
                        autoComplete: false
                    }, this.layerIdNode);
                    this._boxes.push(this.layerIdBox);
                    this.layerIdBox.watch('value', d_lang.hitch(this, function (val) {
                        this.onChange();
                    }));
                },
                _showLayers: function (serviceId) {
                    if (serviceId) {
                        var layers = d_array.filter(this.layers, function (layer) {
                            return layer.serviceId === serviceId;
                        });
                        this._layerStore.setData(layers);
                    }
                },
                destroy: function () {
                    this.inherited(arguments);
                    d_array.forEach(this._boxes, function (box) {
                        if (box) {
                            box.destroyRecursive();
                        }
                    }, this);
                    this._boxes = [];
                },
                setMappingProperty: function (item) {
                    if (this.attributeNameBox) {
                        this.attributeNameBox.set("value", item.attributeName);
                    }
                    if (this.attributeValueBox) {
                        this.attributeValueBox.set("value", item.attributeValue);
                    }
                    if (this.displayNameBox) {
                        this.displayNameBox.set("value", item.displayName);
                    }
                    if (this.displayValueBox) {
                        this.displayValueBox.set("value", item.displayValue);
                    }
                    if (this.serviceIdBox) {
                        this.serviceIdBox.set("value", item.serviceId);
                    }
                    if (this.layerIdBox) {
                        this.layerIdBox.set("value", item.layerId);
                    }
                },
                getMappingProperty: function () {
                    var item = {
                        attributeName: this.attributeNameBox.get("value"),
                        attributeValue: this.attributeValueBox.get("value"),
                        displayName: this.displayNameBox.get("value"),
                        displayValue: this.displayValueBox.get("value"),
                        serviceId: this.serviceIdBox.get("value"),
                        layerId: this.layerIdBox.get("value")
                    };
                    return item;
                },
                setCheckBoxState: function (checked) {
                    if (this.checkbox) {
                        this.checkbox.set("checked", checked);
                    }
                },
                getCheckBoxState: function () {
                    return this.checkbox.get("checked");
                },
                onChange: function (evt) {
                }
            });
        return _moduleRoot.MappingItem;
    });