define([
        "dojo/_base/declare",
        "dojo/_base/array",
        "ct/_Connect",
        "wizard/_BuilderWidget",
        "dijit/_TemplatedMixin",
        "dijit/_WidgetsInTemplateMixin",
        "./MappingItemWidget",
        "dojo/text!./templates/LegendBuilderWidget.html",
        ".",
        "dijit/layout/ContentPane",
        "dijit/form/Button"
    ],
    function (
        declare,
        d_array,
        _Connect,
        _BuilderWidget,
        _TemplatedMixin,
        _WidgetsInTemplateMixin,
        MappingItemWidget,
        templateStringContent,
        _moduleRoot
        ) {

        return _moduleRoot.LegendBuilderWidget = declare([
                _BuilderWidget,
                _TemplatedMixin,
                _WidgetsInTemplateMixin
            ],
            {
                templateString: templateStringContent,
                baseClass: "ctLegendBuilderWidget",

                constructor: function () {
                    this._listeners = new _Connect({
                        defaultConnectScope: this
                    });
                },

                postCreate: function () {
                    this.inherited(arguments);
                    this._createLegendMappingList();
                },

                _createLegendMappingList: function () {
                    this._clearContainer();
                    var items = this.legendMapping;
                    if (items && items.length > 0) {
                        d_array.forEach(items, function (item) {
                            var widget = new MappingItemWidget({
                                i18n: this.i18n,
                                mappingItem: item
                            });
                            widget.placeAt(this.formContainer.domNode);
                            this._listeners.connect(widget, "onChange",
                                "_changeLegendMappingConfig");
                        }, this);
                    }
                    this.legendMapping = this.legendMapping || [];
                },

                _clearContainer: function () {
                    var container = this.formContainer;
                    if (container.getChildren().length > 0) {
                        var domNode = container.domNode;
                        while (domNode.hasChildNodes()) {
                            domNode.removeChild(domNode.lastChild);
                        }
                    }
                },

                _changeLegendMappingConfig: function (evt) {
                    d_array.forEach(this.formContainer.getChildren(),
                        function (
                            item,
                            i
                            ) {
                            this.legendMapping[i] = item.getMappingItem();
                        }, this);
                    this._updateConfig();
                },

                _onAddClick: function (evt) {
                    this.legendMapping.push({
                        id: "",
                        legendURL: ""
                    });
                    this._createLegendMappingList();
                },

                _onRemoveClick: function (evt) {
                    var kill = [];
                    d_array.forEach(this.formContainer.getChildren(),
                        function (
                            item,
                            i
                            ) {
                            var checked = item.getCheckBoxState();
                            if (checked) {
                                kill.push(i);
                            }
                        });
                    d_array.forEach(kill, function (itemId) {
                        this.legendMapping.splice(itemId, 1);
                    }, this);
                    this._createLegendMappingList();
                    this._updateConfig();
                },

                _updateConfig: function () {
                    this.onUpdateConfig({
                        legendMapping: this.legendMapping
                    });
                },

                onUpdateConfig: function (evt) {
                },

                destroy: function () {
                    this.inherited(arguments);
                    this._listeners.disconnect();
                },

                resize: function (dim) {
                    this.inherited(arguments);
                }

            });
    });