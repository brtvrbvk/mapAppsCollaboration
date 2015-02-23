define([],
    function () {
        return {
            /**
             * Returns a string from the specified address object as returned by the POI service
             * http://poi.beta.geopunt.be
             *
             * @param address
             * @param streetAndCitySeparator
             * @returns {string}
             */
            getFormattedAddress: function(address, streetAndCitySeparator) {
                streetAndCitySeparator = streetAndCitySeparator != undefined ? streetAndCitySeparator : ", ";
                if (address && address.postalcode && address.municipality) {
                    var zipAndCity = address.postalcode + " " + address.municipality;
                    if (address.street) {
                        return address.street + " " + address.streetnumber + streetAndCitySeparator + zipAndCity;
                    }
                    return zipAndCity
                }
                return  "";
            }
        }
    });