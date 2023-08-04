<?php
require __DIR__ . '/vendor/autoload.php';
include ('database.php');

// Include PHPGeo library
use Brick\Geo\LineString;
use Brick\Geo\Point;
use Brick\Geo\Polygon;
use Brick\Geo\IO\GeoJSONReader;
use Brick\Geo\IO\GeoJSONWriter;


//Connect to data base
$db = connectToDB(); 
print('Connection Succesful!');

// Get the selected coordinates from the AJAX request
$data = file_get_contents('php://input');

// Convert the data reseived in GeoJason to a Geometry
$reader = new GeoJSONReader();
$polygon = $reader->read($data);

$polygon->SRID(32611); /////  IMPORTANTE: INVESTIGAR PARA CAMBIAR SRID

echo $polygon->SRID();
// Convert Geometry to Text
$selectedGeom = $polygon->asText();


$query = "SELECT b.* FROM servicios.luminarias_2021 as b, ST_GeomFromText('$selectedGeom') as a WHERE ST_Contains(ST_GeomFromText('$selectedGeom'), b.geom)";

$result = pg_query($db, $query);

$selectedPoints = array();

while ($row = pg_fetch_assoc($result)) {
    // Convert the point data to an array and add to the selectedPoints array
    $point = array(
        'type' => 'Feature',
        'geometry' => json_decode($row['geom']),
        'properties' => array(
        // Add other properties as needed
        )
    );
    $selectedPoints[] = $point;
}

print json_encode($selectedPoints);

// Return the GeoJSON as a JSON response
// header('Content-Type: application/json');
echo json_encode(array('type' => 'FeatureCollection', 'features' => $selectedPoints));
?>