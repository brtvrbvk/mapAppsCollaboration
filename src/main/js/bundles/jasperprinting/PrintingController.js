/**
 * COPYRIGHT 2014 con terra GmbH Germany
 *
 * Created by fba on 16.04.2014.
 */
define([
        "dojo/_base/declare",
        "dojo/_base/array",
        "dojo/_base/lang",
        "dojo/json",
        "dojo/sniff",
        "dojo/DeferredList",
        "ct/Stateful",
        "ct/request",
        "ct/_when",
        "ct/array",
        "ct/async",
        "base/analytics/AnalyticsConstants"
    ],
    function (
        declare,
        d_array,
        d_lang,
        JSON,
        d_sniff,
        DeferredList,
        Stateful,
        ct_request,
        ct_when,
        ct_array,
        ct_async,
        AnalyticsConstants
        ) {
        return declare([Stateful],
            {
                printDataProviders: null,
                mapPrintDataProviders: null,
                constructor: function () {
                    this.printDataProviders = [];
                    this.mapPrintDataProviders = [];
                    this.deferreds = {};
                },

                addPrintDataProvider: function (printDataProvider) {
                    var printDataProviders = this.printDataProviders;
                    printDataProviders[printDataProviders.length] = printDataProvider;
                },
                removePrintDataProvider: function (printDataProvider) {
                    ct_array.arrayRemove(this.printDataProviders, printDataProvider);
                },

                addMapPrintDataProvider: function (printDataProvider) {
                    var mapPrintDataProviders = this.mapPrintDataProviders;
                    mapPrintDataProviders[mapPrintDataProviders.length] = printDataProvider;
                },
                removeMapPrintDataProvider: function (printDataProvider) {
                    ct_array.arrayRemove(this.mapPrintDataProviders, printDataProvider);
                },

                _getSelectedKey: function (object) {
                    for (var key in object) {
                        if (object[key]) {
                            return key;
                        }
                    }
                },

                print: function (data) {

                    var templates = data.print && data.print.template;
                    var selectedTemplate = this._getSelectedKey(templates);

                    if (!this.templates[selectedTemplate]) {
                        throw new Error("No such template found " + selectedTemplate);
                    }
                    var templateName = selectedTemplate;
                    var opts = {
                        selectedTemplate: this.templates[selectedTemplate]
                    };

                    var types = data.print && data.print.type;
                    var type = this._getSelectedKey(types);

                    var printinfo = this._readPrintInfos(opts, data.print);

                    //selectionnames are only used for GA logging
                    var printSelectionNames = this._readSelectedOptionalPrintInfos(data.print, printinfo);

                    var deflist = [];

                    d_array.forEach(this.mapPrintDataProviders, function (mpdp) {
                        var tmp = d_lang.mixin(printinfo, {});
                        tmp = d_lang.mixin(tmp, mpdp.readPrintData(opts, data.print));

                        var mapsettings = data.print && data.print[mpdp.dataformKey];

                        tmp = d_lang.mixin(tmp, {
                            metadata: {
                                title: mapsettings ? mapsettings.title : "",
                                description: mapsettings ? mapsettings.description : ""
                            }
                        });

                        deflist.push(this._requestPrint(templateName, tmp, type, printSelectionNames));

                    }, this);

                    return new DeferredList(deflist);
                },

                _readSelectedOptionalPrintInfos: function (
                    printsettings,
                    printinfo
                    ) {

                    var infos = [];

                    d_array.forEach(this.printDataProviders, function (pdp) {

                        if (printsettings[pdp.KEY] && printinfo[pdp.KEY]) {
                            infos.push(pdp.NAME);
                        }

                    }, this);

                    return infos;

                },

                _readPrintInfos: function (
                    opts,
                    printsettings
                    ) {

                    var infos = {};

                    d_array.forEach(this.printDataProviders, function (pdp) {

                        if (printsettings[pdp.KEY]) {
                            infos = d_lang.mixin(infos, pdp.readPrintData(opts));
                        }

                    }, this);

                    return infos;

                },

                _requestPrint: function (
                    templatename,
                    data,
                    type,
                    printSelectionNames
                    ) {

                    this._eventService.postEvent(AnalyticsConstants.TOPICS.TRACK_EVENT, {
                        eventType: type.toUpperCase(),
                        eventCategory: AnalyticsConstants.CATEGORIES.PRINT,
                        eventValue: printSelectionNames.join(", ")
                    });
//BartVerbeeck31436                    
                    if(data.routing && data.routing[0] && data.routing[0].routes && data.routing[0].routes[0] && data.routing[0].routes[0].instructions){
                        d_array.forEach(data.routing[0].routes[0].instructions, function (instruction) {
                            var div = document.createElement("div");
                            div.innerHTML = instruction.step;
                            var x1 = div.textContent || div.innerText || "";
                            instruction.step = instruction.step.replace(/<\/?[^>]+(>|$)/g, "");;


                    }, this);
                    }
                    return ct_when(ct_request.requestJSON({
                        url: this.url + templatename + "/create/" + type,
                        postData: JSON.stringify(data),
                        headers: {
                            "Content-Type": "application/json"
                        }
                    }, {
                        usePost: true
                    }), function (resp) {

                        ct_async.hitch(this, function () {
                            window.open(this.url + "fetch/" + resp.printout, "_blank");
                        }, 150)();

                    }, function (error) {
                        this.logger.error({
                            message: "Print error: " + error.message || error
                        });
                    }, this);

                }
            }
        );
    }
);