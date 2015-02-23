/**
 * COPYRIGHT 2012-2013 con terra GmbH Germany
 *
 * User: fba
 * Date: 27.09.13
 * Time: 08:45
 */
define([
        "dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/_base/array",
        "dojo/io-query",
        "./StorageKeys"
    ],
    function (
        declare,
        d_lang,
        d_array,
        d_query,
        StorageKeys
        ) {
        return declare([],
            {

                _storageDelay: 1000,

                _expiresIn: 1000 * 60 * 60 * 24,

                constructor: function () {

                },

                activate: function () {

                    if (!jStorage || !jStorage.storageAvailable()) {

                        console.warn("No storage available, not storing states!");

                    }

                },

                storeState: function () {

                    if (this._timeout) {

                        clearTimeout(this._timeout);
                        this._timeout = null;

                    }
                    this._timeout = setTimeout(d_lang.hitch(this, this._storeState), this._storageDelay);

                },

                _storeState: function () {

                    this._timeout = null;
                    var state = this.stateStorer.getState();

                    //ignore some parameters
                    delete state.addServices;
                    delete state.addDatasets;

                    state.app = this._appCtx.applicationName;

                    console.debug("----Storing state", state);
                    jStorage.set(StorageKeys.state, state, {TTL: this._expiresIn});

                }
            }
        )
    }
);