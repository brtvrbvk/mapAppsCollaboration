define([
        "ct",
        "dojo/_base/lang",
        "dojo/_base/declare",
        "dojo/_base/array",
        "dojo/store/Memory",
        "dijit/_Widget",
        "dijit/_TemplatedMixin",
        "ct/util/css",
        "ct/_when",
        "dijit/Tooltip",
        "dijit/form/CheckBox",
        "dijit/form/TextBox",
        "dijit/form/ComboBox",
        "dojo/text!./templates/MappingItemWidget.html"
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
        ct_when,
        Tooltip,
        CheckBox,
        TextBox,
        ComboBox,
        templateStringContent
        ) {
        /*
         * COPYRIGHT 2011-2012 con terra GmbH Germany
         */
        /**
         * @fileOverview
         * @author tik
         */
        var css_replaceClass = css.replaceClass;
        return declare(
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
                    this._createSelectionCheckBox();
                    this._createAttributeNameTextBox();
                    this._createDisplayNameTextBox();
                    this._createAttributeValueTextBox();
                    this._createDisplayValueTextBox();
                    this._createServiceIdComboBox();
                    this._createLayerIdComboBox();
                    this._createHideFieldWhenBlankCheckBox();
                },

                _createSelectionCheckBox: function () {
                    this.selectionCheckbox = this._createCheckBox(this.selectionCheckBoxNode);
                },

                _createHideFieldWhenBlankCheckBox: function() {
                    var checkBox = this.hideFieldWhenBlankCheckBox = this._createCheckBox(this.hideFieldWhenBlankCheckBoxNode);
                    checkBox.watch('checked', d_lang.hitch(this, function () {
                        this.onChange();
                    }));
                },

                _createCheckBox: function (parentNode) {
                    var checkBox = new CheckBox({
                        checked: false
                    }, parentNode);
                    this._boxes.push(checkBox);
                    return checkBox;
                },

                _createAttributeNameTextBox: function () {
                    this.attributeNameBox = this._createTextBox(this._i18n.attrNamePlaceholder, this.attributeNameNode);
                },

                _createDisplayNameTextBox: function () {
                    this.displayNameBox = this._createTextBox(this._i18n.dispNamePlaceholder, this.displayNameNode);
                },

                _createAttributeValueTextBox: function () {
                    this.attributeValueBox = this._createTextBox(this._i18n.attrValuePlaceholder, this.attributeValueNode);
                },

                _createDisplayValueTextBox: function () {
                    this.displayValueBox = this._createTextBox(this._i18n.dispValuePlaceholder, this.displayValueNode);
                },

                _createTextBox: function (placeHolder, parentNode) {
                    var textBox = new TextBox({
                        placeHolder: placeHolder,
                        selectOnClick: true
                    }, parentNode);
                    this._boxes.push(textBox);
                    textBox.watch('value', d_lang.hitch(this, function () {
                        this.onChange();
                    }));
                    return textBox;
                },

                _createServiceIdComboBox: function () {
                    var serviceStore = new MemoryStore({
                        data: this.knownServicesStore.data,
                        idProperty: "searchId"
                    });
                    this.serviceIdBox = new ComboBox({
                        placeHolder: this._i18n.serviceIdPlaceholder,
                        store: serviceStore,
                        labelAttr: "searchId",
                        searchAttr: "searchId",
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
                },

                _createLayerIdComboBox: function () {
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
                        ct_when(this.knownServicesStore.get(serviceId), function (resp) {
                            if (resp) {
                                this._layerStore.setData(resp.layers);
                            }
                        }, this);
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
                    if (this.hideFieldWhenBlankCheckBox) {
                        this.hideFieldWhenBlankCheckBox.set("checked", item.hideFieldWhenBlank);
                    }

                },
                getMappingProperty: function () {
                    var id = this.serviceIdBox.get("value").split(":");
                    if (id && id.length > 1) {
                        id = d_lang.trim(id[1]);
                    } else {
                        id = this.serviceIdBox.get("value");
                    }
                    var item = {
                        attributeName: this.attributeNameBox.get("value"),
                        attributeValue: this.attributeValueBox.get("value"),
                        displayName: this.displayNameBox.get("value"),
                        displayValue: this.displayValueBox.get("value"),
                        serviceId: id,
                        layerId: this.layerIdBox.get("value"),
                        hideFieldWhenBlank: !!this.hideFieldWhenBlankCheckBox.get("checked")
                    };
                    return item;
                },

                setCheckBoxState: function (checked) {
                    if (this.selectionCheckbox) {
                        this.selectionCheckbox.set("checked", checked);
                    }
                },

                getCheckBoxState: function () {
                    return this.selectionCheckbox.get("checked");
                },
                onChange: function (evt) {
                }
            });
    });