define([
        "dojo/_base/lang",
        "dojo/_base/declare",
        "dojo/_base/array",
        "dijit/_WidgetBase",
        "dijit/_TemplatedMixin",
        "dijit/form/CheckBox",
        "dijit/form/TextBox",
        "dijit/form/SimpleTextarea",
        "dojo/text!./templates/ExtraInfoWidget.html",
        "dojo/has",
        "dojo/_base/sniff"
    ],
    function (
        d_lang,
        declare,
        d_array,
        _WidgetBase,
        _TemplatedMixin,
        CheckBox,
        TextBox,
        SimpleTextarea,
        templateStringContent,
        has
        ) {
        /*
         * COPYRIGHT 2011-2012 con terra GmbH Germany
         */
        return declare([
                _WidgetBase,
                _TemplatedMixin
            ],
            {
                baseClass: "ctExtraInfoWidget",
                templateString: templateStringContent,

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
                        },
                        this.attributeNameNode);
                    this._boxes.push(this.attributeNameBox);
                    this.attributeNameBox.watch('value', d_lang.hitch(this,
                        function (obj) {
                            this.onChange();
                        }));
                    /* Workaround for IE9: dnd components lose focus on mouse down event */
                    if (has("ie")) {
                        this.attributeNameBox.on('mousedown',
                            d_lang.hitch(this,
                                function (e) {
                                    this.attributeNameBox.focus();
                                }));
                    }

                    this.attributeValueBox = new SimpleTextarea({
                            placeHolder: this._i18n.attrValuePlaceholder,
                            selectOnClick: true,
                            baseClass: "ctBuilderTextArea"
                        },
                        this.attributeValueNode);
                    this._boxes.push(this.attributeValueBox);
                    this.attributeValueBox.watch('value', d_lang.hitch(this,
                        function (obj) {
                            this.onChange();
                        }));
                    if (has("ie")) {
                        this.attributeValueBox.on('mousedown',
                            d_lang.hitch(this,
                                function (e) {
                                    this.attributeValueBox.focus();
                                }));
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
                setInfoContent: function (item) {
                    if (this.attributeNameBox) {
                        this.attributeNameBox.set("value", item.title);
                    }
                    if (this.attributeValueBox) {
                        this.attributeValueBox.set("value",
                            item.description);
                    }
                },
                getInfoContent: function () {
                    var item = {
                        title: this.attributeNameBox.get("value"),
                        description: this.attributeValueBox.get("value")
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
    });