/*
winner: prog2, but not by much
[-16.683929,-65.080532,-10.645978,-55.601897] ~= 760
*/

SphericalDistance = Test.extend({
	runProgNTimes: 50000
	,progType: 'array'
	,preTest: function(){
		var points = []
		for (var i=0;i<100;++i) {
			points.push([
				90-Math.random()*180
				,180-Math.random()*360
				,90-Math.random()*180
				,180-Math.random()*360
			])
		}
		return points;
	}
	,prog1: function(point){
		var dr = Math.PI/180
		,lat1 = point[0]*dr
		,lng1 = point[1]*dr
		,lat2 = point[2]*dr
		,lng2 = point[3]*dr
		return 3956 * Math.acos(Math.cos(lat1)*Math.cos(lat2)*Math.cos(lng2-lng1)+Math.sin(lat1)*Math.sin(lat2))
	}
	,prog2: function(point){
		var dr = Math.PI/180
		,lat1 = point[0]*dr
		,lng1 = point[1]*dr
		,lat2 = point[2]*dr
		,lng2 = point[3]*dr
		,dlat = lat2-lat1
		,dlng = lng2-lng1
		return 3956 * 2 * Math.asin(Math.sqrt( Math.pow(Math.sin(dlat/2),2) + Math.cos(lat1) * Math.cos(lat2) * Math.pow(Math.sin(dlng/2),2) ))
	}
});
