/**
 * COPYRIGHT 2014 con terra GmbH Germany
 *
 * Created by tfu on 04.08.2014.
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

                activate: function () {
                    // http://robertnyman.com/roblab/javascript-remove-tags.htm
                    // ? matches the preceding character 0 or 1 time.
                    // [^>] matches negated or complemented character set.
                    // + matches the preceding character 1 or more times.
                    // $ matches end of input.
                    var title = this.appCtx.applicationProperties.title;
                    this.appCtx.applicationProperties.title = title.replace(/<\/?[^>]+(>|$)/g, "");
                },

                deactivate: function () {

                }
            }
        );
    }
);