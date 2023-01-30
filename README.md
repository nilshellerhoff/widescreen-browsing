# Widescreen Browsing

<a href="https://addons.mozilla.org/firefox/addon/widescreen-browsing/"><img src="https://user-images.githubusercontent.com/24147614/211211400-bbb71128-b08e-49c3-b246-d6a0296a1ee6.png" height="60px" alt="Get the addon for Firefox"></a> <a href="https://chrome.google.com/webstore/detail/widescreen-browsing/glpelpaljileehhngbcjpkehidnipifg"><img src="https://storage.googleapis.com/chrome-gcs-uploader.appspot.com/image/WlD8wC6g8khYWPJUsQceQkhXSlv1/iNEddTyWiMfLSwFD6qGq.png" height="60px" alt="Get the extension for Chrome"></a>

Some Webpages like Wikipedia insist on using the whole screen width, which makes them annoying to read. This extension reduces the width of webpages on screen. You can set a custom width per domain, which will be saved and automatically applied everytime you go to this domain. 

Limit the width of webpages | Save your settings per domain
:-------------------------:|:-------------------------:
![](./publish/screenshots/Screenshot1.svg.png)  |  ![](/publish/screenshots/Screenshot3.svg.png) |  

### Special rules support

Since version 1.0.5 the extension supports special rules for elements on pages which don't appear properly when the extension is activated. E.g. on Wikipedia, the popups for citations and article previews are positioned absolutely and thus appear in the wrong location when using the extension. The rules are listed in `rules.js` in the following format:

```
rules = [
  {
    page: "[^ ]*.wikipedia.org",    <-- regex, which hosts should be affected by this rule
    preferred: "absolute",          <-- the preferred method for reducing page width. If none is given, defaults to "absolute"
    rules: {                        <-- rules in the format "selector" : { "property": "value" }, each rule should be commented with it's purpose
      // shift article previews, citation popups
      ".mwe-popups, .rt-tooltip": { "margin-left": `-${hw}px` },
      // move search suggestions under search box
      ".suggestions": { "margin-right": `-${hw - 15}px` }
    }
  },
]
```

Rules are only applied when "automatic" mode for positioning is selected.

Requests for new pages can be filed by [creating a new issue](https://github.com/nilshellerhoff/widescreen-browsing/issues/new). Currently rules can only be updated by updating the entire extension, a self-update process is planned at some point.
