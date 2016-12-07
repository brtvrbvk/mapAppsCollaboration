/**
 * COPYRIGHT 2016 con terra GmbH Germany
 * Created by fba on 04-11-16.
 */
define([
        "dojo/_base/declare",
        "dijit/_WidgetBase",
        "dijit/_TemplatedMixin",
        "dijit/_WidgetsInTemplateMixin",
        "dojo/store/Memory",
        "dojo/has",
        "ct/util/css",
        "ct/array",
        "ct/_when",
        "dojox/validate/web",
        "dijit/TooltipDialog",
        "dijit/popup",
        "dijit/Tooltip",
        "dojo/text!./templates/ProblemReportingWidget.html",
        "ct/ui/controls/MessagePane",
        "dijit/form/Button",
        "dijit/form/ValidationTextBox",
        "dijit/form/TextBox",
        "dijit/form/FilteringSelect",
        "dijit/form/Textarea",
        "./ValidationTextArea"
    ],
    function (declare, _WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, Memory, d_has, ct_css, ct_array, ct_when, d_webValidation, TooltipDialog, d_popup, Tooltip, templateString) {
        return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin],
            {

                templateString: templateString,
                baseClass: "ProblemReporting",

                constructor: function (args) {
                    this.reportTypeStore = new Memory({
                        data: args.reportTypes
                    });
                    this.dataTypeStore = new Memory({
                        data: args.dataTypes
                    });
                },

                postCreate: function () {
                    this.inherited(arguments);
                    this.messagePane.showMessage({
                        type: "info",
                        value: this.i18n.ui.infoText
                    });
                    if (d_has("ie") <= 10) {
                        ct_css.toggleClass(this.copyButton, "dijitHidden", true);
                    }
                    var copyBtn = this.copyButton,
                        tooltip = this.i18n.ui.copybtn.tooltip;
                    copyBtn.on("mouseOver", function () {
                        Tooltip.show(tooltip, copyBtn.domNode);
                    });
                    copyBtn.on("mouseOut", function () {
                        Tooltip.hide(copyBtn.domNode);
                    });
                },

                _copy: function () {
                    this.urlTextBox.textbox.select();
                    document.execCommand('copy');
                    this.urlTextBox.textbox.setSelectionRange(0, 0);
                    var copyDialog = new TooltipDialog({
                        content: this.i18n.ui.copySuccessfull
                    });

                    d_popup.open({
                        popup: copyDialog,
                        around: this.copyButton.domNode
                    });
                    setTimeout(function () {
                        d_popup.close(copyDialog);
                    }, this.copyTooltipTimeout || 5000);
                },

                _onShow: function () {
                    ct_when(this.stateStorer.storeState(), function (res) {
                        var shareurl = window.location.href.split("?")[0];
                        shareurl += "?id=" + res.id;
                        shareurl = encodeURIComponent(shareurl);
                        shareurl = this.shareUrlProvider.get("shareUrl") + shareurl;
                        this.urlTextBox.set("value", shareurl);
                    }, function (error) {
                        this.urlTextBox.set("value", "Saving of map currently not possible");
                    }, this);
                    ct_css.toggleClass(this.dataLayerRow, "dijitHidden", true);
                    this._resetFormValues();
                    this._validate();
                },
                _resetFormValues: function () {
                    this.reportTypeSelect.reset();
                    this.dataLayerSelect.reset();
                    this.dataTypeSelect.reset();
                },

                _findWindowAndStoreSize: function () {
                    if (this._window) {
                        return;
                    }
                    var windows = this.windowManager.getWindows();
                    var window = ct_array.arraySearchFirst(windows, {"windowName": "problem_reporting"});
                    if (window) {
                        this._window = window;
                        if (!this._initialMB) {
                            try {
                                this._initialMB = window.get("window").params.marginBox;
                                return;
                            } catch (e) {
                                console.error(e);
                            }
                            this._initialMB = {w: 400, h: 520};
                        }
                    }
                },

                _onDataTypeChange: function (evt) {
                    this._findWindowAndStoreSize();
                    evt = this._getSelectValue(this.dataTypeSelect, "label");
                    if (evt === this.valueForDataLayerSelection) {
                        ct_css.toggleClass(this.dataLayerRow, "dijitHidden", false);
                        ct_css.toggleClass(this._window.window.domNode, "extended", true);
                        this.dataLayerStore = new Memory({
                            data: this.mapModel.getEnabledServiceNodes()
                        });
                        this.dataLayerSelect.set("store", this.dataLayerStore);
                        this.dataLayerSelect.reset();
                        this._window.resize({w: this._initialMB.w, h: this._initialMB.h + 30})
                    } else {
                        ct_css.toggleClass(this.dataLayerRow, "dijitHidden", true);
                        ct_css.toggleClass(this._window.window.domNode, "extended", false);
                        this.dataLayerSelect.reset();
                        this._window.resize(this._initialMB);
                    }
                    this._validate();
                },

                _isEmailAddress: function (mail, opts) {
                    return d_webValidation.isEmailAddress(mail, opts);
                },

                _validate: function () {
                    var data = this._getData(),
                        valid = false;
                    try {
                        var user = data.user;
                        valid = user.name.length > 0 && user.surname.length > 0 && user.email.length > 0
                            && data.description.length > 0 && data.dataType.length > 0 && data.reportType.length > 0;
                        if (data.dataType === this.valueForDataLayerSelection) {
                            valid = valid && data.datalayer.length > 0;
                        }
                        if (!d_webValidation.isEmailAddress(user.email)) {
                            valid = false;
                        }
                        valid = this.nameTextBox.isValid() && this.surnameTexBox.isValid() && this.phoneTextBox.isValid() && this.organisationTextBox.isValid();
                    } catch (e) {

                    }
                    if (valid) {
                        this.sendButton.set("disabled", false);
                    } else {
                        this.sendButton.set("disabled", true);
                    }
                },

                _getSelectValue: function (select, attr) {
                    var value = select.store.get(select.get("value"));
                    if (value) {
                        return value[attr];
                    }
                    return "";
                },

                _getData: function () {
                    var layer = this.dataLayerSelect.store.get(this.dataLayerSelect.get("value"));
                    var layerValue = "-";
                    if (layer) {
                        layerValue = layer.title + " (ID: " + layer.id + ")";
                    }
                    return {
                        user: {
                            name: this.nameTextBox.get("value"),
                            surname: this.surnameTextBox.get("value"),
                            email: this.emailTextBox.get("value"),
                            phone: this.phoneTextBox.get("value"),
                            organisation: this.organisationTextBox.get("value")
                        },
                        reportType: this._getSelectValue(this.reportTypeSelect, "label"),
                        dataType: this._getSelectValue(this.dataTypeSelect, "label"),
                        datalayer: layerValue,
                        description: this.descriptionTextArea.get("value"),
                        url: this.urlTextBox.get("value")
                    }
                },

                _send: function () {
                    this.eventService.postEvent("agiv/problemreport/SEND", {
                        report: this._getData()
                    });
                },
                _cancel: function () {
                    this.eventService.postEvent("ct/tool/set/DEACTIVATE", {toolId: "problem_reporting_toggletool"});
                },

                startup: function () {
                    this.inherited(arguments);
                }
            }
        );
    }
);