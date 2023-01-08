function wbDebug(msg) {
	if (debugging) {
		console.log(msg)
	}	
}

function wbApplySettings() {
	wbDebug("setting width")

	// if ContentType not like text/something, do not set width
	if (document.contentType.match("text/.*") == null) {
		return;
	}

	url = window.location.host
	chrome.storage.sync.get([url], function(result) {

		// check if there are stored settings for the current host
		if (result != undefined) {
			let activated = result[url]["activated"];
			let width = result[url]["width"];
			let method = result[url]["method"];
			if (activated & width < window.innerWidth) {
				wbSetWidth(method, width);
				// wbJumpToAnchor();
			} else {
				wbSetOriginalStyle();
			}
		}
	});
}

function wbJumpToAnchor() {
	wbDebug("jumping to anchor")
	// Check url and split on hash sign
	url = window.location.href;
	if ( url.split("#").length == 2 ) {
		window.location = "#" + url.split("#")[1];
	}
	wbDebug("jumped to anchor")
}

function wbSetWidth(method, width) {
	// to be filled later with logic when iframe width is implemented
	wbSetWidthCss(method, width);
}

function wbSetWidthCss(method, width) {
	// set the width of the page using CSS adjustments
	wbDebug("setting width using CSS")

	url = window.location.host;
	rules = wbGetCssRules(url, width);
	customCssRules = rules.map(r => r.rules);

	if (method == "automatic") {
		// select the preferred method
		preferred = rules.map(r => r.preferred).filter(p => p != undefined);

		if (preferred.length > 0) {
			// if we have a preferred method, use it
			wbDebug("preferred method: " + preferred[0])
			wbApplyCssRules(preferred[0], width, customCssRules);
		} else {
			// else use absolute positioning
			wbDebug("no preferred method, using absolute positioning")
			wbApplyCssRules("absolute", width, customCssRules);
		}
	} else {
		// use the method selected by the user and don't apply any custom rules
		wbApplyCssRules(method, width, []);
	}

	wbDebug("width set using CSS")
}

function wbApplyCssRules(method, width, cssRules) {
	// apply the CSS rules to the page
	// method is which method to use (currently only "absolute" is supported)
	// width is target width selected by the user
	// cssRules is an array of custom rules to apply (see createStylesheet for details)

	wbDebug("applying css rules")

	cssRulesAbsolute = {
		"html": {
			"position": "absolute",
			"width": `${width}px`,
			"left": `${(window.innerWidth - width)/2}px`
		}
	}

	cssRulesRelative = {
		"html": {
			"position": "relative",
			"width": `${width}px`,
			"left": `${(window.innerWidth - width)/2}px`
		}
	}

	cssRulesMargin = {
		"html": {
			"width": `${width}px`,
			"margin-left": "auto",
			"margin-right": "auto"
		}
	}

	switch (method) {
		case "absolute":
			cssRules.push(cssRulesAbsolute);
			break;
		case "relative":
			cssRules.push(cssRulesRelative);
			break;
		case "margin":
			cssRules.push(cssRulesMargin);
			break;
	}

	styleStr = createStylesheet(cssRules);

	wbDebug(styleStr);

	// remove any existing stylesheets
	wbRemoveStylesheet();

	// create a new stylesheet and inject it into <head>
	style = document.createElement("style");
	style.setAttribute("id", "wbStyle");
	style.innerHTML = styleStr;
	document.head.appendChild(style);

	wbDebug("css rules applied")
}

function createStylesheet(rules) {
	// create a CSS stylesheet from a set of rules
	// rules is an array of objects, each of which has a selector and a set of CSS properties
	// rules = [
	// 	{
	// 		".class": {
	// 			"margin-right": "100px",
	// 			"left": "100px"
	// 		},
	// 		"div.id": {
	// 			"margin-left": "-100px",
	// 		},
	// 	 },
	// ]
	
	styleStr = "";

	rules.forEach(rule => {
		Object.keys(rule).forEach(selector => {
			// add the selector
			styleStr += selector + " {";

			// for each CSS property listed, add it to the style string "property: value;"
			Object.keys(rule[selector]).forEach(property => {
				styleStr += property + ": " + rule[selector][property] + "; ";
			})

			// close the selector
			styleStr += "} "
		})
	})

	return styleStr;
}

// restore the original style of the page
function wbSetOriginalStyle() {
	wbDebug("setting original style")
	wbRemoveStylesheet();
}

// remove the custom stylesheet set by the extension
function wbRemoveStylesheet() {
	wbDebug("removing wb stylesheet")
	style = document.getElementById("wbStyle");
	if (style != null) {
		style.remove();
	}
}

// Add listener for changes to the width through the popup
chrome.runtime.onMessage.addListener(
	function(request, sender, sendResponse) {
		if (request.action == "update") {
			wbApplySettings();
		}
		// we send a response to the popup to let it know that the width has been updated
		// if no response is sent, the popup will instead reload the page
		// (this happens when the extension has just been installed and the content script has not been injected yet)
		sendResponse({response: "roger"});
});

// Add event listener for setting original CSS when resizing window or switchting to fullscreen mode
function onFullscreenResize() {
	// are we in fullscreen mode?
	isFullscreen = !(document.fullscreenElement == null)

	// if yes, set the original style, otherwise set user defined width
	if (isFullscreen) {
		wbDebug("in fullscreen, setting original style")
		wbSetOriginalStyle();
	} else {
		wbDebug("not in fullscreen, using user defined width")
		wbApplySettings()
	}
}

document.addEventListener('fullscreenchange', onFullscreenResize)
window.addEventListener('resize', onFullscreenResize)

const debugging = true;

wbApplySettings();