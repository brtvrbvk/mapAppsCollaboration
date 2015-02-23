/**
 * COPYRIGHT 2012-2013 con terra GmbH Germany
 *
 */
define([
        "..",
        "dojo/_base/declare",
        "dojo/dom-geometry",
        "dijit/_WidgetBase",
        "dijit/_TemplatedMixin",
        "dijit/_WidgetsInTemplateMixin"
    ],
    function (
        _moduleRoot,
        declare,
        domGeom,
        _WidgetBase,
        _TemplatedMixin,
        _WidgetsInTemplateMixin
        ) {
        return _moduleRoot.InfoPOIWidget = declare([
                _WidgetBase,
                _TemplatedMixin,
                _WidgetsInTemplateMixin
            ],
            {
                templateString: "<div><div class=\"ctInfoPOIMainNode\" data-dojo-attach-point=\"containerNode\"></div></div>",
                baseClass: "ctInfoPOIWidget",

                topics: {
                    ON_POIDATAVIEW_SHOW: "ct/poidataview/ON_POIDATAVIEW_SHOW",
                    ON_POIDATAVIEW_HIDE: "ct/poidataview/ON_POIDATAVIEW_HIDE"
                },

                constructor: function () {
                },

                postCreate: function () {
                    this.inherited(arguments);
                },

                setContent: function (content) {
                    this.content = content;
                    this.containerNode.appendChild(content.domNode);
                },

                _onShow: function () {
                    this.eventService.postEvent(this.topics.ON_POIDATAVIEW_SHOW);
                },

                _onHide: function () {
                    this.eventService.postEvent(this.topics.ON_POIDATAVIEW_HIDE);
                },

                resize: function (dim) {
                    if (dim) {
                        domGeom.setMarginBox(this.domNode, dim);
                        domGeom.setMarginBox(this.containerNode, dim);
                        this.content.resize(dim);
//                    domGeom.setMarginBox(this.content.domNode, dim);
                    }
                    this.inherited(arguments);
                }
            }
        )
    }
);