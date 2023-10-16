// DECLARACION DE VARIABLES GLOBALES

var map2;
var lyrOSM;
var lyrEsri;
var lyrCurrentLoc;
var jsonCurrentLocation;
var ctrlSidebar;
var ctrlButtonSidebar;
var ctrlEstadisticas;
var ctrlButtonEstats;
var ctrlGraficas;
var ctrlButtonGraphs;
var ctrlButtonUbicacion;
var ctrlSearch;
var objBasemaps;
var mrkCurrentLocation;
var arrayColonias = [];
var selectionPolygon;
var crs32611;
var arrayCapasActivas;
var coloniasLayers;
var selectedFeatures;

//  CREACION DE MAPA

$(document).ready(function () {
  map2 = L.map("mapdiv", {
    center: [32.487112, -116.964755],
    zoom: 13,
  });

  // SECCION DONDE SE ENCUENTRAN LOS CONTROLES QUE SE UTILIZAN  EN LA INTERFAZ DEL MAPA
  // CONTROL DE HERRAMINETAS DE DIBUJO GEOMAN

  map2.pm.setLang("es");
  map2.pm.addControls({
    position: "topleft",
    drawMarker: false,
    drawRectangle: false,
    drawCircle: false,
    drawCircleMarker: false,
    drawPolyline: false,
    drawText: false,
    editMode: false,
    dragMode: false,
    cutPolygon: false,
    removalMode: false,
    rotateMode: false,
  });

  // CONTROLES DE SIDE BAR, EN LA IZQUIERDA EL DE CAPAS DISPONIBLES Y EN LA DERECHA EL DE ESTADISTICAS (POR DEFINIR MAS USOS)

  ctrlButtonUbicacion = L.easyButton({
    position: "topleft",
    states: [
      {
        stateName: "ubicame",
        onClick: function () {
          map2.locate();
        },
        title: "Seleccion por ubicacion",
        icon: "fas fa-location-crosshairs",
      },
    ],
  }).addTo(map2);

  ctrlSidebar = L.control
    .sidebar("consulta-bar", { closeButton: true })
    .addTo(map2);

  ctrlButtonSidebar = L.easyButton({
    position: "topleft",
    states: [
      {
        stateName: "abrirConsulta",
        onClick: function () {
          ctrlSidebar.toggle();
        },
        title: "Abrir Capas de Consulta",
        icon: "fas fa-layer-group",
      },
    ],
  }).addTo(map2);

  ctrlEstadisticas = L.control
    .sidebar("estadisticas-bar", { closeButton: true, position: "right" })
    .addTo(map2);

  ctrlButtonEstats = L.easyButton({
    position: "topright",
    states: [
      {
        stateName: "abrirEstats",
        onClick: function () {
          ctrlEstadisticas.toggle();
        },
        title: "Abrir Estadisticas",
        icon: "fas fa-chart-bar",
      },
    ],
  });

  ctrlGraficas = L.control
    .sidebar("chart-bar", { closeButton: true, position: "right" })
    .addTo(map2);

  ctrlButtonGraphs = L.easyButton({
    position: "topright",
    states: [
      {
        stateName: "abrirGraph",
        onClick: function () {
          ctrlGraficas.toggle();
        },
        title: "Abrir Graficas",
        icon: "fas fa-chart-pie",
      },
    ],
  });

  var styleEditor = L.control.styleEditor({
    position: "topleft",
    markers: ["circle-stroked", "circle", "square-stroked", "square"],
  });

  // PLUGIN DE INTERCAMBIO DE BASE MAPS

  new L.basemapsSwitcher(
    [
      {
        layer: L.tileLayer.provider("OpenStreetMap.Mapnik").addTo(map2),
        icon: "./assets/img/osm_switch.png",
        name: "OSM",
      },
      {
        layer: L.tileLayer.provider("Esri.WorldImagery"),
        icon: "./assets/img/esri_switch.png",
        name: "Esri Map",
      },
    ],
    { position: "bottomleft" }
  ).addTo(map2);

  objBasemaps = {
    "Open Street Maps": lyrOSM,
    "Esri Imagery": lyrEsri,
  };

  // SE DECLARAN LA CREACION DE LOS LAYER GROUPS DONDE VAMOS A ALMACENAR LOS LAYERS

  selectedFeatures = L.layerGroup().addTo(map2);
  selectionPolygon = L.layerGroup().addTo(map2);
  coloniasLayers = L.layerGroup().addTo(map2);

  // VARIABLE PARA CONVERSION DE CAPAS A ESTA PROYECCION (POR EL MOMENTO ESTA EN DESUSO POR CAMBIOS EN EL GEOSERVER)

  crs32611 = new L.Proj.CRS(
    "EPSG:32611",
    "+proj=utm +zone=11 +datum=WGS84 +units=m +no_defs +type=crs"
  );

  // ACCIONES DE SELECCION DE ELEMENTOS DE CAPAS (AL SELECCIONAR COLONIA, CREAR POLIGONO O ENCONTRAR LOCALIZACION)


  map2.on("pm:create", function (e) {
    selectionPolygon.addLayer(e.layer);
    map2.addControl(styleEditor);
    ctrlSidebar.show();
    $("#btnClear").show();
  });

  map2.on("locationfound", function (e) {
    limpiarTodo();

    mrkCurrentLocation = L.marker(e.latlng).addTo(map2);
    map2.setView(e.latlng, 16);
    var radioInput = document.getElementById("radioDist");
    var radioValue = radioInput.value / 1000;

    jsonCurrentLocation = turf.buffer(
      mrkCurrentLocation.toGeoJSON(),
      radioValue,
      { units: "kilometers" }
    );

    lyrCurrentLoc = L.geoJSON(jsonCurrentLocation.geometry, {
      style: {
        color: "#279EFF",
        fillColor: "#279EFF",
        opacity: 0.6,
        fillOpacity: 0.2,
      },
      onEachFeature: function (feature, layer) {
        selectionPolygon.addLayer(layer);
      },
    });
    $("#btnClear").show();
    ctrlSidebar.show();
  });

  map2.on("locationerror", function (e) {
    console.log(e);
    alert("Lacalizacion no encontrada");
  });

  // EVENTOS ACTIVADOS POR ELEMENTOS EN EL DOM (RADIO, BOTONES, CLICKS)

  map2.on("pm:drawstart", limpiarTodo);

  document.getElementById("radioDist").addEventListener("change", (event) => {
    label = document.getElementById("lblRadioDist");
    label.innerHTML = "Radio: " + event.target.value + " m";
  });

  $("#btnClear").click(limpiarTodo);

  $("#btnTabla").click(function () {
    $("#statsTables").empty();

    selectedFeatures.eachLayer(function (layer) {
      const geoJSON = layer.toGeoJSON();
      if (geoJSON.features.length !== 0) {
        generarTabla(geoJSON);
      }
    });

    var botonesExp = document.getElementsByClassName("btnExport");
    Array.from(botonesExp).forEach((element) => {
      element.addEventListener("click", (event) => {
        var wb = XLSX.utils.table_to_book(element.previousElementSibling);
        XLSX.writeFile(wb, "SheetJSTable.xlsx");
      });
    });
    ctrlButtonEstats.addTo(map2);
    ctrlEstadisticas.show();
  });

  $("#btnGrafica").click(function () {
    $("#chartContenedor").empty();
    selectedFeatures.eachLayer(function (layer) {
      const geoJSON = layer.toGeoJSON();
      var columnas = Object.keys(geoJSON.features[0].properties);
      var chartContainer = document.getElementById("chartContenedor");
      
      var grafica = document.createElement("div");
      grafica.id = "grafica" + layer.options.name
      
      var selectCampo = document.createElement("select");
      selectCampo.addEventListener("change", function () {
        if (selectCampo.value) {
          generarGrafica(layer, selectCampo.value);
        }
      });

      if (geoJSON.features.length !== 0) {
        var opcionDefault = document.createElement("option");
        opcionDefault.value = "";
        opcionDefault.innerText = "Seleccione un campo";

        selectCampo.appendChild(opcionDefault);
      }

      columnas.forEach((campo) => {
        var opcion = document.createElement("option");
        opcion.value = campo;
        opcion.innerText = campo;
        selectCampo.appendChild(opcion);
      });
      var nombreGraf = document.createElement("h5");
      nombreGraf.innerText = layer.options.name;

      grafica.appendChild(nombreGraf);
      grafica.appendChild(selectCampo);
      chartContainer.appendChild(grafica);
    });
    ctrlButtonGraphs.addTo(map2);
    ctrlGraficas.show();
  });

  // FORMULAS GENERALES

  function limpiarTodo() {
    ctrlEstadisticas.hide();

    var layersToClear = [selectionPolygon, selectedFeatures];

    layersToClear.forEach((layer) => layer.clearLayers());

    const toggleButtons = document.getElementsByClassName("layers");
    Array.from(toggleButtons).forEach((button) => (button.checked = false));

    const actionBtns = document.getElementsByClassName("btn-actions");
    Array.from(actionBtns).forEach(
      (element) => (element.style.display = "none")
    );

    
    $("#btnClear").hide();
    $("#tablaEst, #statsTables, #chartContenedor").empty();
    if (ctrlButtonEstats) ctrlButtonEstats.remove();
    if (mrkCurrentLocation) mrkCurrentLocation.remove();
    if (lyrCurrentLoc) lyrCurrentLoc.remove();
    if (styleEditor) map2.removeControl(styleEditor);
  }
});
