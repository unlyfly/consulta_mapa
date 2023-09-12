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
var capaColonias;
var capaDelegaciones;
var capaLuminarias;
var mrkCurrentLocation;
var arrayColonias = [];
var arrayDelegaciones = [];
var lumSelected;
var recoSelected;
var fortamunSelected;
var desarenaSelected;
var drawnPolygon;
var crs32611;

$(document).ready(function () {
  map2 = L.map("mapdiv", {
    center: [32.487112, -116.964755],
    zoom: 13,
  });

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

  ctrlSearch = L.layerGroup().addTo(map2);
  map2.addControl(new L.Control.Search({
    position: 'topright',
    textPlaceholder: 'Buscar por...',
  }));

  ctrlSidebar = L.control.sidebar("side-bar", { closeButton: true }).addTo(map2);

  ctrlButtonSidebar = L.easyButton({
    position: 'topleft',
    states:[{
      stateName: 'abrirConsulta',
      onClick: function(){
        ctrlSidebar.toggle();
      },
      title: 'Abrir Capas de Consulta',
      icon: "fas fa-layer-group",
    }]
  }).addTo(map2);


  ctrlEstadisticas = L.control.sidebar("stadistic-bar", { closeButton: true, position: 'right'}).addTo(map2);

  ctrlButtonEstats = L.easyButton({
    position: 'topright',
    states:[{
      stateName: 'abrirEstats',
      onClick: function(){
        ctrlEstadisticas.toggle();
      },
      title: 'Abrir Estadisticas',
      icon: "fas fa-chart-bar",
    }]
  }).addTo(map2);

  // map2.on('search:expanded', function() {
  //   alert('seleccione capa de busqueda');
  // })

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

  lumSelected = L.layerGroup().addTo(map2);
  recoSelected = L.layerGroup().addTo(map2);
  fortamunSelected = L.layerGroup().addTo(map2);
  desarenaSelected = L.layerGroup().addTo(map2);
  drawnPolygon = L.layerGroup().addTo(map2);

  crs32611 = new L.Proj.CRS(
    "EPSG:32611",
    "+proj=utm +zone=11 +datum=WGS84 +units=m +no_defs +type=crs"
  );

  // capaLuminarias = L.Geoserver.wms("https://www.clustersig.com/geoserver/wms", {
  //   layers: "servicios:luminarias",
  //   format: 'image/png',
  // });

  capaDelegaciones = new L.WFS({
    url: "https://www.clustersig.com/geoserver/wfs",
    typeNS: "gobierno",
    typeName: "delegaciones",
    geometryField: "geom",
    fillOpacity: 0.1,
    opacity: 1,
    style: {
      color: "black",
      weight: 3,
      fillColor: "white",
    },
  }).on("load", function (e) {
    var capad = e.target.toGeoJSON();
    L.geoJSON(capad, {
      onEachFeature: function (feature, layer) {
        attr = feature.properties;
        if (!arrayDelegaciones.includes(attr.delegacion)) {
          arrayDelegaciones.push(attr.delegacion.toString());
        }
      },
    });
  });
  $(function () {
    $("#txtFindDelegacion").autocomplete({
      source: arrayDelegaciones,
    });
  });

  capaColonias = new L.WFS({
    url: "https://www.clustersig.com/geoserver/wfs",
    typeNS: "catastro",
    typeName: "colonias",
    geometryField: "geom",
    fillOpacity: 0.1,
    style: {
      fillColor: "white",
      color: "#ac905b",
      weight: 2,
    },
  }).on("load", function (e) {
    var capa = e.target.toGeoJSON();
    L.geoJSON(capa, {
      onEachFeature: function (feature, layer) {
        attr = feature.properties;
        if (attr && attr.nomb_fracc !== undefined) {
          if (!arrayColonias.includes(attr.nomb_fracc)) {
            arrayColonias.push(attr.nomb_fracc.toString());
          }
        }
      },
    });
  });
  $(function () {
    $("#txtFindColonia").autocomplete({
      source: arrayColonias,
    });
  });

  capaRutasReco = new L.WFS({
    url: "https://www.clustersig.com/geoserver/wfs",
    typeNS: "servicios",
    typeName: "rutas_recoleccion",
    geometryField: "geom",
    opacity: 0.8,
    style: {
      color: "orange",
      weight: 2,
    },
  });

  capaFortamun = new L.WFS({
    url: "https://www.clustersig.com/geoserver/wfs",
    typeNS: "doium",
    typeName: "poligon_fortamun",
    geometryField: "geom",
    opacity: 0.8,
    fillOpacity: 0.4,
    style: {
      color: "black",
      fillColor: "black",
    },
  });

  capaDesarenadores = new L.WFS({
    url: "https://www.clustersig.com/geoserver/wfs",
    typeNS: "doium",
    typeName: "desarenadores",
    geometryField: "geom",
  });

  capaColonias.on("click", function (event) {
    if (mrkCurrentLocation) {
      mrkCurrentLocation.remove();
      lyrCurrentLoc.remove();
    }
    drawnPolygon.clearLayers();
    var selectedFeature = event.layer.toGeoJSON();
    $("#tablaEst").empty();
    drawnPolygon.clearLayers();
    toggleProcesses(selectedFeature.geometry);
  });

  map2.on("pm:create", function (e) {
    drawnPolygon.clearLayers();
    if (mrkCurrentLocation) {
      mrkCurrentLocation.remove();
      lyrCurrentLoc.remove();
    };
    const selectedRec = e.layer.toGeoJSON();
    drawnPolygon.addLayer(e.layer);
    $("#tablaEst").empty();
    toggleProcesses(selectedRec.geometry);
  });

  map2.on("locationfound", function (e) {
    if (mrkCurrentLocation) {
      mrkCurrentLocation.remove();
      lyrCurrentLoc.remove();
    }
    mrkCurrentLocation = L.marker(e.latlng).addTo(map2);
    map2.setView(e.latlng, 16);
    var radioInput = document.getElementById("radioDist");
    var radioValue = radioInput.value / 1000;

    jsonCurrentLocation = turf.buffer(
      mrkCurrentLocation.toGeoJSON(),
      radioValue,
      { units: "kilometers" }
    );

    lyrCurrentLoc = L.geoJSON(jsonCurrentLocation, {
      style: { color: "blue", fillColor: "blue", fillOpacity: 0.2 },
    }).addTo(map2);

    drawnPolygon.clearLayers();
    $("#tablaEst").empty();
    toggleProcesses(jsonCurrentLocation.geometry);
  });

  map2.on("locationerror", function (e) {
    console.log(e);
    alert("Lacalizacion no encontrada");
  });

  $("#btnLocate").click(function () {
    map2.locate();
  });

  document.getElementById("radioDist").addEventListener("change", (event) => {
    label = document.getElementById("lblRadioDist");
    label.innerHTML = "Radio: " + event.target.value + " m";
  });

  document.getElementById("btnClear").onclick = function () {
   var layersToClear = [drawnPolygon, lumSelected, recoSelected, fortamunSelected, desarenaSelected];
   for (var i = 0; i < layersToClear.length; i++) {
     layersToClear[i].clearLayers();
   }

    $("#tablaEst").empty();
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
  };

  //PARA SEARCH DE COLONIA

  document.getElementById("btnFindColonia").onclick = function () {
    var col = document.getElementById("txtFindColonia").value.toUpperCase();
    var lyr = returnLayerByName(capaColonias, "nomb_fracc", col);
    if (lyr) {
      var area = turf.area(lyr.toGeoJSON());
      if (lyrSearchCol) {
        lyrSearchCol.remove();
      }
      lyrSearchCol = L.geoJSON(lyr.toGeoJSON(), {
        style: { color: "red", fillColor: "none", weigth: 10, opacity: 0.5 },
      }).addTo(map2);
      map2.fitBounds(lyr.getBounds().pad(1));
      $("#divFindColonia").removeClass("has-error");
      $("#divColoniaError").html("");
      var attr = lyr.feature.properties;
      $("#divColoniaData").html(
        "<div class='mt-3'><h6>Colonia: " +
          attr.nomb_fracc +
          "</h6><h6>Area: " +
          area.toFixed(3) +
          " m2 </h6></div>"
      );
    } else {
      $("#divColoniaError").html("****** Colonia no encontrada ******");
    }
  };

  $("#txtFindColonia").on("keyup paste", function () {
    var col = $("#txtFindColonia").val();
    testLayerNameStatus(
      arrayColonias,
      col,
      "#divFindColonia",
      "#btnFindColonia"
    );
  });

  //PARA SEARCH DE DELEGACION

  document.getElementById("btnFindDelegacion").onclick = function () {
    var del = document.getElementById("txtFindDelegacion").value;
    var lyr = returnLayerByName(capaDelegaciones, "delegacion", del);
    console.log(lyr);
    if (lyr) {
      var area = turf.area(lyr.toGeoJSON());
      if (lyrSearchDel) {
        lyrSearchDel.remove();
      }
      lyrSearchDel = L.geoJSON(lyr.toGeoJSON(), {
        style: { color: "red", fillColor: "none", weigth: 10, opacity: 0.5 },
      }).addTo(map2);
      map2.fitBounds(lyr.getBounds().pad(1));
      $("#divFindDelegacion").removeClass("has-error");
      $("#divDelegacionError").html("");
      var attr = lyr.feature.properties;
      $("#divDelegacionData").html(
        "<div class='mt-3'><h6>Delegación: " +
          attr.delegacion +
          "</h6><h6>Area: " +
          (area / 1000).toFixed(3) +
          " km2 </h6></div>"
      );
    } else {
      $("#divDelegacionError").html("****** Delegacion no encontrada ******");
    }
  };

  $("#txtFindDelegacion").on("keyup paste", function () {
    var del = $("#txtFindDelegacion").val();
    testLayerNameStatus(
      arrayDelegaciones,
      del,
      "#divFindDelegacion",
      "#btnFindDelegacion"
    );
  });

  // FORMULAS GENERALES

  function returnLayerByName(lyr, att, val) {
    var arLayer = lyr.getLayers();
    console.log(arLayer);
    for (i = 0; i < arLayer.length; i++) {
      var featureCol = arLayer[i].feature.properties[att];
      if (featureCol == val) {
        return arLayer[i];
      }
    }
    return false;
  }

  function testLayerNameStatus(arr, val, divFind, btnFind) {
    if (arr.indexOf(val) < 0) {
      $(divFind).addClass("has-error");
      $(btnFind).attr("disabled", false);
    } else {
      $(divFind).removeClass("has-error");
      $(btnFind).attr("disabled", true);
    }
  }

  function procesandoData(geom, url, layerToAdd, layerName) {
    layerToAdd.clearLayers();
    $.ajax({
      type: "POST",
      url: url,
      data: JSON.stringify(geom),
      contentType: "json",
      success: function (data) {
        const intersectedGeoJSON = JSON.parse(data);
        $("#tablaEst").append(
          "<h5>" +
            layerName +
            ": " +
            intersectedGeoJSON.features.length +
            "</h5>"
        );

        if (layerName === "Luminarias") {
          pruebaTabla(intersectedGeoJSON);
          L.geoJSON(intersectedGeoJSON, {
            pointToLayer: function (feature, latlng) {
              var att = feature.properties;
              var color = att.apagada == 0 ? "yellow" : "black";

              return L.circleMarker(latlng, {
                radius: 3,
                fillColor: color,
                color: "black",
                weight: 1,
                opacity: 1,
                fillOpacity: 1,
              });
            },
            onEachFeature: function (feature, layer) {
              var att = feature.properties;
              var estado = att.apagada == 0 ? "Funcionando" : "Apagada";
              layer.bindTooltip(
                  "<p>Estado: " +
                    estado +
                    "</p><p>Capacidad: " +
                    att.capacidad +
                    "</p><p>Tecnologia: " +
                    att.tecnologia +
                    "</p>"
                ).openTooltip();
              layerToAdd.addLayer(layer);
            },
          }).addTo(map2);
        } else if (layerName === "Rutas Recolección") {
          L.geoJSON(intersectedGeoJSON, {
            style: { color: "red" },
            onEachFeature: function (feature, layer) {
              layerToAdd.addLayer(layer);
            },
          }).addTo(map2);
        } else if (layerName === "Bacheo Fortamun") {
          L.geoJSON(intersectedGeoJSON, {
            style: {
              color: "black",
              fillColor: "grey",
              weight: 1,
              opacity: 1,
              fillOpacity: 1,
            },
            onEachFeature: function (feature, layer) {
              layerToAdd.addLayer(layer);
            },
          }).addTo(map2);
        } else if (layerName === "Desarenadores") {
          L.geoJSON(intersectedGeoJSON, {
            pointToLayer: function (feature, latlng) {
              return L.circleMarker(latlng, {
                radius: 4,
                fillColor: "brown",
                color: "black",
                weight: 1,
                opacity: 1,
                fillOpacity: 1,
              });
            },
            onEachFeature: function (feature, layer) {
              layerToAdd.addLayer(layer);
            },
          }).addTo(map2);
        }
      },
      error: function (error) {
        console.error("Error:", error);
      },
    });
  }

  function toggleProcesses(geom) {
    var lumin = document.getElementById("switchLuminarias");
    var bacheoFort = document.getElementById("switchFortamun");
    var rutRec = document.getElementById("switchRutasReco");
    var desare = document.getElementById("switchDesarenadores");

    lumSelected.clearLayers();
    recoSelected.clearLayers();
    fortamunSelected.clearLayers();
    desarenaSelected.clearLayers();
    $("#tablaEst").prepend(
      "<h4 class='text-center'>Atributos de Selección</h4>"
    );

    if (lumin.checked) {
      procesandoData(geom, "lumExtractor.php", lumSelected, "Luminarias");
      var lums = lumSelected.getLayers();
      for (i = 0; i < lums.length; i++) {
        var lumRow = lums[i];
        console.log(lumRow);
        geojson.features.push(lumRow);
      }
    }
    if (rutRec.checked) {
      procesandoData(geom, "recoExtractor.php", recoSelected, "Rutas Recolección");
    }
    if (bacheoFort.checked) {
      procesandoData(geom, "fortamunExtractor.php", fortamunSelected, "Bacheo Fortamun");
    }
    if (desare.checked) {
      procesandoData(geom, "desarenaExtractor.php", desarenaSelected, "Desarenadores");
    }
  }
  
});
