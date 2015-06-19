/**
 * COPYRIGHT 2014 con terra GmbH Germany
 *
 * Created by tfu on 11.07.2014.
 */
define([
        "dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/_base/array",
        "dojo/string",
        "ct/Stateful",
        "ct/_Connect",
        "ct/_when",
        "base/search/SearchParametrizable"
    ],
    function (
        declare,
        d_lang,
        d_array,
        d_string,
        Stateful,
        _Connect,
        ct_when,
        SearchParametrizable
        ) {
        return declare([
                SearchParametrizable
            ],
            {

                decodeURLParameter: function (urlObject) {
                    if (urlObject.id) {
                        return;
                    }
                    var searchObj = urlObject[this.searchTerm];
                    if (searchObj) {
                        if (d_lang.isArray(searchObj) && searchObj.length > 1) {
                            this._showNotificationWindow(this._i18n.errorMessage);
                            return;
                        }
                        if (searchObj.indexOf("|") > -1) {
                            searchObj = searchObj.split("|");
                        } else {
                            searchObj = [searchObj];
                        }

   //BartVerbeeck Bug32105                     
                        //d_array.forEach(searchObj, function(item) {
                            this.help_async(searchObj,0,searchObj.length);
                            
                            /*
                            ct_when(this._handler.triggerSearch(item), function(result) {
                                if (result.length === 0) {
                                    this._showNotificationWindow(d_string.substitute(this._i18n.notFoundMessage, {
                                        title: item
                                    }));
                                    return;
                                }
                                console.log("Search parameter " + this.searchTerm + ":" + item + " are decoded.")
                            }, this);
                        */    
                        //}, this);
                        
                       
                    }
                }
                ,
                help_async:function(searchObj,nrun,nAll){
                    

                    d_array.forEach([searchObj[nrun]], function(item) {
                            ct_when(this._handler.triggerSearch(item), function(result) {
                                if (result.length === 0) {
                                    this._showNotificationWindow(d_string.substitute(this._i18n.notFoundMessage, {
                                        title: item
                                    }));
                                    return;
                                }
                                console.log("Search parameter " + this.searchTerm + ":" + item + " are decoded.");
                                nrun++;
                                if(nrun<nAll)
                                    this.help_async(searchObj,nrun,nAll);
                            }, this);
                            
                        }, this);
                    
                }
            }
        );
    }
);