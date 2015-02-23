/**
 * COPYRIGHT 2014 con terra GmbH Germany
 *
 * Created by fba on 15.07.2014.
 */
define([
        "dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/dom", // dom.byId dom.isDescendant
        "dojo/dom-attr", // domAttr.get domAttr.set domAttr.has domAttr.remove
        "dojo/_base/lang", // lang.hitch
        "dojo/_base/window", // win.body win.doc.documentElement win.doc.frames win.withGlobal
        "dijit/Menu",
        "dojo/_base/connect"
    ],
    function (
        declare,
        d_lang,
        dom,
        domAttr,
        lang,
        win,
        Menu,
        connect
        ) {
        return declare([Menu],
            {
                bindDomNode: function (
                    /*String|DomNode*/
                    node
                    ) {
                    // summary:
                    //		Attach menu to given node
                    node = dom.byId(node);

                    var cn;	// Connect node

                    // Support context menus on iframes.  Rather than binding to the iframe itself we need
                    // to bind to the <body> node inside the iframe.
                    if (node.tagName.toLowerCase() == "iframe") {
                        var iframe = node,
                            window = this._iframeContentWindow(iframe);
                        cn = win.withGlobal(window, win.body);
                    } else {

                        // To capture these events at the top level, attach to <html>, not <body>.
                        // Otherwise right-click context menu just doesn't work.
                        cn = (node == win.body() ? win.doc.documentElement : node);
                    }

                    // "binding" is the object to track our connection to the node (ie, the parameter to bindDomNode())
                    var binding = {
                        node: node,
                        iframe: iframe
                    };

                    // Save info about binding in _bindings[], and make node itself record index(+1) into
                    // _bindings[] array.  Prefix w/_dijitMenu to avoid setting an attribute that may
                    // start with a number, which fails on FF/safari.
                    domAttr.set(node, "_dijitMenu" + this.id, this._bindings.push(binding));

                    // Setup the connections to monitor click etc., unless we are connecting to an iframe which hasn't finished
                    // loading yet, in which case we need to wait for the onload event first, and then connect
                    // On linux Shift-F10 produces the oncontextmenu event, but on Windows it doesn't, so
                    // we need to monitor keyboard events in addition to the oncontextmenu event.
                    var doConnects = lang.hitch(this, function (cn) {
                        return [
                            // TODO: when leftClickToOpen is true then shouldn't space/enter key trigger the menu,
                            // rather than shift-F10?
                            connect.connect(this.mapState, "onClick", this, lang.hitch(this, function (evt) {
                                this.mapPoint = evt.mapPoint;
                                //only open menu when its not a graphic.
                                if (!evt.graphic) {
                                    this._scheduleOpen(evt.target, iframe, {
                                        x: evt.pageX,
                                        y: evt.pageY
                                    });
                                }
                            }))
                        ];
                    });
                    binding.connects = cn ? doConnects(cn) : [];

                    if (iframe) {
                        // Setup handler to [re]bind to the iframe when the contents are initially loaded,
                        // and every time the contents change.
                        // Need to do this b/c we are actually binding to the iframe's <body> node.
                        // Note: can't use connect.connect(), see #9609.

                        binding.onloadHandler = lang.hitch(this, function () {
                            // want to remove old connections, but IE throws exceptions when trying to
                            // access the <body> node because it's already gone, or at least in a state of limbo

                            var window = this._iframeContentWindow(iframe);
                            cn = win.withGlobal(window, win.body);
                            binding.connects = doConnects(cn);
                        });
                        if (iframe.addEventListener) {
                            iframe.addEventListener("load", binding.onloadHandler, false);
                        } else {
                            iframe.attachEvent("onload", binding.onloadHandler);
                        }
                    }
                }
            }
        );
    }
);