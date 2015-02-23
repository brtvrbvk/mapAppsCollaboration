define([
        "dojo/_base/declare",
        "dojo/dom-construct",
        "dojo/dom-class",
        "dojo/_base/array",
        "dojo/_base/lang",
        "dijit/Tooltip",
        "ct/util/css",
        "dijit/_Widget",
        "dijit/_Templated",
        "dojo/text!./templates/CopyrightWidget.html",
        "."
    ],
    function (
        declare,
        d_domconstruct,
        domNode,
        d_array,
        d_lang,
        Tooltip,
        css,
        _Widget,
        _Templated,
        templateStringContent,
        _moduleRoot
        ) {
        /*
         * COPYRIGHT 2011-2012 con terra GmbH Germany
         */
        /**
         * @fileOverview
         * @author gli
         */
        return _moduleRoot.CopyrightWidget = declare(
            [
                _Widget,
                _Templated
            ],
            {
                templateString: templateStringContent,
                i18n: {
                    "title": "Copyright"
                },
                defaultimg: null,

                postCreate: function () {
                    this.inherited(arguments);
                    //this.addCopyright(this.defaultimg, this.i18n.title || "");
                    this._setPosition();
                    css.switchHidden(this.copyrightNode, true);
                },
                setTitle: function (title) {
                    this.copyrightImg.alt = title;
                    this.copyrightImg.title = title;
                },
                setImage: function (imgUrl) {
                    this.copyrightImg.src = imgUrl;
                },

                clearCopyright: function () {
                    this.copyrightNode.innerHTML = "";
                    css.switchHidden(this.copyrightNode, true);
                },
                addCopyrightImages: function (
                    images,
                    clear
                    ) {
                    if (clear) {
                        this.clearCopyright();
                    }
                    d_array.forEach(images, d_lang.hitch(this, function (image) {
                        this.addCopyright(image.img, image.copyright, image.text, image.link);
                    }));
                },
                _setPosition: function () {
                    if (this.position) {
                        switch (this.position) {
                            case "upperleft":
                                domNode.add(this.copyrightNode, "ctcopyrightLeftUpperCorner");
                                return;
                            case "upperright":
                                domNode.add(this.copyrightNode, "ctcopyrightRightUpperCorner");
                                return;
                            case "lowerright":
                                domNode.add(this.copyrightNode, "ctcopyrightRightLowerCorner");
                                return;
                            default:
                                domNode.add(this.copyrightNode, "ctcopyrightLeftLowerCorner");
                                return;
                        }
                    } else {
                        domNode.add(this.copyrightNode, "ctcopyrightLeftLowerCorner");
                    }
                },
                addCopyright: function (
                    img,
                    copyright,
                    text,
                    link
                    ) {
                    var htmlCode = "";
                    if (img && img != "") {
                        htmlCode = this._makeCopyrightImgCode(img, copyright, link);
                    }
                    else {
                        htmlCode = this._makeCopyrightTextCode(copyright, link);
                    }

                    var spanNode = d_domconstruct.create("span", {
                        "class": "ctcopyrightSpan ctCopyrightNode",
                        "innerHTML": this._makeHrefCode(htmlCode, link)
                    });
                    this.copyrightNode.appendChild(spanNode);
                    css.switchHidden(this.copyrightNode, false);
                    this._tooltip = new Tooltip({
                        connectId: [this.copyrightNode],
                        label: text
                    });
                },
                _makeCopyrightImgCode: function (
                    img,
                    copyright,
                    link
                    ) {
                    return "<img class='ctcopyrightImg ctCopyrightNode' src='" + img + "'>";
                },
                _makeCopyrightTextCode: function (
                    copyright,
                    link
                    ) {
                    return "<span class='ctcopyrightLabel'>" + copyright + "</span>";
                },
                _makeHrefCode: function (
                    htmlCode,
                    link
                    ) {
                    if (link && link != "") {
                        htmlCode = "<a target='_blank' href='" + link + "'>" + htmlCode + "</a>";
                    }
                    return htmlCode;
                }
            });

    });