# Collaboratie tool

Doel van het project:

Graag zouden we met de web applicatie die wij gaan maken, afstappen van de ouderwetse manier van lesgeven en vergaderen. We zouden het geheel interactiever maken, met stellingen (bv. Gesteld door een leraar) en visies (bv. Antwoorden van een student). Op deze manier zullen de visies van elk individu zonder de invloed van anderen aan bod komen. Zo kan diegene die de vraagstelling doet antwoorden direct allemaal binnenkrijgen en vergelijken. Op deze manier zal er snel een overzicht zijn van de gegeven visies. Moesten er problemen zijn, zullen deze ook sneller worden opgemerkt zodat hier op ingespeeld kan worden. 

Een extra doel zou in onze ogen een opvolg systeem kunnen zijn voor leraars. Wat inhoudt dat wanneer het systeem wordt gebruikt in een omgeving, waar vragen worden gesteld waarbij de antwoorden juist of fout zijn, de leraar snel kan opmerken welke leerlingen wel of niet mee zijn met de leerstof. Zo kan hier ook sneller worden op ingespeeld. Wederkerende problemen zouden ook een wijziging kunnen te weeg brengen in de manier waarop de bepaalde leerstof wordt uitgelegd. 

Hoe project lokaal op te starten:

- Node server opstarten
In de command line vul je het commando 'node server.js' in. Nu kan je in de browser naar http://localhost:3000 gaan om webapp te zien.
Om het lokaal goed te laten werken moet je zien dat alle http post en get beginnen met http://localhost:3000. (Voorbeeld: 'http://localhost:3000/checkRoles')

- MongoDB connectie
Dit gebeurd in de server.js file, de link ervan is: 'mongodb://administrator:administrator@ds048719.mlab.com:48719/tool'. Hierin is administrator de username en het paswoord voor op de database te geraken.

- Paswoorden

Voor remote access:

Hiervoor heb ik gebruik gemaakt van 'ngrok' en deze ergens in mijn files geïnstalleerd. Het commando om deze op te starten is: 'ngrok http 3000'. Nu is er een forwarding url gecreeërd en deze zal je gebruiken om remote access te verkrijgen op de webapp.
Maar om de site te kunnen gebruiken moet je alle http post en get vervangen door de juist verkregen url. (Voorbeeld: $http.post('http://8bec0120.ngrok.io/checkRoles')

Gemaakt door Stefan & Nick

AP Hogeschool

2016-2017
