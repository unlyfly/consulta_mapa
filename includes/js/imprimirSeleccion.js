document.getElementById("btnImprimir").addEventListener("click", function () {
  var graficaCanvas = document.getElementById("chartContenedor");
  var tabla = document.getElementById("statsTables");
  var mapa = document.getElementById("mapdiv");

  Promise.all([
    html2canvas(graficaCanvas),
    html2canvas(tabla),
    html2canvas(mapa, {
      width: 600,
      height: 450,
    }),
  ]).then(function ([chartImage, tableImage, mapImage]) {
    var printWindow = window.open("", "_blank");
    printWindow.document.open();
    printWindow.document.write(
      '<html><head><link rel="stylesheet" href="print.css" /></head><body>'
    );

    printWindow.document.write(
      '<h1>Grafica:</h1><img src="' + chartImage.toDataURL() + '" />'
    );
    printWindow.document.write(
      '<h1>Tabla:</h1><img src="' + tableImage.toDataURL() + '" />'
    );
    printWindow.document.write(
      '<h1>Mapa:</h1><img src="' + mapImage.toDataURL() + '" />'
    );

    printWindow.document.write("</body></html>");
    printWindow.document.close();

    printWindow.print();
  });
});
