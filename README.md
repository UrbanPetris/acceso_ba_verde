# Acceso a Espacios Verdes en la Ciudad de Buenos Aires

[![N|Solid](https://raw.githubusercontent.com/UrbanPetris/javascript/master/entrega_final/images/Logotipo_de_la_Ciudad_de_Buenos_Aires.svg)](https://urbanpetris.github.io/observatorio/)

## Repositorio de curso JavaScript (19965) - Coderhouse

Este repositorio contiene todos los archivos necesarios para clonar el proyecto final del curso JavaScript (19965) de Coderhouse. El mismo consiste en todos los archivos html, css y javascript utilizados en la creación del de la aplicación web de Acesso a Espacios Verdes en la Ciudad de Buenos Aires la cual consiste en una única página (index.html).

## Acerca de la aplicación

La aplicación "Acceso a Espacios Verdes en la Ciudad de Buenos Aires" permite operar sobre un geovisor interactivo permitiéndole al usuario analizar distintas localizaciones de la Ciudad de Buenos Aires y su acceso a los distintos espacios verdes públicos. 

Los espacios verdes públicos provienen del repositorio del Gobierno de la Ciudad de Buenos Aires y se se consumen localmente para evitar caídas en el servidor que imposibiliten el uso de la aplicación. Además se corrigieron ciertas inconsistencias en los datos. Los distintso tipos de espacios verdes públicos son "Barrio/Complejo", "Cantero Central", "Jardín", "Jardín Botánico", "Parque", "Parque Semipúblico", "Patio", "Patio de Juegos Inclusivo", "Plaza" y "Plazoleta". Por defecto la aplicación carga "Parque", Plaza" y "Plazoleta" que son las principales. Para cada espacio verde en el mapa se puede consultar en un popup sus principales atributos (id, nombre, área total verde en m2 y tipo de espacio) mediante un click en algún lado de su geometría.

La consulta de acceso tiene en cuenta la distancia en metros lineales desde el lugar donde se hizo el click en el mapa ("buffer"). El valor del buffer es de 300 m por defecto y puede cambiarse en cualquier momento. La consulta sólo está habilitada dentro de los límites de la Ciudad de Buenos Aires. Mientras la consulta está habilitada no pueden consultarse los atributos de los espacios verdes.

Cuando se realiza una consulta de acceso en alguna locación del mapa se ejecuta un geoproceso que devuelve un reporte con los siguienets datos: calle, altura, barrio, comuna, distancia elegida, cantidad de espacios verdes y área total verde en m2 contenida dentro de dicha distancia. Es importante recalcar que los m2 verdes son los que efectivamente intersectan con el buffer creado por la consulta, no se contabilizan todos los m2 de los espacios verdes en el radio de influencia. Los datos de calle y altura provienen de una consulta a la web API del servicio Nominatim de OpenStreetMap. El reporte puede consultarse en cualquier momento y el último realizado queda guardado en el storage del navegador para su consulta en próximas sesiones.

Por último, la aplicación permite interactuar con 4 servicios de mapas diferentes: OpenStreetMaps, CartoDB Dark (ideal para focalizar únicamente en la capa de espacios verdes), Esri World Imagery (imagen satelital) y Mapa Buenos Aires (GCBA) (mapa oficial del Gobierno de la Ciudad).

## Contenidos

- Encabezado con logo y título.
- Geovisor con mapa interactivo de la Ciudad de Buenos Aires y alrededores en donde se pueden visualizar y consultar los datos de Espacios Verdes Públicos (mediante popups) así como los resultados de la interacción con el usuario. Presenta botones de zoom in/zoom out y responde a eventos típicos del mouse como en cualquier otro mapa web (zoom, paneo, etc). 
- Selector de Espacios Verdes y Distancia: botón que habilita un sidebar con opciones de carga interactiva de los espacios verdes y selección de distancia a partir de la cual se calcula el acceso
- Consulta de Acceso: botón que habilita la consulta en el mapa, mediante un click, a partir de la cual se procesan los datos espaciales mediante geoprocesamiento y se realizan consultas a web APIs.
- Reporte: botón que despliega un sidebar en el extremo inferior del mapa con los resultados de la Consulta de Acceso. En caso de existir, el último reporte se previsualiza cada vez que se recarga la página y se dsepliega automáticamente cada vez que se realiza una nueva consulta. 
- Control de Capas: botón que despliega un menú de opciones para intercambiar entre los distintos basemaps y habilitar la visualización y control de las capas vectoriales de espacios verdes así como los resultados de la Consulta de Acceso. 
- Diseño responsive; contenido 100% adaptable a pantallas de hasta 320 px de ancho.

## Herramientas empleadas

La aplicación utiliza las siguientes tecnologías y herramientas de uso libre:

- [HTML 5] - markup language para la estructuración y presentación del contenido
- [CSS3] - style sheet language para mejorar el estilo del contenido, incluyendo colores, fuentes y diseño. 
- [Javascript] - lenguaje de programación para darle interactividad a la página, principalmente respondiendo a eventos en el navegador
- [jQuery] - librería Javascript para manipulación del DOM
- [Leaflet] - librería Javascript para mapas interactivos responsive
- [Turf.js] - librería Javascript para análisis espacial avanzado
- [Jquery Sidebar] - librería Javascript que implementa un sidebar
- [BA Data] - repositorio de datos abiertos del Gobierno de la Ciudad de Buenos Aires. 
- [Nominatim] - web API para geocodificación con datos de Open Street Map 
- [Git] - sistema de reversionado de código
- [Github] - plataforma de desarrollo colaborativo para alojar proyectos utilizando el sistema de control de versiones Git

## Instalación

Sírvase clonar el repositorio usando git bash o cualquier terminal que permite usar git. Escriba en ella:

```sh
$git clone https://github.com/UrbanPetris/acceso_ba-verde.git
```

Para más información dirígase a la documentación oficial de Github [aquí](https://docs.github.com/es/repositories/creating-and-managing-repositories/cloning-a-repository)

## Organización del proyecto

Si ha hecho una clonación existosa del repositorio encontrará en la carpeta del directorio los siguientes archivos:

- index.html (página del sitio)

Y un sistema de carpetas como el siguiente:
- imagen (recursos visuales)
- data (archivos json y geojson incorporados asincrónicamente en el código principal)
- js (código principal en simulador.js y librerías javascript externas empleadas localmente)
- css (stylesheet principal junto a otras dependientes de librerías)

## Licencia

MIT

**Todo el material audiovisual de este sitio ha sido obtenido de la web.**

[HTML 5]: <https://developer.mozilla.org/en-US/docs/Glossary/HTML5>
[CSS3]: <https://developer.mozilla.org/en-US/docs/Web/CSS>
[Javascript]: <https://developer.mozilla.org/en-US/docs/Web/JavaScript>
[Turf.js]: <https://turfjs.org/>
[jQuery]: <http://jquery.com>
[jQuery Sidebar]: <https://jillix.github.io/jQuery-sidebar/>
[Leaflet]: <https://leafletjs.com/>
[Git]: <https://git-scm.com/>
[Github]: <https://github.com/>
[BA Data]: <https://data.buenosaires.gob.ar/dataset/>
[Nominatim]: <https://nominatim.org/>

