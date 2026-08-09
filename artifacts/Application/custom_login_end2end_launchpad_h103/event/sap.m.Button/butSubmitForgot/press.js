if (!inForgotUsername.getValue()) {
    inForgotUsername.setValueState('Error');
} else {
    inForgotUsername.setValueState(sap.ui.core.ValueState.None);

    const url = (() => {
        if (AppCache?.CurrentConfig) {
            return `/user/forgot/generate?launchpad=${AppCache.CurrentConfig}`;
        }
        return "/user/forgot/generate";
    })();

    $.ajax({
        type: "POST",
        contentType: "application/json",
        url,
        data: JSON.stringify({
            username: inForgotUsername.getValue().toLowerCase(),
        }),
        success: function (data) {
      
            neptune.Login.Utils.message({
                title: txtFormForgotTitle.getText(),
                text1: AppCache_tResetLinkText.getText(),
                state: 'Success',
                onClose: () => {
                    AppCache.setShellTitle(AppCache_boxLogon.getId());
                    AppCacheNav.back();
                },
            });
        },
    });
}