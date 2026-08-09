neptune.Login.Splash = {
    init: false,
    hide: ()=>{
        setTimeout(()=>{
            document.documentElement.classList.remove("nepSplash");
        });
    }
};