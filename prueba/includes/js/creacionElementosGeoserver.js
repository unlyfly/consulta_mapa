async function createWorkspaceDatastoreLayer(
  geoserverUrl,
  workspaceName,
  datastoreName,
  layerName
) {
  // Define the common headers for all fetch requests
  const headers = new Headers({
    Authorization: "Basic " + btoa("admin:geoserver"),
    "Content-Type": "application/json",
  });

  const workspacePayload = {
    workspace: {
      name: workspaceName,
    },
  };

  const datastorePayload = {
    dataStore: {
      name: datastoreName,
      connectionParameters: {
        entry: [
          { "@key": "host", $: "localhost" },
          { "@key": "port", $: "5432" },
          { "@key": "database", $: workspaceName },
          { "@key": "schema", $: datastoreName },
          { "@key": "user", $: "postgres" },
          { "@key": "passwd", $: "root" },
          { "@key": "dbtype", $: "postgis" },
          { "@key": "max connections", $: "10" },
          { "@key": "min connections", $: "1" },
          { "@key": "fetch size", $: "1000" },
          { "@key": "Batch insert size", $: "1" },
          { "@key": "Connection timeout", $: "20" },
          { "@key": "validate connections", $: true },
          { "@key": "Test while idle", $: true },
          { "@key": "Evictor run periodicity", $: "300" },
          { "@key": "Max connection idle time", $: "300" },
          { "@key": "Evictor tests per run", $: "3" },
          { "@key": "Loose bbox", $: true },
          { "@key": "Estimated extents", $: true },
          { "@key": "Max open prepared statements", $: "50" },
          { "@key": "encode functions", $: true },
          { "@key": "Support on the fly geometry simplification", $: true },
          { "@key": "Method used to simplify geometries", $: "FAST" },
        ],
      },
    },
  };

  const layerPayload = {
    featureType: {
      name: layerName,
      srs: "EPSG:4326",
      maxFeatures: 1000000,
      numDecimals: 50,
    },
  };

  try {
    const workspaceUrl = `${geoserverUrl}/workspaces/${workspaceName}`;
    const workspaceResponse = await fetch(workspaceUrl, {
      method: "GET",
      headers,
    });

    if (workspaceResponse.status === 404) {
      // Workspace does not exist, create it
      await fetch(`${geoserverUrl}/workspaces`, {
        method: "POST",
        headers,
        body: JSON.stringify(workspacePayload),
      });
    } else if (workspaceResponse.status !== 200) {
      throw new Error("Error checking workspace existence.");
    }

    const datastoreUrl = `${geoserverUrl}/workspaces/${workspaceName}/datastores/${datastoreName}`;
    const datastoreResponse = await fetch(datastoreUrl, {
      method: "GET",
      headers,
    });

    if (datastoreResponse.status === 404) {
      // Datastore does not exist, create it
      await fetch(`${geoserverUrl}/workspaces/${workspaceName}/datastores`, {
        method: "POST",
        headers,
        body: JSON.stringify(datastorePayload),
      });
    } else if (datastoreResponse.status !== 200) {
      throw new Error("Error checking datastore existence.");
    }

    const layerUrl = `${geoserverUrl}/workspaces/${workspaceName}/datastores/${datastoreName}/featuretypes/${layerName}`;
    const layerResponse = await fetch(layerUrl, { method: "GET", headers });

    if (layerResponse.status === 404) {
      // Layer does not exist, create it
      await fetch(
        `${geoserverUrl}/workspaces/${workspaceName}/datastores/${datastoreName}/featuretypes`,
        {
          method: "POST",
          headers,
          body: JSON.stringify(layerPayload),
        }
      );
    } else if (layerResponse.status !== 200) {
      throw new Error("Error checking layer existence.");
    }

    console.log(`Workspace, datastore, and layer setup completed.`);
  } catch (error) {
    if (error.name === 'TypeError') {
      // Handle CORS-related errors here
      console.error('CORS error:', error);
    } else {
      // Handle other non-CORS errors here
      console.error('An error occurred:', error.message);
    }
  }
}

const geoserverUrl = "https://www.clustersig.com/geoserver/rest";
const workspaceName = "animales";
const datastoreName = "domesticos";
const layerName = "gatos";

createWorkspaceDatastoreLayer(
  geoserverUrl,
  workspaceName,
  datastoreName,
  layerName
);
