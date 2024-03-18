let DS_navTrigger, DS_navBar; 
let DS_navStatus = 'top';
let DS_inTrigger = false, DS_inTriggerClick = 0, DS_ClickReap = 1;

// function 

addEventListener('load', () => {

    if (platform === 'win' || platform === 'linux'){
        DS_ClickReap = 1;               
    }else if (platform != 'unknown'){
        DS_ClickReap = 2;
    }

    DS_navTrigger = document.getElementsByClassName('dstyle-nav-trigger')[0];
    DS_navBar = document.getElementsByClassName('dstyle-nav')[0];

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
        }
    });

});
