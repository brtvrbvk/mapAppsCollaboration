/**
 * COPYRIGHT 2012-2013 con terra GmbH Germany
 *
 * User: fba
 * Date: 27.09.13
 * Time: 15:04
 */
define([
        "dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/_base/array",
        "ct/array",
        "./StorageKeys"
    ],
    function (
        declare,
        d_lang,
        d_array,
        ct_array,
        StorageKeys
        ) {
        return declare([],
            {
                constructor: function () {

                },

                activate: function (componentContext) {

                    this.appsToRestore = this._properties.appsToRestore || [];
                    this.parameterWhitelist = this._properties.parameterWhitelist || [];

                    this._bundleCtx = componentContext.getBundleContext();

                    if (!jStorage || !jStorage.storageAvailable()) {

                        console.warn("No storage available, not restoring states!");

                    } else {

                        console.debug("Found storage...");
                        console.debug("----Using storage engine: " + jStorage.currentBackend());

                        var state = jStorage.get(StorageKeys.state);
                        var urlState = this._bundleCtx.getProperty("Application-QueryParams");
                        if (state && (urlState.restoreApp || urlState.restore)) {

                            if (this._restoreComplete(urlState.app, state.app, urlState.restoreApp)) {

                                console.debug("----Got state on startup: ", state);
                                this.stateStorer.setState(state);

                            } else {
                                var param;
                                for (param in state) {

                                    if (ct_array.arrayFirstIndexOf(this.parameterWhitelist, param) === -1) {
                                        delete state[param];
                                    }

                                }
                                this.stateStorer.setState(state);
                            }

                        }

                    }

                },

                _restoreComplete: function (
                    urlApp,
                    stateApp,
                    restoreApp
                    ) {

                    if (urlApp === stateApp && !restoreApp) {
                        return false;
                    }

                    if (this.appsToRestore.length === 0) {
                        return false;
                    }

                    return ( (ct_array.arrayFirstIndexOf(this.appsToRestore,
                        urlApp) > -1) && (ct_array.arrayFirstIndexOf(this.appsToRestore,
                        stateApp) > -1) );

                }

            }
        );
    }
);