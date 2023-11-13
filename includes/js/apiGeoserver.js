var geoServerUrl =
  "https://www.clustersig.com/geoserver/ows?service=WFS&version=2.0.0&request=GetCapabilities";
  
function getLayerNamesFromGeoServer(geoServerUrl) {
  return fetch(geoServerUrl)
    .then((response) => {
      if (!response.ok) {
        throw new Error(
          `Failed to retrieve GeoServer capabilities. Status code: ${response.status}`
        );
      }
      return response.text();
    })
    .then((xmlText) => {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlText, "text/xml");
      const layerNodes = xmlDoc.getElementsByTagName("FeatureType");
      const typeNS = [];

      for (let i = 0; i < layerNodes.length; i++) {
        const layerNode = layerNodes[i];
        const nameNode = layerNode.firstChild;
        if (nameNode) {
          const layerName = nameNode.textContent;
          typeNS.push(layerName);
        }
      }

      return typeNS;
    })
    .catch((error) => {
      console.error(error);
    });
}
