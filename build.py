# Description: Build script for the extension

# dictionary of all file destinations (as keys) and their sources (as values)
files_chrome = {
    "content.js": "content.js",
    "icon-16.png": "icon-16.png",
    "icon-48.png": "icon-48.png",
    "icon-128.png": "icon-128.png",
    "manifest.json": "manifest.json",
    "popup.css": "popup.css",
    "popup.html": "popup.html",
    "popup.js": "popup.js",
    "rules.js": "rules.js",
}

# firefox has the same files as chrome, but the manifest file includes the "browser_specific_settings" key
files_firefox = files_chrome.copy()
files_firefox["manifest.json"] = "manifest-firefox.json"

import shutil
import json
import os

manifest_dict = json.load(open("manifest.json"))

extension_version = manifest_dict["version"]


print("Building Chrome extension...")
os.makedirs("build/tmp", exist_ok=True)
shutil.rmtree("build/widescreen-browsing-chrome-{extension_version}.zip", ignore_errors=True)
for dest, src in files_chrome.items():
    shutil.copyfile(src, "build/tmp/" + dest)
shutil.make_archive(f"build/widescreen-browsing-chrome-{extension_version}", "zip", "build/tmp")
shutil.rmtree("build/tmp")

print("Building Firefox extension...")
os.makedirs("build/tmp", exist_ok=True)
shutil.rmtree("build/widescreen-browsing-firefox-{extension_version}.zip", ignore_errors=True)
for dest, src in files_firefox.items():
    shutil.copyfile(src, "build/tmp/" + dest)
shutil.make_archive(f"build/widescreen-browsing-firefox-{extension_version}", "zip", "build/tmp")
shutil.rmtree("build/tmp")

print("Done.")