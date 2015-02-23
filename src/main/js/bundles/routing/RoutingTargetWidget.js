/*
 * COPYRIGHT 2011-2012 con terra GmbH Germany
 */
/**
 * @fileOverview
 * @author fba
 */
define([
        "dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/keys",
        "dijit/_Widget",
        "dijit/_Templated",
        "dijit/form/FilteringSelect",
        "dijit/Tooltip",
        "dojo/on",
        "dojo/mouse",
        "dojo/dom-geometry",
        "ct/async",
        "dojo/text!./templates/RoutingTargetWidget.html",
        "ct/_Connect",
        "dijit/form/Button"
    ],
    function (
        declare,
        d_lang,
        d_keys,
        _Widget,
        _Templated,
        FilteringSelect,
        Tooltip,
        on,
        mouse,
        domGeom,
        ct_async,
        templateString,
        Connect
        ) {
        return declare([
            _Widget,
            _Templated
        ], {

            templateString: templateString,
            widgetsInTemplate: true,

            postCreate: function () {
                this.inherited(arguments);
                this.comboOpts.invalidMessage = this.i18n.tooltip.errorMessage;
                this._box = new FilteringSelect(this.comboOpts, this.comboNode);
                //needs to be set to search attr in order to make the enter selection work
                this._box._getValueField = d_lang.hitch(this._box, function () {
                    return this.searchAttr;
                });
                this._listeners = new Connect({
                    defaultConnectScope: this
                });
                this._listeners.connect("box_change", this._box, "onChange",
                    function () {
                        if (this._box.item) {
                            this.onSelectionChanged();
                            this.onFocusNext();
                        }
                    });
                this._listeners.connect("key_change", this._box, "onKeyDown", this._onKey);
                // tooltip delete button
                this._tDelete = new Tooltip({
                    connectId: [this.deleteButton.domNode],
                    label: this.i18n.tooltip.deleteButton
                });
                // tooltip marker
                this._tMarker = new Tooltip({
                    connectId: [this.marker],
                    label: this.i18n.tooltip.marker,
                    position: ["before"]
                });
            },

            _onKey: function (evt) {
                if (evt.keyCode === d_keys.ENTER) {
                    this._selectFirstOption();
                }
            },

            focus: function () {
                this._box.focus();
            },

            onFocusNext: function () {
            },

            _selectFirstOption: function () {
                var items = this._box.dropDown && this._box.dropDown.items;
                if (items && items.length > 0) {
                    this._box.set("item", items[0]);
                }
            },

            _onDeleteClick: function () {
                this.onDelete();
            },

            onDelete: function () {
            },

            onSelectionChanged: function () {
            },

            _setItemAttr: function (it) {
                this._box.set("item", it);
            },

            _getItemAttr: function () {
                return this._box.get("item");
            },

            resize: function (dim) {
                domGeom.setMarginBox(this.domNode, {
                    h: 30
                });
            },
            destroy: function () {
                this.inherited(arguments);
                this._tDelete.destroy();
                this._tMarker.destroy();
                this._listeners.disconnect();
            }
        });
    });
