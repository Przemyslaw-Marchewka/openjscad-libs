// TODO: To be removed - replace it with CSG.Vector2D.fromAngleDegrees
get2DPoint = function get2DPoint(radious, angle) {
	var result = {};
	var signX = angle > 90 && angle < 270 ? -1 : 1;
	result.y = radious * sin(angle);
	result.x = sqrt(pow(radious, 2) - pow(result.y, 2)) * signX;
	OpenJsCad.log('get2DPoint( radious: ' + radious + ', angle: ' + angle + ') Result: [' + result.x + ', ' + result.y + ']');
	return result;
}

// alpha - angle measured from X axis towards Y [degrees]
// beta - angle measured from Y axis towards Z axis [degrees]
// radious - vector length
get3DVector = function get3DVector(radious, alpha, beta) {
	var x  = radious * cos(beta) * sin(alpha);
	var y = radious * cos(beta) * cos(alpha);
	var z = radious * sin(beta);
	return CSG.Vector3D.Create(x,y,z);
}

get3DVectorUnitTest = function get3DVectorUnitTest(params) {
	var r  = [];
	var cube = CSG.cube({
		  center: [0, 0, 0],
		  radius: 0.1
		});
	r.push(cube);
	var angles = [];
	for (var i = 0 ; i < 360 ; i++) {
		for (var j = 0 ; j < 180 ; j += 10) {
			angles.push([i, j]);
		}
	}
	for (var i = 0 ; i < 360 ; i += 10) {
		for (var j = 0 ; j < 180 ; j += 1) {
			angles.push([i, j]);
		}
	}
	
	angles.forEach(function (a) {
		var vector =  get3DVector(5, a[0], a[1]);
		var cube = CSG.cube({
		  center: [vector._x, vector._y, vector._z],
		  radius: 0.02
		});
		r.push(cube);
	});
	
	return r;
}

