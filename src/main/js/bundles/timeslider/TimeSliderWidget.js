/**
 * COPYRIGHT 2012-2013 con terra GmbH Germany
 *
 * User: fba
 * Date: 11.02.14
 * Time: 12:17
 */
define([
        "dojo/_base/declare",
        "dojo/dom-geometry",
        "dijit/_Widget",
        "dijit/_TemplatedMixin",
        "dijit/_WidgetsInTemplateMixin",
        "dojo/text!./templates/TimeSliderWidget.html"
    ],
    function (
        declare,
        d_domgeom,
        _Widget,
        _TemplatedMixin,
        _WidgetsInTemplateMixin,
        templateString
        ) {
        return declare([
                _Widget,
                _TemplatedMixin,
                _WidgetsInTemplateMixin
            ],
            {

                templateString: templateString,

                constructor: function () {

                },

                postCreate: function () {
                    this.inherited(arguments);

                    this.imageSelector.placeAt(this.imageSelectorNode);
                    this.timeSliderBar.placeAt(this.timeSliderNode);

                },

                resize: function (dim) {
                    this.inherited(arguments);
                    if (this.imageSelector) {
                        this.imageSelector.resize(dim);
                    }
                    if (this.timeSliderBar) {
                        this.timeSliderBar.resize(dim);
                    }
                    var p = this.domNode.parentNode;
                    if (p) {
                        p.style.marginLeft = "-" + Math.round(dim.w / 2) + "px";
                    }
                },

                updateLayout: function () {
                    var imageBox = this.imageSelector.getImageMarginBox();
                    var len = this.imageSelector.getChildren().length;
                    this.resize({
                        w: len * imageBox.w,
                        h: d_domgeom.getMarginBox(this.domNode).h
                    });
                },

                startup: function () {
                    this.inherited(arguments);
                    this.updateLayout();
                }
            }
        )
    }
);