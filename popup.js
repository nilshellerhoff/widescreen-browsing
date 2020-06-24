function setUrl() {
	chrome.tabs.query({currentWindow: true, active: true}, function(tabs){
	    url = new URL(tabs[0].url)
	    document.getElementById('current-url').innerHTML = url.hostname;
	});
}

function update() {
	if (document.getElementById('option-width-setting').value < 100) {
		document.getElementById('option-width-setting').value = 100
	}
	writeData();
	updatePage();
	setOverlay();
}

function loadData() {
	chrome.tabs.query({currentWindow: true, active: true}, function(tabs){
	    url = new URL(tabs[0].url)
		chrome.storage.sync.get([url.hostname], function(result) {
			document.getElementById('option-activate-wb').checked = result[url.hostname]["activated"];
			document.getElementById('option-width-setting').value = result[url.hostname]["width"];
			setSelectedMethod(result[url.hostname]["method"]);
			setOverlay();
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

function updatePage() {
	chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
		chrome.tabs.sendMessage(tabs[0].id, {action: "reload"}, function(response) {
		});
	});
}

function setOverlay() {
	let wbActivated = document.getElementById('option-activate-wb').checked;
	if (wbActivated) {
		document.getElementById('options-wrapper-overlay').style.display = "none";
	} else {
		document.getElementById('options-wrapper-overlay').style.display = "initial";
	}
}

document.addEventListener('DOMContentLoaded', function() {
	setUrl();
	loadData();

	document.getElementsByTagName('body')[0].addEventListener('change', function() {
		update();
	})

	document.getElementById('option-decrease-width').addEventListener('click', function() {
		let val = Number(document.getElementById('option-width-setting').value);
		if (val >= 200) {
			document.getElementById('option-width-setting').value = val - 100;
		}
		update();
	})

	document.getElementById('option-increase-width').addEventListener('click', function() {
		let val = Number(document.getElementById('option-width-setting').value);
		document.getElementById('option-width-setting').value = val + 100;
		update();
	})
})