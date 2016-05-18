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
                //"{"geometry":{"type":"point","x":336388.07455757575,"y":6664711.582069509,"spatialReference":{"wkid":3857}}}"
                bartpoint:function(){
                    return {
                        geometry:{
                            type:'point',
                            x:0,
                            y:0,
                            spatialReference:{
                                wkid:3857
                            }
                        }
                    };
                },
                //var strgeom = {"geometry":{"type":"polyline","paths":[[[38011.05473663716,6631996.533963468],[411296.3622769875,6632608.030189749]]],"_path":0,"spatialReference":{"wkid":3857}}};
                bartline:function(){
                    return {
                        geometry:{
                            type:'polyline',
                            paths:null,
                            spatialReference:{
                                wkid:3857
                            }
                        }
                    };
                },
                //var strgeom2 = {"geometry":{"type":"polygon","rings":[[[339139.80757584085,6708433.562248609],[366657.13775849127,6708433.562248609],[366657.13775849127,6689782.927347034],[339139.80757584085,6689782.927347034],[339139.80757584085,6708433.562248609]]],"_ring":0,"spatialReference":{"wkid":3857},"_centroid":null,"_extent":{"xmin":339139.80757584085,"ymin":6689782.927347034,"xmax":366657.13775849127,"ymax":6708433.562248609,"spatialReference":{"wkid":3857}},"_partwise":null}};
                bartpolygon:function(){
                    return {
                        geometry:{
                            type:'polygon',
                            rings:null,
                            spatialReference:{
                                wkid:3857
                            }
                        }
                    };
                },
                /*bartfeaturecollection:function(){
                    return {
                        type:'FeatureCollection',
                        features:[]
                    };
                },
                bartfeaturecollectionitem:function(){
                    return {
                        type:'Feature',
                        geometry:null
                    };
                },*/
                get:function(x,y){
                    return x.getElementsByTagName(y);
                },
                /**/
                import: function () {
                    document.bart_importController=this;
                    if (window.File && window.FileReader && window.FileList && window.Blob) {    
                        var deTool=document.getElementsByClassName("redlining_tools")[0];
                        //var strgeom = {"geometry":{"type":"polyline","paths":[[[38011.05473663716,6631996.533963468],[411296.3622769875,6632608.030189749]]],"spatialReference":{"wkid":3857}}};
                        //document.bart_geometryrenderermodifier.renderGeometry(strgeom);
                        if(deTool.ondrop==null){
                            //alert("DIT IS EEN POC!!!!!!!!!!!!!!!!!!");
                            //alert("Sleep een gml 2 bestand om het even waar in de browser");
                            deTool.ondrop=function(ev){
                                ev.preventDefault();
                                var files = ev.dataTransfer.files,
                                reader = new FileReader();
                                reader.onload = function(e) {
                                    var text = reader.result;
                                    document.bart_importController._doTheCompleteInput(text);
                                };
                                reader.readAsText(files[0]);
                            };
                        }
                        if(document.ondrop==null){
                            document.ondrop=function (ev) {
                                ev.preventDefault();
                            };
                        }
                        if(deTool.ondragover==null){
                            deTool.ondragover=function (ev) {
                                ev.preventDefault();
                            };
                        }
                    } else {
                        alert('The File APIs are not fully supported by your browser.');
                    }
                    if (window.File && window.FileReader && window.FileList && window.Blob) {
                        var x = document.createElement("INPUT");
                        x.setAttribute("type", "file");
                        x.setAttribute("id", "fileInput");
                        x.setAttribute("style", "overflow:hidden; position:relative;display:none;opacity: 0;");
                        var y = document.createElement("DIV");
                        y.setAttribute("type", "button");
                        y.setAttribute("id", "mybutton");
                        y.appendChild(x);
                        x.onchange = function(evt) {
                            var files = evt.target.files,
                            reader = new FileReader();
                            reader.onload = function(e) {
                                var text = reader.result;
                                document.bart_importController._doTheCompleteInput(text);
                            };
                            reader.readAsText(files[0]);
                        };
                        y.onclick = function(evt) {
                            x.click();
                        };
                        y.click(); 
                    } else {
                        alert('The File APIs are not fully supported by your browser.');
                    }
                },
           
                _doTheCompleteInput:function(gmlstring){
                    parser = new DOMParser();
                    xmlDoc = parser.parseFromString(gmlstring,"text/xml");
                    this.parseGML(xmlDoc);
                    //var output = document.bart_togeojson.parse.kml(xmlDoc)
                },
                parseGML: function(gml){
                    
                    //var fc=document.bart_importController.bartfeaturecollection();
                    var i=0;
                    var ftrmmbrs = gml.getElementsByTagName("featureMember");

                    for(i=0;i<ftrmmbrs.length;i++){
                    //d_array.forEach(ftrmmbrs, function (ftrmmbr) {
                        var ftrmmbr=ftrmmbrs[i];
                        

                            var naam=ftrmmbr.getElementsByTagName("NAAM");
                            var title={};
                            if(naam.length===1)
                                 title={title:naam[0].textContent};

                            //if(!this._addPoints(ftrmmbr.getElementsByTagName("MultiPoint"),title))
                                this._addPoints(ftrmmbr.getElementsByTagName("Point"),title);
                            
                            if(!this._addMultiLineStrings(ftrmmbr.getElementsByTagName("MultiLineString"),title))
                                this._addLineStrings(ftrmmbr.getElementsByTagName("LineString"),title);

                            if(!this._addMultiPolygons(ftrmmbr.getElementsByTagName("MultiPolygon"),title))
                                this._addPolygons(ftrmmbr.getElementsByTagName("Polygon"),title);

                            if(i> 30){
                                break;
                            }

                    }  
                    //},this);
                    //document.bart_geometryrenderermodifier.renderGeometry(fc);
                },

                _addMultiLineStrings:function(lns,title){
                    var paths=[];
                    var newln=null;
                    d_array.forEach(lns, function (ln) {
                    d_array.forEach(ln.getElementsByTagName("lineStringMember"), function (lineMember) {
                        var ln=this._addLineStrings(lineMember.getElementsByTagName("LineString"),title,true);
                        if(newln==null)
                               newln=ln;
                        else
                            newln.geometry.paths=newln.geometry.paths.concat(ln.geometry.paths);

                    },this);},this);
                    if(newln && newln.geometry){
                        var nodeid="drawingtoolsetNode"  + new Date().getTime() +  Math.round(Math.random()*1000);
                        document.bart_geometryrenderermodifier.renderGeometry(newln.geometry,title,nodeid);
                        return true;
                    }else{
                        return false;
                    }
                },

                _addLineStrings:function(lns,title,callfromMulti){
                        var paths=[];
                        var newline=this.bartline();
                        d_array.forEach(lns, function (ln) {
                            var crdnts = ln.getElementsByTagName("coordinates");
                            d_array.forEach(crdnts,function(crdnt){
                               var srsName=this._getSrsName(crdnt);
                               newline.geometry.spatialReference.wkid=srsName;
                               paths.push(this._coordinates2ring(crdnt,srsName));
                            },this);
                            newline.geometry.paths=paths;
                            newline.geometry = this.ct.transform(newline.geometry,"EPSG:3857");
                        },this);
                        
                        if(!callfromMulti){
                            if(newline.geometry.paths && newline.geometry.paths.length>0){
                                var nodeid="drawingtoolsetNode"  + new Date().getTime() +  Math.round(Math.random()*1000);
                                document.bart_geometryrenderermodifier.renderGeometry(newline.geometry,title,nodeid);
                            }
                        }else
                                return newline;
                        
                },



                _addPoints:function(pnts,title){
                        d_array.forEach(pnts, function (pnt) {
                            var crdnts = pnt.getElementsByTagName("coordinates");
                            var newpnt=this.bartpoint();
                            d_array.forEach(crdnts, function (crdnt) {
                                var srsName=this._getSrsName(crdnt);
                                newpnt.geometry.spatialReference.wkid=parseInt(srsName);
                                crdnt=crdnt.textContent.split(',');
                                if(srsName == 4326 || srsName == 4258){
                                    newpnt.geometry.x=Number(crdnt[1]);
                                    newpnt.geometry.y=Number(crdnt[0]);
                                }else{
                                    newpnt.geometry.x=Number(crdnt[0]);
                                    newpnt.geometry.y=Number(crdnt[1]);
                                }
                                newpnt.geometry = this.ct.transform(newpnt.geometry,"EPSG:3857");
                                //var nodeid="ImportPoint"  + new Date().getTime();
                                var nodeid="drawingtoolsetNode"  + new Date().getTime() +  Math.round(Math.random()*1000);
                                document.bart_geometryrenderermodifier.renderGeometry(newpnt.geometry,title,nodeid);
                            },this);
                        },this);
                },
                _addMultiPolygons:function(plgns,title){
                    var rings=[];
                    var newplgn=null;
                    d_array.forEach(plgns, function (plgn) {
                    d_array.forEach(plgn.getElementsByTagName("polygonMember"), function (polygonMember) {
                        var plgn=this._addPolygons(polygonMember.getElementsByTagName("Polygon"),title,true);
                        if(newplgn==null)
                               newplgn=plgn;
                        else
                            newplgn.geometry.rings=newplgn.geometry.rings.concat(plgn.geometry.rings);
                            //newplgn.geometry.rings.push(plgn.geometry.rings[0]);
                            //newplgn.geometry.rings[newplgn.geometry.rings.length]=plgn.geometry.rings[0];

                    },this);},this);
                    if(newplgn && newplgn.geometry){
                        //var nodeid="ImportMultiPolygon"  + new Date().getTime();
                        var nodeid="drawingtoolsetNode"  + new Date().getTime() +  Math.round(Math.random()*1000);
                        document.bart_geometryrenderermodifier.renderGeometry(newplgn.geometry,title,nodeid);
                        return true;
                    }else{
                        return false;
                    }
                },
                _addPolygons:function(plgns,title,callfromMulti){
                        var rings=[];
                        var newplgn=this.bartpolygon();
                        d_array.forEach(plgns, function (plgn) {
                            d_array.forEach(plgn.getElementsByTagName("LinearRing"), function (LinearRing) {
                            var crdnts = LinearRing.getElementsByTagName("coordinates");
                            d_array.forEach(crdnts,function(crdnt){
                               var srsName=this._getSrsName(crdnt);
                               newplgn.geometry.spatialReference.wkid=srsName;
                               //rings[rings.length]=this._coordinates2ring(crdnt);
                               rings.push(this._coordinates2ring(crdnt,srsName));
                            },this);
                            newplgn.geometry.rings=rings;
                            newplgn.geometry = this.ct.transform(newplgn.geometry,"EPSG:3857");
                            
                            },this);
                        },this);
                        if(!callfromMulti){
                            if(newplgn.geometry.rings && newplgn.geometry.rings.length>0){
                                //var nodeid="ImportPolygon"  + new Date().getTime();
                                var nodeid="drawingtoolsetNode"  + new Date().getTime() +  Math.round(Math.random()*1000);
                                document.bart_geometryrenderermodifier.renderGeometry(newplgn.geometry,title,nodeid);
                            }
                        }else
                                return newplgn;
                },
                
                _coordinates2ring:function(crdnt,srs){
                    var ring=[];
                    crdnt=crdnt.textContent.split(' ');
                    d_array.forEach(crdnt,function(xy){
                                    xy=xy.split(',');
                                    if(srs==4326 || srs == 4258)
                                        xy=[Number(xy[1]),Number(xy[0])];
                                    else
                                        xy=[Number(xy[0]),Number(xy[1])];
                                    //ring[ring.length]=xy;
                                    ring.push(xy);
                    });
                    return ring;
                },
                
                
                _getSrsName:function(x){
                    var srs=x.getAttribute('srsName');
                    if(srs!=null){
                        if(srs.split("EPSG:").length==2)
                            return parseInt(srs.split("EPSG:")[1]);
                        else if(srs.split("#").length==2)
                            return parseInt(srs.split("#")[1]);
                        else return 31370;
                    }
                    if(x.parentElement==null)
                        return null;
                    return this._getSrsName(x.parentElement);
                },
                /*
                _prepareGraphicsArray: function (graphics) {
                    return d_array.map(graphics, function (graphic) {
                        return graphic.toJson();
                    });
                },
*/
                activate: function () {

                },

                deactivate: function () {

                }
                
                
                
                
                
                
                
                
                
                
            }
        );
    }
);