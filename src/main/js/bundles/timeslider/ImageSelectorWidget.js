/**
 * COPYRIGHT 2012-2013 con terra GmbH Germany
 *
 * User: fba
 * Date: 11.02.14
 * Time: 09:06
 */
define([
        "dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/_base/array",
        "dojo/keys",
        "dojo/dom-geometry",
        "ct/util/css",
        "dijit/_MenuBase",
        "dijit/layout/_ContentPaneResizeMixin",
        "dijit/_WidgetsInTemplateMixin",
        "dojo/Evented",
        "dojo/text!./templates/ImageSelectorWidget.html",
        "dijit/form/Button"
    ],
    function (
        declare,
        d_lang,
        d_array,
        d_keys,
        d_domgeom,
        ct_css,
        _MenuBase,
        _ContentPaneResizeMixin,
        _WidgetsInTemplateMixin,
        Evented,
        templateString
        ) {
        return declare([
                _MenuBase,
                _ContentPaneResizeMixin,
                _WidgetsInTemplateMixin,
                Evented
            ],
            {

                templateString: templateString,
                baseClass: "dijitMenu ctImageSelectorWidget",
                _viewportsize: 5,

                constructor: function () {

                },

                postCreate: function () {
                    this.inherited(arguments);
                    this.connectKeyNavHandlers([], [], []);
                },

                connectKeyNavHandlers: function (
                    /*keys[]*/
                    prevKeyCodes,
                    /*keys[]*/
                    nextKeyCodes,
                    /*keys[]*/
                    closeKeyCodes
                    ) {
//                    this.inherited(arguments);
//                    var keyCodes = this._keyNavCodes,
//                        close = d_lang.hitch(this,function(){
//                            this.onClose();
//                        });
//                    d_array.forEach(closeKeyCodes, function(code){ keyCodes[code] = close; });

                },

                clear: function () {

                    var c = this.getChildren();
                    d_array.forEach(c, function (child) {
                        this.removeChild(child);
                    }, this);

                },

                getImageMarginBox: function () {
                    var child = this.getChildren()[0];
                    if (child) {
                        return d_domgeom.getMarginBox(child.domNode);
                    } else {
                        return {};
                    }

                },

                onClose: function () {
                },

                resize: function (dim) {

                    if (dim) {
                        var domBox = d_domgeom.getMarginBox(this.domNode);
                        var imageBox = d_domgeom.getMarginBox(this.containerNode);

                        d_domgeom.setMarginBox(this.domNode, {w: dim.w});//,h:domBox.h});

                        d_domgeom.setMarginBox(this.containerNode, {w: (dim.w)});//,h:imageBox.h});
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
                },

                _cleanUp: function (
                    /*Boolean*/
                    clearSelectedItem
                    ) {
                    // summary:
                    //		Called when the user is done with this menu.  Closes hierarchy of menus.
                    // tags:
                    //		private

                    this._closeChild(); // don't call this.onClose since that's incorrect for MenuBar's that never close
                    if (typeof this.isShowingNow == 'undefined') { // non-popup menu doesn't call onClose
                        this.set("activated", false);
                    }

//                    if(clearSelectedItem){
//                        this.set("selected", null);
//                    }
                }
            }
        )
    }
);