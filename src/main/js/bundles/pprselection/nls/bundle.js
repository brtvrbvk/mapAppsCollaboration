define({ root: ({
    bundleName: "PPR Selection",
    bundleDescription: "Selects pre-purchase rights of clicked parcels",
    stores: {
        noValue: "No value",
        agivSearchStore: {
            name: "AGIV Geolocator",
            description: "AGIV Geolocator",
            placeHolder: "Enter location search string..."
        },
        agivParcelByIDSearchStore: {
            name: "AGIV Parcel Search",
            description: "AGIV Parcel Search",
            placeHolder: "Enter parcel id..."
        }
    },
    ui: {
        content: {
            pprinfo: {
                detailViewButtonLabel: "Detail",
                parcelID: "Parcel ID",
                beneficiary: "Beneficiary",
                type: "Type",
                order: "Order",
                startDate: "Period start",
                endDate: "Period end",
                title: "Pre-purchase right",
                municipality: "Municipality",
                result: "Result ${index} of ${total}",
                noLimit: "No end of period defined"
            }
        },
        unsupportedTitle: "Opgelet",
        unsupported: "Het afdrukken wordt in deze browser (${useragent}) niet ondersteund en zal mogelijk niet correct werken. Gebruik bij voorkeur deze toepassing met Internet Explorer vanaf versie 9 (niet in compatibiliteitsweergave), Google Chrome of Firefox.",
        addressTextNoPPR: "Geen recht van voorkoop van toepassing op ${date} op het perceel ${parcelnumber}.",
        addressTextPPR: "Van toepassing op ${date} op het perceel ${parcelnumber}.",
        toParcelInfo: "go to parcel info",
        pprInfoTool: "Pre-purchase right info",
        result: {
            type: "PPR INFO"
        },
        printTip: "Printen",
        printResultBtn: {
            title: "Print resultaat"
        },
        endTip: "Terug naar het laatste kaartbeeld",
        noDataMessage: "Geen voorkooprecht van toepassing op dit perceel.",
        disclaimer: "De informatie op deze kaart is verkregen via het Geoloket RVV-themabestand van het AGIV en kan uitsluitend gebruikt worden binnen het kader van het Harmoniseringsdecreet Rechten van Voorkoop, in het bijzonder de bekendmaking van het Geografisch themabestand 'Vlaamse voorkooprechten'. U kan alleen kennis nemen van de informatie. Noch het AGIV, noch de bronhouders van de informatie, kunnen aansprakelijk gesteld worden voor onjuistheden of onvolledigheden in de verstrekte informatie, het gebruik en de werking van het geoloket of de gevolgen daarvan.",
        parcelIdTitle: "PARCEL-ID",
        addressTitle: "ADDRESS"
    }
}),
    "nl": true
});