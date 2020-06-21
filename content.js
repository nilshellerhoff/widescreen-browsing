bodyhtml = document.getElementsByTagName('body')[0].innerHTML;
newhtml = '<div id="widescreenbrowsing-wrapper" style="position: absolute; width: 1000px; left: 780px">' + bodyhtml + '</div>';
document.getElementsByTagName('body')[0].innerHTML = newhtml;
console.log("Running content.js");