
var baseFolderName = "kiosk-videos";
var baseFolderPath = "/kiosk-videos/";
var videoLink = "";
var videoList = [];
var myvids = [];
count = 0;
videoUrls = {
	"development": ["https://storage.googleapis.com/titan_kiosk/SampleVideo_1280x720_10mb.mp4",
	    "https://storage.googleapis.com/titan_kiosk/star_trails.mov"
	],
	"production": ["https://storage.googleapis.com/titan_kiosk/test1.webm"]
}
isDevelopmentMode = false;
chrome.management.getSelf(function(callback){
    console.log(callback)
    if(callback !== undefined && callback.installType !== undefined && callback.installType === "development"){
        console.log("Development mode detected");
        isDevelopmentMode = true;
    }
    else{
        isDevelopmentMode = false;
    }
});

checkIfDirectoryExist(baseFolderName);


function errorHandler(e) {
    console.error(e);
    var xhr = new XMLHttpRequest();
    xhr.responseType = 'json';
    return fetch(baseServerUrl+"/error?serialNumber="+e).then(function(response) {
        return response.text().then(function(text) {
            console.log(JSON.parse(text));
            response = JSON.parse(text)
            if(response !== undefined && response.video !== undefined){
//            rotation = JSON.parse(text).rotation;
//            rotate = rotation;
//            console.log(rotate);
                return response.video;
            }
        });
    });
}

function getVideoLink() {
    if (navigator.onLine) {
        if(isDevelopmentMode){
            videoList = videoUrls["development"];
        }
        else{
            videoList = videoUrls["production"];
        }
        if(!videoList || !videoList.length){
            videoDiv.style.display = 'none';loader.style.display = 'none';error.style.display = 'block';
            error_message.innerHTML = "No video to play";
        }
        else{
            error.style.display = 'none';
            url = videoList[0];
            checkIfFileExists(getFileNameFromLink(url),url);
        }
     }
     else{
        function onInitFs(fs) {
            fs.root.getDirectory(baseFolderName, {}, function(directoryEntry) {
                let dirReader = directoryEntry.createReader();
                dirReader.readEntries(function(results) {
                    if(results.length >= 1){
                        for(var i=0;i<results.length;i++){
                            if(!myvids.includes(results[i].toURL())){
                                myvids.push(results[i].toURL());
                            }
                        }
                        error.style.display = 'none';
                        playVideo()
                    }
                    else{
                        videoDiv.style.display = 'none';loader.style.display = 'none';error.style.display = 'block';
                        error_message.innerHTML = "No video to play";
                    }
                });
            });
        }
        window.webkitRequestFileSystem(window.PERSISTENT, 1024 * 1024 * 1024, onInitFs, function(){});
     }
};

function removeOldFiles(){
    newVideoFileNameList = [];
    totalVideoCount = videoList.length;
    for(var i=0;i<totalVideoCount;i++){
        newVideoFileNameList.push(getFileNameFromLink(videoList[i]));
    }
    console.log(newVideoFileNameList)
    function onInitFs(fs) {
        return fs.root.getDirectory(baseFolderName, {}, function(directoryEntry) {
            let dirReader = directoryEntry.createReader();
            let entries = [];

            return dirReader.readEntries(function(results) {
                console.log(results);
                for(var i=0; i < results.length; i++) {
                    console.log(results[i])
                    console.log("File exist ",newVideoFileNameList.includes(results[i].name))
                    if(!newVideoFileNameList.includes(results[i].name)){
                        results[i].remove(function() {
                          console.log('File removed.');
                        }, errorHandler);
                    }
                };
                return true
            }, function(error) {
                return false
            });
        });
    }
    window.webkitRequestFileSystem(window.PERSISTENT, 1024 * 1024 * 1024, onInitFs, function(){});
}

function getFileNameFromLink(someLink) {
    var items = someLink.split("/");
    return items[items.length - 1];
}

