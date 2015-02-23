define(
    /*
     * COPYRIGHT 2011 con terra GmbH Germany
     */
    /**
     * @fileOverview This file contains the localized properties for this bundle
     * @author Marius Austerschulte
     */
    ({
        bundleName: "Agiv coordinate viewer",
        bundleDescription: "The Coordinate Viewer shows the coordinates and the spatial reference system for the current mouse position. Furthermore, the  actual map scale is shown.",
        ui: {
            coordinates: "${lat}  -  ${lon}",
            lambertCoordinates: "${x} m - ${y} m",
            scale: "Schaal: 1 : ${scale}",
            noSrs: "-",
            lambert72: "Lambert72",
            wgs84: "WGS84",
            webMercator: "Web Mercator",
            dms: "DMS",
            degree: "graden"
        },
        hemispheres: {
            north: "NB",
            south: "Z",
            east: "OL",
            west: "W"
        }
    })
);