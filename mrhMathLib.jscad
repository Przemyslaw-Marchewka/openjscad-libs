get2DPoint = function get2DPoint(radious, angle) {
	var result = {};
	var signX = angle > 90 && angle < 270 ? -1 : 1;
	result.y = radious * sin(angle);
	result.x = sqrt(pow(radious, 2) - pow(result.y, 2)) * signX;
	OpenJsCad.log('get2DPoint( radious: ' + radious + ', angle: ' + angle + ') Result: [' + result.x + ', ' + result.y + ']');
	return result;
}

