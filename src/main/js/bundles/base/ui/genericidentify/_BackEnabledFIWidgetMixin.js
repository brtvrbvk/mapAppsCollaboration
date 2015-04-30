/**
 * COPYRIGHT 2014 con terra GmbH Germany
 *
 * Created by fba on 23.07.2014.
 */
define([
        "dojo/_base/declare",
        "ct/util/css"
    ],
    function (
        declare,
        ct_css
        ) {
        return declare([],
            {
                constructor: function () {

                },

                postCreate: function () {
                    this.inherited(arguments);
                    if (this.backEnabled) {
                        ct_css.switchVisibility(this.backButton.domNode, true);
                    }
                },

                _backClicked: function () {
                    this.eventService.postEvent("agiv/genericidentify/SHOW_PREVIOUS", {
                    });
                }
            }
        );
    }
);