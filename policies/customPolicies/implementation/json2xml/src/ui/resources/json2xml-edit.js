function PolicyConfigurationModel(ko, $, oj, config, additionalParams) {
	
    self = this;
    self.config = config;
    self.inputDocument = ko.observable("");
    self.l10n = ko.observable(additionalParams.l10nbundle);
    self.disableApplyPolicyButton = additionalParams.disableApplyPolicyButton;
    
    self.bodySourceOptions = ko.observableArray([
                             {value: 'APIREQ', label: 'API Request'},
                             {value: 'SVCREQ', label: 'Service Request'},
                             {value: 'APIRES', label: 'API Response'},
                             {value: 'SVCRES', label: 'Service Response'}]);

    self.initialize = function() {
    	
        if (self.config) {
        	
            self.inputDocument(config.inputDocument);
            
        }
        
        self.disableApplyButton(false);
        
    };

    self.getPolicyConfiguration = function() {
    	
        var config = {
        		
        	"inputDocument" : ""
        		
        };
        
        config.inputDocument = self.inputDocument();
        
        return config;
        
    };

    self.disableApplyButton = function(flag) {
    	
        self.disableApplyPolicyButton(flag);
        
    };

    self.initialize();
    
}