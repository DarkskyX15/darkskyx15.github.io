let DS_navTrigger;


document.addEventListener('load', () => {
    
    if (/windows/i.test(navigator.userAgent)){
        platform = 'win';
    }else if (/android/i.test(navigator.userAgent)){
        platform = 'android';
    }else if (/iphone/i.test(navigator.userAgent)){
        platform = 'iphone';
    }else if (/ipad/i.test(navigator.userAgent)){
        platform = 'ipad';
    }else if (/linux/i.test(navigator.userAgent)){
        platform = 'linux';
    }

    navTrigger = document.getElementById('nav-trigger');

    if (platform === 'win' || platform === 'linux'){

    }else if (platform != 'unknown'){

    }

});