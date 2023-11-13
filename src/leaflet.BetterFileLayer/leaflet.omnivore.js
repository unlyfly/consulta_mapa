// import "./polyfills";
// import * as L from "leaflet";
// import { readFileDataAsArrayBuffer, readFileDataAsText } from "./leaflet.omnivore.utils";
// import {
//   csvParse, geojsonParse,
//   gpxParse,
//   kmlParse,
//   kmzParse,
//   polylineParse,
//   shpParse,
//   topojsonParse,
//   wktParse,
// } from "./leaflet.omnivore.parsers";

async function geojsonLoad(blobUrl, options, customLayer) {
  let layer = customLayer || L.geoJson(null, { ...options.layerOptions });

  const data = await readFileDataAsText(blobUrl);

  const parsedData = geojsonParse(data);

  try {
    layer.addData(parsedData);
    return layer;
  } catch (err) {
    throw Error("GeoJSON not valid");
  }
}

async function topojsonLoad(blobUrl, options, customLayer) {
  let layer = customLayer || L.geoJson(null, { ...options.layerOptions });

  const data = await readFileDataAsText(blobUrl);

  const parsedData = topojsonParse(data, options.parserOptions);

  try {
    layer.addData(parsedData);
    return layer;
  } catch (err) {
    throw Error("topoJSON not valid");
  }
}

async function csvLoad(blobUrl, options, customLayer) {
  let layer = customLayer || L.geoJson(null, { ...options.layerOptions });

  const data = await readFileDataAsText(blobUrl);

  const parsedData = csvParse(data, options.parserOptions);

  try {
    layer.addData(parsedData);
    return layer;
  } catch (err) {
    throw Error("Spatial data in CSV not valid");
  }
}

async function gpxLoad(blobUrl, options, customLayer) {
  let layer = customLayer || L.geoJson(null, { ...options.layerOptions });

  const data = await readFileDataAsText(blobUrl);

  const parsedData = gpxParse(data, options.parserOptions);

  try {
    layer.addData(parsedData);
    return layer;
  } catch (err) {
    throw Error("GPX not valid");
  }
}

async function kmlLoad(blobUrl, options, customLayer) {
  let layer = customLayer || L.geoJson(null, { ...options.layerOptions });

  const data = await readFileDataAsText(blobUrl);

  const parsedData = kmlParse(data, options.parserOptions);

  try {
    layer.addData(parsedData);
    return layer;
  } catch (err) {
    throw Error("KML not valid");
  }
}

async function kmzLoad(blobUrl, options, customLayer) {
  let layer = customLayer || L.geoJson(null, { ...options.layerOptions });

  const data = await readFileDataAsArrayBuffer(blobUrl);

  const parsedData = await kmzParse(data, options.parserOptions);

  try {
    layer.addData(parsedData);
    return layer;
  } catch (err) {
    throw Error("KMZ not valid");
  }
}

async function wktLoad(blobUrl, options, customLayer) {
  let layer = customLayer || L.geoJson(null, { ...options.layerOptions });

  const data = await readFileDataAsText(blobUrl);

  const parsedData = wktParse(data, options.parserOptions);

  try {
    layer.addData(parsedData);
    return layer;
  } catch (err) {
    throw Error("WKT not valid");
  }
}

async function polylineLoad(blobUrl, options, customLayer) {
  let layer = customLayer || L.geoJson(null, { ...options.layerOptions });

  const data = await readFileDataAsText(blobUrl);

  const parsedData = polylineParse(data, options.parserOptions);

  try {
    layer.addData(parsedData);
    return layer;
  } catch (err) {
    throw Error("Polyline not valid");
  }
}

async function shapefileLoad(blobUrl, options, customLayer) {
  let layer = customLayer || L.geoJson(null, { ...options.layerOptions });

  const data = await readFileDataAsArrayBuffer(blobUrl);

  const parsedData = await shpParse(data);

  try {
    layer.addData(parsedData);
    return layer;
  } catch (err) {
    throw Error("Shapefile not Valid");
  }
}
