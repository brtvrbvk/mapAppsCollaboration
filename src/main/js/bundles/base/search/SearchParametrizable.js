/**
 * COPYRIGHT 2014 con terra GmbH Germany
 *
 * Created by fba on 10.07.2014.
 */
define([
        "dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/string",
        "ct/Stateful",
        "ct/_Connect",
        "ct/_when"
    ],
    function (
        declare,
        d_lang,
        d_string,
        Stateful,
        _Connect,
        ct_when
        ) {
        return declare([
                Stateful,
                _Connect
            ],
            {

                activate: function () {
                    //konfigurierbarer parameter
                    //als parametrizable beim parametermanager registrieren
                    //implement encode/decode
                    //delegieren an entsprechenden handler
                    this._i18n = this._i18n.get().ui;
                },

                encodeURLParameter: function () {
                },

                decodeURLParameter: function (urlObject) {
                    if (urlObject.id) {
                        return;
                    }
                    var searchObj = urlObject[this.searchTerm];
                    if (searchObj) {
                        if (d_lang.isArray(searchObj) && searchObj.length > 1) {
                            this._showNotificationWindow(this._i18n.errorMessage);
                            return;
                        }
                        ct_when(this._handler.triggerSearch(searchObj), function (result) {
                            if (result.length === 0) {
                                this._showNotificationWindow(d_string.substitute(this._i18n.notFoundMessage, {
                                    title: searchObj
                                }));
                                return;
                            }
                            console.log("Search parameter " + this.searchTerm + ":" + searchObj + " are decoded.")
                        }, this);
                    }
                },

                _showNotificationWindow: function(message) {
                    this.startupMessageBox.showNotificationWindow(message, this._i18n.title);
                },

                deactivate: function () {
                    this._w = null;
                }
            }
        );
    }
);