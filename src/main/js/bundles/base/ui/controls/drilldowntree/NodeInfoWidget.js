/*
 * COPYRIGHT 2011-2012 con terra GmbH Germany
 */
/**
 * @fileOverview
 * @author fba
 */
define([
        "dojo/_base/declare",
        "ct/util/css",
        "dojo/string",
        "dijit/_WidgetBase",
        "dijit/_TemplatedMixin",
        "dijit/_WidgetsInTemplateMixin",
        "dojo/text!./templates/NodeInfoWidget.html",
        "dijit/layout/ContentPane",
        "dijit/form/Button"
    ],
    function (
        declare,
        css,
        d_string,
        _WidgetBase,
        _TemplatedMixin,
        _WidgetsInTemplateMixin,
        tString
        ) {
        return declare([
            _WidgetBase,
            _TemplatedMixin,
            _WidgetsInTemplateMixin
        ], {

            templateString: tString,
            baseClass: "ctNodeInfoWidget",
            i18n: {
                ui: {
                    nodescription: "No description available",
                    scale: "Van schaal ${maxScale} tot ${minScale}",
                    linkToMetadata: "link to metadata"
                }
            },

            constructor: function () {

            },

            postCreate: function () {
                this.inherited(arguments);
                var item = this.item;
                this.titlenode.innerHTML = item.title;

                var desc;
                var url;
                var minScale = item.minScale;
                var maxScale = item.maxScale;

                if (item.category) {
                    desc = item.category.description;
                } else if (item.service && item.props) {
                    desc = item.props.description;
                    url = item.props.metadataUrl;
                }
                this.descriptionnode.innerHTML = (desc) ? desc : this.i18n.ui.nodescription;
                if (url) {
                    this.linknode.href = url;
                } else {
                    css.switchHidden(this.linknode, true);
                }

                if ((minScale === undefined && maxScale === undefined) || (minScale === 0 && maxScale === 0)) {
                    css.switchHidden(this.scalenode, true);
                } else {
                    var t = d_string.substitute(this.i18n.ui.scale, {
                        minScale: minScale,
                        maxScale: maxScale
                    });
                    this.scalenode.innerHTML = t;
                }
            },

            _onCloseClick: function () {
                this.onCloseClick();
            },

            onCloseClick: function () {
            }
        });
    });
