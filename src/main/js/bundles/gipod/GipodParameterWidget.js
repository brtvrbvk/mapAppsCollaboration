/**
 * COPYRIGHT 2012-2013 con terra GmbH Germany
 *
 * User: fba
 * Date: 08.10.13
 * Time: 15:35
 */
define([
        "dojo/_base/declare",
        "dojo/dom-geometry",
        "dijit/_WidgetBase",
        "dijit/_TemplatedMixin",
        "dijit/_WidgetsInTemplateMixin",
        "dojo/text!./templates/GipodParameterWidget.html",
        "ct/ui/controls/MessagePane"
    ],
    function (
        declare,
        d_geom,
        _WidgetBase,
        _TemplatedMixin,
        _WidgetsInTemplateMixin,
        templateString
        ) {
        return declare([
                _WidgetBase,
                _TemplatedMixin,
                _WidgetsInTemplateMixin
            ],
            {

                templateString: templateString,
                baseClass: "gipodParameterWidget",

                constructor: function () {

                },

                postCreate: function () {
                    this.inherited(arguments);
                    this.dataformwidget.placeAt(this.dataformwidgetnode);
                    this.dataformwidget.startup();
                },

                showMessage: function (
                    type,
                    message
                    ) {
                    this.hideMessage();
                    this.messagePane.addMessage({
                        type: type,
                        value: message
                    }, true);
                },

                hideMessage: function () {
                    this.messagePane.clearMessages();
                },

                resize: function (dim) {
                    d_geom.setMarginBox(this.domNode, dim);
                }
            }
        )
    }
);