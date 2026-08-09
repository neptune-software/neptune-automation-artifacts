const loginProvider = neptune.Login.Utils.getLoginProvider(AppCache_loginTypes.getSelectedKey());
const logonid = loginProvider.type;

AppCache_inUsername.setValueState(sap.ui.core.ValueState.None);
AppCache_inPassword.setValueState(sap.ui.core.ValueState.None);

const rec = {
    username: AppCache_inUsername.getValue().toLowerCase(),
    password: AppCache_inPassword.getValue(),
    logonid: loginProvider.id,
};

// Custom Login App - Mobile Client
if (AppCache.isMobile) {
    AppCache.LogonCustom(rec);
    AppCache_inUsername.setValue();
    AppCache_inPassword.setValue();
    return;
}

if (!rec.username) {
    if (!rec.username) AppCache_inUsername.setValueState('Error');
    return;
}
if (!rec.password) {
    if (!rec.password) AppCache_inPassword.setValueState('Error');
    return;
}

switch (loginProvider.type) {

    case 'sap':
        // logonSAP(rec, loginProvider);
        AppCacheLogonSap.Logon(rec, loginProvider);
        break;
        
    case 'local':
        logonLocal(rec);       
        break;

    case 'ldap':
        logonLDAP(rec, loginProvider);
        break;

    default:
        console.error('Unhandled logon type');
        break;
}