/**
 * COPYRIGHT 2014 con terra GmbH Germany
 *
 * Created by fba on 25.02.14.
 */
define([
        "dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/_base/array",
        "dojo/_base/Deferred",
        "dojo/io-query",
        "ct/Stateful",
        "ct/_Connect",
        "ct/array",
        "ct/mapping/edit/Highlighter",
        "ct/_when",
        "ct/request",
        "ct/store/ComplexMemory",
        "ct/Hash",
        "dijit/layout/ContentPane"
    ],
    function (
        declare,
        d_lang,
        d_array,
        Deferred,
        ioQuery,
        Stateful,
        Connect,
        ct_array,
        Highlighter,
        ct_when,
        ct_request,
        ComplexMemory,
        Hash,
        ContentPane
        ) {
        return declare([
                Stateful,
                Connect
            ],
            {

                _currentSearchAttr: "title",

                constructor: function () {
                },

                activate: function () {
                    var d = ct_request({
                        url: this._properties.dataformJson,
                        timeout: this.timeout
                    });
                    // save file content to access it later
                    ct_when(d, function (result) {
                        var i18n = this.i18n = this._i18n.get().ui.dataform;
                        this.effectiveWidgetDefinition = this._substitute(result, i18n);
                        this.activateCapakeySearch();
                    }, this);

                    this._cp = new ContentPane({"class": "noPadding"});

                },

                createInstance: function () {

                    return this._cp;

                },

                deactivate: function () {
                    var dataformService = this.dataformService;
                    dataformService.removeStore(this.municipalityStore);
                    this.municipalityStore = null;
                    dataformService.removeStore(this.departmentStore);
                    this.departmentStore = null;
                    dataformService.removeStore(this.parcelStore);
                    this.parcelStore = null;
                    dataformService.removeStore(this.sectionStore);
                    this.sectionStore = null;
                    this._cp.set("content", null);
                    this.tool.set("active", false);
                    this.activateCapakeySearch();
                },

                activateCapakeySearch: function () {
                    var i18n = this.i18n;
                    var dataformService = this.dataformService;
                    var widget = this._widget = dataformService.createDataForm(this.effectiveWidgetDefinition);
                    var binding = this.binding = dataformService.createBinding("object", {data: {}});

                    binding.watch("*", d_lang.hitch(this, this._watch));
                    widget.set("dataBinding", binding);
                    widget.on("controlEvent", d_lang.hitch(this, function (evt) {
                        var itemId = this.binding.get("capakey");
                        var item = {"title": itemId, "id": 0, "value": itemId, "type": "SEARCH_RESULT_PARCEL", "preventDraw": true, "canSelectFirst": true};
                        this.handler._onSelectItem(item);
                        this.deactivate();
                    }));
                    ct_when(ct_request.requestJSON({
                        url: this.capakeyServiceUrl + '?type=json'
                    }), function (json) {
                        this._toggleWidgetDisabledStatus("municipality", false);
                        var municipalities = json.municipalities;
                        var data = [];
                        d_array.forEach(municipalities, function (municipality) {
                            data.push({
                                id: municipality.municipalityCode,
                                title: municipality.municipalityName
                            });
                        });

                        data = this._sortAscending(data, "title");

                        var storeData = {
                            "idProperty": "id",
                            "data": data
                        };
                        var store = this.municipalityStore = new ComplexMemory(storeData);
                        dataformService.addStore(store, {id: "municipalityStore"});
                        this._refreshBindings();
                    }, this);
                    this._cp.set("content", widget);
                },

                _sortAscending: function (
                    array,
                    attr
                    ) {

                    return ct_array.arraySort(array, function (
                        a,
                        b
                        ) {
                        if (a[attr] < b[attr]) return -1;
                        if (a[attr] > b[attr]) return 1;
                        return 0;
                    });

                },

                _refreshBindings: function () {
                    var children = this._widget.bodyControl.children;
                    d_array.forEach(children, function (child) {
                        child.refreshBinding ? child.refreshBinding() : null;
                    })
                },

                _getControlById: function (id) {
                    var children = this._widget.bodyControl.children;
                    return d_array.filter(children, function (child) {
                        return child.id === id;
                    })[0];
                },

                _watch: function (
                    field,
                    oldVal,
                    newVal
                    ) {
                    if (this._nisProcessing) {
                        return;
                    }
                    var i18n = this.i18n;
                    switch (field) {
                        case "municipality":
                            this._processMunicipal(newVal);
                            break;
                        case "department" :
                            if (newVal === i18n.setDepartment) {
                                return;
                            }
                            this._processDepartment(newVal);
                            break;
                        case "section" :
                            if (newVal === i18n.setSection) {
                                return;
                            }
                            this._processSection(newVal);
                            break;
                        case "parcel":
                            if (newVal === i18n.setParcel) {
                                return;
                            }
                            this._processParcel(newVal);
                            break;
                        case "nis":
                            this._processNis(newVal);
                    }
                },

                _processNis: function (newVal) {
                    this._nisProcessing = true;
                    this._isNis = newVal;
                    if (newVal) {
                        this._procNis("id", "title");
                    } else {
                        this._procNis("title", "id");
                    }
                    this._refreshBindings();
                    this._nisProcessing = false;
                },

                _procNis: function (
                    id,
                    searchAttr
                    ) {
                    this._currentSearchAttr = id;
                    var municipality = this._getControlById("municipality");
                    var department = this._getControlById("department");
                    var val = this.binding.get("municipality");
                    var query = {};
                    query[searchAttr] = val;

                    var data = this._sortAscending(this.municipalityStore.data, id);

                    var storeData = {
                        "idProperty": "id",
                        "data": data
                    };
                    this.municipalityStore = new ComplexMemory(storeData);
                    this._refreshBindings();
                    if (val) {
                        var item = this.municipalityStore.query(query);
                        if (item.length) {
                            this.binding.set("municipality", item[0][id]);
                        }
                    }
                    this._setNisToControl(municipality, id);
                    val = this.binding.get("department");
                    if (this.departmentStore) {

                        data = this._sortAscending(this.departmentStore.data, id);

                        storeData = {
                            "idProperty": "id",
                            "data": data
                        };

                        this.departmentStore = new ComplexMemory(storeData);

                    }
                    if (val) {
                        query[searchAttr] = val;

                        item = this.departmentStore ? this.departmentStore.query(query) : [];
                        if (item.length) {
                            this.binding.set("department", item[0][id]);
                        }
                    }
                    this._setNisToControl(department, id);
                },

                _setNisToControl: function (
                    control,
                    attr
                    ) {
                    control.set("labelAttribute", attr);
                    control.set("valueAttr", attr);
                    control.set("searchAttribute", attr);
                },

                _processParcel: function (newVal) {
                    if (!newVal) {
                        return;
                    }
                    var item = this.parcelStore.query({
                        "title": newVal
                    });
                    var parcelId = this.parcelId = item[0].id;
                    ct_when(ct_request.requestJSON({
                        url: this.capakeyServiceUrl + "/" + this.municipalityId + "/department/" + this.departmentId + "/section/" + this.sectionId + "/parcel/" + parcelId  + '?type=json'
                    }), function (json) {
                        var capakey = json.capakey;
                        var binding = this.binding;
                        binding.set("capakey", capakey);

                        var addresses = json.adres;
                        if (addresses.length > 0) {
                            addresses = addresses.join("\n");
                        } else {
                            addresses = this.i18n.noResultMessage;
                        }
                        this._toggleWidgetDisabledStatus("show", false);
                        binding.set("address", addresses);

                        this._refreshBindings();
                    }, this);
                },

                _processSection: function (newVal) {
                    if (this.parcelId) {
                        this.binding.set("parcel", null);
                        this.binding.set("address", null);
                        this.binding.set("capakey", null);
                        this._toggleWidgetDisabledStatus("show", true);
                        this._toggleWidgetDisabledStatus("parcel", true);
                    }
                    if (!newVal) {
                        return;
                    }
                    var item = this.sectionStore.query({
                        "title": newVal
                    });
                    var sectionId = this.sectionId = item[0].id;
                    ct_when(ct_request.requestJSON({
                        url: this.capakeyServiceUrl + "/" + this.municipalityId + "/department/" + this.departmentId + "/section/" + sectionId + "/parcel" + '?type=json'
                    }), function (json) {
                        this._toggleWidgetDisabledStatus("parcel", false);
                        var parcels = json.parcels;
                        var data = [];
                        d_array.forEach(parcels, function (parcel) {
                            data.push({
                                id: parcel.perceelnummer,
                                title: parcel.perceelnummer
                            });
                        });

                        data = this._sortAscending(data, "title");

                        var storeData = {
                            "idProperty": "id",
                            "data": data
                        };
                        var store = this.parcelStore = new ComplexMemory(storeData);
                        this.dataformService.addStore(store, {id: "parcelStore"});
                        this._refreshBindings();
                    }, this);
                },

                _processDepartment: function (newVal) {
                    if (this.sectionId) {
                        this.sectionId = undefined;
                        this.binding.set("section", null);
                        this._toggleWidgetDisabledStatus("show", true);
                        this._toggleWidgetDisabledStatus("parcel", true);
                    }
                    if (!newVal) {
                        return;
                    }
                    var query = {};
                    query[this._currentSearchAttr] = newVal;
                    var item = this.departmentStore.query(query);

                    var departmentId = this.departmentId = item[0].id;

                    ct_when(ct_request.requestJSON({
                        url: this.capakeyServiceUrl + "/" + this.municipalityId + "/department/" + departmentId + "/section" + '?type=json'
                    }), function (json) {
                        this._toggleWidgetDisabledStatus("section", false);
                        var sections = json.sections;
                        var data = [];
                        d_array.forEach(sections, function (section) {
                            data.push({
                                id: section.sectionCode,
                                title: section.sectionCode
                            });
                        });

                        data = this._sortAscending(data, this.binding.get("nis") ? "id" : "title");

                        var storeData = {
                            "idProperty": "id",
                            "data": data
                        };
                        var store = this.sectionStore = new ComplexMemory(storeData);
                        this.dataformService.addStore(store, {id: "sectionStore"});
                        this._refreshBindings();
                    }, this);
                },

                _processMunicipal: function (newVal) {
                    if (this.departmentId) {
                        this.departmentId = undefined;
                        this.binding.set("department", null);
                        this._toggleWidgetDisabledStatus("section", true);
                        this._toggleWidgetDisabledStatus("show", true);
                        this._toggleWidgetDisabledStatus("parcel", true);
                    }
                    if (!newVal) {
                        return;
                    }
                    var query = {};
                    query[this._currentSearchAttr] = newVal;
                    var item = this.municipalityStore.query(query);

                    var municipalityId = this.municipalityId = item[0].id;

                    ct_when(ct_request.requestJSON({
                        url: this.capakeyServiceUrl + "/" + municipalityId + "/department" + '?type=json'
                    }), function (json) {
                        this._toggleWidgetDisabledStatus("department", false);
                        var departments = json.departments;
                        var data = [];
                        d_array.forEach(departments, function (department) {
                            data.push({
                                id: department.departmentCode,
                                title: department.departmentName
                            });
                        });

                        data = this._sortAscending(data, this.binding.get("nis") ? "id" : "title");

                        var storeData = {
                            "idProperty": "id",
                            "data": data
                        };
                        var store = this.departmentStore = new ComplexMemory(storeData);
                        this.dataformService.addStore(store, {id: "departmentStore"});
                        this._refreshBindings();
                    }, this);
                },

                _resetControls: function () {

                },

                _toggleWidgetDisabledStatus: function (
                    id,
                    disable
                    ) {
                    this._getControlById(id).widget.set("disabled", disable);
                },

                _substitute: function (
                    widetDefinition,
                    params
                    ) {
                    return new Hash(widetDefinition).substitute(params, true).asMap();
                }
            }
        );
    }
);