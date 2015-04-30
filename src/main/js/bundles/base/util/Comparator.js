/**
 * COPYRIGHT 2014 con terra GmbH Germany
 *
 * Created by fba on 30.07.2014.
 */
define([
    ],
    function () {
        return {
            renderPriorityComparator: function (
                a,
                b
                ) {
                a = Number(a.get ? a.get("renderPriority") : a.renderPriority);
                b = Number(b.get ? b.get("renderPriority") : b.renderPriority);
                if (!a && !b) {
                    return 0;
                }
                if (!a && b) {
                    return 1;
                }
                else if (!b && a) {
                    return -1;
                }
                else if (a < b) {
                    return 1;
                }
                else if (a === b) {
                    return 0;
                }
                return -1;
            }
        };
    }
);