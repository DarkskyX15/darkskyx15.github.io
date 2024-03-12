

var centerScale = 0.5; // 按比例定中心点
var translateScale = 4; // 位移时系数，决定整体深度
var baseLenCut = 1.0; // 最大距离系数，越小越容易达到最大值
var sampleTime = 50; // 计算间隔，以毫秒计
var maxDeg = 25; // 最大角度，以度数计
var maxOriY = 60; // Y方向陀螺仪角度
var maxOriX = 20; // X方向陀螺仪角度
var depthScaler = 0.0015; // 深度增加后缩小的比例系数


var mouseX, mouseY, parallexContainer, totContainer;
var parallexObjects = new Array();
var enableTrack = new Array();
var useFullscreenTrack = new Array();
var containerCenter = new Array();
var containerBaseLen = new Array();
var windowX, windowY, offsetX, offsetY, centerX, centerY, windowLen;
var orientY, orientX, initedOrient = false;

class Coord{
    constructor(x, y){
        this.x = x;
        this.y = y;
    }
};

// resize
window.addEventListener('resize', () => {
    windowX = window.innerWidth;
    windowY = window.innerHeight;
    centerX = windowX * centerScale;
    centerY = windowY * centerScale;
    windowLen = Math.sqrt(windowX ** 2 + windowY ** 2) / 2;
    for (let index = 0; index < totContainer; index++){
        let rect = parallexContainer[index].getBoundingClientRect();
        containerBaseLen[index] = Math.sqrt( rect.height ** 2 + rect.width ** 2 ) / 2 * baseLenCut;
        containerCenter[index].x = (rect.left + rect.right) / 2;
        containerCenter[index].y = (rect.top + rect.bottom) / 2;
    }
});

// onload
addEventListener('load', () => {
    var onPC = /windows/i.test(navigator.userAgent);
    parallexContainer = document.getElementsByClassName('parallax-container');
    totContainer = parallexContainer.length;

    windowX = window.innerWidth;
    windowY = window.innerHeight;
    centerX = windowX * centerScale;
    centerY = windowY * centerScale;
    windowLen = Math.sqrt(windowX ** 2 + windowY ** 2) / 2;

    for (let index = 0; index < parallexContainer.length; index++){
        enableTrack.push(false);
        containerCenter.push(new Coord(0, 0));
        containerBaseLen.push(0);
        parallexObjects.push(parallexContainer[index].getElementsByClassName('parallax-item'));

        if (parallexContainer[index].dataset.usefc === 'true'){
            useFullscreenTrack.push(true);
        } else useFullscreenTrack.push(false);

        parallexContainer[index].dataset.index = index;
        let rect = parallexContainer[index].getBoundingClientRect();
        containerBaseLen[index] = Math.sqrt( rect.height ** 2 + rect.width ** 2 ) / 2 * baseLenCut;
        containerCenter[index].x = (rect.left + rect.right) / 2;
        containerCenter[index].y = (rect.top + rect.bottom) / 2;

        parallexContainer[index].addEventListener('mouseenter', (ev) => {
            enableTrack[ev.target.dataset.index] = true;
        });
        parallexContainer[index].addEventListener('mouseleave', (ev) => {
            let index = ev.target.dataset.index;
            enableTrack[index] = false;
            if (!useFullscreenTrack[index]){
                for (let i = 0; i < parallexObjects[index].length; i++){
                    let element = parallexObjects[index][i];
                    element.style.translate = "0px 0px";
                    element.style.rotate = "none";
                    element.style.scale = "none";
                }
            }
        });
    }

    if (onPC){
        addEventListener('mousemove', (ev) => {
            mouseX = ev.clientX;
            mouseY = ev.clientY;
            offsetX = mouseX - centerX;
            offsetY = mouseY - centerY;
        });
    }

    else if (window.DeviceOrientationEvent){
        addEventListener('deviceorientation', (ev) => {
            if (!initedOrient){
                orientY = ev.beta;
                orientX = ev.gamma;
                if (Math.abs(orientX) > 0.01 && Math.abs(orientY) > 0.01) initedOrient = true;
            }
            offsetX = (ev.gamma - orientX) / maxOriX;
            if (offsetX < -1.0) offsetX = -1.0;
            if (offsetX > 1.0) offsetX = 1.0;
            offsetY = (ev.beta - orientY) / maxOriY;
            if (offsetY < -1.0) offsetY = -1.0;
            if (offsetY > 1.0) offsetY = 1.0;
            offsetX *= windowX / 2;
            offsetY *= windowY / 2;
        });
    }

    setInterval(() => {
        for (let index = 0; index < totContainer; index++){
            if (enableTrack[index] || useFullscreenTrack[index]){
                let containOffsetX = mouseX - containerCenter[index].x;
                let containOffsetY = mouseY - containerCenter[index].y;
                let baseLen = containerBaseLen[index];
                if (useFullscreenTrack[index]){
                    containOffsetX = offsetX;
                    containOffsetY = offsetY;
                    baseLen = windowLen;
                }

                let len = Math.sqrt( containOffsetX ** 2 + containOffsetY ** 2);
                if (len == 0) {
                    containOffsetX = 0.0;
                    containOffsetY = 0.0;
                }
                else {
                    containOffsetX /= len;
                    containOffsetY /= len;
                    len /= baseLen;
                }

                for (let i = 0; i < parallexObjects[index].length; i++){
                    let element = parallexObjects[index][i];
                    let dx = element.dataset.depth * containOffsetX * translateScale * -1 * Math.min(len, 1.0);
                    let dy = element.dataset.depth * containOffsetY * translateScale * -1 * Math.min(len, 1.0);
                    element.style.translate = `${dx}px ${dy}px`;
                    element.style.rotate = `${containOffsetY} ${-containOffsetX} 0 ${maxDeg * len}deg`;
                    element.style.scale = `${1 - element.dataset.depth * depthScaler}`;
                }
            }
        }
    }, sampleTime);
});

