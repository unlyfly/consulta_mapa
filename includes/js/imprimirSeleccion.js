document.getElementById("btnImprimir").addEventListener("click", function () {
  // var graficaCanvas = document.getElementById("chartContenedor");
  // var tabla = document.getElementById("statsTables");
  // var mapa = document.getElementById("mapdiv");

  // Promise.all([
  //   html2canvas(graficaCanvas),
  //   html2canvas(tabla),
  //   html2canvas(mapa, {
  //     width: 600,
  //     height: 450,
  //   }),
  // ]).then(function ([chartImage, tableImage, mapImage]) {
  //   var printWindow = window.open("", "_blank");
  //   printWindow.document.open();
  //   printWindow.document.write(
  //     '<html><head><link rel="stylesheet" href="print.css" /></head><body>'
  //   );

  //   printWindow.document.write(
  //     '<h1>Grafica:</h1><img src="' + chartImage.toDataURL() + '" />'
  //   );
  //   printWindow.document.write(
  //     '<h1>Tabla:</h1><img src="' + tableImage.toDataURL() + '" />'
  //   );
  //   printWindow.document.write(
  //     '<h1>Mapa:</h1><img src="' + mapImage.toDataURL() + '" />'
  //   );

  //   printWindow.document.write("</body></html>");
  //   printWindow.document.close();

  //   printWindow.print();
  // });

  leafletImage(map2, function (err, canvas) {
    if (err) {
      console.error('Error capturing map image:', err);
      return;
    }
  
    window.jsPDF = window.jspdf.jsPDF;
  
    var pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4',
    });
  
    var mapImage = canvas.toDataURL('image/jpeg');
  
    pdf.text('Mapa y Capas Activas:', 10, 10);
    
    pdf.addImage(mapImage, 'JPEG', 80, 36, 200, 138); // Adjust the positioning and size as needed

    pdf.text('Pronto mas opciones.', 10, 200);
  
    // Get the PDF content as a data URL
    var pdfContent = pdf.output('datauristring');
  
    // Open a new window and display the PDF
    var previewWindow = window.open();
    previewWindow.document.open();
    previewWindow.document.write('<html><head><title>PDF Preview</title></head><body>');
    previewWindow.document.write('<embed width="100%" height="100%" src="' + pdfContent + '" type="application/pdf">');
    previewWindow.document.write('</body></html>');
    previewWindow.document.close();
  });
  
});
