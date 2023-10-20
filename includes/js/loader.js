// Funcion para mostrar el loader
function showLoadingScreen() {
  document.getElementById("loader").style.display = "block";
}

// Ocultar el loader
function hideLoadingScreen() {
  document.getElementById("loader").style.display = "none";
}

// Simulate a process that takes some time
function simulateProcess(geoJSON, funcion) {
  showLoadingScreen();
  setTimeout(function () {
    funcion(geoJSON);
    hideLoadingScreen();
  }, 500);
}