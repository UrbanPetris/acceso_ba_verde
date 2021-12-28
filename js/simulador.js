// *******  Definición de clases ***********

class ConsultaPunto {
  constructor(long, lat, buffer_dist) {
    this.long = long;
    this.lat = lat;
    this.buffer_dist = buffer_dist;
  }
  buffer() {
    const point = turf.point([this.long, this.lat]);
    return turf.buffer(point, this.buffer_dist, {
      units: "meters",
      steps: 20,
    });
  }
  checkCABA(lyr) {
    const point = turf.point([this.long, this.lat]);
    return turf.booleanIntersects(point, lyr);
  }

  getAddress() {
    let lat = this.lat;
    let long = this.long;
    let promise = new Promise(function (resolve, reject) {
      $.ajax({
        url: `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${long}`,
        async: true,
      }).done(function (response) {
        let addressElements = response.address;
        let roadString = addressElements.road ?? "Sin nombre";
        let altura = addressElements.house_number ?? "s/n";
        let addressString = `${roadString} ${altura}`;
        resolve(addressString);
      });
    });
    return promise;
  }

  getDistrito(lyr) {
    const point = turf.point([this.long, this.lat]);
    for (let i = 0; i < lyr.features.length; i++) {
      if (turf.booleanPointInPolygon(point, lyr.features[i])) {
        let comuna = parseInt(lyr.features[i].properties["COMUNA"]);
        const arr = lyr.features[i].properties["BARRIO"]
          .toLowerCase()
          .split(" ");
        for (let i = 0; i < arr.length; i++) {
          arr[i] = arr[i].charAt(0).toUpperCase() + arr[i].slice(1);
        }
        let barrio = arr.join(" ");
        let distrito_string = barrio + " / Comuna " + comuna;
        return distrito_string;
      }
    }
  }
}

class ProcesamientoLayers {
  constructor(lyrPolygon1, lyrPolygon2) {
    this.lyrPolygon1 = lyrPolygon1;
    this.lyrPolygon2 = lyrPolygon2;
  }
  intersect() {
    let poly = this.lyrPolygon1.toGeoJSON().features[0];
    let fcPoly = this.lyrPolygon2.toGeoJSON();
    let fgp = [];
    let bbPoly = turf.bboxPolygon(turf.bbox(poly));
    for (let i = 0; i < fcPoly.features.length; i++) {
      let bb = turf.bboxPolygon(turf.bbox(fcPoly.features[i]));
      if (turf.intersect(bbPoly, bb)) {
        let int = turf.intersect(poly, fcPoly.features[i]);
        if (int) {
          int.properties = fcPoly.features[i].properties;
          fgp.push(int);
        }
      }
    }
    return turf.featureCollection(fgp);
  }
}

class ReporteProcesamiento {
  constructor(
    cantidad_ev,
    area_total_ev,
    buffer_dist,
    address_string,
    distrito_string
  ) {
    this.cantidad_ev = cantidad_ev;
    this.area_total_ev = area_total_ev;
    this.buffer_dist = buffer_dist;
    this.address_string = address_string;
    this.distrito_string = distrito_string;
  }

  cargarUltimoReporte() {
    this.cantidad_ev = localStorage.getItem("cantidadTotalEV");
    this.area_total_ev = localStorage.getItem("cantidadTotalArea");
    this.buffer_dist = localStorage.getItem("bufferDistElegida");
    this.address_string = localStorage.getItem("direccionConsulta");
    this.distrito_string = localStorage.getItem("distritoConsulta");
  }

  crearDivReporte(tipo_reporte) {
    $("#reporteProcesamiento").empty();
    $("#reporteProcesamiento").append(
      `<h2 id='reporteTitulo'>${tipo_reporte}</h2>    <p>Dirección de la consulta:</p>    <div id='direccionConsulta'></div>    <p>Barrio/Comuna:</p>    <div id='distritoConsulta'></div>    <p>Cantidad de Espacios Verdes:</p>    <div id='cantidadTotalEV'></div>    <p>Área Total (m2):</p><div id='areaTotalEV'></div><p>Distancia elegida (m):</p><div id='bufferDistElegida'></div>`
    );
  }

