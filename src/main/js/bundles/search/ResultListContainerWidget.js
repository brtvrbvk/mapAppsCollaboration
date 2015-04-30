/**
 * COPYRIGHT 2012-2013 con terra GmbH Germany
 *
 * User: fba
 * Date: 04.07.13
 * Time: 15:47
 */
define([
        "dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/dom-geometry",
        "dojo/_base/array",
        "dojo/keys",
        "dijit/_MenuBase",
        "dijit/layout/_ContentPaneResizeMixin",
        "ct/util/css"
    ],
    function (
        declare,
        d_lang,
        d_domgeom,
        d_array,
        d_keys,
        _MenuBase,
        _ContentPaneResizeMixin,
        ct_css
        ) {
        return declare([
                _MenuBase,
                _ContentPaneResizeMixin
            ],
            {
                templateString: '<div tabIndex="${tabIndex}" data-dojo-attach-point="containerNode"></div>',
                baseClass: "dijitMenu ctSearchResultWidget",

                constructor: function () {

                },

                postCreate: function () {
                    this.inherited(arguments);
                    this.connectKeyNavHandlers([d_keys.UP_ARROW], [d_keys.DOWN_ARROW], [d_keys.ESCAPE]);
                },

                connectKeyNavHandlers: function (
                    /*keys[]*/
                    prevKeyCodes,
                    /*keys[]*/
                    nextKeyCodes,
                    /*keys[]*/
                    closeKeyCodes
                    ) {
                    this.inherited(arguments);
                    var keyCodes = this._keyNavCodes,
                        close = d_lang.hitch(this, function () {
                            this.onClose();
                        });
                    d_array.forEach(closeKeyCodes, function (code) {
                        keyCodes[code] = close;
                    });

                },

                onClose: function () {
                },

                resize: function (dim) {
                    this._layoutChildren();
                },

                dummyFocusFirstChild: function () {

                    var child = this._getFirstFocusableChild();
                    if (child && child.item && child.item.canSelectFirst) {
                        ct_css.toggleClass(child.domNode, "dijitMenuItemHover", true);
                        return true;
                    }
                    return false;

                },

                focusSecondChild: function () {

                    var child = this._getFirstFocusableChild();
                    if (child) {
                        ct_css.toggleClass(child.domNode, "dijitMenuItemHover", false);
                        child = this._getNextFocusableChild(this._getFirstFocusableChild(), 1);
                        this.focusChild(child);
                    }

                },

                //OVERRIDE
                _layoutChildren: function () {
                    // Call _checkIfSingleChild() again in case app has manually mucked w/the content
                    // of the ContentPane (rather than changing it through the set("content", ...) API.
                    if (this.doLayout) {
                        this._checkIfSingleChild();
                    }
                    var cb = this._contentBox || d_domgeom.getContentBox(this.containerNode);
                    if (this._singleChild && this._singleChild.resize) {

                        // note: if widget has padding this._contentBox will have l and t set,
                        // but don't pass them to resize() or it will doubly-offset the child
                        this._singleChild.resize({w: cb.w, h: cb.h});
                    } else {
                        // All my child widgets are independently sized (rather than matching my size),
                        // but I still need to call resize() on each child to make it layout.
                        d_array.forEach(this.getChildren(), function (widget) {
                            if (widget.resize) {
                                widget.resize({w: cb.w, h: cb.h});
                            }
                        });
                    }
                }

            }
        )
    }
);