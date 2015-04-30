define([
    "ct/util/TypeFormat"
],function(TypeFormat){
    
    if (!TypeFormat["link"])
    {
        TypeFormat["link"] = function(value) {
            if (value) {
                return "<a href='"+value+"' target='_blank'>"+value+"</a>";
            }
            return "-";
        };
        
        
    }   
    if (!TypeFormat["HTML"]) {
        TypeFormat["HTML"] = function(value) {
            return value;
        };
    }
    
});