/**
 * COPYRIGHT 2012-2013 con terra GmbH Germany
 *
 * User: fba
 * Date: 30.01.14
 * Time: 09:50
 */
define([
        "dojo/_base/declare",
        "dojo/_base/lang",
        "wizard/_BuilderWidget"
    ],
    function (
        declare,
        d_lang,
        _BuilderWidget
        ) {
        return declare([_BuilderWidget],
            {

                _dataForm: {
                    "dataform-version": "1.0.0",
                    "size": {
                        "h": 200,
                        "w": 500
                    },
                    "type": "gridpanel",
                    "showLabels": false,
                    "cols": 2,
                    "children": [
                        {
                            "type": "label",
                            "value": "Use DB service config?"
                        },
                        {
                            "type": "checkbox",
                            "field": "_useDBServices"
                        },
                        {
                            "type": "label",
                            "value": "Choose config from DB"
                        },
                        {
                            "type": "combobox",
                            "field": "_knownServicesLocation",
                            "store": "serviceConfigStore",
                            "searchAttribute": "id",
                            "labelAttribute": "title"
                        }
                    ]
                },

                constructor: function () {

                },

                activate: function () {
                    var dataFormService = this._dataformService;
                    var widget = dataFormService.createDataForm(this._dataForm);
                    var oldConf = this.getComponentConfig().properties;
                    var binding = this._binding = dataFormService.createBinding("object", {
                        data: {
                            _useDBServices: oldConf._knownServicesLocation ? true : false,
                            _oldKnownServices: oldConf._oldKnownServices || oldConf._knownServices,
                            _knownServicesLocation: oldConf._knownServicesLocation,
                            _knownServices: oldConf._knownServices
                        }
                    });
                    widget.set("dataBinding", binding);
                    binding.watch("*", d_lang.hitch(this, function (
                        type,
                        oldVal,
                        newVal
                        ) {
                        if (type === "_knownServicesLocation" && this._binding.data._useDBServices) {
                            var config = {
                                _oldKnownServices: oldConf._knownServices,
                                _knownServices: null,
                                _knownServicesLocation: this.baseURL + "/resources/services/" + newVal + ".json"
                            };
                            this.fireConfigChangeEvent(config);
                        }
                        if (type === "_useDBServices") {
                            if (newVal) {
                                var config = {
                                    _oldKnownServices: oldConf._knownServices,
                                    _knownServices: null,
                                    _knownServicesLocation: this.baseURL + "/resources/services/" + this._binding.data._knownServicesLocation + ".json"
                                };
                            } else {
                                var config = {
                                    _knownServices: oldConf._oldKnownServices,
                                    _knownServicesLocation: null
                                };
                            }
                            this.fireConfigChangeEvent(config);
                        }
                    }));

                    widget.placeAt(this.domNode);
                }
            }
        )
    }
);