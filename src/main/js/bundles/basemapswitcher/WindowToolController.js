/**
 * COPYRIGHT 2014 con terra GmbH Germany
 *
 * Created by fba on 07.05.2014.
 */
define([
        "dojo/_base/declare",
        "ct/Stateful",
        "ct/_Connect"
    ],
    function (
        declare,
        Stateful,
        _Connect
        ) {
        return declare([
                Stateful,
                _Connect
            ],
            {
                constructor: function () {

                },

                handleSelection: function () {

                    this.tool.set("active", false);

                }
            }
        )
    }
);