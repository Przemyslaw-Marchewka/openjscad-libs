/* Construct an ellipse
options:
  center: a 2D center point
  radiusX: a scalar
  radiusY: a scalar
  resolution: number of sides per 360 degree rotation
returns a CAG object
*/
ellipse = function ellipse(options) {
	options = options || {};
	var center = CSG.parseOptionAs2DVector(options, "center", [0, 0]);
	var radiusX = CSG.parseOptionAsFloat(options, "radiusX", 1);
	var radiusY = CSG.parseOptionAsFloat(options, "radiusY", 1);
	var resolution = CSG.parseOptionAsInt(options, "resolution", CSG.defaultResolution2D);
	var sides = [];
	var axisX = new CSG.Vector2D(1, 0);
	var axisY = new CSG.Vector2D(0, 1);
	var prevvertex;
	for (var i = 0; i <= resolution; i++) {
		var radians = 2 * Math.PI * i / resolution;
		var out = axisX.times(radiusX * Math.cos(radians)).plus(axisY.times(radiusY * Math.sin(radians)));
		var point = center.plus(out);
		var vertex = new CAG.Vertex(point);
		if (i > 0) {
			sides.push(new CAG.Side(prevvertex, vertex));
		}
		prevvertex = vertex;
	}
	return CAG.fromSides(sides);
};