define([
        "dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/_base/array",
        "dijit/_WidgetBase",
        "dijit/_TemplatedMixin",
        "dijit/form/CheckBox",
        "dijit/form/TextBox",
        "dijit/form/Select",
        "dojo/text!./templates/MappingItemWidget.html",
        "."
    ],
    function (
        declare,
        d_lang,
        d_array,
        _WidgetBase,
        _TemplatedMixin,
        CheckBox,
        TextBox,
        Select,
        templateStringContent,
        _moduleRoot
        ) {
        /*
         * COPYRIGHT 2011-2012 con terra GmbH Germany
         */
        return _moduleRoot.MappingItemWidget = declare([
                _WidgetBase,
                _TemplatedMixin
            ],
            {
                templateString: templateStringContent,
                baseClass: "ctMappingItemWidget",

                constructor: function (args) {
                    this._boxes = [];
                    if (args) {
                        this._i18n = args.i18n;
                        this._mappingItem = args.mappingItem;
                    }
                },

                postCreate: function (evt) {
                    this.inherited(arguments);
                    var checkbox = this.checkbox = new CheckBox({
                            checked: false
                        },
                        this.checkBoxNode);
                    this._boxes.push(checkbox);

                    var item = this._mappingItem;
                    var layerIdBox = this.layerIdBox = new TextBox({
                            value: item.id,
                            placeHolder: this._i18n.layerIdPlaceholder,
                            selectOnClick: true
                        },
                        this.layerIdNode);
                    this._boxes.push(layerIdBox);
                    layerIdBox.watch('value',
                        d_lang.hitch(this, function (obj) {
                            this.onChange();
                        }));

                    var urlBox = this.urlBox = new TextBox({
                            value: item.legendURL,
                            placeHolder: this._i18n.urlPlaceholder,
                            selectOnClick: true
                        },
                        this.urlNode);
                    this._boxes.push(urlBox);
                    urlBox.watch('value',
                        d_lang.hitch(this, function (obj) {
                            this.onChange();
                        }));
                    var dropdown = this.dropdown = new Select({
                            options: [
                                {label: "PDF", value: "pdf"},
                                {label: "Image", value: "image"}
                            ],
                            value: item.type || "image"
                        },
                        this.dropdownNode);
                    dropdown.watch('value',
                        d_lang.hitch(this, function (obj) {
                            this.onChange();
                        }));
                    this._boxes.push(dropdown);
                },

                getCheckBoxState: function () {
                    return this.checkbox.get("checked");
                },

                getMappingItem: function () {
                    return {
                        id: this.layerIdBox.get("value"),
                        legendURL: this.urlBox.get("value"),
                        type: this.dropdown.get("value")
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

                onChange: function (evt) {
                }
            });
    });