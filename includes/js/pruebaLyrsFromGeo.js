// Define la URL de tu solicitud GetCapabilities de GeoServer
var geoServerUrl =
  "https://www.clustersig.com/geoserver/ows?service=WFS&version=2.0.0&request=GetCapabilities";

var geoserverLyrGroup = new L.layerGroup();

getLayerNamesFromGeoServer(geoServerUrl)
  .then((typeNS) => {
    var selectGroup = document.getElementById("layerSelects");
    var lyrs;
    typeNS.forEach((element) => {
      var grupo = document.createElement("li");
      var button = document.createElement("button");
      var divSwitches = document.createElement("div");
      var dropdownCont = document.createElement("div");

      // Separacion de nombres de dependencias y de capas.
      var nomSeparado = element.split(":");
      var nomDependecia = nomSeparado[0].split("_")[0];
      var nomDependeciaFix =
        nomDependecia.charAt(0).toUpperCase() + nomDependecia.slice(1);

      var nomCapa = nomSeparado[1];
      var nomCapaFix = nomCapa.charAt(0).toUpperCase() + nomCapa.slice(1);

      grupo.id = "grupo" + nomDependeciaFix;
      grupo.classList.add(
        "form-control",
        "list-group-item",
        "list-group-item-action"
      );

      button.innerHTML =
        nomDependecia.toUpperCase() + "<i class='fa fa-caret-down'></i>";
      button.id = "lista" + nomDependeciaFix;
      button.classList.add("dropdown-btn");

      dropdownCont.id = "container" + nomDependeciaFix;
      dropdownCont.classList.add("dropdown-container");

      divSwitches.classList.add("form-switch");
      divSwitches.innerText = nomCapaFix;

      var switchCapa = document.createElement("input");
      switchCapa.type = "checkbox";

      if (nomCapa === "colonias" || nomCapa === "delegaciones") {
        switchCapa.classList.add("form-check-input", "me-3");
      } else {
        switchCapa.classList.add("form-check-input", "me-3", "layers");
      }
      switchCapa.id = "switch" + nomCapaFix;

      if ($("#grupo" + nomDependeciaFix).length === 0) {
        selectGroup.appendChild(grupo);
        grupo.appendChild(button);
        grupo.appendChild(dropdownCont);
      }

      var dropContainer = document.getElementById(
        "container" + nomDependeciaFix
      );

      dropContainer.appendChild(divSwitches);
      divSwitches.prepend(switchCapa);

      var ele = new L.WFS({
        url: "https://www.clustersig.com/geoserver/wfs",
        typeNS: nomSeparado[0],
        typeName: nomSeparado[1],
        geometryField: "geom",
        opacity: 0.8,
      });

      geoserverLyrGroup.addLayer(ele);
    });

    lyrs = geoserverLyrGroup.getLayers();

    var dropdownBtn = document.getElementsByClassName("dropdown-btn");

    for (var i = 0; i < dropdownBtn.length; i++) {
      dropdownBtn[i].addEventListener("click", function () {
        this.classList.toggle("active");
        var dropdownContent = this.nextElementSibling;
        if (dropdownContent.style.display === "block") {
          dropdownContent.style.display = "none";
        } else {
          dropdownContent.style.display = "block";
        }
      });
    }

    arrayCapasActivas = document.getElementsByClassName("layers");

    Array.from(arrayCapasActivas).forEach(function (element) {
      element.addEventListener("click", (event) => {
        var j = selectionPolygon.getLayers();
        var j2 = j[0].toGeoJSON();
        // $("#tablaEst").empty();
        if (element.id == "switchLuminarias") {
          if (event.target.checked === true) {
            procesandoData(
              j2.geometry,
              "lumExtractor.php",
              lumSelected,
              "Luminarias"
            );
          } else {
            lumSelected.clearLayers();
            $("#lumText").remove();
          }
        } else if (element.id == "switchRutas_recoleccion") {
          if (event.target.checked === true) {
            procesandoData(
              j2.geometry,
              "recoExtractor.php",
              recoSelected,
              "Rutas Recolección"
            );
          } else {
            recoSelected.clearLayers();
            $("#recoText").remove();
          }
        } else if (element.id == "switchPoligon_fortamun") {
          if (event.target.checked === true) {
            procesandoData(
              j2.geometry,
              "fortamunExtractor.php",
              fortamunSelected,
              "Bacheo Fortamun"
            );
          } else {
            fortamunSelected.clearLayers();
            $("#fortText").remove();
          }
        } else if (element.id == "switchDesarenadores") {
          if (event.target.checked === true) {
            procesandoData(
              j2.geometry,
              "desarenaExtractor.php",
              desarenaSelected,
              "Desarenadores"
            );
          } else {
            desarenaSelected.clearLayers();
            $("#desarenaText").remove();
          }
        }
      });
    });
  })
  .then(() => {
    // CONTROL DE BARRA DE BUSQUEDA
    var lr = geoserverLyrGroup.getLayers();
    searchControl = L.control.search({
        layer: lr[0],
        propertyName: "nomb_fracc",
        initial: false,
        position: "topright",
        textPlaceholder: "Buscar por...",
        textErr: "Busqueda no encontrada",
        textCancel: "Cancelar",
        marker: false,
        moveToLocation: function(latlng, title, map) {
          map2.fitBounds(latlng.layer.getBounds());
        }
      }).addTo(map2);

      searchControl.on("search:locationfound", function (e) {
        e.layer.setStyle({ fillColor: "none", color: "#FF0000", weight: 3});
        e.layer.addTo(map2);
      });
  })
  .catch((error) => {
    console.error("Error:", error);
  });

function procesandoData(geom, url, layerToAdd, layerName) {
  layerToAdd.clearLayers();
  $.ajax({
    type: "POST",
    url: url,
    data: JSON.stringify(geom),
    contentType: "json",
    success: function (data) {
      const intersectedGeoJSON = JSON.parse(data);

      if (layerName === "Luminarias") {
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
            layer
              .bindTooltip(
                "<p>Estado: " +
                  estado +
                  "</p><p>Capacidad: " +
                  att.capacidad +
                  "</p><p>Tecnologia: " +
                  att.tecnologia +
                  "</p>"
              )
              .openTooltip();
            layerToAdd.addLayer(layer);
          },
        });
        $("#tablaEst").append(
          "<h5 id='lumText'>" +
            layerName +
            ": " +
            intersectedGeoJSON.features.length +
            "</h5>"
        );
      } else if (layerName === "Rutas Recolección") {
        L.geoJSON(intersectedGeoJSON, {
          style: { color: "red" },
          onEachFeature: function (feature, layer) {
            layerToAdd.addLayer(layer);
          },
        });
        $("#tablaEst").append(
          "<h5 id='recoText'>" +
            layerName +
            ": " +
            intersectedGeoJSON.features.length +
            "</h5>"
        );
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
        });
        $("#tablaEst").append(
          "<h5 id='fortText'>" +
            layerName +
            ": " +
            intersectedGeoJSON.features.length +
            "</h5>"
        );
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
        });
        $("#tablaEst").append(
          "<h5 id='desarenaText'>" +
            layerName +
            ": " +
            intersectedGeoJSON.features.length +
            "</h5>"
        );
      }
    },
    error: function (error) {
      console.error("Error:", error);
    },
  });
}
