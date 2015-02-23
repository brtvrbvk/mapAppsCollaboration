/**
 * COPYRIGHT 2014 con terra GmbH Germany
 *
 * Created by fba on 23.04.2014.
 */
define([
        "dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/_base/array",
        "dojo/dom-geometry",
        "dojo/sniff",
        "ct/Stateful",
        "ct/_Connect",
        "ct/_when",
        "ct/ui/desktop/util",
        "ct/array",
        "dijit/layout/ContentPane"
    ],
    function (
        declare,
        d_lang,
        d_array,
        d_domGeometry,
        d_has,
        Stateful,
        Connect,
        ct_when,
        ct_dutil,
        ct_array,
        ContentPane
        ) {
        return declare([
                Stateful,
                Connect
            ],
            {

                templateString: "",

                constructor: function () {
                    this.printDataProvider = [];
                    this.mapPrintDataProvider = [];
                },

                activate: function (componentContext) {

                    this.i18n = this._i18n.get();
                    this._bundleContext = componentContext.getBundleContext();
                    this._activated = true;

                    var currentAppTitle = this._appCtx.applicationProperties.title;
                    currentAppTitle = currentAppTitle.replace("<wbr>", "");
                    this.binding.print.map.title = currentAppTitle;
                    this.binding.print.splitviewmap.title = currentAppTitle;

                    this._cp = new ContentPane({
                        "class": "noPadding"
                    });
                    this._cp.show = this.show;
                    this._cp._initWidget = d_lang.hitch(this, this._initWidget);

                    this._initWidget();

                },

                createInstance: function () {
                    return this._cp;
                },

                deactivate: function () {
                    if (this._widget) {
                        this.disconnect();
                        this._widget.destroyRecursive();
                    }
                },

                addPrintDataProvider: function (printDataProvider) {
                    var printDataProviders = this.printDataProvider;
                    printDataProviders[printDataProviders.length] = printDataProvider;
                    this._reorderPrintDataProviders();
                    this._initWidget();
                },

                _reorderPrintDataProviders: function() {
                    var printDataProviders = this.printDataProvider;
                    var optionalChildrenOrder = this._properties.optionalChildrenOrder || [];
                    var orderedPrintDataProviders = [];
                    d_array.forEach(optionalChildrenOrder, function(componentName) {
                        var printDataProvider = ct_array.arraySearchFirst(printDataProviders, {"Component-Name": componentName});
                        if (printDataProvider) {
                            orderedPrintDataProviders.push(printDataProvider);
                            var index = ct_array.arrayFirstIndexOf(printDataProviders, {"Component-Name": componentName});
                            printDataProviders.splice(index, 1);
                        }
                    });
                    orderedPrintDataProviders = orderedPrintDataProviders.concat(printDataProviders);
                    this.printDataProvider = orderedPrintDataProviders;
                },

                removePrintDataProvider: function (printDataProvider) {
                    ct_array.arrayRemove(this.printDataProvider, printDataProvider);
                    this._initWidget();
                },

                addMapPrintDataProvider: function (printDataProvider) {
                    var mapPrintDataProviders = this.mapPrintDataProvider;
                    mapPrintDataProviders[mapPrintDataProviders.length] = printDataProvider;
                    this._initWidget();
                },
                removeMapPrintDataProvider: function (printDataProvider) {
                    ct_array.arrayRemove(this.mapPrintDataProvider, printDataProvider);
                    this._initWidget();
                },

                _parseChildren: function (provider) {
                    var targetArray = [];
                    d_array.forEach(provider, function (pdp) {
                        if (pdp.DATAFORM_ELEMENT) {

                            if (d_lang.isArray(pdp.DATAFORM_ELEMENT)) {
                                d_array.forEach(pdp.DATAFORM_ELEMENT, function (elem) {
                                    targetArray.push(elem);
                                }, this);
                            } else {
                                targetArray.push(pdp.DATAFORM_ELEMENT);
                            }

                        }
                    }, this);
                    return targetArray;
                },

                _initWidget: function (event) {
                    if (!this._activated) {
                        return;
                    }

                    var updateBindingValues = event && event.getProperty("updateBindingValues");
                    if (updateBindingValues) {
                        this._updateBindingValues(updateBindingValues);
                    }

                    this.deactivate();

                    var structure_top = d_lang.clone(this.structure_top);
                    structure_top.children = this._parseChildren(this.mapPrintDataProvider)

                    // add top section
                    var mainChildren = [structure_top];

                    //add mid section
                    var optionalChildren = this._parseChildren(this.printDataProvider);
                    mainChildren.push({
                        "type": "tablepanel",
                        "showLabels": true,
                        "cssClass": "optionalChildren reversedOrder",
                        "cols": 1,
                        "children": optionalChildren
                    });

                    //add bottom section
                    var structure_bottom_left = d_lang.clone(this.structure_bottom_left);
                    var structure_bottom_right = d_lang.clone(this.structure_bottom_right);
                    mainChildren.push({
                        "type": "tablepanel",
                        "showLabels": false,
                        "cols": 2,
                        "children": [
                            structure_bottom_left,
                            structure_bottom_right
                        ]
                    });

                    mainChildren.push({
                        "type": "tablepanel",
                        "showLabels": false,
                        "cols": 2,
                        "children": [
                            {
                                "type": "button",
                                "colspan": 2,
                                "title": this.i18n.ui.print,
                                "buttonID": "print",
                                "class": "printBtn",
                                "topic": "button/print/CLICK",
                                "iconClass": "icon-printer"
                            }
//                            {
//                                "type": "button",
//                                "colspan": 1,
//                                "title": this.i18n.ui.cancel,
//                                "buttonID": "cancel",
//                                "topic": "button/cancel/CLICK",
//                                "class": "cancelBtn"
//                            }
                        ]
                    });

                    //always 4 elements per map
                    var height = 135 * structure_top.children.length / 4
                        //optional children are 24px high
                        + optionalChildren.length * 24
                        //bottom children are 25px high
                        + (structure_bottom_right.children.length > structure_bottom_left.children.length ? structure_bottom_right.children.length : structure_bottom_left.children.length) * 20
                        //buttons are 40px high
                        + (d_has("ff") ? 50 : 40);
                    var dataform = {
                        "dataform-version": "1.0.0",
                        "size": {
                            "h": height,
                            "w": 345
                        },
                        "type": "tablepanel",
                        "showLabels": false,
                        "cols": 1,
                        "children": mainChildren
                    };

                    var dfwidget = this._widget = this._dataformService.createDataForm(dataform,
                        {i18n: this.i18n});
                    var binding = this._binding = this._dataformService.createBinding("object", {
                        data: this.binding
                    });

                    dfwidget.set("dataBinding", binding);

                    d_array.forEach(optionalChildren, function (oc) {

                        if (!oc.disabled && oc.checkedIfEnabled) {
                            this._binding.set(oc.field, true);
                        } else if (oc.disabled && oc.checkedIfEnabled) {
                            this._binding.set(oc.field, false);
                        }

                    }, this);

                    binding.watch("*", d_lang.hitch(this, function (
                            fieldname,
                            oldval,
                            newval
                            ) {
                            if (fieldname === "print.map.useExtent" && newval) {
                                if (this.extentProvider && this.extentProvider.getExtent()) {
                                    this._mapState.setExtent(this.extentProvider.getExtent());
                                }
                            }
                        }
                    ));

                    this.connect("widget", dfwidget, "onControlEvent", this, "_handleDataFormEvents");

                    this._cp._height = height;
                    this._cp._binding = this._binding;
                    this._cp.extentProvider = this.extentProvider;
                    this._cp._mapState = this._mapState;

                    this._cp.set("content", dfwidget);

                },

                _updateBindingValues: function(updatedBindingValues) {
                    this.binding = this._mixinDeep(this.binding || {}, updatedBindingValues);
                },

                // Source:  http://stackoverflow.com/questions/10893558/does-dojo-have-deep-mixin-like-jquery-extend
                _mixinDeep: function(dest, source) {
                    //Recursively mix the properties of two objects
                    var empty = {};
                    for (var name in source) {
                        if(!(name in dest) || (dest[name] !== source[name] && (!(name in empty) || empty[name] !== source[name]))){
                            try {
                                if ( source[name].constructor==Object ) {
                                    dest[name] = this._mixinDeep(dest[name], source[name]);
                                } else {
                                    dest[name] = source[name];
                                };
                            } catch(e) {
                                // Property in destination object not set. Create it and set its value.
                                dest[name] = source[name];
                            };
                        };
                    }
                    return dest;
                },

                show: function () {

                    var w = ct_dutil.findEnclosingWindow(this);
                    if (w) {
                        var mb = d_domGeometry.getMarginBox(w.domNode);
                        mb.h = this._height + 45;
                        w.resize(mb);
                    }

                    if (this._binding && this._binding.data.print.map.useExtent && this.extentProvider && this.extentProvider.getExtent()) {
                        this._mapState.setExtent(this.extentProvider.getExtent());
                    }

                },

                _handleDataFormEvents: function (evt) {
                    var widget = evt.control && evt.control.widget;
                    switch (evt.topic) {
                        case "button/print/CLICK":
                            if (widget) {
                                widget.set("iconClass", "icon-spinner");
                                widget.set("disabled", true);
                            }
                            ct_when(this.printController.print(this._binding.data), function () {
                                if (widget) {
                                    widget.set("iconClass", "icon-printer");
                                    widget.set("disabled", false);
                                }
                            }, function () {
                                if (widget) {
                                    widget.set("iconClass", "icon-printer");
                                    widget.set("disabled", false);
                                }
                            }, this);
                            break;
                        case "button/cancel/CLICK":
                            var w = ct_dutil.findEnclosingWindow(this._widget);
                            if (w) {
                                w.hide();
                            }
                    }
                }
            }
        );
    }
);