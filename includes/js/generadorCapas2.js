function getWfsLayer(url, options) {
  return new Promise((resolve, reject) => {
    try {
      const layer = L.Geoserver.wfs(url, options);
      resolve(layer);
    } catch (error) {
      reject(error);
    }
  });
}

async function fetchData() {
  try {
    const geoServerUrl =
      "https://www.clustersig.com/geoserver/ows?service=WFS&version=1.1.0&request=GetCapabilities";

    const baseLyrGroup = L.layerGroup();

    const typeNS = await getLayerNamesFromGeoServer(geoServerUrl);

    const selectGroup = document.getElementById("layerSelects");
    let baseLyrs;

    for (const element of typeNS) {
      var grupo = document.createElement("li");
      var button = document.createElement("button");
      var divSwitches = document.createElement("div");
      var dropdownCont = document.createElement("div");

      // Separacion de nombres de dependencias y de capas.
      const nomSeparado = element.split(":");
      const nomDependecia = nomSeparado[0].split("_")[0];
      const nomDependeciaFix =
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

      const dropContainer = document.getElementById(
        "container" + nomDependeciaFix
      );

      dropContainer.appendChild(divSwitches);
      divSwitches.prepend(switchCapa);

      if (nomCapa === "colonias" || nomCapa === "delegaciones") {
        try {
          const ele = await getWfsLayer(
            "https://www.clustersig.com/geoserver/wfs",
            {
              layers: element,
              fitLayer: false,
            }
          );
          baseLyrGroup.addLayer(ele);
        } catch (error) {
          console.error("Error fetching WFS layer:", error);
        }
      }
    }

    baseLyrs = baseLyrGroup.getLayers();

    baseLyrGroup.eachLayer(function (layer) {
      if (layer.options.typeName === "colonias") {
        layer.on("click", function (e) {
          $("#btnClear").show();

          var layersToClear = [selectionPolygon, selectedFeatures];
          layersToClear.forEach((layer) => layer.clearLayers());

          const toggleButtons = document.getElementsByClassName("layers");
          Array.from(toggleButtons).forEach(
            (button) => (button.checked = false)
          );

          var coloniaFeature = new L.geoJSON(e.layer.toGeoJSON(), {
            style: {
              color: "red",
              weight: 2,
              opacity: 1,
            },
          });
          colonia = coloniaFeature.getLayers()[0];
          selectionPolygon.addLayer(colonia);
          $("#tablaEst").empty();
        });
      }
    });

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
            baseLyrs[0]
              .setStyle({
                fillColor: "white",
                color: "#C07F00",
                fillOpacity: 0.1,
                weight: 2,
              })
              .addTo(map2);
          } else {
            baseLyrs[0].removeFrom(map2);
          }
        } else if (element.id == "switchDelegaciones") {
          if (event.target.checked === true) {
            baseLyrs[1]
              .setStyle({
                fillColor: "none",
                color: "black",
                weight: 3,
              })
              .addTo(map2);
          } else {
            baseLyrs[1].removeFrom(map2);
          }
        }
      });
    });

    var activosCount = 0;
    Array.from(arrayCapasActivas).forEach(function (element) {
      var actionBtns = document.getElementsByClassName("btn-actions");
      element.addEventListener("click", (event) => {
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
          Array.from(actionBtns).forEach(
            (boton) => (boton.style.display = "block")
          );
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
          Array.from(actionBtns).forEach(
            (element) => (element.style.display = "none")
          );
          var btnTabla = document.getElementById("btnTabla");
          btnTabla.style.display = "none";
        }
      });
    });

    ctrlSearch = L.control
      .search({
        layer: baseLyrGroup,
        propertyName: "busqueda",
        initial: false,
        position: "topright",
        textPlaceholder: "Buscar por...",
        textErr: "Busqueda no encontrada",
        textCancel: "Cancelar",
        marker: false,
        buildTip: function (text, val) {
          var type = val.layer.feature.id;
          var typeSep = type.split('.');
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
          map2.fitBounds(latlng.layer.getBounds());
        },
      })
      .addTo(map2);

    ctrlSearch.on("search:expanded", function (e) {
      const geoJSON = baseLyrGroup.toGeoJSON();
      var features = geoJSON.features;

      for (const feature of features) {
        var props = feature.properties;

        for (const prop in props) {
          if (prop.includes("_1")) {
            props["busqueda"] = props[prop];
            delete props[prop];
          }
        }
      }
    });

    ctrlSearch.on("search:locationfound", function (e) {
      const geoJSON = baseLyrGroup.toGeoJSON();
      //   const uniqueKeys = new Set();

      //   geoJSON.features.forEach((feature) => {
      //     const properties = feature.properties;

      //     Object.keys(properties).forEach((key) => {
      //       uniqueKeys.add(key);
      //     });
      //   });

      coloniasLayers.clearLayers();
      e.layer.setStyle({ fillColor: "none", color: "#FF0000", weight: 3 });
      e.layer.addTo(coloniasLayers);
    });
  } catch (error) {
    console.error("Error:", error);
  }
}
