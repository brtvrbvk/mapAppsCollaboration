/**
 * COPYRIGHT 2014 con terra GmbH Germany
 *
 * Created by fba on 24.09.2014.
 */
define([
        "dojo/_base/declare",
        "dojo/keys",
        "ct/util/css"
    ],
    function (
        declare,
        d_keys,
        ct_css
        ) {
        return declare([],
            {
                postCreate: function () {
                    this.inherited(arguments);
                    ct_css.switchVisibility(this.clearSearch.domNode, false);
                    this.submitSearch.set("disabled", true);
                },

                _onValueChange: function () {
                    this._updateButtonStates();
                },

                _updateButtonStates: function () {
                    ct_css.switchVisibility(this.clearSearch.domNode, true);
                    var val = this.textBox.get("value");
                    if (val.length > 0) {
                        this.submitSearch.set("disabled", false);
                    } else {
                        this.submitSearch.set("disabled", true);
                    }
                },

                _onTextBoxKeyUp: function (evt) {
                    if (evt.charOrCode === d_keys.ENTER) {
                        this.onSubmitClick({url: this.textBox.get("value")});
                    }
                    this._updateButtonStates();
                },

                _onSubmitClicked: function () {
                    var val = this.textBox.get("value");
                    this.onSubmitClick({url: val});
                },

                _onClearClicked: function () {
                    ct_css.switchVisibility(this.clearSearch.domNode, false);
                    this.textBox.set("value", "");
                    this.submitSearch.set("disabled", true);
                },

                resizeBy: function (height) {
                    this.onResizeWindow(height);
                },

                onResizeWindow: function (evt) {
                },

                onSubmitClick: function () {

                },
                onLoadLayers: function (evt) {
                }
            }
        );
    }
);