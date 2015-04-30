/**
 * COPYRIGHT 2012-2013 con terra GmbH Germany
 *
 * User: fba
 * Date: 09.01.14
 * Time: 14:14
 */
define([
        "dojo/_base/declare",
        "ct/Stateful",
        "./LoadServiceWidget"
    ],
    function (
        declare,
        Stateful,
        LoadServiceWidget
        ) {
        return declare([Stateful],
            {
                constructor: function () {

                },

                activate: function () {

                },

                destroyInstance: function (ins) {

                    ins.destroy();

                },

                createInstance: function () {

                    return new LoadServiceWidget({
                        i18n: this._i18n.get(),
                        dataLink: this.dataLink
                    });

                }
            }
        );
    }
);