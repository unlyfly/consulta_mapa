function crearWorkspace(geoserverUrl, nombreWorkspace) {
  // Crea el header para el request
  const headers = new Headers();
  headers.append("Authorization", "Basic " + btoa("admin:geoserver"));
  headers.append("Content-Type", "application/json");

  // Define the json payload for creating the workspace
  const jsonPayload = {
    workspace: {
      name: nombreWorkspace,
    },
  };

  // Create the request options
  const requestOptions = {
    method: "POST",
    headers: headers,
    body: JSON.stringify(jsonPayload),
  };

  // Make the POST request to create the workspace
  fetch(geoserverUrl, requestOptions)
    .then((response) => {
      if (response.status === 201) {
        console.log(`Espacio de trabajo "${nombreWorkspace}" creado exitosamente.`);
      } else {
        console.error(
          `Error al intentar crear nuevo espacio de trabajo. Codigo de status: ${response.status}`
        );
      }
    })
    .catch((error) => {
      console.error("An error occurred:", error);
    });
}

var geoserverUrl = "https://www.clustersig.com/geoserver/rest/workspaces";
var newNombreWorkspace = "samaritano";

crearWorkspace(geoserverUrl, newNombreWorkspace);
