/**
 * COPYRIGHT 2015 con terra GmbH Germany
 * Created by fba on 03.12.2015.
 */
define([
        "dojo/_base/declare",
        "dojo/_base/array",
        "ct/Stateful",
        "ct/_Connect"
    ],
    function (declare, d_array, Stateful, _Connect) {
        return declare([Stateful, _Connect],
            {
                constructor: function () {

                },

                export: function () {
                    var mimetype = this.mimetype || "text/plain";
                    var charset = this.charset || document.characterSet;
                    var filename = this.filename || "graphics.txt";
                    var object = {
                        graphics: []
                    };
                    
                    var minx=99999999;
                    var miny=99999999;
                    var maxx=-99999999;
                    var maxy=-99999999;
                    var gmlMembers ="";
                    var projCode="31370"
                    d_array.forEach(this.geometryRenderer._renderers, function (renderer) {
                        var graphicsNode = renderer.graphicsNode;
                        if (graphicsNode  && graphicsNode.parent) {
                            if(graphicsNode.nodeType === "POINT" || graphicsNode.nodeType === "TEXT"){
                                var point = this.ct.transform(graphicsNode.graphics[0].geometry,"EPSG:31370");
                                if (minx > point.x) minx = point.x;
                                if (maxx < point.x) maxx = point.x;
                                if (miny > point.y) miny = point.y;
                                if (maxy < point.y) maxy = point.y;
                                gmlMembers += '<gml:featureMember>';
                                gmlMembers += '<agiv:GV_Feature>';
                                gmlMembers += '<agiv:NAAM>'+graphicsNode.title+'</agiv:NAAM>';
                                gmlMembers += '<gml:pointProperty>';
                                gmlMembers += '<gml:Point srsName="' + point.spatialReference.wkid + '">';
                                gmlMembers += '<gml:coordinates decimal="." cs="," ts=" ">' + point.x + ',' + point.y + '</gml:coordinates>';
                                gmlMembers += '</gml:Point>';
                                gmlMembers += '</gml:pointProperty>';
                                gmlMembers += '</agiv:GV_Feature>';
                                gmlMembers += '</gml:featureMember>';
                            }
                            if(graphicsNode.nodeType === "POLYLINE"){
                                gmlMembers += '<gml:featureMember>';
                                gmlMembers += '<agiv:GV_Feature>';
                                gmlMembers += '<agiv:NAAM>'+graphicsNode.title+'</agiv:NAAM>';
                                gmlMembers += '<gml:lineStringProperty>';
                                gmlMembers += '<gml:LineString srsName="' + "31370" + '">';
                                gmlMembers += '<gml:coordinates decimal="." cs="," ts=" ">';
                                var isfirst=true;
                                var paths = this.ct.transform(graphicsNode.graphics[0].geometry,"EPSG:31370");
                                d_array.forEach(paths.paths[0],function(point){
                                    if (minx > point[0]) minx = point[0];
                                    if (maxx < point[0]) maxx = point[0];
                                    if (miny > point[1]) miny = point[1];
                                    if (maxy < point[1]) maxy = point[1];
                                    if(isfirst)isfirst=false;
                                    else gmlMembers += ' ';
                                    gmlMembers += point[0] + "," + point[1];
                                },this);
                                gmlMembers += '</gml:coordinates>';
                                gmlMembers += '</gml:LineString>';
                                gmlMembers += '</gml:lineStringProperty>';
                                gmlMembers += '</agiv:GV_Feature>';
                                gmlMembers += '</gml:featureMember>';
                            }
                            if(graphicsNode.nodeType === "POLYGON"){
                                gmlMembers += '<gml:featureMember>';
                                gmlMembers += '<agiv:GV_Feature>';
                                gmlMembers += '<agiv:NAAM>'+graphicsNode.title+'</agiv:NAAM>';
                                gmlMembers += '<gml:polygonProperty>';
                                gmlMembers += '<gml:Polygon srsName="' + "31370" + '">';
                                gmlMembers += '<gml:outerBoundaryIs>';
                                gmlMembers += '<gml:LinearRing>';
                                gmlMembers += '<gml:coordinates decimal="." cs="," ts=" ">';
                                var isfirst=true;
                                var rings = this.ct.transform(graphicsNode.graphics[0].geometry,"EPSG:31370");
                                d_array.forEach(rings.rings[0],function(point){
                                    if (minx > point[0]) minx = point[0];
                                    if (maxx < point[0]) maxx = point[0];
                                    if (miny > point[1]) miny = point[1];
                                    if (maxy < point[1]) maxy = point[1];
                                    if(isfirst)isfirst=false;
                                    else gmlMembers += ' ';
                                    gmlMembers += point[0] + "," + point[1];
                                },this);
                                gmlMembers += '</gml:coordinates>';
                                gmlMembers += '</gml:LinearRing>';
                                gmlMembers += '</gml:outerBoundaryIs>';
                                gmlMembers += '</gml:Polygon>';
                                gmlMembers += '</gml:polygonProperty>';
                                gmlMembers += '</agiv:GV_Feature>';
                                gmlMembers += '</gml:featureMember>';
                            }
                        }
                    }, this);
                    var gmlTxt = '';
                    gmlTxt += '<agiv:FeatureCollection xmlns:gml="http://www.opengis.net/gml"';
                    gmlTxt += ' xmlns:agiv="http://www.agiv.be/agiv"';
                    gmlTxt += ' xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"';
                    gmlTxt += ' xsi:schemaLocation="http://www.agiv.be/agiv http://geoservices.informatievlaanderen.be/xsd/GeopuntExport.xsd">';
                    gmlTxt += '<gml:boundedBy>';
                    gmlTxt += '<gml:Box srsName="' + projCode + '">';
                    gmlTxt += '<gml:coordinates>' + minx + ',' + miny + ' ' + maxx + ',' + maxy + '</gml:coordinates>';
                    gmlTxt += '</gml:Box>';
                    gmlTxt += '</gml:boundedBy>';
                    gmlTxt = gmlTxt + gmlMembers + '</agiv:FeatureCollection>';
                    this._fileSaver.save(gmlTxt, filename, mimetype, charset);
                },
                
                exportEsriJson: function () {
                    var mimetype = this.mimetype || "text/plain";
                    var charset = this.charset || document.characterSet;
                    var filename = this.filename || "graphics.txt";
                    var object = {
                        graphics: []
                    };
                    d_array.forEach(this.geometryRenderer._renderers, function (renderer) {
                        var graphicsNode = renderer.graphicsNode;
                        if (graphicsNode) {
                            object.graphics.push(this._prepareGraphicsArray(graphicsNode.graphics))
                        }
                    }, this);
                    this._fileSaver.save(JSON.stringify(object), filename, mimetype, charset);
                },

                _prepareGraphicsArray: function (graphics) {
                    return d_array.map(graphics, function (graphic) {
                        return graphic.toJson();
                    });
                },

                activate: function () {

                },

                deactivate: function () {

                }
            }
        );
    }
);