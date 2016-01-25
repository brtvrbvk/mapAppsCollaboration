/**
 * COPYRIGHT 2012-2013 con terra GmbH Germany
 *
 * User: fba
 * Date: 01.10.13
 * Time: 12:04
 */
define([
        "dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/_base/array",
        "dojo/dom-class",
        "dojo/dom-construct",
        "dojo/DeferredList",
        "dojo/Deferred",
        "dojo/query",
        "dojo/dom-class",
        "dojo/date/locale",
        "dijit/layout/ContentPane",
        "base/util/CommonID",
        "ct/request",
        "ct/array",
        "ct/_when",
        "ct/Stateful",
        "ct/_Connect",
        "ct/util/css",
        "ct/mapping/geometry",
        "dataform/controls/DateTimeUtil",
        "ct/ui/controls/MessagePane",
        "./GipodParameterWidget",
        "base/analytics/AnalyticsConstants",
        "base/store/GeolocatorStore"
    ],
    function (declare, d_lang, d_array, d_class, d_dom, DeferredList, Deferred, query, d_domClass, d_date, ContentPane, commonID, ct_request, ct_array, ct_when, Stateful, Connect, ct_css, ct_geom, DateTimeUtil, MessagePane, GipodParameterWidget, AnalyticsConstants, GeolocatorStore) {
        return declare([
                Stateful,
                Connect
            ],
            {

                queryOptions: {

                },
                _dateFormat: "yyyy-MM-dd",

                _owners: [],
                _provinces: [],
                _eventtypes: [],

                dataform: {
                    "dataform-version": "1.0.0",
                    "size": {
                        "h": 800,
                        "w": 310
                    },
                    "type": "tablepanel",
                    "showLabels": false,
                    "cols": 1,
                    "children": [
                        {
                            "size": {
                                "h": 30,
                                "w": 300
                            },
                            "type": "tablepanel",
                            "showLabels": false,
                            "cols": 2,
                            "children": [
                                {
                                    "type": "label",
                                    "value": "Wanneer",
                                    "cssClass": "ctRowTitle"
                                },
                                {
                                    "type": "button",
                                    "title": "Terug naar beginwaarden",
                                    //BartVerbeeck 29851
                                    "tooltip": "Terug naar beginwaarden",
                                    "class": "gipodResetButton",
                                    "iconClass": "icon-swap",
                                    "topic": "button/reset/CLICK",
                                    "buttonID": "reset"
                                }
                            ]
                        },

                        {
                            "size": {
                                "h": 80,
                                "w": 300
                            },
                            "type": "tablepanel",
                            "showLabels": false,
                            "cols": 3,
                            "children": [
                                {
                                    "type": "radiobutton",
                                    "groupId": "period",
                                    "field": "period.today"
                                },
                                {
                                    "type": "label",
                                    "value": "Vandaag",
                                    "colspan": 2
                                },
                                {
                                    "type": "radiobutton",
                                    "groupId": "period",
                                    "field": "period.tomorrow"
                                },
                                {
                                    "type": "label",
                                    "value": "Morgen",
                                    "colspan": 2
                                },
                                {
                                    "type": "radiobutton",
                                    "groupId": "period",
                                    "field": "period.nextmonth"
                                },
                                {
                                    "type": "label",
                                    "value": "Vandaag + 1 maand verder",
                                    "colspan": 2
                                },
                                {
                                    "type": "radiobutton",
                                    "groupId": "period",
                                    "field": "period.specifieddate"
                                },
                                {
                                    "type": "label",
                                    "value": "Specifieke periode",
                                    "colspan": 2
                                }
                            ]
                        },
                        {
                            "size": {
                                "h": 60,
                                "w": 300
                            },
                            "type": "tablepanel",
                            "showLabels": false,
                            "id": "ctGipodDatePickerTable",
                            "cssClass": "ctGipodDatePickerTable dijitDisplayNone",
                            "cols": 3,
                            "children": [

                                {
                                    "type": "label",
                                    "value": " ",
                                    "cssClass": "ctEmptyLabel"
                                },
                                {
                                    "type": "label",
                                    "value": "van",
                                    "cssClass": "ctDatePicker"
                                },
                                {
                                    "type": "datetextbox",
                                    "field": "startdate",
                                    "cssClass": "ctDatePicker",
                                    "size": {
                                        "w": 185
                                    }
                                },
                                {
                                    "type": "label",
                                    "value": " ",
                                    "cssClass": "ctEmptyLabel"
                                },
                                {
                                    "type": "label",
                                    "value": "tot",
                                    "cssClass": "ctDatePicker"
                                },
                                {
                                    "type": "datetextbox",
                                    "field": "enddate",
                                    "cssClass": "ctDatePicker",
                                    "size": {
                                        "w": 185
                                    }
                                }
                            ]
                        },
                        {
                            "size": {
                                "h": 30,
                                "w": 300
                            },
                            "type": "tablepanel",
                            "showLabels": false,
                            "cols": 1,
                            "cssClass": "ctSpacer",
                            "children": [
                                {
                                    "type": "label",
                                    "value": "Soort hinder",
                                    "cssClass": "ctRowTitle"
                                }
                            ]
                        },
                        {
                            "size": {
                                "h": 50,
                                "w": 300
                            },
                            "type": "tablepanel",
                            "showLabels": false,
                            "cols": 2,
                            "children": [
                                {
                                    "type": "checkbox",
                                    "title": "Werken",
                                    "field": "workassignment"
                                },
                                {
                                    "type": "label",
                                    "value": "Werken"
                                },
                                {
                                    "type": "checkbox",
                                    "title": "Andere hinder op de weg",
                                    "field": "manifestation",
                                    "cssClass": "manifestationCheckBox"
                                },
                                {
                                    "type": "label",
                                    "value": "Andere hinder op de weg"
                                }

                            ]
                        }

                    ]
                },

                modified: function () {
                    debugger;
                },

                constructor: function () {

                },

                activate: function (componentCtx) {

                    var bCtx = componentCtx.getBundleContext();
                    bCtx.registerService(["gipod.GipodParameterControllerComponent"], this);

                    this.connect("trackEvents", this.gipodFilterTool, "onActivate", this,
                        "_trackOnFilterSelected");
                    this.geolocatorStoreParameters.geolocatorUrlProvider = this.geolocatorUrlProvider;
                    this._geolocatorStore = new GeolocatorStore(this.geolocatorStoreParameters);

                    this.i18n = this._i18n.get();
                    this._cp = new ContentPane();

                    if (this._widget) {
                        this._cp.set("content", this._widget);
                    } else {
                        var mp = new MessagePane();
                        mp.addMessage({
                            type: "loading",
                            value: this.i18n.ui.loadingFilters
                        }, true);

                        this._cp.set("content", mp);
                    }

                    this._cp.setQueryOptions = d_lang.hitch(this, this._updateQueryOptions);
                    this._cp.updateLayers = d_lang.hitch(this, this._updateNodes);
                    this._cp.gipodBaseUrl = this.gipodBaseUrl;

                    this._referenceUrl = this.gipodBaseUrl + "/ReferenceData";

                    var today = new Date();
                    today.setHours(0);
                    today.setMinutes(0);
                    today.setSeconds(0);
                    today.setMilliseconds(0);
                    this._today = today.getTime();

                    var ed = new Date();
                    ed.setTime(this._today);

                    if (this.queryOptions) {
                        if (this.queryOptions.period.today) {
                            this.queryOptions = d_lang.mixin(this.queryOptions, {
                                startdate: today,
                                enddate: ed
                            });
                        } else {
                            this.queryOptions = d_lang.mixin({
                                startdate: today,
                                enddate: ed
                            }, this.queryOptions);
                        }
                    }

                    this._defaultQueryOptions = d_lang.clone(this.queryOptions);

                    var list = [];

                    var typeD = ct_request.requestJSON({
                        url: this._referenceUrl + "/eventtype"
                    });
                    list.push(typeD);
                    ct_when(typeD, function (resp) {
                        if (resp && resp.length) {
                            this._eventtypes = resp;
                            var t = this._eventType = {};
                            d_array.forEach(resp, function (e) {
                                t[e] = true;
                            });
                            var tmp = d_lang.clone(this._eventType);
                            if (!this.queryOptions.eventType) {
                                this.queryOptions.eventType = tmp;
                            }
                            this._defaultQueryOptions.eventType = d_lang.clone(tmp);
                        }
                    }, function (err) {
                        console.error(err);
                    }, this);

                    var ownerD = ct_request.requestJSON({
                        url: this._referenceUrl + "/owner"
                    });
                    list.push(ownerD);
                    ct_when(ownerD, function (resp) {
                        if (resp && resp.length) {
                            resp.splice(0, 0, "");
                            this._owners = resp;
                        }
                    }, function (err) {
                        console.error(err);
                    }, this);

                    var provinceD = ct_request.requestJSON({
                        url: this._referenceUrl + "/province"
                    });
                    list.push(provinceD);
                    ct_when(provinceD, function (resp) {
                        if (resp && resp.length) {
                            resp.splice(0, 0, "");
                            this._provinces = resp;
                        }
                    }, function (err) {
                        console.error(err);
                    }, this);

                    var cityD = ct_request.requestJSON({
                        url: this._referenceUrl + "/city"
                    });
                    list.push(cityD);
                    ct_when(cityD, function (resp) {
                        if (resp && resp.length) {
                            resp.splice(0, 0, "");
                            this._cities = resp;
                        }
                    }, function (err) {
                        console.error(err);
                    }, this);

                    var dl = new DeferredList(list);

                    ct_when(dl, function () {
                        this._init();
                    }, function (err) {
                        console.error(err);
                    }, this);
                },

                _updateQueryOptions: function (opts) {
                    opts.enddate = opts.enddate ? new Date(opts.enddate) : null;
                    opts.startdate = opts.startdate ? new Date(opts.startdate) : null;
                    this.queryOptions = d_lang.mixin(this.queryOptions, opts);
                },

                _init: function () {

                    var df = this.dataform;

                    var cols = 3;
                    var table = {
                        "size": {
                            "h": 250,
                            "w": 300
                        },
                        "type": "tablepanel",
                        "showLabels": false,
                        "cols": cols,
                        "children": [
                        ]
                    };

                    d_array.forEach(this._eventtypes, function (e) {
//Bug45588 HIK - Iconen ook bij Verfijnd zoeken TODO eventueel url niet hard coderen                        
                        //table.children.push({
                        //    "type": "label",
                        //    "value": " ",
                        //    "cssClass": "ctEmptyLabel"
                        //});
                        table.children.push({
                            "type": "label",
                            "value": "<img src=\"http://gipod.api.agiv.be/ws/v1/icon/manifestation?size=16&eventtype="+e+"\" >"

                        });
                        table.children.push({
                            "type": "checkbox",
                            "title": e,
                            "field": "eventType." + e
                        });
                        table.children.push({
                            "type": "label",
                            "value": e
                        });
                    });

                    df.children.push(table);

                    df.children.push({
                            "size": {
                                "h": 30,
                                "w": 300
                            },
                            "type": "tablepanel",
                            "showLabels": false,
                            "cols": 1,
                            "cssClass": "ctSpacer",
                            "children": [
                                {
                                    "type": "label",
                                    "value": "Enkel tonen voor",
                                    "cssClass": "ctRowTitle"
                                }
                            ]
                        }
                    );

                    var textBoxTable = {
                        "size": {
                            "h": 100,
                            "w": 300
                        },
                        "type": "tablepanel",
                        "showLabels": false,
                        "cols": 2,
                        "children": [
                        ]
                    };
                    df.children.push(textBoxTable);

                    var ownerCB = {
                        "type": "combobox",
                        "onlyPreDefinedValues": true,
                        "field": "owner",
                        "values": this._owners,
                        "searchAttribute": "name",
                        "labelAttribute": "name",
                        "autoComplete": false,
                        "hasDownArrow": false,
                        "pageSize": this.ownerPageSize || 10,
                        "size": {
                            "w": 185
                        }
                    };
                    textBoxTable.children.push({
                        "type": "label",
                        "value": "Beheerder"
                    });
                    textBoxTable.children.push(ownerCB);

                    var provinceCB = {
                        "type": "combobox",
                        "onlyPreDefinedValues": true,
                        "field": "province",
                        "values": this._provinces,
                        "searchAttribute": "name",
                        "labelAttribute": "name",
                        "autoComplete": false,
                        "hasDownArrow": false,
                        "pageSize": this.provincePageSize || 10,
                        "size": {
                            "w": 185
                        }
                    };
                    textBoxTable.children.push({
                        "type": "label",
                        "value": "Provincie"
                    });
                    textBoxTable.children.push(provinceCB);

                    var cityCB = {
                        "type": "combobox",
                        "onlyPreDefinedValues": true,
                        "field": "city",
                        "values": this._cities,
                        "searchAttribute": "name",
                        "labelAttribute": "name",
                        "autoComplete": false,
                        "hasDownArrow": false,
                        "pageSize": this.citiesPageSize || 10,
                        "size": {
                            "w": 185
                        }
                    };
                    textBoxTable.children.push({
                        "type": "label",
                        "value": "Gemeente"
                    });
                    textBoxTable.children.push(cityCB);

                    this._initWidget();

                },

                _initWidget: function () {

                    var df = this.dataform;
                    var dfwidget = this._dfwidget = this._dataformService.createDataForm(df);

//                    if (this._cp.get("opts")) {
//                        this._updateQueryOptions(this._cp.get("opts"));
//                    }

                    if (this.queryOptions.eventType) {
                        var count = 0;
                        for (var k in this.queryOptions.eventType) {
                            count++;
                        }
                        if (count === this._eventtypes.length) {
                            d_class.remove(this._cp.domNode, "notAllEventTypesChecked");
                        } else {
                            d_class.add(this._cp.domNode, "notAllEventTypesChecked");
                        }
                    }

                    var binding = this._binding = this._dataformService.createBinding("object", {
                        data: this.queryOptions
                    });

                    dfwidget.set("dataBinding", binding);
                    binding.watch("*", d_lang.hitch(this, this._update));
                    binding.watch("manifestation", d_lang.hitch(this, function () {

                        if (this._stopUpdate) {
                            return;
                        }

                        d_class.remove(this._cp.domNode, "notAllEventTypesChecked");
                        this._stopUpdate = true;
                        var k;
                        if (this.queryOptions.manifestation) {

                            var t = d_lang.clone(this._eventType);
                            for (k in t) {
                                this._binding.set("eventType." + k, t[k]);
                            }

                        } else {

                            var t = d_lang.clone(this._eventType);
                            for (k in t) {
                                this._binding.set("eventType." + k, false);
                            }

                        }

                        this._widget.hideMessage();
                        this._updateNodes();

                        this._stopUpdate = false;
                    }));

                    binding.watch("city", d_lang.hitch(this, function () {
                        var qo = this.queryOptions;
                        if (qo.city && ct_array.arraySearchFirst(this._cities, qo.city, true)) {
                            this._zoomToCity(qo.city);
                        }
                    }));

                    this.connect("widget", dfwidget, "onControlEvent", this, "_handleDataFormEvents");

                    var widget = this._widget = new GipodParameterWidget({
                        dataformwidget: dfwidget
                    });

                    this._cp.set("content", widget);

                    if (binding.get("period.specifieddate")) {
                        this._setDatePickerVisibility(true);
                    }

                    this._updateNodes();

                },

                _trackOnFilterSelected: function (evt) {
                    if (this.eventService) {
                        this.eventService.postEvent(AnalyticsConstants.TOPICS.TRACK_EVENT, {
                            eventType: AnalyticsConstants.EVENT_TYPES.FILTER,
                            eventCategory: AnalyticsConstants.CATEGORIES.FILTER,
                            eventValue: "filter active"
                        });
                    }
                },

                _update: function (fieldname, oldval, newval) {

                    if (this._stopUpdate) {
                        return;
                    }

                    if (fieldname === "manifestation") {
                        return;
                    }

                    if (fieldname.indexOf("period.") > -1) {
                        if (newval) {
                            if (fieldname === "period.specifieddate") {
                                this._binding.set("period.specifieddate", true);
                                this._setDatePickerVisibility(true);
                            } else {
                                this._setDatePickerVisibility(false);
                                this._filterByEndDateValue(fieldname);
                            }
                        } else {
                            return;
                        }
                    }

                    this._stopUpdate = true;

                    if (fieldname.indexOf("eventType.") > -1) {

                        var on = false;
                        var eventType = this._binding.get("eventType");
                        var count = 0;
                        if (newval) {
                            for (k in eventType) {
                                if (eventType[k]) {
                                    count++;
                                    on = true;
                                }
                            }
                        } else {
                            for (k in eventType) {
                                if (!eventType[k]) {
                                    count++;
                                } else {
                                    on = true;
                                }
                            }
                        }
                        if (count === this._eventtypes.length) {
                            d_class.remove(this._cp.domNode, "notAllEventTypesChecked");
                        } else {
                            d_class.add(this._cp.domNode, "notAllEventTypesChecked");
                        }

                        this._binding.set("manifestation", on);

                    }

                    this._modifyNewValues(fieldname, oldval, newval);

                    if (this._isValidState(fieldname, oldval, newval)) {

                        this._widget.hideMessage();
                        this._updateNodes();

                        if (this._periodDateSelection && (fieldname === "enddate" || fieldname === "startdate")) {
                            this._trackEvent(AnalyticsConstants.CATEGORIES.FILTER_PERIOD,
                                AnalyticsConstants.EVENT_TYPES.FILTER_PERIOD);
                        }

                    } else {
                        this._widget.showMessage("warning",
                            this["_validate_" + fieldname](oldval, newval));
                    }

                    this._stopUpdate = false;

                },

                _trackEvent: function (cat, type, val) {

                    if (this.eventService) {
                        this.eventService.postEvent(AnalyticsConstants.TOPICS.TRACK_EVENT, {
                            eventType: type,
                            eventCategory: cat,
                            eventValue: val || ""
                        });
                    }

                },

                _filterByEndDateValue: function (fieldNameValue) {
                    var increaseValue = 0,
                        sd = new Date(),
                        ed = new Date();
                    if (fieldNameValue === "period.tomorrow") {

                        increaseValue = 1000 * 60 * 60 * 24;
                        ed.setTime(this._today + increaseValue);
                        sd.setTime(this._today + increaseValue);
                        this._binding.set("startdate", sd);
                        this._trackEvent(AnalyticsConstants.CATEGORIES.FILTER_PERIOD,
                            AnalyticsConstants.EVENT_TYPES.FILTER_TOMORROW);

                    } else if (fieldNameValue === "period.nextmonth") {

                        increaseValue = (1000 * 60 * 60 * 24) * 30;
                        this._binding.set("startdate", sd);
                        ed.setTime(this._today + increaseValue);
                        this._trackEvent(AnalyticsConstants.CATEGORIES.FILTER_PERIOD,
                            AnalyticsConstants.EVENT_TYPES.FILTER_TODAY_MONTH);

                    } else if (fieldNameValue === "period.today") {

                        this._binding.set("startdate", sd);
                        this._trackEvent(AnalyticsConstants.CATEGORIES.FILTER_PERIOD,
                            AnalyticsConstants.EVENT_TYPES.FILTER_TODAY);

                    }

                    this._binding.set(fieldNameValue, true);

                    this._binding.set("enddate", ed);
                },

                _setDatePickerVisibility: function (visible) {
                    var datepicker = this._getControlById(this._dfwidget.bodyControl, "ctGipodDatePickerTable")
                    ct_css.switchHidden(datepicker.widget.domNode, !visible);
                    this._periodDateSelection = visible;
                },

                _getControlById: function (parent, id) {
                    var children = parent.children,
                        foundElem;
                    d_array.some(children, function (child) {
                        if (child.children && child.children.length > 0) {
                            foundElem = this._getControlById(child, id) || foundElem;
                        }
                        if (child.id === id) {
                            foundElem = child;
                            return true;
                        }
                    }, this);
                    return foundElem;
                },

                _modifyNewValues: function (fieldname, oldval, newval) {

                    switch (fieldname) {
                        case "enddate":
                            this.queryOptions[fieldname] = newval || null;
                            break;
                    }

                },

                _isValidState: function (fieldname, oldval, newval) {

                    if (this["_validate_" + fieldname]) {
                        return !this["_validate_" + fieldname](oldval, newval);
                    }

                    return true;

                },

                _validate_startdate: function (oldval, newval) {

                    if (!newval) {
                        return this.i18n.ui.validation.defineStart;
                    }

                    var newStartDate = DateTimeUtil.toDate(newval).getTime();

                    if (newStartDate < this._today) {
                        return this.i18n.ui.validation.startTooSmall;
                    }

                    if (this.queryOptions.enddate) {

                        var endDate = DateTimeUtil.toDate(this.queryOptions.enddate).getTime();
                        if (newStartDate > endDate) {
                            return this.i18n.ui.validation.endBeforeStart;
                        }

                    }
                    return null;

                },

                _validate_enddate: function (oldval, newval) {

                    if (!newval) {
                        return this.i18n.ui.validation.defineEnd;
                    }

                    if (this.queryOptions.startdate) {

                        var newEndDate = DateTimeUtil.toDate(newval).getTime();
                        var startDate = DateTimeUtil.toDate(this.queryOptions.startdate).getTime();

                        if (newEndDate < startDate) {
                            return this.i18n.ui.validation.endBeforeStart;
                        }

                    }
                    return null;

                },

                update: function () {

                    this._updateNodes();
                    this._reinitWidget();

                },

                _reinitWidget: function () {
                    d_class.remove(this._cp.domNode, "notAllEventTypesChecked");
                    this.disconnect("widget");
                    this._widget.destroyRecursive();
                    this._initWidget();
                    this._updateNodes();
                },

                _resetValues: function () {

                    this._stopUpdate = true;
                    this.queryOptions = d_lang.clone(this._defaultQueryOptions);

                    for (k in this._eventType) {
                        this._binding.set("eventType." + k, true);
                    }

                    this._widget.hideMessage();
                    this._updateNodes();
                    this.toExtentHandler.toExtent();

                    this._stopUpdate = false;

                },

                _handleDataFormEvents: function (evt) {

                    switch (evt.topic) {
                        case "button/reset/CLICK":
                            this._resetValues();
                            this._reinitWidget();
                            break;
                    }

                },

                createInstance: function () {

                    return this._cp;

                },

                _formatDates: function (qo) {

                    var opts = d_lang.clone(qo);
                    if (opts["enddate"] && !opts["enddate"].length) {
                        opts["enddate"] = d_date.format(opts["enddate"], {
                            selector: "date",
                            datePattern: this._dateFormat
                        });
                    }
                    if (opts["startdate"] && !opts["startdate"].length) {
                        opts["startdate"] = d_date.format(opts["startdate"], {
                            selector: "date",
                            datePattern: this._dateFormat
                        });
                    }

                    return opts;

                },

                _prepareForLayerUpdate: function (qo) {

                    for (var k in qo) {

                        switch (k) {
                            case "period":
                                var periods = qo[k];
                                for (var period in periods) {
                                    switch (period) {
                                        case "today":
                                            if (periods[period]) {
                                                var ed = new Date();
                                                ed.setTime(this._today);
                                                var sd = new Date();
                                                sd.setTime(this._today);
                                                qo.startdate = sd;
                                                qo.enddate = ed;
                                            }
                                            break;
                                        case "nextmonth":
                                            if (periods[period]) {
                                                var ed = new Date();
                                                ed.setTime(this._today + (1000 * 60 * 60 * 24) * 30);
                                                var sd = new Date();
                                                sd.setTime(this._today);
                                                qo.startdate = sd;
                                                qo.enddate = ed;
                                            }
                                            break;
                                        case "specifieddate":
                                            break;
                                        case "tomorrow":
                                            if (periods[period]) {
                                                var ed = new Date();
                                                ed.setTime(this._today + 1000 * 60 * 60 * 24);
                                                var sd = new Date();
                                                sd.setTime(this._today + 1000 * 60 * 60 * 24);
                                                qo.startdate = sd;
                                                qo.enddate = ed;
                                            }
                                            break;
                                    }

                                }
                                delete qo[k];
                                break;
                            case "manifestation":
                                delete qo[k];
                                break;
                            case "workassignment":
                                delete qo[k];
                                break;
                        }

                    }

                    qo = this._formatDates(qo);

                    return qo;

                },

                _updateNodes: function () {

                    var qo = d_lang.clone(this.queryOptions);

                    this._cp.set("opts", this._formatDates(qo));

                    qo = this._prepareForLayerUpdate(qo);

                    d_array.forEach(this.nodes, function (n) {

                        var node = commonID.findIdInModel(this.mapModel, n.id);
                        if (node && node.layerObject) {
                            node.layerObject.setQueryOptions(qo, true);

                            var refresh = node.get("enabled");

                            if (this.queryOptions[n.type] !== undefined) {
                                node.set("enabled", this.queryOptions[n.type]);
                                refresh = node.get("enabled") && refresh ? true : false;
                            }

                            //we only refresh if the node was enabled before
                            //otherwise this is done automatically
                            if (refresh) {
                                console.debug("refresh node ", node);
                                node.layerObject.refresh();
                                if (this.provinces[qo.province]) {
                                    this.mapState.setExtent(this.provinces[qo.province]);
                                }
                            }
                        }

                    }, this);
                    console.debug("fire node state changed");
                    this.mapModel.fireModelNodeStateChanged();

                },

                _zoomToCity: function (city) {
                    ct_when(this._geolocatorStore.query(this.toSuggestQuery(city), {count: 1}),
                        function (resp) {
                            if (resp && resp.length > 0) {
                                var item = resp[0];
                                if (item.extent) {
                                    var extent = this._ct.transform(item.extent,
                                        this.mapState.getSpatialReference().wkid);
                                    this.mapState.setExtent(extent);
                                }
                            }
                        }, function (err) {
                            console.error(err);
                        }, this);
                },

                toSuggestQuery: function (val) {
                    return {
                        $suggest: val.toLowerCase()
                    };
                }
            }
        );
    }
);