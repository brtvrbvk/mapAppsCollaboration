/**
 * COPYRIGHT 2012-2013 con terra GmbH Germany
 *
 * User: fba
 * Date: 27.09.13
 * Time: 12:52
 */
define([
        "ct/request",
        "ct/_when"
    ],
    function (
        ct_request,
        ct_when
        ) {
        return {
            _getParam: function (param) {
                var pairs = this._query.split("&");
                for (var i = 0; i < pairs.length; i++) {

                    var p = pairs[i];
                    var key = p.split("=")[0];
                    if (key === param) {

                        return p.split("=")[1];

                    }

                }
                return null;
            },

            _checkStorage: function (Launcher) {

                if (jStorage && jStorage.storageAvailable()) {

                    var state = jStorage.get("AGIV_MAPVIEWER_STATE");

                    if (state && ( state.app === "Geopunt-kaart_app" || state.app === "Geopunt-kaart_pro_app" )) {

                        //check for URL parameter "restoreApp" to be true if we need to restore the app
                        //else we start the app from the resource
                        if (this._query.length > 0) {

                            if (this._getParam("restoreApp")) {

                                (new Launcher({
                                    configLocation: "builderapps",
                                    configOpts: {
                                        preventAppConfigCaching: true
                                    }
                                }).launchApp(state.app)).then(function () {

                                        if (window.parent && window.parent.postMessage) {
                                            window.parent.postMessage("LOADED",
                                                "*");
                                        }

                                    });
                                return true;
                            }

                        }

                    }

                }

                return false;

            },

            _launchApp: function (
                Launcher,
                appid
                ) {

                (new Launcher({
                    configLocation: "builderapps",
                    configOpts: {
                        preventAppConfigCaching: true
                    }
                }).launchApp(appid)).then(function () {

                        if (window.parent && window.parent.postMessage) {
                            window.parent.postMessage("LOADED", "*");
                        }

                    });

            },

            launch: function (
                Launcher,
                appid,
                applicationUrl
                ) {

                var query = this._query = window.location.href.split("?")[1];
                if (query.length > 0) {

                    if (query.indexOf("id=") > -1) {

                        //we need to fetch the state
                        var id = this._getParam("id");
                        ct_when(ct_request.requestJSON({
                            url: applicationUrl + "/resources/map/" + id + ".json"
                        }), function (resp) {

                            if (resp.app) {
                                this._launchApp(Launcher, resp.app);
                            } else {
                                this._launchApp(Launcher, appid);
                            }

                        }, function (err) {
                            console.error(err);
                            this._launchApp(Launcher, appid);
                        }, this);
                        return;

                    }
                }

                if (!this._checkStorage(Launcher)) {

                    this._launchApp(Launcher, appid);

                }

            }
        }
    }
);