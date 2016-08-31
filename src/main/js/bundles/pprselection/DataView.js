/*
 * COPYRIGHT 2011-2012 con terra GmbH Germany
 */
/**
 * @fileOverview
 * @author fba
 */
define([
        "dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/_base/array",
        "dojo/dom-construct",
        "ct/ui/controls/dataview/DataView",
        "ct/util/css",
        "ct/_when"
    ],
    function (
        declare,
        d_lang,
        d_array,
        d_domconstruct,
        ct_DataView,
        css,
        ct_when
        ) {

        return declare([ct_DataView], {

            postCreate: function () {
                this.inherited(arguments);
                if (this.rvvSpecificTitle) {
                    var p = d_domconstruct.create("p", {
                        "class": "agivAddress"
                    }, this._topPane.domNode, "first");
                    this.address = d_domconstruct.create("span", {
                        innerHTML: this.addressTextPPR
                    }, p);

                    var p1 = d_domconstruct.create("p", {
                        "class": "agivTitle"
                    }, this._topPane.domNode, "first");
                    d_domconstruct.create("span", {
                        innerHTML: this.initialText
                    }, p1);

                    this.layout();
                }
                this.set({
                    "enableIconView": false,
                    "enableDetailView": false,
                    "showViewButtons": false
                });

                this._tools = [];
            },

            _onHide: function () {

                this._eventService.postEvent("agiv/parcelselection/DISABLE_PRINT_INFO");

            },

            onPrintResultList: function (evt) {
            },
            getFullDate: function (
                splitter,
                format
                ) {
                var today = new Date();
                var dd = today.getDate();
                var mm = today.getMonth() + 1; //January is 0!

                var yyyy = today.getFullYear();
                if (dd < 10) {
                    dd = '0' + dd
                }
                if (mm < 10) {
                    mm = '0' + mm
                }
                return d_lang.replace(format, {
                    mm: mm,
                    dd: dd,
                    yyyy: yyyy,
                    splitter: splitter
                });
            },

            _hideTable: function () {
                css.switchHidden(this._viewPane.domNode, true);
                css.switchHidden(this._pager.domNode, true);
                css.switchHidden(this._toolBarNode, true);
                this._tools = this._getToolsToHide();
                d_array.forEach(this._tools, function (tool) {
                    css.switchHidden(tool, true);
                });
            },

            _showTable: function () {
                css.switchHidden(this._viewPane.domNode, false);
                css.switchHidden(this._pager.domNode, false);
                css.switchHidden(this._toolBarNode, false);
                this._tools = this._getToolsToHide();
                d_array.forEach(this._tools, function (tool) {
                    css.switchHidden(tool, false);
                });
            },

            _getToolsToHide: function () {
                if (this._tools.length === 0) {
                    var toolbar = this._toolBarNode.children[0];
                    var tools = toolbar.children;
                    d_array.forEach(tools, function (tool) {
                        if (!css.hasClasses(tool, "ctTool_printResultCenterTool"))
                            this._tools.push(tool);
                    }, this);
                }
                return this._tools;
            },

            _setModelAttr: function (model) {
                this.inherited(arguments);
                if (model) {
                    var printTopic = "agiv/parcelselection/";
                    var addressText;
                    if (!model.store.empty) {
                        addressText = this.addressTextPPR;
                    } else {
                        addressText = this.addressTextNoPPR;
                    }
                    ct_when(model.store.query({}, {}), function (res) {
                        if (res.length > 0 && res[0].ppr_type) {
                            this.address.innerHTML = d_lang.replace(addressText, {
                                date: this.getFullDate("/", "{dd}{splitter}{mm}{splitter}{yyyy}"),
                                //parcelnumber: res[0].parcelID,
                                parcelnumber: '<a href=javascript:document.bart_reversecapakey.callReverse();>' +res[0].parcelID + '</a>',
                                address: model.store.address
                            });
                            this._showTable();
                            this._eventService.postEvent(printTopic + "ENABLE_PRINT_INFO");
                        } else {
                            this.address.innerHTML = d_lang.replace(addressText, {
                                date: this.getFullDate("/", "{dd}{splitter}{mm}{splitter}{yyyy}"),
                                parcelnumber: (res && res.length && res[0].parcelID) ? '<a href=javascript:document.bart_reversecapakey.callReverse();>' +res[0].parcelID + '</a>' : "-",
                                address: (model && model.store && model.store.address) ? model.store.address : "-"
                            });
                            this._hideTable();
                            if (res.length > 0) {
                                this._eventService.postEvent(printTopic + "ENABLE_PRINT_INFO");
                            } else {
                                this._eventService.postEvent(printTopic + "DISABLE_PRINT_INFO");
                            }
                        }
                    }, function (err) {
                        console.error(err);
                    }, this);
                }
                this.resize();
            }
        });
    });

