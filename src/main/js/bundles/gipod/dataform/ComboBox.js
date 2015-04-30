define([
        "dojo/_base/lang",
        "dojo/_base/declare",
        "dojo/keys",
        "ct/_lang",
        "ct/store/ComplexMemory",
        "ct/store/SuggestQueryStore",
        "ct/store/AttributeExtender",
        "dataform/controls/_Control",
        "dataform/controls/FormControls",
        "dijit/form/ComboBox",
        "dijit/form/FilteringSelect"
    ],
    function (
        d_lang,
        declare,
        d_keys,
        ct_lang,
        ComplexMemory,
        SuggestQueryStore,
        AttributeExtender,
        _Control,
        FormControls,
        ComboBox,
        FilteringSelect
        ) {

        var CB = declare([_Control],
            {
                controlClass: "combobox",
                _charCount: 0,
                createWidget: function (params) {
                    var comboBox;
                    if (this.onlyPreDefinedValues) {
                        comboBox = new FilteringSelect(d_lang.mixin(params, {
                            required: this.required,
                            queryExpr: "*${0}*",
                            fetchProperties: {
                                suggestContains: true
                            },
                            regExp: ct_lang.chk(this.lookupRegEx(this.regex), ".*"),
                            maxLength: ct_lang.chk(this.max, 255),
                            trim: ct_lang.chk(this.trim, true),
                            store: new SuggestQueryStore(new ComplexMemory(), {
                                count: 5
                            })
                        }));
                    } else {
                        comboBox = new ComboBox(d_lang.mixin(params, {
                            required: this.required,
                            queryExpr: "*${0}*",
                            fetchProperties: {
                                suggestContains: true
                            },
                            regExp: ct_lang.chk(this.lookupRegEx(this.regex), ".*"),
                            maxLength: ct_lang.chk(this.max, 255),
                            trim: ct_lang.chk(this.trim, true),
                            store: new SuggestQueryStore(new ComplexMemory())
                        }));
                    }
                    this._comboBoxID = params.field;
                    this.connect(comboBox, "onKeyUp", this, "_fireKeyPress");
                    return comboBox;
                },
                _fireKeyPress: function () {
                    //needs to be this way for tablets
                    var val = (this.widget.textbox && this.widget.textbox.value) || this.widget._lastInput;
                    var valLength = val ? val.length : 0;
                    if (valLength < 2) {
                        this.widget.closeDropDown();
                    }
                },
                clearBinding: function () {
                    this._updateValue(this.field, undefined, "");
                    this.widget.set("store", new SuggestQueryStore(new ComplexMemory()));
                },
                refreshBinding: function () {
                    var binding = this.dataBinding;
                    var field = this.field;
                    var widget = this.widget;
                    var store = this.getStore() || new ComplexMemory();

                    var searchAttr = this.searchAttribute || store.idProperty;
                    var labelAttr = this.labelAttribute || searchAttr;
                    var labelAttrDefs = [];
                    if (labelAttr.indexOf("${") > -1) {
                        var attrName = "__labelAttr";
                        labelAttrDefs = [
                            {
                                name: attrName,
                                value: labelAttr,
                                // automatic sort if ${} syntax is used!
                                descending: false
                            }
                        ];
                        labelAttr = attrName;
                    }
                    widget.set({
                        "store": new AttributeExtender(new SuggestQueryStore(store),
                            labelAttrDefs),
                        "searchAttr": searchAttr,
                        "labelAttr": labelAttr
                    });

                    this.connectP("binding", binding, field, "_updateValue");
                    this.connectP("binding", widget, "value", "_storeValue");

                    this._updateValue(field, undefined, binding.get(field));
                },
                _updateValue: function (
                    prop,
                    oldVal,
                    newVal
                    ) {
                    this.widget.set("value", ct_lang.chk(newVal, ""));
                },
                _storeValue: function (
                    prop,
                    oldVal,
                    newVal
                    ) {
                    if (this.widget.isValid()) {
                        this.dataBinding.set(this.field, ct_lang.chk(newVal, ""));
                    }
                }
            });
        FormControls.prototype.controls.combobox = CB;
        return CB;
    });