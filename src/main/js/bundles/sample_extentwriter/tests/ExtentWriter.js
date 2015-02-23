/* 
 *  Copyright (C) con terra GmbH (http://www.conterra.de)
 *  All rights reserved
 */
define([
    "intern!object",
    "intern/chai!assert",
    "module",
    "../ExtentWriter"
], function (registerSuite, assert, md, ExtentWriter) {
    registerSuite({
        name: md.id,
        "test extent correct formated": function () {
            var ew = new ExtentWriter();
            ew.set("extent", {
                xmin: 1,
                xmax: 2,
                ymin: 3,
                ymax: 4
            });
            // the output is locale dependent so we need to use an regular expression
            //assert.equal(ew.get("extenttxt"), "1.000; 3.000 - 2.000; 4.000");
            assert(ew.get("extenttxt").match(/^1.000; 3.000 - 2.000; 4.000$/));
        }
    });
});

