cursor_left = 0.0;
cursor_top = 0.0;
var motion_arg = 0.4;
var point_cnt = 10;
var inClickable = 0, isPressed = 0, movaBle = 1, inInput = 0;

function abs(_var){
    return _var > 0 ? _var : -_var;
}

addEventListener('load', function(){
    var onPC = /windows/i.test(navigator.userAgent);
    if (!onPC) return;
    
    let cursor_contain = document.createElement('div');
    cursor_contain.className = 'cursor-container';
    let cursor_outer = document.createElement('div');
    cursor_outer.className = 'cursor-outer';
    let cursor_circle = this.document.createElement('div');
    cursor_circle.className = 'cursor-circle';
    let cursor_effect = this.document.createElement('div');
    cursor_effect.className = 'cursor-effect';

    cursor_circle.style.opacity = 1;
    cursor_outer.style.opacity = 0;
    cursor_effect.style.animationPlayState = 'paused';

    cursor_contain.style.top = '0px';
    cursor_contain.style.left = '0px';

    desttop = cursor_contain.offsetTop;
    destleft = cursor_contain.offsetLeft;

    cursor_contain.appendChild(cursor_outer);
    cursor_contain.appendChild(cursor_circle);
    
    this.document.body.appendChild(cursor_contain);
    this.document.body.appendChild(cursor_effect);

    cursor_effect.addEventListener('animationiteration', () => {
        cursor_effect.style.animationPlayState = 'paused';
        cursor_effect.style.opacity = 0;
        movaBle = 1;
    });

    const selects = document.querySelectorAll('.clickable');
    const inputs = this.document.querySelectorAll('.inputable');

    selects.forEach(element => {
        element.addEventListener('mouseenter', function(){
            inClickable += 1;
            cursor_outer.style.height = '3.5vmax';
            cursor_outer.style.width = '3.5vmax';
            cursor_circle.style.height = '3.5vmax';
            cursor_circle.style.width = '3.5vmax';
            cursor_circle.style.opacity = 0;
            cursor_outer.style.opacity = 1;
        });
        element.addEventListener('mouseleave', function(){
            inClickable -= 1;
            if (isPressed <= 0){
                cursor_outer.style.height = '2vmax';
                cursor_outer.style.width = '2vmax';
                cursor_circle.style.height = '2.3vmax';
                cursor_circle.style.width = '2.3vmax';
                cursor_circle.style.opacity = 1;
                cursor_outer.style.opacity = 0;
            }
        });
    });

    inputs.forEach(_input => {
        _input.addEventListener('mouseenter', () => {
            inInput += 1;
            cursor_circle.style.opacity = '0.2';
            cursor_circle.style.height = '1.2vmax';
            cursor_circle.style.width = '1.2vmax';
        });
        _input.addEventListener('mouseleave', () => {
            inInput -= 1;
            cursor_circle.style.opacity = '1';
            cursor_circle.style.height = '2.3vmax';
            cursor_circle.style.width = '2.3vmax';
        });
    });

    for (let index = 0; index < point_cnt; index++) {
        let dDeg = (360 / point_cnt) * index;
        let newWarp = document.createElement('div');
        newWarp.className = 'cursor-inner-warp';
        newWarp.style.rotate = dDeg + 'deg';
        let newIn = this.document.createElement('div');
        newIn.className = 'cursor-inner';
        newWarp.appendChild(newIn);
        cursor_outer.appendChild(newWarp);
    }

    document.addEventListener('mousemove', function(ev){
        cursor_left = ev.clientX;
        cursor_top = ev.clientY;
    });
    
    addEventListener('mousedown', (ev)=>{
        if (ev.button === 0){
            isPressed = 1;
            if (inClickable > 0){
                cursor_outer.style.height = '1.2vmax';
                cursor_outer.style.width = '1.2vmax';
            }
            else{
                if (movaBle > 0){
                    cursor_effect.style.opacity = 1;
                    cursor_effect.style.top = ev.clientY + 'px';
                    cursor_effect.style.left = ev.clientX + 'px';
                    cursor_effect.style.animationPlayState = 'running';
                    movaBle = 0
                }
            }
        }
    });
    
    addEventListener('mouseup', (ev)=>{
        if (ev.button === 0){
            isPressed = 0;
            if (inClickable > 0){
                cursor_outer.style.height = '3.5vmax';
                cursor_outer.style.width = '3.5vmax';
            } 
            else if (inInput > 0){
                
            } else{
                cursor_outer.style.height = '2vmax';
                cursor_outer.style.width = '2vmax';
                cursor_circle.style.height = '2.3vmax';
                cursor_circle.style.width = '2.3vmax';
                cursor_circle.style.opacity = 1;
                cursor_outer.style.opacity = 0;
            }
        }
    });

    setInterval(function(){
        if ( abs(destleft - cursor_left) <= 1){ destleft = cursor_left; }
        else{ destleft += (cursor_left - destleft) * motion_arg; }
        if ( abs(desttop - cursor_top) <= 1){ desttop = cursor_top; }
        else{ desttop += (cursor_top - desttop) * motion_arg; }
        cursor_contain.style.left = destleft + 'px';
        cursor_contain.style.top = desttop + 'px';
    }, 25);

});