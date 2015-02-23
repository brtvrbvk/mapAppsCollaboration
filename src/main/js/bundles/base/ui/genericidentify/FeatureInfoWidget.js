define([
        "dojo/_base/declare",
        "dojo/_base/array",
        "dojo/_base/lang",
        "dojo/string",
        "dojo/_base/html",
        "dojo/_base/Deferred",
        "dojo/dom-geometry",
        "dojo/dom-class",
        "dojo/dom-construct",
        "ct/_lang",
        "ct/_when",
        "ct/request",
        "ct/array",
        "ct/util/css",
        "infoviewer/FourAnchorsPlacementStrategy",
        "dijit/_Widget",
        "dijit/_TemplatedMixin",
        "dijit/_WidgetsInTemplateMixin",
        "dijit/layout/BorderContainer",
        "dijit/layout/ContentPane",
        "dijit/form/Button",
        "ct/_Connect",
        "dojo/text!./templates/FeatureInfoWidget.html",
        "dijit/layout/TabContainer",
        "dijit/form/Select",
        "dijit/layout/BorderContainer",
        "ct/ui/controls/MessagePane"
    ],
    function (
        declare,
        d_array,
        d_lang,
        d_string,
        d_html,
        Deferred,
        domGeom,
        d_class,
        domConstruct,
        ct_lang,
        ct_when,
        ct_request,
        ct_array,
        css,
        FourAnchorsPlacementStrategy,
        _WidgetBase,
        _TemplatedMixin,
        _WidgetsInTemplateMixin,
        BorderContainer,
        ContentPane,
        Button,
        Connect,
        templateStringContent
        ) {
        /*
         * COPYRIGHT 2012 con terra GmbH Germany
         */
        /**
         * @fileOverview This file provides a feature info widget.
         */
        return declare([
                _WidgetBase,
                _TemplatedMixin,
                _WidgetsInTemplateMixin
            ],
            /**
             * @lends ct.bundles.featureinfo.FeatureInfoWidget.prototype
             */
            {
                baseClass: "ctFeatureInfoResult",
                templateString: templateStringContent,

                contentViewer: null,
                // the results to show
                queryResults: null,

                geometry: null,

                AGIV_CONTENT_INFO: "agivGenericIdentify",

                topics: {
                    ADD_FROM_DIRECT: "ct/routing/ADD_FROM_DIRECT",
                    ADD_TO_DIRECT: "ct/routing/ADD_TO_DIRECT",
                    ADD_ROUTE_DIRECT: "ct/routing/ADD_ROUTE_DIRECT",
                    IDENTIFY_QUERY: "agiv/themainfo/QUERY"
                },

                constructor: function (args) {
                    this._listeners = new Connect();
                },

                _switchButtonNode: function (val) {
                    this.skipButtons ? css.switchHidden(this.buttonContainer.domNode,
                        true) : css.switchHidden(this.buttonContainer.domNode, val);
                },

                postCreate: function () {
                    this.inherited(arguments);
                    this.expanded = false;
                    if (this.content && this.content.title) {
                        this.set("title", this.content.title);
                    } else {
                        this.set("title", this.i18n.addressLevel);
                    }
                    this._switchButtonNode(true);
//                    this._showMessage("loading", this.i18n.loadingGeneralInfo);
                    if (this.showNearby) {
                        var btn = new Button({
                            label: this.i18n.showNearby,
                            "iconClass": "icon-info-italic",
                            "class": "ctMenuButton nearbyButton"
                        });
                        this._listeners.connect(btn, "onClick", this, this._onShowNearby);
                        this.buttonContainer.addChild(btn, 1); // Insert button as the second child
                    }
                    this.content.geocodeDeferred = this.geocodeDeferred;
                    ct_when(this.geocodeDeferred, function (resp) {

                        if (resp) {
                            this._showGeocodeResult(resp);
                        }
                        this._hideMessage();

                    }, function (error) {
                        this._showMessage("warning", error);
                    }, this);

                },
                _setTitleAttr: function (val) {
                    this.title = val;
                },

                _showGeocodeResult: function (item) {
                    if (!item.title && item.FormattedAddress) {
                        item.title = item.FormattedAddress;
                    }
                    this.addressNode.innerHTML = "<div class='ctFeatureInfoAddress'><div class='icon-marker featureinfoIcon'></div><div>" + item.address + "</div>" + "<div>" + item.municipality + "</div></div>";
                    if (this.i18n.moreInformation && item.municipality) {
                        var name = d_string.substitute(this.i18n.moreInformation, {
                            name: item.municipality
                        });
                        var href = d_string.substitute(this.content.municipalityLink, {
                            municipality: item.municipality
                        });
                        domConstruct.create("div", {
                            "class": "icon-arrow-rounded-right featureinfoIcon"
                        }, this.moreInformation);
                        domConstruct.create("a", {
                            href: href,
                            target: "_blank",
                            innerHTML: name
                        }, this.moreInformation);
                    } else {
                        css.switchHidden(this.moreInformation, true);
                    }
                },

                _onShowRoute: function () {
                    this.eventService.postEvent(this.topics.ADD_ROUTE_DIRECT,
                        d_lang.clone((this.content && this.content.geometry) || this.geometry));
                },

                _onShowNearby: function () {
                    this.eventService.postEvent(this.topics.IDENTIFY_QUERY, {
                        result: this.content
                    });
                    this.eventService.postEvent("agiv/genericidentify/CLOSE", {
                    });
                },

                _onCoordinatesClick: function () {
                    var context = d_lang.mixin(this.context, {
                        backEnabled: true
                    });
                    var content = {
                        geometry: this.content.geometry
                    };
                    context.infotype = "COORDINATE_INFO";
                    this.eventService.postEvent("agiv/genericidentify/SHOW_NEXT", {
                        nextContent: content,
                        nextContext: context,
                        content: this.content,
                        context: this.context
                    });
                },

                _showMessage: function (
                    type,
                    message
                    ) {
                    this._hideMessage();
                    this._switchButtonNode(true);
                    this.messagePane.addMessage({
                        type: type,
                        value: message
                    }, true);
                    this.resize();
                },

                _hideMessage: function () {
                    if (this.messagePane.messages.length > 0) {
                        this.messagePane.clearMessages();
                    }
                    this._switchButtonNode(false);
                    this.resize();
                },

                uninitialize: function () {
                    this.queryResults = [];
                    this.contentViewer = null;
                    this.inherited(arguments);
                    this.geometry = null;
                },

                destroy: function () {
                    this.inherited(arguments);
                    this._listeners.disconnect();
                },

                resize: function (dim) {
                    if (this.mainContainer) {
                        this.mainContainer.resize(dim);
                        return;
                    }
                    if (dim && dim.w && dim.h) {
                        d_html.marginBox(this.domNode, dim);
                    }
                }
            });
    });