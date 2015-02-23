define([
    "dojo/_base/declare",
    "loadservice/_ServiceExtensionWidget",
    "dijit/_WidgetBase",
    "dijit/_TemplatedMixin",
    "dijit/_WidgetsInTemplateMixin",
    "dojo/text!./templates/CSVServiceExtensionWidget.html",
    "dijit/layout/BorderContainer",
    "dijit/layout/ContentPane",
    "dijit/form/TextBox"
], function (
        declare,
        _ServiceExtensionWidget,
        _WidgetBase,
        _TemplatedMixin,
        _WidgetsInTemplateMixin,
        templateString
        ) {

    return declare([_ServiceExtensionWidget,
        _WidgetBase,
        _TemplatedMixin,
        _WidgetsInTemplateMixin], {
        templateString: templateString,
        resize: function(dim){
            this.borderContainer.resize(dim);
        },
        getHeight: function () {
            return 100;
        },
        _onSubmitClicked:function(){
            var url = this.textBox.get("value");
            var lat = this.latTextBox.get("value");
            var long = this.lngTextBox.get("value");
            var delimiter = this.delimiterTextBox.get("value");
            
            this.onSubmitClick({
                url:url,
                lat:lat,
                lng:long,
                del:delimiter
            });
        }
    });

});