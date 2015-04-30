/**
 * COPYRIGHT 2015 con terra GmbH Germany
 *
 * Created by fba on 08.01.2015.
 */
define([
        "dojo/_base/declare",
        "ct/store/RQLStore",
        "ct/request"
    ],
    function (
        declare,
        RQLStore,
        ct_request
        ) {
        return declare([RQLStore],
            {
                constructor: function () {
                    this.target = ct_request.getProxiedUrl(this.target, true);
                }
            }
        );
    }
);