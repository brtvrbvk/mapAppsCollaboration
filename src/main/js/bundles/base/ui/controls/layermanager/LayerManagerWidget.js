define([
        "dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/_base/array",
        "dojo/_base/html",
        "dojo/dom-class",
        "dojo/aspect",
        "dijit/Tooltip",
        "dijit/_WidgetBase",
        "dijit/_TemplatedMixin",
        "dijit/_WidgetsInTemplateMixin",
        "dijit/form/HorizontalSlider",
        "dijit/form/Button",
        "dojo/dnd/Source",
        "ct/_Connect",
        "ct/mapping/mapcontent/ServiceTypes",
        "ct/util/css",
        "./LayerManagerItemWidget",
        "dojo/text!./templates/LayerManagerWidget.html"
    ],
    function (
        declare,
        d_lang,
        d_array,
        d_html,
        domNode,
        d_aspect,
        Tooltip,
        _WidgetBase,
        _TemplatedMixin,
        _WidgetsInTemplateMixin,
        HorizontalSlider,
        Button,
        dndSource,
        Connect,
        ServiceTypes,
        ct_css,
        LayerManagerItem,
        templateStringContent
        ) {
        /*
         * COPYRIGHT 2011 con terra GmbH Germany
         */
        var creatorFunction = function (
            itemProperties,
            item,
            hint
            ) {
            if (item.data) {
                item = item.data;
            }
            return {
                node: item,
                data: d_lang.clone(item),
                type: itemProperties.layerType
            };
        };

        return declare([
                _WidgetBase,
                _TemplatedMixin,
                _WidgetsInTemplateMixin
            ],
            {
                templateString: templateStringContent,
//                _sliderVisible: false,

                constructor: function (args) {
                    this.handler = new Connect({
                        defaultConnectScope: this
                    });

                },

                postCreate: function () {
                    this.inherited(arguments);
                    this._initContainerTitle();
                    this._createAllLayersControls();
                    this.dnd = new dndSource(this.layersNode, {
                        creator: d_lang.partial(creatorFunction, this.itemProperties),
                        generateText: false,
                        simpleSelection: true,
                        singular: true,
                        accept: this.itemProperties.layerType,
                        mapState:this.mapState,
                        mapModel:this.mapModel
                    });
                    this.handler.connect(this.dnd, "onDndDrop", "onDndDrop");
                },

                _initContainerTitle: function () {
                    this.myLayersLabelNode.innerHTML = this.itemProperties.title;
                },

                addLayerToContextMenu: function (node) {
                    var opts = d_lang.mixin({
                        layer: node,
                        i18n: this.i18n,
//                        sliderVisible: this._sliderVisible,
                        eventService: this.eventService,
                        enablePOIHighlighting: this.enablePOIHighlighting,
                        mapState:this.mapState,
                        mapModel:this.mapModel
                    }, this.itemProperties);
                    delete opts.title;
                    var contextMenuWidget = new LayerManagerItem(opts);
                    if (node.get("enabled")) {
                        domNode.add(contextMenuWidget.itemNode, "ctSelected");
                    }
                    //contextMenuWidget.placeAt(this.layersNode);
                    this.addItem(contextMenuWidget);
                    return contextMenuWidget;
                },

                setAllLayersVisibilityStyle: function (visible) {
                    if (visible) {
                        domNode.add(this.allItemsNode.domNode, "ctSelected");
                    } else {
                        domNode.remove(this.allItemsNode.domNode, "ctSelected");
                    }
                },

                _createAllLayersControls: function () {
                    this.setToolbar(this.toolbar);
                    this._createTooltips();
                },

                setToolbar: function (toolbar) {
                    this.toolbar = toolbar;
                    if (toolbar) {
                        toolbar.placeAt(this.toolbarNode);
                        toolbar.startup();
                    }
                },

                unsetToolbar: function () {
                    var toolbar = this.toolbar;
                    if (toolbar) {
                        this.toolbarNode.removeChild(toolbar.domNode);
                        this.toolbar = null;
                    }
                },

                _createTooltips: function () {
                    var tt = new Tooltip({
                        label: this.i18n.removeAllLayers,
                        connectId: [this.removeAllButton.domNode]
                    });
                    d_aspect.before(this, "destroy", function () {
                        tt.destroy();
                    });
                },

                _onRemoveAll: function () {
                    this.onAllLayersRemoveClick({
                        source: this
                    });
                },

                addItem: function (item) {
                    var itemNode = item.domNode;
                    itemNode.indexOld = item.indexOld;
                    this.dnd.insertNodes(false, [
                        {
                            data: item.domNode,
                            widget: item,
                            type: this.itemProperties.layerType}
                    ]);
                    this.dnd.sync();
                },

                removeItem: function (key) {
                    this.dnd.delItem(key + "");
                    this.dnd.sync();
                },

                clearItems: function () {
                    try {
                        this.dnd.selectAll();
                        this.dnd.deleteSelectedNodes();
                        d_array.forEach(this.getAllNodes(), function (node) {
                            node.widget.destroy();
                        });
                    } catch (e) {
//                        console.error(e);
                    }
                },

                destroy: function () {
                    this.clearItems();
                    this.unsetToolbar();
                    this.inherited(arguments);
                    this.handler.disconnect();
                    this.dnd.destroy();
                },

                getAllNodes: function () {
                    return this.dnd.getAllNodes();
                },
                getSelectedNodes: function () {
                    return this.dnd.getSelectedNodes();
                },
                clearSelection: function () {
                    return this.dnd.selectNone();
                },
                onDndDrop: function (evt) {
                },
                onShow: function (evt) {
                },
                onHide: function (evt) {
                },
                onAllLayersRemoveClick: function (evt) {
                },
                onAllLayersVisibilityChange: function (evt) {
                },
                onAllLayersOpacityChange: function (evt) {
                }

            });
    });
