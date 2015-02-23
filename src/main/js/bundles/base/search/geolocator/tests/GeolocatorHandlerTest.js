/**
 * COPYRIGHT 2012-2013 con terra GmbH Germany
 *
 * User: fba
 * Date: 13.01.2014
 * Time: 14:24
 */
define([
        "doh",
        "../GeolocatorHandler"
    ],

    function (
        doh,
        GeolocatorHandler
        ) {

        doh.register("agiv.geolocator.GeolocatorHandler Tests", [
            {
                name: "GeolocatorHandler _isParcel",
                timeout: 5000,

                runTest: function () {

                    var handler = new GeolocatorHandler();

                    doh.assertEqual(true, handler._isParcel("44804D0018/00G000"));
                    doh.assertEqual(true, handler._isParcel("56985X0018/00G012"));
                    doh.assertEqual(false, handler._isParcel("56985X0018\\00G012"));
                    doh.assertEqual(false, handler._isParcel("5698X0018/00G012"));
                    doh.assertEqual(false, handler._isParcel("44804D0018/00G"));
                    doh.assertEqual(false, handler._isParcel("44804D0018/00000"));
                    doh.assertEqual(false, handler._isParcel("44804D001800G000"));

                }
            }
        ]);
    });