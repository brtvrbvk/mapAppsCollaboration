/*
 * COPYRIGHT 2011-2012 con terra GmbH Germany
 */
define([
        "dojo/_base/declare",
        "resultcenter/ExportResultsCommand",
        "dojo/_base/array",
        "ct/array",
        "ct/_lang"
    ],
    function (
        declare,
        ExportResultsCommand,
        d_array,
        ct_array,
        ct_lang
        ) {

        var ExportRVVResultsCommand = declare([ExportResultsCommand], {

            _prepareEntries: function (
                entries,
                separator,
                undefinedValue,
                ignoreFields,
                metadata
                ) {
                var includeFields = this._properties.includeFields;
                var resultString = "";
                metadata = metadata || {};
                var fields = metadata.fields || [];
                d_array.forEach(entries, function (
                    entry,
                    index
                    ) {
                    if (index === 0) {
                        // write table headers
                        var cols = [];
                        ct_lang.forEachProp(entry, function (
                            prop,
                            name
                            ) {
                            if (ct_array.arraySearchFirst(includeFields, name)) {
                                d_array.some(includeFields, function (
                                    item,
                                    index
                                    ) {
                                    if (item === name) {
                                        var resolvedField = ct_array.arraySearchFirst(fields, {
                                            name: name
                                        });
                                        var resolvedName = resolvedField ? (resolvedField.title || resolvedField.name) : name;
                                        cols[index] = resolvedName;
                                        return true;
                                    }
                                });
                            }
                        });
                        d_array.forEach(cols, function (col) {
                            resultString += col + separator;
                        });
                        resultString += "\n";
                    }
                    var values = [];
                    ct_lang.forEachProp(entry, function (
                        prop,
                        name
                        ) {
                        if (ct_array.arraySearchFirst(includeFields, name)) {
                            d_array.some(includeFields, function (
                                item,
                                index
                                ) {
                                if (item === name) {
                                    var val = prop || undefinedValue || "";
                                    values[index] = val;
                                    return true;
                                }
                            });
                        }
                    });
                    d_array.forEach(values, function (val) {
                        resultString += val + separator;
                    });
                    resultString += "\n";
                });
                return resultString;
            }

        });

        return ExportRVVResultsCommand;
    });

