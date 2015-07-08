//Params:
// -resolution
// -radiousX
// -radiousY
ellipse = function ellipse(params) {
	params.resolution = 64;
	var points = [];
	
	for (var i = 0 ; i <= params.resolution ; i++) {
		var angle = 360/params.resolution * i;
		var rX = params.radiousX * cos(angle);
		var rY = params.radiousY * sin(angle);
		points[i] = [rX,rY,0];
	}
	return CSG.fromPolygons([CSG.Polygon.createFromPoints(points)]);
}
