document.getElementById("addLayer").addEventListener("change", function () {
    var pdrs = this.files[0].name;
    var nombreCapa = pdrs.split(".")[0];
  
    var containerId = "container" + nombreCapa;
    var switchId = "switch" + nombreCapa;
    var deleteButtonId = "borrar" + nombreCapa;
  
    var elemento = `<div id='${containerId}' class='form-control list-group-item list-group-item-action' style='display:flex;justify-content:space-between;align-items: center;'>
        <div class='form-switch' style='padding-left: 3rem;'>
          <input type='checkbox' class='form-check-input me-3' id='${switchId}' checked>${nombreCapa}
        </div>
        <button id='${deleteButtonId}' class='btn btn-icon btn-danger btn-sm' title='borrarCapa'>
          <i class='fa-solid fa-trash-can'></i>
        </button>
      </div>`;
  
    var contCapas = document.getElementById("capasUsuario");
    contCapas.insertAdjacentHTML("beforeend", elemento);
  
    var deleteButton = document.getElementById(deleteButtonId);
    deleteButton.addEventListener("click", function () {
      var divContainer = document.getElementById(containerId);
      if (divContainer) {
        divContainer.remove();
        usuarioLayers.eachLayer(function (layer) {
          if (layer.options.name === nombreCapa) {
            usuarioLayers.removeLayer(layer);
          }
        });
      }
    });
  
    var switchButton = document.getElementById(switchId);
    switchButton.addEventListener("change", function (event) {
      usuarioLayers.eachLayer(function (layer) {
        if (layer.options.name === nombreCapa) {
          if (!event.target.checked) {
            layer.removeFrom(map2);
          } else {
            layer.addTo(map2);
          }
        }
      });
    });
  });
  