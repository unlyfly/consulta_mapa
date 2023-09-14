function pruebaTabla(layer) {
  var features = layer.features;

  var table = document.getElementById("statsTable");
  var thead = document.createElement("thead");
  var tr = document.createElement("tr");
  tr.classList.add("table-dark");

  // tr.innerHTML = "";

  // Assuming all features have the same properties
  var properties = Object.keys(features[0].properties);

  for (var i = 0; i < properties.length; i++) {
    var th = document.createElement("th");
    th.textContent = properties[i];
    tr.appendChild(th);
  }
  thead.appendChild(tr);
  table.appendChild(thead);

  
  var tbody = document.createElement("tbody");
  // tbody.innerHTML = "";

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
  }
}
