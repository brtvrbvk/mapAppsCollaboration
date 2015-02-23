/**
 * COPYRIGHT 2012-2013 con terra GmbH Germany
 *
 * User: fba
 * Date: 16.05.13
 * Time: 08:47
 */
define([
        ".",
        "dojo/_base/declare",
        "dojo/_base/lang",
        "ct/array",
        "ct/_Connect"
    ],
    function (
        _moduleroot,
        declare,
        d_lang,
        ct_array,
        Connect
        ) {
        return _moduleroot.OnChangeHandler = declare([Connect],
            {
                topics: {
                    REMOVE_ALL_LAYERS: "ct/poi/builder/REMOVE_ALL_LAYERS"
                },

                constructor: function () {
                },

                activate: function () {
                    this.connect("id", this._builderController,
                        "updateConfig", function (evt) {
                            console.debug("OnChangeHandler: " + this.topics.REMOVE_ALL_LAYERS);
                            this._eventService.postEvent(this.topics.REMOVE_ALL_LAYERS,
                                evt);
                        });
                },

                deactivate: function () {
                    this.disconnect();
                }
            }
        )
    });