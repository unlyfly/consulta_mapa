var chartContainer = document.getElementById("chartContenedor");

function generarGrafica(layer) {
  var charts = document.createElement("canvas");
  var nombreGraf = document.createElement("h5");
  nombreGraf.innerText = layer.options.name;
  var geoJson = layer.toGeoJSON();
  let conAdeudoCount = 0;
  let sinAdeudoCount = 0;

  geoJson.features.forEach((feature) => {
    if (feature.properties.adeudo === "1") {
      conAdeudoCount++;
    } else {
      sinAdeudoCount++;
    }
  });

  // Create a chart to represent the counts
  const genChart = new Chart(charts.getContext("2d"), {
    type: "doughnut",
    data: {
      labels: ["Deudores", "En Orden"],
      datasets: [
        {
          label: "Conteo",
          data: [conAdeudoCount, sinAdeudoCount],
          backgroundColor: ["yellow", "blue"],
        },
      ],
    },
  });
  chartContainer.appendChild(nombreGraf);
  chartContainer.appendChild(charts);
}
