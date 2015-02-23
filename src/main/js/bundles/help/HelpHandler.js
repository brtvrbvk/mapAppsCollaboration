define([
        "dojo/_base/lang",
        "dojo/_base/declare",
        "ct/Stateful"
    ],
    function (
        d_lang,
        declare,
        Stateful
        ) {
        /*
         * COPYRIGHT 2011-2012 con terra GmbH Germany
         */

        return declare(
            [Stateful],
            /**
             * @lends .prototype
             */
            {
                /**
                 * @constructor
                 */
                constructor: function () {

                },

                onHelpClick: function () {
                    // TODO perhaps create a mapApps window to diplay help in
                    window.open(this.helpUrl, "_blank");
                }

            });
    });