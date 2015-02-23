/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


define(["dojo/_base/declare", "./LayerListWidget", "ct/_Connect"],
function (declare, LayerListWidget, _Connect){
    return declare([_Connect], {
        createInstance: function() {
            var mapModel = this._mapModel;
            var serviceNodes = mapModel.getServiceNodes();
            var widget = new LayerListWidget({
                nodes: serviceNodes
            });
            this.connect(widget, "onLayerUpdated", this._updateLayer);
            return widget;
        },
        destroyInstance : function(widget){
            this.disconnect();
            widget.destroyRecursive();
        },
        _updateLayer: function(){
            this._mapModel.fireModelNodeStateChanged({
                source: this
            });
        }
    });
});