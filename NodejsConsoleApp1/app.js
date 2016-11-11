//var js2xmlparser = require("js2xmlparser");
var HttpsProxyAgent = require('https-proxy-agent');
var request = require('request');


//use cntlm as local proxy 
var proxy = 'http://127.0.0.1:3128';
var agent = new HttpsProxyAgent(proxy);


var bingCallFromShop = function (shop) {
    var restUrlBing = "http://dev.virtualearth.net/REST/v1/Locations?CountryRegion=IT&locality=";
    restUrlBing = restUrlBing + shop.CITTA[0] + "&postalCode=" + shop.CAP[0] + "&addressLine=" + shop.INDIRIZZO[0] + "&key=Ao_j72PanYDxMHU4D0jLe7AFfGNY6Q7vQCYDmmn5ejRqYT5szKfTbK23lDo9RR5a";
    return restUrlBing;
};

request({
    uri: "https://sdr.csvas.tim.it/fast2/getshop.xml",
    method: "GET",
    // headers: headerObj,
    //agent: agent,
    timeout: 10000,
    followRedirect: true,
    maxRedirects: 10,
   // body: js2xmlparser.parse("request", omnitureHit)
}, function (error, response, body) {
    //console.log("Error" + error);
    //console.log("Response: " + response);
    //console.log("Body: " + body);
    var parseXmlShop = require('xml2js').parseString; 
    parseXmlShop(body, function (err, result) {
        var negozi = result;
        console.log(negozi.NEGOZI.NEGOZIO.length);
        var bingUrl;
        for (var i = 0; i < 5; i++) {
            console.log(negozi.NEGOZI.NEGOZIO[i]);
            request({
                uri: bingCallFromShop(negozi.NEGOZI.NEGOZIO[i]),
                method: "GET",
                // headers: headerObj,
                agent: agent,
                timeout: 10000,
                followRedirect: true,
                maxRedirects: 10,
            }, function (error, response, body) {
                if (error) {
                    console.log("error: " + error);
                } else {
                    var resultBing = JSON.parse(body);
                    console.log("ShopCoord: " + resultBing.resourceSets[0].resources[0].point.coordinates);
                    negozi.NEGOZI.NEGOZIO[i].coordinates = resultBing.resourceSets[0].resources[0].point.coordinates;
                }
                return;
            });
         
        }
        
    });
    return;
});