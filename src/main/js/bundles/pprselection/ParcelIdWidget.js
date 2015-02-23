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
                this._parcelIdTitle = this._i18n.get().ui.parcelIdTitle;
                this._parcelID = this._properties.parcelID;
                this._handle = new _Connect({defaultConnectScope: this});
                this.textNode.innerHTML = this._parcelIdTitle;
            },
            startup: function () {
                this._setParcelIdText();
                this._handle.connect(this._dataModel, "onDataChanged", function () {
                    this._setParcelIdText();
                }, this);
            },
            _setParcelIdText: function () {
                var parcelID = "";
                if (this._dataModel) {
                    var dataModel = this._dataModel;

                    var items = dataModel.query({});
                    if (items.length && items[0]) {
                        parcelID = items[0][this._parcelID];
                    }
                }

                this.textNode.innerHTML = this._parcelIdTitle + ": " + parcelID;
            }
        });
    });
