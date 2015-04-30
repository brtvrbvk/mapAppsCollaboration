/**
 * COPYRIGHT 2012-2013 con terra GmbH Germany
 *
 * User: fba
 * Date: 09.01.14
 * Time: 13:39
 */
define([
        "dojo/_base/declare",
        "dojo/store/Memory"
    ],
    function (
        declare,
        Memory
        ) {
        return declare([Memory],
            {

                constructor: function () {

                },

                getChildren: function (
                    parent,
                    options
                    ) {
                    return this.query({PARENT_LAYER_ID: parent.ID}, options);
                },
                mayHaveChildren: function (parent) {
                    return parent.SUB_LAYER_IDS !== undefined;
                }
//                query: function(query, options){
//                    var def = new Deferred();
//                    var immediateResults = this.queryEngine(query, options)(this.data);
//                    setTimeout(function(){
//                        def.resolve(immediateResults);
//                    }, 200);
//                    var results = QueryResults(def.promise);
//                    return results;
//                }
            }
        )
    }
);