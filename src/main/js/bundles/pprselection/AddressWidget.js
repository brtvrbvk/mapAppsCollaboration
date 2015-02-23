/*
 * COPYRIGHT 2011-2012 con terra GmbH Germany
 */
define([
        "dojo/_base/declare",
        "dijit/_Widget",
        "dijit/_Templated",
        "ct/_Connect"
    ],
    function (
        declare,
        _Widget,
        _Templated,
        _Connect
        ) {
        return declare([
            _Widget,
            _Templated
        ], {
            templateString: "<div><div data-dojo-attach-point=\"textNode\"></div></div>",

            activate: function () {
                this._addressTitle = this._i18n.get().ui.addressTitle;
                this._handle = new _Connect({defaultConnectScope: this});
                this.textNode.innerHTML = this._addressTitle;
            },
            startup: function () {
                this._setAddressText();
                this._handle.connect(this._dataModel, "onDataChanged", function () {
                    this._setAddressText();
                }, this);
            },
            _setAddressText: function () {
                var address = "";
                if (this._dataModel) {
                    address = this._dataModel.datasource.address;
                }
                this.textNode.innerHTML = this._addressTitle + ": " + address;
            }
        });
    });
