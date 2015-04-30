/**
 * COPYRIGHT 2012-2013 con terra GmbH Germany
 *
 * User: fba
 * Date: 11.02.14
 * Time: 09:44
 */
define([
        "dojo/_base/declare",
        "ct/Stateful",
        "./ImageSelectorWidget"
    ],
    function (
        declare,
        Stateful,
        ImageSelectorWidget
        ) {
        return declare([Stateful],
            {
                constructor: function () {

                },

                createInstance: function () {
                    return new ImageSelectorWidget({
                    });
                }
            }
        )
    }
);