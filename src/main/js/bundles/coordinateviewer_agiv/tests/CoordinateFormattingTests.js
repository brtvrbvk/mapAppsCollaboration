/**
 * COPYRIGHT 2012-2013 con terra GmbH Germany
 *
 * User: fba
 * Date: 08.07.13
 * Time: 14:24
 */
define([
        "doh",
        "ct/mapping/LatLon"
    ],

    function (
        doh,
        LatLon
        ) {

        doh.register("agiv.bundles.coordinateviewer_agiv.tests.Coordinate Formatting", [
            {
                name: "Coordinate Formatting",
                timeout: 5000,

                runTest: function () {

                    var long1 = LatLon.parse(3.02548, {
                        hemispheres: {
                            north: "N",
                            south: "Z",
                            east: "O",
                            west: "W"
                        },
                        decimalPlaces: 3
                    });
                    var long2 = LatLon.parse(3.050833, {
                        hemispheres: {
                            north: "N",
                            south: "Z",
                            east: "O",
                            west: "W"
                        },
                        decimalPlaces: 3
                    });
                    var lat1 = LatLon.parse(50.87422, {
                        latitudeFirst: true,
                        hemispheres: {
                            north: "N",
                            south: "Z",
                            east: "O",
                            west: "W"
                        },
                        decimalPlaces: 3
                    });
                    var lat2 = LatLon.parse(50.847222, {
                        latitudeFirst: true,
                        hemispheres: {
                            north: "N",
                            south: "Z",
                            east: "O",
                            west: "W"
                        },
                        decimalPlaces: 3
                    });
                    doh.assertEqual("003°01'31,728\"O", long1.asDegree());
                    doh.assertEqual("50°52'27,192\"N", lat1.asDegree());
                    doh.assertEqual("003°03'02,999\"O", long2.asDegree());
                    doh.assertEqual("50°50'49,999\"N", lat2.asDegree());

                }
            }
        ]);
    });