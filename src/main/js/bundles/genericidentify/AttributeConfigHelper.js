define([
        "dojo/_base/declare",
        "dojo/_base/array",
        "dojo/_base/lang",
        "ct/_lang",
        "ct/array"
    ],
    function (
        declare,
        d_array,
        d_lang,
        ct_lang,
        ct_array
        ) {
        /*
         * COPYRIGHT 2012 con terra GmbH Germany
         */
        return declare([],
            {
                constructor: function (args) {
                },

                mergeAttributes: function (
                    appConfig,
                    dbConfig
                    ) {
                    if (!appConfig && dbConfig) {
                        return dbConfig;
                    }
                    if (!dbConfig && appConfig) {
                        return appConfig;
                    }
                    if (!appConfig && !dbConfig) {
                        return {};
                    } else {
                        // appConfig overwrite dbConfig
                        var tmpDbConfig = d_lang.clone(dbConfig);
                        d_array.forEach(appConfig.extraInfo, function (info) {
                            var found;
                            d_array.some(tmpDbConfig.extraInfo, function (
                                item,
                                index
                                ) {
                                if (item.title === info.title) {
                                    found = index;
                                    return true;
                                }
                            }, this);
                            if (found) {
                                tmpDbConfig.extraInfo.splice(found, 1);
                            }
                            tmpDbConfig.extraInfo.push(info);
                        }, this);

                        var dbConfigAttrs = (tmpDbConfig.ignoreAttributes !== "" && tmpDbConfig.ignoreAttributes) ? tmpDbConfig.ignoreAttributes.split(";") : [];
                        var appConfigAttrs = (appConfig.ignoreAttributes !== "" && appConfig.ignoreAttributes) ? appConfig.ignoreAttributes.split(";") : [];
                        d_array.forEach(appConfigAttrs, function (attr) {
                            var exist = ct_array.arraySearchFirst(dbConfigAttrs, attr);
                            if (!exist) {
                                dbConfigAttrs.push(attr);
                            }
                        }, this);
                        tmpDbConfig.ignoreAttributes = dbConfigAttrs.join(";");

                        d_array.forEach(appConfig.mapping, function (mapping) {
                            var found;
                            d_array.some(tmpDbConfig.mapping, function (
                                item,
                                index
                                ) {
                                if (item.attributeName === mapping.attributeName) {
                                    found = index;
                                    return true;
                                }
                            }, this);
                            if (found) {
                                tmpDbConfig.mapping.splice(found, 1);
                            }
                            tmpDbConfig.mapping.push(mapping);
                        }, this);
                        return tmpDbConfig;
                    }
                },

                getMergedOtherAttributes: function (
                    generalMappingConfig,
                    layerMappingConfig
                    ) {
                    // compare each attributes in layerMapping to generalMapping
                    var layerMapping = layerMappingConfig.mapping;
                    var tmpGeneralMapping = d_lang.clone(generalMappingConfig.mapping);
                    if (layerMapping && tmpGeneralMapping) {
                        this._replaceSingleMappingsInList(tmpGeneralMapping, layerMapping);
                    }

                    var otherAttributes = [];
                    if (tmpGeneralMapping.length > 0) {
                        d_array.forEach(tmpGeneralMapping, function (mapping) {
                            if (mapping.serviceId && mapping.serviceId !== "" && mapping.layerId && mapping.layerId !== "") {
                                var id = mapping.serviceId + "/" + mapping.layerId;
                                var obj = ct_array.arraySearchFirst(otherAttributes, {
                                    id: id
                                });
                                if (obj) {
                                    obj.attributes.push(mapping.attributeName);
                                } else {
                                    obj = {
                                        id: id,
                                        attributes: [mapping.attributeName]
                                    };
                                    otherAttributes.push(obj);
                                }
                            }
                        }, this);
                    }

                    return {
                        mapping: otherAttributes
                    };
                },

                _replaceSingleMappingsInList: function (
                    oldMappingList,
                    newMappingList
                    ) {
                    d_array.forEach(newMappingList, function (mapping) {
                        var found;
                        d_array.some(oldMappingList, function (
                            item,
                            index
                            ) {
                            if (item.attributeName === mapping.attributeName) {
                                found = index;
                                return true;
                            }
                        }, this);
                        if (found) {
                            oldMappingList.splice(found, 1);
                        }
                        oldMappingList.push(mapping);
                    }, this);
                }

            });
    });