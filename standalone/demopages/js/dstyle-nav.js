const DS_navTickRate = 50; // 该脚本内的刻时长 (ms)
const DS_longPressLimit = 10; // 长按时间限度 以Tick为单位

let DS_navTrigger, DS_navBar; 
let DS_navStatus = 'top';
let DS_inTrigger = false, DS_inTriggerClick = 0, DS_ClickReap = 1;
let DS_mouseDown = false, DS_longPress = 0, DS_bubbleFloat = false, DS_bubbleOpen = false;
let DS_bubbleCheck = false;

// function 

addEventListener('load', () => {

    DS_navTrigger = document.getElementsByClassName('dstyle-nav-trigger')[0];
    DS_navBar = document.getElementsByClassName('dstyle-nav')[0];

    if (platform === 'win' || platform === 'linux') {
        DS_navBar.style.setProperty('--nav-unit', '14px');
        DS_ClickReap = 1;
    }else if (platform === 'iphone' || platform === 'android') {
        DS_navBar.style.setProperty('--nav-unit', '1.5vmax');
        DS_ClickReap = 2;
    }else if (platform === 'ipad') {
        DS_navBar.style.setProperty('--nav-unit', '1vmax');
        DS_ClickReap = 2;
    }

    // top check
    if (DS_navStatus === 'top') {
        if (window.scrollY < 0.1){
            DS_navBar.classList.remove('dstyle-navTfloat');
        }else{
            DS_navBar.classList.add('dstyle-navTfloat');
        }
    }

    DS_navTrigger.addEventListener('mouseenter', () => {
        DS_inTrigger = true;
    });

    DS_navTrigger.addEventListener('mouseleave', () => {
        DS_inTrigger = false;
        DS_inTriggerClick = 0;
        if (DS_bubbleCheck){
            DS_bubbleCheck = false;
        }
    });

    window.addEventListener('scroll', () => {
        if (DS_navStatus === 'top') {
            if (window.scrollY < 0.1){
                DS_navBar.classList.remove('dstyle-navTfloat');
            }else{
                DS_navBar.classList.add('dstyle-navTfloat');
            }
        }
    });

    addEventListener('mousedown', (ev) => {
        if (ev.button === 0){
            DS_mouseDown = true;
            if (DS_navStatus === 'top'){
                if (DS_inTrigger) {
                    DS_inTriggerClick += 1;
                }
                if (DS_inTriggerClick >= DS_ClickReap){
                    DS_navBar.classList.add('dstyle-navSTbubble');
                    DS_navBar.classList.remove('dstyle-navTfloat');
                    DS_navBar.classList.remove('dstyle-navSTtop');
                    DS_navStatus = 'bubble';
                }
            }
            else if (DS_navStatus === 'bubble') {
                if (DS_inTrigger) {
                    DS_bubbleCheck = true;
                } else DS_bubbleCheck = false;
            }
        }
    });

    addEventListener('mouseup', (ev) => {
        if (ev.button === 0) DS_mouseDown = false;
        if (DS_bubbleCheck) DS_bubbleCheck = false;
        if (DS_bubbleFloat) {
            DS_bubbleFloat = false;
            DS_navBar.classList.add('dstyle-navSTbubble');
            DS_navBar.classList.remove('dstyle-navSTdrag');
            DS_navTrigger.dataset.allowtrack = 'false';
            DS_navStatus = 'bubble';
        }
    });

    setInterval(() => {
        if (DS_navStatus === 'bubble') {
            if (DS_mouseDown && DS_bubbleCheck) DS_longPress += 1;
            else DS_longPress = 0;
            if (!DS_bubbleFloat){
                if (DS_longPress >= DS_longPressLimit) {
                    DS_updateCursorRect();
                    DS_navBar.classList.add('dstyle-navSTdrag');
                    DS_navBar.classList.remove('dstyle-navSTbubble');
                    DS_navTrigger.dataset.allowtrack = 'true';
                    DS_bubbleFloat = true;
                    DS_navStatus = 'drag';
                }
            }
        }
        if (DS_navStatus === 'drag') {

        }
    }, DS_navTickRate);

});
