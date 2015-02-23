/**
 * COPYRIGHT 2014 con terra GmbH Germany
 *
 * Created by fba on 04.04.2014.
 */
define([
        "dojo/_base/declare",
        "ct/_Connect",
        "ct/Stateful"
    ],
    function (
        declare,
        Connect,
        Stateful
        ) {
        return declare([
                Connect,
                Stateful
            ],
            {

                constructor: function () {

                },

                onUpdate: function (evt) {
                },

                getItems: function () {
                    throw new Error("not implemented");
                }
            }
        )
    }
);