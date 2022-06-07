
var layer = document.querySelector(".layer");
var panoviewer = document.querySelector(".viewer");
var container = document.querySelector(".viewer .container");
var hotspots = Array.prototype.slice.call(document.querySelectorAll(".hotspot"));
var currentPage = "1";
var webviewid = document.querySelector(".webview");

function openLayer(img) {
    layer.querySelector("img").src = "https://naver.github.io/egjs-view360/examples/panoviewer/etc/img/" + img;
    layer.style.display = "block";
}
function closeLayer(e) {
    if (e.target === layer) {
        layer.style.display = "none";
    }
}
function toRadian(deg) {
    return deg * Math.PI / 180;
}
function getHFov(fov) {
    var rect = container.getBoundingClientRect();
    var width = rect.width;
    var height = rect.height;
    return Math.atan(width / height * Math.tan(toRadian(fov) / 2)) / Math.PI * 360;
}
function rotate(point, deg) {
    var rad = toRadian(deg);
    var cos = Math.cos(rad);
    var sin = Math.sin(rad);

    return [cos * point[0] - sin * point[1], sin * point[0] + cos * point[1]];
}
function setHotspotOffset(hotspot, viewer) {
    var oyaw = viewer.getYaw();
    var opitch = viewer.getPitch();
    var yaw = parseFloat(hotspot.getAttribute("data-yaw"));
    var pitch = parseFloat(hotspot.getAttribute("data-pitch"));
    var deltaYaw = yaw - oyaw;
    var deltaPitch = pitch - opitch;

    if (deltaYaw < -180) {
        deltaYaw += 360;
    } else if (deltaYaw > 180) {
        deltaYaw -= 360;
    }
    if (Math.abs(deltaYaw) > 90) {
        hotspot.style.transform = "translate(-200px, 0px)";
        return;
    }
    var radYaw = toRadian(deltaYaw);
    var radPitch = toRadian(deltaPitch);

    var fov = viewer.getFov();
    var hfov = getHFov(fov);

    var rx = Math.tan(toRadian(hfov) / 2);
    var ry = Math.tan(toRadian(fov) / 2);


    var point = [
        Math.tan(-radYaw) / rx,
        Math.tan(-radPitch) / ry,
    ];

    // Image rotation compensation
    // The original image is about 10 degrees tilted.
    point = point.map(function (p) {
        return p * Math.cos(15 / 180 * Math.PI);
    });
    point[1] = rotate(point, deltaYaw > 0 ? -10 : 10)[1];

    // point[0] /= 1.05;
    var left = viewer._width / 2 + point[0] * viewer._width / 2;
    var top = viewer._height / 2 + point[1] * viewer._height / 2;

    hotspot.style.transform = "translate(" + left + "px, " + top + "px) translate(-50%, -50%)";
}
function setHotspotOffsets(viewer) {
    hotspots.filter(function (hotspot) {
        return hotspot.getAttribute("data-page") === currentPage;
    }).forEach(function (hotspot) {
        setHotspotOffset(hotspot, viewer);
    });
}
function load(target, page) {
    if (currentPage == page) {
        return;
    }
    var yaw = target.getAttribute("data-yaw");
    var pitch = target.getAttribute("data-pitch");

    currentPage = "" + page;

    viewer.lookAt({
        yaw: yaw,
        pitch: pitch,
        fov: 30
    }, 500);

    setTimeout(function () {
        panoviewer.setAttribute("data-page", currentPage);
        viewer.setImage("/uploads/" + page, {
            projectionType: eg.view360.PanoViewer.PROJECTION_TYPE.EQUIRECTANGULARString,
            cubemapConfig: {
                tileConfig: { flipHorizontal: true, rotation: 0 },
            } 
        });
    }, 500);
}

function loadnew(page,id){ 
    currentPage = "" + page;
    var ext = /^.+\.([^.]+)$/.exec(page);
    viewer.lookAt({
        yaw: 80,
        pitch: -12,
        fov: 30
    }, 500);
  //  webviewid.setAttribute("value", id);
  //  webview1.setAttribute("value", id);

    //document.getElementById("webview").value = id;
    setTimeout(function () {
        panoviewer.setAttribute("data-page", id);
        if(ext[1] == 'png' || ext[1] == 'jpg' ||  ext[1] == 'jpeg'){
            viewer.setImage("/uploads/" + page, {
                projectionType: eg.view360.PanoViewer.PROJECTION_TYPE.EQUIRECTANGULARString,
                cubemapConfig: {
                    tileConfig: { flipHorizontal: true, rotation: 0 },
                } 
            });
        }else{
            viewer.getVideo("/uploads/" + page, {
                //viewer.play(); 
                projectionType: eg.view360.PanoViewer.PROJECTION_TYPE.EQUIRECTANGULARString,
                cubemapConfig: {
                    tileConfig: { order: "RLUDFB" },
                } 
            });
        }
        
    }, 500);
} 

function loadview(page){ 
    currentPage = "" + page;
    var ext = /^.+\.([^.]+)$/.exec(page);
    viewer.lookAt({
        yaw: 80,
        pitch: -12,
        fov: 30
    }, 500);

    setTimeout(function () {
        panoviewer.setAttribute("data-page", id);
        if(ext[1] == 'png' || ext[1] == 'jpg' ||  ext[1] == 'jpeg'){
            viewer.setImage("/uploads/" + page, {
                projectionType: eg.view360.PanoViewer.PROJECTION_TYPE.EQUIRECTANGULARString,
                cubemapConfig: {
                    tileConfig: { flipHorizontal: true, rotation: 0 },
                } 
            });
        }else{
            viewer.getVideo("/uploads/" + page, {
                //viewer.play(); 
                projectionType: eg.view360.PanoViewer.PROJECTION_TYPE.cubestrip,
                cubemapConfig: {
                    tileConfig: { order: "RLUDFB" },
                } 
            });
        }
        
    }, 500); 
} 


var viewer = new eg.view360.PanoViewer(container, {
    image: "/uploads/e.jpg",
    //video : "http://localhost:15000/uploads/1578306586283.mp4",
    useZoom: false,
    projectionType: eg.view360.PanoViewer.PROJECTION_TYPE.EQUIRECTANGULARString,
    cubemapConfig: {
        tileConfig: { flipHorizontal: true, rotation: 0 },
    }
}).on("ready", function (e) {
    /*var video = viewer.getVideo();
    video.muted = true;
    video.play();*/
    viewer.lookAt({
        fov: 360,
    });
    setTimeout(function () {
        viewer.lookAt({
            fov: 65,
        }, 500);
        setHotspotOffsets(viewer);
    });
}).on("viewChange", function (e) {
    setHotspotOffsets(viewer);
});
window.addEventListener("resize", function (e) {
    viewer.updateViewportDimensions();
    setHotspotOffsets(viewer);
});

// for video start
/*var container1 = document.querySelector(".container1"); 
var videoEl = document.getElementById("pano_video");

var panoViewer1 = new PanoViewer(container1, {
    video: videoEl
});
document.querySelector(".play-container .play").addEventListener("click", function () {
    videoEl.play();
});
videoEl.addEventListener("play", function () {
    document.querySelector(".play-container").style.display = "none";
})*/
// video end
PanoControls.init(panoviewer, viewer);
PanoControls.showLoading();
