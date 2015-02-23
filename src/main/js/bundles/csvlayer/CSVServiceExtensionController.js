define([
    "dojo/_base/declare",
    "loadservice/_ServiceExtensionController",
    "./CSVServiceExtensionWidget",
    "ct/Stateful", "ct/_Connect",
    "base/util/CommonID"
], function (
        declare,
        _ServiceExtensionController,
        CSVServiceExtensionWidget,
        Stateful, _Connect,
        CommonID
        ) {

    return declare([_ServiceExtensionController, Stateful, _Connect], {
        _getWidget: function () {
            this.widget = new CSVServiceExtensionWidget();
            this.connect(this.widget, "onSubmitClick", this._onSubmit);
            return this.widget;
        },
        _onSubmit: function (evt) {
            var id = CommonID.get("csvlayer");
            var metadata = {
                service: {
                    TITLE: "my title goes here",
                    URL: evt.url,
                    SERVICE_TYPE: "CSV",
                    LAYERS: [{
                            ID: id,
                            TITLE: "my csv layer"
                        }
                    ]
                },
                layerIds: [id],
                options: {
                    "columnDelimiter": evt.del,
                    "latitudeFieldName": evt.lat,
                    "longitudeFieldName": evt.lng
                }
            };

            this._handleLoadLayers(metadata);
        }
    });

});