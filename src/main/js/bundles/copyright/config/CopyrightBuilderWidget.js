define([
        "dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/_base/array",
        "ct/array",
        "ct/_Connect",
        "wizard/_BuilderWidget",
        "dijit/_TemplatedMixin",
        "dijit/_WidgetsInTemplateMixin",
        "dijit/Tree",
        "dijit/form/TextBox",
        "ct/util/css",
        "dojo/dnd/Source",
        "dijit/registry",
        "dojo/text!./templates/CopyrightBuilderWidget.html",
        ".",
        "dijit/layout/BorderContainer",
        "dijit/layout/ContentPane",
        "dijit/layout/TabContainer",
        "dijit/form/Button"
    ],
    function (
        declare,
        d_lang,
        d_array,
        ct_array,
        _Connect,
        _BuilderWidget,
        _TemplatedMixin,
        _WidgetsInTemplateMixin,
        Tree,
        TextBox,
        css,
        Source,
        d_registry,
        template,
        _moduleRoot
        ) {

        return _moduleRoot.CopyrightBuilderWidget = declare([
                _BuilderWidget,
                _TemplatedMixin,
                _WidgetsInTemplateMixin
            ],
            /**
             * @lends ct.bundles.genericidentify.config.MapModelStoreBuilderWidget.prototype
             */
            {
                templateString: template,

                i18n: {
                    description: "Define map model with operational and base layers",
                    hint: "New services can be added in the Map Services menu."
                },

                baseClass: "ctCopyrightBuilderWidget",

                /**
                 * @constructs
                 */
                constructor: function () {
                    this._listeners = new _Connect({
                        defaultConnectScope: this
                    });
                },

                postCreate: function () {
                    this.inherited(arguments);
                },

                _setServiceTreeModelAttr: function (attr) {
                    this.serviceTreeModel = attr;
                    this._createServiceTree();
                },

                _setPositionAttr: function (attr) {
                    this.position = attr;
                },

                _onGeneralClick: function () {
                    this._createGeneralConfig();
                },

                _createServiceTree: function () {
                    // Create the Tree.
                    this.servicesTree = new Tree({
                            model: this.serviceTreeModel,
                            showRoot: false,
                            autoExpand: true
                        },
                        this._servicesTreeNode);

                    this._listeners.connect(this.servicesTree,
                        "onClick",
                        function (item) {
                            this._updateDetails(item);
                        });
                },

                _isLeaf: function (item) {
                    if (item.isService) {
                        return false;
                    }
                    return true;
                },

                _createGeneralConfig: function () {
                    this.clearDetailsPanel();
                    var item = {
                        position: this.position
                    };
                    var form = {
                        "dataform-version": "1.0.0",
                        "type": "gridpanel",
                        "cols": 1,
                        "showLabels": true,
                        "children": [
                            {
                                "type": "selectbox",
                                "field": "position",
                                "labelAttribute": "name",
                                "values": [
                                    "upperleft",
                                    "lowerleft",
                                    "upperright",
                                    "lowerright"
                                ]
                            }
                        ]
                    };
                    var dataFormService = this.dataFormService;
                    var widget = dataFormService.createDataForm(form);
                    var binding = dataFormService.createBinding("object",
                        {
                            data: item
                        });
                    widget.set("dataBinding", binding);
                    binding.watch("*",
                        d_lang.hitch(this, function () {

                            var config = binding.data;
                            if (config && config.position) {
                                this.position = config.position;
                            }
                            this.onUpdateConfig();
                        }));
                    this._detailsPanel = widget;
                    this.formContainer.set("content", widget);
                    this._detailsContainer.resize();
                    widget.startup();
                },

                _updateDetails: function (item) {
                    var hint
                    if (item.isService) {
                        hint = this.i18n.serviceHint;
                    } else {
                        hint = this.i18n.layerHint;
                    }
                    this.clearDetailsPanel();
                    var form = {
                        "dataform-version": "1.0.0",
                        "type": "gridpanel",
                        "cols": 1,
                        "showLabels": true,
                        "children": [
                            {
                                "spanLabel": true,
                                "type": "label",
                                "value": hint
                            },
                            {
                                "type": "textbox",
                                "field": "props.copyright",
                                "title": this.i18n.copyright
                            },
                            {
                                "type": "textbox",
                                "field": "props.img",
                                "title": this.i18n.img
                            },
                            {
                                "type": "textbox",
                                "field": "props.text",
                                "title": this.i18n.text
                            },
                            {
                                "type": "textbox",
                                "field": "props.link",
                                "title": this.i18n.link
                            }
                        ]
                    };
                    var dataFormService = this.dataFormService;
                    var widget = dataFormService.createDataForm(form);
                    var binding = dataFormService.createBinding("object",
                        {
                            data: item
                        });
                    widget.set("dataBinding", binding);
                    binding.watch("*",
                        d_lang.hitch(this, function () {
                            this.onUpdateConfig();
                        }));

                    this._detailsPanel = widget;
                    this.formContainer.set("content", widget);
                    this._detailsContainer.resize();
                    widget.startup();
                },

                clearDetailsPanel: function () {
                    var detailsPanel = this._detailsPanel;
                    if (detailsPanel) {
                        detailsPanel.destroyRecursive();
                        this._detailsPanel = null;
                    }
                },

                onUpdateConfig: function (evt) {
                },

                resize: function (dim) {
                    this.inherited(arguments);
                    if (dim && dim.h > 0) {
                        dim.h -= this.getHeadingHeight();
                        this.mainContainer.resize(dim);
                    }
                }
            });
    });