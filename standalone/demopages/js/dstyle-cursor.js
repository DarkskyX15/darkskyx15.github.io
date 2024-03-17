DS_cursor_left = 0.0;
DS_cursor_top = 0.0;
var DS_motion_arg = 0.4;
var DS_point_cnt = 10;
var DS_inClickable = 0, DS_isPressed = 0, DS_movaBle = 1, DS_inInput = 0;

function abs(_var){
    return _var > 0 ? _var : -_var;
}

addEventListener('load', function(){
    
    if (platform === 'win' || platform === 'linux'){

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

        cursor_contain.style.top = '0px';
        cursor_contain.style.left = '0px';

        desttop = cursor_contain.offsetTop;
        destleft = cursor_contain.offsetLeft;

        cursor_contain.appendChild(cursor_outer);
        cursor_contain.appendChild(cursor_circle);
        
        document.body.appendChild(cursor_contain);
        document.body.appendChild(cursor_effect);

        cursor_effect.addEventListener('animationiteration', () => {
            cursor_effect.style.animationPlayState = 'paused';
            cursor_effect.style.opacity = 0;
            DS_movaBle = 1;
        });

        const selects = document.querySelectorAll('.clickable');
        const inputs = document.querySelectorAll('.inputable');

        selects.forEach(element => {
            element.addEventListener('mouseenter', function(){
                DS_inClickable += 1;
                cursor_outer.style.height = '3.5vmax';
                cursor_outer.style.width = '3.5vmax';
                cursor_circle.style.height = '3.5vmax';
                cursor_circle.style.width = '3.5vmax';
                cursor_circle.style.opacity = 0;
                cursor_outer.style.opacity = 1;
            });
            element.addEventListener('mouseleave', function(){
                DS_inClickable -= 1;
                if (DS_isPressed <= 0){
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
                DS_inInput += 1;
                cursor_circle.style.opacity = '0.2';
                cursor_circle.style.height = '1.2vmax';
                cursor_circle.style.width = '1.2vmax';
            });
            _input.addEventListener('mouseleave', () => {
                DS_inInput -= 1;
                cursor_circle.style.opacity = '1';
                cursor_circle.style.height = '2.3vmax';
                cursor_circle.style.width = '2.3vmax';
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

        document.addEventListener('mousemove', function(ev){
            DS_cursor_left = ev.clientX;
            DS_cursor_top = ev.clientY;
        });
        
        addEventListener('mousedown', (ev)=>{
            if (ev.button === 0){
                DS_isPressed = 1;
                if (DS_inClickable > 0){
                    cursor_outer.style.height = '1.2vmax';
                    cursor_outer.style.width = '1.2vmax';
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
                if (DS_inClickable > 0){
                    cursor_outer.style.height = '3.5vmax';
                    cursor_outer.style.width = '3.5vmax';
                } 
                else if (DS_inInput > 0){
                    
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
            if ( abs(destleft - DS_cursor_left) <= 1){ destleft = DS_cursor_left; }
            else{ destleft += (DS_cursor_left - destleft) * DS_motion_arg; }
            if ( abs(desttop - DS_cursor_top) <= 1){ desttop = DS_cursor_top; }
            else{ desttop += (DS_cursor_top - desttop) * DS_motion_arg; }
            cursor_contain.style.left = destleft + 'px';
            cursor_contain.style.top = desttop + 'px';
        }, 25);

    }else if (platform != 'unknown'){
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