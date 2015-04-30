/**
 * COPYRIGHT 2012-2013 con terra GmbH Germany
 *
 * User: fba
 * Date: 09.07.13
 * Time: 07:52
 */
define([
        "dojo/_base/declare",
        "./_CoordinateParser"
    ],
    function (
        declare,
        CoordinateParser
        ) {
        return declare([CoordinateParser],
            {

                type: "COORDINATE_4326",

                constructor: function () {

                },

                isCoordinate: function (val) {
                    try {
                        var number = this.parseFloatingPointNumber(val);
                        if (isNaN(number.x)) {
                            number.isNaN = true;
                        } else if (Math.abs(number.x) <= 90) {
                            number.spatialReference = {wkid: "4326"};
                        } else {
                            number.isNaN = true;
                        }
                        var tmp = number.x;
                        number.x = number.y;
                        number.y = tmp;
                        return number;
                    } catch (e) {
                    }
                    return {isNaN: true};
                },

                isValidCoordinatePair: function (val) {
                    try {
                        var number = this.parseFloatingPointNumber(val);
                        if (Math.abs(number.x) <= 90 && Math.abs(number.y) <= 180) {
                            return true;
                        }
                        return false;
                    } catch (e) {
                        return false;
                    }
                }
            }
        );
    }
);