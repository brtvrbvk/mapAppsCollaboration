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

                type: "COORDINATE_31370",

                constructor: function () {

                },

                isCoordinate: function (val) {
                    //EPSG:31370
                    //Projected Bounds: 17736.0314, 23697.0977, 297289.9391, 245375.4223
                    try {
                        var number = this.parseFloatingPointNumber(val);
                        if (isNaN(number.x)) {
                            number.isNaN = true;
                        } else if (number.x > 17736 && number.x < 297290) {
                            number.spatialReference = {wkid: "31370"};
                        } else {
                            number.isNaN = true;
                        }
                        return number;
                    } catch (e) {
                    }
                    return {isNaN: true};
                },

                isValidCoordinatePair: function (val) {
                    try {
                        var number = this.parseFloatingPointNumber(val);
                        if (number.x > 17736 && number.x < 297290 && number.y > 23697 && number.y < 245376) {
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