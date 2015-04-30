define([
        "dojo/text!./splitview_mobile_portrait.html",
        "dojo/text!./splitview_mobile_landscape.html",
        "dojo/text!./splitview_tablet_portrait.html",
        "dojo/text!./splitview_tablet_landscape.html",
        "dojo/text!./splitview.html",
        "dojo/i18n!./nls/bundle"
    ],
    function (
        mobile_portrait,
        mobile_landscape,
        tablet_portrait,
        tablet_landscape,
        desktop,
        i18n
        ) {
        return {
            layouts: [
                {
                    requiredExecutionEnvironment: ['iPad'],
                    orientation: 'landscape',
                    templateString: tablet_landscape,
                    name: 'tablet_landscape'
                },
                {
                    requiredExecutionEnvironment: ['iPad'],
                    orientation: 'portrait',
                    templateString: tablet_portrait,
                    name: 'tablet_portrait'
                },
//                {
//                    requiredExecutionEnvironment: ['mobile'],
//                    orientation: 'portrait',
//                    templateString: mobile_portrait,
//                    name: 'mobile_portrait'
//                },
//                {
//                    requiredExecutionEnvironment: ['mobile'],
//                    orientation: 'landscape',
//                    templateString: mobile_landscape,
//                    name: 'mobile_landscape'
//                },
                {
                    requiredExecutionEnvironment: ['android'],
                    orientation: 'landscape',
                    templateString: tablet_landscape,
                    name: 'tablet_landscape'
                },
                {
                    requiredExecutionEnvironment: ['android'],
                    orientation: 'portrait',
                    templateString: tablet_portrait,
                    name: 'tablet_portrait'
                },
                //for mobiles
//                {
//                    maxWidth: 800,
//                    orientation: 'portrait',
//                    templateString: tablet_portrait,
//                    name: 'tablet_portrait'
//                },
//                {
//                    maxWidth: 800,
//                    orientation: 'landscape',
//                    templateString: tablet_landscape,
//                    name: 'tablet_landscape'
//                },
                // below: for dev only!
//                {
//                    maxWidth: 800,
//                    orientation: 'portrait',
//                    templateString: mobile_portrait,
//                    name: 'mobile_portrait'
//                },
//                {
//                    maxWidth: 800,
//                    orientation: 'landscape',
//                    templateString: mobile_landscape,
//                    name: 'mobile_landscape'
//                },
//                {
//                    maxWidth: 1000,
//                    orientation: 'portrait',
//                    templateString: tablet_portrait,
//                    name: 'tablet_portrait'
//                },
//                {
//                    maxWidth: 1000,
//                    orientation: 'landscape',
//                    templateString: tablet_landscape,
//                    name: 'tablet_landscape'
//                },
                // above: for dev only!
                {
                    templateString: desktop,
                    name: "desktop"
                }
            ],
            i18n: [i18n]
        }
    });