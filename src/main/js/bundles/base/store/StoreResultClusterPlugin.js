/**
 * COPYRIGHT 2012-2013 con terra GmbH Germany
 *
 * User: fba
 * Date: 10.10.13
 * Time: 11:06
 */
define([
        "dojo/_base/declare",
        "dojo/_base/array",
        "ct/Stateful"
    ],
    function (
        declare,
        d_array,
        Stateful
        ) {
        return declare([Stateful],
            {
                _clusterTolerance: 75,

                constructor: function () {

                },

                process: function (
                    results,
                    targetQuery,
                    requestOptions
                    ) {

                    var clusterData = [];

                    if (requestOptions.currentScale < (this.scaleThreshold || 2000)) {
                        //from this scale on we just want single items...
                        d_array.forEach(results, function (item) {

                            var c = this._clusterCreate(item);
                            clusterData.push(c);

                        }, this);

                    } else {

                        d_array.forEach(results, function (item) {

                            var clustered = false;
                            // look for an existing cluster for the new point
                            d_array.some(clusterData, function (c) {
                                if (this._clusterTest(item, c, requestOptions.resolution)) {
                                    // add the point to an existing cluster
                                    this._clusterAddPoint(item, c);
                                    clustered = true;
                                    return true;
                                }
                            }, this);

                            if (!clustered) {
                                var c = this._clusterCreate(item);
                                clusterData.push(c);
                            }

                        }, this);

                    }

                    return clusterData;

                },

                _clusterTest: function (
                    item,
                    cluster,
                    resolution
                    ) {
                    var p = item.geometry;
                    var distance = Math.sqrt(
                                Math.pow((cluster.geometry.x - p.x),
                                    2) + Math.pow((cluster.geometry.y - p.y), 2)
                        ) / resolution;

                    var severityMatches = item.importantHindrance === cluster.importantHindrance;
                    return (distance <= this._clusterTolerance) && severityMatches;
                },

                // points passed to clusterAddPoint should be included
                // in an existing cluster
                // also give the point an attribute called clusterId
                // that corresponds to its cluster
                _clusterAddPoint: function (
                    item,
                    cluster
                    ) {
                    // average in the new point to the cluster geometry
                    var count, x, y, p = item.geometry;
                    count = cluster.clusterCount;
                    x = (p.x + (cluster.geometry.x * count)) / (count + 1);
                    y = (p.y + (cluster.geometry.y * count)) / (count + 1);

                    cluster.geometry.x = x;
                    cluster.geometry.y = y;

                    if (item.importantHindrance) {
                        cluster.importantHindrance = item.importantHindrance;
                    }

                    // build an extent that includes all points in a cluster
                    // extents are for debug/testing only...not used by the layer
                    if (p.x < cluster.extent[0]) {
                        cluster.extent[0] = p.x;
                    } else if (p.x > cluster.extent[2]) {
                        cluster.extent[2] = p.x;
                    }
                    if (p.y < cluster.extent[1]) {
                        cluster.extent[1] = p.y;
                    } else if (p.y > cluster.extent[3]) {
                        cluster.extent[3] = p.y;
                    }

//                    var ext = ct_geometry.createExtent({
//                        xmin:cluster.extent[0],
//                        ymin:cluster.extent[1],
//                        xmax:cluster.extent[2],
//                        ymax:cluster.extent[3],
//                        spatialReference:item.geometry.spatialReference
//                    });

//                    cluster.geometry = ext.getCenter();
                    var x = 0, y = 0, count = cluster.items.length;
                    d_array.forEach(cluster.items, function (it) {
                        x += it.geometry.x;
                        y += it.geometry.y;
                    });
                    x /= count;
                    y /= count;

                    cluster.geometry.x = x;
                    cluster.geometry.y = y;

                    // increment the count
                    cluster.clusterCount++;
                    cluster.isCluster = cluster.clusterCount > 1;
                    cluster.items.push(item);
                },

                // point passed to clusterCreate isn't within the
                // clustering distance specified for the layer so
                // create a new cluster for it
                _clusterCreate: function (item) {
                    var clusterId = new Date().getTime();
                    // console.log("cluster create, id is: ", clusterId);
                    // p.attributes might be undefined
                    var p = item.geometry;
                    // create the cluster
                    var cluster = {
                        "items": [item],
                        "importantHindrance": item.importantHindrance,
                        "gipodType": item.gipodType,
                        "geometry": item.geometry,
                        "clusterCount": 1,
                        "clusterId": clusterId,
                        "isCluster": false,
                        "extent": [
                            p.x,
                            p.y,
                            p.x,
                            p.y
                        ]
                    };
                    return cluster;
                }
            }
        )
    }
);