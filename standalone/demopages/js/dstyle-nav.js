
const DS_navTickRate = 50; // 该脚本内的刻时长 (ms)
const DS_longPressLimit = 10; // 长按时间限度 以Tick为单位
const DS_floatMenuMargin = 10; // 浮动菜单与窗口边缘的交互间距
const DS_menuTriggerMargin = 6; // 浮动菜单与触发器间的间距 (px)
const DS_navResetOffsetX = 32; // 重置按钮与触发器位置的偏移X (px)
const DS_navResetOffsetY = 17; // 重置按钮与触发器位置的偏移Y (px)

let DS_navTrigger, DS_navBar, DS_floatMenu, DS_navReset; 
let DS_navStatus = 'top';
let DS_inTrigger = false, DS_inTriggerClick = 0, DS_ClickReap = 1;
let DS_navInReset = false;
let DS_mouseDown = false, DS_longPress = 0, DS_bubbleFloat = false, DS_bubbleOpen = false;
let DS_bubbleCheck = false;
let DS_floatMenuHeight, DS_floatMenuWidth;
let DS_navWindowX, DS_navWindowY;

function DS_recalcFloatMenu(){
    let rect = DS_navTrigger.getBoundingClientRect();
    let reset_len = DS_navReset.getBoundingClientRect().height / 2;
    let bottom_suff = true, right_suff = true;
    if (rect.left + DS_floatMenuWidth + DS_floatMenuMargin > DS_navWindowX){
        right_suff = false;
    }
    if (rect.bottom + DS_floatMenuHeight + DS_floatMenuMargin > DS_navWindowY){
        bottom_suff = false;
    }

    if (right_suff) {
        DS_navReset.style.translate = `${(rect.left + rect.right) / 2 + DS_navResetOffsetX - reset_len}px ${(rect.top + rect.bottom) / 2 + DS_navResetOffsetY - reset_len}px`;
    } else {
        DS_navReset.style.translate = `${(rect.left + rect.right) / 2 - DS_navResetOffsetX - reset_len}px ${(rect.top + rect.bottom) / 2 + DS_navResetOffsetY - reset_len}px`;
    }

    if (bottom_suff && right_suff) {
        DS_floatMenu.style.transformOrigin = 'top left';
        DS_floatMenu.style.translate = `${rect.left + DS_menuTriggerMargin}px ${rect.bottom + DS_menuTriggerMargin}px`;
    } else if (bottom_suff && !right_suff) {
        DS_floatMenu.style.transformOrigin = 'top right';
        DS_floatMenu.style.translate = `${rect.right - DS_floatMenuWidth - DS_menuTriggerMargin}px ${rect.bottom + DS_menuTriggerMargin}px`;
    } else if (!bottom_suff && right_suff) {
        DS_floatMenu.style.transformOrigin = 'bottom left';
        DS_floatMenu.style.translate = `${rect.left + DS_menuTriggerMargin}px ${rect.top - DS_floatMenuHeight - DS_menuTriggerMargin}px`;
    } else {
        DS_floatMenu.style.transformOrigin = 'bottom right';
        DS_floatMenu.style.translate = `${rect.right - DS_floatMenuWidth - DS_menuTriggerMargin}px ${rect.top - DS_floatMenuHeight - DS_menuTriggerMargin}px`;
    }
}

function DS_checkNavTop(){
    if (DS_navStatus === 'top') {
        if (window.scrollY < 0.1) {
            DS_navBar.classList.remove('dstyle-navTfloat');
        }else{
            DS_navBar.classList.add('dstyle-navTfloat');
        }
    }
}

addEventListener('load', () => {

    DS_navTrigger = document.getElementsByClassName('dstyle-nav-trigger')[0];
    DS_navBar = document.getElementsByClassName('dstyle-nav')[0];
    DS_floatMenu = document.getElementsByClassName('dstyle-nav-bubble-container')[0];
    DS_navReset = document.getElementsByClassName('dstyle-nav-reset')[0];

    if (platform === 'win' || platform === 'linux') {
        DS_navBar.style.setProperty('--nav-unit', '14px');
        DS_ClickReap = 1;
    }else if (platform === 'iphone' || platform === 'android') {
        DS_navBar.style.setProperty('--nav-unit', '1.4vmax');
        DS_ClickReap = 2;
    }else if (platform === 'ipad') {
        DS_navBar.style.setProperty('--nav-unit', '1vmax');
        DS_ClickReap = 2;
    }

    // top check
    DS_checkNavTop();

    let rect = DS_floatMenu.getBoundingClientRect();
    DS_floatMenuHeight = rect.bottom - rect.top;
    DS_floatMenuWidth = rect.right - rect.left;

    DS_navWindowX = window.innerWidth;
    DS_navWindowY = window.innerHeight;

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

    DS_navReset.addEventListener('mouseenter', () => {
        DS_navInReset = true;
    });

    DS_navReset.addEventListener('mouseleave', () => {
        DS_navInReset = false;
    });

    window.addEventListener('scroll', DS_checkNavTop);

    window.addEventListener('resize', () => {
        DS_navWindowX = window.innerWidth;
        DS_navWindowY = window.innerHeight;
    });

    if (platform === 'win' || platform === 'linux'){
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
                        let rect = DS_navTrigger.getBoundingClientRect();
                        DS_cursorReset((rect.left + rect.right) / 2, (rect.top + rect.bottom) / 2, DS_navTrigger);
                    }
                }
                else if (DS_navStatus === 'bubble' || DS_navStatus === 'unfold') {
                    if (DS_inTrigger) {
                        DS_recalcFloatMenu();
                        DS_bubbleCheck = true;
                    } else DS_bubbleCheck = false;
                    if (DS_navInReset && DS_navStatus === 'unfold') {
                        DS_navInReset = false;
                        DS_navBar.classList.add('dstyle-navSTtop');
                        DS_navBar.classList.remove('dstyle-navSTunfold');
                        DS_navTrigger.style.translate = '';
                        DS_navStatus = 'top';
                        DS_checkNavTop();
                    }
                }
            }
        });

        addEventListener('mouseup', (ev) => {
            if (ev.button === 0) DS_mouseDown = false;
            if (DS_bubbleCheck) {
                if (DS_longPress < DS_longPressLimit){
                    if (DS_navStatus === 'bubble') {
                        DS_navBar.classList.add('dstyle-navSTunfold');
                        DS_navBar.classList.remove('dstyle-navSTbubble');
                        DS_navStatus = 'unfold';
                    } else if (DS_navStatus === 'unfold') {
                        DS_navBar.classList.add('dstyle-navSTbubble');
                        DS_navBar.classList.remove('dstyle-navSTunfold');
                        DS_navStatus = 'bubble';
                    }
                }
                DS_bubbleCheck = false;
            }
            if (DS_bubbleFloat) {
                DS_bubbleFloat = false;
                DS_navBar.classList.add('dstyle-navSTbubble');
                DS_navBar.classList.remove('dstyle-navSTdrag');
                DS_navTrigger.dataset.allowtrack = 'false';
                DS_navStatus = 'bubble';
                DS_recalcFloatMenu();
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
        }, DS_navTickRate);
    } else if (platform != 'unknown') {

    }

});
