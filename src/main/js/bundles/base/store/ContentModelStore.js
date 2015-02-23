define([
        "dojo/_base/lang",
        "dojo/_base/declare",
        "dojo/_base/array",
        "dojo/_base/Deferred",
        "dojo/store/util/QueryResults",
        "ct/array",
        "ct/request",
        "ct/_when",
        "ct/Stateful",
        "ct/mapping/mapcontent/ServiceTypes",
        "ct/store/StoreUtil",
        "ct/store/ComplexQuery"
    ],
    function (
        d_lang,
        declare,
        d_array,
        Deferred,
        QueryResults,
        ct_array,
        ct_request,
        ct_when,
        Stateful,
        ServiceTypes,
        StoreUtil,
        ComplexQuery
        ) {
        /*
         * COPYRIGHT 2013 con terra GmbH Germany
         */

        return declare(
            [Stateful],
            /**
             * @lends agiv.bundles.agivsearch.ContentModelStore.prototype
             */
            {
                minQueryLength: 3,
                searchOnlyOperational: true,
                skipCategories: true,
                synonyms: "@@agiv.services.baseurl@@/resources/synonyms",

                resultType: {
                    LAYER_TITLE: 1,
                    SYNONYMS: 2,
                    KEYWORDS: 3
                },

                /**
                 * @constructs
                 * @author fba
                 */
                constructor: function () {
                },

                postscript: function () {
                    this.inherited(arguments);
                    if (!this._activated) {
                        this.activate();
                    }
                },

                activate: function () {
                    if (this.searchOnlyOperational && !this._activated) {
                        this.model = this.model.getOperationalLayer();
                        this._activated = true;
                    }
                },

                _processSearchData: function (data) {
                    if (!data || !d_lang.isArray(data)) {
                        var msg = "Unable to parse response!";
                        if (data.status && data.status.message) {
                            msg = data.status.message;
                        }
                        console.error("ContentModelStore._processSearchData: " + msg, data);
                        throw Error(msg);
                    }
                    var returnedItems = [];
                    d_array.forEach(data, function (item) {
                        returnedItems.push({
                            title: item.title || item.id,
                            id: item.id,
                            value: item.title || item.id,
                            enabled: item.enabled,
                            props: item.props
                        });
                    }, this);
                    this._data = returnedItems;
                    return returnedItems;
                },

                _search: function (content) {
                    var d = new Deferred();

                    ct_when(ct_request.requestJSON({
                        url: this.synonyms + "?filter=(and lower(synonyms) like \"*" + content.q.toLowerCase() + "*\")"
                    }), function (res) {

                        var nodes = [];
                        try {
                            nodes = this._findValidNodes(res.items, content);
                            // sort items based on result type (layer title, synonyms, keywords)
                            ct_array.arraySort(nodes, this.__priorityComparatorByAttribute("resultType"));
                            // filter out duplicates and sort based on the index of query value in layer title or alphabetic order
                            nodes = this._filterAndSortItems(nodes, content.q);
                            nodes = nodes.slice(0, content.count);
                        } catch (e) {
                            d.reject(e);
                        }
                        d.resolve(nodes);

                    }, function (error) {
                        d.reject(error);
                    }, this);

                    return d;
                },

                __priorityComparatorByAttribute: function (attr) {
                    return function (
                        a,
                        b
                        ) {
                        if (a[attr] < b[attr]) {
                            return -1;
                        }
                        if (a[attr] > b[attr]) {
                            return 1;
                        }
                        return 0;
                    };
                },

                _filterAndSortItems: function (
                    items,
                    query
                    ) {
                    items = this._filterOutDuplicates(items);
                    var resultWithLayerTitle = [];
                    var resultWithSynonyms = [];
                    d_array.forEach(items, function (item) {
                        if (item.resultType === this.resultType.LAYER_TITLE) {
                            item.queryIndex = item.title.toLowerCase().indexOf(query.toLowerCase());
                            resultWithLayerTitle.push(item);
                        } else {
                            resultWithSynonyms.push(item);
                        }
                    }, this);
                    ct_array.arraySort(resultWithLayerTitle, this.__priorityComparatorByAttribute("queryIndex"));
                    ct_array.arraySort(resultWithSynonyms, this.__priorityComparatorByAttribute("title"));
                    return resultWithLayerTitle.concat(resultWithSynonyms);
                },

                _filterOutDuplicates: function (items) {
                    var names = [];
                    var uniqueItems = d_array.filter(items, function (
                        item,
                        idx
                        ) {
                        names.push(item.title);
                        return ct_array.arrayFirstIndexOf(names, item.title) === idx;
                    });
                    return uniqueItems;
                },

                _findValidNodes: function (
                    synonyms,
                    content
                    ) {

                    return  this.model.mapNodes(function (node) {
                        var children = node.get("children");
                        if (this.skipCategories) {
                            if (children && children.length > 0 && children[0].hasChildren()) {
                                return;
                            }
                        }
                        //also skip leafes, we jsut use the nodes before the leafes
                        // || node.appid to include apps
                        if (children && children.length === 0) {
                            if (node.service && node.service.serviceType === ServiceTypes.WMTS) {
                            } else {
                                return;
                            }
                        }
                        var nodeTitle = node.title ? node.title : node.id;
                        if (nodeTitle.toLowerCase().indexOf(content.q) > -1) {
                            return d_lang.mixin(node, {
                                resultType: this.resultType.LAYER_TITLE
                            });
                        }
                        // look for synonyms from config and from server
                        var keywords = node.keywords ? node.keywords : null;
                        var foundSynonym = ct_array.arraySearchFirst(synonyms, {title: nodeTitle}, true);

                        if (foundSynonym) {
                            return this._createSynonymItem(foundSynonym.synonyms, content, node,
                                this.resultType.SYNONYMS);
                        } else if (keywords) {
                            var elem = this._createSynonymItem(keywords, content, node, this.resultType.KEYWORDS);
                            if (elem) {
                                return elem;
                            }
                        }
                    }, this);

                },

                _createSynonymItem: function (
                    foundSynonyms,
                    content,
                    node,
                    resultType
                    ) {
                    foundSynonyms = foundSynonyms.split(",");
                    var synonym = ct_array.arraySearchFirst(foundSynonyms, function (item) {
                        return item.toLowerCase().indexOf(content.q.toLowerCase()) > -1;
                    });
                    return {
                        enabled: node.enabled,
                        title: (node.title || node.id) + " (" + synonym + ")",
                        id: node.id,
                        props: node.props,
                        resultType: resultType
                    };

                },

                query: function (
                    query,
                    options
                    ) {
                    var content = this._extractContentFromQuery(query, options);
                    this.queryValue = content.q;
                    if (content.q.length < this.minQueryLength) {
                        return QueryResults();
                    }
                    return QueryResults(ct_when(this._search(content), function (response) {
                        var total = response.count;
                        var result = this._processSearchData(response);
                        result.total = total;
                        return result;
                    }, this));
                },
                _extractContentFromQuery: function (
                    query,
                    options
                    ) {
                    var ast = ComplexQuery.parse(query, options).ast;
                    var walker = ast.walker();
                    if (!walker.toFirstChild()) {
                        throw illegalArgumentError("ContentModelStore: No query found!");
                    }
                    var astNode = walker.current;
                    var operation = astNode.o.substring(1);
                    if (operation !== "suggest") {
                        throw illegalArgumentError("ContentModelStore: No 'suggest' query!");
                    }
                    var content = {
                        q: astNode.v.toLowerCase()
                    };
                    var qopts = walker.queryOptions;
                    var count = qopts.count;
                    if (count !== Infinity) {
                        content.count = count;
                    }
                    d_lang.mixin(content, this.parameters);
                    return content;
                }

            });
    });