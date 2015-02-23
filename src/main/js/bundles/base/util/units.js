/**
 * COPYRIGHT 2014 con terra GmbH Germany
 *
 * Created by fba on 05.08.2014.
 */
define([
        "dojo/number"
    ],
    function (d_number) {
        return {

            meterToKilometer: function (
                meter,
                decimals
                ) {

                var num = d_number.format(meter / 1000, {
                    places: decimals
                });

                return num;

            },

            /**
             * returns a String including the unit "km" or "m" at the end. If the distance is less than
             * 1 km the distance is returned in meters (e.g. 600 m)
             * @param distanceInKilometers A Number
             * @param decimals The number of decimals for the returned kilometer distance. The meter value always has 0 decimals.
             */
            getDistanceStringMetric: function (distanceInKilometers, decimals) {
                var unit = "km";
                var distance = distanceInKilometers;
                if (distanceInKilometers < 1) {
                    unit = "m";
                    distance = distanceInKilometers * 1000;
                }

                if (unit === "m") {
                    decimals = 0;
                }
                var formattedDistance = d_number.format(distance, {
                    places: decimals
                });
                return formattedDistance + " " + unit;
            }

        };
    }
);