  visualizarReporte(booleanDesplegarReporte) {
    $("#reporteProcesamiento").css("background-color", "#267915");
    $("#reporteProcesamiento").css("visibility", "visible");
    $("#direccionConsulta").text(this.address_string);
    $("#distritoConsulta").text(this.distrito_string);
    $("#cantidadTotalEV").text(this.cantidad_ev);
    $("#areaTotalEV").text(parseFloat(this.area_total_ev).toFixed(2));
    $("#bufferDistElegida").text(this.buffer_dist);
    if (booleanDesplegarReporte) {
      $("#reporteProcesamiento").trigger("sidebar:open");
      ctlBtnReporte.state("ocultar-reporte");
    }
  }

  visualizarUltimoReporte() {
    if (localStorage.direccionConsulta != undefined) {
      this.crearDivReporte("Último Reporte");
      this.visualizarReporte(false);

      $("#reporteProcesamiento").trigger("sidebar:toggle", [{ speed: 500 }]);

      setTimeout(() => {
        $("#reporteProcesamiento").trigger("sidebar:toggle");
      }, 5000);

      $("#reporteProcesamiento").on("sidebar:closed", () => {
        $("#btnReporte").prop("disabled", false);
      });
    }
  }

  guardarReporte() {
    localStorage.setItem("direccionConsulta", this.address_string);
    localStorage.setItem("distritoConsulta", this.distrito_string);
    localStorage.setItem("cantidadTotalEV", this.cantidad_ev);
    localStorage.setItem("cantidadTotalArea", this.area_total_ev.toFixed(2));
    localStorage.setItem("bufferDistElegida", this.buffer_dist);
  }
}

// *********** VARIABLES inicialización ***************
let estilos;
let lyrCABA;
let ctlLayers;
let objBasemaps;
let objOverlays;
let punto_consulta;
let procesamiento;
let reporte_procesamiento;
let click_lat;
let click_long;
let lyr_ev;
let lyr_punto_consulta_buffer;
let lyr_resultadoProcesamientoConsulta;
let inputBufferDist;
let arrayEleccionEV = [];
let output_reporte_cantidad_ev;
let output_reporte_areatotal_ev;
let ev_interactive = true;
let btnEvOpciones = false;
let habilitacion_consulta = false;
let distritoString;

// *******  AJAX ***********

$.ajax({
  url: "data/estilos.json",
  dataType: "json",
  async: true,
  success: function (data) {
    estilos = data;
  },
});

$.ajax({
  url: "data/barrios.json",
  dataType: "json",
  async: true,
  success: function (data) {
    lyrCABA = data;
  },
});

// *******  Funciones de procesamiento y análisis espacial ***********

function eleccionEV() {
  $(".ev_opciones:checked").each(function () {
    arrayEleccionEV.push($(this).val());
  });
}

function habilitarConsulta() {
  lyr_ev.setInteractive(false);
  mymap.on("click", consultaEV);
  L.DomUtil.addClass(mymap._container, "crosshair-cursor-enabled");
  $("#mapConsole").text("Haga click en el mapa para obtener reporte");
  $("#mapConsole").stop(true, true).slideDown(300).delay(5000).fadeOut(1000);
}

function deshabilitarConsulta() {
  lyr_ev.setInteractive(true);
  mymap.off("click", consultaEV);
  $("#reporteProcesamiento").trigger("sidebar:close");
  L.DomUtil.removeClass(mymap._container, "crosshair-cursor-enabled");
}

function removerCapa(lyr) {
  ctlLayers.removeLayer(lyr);
  mymap.removeLayer(lyr);
}

function cargarCapa(lyr, lyr_name, lyrfunction) {
  lyr = lyrfunction;
  mymap.addLayer(lyr);
  ctlLayers.addOverlay(lyr, lyr_name);
  return lyr;
}

function crear_capa_buffer() {
  return L.geoJson(punto_consulta.buffer(), {
    style: () => {
      return {
        fillColor: "rgba(255, 0, 0, 1)",
        color: "rgba(255, 0, 0, 1)",
        className: "resultadoProcesamiento",
      };
    },
    interactive: false,
  });
}

