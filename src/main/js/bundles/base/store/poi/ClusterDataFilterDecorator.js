/**
 * COPYRIGHT 2012-2013 con terra GmbH Germany
 *
 * User: fba
 * Date: 05.11.13
 * Time: 12:52
 */
define([
        "dojo/_base/declare",
        "dojo/_base/array",
        "dojo/_base/Deferred",
        "ct/Stateful",
        "ct/_when"
    ],
    function (
        declare,
        d_array,
        Deferred,
        Stateful,
        ct_when
        ) {
        return declare([Stateful],
            {
                constructor: function () {

                },

                query: function (
                    q,
                    o
                    ) {

                    var d = new Deferred();
                    ct_when(this.store.query(q, o), function (resp) {

                        d.resolve(d_array.filter(resp, function (item) {
                            if (item.isCluster) {
                                return null;
                            }
                            return item;
                        }));

                    }, function (err) {
                        d.reject(err);
                    }, this);

                    return d;

                },

                getMetadata: function () {
                    return this.store.getMetadata();
                },

                get: function (
                    id,
                    directives
                    ) {
                    return this.store.get(id, directives);
                },

                getIdentity: function (object) {
                    return this.store.getIdentity(object);
                },

                getIdProperty: function () {
                    return this.store.getIdProperty();
                }
            }
        )
    }
);