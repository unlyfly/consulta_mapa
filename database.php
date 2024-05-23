<?php
function connectToDB($database) {

    $dotenv = Dotenv\Dotenv::createImmutable(__DIR__. '/config');
    $dotenv->load();

    $host = $_ENV['DB_HOST'];
    $port = $_ENV['DB_PORT'];
    $dbname = $_ENV['DB_NAME'];
    $username = $_ENV['DB_USER'];
    $password = $_ENV['DB_PASSWORD'];

    $db = pg_pconnect("host=$host port=$port dbname=$database user=$username password=$password");
    if(!$db) {
        return false;
    } else {
        return $db;
    }
}
?>