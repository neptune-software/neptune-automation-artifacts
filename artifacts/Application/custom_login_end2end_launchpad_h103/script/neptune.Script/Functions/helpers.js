function ui5PatchVersion(semantic) {
    semantic = semantic.toString() || '1.0';

    const [first, second] = semantic.split('.');
    let convertedFirst = first;
    let paddedSecond = second || '0';

    if (isNaN(+first)) {
        convertedFirst = '1';
        paddedSecond = '0';
    }
    if (paddedSecond.length < 3) {
        const zerosToAdd = 3 - paddedSecond.length;
        paddedSecond = '0'.repeat(zerosToAdd) + paddedSecond;
    }
    const number = parseInt(convertedFirst + paddedSecond);
    return number;
}

function ui5Compare(semantic1, semantic2) {
    const patchVersion1 = ui5PatchVersion(semantic1);
    const patchVersion2 = ui5PatchVersion(semantic2);
    if (patchVersion1 > patchVersion2) return 1;
    else if (patchVersion1 < patchVersion2) return -1;
    return 0;
}

function getUI5version() {
    let sMajor = sap.ui.getCore().getConfiguration().getVersion().getMajor();
    let sMinor = sap.ui.getCore().getConfiguration().getVersion().getMinor();
    return `${sMajor}.${sMinor}`;
}

function setLoginWidth() {
    const layout = AppCache.CurrentLayout;

    nepLaunchpadTopInner.removeStyleClass("nepLoginXXXLarge");
    nepLaunchpadTopInner.removeStyleClass("nepLoginXXLarge");
    nepLaunchpadTopInner.removeStyleClass("nepLoginXLarge");
    nepLaunchpadTopInner.removeStyleClass("nepLoginLarge");
    nepLaunchpadTopInner.removeStyleClass("nepLoginMedium");
    nepLaunchpadTopInner.removeStyleClass("nepLoginSmall");
    nepLaunchpadTopInner.removeStyleClass("nepLoginXSmall");
    nepLaunchpadTopInner.removeStyleClass("nepLoginXXSmall");
    nepLaunchpadTopInner.removeStyleClass("nepLoginXXXSmall");

    if (!!layout.LOGIN_WIDTH) {
        nepLaunchpadTopInner.addStyleClass(`nepLogin${layout.LOGIN_WIDTH}`);
        
    } else if (!!layout.HEADER_WIDTH) {
        nepLaunchpadTopInner.addStyleClass(`nepLogin${layout.HEADER_WIDTH}`);
    }
};

function externalAuthUserLogoutUsingPopup(url, closePopupAfterSecs=5000) {
    return new Promise((resolve, reject) => {
        const logoutPopup = window.open(url, '_blank', 'location=no,width=5,height=5,left=-1000,top=3000');
        
        // if pop-ups are blocked signout window.open will return null
        if (!logoutPopup) return resolve();
        
        logoutPopup.blur && logoutPopup.blur();

        if (isCordova()) {
            logoutPopup.addEventListener('loadstop', () => {
                logoutPopup.close();
                resolve();
            });
        } else {
            logoutPopup.onload = () => {
                logoutPopup.close();
                resolve();
            };

            logoutPopup.blur && logoutPopup.blur();

            setTimeout(() => {
                logoutPopup.close();
                resolve();
            }, closePopupAfterSecs);
        }
    });
}

function getLoginPath() {
    return `${AppCache?.CurrentConfig || location?.pathname || '/'}`;
}

function openDialogText1() {
    openDialogText(modelAppCacheConfig.getData().linkText1, modelAppCacheConfig.getData().txtLogin1);
}

function openDialogText2() {
    openDialogText(modelAppCacheConfig.getData().linkText2, modelAppCacheConfig.getData().txtLogin2);
}

function openDialogText3() {
    openDialogText(modelAppCacheConfig.getData().linkText3, modelAppCacheConfig.getData().txtLogin3);
}

function openDialogText(title, html) {
    objectHeaderText.setTitle(title);
    
    const textDiv = document.getElementById('textDiv');
    if (textDiv) textDiv.innerHTML = html;

    diaText.open();
}