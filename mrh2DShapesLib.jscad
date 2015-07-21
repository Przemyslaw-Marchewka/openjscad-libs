/* Construct an ellipse
Netfab status: valid
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

/* Construct a heart
Netfab status: not valid but repairable!
options:
  center: a 2D center point
  sideSize: a scalar
  resolution: number of sides per 360 degree rotation
  sizeToRadiousRatio: allows to control size of circles creating heart shape
  clipping: a scalar that can be used for preparing clipped version of the shape
returns a CAG object
*/
heart = function heart(options) {
	options = options || {};
	var center = CSG.parseOptionAs2DVector(options, "center", [0, 0]);
	var sideSize = CSG.parseOptionAsFloat(options, "sideSize", 1);
	var resolution = CSG.parseOptionAsInt(options, "resolution", CSG.defaultResolution2D);
	var sizeToRadiousRatio = CSG.parseOptionAsFloat(options, "sizeToRadiousRatio", 0.45);
	var clipping = CSG.parseOptionAsFloat(options, "clipping", 0);
	
	var sides = [];
	var leftSide = new CSG.Vector2D(1, 0).times(sideSize);
	var rightSide = new CSG.Vector2D(0, 1).times(sideSize);
	var leftCircleStart = center.plus(leftSide).plus(rightSide.times(sizeToRadiousRatio));
	var rightCircleStart = center.plus(rightSide).plus(leftSide.times(sizeToRadiousRatio));
	
	var startVertex = new CAG.Vertex(center.plus(new CSG.Vector2D(clipping, clipping)));
	var leftSideVertex = new CAG.Vertex(leftSide.plus(center).plus(new CSG.Vector2D(0, clipping)));
	var rightSideVertex = new CAG.Vertex(rightSide.plus(center).plus(new CSG.Vector2D(clipping, 0)));
	var leftCircleStartVertex = new CAG.Vertex(leftCircleStart);
	var rightCircleStartVertex = new CAG.Vertex(rightCircleStart);
	
	sides.push(new CAG.Side(startVertex, leftSideVertex));
	sides.push(new CAG.Side(leftSideVertex, leftCircleStartVertex));
	sides.push(new CAG.Side(leftCircleStartVertex, rightCircleStartVertex));
	sides.push(new CAG.Side(rightCircleStartVertex, rightSideVertex));
	sides.push(new CAG.Side(rightSideVertex, startVertex));
	
	var radious = sideSize * sizeToRadiousRatio - clipping;
	var leftCircle = CAG.circle({center: [leftCircleStart._x, leftCircleStart._y], radius: radious});
	var rightCircle = CAG.circle({center: [rightCircleStart._x, rightCircleStart._y], radius: radious});
	return CAG.fromSides(sides).union(leftCircle).union(rightCircle);
};

/* Construct a heart using only vertices
Netfab status: not valid but repairable!
options:
  center: a 2D center point
  sideSize: a scalar
  resolution: number of sides per 360 degree rotation
  sizeToRadiousRatio: allows to control size of circles creating heart shape
returns a CAG object
*/
heartNative = function heartNative(options) {
	options = options || {};
	var center = CSG.parseOptionAs2DVector(options, "center", [0, 0]);
	var sideSize = CSG.parseOptionAsFloat(options, "sideSize", 1);
	var resolution = CSG.parseOptionAsInt(options, "resolution", CSG.defaultResolution2D);
	var sizeToRadiousRatio = CSG.parseOptionAsFloat(options, "sizeToRadiousRatio", 0.45);
	
	var sides = [];
	var axisX = new CSG.Vector2D(1, 0);
	var axisY = new CSG.Vector2D(0, 1);
	var leftSide = axisX.times(sideSize);
	var rightSide = axisY.times(sideSize);
	var startVertex = new CAG.Vertex(center);
	var leftSideVertex = new CAG.Vertex(leftSide.plus(center));
	var rightSideVertex = new CAG.Vertex(rightSide.plus(center));
	sides.push(new CAG.Side(startVertex, leftSideVertex));
	
	var radious = sideSize * sizeToRadiousRatio;
	
	//calculate angle to cross point
	var angleCos = sqrt(2*sideSize*sideSize-4*sideSize*radious+2*radious*radious)/(2*radious);
	var crossPointAngle = 45 * Math.PI / 180 - Math.acos(angleCos);
	
	var prevvertex = leftSideVertex;
	var start = -resolution/2;
	var end = resolution/2;
	var radians = Math.PI * start / resolution;	
	
	var crossPointRadians = Math.PI * end / resolution + crossPointAngle;
	
	var leftCircleStart = center.plus(leftSide).plus(rightSide.times(sizeToRadiousRatio));
	for (var i = start; radians < crossPointRadians; i++) {
		radians = Math.PI * i / resolution;
		var out = axisX.times(radious * Math.cos(radians)).plus(axisY.times(radious * Math.sin(radians)));
		var point = leftCircleStart.plus(out);
		var vertex = new CAG.Vertex(point);
		if (radians < crossPointRadians) {
			if (prevvertex.pos._x !== vertex.pos._x || prevvertex.pos._y !== vertex.pos._y) { // avoid duplicate
				sides.push(new CAG.Side(prevvertex, vertex));
			}
			prevvertex = vertex;
		}
	}
	
	// cross point
	var out = axisX.times(radious * Math.cos(crossPointRadians)).plus(axisY.times(radious * Math.sin(crossPointRadians)));
	var point = leftCircleStart.plus(out);
	var vertex = new CAG.Vertex(point);
	sides.push(new CAG.Side(prevvertex, vertex));
	prevvertex = vertex;
	
	start = -resolution/8; // 45 degrees
	end = resolution - 1;
	
	crossPointRadians = - crossPointAngle;
	radians = Math.PI * start / resolution;
	
	var rightCircleStart = center.plus(rightSide).plus(leftSide.times(sizeToRadiousRatio));
	for (var i = start; i <= end; i++) {
		radians = Math.PI * i / resolution;
		var out = axisX.times(radious * Math.cos(radians)).plus(axisY.times(radious * Math.sin(radians)));
		var point = rightCircleStart.plus(out);
		var vertex = new CAG.Vertex(point);
		
		if (radians > crossPointRadians) {
			if (prevvertex.pos._x !== vertex.pos._x || prevvertex.pos._y !== vertex.pos._y){ // avoid duplicate
				sides.push(new CAG.Side(prevvertex, vertex));
			}
			prevvertex = vertex;
		}
	}
	
	sides.push(new CAG.Side(prevvertex, rightSideVertex));
	sides.push(new CAG.Side(rightSideVertex, startVertex));
	return CAG.fromSides(sides);
};
	
	