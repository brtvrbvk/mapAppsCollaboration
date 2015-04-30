define([
        "dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/_base/array",
        "ct/array",
        "ct/_Connect",
        "dijit/_WidgetBase",
        "dijit/_TemplatedMixin",
        "dijit/_WidgetsInTemplateMixin",
        "dijit/form/TextBox",
        "ct/util/css",
        "dojo/dnd/Source",
        "dijit/registry",
        "./MappingItem",
        "./ExtraInfoWidget",
        "dojo/text!./templates/IdentifyMappingWidget.html",
        "dijit/layout/ContentPane",
        "dijit/form/Button"
    ],
    function (
        declare,
        d_lang,
        d_array,
        ct_array,
        _Connect,
        _WidgetBase,
        _TemplatedMixin,
        _WidgetsInTemplateMixin,
        TextBox,
        css,
        Source,
        d_registry,
        MappingItem,
        ExtraInfoWidget,
        templateStringContent
        ) {

        var IdentifyMappingWidget = declare([
                _WidgetBase,
                _TemplatedMixin,
                _WidgetsInTemplateMixin
            ],
            {
                templateString: templateStringContent,

                baseClass: "ctIdentifyMappingWidget",

                /**
                 * @constructs
                 */
                constructor: function (
                    identifyMapping,
                    knownServicesStore,
                    i18n
                    ) {
                    this._identifyMapping = identifyMapping;
                    this._knownServicesStore = knownServicesStore;
                    this.i18n = i18n;
                    this._listeners = new _Connect({
                        defaultConnectScope: this
                    });
                },

                activate: function () {
                },

                postCreate: function () {
                    this.inherited(arguments);
                    this.dnd = new Source(this.dndList, {
                        generateText: false,
                        simpleSelection: true,
                        //skipForm needs to be set in order for IE to treat the textboxes correctly
                        skipForm: true,
                        singular: true
                    });
                    this.dndInfo = new Source(this.dndInfoList, {
                        generateText: false,
                        simpleSelection: true,
                        //skipForm needs to be set in order for IE to treat the textboxes correctly
                        skipForm: true,
                        singular: true
                    });
                    this._listeners.connect(this.dnd, "onDrop", "_changeIdentifyMapping");
                    this._listeners.connect(this.dndInfo, "onDrop", "_changeIdentifyMapping");
                    this._createIdentifyMappingForm();
                },

                _createIdentifyMappingForm: function () {
                    var config = this._identifyMapping;
                    if (!config) {
                        return;
                    }

                    if (!config.mapping)
                        config["mapping"] = [];
                    this._createMappingList(config.mapping);

                    if (!config.extraInfo)
                        config["extraInfo"] = [];
                    this._createExtraInfoList(config.extraInfo);

                    if (!config.ignoreAttributes)
                        config["ignoreAttributes"] = "";
                    this._createIgnoreList(config.ignoreAttributes);
                },

                _createMappingList: function (mapping) {
                    this.clearItems(this.dnd);
                    if (mapping.length > 0) {
                        mapping = ct_array.arraySort(mapping, this.__renderPriorityComparator);
                        d_array.forEach(mapping, function (item) {
                            var mi = new MappingItem({
                                knownServicesStore: this._knownServicesStore,
                                i18n: this.i18n.mappingWidget
                            });
                            mi.setMappingProperty(item);
                            this.addItem(mi, this.dnd);
                            this._listeners.connect(mi, "onChange", "_changeIdentifyMapping");
                        }, this);
                    }
                },

                _createExtraInfoList: function (extraInfo) {
                    this.clearItems(this.dndInfo);
                    if (extraInfo.length > 0) {
                        extraInfo = ct_array.arraySort(extraInfo, this.__renderPriorityComparator);
                        d_array.forEach(extraInfo, function (info) {
                            var infoWidget = new ExtraInfoWidget({
                                i18n: this.i18n.mappingWidget
                            });
                            infoWidget.setInfoContent(info);
                            this.addItem(infoWidget, this.dndInfo);
                            this._listeners.connect(infoWidget, "onChange", "_changeIdentifyMapping");
                        }, this);
                    }
                },

                _createIgnoreList: function (ignoreAttr) {
                    this.ignoreListBox = new TextBox({
                        "class": "ctIdentifyIgnoreList"
                    }, this.ignoreListNode);
                    if (this.ignoreWatch) {
                        this.ignoreWatch.unwatch();
                    }
                    this.ignoreListBox.set("value", ignoreAttr);
                    this.ignoreWatch = this.ignoreListBox.watch('value',
                        d_lang.hitch(this, this._changeIdentifyMapping));
                },

                _changeIdentifyMapping: function (evt) {
                    d_array.forEach(this.formContainer.getChildren(), function (
                        mi,
                        i
                        ) {
                        var mapping = mi.getMappingProperty();
                        this._identifyMapping.mapping[i] = {
                            attributeName: mapping.attributeName,
                            displayName: mapping.displayName,
                            attributeValue: mapping.attributeValue,
                            displayValue: mapping.displayValue,
                            serviceId: mapping.serviceId,
                            layerId: mapping.layerId,
                            hideFieldWhenBlank: mapping.hideFieldWhenBlank,
                            index: i + 1
                        };
                    }, this);

                    d_array.forEach(this.formInfoContainer.getChildren(), function (
                        infoWidget,
                        i
                        ) {
                        this._identifyMapping.extraInfo[i] = infoWidget.getInfoContent();
                        this._identifyMapping.extraInfo[i].index = i + 1;
                    }, this);

                    this._identifyMapping.ignoreAttributes = this.ignoreListBox.get("value");
                },

                getIdentifyMappingUpdate: function () {
                    return this._identifyMapping;
                },

                addItem: function (
                    item,
                    dndSource
                    ) {
                    dndSource.insertNodes(false, [item.domNode]);
                    dndSource.sync();
                },

                clearItems: function (dndSource) {
                    dndSource.selectAll();
                    dndSource.deleteSelectedNodes();
                },

                __renderPriorityComparator: function (
                    a,
                    b
                    ) {
                    a = Number(a.index);
                    b = Number(b.index);
                    if (!a && !b) {
                        return 0;
                    }
                    if (!a && b) {
                        return 1;
                    }
                    else if (!b && a) {
                        return -1;
                    }
                    else if (a < b) {
                        return -1;
                    }
                    else if (a == b) {
                        return 0;
                    }
                    return 1;
                },

                _onAddClick: function () {
                    if (!this._identifyMapping) {
                        return;
                    }
                    if (this._identifyMapping && !this._identifyMapping.mapping) {
                        this._identifyMapping["mapping"] = [];
                    }
                    this._identifyMapping.mapping.push({
                        attributeName: "",
                        displayName: "",
                        attributeValue: "",
                        displayValue: "",
                        serviceId: "",
                        layerId: "",
                        index: this._identifyMapping.mapping.length + 1
                    });
                    this._createMappingList(this._identifyMapping.mapping);
                },

                _onRemoveClick: function () {
                    if (!this._identifyMapping) {
                        return;
                    }
                    var kill = [];
                    d_array.forEach(this.formContainer.getChildren(), function (
                        mi,
                        i
                        ) {
                        var checked = mi.getCheckBoxState();
                        if (checked) {
                            kill.push(i);
                        }
                    }, this);
                    if (kill.length > 0) {
                        for (var j = 0; j < kill.length; j++)
                            this._identifyMapping.mapping.splice(kill[j] - j, 1);
                        this._createMappingList(this._identifyMapping.mapping);
                    }
                },

                _onAddInfoClick: function () {
                    if (!this._identifyMapping) {
                        return;
                    }
                    if (this._identifyMapping && !this._identifyMapping.extraInfo) {
                        this._identifyMapping["extraInfo"] = [];
                    }
                    this._identifyMapping.extraInfo.push({
                        title: "",
                        description: "",
                        index: this._identifyMapping.extraInfo.length + 1
                    });
                    this._createExtraInfoList(this._identifyMapping.extraInfo);
                },

                _onRemoveInfoClick: function () {
                    if (!this._identifyMapping) {
                        return;
                    }
                    var kill = [];
                    d_array.forEach(this.formInfoContainer.getChildren(), function (
                        infoWidget,
                        i
                        ) {
                        var checked = infoWidget.getCheckBoxState();
                        if (checked) {
                            kill.push(i);
                        }
                    }, this);
                    if (kill.length > 0) {
                        for (var j = 0; j < kill.length; j++)
                            this._identifyMapping.extraInfo.splice(kill[j] - j, 1);
                        this._createExtraInfoList(this._identifyMapping.extraInfo);
                    }
                },

                resize: function (dim) {
                    this.inherited(arguments);
                    if (dim) {
                        this.detailsContainer.resize(dim);
                    }
                },

                destroy: function () {
                    this.clearItems(this.dnd);
                    this.clearItems(this.dndInfo);
                    this.dnd.destroy();
                    this.dndInfo.destroy();
                    this._listeners.disconnect();
                    this.inherited(arguments);
                }

            });

        return IdentifyMappingWidget;

    });