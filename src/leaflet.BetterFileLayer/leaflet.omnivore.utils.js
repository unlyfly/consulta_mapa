function readFileDataAsText(blobUrl) {
  return fetch(blobUrl)
    .then((response) => response.blob())
    .then((blob) => blob.text())
    .catch((err) => null);
}

function readFileDataAsArrayBuffer(blobUrl) {
  return fetch(blobUrl)
    .then((response) => response.blob())
    .then((blob) => blob.arrayBuffer())
    .catch((err) => null);
}

function parseXML(str) {
  if (typeof str === 'string') {
    return (new DOMParser()).parseFromString(str, 'text/xml');
  }
  return str;
}
