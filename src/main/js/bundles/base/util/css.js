/**
 * COPYRIGHT 2012-2013 con terra GmbH Germany
 *
 * User: fba
 * Date: 11.02.14
 * Time: 13:54
 */
define([
        "dojo/_base/array",
        "dojo/_base/lang",
        "ct/async",
        "dojo/sniff"
    ],
    function (
        d_array,
        d_lang,
        ct_async,
        d_sniff
        ) {
        var exports = {
            removePrefixedClasses: function (
                domNode,
                prefix
                ) {
                var classes = domNode.className.split(" ");
                classes = d_array.filter(classes, function (c) {
                    return c.lastIndexOf(prefix, 0) !== 0;
                }, this);
                domNode.className = d_lang.trim(classes.join(" "));
            },
            createSelector: function (
                selector,
                style
                ) {
                ct_async(function () {
                    if (!document.styleSheets) {
                        return;
                    }

                    if (document.getElementsByTagName("head").length == 0) {
                        return;
                    }

                    var stylesheet;
                    var mediaType;
                    var i;

                    try {
                        if (document.styleSheets.length > 0) {
                            for (i = 0; i < document.styleSheets.length; i++) {
                                if (document.styleSheets[i].disabled) {
                                    continue;
                                }
                                if (document.styleSheets[i].ownerNode && document.styleSheets[i].ownerNode.tagName === "LINK") {
                                    continue;
                                }
                                var media = document.styleSheets[i].media;
                                mediaType = typeof media;

                                if (mediaType == "string") {
                                    if (media == "" || (media.indexOf("screen") != -1)) {
                                        styleSheet = document.styleSheets[i];
                                    }
                                } else if (mediaType == "object") {
                                    if (media.mediaText == "" || (media.mediaText.indexOf("screen") != -1)) {
                                        styleSheet = document.styleSheets[i];
                                    }
                                }

                                if (typeof styleSheet != "undefined") {
                                    break;
                                }
                            }
                        }
                    } catch (e) {
                        //we are not allowed to aaccess the media text
                    }

                    if (typeof styleSheet == "undefined") {
                        var styleSheetElement = document.createElement("style");
                        styleSheetElement.type = "text/css";

                        document.getElementsByTagName("head")[0].appendChild(styleSheetElement);

                        for (i = 0; i < document.styleSheets.length; i++) {
                            if (document.styleSheets[i].disabled) {
                                continue;
                            }
                            styleSheet = document.styleSheets[i];
                        }

                        var media = styleSheet.media;
                        mediaType = typeof media;
                    }

                    if (mediaType == "string") {
                        for (i = 0; i < styleSheet.rules.length; i++) {
                            if (styleSheet.rules[i].selectorText && styleSheet.rules[i].selectorText.toLowerCase() == selector.toLowerCase()) {
                                styleSheet.rules[i].style.cssText = style;
                                return;
                            }
                        }

                        styleSheet.addRule(selector, style);
                    } else if (mediaType == "object") {
                        for (i = 0; i < styleSheet.cssRules.length; i++) {
                            if (styleSheet.cssRules[i].selectorText) {
                                var selectorRule = styleSheet.cssRules[i].selectorText;
                                // Chrome, IE, tablets produce ::before, FF :before
                                // http://css-tricks.com/pseudo-class-selectors/ --> ::before, ::after, ::first-letter, ::first-line
                                if (selectorRule.search(/::[a-z]/g) > -1) {
                                    selector = selector.replace(":", "::");
                                }
                                if (selectorRule.toLowerCase() === selector.toLowerCase()) {
                                    styleSheet.cssRules[i].style.cssText = style;
                                    return;
                                }else{
      //BartVerbeeck Bug31013
                                 if (selectorRule.toLowerCase() === ".hik.agivgenericidentify .dijitdialogtitle::before") {
                                    styleSheet.cssRules[i].style.cssText = style;
                                    return;
                                 }   
                                    
                                }
                            }
                        }

                        styleSheet.insertRule(selector + "{" + style + "}", 0);
                    }
                }, 50);
            }
        };
        return exports;
    }
);