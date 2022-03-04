define([
    'postmonger'
], function(
    Postmonger
) {
    'use strict';

    var connection = new Postmonger.Session();
    var payload = {};
    var lastStepEnabled = false;
    var steps = [ // initialize to the same value as what's set in config.json for consistency
        { "label": "Create SMS Message", "key": "eventDefinitionKey" }
    ];
    var currentStep = steps[0].key;
    var eventDefinitionKey = '';
    var deFields = [];

    $(window).ready(onRender);

    connection.on('initActivity', initialize);
    connection.on('requestedTokens', onGetTokens);
    connection.on('requestedEndpoints', onGetEndpoints);

    connection.on('clickedNext', save);
    connection.on('clickedBack', onClickedBack);
    connection.on('gotoStep', onGotoStep);

    function onRender() {
        // JB will respond the first time 'ready' is called with 'initActivity'
        connection.trigger('ready');
        connection.trigger('requestTokens');
        connection.trigger('requestEndpoints');
    }

  function initialize(data) {
        console.log("Initializing data data: "+ JSON.stringify(data));
        if (data) {
            payload = data;
        }    

        var hasInArguments = Boolean(
            payload['arguments'] &&
            payload['arguments'].execute &&
            payload['arguments'].execute.inArguments &&
            payload['arguments'].execute.inArguments.length > 0
         );

        var inArguments = hasInArguments ? payload['arguments'].execute.inArguments : {};

        console.log('Has In arguments: '+JSON.stringify(inArguments));

        $.each(inArguments, function (index, inArgument) {
            $.each(inArgument, function (key, val) {

                if (key === 'adhoc') {
                    $('#adhoc').val(val);
                }
                
                if (key === 'studyId') {
                    $('#studyId').val(val);
                }
                
                 if (key === 'contactId') {
                    $('#contactId').val(val);
                }

             
            })
        });

        connection.trigger('updateButton', {
            button: 'next',
            text: 'done',
            visible: true
        });

    }

    
    function onGetTokens (tokens) {
        // Response: tokens = { token: <legacy token>, fuel2token: <fuel api token> }
       // console.log("Tokens function: "+JSON.stringify(tokens));
        //authTokens = tokens;
    }

    function onGetEndpoints (endpoints) {
       // Response: endpoints = { restHost: https://iqvia-rds-sms-send-message-exp-1-0-dev.us-e1.cloudhub.io/api/messages } i.e. "rest.s1.qa1.exacttarget.com"
      //  console.log("Get End Points function: "+JSON.stringify(endpoints));
    }

    	function requestedInteractionHandler (settings) {
		try {
			eventDefinitionKey = settings.triggers[0].metaData.eventDefinitionKey;
			$('#adhoc').val(eventDefinitionKey);
			$('#studyId').val(eventDefinitionKey);
			$('#contactId').val(eventDefinitionKey);

			if (settings.triggers[0].type === 'SalesforceObjectTriggerV2' &&
					settings.triggers[0].configurationArguments &&
					settings.triggers[0].configurationArguments.eventDataConfig) {

				// This workaround is necessary as Salesforce occasionally returns the eventDataConfig-object as string
				if (typeof settings.triggers[0].configurationArguments.eventDataConfig === 'string' ||
							!settings.triggers[0].configurationArguments.eventDataConfig.objects) {
						settings.triggers[0].configurationArguments.eventDataConfig = JSON.parse(settings.triggers[0].configurationArguments.eventDataConfig);
				}

				settings.triggers[0].configurationArguments.eventDataConfig.objects.forEach((obj) => {
					deFields = deFields.concat(obj.fields.map((fieldName) => {
						return obj.dePrefix + fieldName;
					}));
				});

				//deFields.forEach((option) => {
				//	$('#select-id-dropdown').append($('<option>', {
				//		value: option,
				//		text: option
				//	}));
				//});

				//$('#select-id').hide();
				//$('#select-id-dropdown').show();
			} else {
				//$('#select-id-dropdown').hide();
				//$('#select-id').show();
			}
		} catch (e) {
			console.error(e);
			//$('#select-id-dropdown').hide();
			//$('#select-id').show();
		}
	}

    
    function save() {

		var adhoc = $('#adhoc').val();
		//var ToNum = $('#ToNum').val();
		var studyId = $('#studyId').val();
		//var fromNumber = $('#fromNumber').val();
		var contactId = $('#contactId').val();
        
        	
       
        payload['arguments'].execute.inArguments = [{
            
            "adhoc": "{{Contact.CustomActivity.Test Active Data.AdhocText}}",
           "studyId": "{{Contact.CustomActivity.Test Active Data.Clinical Trial Protocol ID}}",
           "contactId": "{{Contact.CustomActivity.Test Active Data.Contact ID}}"
            //"adhoc": '{{adhoc.' + step1 + '.\"' + Contact.Custom Activity.Test Active Data.AdhocText + '\"}}',
            //"studyId": '{{studyId.' + step1 + '.\"' + Contact.Custom Activity.Test Active Data.Clinical Trial Protocol ID + '\"}}',
            //"contactId": '{{contactId.' + step1 + '.\"' + Contact.Custom Activity.Test Active Data.Contact ID + '\"}}'
           // 'serviceCloudId': '{{Event.' + eventDefinitionKey + '.\"' + idField + '\"}}'
		
		payload['arguments'].execute.inArguments.push({"AdhocText": adhoc});
	    	payload['arguments'].execute.inArguments.push({"Clinical Trial Protocol ID": studyId});
	    	payload['arguments'].execute.inArguments.push({"Contact ID": contactId});

        }];
       // payload['arguments'] = payload['arguments'] || {};
	//	payload['arguments'].execute = payload['arguments'].execute || {};

	//	var idField = deFields.length > 0 ? $('#adhoc').val() : $('#studyId').val() : $('#contactId').val();

	//	payload['arguments'].execute.inArguments = [{
	//		'adhoc': '{{Event.' + eventDefinitionKey + 'Contact.CustomActivity.Test Active Data.\"' + AdhocText + '\"}}'
	//		'studyId': '{{Event.' + eventDefinitionKey + 'Contact.CustomActivity.Test Active Data.\"' + Clinical Trial Protocol ID + '\"}}'
	//		'contactId': '{{Event.' + eventDefinitionKey + 'Contact.CustomActivity.Test Active Data.\"' + Contact ID + '\"}}'
	//	}];

		//payload['metaData'] = payload['metaData'] || {};
		//payload['metaData'].isConfigured = true;

		//console.log(JSON.stringify(payload));

		//connection.trigger('updateActivity', payload);
       // executeSql('INSERT INTO Test Active Data ("Clinical Trial Protocol ID", "AdhocText", "Contact ID") VALUES (?, ?, ?)', [studyId, adhoc, contactId]);
        
        payload['metaData'].isConfigured = true;
        console.log("Payload on SAVE function: "+JSON.stringify(payload));
        connection.trigger('updateActivity', payload);
        
   // executeSql('Update Active Studies Outreach SET ( "AdhocText" ) VALUES ( ? )', { values: [ adhoc ] } WHERE ("Clinical Trial Protocol ID") = [studyId]);
    
   // this.$.db.query( 'INSERT INTO Active Studies Outreach ( "AdhocText" ) VALUES ( ?,? )', { values: [ adhoc ] } ); 

        
    }                    
	connection.on('initActivity', initialize);
	//connection.on('clickedNext', onClickedNext);
	//connection.on('clickedBack', onClickedBack);
	//connection.on('gotoStep', onGotoStep);
	connection.on('requestedInteraction', requestedInteractionHandler);
});
