define([
        "dojo/_base/lang",
        "dojo/_base/kernel",
        "dojo/_base/array",
        "dojo/query"
    ],
    function (d_lang, d_kernel, d_array, query) {
        /*
         * COPYRIGHT 2011-2012 con terra GmbH Germany
         */
        /**
         * @fileOverview
         * @author fba
         */

        var exports = {};

        /**
         * Returns the value of the element matching the given path using dojo.query in the background
         * Compatible to IE8,9,FF4+, Chrome
         * @return String
         */
        exports.getTagValue = function (path, root) {
            var res;
            if ((d_kernel.isIE || d_kernel.isFF) && path.split(">").length > 1) {
                var tagPaths = path.split(">"),
                    roots = [root],
                    result;
                res = _getTags(tagPaths, roots);
                result = d_array.map(res, function (r) {
                    if (exports.getTextContent(r)) {
                        return exports.getTextContent(r);
                    }
                    return null;
                });
                if (d_lang.isArray(result) && result.length === 1) {
                    return result[0] ? res[0] : null;
                }
            } else {
                res = query(path, root);
                if (d_lang.isArray(res) && res.length === 1) {
                    return res[0] ? exports.getTextContent(res[0]) : null;
                }
            }
            return null;
        };

        exports.getAttributeValue = function (node, attr) {
            var attrs = node.attributes;
            if (!attrs) {
                return null;
            }
            var val;
            if (attrs.length > 0) {
                for (var i = 0; i < attrs.length; i++) {
                    var a = attrs[i];
                    if (a.nodeName === attr) {
                        val = a.text ? a.text : a.textContent;
                    }
                }
            }
            return val;
        };

        var _getTagName = function (node) {
            if (d_kernel.isIE < 9) {
                return node.tagName;
            }
            return node.localName;
        };

        exports.getTextContent = function (node) {
            if (node.text !== undefined) {
                if (node.text.length > 0) {
                    return node.text;
                } else {
                    return " ";
                }
            } else {
                return node.textContent;
            }
        };

        var _getTags = function (paths, roots) {
            var results;
            //iterate over paths and query
            d_array.forEach(paths, function (tagpath) {
                var tmp = [];
                //iterate roots
                d_array.forEach(roots, function (r) {
                    var t = query(tagpath, r);
                    //iterate query results
                    d_array.forEach(t, function (newRoot) {
                        if (newRoot.parentNode && _getTagName(newRoot.parentNode)) {
                            if (_getTagName(newRoot.parentNode) == _getTagName(r)) {
                                tmp.push(newRoot);
                            } else {
                                var found = newRoot;
                                tmp.push(found)
                            }
                        } else {
                            //we have the root element
                            tmp.push(newRoot);
                        }
                    });
                });
                roots = tmp;
            });
            results = d_array.map(roots, function (r) {
                return r;
            });
            if (results.length == 0) {
                return null;
            }
            return results;
        };

        /**
         * Returns all node elements matching the given path using dojo.query in the background
         * Compatible to IE8,9,FF4+, Chrome
         * @return [Element]
         */
        exports.getTags = function (path, root) {
            if ((d_kernel.isIE < 9) && path.split(">").length > 1) {
                var tagPaths = path.split(">"),
                    roots = [root];
                return _getTags(tagPaths, roots);
            } else {
                return query(path, root);
            }
        };

        exports.getFirstTag = function (path, root) {
            return exports.getTags(path, root)[0];
        };

        /**
         * Returns all text contentns of the elements  matching the given path using dojo.query in the background
         * Compatible to IE8,9,FF4+, Chrome
         * @return [String]
         */
        exports.getTagValues = function (path, root) {
            //only chrome currently evaluates the paths correctly
            var res;
            if ((d_kernel.isIE || d_kernel.isFF) && path.split(">").length > 1) {
                var tagPaths = path.split(">"),
                    roots = [root];
                res = _getTags(tagPaths, roots);
                return d_array.map(res, function (r) {
                    if (exports.getTextContent(r)) {
                        return exports.getTextContent(r);
                    }
                    return null;
                });
            } else {
                res = query(path, root);
                if (d_lang.isArray(res) && res.length > 0) {
                    return d_array.map(res, function (tag) {
                        return exports.getTextContent(tag);
                    });
                }
            }
            return null;
        };

        /**
         * Returns the first element from the result of the path query
         * Compatible to IE8,9,FF4+, Chrome
         * @return Element
         */
        exports.getFirstTagValue = function (path, root) {
            var t = exports.getTagValues(path, root);
            return t ? t[0] : null;
        };

        return exports;

    });