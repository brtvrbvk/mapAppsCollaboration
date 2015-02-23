/**
 * COPYRIGHT 2012-2013 con terra GmbH Germany
 *
 * User: fba
 * Date: 04.07.13
 * Time: 15:52
 */
define([
        "dojo/_base/lang",
        "dojo/_base/array",
        "dojo/keys",
        "dojo/number",
        "dojo/string",
        "base/search/SearchTopics",
        "dojo/_base/declare",
        "ct/Stateful",
        "ct/_Connect",
        "esri/geometry/jsonUtils"
    ],
    function (
        d_lang,
        d_array,
        d_keys,
        d_number,
        d_string,
        SearchTopics,
        declare,
        Stateful,
        Connect,
        e_geometryUtils,
        css
        ) {
        return declare([
                Stateful,
                Connect
            ],
            {

                _workercount: 0,

                constructor: function () {

                },

                activate: function () {
                    this.connect("widget", this.widget, "onValueChange", "_onValueChange");
                    this.connect("widget", this.widget, "onClear", "_onClear");
                    this.i18n = this._i18n.get();
                },

                deactivate: function () {
                    this.disconnect();
                },

                _closeWindow: function () {
                    this.widget.switchLoading(false);
                },

                _addHandlerWorker: function () {
                    this._workercount++;
                    this.widget.switchLoading(this._workercount);
                },

                _removeHandlerWorker: function () {
                    this._workercount--;
                    this._workercount = this._workercount < 0 ? 0 : this._workercount;
                    this.widget.switchLoading(this._workercount);
                    if (this._workercount === 0 && !this._gotResults && this._lastSearchValue && this._lastSearchValue.length > 2) {
                        this.widget.showTooltip(this.i18n.ui.noResult);
                    } else {
                        this.widget.hideTooltip();
                    }
                },

                _handleNewResult: function (evt) {
                    var resultset = evt && evt._properties.entries.resultset;
                    var results = resultset && resultset.results;

                    if (results && results.length > 0) {
                        this._gotResults = true;
                        this.widget.hideTooltip();
                    }
                    if (this._lastSearchValue && this._lastSearchValue.length <= 2) {
                        this.widget.hideTooltip();
                    }

                },

                _handleNewSearch: function () {

                    this.widget.hideTooltip();
                    this._gotResults = false;
                    if (this._goToFirstResult) {
                        this._gotResults = true;
                    }

                },

                _handleResultSelection: function (evt) {
                    var val = evt && evt._properties.entries.result,
                        silent = evt && evt._properties.entries.silent;
                    if (val && !silent) {
                        this.widget.hideTooltip();
                        this.widget.set("value", val.title || val.value);
                        this._workercount = 0;
                        this._removeHandlerWorker();
                    }
                    this._lastResultSelection = val;
                },

                _broadCast: function (
                    topic,
                    evt
                    ) {
                    console.debug("SearchWidgetController - post event - " + topic + " ", evt);
                    this.eventService.postEvent(topic, evt || {});
                },

                _onClear: function () {
                    this.widget.reset();
                    this.widget.hideTooltip();
                    this.widget.switchLoading(false);
                    this._broadCast(SearchTopics.CLOSE_WINDOW);
                    if (this.removeResultsOnClear) {
                        this._broadCast(SearchTopics.CLEAR_RESULT);
                    }
                },

                _onValueChange: function (evt) {
                    this._goToFirstResult = false;
                    if (this._timeout) {
                        clearTimeout(this._timeout);
                    }
                    var e = evt._evt,
                        val = evt && evt.newValue;

                    switch (e.keyCode) {
                        case d_keys.DOWN_ARROW:
                            //we need to focus the first elem in result list
                            this._broadCast(SearchTopics.FOCUS_FIRST, evt);
                            return;
                        case d_keys.ENTER:
                            var lastResult = this._lastResultSelection;
                            if (lastResult) {
                                if (lastResult.title === val || lastResult.value === val) {
                                    this._broadCast(SearchTopics.REHANDLE_RESULT, {
                                        result: lastResult
                                    });
                                    this._broadCast(SearchTopics.CLOSE_WINDOW);
                                    return;
                                }
                            }
                            this._goToFirstResult = true;
                            //we need to search
                            this._search(evt, true);
                            return;
                        case d_keys.ESCAPE:
                            //we need to hide the resultlist
                            this._broadCast(SearchTopics.CLOSE_WINDOW, evt);
                            return;
                    }

                    if (e.altKey || e.ctrlKey || (e.keyCode >= 9 && e.keyCode <= 40 && e.keyCode !== 16)) {
                        //nothing on shortcuts but proceed on shift
                        if (e.ctrlKey && (e.keyCode === 65 || e.keyCode === 67)) {
                            //break on markall or copy
                            return;
                        }
                        if (!(e.ctrlKey && e.keyCode === 86)) {
                            //proceed on paste
                        } else {
                            return;
                        }
                    }
                    if (!val || val === "") {
                        this._broadCast(SearchTopics.CLOSE_WINDOW, evt);
                        this.widget.hideTooltip();
                        return;
                    }
                    this._search(evt);
                },

                _search: function (
                    evt,
                    directly
                    ) {
                    console.debug("search for '" + evt.newValue + "' with old value '" + this._lastSearchValue + "'");
//                    if (evt.newValue===this._lastSearchValue) {
//                        //we don´t want to search twice
//                        this._broadCast(SearchTopics.OPEN_WINDOW,evt);
//                        return;
//                    }
                    if (directly) {
                        console.debug("--- search directly");
                        this._lastSearchValue = evt.newValue;
                        this._broadCast(SearchTopics.VALUE_CHANGE, evt);
                    } else {
                        console.debug("--- search with delay " + this.searchDelay + "ms");
                        this._timeout = setTimeout(d_lang.hitch(this, function () {
                            this._timeout = null;
                            this._lastSearchValue = evt.newValue;
                            this._broadCast(SearchTopics.VALUE_CHANGE, evt);
                        }), this.searchDelay);
                    }
                }
            }
        )
    }
);