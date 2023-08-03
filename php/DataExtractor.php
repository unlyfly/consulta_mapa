<?php
require __DIR__ . '/../vendor/autoload.php';
// Include PHPGeo library
use Location\Coordinate;
use Location\Polygon;

// Read and process geospatial data into a GeoPandas DataFrame (assuming you already have this step)
function connectToDB() {

    $dotenv = Dotenv\Dotenv::createImmutable(__DIR__. '/../config/');
    $dotenv->load();

    $host = $_ENV['DB_HOST'];
    $port = $_ENV['DB_PORT'];
    $dbname = $_ENV['DB_NAME'];
    $username = $_ENV['DB_USER'];
    $password = $_ENV['DB_PASSWORD'];

    $db = pg_pconnect("host=$host port=$port dbname=$dbname user=$username password=$password");
    if(!$db) {
        return false;
    } else {
        return $db;
    }
}

//Connect to data base
$db = connectToDB(); 

// Get the selected coordinates from the AJAX request
$data = json_decode(file_get_contents('php://input'), true);
$polygonCoords = $data['geom'];

// Convert the polygon coordinates to PHPGeo Polygon object
$polygon = new \Location\Polygon($polygonCoords);

// Assuming you have established a connection to your PostgreSQL database
// Perform the spatial selection of points from the PostgreSQL table
// Replace 'your_table_name' with the actual name of your points table, and 'geom' with the name of the geometry column
$query = "SELECT * FROM servicios.luminarias_2021 WHERE ST_Within(geom, ST_GeomFromText('" . $polygon->toWKT() . "'))";
$result = pg_query($db, $query);



$features = array();

// Convert the selected points to GeoJSON features
while ($row = pg_fetch_assoc($result)) {
  $point = new \Location\Coordinate\LatLng($row['latitude'], $row['longitude']);
  $feature = array(
    'type' => 'Feature',
    'geometry' => json_decode($point->toGeoJSON()),
    'properties' => array(), // Add properties as needed
  );
  array_push($features, $feature);
}

// Create a GeoJSON FeatureCollection
$geojson = array(
  'type' => 'FeatureCollection',
  'features' => $features,
);

// Return the GeoJSON as a JSON response
header('Content-Type: application/json');
echo json_encode($geojson);
?>