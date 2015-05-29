<?php
if (!defined('WEBROOT'))
	exit;
use \ace\Ace;

$files = scandir(__DIR__);
$imgs = array();
foreach ($files as $file) {
	if (strpos($file,'.png') !== false)
		$imgs[] = '/democ/'.$file;
}
/*usort($imgs,function($a,$b){
	return filemtime(WEBROOT.$a) - filemtime(WEBROOT.$b);
});*/

?><!doctype html>
<html>
<head>
<meta charset="utf-8" />
<title>Demo</title>
<link rel="stylesheet" type="text/css" href="/assets/reset.css" />
<script src="/assets/jquery.1.8.min.js"></script>
<link rel="stylesheet" type="text/css" href="/democ/slick.css" />
<script src="/democ/slick.min.js"></script>
<!--<link rel="stylesheet" type="text/css" href="/ace.css" />
<script src="/ace.js"></script>
-->
<script>
$(function(){
	//if (ace.chat.$.cont) ace.chat.$.cont.remove();
	$('#cont').slick();
});
</script>

<style type="text/css">
body {
	font-family: Helvetica,arial,sans-serif;
}
#cont div {
	text-align: center;
}
#cont div img {
	display: inline-block;
}
</style>

</head>
<body>

<div id="cont">
<?php
foreach ($imgs as $img)
	echo '<div><img src="'.$img.'" /></div>';
?>
</div>

</body>
</html>