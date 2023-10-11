var chartContainer = document.getElementById("chartContenedor");

function generarGrafica(layer, selectedCampo) {
  var grafica = document.getElementById("grafica" + layer.options.name)
  var charts = document.createElement("canvas");
  var geoJson = layer.toGeoJSON();
  var features = geoJson.features;
  var conteoDeValores = {};

  features.forEach((feature) => {
    var value = feature.properties[selectedCampo];

    if (value !== null) {
      if (!conteoDeValores[value]) {
        conteoDeValores[value] = 1;
      } else {
        conteoDeValores[value]++;
      }
    }
  });

  const labels = Object.keys(conteoDeValores);
  const data = labels.map((label) => conteoDeValores[label]);
  const colors = generateColors(labels.length);

  const genChart = new Chart(charts.getContext("2d"), {
    type: "pie",
    data: {
      labels: labels,
      datasets: [
        {
          label: "Count",
          data: data,
          backgroundColor: colors,
        },
      ],
    },
  });
  grafica.appendChild(charts);
}

function generateColors(count) {
  var colors = [];
  for (var i = 0; i < count; i++) {
    var color = "#" + Math.floor(Math.random() * 16777215).toString(16);
    colors.push(color);
  }
  return colors;
}
