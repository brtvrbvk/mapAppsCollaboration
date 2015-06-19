/**
 * COPYRIGHT 2014 con terra GmbH Germany
 *
 * Created by fba on 28.02.14.
 */
define([
        "dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/_base/array",
        "dojo/json",
        "dojo/io-query",
        "ct/request",
        "ct/_when",
        "ct/array",
        "ct/Stateful"
    ],
    function (
        declare,
        d_lang,
        d_array,
        JSON,
        d_query,
        ct_request,
        ct_when,
        ct_array,
        Stateful
        ) {
        return declare([Stateful],
            {
                ignoreInResolving: true,

                constructor: function () {
                    this._persistables = [];
                },

                activate: function (componentContext) {

                },

                addPersistable: function (persistable) {
                    var persistables = this._persistables;
                    persistables[persistables.length] = persistable;
                    if (this.active) {
                        this._readState(this._state, persistable);
                    }
                },
                removePersistable: function (persistable) {
                    ct_array.arrayRemove(this._persistables, persistable);
                },

                encodeURLParameter: function () {
                    return {};
                },

                decodeURLParameter: function (urlObject) {
                    var id = urlObject && urlObject.id;
                    if (!id) {
                        return;
                    }
                    for (var attr in urlObject) {
                        if (ct_array.arrayFirstIndexOf(this.excludeSearchTerms, attr) !== -1) {
                            setTimeout(d_lang.hitch(this, "showNotificationWindow"), 2500);
                            return;
                        }
                    }
                    ct_when(ct_request.requestJSON({
                        url: this.target + "/" + id + ".json"
                    }), function (resp) {

                        this.setState(resp);

                    }, function (err) {
                        console.error(err);
                    }, this);
                },

                showNotificationWindow: function () {
                    var i18n = this._i18n.get().ui;
                    this._w = this._wm.createInfoDialogWindow({
                        message: i18n.multiParamMessage,
                        marginBox: {
                            w: 350,
                            h: 180
                        },
                        title: i18n.title,
                        showOk: true,
                        showCancel: false
                    });
                },

                _readState: function (
                    state,
                    persistable
                    ) {
//BartVerbeeck Bug29990                
                    if(persistable.decodeableProperty && persistable.decodeableProperty == "son")
                    if(persistable._mapModel && persistable._mapModel._layerTree){
                        persistable._mapModel._layerTree.children[1].removeChildren();
                        
                    }
                    if (persistable.read) {
                        try {
                            persistable.read(state);
                        } catch (exception) {
                            console.error("Error while decoding state", exception);
                        }
                    } else if (persistable.decodeURLParameter) {
                        try {
                            persistable.decodeURLParameter(state);
                        } catch (exception) {
                            console.error("Error while decoding state", exception);
                        }
                    }
                },

                setState: function (state) {
                    this._state = state;
                    this.active = true;
                    d_array.forEach(this._persistables, d_lang.partial(this._readState, this._state));
                },

                getState: function (opts) {

                    var state = {};

                    d_array.forEach(this._persistables, function (p) {
                        var params = {};
                        if (p.persist) {
                            params = p.persist(opts) || {};
                        } else if (p.encodeURLParameter) {
                            params = p.encodeURLParameter(opts) || {};
                        }
                        d_lang.mixin(state, params);
                    }, this);

                    return state;

                },

                storeState: function (opts) {

                    opts = opts || {};

                    var state = this.getState(opts);

                    if (!state.app) {
                        state.app = this._appCtx.getApplicationName();
                    }

                    if (opts.excludeApp) {
                        delete state.app;
                    }

                    console.debug("----Storing state to DB", state);

                    return ct_request.requestJSON({
                        url: this.target,
                        postData: JSON.stringify(state)
                    }, {
                        usePost: true
                    });

                },

                deactivate: function() {
                    this._w = null;
                }
            }
        )
    }
);