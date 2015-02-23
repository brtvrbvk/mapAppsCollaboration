define([
        "dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/json",
        "ct/Stateful"
    ],
    function (
        declare,
        d_lang,
        JSON,
        Stateful
        ) {
        return declare([Stateful], {

            activate: function () {

                if (!this.categories || !this.account) {
                    console.error("cannot init google analytics!");
                    return;
                }
                // Creates an initial ga() function.  The queued commands will be executed once analytics.js loads.
                var ga = window.ga = window.ga || function () {
                    (window.ga.q = window.ga.q || []).push(arguments);
                }
                var opts = {};
                if (this.localUse === "true") {
                    //just for development, enables sending data from different domains
                    opts.cookieDomain = 'none';
                }

                ga('create', this.localUse === "true" ? this.devAccount : this.account, opts);

                if (this.anonymizeIPs) {
                    ga('set', 'anonymizeIp', true);
                }

                ga('send', 'pageview');

                this._gaActive = true;
                (function () {
                    window.GoogleAnalyticsObject = "ga"; // Acts as a pointer to support renaming.

                    // Sets the time (as an integer) this tag was executed.  Used for timing hits.
                    window.ga.l = 1 * new Date();

                    // Insert the script tag asynchronously.  Inserts above current tag to prevent blocking in
                    // addition to using the async attribute.
                    var a = document.createElement("script"),
                        m = document.getElementsByTagName("script")[0];
                    a.async = 1;
                    a.src = "//www.google-analytics.com/analytics.js";
                    m.parentNode.insertBefore(a, m);
                })();
            },

            trackEvent: function (event) {

                if (!event || !this._gaActive) {
                    return;
                }

                var type = event.getProperty("eventType");
                var value = event.getProperty("eventValue");
                var cat = event.getProperty("eventCategory");
                var cb = event.getProperty("eventCallback");
                var scope = event.getProperty("eventCallbackScope");

                if (d_lang.isObject(value)) {
                    //if we get an object we serialize it
                    value = JSON.stringify(value);
                }

                var category = this.categories[cat];
                if (category) {

                    if (category.eventTypes[type]) {
                        this._gaqTrackEvent(category.name, category.eventTypes[type], value, cb, scope);
                    } else {
                        this._gaqTrackEvent(category.name, type, value, cb, scope);
                    }

                } else {

                    this._gaqTrackEvent(cat, type, value, cb, scope);

                }

            },

            _gaqTrackEvent: function (
                category,
                action,
                label,
                callback,
                scope
                ) {

                var opts = {
                    'hitType': 'event',          // Required.
                    'eventCategory': category,   // Required.
                    'eventAction': action,      // Required.
                    'eventLabel': label
//                    'eventValue': 4
                };

                if (callback) {
                    opts.hitCallback = d_lang.hitch(scope || this, callback);
                }
                console.debug("Track event '" + category + ", " + action + ", " + label + "'");
                window.ga('send', opts);

            }
        });
    });