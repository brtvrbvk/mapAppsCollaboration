/**
 * COPYRIGHT 2012-2013 con terra GmbH Germany
 *
 * User: fba
 * Date: 31.07.13
 * Time: 12:56
 */
define([
        "dojo/_base/declare",
        "dijit/_WidgetBase",
        "dijit/_TemplatedMixin",
        "dijit/_WidgetsInTemplateMixin",
        "ct/util/css",
        "dojo/text!./templates/BreadcrumbNode.html",
        "dijit/form/Button"
    ],
    function (
        declare,
        _WidgetBase,
        _TemplatedMixin,
        _WidgetsInTemplateMixin,
        ct_css,
        templateString
        ) {
        return declare([
                _WidgetBase,
                _TemplatedMixin,
                _WidgetsInTemplateMixin
            ],
            {

                templateString: templateString,

                constructor: function () {
                },

                postCreate: function () {
                    this.inherited(arguments);
                },

                _onNodeClick: function () {
                    this.onNodeClick({
                        modelNode: this.modelNode
                    });
                },

                onNodeClick: function () {
                }
            }
        )
    }
);