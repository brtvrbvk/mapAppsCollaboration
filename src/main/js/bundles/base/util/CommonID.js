/**
 * COPYRIGHT 2012-2013 con terra GmbH Germany
 *
 * User: fba
 * Date: 10.01.14
 * Time: 11:10
 */
define([
        "dojo/_base/array",
        "ct/array"
    ],
    function (
        d_array,
        ct_array
        ) {
        return {

            get: function (id) {
                var time = new Date().getTime();
                var uniqueId = Math.floor(Math.random() * time);
                return id + "_" + uniqueId;
            },

            to: function (id) {
                // if common id is appended on the layer name
                if (id.indexOf("_") > -1) {
                    var parts = id.split("_");
                    var digit = /\d$/;
                    if (parts.length > 1 && digit.test(parts[parts.length - 1])) {
                        parts.pop();
                    }
                    return parts.join("_");
                }
                return id;
            },

            findIdInModel: function (
                model,
                id
                ) {

                var r = this.findIdsInModel(model, [id]);

                if (r && r.length > 0) {
                    return r[0];
                }
                return null;

            },

            findIdsInModel: function (
                model,
                ids
                ) {

                var serviceNodes = d_array.map(model.getServiceNodes(), function (node) {
                    return {
                        commonID: this.to(node.get("id")),
                        nodeID: node.get("id")
                    };
                }, this);

                var results = [];

                if (ids && ids !== undefined) {
                    d_array.forEach(ids, function (lay) {

                        var commonID = this.to(lay.id || lay);

                        var sn = ct_array.arraySearchFirst(serviceNodes, {commonID: commonID});

                        if (sn) {
                            results.push(model.getNodeById(sn.nodeID));
                        }
                    }, this);
                }
                return results;

            }

        };
    }
);