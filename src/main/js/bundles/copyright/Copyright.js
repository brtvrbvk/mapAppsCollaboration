define([
        "dojo/_base/lang",
        "dojo/_base/declare",
        "dojo/_base/array",
        "ct/array",
        "ct/_Connect",
        "./CopyrightWidget"
    ],
    function (
        d_lang,
        declare,
        d_array,
        ct_array,
        _Connect,
        CopyrightWidget
        ) {
        /*
         * COPYRIGHT 2011-2012 con terra GmbH Germany
         */
        /**
         * @fileOverview
         * @author gli
         */
        return declare(
            [_Connect],
            {
                constructor: function () {
                    this._ui = null;
                    this._props = null;
                    this._configLocation = null;
                },

                activate: function (componentCtx) {
                    this._props = this._properties || {};
                    this._configLocation = componentCtx.getResourceURL(this._props.imglocation || "./") + "/";

                    var i18n = this._i18n.get();
                    var defaultimg = this._makeImageUrl(this._props.defaultimg);
                    this._ui = new CopyrightWidget({
                        "position": this._props.position,
                        "defaultimg": defaultimg,
                        "i18n": i18n.ui
                    });
                    this.connect("mapModel", this._mapModel, "onModelStructureChanged",
                        "_onModelNodeStateChangedHandler");
                    this.connect("mapModel", this._mapModel, "onModelNodeStateChanged",
                        "_onModelNodeStateChangedHandler");
                    if (this._secondMapModel) {
                        this.connect("mapModel", this._secondMapModel, "onModelStructureChanged",
                            "_onModelNodeStateChangedHandler");
                        this.connect("mapModel", this._secondMapModel, "onModelNodeStateChanged",
                            "_onModelNodeStateChangedHandler");
                    }
                },

                createInstance: function () {
                    return this._ui;
                },
                deactivate: function () {
                    console.debug("Copyright.deactivate");
                    this.disconnect();
                    if (this._ui) {
                        this._ui.destroyRecursive();
                        this._ui = null;
                    }

                    this._mapModel = null;

                    this._ui = null;
                    this._props = null;
                    this._configLocation = null;
                },

                toString: function () {
                    return "Copyright";
                },

                _onModelNodeStateChangedHandler: function (evt) {
                    if (this._timer) {
                        return;
                    }
                    this._timer = setTimeout(d_lang.hitch(this, function () {
                        var oldImages = this.copyrightImages;
                        this.copyrightImages = [];
                        this._addCopyrightImages(evt);
                        if (this.copyrightImages.length) {
                            this._removeDuplicateCopyrights();

                            //Compare old and new?!
                            var update = false;
                            if (oldImages && oldImages.length) {
                                d_array.forEach(oldImages, function (im) {
                                    if (ct_array.arrayFirstIndexOf(this.copyrightImages,
                                        {copyright: im.copyright}) < 0) {
                                        update = true;
                                    }
                                }, this);
                            } else {
                                update = true;
                            }

                            if (update) {
                                this._ui.addCopyrightImages(this.copyrightImages, true);
                            }

                        } else {
                            this._ui.clearCopyright();
                        }
                        this._copyrightText.setText(this.copyrightImages);
                        this._eventService.postEvent("copyrights/changed", {
                            copyrights: this.copyrightImages
                        });
                        this._timer = null;
                    }), 750);
                },

                _addCopyrightImages: function (evt) {
                    var enabledBaseLayers = this._getEnabledBaseLayers();
                    this._addCopyrightImageForBaselayer(enabledBaseLayers);
                    var enabledOpLayers = this._getEnabledOperationalLayers();
                    this._addCopyrightImageForOplayer(enabledOpLayers);
                },

                _resolveImageUrl: function (copyrightImage) {
                    if (copyrightImage) {
                        var imgUri = copyrightImage.img || "";
                        if (imgUri !== "") {
                            imgUri = this._makeImageUrl(imgUri);
                            copyrightImage.img = imgUri;
                        }
                    }
                    return copyrightImage;
                },

                _addCopyrightImageForBaselayer: function (enabledBaseLayers) {
                    if (enabledBaseLayers) {
                        d_array.forEach(enabledBaseLayers, function (enabledBaseLayer) {
                            if (enabledBaseLayer && enabledBaseLayer.service && enabledBaseLayer.service.serviceType && (enabledBaseLayer.service.serviceType === "WMTS" || enabledBaseLayer.service.serviceType === "NAVTEQ" )) {
                                this._checkServiceCopyrights(enabledBaseLayer.service);
                            } else {
                                this._checkWMSService(enabledBaseLayer.service, enabledBaseLayer.children);
                            }
                        }, this);
                    }
                },

                _checkWMSService: function (
                    service,
                    layers
                    ) {
                    if (!service) {
                        return;
                    }
                    var serviceUrl = service.serviceUrl;
                    var serviceId = service.get("uniqueId").toString();
                    for (var i = 0; i < layers.length; i++) {
                        var layer = layers[i];
                        for (var j = 0; j < this._props.images.length; j++) {
                            var image = this._props.images[j];
                            if (!image.enabled.layerid) {
                                if (image.enabled.serviceurl &&
                                    ct_array.arrayFirstIndexOf(image.enabled.serviceurl, serviceUrl) > -1 &&
                                    image.enabled.serviceid &&
                                    image.enabled.serviceid === serviceId) {
                                    this._addImageToCopyrightImages(image);
                                }
                            }
                            else {
                                if (image.enabled.serviceurl &&
                                    ct_array.arrayFirstIndexOf(image.enabled.serviceurl, serviceUrl) > -1 &&
                                    image.enabled.serviceid &&
                                    image.enabled.serviceid === serviceId &&
                                    image.enabled.layerid && ct_array.arrayFirstIndexOf(image.enabled.layerid,
                                    layer.layer.layerId) > -1) {
                                    this._addImageToCopyrightImages(image);
                                }
                            }
                        }
                    }
                },

                _checkServiceCopyrights: function (service) {
                    var serviceUrl = service.serviceUrl;
                    var serviceId = service.get("uniqueId").toString();
                    for (var i = 0; i < this._props.images.length; i++) {
                        var image = this._props.images[i];
                        if (image.enabled.serviceurl &&
                            ct_array.arrayFirstIndexOf(image.enabled.serviceurl, serviceUrl) > -1 &&
                            image.enabled.serviceid &&
                            image.enabled.serviceid === serviceId) {
                            this._addImageToCopyrightImages(image);
                        }
                    }
                },

                _removeDuplicateCopyrights: function () {
                    var tmp = [];
                    var unifiedArray = d_array.filter(this.copyrightImages, function (elem) {
                        if (ct_array.arrayFirstIndexOf(tmp, elem.copyright) === -1) {
                            tmp.push(elem.copyright);
                            return elem;
                        }
                    }, this);
                    this.copyrightImages = unifiedArray;
                },

                _addCopyrightImageForOplayer: function (enabledLayers) {
                    if (enabledLayers && enabledLayers.length) {
                        d_array.forEach(enabledLayers, d_lang.hitch(this, function (layer) {
                            var serviceUrl = layer.service.serviceUrl;
                            var serviceId = layer.service.get("uniqueId").toString();
                            var result;
                            for (var i = 0; i < this._props.images.length; i++) {
                                var image = this._props.images[i];
                                if (!image.enabled.layerid) {
                                    if (image.enabled.serviceurl &&
                                        ct_array.arrayFirstIndexOf(image.enabled.serviceurl, serviceUrl) > -1 &&
                                        image.enabled.serviceid &&
                                        image.enabled.serviceid === serviceId) {
                                        result = image;
                                    }
                                }
                                else {
                                    if (image.enabled.serviceurl &&
                                        ct_array.arrayFirstIndexOf(image.enabled.serviceurl, serviceUrl) > -1 &&
                                        image.enabled.serviceid &&
                                        image.enabled.serviceid === serviceId &&
                                        image.enabled.layerid && ct_array.arrayFirstIndexOf(image.enabled.layerid,
                                        layer.id) > -1) {
                                        this._addImageToCopyrightImages(image);
                                        result = null;
                                        break;
                                    }
                                }
                            }
                            if (result) {
                                this._addImageToCopyrightImages(result);
                            }
                        }));
                    }
                },

                _addImageToCopyrightImages: function (image) {
                    if (this.copyrightImages && ct_array.arrayFirstIndexOf(this.copyrightImages, image) < 0) {
                        image = this._resolveImageUrl(image);
                        this.copyrightImages.push(image);
                    }
                },
                _getCopyrightImageWithBaseLyer: function (enabledBaseLayer) {
                    var copyrightImage = [];
                    if (enabledBaseLayer) {
                        d_array.forEach(this._props.images, d_lang.hitch(this, function (imge) {
                            if (imge.enabled.baselayer && imge.enabled.baselayer === enabledBaseLayer.id) {
                                if (imge.enabled.operationallayer && imge.enabled.operationallayer !== "") {
                                    if (this._isEnabledLayer(imge.enabled.operationallayer)) {
                                        //                                        copyrightImage = imge;
                                        //this._addCopyrightImge(copyrightImage);
                                        this.copyrightImges.push(imge);
                                    }
                                }
                                if (imge.enabled.serviceurl && imge.enabled.serviceurl !== "") {
                                    if (this._isEnabledService(imge.enabled.serviceurl)) {
                                        this.copyrightImges.push(imge);
                                        //                                        copyrightImage = imge;
                                        //this._addCopyrightImge(copyrightImage);
                                    }
                                }
                            }
                        }));
                    }

                    //                    return copyrightImage;
                },

                _getCopyrightImageWithOutBaseLyer: function () {
                    var copyrightImage = null;
                    d_array.forEach(this._props.images, d_lang.hitch(this, function (imge) {
                        if (!imge.enabled.baselayer || imge.enabled.baselayer === "") {
                            if (imge.enabled.operationallayer && imge.enabled.operationallayer !== "") {
                                if (this._isEnabledLayer(imge.enabled.operationallayer)) {
                                    this.copyrightImges.push(imge);
                                    //                                    copyrightImage = imge;
                                    //                                    this._addCopyrightImge(copyrightImage);
                                }
                            } else if (imge.enabled.serviceurl && imge.enabled.serviceurl !== "") {
                                if (this._isEnabledService(imge.enabled.serviceurl)) {
                                    this.copyrightImges.push(imge);
                                    //                                    copyrightImage = imge;
                                    //                                    this._addCopyrightImge(copyrightImage);
                                }
                            }
                        }
                    }));

                    //                    return copyrightImage;
                },

                _getCopyrightImageOnlyBaseLyer: function (enabledBaseLayer) {
                    var copyrightImage = null;
                    if (enabledBaseLayer) {
                        d_array.forEach(this._props.images, d_lang.hitch(this, function (imge) {
                            if (imge.enabled.baselayer &&
                                imge.enabled.baselayer === enabledBaseLayer.id &&
                                (!imge.enabled.operationallayer || imge.enabled.operationallayer === "") &&
                                (!imge.enabled.serviceurl || imge.enabled.serviceurl === "")) {
                                //                                copyrightImage = imge;
                                //                                this._addCopyrightImge(copyrightImage);
                                this.copyrightImges.push(imge);
                            }
                        }));
                    }

                    return copyrightImage;
                },

                _getEnabledOperationalLayers: function () {
                    var op = this._mapModel.getEnabledServiceNodes(this._mapModel.getOperationalLayer());
                    if (this._secondMapModel) {
                        op = op.concat(this._secondMapModel.getEnabledServiceNodes(this._secondMapModel.getOperationalLayer()));
                    }
                    return op;
                },

                _getEnabledBaseLayers: function () {
                    var baseLayers = this._mapModel.getBaseLayer();
                    var enabledBaseLayers = [];
                    d_array.forEach(baseLayers.children, d_lang.hitch(this, function (baseLayer) {
                            if (baseLayer.enabled) {
                                enabledBaseLayers.push(baseLayer);
                            }
                        }
                    ));
                    if (this._secondMapModel) {
                        baseLayers = this._secondMapModel.getBaseLayer();
                        d_array.forEach(baseLayers.children, d_lang.hitch(this, function (baseLayer) {
                                if (baseLayer.enabled) {
                                    enabledBaseLayers.push(baseLayer);
                                }
                            }
                        ));
                    }

                    return enabledBaseLayers;
                },

                _isEnabledLayer: function (layerid) {
                    var operationallayer = this._mapModel.getNodeById(layerid);
                    return (operationallayer && operationallayer.id === layerid && operationallayer.enabled);
                },

                _isEnabledService: function (serviceurl) {
                    var enabled = false;
                    if (serviceurl instanceof Array) {
                        d_array.forEach(serviceurl, function (url) {
                            var en = this._isEnabledService(url);
                            if (!enabled) {
                                enabled = en;
                            }
                        }, this);
                    } else {
                        d_array.forEach(this._mapModel.getEnabledServiceNodes(),
                            d_lang.hitch(this, function (serviceNode) {
                                if (serviceNode.service.serviceUrl.toUpperCase() === serviceurl.toUpperCase()) {
                                    enabled = true;
                                }
                            }));
                    }
                    return enabled;
                },

                _makeImageUrl: function (imageUrl) {
                    var imagePath = imageUrl;
                    if (imagePath && imagePath.toLocaleUpperCase().indexOf("HTTP://") !== 0) {
                        imagePath = this._configLocation + imagePath;
                    }
                    return imagePath;
                }

            });
    });