function pruebaTabla(layer) {
  var features = layer.features;

  var table = document.getElementById("geojsonTable");
  var tr = document.getElementById("columnas");
  tr.innerHTML = "";

  // Assuming all features have the same properties
  var properties = Object.keys(features[0].properties);

  for (var i = 0; i < properties.length; i++) {
    var th = document.createElement("th");
    th.textContent = properties[i];
    tr.appendChild(th);
  }
  //   console.log(tr);
  //   thead.appendChild(tr);

  
  var tbody = table.getElementsByTagName("tbody")[0];
  tbody.innerHTML = "";

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
  }
}
