# Architecture


![Architecture Diagram](architecture%20diagram%20java.png)

**API gateway**
API Gateway functioneert als een enkel toegangspunt voor alle client-aanvragen(API calls) naar een microservices-architectuur. Het handelt inkomende verzoeken af door deze door te sturen naar de juiste services, vaak met behulp van load balancing. Ook heeft een API Gateway extra functionaliteiten zoals authenticatie, autorisatie, rate limiting, en logging. Dit biedt ook controle over de toegang tot de microservices en vereenvoudigt het de client-communicatie door verschillende services achter één enkel endpoint te verbergen.

**Angular web application**
De Angular web application fungeert als de gebruikersinterface (UI) van het systeem en maakt het mogelijk voor gebruikers om te interfacen met de applicatie. Vanuit de UI worden API-verzoeken verstuurd naar de API Gateway, die deze doorstuurt naar de juiste microservices. De Angular-app ontvangt vervolgens de response van de microservices, verwerkt de gegevens en toont de resultaten aan de gebruiker. Dit zorgt voor een UI waar gebruikers posts kunnen bekijken, reacties kunnen plaatsen, en andere functionaliteit kunnen gebruiken.

**Post Service**
De Post Service is verantwoordelijk voor het beheren van de inhoud van de posts. Het houdt zich bezig met het aanmaken, opslaan, bewerken, publiceren, en beheren van de posts die redacteurs creëren. De service communiceert synchrone via OpenFeign met Review Service (om posts te verzenden voor goedkeuring) en Comment Service (om comments op te halen bij posts). De service gebruikt een eventbus voor asynchrone communicatie met Review Service (wanneer een post is ingediend) en Comment Service (wanneer een post is gepubliceerd) om events te verzenden.

**Review Service**
De Review Service richt zich op het proces van goedkeuring of afwijzing van posts die zijn ingediend voor publicatie. Het biedt functionaliteiten voor redacteuren om posts te beoordelen en feedback te geven. De service gebruikt Openfeign voor synchrone communicatie met Post Service (om posts op te halen die ingediend zijn) en om de goedkeuringsstatus terug te sturen naar Post Service. De service gebruikt een eventbus (asynchrone communicatie) voor het verzenden van events naar Post Service (wanneer een post is goedgekeurd/afgewezen).

**Comment Service**
De Comment Service behandelt alles wat met gebruikersreacties op gepubliceerde posts te maken heeft. Deze service zorgt ervoor dat gebruikers kunnen interacteren met de content door reacties te plaatsen, lezen.  De service gebruikt synchrone communicatie via Openfeign met Post Service (om posts op te halen om comments op te kunnen slaan) en om nieuwe comments op te slaan. De service gebruikt een eventbus als asynchrone communicatie voor het verzenden van events naar Post Service (wanneer er een nieuwe comment is geplaatst of een comment is bewerkt/verwijderd).

**OpenFeign**
OpenFeign is een REST-client (in Java) die wordt gebruikt om synchrone communicatie tussen microservices te vereenvoudigen. Dus wanneer een service (bijvoorbeeld de Post Service) een request naar een andere service (bijvoorbeeld de Review Service) moet sturen, het onmiddellijk een reactie verwacht en pas verdergaat als die reactie ontvangen is.

**Eventbus**
De Eventbus (RabbitMQ)/ messagebus/ queue behandelt asynchrone communicatie tussen microservices. In dit geval stuurt een service een event naar de Eventbus en gaat vervolgens verder zonder te wachten op een directe reactie. Andere services kunnen zich abonneren en reageren zodra ze dit event ontvangen. In essentie zorgt eventbus voor het versturen en ontvangen van berichten/event naar services die publishers(publiseerders) en subcribers(abbonees) zijn.
 
**Config Service**
De Config Service verzamelt en beheert configuratiebestanden voor microservices. Elk bestand bevat specifieke configuraties voor de bijbehorende service, waardoor de services eenvoudig en centraal geconfigureerd kunnen worden. Hierdoor kunnen wijzigingen in configuraties (zoals database-instellingen, API-endpoints, ...) dynamisch ingeladen worden zonder de service te herstarten.

**Discovery Service**
Eureka server is de centrale Discovery Service die functioneert als een registratiepunt voor alle services. Alle microservices die willen communiceren, draaien een Eureka Client die zichzelf registreert bij de server en ook updates ontvangt.
