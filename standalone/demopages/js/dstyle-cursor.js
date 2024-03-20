
const DS_motion_arg = 0.4; // 趋近速度
const DS_point_cnt = 8; // 分裂圆点数
let DS_cursorScale = 1.0; // 鼠标缩放

let DS_cursor_left = 0.0;
let DS_cursor_top = 0.0;

let DS_cursorSizeMem = new Map();
let DS_TrackObjects = new Array();
let DS_TrackObjRectLeft = new Array();
let DS_TrackObjRectTop = new Array();
let DS_TObjectLeft = new Array();
let DS_TObjectTop = new Array();
let DS_inClickable = 0, DS_isPressed = 0, DS_movaBle = 1, DS_inInput = 0, DS_cursorFolded = false;

function DS_updateCursorRect(){
    for (let index = 0; index < DS_TrackObjects.length; index++){
        let rect = DS_TrackObjects[index].getBoundingClientRect();
        DS_TrackObjRectLeft[index] = (rect.left - rect.right) / 2;
        DS_TrackObjRectTop[index] = (rect.top - rect.bottom) / 2;
    }
}

function DS_cursorReset(posX, posY, obj){
    let index = DS_TrackObjects.findIndex((element) => {
        if (element === obj) return true;
    });
    if (index != undefined) {
        DS_TObjectLeft[index] = posX;
        DS_TObjectTop[index] = posY;
    }
}

function DS_cursorSizeGen(size){
    let res = DS_cursorSizeMem.get(size);
    if (res != undefined){
        return res;
    } else {
        res = `${size * DS_cursorScale}vmax`;
        DS_cursorSizeMem.set(size, res);
        return res;
    }
}

