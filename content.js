function debug(msg) {
	if (debugging) {
		console.log(msg)
	}	
}

function setWidth() {
	debug("setting width")
	if (document.contentType.match("text/.*") == null) {
		// if ContentType note like text/something, do not set width
		return;
	}
	url = window.location.host
	chrome.storage.sync.get([url], function(result) {
		if (result != undefined) {
			let activated = result[url]["activated"];
			let width = result[url]["width"];
			let method = result[url]["method"];
			if (activated & width < window.innerWidth) {
				setCssWidth(width, method);
				jumpToAnchor();
			} else {
				setOriginalCss();
			}
		}
	});
}

function jumpToAnchor() {
	// Check url and split on hash sign
	url = window.location["href"];
	if ( url.split("#").length == 2 ) {
		window.location = "#" + url.split("#")[1];
	}
}

function setOriginalCss() {
	debug("setting original css")
	document.getElementsByTagName('html')[0].style.cssText = origCss;
}

function setCssWidth(width, method) {
	switch (method) {
		case "automatic":
			setCssWidthAbsolute(width);
			break;
		case "absolute":
			setCssWidthAbsolute(width);
			break;
		case "relative":
			setCssWidthRelative(width);
			break;
		case "margin":
			setCssWidthMargin(width);
			break;
	}
}

function setCssWidthAbsolute(width) {
	document.getElementsByTagName('html')[0].style.position = "absolute";
	document.getElementsByTagName('html')[0].style.width = width + "px";
	document.getElementsByTagName('html')[0].style.left = (window.innerWidth - width)/2 + "px";	
}

function setCssWidthRelative(width) {
	document.getElementsByTagName('html')[0].style.position = "relative";
	document.getElementsByTagName('html')[0].style.width = width + "px";
	document.getElementsByTagName('html')[0].style.left = (window.innerWidth - width)/2 + "px";	
}

function setCssWidthMargin(width) {
	document.getElementsByTagName('html')[0].style.width = width + "px";
	document.getElementsByTagName('html')[0].style.marginLeft = "auto";
	document.getElementsByTagName('html')[0].style.marginRight = "auto";
}

// Add reload listener
chrome.runtime.onMessage.addListener(
	function(request, sender, sendResponse) {
		if (request.action == "update") {
			setWidth();
		}
		sendResponse({response: "roger"});
});

// Add event listener for setting original CSS when resizing window or switchting to fullscreen mode
function onFullscreenResize() {
	// have we just switched to fullscreen mode?
	isFullscreen = !(document.fullscreenElement == null)

	// if yes, set the original CSS
	// otherwise set user defined width
	if (isFullscreen) {
		debug("entering fullscreen")
		setOriginalCss();
	} else {
		debug("not in fullscreen")
		setWidth()
	}

}
document.addEventListener('fullscreenchange', onFullscreenResize)
window.addEventListener('resize', onFullscreenResize)

const debugging = false;

const origCss = document.getElementsByTagName('html')[0].style.cssText;
setWidth();