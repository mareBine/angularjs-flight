<?php

// db config
$username = 'root';
$password = 'redhat';
$host = '127.0.0.1';
$database = 'bwd_2013';
$port = 3306;
$method = 'POST';

require 'flight/Flight.php';

function get_string_between($string, $start, $end)
{
    $string = " " . $string;
    $ini = strpos($string, $start);
    if ($ini == 0) return "";
    $ini += strlen($start);
    $len = strpos($string, $end, $ini) - $ini;
    return substr($string, $ini, $len);
}

/*
 * DB (prek PDO)
 */
Flight::register('db', 'PDO', array('mysql:host=' . $host . ';port=' . $port . ';dbname=' . $database, $username, $password));

$db = Flight::db();
$db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
$db->exec("SET NAMES utf8");        // to mora bit da pravilno dela UTF8 znaki


/**
 * bwd: za dobit all samples
 */
Flight::route($method . ' /allsamples', function () {

        // dobi id preko jsona {"id": "12"}
        //$cc = Flight::request()->data->cc;
        //var_dump( Flight::request()->data );
        $tableData = array();

        $cc = "";

        $orderBy = "";
        $orderDir = "";
        $filterBy = "";
        $filterVal = "";

        // razbije spr. za sortiranje, filtre
        foreach (Flight::request()->data as $key => $val) {
            if (strpos($key, 'sorting') !== false) {
                $orderBy = get_string_between($key, '[', ']');
                $orderDir = $val;
            }
            if (strpos($key, 'filter') !== false) {
                if(strpos($key, 'cc') !== false) {
                    $cc = $val;
                } else {
                   $filterBy = get_string_between($key, '[', ']');
                   $filterVal = $val;
                }
            }
        }

        // 1: 0,count
        // 2: count, count
        // 3: count*(page-1)
        $limit = Flight::request()->data->count;
        $start = (Flight::request()->data->page - 1) * $limit;

        //echo "start: "  . $start . "  limit: " . $limit;

        $db = Flight::db();

        try {

            //if ($cc != "") {
                $sql_select = "
                    SELECT *
                ";

                $sql_count = "
                    SELECT COUNT(*) AS count
                ";

                $sql = "
                    FROM bwd_newd_all_samples
                    WHERE 1
                ";

                if($cc != "") {
                    $sql .= "
                        AND cc = :cc
                    ";
                }

                if($filterBy != '') {
                    // AND " . $filterBy . " LIKE '%" . $filterVal . "%'
                    $sql .= "
                        AND " . $filterBy . " LIKE :filterval
                    ";
                }

                if ($orderBy != '') {
                    $sql .= "
                        ORDER BY " . $orderBy . " " . $orderDir . "
                    ";
                }

                $sql_limit = "
                    LIMIT :limit
                    OFFSET :start
                ";

//            } else {
//                $sql_select = "";
//                $sql_count = "";
//                $sql_limit = "";
//                $sql = "SELECT 0";
//            }

            $stmt = $db->prepare($sql_select . $sql . $sql_limit);
            if($cc != "")           $stmt->bindValue(':cc', $cc, PDO::PARAM_STR);
            if($filterBy != "")     $stmt->bindValue(':filterval', "%".$filterVal."%", PDO::PARAM_STR);
            $stmt->bindValue(':start', (int)$start, PDO::PARAM_INT);
            $stmt->bindValue(':limit', (int)$limit, PDO::PARAM_INT);
            $stmt->execute();

            // debug
            $stmt->debugDumpParams();

            $result = $stmt->fetchAll(PDO::FETCH_ASSOC);

            $tableData['columns'] = empty($result) ? 0 : array_keys($result[0]);
            $tableData['data'] = $result;

            // dodam še štetje vseh zapisov
            $stmt2 = $db->prepare($sql_count . $sql);
            if($cc != "")           $stmt2->bindValue(':cc', $cc, PDO::PARAM_STR);
            if($filterBy != '')     $stmt2->bindValue(':filterval', '%'.$filterVal.'%');
            $stmt2->execute();

            $result = $stmt2->fetch(PDO::FETCH_ASSOC);
            $tableData['total'] = (int)$result['count'];

            echo(Flight::json($tableData));

        } catch (PDOException $e) {
            echo '<pre>' . $e->getTraceAsString();
            echo '<br>Error: ' . $e->getMessage();
        }

    });


/**
 * get all countries
 */
Flight::route($method . ' /countries', function () {

        $db = Flight::db();

        try {
            $sql = "SELECT DISTINCT(cc) AS id, cc AS title  FROM bwd_newd_all_samples";
            $stmt = $db->query($sql);

            echo(Flight::json($stmt->fetchAll(PDO::FETCH_ASSOC)));

        } catch (PDOException $e) {
            echo '<pre>' . $e->getTraceAsString();
            echo '<br>Error: ' . $e->getMessage();
        }

    });


Flight::start();
?>
