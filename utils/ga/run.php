#!/usr/bin/env php
<?php

/*
php -qn -d memory_limit=2048M run.php
*/


$pageKey = 0;
$visitKey = 1;
$bounceRateKey = 5;
ini_set('auto_detect_line_endings',true);


sep();
$rows = array();
$files = scandir('.');
foreach ($files as $file) {
    if (!preg_match('/\.csv$/',$file)) {
        continue;
    }
    echo "parsing: $file\n";
    $rows = array_merge($rows,$r=parse($file));
    echo "num rows: ".count($r)."\n";
}
sep();
echo "total rows: ".count($rows)."\n";
sep();


$byPage = array();
$bySmartPage = array();
$byAid = array();

foreach ($rows as $row) {
    $page = parsePage($row[$pageKey]);
    $smartPage = parseSmartPage($page);
    $aid = parseQs($row[$pageKey], 'aid');
    $visits = intval($row[$visitKey]);
    $bounceRate = floatval($row[$bounceRateKey])/100;
    $rate = array($bounceRate, $visits);

    if (strpos($page,'"') !== false) {
        echo "skipping, weird page: ".$row[$pageKey]." ".json_encode($rate)."\n";
        continue;
    }

    if (!isset($byPage[$page])) {
        $byPage[$page] = array();
    }
    $byPage[$page][] = $rate;

    if (!isset($bySmartPage[$smartPage])) {
        $bySmartPage[$smartPage] = array();
    }
    $bySmartPage[$smartPage][] = $rate;

    if ($aid && !isset($byAid[$aid])) {
        $byAid[$aid] = array();
    }
    $byAid[$aid][] = $rate;
}

sep();
echo 'num by page: '.count($byPage)."\n";
echo 'num by smart page: '.count($bySmartPage)."\n";
echo 'num by aid: '.count($byAid)."\n";
sep();

calc($byPage);
calc($bySmartPage);
calc($byAid);
if (!is_dir('./out')) {
    mkdir('./out');
}
makeCsv('page', './out/by_page.csv', $byPage);
makeCsv('smart_page', './out/by_smart_page.csv', $bySmartPage);
makeCsv('aid', './out/by_aid.csv', $byAid);

sep();
echo "done\n";


function makeCsv($key, $file, $data) {
    $lines = array();
    foreach ($data as $k => $row) {
        if (!isset($lines[0])) {
            $keys = array_keys($row);
            array_unshift($keys, $key);
            $lines[] = implode(',',$keys);
        }
        $line = array_values($row);
        array_unshift($line, $k);
        $lines[] = implode(',',$line);
    }
    file_put_contents($file,implode("\n", $lines));
}

function calc(&$data) {
    foreach ($data as $k => $rates) {
        $tally = 0;
        $visits = 0;
        foreach ($rates as $rate) {
            $tally += $rate[0]*$rate[1];
            $visits += $rate[1];
        }
        if (!$visits) {
            echo "skipping, no visits for: $k => ".json_encode($rates)."\n";
            unset($data[$k]);
            continue;
        }
        $data[$k] = array(
            'visits' => $visits,
            'bounce_rate' => $tally/$visits,
            'aggregated_from' => count($rates),
        );
    }
}

function parse($file) {
    $relevant = array();
    $lines = explode("\n",file_get_contents($file));
    $skippedKeys = false;
    for ($i=0,$c=count($lines);$i<$c;$i++) {
        $line = explode(',',$lines[$i]);
        if (!isset($line[5])) {
            continue;
        } else if (!$skippedKeys) {
            $skippedKeys = true;
            continue;
        } else if (empty($line[0])) {
            break;
        }
        $relevant[] = $line;
    }
    return $relevant;
}

function parsePage($url) {
    if (!preg_match('/^(https?:\/\/)|(\/\/)/i',$url)) {
        $url = "http://$url";
    }
    if (!($p = parse_url($url)) || empty($p['host'])) {
        return null;
    }
    $page = $p['host'];
    if (preg_match('/^[a-z]+\.[a-z]+$/i',$page)) {
        $page = "www.$page";
    }
    $page .= isset($p['path']) ? $p['path'] : '';
    $page = rtrim($page,'/');
    return strtolower($page);
}

function parseSmartPage($page) {
    if (!$page) {
        return 'unparseable_url';
    }
    if (preg_match('/\/collections\//', $page) || preg_match('/\/showroom\/.+/', $page)) {
        return 'collection';
    }
    if (preg_match('/\/fbbib\/shop\/?/', $page)) {
        return 'fb_shop';
    }
    if (preg_match('/\/jewelry\/.+/', $page) || preg_match('/\/catalog\/product\/view\/.+/', $page)) {
        return 'product';
    }
    if (preg_match('/fbbib\/product\/.+/', $page)) {
        return 'fb_product';
    }
    if (preg_match('/\/invite\/.+/', $page)) {
        return 'invite';
    }
    if (preg_match('/\/profile\/.+/', $page)) {
        return 'profile';
    }
    if (preg_match('/\/fbbib\/user\/.+/', $page)) {
        return 'fb_profile';
    }
    if (preg_match('/guide\./', $page)) {
        return 'guide';
    }
    if (preg_match('/scion/', $page)) {
        return 'scion';
    }
    return $page;
}

function parseQs($url, $var) {
    if (strpos($url ,$var) === false) {
        return null;
    }
    if (!($p = parse_url($url)) || empty($p['query'])) {
        return null;
    }
    $qsa = explode('&',$p['query']);
    foreach ($qsa as $qs) {
        $qs = explode('=',$qs);
        if (isset($qs[0]) && $qs[0] == $var) {
            return isset($qs[1]) ? $qs[1] : '';
        }
    }
    return null;
}

function sep() {
    echo "--------------------------------------\n";
}
