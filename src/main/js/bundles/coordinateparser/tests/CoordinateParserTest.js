/**
 * COPYRIGHT 2012-2013 con terra GmbH Germany
 *
 * User: fba
 * Date: 08.07.13
 * Time: 14:24
 */
define([
        "doh",
        "../WGS84Parser",
        "../BelgianLambert72Parser"
    ],

    function (
        doh,
        WGS84Parser,
        BelgianLambert72Parser
        ) {

        var isNumber = function (val) {
            return !val.isNaN;
        }

        doh.register("agiv.bundles.coordinateparser.tests.CoordinateParser Tests", [
            {
                name: "Coordinate parsing tests WGS84",
                timeout: 5000,

                runTest: function () {

                    var wgs84parser = new WGS84Parser();

                    doh.assertEqual(true, isNumber(wgs84parser.isCoordinate("12.3635")));
                    doh.assertEqual(true, isNumber(wgs84parser.isCoordinate("12,3635")));
                    doh.assertEqual(true, isNumber(wgs84parser.isCoordinate("09.3365")));
                    doh.assertEqual(true, isNumber(wgs84parser.isCoordinate("6.3635")));
                    doh.assertEqual(true, isNumber(wgs84parser.isCoordinate("8,3365")));
                    doh.assertEqual(false, isNumber(wgs84parser.isCoordinate("123.3365")));
                    doh.assertEqual(false, isNumber(wgs84parser.isCoordinate("123,3365")));

                    doh.assertEqual(52.336982, wgs84parser.isCoordinate("12.3365 52.336982").x);
                    doh.assertEqual(12.3365, wgs84parser.isCoordinate("12.3365 52.336982").y);

                    doh.assertEqual(false, isNumber(wgs84parser.isCoordinate("12.3635 52.33XX6982")));
                    doh.assertEqual(false, isNumber(wgs84parser.isCoordinate("a12.3635 52.336982")));

                    doh.assertEqual(true, isNumber(wgs84parser.isCoordinate("12.3365 52.336982"))); // space
                    doh.assertEqual(true, isNumber(wgs84parser.isCoordinate("12.3365,52.336982"))); // comma
                    doh.assertEqual(true, isNumber(wgs84parser.isCoordinate("12.3365, 52.336982")));
                    doh.assertEqual(true, isNumber(wgs84parser.isCoordinate("12.3365, 52.")));
                    doh.assertEqual(true, isNumber(wgs84parser.isCoordinate("12.3365, .52")));
                    doh.assertEqual(true, isNumber(wgs84parser.isCoordinate("12.3365;52.336982"))); // ;
                    doh.assertEqual(false, isNumber(wgs84parser.isCoordinate("12.3365.52.336982"))); // point

                    doh.assertEqual(true, isNumber(wgs84parser.isCoordinate("12,3365 52,336982"))); // space
                    doh.assertEqual(false, isNumber(wgs84parser.isCoordinate("12,3365,52,336982"))); // comma
                    doh.assertEqual(false, isNumber(wgs84parser.isCoordinate("12,3365, 52,336982")));
                    doh.assertEqual(true, isNumber(wgs84parser.isCoordinate("12,3365. 0,52")));
                    doh.assertEqual(true, isNumber(wgs84parser.isCoordinate("12,3365;52,336982"))); // ;
                    doh.assertEqual(true, isNumber(wgs84parser.isCoordinate("12,3365.52,336982"))); // point

                    doh.assertEqual(true, isNumber(wgs84parser.isCoordinate("12 52.336982")));
                    doh.assertEqual(true, isNumber(wgs84parser.isCoordinate("5 52.336982")));
                    doh.assertEqual(20, wgs84parser.isCoordinate("80,20").x);
                    doh.assertEqual(80, wgs84parser.isCoordinate("80,20").y);
                    doh.assertEqual(80.123, wgs84parser.isCoordinate("80.123,20").y);

                    doh.assertEqual(true, wgs84parser.isValidCoordinatePair("12.3635,52.336982"));
                    doh.assertEqual(true, wgs84parser.isValidCoordinatePair("12,3635 52,336982"));
                    doh.assertEqual(false, wgs84parser.isValidCoordinatePair("120.3635,52.336982"));
                    doh.assertEqual(false, wgs84parser.isValidCoordinatePair("120,3635 52,336982"));
                    doh.assertEqual(false, wgs84parser.isValidCoordinatePair("12.3635,520.336982"));
                    doh.assertEqual(false, wgs84parser.isValidCoordinatePair("12,3635 520,336982"));

                    doh.assertEqual(true, wgs84parser.isValidCoordinatePair("52,1234° - 4,3216°"));
                    doh.assertEqual(false, wgs84parser.isValidCoordinatePair("200,1234° - 4,3216°"));

                }
            },

            {
                name: "Coordinate parsing tests BelgianLambert72",
                timeout: 5000,

                runTest: function () {

                    var belgianlambertparser = new BelgianLambert72Parser();

                    doh.assertEqual(true, isNumber(belgianlambertparser.isCoordinate("290875.856737,69743.230376")));
                    doh.assertEqual(true, isNumber(belgianlambertparser.isCoordinate("17736.856737,245375.230376")));

                    doh.assertEqual(true, isNumber(belgianlambertparser.isCoordinate("29875.856737 69743.230376"))); // space
                    doh.assertEqual(true, isNumber(belgianlambertparser.isCoordinate("29875.856737,69743.230376"))); // comma
                    doh.assertEqual(true, isNumber(belgianlambertparser.isCoordinate("29875.856737, 69743.230376")));
                    doh.assertEqual(true, isNumber(belgianlambertparser.isCoordinate("29875.856737, 69743.")));
                    doh.assertEqual(true, isNumber(belgianlambertparser.isCoordinate("29875.856737, .230376")));
                    doh.assertEqual(true, isNumber(belgianlambertparser.isCoordinate("29875.856737;69743.230376"))); // ;
                    doh.assertEqual(false, isNumber(belgianlambertparser.isCoordinate("29875.856737.69743.230376"))); // point

                    doh.assertEqual(true, isNumber(belgianlambertparser.isCoordinate("29875,856737 69743,230376"))); // space
                    doh.assertEqual(false, isNumber(belgianlambertparser.isCoordinate("29875,856737,69743,230376"))); // comma
                    doh.assertEqual(false, isNumber(belgianlambertparser.isCoordinate("29875,856737, 69743,230376")));
                    doh.assertEqual(true, isNumber(belgianlambertparser.isCoordinate("29875,856737. 69743,")));
                    doh.assertEqual(true, isNumber(belgianlambertparser.isCoordinate("29875,856737. ,230376")));
                    doh.assertEqual(true, isNumber(belgianlambertparser.isCoordinate("29875,856737;69743,230376"))); // ;
                    doh.assertEqual(true, isNumber(belgianlambertparser.isCoordinate("29875,856737.69743,230376"))); // point

                    doh.assertEqual(29875.856737, belgianlambertparser.isCoordinate("29875.856737,69743.230376").x);
                    doh.assertEqual(29875.856737, belgianlambertparser.isCoordinate("29875.856737, 69743.230376").x);
                    doh.assertEqual(29875.856737, belgianlambertparser.isCoordinate("29875.856737 69743.230376").x);
                    doh.assertEqual(29875.856737, belgianlambertparser.isCoordinate("29875.856737 69743.230376").x);
                    doh.assertEqual(69743.230376, belgianlambertparser.isCoordinate("29875.856737 69743.230376").y);

                    doh.assertEqual(false,
                        isNumber(belgianlambertparser.isCoordinate("290875.856737,69743,230376")));
                    doh.assertEqual(false,
                        isNumber(belgianlambertparser.isCoordinate("a290875.856737,69743,230376")));
                    doh.assertEqual(false,
                        isNumber(belgianlambertparser.isCoordinate("a290875.856737,69743.230376")));
                    doh.assertEqual(false,
                        isNumber(belgianlambertparser.isCoordinate("290875.856737a69743.230376")));
                    doh.assertEqual(false,
                        isNumber(belgianlambertparser.isCoordinate("290875,856737,69743.230376")));

                    doh.assertEqual(true, belgianlambertparser.isValidCoordinatePair("290875.856737,69743.230376"));
                    doh.assertEqual(true, belgianlambertparser.isValidCoordinatePair("290875,856737 69743,230376"));
                    doh.assertEqual(false, belgianlambertparser.isValidCoordinatePair("290875.856737,269743.230376"));
                    doh.assertEqual(false, belgianlambertparser.isValidCoordinatePair("290875,856737 269743,230376"));
                    doh.assertEqual(false, belgianlambertparser.isValidCoordinatePair("350875.856737,69743.230376"));
                    doh.assertEqual(false, belgianlambertparser.isValidCoordinatePair("350875,856737 69743,230376"));

                    doh.assertEqual(true, belgianlambertparser.isValidCoordinatePair("50 123,00m - 40 000,00m"));
                    doh.assertEqual(false, belgianlambertparser.isValidCoordinatePair("50 123,00m - 40 0,00m"));

                }
            }
        ]);
    });