define([
    "dojo/_base/declare", "dojo/dom-construct", "dijit/_WidgetBase", "dojo/_base/array", "dojo/dom-style", "ct/_Connect"
], function (declare, domConstruct, _WidgetBase, d_array, domStyle, _Connect) {
    return declare([_WidgetBase], {
        baseClass: "layerList",
        postCreate: function () {
            this._listeners = new _Connect({defaultConnectScope: this});
            this.inherited(arguments);
            domConstruct.create("p", {innerHTML: "Layer&nbsp;List"}, this.domNode);
            this._createList();
        },
        _createList: function () {
            var tableElement = domConstruct.create("table", {}, this.domNode);
            var listeners = this._listeners;
            d_array.forEach(this.nodes, function (node) {
                var title = node.get("title") || node.get("id");
                var trElement = domConstruct.create("tr", {}, tableElement);
                var tdElement = domConstruct.create("td", {innerHTML: "<b>" + title + "</b>"}, trElement);
                domStyle.set(tdElement, "color", node.get("enabled") ? "green" : "grey");
                listeners.connectP(node, "enabled", function (property, oldValue, newValue) {
                    domStyle.set(tdElement, "color", newValue ? "green" : "black");
                });
                listeners.connect(tdElement, "onclick", function () {
                    node.set("enabled", !node.get("enabled"));
                    this.onLayerUpdated({
                        source: this,
                        node: node
                    });
                });
            }, this);
        },
        destroy: function () {
            this._listeners.disconnect();
            this._listeners = null;
            //call destroy in "super" class
            this.inherited(arguments);
        },
        onLayerUpdated: function (event) {
        }
    });
});