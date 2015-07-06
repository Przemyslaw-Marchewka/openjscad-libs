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
	{ name: 'resolution', caption: 'Resolution:', type: 'int', default: 32 }
  ];
}

flower = function flower(params) {
	setDefaults(params, flowerParamsMetadata);
	params.angle = 360 / params.petalsNumber;
	params.petalScaleY = params.petalsThickness / params.petalsWidth;
	var petals = [];
	var middlePart = CSG.cylinder({                      
				start: [0, 0, 0],
				end: [0, 0, params.thickness],
				radius: params.centerSize,                        
				resolution: params.resolution
			});
	var petal = CSG.cylinder({                      
				start: [0, 0, 0],
				end: [0, 0, params.thickness],
				radius: params.petalsWidth/2,                        
				resolution: params.resolution
			}).scale([1,params.petalScaleY,1]).translate([params.petalsWidth/2 + params.centerDistance,0,0])
			
	for (var i = 0; i < params.petalsNumber ; i++) {
		petals.push(petal.rotateZ(params.angle*i));
	}
	return middlePart.union(petals);
}