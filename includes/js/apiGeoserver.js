async function getLayerNamesFromGeoServer(geoServerUrl) {
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
        const datastoresNodes = layerNode.getElementsByTagName("ows:Keyword");
        const storeNode = datastoresNodes[0].innerHTML;
        const nameNode = layerNode.firstChild.textContent;
        if (nameNode) {
          const layerName = nameNode+'.'+storeNode;
          typeNS.push(layerName);
        }
      }
      return typeNS;
    })
    .catch((error) => {
      console.error(error);
    });
}

async function getColumsFromGeoServer(capa) {
  var geoRequest = 'https://www.clustersig.com/geoserver/wfs?service=wfs&version=2.0.0&request=GetFeature&typeNames=' + capa + '&outputFormat=application/json';
  
  try {
    const response = await fetch(geoRequest);
    
    if (!response.ok) {
      throw new Error(`Failed to retrieve GeoServer capabilities. Status code: ${response.status}`);
    }

    const jsonData = await response.json();

    // Process the GeoJSON data without geometry
    const features = jsonData.features;
    const filteredFeatures = features.map(feature => {
      // Remove the geometry property
      delete feature.geom;
      return feature;
    });
    searchCapaSelected = filteredFeatures;
    return filteredFeatures;
  } catch (error) {
    console.error(error);
  }
}
