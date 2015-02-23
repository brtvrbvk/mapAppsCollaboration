define([
    "dojo/_base/declare",
    "dijit/_Widget",
    "dijit/_TemplatedMixin",
    "dijit/_WidgetsInTemplateMixin",
    "dijit/form/DateTextBox",
    "dijit/form/TextBox",
    "dijit/form/CheckBox",
    "dijit/form/Button",
    "dojo/text!./templates/QueryWidget.html"
], function (declare, _Widget, _TemplatedMixin, _WidgetsInTemplateMixin, DateTextBox, TextBox, CheckBox, Button, templateStringContent) {
    return declare([_Widget, _TemplatedMixin, _WidgetsInTemplateMixin], {
        templateString: templateStringContent,
        _getQuery: function () {
            var name = this._nameNode.get("value");
            var date = this._dateNode.get("value");
            var extent = this._extentNode.get("checked");
            return {
                name: name,
                date: date,
                extent: extent
            };
        },
        // click handler
        _onClick: function () {
            var query = this._getQuery();
            console.debug("QueryWidget: Query parameters", query);
            this.onFind({
                source: this,
                query: query
            });
        },
        // onFind event
        onFind: function (event) {
        },
        setPlaceHolder:function(placeHolder){
            this._nameNode.set("placeHolder", placeHolder);
        }
    });
});