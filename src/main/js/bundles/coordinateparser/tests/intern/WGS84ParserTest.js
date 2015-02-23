/**
 * COPYRIGHT 2015 con terra GmbH Germany
 *
 * Created by fba on 15.01.2015.
 */
define([
        "intern!object",
        "intern/chai!assert",
        "module",
        "../../WGS84Parser"
    ],
    function (
        registerSuite,
        assert,
        md,
        WGS84Parser
        ) {
        var isNumber = function (val) {
            return !val.isNaN;
        };
        registerSuite({
                name: md.id,

                test_CoordinateParsing: function () {

                    var wgs84parser = new WGS84Parser();

                    assert.equal(true, isNumber(wgs84parser.isCoordinate("12.3635")));
                    assert.equal(true, isNumber(wgs84parser.isCoordinate("12,3635")));
                    assert.equal(true, isNumber(wgs84parser.isCoordinate("09.3365")));
                    assert.equal(true, isNumber(wgs84parser.isCoordinate("6.3635")));
                    assert.equal(true, isNumber(wgs84parser.isCoordinate("8,3365")));
                    assert.equal(false, isNumber(wgs84parser.isCoordinate("123.3365")));
                    assert.equal(false, isNumber(wgs84parser.isCoordinate("123,3365")));

                    assert.equal(52.336982, wgs84parser.isCoordinate("12.3365 52.336982").x);
                    assert.equal(12.3365, wgs84parser.isCoordinate("12.3365 52.336982").y);

                    assert.equal(false, isNumber(wgs84parser.isCoordinate("12.3635 52.33XX6982")));
                    assert.equal(false, isNumber(wgs84parser.isCoordinate("a12.3635 52.336982")));

                    assert.equal(true, isNumber(wgs84parser.isCoordinate("12.3365 52.336982"))); // space
                    assert.equal(true, isNumber(wgs84parser.isCoordinate("12.3365,52.336982"))); // comma
                    assert.equal(true, isNumber(wgs84parser.isCoordinate("12.3365, 52.336982")));
                    assert.equal(true, isNumber(wgs84parser.isCoordinate("12.3365, 52.")));
                    assert.equal(true, isNumber(wgs84parser.isCoordinate("12.3365, .52")));
                    assert.equal(true, isNumber(wgs84parser.isCoordinate("12.3365;52.336982"))); // ;
                    assert.equal(false, isNumber(wgs84parser.isCoordinate("12.3365.52.336982"))); // point

                    assert.equal(true, isNumber(wgs84parser.isCoordinate("12,3365 52,336982"))); // space
                    assert.equal(false, isNumber(wgs84parser.isCoordinate("12,3365,52,336982"))); // comma
                    assert.equal(false, isNumber(wgs84parser.isCoordinate("12,3365, 52,336982")));
                    assert.equal(true, isNumber(wgs84parser.isCoordinate("12,3365. 0,52")));
                    assert.equal(true, isNumber(wgs84parser.isCoordinate("12,3365;52,336982"))); // ;
                    assert.equal(true, isNumber(wgs84parser.isCoordinate("12,3365.52,336982"))); // point

                    assert.equal(true, isNumber(wgs84parser.isCoordinate("12 52.336982")));
                    assert.equal(true, isNumber(wgs84parser.isCoordinate("5 52.336982")));
                    assert.equal(20, wgs84parser.isCoordinate("80,20").x);
                    assert.equal(80, wgs84parser.isCoordinate("80,20").y);
                    assert.equal(80.123, wgs84parser.isCoordinate("80.123,20").y);

                    assert.equal(true, wgs84parser.isValidCoordinatePair("12.3635,52.336982"));
                    assert.equal(true, wgs84parser.isValidCoordinatePair("12,3635 52,336982"));
                    assert.equal(false, wgs84parser.isValidCoordinatePair("120.3635,52.336982"));
                    assert.equal(false, wgs84parser.isValidCoordinatePair("120,3635 52,336982"));
                    assert.equal(false, wgs84parser.isValidCoordinatePair("12.3635,520.336982"));
                    assert.equal(false, wgs84parser.isValidCoordinatePair("12,3635 520,336982"));

                    assert.equal(true, wgs84parser.isValidCoordinatePair("52,1234° - 4,3216°"));
                    assert.equal(false, wgs84parser.isValidCoordinatePair("200,1234° - 4,3216°"));

                }
            });
    }
);