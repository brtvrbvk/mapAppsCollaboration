/**
 * COPYRIGHT 2012-2013 con terra GmbH Germany
 *
 * User: fba
 * Date: 17.10.13
 * Time: 09:45
 */
define([
        "dojo/_base/declare",
        "dojo/_base/array",
        "dojo/_base/lang",
        "dojo/string",
        "dojo/store/Memory",
        "ct/array",
        "ct/util/css",
        "ct/_when",
        "ct/_Connect",
        "dijit/_Widget",
        "dijit/_TemplatedMixin",
        "dijit/_WidgetsInTemplateMixin",
        "dojo/text!./templates/GridWidget.html",
        "dijit/layout/ContentPane",
        "dijit/layout/BorderContainer"
    ],
    function (
        declare,
        d_array,
        d_lang,
        d_string,
        Memory,
        ct_array,
        ct_css,
        ct_when,
        Connect,
        _Widget,
        _TemplatedMixin,
        _WidgetsInTemplateMixin,
        templateStringContent
        ) {
        /*
         * COPYRIGHT 2012 con terra GmbH Germany
         */
        /**
         * @fileOverview This file provides a feature info widget.
         */
        var ContactWidget = declare([
                _Widget,
                _TemplatedMixin,
                _WidgetsInTemplateMixin
            ],
            {
                baseClass: "ctGipodResultIdentificatie",
                templateString: templateStringContent,
                title: "ident",

                attributeMap: d_lang.delegate(_Widget.prototype.attributeMap, {
                        label: [
                            {
                                node: "labelNode",
                                type: "innerHTML"
                            }
                        ]
                    }
                ),

                constructor: function () {
                },

                postCreate: function () {

                    this.inherited(arguments);

                    this.title = this.i18n.title;

                    var contact = this.content.contact;
                    if (contact) {
                        this.set("label", d_string.substitute(this.i18n.info,
                            {
                                type: this.i18n[this.content.gipodType]
                            }));

                        var info = this.getContactInfo(contact);
                        if (info.name) {
                            this.nameNode.innerHTML = info.name;
                        }
                        if (info.address) {
                            this.addressNode.innerHTML = "<div class='icon-marker featureinfoIcon'></div><div>" + info.address + "</div>";
                        }
                        if (info.phone) {
                            this.phoneNode.innerHTML = "<div class='icon-phone featureinfoIcon'></div><div>" + info.phone + "</div>";
                        }
                        if (info.email) {
                            this.emailNode.innerHTML = "<div class='icon-mail featureinfoIcon'></div><div>" + info.email + "</div>";
                        }

                        this.eventService.postEvent("agiv/contact/UPDATE_PRINT_INFO", {hasContact: true});

                    } else {
                        this.set("label", this.i18n.noData);
                    }
                },

                getContactInfo: function (contact) {
                    var info = {};
                    if (contact.firstName || contact.lastName) {
                        info["name"] = d_string.substitute(this.i18n.name, {
                            firstName: contact.firstName || "",
                            lastName: contact.lastName || ""
                        });
                    }

                    if (contact.street) {
                        info["address"] = d_string.substitute(this.i18n.address, {
                            street: contact.street + " " + contact.number,
                            postalCode: contact.postalCode,
                            city: contact.city,
                            country: contact.country
                        });
                    }

                    if (contact.phoneNumber1 || contact.phoneNumber2) {
                        info["phone"] = d_string.substitute(this.i18n.phone, {
                            phone1: contact.phoneNumber1 || "",
                            phone2: contact.phoneNumber2 || ""
                        });
                    }

                    if (contact.email) {
                        info["email"] = contact.email;
                    }
                    return info;
                },
                destroyRecursive: function () {
                    if (this._registration) {
                        this._registration.unregister();
                        this._registration = null;
                    }
                    this.inherited(arguments);
                },

                destroy: function () {
                    if (this._registration) {
                        this._registration.unregister();
                        this._registration = null;
                    }
                    this.inherited(arguments);
                },

                resize: function (dim) {
                    if (this.mainnode) {
                        this.mainnode.resize(dim);
                    }
                }
            });
        ContactWidget.createWidget = function (
            params,
            contentFactory
            ) {
            var opts = contentFactory.get("ContactWidget");
            var widget = new ContactWidget({
                content: params.content,
                context: params.context,
                i18n: opts.i18n,
                metadata: opts.metadata,
                contentviewer: contentFactory.get("contentviewer"),
                eventService: contentFactory.get("eventService")
            });

            var bundleCtx = contentFactory._componentContext.getBundleContext();
            widget._registration = bundleCtx.registerService(["gipod.ContactWidget"], widget);

            return widget;
        };
        return ContactWidget;
    });