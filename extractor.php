<?php
require __DIR__ . '/vendor/autoload.php';
include ('database.php');

// Include Brick\Geo library
use GeoPHP\IO\WKB\Parser;
use GeoPHP\IO\GeoJSON\Encoder;
use GeoPHP\Feature\Geometry;
use Brick\Geo\IO\GeoJSONReader;
use Brick\Geo\IO\GeoJSONWriter;

// Get the selected coordinates from the AJAX request
$geom = $_POST['geom'] ?? null;
$capa = $_POST['capa'] ?? null;
$database = $_POST['db'] ?? null;

// Check if all required parameters are present
if (!$geom || !$capa || !$database) {
    echo json_encode(['error' => 'Missing parameters']);
    exit;
}

//Connect to database
$db = connectToDB($database);

if (!$db) {
    echo json_encode(['error' => 'Failed to connect to database']);
    exit;
}

// Convert the data received in GeoJson to a Geometry
$reader = new GeoJSONReader();
try {
    $polygon = $reader->read($geom);
} catch (Exception $e) {
    echo json_encode(['error' => 'Failed to parse geometry: ' . $e->getMessage()]);
    exit;
}

// Construct the query
$selectedGeom = $polygon->asText();
$query = "SELECT b.* FROM $capa as b WHERE ST_Intersects(ST_GeomFromText('$selectedGeom', 4326), b.geom)";

// Execute the query
$result = pg_query($db, $query);

if (!$result) {
    echo json_encode(['error' => 'Query failed: ' . pg_last_error($db)]);
    exit;
}

$GeoJSON = array('type' => 'FeatureCollection', 'features' => array());

while ($row = pg_fetch_assoc($result)) {
    $properties = $row;
    # Remove geojson and geometry fields from properties
    unset($properties['geom']);

    $wkb = hex2bin($row['geom']);

    try {
        $point = geoPHP::load($wkb, 'wkb');
    } catch (Exception $e) {
        echo json_encode(['error' => 'Failed to load geometry: ' . $e->getMessage()]);
        exit;
    }

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
