

const DS_centerScale = 0.5; // 按比例定中心点
const DS_translateScale = 4; // 位移时系数，决定整体深度
const DS_baseLenCut = 1.0; // 最大距离系数，越小越容易达到最大值
const DS_sampleTime = 50; // 计算间隔，以毫秒计
const DS_enableOrientation = true; // 是否使用陀螺仪
const DS_maxOriY = 60; // Y方向陀螺仪角度
const DS_maxOriX = 20; // X方向陀螺仪角度
const DS_depthScaler = 0.0015; // 深度增加后缩小的比例系数


var DS_mouseX, DS_mouseY, DS_parallexContainer, DS_totContainer;
var DS_parallexObjects = new Array();
var DS_enableTrack = new Array();
var DS_useFullscreenTrack = new Array();
var DS_containerCenter = new Array();
var DS_containerBaseLen = new Array();
var DS_windowX, DS_windowY, DS_offsetX, DS_offsetY, DS_centerX, DS_centerY, DS_windowLen;
var DS_orientY, DS_orientX, DS_initedOrient = false;

class Coord{
    constructor(x, y){
        this.x = x;
        this.y = y;
    }
};

// resize
window.addEventListener('resize', () => {
    DS_windowX = window.innerWidth;
    DS_windowY = window.innerHeight;
    DS_centerX = DS_windowX * DS_centerScale;
    DS_centerY = DS_windowY * DS_centerScale;
    DS_windowLen = Math.sqrt(DS_windowX ** 2 + DS_windowY ** 2) / 2;
    for (let index = 0; index < DS_totContainer; index++){
        let rect = DS_parallexContainer[index].getBoundingClientRect();
        DS_containerBaseLen[index] = Math.sqrt( rect.height ** 2 + rect.width ** 2 ) / 2 * DS_baseLenCut;
        DS_containerCenter[index].x = (rect.left + rect.right) / 2;
        DS_containerCenter[index].y = (rect.top + rect.bottom) / 2;
    }
});

// onload
addEventListener('load', () => {
    
    DS_parallexContainer = document.getElementsByClassName('dstyle-parallax-out');
    DS_totContainer = DS_parallexContainer.length;

    DS_windowX = window.innerWidth;
    DS_windowY = window.innerHeight;
    DS_centerX = DS_windowX * DS_centerScale;
    DS_centerY = DS_windowY * DS_centerScale;
    DS_windowLen = Math.sqrt(DS_windowX ** 2 + DS_windowY ** 2) / 2;

    for (let index = 0; index < DS_parallexContainer.length; index++){
        DS_enableTrack.push(false);
        DS_containerCenter.push(new Coord(0, 0));
        DS_containerBaseLen.push(0);
        DS_parallexObjects.push(DS_parallexContainer[index].getElementsByClassName('dstyle-parallax-in'));

        if (DS_parallexContainer[index].dataset.usefc === 'true'){
            DS_useFullscreenTrack.push(true);
        } else DS_useFullscreenTrack.push(false);

        DS_parallexContainer[index].dataset.index = index;
        let rect = DS_parallexContainer[index].getBoundingClientRect();
        DS_containerBaseLen[index] = Math.sqrt( rect.height ** 2 + rect.width ** 2 ) / 2 * DS_baseLenCut;
        DS_containerCenter[index].x = (rect.left + rect.right) / 2;
        DS_containerCenter[index].y = (rect.top + rect.bottom) / 2;

        if (platform === 'win' || platform === 'linux'){
            DS_parallexContainer[index].addEventListener('mouseenter', (ev) => {
                DS_enableTrack[ev.target.dataset.index] = true;
            });
            DS_parallexContainer[index].addEventListener('mouseleave', (ev) => {
                let index = ev.target.dataset.index;
                DS_enableTrack[index] = false;
                if (!DS_useFullscreenTrack[index]){
                    for (let i = 0; i < DS_parallexObjects[index].length; i++){
                        let element = DS_parallexObjects[index][i];
                        element.style.translate = "0px 0px";
                        element.style.rotate = "none";
                        element.style.scale = "none";
                    }
                }
            });
        }
    }

    if (platform === 'win' || platform === 'linux'){
        addEventListener('mousemove', (ev) => {
            DS_mouseX = ev.clientX;
            DS_mouseY = ev.clientY;
            DS_offsetX = DS_mouseX - DS_centerX;
            DS_offsetY = DS_mouseY - DS_centerY;
        });
    }

    else if (window.DeviceOrientationEvent && DS_enableOrientation){
        addEventListener('deviceorientation', (ev) => {
            if (!DS_initedOrient){
                DS_orientY = ev.beta;
                DS_orientX = ev.gamma;
                if (Math.abs(DS_orientX) > 0.01 && Math.abs(DS_orientY) > 0.01) DS_initedOrient = true;
                return ;
            }
            DS_offsetX = (ev.gamma - DS_orientX) / DS_maxOriX;
            if (DS_offsetX < -1.0) DS_offsetX = -1.0;
            if (DS_offsetX > 1.0) DS_offsetX = 1.0;
            DS_offsetY = (ev.beta - DS_orientY) / DS_maxOriY;
            if (DS_offsetY < -1.0) DS_offsetY = -1.0;
            if (DS_offsetY > 1.0) DS_offsetY = 1.0;
            DS_offsetX *= DS_windowX / 2;
            DS_offsetY *= DS_windowY / 2;
        });
    }
    

    setInterval(() => {
        for (let index = 0; index < DS_totContainer; index++){
            if (DS_enableTrack[index] || DS_useFullscreenTrack[index]){
                let containOffsetX = DS_mouseX - DS_containerCenter[index].x;
                let containOffsetY = DS_mouseY - DS_containerCenter[index].y;
                let baseLen = DS_containerBaseLen[index];
                let maxDeg = DS_parallexContainer[index].dataset.maxdeg;
                if (DS_useFullscreenTrack[index]){
                    containOffsetX = DS_offsetX;
                    containOffsetY = DS_offsetY;
                    baseLen = DS_windowLen;
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

                for (let i = 0; i < DS_parallexObjects[index].length; i++){
                    let element = DS_parallexObjects[index][i];
                    let dx = element.dataset.depth * containOffsetX * DS_translateScale * -1 * Math.min(len, 1.0);
                    let dy = element.dataset.depth * containOffsetY * DS_translateScale * -1 * Math.min(len, 1.0);
                    element.style.translate = `${dx}px ${dy}px`;
                    element.style.rotate = `${containOffsetY} ${-containOffsetX} 0 ${maxDeg * len}deg`;
                    element.style.scale = `${1 - element.dataset.depth * DS_depthScaler}`;
                }
            }
        }
    }, DS_sampleTime);
});

