const ctx = document.getElementById("chart");

function generarGrafica(elements) {
  let apagadasCount = 0;
  let encendidasCount = 0;

  elements.features.forEach((feature) => {
    if (feature.properties.apagada === "1") {
      apagadasCount++;
    } else {
      encendidasCount++;
    }
  });

  // Create a chart to represent the counts
  const ctx = document.getElementById("chart").getContext("2d");
  const firtsChart = new Chart(ctx, {
    type: "pie",
    data: {
      labels: ["Apagadas", "Encendidas"],
      datasets: [
        {
          label: "Conteo",
          data: [apagadasCount, encendidasCount],
          backgroundColor: ["black", "yellow"],
        },
      ],
    },
    options: {
      scales: {
        y: {
          beginAtZero: true,
        },
      },
    },
  });
}