function crear_capa_interseccion() {
  return L.geoJson(procesamiento.intersect(), {
    style: () => {
      return {
        fillColor: "rgba(255, 0, 0, 1)",
        color: "rgba(255, 0, 0, 1)",
        className: "resultadoProcesamiento",
      };
    },
    interactive: false,
  });
}

function crear_capa_ev() {
  return L.geoJson.ajax("data/espacios_verdes_incluidos.geojson", {
    style: style_ev,
    onEachFeature: processEV,
    filter: function (json) {
      return arrayEleccionEV.indexOf(json.properties.clasificac) !== -1;
    },
  });
}

function crear_reporte(lyr, bufferDist, addressString, distritoString) {
  let json_lyr_interseccion = lyr.toGeoJSON();
  output_reporte_cantidad_ev = json_lyr_interseccion.features.length;
  output_reporte_areatotal_ev = 0;
  for (let i = 0; i < json_lyr_interseccion.features.length; i++) {
    output_reporte_areatotal_ev += turf.area(json_lyr_interseccion.features[i]);
  }
  return new ReporteProcesamiento(
    output_reporte_cantidad_ev,
    output_reporte_areatotal_ev,
    bufferDist,
    addressString,
    distritoString
  );
}

function cargarEV() {
  eleccionEV();

  if (lyr_ev != undefined) {
    removerCapa(lyr_ev);
    lyr_ev = cargarCapa(lyr_ev, "Espacios Verdes", crear_capa_ev());
  } else {
    lyr_ev = cargarCapa(lyr_ev, "Espacios Verdes", crear_capa_ev());
  }

  lyr_ev.on("data:loaded", function () {
    arrayEleccionEV = [];
    lyr_ev.setInteractive(ev_interactive);
  });
}

function consultaEV(e) {
  click_lat = e.latlng.lat;
  click_long = e.latlng.lng;

  inputBufferDist = $("#bufferDist").val();
  if (inputBufferDist == "") {
    inputBufferDist = 300;
    $("#bufferDist").attr("placeholder", 300);
  }
  punto_consulta = new ConsultaPunto(click_long, click_lat, inputBufferDist);

  if (!punto_consulta.checkCABA(lyrCABA)) {
    $("#mapConsole").text("La ubicación no se encuentra dentro de CABA");
    $("#mapConsole").stop(true, true).slideDown(300).delay(5000).fadeOut(1000);
    if (lyr_punto_consulta_buffer != undefined) {
      removerCapa(lyr_punto_consulta_buffer);
    }
  } else {
    $("#mapConsole").text("Reporte procesado");
    $("#mapConsole").stop(true, true).slideDown(300).delay(5000).fadeOut(1000);

    if (lyr_punto_consulta_buffer != undefined) {
      removerCapa(lyr_punto_consulta_buffer);
      lyr_punto_consulta_buffer = cargarCapa(
        lyr_punto_consulta_buffer,
        "Buffer",
        crear_capa_buffer()
      );
    } else {
      lyr_punto_consulta_buffer = cargarCapa(
        lyr_punto_consulta_buffer,
        "Buffer",
        crear_capa_buffer()
      );
    }

    procesamiento = new ProcesamientoLayers(lyr_punto_consulta_buffer, lyr_ev);
    if (lyr_resultadoProcesamientoConsulta != undefined) {
      removerCapa(lyr_resultadoProcesamientoConsulta);

      lyr_resultadoProcesamientoConsulta = cargarCapa(
        lyr_resultadoProcesamientoConsulta,
        "Resulado Consulta",
        crear_capa_interseccion()
      );
    } else {
      lyr_resultadoProcesamientoConsulta = cargarCapa(
        lyr_resultadoProcesamientoConsulta,
        "Resulado Consulta",
        crear_capa_interseccion()
      );
    }

    let reverseAddressPromise = punto_consulta.getAddress();

    reverseAddressPromise.then((result) => {
      reporte_procesamiento = crear_reporte(
        lyr_resultadoProcesamientoConsulta,
        inputBufferDist,
        result,
        punto_consulta.getDistrito(lyrCABA)
      );
      reporte_procesamiento.guardarReporte();
      reporte_procesamiento.crearDivReporte("Reporte");
      reporte_procesamiento.visualizarReporte(true);
    });
  }
}

// *******  Funciones de estilo y visualización ***********

