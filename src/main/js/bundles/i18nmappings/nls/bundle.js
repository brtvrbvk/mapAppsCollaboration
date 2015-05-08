define(["dojo/i18n!esri/nls/jsapi"], function (esri_bundle) {
    esri_bundle.widgets.overviewMap.NLS_drag = "slepen";
    return {
        root: ({
            //BUNDLE TRANSLATIONS AGIV

            accesspanel: {
                toolTip: "Info",
                ui: {
                    result: "Resultaat"
                }
            },

            accesspanel_poi: {
                ui: {
                    title: "Point of Interest",
                    label: "Naam: ",
                    description: "Beschrijving: ",
                    category: "Categorie: ",
                    routing: "Routebeschrijving: ",
                    from: "vanaf dit punt",
                    to: "naar dit punt"
                }
            },

            copyright_agiv: {
                ui: {
                    currentDate: "${date}",
                    tooltip: "Copyright",
                    title: "${date} - <a href=\"http://www.agiv.be/gis/diensten/geo-vlaanderen/?artid=1876\" target=\"_blank\">Bronnen</a>"
                }
            },
            coordinateparser:{
                ui:{
                    errorMessage: "Coordinaten als parameter kan slechts éénmaal gebruikt worden.",
                    invalidMessage: "Coordinaten ${coordinate} als parameter niet gevonden.",
                    searchTypes: {
                        COORDINATE_4326: "WGS84 coordinate",
                        COORDINATE_31370: "Belgian Lambert 72 coordinate"
                    }
                }
            },

            legend_agiv: {
                tool: {
                    title: "Legend",
                    tooltip: "Legend"
                },
                ui: {
                    createLegend: "Creating legend...",
                    noLegend: "No legend"
                }
            },

            agivsearch: {
                stores: {
                    noValue: "No value",
                    agivSearchStore: {
                        name: "AGIV Geolocator",
                        description: "AGIV Geolocator",
                        placeHolder: "Enter location search string...",
                        switchStoreCommand: "Search outside Vlaanderen en Brussel"
                    },
                    agivParcelByIDSearchStore: {
                        name: "AGIV Parcel Search",
                        description: "AGIV Parcel Search",
                        placeHolder: "Enter parcel id..."
                    },
                    navteqStore: {
                        name: "NAVTEQ Geolocator",
                        description: "NAVTEQ Geolocator",
                        placeHolder: "Enter navteq search",
                        switchStoreCommand: "Search inside Vlaanderen en Brussel"
                    }
                },
                ui: {
                    tooltips: {
                        reset: "Remove result",
                        magnifier: "Zoom to result",
                        submit: "Submit query",
                        settings: "Change search topic"
                    },
                    settings: "Settings",
                    settingsWidget: {
                        title: "Available search topics"
                    },
                    error: "Error while performing search!"
                },
                defaultInfoTemplate: {
                    title: "Search result",
                    content: "${title}"
                }
            },

            navteqrouting: {
                ui: {
                    calculate: "Calculate route"
                },
                error: "Error while requesting the route service, please change the input parameter."
            },

            genericidentify: {
                ui: {
                    feature: "Object",
                    contentInfoWindowTitle: "Info",
                    noResultsFound: "No objects were found in this location.",
                    noAttributes: "There is no information available.",
                    loadingInfoText: "Infos are loading...",
                    layer: "Layer",
                    noQueryLayersFound: "No Layers queryable!",
                    formatNotSupported: "Het formaat ${format} met meer info over de laag wordt niet ondersteund",
                    graphicsLayerTitle: "Graphics",
                    loadingGeneralInfo: "Loading..",
                    cityLevel: "De aangeklikte locatie ligt in ",
                    addressLevel: "Dichtstbijzijnd adres: ",
                    activeLayers: "Actieve lagen:",
                    serviceErrorMsg: "An error occured",
                    showGeneralInfo: "Toon info",
                    hideGeneralInfo: "verberg info",
                    showDescription: "Beschrijving...",
                    hideDescription: "verberg beschrijving",
                    showRoute: "Routebegeleiding",
                    showNearby: "Info in de buurt",
                    profileSheets: "profielschets van ",
                    infoAbout: "Volgende informatie is van toepassing op de aangeklikte locatie:",
                    windowTitle: "Een probleem melden",
                    moreInformationPOI: "Meer info over ${name}",
                    descriptionLabel: "Beschriving",
                    noteLabel: "Note",
                    more: "meer",
                    less: "minder",
                    routeTo: "Routing naar deze locatie",
                    routeFrom: "Routing vanaf deze locatie",
                    crabErrorMessage: "Coordinate not within Flanders or Brussels.",
                    loadErrorMessage: "Could not load geolocation page.",
                    featureInfoToolTitle: "Info",
                    featureInfoToolTooltip: "Toon meer informatie over een locatie",
                    addressTitle: "Adres"
                }
            },

            historicmaps: {
                ui: {
                    tools: {
                        magnifier: {
                            title: "Historic maps",
                            tooltip: "Show maps"
                        }
                    },
                    labelTitle: "Background"
                }
            },

            doublemap: {
                ui: {
                    labelTitle: "Achtergrond"
                }
            },

            applinks: {
                ui: {
                    applinkstool: {
                        title: "Geoloket",
                        tooltip: "Open een Geoloket"
                    },
                    nodescription: "No description available"
                },
                headlines: {
                    headline1: {
                        title: "Positiebepaling - Referentiegegevens"
                    },
                    headline2: {
                        title: "Cultureel Erfgoed"
                    },
                    headline3: {
                        title: "Milieu"
                    },
                    headline4: {
                        title: "Administratie & Statistieken"
                    },
                    headline5: {
                        title: "Economie"
                    },
                    headline6: {
                        title: "Landbouw"
                    },
                    headline7: {
                        title: "Ruimtelijke planning"
                    },
                    headline8: {
                        title: "Recht van Voorkoop"
                    },
                    headline9: {
                        title: "Verkeer"
                    }
                },
                applink: {
                    kleurenortho1: {
                        title: "Middenschalige kleurenorthofoto's",
                        description: "Vlaanderen in kaart: kwalitatief hoogwaardige middenschalige orthofotobedekking voor de provinciale grondgebieden."
                    },
                    zomervlucht: {
                        title: "Middenschalige kleurenortho's zomeropname",
                        description: "Vlaanderen in kaart: aardobservatie is een krachtig instrument, maar het is vooral de integratie van aardobservatiegegevens in een GIS-omgeving die vele perspectieven biedt."
                    },
                    ikonos: {
                        title: "IKONOS-satellietbeelden",
                        description: "Vlaanderen in kaart: aardobservatie is een krachtig instrument, maar het is vooral de integratie van aardobservatiegegevens in een GIS-omgeving die vele perspectieven biedt."
                    },
                    straten: {
                        title: "Stratengids - Positiebepaling",
                        description: "Dit geoloket laat toe een straat op te zoeken in Vlaanderen. Tevens kan u door op de pijl en daarna op de kaart te klikken de X en Y co\u00F6rdinaten op te zoeken van een punt. Deze kan u toevoegen aan een ';' gescheiden lijst. Deze kan u knippen en plakken in een ascii editor en importeren in uw eigen databank of GIS-toepassing."
                    },
                    fvp: {
                        title: "Flepos verdichtingspunten",
                        description: "In dit geoloket kun je FLEPOS-verdichtingspunten consulteren. Bij het selecteren van \u00E9\u00E9n of meerdere FVP-punten worden de co\u00F6rdinaten in ETRS89 en Lambert 72 (BEREF2003), een aantal  beschrijvende attributen, een foto en/of meetschets en een overzichtskaart van de geselecteerde punten getoond in een pdf-bestand. Je kunt deze informatie ook downloaden als html-bestand."
                    },
                    vha: {
                        title: "Vlaamse Hydrografische Atlas (VHA)",
                        description: "Dit loket verzamelt de VHA bestanden, met name de digitale vectori\u00EBle bestanden van de Vlaamse Hydrografische Atlas en aanverwante datasets."
                    },
                    dhm: {
                        title: "Digitaal Hoogtemodel Vlaanderen (DHM)",
                        description: "Dit loket biedt de mogelijkheid de hoogtegegevens van Vlaanderen, onder vorm van een raster met celgrootte 100m, te combineren met een aantal referentiegegevens zoals topografische kaarten, stratenatlas en orthofoto's."
                    },
                    grb: {
                        title: "Grootschalig referentiebestand",
                        description: "De GRB-gegevens worden aangemaakt in het kader van het decreet houdende het Grootschalig Referentie Bestand zoals afgekondigd door de Vlaamse Regering op 16 april 2004. Ze komen initieel tot stand via centrale overheidsopdrachten (de zogenaamde 'initiele GRB-kartering') die per GRB-projectzone worden gestuurd. Er is een bijhouding voorzien van de GRB-gegevens. Dit geoloket laat toe de beschikbare GRB-gegevens van de datasetgroep GRB (GIS-bestanden) te visualiseren en te bevragen. Daarnaast kan men de lagen met de vooropgestelde planning, de stand van zaken in de fasen van aanmaak en bijhouding aanvinken vanaf het overzichtsvenster Vlaanderen."
                    },
                    landschapsatlas1: {
                        title: "Beschermd Erfgoed 1/10.000",
                        description: "De Afdeling Monumenten en Landschappen staat in voor de voorbereiding en de uitvoering van het beleid inzake het cultureel erfgoed in Vlaanderen. De afdeling zorgt meer bepaald voor de inventarisering , de bescherming en het beheer van het onroerend erfgoed - monumenten, landschappen, stads- en dorpsgezichten - en van de roerende cultuurgoederen die zich in monumenten bevinden. Zij verzorgt ook de communicatie en de sensibilisatie omtrent het erfgoedbeleid en beschikt over een uitgebreid documentatiecentrum."
                    },
                    landschapsatlas: {
                        title: "Onroerend Erfgoed",
                        description: "De Afdeling Monumenten en Landschappen staat in voor de voorbereiding en de uitvoering van het beleid inzake het cultureel erfgoed in Vlaanderen. De afdeling zorgt meer bepaald voor de inventarisering , de bescherming en het beheer van het onroerend erfgoed - monumenten, landschappen, stads- en dorpsgezichten - en van de roerende cultuurgoederen die zich in monumenten bevinden. Zij verzorgt ook de communicatie en de sensibilisatie omtrent het erfgoedbeleid en beschikt over een uitgebreid documentatiecentrum."
                    },
                    bwk: {
                        title: "Biologische Waarderingskaart, versie 2",
                        description: "Dit geoloket toont de biologische waarderingskaart van het <a href='http://www.inbo.be/content/homepage_nl.asp' target='_blank'>Instituut voor Natuur en Bosonderzoek</a>. Naast de gebruikelijke informatie omtrent het al dan niet biologisch waardevol zijn van een perceel of gebied, vind je er gegevens over de actuele bodembedekking en de voorkomende biotopen. De biologische waarderingskaart is momenteel geactualiseerd als een uniforme en gebiedsdekkende inventaris van de Vlaamse biotopen en het Vlaams grondgebruik."
                    },
                    bodemkaart: {
                        title: "Bodemkaart",
                        description: "Dit geoloket toont de digitale versie van de bodemkaart voor Vlaanderen. Ook de bodemgeschiktheidskaarten voor land- en tuinbouw zijn te bevragen. Het geoloket werd opgebouwd in samenwerking met de afdeling Land en Bodembescherming, Ondergrond, Natuurlijke Rijkdommen van het departement Leefmilieu, Natuur en Energie van de Vlaamse overheid."
                    },
                    bossen: {
                        title: "Boskartering & Speelzones in bossen en natuurreservaten",
                        description: "De boskartering 1990 is uitgevoerd door Eurosense Technologies op basis van (1) visuele interpretaties van kleurinfrarode luchtfoto's uit de periode 1978-1990 en (2) terreincontroles. De boskartering 1990 bevat naast een geografische component (de bospolygonen met hun respectievelijke georeferentie) ook een beschrijvende component (de kenmerken: boomsoort, eigenaarsklasse, gemeente, houtvesterij, e.d.)."
                    },
                    DOVInternet: {
                        title: "Databank Ondergrond Vlaanderen",
                        description: "external to be descripted..."
                    },
                    kwetsbaarheidskaarten: {
                        title: "Ecosysteemkwetsbaarheidskaarten",
                        description: "Door ecologische informatie te integreren naar een ruimtelijk niveau, kan een kwetsbaarheid cartografisch weergegeven worden."
                    },
                    ven: {
                        title: "Gebieden van het VEN en het IVON",
                        description: "Dit geoloket toont de VEN- en IVON-gebieden. Het betreft gebieden die de Vlaamse Regering afbakende in uitvoering van het Decreet betreffende het Natuurbehoud en het Natuurlijk Milieu van 21 oktober 1997 en het Ruimtelijk Structuurplan Vlaanderen. De gebieden van het VEN en het IVON vormen samen een netwerk van waardevolle natuurgebieden in Vlaanderen. Binnen deze gebieden wordt een beleid gevoerd dat gericht is op de instandhouding van de natuur, met specifieke beschermingsmaatregelen en middelen. <br/>Het ge\u00EFntegreerd bestand van de VEN- en IVON-gebieden wordt gerealiseerd door en is eigendom van het Agentschap voor Natuur en Bos."
                    },
                    natura2000: {
                        title: "Natura 2000",
                        description: "Dit geoloket toont de digitale afbakeningen van de speciale beschermingszones in uitvoering van de Europese Richtlijnen 92/43/EEG (Habitatrichtlijn) en 2009/147/EG (Vogelrichtlijn): de habitatrichtlijngebieden (SBZ-H) en de vogelrichtlijngebieden (SBZ-V)."
                    },
                    signaalkaart: {
                        title: "Vlaamse risicoatlas vogels-windturbines",
                        description: "external to be descripted..."
                    },
                    waterkwaliteit: {
                        title: "Waterkwaliteit",
                        description: "Dit geoloket geeft een geografisch overzicht van de meetpunten van de <a href='http://www.vmm.be/' target='_blank>'Vlaamse Milieumaatschappij</a>, Afdeling Water en de visdatabank van het <a href='http://www.inbo.be/content/homepage_nl.asp' target='_blank'>Instituut voor Natuur en Bosonderzoek</a> (INBO). Bij het opvragen van de meetpunten wordt de gebruiker doorverwezen naar de respectievelijke databanken van de deelnemers aan dit geoloket. Op deze manier beschikt de gebruiker over de meest recente gegevens."
                    },
                    watertoets2012: {
                        title: "Watertoets en overstromingskaarten",
                        description: "Dit loket verzamelt een aantal kaarten in verband met de waterproblematiek. </br>Het gaat hierbij in de eerste plaats om de nieuwe Watertoetskaart Overstromingsgevoelige gebieden (versie 2011), die getoond wordt samen met de verzekeringsrisicokaart. </br>In de tweede plaats vindt u de Overstromingsgebieden van Vlaanderen: met name de Recent Overstroomde Gebieden (ROG), de plaatsen die aan terugkerende en belangrijke overstromingen blootgesteld werden of kunnen blootgesteld worden (Risicozones voor overstromingen (verzekeringsrisicozones)) en de van Nature Overstroombare Gebieden (NOG). </br>Daarnaast wordt ook de meest recente overstroming, waarvan het overstromingsgebied in kaart werd gebracht, tijdelijk aangeboden."
                    },
                    intercomm: {
                        title: "Intergemeentelijke Samenwerkingsverbanden",
                        description: "Dit geoloket geeft een overzicht van de welke intercommunales werkzaam zijn in welke gemeentes en voor welke activiteiten zij instaan. Informatie omtrent deze intercommunales zoals adresgegevens en verdere informatie worden eveneens weergegeven."
                    },
                    gemeentefinancien2000: {
                        title: "Gemeentefinanci\u00EBn2000",
                        description: "Via dit geoloket kan de gebruiker financi\u00EBle gegevens opvragen over de 308 Vlaamse gemeenten. Deze financi\u00EBle gegevens zijn gebaseerd op de elektronisch doorgestuurde jaarrekeningen van de gemeenten en hebben betrekking op de definitieve toestand van het jaar 2000."
                    },
                    bedrijventerreinen: {
                        title: "Bedrijventerreinen Vlaanderen",
                        description: "Met dit geoloket wordt een overzicht gegeven van de ligging en structuur van de bedrijventerreinen in Vlaanderen. De gegevens over de bedrijventerreinen zijn oorspronkelijk afkomstig van de digitale gewestplannen. Van deze terreinen (excl. de zeehavengebieden Havengeul2 in Nieuwpoort, Haven van Oostende + Plassendale + Blauwe Sluis, Haven van Gent, Waaslandhaven) wordt de bijkomende inhoud (de interne infrastructuur, de bezetting en beschikbaarheid) continu bijgehouden door het Agentschap Ondernemen (AO). Het AO is een Vlaams Agentschap dat opgericht werd in het kader van Beter Bestuurlijk Beleid dat de bedrijfsbegeleidingsdiensten van de Gewestelijke Ontwikkelingsmaatschappijen (GOM\u2019s) en het Vlaams Instituut voor Zelfstandig Ondernemen (VIZO) samenbrengt. AO heeft \u00E9\u00E9n hoofdzetel in Brussel en vijf provinciale, directies in de provinciehoofdsteden."
                    },
                    landbouwgebieden: {
                        title: "Bemestingsgebieden",
                        description: "Dit geoloket toont de bemestingsgebieden en de geregistreerde landbouw-gebruikspercelen met aanduiding van de erop geldende bemestingsnormen en uitrijregeling voor 2006."
                    },
                    bodemgebruik: {
                        title: "Bodemgebruikskaart",
                        description: "Met dit geoloket kan het bodembedekkingbestand en het bodemgebruiksbestand alsook het satellietbeeldmateriaal waarvan het is afgeleid gevisualiseerd en bevraagd worden."
                    },
                    gwp: {
                        title: "Gewestplan",
                        description: "Gelijklopend met het beschikbaar stellen van de digitale versie van de gewestplannen, worden deze via een geoloket beschikbaar gesteld. Dit geoloket laat toe de definitieve versie van de gewestplannen te visualiseren en te bevragen. De digitale versie van het gewestplan kwam tot stand door de integratie van enerzijds de digitale versie van de oorspronkelijke gewestplannen (KB's 1976 - 1980) met de gewestplanwijzigingen tot en met 01/01/2002 en bijwerkingen tot 02/05/2011."
                    },
                    rup: {
                        title: "Ruimtelijke Uitvoeringsplannen",
                        description: "Dit geoloket toont de goedgekeurde gewestelijke ruimtelijke uitvoeringsplannen voor een deel of delen van het grondgebied van het Gewest zoals vastgelegd in het decreet van 18 mei 1999. Deze plannen worden gerealiseerd door en zijn eigendom van het Departement Ruimtelijke Ordening, Woonbeleid en Onroerend Erfgoed."
                    },
                    rvv: {
                        title: "Recht van voorkoop",
                        description: "Dit geoloket toont waar Recht Van Voorkoop betreffende natuur, ruilverkavelingen, Vlaamse Wooncode, ruimtelijke ordening, havendecreet, integraal waterbeleid en Waterwegen en Zeekanaal NV geldig is in Vlaanderen. De Vlaamse overheid heeft in bepaalde gebieden een 'recht van voorkoop'. Als zij dit recht uitoefent, verwerft zij in de plaats van de kandidaat-koper de aangeboden landeigendommen. Zij betaalt dan de biedprijs van de kandidaat koper."
                    },
                    reisinfo: {
                        title: "Trajecten en haltes De Lijn",
                        description: ""
                    },
                    bing: {
                        title: "Bing Maps",
                        description: ""
                    },
                    google: {
                        title: "Google Maps",
                        description: ""
                    },

                    kleurenortho2: {
                        title: "Middenschalige kleurenorthofoto's",
                        description: "Vlaanderen in kaart: kwalitatief hoogwaardige middenschalige orthofotobedekking voor de provinciale grondgebieden."
                    }
                }
            },

            splashscreen: {
                loadTitle: "De kaart wordt geladen.",
                loadBundle: "{percent}%"
            },

            appsoverview_agiv: {
                dataViewCommon: {
                    noDataMessage: "No apps available.",
                    filter: {
                        menuDefaultLabel: "All",
                        textBoxPlaceHolder: ""
                    },
                    pager: {
                        backButtonTooltip: "Previous page",
                        forwardButtonTooltip: "Next page",
                        firstButtonTooltip: "First page",
                        lastButtonTooltip: "Last page",
                        pageLabeltext: "Page:",
                        pageSizeLabelText: "Items ${pageStartItemNumber}-${pageEndItemNumber} of ${itemCount}:"
                    }
                },
                appsTool: {
                    title: "Apps",
                    desc: "List of Apps"
                },
                appsView: {
                    id: "Name",
                    title: "Title",
                    desc: "Description",
                    filename: "File",
                    modifiedBy: "Modified By",
                    modifiedAt: "Modified At"
                }
            },

            appstoggler_agiv: {
                ui: {
                    itemTooltip: "Select ${appname}"
                }
            },

            browsercheck: {
                notifier: {
                    title: "Warning",
                    warning: "Not supported browser version detected: ${userAgent}!",
                    zoomMessage: "Your browser uses a zoomed view. Some componenets might not work correctly under these circumstances."
                }
            },

            clearselection: {
                clearSelectionHandler: {
                    title: "Clear Selection",
                    description: "Clear selections."
                }
            },

            "devicecheck": {
                notifier: {
                    deviceMessage: "This application is currently being optimized for use on tablets, smartphones and desktop smaller screens. This means that some features within the application may not work properly. However, this does not affect the accuracy of the data displayed by the application."
                }
            },

            disclaimer: {
                ui: {
                    title: "Disclaimer",
                    acceptButton: "Sluiten",
                    disclaimer: "<p>De toegang tot de informatie op dit geoloket is publiek en kosteloos.</p>" +
                        "<p>De informatie kan uitsluitend gebruikt worden binnen het kader van het Harmoniseringsdecreet Rechten van Voorkoop, in het bijzonder de bekendmaking van het Geografisch themabestand 'Vlaamse voorkooprechten'.</p>" +
                        "<p>U kan alleen kennis nemen van de medegedeelde informatie.</p>" +
                        "<p>Noch het AGIV, noch de bronhouders van de informatie, kan(kunnen) aansprakelijk gesteld worden voor onjuistheden of onvolledigheden in de verstrekte informatie, het gebruik en de werking van dit geoloket of de gevolgen daarvan.</p>"
                }
            },

            drawing_agiv: {
                ui: {
                    addBtn: "Bewaar",
                    elevationBtn: "Height profile",
                    comment: "Comment geometry",
                    textBoxPlaceHolder: "Wijzig de naam van de geometrie",
                    commentWindowTitle: "Geometry",
                    addCommentWindowTitle: "Add a comment to the geometry",
                    "type": "Geometrytype:",
                    "area": "Oppervlakte:",
                    "length": "Length:",
                    "types": {
                        "polygon": "Veelhoek",
                        "point": "Punt",
                        "polyline": "Lijn"
                    },
                    "remainingCharacters": "Remaining characters:",
                    drawpointtool: "Teken een punt",
                    drawmultipointtool: "Points: Draws multiple points",
                    drawlinetool: "Line: Draws a straight line",
                    drawpolylinetool: "Teken een lijn",
                    drawfreehandpolylinetool: "Freeform Polyline: Draws a freeform polyline",
                    drawpolygontool: "Teken een veelhoek",
                    drawfreehandpolygontool: "Teken een vrije vorm",
                    drawextenttool: "Free Rectangle: Draws a freeform rectangle",
                    drawcircletool: "Circle: Draws a circle",
                    drawellipsetool: "Ellipse: Draws an ellipse",
                    drawrectangletool: "Rectangle: Draws a rectangle",
                    drawleftarrowtool: "Left Arrow: Draws a left arrow",
                    drawrightarrowtool: "Right Arrow: Draws a right arrow",
                    drawuparrowtool: "Up Arrow: Draws an up arrow",
                    drawdownarrowtool: "Down Arrow: Draws a down arrow",
                    drawtriangletool: "Triangle: Draws a triangle",
                    drawerasealltool: "Delete all sketches",

                    defaultInfoTemplate: {
                        title: "Drawing Toolset",
                        template: "<div><span>ID: ${id}</span><br/><span>Type:${geometryType}</span></div>"
                    }
                }
            },

            extrainfo: {
                ui: {
                    nodescription: "No description available"
                },
                extrainfo: {
                    title: "Extra information",
                    description: "Click here for more information."
                }
            },

            geopunt: {
                catalogueNodeName: "Added from catalogue",
                maximizeViewer: {
                    title: "Maximaliseer het kaartbeeld",
                    minimizeTooltip: "Minimaliseer het kaartbeeld"
                }
            },

            gipod: {
                ui: {
                    docktool: {
                        title: "Verfijnen",
                        tooltip: "Verfijnd zoeken"
                    },
                    loadingFilters: "Loading filters",
                    validation: {
                        endBeforeStart: "Datum 'tot' dient groter te zijn dan datum 'vanaf'.",
                        defineStart: "Datum 'vanaf' kan enkel vandaag zijn of een datum in de toekomst.",
                        startTooSmall: "Datum 'vanaf' kan enkel vandaag zijn of een datum in de toekomst."
                    },
                    hover: {
                        manifestation: "${count} keer andere hinder op de weg",
                        workassignment: "${count} werken"
                    },
                    identificatie: {
                        title: "Identificatie",
                        info: "Volgende informatie is van toepassing op de ${type}:",
                        scale: "Scale: 1 : ${scale}"
                    },
                    contact: {
                        title: "Contact",
                        info: "Voor verdere info betreft deze ${type} kan u contact opnemen met:"

                    },
                    diversions: {
                        title: "Omleidingen",
                        widget: "Omleiding",
                        info: "Volgende informatie is van toepassing op de ${type}:"
                    },
                    identifyTitle: "Hinder in Kaart",
                    workassignment: "werkopdrachten",
                    manifestation: "manifestatie"
                }
            },

            help: {
                ui: {
                    nodescription: "No description available"
                },
                help: {
                    title: "Opens help",
                    description: "Open help description"
                }
            },

            mapflowmetadata: {
                ui: {
                    serviceAbstract: "Samenvatting",
                    LayerList: "Lagen",
                    serviceMetadata: "Metadata",
                    serviceName: "Service",
                    serviceType: "Type Service",
                    error: "De metadatarecord kon niet door de service worden opgehaald.",
                    unknown: "Niet gekend",
                    serviceTypes: {
                        INSPIRE_VIEW: "INSPIRE View Service",
                        AGS_DYNAMIC: "Dynamic ArcGIS Server",
                        AGS_TILED: "Tiled ArcGIS Server",
                        WMS: "Web Map Service",
                        WMTS: "Web Map Tiled Service"
                    }
                }
            },

            pprselection: {
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
                    parcelIdTitle: "PARCEL-ID", //"${rvv.resultcenter.fields.parcelID}"
                    addressTitle: "ADDRESS"
                }
            },

            title: {
                operational: {
                    title: "Geselecteerde laag:",
                    noTitle: "Geen laag geselecteerd"
                },
                app: {
                    rvv: {
                        title: "",
                        value: "RVV-themabestand"
                    },
                    generic: {
                        title: "",
                        value: "Generieke Viewer"
                    }
                }
            },

            tooextenttool: {
                toExtentTool: {
                    title: "Jump to flanders",
                    tooltip: "Zooms to the extent of flanders"
                }
            },
            combicontentmanager: {
                ui: {
                    docktool: {
                        title: "Thema",
                        tooltip: "Kies thema´s en lagen"
                    },
                    thema: {
                        tooltip: "Toon/verberg thema´s"
                    },
                    layermanager: {
                        tooltip: "Toon/verberg mijn selecties"
                    },
                    description: {
                        title: "Toelichting",
                        content: "Via deze kaarttoepassing kan je nagaan of er een Vlaams voorkooprecht van toepassing is op een bepaald perceel in Vlaanderen.<br/>Je raadpleegt het  <b>Geografisch themabestand 'Vlaamse voorkooprechten'</b> (Harmoniseringsdecreet Rechten van Voorkoop - 25/05/2007). Enkel de Vlaamse voorkooprechten die in dit themabestand zijn opgenomen, kunnen ook effectief uitgeoefend worden door de begunstigden ervan.<br/><br/>Klik hier voor meer informatie over Recht van voorkoop (RVV)."
                    },
                    kiesThemas: "thema´s",
                    mijnSelecties: "Mijn Selecties",
                    graphicLayerTitle: "Mijn plaatsen",
                    operationalLayerTitle: "Mijn lagen",
                    graphicLayerManager: {
                        allLayersLabel: "Alle lagen",
                        backgroundLabel: "achtergrond",
                        overlayLabel: "mijn datalagen",
                        layersLabel: "Lagen",
                        notVisible: "laag niet zichtbaar op kaart",
                        shownPOIsLabel: "Shown",
                        totalPOIsLabel: "Total",
                        removeLayer: "Verwijder plaats",
                        switchLayerVisible: "Toon plaats",
                        switchLayerInvisible: "Verberg plaats",
                        switchAllLayersInvisible: "alle lagen onzichtbaar",
                        switchAllLayersVisible: "alle lagen zichtbaar",
                        removeAllLayers: "Verwijder al mijn plaatsen",
                        infoLayer: "Toon lijst van de kaart getoonde plaatsen over ${poitype}",
                        transparency: "Wijzig transparantie",
                        poiListItem: {
                            poiWindowTitle: "Info",
                            id: "ID",
                            primarylabel: "Naam",
                            vialink: "Meer Info"
                        },
                        visibleMinScale: "Not visible until scale \u2265 1:${scale}",
                        visibleMaxScale: "Not visible until scale \u2264 1:${scale}"
                    },
                    operationalLayerManager: {
                        allLayersLabel: "Alle lagen",
                        backgroundLabel: "achtergrond",
                        overlayLabel: "mijn datalagen",
                        layersLabel: "Lagen",
                        notVisible: "Niet zichtbaar voor dit zoomniveau",
                        shownPOIsLabel: "Shown",
                        totalPOIsLabel: "Total",
                        removeLayer: "Verwijder laag",
                        switchLayerVisible: "Toon laag",
                        switchLayerInvisible: "Verberg laag",
                        switchAllLayersInvisible: "alle lagen onzichtbaar",
                        switchAllLayersVisible: "alle lagen zichtbaar",
                        removeAllLayers: "Verwijder al mijn lagen",
                        infoLayer: "POI Info",
                        transparency: "Wijzig transparantie",
                        poiListItem: {
                            poiWindowTitle: "Info",
                            id: "ID",
                            primarylabel: "Naam",
                            vialink: "Meer Info"
                        }
                    },
                    nodescription: "No description available",
                    scale: "From scale ${maxScale} to ${minScale}",
                    searchTypes: {
                        CONTENTMODEL: "thema"
                    },
                    tree: {
                        categorytooltip: "Open layer under thema ${category}",
                        layertooltip: "${description}"
                    },
                    mapLeft: "Kaart links",
                    mapRight: "Kaart rechts",
                    switcher: {
                        mapLeftTooltip: "Klik om kaarten toe te voegen aan het linkse venster",
                        mapRightTooltip: "Klik om kaarten toe te voegen aan het rechtse venster",
                        switchButtonTooltip: "Klik om kaarten toe te voegen aan het linkse of rechtse venster"
                    }
                },
                rvv: {
                    map: {
                        operational: {
                            agiv: {
                                title: "Geoloket RVV-themabestand",
                                description: "Agiv RVV Feature Service",
                                municipalborders: {
                                    title: "Gemeentegrenzen"
                                },
                                grotkleinschalig: {
                                    title: "RVV-afbakeningen"
                                },
                                kleinschalig: {
                                    title: "RVV-afbakeningen (\u2264 1 : 15 000)",
                                    description: "Recht van voorkoop vastgesteld"
                                },
                                grootschalig: {
                                    title: "RVV-afbakeningen (> 1 : 14 999)",
                                    description: "Recht van voorkoop vastgesteld"
                                },
                                RVVPercelen: {
                                    title: "RVV-themabestand",
                                    description: "Recht van voorkoop van toepassing"
                                },
                                parcels: {
                                    title: "Digitale kadastrale percelenplannen"
                                },
                                cadmap: {
                                    title: "Perceel"
                                },
                                parcelnumbers: {
                                    title: "Kadastraal perceelnummer"
                                }
                            }
                        }
                    }
                }
            },

            poi: {
                ui: {
                    title: "Point of Interest",
                    label: "Naam: ",
                    description: "Beschrijving: ",
                    category: "Categorie: ",
                    routing: "Routebeschrijving: ",
                    from: "vanaf dit punt",
                    to: "naar dit punt",
                    clusterHover: "${count} plaatsen '${poitype}' gevonden in dit gebied",
                    searchTypes: {
                        POISUGGEST: "interessante plaats"
                    },
                    featureinfointegration: {
                        moreInformationPOI: "Meer info over ${name}",
                        descriptionLabel: "Beschriving",
                        noteLabel: "Note",
                        more: "meer",
                        less: "minder",
                        nodata: "Geen informatie beschikbaar"
                    }
                }
            },

            printhtml: {
                toolTip: "Print kaart",
                tool: {
                    title: "Print kaart",
                    toolTip: "Print kaart"
                },
                scale: "Schaal: 1 : ${scale}",
                printTip: "Print kaart",
                endTip: "Terug naar kaart",
                unsupported: "Het afdrukken wordt in deze browser (${useragent}) niet ondersteund en zal mogelijk niet correct werken. Gebruik bij voorkeur deze toepassing met Internet Explorer vanaf versie 9 (niet in compatibiliteitsweergave), Google Chrome of Firefox.",
                unsupportedTitle: "Opgelet",
                bronnenText: "Bronnen: RVV-themabestand (${date}), RVV-afbakeningen - AGIV/GDI-Vlaanderen, CADMAP (01/01/${year}) - AAPD, Middenschalige orthofoto`s - Eurosense, \u00A9 Nokia.",
                printTitle: "Geoloket RVV-themabestand (${date})",
                preparePrint: "Voorbereiden printen"
            },

            printimage: {
                ui: {
                    preparePrint: "Voorbereiden printen",
                    error: "Error",
                    printError: "An error occured while preparing the print"
                }
            },

            overviewmap: {
                tool: {
                    title: "Overview map",
                    tooltip: "Open overview map"
                }
            },

            sdi_loadservice: {
                ui: {
                    dataView: {
                        filter: {
                            menuDefaultLabel: "All",
                            textBoxPlaceHolder: ""
                        },
                        pager: {
                            backButtonTooltip: "Previous page",
                            forwardButtonTooltip: "Next page",
                            firstButtonTooltip: "First page",
                            lastButtonTooltip: "Last page",
                            pageLabeltext: "Page:",
                            pageSizeLabelText: "Items ${pageStartItemNumber}-${pageEndItemNumber} of ${itemCount}:"
                        }
                    },
                    noDataMessage: "No data availabe.",
                    fields: {
                        id: "ID",
                        title: "Title",
                        name: "Title",
                        adapter: "Service",
                        type: "Type",
                        scaleMin: "Min Scale",
                        scaleMax: "Max Scale",
                        check: "Select",
                        layer: "Layer",
                        north: "North",
                        east: "East",
                        south: "South",
                        west: "West"
                    },
                    window: {
                        title: "Load new layers"
                    },
                    tool: {
                        title: "Add new layer"
                    },
                    buttons: {
                        search: "Search",
                        clear: "Clear",
                        load: "Load",
                        back: "Back"
                    },
                    favs: "Favourites",
                    results: "Results",
                    mapModel: {
                        addedServiceCategoryTitle: "My Services"
                    },
                    help: "Help",
                    stepOne: "The services provides the following interfaces. <BR>Please select one of them, by clicking on the title!",
                    stepTwo: "The server provides multiple services. <BR>Please select one of them, by clicking on the title!",
                    stepThree: "Select one or more layers, by clicking on the title.<BR> Then choose 'LOAD'.",

                    errors: {
                        title: "Error",
                        401: "This is a secured service, please log into your account.",
                        400: "The given URL ist not a valid service.",
                        404: "The service is not reachable.",
                        118: "The service did not respond.",
                        serviceNotLoaded: "Service could not be loaded.",
                        "NOT SUPPORTED": "This URL is not supported. Please select an URL of a WMS or INSPIRE View service.",
                        noSupportedLayers: "The service does not contain layers that are supported for viewing."
                    },
                    success: {
                        serviceLoaded: "Service successfully loaded."
                    },
                    loadingService: "Service will be loaded.",
                    loadingLayer: "Layer will be loaded."
                },
                store: {
                    title: "Add Service",
                    desc: "Gets service information from a URL",
                    placeHolder: "Type URL here"
                }
            },

            splitviewmap: {
                ui: {
                    tools: {
                        magnifier: {
                            title: "Historic maps",
                            tooltip: "Historic maps"
                        }
                    },
                    labelTitle: "Basemaps"
                }
            },

            version: {
                title: "Application version"
            },

            copyright: {
                ui: {
                    title: "Copyright"
                },
                copyrights: {
                    mapquest: "Tiles Courtesy of <a href=\"http://www.mapquest.com/\" target=\"_blank\">MapQuest</a> <img src=\"http://developer.mapquest.com/content/osm/mq_logo.png\"> \u00A9 OpenStreetMap contributors <a href=\"http://www.openstreetmap.org/copyright or www.opendatacommons.org/licenses/odbl\" target=\"_blank\">Terms</a>"
                }
            },

            //BUNDLE TRANSLATIONS CORE

            notifier: {
                ui: {
                    title: "Waarschuwing",
                    tooltips: {
                        closeNotifierWindowTool: "Sluit dit bericht",
                        glueNotifierWindowTool: "Vastzetten van dit bericht"
                    }

                }
            },

            parametermanager: {
                ui: {
                    // tool:
                    encoderBtn: "Toepassingslink",
                    encoderBtnTooltip: "Toepassingslink",
                    // ui:
                    sendMail: "e-mail",
                    linkBoxTitle: "URL",
                    codeBoxTitle: "Code om in HTML te integreren",
                    mailBody: "${url}",
                    mailSubject: "Kijk naar deze kaart !"
                }
            },

            toolset: {
                ui: {
                    unsortedTools: "Allerlei",
                    defaultTools: {
                        title: "Standaardfuncties",
                        toolTip: "Acties"
                    },
                    navigationtoolset: "Navigatiefuncties",
                    sketchingTools: "Tekenfuncties",
                    measurementTool: "Meetlat",
                    printTool: "Printen",
                    identifyTool: "Identificeren",
                    pentool: "Vrij intekenen",
                    linetool: "Lijn",
                    boxtool: "Rechthoek",
                    buckettool: "Inkleuren",
                    selecttool: "Selecteren",
                    edittoolbar: "Editeren",
                    toolTip: "Acties"
                }
            },

            measurement: {
                ui: {
                    toolTitle: "Measuring",
                    finishBtnLabel: "Stop"
                }
            },

            windowmanager: {
                ui: {
                    defaultWindowTitle: "Venster",
                    closeBtn: {
                        title: "Sluit het venster"
                    },
                    minimizeBtn: {
                        title: "Minimaliseren"
                    },
                    maximizeBtn: {
                        title: "Maximaliseren"
                    },
                    restoreBtn: {
                        title: "Herstellen"
                    },
                    opacityBtn: {
                        title: "Verander de transparantie van dit venster"
                    }
                }
            },

            basemaptoggler: {
                ui: {
                    labelTitle: "Achtergrond"
                }
            },

            basemaptoggler: {
                ui: {
                    labelTitle: "Achtergrond"
                }
            },

            contentviewer: {
                ui: {
                    unknownContentError: "De inhoud is ongekend.",
                    graphicinfotool: {
                        title: "Iteminformatie",
                        desc: "Iteminformatie"
                    },
                    content: {
                        grid: {
                            detailView: "Toon details",
                            key: "Eigenschap",
                            value: "Waarde"
                        },
                        customTemplate: {
                            detailView: "Toon details"
                        }
                    }
                }
            },

            infoviewer: {
                ui: {
                    title: "Detailinfo",
                    tools: {
                        closeInfoWindowMapdeskTool: "Sluiten",
                        closeInfoWindowMapTool: "Sluiten",
                        focusMapTool: "Centreer het bevraagde perceel in het kaartbeeld",
                        attachToGeorefTool: "Plaats het info-venster terug bij de aangeklikte locatie",
                        mainActivationTool: "Locatie-informatie"
                    },
                    renderer: {
                        panoramio: {
                            title: "Images from Panoramio.com"
                        }
                    }
                }
            },

            featureinfo: {
                ui: {
                    featureInfo: {
                        noQueryLayersFound: "No queryable layers found!",
                        contentInfoWindowTitle: "Feature Info",
                        noResultsFound: "No results found.",
                        loadingInfoText: "Querying layer ${layerName} (${layerIndex} of ${layersTotal}).",
                        featureInfoTool: "Identify",
                        layer: "Layer",
                        feature: "Feature"
                    },
                    wms: {
                        emptyResult: "No results found on the WMS layer '${layerTitle}'."
                    }
                }
            },

            map: {
                ui: {
                    nodeUpdateError: {
                        info: "Het bijwerken van de service '${title}' is gefaald! Boodschap: ${error}",
                        detail: "${error}"
                    }
                }
            },

            coordinateviewer: {
                ui: {
                    coordinates: "${y} ${x} (${srs})",
                    scale: "Schaal: 1 : ${scale}",
                    noSrs: "-"
                },
                hemispheres: {
                    north: "N",
                    soutch: "Z",
                    east: "O",
                    west: "W"
                }
            },

            coordinateviewer_agiv: {
                ui: {
                    coordinates: "${lat}  -  ${lon}",
                    lambertCoordinates: "${x} m - ${y} m",
                    scale: "Schaal: 1 : ${scale}",
                    noSrs: "-"
                },
                hemispheres: {
                    north: "N",
                    south: "S",
                    east: "O",
                    west: "W"
                }
            },

            legend: {
                toolTitle: "Legende",
                toolTip: "Legende"
            },

            omnisearch: {
                ui: {
                    tooltips: {
                        reset: "Verwijder zoekresultaat",
                        magnifier: "Zoom naar resultaat",
                        submit: "Zoeken naar adres of perceel",
                        settings: "Verander de zoekmachine"
                    },
                    submit: "Zoeken naar adres of perceel",
                    settings: "Instellingen",
                    settingsWidget: {
                        title: "Beschikbare zoekmachines"
                    },
                    defaultInfoTemplate: {
                        title: "Zoekresultaat",
                        content: "${title}"
                    }
                }
            },

            search: {
                ui: {
                    placeHolder: "Insert your search location (adress/parcel) ...",
                    noValue: "No value",
                    searchTypes: {
                        GEOLOCATOR: "address"
                    }
                },
                defaultInfoTemplate: {
                    title: "Searchresult",
                    content: "${title}"
                }
            },

            resultcenter: {
                ui: {
                    dockTool: {
                        title: "Zoekresultaat",
                        tooltip: "Resultaat bevraging"
                    },
                    rectangleSelectBtn: {
                        title: "Selecteer resultaten"
                    },
                    selectAllBtn: {
                        title: "Selecteer alles"
                    },
                    deselectBtn: {
                        title: "Deselecteer"
                    },
                    removeAllBtn: {
                        title: "Verwijder resultaat"
                    },
                    removeSelectedBtn: {
                        title: "Verwijder de geselecteerde resultaten"
                    },
                    dataView: {
                        filter: {
                            menuDefaultLabel: "Alles",
                            textBoxPlaceHolder: ""
                        },
                        pager: {
                            backButtonTooltip: "Vorige",
                            forwardButtonTooltip: "Volgende",
                            firstButtonTooltip: "Eerste pagina",
                            lastButtonTooltip: "Laatste pagina",
                            /**
                             * the page lable literal (template)
                             */
                            pageLabelText: "PAGINA ${currentPage} van ${endPage}",
                            //pageLabelText: "Page ${currentPage} of ${endPage}",
                            //pageLabeltext: "PAGINA",
                            /**
                             * the page size label literal (template)
                             */
                            pageSizeLabelText: "ITEMS ${pageStartItemNumber}-${pageEndItemNumber} VAN ${itemCount}",
                            zeroResultsText: ""
                            //pageSizeLabelText: "Items:"
                        }
                    },
                    fields: {
                        id: "ID",
                        title: "Titel",
                        adapter: "Service",
                        type: "Type"
                    },
                    newDataAvailable: "Zoekresultaat"
                }
            },

            routing: {
                ui: {
                    tool: {
                        title: "Route",
                        tooltip: "Toon routenplanner"
                    },
                    calculate: "Calculeren",
                    clearTargetFields: "Verwijder routing",
                    printRoutingResult: "Printen",
                    routeTo: "Route naar ",
                    instructionTitle: "Instruction",
                    types: {
                        fastest: "snelste",
                        shortest: "kortste",
                        economic: "economisch"
                    },
                    textboxPlaceholder: "Geef de gewenste locatie",
                    distance: "Afstand: ${distance} km",
                    duration: "Duur: ${hour} h ${min} min",
                    transportation: "${mode}, ${type} route",
                    sendMail: "Deel via E-mail",
                    mailBody: "${url}",
                    mailSubject: "Check out this map!",
                    transport: {
                        car: "auto",
                        pedestrian: "voetganger"
                    },
                    addTarget: "Bestemming toevoegen",
                    deleteTarget: "X",
                    switchTargets: "Switch",
                    exceedMaxTarget: "Not possible to enter more than 10 locations",
                    contextMenu: {
                        start: "vanaf dit punt",
                        end: "naar dit punt",
                        newPoint: "bestemming toevoegen"
                    },
                    routing: "Routebeschrijving",
                    from: "vanaf dit punt",
                    to: "naar dit punt",
                    tooltip: {
                        deleteButton: "Verwijder locatie",
                        marker: "Sleep naar het gewenste punt op de kaart",
                        clearRoute: "Verwijder route",
                        addTarget: "Voeg een nieuwe locatie toe",
                        print: "Print Route",
                        switchTargets: "Wijzig volgorde van bestemmingen",
                        errorMessage: "Locatie niet gevonden. Controleer spelling en probeer opnieuw. <br>Gebruik straatnamen, gemeenten of postnummers."
                    },
                    printTip: "Printen",
                    endTip: "Terug naar het laatste kaartbeeld",
                    featureinfointegration: {
                        title: "Routebegeleiding",
                        descriptionLabel: "Route van ${start} naar ${destination}",
                        duration: "Duur: ${hour} h ${min} min",
                        distance: "Afstand: ${distance} km"
                    }
                }
            },

            selection: {
                ui: {
                    tools: {
                        mainActivationTool: "Selecteer",
                        activationToolExtent: "Selecteer via rechthoek"
                    },
                    noDataMessage: "Er zijn geen objecten gevonden."
                }
            },

            sharemap: {
                ui: {
                    // tool:
                    encoderBtn: "Share map",
                    encoderBtnTooltip: "Share map",
                    // ui:
                    sendMail: "EMail",
                    linkBoxTitle: "Link URL",
                    codeBoxTitle: "Code to embed in HTML",
                    mailBody: "${url}",
                    mailSubject: "Check out this map!",
                    urlTooLong: "The URL is longer than ${length} characters and might not be compatible with certain browsers"
                }
            },

            transparency: {
                toolTip: "Change transparency"
            },

            layercontextmenu: {
                ui: {
                    allLayersLabel: "All Layers",
                    backgroundLabel: "achtergrond",
                    overlayLabel: "mijn datalagen",
                    notVisible: "Layer not visible in map",
                    shownPOIsLabel: "Shown",
                    totalPOIsLabel: "Total"
                },
                tool: {
                    title: "Layer Context Menu",
                    toolTip: "Layer Context Menu"
                }
            },

            mapflow: {
                coverToolTip: "Klik hier voor meer opties (lagen aan/uit, metadata)",
                layerToolTip: "Lagen aan/uit",
                infoToolTip: "Klik hier voor metadata-informatie",
                turnToolTip: "Terug naar Navigatie"
            },

            //GLOBALE BASE LAYER NAMES
            baselayers: {
                basemap1: {
                    title: "Ortho",
                    description: "Middenschalige ortho-foto's",
                    tooltip: "Select ortho as basemap"
                },
                basemap2: {
                    title: "Hybrid",
                    tooltip: "Select hybrid as basemap"
                },
                basemap3: {
                    title: "GRB",
                    tooltip: "Select GRB as basemap"
                },
                basemap4: {
                    title: "OSM",
                    description: "Open Street Map",
                    tooltip: "Selecteer OpenStreetMap"
                },
                basemap5: {
                    title: "MapQuest",
                    description: "MapQuest basemap",
                    tooltip: "Selecteer MapQuest"
                },
                normalday: {
                    title: "Navteq",
                    description: "Navteq basemap",
                    tooltip: "Selecteer Navteq"
                },
                normaldaygrey: {
                    title: "Street plan",
                    tooltip: "Select Street plan as basemap"
                },
                satelliteday: {
                    title: "Navteq sat",
                    description: "Navteq satellite basemap",
                    tooltip: "Selecteer Navteq satellite"
                },
                hybridday: {
                    title: "Navteq hybrid",
                    description: "Navteq hybrid basemap",
                    tooltip: "Selecteer Navteq hybrid"
                },
                terrainday: {
                    title: "Navteq terrain",
                    description: "Navteq terrain basemap",
                    tooltip: "Selecteer Navteq terrain"
                },
                ferraris: {
                    title: "Ferraris",
                    description: "Ferraris basemap",
                    tooltip: "Selecteer Ferraris"
                },
                popp: {
                    title: "Popp",
                    description: "Popp basemap",
                    tooltip: "Selecteer Popp"
                },
                nobasemap: {
                    title: "Without",
                    description: "Without basemap",
                    tooltip: "Without basemap"
                }
            }

        }),
        "nl": true}
});