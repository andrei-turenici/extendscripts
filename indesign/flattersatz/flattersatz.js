﻿#strict on
#target "InDesign";

(function () {
	var layerName = "R_R_Guides";

	if (app.documents.length === 0) {
		alert("open a document first");
		return;
	}

	var doc = app.activeDocument;

	init();

	var len = app.selection.length;
	if (len === 0) {
		alert("select a text frame first");
		return;
	}

	var flatterzone = 15; // %
	var randomness = 0; // %
	var w = new Window("dialog", "settings");
	w.orientation = "row";
	w.alignChildren = "top";

	var main_group = w.add("group");
	main_group.orientation = "row";

	var settings_group = main_group.add("group");
	settings_group.orientation = "column";

	var flatterzone_group = settings_group.add("group");
	flatterzone_group.orientation = "row";
	flatterzone_group.alignment = "right";
	flatterzone_group.add("statictext", undefined, "flatterzone:");
	var e = flatterzone_group.add("statictext", undefined, flatterzone + "%");
	e.characters = 4;
	var slider = flatterzone_group.add("slider", undefined, flatterzone, 0, 100);
	slider.onChanging = function () {
		e.text = slider.value + "%";
		flatterzone = parseInt(slider.value);
	};

	var randomness_group = settings_group.add("group");
	randomness_group.orientation = "row";
	randomness_group.alignment = "right";
	randomness_group.add("statictext", undefined, "randomness:");
	var e2 = randomness_group.add("statictext", undefined, randomness + "%");
	e2.characters = 4;
	var slider2 = randomness_group.add("slider", undefined, randomness, 0, 100);
	slider2.onChanging = function () {
		e2.text = slider2.value + "%";
		randomness = parseInt(slider2.value);
	};

	var btn_group = main_group.add("group");
	btn_group.orientation = "column";
	btn_group.add("button", undefined, "OK");
	btn_group.add("button", undefined, "Cancel");

	if (w.show() == 1) {
		// ok
	} else {
		// cancel
		return;
	}

	flatterzone *= 0.01;
	randomness *= 0.01;

	var myLayer = doc.layers.item(layerName);
	try {
		myLayerName = myLayer.name;
	} catch (myError) {
		var myLayer = doc.layers.add({ name: layerName });
	}

	// var textLayer = doc.layers.item('debug');
	// try {
	//   myLayerName = textLayer.name;
	// } catch (myError) {
	//   var textLayer = doc.layers.add({ name: 'debug' });
	// }

	for (var n = 0; i < len; n++) {
		var sel = app.selection[n];

		if (sel.constructor.name != "TextFrame") {
			alert("selection is not a text frame → ignoring it");
			continue;
		}

		var x = sel.geometricBounds[3];
		var y = sel.geometricBounds[0];
		var width = x - sel.geometricBounds[1];


		var cmToPointsRatio = 0.0352778;
		var pointsize = sel.insertionPoints.item(0).pointSize * cmToPointsRatio;
		var leading = sel.insertionPoints.item(0).leading * cmToPointsRatio;
		// var myTextFrame = sel.parent.textFrames.add(textLayer, undefined, undefined,{geometricBounds:[0, 0, 100, 100], contents: "Point size: " + pointsize + "/ Leading: " + leading}); 
		if (leading == Leading.AUTO) {
			leading = pointsize * 1.2;
		}

		for (var i = 0; i < sel.lines.length; i++) {
			var line_y = y + 0.5 * pointsize + i * leading;
			var flatter_width = width * flatterzone;
			var variance =
				randomness *
				flatter_width *
				(i % 2 == 0 ? Math.random() : (Math.random() - 0.5) * 2);
			var line = sel.parentPage.graphicLines.add(
				myLayer,
				undefined,
				undefined,
				{
					geometricBounds:
						i % 2 == 0
							? [line_y, x, line_y, x - variance]
							: [line_y, x, line_y, x - flatter_width + variance],
				}
			);

			line.textWrapPreferences.textWrapMode =
				TextWrapModes.BOUNDING_BOX_TEXT_WRAP;
			line.strokeColor = doc.swatches.itemByName("Paper");
			line.transparencySettings.blendingSettings.opacity = 0;
		}
	}

	done();
})();
