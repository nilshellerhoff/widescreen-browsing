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

// function setCssWidthMargin(width) {
// 	document.getElementsByTagName('html')[0].style.width = width + "px";
// 	document.getElementsByTagName('html')[0].style.marginLeft = "auto";
// 	document.getElementsByTagName('html')[0].style.marginRight = "auto";
// }

function setCssWidthMargin(width) {
	url = window.location.href;
	host = window.location.host;
	origHtml = '<!DOCTYPE html>' + document.documentElement.outerHTML;
	title = document.title;

	document.documentElement.innerHTML = `
	<head>
	<title>${title}</title>
	<style>
		* {
			margin: 0;
			padding: 0;
		}
		#wb-iframe {
			width: ${width}px;
			margin-left: ${(window.innerWidth - width)/2}px;
			margin-right: auto;
			border: none;
			overflow: visible;
		}
	</style>
	</head>
	<body>
		<iframe id="wb-iframe" scrolling="no" src="${url}"></iframe>
	</body>`;

	let iframe = document.getElementById("wb-iframe");

	// detect the press of the back button
	window.addEventListener('popstate', function (event) {
		iframe.contentWindow.history.back();
	});

	iframe.onload = function() {
		iframe.height = window.innerHeight;
		iframe.height = iframe.contentWindow.document.body.scrollHeight;
		if (window.location.href != iframe.contentWindow.location.href) {
			window.history.pushState(null, iframe.contentDocument.title, iframe.contentWindow.location.href);
		}
		document.title = iframe.contentDocument.title;
	}
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