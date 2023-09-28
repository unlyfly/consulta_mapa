var filtrados = L.layerGroup();

function procesandoData(geom, capa, layerName) {
  $.ajax({
    type: "POST",
    url: "extractor.php",
    data: { geom: JSON.stringify(geom), capa: capa },
    success: function (data) {
      const intersectedGeoJSON = JSON.parse(data);
      const tipoDato = intersectedGeoJSON.features[0].geometry.type;

      const styleConfig = getStyleConfig(tipoDato, getRandomColor());
      if (styleConfig) {
        L.geoJSON(intersectedGeoJSON, styleConfig).addTo(filtrados);
        $("#tablaEst").append(
          `<h5 id='${tipoDato}Text'>${layerName}: ${intersectedGeoJSON.features.length}</h5>`
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

function getStyleConfig(geomType, fillColor) {
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
    },
    LineString: {
      style: {
        color: fillColor,
      },
    },
    Polygon: {
      style: {
        color: fillColor,
        fillColor: fillColor,
        weight: 1,
        opacity: 1,
        fillOpacity: 0.3,
      },
    },
  };

  return styleConfigs[geomType];
}
