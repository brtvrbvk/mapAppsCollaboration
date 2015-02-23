define(
    ({
        bundleName: "PPR Selection",
        bundleDescription: "Selects pre-purchase rights of clicked parcels",
        stores: {
            noValue: "Geen waarde",
            agivSearchStore: {
                name: "AGIV Geolocator",
                description: "AGIV Geolocator",
                placeHolder: "Enter location search string..."
            },
            agivParcelByIDSearchStore: {
                name: "AGIV Zoek naar perceel",
                description: "AGIV Zoek naar perceel",
                placeHolder: "Tik hier het gezochte perceel in..."
            }
        },
        ui: {
            content: {
                pprinfo: {
                    detailViewButtonLabel: "Detail",
                    parcelID: "Perceel-ID",
                    beneficiary: "Begunstigde",
                    type: "Soorttype",
                    order: "Volgorde begunstigde",
                    startDate: "Begindatum",
                    endDate: "Einddatum",
                    title: "Voorkooprecht RVV-themabestand, AGIV",
                    municipality: "Gemeente",
                    result: "Resultaat ${index} van ${total}",
                    noLimit: "--"
                }
            },
            unsupportedTitle: "Opgelet",
            unsupported: "Het afdrukken wordt in deze browser (${useragent}) niet ondersteund en zal mogelijk niet correct werken. Gebruik bij voorkeur deze toepassing met Internet Explorer vanaf versie 9 (niet in compatibiliteitsweergave), Google Chrome of Firefox.",
            addressTextNoPPR: "Geen recht van voorkoop van toepassing op ${date} op het perceel ${parcelnumber}.",
            addressTextPPR: "Van toepassing op ${date} op het perceel ${parcelnumber}.",
            toParcelInfo: "Ga na of er een voorkooprecht van toepassing is op dit perceel",
            pprInfoTool: "Identificeer voorkooprecht",
            result: {
                type: "Identificeer voorkooprecht"
            },
            printTip: "Printen",
            printResultBtn: {
                title: "Print resultaat"
            },
            endTip: "Terug naar het laatste kaartbeeld",
            noDataMessage: "Geen voorkooprecht van toepassing op dit perceel.",
            disclaimer: "De informatie op deze kaart is verkregen via het Geoloket RVV-themabestand van het AGIV en kan uitsluitend gebruikt worden binnen het kader van het Harmoniseringsdecreet Rechten van Voorkoop, in het bijzonder de bekendmaking van het Geografisch themabestand 'Vlaamse voorkooprechten'. U kan alleen kennis nemen van de informatie. Noch het AGIV, noch de bronhouders van de informatie, kunnen aansprakelijk gesteld worden voor onjuistheden of onvolledigheden in de verstrekte informatie, het gebruik en de werking van het geoloket of de gevolgen daarvan.",
            parcelIdTitle: "PERCEEL-ID",
            addressTitle: "ADRES"
        }
    })
);
