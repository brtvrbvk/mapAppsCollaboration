/**
 * COPYRIGHT 2014 con terra GmbH Germany
 *
 * Created by tfu on 26.08.2014.
 */
define([
        "dojo/_base/declare"
    ],
    function (declare) {
        return declare([],
            {
                KEY: "contact",
                NAME: "Contact",
                EMPTY_TYPE: [],
                DATAFORM_ELEMENT: [
                    {
                        "type": "checkbox",
                        "disabled": true,
                        "field": "print.contact",
                        "label": "Contactgegevens"
                    }
                ],

                constructor: function () {

                },

                _updatePrintInfo: function (evt) {

                    var hasContact = evt.getProperty("hasContact");
                    this.DATAFORM_ELEMENT[0].disabled = !hasContact;
                    this._eventService.postEvent("agiv/hik/UPDATE_DIALOG");

                },

                readPrintData: function () {
                    var w = this._contactWidget;
                    if (!w) {
                        return{};
                    }
                    var contact = w.get("content").contact;
                    return {
                        contact: [contact]
                    };
                }
            }
        );
    }
);