function obtenerEstilo(clasificacion) {
  let valores = estilos[clasificacion];
  return {
    valores,
  };
}

function style_ev(feature) {
  let att = feature.properties;
  switch (String(att.clasificac)) {
    case "BARRIO/COMPLEJO":
      return Object.values(obtenerEstilo("barrio"))[0];

    case "CANTERO CENTRAL":
      return Object.values(obtenerEstilo("cantero"))[0];

    case "JARDÍN":
      return Object.values(obtenerEstilo("jardin"))[0];

    case "JARDÍN BOTÁNICO":
      return Object.values(obtenerEstilo("jardin_botanico"))[0];

    case "PARQUE":
      return Object.values(obtenerEstilo("parque"))[0];

    case "PARQUE SEMIPÚBLICO":
      return Object.values(obtenerEstilo("parque_semipublico"))[0];

    case "PATIO":
      return Object.values(obtenerEstilo("patio"))[0];

    case "PATIO DE JUEGOS INCLUSIVO":
      return Object.values(obtenerEstilo("patio_juegos_inclusivo"))[0];

    case "PATIO RECREATIVO":
      return Object.values(obtenerEstilo("patio_recreativo"))[0];

    case "PLAZA":
      return Object.values(obtenerEstilo("plaza"))[0];

    case "PLAZOLETA":
      return Object.values(obtenerEstilo("plazoleta"))[0];

    default:
      return Object.values(obtenerEstilo("default"))[0];
  }
}

function processEV(json, lyr) {
  let att = json.properties;
  let popupContent =
    "<h4>Id: " +
    att.id +
    "<h4>Nombre Espacio Verde: " +
    att.nombre +
    "<h4>Tipo de espacio verde: " +
    att.clasificac +
    "<h4>Area Total (m2): " +
    att.area;
  lyr.bindPopup(popupContent, {
    maxWidth: 250,
  });
}

// ******* Event Listeners del DOM ***********

$("#btnEvOpciones").on("click", () => {
  btnEvOpciones = !btnEvOpciones;
  $("#btnEvOpciones").text(btnEvOpciones ? "Ocultar opciones" : "Ver opciones");
  if (btnEvOpciones) {
    $("#evCheckboxes").slideDown();
  } else {
    $("#evCheckboxes").slideUp();
  }
});

$("#evCargar").on("click", () => {
  cargarEV();
  $("#mapConsole").text("Espacios verdes cargados");
  $("#mapConsole").stop(true, true).slideDown(300).delay(5000).fadeOut(1000);
  $("#sidebarController").hide();
  $("#reporteProcesamiento").hide();
  if ($(".leaflet-control-layers").is(":visible")) {
    $(".leaflet-control-layers").hide();
    setTimeout(() => {
      $(".leaflet-control-layers").fadeIn();
    }, 2000);
  }

  setTimeout(() => {
    $("#sidebarController").fadeIn();
    $("#reporteProcesamiento").fadeIn();
  }, 2000);
});

//DOM CARGADO

