cursor_left = 0;
cursor_top = 0;
var motion_arg = 0.4;
var point_cnt = 6;
var inClickable = 0;

addEventListener('load', function(){
    cursor_outer = document.getElementById('couter');
    desttop = cursor_outer.offsetTop;
    destleft = cursor_outer.offsetLeft;
    const selects = document.querySelectorAll('.clickable');
    selects.forEach(element => {
        element.addEventListener('mouseenter', function(){
            inClickable += 1;
            cursor_outer.style.height = '3.5vmax';
            cursor_outer.style.width = '3.5vmax';
        });
        element.addEventListener('mouseleave', function(){
            inClickable -= 1;
            cursor_outer.style.height = '2vmax';
            cursor_outer.style.width = '2vmax';
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
    setInterval(function(){
        destleft += (cursor_left - destleft) * motion_arg;
        desttop += (cursor_top - desttop) * motion_arg;
        cursor_outer.style.left = destleft + 'px';
        cursor_outer.style.top = desttop + 'px';
    }, 25);
})

addEventListener('mousemove', function(ev){
    cursor_left = ev.clientX;
    cursor_top = ev.clientY;
})

addEventListener('mousedown', (ev)=>{
    if (ev.button === 0){
        cursor_outer.style.height = '1.2vmax';
        cursor_outer.style.width = '1.2vmax';
    }
})

addEventListener('mouseup', (ev)=>{
    if (ev.button === 0){
        if (inClickable > 0){
            cursor_outer.style.height = '3.5vmax';
            cursor_outer.style.width = '3.5vmax';
        } else{
            cursor_outer.style.height = '2vmax';
            cursor_outer.style.width = '2vmax';
        }
    }
})