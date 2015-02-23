/**
 * COPYRIGHT 2012-2013 con terra GmbH Germany
 *
 * User: fba
 * Date: 23.10.13
 * Time: 08:32
 */
define([
        "dojo/_base/declare",
        "./_Store",
        "ct/_lang"
    ],
    function (
        declare,
        _Store,
        ct_lang
        ) {
        return declare([_Store],
            {
                constructor: function () {

                },

                activate: function () {
                    ct_lang.hasProp(this, "geolocatorUrlProvider", true,
                        "Reference 'geolocatorUrlProvider' is mandatory!");
                    this.url = this.geolocatorUrlProvider.get(this.searchType);
                    ct_lang.hasProp(this, "url", true, "Property 'url' is mandatory!");
                    this.inherited(arguments);
                }
            }
        )
    }
);