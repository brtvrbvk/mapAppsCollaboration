/**
 * COPYRIGHT 2015 con terra GmbH Germany
 *
 * Created by fba on 15.01.2015.
 */
/**
 * COPYRIGHT 2015 con terra GmbH Germany
 *
 * Created by fba on 15.01.2015.
 */
define([
        "intern!object",
        "intern/chai!assert",
        "module",
        "../../BelgianLambert72Parser"
    ],
    function (
        registerSuite,
        assert,
        md,
        BelgianLambert72Parser
        ) {
        var isNumber = function (val) {
            return !val.isNaN;
        };
        registerSuite({
            name: md.id,

            test_CoordinateParsing: function () {

                var belgianlambertparser = new BelgianLambert72Parser();

                assert.equal(true, isNumber(belgianlambertparser.isCoordinate("290875.856737,69743.230376")));
                assert.equal(true, isNumber(belgianlambertparser.isCoordinate("17736.856737,245375.230376")));

                assert.equal(true, isNumber(belgianlambertparser.isCoordinate("29875.856737 69743.230376"))); // space
                assert.equal(true, isNumber(belgianlambertparser.isCoordinate("29875.856737,69743.230376"))); // comma
                assert.equal(true, isNumber(belgianlambertparser.isCoordinate("29875.856737, 69743.230376")));
                assert.equal(true, isNumber(belgianlambertparser.isCoordinate("29875.856737, 69743.")));
                assert.equal(true, isNumber(belgianlambertparser.isCoordinate("29875.856737, .230376")));
                assert.equal(true, isNumber(belgianlambertparser.isCoordinate("29875.856737;69743.230376"))); // ;
                assert.equal(false, isNumber(belgianlambertparser.isCoordinate("29875.856737.69743.230376"))); // point

                assert.equal(true, isNumber(belgianlambertparser.isCoordinate("29875,856737 69743,230376"))); // space
                assert.equal(false, isNumber(belgianlambertparser.isCoordinate("29875,856737,69743,230376"))); // comma
                assert.equal(false, isNumber(belgianlambertparser.isCoordinate("29875,856737, 69743,230376")));
                assert.equal(true, isNumber(belgianlambertparser.isCoordinate("29875,856737. 69743,")));
                assert.equal(true, isNumber(belgianlambertparser.isCoordinate("29875,856737. ,230376")));
                assert.equal(true, isNumber(belgianlambertparser.isCoordinate("29875,856737;69743,230376"))); // ;
                assert.equal(true, isNumber(belgianlambertparser.isCoordinate("29875,856737.69743,230376"))); // point

                assert.equal(29875.856737, belgianlambertparser.isCoordinate("29875.856737,69743.230376").x);
                assert.equal(29875.856737, belgianlambertparser.isCoordinate("29875.856737, 69743.230376").x);
                assert.equal(29875.856737, belgianlambertparser.isCoordinate("29875.856737 69743.230376").x);
                assert.equal(29875.856737, belgianlambertparser.isCoordinate("29875.856737 69743.230376").x);
                assert.equal(69743.230376, belgianlambertparser.isCoordinate("29875.856737 69743.230376").y);

                assert.equal(false,
                    isNumber(belgianlambertparser.isCoordinate("290875.856737,69743,230376")));
                assert.equal(false,
                    isNumber(belgianlambertparser.isCoordinate("a290875.856737,69743,230376")));
                assert.equal(false,
                    isNumber(belgianlambertparser.isCoordinate("a290875.856737,69743.230376")));
                assert.equal(false,
                    isNumber(belgianlambertparser.isCoordinate("290875.856737a69743.230376")));
                assert.equal(false,
                    isNumber(belgianlambertparser.isCoordinate("290875,856737,69743.230376")));

                assert.equal(true, belgianlambertparser.isValidCoordinatePair("290875.856737,69743.230376"));
                assert.equal(true, belgianlambertparser.isValidCoordinatePair("290875,856737 69743,230376"));
                assert.equal(false, belgianlambertparser.isValidCoordinatePair("290875.856737,269743.230376"));
                assert.equal(false, belgianlambertparser.isValidCoordinatePair("290875,856737 269743,230376"));
                assert.equal(false, belgianlambertparser.isValidCoordinatePair("350875.856737,69743.230376"));
                assert.equal(false, belgianlambertparser.isValidCoordinatePair("350875,856737 69743,230376"));

                assert.equal(true, belgianlambertparser.isValidCoordinatePair("50 123,00m - 40 000,00m"));
                assert.equal(false, belgianlambertparser.isValidCoordinatePair("50 123,00m - 40 0,00m"));

            }
        });
    }
);