addEventListener('load', () => {
    
    if (platform === 'win' || platform === 'linux'){
        DS_cursorScale = 0.7;

        let cursor_contain = document.createElement('div');
        cursor_contain.className = 'cursor-container';
        let cursor_outer = document.createElement('div');
        cursor_outer.className = 'cursor-outer';
        let cursor_circle = document.createElement('div');
        cursor_circle.className = 'cursor-circle';
        let cursor_effect = document.createElement('div');
        cursor_effect.className = 'cursor-effect';

        cursor_circle.style.opacity = 1;
        cursor_outer.style.opacity = 0;
        cursor_effect.style.animationPlayState = 'paused';

        cursor_contain.style.top = '0';
        cursor_contain.style.left = '0';
        cursor_contain.dataset.allowtrack = 'true';
        cursor_contain.style.setProperty('--cursor-scale', DS_cursorScale);

        desttop = cursor_contain.offsetTop;
        destleft = cursor_contain.offsetLeft;

        cursor_contain.appendChild(cursor_outer);
        cursor_contain.appendChild(cursor_circle);
        
        DS_TrackObjects.push(cursor_contain);
        DS_TObjectLeft.push(cursor_contain.offsetLeft);
        DS_TObjectTop.push(cursor_contain.offsetTop);

        document.body.appendChild(cursor_contain);
        document.body.appendChild(cursor_effect);

        cursor_effect.addEventListener('animationiteration', () => {
            cursor_effect.style.animationPlayState = 'paused';
            cursor_effect.style.opacity = 0;
            DS_movaBle = 1;
        });

        const tracking = document.querySelectorAll('.trackmouse');
        const selects = document.querySelectorAll('.clickable');
        const inputs = document.querySelectorAll('.inputable');

        tracking.forEach(element => {
            DS_TrackObjects.push(element);
            DS_TObjectLeft.push(0);
            DS_TObjectTop.push(0);
        });

        DS_TrackObjects.forEach(obj => {
            let rect = obj.getBoundingClientRect();
            DS_TrackObjRectLeft.push((rect.left - rect.right) / 2);
            DS_TrackObjRectTop.push((rect.top - rect.bottom) / 2)
        });

        selects.forEach(element => {
            element.addEventListener('mouseenter', function(){
                DS_inClickable += 1;
                if (DS_isPressed <= 0 || !DS_cursorFolded) {
                    cursor_outer.style.height = DS_cursorSizeGen(3.5);
                    cursor_outer.style.width = DS_cursorSizeGen(3.5);
                    cursor_circle.style.height = DS_cursorSizeGen(3.5);
                    cursor_circle.style.width = DS_cursorSizeGen(3.5);
                    cursor_circle.style.opacity = 0;
                    cursor_outer.style.opacity = 1;
                }
            });
            element.addEventListener('mouseleave', function(){
                DS_inClickable -= 1;
                if (DS_isPressed <= 0){
                    cursor_outer.style.height = DS_cursorSizeGen(2);
                    cursor_outer.style.width = DS_cursorSizeGen(2);
                    cursor_circle.style.height = DS_cursorSizeGen(2.3);
                    cursor_circle.style.width = DS_cursorSizeGen(2.3);
                    cursor_circle.style.opacity = 1;
                    cursor_outer.style.opacity = 0;
                }
            });
        });

        inputs.forEach(_input => {
            _input.addEventListener('mouseenter', () => {
                DS_inInput += 1;
                cursor_circle.style.opacity = '0.2';
                cursor_circle.style.height = DS_cursorSizeGen(1.2);
                cursor_circle.style.width = DS_cursorSizeGen(1.2);
            });
            _input.addEventListener('mouseleave', () => {
                DS_inInput -= 1;
                cursor_circle.style.opacity = '1';
                cursor_circle.style.height = DS_cursorSizeGen(2.3);
                cursor_circle.style.width = DS_cursorSizeGen(2.3);
            });
        });

        for (let index = 0; index < DS_point_cnt; index++) {
            let dDeg = (360 / DS_point_cnt) * index;
            let newWarp = document.createElement('div');
            newWarp.className = 'cursor-inner-warp';
            newWarp.style.rotate = dDeg + 'deg';
            let newIn = document.createElement('div');
            newIn.className = 'cursor-inner';
            newWarp.appendChild(newIn);
            cursor_outer.appendChild(newWarp);
        }

        window.addEventListener('resize', () => {
            for (let index = 0; index < DS_TrackObjects.length; index++){
                let rect = DS_TrackObjects[index].getBoundingClientRect();
                DS_TrackObjRectLeft[index] = (rect.left - rect.right) / 2;
                DS_TrackObjRectTop[index] = (rect.top - rect.bottom) / 2;
            }
        });

        document.addEventListener('mousemove', function(ev){
            DS_cursor_left = ev.clientX;
            DS_cursor_top = ev.clientY;
        });
        
        addEventListener('mousedown', (ev)=>{
            if (ev.button === 0){
                DS_isPressed = 1;
                if (DS_inClickable > 0){
                    cursor_outer.style.height = DS_cursorSizeGen(1.2);
                    cursor_outer.style.width = DS_cursorSizeGen(1.2);
                    DS_cursorFolded = true;
                }
                else{
                    if (DS_movaBle > 0){
                        cursor_effect.style.opacity = 1;
                        cursor_effect.style.top = ev.clientY + 'px';
                        cursor_effect.style.left = ev.clientX + 'px';
                        cursor_effect.style.animationPlayState = 'running';
                        DS_movaBle = 0
                    }
                }
            }
        });
        
        addEventListener('mouseup', (ev)=>{
            if (ev.button === 0){
                DS_isPressed = 0;
                DS_cursorFolded = false;
                if (DS_inClickable > 0){
                    cursor_outer.style.height = DS_cursorSizeGen(3.5);
                    cursor_outer.style.width = DS_cursorSizeGen(3.5);
                } 
                else if (DS_inInput > 0){
                    
                } else{
                    cursor_outer.style.height = DS_cursorSizeGen(2);
                    cursor_outer.style.width = DS_cursorSizeGen(2);
                    cursor_circle.style.height = DS_cursorSizeGen(2.3);
                    cursor_circle.style.width = DS_cursorSizeGen(2.3);
                    cursor_circle.style.opacity = 1;
                    cursor_outer.style.opacity = 0;
                }
            }
        });

        setInterval(() => {
            for (let index = 0; index < DS_TrackObjects.length; index++) {
                if (DS_TrackObjects[index].dataset.allowtrack === 'true'){
                    if ( Math.abs(DS_TObjectLeft[index] - DS_cursor_left) <= 1){ DS_TObjectLeft[index] = DS_cursor_left; }
                    else{ DS_TObjectLeft[index] += (DS_cursor_left - DS_TObjectLeft[index]) * DS_motion_arg; }
                    if ( Math.abs(DS_TObjectTop[index] - DS_cursor_top) <= 1){ DS_TObjectTop[index] = DS_cursor_top; }
                    else{ DS_TObjectTop[index] += (DS_cursor_top - DS_TObjectTop[index]) * DS_motion_arg; }
                    DS_TrackObjects[index].style.translate = `${DS_TObjectLeft[index] + DS_TrackObjRectLeft[index]}px ${DS_TObjectTop[index] + DS_TrackObjRectTop[index]}px`;
                }
            }
        }, 25);

    }else if (platform != 'unknown'){
        DS_cursorScale = 1.0;

        let cursor_effect = document.createElement('div');
        cursor_effect.className = 'cursor-effect';

        cursor_effect.style.animationPlayState = 'paused';
        document.body.appendChild(cursor_effect);

        cursor_effect.addEventListener('animationiteration', () => {
            cursor_effect.style.animationPlayState = 'paused';
            cursor_effect.style.opacity = 0;
            DS_movaBle = 1;
        });

        addEventListener('touchstart', (ev)=>{
            DS_isPressed = 1;
            if (DS_movaBle > 0){
                cursor_effect.style.opacity = 1;
                cursor_effect.style.top = ev.touches[0].clientY + 'px';
                cursor_effect.style.left = ev.touches[0].clientX + 'px';
                cursor_effect.style.animationPlayState = 'running';
                DS_movaBle = 0
            }
        });
    }
});