/**
 * COPYRIGHT 2012-2013 con terra GmbH Germany
 *
 * User: fba
 * Date: 22.01.14
 * Time: 11:12
 */
define([
        "dojo/_base/declare",
        "ct/ui/controls/dataview/DataViewController",
        "dojo/_base/array",
        "dojo/io/iframe"
    ],
    function (
        declare,
        DataViewController,
        d_array,
        iframe
        ) {
        return declare([DataViewController],
            {
                constructor: function () {

                },

                exportSelectedServiceConfigs: function () {

                    var model = this.viewmodel;
                    var props = this._properties;
                    var selectedIds = model.get("selectedIds");

                    d_array.forEach(selectedIds, function (id) {
                        window.open(props.exportTarget + id + ".json");
                    }, this);

                },

                exportAllServiceConfigs: function () {
                    var props = this._properties;
                    var logger = this.logger;
                    if (this.deferred) {
                        this.deferred.cancel();
                    }
                    this.deferred = iframe.send({
                        url: props.exportTarget + "export/all",
                        method: "GET"
                    }).then(function (data) {
                        // Do something
                        debugger;
                    }, function (err) {
                        logger.error({
                            message: "Export error " + evt.error
                        });
                    });
                }
            }
        )
    }
);