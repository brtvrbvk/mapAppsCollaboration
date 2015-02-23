define([
        "dojo/_base/lang",
        "dojo/_base/declare",
        "dojo/_base/array",
        "ct/array",
        "ct/_Connect",
        "./CopyrightTextWidget",
        "."
    ],
    function (
        d_lang,
        declare,
        d_array,
        ct_array,
        _Connect,
        CopyrightTextWidget,
        _moduleRoot
        ) {
        /*
         * COPYRIGHT 2011-2012 con terra GmbH Germany
         */
        /**
         * @fileOverview
         * @author gli
         */
        return _moduleRoot.CopyrightText = declare(
            [_Connect],
            {
                constructor: function () {
                    this._ui = null;
                    this._props = null;
                    this._configLocation = null;
                },

                activate: function () {
                    this._props = this._properties || {};
                    this._ui = new CopyrightTextWidget();
                },

                createInstance: function () {
                    return this._ui;
                }
            });
    });