function checkIfFileExists(fileName,url) {
    console.log("Checking file "+fileName)

    function onInitFs(fs) {
        return fs.root.getFile(baseFolderPath+fileName, {}, function(fileEntry) {
            if(!myvids.includes(fileEntry.toURL())){
                myvids.push(fileEntry.toURL());
            }
            count++;
            if(count < videoList.length){
                checkIfFileExists(getFileNameFromLink(videoList[count]),videoList[count]);
            }
            else{
                playVideo();
            }
            return true;
        }, function(e){
            downloadVideo(url);
            return false;
        });
    }

    window.webkitRequestFileSystem(window.PERSISTENT, 1024 * 1024 * 1024, onInitFs, function(){});

}

function checkIfDirectoryExist(directoryName) {


    function onInitFs(fs) {
        return fs.root.getDirectory(directoryName, {}, function(directoryEntry) {
            getVideoLink();
            return true;
        }, function(e){
            return fs.root.getDirectory(directoryName, {create: true, exclusive: true}, function(directoryEntry) {
                return true;
            }, function(e){
                return false;
            });
        });
    }

    window.webkitRequestFileSystem(window.PERSISTENT, 1024 * 1024 * 1024, onInitFs, function(){});

}

function downloadVideo(url) {
        var xhr = new XMLHttpRequest();
        xhr.responseType = 'blob';
        xhr.open("GET", url, true);
        percentComplete = 0
        partFileNames = getFileNameFromLink(url).split("_")
        partFileNames.pop()
        fileName = decodeURIComponent(partFileNames.join("_"))
        xhr.onload = function() {
            function onInitFs(fs) {
                fs.root.getFile(baseFolderPath+getFileNameFromLink(url), {create: true}, function(fileEntry) {
                         fileEntry.createWriter(function(writer) {
                               writer.onwriteend = function(e) {
                                loader.style.display = 'none';
                                myvids.push(fileEntry.toURL())
                                count++;
                                if(count < videoList.length){ checkIfFileExists(getFileNameFromLink(videoList[count]),videoList[count])}
                                else{ playVideo();}
                              };
                               var blob = new Blob([xhr.response], {type: 'video/*'});
                               writer.write(blob);
                         });
                   }, errorHandler);
             }
             window.webkitRequestFileSystem(window.PERSISTENT, 1024*1024*1024, onInitFs, errorHandler);
        };
        loader.style.display = 'block'
        xhr.send();
        xhr.addEventListener("progress", function (evt) {
            if(evt.lengthComputable) {
                percentComplete = evt.loaded / evt.total;
                if(videoList.length>1){
                    innerHTML = "Downloading video "+(count+1)+" of "+videoList.length+",<br>"+fileName+" ... ("+parseFloat(Math.round(percentComplete * 100)).toFixed(0)+"%)"
                }
                else{
                    innerHTML = "Downloading video, "+fileName+" ... ("+parseFloat(Math.round(percentComplete * 100)).toFixed(0)+"%)"
                }
                document.getElementById('loader_percentage').innerHTML = innerHTML;
            }
        }, false);
};


function playVideo() {
        videoLink = videoList[0]
        if(!videoLink){
            getVideoLink();
        }
        url = videoLink
        function onInitFsNew(fs) {

             var myVideo = document.getElementsByTagName('video')[0];

             fs.root.getFile(baseFolderPath+getFileNameFromLink(url), {}, function(fileEntry) {
                     console.log(fileEntry.toURL())
                     myVideo.src = fileEntry.toURL();
                     myVideo.style.display = 'block';
                     myVideo.load();
                     myVideo.play();
               }, errorHandler);
         }
        window.webkitRequestFileSystem(window.PERSISTENT, 1024 * 1024, onInitFsNew, errorHandler);
//    });
};

function rotateVideo(rotation){
    chrome.system.display.getInfo(function(info) {
        info.forEach(function(display) {
        if (display.isEnabled) {
            chrome.system.display.setDisplayProperties(
                display.id, {'rotation': rotate || 0});
        }
        });
    });
}