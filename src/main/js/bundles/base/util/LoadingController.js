/**
 * COPYRIGHT 2014 con terra GmbH Germany
 *
 * Created by fba on 11.08.2014.
 */
define([
        "dojo/_base/declare",
        "dojo/_base/lang",
        "ct/Stateful",
        "ct/_Connect",
        "ct/util/css"

    ],
    function (
        declare,
        d_lang,
        Stateful,
        _Connect,
        ct_css
        ) {
        return declare([
                Stateful,
                _Connect
            ],
            {
                constructor: function () {

                },

                activate: function () {
                    this._rootNode = this._appCtx.getApplicationRootNode();
                },

                showLoading: function () {
                    if (this._timer) {
                        clearTimeout(this._timer);
                    }
                    this._timer = setTimeout(d_lang.hitch(this, function () {

                        this._timer = null;
                        this.counter = 0;
                        this.hideLoading();

                    }), 12000);
                    if (!this.counter) {
                        ct_css.toggleClass(this._rootNode, this.loadClass, true);
                    }
                    ++this.counter;
                },

                hideLoading: function () {
                    var counter = this.counter;
                    --counter;
                    this.counter = counter = Math.max(counter, 0);
                    if (!counter) {
                        ct_css.toggleClass(this._rootNode, this.loadClass, false);
                    }
                },

                deactivate: function () {

                }
            }
        );
    }
);