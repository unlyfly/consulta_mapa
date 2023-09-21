// Define la URL de tu solicitud GetCapabilities de GeoServer
var geoServerUrl =
    "https://www.clustersig.com/geoserver/ows?service=WFS&version=2.0.0&request=GetCapabilities";

var geoserverLyrGroup = new L.layerGroup();

getLayerNamesFromGeoServer(geoServerUrl)
    .then((typeNS) => {
        var selectGroup = document.getElementById("layerSelects");
        var lyrs;
        typeNS.forEach((element) => {
            var grupo = document.createElement("div");
            var button = document.createElement("button");

            var nomSeparado = element.split(":");
            var nomDependecia = nomSeparado[0].split("_")[0];
            var nomDependeciaFix = nomDependecia.charAt(0).toUpperCase()
            + nomDependecia.slice(1);
            var nomCapa = nomSeparado[1];
            var nomCapaFix = nomCapa.charAt(0).toUpperCase()
            + nomCapa.slice(1);

            grupo.classList.add("form-switch");
            grupo.id = "grupo" + nomDependeciaFix;

            button.innerHTML =
                nomDependecia.toUpperCase() + "<i class='fa fa-caret-down'></i>";
            button.classList.add("dropdown-btn");
            button.id = "lista" + nomDependeciaFix;

            var divSwitches = document.createElement("div");
            divSwitches.classList.add("form-switch");

            var switchCapa = document.createElement("input");
            switchCapa.type = "checkbox";
            switchCapa.classList.add("form-check-input", "me-3", "layers");
            switchCapa.id = "switch" + nomCapaFix;
            switchCapa.innerHTML = nomCapaFix;

            if ($("#grupo" + nomDependeciaFix).length === 0) {
                selectGroup.appendChild(grupo);
                grupo.appendChild(button);
            }

            var toGroup = document.getElementById("grupo" + nomDependeciaFix);

            toGroup.appendChild(switchCapa);


            var ele = new L.WFS({
                url: "https://www.clustersig.com/geoserver/wfs",
                typeNS: nomSeparado[0],
                typeName: nomSeparado[1],
                geometryField: "geom",
                opacity: 0.8,
            });

            geoserverLyrGroup.addLayer(ele);

            //   lyrs[nomSeparado[1]] = ele;
        });

        console.log(geoserverLyrGroup.getLayers());
    })
    .catch((error) => {
        console.error("Error:", error);
    });
