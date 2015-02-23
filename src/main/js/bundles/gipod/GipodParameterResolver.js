/**
 * COPYRIGHT 2012-2013 con terra GmbH Germany
 *
 */
define([
        "dojo/_base/declare",
        "dojo/json",
        "dojo/string",
        "dojo/date",
        "dojo/_base/array",
        "ct/request",
        "ct/_when",
        "base/store/gipod/GipodStore"
    ],
    function (
        declare,
        JSON,
        d_string,
        d_date,
        d_array,
        ct_request,
        ct_when,
        GipodStore
        ) {
        return declare([],
            {

                constructor: function () {
                },

                activate: function () {
                    this.i18n = this._i18n.get();
                },

                persist: function (opts) {
                    return this.encodeURLParameter(opts);
                },

                read: function (obj) {
                    return this.decodeURLParameter(obj);
                },

                encodeURLParameter: function (opts) {
                    var tmp = {};
                    if (this.gipodController) {
                        tmp.gipodOpts = JSON.stringify(this.gipodController.get("opts"));
                    }
                    return tmp;
                },

                modifyConfiguration: function (
                    targetInfo,
                    configProperties
                    ) {
                    var gipodOpts = this._gipodOpts;
                    if (gipodOpts) {
                        // now we change the initial extent
                        configProperties.queryOptions = gipodOpts;
                        // applied, clear value
                        this._gipodOpts = undefined;
                    }
                },

                decodeURLParameter: function (urlObject) {
                    var gipodOpts = urlObject && urlObject.gipodOpts && JSON.parse(urlObject.gipodOpts);
                    if (gipodOpts) {
                        this._gipodOpts = gipodOpts;
                        if (this.gipodController) {
                            this.gipodController.setQueryOptions(gipodOpts);
                        }
                    }
                    var gipodId = urlObject && urlObject.GIPODID && JSON.parse(urlObject.GIPODID);
                    if (gipodId) {
                        this._gipodId = gipodId;
                        if (this.gipodController) {
                            this._retrieveItemFromStore();
                        }
                    }
                },

                _retrieveItemFromStore: function() {
                    var gipodId = this._gipodId;
                    if (!gipodId) {
                        return;
                    }
                    var store = new GipodStore({
                        target: this.gipodController.gipodBaseUrl,
                        gipodType: "workassignment",
                        fixedQueryOptions: {
                            crs: this.mapState.getSpatialReference().wkid,
                            limit: 5000,
                            offset: 0
                        }
                    });
                    ct_when(store.query({}, {
                        rest: "/" + gipodId
                    }), function (resp) {
                        if (resp || resp.length > 0) {
                            this._parseItem(resp, store, "workassignment");
                        }

                    }, function (error) {
                        store = new GipodStore({
                            target: this.gipodController.gipodBaseUrl,
                            gipodType: "manifestation",
                            fixedQueryOptions: {
                                crs: this.mapState.getSpatialReference().wkid,
                                limit: 5000,
                                offset: 0
                            }
                        });
                        ct_when(store.query({}, {
                            rest: "/" + gipodId
                        }), function (resp) {
                            if (resp || resp.length > 0) {
                                this._parseItem(resp, store, "manifestation");
                            }
                        }, function (error) {
                            this.startupMessageBox.showNotificationWindow(this.i18n.ui.gipodIdNotFoundError + " (GIPODID " + gipodId + ").", this.i18n.ui.messageWindowTitle);
                        }, this);
                    }, this);
                },

                setGipodController: function (gpc) {
                    this.gipodController = gpc;
                    if (this._gipodId) {
                        this._retrieveItemFromStore();
                    }
                },

                _parseItem: function (
                    resp,
                    store,
                    gipodType
                    ) {

                    var item = resp[0].items[0];
                    var iconUrl;
                    if (item.eventType) {
                        iconUrl = this.gipodController.gipodBaseUrl + "/icon/" + gipodType + "?size=32&eventtype=" + d_string.trim(item.eventType);
                    } else {
                        iconUrl = this.gipodController.gipodBaseUrl + "/icon/" + gipodType + "?size=32&important=" + item.hindrance.important;
                    }
                    var content = {
                        graphic: {
                            attributes: resp[0],
                            symbol: {
                                url: iconUrl
                            }
                        },
                        geometry: item.geometry,
                        scale: this.scaleChangeHandler.geometryZoomScale
                    };
                    var context = {
                        store: store
                    };

                    this.eventService.postEvent("agiv/identify/NODE", {
                        node: {
                            content: content,
                            context: context,
                            service: {
                                serviceType: "GIPOD"
                            }
                        }
                    });

                    this.ruleContextState.set("printDialog", "hik");

                    if (item.periods) {
                        var today = new Date();
                        d_array.some(item.periods, function (period) {
                            if (d_date.compare(period.enddateObject, today, "date") > 0) {
                                this.gipodController.setQueryOptions({
                                    enddate: period.enddateObject,
                                    startdate: d_date.compare(period.startdateObject, today,
                                        "date") < 0 ? today : period.startdateObject,
                                    period: {
                                        specifieddate: true,
                                        nextmonth: false,
                                        tomorrow: false,
                                        today: false
                                    }
                                });
                                this._gipodControllerComponent.update();
                                return true;
                            }
                        }, this);
                    }

                },

                deactivate: function () {
                }
            }
        );
    }
);