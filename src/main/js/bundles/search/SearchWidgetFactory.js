/**
 * COPYRIGHT 2012-2013 con terra GmbH Germany
 *
 * User: fba
 * Date: 04.07.13
 * Time: 15:50
 */
define([
        "dojo/_base/declare",
        "ct/Stateful",
        "./SearchWidget"
    ],
    function (
        declare,
        Stateful,
        SearchWidget
        ) {
        return declare([Stateful],
            {
                constructor: function () {

                },

                activate: function () {
                    this.i18n = this._i18n.get();
                    this.inst = new SearchWidget({
                        eventService: this.eventService,
                        i18n: this.i18n
                    });
                },

                createInstance: function () {
                    return this.inst;
                },

                destroyInstance: function (inst) {
                    inst.destroyRecursive();
                    inst = null;
                }
            }
        )
    }
);