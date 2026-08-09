if (typeof AppCache === 'undefined' || !AppCache) AppCache = {
    isDevice: false,
};

if (!AppCache.setEnableRegisterScreen) AppCache.setEnableRegisterScreen = function () {
    inRegisterUsername.setValue();
    AppCacheNav.to(AppCache_boxRegister);
    AppCache.setShellTitle(AppCache_boxRegister.getId());
};

if (!AppCache.setEnableForgotScreen) AppCache.setEnableForgotScreen = function () {
    inForgotUsername.setValue();
    inForgotUsername.setValueState(sap.ui.core.ValueState.None);
    AppCacheNav.to(AppCache_boxForgot);
    AppCache.setShellTitle(AppCache_boxForgot.getId());
};

if (!AppCache.setEnableLogonScreen) AppCache.setEnableLogonScreen = function () {
    AppCache_inUsername.setValue();
    AppCache_inPassword.setValueState(sap.ui.core.ValueState.None);
    AppCacheNav.to(AppCache_boxLogon);
    AppCache.setShellTitle(AppCache_boxLogon.getId());
};

if (!AppCache.setEnableResetScreen) AppCache.setEnableResetScreen = function () {
    inNewPasswordOne.setValue();
    inNewPasswordTwo.setValueState(sap.ui.core.ValueState.None);
    AppCacheNav.to(AppCache_boxReset);
    AppCache.setShellTitle(AppCache_boxReset.getId());
};

if (!AppCache.setEnableSetPasswordScreen) AppCache.setEnableSetPasswordScreen = function () {
    inSetPasswordOne.setValue();
    inSetPasswordTwo.setValueState(sap.ui.core.ValueState.None);
    AppCacheNav.to(AppCache_boxSetPassword);
    AppCache.setShellTitle(AppCache_boxSetPassword.getId());
}

if (!AppCache.setShellTitle) AppCache.setShellTitle = function (pageId) {
    const titles = {
        AppCache_boxLogon: AppCache_Screen_Login.getText(),
        AppCache_boxRegister: AppCache_Screen_Register.getText(),
        AppCache_boxForgot: txtFormForgotTitle.getText(),
        AppCache_boxReset: txtFormResetTitle.getText(),
        AppCache_boxSetPassword: txtFormSetPasswordTitle.getText(),
    };
    if (titles[pageId] !== undefined) {
        AppCacheShellTitle.setText(titles[pageId]);
        AppCacheShellTitle.setVisible(true);
    }
};

if (!AppCache._getLoginQuery) AppCache._getLoginQuery = function () {
    if (AppCache.mobileClient && AppCache.isMobile) {
        return "?mobileClientID=" + AppCache.mobileClient;
    }
    return "";
};