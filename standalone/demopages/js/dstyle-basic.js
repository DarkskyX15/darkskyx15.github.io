let platform = 'unknown';

if (/windows/i.test(navigator.userAgent)){
    platform = 'win';
}else if (/android/i.test(navigator.userAgent)){
    platform = 'android';
}else if (/iphone/i.test(navigator.userAgent)){
    platform = 'iphone';
}else if (/ipad/i.test(navigator.userAgent) || /macintosh/i.test(navigator.userAgent)){
    platform = 'ipad';
}else if (/linux/i.test(navigator.userAgent)){
    platform = 'linux';
}