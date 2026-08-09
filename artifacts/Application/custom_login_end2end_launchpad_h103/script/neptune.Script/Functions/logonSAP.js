let AppCacheLogonSap = {
    sapData: null,

    Logon: function (rec, loginProvider) {

        sap.ui.core.BusyIndicator.show();
        AppCache.Auth = Base64.encode(JSON.stringify(rec));
        const { path } = loginProvider;
        const prefix = (!!AppCache?.Url) ? AppCache.Url : '';

        $.ajax({
            type: 'POST',
            contentType: 'application/json',
            url: `${prefix}/user/logon/sap/${path}${AppCache._getLoginQuery()}`,
            data: JSON.stringify(rec),
            headers: {
                'login-path': getLoginPath(),
            },
            success: function (data) {
                sap.ui.core.BusyIndicator.hide();

                if (data.status === 'UpdatePassword') {
                    AppCache.setEnableResetScreen();
                    AppCacheLogonSap.sapData = { detail: rec, path };

                } else {
                    location.reload(true);
                }
            },
            error: function (result, status) {
                if (result.status === 401) {
                    sap.m.MessageToast.show(AppCache_tWrongUserNamePass.getText());
                }
            }
        });
    },

    ResetPassword: function() {
        const { detail, path } = AppCacheLogonSap.sapData;
        sap.ui.core.BusyIndicator.show();

        const prefix = (!!AppCache?.Url) ? AppCache.Url : '';

        $.ajax({
            type: "POST",
            contentType: "application/json",
            url: `${prefix}/user/logon/sap/${path}${AppCache._getLoginQuery()}`,
            data: JSON.stringify({
                detail,
                password: inNewPasswordOne.getValue(),
            }),
            success: function (data) {
                sap.ui.core.BusyIndicator.hide();

                if (data.status === "UpdatePassword") {
                    sap.m.MessageToast.show(data.message);
                    inNewPasswordOne.setValueState("Error");
                    inRepeatPassword.setValueState("Error");
                } else {
                    AppCacheLogonSap.sapData = null;
                    location.reload();
                }
            },
            error: function (result, status) {
                sap.ui.core.BusyIndicator.hide();

                sap.m.MessageBox.show(result.responseJSON.status, {
                    title: "Error",
                    icon: "ERROR",
                    actions: ["CLOSE"],
                    onClose: function () {},
                });

                inNewPasswordOne.setValueState("Error");
                inRepeatPassword.setValueState("Error");
            },
        });
    },
};
