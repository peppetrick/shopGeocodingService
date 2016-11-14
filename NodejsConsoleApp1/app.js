//var js2xmlparser = require("js2xmlparser");
var HttpsProxyAgent = require('https-proxy-agent');
var request = require('request');
var async = require("async");


//use cntlm as local proxy 
var proxy = 'http://127.0.0.1:3128';
var agent = new HttpsProxyAgent(proxy);


var bingCallFromShop = function (shop) {
    var restUrlBing = "http://dev.virtualearth.net/REST/v1/Locations?CountryRegion=IT&locality=";
    restUrlBing = restUrlBing + shop.CITTA[0] + "&postalCode=" + shop.CAP[0] + "&addressLine=" + shop.INDIRIZZO[0] + "&key=Ao_j72PanYDxMHU4D0jLe7AFfGNY6Q7vQCYDmmn5ejRqYT5szKfTbK23lDo9RR5a";
    return restUrlBing;
};

/*given a shoplist in json of the format  below add coordinates resolving the address through bing geocoding services
{
    "IDNEGOZIO" : ["5337"],
	"NOME" : ["APPLE RETAIL ITALIA SRL"],
	"REGIONE" : ["Toscana"],
	"PROVINCIA" : ["FI"],
	"CITTA" : ["CAMPI BISENZIO"],
	"CAP" : ["50013"],
	"INDIRIZZO" : ["VIA SAN QUIRICO165"],
	"NUMERO_TELEFONICO" : [""],
	"NUMERO_FAX" : [""],
    "EMAIL" : [""],
    "FLAGASSIST" : ["false"],
    "GRUPPOCLI" : ["4C"]
}*/

var bingCall = function (){

}

var resolveShopCoor = function (negoziList) {
    var negozi = negoziList;
    var request = require('request');
    var bingUrl;
    var count = 0;
    async.whilst(
        function () { return count < negozi.NEGOZI.NEGOZIO.length; },
    function (callback) {
            request({
                uri: bingCallFromShop(negozi.NEGOZI.NEGOZIO[count]),
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
                    if (resultBing.resourceSets[0].resources[0]) {
                        console.log("ShopCoord: " + resultBing.resourceSets[0].resources[0].point.coordinates);
                        negozi.NEGOZI.NEGOZIO[count].coordinates = resultBing.resourceSets[0].resources[0].point.coordinates;
                    } else {
                        console.log("error- no coord resolved");
                           }
                       
                }
                count++;
                callback();
                return;
            });
               
        },
           function (err) { console.log("error during execution", err) }
    );
          
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
        resolveShopCoor(negozi);  
         });
    return;
});
//process.exit(0);







