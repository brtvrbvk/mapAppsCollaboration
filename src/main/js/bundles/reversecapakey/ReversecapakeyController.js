define([
        "dojo/_base/lang",
        "dojo/_base/kernel",
        "dojo/_base/declare",
        "dojo/_base/json",
        "dojo/_base/array",
         "ct/_when",
         "ct/request",
         "ct/store/ComplexMemory",
        "dojo/cookie",
        "ct/Stateful",
        "ct/_Connect",
        "./ReversecapakeyWidget"
    ],
    function (
        d_lang,
        d_kernel,
        declare,
        d_json,
        d_array,
        ct_when,
        ct_request,
        ComplexMemory,
        d_cookie,
        Stateful,
        _Connect,
        ReversecapakeyWidget
        ) {
       

        return declare(
            [
                Stateful,
                _Connect
            ],
            {
                

                constructor: function () {
                       
                },

                activate: function () {
                        document.bart_reversecapakey=this;
                        this._createReversecapakeyWindow();
                        //this._onLoad();
                
                },

                _onLoad: function () {
                    if (this._window) {
                        if (d_kernel.isIE) {
                            setTimeout(d_lang.hitch(this, function () {
                                this._window.show();
                            }), 2000);
                        } else {
                            this._window.show();
                        }
                    }
                },

                _onCloseReversecapakey: function () {
                    this._window.hide();
                },

                _createReversecapakeyWindow: function () {
                    if (!this._window) {
                        var i18n = this._i18n.get();
                        if (this.i18n) {
                            d_lang.mixin(i18n.ui, this.i18n.ui);
                        }
                        var widget = this._widget = this.widget || new ReversecapakeyWidget({
                            i18n: i18n
                        });
                        this.connect(widget, "onCloseReversecapakey", "_onCloseReversecapakey");
                        var windowProps = this._properties.windowBox;
                        this._window = this._wm.createInfoWindow({
                            title: i18n.ui.title,
                            content: widget,
                            closable: false,
                            draggable: true,
                            resizable: true,
                            modal:false,
                            marginBox: this.windowBox || {
                                w: windowProps.w,
                                h: windowProps.h
                            }
                        });
                    }
                    //this._window.show();

                },
                showReversecapakeyInformation: function () {
                    if (!this._window) {
                        this._createReversecapakeyWindow();
                    }
                    this._window.show();
                },
                
                callReverseFromPpr:function(parcel){
                    this._eventService.postEvent("ct/tool/set/ACTIVATE", {toolId: "capakeyTool"});
                },
                callReverse:function(){
                    //if(document.getElementsByClassName("capakeyWindow") && document.getElementsByClassName("capakeyWindow")[0] && document.getElementsByClassName("capakeyWindow")[0].style.opacity=== "0")
                        this._eventService.postEvent("ct/tool/set/ACTIVATE", {toolId: "capakeyTool"});
                    document.bart_reversecapakey.showReversecapakey(document.bart_reversecapakey.geo);
                },
                showReversecapakey: function(geo){
                    var geo = this.ct.transform(geo,"EPSG:31370");
                    var url = this.capakeyServiceUrl1 +'parcel?type=json&x=' + geo.x + '&y=' + geo.y + '&data=' + this.capakeyServiceData ;
                    ct_when(ct_request.requestJSON({
                        url: url
                    }), function (json) {
                        if(json === null){
                            
                            document.bart_capakey.municipalityId = undefined;
                            document.bart_capakey.binding.set("municipality", null);
                            document.bart_capakey._toggleWidgetDisabledStatus("department", true);
                            document.bart_capakey._toggleWidgetDisabledStatus("section", true);
                            document.bart_capakey._toggleWidgetDisabledStatus("show", true);
                            document.bart_capakey._toggleWidgetDisabledStatus("parcel", true);
                        }
                        var nischecked = document.bart_capakey._getControlById("nis").widget.checked;
                        if(nischecked){
                            var newValMunicipality=json.municipalityCode;
                            var newValDepartment=json.departmentCode;
                        }else{
                            var newValMunicipality=json.municipalityName;
                            var newValDepartment=json.departmentName;
                        }
                        var newValSection = json.sectionCode;
                        var newValParcel = json.perceelnummer;
                    
                        
                    if (document.bart_capakey.departmentId) {
                        document.bart_capakey.departmentId = undefined;
                        document.bart_capakey.binding.set("department", null);
                        document.bart_capakey._toggleWidgetDisabledStatus("section", true);
                        document.bart_capakey._toggleWidgetDisabledStatus("show", true);
                        document.bart_capakey._toggleWidgetDisabledStatus("parcel", true);
                    }
                    var query = {};
                    query[document.bart_capakey._currentSearchAttr] = newValMunicipality;
                    var item = document.bart_capakey.municipalityStore.query(query);
                    document.bart_capakey.binding.set("municipality", newValMunicipality);
                    var municipalityId = document.bart_capakey.municipalityId = item[0].id;
                    ct_when(ct_request.requestJSON({
                        url: this.capakeyServiceUrl + "/" + municipalityId + "/department" + '?type=json' + '&data=' + this.capakeyServiceData
                    }), function (json) {
                        document.bart_capakey._toggleWidgetDisabledStatus("department", false);
                        var departments = json.departments;
                        var data = [];
                        d_array.forEach(departments, function (department) {
                            data.push({
                                id: department.departmentCode,
                                title: department.departmentName
                            });
                        });
                        data = document.bart_capakey._sortAscending(data, document.bart_capakey.binding.get("nis") ? "id" : "title");
                        var storeData = {
                            "idProperty": "id",
                            "data": data
                        };
                        var store = document.bart_capakey.departmentStore = new ComplexMemory(storeData);
                        document.bart_capakey.dataformService.addStore(store, {id: "departmentStore"});
                        document.bart_capakey._refreshBindings();
						                    if (document.bart_capakey.sectionId) {
                        document.bart_capakey.sectionId = undefined;
                        document.bart_capakey.binding.set("section", null);
                        document.bart_capakey._toggleWidgetDisabledStatus("show", true);
                        document.bart_capakey._toggleWidgetDisabledStatus("parcel", true);
                    }
                    var query = {};
                    query[document.bart_capakey._currentSearchAttr] = newValDepartment;
                    var item = document.bart_capakey.departmentStore.query(query);
                    document.bart_capakey.binding.set("department", newValDepartment);
                    var departmentId = document.bart_capakey.departmentId = item[0].id;
                    ct_when(ct_request.requestJSON({
                        url: this.capakeyServiceUrl + "/" + document.bart_capakey.municipalityId + "/department/" + departmentId + "/section" + '?type=json' + '&data=' + this.capakeyServiceData
                    }), function (json) {
                        document.bart_capakey._toggleWidgetDisabledStatus("section", false);
                        var sections = json.sections;
                        var data = [];
                        d_array.forEach(sections, function (section) {
                            data.push({
                                id: section.sectionCode,
                                title: section.sectionCode
                            });
                        });
                        data = document.bart_capakey._sortAscending(data, document.bart_capakey.binding.get("nis") ? "id" : "title");
                        var storeData = {
                            "idProperty": "id",
                            "data": data
                        };
                        var store = document.bart_capakey.sectionStore = new ComplexMemory(storeData);
                        document.bart_capakey.dataformService.addStore(store, {id: "sectionStore"});
                        document.bart_capakey._refreshBindings();
						                    if (document.bart_capakey.parcelId) {
                        document.bart_capakey.binding.set("parcel", null);
                        document.bart_capakey.binding.set("address", null);
                        document.bart_capakey.binding.set("capakey", null);
                        document.bart_capakey._toggleWidgetDisabledStatus("show", true);
                        document.bart_capakey._toggleWidgetDisabledStatus("parcel", true);
                    }
                    var item = document.bart_capakey.sectionStore.query({
                        "title": newValSection
                    });
                    document.bart_capakey.binding.set("section", newValSection);
                    var sectionId = document.bart_capakey.sectionId = item[0].id;
                    ct_when(ct_request.requestJSON({
                        url: this.capakeyServiceUrl + "/" + document.bart_capakey.municipalityId + "/department/" + document.bart_capakey.departmentId + "/section/" + sectionId + "/parcel" + '?type=json' + '&data=' + this.capakeyServiceData
                    }), function (json) {
                        document.bart_capakey._toggleWidgetDisabledStatus("parcel", false);
                        var parcels = json.parcels;
                        var data = [];
                        d_array.forEach(parcels, function (parcel) {
                            data.push({
                                id: parcel.perceelnummer,
                                title: parcel.perceelnummer
                            });
                        });
                        data = document.bart_capakey._sortAscending(data, "title");
                        var storeData = {
                            "idProperty": "id",
                            "data": data
                        };
                        var store = document.bart_capakey.parcelStore = new ComplexMemory(storeData);
                        document.bart_capakey.dataformService.addStore(store, {id: "parcelStore"});
                        if(!newValParcel){
                            document.bart_capakey.binding.set("capakey", "Geen perceel gevonden op deze locatie");
                            return;
                        }
                        
                        
                        document.bart_capakey._refreshBindings();
						 var item = document.bart_capakey.parcelStore.query({
                        "title": newValParcel
                    });
                    document.bart_capakey.binding.set("parcel", newValParcel);
                    var parcelId = document.bart_capakey.parcelId = item[0].id;
                    ct_when(ct_request.requestJSON({
                        url: this.capakeyServiceUrl + "/" + document.bart_capakey.municipalityId + "/department/" + document.bart_capakey.departmentId + "/section/" + document.bart_capakey.sectionId + "/parcel/" + parcelId  + '?type=json'  + '&data=' + this.capakeyServiceData
                    }), function (json) {
                        var capakey = json.capakey;
                        var binding = document.bart_capakey.binding;
                        binding.set("capakey", capakey);

                        var addresses = json.adres;
                        if (addresses.length > 0) {
                            addresses = addresses.join("\n");
                        } else {
                            addresses = document.bart_capakey.i18n.noResultMessage;
                        }
                        document.bart_capakey._toggleWidgetDisabledStatus("show", false);
                        binding.set("address", addresses);
                        document.bart_capakey._refreshBindings();
                    }, document.bart_capakey);

                    }, document.bart_capakey);


                    }, document.bart_capakey);


                    }, document.bart_capakey);

                        return;
                            if(nischecked)
                                document.bart_capakey._processMunicipal(json.municipalityCode);
                            else
                                document.bart_capakey._processMunicipal(json.municipalityName);
                            setTimeout(function () {
                                if(nischecked)
                                    document.bart_capakey._processDepartment(json.departmentCode);
                                else
                                    document.bart_capakey._processDepartment(json.departmentName);
                                setTimeout(function () {
                                    document.bart_capakey._processSection(json.sectionCode);
                                    setTimeout(function () {
                                        document.bart_capakey._processParcel(json.perceelnummer);
                                        setTimeout(function () {
                                            document.bart_capakey._getControlById("municipality").widget.focus();
                                            document.bart_capakey._getControlById("municipality").widget.textbox.value=json.municipalityName;
                                            document.bart_capakey._getControlById("department").widget.focus();
                                            document.bart_capakey._getControlById("department").widget.textbox.value=json.departmentName;
                                            document.bart_capakey._getControlById("section").widget.focus()
                                            document.bart_capakey._getControlById("section").widget.textbox.value=json.sectionCode;
                                            document.bart_capakey._getControlById("parcel").widget.focus();
                                            document.bart_capakey._getControlById("parcel").widget.textbox.value=json.perceelnummer;
                                            document.bart_capakey._getControlById("capakey").dataBinding.data.capakey = json.capakey;
                                            document.bart_capakey._getControlById("municipality").widget.focus();
                                            var addresses = json.adres;
                                            if (addresses.length > 0) {
                                                addresses = addresses.join("\n");
                                            } else {
                                                addresses = document.bart_capakey.i18n.noResultMessage;
                                            }
                                            document.bart_capakey._getControlById("capakey").dataBinding.data.address = json.addresses;
                                        }, 200);
                                    }, 1000);
                                }, 200);
                            }, 200);
                            
                            
                            
                        return;
                        
                        
                        
                        
                        

                    if(json == null){
                        this._widget.htmlnode.set("content", "Geen perceelsInfo gevonden");
                        this._onLoad();
                        return;
                    }
                    var addresses = json.adres;
                        if (addresses.length > 0) {
                            addresses = addresses.join("<br/>");
                        } else {
                            addresses = document.bart_capakey.i18n.noResultMessage;
                        }
                     
                    var txt = JSON.stringify(json);
                    var txt2 = this._widget.i18n.ui.reversecapakey;
                    txt2=txt2.replace("$1$",json.municipalityName);
                    txt2=txt2.replace("$2$",json.municipalityCode);
                    txt2=txt2.replace("$3$",json.departmentName);
                    txt2=txt2.replace("$4$",json.departmentCode);
                    txt2=txt2.replace("$5$",json.sectionCode);
                    txt2=txt2.replace("$6$",json.perceelnummer);
                    txt2=txt2.replace("$7$",json.capakey);
                    txt2=txt2.replace("$8$",addresses);
                        this._widget.htmlnode.set("content", txt2);
                        this._onLoad();
                    }, this);
                }
            });

    });