// *********** Inicialización del MAPA/APP ***************
$(function () {
  mymap = L.map("mapdiv", {
    zoom: 3,
    zoomSnap: 0,
    zoomDelta: 0.25,
    attributionControl: false,
    minZoom: 10,
    maxBounds: [
      [-34.7323613668324, -58.56414364535638],
      [-34.49954995937643, -58.302669294769714],
    ],
  }).fitBounds([
    [-34.7053239914823, -58.53147608870353],
    [-34.526509192627195, -58.335194232412746],
  ]);

  // *********** Inicialización de los LAYER ***************

  lyrOSM = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  });

  lyrBSAS = L.tileLayer(
    "https://servicios.usig.buenosaires.gob.ar/mapcache/tms/1.0.0/amba_con_transporte_3857@GoogleMapsCompatible/{z}/{x}/{-y}.png "
  );

  lyrImagery = L.tileLayer.provider("Esri.WorldImagery");
  lyrDark = L.tileLayer.provider("CartoDB.DarkMatter");

  objBasemaps = {
    OpenStreetMaps: lyrOSM,
    "CartoDB Dark": lyrDark,
    "Esri World Imagery": lyrImagery,
    "Mapa Buenos Aires (GCBA)": lyrBSAS,
  };

  // *********** Inicialización de Sidebar y controles ***************

  $("#sidebarController").sidebar();
  $("#reporteProcesamiento").sidebar({ side: "bottom" });

  ctlBtnReporte = L.easyButton({
    id: "btnReporte",
    position: "topright",
    states: [
      {
        stateName: "ver-reporte",
        icon: "bi bi-chat-square-text",
        title: "Ver Reporte",
        onClick: function (control) {
          $("#reporteProcesamiento").css("visibility", "visible");
          $("#reporteProcesamiento").trigger("sidebar:open");
          control.state("ocultar-reporte");
        },
      },
      {
        stateName: "ocultar-reporte",
        icon: "bi bi-chat-square-text",
        title: "Ocultar Reporte",
        onClick: function (control) {
          $("#reporteProcesamiento").trigger("sidebar:close");
          control.state("ver-reporte");
        },
      },
    ],
  }).addTo(mymap);

  if (localStorage.direccionConsulta != undefined) {
    $("#btnReporte").prop("disabled", true);
  }

  ctlBtnConsulta = L.easyButton({
    id: "btnConsulta",
    position: "topright",
    states: [
      {
        stateName: "habilitar-consulta",
        icon: "bi bi-bullseye",
        title: "Habilitar Consulta",
        onClick: function (control) {
          habilitarConsulta();
          control.state("deshabilitar-consulta");
        },
      },
      {
        stateName: "deshabilitar-consulta",
        icon: "bi bi-bullseye",
        title: "Deshabilitar Consulta",
        onClick: function (control) {
          deshabilitarConsulta();
          control.state("habilitar-consulta");
        },
      },
    ],
  }).addTo(mymap);

  ctlBtnSidebarController = L.easyButton({
    position: "topright",
    states: [
      {
        stateName: "mostrar-sidebar",
        icon: "bi bi-tree-fill",
        title: "Seleccionar Espacios Verdes y Distancia",
        onClick: function (control) {
          $("#sidebarController").css("visibility", "visible");
          $("#sidebarController").trigger("sidebar:open");
          control.state("ocultar-sidebar");
        },
      },
      {
        stateName: "ocultar-sidebar",
        icon: "bi bi-tree",
        title: "Ocultar Sidebar",
        onClick: function (control) {
          $("#sidebarController").trigger("sidebar:close");
          control.state("mostrar-sidebar");
          $("#sidebarController").on("sidebar:closed", function () {
            $(this).css("visibility", "hidden");
          });
        },
      },
    ],
  }).addTo(mymap);

  ctlLayers = L.control
    .layers(objBasemaps, objOverlays, {
      collapsed: false,
    })
    .addTo(mymap);

  let btnLeafletControlLayers = L.DomUtil.create(
    "button",
    "btnLeafletControlLayers",
    $("#mapdiv")[0]
  );

  $(".leaflet-control-layers").hide();

  btnLeafletControlLayers.innerHTML =
    '<i class="bi bi-arrows-angle-expand"></i>';
  $(".btnLeafletControlLayers").prop("title", "Control de Capas");
  $(".btnLeafletControlLayers").on("click", () => {
    $(".leaflet-control-layers").toggle("slow");
  });

  mymap.addLayer(lyrOSM);
  cargarEV();

  // ******* Control de eventos en el mapa ***********

  $(
    ".btnLeafletControlLayers,.easy-button-button,#reporteProcesamiento,#sidebarController"
  ).each(function () {
    $(this).on("click dblclick", (e) => {
      e.stopPropagation();
    });
  });

  $("#sidebarController").mousedown(function () {
    mymap.dragging.disable();
  });

  $("#sidebarController").mouseout(function () {
    mymap.dragging.enable();
  });

  L.DomEvent.on(
    L.DomUtil.get("sidebarController"),
    "mousewheel",
    L.DomEvent.stopPropagation
  );

  // ******* Carga último reporte ***********

  $("#mymap").ready(function () {
    setTimeout(() => {
      reporte_procesamiento = new ReporteProcesamiento();
      reporte_procesamiento.cargarUltimoReporte();
      reporte_procesamiento.visualizarUltimoReporte();
    }, 2000);
  });
});
