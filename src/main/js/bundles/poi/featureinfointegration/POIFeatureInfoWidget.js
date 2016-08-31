define([
        "dojo/_base/declare",
        "dojo/_base/array",
        "dojo/_base/lang",
        "dojo/dom-construct",
        "dojo/dom-geometry",
        "dojo/string",
        "dojo/dom-class",
        "ct/array",
        "ct/_lang",
        "ct/util/css",
        "ct/_Connect",
        "ct/_when",
        "ct/async",
        "ct/ui/desktop/util",
        "../AddressFormat",
        "dijit/_Widget",
        "dijit/_WidgetsInTemplateMixin",
        "infoviewer/FourAnchorsPlacementStrategy",
        "base/ui/genericidentify/FeatureInfoWidget",
        "dojo/text!./templates/FeatureInfoWidget.html",
        "dijit/form/ToggleButton",
        "dijit/layout/ContentPane"
    ],
    function (
        declare,
        d_array,
        d_lang,
        d_domConstruct,
        d_domGeometry,
        d_string,
        d_class,
        ct_array,
        ct_lang,
        ct_css,
        Connect,
        ct_when,
        ct_async,
        ct_desktopUtil,
        AddressFormat,
        _Widget,
        _WidgetsInTemplateMixin,
        FourAnchorsPlacementStrategy,
        FeatureInfoWidget,
        templateStringContent
        ) {
        /*
         * COPYRIGHT 2012 con terra GmbH Germany
         */
        /**
         * @fileOverview This file provides a feature info widget.
         */
        var POIFeatureInfoWidget = declare([
                FeatureInfoWidget
            ],
            /**
             * @lends ct.bundles.genericidentify.PoiInfoWidget.prototype
             */
            {
                baseClass: "ctPoiInfoResult",
                templateString: templateStringContent,

                attributeMap: d_lang.delegate(_Widget.prototype.attributeMap, {
                        name: [
                            {
                                node: "nameNode",
                                type: "innerHTML"
                            }
                        ],
                        href: [
                            {
                                node: "moreInformation",
                                type: "attribute"
                            }
                        ],
                        nodata: [
                            {
                                node: "nodataNode",
                                type: "innerHTML"
                            }
                        ]
                    }
                ),

                constructor: function () {
                },

                postCreate: function () {
                    this.inherited(arguments);
                    this._showMessage("loading", this.i18n.loadingGeneralInfo);
                },

                _showPOIResult: function (content) {

                    this._showGeocodeResult(content);

                    d_lang.mixin(this.content, content);

                    this.content.type = "SEARCH_RESULT_POI";

                    var more = d_string.substitute(this.i18n.moreInformationPOI, {
                        name: content.primaryLabel
                    });
                    this.set("name", content.primaryLabel);
                    ct_css.switchHidden(this.nameNode, true);
                    if(content.address && content.address.street && content.address.municipality){
                        //var address = this._getAddressAsString(content.address);
                        //this.addressNode.innerHTML = "<div class='ctFeatureInfoAddress'><div class='icon-marker featureinfoIcon'></div> <div>" + address + "</div></div>";
                        this.addressNode.innerHTML = "<div class='ctFeatureInfoAddress'><div class='icon-marker featureinfoIcon'></div><div>" + content.address.street + " " + content.address.streetnumber + "</div>" + "<div>" + content.address.postalcode + " </div></div>";
                        d_domConstruct.create("a", {
                                href: "http://www.vlaanderen.be/" + content.address.municipality,
                                target: "_blank",
                                innerHTML: content.address.municipality
                            }, this.addressNode.childNodes[0].childNodes[2]);
                    }
                    
                    
                    
                    if (content.phone) {
                        this.phoneNode.innerHTML = "<div class='ctFeatureInfoContact'><div class='icon icon-phone'></div><div>" + content.phone + "</div></div>";
                    }
                    if (content.email) {
                        this.emailNode.innerHTML = "<div class='ctFeatureInfoContact'><div class='icon icon-mail'></div><div><a href='mailto:" + content.email + "' target='_top'>" + content.email + "</a></div></div>";
                    }

                    content.note = ct_lang.chkProp(content, "note", "");

                    this._addressHintVisible = true;
                    if (content.pointQuality !== "multiple roadsegments") {
                        ct_css.switchVisibility(this.addressHint, false);
                        this._addressHintVisible = false;
                    } else {
                        ct_css.switchVisibility(this.addressHint, true);
                    }

                    if (content.links && content.links.length === 0 && content.note && content.note.length === 0 && content.description.length === 0) {
                        this.set("nodata", this.i18n.nodata);
                    } else {
                        if (content.links && content.links.length > 0) {
                            d_array.forEach(content.links, function (link) {

                                d_domConstruct.create("div", {
                                    "class": "icon-arrow-rounded-right featureinfoIcon"
                                }, this.moreInformationPOI);
                                var wrapper = d_domConstruct.create("div", {
                                }, this.moreInformationPOI);
                                d_domConstruct.create("a", {
                                    href: link.href,
                                    target: "_blank",
                                    innerHTML: link.value
                                }, wrapper);

                            }, this);
                        }

                        this._createLengthToggler(content, "description",
                            this.description,
                            this.moreDescriptionButton,
                            this.descriptionContainer.domNode);
                        this._createLengthToggler(content, "note", this.note,
                            this.moreNoteButton);

                    }

                    this.labelNode.innerHTML = content.title;

                    if (content.alias) {
                        this._aliasVisible = true;
                        this.aliasNode.innerHTML = content.alias;
                        ct_css.switchVisibility(this.aliasNode, true);
                    }

                    this._hideMessage();

                    if (!this._window) {
                        this._window = ct_desktopUtil.findEnclosingWindow(this.domNode);
                    }
                    ct_async.hitch(this, this._resizeWindow, 150)();
                    
                    
                   

                },

                startup: function () {
                    this.inherited(arguments);
                    ct_when(this.contentDeferred, this._showPOIResult, function (error) {
                        //TODO
                        this._showMessage("error", error);
                        console.error(error);
                    }, this);
                },

                _getAddressAsString: function (address) {
                    if (d_lang.isString(address)) {
                        return address;
                    }
                    return AddressFormat.getFormattedAddress(address, "<br/>");
                },

                _resizeWindow: function () {

                    var mb = d_domGeometry.getMarginBox(this._window.domNode),
                        poiLinks = d_domGeometry.getContentBox(this.moreInformationPOI),
                        addressHint = d_domGeometry.getContentBox(this.addressHint),
                        phone = d_domGeometry.getContentBox(this.phoneNode),
                        email = d_domGeometry.getContentBox(this.emailNode),
                        label = d_domGeometry.getMarginBox(this.labelNode),
                        address = d_domGeometry.getContentBox(this.addressNode),
                        alias = d_domGeometry.getMarginBox(this.aliasNode),
                        table = d_domGeometry.getMarginBox(this.infoTableNode),
                        buttonsHeight = d_domGeometry.getMarginBox(this.buttonContainer.domNode),
                        desc = d_domGeometry.getMarginBox(this.descriptionContainer.domNode);
                    if (!this._oldMB) {
                        this._oldMB = d_lang.mixin({}, mb);
                    }
                    mb.h = 82 + poiLinks.h + phone.h + address.h + buttonsHeight.h +
                        (this._aliasVisible ? alias.h : 0) + desc.h + label.h +
                        table.h + email.h + (this._addressHintVisible ? addressHint.h : 0);
                    this._window.resize(mb);

                    var viewPort = this.mapState.getViewPort();
                    var windowDistanceFromPoint = {
                        x: 35,
                        y: 35
                    };

                    var fourAnchorsPS = new FourAnchorsPlacementStrategy(windowDistanceFromPoint);
                    var windowDimensions = {
                        h: d_domGeometry.getMarginBox(this._window.domNode).h,
                        w: d_domGeometry.getMarginBox(this._window.domNode).w
                    };
                    var placement = fourAnchorsPS.getPlacement(this.content.geometry,
                        windowDimensions,
                        viewPort, {
                            x: 0,
                            y: 0
                        });
                    this._window.resize({
                        l: placement.screenPoint.x,
                        t: placement.screenPoint.y,
                        w: windowDimensions.w,
                        h: windowDimensions.h
                    });

                },

                _createLengthToggler: function (
                    obj,
                    attrName,
                    node,
                    buttonNode,
                    wrapper
                    ) {
                    var text = obj[attrName];
                    if (text.length === 0) {
                        ct_css.toggleClass(node, "ctPoiInfo", false);
                        return;
                    }
                    if (wrapper) {
                        ct_css.switchVisibility(wrapper, true);
                    }
                    ct_css.toggleClass(node, "ctPoiInfo", true);
                    if (text && text.length > this.maxTextLength) {
                        this[attrName + "_short"] = text.substring(0,
                            this.maxTextLength) + "...";
                        ct_css.switchHidden(buttonNode.domNode, false);
                        buttonNode.set("label", this.i18n.more);
                    }
                    node.innerHTML = this[attrName + "_short"] || text;
                    this._listeners.connect(buttonNode, "onClick", this, function () {
                        if (buttonNode.get("checked")) {
                            node.innerHTML = obj[attrName];
                            buttonNode.set("label", this.i18n.less);
                        } else {
                            node.innerHTML = this[attrName + "_short"] || obj[attrName];
                            buttonNode.set("label", this.i18n.more);
                        }
                        this._resizeWindow();
                    });
                },

                resize: function (dim) {
                    if (dim) {
                        this.mainContainer.resize({
                            h: dim.h
                        });

                    } else {
                        this.mainContainer.resize();
                    }

                }
            });
        POIFeatureInfoWidget.createWidget = function (
            params,
            contentFactory
            ) {
            if (params.context.showTrashCan) {
                var tool = contentFactory.get("deleteTool");
                tool.managedLayerId = params.context.managedLayerId;
                if (ct_array.arrayFirstIndexOf(params.rule.window.tools, tool) === -1) {
                    params.rule.window.tools.push(tool);
                }
            } else {
                params.rule.window.tools = [];
            }
            var opts = contentFactory.get("POIFeatureInfoWidget");
            return new POIFeatureInfoWidget({
                content: params.content,
                context: params.context,
                contentDeferred: params.content.contentDeferred,
                i18n: opts.i18n,
                eventService: contentFactory.get("eventService"),
                maxTextLength: opts.maxTextLength || 100,
                showNearby: contentFactory.get("locationInfoController"),
                mapState: contentFactory.get("mapState")
            });
        };
        return POIFeatureInfoWidget;
    });