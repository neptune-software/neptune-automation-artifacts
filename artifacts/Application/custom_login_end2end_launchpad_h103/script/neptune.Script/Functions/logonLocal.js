function logonLocal(rec) {
    $.ajax({
        type: 'POST',
        contentType: 'application/json',
        url: '/user/logon/local',
        headers: {
            'login-path': location.pathname,
        },
        data: JSON.stringify(rec),
        success: function (data, xhr) {
            if (data.status === "UpdatePassword") {
                const url = new URL(data.link, location.href);
                url.searchParams.append('reason', data.reason || 'other');
                url.searchParams.append('redirect', encodeURIComponent(location.href));
                location.replace(url.toString());
            } else {
                location.reload(true);
            }        
        },
        error: function (result, status, other) {
            console.log(result, status, other)
            if (result.status === 401) {
                AppCache_inUsername.setValueState('Error');
                AppCache_inPassword.setValueState('Error');
                sap.m.MessageToast.show(AppCache_tWrongUsernamePassword.getText());
            } 
            else {
                if (result.responseJSON) {
                    sap.m.MessageToast.show(result.status + ': ' + result.responseJSON.status);
                } else {
                    sap.m.MessageToast.show(result.status + ': ' + result.statusText);
                }
            }
        }
    });
}
