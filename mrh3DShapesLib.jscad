// -- common functions --

// this function is setting default parameter values if required parameter is not specifies 
function setDefaults(params, paramsMetadataFunction) {
	var paramsMetadata = paramsMetadataFunction();
	paramsMetadata.forEach(function(param) {
		if (params[param.name]) {
			OpenJsCad.log('Parameter: ' + param.name + ' value: ' + params[param.name]);
		} else {
			OpenJsCad.log('Parameter: ' + param.name + ' not defined setting default: ' + param.default);
			params[param.name] = param.default;
		}
	});
}

// -- shapes --

// parameters metadata for flower
flowerParamsMetadata = function getParameterDefinitions() {
  return [
    { name: 'thickness', caption: 'Thickness [mm]:', type: 'float', default: 1 },
    { name: 'petalsWidth', caption: 'Petals width [mm]:', type: 'float', default: 10 },
	{ name: 'petalsNumber', caption: 'Petals number [mm]:', type: 'int', default: 6 },
	{ name: 'petalsThickness', caption: 'Petals thickness [mm]:', type: 'float', default: 5 },
	{ name: 'centerSize', caption: 'Center size [mm]:', type: 'int', default: 2 },
	{ name: 'centerDistance', caption: 'Center distance [mm]:', type: 'int', default: 0 },
	{ name: 'resolution', caption: 'Resolution:', type: 'int', default: 32 },
	{ name: 'inclination_center', caption: 'Inclination to the center [°]:', type: 'int', default: 0 },
	
  ];
}

flower = function flower(params) {
	setDefaults(params, flowerParamsMetadata);
	var radiusStart = params.petalsWidth/2;
	var radiusEnd = radiusStart - sqrt(pow(params.thickness/cos(params.inclination_center),2) - pow(params.thickness,2));
	
	params.angle = 360 / params.petalsNumber;
	params.petalScaleY = params.petalsThickness / params.petalsWidth;
	var petals = [];
	var middlePart = CSG.cylinder({                      
				start: [0, 0, 0],
				end: [0, 0, params.thickness],
				radius: params.centerSize,                        
				resolution: params.resolution
			});
	var petal = ellipticCylinder({                      
				start: [0, 0, 0],
				end: [0, 0, params.thickness],
				radius: params.petalsWidth/2,
				radiusStart: [params.petalsWidth/2, params.petalsThickness/2 ],
				radiusEnd: [params.petalsWidth/2 - params.inclination_center, params.petalsThickness/2 - params.inclination_center],			
				resolution: params.resolution
			}).scale([1,1,1]).translate([params.petalsWidth/2 + params.centerDistance,0,0])
			
	for (var i = 0; i < params.petalsNumber ; i++) {
		petals.push(petal.rotateZ(params.angle*i));
	}
	return middlePart.union(petals);
}

// TODO - pull request to OpenJSCAD repository
ellipticCylinder = function ellipticCylinder(options) {
	var s = CSG.parseOptionAs3DVector(options, "start", [0, -1, 0]);
	var e = CSG.parseOptionAs3DVector(options, "end", [0, 1, 0]);
	var r = CSG.parseOptionAs2DVector(options, "radius", [1,1]);
	var rEnd = CSG.parseOptionAs2DVector(options, "radiusEnd", r);
	var rStart = CSG.parseOptionAs2DVector(options, "radiusStart", r);

	if((rEnd._x < 0) || (rStart._x < 0) || (rEnd._y < 0) || (rStart._y < 0) ) {
		throw new Error("Radius should be non-negative");
	}
	if((rEnd._x === 0 || rEnd._y === 0) && (rStart._x === 0 || rStart._y === 0)) {
		throw new Error("Either radiusStart or radiusEnd should be positive");
	}

	var slices = CSG.parseOptionAsInt(options, "resolution", CSG.defaultResolution2D);
	var ray = e.minus(s);
	var axisZ = ray.unit(); //, isY = (Math.abs(axisZ.y) > 0.5);
	var axisX = axisZ.randomNonParallelVector().unit();

	//  var axisX = new CSG.Vector3D(isY, !isY, 0).cross(axisZ).unit();
	var axisY = axisX.cross(axisZ).unit();
	var start = new CSG.Vertex(s);
	var end = new CSG.Vertex(e);
	var polygons = [];

	function point(stack, slice, radius) {
		var angle = slice * Math.PI * 2;
		var out = axisX.times(radius._x * Math.cos(angle)).plus(axisY.times(radius._y * Math.sin(angle)));
		var pos = s.plus(ray.times(stack)).plus(out);
		return new CSG.Vertex(pos);
	}
	for(var i = 0; i < slices; i++) {
		var t0 = i / slices,
			t1 = (i + 1) / slices;
		
		if(rEnd._x == rStart._x && rEnd._y == rStart._y) {
			polygons.push(new CSG.Polygon([start, point(0, t0, rEnd), point(0, t1, rEnd)]));
			polygons.push(new CSG.Polygon([point(0, t1, rEnd), point(0, t0, rEnd), point(1, t0, rEnd), point(1, t1, rEnd)]));
			polygons.push(new CSG.Polygon([end, point(1, t1, rEnd), point(1, t0, rEnd)]));
		} else {
			if(rStart._x > 0) {
				polygons.push(new CSG.Polygon([start, point(0, t0, rStart), point(0, t1, rStart)]));
				polygons.push(new CSG.Polygon([point(0, t0, rStart), point(1, t0, rEnd), point(0, t1, rStart)]));
			}
			if(rEnd._x > 0) {
				polygons.push(new CSG.Polygon([end, point(1, t1, rEnd), point(1, t0, rEnd)]));
				polygons.push(new CSG.Polygon([point(1, t0, rEnd), point(1, t1, rEnd), point(0, t1, rStart)]));
			}
		}
	}
	var result = CSG.fromPolygons(polygons);
	result.properties.cylinder = new CSG.Properties();
	result.properties.cylinder.start = new CSG.Connector(s, axisZ.negated(), axisX);
	result.properties.cylinder.end = new CSG.Connector(e, axisZ, axisX);
	result.properties.cylinder.facepoint = s.plus(axisX.times(rStart));
	return result;
};