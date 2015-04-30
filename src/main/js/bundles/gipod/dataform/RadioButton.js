define([
        "dojo/_base/declare",
        "ct/_lang",
        "dojo/_base/array",
        "dijit/form/RadioButton",
        "dataform/controls/_Control"
    ],
    function (
        declare,
        ct_lang,
        d_array,
        RadioButton,
        _Control
        ) {
        /*
         * COPYRIGHT 2012 con terra GmbH Germany
         */
        /**
         * @fileOverview This is a radiobutton widget.
         */
        return declare([_Control],
            {
                controlClass: "radiobutton",
                createWidget: function (params) {
                    return new RadioButton(params);
                },

                clearBinding: function () {
                    this._updateValue(this.field, undefined, false);
                },

                refreshBinding: function () {
                    var binding = this.dataBinding;
                    var field = this.field;
                    var widget = this.widget;

                    this._value = ct_lang.chk(this.value, true);

                    this.connectP("binding", binding, field, "_updateValue");
                    this.connectP("binding", widget, "checked", "_storeValue");

                    this._updateValue(field, undefined, binding.get(field));
                },

                _updateValue: function (
                    prop,
                    oldVal,
                    newVal
                    ) {
                    var dataType = typeof(newVal);
                    var value = this._value;
                    var checked = false;
                    if (dataType === "boolean" || (typeof(value) === "boolean")) {
                        checked = value === newVal;
                    } else if (dataType === "string") {
                        checked = d_array.indexOf(newVal.split(","), value) > -1
                    } else if (dataType === "object" || dataType === "undefined") {
                        checked = d_array.indexOf(newVal || [], value) > -1
                    }
                    this.widget.set("checked", checked);
                },

                _storeValue: function (
                    prop,
                    oldChecked,
                    newChecked
                    ) {
                    var fieldValue = this.dataBinding.get(this.field);
                    var dataType = typeof(fieldValue);
                    var value = this._value;
                    if (dataType === "boolean" || (value === true)) {
                        fieldValue = newChecked;
                    }
                    this.dataBinding.set(this.field, fieldValue);
                }
            });
    });