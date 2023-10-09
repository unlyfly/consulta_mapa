function generarTabla(layer) {
  var features = layer.features;
  var master = document.getElementById("statsTables");
  var table = document.createElement("table");
  var thead = document.createElement("thead");
  var tbody = document.createElement("tbody");
  var tr = document.createElement("tr");
  var exportTable = document.createElement("button");

  table.classList.add("table", "table-striped");
  tr.classList.add("table-dark");
  exportTable.innerText = "Exportar Tabla a Excel";
  exportTable.classList.add("btnExport");

  var properties = Object.keys(features[0].properties);

  for (var i = 0; i < properties.length; i++) {
    var th = document.createElement("th");
    th.textContent = properties[i];
    tr.appendChild(th);
  }
  thead.appendChild(tr);
  table.appendChild(thead);

  for (var i = 0; i < features.length; i++) {
    var tr = document.createElement("tr");
    var properties = features[i].properties;

    for (var prop in properties) {
      if (properties.hasOwnProperty(prop)) {
        var td = document.createElement("td");
        td.textContent = properties[prop];
        tr.appendChild(td);
      }
    }
    tbody.appendChild(tr);
    table.appendChild(tbody);
    master.appendChild(table);
    master.appendChild(exportTable);
  }
}
