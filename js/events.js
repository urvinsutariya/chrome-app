var closeButton = document.querySelector('#closeButton');
var rotateButton = document.querySelector('#rotateButton');
var videoDiv = document.querySelector('video');
var loader = document.querySelector('#loader');
var error = document.querySelector('#error');
var error_message = document.querySelector('#message');
var hoverDiv = document.querySelector('#hover_div');
videoDiv.style.display = 'none';
loader.style.display = 'none';
error.style.display = 'none';
var activeVideo = 0;
videoDiv.addEventListener('ended', function(e) {
  activeVideo = (++activeVideo) % myvids.length;
  videoDiv.src = myvids[activeVideo];
  videoDiv.play();
});


rotate = 0;
rotateButton.addEventListener('click', function(e){
    console.log("rotate event");
    rotateVideo(rotate)
    rotate = (rotate + 90)%360;
    console.log(rotate)
});

closeButton.addEventListener('click', function(e){
    console.log("close event");
    window.close();
});


document.getElementById('bodyDiv').onmouseover = function () {
    hoverDiv.style.display = 'block';
    console.log("Hover in");
}

document.getElementById('bodyDiv').onmouseout = function () {
    hoverDiv.style.display = 'none';
    console.log("Hover out");;
}

document.getElementById('bodyDiv').onmousemove = function () {
    hoverDiv.style.display = 'block';
    console.log("mouse move");
    setTimeout(function(){hoverDiv.style.display = 'none';}, 10000);

}