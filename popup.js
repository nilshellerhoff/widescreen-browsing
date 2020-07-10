function setUrl() {
	chrome.tabs.query({currentWindow: true, active: true}, function(tabs){
	    url = new URL(tabs[0].url)
	    document.getElementById('url').innerHTML = url.hostname;
		document.getElementById('favicon').style.backgroundImage = "url(" + tabs[0].favIconUrl + ")";
	});
}

function loadData() {
	chrome.tabs.query({currentWindow: true, active: true}, function(tabs){
	    url = new URL(tabs[0].url)
		chrome.storage.sync.get([url.hostname], function(result) {
			if (result != undefined) {
				document.getElementById('option-activate-wb').checked = result[url.hostname]["activated"];
				document.getElementById('option-width-setting').value = result[url.hostname]["width"];
				setSelectedMethod(result[url.hostname]["method"]);
				setOverlay();
			}
		});
	});
}

function writeData() {
	chrome.tabs.query({currentWindow: true, active: true}, function(tabs){
	    url = new URL(tabs[0].url)
	    let obj = {};
	    obj[url.hostname] = {
	    	"activated": document.getElementById('option-activate-wb').checked,
			"width": Number(document.getElementById('option-width-setting').value),
			"method": getSelectedMethod(),
		};
		chrome.storage.sync.set(obj)
	});
}

function getSelectedMethod() {
	var radios = document.getElementsByName('option-method');

	for (var i = 0, length = radios.length; i < length; i++) {
		if (radios[i].checked) {
			return radios[i].value;
		}
	}
}

function setSelectedMethod(value) {
	var radios = document.getElementsByName('option-method');

	for (var i = 0, length = radios.length; i < length; i++) {
		if (radios[i].value == value) {
			radios[i].checked = true;
			break;
		}
	}
}

function changeWidthSetting(diff) {
	let currval = Number(document.getElementById('option-width-setting').value);
	if (currval + diff >= 100) {
		document.getElementById('option-width-setting').value = currval + diff;
	} else {
		document.getElementById('option-width-setting').value = 100;
	}
}


function setOverlay() {
	let wbActivated = document.getElementById('option-activate-wb').checked;
	if (wbActivated) {
		document.getElementById('options-wrapper-overlay').style.display = "none";
	} else {
		document.getElementById('options-wrapper-overlay').style.display = "initial";
	}
}

function updatePage() {
	chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
		chrome.tabs.sendMessage(tabs[0].id, {action: "update"}, function(response) {
			var lastError = chrome.runtime.lastError;
	    	if (lastError) {
		        // if message can not be sent, reload (happens directly after installation)
		        chrome.tabs.reload();
	        return;
    		}
		});
	});
}

function update() {
	changeWidthSetting(0);
	writeData();
	updatePage();
	setOverlay();
}

document.addEventListener('DOMContentLoaded', function() {
	setUrl();
	loadData();

	document.getElementsByTagName('body')[0].addEventListener('change', function() {
		update();
	})

	document.getElementById('option-decrease-width').addEventListener('click', function() {
		changeWidthSetting(-100);
		update();
	})

	document.getElementById('option-increase-width').addEventListener('click', function() {
		changeWidthSetting(100);
		update();
	})
})