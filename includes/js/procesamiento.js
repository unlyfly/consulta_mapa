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
var ctrlColonias;
var ctrlSearch;
var ctrlLoadlayers;
var objBasemaps;
var mrkCurrentLocation;
var arrayColonias = [];
var selectionPolygon;
var crs32611;
var arrayCapasActivas;
var usuarioLayers;
var selectedFeatures;
var baseLyrGroup;
var dependeciaCapas;
var searchCapaSelected = [1, "colonia_1"];
var searchLayer;




//  CREACION DE MAPA

$(document).ready(function () {
  map2 = L.map("mapdiv", {
    center: [32.487112, -116.964755],
    zoom: 13,
    preferCanvas: true,
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
    renderer: L.canvas(),
  });



  // CONTROLES DE SIDEBAR, EN LA IZQUIERDA EL DE CAPAS DISPONIBLES Y EN LA DERECHA EL DE ESTADISTICAS (POR DEFINIR MAS USOS)

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

  ctrlColonias = L.easyButton({
    position: "topleft",
    states: [
      {
        stateName: "colonias",
        onClick: function () {
          baseLyrGroup.eachLayer(function (layer) {
            if (layer.options.layers === "catastro:colonias") {
              if (map2.hasLayer(layer) === false) {
                layer
                  .setStyle({
                    fillColor: "white",
                    color: "#C07F00",
                    fillOpacity: 0.1,
                    weight: 2,
                  })
                  .addTo(map2);
              } else {
                map2.removeLayer(layer);
              }
            }
          });
        },
        title: "Seleccion por colonias",
        icon: "fa-solid fa-earth-americas",
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
  });

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
        layer: L.tileLayer(
          "https://mt1.google.com/vt/lyrs=s&hl=pl&x={x}&y={y}&z={z}",
          { attribution: "Google" }
        ).addTo(map2),
        icon: "./assets/img/google_sate_switch.png",
        name: "Google Satelite",
      },
      {
        layer: L.tileLayer(
          "https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}",
          { attribution: "Google" }
        ),
        icon: "./assets/img/google_roads_switch.png",
        name: "Google Roads",
      },
      {
        layer: L.tileLayer.provider("OpenStreetMap.Mapnik"),
        icon: "./assets/img/osm_switch.png",
        name: "OSM",
      },
      {
        layer: L.tileLayer.provider("Esri.WorldImagery"),
        icon: "./assets/img/esri_switch.png",
        name: "ESRI",
      },
    ],
    { position: "bottomleft" }
  ).addTo(map2);

  ctrlLoadlayers = L.Control.betterFileLayer({
    button: document.getElementById("btnAddLayer"),
  }).addTo(map2);




  // SE DECLARAN LA CREACION DE LOS LAYER GROUPS DONDE VAMOS A ALMACENAR LOS LAYERS

  selectedFeatures = L.layerGroup().addTo(map2);
  selectionPolygon = L.layerGroup().addTo(map2);
  usuarioLayers = L.layerGroup().addTo(map2);
  baseLyrGroup = L.layerGroup();
  searchLayer = L.layerGroup();




  // VARIABLE PARA CONVERSION DE CAPAS A ESTA PROYECCION (POR EL MOMENTO ESTA EN DESUSO POR CAMBIOS EN EL GEOSERVER)

  crs32611 = new L.Proj.CRS(
    "EPSG:32611",
    "+proj=utm +zone=11 +datum=WGS84 +units=m +no_defs +type=crs"
  );


  
  // ACCIONES DE SELECCION DE ELEMENTOS DE CAPAS (AL SELECCIONAR COLONIA, CREAR POLIGONO O ENCONTRAR LOCALIZACION)

  map2.on("pm:create", function (e) {
    selectionPolygon.addLayer(e.layer.showMeasurements());
    map2.addControl(styleEditor);
    ctrlButtonSidebar.addTo(map2);
    ctrlSidebar.show();
    $("#btnClear").show();
  });

  map2.on("locationfound", function (e) {
    limpiarTodo();

    mrkCurrentLocation = L.marker(e.latlng).addTo(map2);
    map2.setView(e.latlng, 16);
    var radioDiv = document.getElementById("radioDiv");
    radioDiv.style.display = "block";
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
        selectionPolygon.addLayer(layer.showMeasurements());
      },
    });
    ctrlButtonSidebar.addTo(map2);
    ctrlSidebar.show();
    $("#btnClear").show();
  });

  map2.on("locationerror", function (e) {
    console.log(e);
    alert("Lacalizacion no encontrada");
  });





  // EVENTOS ACTIVADOS POR ELEMENTOS EN EL DOM (RADIO, BOTONES, CLICKS)

  map2.on("pm:drawstart", limpiarTodo);

  document.getElementById("radioDist").addEventListener("change", (event) => {
    label = document.getElementById("lblRadioDist");
    label.innerHTML = "Radio de Selección: " + event.target.value + " m";
    map2.locate();
  });

  $("#btnClear").click(limpiarTodo);

  $("#btnTabla").click(function () {
    $("#statsTables").empty();
    selectedFeatures.eachLayer(function (layer) {
      const geoJSON = layer.toGeoJSON();
      if (geoJSON.features.length !== 0) {
        simulateProcess(geoJSON, generarTabla);
      }
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
      grafica.id = "grafica" + layer.options.name;

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

  ctrlSearch = L.control
    .search({
      layer: searchLayer,
      propertyName: `${searchCapaSelected[1]}`,
      initial: false,
      position: "topright",
      textPlaceholder: "",
      textErr: "Busqueda no encontrada",
      textCancel: "Cancelar",
      marker: false,
      buildTip: function (text, val) {
        var type = val.layer.feature.id;
        var typeSep = type.split(".");
        var nombCapa = typeSep[0];

        return (
          '<a href="#" class="' +
          nombCapa +
          '">' +
          text +
          "<b>" +
          nombCapa +
          "</b></a>"
        );
      },
      moveToLocation: function (latlng, title, map) {
        if (latlng.layer.feature.geometry.type === "Point") {
          map2.setView(latlng.layer.getLatLng(), map2.getZoom());
        } else {
          map2.fitBounds(latlng.layer.getBounds());
        }
      },
    })
    .addTo(map2);

  ctrlSearch.on("search:locationfound", function (e) {
    limpiarTodo(); // Clear existing layers or elements

    // Check the geometry type of the layer
    if (e.layer.feature.geometry.type === "Point") {

      e.layer.addTo(selectionPolygon).openPopup();

      // Move map to the location of the point
      map2.setView(e.layer.getLatLng(), map2.getZoom());
    } else {
      // For other geometries, style and add it to the selectionPolygon
      e.layer.setStyle({ fillColor: "none", color: "#FF0000", weight: 3 });
      e.layer.addTo(selectionPolygon).openPopup();

      // Fit map bounds to the geometry
      map2.fitBounds(e.layer.getBounds());
    }

    ctrlButtonSidebar.addTo(map2);
    ctrlSidebar.show();
    $("#btnClear").show();
  });

  fetchData();




  // FUNCIONES GENERALES

  function limpiarTodo() {
    ctrlEstadisticas.hide();

    var layersToClear = [selectionPolygon, selectedFeatures];

    layersToClear.forEach((layer) => layer.clearLayers());

    // map2.removeLayer(baseLyrGroup.getLayers()[0]);
    // map2.removeLayer(baseLyrGroup.getLayers()[1]);

    const toggleButtons = document.getElementsByClassName("layers");
    Array.from(toggleButtons).forEach((button) => (button.checked = false));

    const actionBtns = document.getElementsByClassName("btn-actions");
    Array.from(actionBtns).forEach(
      (element) => (element.style.display = "none")
    );

    $("#btnClear").hide();
    $("#radioDiv").hide();
    ctrlSidebar.hide();
    $("#tablaEst, #statsTables, #chartContenedor").empty();
    if (ctrlButtonSidebar) ctrlButtonSidebar.remove();
    if (ctrlButtonEstats) ctrlButtonEstats.remove();
    if (mrkCurrentLocation) mrkCurrentLocation.remove();
    if (lyrCurrentLoc) lyrCurrentLoc.remove();
    if (styleEditor) map2.removeControl(styleEditor);
  }
});
