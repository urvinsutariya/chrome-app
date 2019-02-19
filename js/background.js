
chrome.app.runtime.onLaunched.addListener(function () {
    chrome.power.requestKeepAwake('display');
    chrome.app.window.create('index.html', {
        'frame': 'none',
        'id': 'browser',
        'state': 'fullscreen',
        'bounds':{
           'width':screen.width,
           'height':screen.height
        }
    }, function(newWin) {
        newWin.contentWindow.showScreen = true;
        newWin.contentWindow.isKioskMode = true;
      });
});