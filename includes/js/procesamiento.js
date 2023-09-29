// DECLARACION DE VARIABLES GLOBALES
var map2;
var lyrOSM;
var lyrEsri;
var lyrContLumin;
var lyrSearchCol;
var lyrSearchDel;
var lyrCurrentLoc;
var jsonCurrentLocation;
var ctrlSidebar;
var ctrlButtonSidebar;
var ctrlEstadisticas;
var ctrlButtonEstats;
var ctrlSearch;
var objBasemaps;
var mrkCurrentLocation;
var arrayColonias = [];
var luminariasSelected;
var rutasrecoleccionSelected;
var poligonfortamunSelected;
var desarenadoresSelected;
var selectionPolygon;
var crs32611;
var arrayCapasActivas;
var searchControl;
var coloniasLyr;

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

  ctrlSidebar = L.control
    .sidebar("side-bar", { closeButton: true })
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
    .sidebar("stadistic-bar", { closeButton: true, position: "right" })
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
  }).addTo(map2);

  var styleEditor = L.control.styleEditor({
    position: 'topleft',
    markers: ['circle-stroked', 'circle', 'square-stroked', 'square']
  });

  map2.addControl(styleEditor);

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

  luminariasSelected = L.layerGroup().addTo(map2);
  rutasrecoleccionSelected = L.layerGroup().addTo(map2);
  poligonfortamunSelected = L.layerGroup().addTo(map2);
  desarenadoresSelected = L.layerGroup().addTo(map2);
  selectionPolygon = L.layerGroup().addTo(map2);

  // VARIABLE PARA CONVERSION DE CAPAS A ESTA PROYECCION (POR EL MOMENTO ESTA EN DESUSO POR CAMBIOS EN EL GEOSERVER)

  crs32611 = new L.Proj.CRS(
    "EPSG:32611",
    "+proj=utm +zone=11 +datum=WGS84 +units=m +no_defs +type=crs"
  );

  // LAS 3 PRINCIPALES ACCIONES DE SELECCION DE ELEMENTOS DE CAPAS (AL SELECCIONAR COLONIA, CREAR POLIGONO O ENCONTRAR LOCALIZACION)

  geoserverLyrGroup.eachLayer(function (layer) {
    if (layer.options.typeName === "colonias") {
      layer.on("click", function (e) {
        selectionPolygon.removeLayer(e.layer);
        if (mrkCurrentLocation) {
          mrkCurrentLocation.remove();
          lyrCurrentLoc.remove();
        }
        var colonia = e.layer;
        selectionPolygon.addLayer(colonia);
        console.log(selectionPolygon);
        $("#tablaEst").empty();
      });
    }
  });

  map2.on("pm:create", function (e) {
    var actionBtns = document.getElementById("btnClear");
    actionBtns.style.display = "block";
    selectionPolygon.addLayer(e.layer);
  });

  map2.on("locationfound", function (e) {
    limpiarTodo();
    var actionBtns = document.getElementById("btnClear");
    actionBtns.style.display = "block";

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
  });

  map2.on("locationerror", function (e) {
    console.log(e);
    alert("Lacalizacion no encontrada");
  });
  $("#btnLocate").click(function () {
    map2.locate();
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
    var generarTabla = [
      luminariasSelected,
      rutasrecoleccionSelected,
      poligonfortamunSelected,
      desarenadoresSelected
    ];
    for (var i = 0; i < generarTabla.length; i++) {
      if (generarTabla[i].toGeoJSON().features.length !== 0) {
        pruebaTabla(generarTabla[i].toGeoJSON());
      }
    }

    var botonesExp = document.getElementsByClassName("btnExport");
    Array.from(botonesExp).forEach(function (element) {
      element.addEventListener("click", (event) => {
        var wb = XLSX.utils.table_to_book(element.previousElementSibling);
        XLSX.writeFile(wb, "SheetJSTable.xlsx");
      })
    })
    ctrlEstadisticas.show();
  });

  // FORMULAS GENERALES

  function limpiarTodo() {
    var layersToClear = [
      selectionPolygon,
      luminariasSelected,
      rutasrecoleccionSelected,
      poligonfortamunSelected,
      desarenadoresSelected
    ];
    for (var i = 0; i < layersToClear.length; i++) {
      layersToClear[i].clearLayers();
    }

    let toggleButtons = document.getElementsByClassName("layers");
    for (i = 0; i < toggleButtons.length; i++) {
      if (toggleButtons[i].checked) {
        toggleButtons[i].checked = false;
      }
    }

    var actionBtns = document.getElementsByClassName("actions");
    Array.from(actionBtns).forEach(function(element){
      element.style.display = "none";
    });

    $("#tablaEst").empty();
    $("#statsTables").empty();

    if (mrkCurrentLocation) {
      mrkCurrentLocation.remove();
    }
    if (lyrCurrentLoc) {
      lyrCurrentLoc.remove();
    }
    if (lyrSearchCol) {
      lyrSearchCol.remove();
      $("#divColoniaData").html("");
    }
    if (lyrSearchDel) {
      lyrSearchDel.remove();
      $("#divDelegacionData").html("");
    }
  }
});
