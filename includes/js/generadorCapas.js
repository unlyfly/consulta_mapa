const geoServerUrl =
  "https://www.clustersig.com/geoserver/ows?service=WFS&version=1.1.0&request=GetCapabilities";

async function fetchData() {
  try {
    // Create a promise to resolve when message is received
    const messageReceivedPromise = new Promise((resolve) => {
      // Listen for messages from the parent window
      window.addEventListener("message", function (event) {
        // Get the data sent from the parent window
        const receivedData = event.data;

        // Use the received data as needed
        // console.log("Received Data:", receivedData);

        // Resolve the promise with the received data
        resolve(receivedData);
      });
    });

    messageReceivedPromise.then(async (receivedData) => {
      // const typeNS = await getLayerNamesFromGeoServer(geoServerUrl);

      // // Filter elements of typeNS that contain any of the elements in receivedData
      // const filteredElements = typeNS.filter((element) => {
      //   return receivedData.some((dataElement) =>
      //     element.includes(dataElement)
      //   );
      // });

      const selectGroup = document.getElementById("layerSelects");
      let activosCount = 0;

      var searchSelect = document.getElementById("search-list");

      for (const element of receivedData) {
        
        // Separacion de nombres de dependencias y de capas.
        const nomSplit = element.split(".");
        const schema = nomSplit.pop();
        const nomSeparado = nomSplit[0].split(":");
        const nomDependecia = nomSeparado[0].split("_")[0];
        const nomDependeciaFix =
          nomDependecia.charAt(0).toUpperCase() + nomDependecia.slice(1);

        let nomCapa = nomSeparado[1];
        var nomCapaFix = nomCapa.charAt(0).toUpperCase() + nomCapa.slice(1);

        if (nomCapa === "colonias" || nomCapa === "delegaciones") {
          // Si la capa es "colonias" o "delegaciones", se obtienen las capas WFS.
          getWfsLayers(nomSplit[0], baseLyrGroup);
        }

        if (nomCapa != "colonias") {
          // Si la capa no es "colonias", se realizan acciones para crear elementos en el DOM.
          var grupo = document.createElement("li");
          var button = document.createElement("button");
          var divSwitches = document.createElement("div");
          var dropdownCont = document.createElement("div");
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

          // Se crea un checkbox y se asocia un evento de clic.
          var switchCapa = document.createElement("input");
          switchCapa.type = "checkbox";
          switchCapa.classList.add("form-check-input", "me-3");
          switchCapa.id = "switch" + nomCapaFix;

          switchCapa.addEventListener("click", function (event) {
            let capa = schema + "." + nomCapa;
            var name = capa.split(".")[1];
            if (event.target.checked === true) {
              // Si el checkbox está marcado, se realiza una lógica específica según la capa.
              if (name === "delegaciones") {
                // Lógica específica para la capa "delegaciones" cuando está marcada.
                baseLyrGroup.eachLayer(function (layer) {
                  if (layer.options.layers === nomSplit[0]) {
                    layer
                      .setStyle({
                        fillOpacity: 0,
                        color: "black",
                        weight: 3,
                      })
                      .addTo(map2);
                  }
                });
              } else {
                // Lógica común para otras capas cuando están marcadas.
                var g = selectionPolygon.getLayers()[0].toGeoJSON();
                Array.from($(".btn-actions")).forEach(
                  (boton) => (boton.style.display = "block")
                );
                procesandoData(g.geometry, nomSeparado[0], capa, name);
                activosCount++;
              }
            } else {
              // Si el checkbox está desmarcado, se realiza una lógica específica según la capa.
              if (name == "delegaciones") {
                baseLyrGroup.eachLayer(function (layer) {
                  if (layer.options.layers === nomSplit[0]) {
                    layer.removeFrom(map2);
                  }
                });
              }

              // Lógica común para desmarcar cualquier capa.
              selectedFeatures.eachLayer(function (layer) {
                if (layer.options.name === name) {
                  selectedFeatures.removeLayer(layer);
                }
              });
              $("#conteo" + name).remove();
              activosCount--;

              // Lógica adicional si no hay capas activas.
              if (activosCount === 0) {
                Array.from($(".btn-actions")).forEach(
                  (element) => (element.style.display = "none")
                );
                var btnTabla = document.getElementById("btnTabla");
                btnTabla.style.display = "none";
              }
            }
          });

          // Verifica si ya existe un grupo con el mismo ID antes de agregar elementos al DOM.
          if ($("#grupo" + nomDependeciaFix).length === 0) {
            selectGroup.appendChild(grupo);
            grupo.appendChild(button);
            grupo.appendChild(dropdownCont);
          }

          // Agrega el checkbox al contenedor de capas.
          const dropContainer = document.getElementById(
            "container" + nomDependeciaFix
          );
          dropContainer.appendChild(divSwitches);
          divSwitches.prepend(switchCapa);
        }
        // Agrega un elemento de búsqueda al menú de búsqueda.
        var searchOption = document.createElement("li");
        searchOption.innerHTML = nomCapa;
        searchOption.classList.add("menu-item");

        searchOption.addEventListener("click", async (event) => {
          try {
            // Fetch the schema and column names from the layer
            const url = `https://www.clustersig.com/geoserver/wfs?service=WFS&version=1.0.0&request=DescribeFeatureType&typeName=${nomCapa}`;
            const response = await fetch(url);
            const data = await response.text();
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(data, "text/xml");
            const propertyName = Array.from(xmlDoc.querySelectorAll("element"))
              .map((el) => el.getAttribute("name"))
              .filter((name) => name.includes("_1"))
              .join(",");

            searchSelect.style.display = "none";
            searchCapaSelected = [nomCapa, propertyName];
            const searchInput = document.getElementsByClassName("search-input");
            searchInput[1].style.display = "block";
            searchInput[1].focus();
          } catch (error) {
            console.error("Error fetching schema and column names:", error);
          }
        });
        searchSelect.appendChild(searchOption);
      }

      baseLyrGroup.eachLayer(function (layer) {
        if (layer.options.layers === "catastro:colonias") {
          layer.on("click", function (e) {
            ctrlButtonSidebar.addTo(map2);
            ctrlSidebar.show();
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
    });
  } catch (error) {
    console.error("Error:", error);
  }
}

// FUNCIONES GENERALES
function procesandoData(geom, db, capa, layerName) {
  $.ajax({
    type: "POST",
    url: "extractor.php",
    data: { geom: JSON.stringify(geom), db: db, capa: capa },
    success: function (data) {
      const intersectedGeoJSON = JSON.parse(data);
      if (intersectedGeoJSON.features.length === 0) {
        $("#tablaEst").append(
          `<h5 id='conteo${layerName}'>${layerName}: ${intersectedGeoJSON.features.length}</h5>`
        );
        return;
      }
      const tipoDato = intersectedGeoJSON.features[0].geometry.type;
      const styleConfig = getConfig(tipoDato, getRandomColor(), layerName);
      if (styleConfig) {
        L.geoJSON(intersectedGeoJSON, styleConfig).addTo(selectedFeatures);
        $("#tablaEst").append(
          `<h5 id='conteo${layerName}'>${layerName}: ${intersectedGeoJSON.features.length}</h5>`
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

const popupTable = function (feature, layer) {
  const popupContent = document.createElement("div");
  const table = document.createElement("table");
  table.style.borderRadius = "0.6rem";

  for (const prop in feature.properties) {
    const row = document.createElement("tr");
    const cell1 = document.createElement("td");
    const cell2 = document.createElement("td");
    cell1.style.color = "white";
    cell1.style.backgroundColor = "#CC7722";
    cell1.textContent = prop.toUpperCase();
    cell2.textContent = feature.properties[prop];
    row.appendChild(cell1);
    row.appendChild(cell2);
    table.appendChild(row);
  }

  popupContent.appendChild(table);
  
  layer.bindPopup(popupContent);
};

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
      onEachFeature: popupTable,
    },
    MultiLineString: {
      style: {
        color: fillColor,
      },
      name: name,
      onEachFeature: popupTable,
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
      onEachFeature: popupTable,
    },
    Polygon: {
      style: {
        color: fillColor,
        fillColor: fillColor,
        weight: 1,
        opacity: 1,
        fillOpacity: 0.3,
      },
      name: name,
      onEachFeature: popupTable,
    },
  };
  return styleConfigs[geomType];
}

async function getFilteredFeatures(input) {
  try {
    const ele = L.Geoserver.wfs("https://www.clustersig.com/geoserver/wfs", {
      layers: `${searchCapaSelected[0]}`,
      fitLayer: false,
      onEachFeature: popupTable,
      CQL_FILTER: `strToLowerCase(${searchCapaSelected[1]}) LIKE '%${input}%'`,
    }).addTo(searchLayer);
  } catch (error) {
    console.error("Error filtering features:", error);
  }
}

async function getWfsLayers(capa, layerGroup) {
  try {
    const ele = L.Geoserver.wfs("https://www.clustersig.com/geoserver/wfs", {
      layers: capa,
      fitLayer: false,
    });

    layerGroup.addLayer(ele);
  } catch (error) {
    console.error("Error fetching WFS layer:", error);
  }
}

// async function setBusquedaCol() {
//   try{
//     searchLayer.getLayers()[0].eachLayer(function (layer) {
//       var feature = layer.toGeoJSON();
//       var props = feature.properties;
//       for (const prop in props) {
//         if (prop.includes("_1")) {
//           console.log(prop);
//           props["busqueda"] = props[prop];
//           delete props[prop];
//         }
//       }
//     });
//   } catch (error) {
//     console.error("Error column name origin:", error);
//   }
// }
