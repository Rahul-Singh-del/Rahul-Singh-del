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
        { "label": "Create SMS Message", "key": "step1" }
    ];
    var currentStep = steps[0].key;

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

    function save() {

        var adhoc = $('#adhoc').val();
        //var ToNum = $('#ToNum').val();
        var studyId = $('#studyId').val();
        //var fromNumber = $('#fromNumber').val();
        var contactId = $('#contactId').val();
        
        
       
        payload['arguments'].execute.inArguments = [{
            
            //"adhoc": '{{Contact.Custom Activity.Test Active Data.AdhocText}}',
            //"studyId": '{{Contact.Custom Activity.Test Active Data.Clinical Trial Protocol ID}}',
            //"contactId": '{{Contact.Custom Activity.Test Active Data.Contact ID}}'
            'adhoc': '{{step1.' + adhoc + '.\"' + AdhocText + '\"}}'
            'studyId': '{{step1.' + studyId + '.\"' + Clinical Trial Protocol ID + '\"}}'
            'contactId': '{{step1.' + contactId + '.\"' + Contact ID + '\"}}'
           // 'serviceCloudId': '{{Event.' + eventDefinitionKey + '.\"' + idField + '\"}}'

            //"to": "{{Contact.Attribute.Test Custom Activity.TargetNumber}}" //<----This should map to your data extension name and phone number column
            //"adhoc": adhoc,
            //"studyId": studyId,
            
       
        }];
        
       // executeSql('INSERT INTO Test Active Data ("Clinical Trial Protocol ID", "Country", "Language", "AdhocText") VALUES (?, ?, ?)', [studyId, "US", "en", adhoc]);
        
        payload['metaData'].isConfigured = true;
        console.log("Payload on SAVE function: "+JSON.stringify(payload));
        connection.trigger('updateActivity', payload);
        
   // executeSql('Update Active Studies Outreach SET ( "AdhocText" ) VALUES ( ? )', { values: [ adhoc ] } WHERE ("Clinical Trial Protocol ID") = [studyId]);
    
   // this.$.db.query( 'INSERT INTO Active Studies Outreach ( "AdhocText" ) VALUES ( ?,? )', { values: [ adhoc ] } ); 

        
    }                    

});
