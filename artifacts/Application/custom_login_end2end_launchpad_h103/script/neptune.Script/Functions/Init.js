// Add Function to AppCache object when inside Launchpad
if (AppCache.isMobile) AppCache.loginAppSetSettings = logonScreen.setSettings;

// Forgot Password
const url = new URL(location.href);
const searchParams = url.searchParams;
const token = searchParams.get('token');
const activation = searchParams.has('activation');

if (activation && token) {
    AppCache.setEnableSetPasswordScreen();
} 

if (!activation && token) {
    AppCache.setEnableResetScreen()
}

// Startup
if (!AppCache.isMobile) {
    localStorage.removeItem('p9azuretoken');
    localStorage.removeItem('p9azuretokenv2');
    setTimeout(function () {
        logonScreen.getLogonTypes();
    }, 10);
}

neptune.Shell.attachBeforeDisplay((data) => {
    AppCache_butCancelLogon.setVisible(
        typeof modelAppCacheUsers !== "undefined" && modelAppCacheUsers?.oData?.length > 0
    );
});

const _loginTypes_delegate = {
    onsapenter: function(e) {
        AppCache_loginTypes.getPicker().open();
    },
};
AppCache_loginTypes.addEventDelegate(_loginTypes_delegate);
AppCache_loginTypes.exit = function() {
    AppCache_loginTypes.removeEventDelegate(_loginTypes_delegate);
};
AppCache_loginTypes.getPicker().addStyleClass("nepLogonLanguagePicker");

// Sorter Function
let sort_by = function (field, reverse, primer) {
    let key = primer ?
        function (x) {
            return primer(x[field])
        } :
        function (x) {
            return x[field]
        };
    reverse = !reverse ? 1 : -1;
    return function (a, b) {
        return a = key(a), b = key(b), reverse * ((a > b) - (b > a));
    }
}
