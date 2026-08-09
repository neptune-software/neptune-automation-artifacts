let rec = {
    username: inRegisterUsername.getValue()
};

if (!rec.username) {
    inRegisterUsername.setValueState('Error');
    return;
}

let fullpath = location.pathname;

if (fullpath) {
    let path = fullpath.split('/');

    switch (path[1]) {
        case 'launchpad':
            rec.type = path[1];
            rec.launchpad = path[2];
            break;
        default:
            location.href = '/';
            return;
    }
    const url = AppCache.isMobile ? AppCache.Url : "";
    $.ajax({
        type: "POST",
        contentType: "application/json",
        url: url + "/user/activation",
        data: JSON.stringify(rec),
        success: function (data) {            
            neptune.Login.Utils.message({
                title: AppCache_tRegisterUserTitle.getText(),
                intro: AppCache_tRegisterUserIntro.getText(),
                text1: AppCache_tRegisterUserText.getText(),
                state: 'Success',
                onClose: () => {
                    AppCache.setShellTitle(AppCache_boxLogon.getId());
                    AppCacheNav.back();
                },
            });
        },
        error: function (result, status) {
            console.error(result.responseJSON.status);
            neptune.Login.Utils.message({
                title: AppCache_tRegisterUserTitle.getText(),
                intro: AppCache_tRegisterErrorIntro.getText(),
                text1: AppCache_tRegisterErrorText.getText(),
                state: 'Error',
            });
        },
    });
} else {
    location.href = '/'
}