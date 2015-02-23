/*
 * COPYRIGHT 2011-2012 con terra GmbH Germany
 */
/**
 * @fileOverview
 * @author fba
 */
define([
        ".",
        "dojo/_base/declare",
        "dojo/_base/window",
        "dojo/_base/connect",
        "dojo/_base/event",
        "ct/Stateful"
    ],
    function (
        _moduleRoot,
        declare,
        d_win,
        d_connect,
        d_domevent,
        Stateful
        ) {
        return _moduleRoot.Version = declare([Stateful], {

            activate: function () {
                var doc = d_win.doc;
                if (doc) {
                    this._keyEvtHandle = d_connect.connect(doc, "onkeydown", this, "_onKeyPress");
                }
            },

            _onKeyPress: function (evt) {

                if (evt.ctrlKey && evt.shiftKey && (evt.keyCode === this.shortCutKey)) {
                    d_domevent.stop(evt);
                    if (!this._uiVisible) {
                        if (this._uiWindow) {
                            this._uiWindow.show();
                        } else {
                            this._createUI();
                        }
                    } else {
                        this._uiWindow.close();
                        this._uiVisible = false;
                    }
                }

            },

            _createUI: function () {
                this._uiWindow = this._windowManager.createModalWindow({
                    content: this.version,
                    title: this._i18n.get().title,
                    closable: true,
                    hideOnClose: true
                });
                d_connect.connect(this._uiWindow, "onClose", this, this._destroyUI);
                this._uiWindow.show();
                this._uiVisible = true;
            },

            _destroyUI: function () {
                this._uiWindow = null;
                this._uiVisible = false;
            }

        });
    });
