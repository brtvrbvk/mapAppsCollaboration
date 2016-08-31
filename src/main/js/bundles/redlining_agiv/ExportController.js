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
                    
                    //document.bart_notifier.info("Export start","info",{xClose:true,isLink:"http://www.humo.be",newId:"paard"});
                    //document.bart_notifier.remove("paard");
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
                    var projCode="EPSG:31370";
                    var aantal=this.geometryRenderer._renderers.length;
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
                                gmlMembers += '<gml:Point srsName="' + "EPSG:31370" + '">';
                                gmlMembers += '<gml:coordinates decimal="." cs="," ts=" ">' + Math.round(point.x*100)/100 + ',' + Math.round(point.y*100)/100 + '</gml:coordinates>';
                                gmlMembers += '</gml:Point>';
                                gmlMembers += '</gml:pointProperty>';
                                gmlMembers += '</agiv:GV_Feature>';
                                gmlMembers += '</gml:featureMember>';
                            }
                            /*
                            if(graphicsNode.nodeType === "POLYLINE"){
                                gmlMembers += '<gml:featureMember>';
                                gmlMembers += '<agiv:GV_Feature>';
                                gmlMembers += '<agiv:NAAM>'+graphicsNode.title+'</agiv:NAAM>';
                                gmlMembers += '<gml:lineStringProperty>';
                                gmlMembers += '<gml:LineString srsName="' + "EPSG:31370" + '">';
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
                                    gmlMembers += Math.round(point[0]*100)/100 + "," + Math.round(point[1]*100)/100;
                                },this);
                                gmlMembers += '</gml:coordinates>';
                                gmlMembers += '</gml:LineString>';
                                gmlMembers += '</gml:lineStringProperty>';
                                gmlMembers += '</agiv:GV_Feature>';
                                gmlMembers += '</gml:featureMember>';
                            }
                            */
                           if(graphicsNode.nodeType === "POLYLINE"){
                                gmlMembers += '<gml:featureMember>';
                                gmlMembers += '<agiv:GV_Feature>';
                                gmlMembers += '<agiv:NAAM>'+graphicsNode.title+'</agiv:NAAM>';
								
								var paths = this.ct.transform(graphicsNode.graphics[0].geometry,"EPSG:31370");
								var isMultiLineString=this._isMultiLineString(paths.paths);
								if(isMultiLineString){
                                    gmlMembers += '<gml:multiLineStringProperty>';
                                    gmlMembers += '<gml:MultiLineString srsName="' + "EPSG:31370" + '">';
                                    
                                }else{
                                    gmlMembers += '<gml:lineStringProperty>';
                                }
								for(var i=0;i<paths.paths.length;i++){
									var path=paths.paths[i];
									
									 if(isMultiLineString){
										gmlMembers += '<gml:lineStringMember>';
									}
									gmlMembers += '<gml:LineString';
									if(!isMultiLineString)
											gmlMembers +=  ' srsName="EPSG:31370"';
									gmlMembers += '>';
									
									gmlMembers += '<gml:coordinates decimal="." cs="," ts=" ">';
									var isfirst=true;
									
									d_array.forEach(paths.paths[0],function(point){
										if (minx > point[0]) minx = point[0];
										if (maxx < point[0]) maxx = point[0];
										if (miny > point[1]) miny = point[1];
										if (maxy < point[1]) maxy = point[1];
										if(isfirst)isfirst=false;
										else gmlMembers += ' ';
										gmlMembers += Math.round(point[0]*100)/100 + "," + Math.round(point[1]*100)/100;
									},this);
									gmlMembers += '</gml:coordinates>';
									gmlMembers += '</gml:LineString>';
                                                                        if(isMultiLineString){
										gmlMembers += '</gml:lineStringMember>';
									}
								}
                                
								if(isMultiLineString){
                                    gmlMembers += '</gml:MultiLineString>';
									gmlMembers += '</gml:multiLineStringProperty>';
                                }else{
                                    gmlMembers += '</gml:lineStringProperty>';
                                }
                                gmlMembers += '</agiv:GV_Feature>';
                                gmlMembers += '</gml:featureMember>';
                            }
                            if(graphicsNode.nodeType === "POLYGON"){
                                var isInner=false;
                                var isNextInner=false;
                                gmlMembers += '<gml:featureMember>';
                                gmlMembers += '<agiv:GV_Feature>';
                                gmlMembers += '<agiv:NAAM>'+graphicsNode.title+'</agiv:NAAM>';
/*******************************************************************************/                                
                                var rings = this.ct.transform(graphicsNode.graphics[0].geometry,"EPSG:31370");
                                var isMultiPolygon=this._isMultiPolygon(rings.rings);
                                if(isMultiPolygon){
                                    gmlMembers += '<gml:multiPolygonProperty>';
                                    gmlMembers += '<gml:MultiPolygon srsName="' + "EPSG:31370" + '">';
                                }else{
                                    gmlMembers += '<gml:polygonProperty>';
                                }
                                for(var i=0;i<rings.rings.length;i++){
                                //d_array.forEach(rings.rings,function(ring){
                                var ring=rings.rings[i];
                                isInner = rings.isClockwise(ring);
                                if(i==(rings.rings.length-1))
                                    isNextInner=false;
                                else{
                                    isNextInner = rings.isClockwise(rings.rings[i+1]);
                                    
                                }
/*******************************************************************************/                                
                                
                                if(!isInner || !isMultiPolygon){
                                    if(isMultiPolygon)
                                        gmlMembers += '<gml:polygonMember>';
                                    gmlMembers += '<gml:Polygon';
                                    if(!isMultiPolygon)
                                        gmlMembers +=  ' srsName="EPSG:31370"';
                                    gmlMembers += '>';
                                    gmlMembers += '<gml:outerBoundaryIs>';
                                }else
                                    gmlMembers += '<gml:innerBoundaryIs>';
                                gmlMembers += '<gml:LinearRing>';
                                gmlMembers += '<gml:coordinates decimal="." cs="," ts=" ">';
                                var isfirst=true;
                                //var rings = this.ct.transform(graphicsNode.graphics[0].geometry,"EPSG:31370");
                                //d_array.forEach(rings.rings[0],function(point){
                                d_array.forEach(ring,function(point){
                                    if (minx > point[0]) minx = point[0];
                                    if (maxx < point[0]) maxx = point[0];
                                    if (miny > point[1]) miny = point[1];
                                    if (maxy < point[1]) maxy = point[1];
                                    if(isfirst)isfirst=false;
                                    else gmlMembers += ' ';
                                    gmlMembers += Math.round(point[0]*100)/100 + "," + Math.round(point[1]*100)/100;
                                },this);
                                gmlMembers += '</gml:coordinates>';
                                gmlMembers += '</gml:LinearRing>';
                                
                                if(!isInner || !isMultiPolygon)
                                    gmlMembers += '</gml:outerBoundaryIs>';
                                else
                                    gmlMembers += '</gml:innerBoundaryIs>';
                                if(!isNextInner){
                                    gmlMembers += '</gml:Polygon>';
                                    if(isMultiPolygon)
                                        gmlMembers += '</gml:polygonMember>';
                                }
                                
/*******************************************************************************/ 
                                }
                                //},this);
                                if(isMultiPolygon){
                                    gmlMembers += '</gml:MultiPolygon>';
                                    gmlMembers += '</gml:multiPolygonProperty>';
                                }else{
                                    gmlMembers += '</gml:polygonProperty>';
                                }
/*******************************************************************************/                                
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
//                    document.bart_notifier.info("Export klaar: "+aantal+" objecten geexporteerd","info");
                },
                _isMultiLineString:function(paths){
                    if(paths.length==1)return false;
                    
                    return true;
                },
                
                _isMultiPolygon:function(rings){
                    if(rings.length==1)return false;
                    
                    return true;
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