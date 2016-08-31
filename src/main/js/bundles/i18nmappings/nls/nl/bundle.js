define(["dojo/i18n!esri/nls/jsapi"], function (esri_bundle) {
        esri_bundle.widgets.overviewMap.NLS_drag = "Slepen om de positie van de kaart te wijzigen";
        esri_bundle.widgets.measurement.NLS_area_acres = "Acres";
        return {

//        //needs translation
            ui: {
                dataView: {
                    filter: {
                        menuDefaultLabel: "Alle",
                        textBoxPlaceHolder: ""
                    },
                    pager: {
                        backButtonText: "<",
                        forwardButtonText: ">",
                        firstButtonText: "<<",
                        lastButtonText: ">>",
                        zeroResultsText: "Geen data beschikbaar.",
                        backButtonTooltip: "Vorige pagina",
                        forwardButtonTooltip: "Volgende pagina",
                        firstButtonTooltip: "Eerste pagina",
                        lastButtonTooltip: "Laatste pagina",
                        pageLabeltext: "Pagina:",
                        pageSizeLabelText: "Items ${pageStartItemNumber}-${pageEndItemNumber} van ${itemCount}:"
                    },
                    DGRID: {
                        noDataMessage: "Geen data beschikbaar.",
                        loadingMessage: "Loading Data...",
                        error: "Unexpected error: "
                    }
                },
                fields: {
                    id: "ID",
                    title: "Titel",
                    name: "Naam",
                    adapter: "Service",
                    type: "Type",
                    scaleMin: "Min schaal",
                    scaleMax: "Max schaal",
                    check: "Selecteer",
                    layer: "Laag",
                    north: "Noorden",
                    east: "Oosten",
                    south: "Zuiden",
                    west: "Westen"
                },
                window: {title: "Laad nieuwe lagen"},
                tool: {
                    title: "Eigen kaart toevoegen",
                    tooltip: "Voeg eigen data toe via een WMS of als KML"
                },
                buttons: {
                    search: "Zoek",
                    load: "Laad",
                    back: "Terug",
                    clear: "Wis"
                },
                favs: "Favorieten ",
                results: "Resultaten",
                mapModel: {addedServiceCategoryTitle: "Mijn Services"},
                help: "Help",
                stepOne: "Enter a service URL and click load.",
//        stepTwo:"De services bieden volgende interfaces.\x3cBR\x3eSelecteer \xe9\xe9n van hen door op de titel te klikken.",
//        stepThree:"De server biedt meerdere services aan.\x3cBR\x3eSelecteer \xe9\xe9n van hen door op de titel te klikken.",
                stepTwo: "Selecteer \xe9\xe9n of meerdere lagen door op de titel te klikken.\x3cBR\x3eKies dan \x27Laden\x27.",
                errors: {
                    title: "Fout",
                    401: "Dit is een beveiligde service, gelieve in te loggen op uw account.",
                    400: "De ingevoerde URL is geen geldige service.",
                    404: "De service is niet bereikbaar.",
                    118: "De service reageert niet.",
                    serviceNotLoaded: "De service kan niet geladen worden.",
                    "NOT  SUPPORTED": "Deze URL wordt niet ondersteund. Gelieve een URL van een \x27WMS\x27 of \x27INSPIRE viewservice\x27 in te voeren.",
                    noSupportedLayers: "De service bevat geen lagen die getoond kunnen worden."
                },
                success: {serviceLoaded: "Service succesvol geladen."},
                loadingService: "Service wordt geladen.",
                loadingLayer: "Laag wordt geladen."
            },
            store: {
                title: "Laag toevoegen",
                desc: " Krijgt service-informatie van een URL",
                placeHolder: "Typ de WMS of INSPIRE URL hier"
            },

            capakeysearch: {
                ui: {
                    dataform: {
                        title: "Informatie over perceelnummer (Selecteer in formulier of klik op kaart)",
                        municipality: "Gemeente",
                        setMunicipality: "Kies een gemeente...",
                        department: "Afdeling",
                        setDepartment: "Kies een afdeling",
                        section: "Sectie",
                        setSection: "Kies een sectie",
                        parcel: "Perceel",
                        setParcel: "Kies een perceel",
                        capakey: "CaPaKey",
                        address: "Adres",
                        show: "Toon op kaart",
                        nis: "NIS-codes"
                    },
                    tool: {
                        "title": "Informatie over perceelnummer",
                        "tooltip": "Informatie over perceelnummer"
                    }
                }
            },

            coordinateparser:{
                ui:{
                    errorMessage: "Coordinaten als parameter kan slechts éénmaal gebruikt worden.",
                    invalidMessage: "Coordinaten ${coordinate} als parameter niet gevonden.",
                    searchTypes: {
                        COORDINATE_4326: "WGS84-co\u00F6rdinaat",
                        COORDINATE_31370: "Lambert72-co\u00F6rdinaat"
                    }
                }
            },

            jasperprinting: {
                ui: {
                    preparePrint: "Voorbereiden printen",
                    error: "Error",
                    printError: "An error occured while preparing the print.",
                    noLegend: "Geen legende",
                    print: "Afdrukken",
                    cancel: "Annuleren",
                    landscape: "Liggend",
                    portrait: "Staand",
                    description: "Beschrijving (max 255 tekens)",
                    title: "Titel",
                    descriptionLeft: "Beschrijving kaart links",
                    titleLeft: "Titel kaart links",
                    extent: "Volledig kaartbeeld",
                    center: "Midden van het kaartbeeld"
                }
            },

            gipod: {
                ui: {
                    preparePrint: "Voorbereiden printen",
                    error: "Error",
                    printError: "An error occured while preparing the print.",
                    noLegend: "Geen legende",
                    print: "Afdrukken",
                    cancel: "Annuleren",
                    landscape: "Liggend",
                    portrait: "Staand",
                    description: "Beschrijving (max 255 tekens)",
                    title: "Titel",
                    docktool: {
                        title: "Verfijnen",
                        tooltip: "Verfijnd zoeken"
                    },
                    loadingFilters: "Bezig met laden",
                    validation: {
                        endBeforeStart: "Einddatum moet groter zijn dan begindatum.",
                        defineStart: "De opgegeven waarde is ongeldig.",
                        defineEnd: "De opgegeven waarde is ongeldig.",
                        startTooSmall: "Begindatum kan enkel vandaag zijn of een datum in de toekomst."
                    },
                    hover: {
                        manifestation: "${count} keer andere hinder op de weg",
                        workassignment: "${count} werken"
                    },
                    identificatie: {
                        title: "Identificatie",
                        info: "Volgende informatie is van toepassing op de ${type}:"
                    },
                    contact: {
                        title: "Contact",
                        info: "Voor verdere info, contacteer",
                        name: "${firstName} ${lastName}",
                        address: "${street}<br/>${postalCode} ${city} ${country}",
                        phone: "${phone1}<br/>${phone2}",
                        noData: "Geen contactinfo beschikbaar."
                    },
                    calendar: {
                        title: "Kalender",
                        startDate: "Van",
                        endDate: "Tot",
                        exceedAllowed: "Wijzig de periode van/tot in verfijnd zoeken om meer of minder data te zien"
                    },
                    diversions: {
                        title: "Omleidingen",
                        widget: "Omleiding",
                        info: "Volgende informatie is van toepassing op de ${type}:"
                    },
                    identifyTitle: "Detail: ${city} - ${eventType}",
                    title: "${city} - ${eventType}",
                    workEventType: "Werken",
                    workassignment: "werkopdrachten",
                    manifestation: "manifestatie",
                    detail: "Detail",
                    scale: "Schaal: 1 : ${scale}"
                }
            },

            loadservice: {
                ui: {
                    dataView: {
                        filter: {
                            menuDefaultLabel: "Alle",
                            textBoxPlaceHolder: ""
                        },
                        pager: {
                            backButtonText: "<",
                            forwardButtonText: ">",
                            firstButtonText: "<<",
                            lastButtonText: ">>",
                            zeroResultsText: "Geen data beschikbaar.",
                            backButtonTooltip: "Vorige pagina",
                            forwardButtonTooltip: "Volgende pagina",
                            firstButtonTooltip: "Eerste pagina",
                            lastButtonTooltip: "Laatste pagina",
                            pageLabeltext: "Pagina:",
                            pageSizeLabelText: "Lagen ${pageStartItemNumber} tot ${pageEndItemNumber} van ${itemCount}"
                        },
                        DGRID: {
                            noDataMessage: "Geen data beschikbaar.",
                            loadingMessage: "Loading Data...",
                            error: "Unexpected error: "
                        }
                    },
                    fields: {
                        id: "ID",
                        title: "Titel",
                        name: "Titel",
                        adapter: "Service",
                        type: "Type",
                        scaleMin: "Min schaal",
                        scaleMax: "Max schaal",
                        check: "Selecteer",
                        layer: "Laag",
                        north: "Noorden",
                        east: "Oosten",
                        south: "Zuiden",
                        west: "Westen"
                    },
                    window: {title: "Laad nieuwe lagen"},
                    tool: {
                        title: "Eigen kaart toevoegen",
                        tooltip: "Voeg eigen data toe via een WMS of als KML"
                    },
                    buttons: {
                        search: "Laad",
                        load: "Toon op kaart",
                        back: "Terug",
                        clear: "Wis"
                    },
                    dataLink: "Vereisten voor het laden en correct weergeven van je data.",
                    favs: "Favorieten ",
                    results: "Resultaten",
                    mapModel: {addedServiceCategoryTitle: "Mijn Services"},
                    help: "Help",
                    stepOne: "Geef de URL van de Service in en druk op \x27Laad\x27",
                    stepTwo: "Selecteer \xe9\xe9n of meerdere lagen, klik dan op \x27Toon op kaart\x27",
                    errors: {
                        title: "Fout",
                        401: "Dit is een beveiligde service, gelieve in te loggen op uw account.",
                        400: "De ingevoerde URL is geen geldige service.",
                        404: "De service is niet bereikbaar.",
                        118: "De service reageert niet.",
                        serviceNotLoaded: "De service kan niet geladen worden.",
                        "NOT  SUPPORTED": "Deze URL wordt niet ondersteund. Gelieve een URL van een \x27WMS\x27 of \x27INSPIRE viewservice\x27 in te voeren.",
                        noSupportedLayers: "De service bevat geen lagen die getoond kunnen worden."
                    },
                    success: {serviceLoaded: "Service succesvol geladen."},
                    loadingService: "Service wordt geladen.",
                    loadingLayer: "Laag wordt geladen.",
                    textBoxPlaceholder: "URL van de service"
                },
                store: {
                    title: "Laag toevoegen",
                    desc: " Krijgt service-informatie van een URL",
                    placeHolder: "Typ de WMS of INSPIRE URL hier"
                }
            },

            kml: {
                ui: {
                    window: {title: "Laad nieuwe lagen"},
                    tool: {
                        title: "Eigen kaart toevoegen",
                        tooltip: "Voeg eigen data toe via een WMS of als KML"
                    },
                    buttons: {
                        search: "Laad",
                        load: "Toon op kaart",
                        back: "Terug",
                        clear: "Wis"
                    },
                    favs: "Favorieten ",
                    results: "Resultaten",
                    mapModel: {addedServiceCategoryTitle: "Mijn Services"},
                    help: "Help",
                    stepOne: "Geef de URL van de Service in en druk op \x27Laad\x27",
                    stepTwo: "Selecteer \xe9\xe9n of meerdere lagen, klik dan op \x27Toon op kaart\x27",
                    errors: {
                        title: "Fout",
                        401: "Dit is een beveiligde service, gelieve in te loggen op uw account.",
                        400: "De ingevoerde URL is geen geldige KML service.",
                        404: "Het bestand kan niet opgeladen werden.",
                        118: "De service reageert niet.",
                        serviceNotLoaded: "De service kan niet geladen worden.",
                        "NOT  SUPPORTED": "Deze URL wordt niet ondersteund. Gelieve een URL van een \x27WMS\x27 of \x27INSPIRE viewservice\x27 in te voeren.",
                        noSupportedLayers: "De service bevat geen lagen die getoond kunnen worden."
                    },
                    success: {serviceLoaded: "Service succesvol geladen."},
                    loadingService: "Service wordt geladen.",
                    loadingLayer: "Laag wordt geladen.",
                    textBoxPlaceholder: "URL van de service",
                    titleTextBoxPlaceholder: "Titel"
                },
                store: {
                    title: "Laag toevoegen",
                    desc: " Krijgt service-informatie van een URL",
                    placeHolder: "Typ de WMS of INSPIRE URL hier"
                }
            },

            geojsonservicetype: {
                ui: {
                    window: {title: "Laad nieuwe lagen"},
                    tool: {title: "Eigen kaart toevoegen"},
                    buttons: {
                        search: "Laad",
                        load: "Toon op kaart",
                        back: "Terug",
                        clear: "Wis"
                    },
                    favs: "Favorieten ",
                    results: "Resultaten",
                    mapModel: {addedServiceCategoryTitle: "Mijn Services"},
                    help: "Help",
                    stepOne: "Geef de URL van de Service in en druk op \x27Laad\x27",
                    stepTwo: "Selecteer \xe9\xe9n of meerdere lagen, klik dan op \x27Toon op kaart\x27",
                    errors: {
                        title: "Fout",
                        401: "Dit is een beveiligde service, gelieve in te loggen op uw account.",
                        400: "De ingevoerde URL is geen geldige KML service.",
                        404: "Het bestand kan niet opgeladen werden.",
                        118: "De service reageert niet.",
                        serviceNotLoaded: "De service kan niet geladen worden.",
                        "NOT  SUPPORTED": "Deze URL wordt niet ondersteund. Gelieve een URL van een \x27WMS\x27 of \x27INSPIRE viewservice\x27 in te voeren.",
                        noSupportedLayers: "De service bevat geen lagen die getoond kunnen worden."
                    },
                    success: {serviceLoaded: "Service succesvol geladen."},
                    loadingService: "Service wordt geladen.",
                    loadingLayer: "Laag wordt geladen.",
                    textBoxPlaceholder: "URL"
                }
            },

            redlining: {
                ui: {
                    tools: {
                        moveScaleRotateVertices: {
                            title: "Modify Graphic",
                            tooltip: "Modify a graphic (click on a graphic to toggle the mode)"
                        },
                        moveScaleRotate: {
                            title: "Move, Scale, Rotate",
                            tooltip: "Verplaats, vergroot, verklein of draai een tekening"
                        },
                        editVertices: {
                            title: "Edit Vertices",
                            tooltip: "Wijzig de vorm van een tekening"
                        },
                        deleteGraphic: {
                            title: "Delete Graphic",
                            tooltip: "Verwijder een tekening"
                        }
                    },
                    styleProperties: {
                        tool: {
                            title: "Draw Properties",
                            tooltip: "Eigenschappen: selecteer je opmaak en maak dan je tekening"
                        },
                        presets: {
                            title: "Voorkeurstijlen",
                            deletePresetTool: "Delete Preset",
                            editPresetTool: "Edit Preset",
                            addPresetWidget: {
                                textboxPlaceHolder: "Voorkeur opslaan…",
                                buttonTooltip: "Save Style"
                            },
                            overwriteExistingItemMessageTitle: "Style Already Exists",
                            overwriteExistingItemMessage: "A style with the name '{itemName}' already exists. Do you want to overwrite it?",
                            overwritePreConfiguredItemTitle: "Error",
                            overwritePreConfiguredItemMessage: "You can not overwrite a pre configured preset!",
                            dataview: {
                                pager: {
                                    backButtonTooltip: "Back",
                                    forwardButtonTooltip: "Forward",
                                    firstButtonTooltip: "First",
                                    lastButtonTooltip: "Last",
                                    pageLabelText: "Page ${currentPage} of ${endPage}",
                                    zeroResultsText: "",
                                    pageSizeLabelText: "${pageStartItemNumber}-${pageEndItemNumber} of ${itemCount}"
                                },
                                filter: {
                                    menuDefaultLabel: "All",
                                    textBoxPlaceHolder: "Zoek..."
                                },
                                DGRID: {
                                    noDataMessage: "Er zijn geen opgeslagen stijlen beschikbaar.",
                                    loadingMessage: "Loading Data...",
                                    error: "Error: "
                                }
                            },
                            presetStoreColumns: {
                                id: "Naam",
                                style: "Type",
                                preconfigured: "Configured"
                            },
                            notifier: {
                                saveSuccess: "Preset '{itemName}' was successfully saved.",
                                saveError: "Preset '{itemName}' could not be saved. {error}",
                                applySuccess: "Preset '{itemName}' was successfully applied.",
                                applyError: "Preset '{itemName}' could not be applied. {error}"
                            },
                            groups: {
                                font: "Tekst",
                                stroke: "Rand",
                                fill: "Opvulling",
                                symbol: "Symbol",
                                marker: "Marker"
                            }
                        },
                        text: {
                            title: "Tekst",
                            fontFamily: "Font",
                            fontSize: "Grootte",
                            fontColor: "Kleur",
                            fontStyle: {
                                title: "Stijl",
                                bold: "Bold",
                                italic: "Italic",
                                underlined: "Underlined"
                            },
                            fontTransparency: "Transparantie"
                        },
                        symbol: {
                            title: "Rand/Opvulling",
                            stroke: {
                                title: "Rand",
                                color: "Kleur",
                                style: "Stijl",
                                width: "Dikte",
                                transparency: "Transparantie",
                                strokeval: {
                                    none: "Geen"
                                }
                            },
                            fill: {
                                title: "Opvulling",
                                color: "Kleur",
                                pattern: "Patroon",
                                transparency: "Transparantie",
                                patternval: {
                                    none: "Geen",
                                    solid: "Effen",
                                    vertical: "Verticale lijnen",
                                    horizontal: "Horizontale lijnen",
                                    backwarddiagonal: "Diagonaal naar rechts omhoog",
                                    forwarddiagonal: "Diagonaal naar links omlaag",
                                    cross: "Raster",
                                    diagonalcross: "Ruit"
                                }
                            }
                        },
                        marker: {
                            title: "Symbool",
                            style: "Stijl",
                            size: "Grootte",
                            styleval: {
                                circle: "Cirkel",
                                square: "Vierkant",
                                cross: "Plus",
                                diamond: "Ruit",
                                x: "Kruisje"
                            }
                        },
                        symbols: {
                            "title": "Symbols"
                        }
                    },
                    edit: {
                        activation: {
                            warn: "The selected graphic cannot be edited with the current tool.",
                            info: "Tekening geselecteerd."
                        }
                    },
                    drawpointtool: "Teken een punt",
                    drawmultipointtool: "Points: Draws multiple points",
                    drawlinetool: "Teken een rechte lijn",
                    drawpolylinetool: "Teken een lijn",
                    drawfreehandpolylinetool: "Teken een vrije lijn",
                    drawpolygontool: "Teken een veelhoek",
                    drawfreehandpolygontool: "Teken een vrije vorm",
                    drawextenttool: "Free Rectangle: Draws a freeform rectangle",
                    drawcircletool: "Teken een cirkel",
                    drawellipsetool: "Teken een ellips",
                    drawrectangletool: "Teken een rechthoek",
                    drawleftarrowtool: "Left Arrow: Draws a left arrow",
                    drawrightarrowtool: "Right Arrow: Draws a right arrow",
                    drawuparrowtool: "Up Arrow: Draws an up arrow",
                    drawdownarrowtool: "Down Arrow: Draws a down arrow",
                    drawtriangletool: "Teken een driehoek",
                    drawerasealltool: "Verwijder alle tekeningen",
                    exportTool: "Export graphics",
                    defaultInfoTemplate: {
                        title: "Drawing Toolset",
                        template: "<div><span>ID: ${id}</span><br/><span>Type:${geometryType}</span></div>"
                    },
                    texteditor: {
                        tool: {
                            title: "Text Editor",
                            tooltip: "Typ tekst op de kaart"
                        }
                    },
                    drawsymbol: {
                        tool: {
                            title: "Symbol Gallery",
                            tooltip: "Voeg een symbool toe"
                        },
                        store: {
                            fields: {
                                title: "Title",
                                description: "Description"
                            }
                        },
                        dataview: {
                            pager: {
                                backButtonTooltip: "Back",
                                forwardButtonTooltip: "Forward",
                                firstButtonTooltip: "First",
                                lastButtonTooltip: "Last",
                                pageLabelText: "Page ${currentPage} of ${endPage}",
                                zeroResultsText: "",
                                pageSizeLabelText: "${pageStartItemNumber}-${pageEndItemNumber} of ${itemCount}"
                            },
                            filter: {
                                menuDefaultLabel: "All",
                                textBoxPlaceHolder: "Zoek..."
                            },
                            ICON: {
                                noDataMessage: "No symbols!",
                                loadingMessage: "Loading symbols..."
                            }
                        }
                    }
                }
            },

            elevation: {
                ui: {
                    docktool: {
                        title: "Hoogte",
                        tooltip: "Hoogteprofiel"
                    },
                    undoTool: {
                        title: "Laatste stap ongedaan maken",
                        tooltip: "Laatste stap ongedaan maken"
                    },
                    clearTool: {
                        title: "Alles verwijderen",
                        tooltip: "Alles verwijderen"
                    },
                    sampleLowTool: {
                        title: "Minder",
                        tooltip: "Lage resolutie"
                    },
                    sampleMediumTool: {
                        title: "Gemiddeld",
                        tooltip: "Standaard resolutie"
                    },
                    sampleHighTool: {
                        title: "Meer",
                        tooltip: "Hoge resolutie"
                    },
                    polylineTool: {
                        title: "Teken een lijn",
                        tooltip: "Teken een traject uit om een hoogteprofiel te bepalen"
                    },
                    maximizeTool: {
                        title: "Maximaliseer",
                        tooltip: "Maximaliseer"
                    },
                    minimizeTool: {
                        title: "Minimaliseer",
                        tooltip: "Minimaliseer"
                    },
                    messages: {
                        start: "Klik op de kaart om een pad aan te geven.",
                        loading: "De hoogtedata wordt geladen.",
                        "400": "Er kan geen hoogteprofiel opgemaakt worden.",
                        outsideFlanders: "Geen data beschikbaar in dit gebied.",
                        noData: "Geen data beschikbaar in dit gebied."
                    }
                },
                drawTooltips: {
                    "finishLabel": "Stop"
                }
            },

            redlining_agiv: {
                ui: {
                    addBtn: "Bewaar",
                    elevationBtn: "Hoogteprofiel",
                    comment: "Comment geometry",
                    textBoxPlaceHolder: "Wijzig de naam van de geometrie",
                    commentWindowTitle: "Geometrie",
                    addCommentWindowTitle: "Add a comment to the geometry",
                    "type": "Geometrytype:",
                    "area": "Oppervlakte:",
                    "length": "Lengte:",
                    "types": {
                        "polygon": "Veelhoek",
                        "point": "Punt",
                        "polyline": "Lijn"
                    },
                    "remainingCharacters": "Remaining characters:",
                    closeWindow: "Sluit venster",
                    closeWindowTooltip: "Sluit venster"
                }
            },

            appstoggler_agiv: {
                ui: {
                    itemTooltip: "Selecteer ${appname}"
                }
            },

            overviewmap: {
                tool: {
                    title: "Overzichtskaart",
                    tooltip: "Toon overzichtskaart   "
                }
            },

            appsoverview_agiv: {
                dataViewCommon: {
                    noDataMessage: "No apps available.",
                    filter: {
                        menuDefaultLabel: "Alles",
                        textBoxPlaceHolder: ""
                    },
                    pager: {
                        backButtonTooltip: "Vorige",
                        forwardButtonTooltip: "Volgende",
                        firstButtonTooltip: "Eerste pagina",
                        lastButtonTooltip: "Laatste pagina",
                        pageLabelText: "PAGINA ${currentPage} van ${endPage}",
                        pageSizeLabelText: "ITEM ${pageStartItemNumber}-${pageEndItemNumber} VAN ${itemCount}"
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

            routing: {
                ui: {
                    tool: {
                        title: "Route",
                        tooltip: "Toon routeplanner"
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
                    exceedMaxTarget: "Niet mogelijk om meer dan 10 beestemmingen in te geven",
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

            themainfo: {
                ui: {
                    docktool: {
                        title: "Info",
                        tooltip: "Info"
                    },
                    thema: {tooltip: "Toon/verberg kaarten"},
                    layermanager: {tooltip: "Toon/verberg mijn selecties"},
                    description: {
                        title: "Toelichting",
                        content: "Via deze kaarttoepassing kan je nagaan of er een Vlaams voorkooprecht van toepassing is op een bepaald perceel in Vlaanderen.<br/>Je raadpleegt het  <b>Geografisch themabestand 'Vlaamse voorkooprechten'</b> (Harmoniseringsdecreet Rechten van Voorkoop - 25/05/2007). Enkel de Vlaamse voorkooprechten die in dit themabestand zijn opgenomen, kunnen ook effectief uitgeoefend worden door de begunstigden ervan.<br/><br/>Klik <a target=\"_blank\" href=\"http://www.agiv.be/producten/rvv\">hier</a> voor meer informatie over recht van voorkoop (RVV)."
                    },
                    kiesThemas: "In de buurt",
                    mijnSelecties: "Mijn selecties",
                    graphicLayerTitle: "Mijn plaatsen",
                    operationalLayerTitle: "Mijn kaarten",
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
                        infoLayer: "Meer info",
                        poiList: "Toon lijst van de kaart getoonde plaatsen over ${poitype}",
                        transparency: "Wijzig transparantie",
                        poiListItem: {
                            poiWindowTitle: "Info",
                            id: "ID",
                            primarylabel: "Naam",
                            vialink: "Meer Info"
                        },
                        visibleScale: "Pas zichtbaar bij schaal ${scale}"
                    },
                    operationalLayerManager: {
                        allLayersLabel: "Alle lagen",
                        backgroundLabel: "achtergrond",
                        overlayLabel: "mijn datalagen",
                        layersLabel: "Lagen",
                        notVisible: "Niet zichtbaar voor dit zoomniveau.",
                        shownPOIsLabel: "Shown",
                        totalPOIsLabel: "Total",
                        removeLayer: "Verwijder kaart",
                        switchLayerVisible: "Toon kaart",
                        switchLayerInvisible: "Verberg kaart",
                        switchAllLayersInvisible: "alle lagen onzichtbaar",
                        switchAllLayersVisible: "alle lagen zichtbaar",
                        removeAllLayers: "Verwijder al mijn kaarten",
                        infoLayer: "Meer info",
                        transparency: "Wijzig transparantie",
                        poiListItem: {
                            poiWindowTitle: "Info",
                            id: "ID",
                            primarylabel: "Naam",
                            vialink: "Meer Info"
                        },
                        visibleMinScale: "Zoom in om deze kaart zichtbaar te maken.",
                        visibleMaxScale: "Zoom uit om deze kaart zichtbaar te maken."
                    },
                    nodescription: "No description available",
                    scale: "Van schaal ${maxScale} tot ${minScale}",
                    linkToMetadata: "Meer info",
                    loadingMetadata: "Bezig met laden",
                    noMetadata: "Geen extra informatie beschikbaar.",
                    searchTypes: {
                        CONTENTMODEL: "kaarten"
                    },
                    tree: {
                        categorytooltip: "Toon lagen onder het thema ${category}",
                        layertooltip: "${description}",
                        mainCategory: "In de buurt",
                        noResult: "geen resultaat",
                        loading: "...",
                        collapse: "Toeklappen",
                        uncollapse: "Uitklappen",
                        hintCheckLayers: "Vink aan wat je wil zien op de kaart.",
                        notVisibleTooltip: "Zoom in om deze kaart zichtbaar te maken. Het zoekresultaat is pas aanklikbaar wanneer de kaart zichtbaar is."
                    },
                    nearbyPlaces: {
                        radiusText: "Binnen een straal van ",
                        around: " rond ",
                        description: "Zoek een plaats op of klik op de kaart en vervolgens op de knop 'i info in de buurt'"
                    },
                    mapLeft: "Kaart links",
                    mapRight: "Kaart rechts",
                    switcher: {
                        mapLeftTooltip: "Klik om kaarten toe te voegen aan het linkse venster",
                        mapRightTooltip: "Klik om kaarten toe te voegen aan het rechtse venster",
                        switchButtonTooltip: "Klik om kaarten toe te voegen aan het linkse of rechtse venster"
                    },
                    title: "Waarschuwing",
                    errorMessage: "Kaart als parameter kan slechts éénmaal gebruikt worden.",
                    notFoundMessage: "Kaart ${title} als parameter niet gevonden."
                }
            },

            //Layer and datamanagement
            combicontentmanager: {
                ui: {
                    docktool: {
                        title: "Kaarten",
                        tooltip: "Kies interessante plaatsen en kaarten"
                    },
                    thema: {tooltip: "Toon/verberg kaarten"},
                    layermanager: {tooltip: "Toon/verberg mijn selecties"},
                    description: {
                        title: "Toelichting",
                        content: "Via deze kaarttoepassing kan je nagaan of er een Vlaams voorkooprecht van toepassing is op een bepaald perceel in Vlaanderen.<br/>Je raadpleegt het  <b>Geografisch themabestand 'Vlaamse voorkooprechten'</b> (Harmoniseringsdecreet Rechten van Voorkoop - 25/05/2007). Enkel de Vlaamse voorkooprechten die in dit themabestand zijn opgenomen, kunnen ook effectief uitgeoefend worden door de begunstigden ervan.<br/><br/>Klik <a target=\"_blank\" href=\"http://www.agiv.be/producten/rvv\">hier</a> voor meer informatie over recht van voorkoop (RVV)."
                    },
                    kiesThemas: "Kaarten en plaatsen",
                    mijnSelecties: "Mijn selecties",
                    graphicLayerTitle: "Mijn plaatsen",
                    operationalLayerTitle: "Mijn kaarten",
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
                        infoLayer: "Meer info",
                        poiList: "Toon lijst van de kaart getoonde plaatsen over ${poitype}",
                        transparency: "Wijzig transparantie",
                        poiListItem: {
                            poiWindowTitle: "Info",
                            id: "ID",
                            primarylabel: "Naam",
                            vialink: "Meer Info"
                        },
                        visibleScale: "Pas zichtbaar bij schaal ${scale}"
                    },
                    operationalLayerManager: {
                        allLayersLabel: "Alle lagen",
                        backgroundLabel: "achtergrond",
                        overlayLabel: "mijn datalagen",
                        layersLabel: "Lagen",
                        notVisible: "Niet zichtbaar voor dit zoomniveau.",
                        shownPOIsLabel: "Shown",
                        totalPOIsLabel: "Total",
                        removeLayer: "Verwijder kaart",
                        switchLayerVisible: "Toon kaart",
                        switchLayerInvisible: "Verberg kaart",
                        switchAllLayersInvisible: "alle lagen onzichtbaar",
                        switchAllLayersVisible: "alle lagen zichtbaar",
                        removeAllLayers: "Verwijder al mijn kaarten",
                        infoLayer: "Meer info",
                        transparency: "Wijzig transparantie",
                        poiListItem: {
                            poiWindowTitle: "Info",
                            id: "ID",
                            primarylabel: "Naam",
                            vialink: "Meer Info"
                        },
                        visibleMinScale: "Zoom in om deze kaart zichtbaar te maken.",
                        visibleMaxScale: "Zoom uit om deze kaart zichtbaar te maken."
                    },
                    nodescription: "No description available.",
                    scale: "Van schaal ${maxScale} tot ${minScale}",
                    linkToMetadata: "Meer info",
                    loadingMetadata: "Bezig met laden",
                    noMetadata: "Geen extra informatie beschikbaar.",
                    searchTypes: {
                        CONTENTMODEL: "kaarten"
                    },
                    tree: {
                        categorytooltip: "Toon lagen onder het thema ${category}",
                        layertooltip: "${description}",
                        mainCategory: "Kaarten en plaatsen"
                    },
                    mapLeft: "Kaart links",
                    mapRight: "Kaart rechts",
                    switcher: {
                        mapLeftTooltip: "Klik om kaarten toe te voegen aan het linkse venster",
                        mapRightTooltip: "Klik om kaarten toe te voegen aan het rechtse venster",
                        switchButtonTooltip: "Klik om kaarten toe te voegen aan het linkse of rechtse venster"
                    },
                    title: "Waarschuwing",
                    errorMessage: "Kaart als parameter kan slechts éénmaal gebruikt worden.",
                    notFoundMessage: "Kaart ${title} als parameter niet gevonden."
                },
                rvv: {
                    map: {
                        operational: {
                            agiv: {
                                title: "Geoloket RVV-themabestand",
                                description: "Agiv RVV Feature Service",
                                municipalborders: {title: "Gemeentegrenzen"},
                                grotkleinschalig: {title: "RVV-afbakeningen"},
                                kleinschalig: {
                                    title: "RVV-afbakeningen (\u2264 1 : 15 000)",
                                    description: "Recht van voorkoop vastgesteld"
                                },
                                grootschalig: {
                                    title: "RVV-afbakeningen (\x3e 1 : 14 999)",
                                    description: "Recht van voorkoop vastgesteld"
                                },
                                RVVPercelen: {
                                    title: "RVV-themabestand",
                                    description: "Recht van voorkoop van toepassing"
                                },
                                parcels: {title: "Digitale kadastrale percelenplannen"},
                                cadmap: {title: "Perceel"},
                                parcelnumbers: {title: "Kadastraal perceelnummer"}
                            }
                        }
                    }
                }
            },

            //historic maps in apps different from historic app
            historicmaps: {
                ui: {
                    tools: {
                        magnifier: {
                            title: "Historic maps",
                            tooltip: "Historic maps"
                        }
                    },
                    labelTitle: "Achtergrond"
                }
            },

            genericidentify: {
                ui: {
                    feature: "Object",
                    contentInfoWindowTitle: "Info",
                    noResultsFound: "Op deze locatie werden geen objecten gevonden.",
                    noAttributes: "Er is geen extra informatie beschikbaar voor deze kaart.",
                    loadingInfoText: "Bezig met laden",
                    layer: "Layer",
                    noQueryLayersFound: "No Layers queryable!",
                    formatNotSupported: "Het formaat ${format} met meer info over de laag wordt niet ondersteund.",
                    graphicsLayerTitle: "Graphics",
                    loadingGeneralInfo: "Bezig met laden",
                    cityLevel: "De aangeklikte locatie ligt in ",
                    addressLevel: "Dichtstbijzijnde adres",
                    activeLayers: "Actieve lagen:",
                    serviceErrorMsg: "An error occured",
                    showGeneralInfo: "Toon info",
                    hideGeneralInfo: "Verberg info",
                    showDescription: "Beschrijving...",
                    hideDescription: "Verberg beschrijving",
                    showRoute: "Routebegeleiding",
                    showNearby: "Info in de buurt",
                    profileSheets: "profielschets van ",
                    infoAbout: "Volgende informatie is van toepassing op de aangeklikte locatie:",
                    windowTitle: "Een probleem melden",
                    moreInformationPOI: "meer info",
                    moreInformation: "Lokale statistieken ${name}",
                    descriptionLabel: "Beschrijving",
                    noteLabel: "Note",
                    more: "meer",
                    less: "minder",
                    routeTo: "Routing naar deze locatie",
                    routeFrom: "Routing vanaf deze locatie",
                    crabErrorMessage: "Coordinaten niet in Vlaanderen of Brussel.",
                    loadErrorMessage: "Could not load geolocation page.",
                    featureInfoToolTitle: "Info",
                    featureInfoToolTooltip: "Klik op een locatie voor meer info",
                    addressTitle: "Adres",
                    coordinates: "Co\u00F6rdinaten",
                    errors: {
                        SCREENSIZE: "Het opvragen van meer informatie voor deze kaart vereist een kleinere resolutie.",
                        noValidResponse: "No valid response from Server."
                    },
                    "previous": "vorig item",
                    "next": "volgend item",
                    "back": "terug"
                }
            },

            sharemap: {
                ui: {
                    // tool:
                    encoderBtn: "Deel kaart",
                    encoderBtnTooltip: "Deel kaart",
                    // ui:
                    sendMail: "Delen via E-Mail",
                    twitter: "Delen op Twitter",
                    facebook: "Delen op Facebook",
                    googleplus: "Delen op Google+",
                    url: "Toon de URL",
                    urlMessage: "Gebruik ctrl + c om de URL te kopiëren.",
                    urlOk: "Sluiten",
                    urlTitle: "Delen via URL",
                    linkBoxTitle: "Link plakken in e-mail",
                    codeBoxTitle: "HTML-code in website plakken",
                    mailBody: "${url}",
                    mailSubject: " ",
                    urlTooLong: "Waarschuwing: de URL is mogelijk te lang om te gaan hergebruiken in een Browser.",
                    dbError: "Unable to share state",
                    size: "Formaat:",
                    minimapTitle: "Mini-kaart cre\u00EBren",
                    minimapMessage: "Gebruik CTRL-C om de HTML-code te kopi\u00EBren. </br>Deze HTML-code bevat een iframe welke je kan gebruiken in jouw website. Bij delen ga je akkoord met de <a href='http://www.geopunt.be/over-geopunt/disclaimer' target='_blank'>gebruiksvoorwaarden</a>.",
                    minimapHelp: "Gebruiksvoorwaarden",
                    minimap: "Integreer een mini-kaart in uw eigen website"
                }
            },

            geopunt: {
                catalogueNodeName: "Added from catalogue",
                maximizeViewer: {
                    title: "Maximaliseer het kaartbeeld",
                    minimizeTooltip: "Minimaliseer het kaartbeeld"
                },
                foundResult: "(${totalResult} resultaten)",
                geopuntLink: "Zoek \"${query}\" in de Geopunt-website"
            },

            copyright: {
                ui: {
                    title: "copyright"
                },
                copyrights: {
                    mapquest: "Tegels Met dank aan <a href=\"http://www.mapquest.com/\" target=\"_blank\">MapQuest</a> <img src=\"http://developer.mapquest.com/content/osm/mq_logo.png\"> \u00A9 OpenStreetMap auteurs <a href=\"http://www.openstreetmap.org/copyright or www.opendatacommons.org/licenses/odbl\" target=\"_blank\">Termen</a>"
                }
            },

            //BUNDLE TRANSLATIONS AGIV

            copyright_agiv: {
                ui: {
                    currentDate: "${date}",
                    tooltip: "Bronnen van de toepassing",
                    title: "${date} - <a href=\"http://www.agiv.be/gis/diensten/geo-vlaanderen/?artid=1876\" target=\"_blank\">Bronnen</a>"
                }
            },

            search: {
                ui: {
                    placeHolder: "Adres, interessante plaats, perceelnummer, trefwoord, co\u00F6rdinaat",
                    noValue: "Geen waarde",
                    noResult: "Niet gevonden. Probeer opnieuw.",
                    moreInformation: "Lokale statistieken ${name}",
                    title: "Waarschuwing",
                    errorMessage: "Coordinaten als parameter kan slechts éénmaal gebruikt worden.",
                    invalidMessage: "Coordinaten ${coordinate} als parameter niet gevonden."
                },
                defaultInfoTemplate: {
                    title: "Zoekresultaat",
                    content: "${title}"
                },
                identify: {
                    loadingGeneralInfo: "Bezig met laden",
                    showRoute: "Routebegeleiding",
                    addressLevel: "Dichtstbijzijnde adres",
                    deleteResult: " Verwijder plaats",
                    coordinates: "Co\u00F6rdinaten",
                    showNearby: "Info in de buurt"
                }
            },

            geolocator: {
                ui: {
                    searchTypes: {
                        GEOLOCATOR: "adres",
                        PARCEL: "perceel"
                    },
                    title: "Waarschuwing",
                    errorMessage: "Adres als parameter kan slechts éénmaal gebruikt worden.",
                    notFoundMessage: "Adres ${title} als parameter niet gevonden."
                }
            },

            geolocatorparcels: {
                ui: {
                    searchTypes: {
                        GEOLOCATOR: "adres",
                        PARCEL: "perceel"
                    }
                },
                title: "Waarschuwing",
                errorMessage: "Perceel als parameter kan slechts éénmaal gebruikt worden.",
                notFoundMessage: "Perceel ${title} als parameter niet gevonden."
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
                    nodescription: "No description available."
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
                        description: " "
                    },
                    zomervlucht: {
                        title: "Middenschalige kleurenortho's zomeropname",
                        description: " "
                    },
                    ikonos: {
                        title: "IKONOS-satellietbeelden",
                        description: " "
                    },
                    straten: {
                        title: "Stratengids - Positiebepaling",
                        description: " "
                    },
                    fvp: {
                        title: "Flepos verdichtingspunten",
                        description: " "
                    },
                    vha: {
                        title: "Vlaamse Hydrografische Atlas (VHA)",
                        description: " "
                    },
                    dhm: {
                        title: "Digitaal Hoogtemodel Vlaanderen (DHM)",
                        description: " "
                    },
                    grb: {
                        title: "Grootschalig referentiebestand",
                        description: " "
                    },
                    landschapsatlas1: {
                        title: "Beschermd Erfgoed 1/10.000",
                        description: " "
                    },
                    landschapsatlas: {
                        title: "Onroerend Erfgoed",
                        description: " "
                    },
                    bwk: {
                        title: "Biologische Waarderingskaart, versie 2",
                        description: " "
                    },
                    bodemkaart: {
                        title: "Bodemkaart",
                        description: " "
                    },
                    bossen: {
                        title: "Boskartering & Speelzones in bossen en natuurreservaten",
                        description: " "
                    },
                    DOVInternet: {
                        title: "Databank Ondergrond Vlaanderen",
                        description: " "
                    },
                    kwetsbaarheidskaarten: {
                        title: "Ecosysteemkwetsbaarheidskaarten",
                        description: " "
                    },
                    ven: {
                        title: "Gebieden van het VEN en het IVON",
                        description: " "
                    },
                    natura2000: {
                        title: "Natura 2000",
                        description: " "
                    },
                    signaalkaart: {
                        title: "Vlaamse risicoatlas vogels-windturbines",
                        description: " "
                    },
                    waterkwaliteit: {
                        title: "Waterkwaliteit",
                        description: " "
                    },
                    watertoets2012: {
                        title: "Watertoets en overstromingskaarten",
                        description: " "
                    },
                    intercomm: {
                        title: "Intergemeentelijke Samenwerkingsverbanden",
                        description: " "
                    },
                    gemeentefinancien2000: {
                        title: "Gemeentefinanci\u00EBn2000",
                        description: " "
                    },
                    bedrijventerreinen: {
                        title: "Bedrijventerreinen Vlaanderen",
                        description: " "
                    },
                    landbouwgebieden: {
                        title: "Bemestingsgebieden",
                        description: " "
                    },
                    bodemgebruik: {
                        title: "Bodemgebruikskaart",
                        description: " "
                    },
                    gwp: {
                        title: "Gewestplan",
                        description: " "
                    },
                    rup: {
                        title: "Ruimtelijke Uitvoeringsplannen",
                        description: " "
                    },
                    afbakeningen: {
                        title: "RVV-afbakeningen",
                        description: " "
                    },
                    rvvThemabestand: {
                        title: "RVV-themabestand",
                        description: " "
                    },
                    reisinfo: {
                        title: "Trajecten en haltes De Lijn",
                        description: " "
                    },
                    bing: {
                        title: "Bing Maps",
                        description: " "
                    },
                    google: {
                        title: "Google Maps",
                        description: " "
                    },

                    kleurenortho2: {
                        title: "Middenschalige kleurenorthofoto's",
                        description: " "
                    }
                }
            },

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

            browsercheck: {
                notifier: {
                    title: "Waarschuwing",
                    warning: "Er is een webbrowserversie gedetecteerd die niet ondersteund wordt: ${userAgent}!",
                    zoomMessage: "Er is een browser schermgrootte (zoom-level) gedetecteerd die niet alle functionaliteiten ondersteunt. Open deze toepassing met browser schermgrootte ingesteld op 100 \u0025 in-/uitzoomen voor het beste resultaat."
                }
            },

            clearselection: {
                clearSelectionHandler: {
                    title: "Verwijder selectie",
                    description: "Verwijder zoekresultaat / selectie"
                }
            },

            "devicecheck": {
                notifier: {
                    title: "Waarschuwing",
                    deviceMessage: "Deze kaarttoepassing wordt momenteel nog geoptimaliseerd voor gebruik op smartphones. Dit betekent dat sommige functionaliteiten binnen de toepassing mogelijk nog niet goed werken. Dit heeft echter geen invloed op de correctheid van de data die via de toepassing getoond worden."
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

            extrainfo: {
                ui: {
                    nodescription: "Geen omschrijving beschikbaar."
                },
                extrainfo: {
                    title: "Extra informatie",
                    description: "Klik hier voor meer informatie over de webtoepassing en de gebruikte data."
                }
            },

            help: {
                ui: {
                    nodescription: "Geen Nederlandstalige beschrijving beschikbaar."
                },
                help: {
                    title: "Handleiding, nieuwigheden, veelgestelde vragen, bronnen, disclaimer, ...",
                    description: "Handleiding, nieuwigheden, veelgestelde vragen, bronnen, disclaimer, ..."
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

            splashscreen: {
                loadTitle: "De kaart wordt geladen.",
                loadBundle: "{percent}%"
            },

            pprselection: {
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
                    toParcelInfo: "Ga na of er een voorkooprecht van toepassing is op dit perceel.",
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
                    parcelIdTitle: "PERCEEL-ID", //"${rvv.resultcenter.fields.parcelID}"
                    addressTitle: "ADRES"
                }
            },

            title: {
                operational: {
                    title: "Geselecteerde thema:",
                    noTitle: "Geen thema geselecteerd"
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

            toextent: {
                toExtentTool: {
                    title: "Zoom naar Vlaanderen",
                    tooltip: "Zoom naar Vlaanderen"
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

            scaleviewer: {
                ui: {
                    scale: "Schaal: 1 : ${scale}"
                }
            },

            printimage: {
                ui: {
                    preparePrint: "Voorbereiden printen",
                    error: "Error",
                    printError: "An error occured while preparing the print."
                }
            },

            transparency: {
                toolTip: "Verander transparantie"
            },

            navteqrouting: {
                ui: {
                    calculate: "Calculate route"
                },
                error: "Error while requesting the route service, please change the input parameter."
            },

            version: {
                title: "Versie van de toepassing"
            },

            legend_agiv: {
                tool: {
                    title: "Legende",
                    tooltip: "Toon legende"
                },
                ui: {
                    createLegend: "Legende maken...",
                    noLegend: "Er zijn geen lagen met legendes geselecteerd.",
                    noGraphicLegend: "Er zijn geen plaatsen geselecteerd.",
                    externalLink: "${title}",
                    mapLeft: "Kaart links",
                    mapRight: "Kaart rechts",
                    mapTop: "Kaart boven",
                    mapBottom: "Kaart onder",
                    mijnPlaatsen: "Mijn plaatsen",
                    mijnKaarten: "Mijn kaarten"
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
                    clusterHover: "${count} locaties '${title}' gevonden in dit gebied",
                    searchTypes: {
                        POISUGGEST: "interessante plaats"
                    },
                    featureinfointegration: {
                        moreInformationPOI: "meer info",
                        moreInformationMunicipality: "Lokale statistieken ${name}",
                        descriptionLabel: "Beschrijving",
                        noteLabel: "Note",
                        more: "meer",
                        less: "minder",
                        nodata: "Geen bijkomende informatie beschikbaar."
                    },
                    loadingGeneralInfo: "Bezig met laden",
                    showRoute: "Routebegeleiding",
                    showNearby: "Info in de buurt",
                    coordinates: "Co\u00F6rdinaten"
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
                    size: "Size (Pixels)",
                    sendMail: "e-mail",
                    linkBoxTitle: "URL",
                    qrCode: "QRCode",
                    codeBoxTitle: "Code om in HTML te integreren",
                    mailBody: "${url}",
                    mailSubject: "Kijk naar deze kaart !",
                    options: {
                        small: "small (480 x 320)",
                        medium: "medium (640 x 480)",
                        large: "large (1280 x 1024)",
                        custom: "custom"
                    }
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
                    toolTitle: "Meten",
                    finishBtnLabel: "Stop"
                }
            },

            navigationtoolset: {
                ui: {
                    zoomInTool: {
                        title: "Zoom In",
                        tooltip: "Zoom in"
                    },
                    zoomOutTool: {
                        title: "Zoom Out",
                        tooltip: "Zoom out"
                    },
                    panTool: {
                        title: "Tonen",
                        tooltip: "Kaart verschuiven"
                    },
                    zoomToNextExtent: {
                        title: "Next Extent",
                        tooltip: "Zoom to next extent"
                    },
                    zoomToPrevExtent: {
                        title: "Previous Extent",
                        tooltip: "Zoom to previous extent"
                    },
                    zoomToInitialxtent: {
                        title: "Initial Extent",
                        tooltip: "Zoom to full extent"
                    }
                }
            },

            windowmanager: {
                ui: {
                    defaultWindowTitle: "Venster",
                    closeBtn: {
                        title: ""
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
                    },
                    loading: {
                        title: "Please wait!",
                        message: "Loading..."
                    },
                    okcancel: {
                        title: "Question",
                        okButton: "Ok",
                        cancelButton: "Cancel"
                    }
                }
            },
            basemaptoggler: {
                ui: {
                    labelTitle: "Achtergrond"
                }
            },

            basemapswitcher: {
                ui: {
                    labelTitle: "Achtergrond",
                    tooltip: "Kies een andere achtergrond"
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
                            key: "Kenmerk",
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
                        focusMapTool: "Centreer in het kaartbeeld",
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
                        info: "De laag kan momenteel niet getoond worden. Dit wordt zo spoedig mogelijk opgelost.",
                        detail: "${error}"
                    }
                },
                drawTooltips: {
                    addPoint: "Klik op de kaart",
                    finishLabel: "Stop"
                }
            },

            coordinateviewer: {
                ui: {
                    coordinates: "${y}  -  ${x}",
                    scale: "Schaal: 1 : ${scale}",
                    noSrs: "-"
                },
                hemispheres: {
                    north: "NB",
                    south: "Z",
                    east: "OL",
                    west: "W"
                }
            },

            coordinateviewer_agiv: {
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
            },

            legend: {
                toolTitle: "Legende",
                toolTip: "Legende"
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
                    exportTool: {
                        title: "Export"
                    },
                    dataView: {
                        filter: {
                            menuDefaultLabel: "Alles",
                            textBoxPlaceHolder: ""
                        },
                        pager: {
                            backButtonTooltip: "",
                            forwardButtonTooltip: "",
                            firstButtonTooltip: "",
                            lastButtonTooltip: "",
                            pageLabelText: "PAGINA ${currentPage} van ${endPage}",
                            pageSizeLabelText: "ITEM ${pageStartItemNumber}-${pageEndItemNumber} VAN ${itemCount}",
                            zeroResultsText: ""
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

            selection: {
                ui: {
                    tools: {
                        mainActivationTool: "Selecteer",
                        activationToolExtent: "Selecteer via rechthoek"
                    },
                    noDataMessage: "Er zijn geen objecten gevonden."
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
                    labelTitle: "Achtergrond"
                },
                swipeLeft: "Left",
                swipeLeftTooltip: "Toon rechtse kaart volledig",
                swipeRight: "Right",
                swipeRightTooltip: "Toon linkse kaart volledig",
                splitViewTooltip: "Toon opnieuw beide kaarten"
            },

            transparency: {
                toolTip: "Change transparency"
            },

            mapflow: {
                coverToolTip: "Klik hier voor meer opties (lagen aan/uit, metadata)",
                layerToolTip: "Lagen aan/uit",
                infoToolTip: "Klik hier voor metadata-informatie",
                turnToolTip: "Terug naar Navigatie"
            },

            //GLOBALE BASE LAYER NAMES
            baselayers: {
                ortho: {
                    title: "Luchtfoto",
                    description: "Middenschalige Luchtfoto",
                    tooltip: "Selecteer Luchtfoto als achtergrondlaag"
                },
                hybrid: {
                    title: "Hybride",
                    tooltip: "Selecteer Hybride als achtergrondlaag"
                },
                GRB: {
                    title: "Basiskaart",
                    tooltip: "Selecteer Basiskaart als achtergrondlaag"
                },
                basemap4: {
                    title: "OSM",
                    tooltip: "Selecteer OpenStreetMap als achtergrondlaag"
                },
                basemap5: {
                    title: "MapQuest",
                    tooltip: "Selecteer MapQuest als achtergrondlaag"
                },
                normalday: {
                    title: "Navteq",
                    tooltip: "Selecteer Navteq als achtergrondlaag"
                },
                normaldaygrey: {
                    title: "Stratenplan",
                    tooltip: "Selecteer Stratenplan als achtergrondlaag"
                },
                satelliteday: {
                    title: "Navteq sat",
                    tooltip: "Selecteer Navteq satellite als achtergrondlaag"
                },
                hybridday: {
                    title: "Navteq hybrid",
                    tooltip: "Selecteer Navteq hybrid als achtergrondlaag"
                },
                terrainday: {
                    title: "Navteq terrain",
                    tooltip: "Selecteer Navteq terrain als achtergrondlaag"
                },
                ferraris: {
                    title: "Ferraris",
                    description: "Ferraris basemap",
                    tooltip: "Selecteer Ferraris als achtergrondlaag"
                },
                popp: {
                    title: "Popp",
                    description: "Popp basemap",
                    tooltip: "Selecteer Popp als achtergrondlaag"
                },
                nobasemap: {
                    title: "Geen",
                    description: "Geen Achtergrond",
                    tooltip: "Geen Achtergrond"
                }
            }

        }
    }
);
