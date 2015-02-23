define({ root: /*
 * COPYRIGHT 2011 con terra GmbH Germany
 */
/**
 * @fileOverview This file contains the localized properties for this bundle
 * @author Marius Austerschulte
 */
    ({
        bundleName: "Agiv Coordinate Viewer",
        bundleDescription: "The Coordinate Viewer shows the coordinates and the spatial reference system for the current mouse position. Furthermore, the  actual map scale is shown.",
        ui: {
            coordinates: "<table><tr><td>${x}</td><td>:</td><td>${y}</td></tr><tr><td colspan='3'>${srs}</td></tr></table>",
            scale: "Scale: 1:${scale}",
            noSrs: "-"
        },
        hemispheres: {
            north: "N",
            south: "S",
            east: "E",
            west: "W"
        }
    }),
    "nl": true
});