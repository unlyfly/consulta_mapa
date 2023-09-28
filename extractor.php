<?php
require __DIR__ . '/vendor/autoload.php';
include ('database.php');

// Include Brick\Geo library
use GeoPHP\IO\WKB\Parser;
use GeoPHP\IO\GeoJSON\Encoder;
use GeoPHP\Feature\Geometry;
use Brick\Geo\IO\GeoJSONReader;
use Brick\Geo\IO\GeoJSONWriter;



//Connect to data base
$db = connectToDB(); 

// Get the selected coordinates from the AJAX request
$data = file_get_contents('php://input');
$geom = $_POST['geom'];
$capa = $_POST['capa'];

// Convert the data reseived in GeoJason to a Geometry
$reader = new GeoJSONReader();
$polygon = $reader->read($geom);

// echo $polygon->SRID();

$selectedGeom = $polygon->asText();

$query = "SELECT b.* FROM $capa as b, ST_GeomFromText('$selectedGeom') as a WHERE ST_Intersects(ST_GeomFromText('$selectedGeom', 4326), b.geom)";

$result = pg_query($db, $query);

$GeoJSON = array('type' => 'FeatureCollection', 'features' => array());

while ($row = pg_fetch_assoc($result)) {
    $properties = $row;
    # Remove geojson and geometry fields from properties
    unset($properties['geom']);

    $wkb = hex2bin($row['geom']);

    $point = geoPHP::load($wkb, 'wkb');

    // Convert the Point to GeoJSON
    $pointGeoJson = $point->out('json');

    // Convert the point data to an array and add to the selectedPoints array
    $feature = array(
        'type' => 'Feature',
        'geometry' => json_decode($pointGeoJson, true),
        'properties' => $properties
    );
    array_push($GeoJSON['features'], $feature);
}

// Return the GeoJSON as a JSON response
echo json_encode($GeoJSON);
?>