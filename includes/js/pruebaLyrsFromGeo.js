// Define la URL de tu solicitud GetCapabilities de GeoServer
var geoServerUrl =
  "https://www.clustersig.com/geoserver/ows?service=WFS&version=2.0.0&request=GetCapabilities";

var geoserverLyrGroup = new L.layerGroup();

getLayerNamesFromGeoServer(geoServerUrl)
  .then((typeNS) => {
    var selectGroup = document.getElementById("layerSelects");
    var lyrs;
    typeNS.forEach((element) => {
      var grupo = document.createElement("li");
      var button = document.createElement("button");
      var divSwitches = document.createElement("div");
      var dropdownCont = document.createElement("div");

      // Separacion de nombres de dependencias y de capas.
      var nomSeparado = element.split(":");
      var nomDependecia = nomSeparado[0].split("_")[0];
      var nomDependeciaFix =
        nomDependecia.charAt(0).toUpperCase() + nomDependecia.slice(1);

      var nomCapa = nomSeparado[1];
      var nomCapaFix = nomCapa.charAt(0).toUpperCase() + nomCapa.slice(1);

      grupo.id = "grupo" + nomDependeciaFix;
      grupo.classList.add(
        "form-control",
        "list-group-item",
        "list-group-item-action"
      );

      button.innerHTML =
        nomDependecia.toUpperCase() + "<i class='fa fa-caret-down'></i>";
      button.id = "lista" + nomDependeciaFix;
      button.classList.add("dropdown-btn");

      dropdownCont.id = "container" + nomDependeciaFix;
      dropdownCont.classList.add("dropdown-container");

      divSwitches.classList.add("form-switch");
      divSwitches.innerText = nomCapaFix;

      var switchCapa = document.createElement("input");
      switchCapa.type = "checkbox";
      switchCapa.classList.add("form-check-input", "me-3", "layers");
      switchCapa.id = "switch" + nomCapaFix;

      if ($("#grupo" + nomDependeciaFix).length === 0) {
        selectGroup.appendChild(grupo);
        grupo.appendChild(button);
        grupo.appendChild(dropdownCont);
      }

      var dropContainer = document.getElementById(
        "container" + nomDependeciaFix
      );

      dropContainer.appendChild(divSwitches);
      divSwitches.prepend(switchCapa);

      var ele = new L.WFS({
        url: "https://www.clustersig.com/geoserver/wfs",
        typeNS: nomSeparado[0],
        typeName: nomSeparado[1],
        geometryField: "geom",
        opacity: 0.8,
      });

      geoserverLyrGroup.addLayer(ele);
    });

    arrayCapasActivas = document.getElementsByClassName("layers");
    var dropdownBtn = document.getElementsByClassName("dropdown-btn");

    for (var i = 0; i < dropdownBtn.length; i++) {
      dropdownBtn[i].addEventListener("click", function () {
        this.classList.toggle("active");
        var dropdownContent = this.nextElementSibling;
        if (dropdownContent.style.display === "block") {
          dropdownContent.style.display = "none";
        } else {
          dropdownContent.style.display = "block";
        }
      });
    }
  })
  .catch((error) => {
    console.error("Error:", error);
  });
