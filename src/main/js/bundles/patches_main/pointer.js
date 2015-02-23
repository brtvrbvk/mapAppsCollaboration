define([
    "esri/PointerEvents",
    "dojo/_base/array"
], function (
    PointerEvents,
    p
    ) {
    var proto = PointerEvents.prototype;

    proto._pointerUp = function (a) {
        var c = this._touches,
            b, d = this.node,
            e = a.target,
            f = a.pointerId,
            g = this._touchIds,
            h = g.slice(0),
            k = p.map(h, function (a) {
                return c[a]
            }),
            m = (new Date).getTime();
        if (b = c[f])
            if (b.pageX = a.pageX, b.pageY = a.pageY, b.endTS = m, this._numTouches--, e.releasePointerCapture ? e.releasePointerCapture(f) : e.msReleasePointerCapture && e.msReleasePointerCapture(f), 0 === this._numTouches)
                if (this._touches = {}, this._touchIds = [], this._swipeActive) this._swipeActive = !1, this._fire("onSwipeEnd",
                    this._processTouchEvent(a, a));
                else if (this._pinchActive) this._pinchActive = !1, this._fire("onPinchEnd",
                    this._processTouchEvent(a, a));
                else {
                    if (!b.absMoved) {
                        var e = Infinity,
                            f = -Infinity,
                            g = Infinity,
                            m = -Infinity,
                            l = this.tapStartTolerance,
                            n;
                        for (n = 0; n < h.length; n++) b = k[n], b.startTS < e && (e = b.startTS), b.startTS > f && (f = b.startTS), b.endTS < g && (g = b.endTS), b.endTS > m && (m = b.endTS);
                        Math.abs(f - e) <= l && Math.abs(m - g) <= l && this._basicTap(a, k)
                    }
                } else 1 ===
            this._numTouches && this._pinchActive && (g.splice(p.indexOf(g, a.pointerId),
                1), delete c[a.pointerId], b = c[g[0]], b.startX = b.pageX, b.startY = b.pageY, b.moved = !1, document.msElementsFromPoint && (h = document.msElementsFromPoint(b.pageX,
                b.pageY), p.some(h, function (a) {
                return a === d
            }) || (this._touches = {}, this._touchIds = [], this._numTouches = 0)), this._pinchActive = !1, this._fire("onPinchEnd",
                this._processTouchEvent(a, [
                    a,
                    b
                ])))
        /**
         * temporary solution for drag and drop in IE9/10
         */
        else
            this._fire("onMouseUp", this._processMouseEvent(a))
    }
    return PointerEvents;
});


