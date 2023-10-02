// Define la URL de tu solicitud GetCapabilities de GeoServer
var geoServerUrl =
  "https://www.clustersig.com/geoserver/ows?service=WFS&version=2.0.0&request=GetCapabilities";

var geoserverLyrGroup = L.layerGroup();

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
        switchCapa.classList.add("form-check-input", "me-3", "base");
      } else {
        switchCapa.classList.add("form-check-input", "me-3", "layers");
      }
      switchCapa.id = "switch" + nomCapaFix;
      switchCapa.name = element;

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

      if (nomCapa === "colonias" || nomCapa === "delegaciones") {
        var ele = new L.WFS({
          url: "https://www.clustersig.com/geoserver/wfs",
          typeNS: nomSeparado[0],
          typeName: nomSeparado[1],
          geometryField: "geom",
        });
        geoserverLyrGroup.addLayer(ele);
      }
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

    arrayCapasBase = document.getElementsByClassName("base");
    arrayCapasActivas = document.getElementsByClassName("layers");

    Array.from(arrayCapasBase).forEach(function (element) {
      element.addEventListener("click", (event) => {
        if (element.id == "switchColonias") {
          if (event.target.checked === true) {
            lyrs[0]
              .setStyle({
                fillColor: "white",
                color: "#C07F00",
                fillOpacity: 0.1,
                weight: 2,
              })
              .addTo(map2);
          } else {
            lyrs[0].removeFrom(map2);
          }
        } else if (element.id == "switchDelegaciones") {
          if (event.target.checked === true) {
            lyrs[1]
              .setStyle({
                fillColor: "none",
                color: "black",
                weight: 3,
              })
              .addTo(map2);
          } else {
            lyrs[1].removeFrom(map2);
          }
        }
      });
    });

    var activosCount = 0;
    Array.from(arrayCapasActivas).forEach(function (element) {
      element.addEventListener("click", (event) => {
        var activateTable = document.getElementById("btnTabla");
        activateTable.style.display = "block";
        const capa = element.name.replace(":", ".");
        const g = selectionPolygon.getLayers()[0].toGeoJSON();
        const id = element.id;
        const name = id.replace("switch", "").replace(/_/g, " ");
        const selectedLayerId = `${name
          .replace(" ", "")
          .toLowerCase()}Selected`;

        const conteo = `${selectedLayerId
          .replace("Selected", "")
          .toLowerCase()}Text`;

        if (event.target.checked === true) {
          procesandoData(g.geometry, capa, name, conteo);
          activosCount++;
        } else {
          selectedFeatures.eachLayer(function (layer) {
            if (layer.options.name === name) {
              selectedFeatures.removeLayer(layer);
            }
          });
          $("#" + conteo).remove();
          activosCount--;
        }
        if (activosCount === 0) {
          var btnTabla = document.getElementById("btnTabla");
          btnTabla.style.display = "none";
        }
      });
    });
  })
  .then(() => {
    // CONTROL DE BARRA DE BUSQUEDA
    var lr = geoserverLyrGroup.getLayers();
    ctrlSearch = L.control
      .search({
        layer: lr[0],
        propertyName: "nomb_fracc",
        initial: false,
        position: "topright",
        textPlaceholder: "Buscar por...",
        textErr: "Busqueda no encontrada",
        textCancel: "Cancelar",
        marker: false,
        moveToLocation: function (latlng, title, map) {
          map2.fitBounds(latlng.layer.getBounds());
        },
      })
      .addTo(map2);

    ctrlSearch.on("search:locationfound", function (e) {
      e.layer.setStyle({ fillColor: "none", color: "#FF0000", weight: 3 });
      e.layer.addTo(map2);

      coloniasLyr = geoserverLyrGroup.getLayers()[0];
    });
  })
  .catch((error) => {
    console.error("Error:", error);
  });

function procesandoData(geom, capa, layerName, conteo) {
  $.ajax({
    type: "POST",
    url: "extractor.php",
    data: { geom: JSON.stringify(geom), capa: capa },
    success: function (data) {
      const intersectedGeoJSON = JSON.parse(data);
      if (intersectedGeoJSON.features.length === 0) {
        $("#tablaEst").append(
          `<h5 id='${conteo}'>${layerName}: ${intersectedGeoJSON.features.length}</h5>`
        );
        return;
      }
      const tipoDato = intersectedGeoJSON.features[0].geometry.type;
      const styleConfig = getConfig(tipoDato, getRandomColor(), layerName);
      if (styleConfig) {
        L.geoJSON(intersectedGeoJSON, styleConfig).addTo(selectedFeatures);
        $("#tablaEst").append(
          `<h5 id='${conteo}'>${layerName}: ${intersectedGeoJSON.features.length}</h5>`
        );
      }
    },
    error: function (error) {
      console.error("Error:", error);
    },
  });
}

function getRandomColor() {
  return "#" + ((Math.random() * 0xffffff) << 0).toString(16);
}

function getConfig(geomType, fillColor, name) {
  const styleConfigs = {
    Point: {
      pointToLayer: function (feature, latlng) {
        return L.circleMarker(latlng, {
          radius: 3,
          fillColor: fillColor,
          color: "black",
          weight: 1,
          opacity: 1,
          fillOpacity: 1,
        });
      },
      name: name,
    },
    MultiLineString: {
      style: {
        color: fillColor,
      },
      name: name,
    },
    MultiPolygon: {
      style: {
        color: fillColor,
        fillColor: fillColor,
        weight: 1,
        opacity: 1,
        fillOpacity: 0.3,
      },
      name: name,
    },
  };

  return styleConfigs[geomType];
}
