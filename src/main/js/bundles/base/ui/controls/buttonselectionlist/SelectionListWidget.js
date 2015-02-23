/**
 * COPYRIGHT 2014 con terra GmbH Germany
 *
 * Created by fba on 04.04.2014.
 */
define([
        "dojo/_base/declare",
        "dojo/_base/array",
        "dojo/_base/lang",
        "dojo/query",
        "dojo/sniff",
        "dijit/Tooltip",
        "dijit/_MenuBase",
        "dijit/_OnDijitClickMixin",
        "dijit/MenuItem",
        "ct/_when",
        "ct/_string",
        "dojo/dom-style",
        "base/util/css",
        "ct/ui/desktop/util",
        "ct/_Connect"
    ],
    function (
        declare,
        d_array,
        d_lang,
        d_query,
        d_sniff,
        Tooltip,
        _MenuBase,
        _OnDijitClickMixin,
        MenuItem,
        ct_when,
        ct_string,
        d_domstyle,
        agiv_css,
        d_util,
        Connect
        ) {
        return declare([_MenuBase],
            {

                templateString: '<table tabIndex="${tabIndex}" data-dojo-attach-point="containerNode"></table>',
                baseClass: "ctBasemapDropDownToggler",

                constructor: function () {
                    this._handler = new Connect({
                        defaultConnectScope: this
                    });
                    this._isMobile = d_sniff("ios") || d_sniff("android");
                },

                postCreate: function () {
                    this.inherited(arguments);
                    this._handler.connect("model", this.get("model"), "onUpdate", "_buildItems");
                    if (!this._isMobile) {
                        this._handler.connect("widget", this, "onMouseOver", "_connectMouseOut");
                    } else {
                        this._handler.connect("widget", this, "onFocus", "_connectMouseOut");
                    }
                },

                startup: function () {
                    if (!this._started) {
                        this._buildItems();
                    }
                    this.inherited(arguments);
                    this._map = this.get("map");
                    if (this.get("secondMap")) {
                        this._map = this.get("secondMap");
                    }
                    if (this.collapseTimeout) {
                        this._setTimeout(this.collapseTimeout);
                    }
                },

                _setTimeout: function (timeout) {
                    this._handler.disconnect("maphover");
                    this._connectMouseOver();
                    this._timeout = setTimeout(d_lang.hitch(this, function () {
                        this._collapseWindow();
                    }), Math.round(timeout));
                },

                _collapseWindow: function () {
                    var w = d_util.findEnclosingWindow(this);
                    if (w && !w.collapsed) {
                        w.collapse({r: true});
                    }
                },

                _connectMouseOut: function () {

                    if (!this._isMobile) {
                        this._handler.connect("maphover", this._map, "onMouseOver", function () {
                            this._setTimeout(this.collapseTimeout / this.autoCollapseFactor);
                        });
                    } else {
                        this._handler.connect("maphover", this, "onBlur", function () {
                            this._setTimeout(this.collapseTimeout / this.autoCollapseFactor);
                        });
                    }

                },

                _connectMouseOver: function () {

                    if (!this._isMobile) {
                        this._handler.connect("stop", this, "onMouseOver", "_stopCollapse");
                    } else {
                        this._handler.connect("stop", this, "onFocus", "_stopCollapse");
                    }

                },

                _stopCollapse: function () {
                    this._handler.disconnect("stop");
                    if (this._timeout) {
                        clearTimeout(this._timeout);
                        this._timeout = null;
                    }

                },

                onItemClick: function (evt) {
                    this.inherited(arguments);
                    var model = this.get("model");
                    model.setSelected(evt.value, true);
                    if (this.eventService) {
                        var topic = this.topic || "agiv/selectionList/onItemClick";
                        this.eventService.sendEvent(topic, {
                            value: evt.value
                        });
                    }
                },

                _destroyChildren: function () {

                    d_array.forEach(this.getChildren(), function (child) {

                        child.destroyRecursive();

                    }, this);

                },

                _onBlur: function () {
                    //fixes the loss of selection after window closed
                    this.onBlur();
                },

                _buildItems: function () {
                    var model = this.get("model");
                    this._destroyChildren();
                    ct_when(model.getItems(), function (items) {
                        d_array.forEach(items, function (
                            item,
                            i
                            ) {
                            var identity = model.getIdentity(item);

                            var menuItem = new MenuItem({
                                label: item.title,
                                value: identity,
                                "class": identity
                            });

                            var tooltip = item.tooltip || item.description;

                            if (tooltip) {
                                menuItem.on("mouseOver", function () {
                                    Tooltip.show(tooltip, menuItem.domNode);
                                });
                                menuItem.on("mouseOut", function () {
                                    Tooltip.hide(menuItem.domNode);
                                });
                            }

                            var url;
                            if (this.thumbnailUrl) {
                                url = ct_string.stringReplace(this.thumbnailUrl, item);
                                d_domstyle.set(menuItem.containerNode, "backgroundImage",
                                        "url('" + url + "')");
                            }

                            if (model.isSelected(model.getIdentity(item)) || (this.currentApp && this.currentApp.id === model.getIdentity(item))) {
                                this.set("selected", menuItem);
                                if (this.writesToCollapseHandle) {
                                    agiv_css.createSelector(".ctWindow." + this.widgetRole + " .ctCollapseGrid .ctCollapseInnerHandle",
                                            "background-image:url('" + url + "');background-position:0px 0px;");
                                    if (this.writesTitleToCollapseHandle) {
                                        var elems = d_query(".ctWindow." + this.widgetRole + " .ctCollapseGrid .ctCollapseInnerHandle");
                                        d_array.forEach(elems, function (elem) {
                                            elem.innerHTML = item.title;
                                        }, this);
                                    }
                                }
                            }
                            this.addChild(menuItem);
                        }, this);

                    }, function (error) {
                        console.error("could not build selection list", error);
                    }, this);
                }
            }
        );
    }
);