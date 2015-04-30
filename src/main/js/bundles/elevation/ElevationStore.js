define([
        "dojo/_base/lang",
        "dojo/_base/declare",
        "dojo/_base/array",
        "dojo/store/util/QueryResults",
        "esri/geometry/jsonUtils",
        "ct/_when",
        "ct/request",
        "ct/Stateful"
    ],
    function (
        d_lang,
        declare,
        d_array,
        QueryResults,
        jsonUtils,
        ct_when,
        ct_request,
        Stateful
        ) {
        /*
         * COPYRIGHT 2012 con terra GmbH Germany
         */

        return declare([Stateful], {

            constructor: function () {
            },

            activate: function () {
                this.inherited(arguments);
            },

            query: function (
                query,
                options
                ) {

                var geom = query.geometry;
                geom = this._ct.transform(geom, this.inputSrs);

                var content = {
                    "SrsIn": this.inputSrs,
                    "SrsOut": this.targetSrs,
                    "LineString": {
                        "coordinates": geom.paths[0],
                        "type": "LineString"
                    },
                    "Samples": options.samples
                };
                return QueryResults(ct_when(ct_request.request({
                    url: this._properties.usedServiceVersion === "old" ? this._getQueryURLForOldServiceVersion() : this._getQueryURLForNewServiceVersion(),
                    postData: JSON.stringify(content),
                    contentType: "application/json",
                    handleAs: "json",
                    headers: {
                        "Accept": "application/json"
                    }
                }, {
                    usePost: true
                }), function (response) {
                    var total = response.length;
                    var result = this._processElevationData(response, this.targetSrs);
                    result.total = total;
                    return result;
                }, this));
            },

            _getQueryURLForOldServiceVersion: function() {
                return this._properties.target + "/search";
            },

            _getQueryURLForNewServiceVersion: function() {
                var props = this._properties;
                var datasetName = props.datasetName;
                return props.target + "/" + datasetName + "/request";
            },

            _createElements: function (
                result,
                srs
                ) {
                result.elevationResults = d_array.map(result.elevationResults, function (item) {
                    return this._createElevationItem(item, srs);
                }, this);
                result.noDataResults = d_array.map(result.noDataResults, function (items) {
                    return d_array.map(items, function (item) {
                        return this._createElevationItem(item, srs);
                    }, this);
                }, this);
                result.allElevationResults = d_array.map(result.allElevationResults, function (item) {
                    return this._createElevationItem(item, srs);
                }, this);
                return result;
            },

            _createElevationItem: function (
                item,
                srs
                ) {
                var geom = jsonUtils.fromJson({
                    x: item[1],
                    y: item[2],
                    spatialReference: {
                        wkid: srs
                    }
                });
                geom = this._ct.transform(geom, this._mapState.getSpatialReference().wkid);
                return {
                    x: item[0],
                    y: item[3],
                    geometry: geom
                }
            },

            _removeNoDataValues: function (elevationResult) {
                var result = {
                    noDataResults: []
                }
                var noDataFoundBefore = false;
                result.elevationResults = d_array.filter(elevationResult, function (
                    item,
                    idx
                    ) {
                    if (item[3] < -9000) {
                        //NoData
                        if (!noDataFoundBefore) {
                            var t = d_lang.clone(elevationResult[idx - 1 >= 0 ? idx - 1 : 0]);
                            t[3] = 9999;
                            result.noDataResults.push([t]);
                            noDataFoundBefore = true;
                        }
//                        item[3]=0;
                        //we set it to 0 for a better visualization
//                        return item;
                        return null;
                    } else if (noDataFoundBefore) {
                        var t = d_lang.clone(item);
                        t[3] = 9999;
                        result.noDataResults[result.noDataResults.length - 1].push(t);
                        noDataFoundBefore = false;
                    }
                    return item;
                }, this);
                result.allElevationResults = d_array.map(elevationResult, function (item) {
                    return item;
                }, this);
                return result;
            },

            _processElevationData: function (
                elevationResult,
                srs
                ) {
                var res = this._removeNoDataValues(elevationResult);
                res = this._createElements(res, srs);
                return res;
            }
        });
    });