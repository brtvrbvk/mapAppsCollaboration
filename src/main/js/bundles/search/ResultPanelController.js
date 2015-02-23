/**
 * COPYRIGHT 2012-2013 con terra GmbH Germany
 *
 * User: fba
 * Date: 04.07.13
 * Time: 17:53
 */
define([
        "dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/_base/array",
        "dojo/dom-geometry",
        "dojo/regexp",
        "ct/Stateful",
        "ct/_Connect",
        "./ResultListContainerWidget",
        "./ItemWidget"
    ],
    function (
        declare,
        d_lang,
        d_array,
        d_domgeom,
        d_regexp,
        Stateful,
        Connect,
        ResultListContainerWidget,
        ItemWidget
        ) {
        return declare([
                Stateful,
                Connect
            ],
            {

                highlightMatch: true,
                ignoreCase: true,
                queryExpr: "*${0}",

                constructor: function () {

                },

                activate: function () {
                    this.i18n = this._i18n.get();
                    this._results = {};
                },

                _closeWindow: function () {
                    this.resultAttachWidget.hide();
                    if (this._resultwidget && this._resultwidget.hasChildren()) {
                        //clear widget
                        d_array.forEach(this._addedResults, function (r) {
                            this._resultwidget.removeChild(r);
                            r.destroyRecursive();
                        }, this);
                        this._addedResults = [];
                    }
                    this._acceptNewResults = false;
                },

                _openWindow: function () {
                    this.resultAttachWidget.show();
                },

                _focusFirstChild: function () {
                    this._resultHasKeyFocus = true;
                    if (this._isFirstChildFocused) {
                        //first child will be selected dummywise
                        this._resultwidget.focusSecondChild();
                    } else {
                        this._resultwidget.focusFirstChild()
                    }
                },

                _focusFirstChildDummy: function () {
                    this._isFirstChildFocused = this._resultwidget.dummyFocusFirstChild();
                },

                _addResultset: function (resultset) {
                    this._results[resultset.type] = resultset;
                    if (resultset.results && resultset.results.length > 0) {

                        this._isFirstChildFocused = false;

                        if (this._resultwidget.hasChildren()) {
                            //clear widget
                            d_array.forEach(this._addedResults, function (r) {
                                this._resultwidget.removeChild(r);
                                r.destroyRecursive();
                            }, this);
                            this._addedResults = [];
                        }

                        //order results
                        var tmplist = [];
                        for (var k in this._results) {
                            tmplist[this._results[k].priority] = this._results[k];
                        }

                        //create widgets
                        d_array.forEach(tmplist, function (result) {
                            if (!result) {
                                //we don´t have a result for this index right now
                                return;
                            }
                            var splitter = new ItemWidget({
                                label: result.typeLabel || "&nbsp;",
                                focusable: false
                            });
                            this._addedResults.push(splitter);
                            this._resultwidget.addChild(splitter);

                            d_array.forEach(result.results, function (item) {
                                var title = item.title;
                                item.onSelectCallback = result.onSelectCallback;
                                var widget = new ItemWidget({
                                    label: this._doHighlight(title,
                                        result.query),
                                    itemId: item.id,
                                    item: item,
                                    iconClass: item.iconClass || "dijitNoIcon",
                                    additionalClass: item.additionalClass || ""
                                });
                                this._addedResults.push(widget);
                                this._resultwidget.addChild(widget);
                            }, this);

                        }, this);

                        if (!this._isFirstChildFocused) {
                            setTimeout(d_lang.hitch(this, function () {
                                this._focusFirstChildDummy();
                            }), 300);
                        }

                    }
                },

                _doHighlight: function (
                    resultItemText, // The result item text
                    searchText  // the search text
                    ) {
                    if (!resultItemText || !this.highlightMatch) {
                        return resultItemText;
                    }
                    var regExp = this._buildRegularExpressionForKeywords(searchText);

                    return resultItemText.replace(
                        regExp,
                        '<span class="dijitComboBoxHighlightMatch">$&</span>'
                    );
                },

                _buildRegularExpressionForKeywords: function (searchText) {
                    // Add (g)lobal modifier when this.highlightMatch == "all" and (i)gnorecase when this.ignoreCase == true
                    var modifiers = (this.ignoreCase ? "i" : "") + (this.highlightMatch ? "g" : ""),
                        i = this.queryExpr.indexOf("${0}");

                    var keywords = "";
                    if (searchText.split(" ").length > 0) {
                        var items = searchText.split(" ");
                        d_array.forEach(items, function (
                            item,
                            idx
                            ) {
                            keywords += "(" + d_regexp.escapeString(item) + ")";
                            if (idx < items.length - 1)
                                keywords += "|";
                        });
                    } else {
                        keywords = "(" + d_regexp.escapeString(searchText) + ")"; // escape regexp special chars
                    }
                    // prepend ^ when this.queryExpr == "${0}*" and append $ when this.queryExpr == "*${0}"
                    return new RegExp((i == 0 ? "^" : "") + keywords, modifiers);
                },

                _resultsEmpty: function () {
                    var key = null,
                        results = this._results,
                        empty = true;
                    for (key in results) {
                        empty = results[key] && (!results[key].results || results[key].results.length == 0);
                        if (!empty) {
                            return empty;
                        }
                    }
                    return empty;
                },

                _handleNewSearch: function (evt) {
                    this.disconnect("widget");
                    this._queryValue = evt && evt._properties.entries.newValue;
                    this._results = {};
                    if (this._resultwidget) {
                        this._resultwidget.destroyRecursive();
                    }
                    this._resultwidget = new ResultListContainerWidget();
                    this._addedResults = [];
                    this.resultAttachWidget.set("result", this._resultwidget);
                    this._isFirstChildFocused = false;
                    this._acceptNewResults = true;
                },

                _handleNewResult: function (evt) {
                    var resultset = evt && evt._properties.entries.resultset,
                        results = resultset && resultset.results,
                        query = resultset && resultset.query,
                        type = resultset && resultset.type,
                        hideAndDiscard = false;
                    console.debug("got new result", resultset);
                    if (!this._acceptNewResults) {
                        console.debug("got new results too late, hide window", resultset);
                        this.resultAttachWidget.hide();
                        return;
                    }
                    if (this._queryValue !== query) {
                        console.debug("the result is too old, discarding");
                        hideAndDiscard = true;
                    }
                    if (!type || !results || !results.length > 0) {
                        console.debug("result not correctly filled, skipping");
                        hideAndDiscard = true;
                    }
                    if (hideAndDiscard) {
                        if (this._resultsEmpty()) {
                            console.debug("got no results, hiding window");
                            this.resultAttachWidget.hide();
                        }
                        return;
                    }

                    if (this._resizeTimeout) {
                        clearTimeout(this._resizeTimeout);
                    }

                    this._addResultset(resultset);

                    this.resultAttachWidget.show();

                    this.resultAttachWidget.resize();

                },

                _handleSearchWidgetBlur: function () {

                    if (this.closeResultsOnBlur) {

                        setTimeout(d_lang.hitch(this, function () {

                            if (!this._resultHasKeyFocus) {
                                this._closeWindow();
                            }
                            this._resultHasKeyFocus = false;

                        }), 300);

                    }

                }
            }
        )
    }
);