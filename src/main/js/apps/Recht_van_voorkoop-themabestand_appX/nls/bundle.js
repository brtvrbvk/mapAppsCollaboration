define({
    root:
    ({
        appTitle:"RVV-themabestand",
        rvv:{
            
            tool:{
                tooltip:"Bevraag het eventuele voorkooprecht op een perceel (vanaf 1 : 15 000)",
                ppr: "Info"
            },
        
       
            dataView:{
                initialText:"Sinds 1 oktober 2012 is het Harmoniseringsdecreet in werking en moeten aanbiedingen en uitoefeningen via het e-voorkooploket van de VLM verlopen.<Br/><u>Belangrijk:</u> De rangschikking van de begunstigden die een identieke volgorde hebben in onderstaande lijst is willekeurig en doet geen uitspraak over de volgorde van uitoefenen.",
                addressTextPPR:"Recht van voorkoop van toepassing op {date} op het perceel {parcelnumber}.<Br/>Dichtstbijzijnde adres: {address}.",
                addressTextNoPPR:"Geen recht van voorkoop van toepassing op {date} op het perceel {parcelnumber}<Br/>Dichtstbijzijnde adres: {address}."
            },
            
            map:{
                operational:{
                    agiv:{
                        title: "Geoloket RVV-themabestand",
                        description: "Agiv RVV Feature Service",
                        municipalborders:{
                            title: "Gemeentegrenzen"
                        },
                        kleinschalig:{
                            title:"RVV-afbakeningen (\u2264 1 : 15 000)"
                        },
                        grootschalig:{
                            title:"RVV-afbakeningen (> 1 : 14 999)"
                        },
                        RVVPercelen:{
                            title: "RVV-themabestand"
                        },
                        parcels:{
                            title:"CADMAP"
                        }
                    }
                }
            },
            
            resultcenter:{
                fields:{
                    type:"Soorttype",
                    beneficiary:"begunstigde",
                    parcelID:"Perceel-ID",
                    startDate:"begindatum",
                    endDate:"einddatum",
                    order:"volgorde begunstigde",
                    id:"id"
                }
            }
        }
    })

    ,
    "nl":true
});