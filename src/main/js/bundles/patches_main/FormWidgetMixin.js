/**
 * COPYRIGHT 2014 con terra GmbH Germany
 *
 * Created by fba on 06.06.2014.
 */
define([
        "dojo/touch",
        "dojo/window",
        "dojo/sniff",
        "dojo/_base/lang",
        "dijit/form/TextBox",
        "dojo/dom-construct",
        "dojo/on"
    ],
    function (
        touch,
        winUtils,
        d_sniff,
        d_lang,
        TextBox,
        domConstruct,
        on
        ) {

        d_lang.extend(TextBox, {
            _setPlaceHolderAttr: function (
                v
                ) {

                this._set("placeHolder", v);
                if (!this._phspan) {
                    this._attachPoints.push('_phspan');
                    // dijitInputField class gives placeHolder same padding as the input field
                    // parent node already has dijitInputField class but it doesn't affect this <span>
                    // since it's position: absolute.
                    this._phspan = domConstruct.create('span', {
                        onmousedown: function (e) {
                            e.preventDefault();
                        },
                        className: 'dijitPlaceHolder dijitInputField'}, this.textbox, 'after');
                    this.own(on(this._phspan, "touchend, MSPointerUp", d_lang.hitch(this, function () {
                        // If the user clicks placeholder rather than the <input>, need programmatic focus.  Normally this
                        // is done in _FormWidgetMixin._onFocus() but after [30663] it's done on a delay, which is ineffective.
                        this.focus();
                    })));
                }
                this._phspan.innerHTML = "";
                this._phspan.appendChild(this._phspan.ownerDocument.createTextNode(v));
                this._updatePlaceHolder();

            },
            _updatePlaceHolder: function () {
                if (this._phspan) {
                    this._phspan.style.display = (this.placeHolder && !this.textbox.value) ? "" : "none";
                }
            }});

    }
);