neptune.Login.Utils = {
    message: function (config) {
        let title = config.title || 'Message';
        let intro = config.intro || '';
        let text1 = config.text1 || '';
        let text2 = config.text2 || '';
        let text3 = config.text3 || '';
        let icon = config.icon || '';

        objHeaderMessage.setTitle(title);
        objHeaderMessage.setIntro(intro);
        txtMessage1.setText(text1);
        txtMessage2.setText(text2);
        txtMessage3.setText(text3);
        acceptMessage.setText(config.acceptText);
        declineMessage.setText(config.declineText);

        txtMessage1.setVisible(!!text1);
        txtMessage2.setVisible(!!text2);
        txtMessage3.setVisible(!!text3);

        if (config.acceptText) {
            diaMessage.setBeginButton(acceptMessage);
        }
        
        if (config.declineText) {
            diaMessage.setEndButton(declineMessage);
        }

        objHeaderMessage.removeStyleClass('nepStateError nepStateWarning nepStateSuccess');

        switch (config.state) {
            case 'Error':
                objHeaderMessage.setIcon('sap-icon://fas/circle-exclamation');
                objHeaderMessage.addStyleClass('nepStateError');
                break;

            case 'Warning':
                objHeaderMessage.setIcon('sap-icon://fas/circle-exclamation');
                objHeaderMessage.addStyleClass('nepStateWarning');
                break;

            case 'Success':
                objHeaderMessage.setIcon('sap-icon://fas/circle-info');
                objHeaderMessage.addStyleClass('nepStateSuccess');
                break;

            default:
                objHeaderMessage.setIcon('sap-icon://fas/circle-info');
                break;
        }

        if (icon) {
            objHeaderMessage.setIcon(icon);
        }

        diaMessage.onClose = config.onClose || function () { };
        diaMessage.onAccept = config.onAccept || function () { };
        diaMessage.onDecline = config.onDecline || function () { };
        diaMessage.open();
    },

    initLoginScreen: function () {

        const data = modelDataSettings.getData();

        let logonTypes = Array.isArray(data.logonTypes) ? data.logonTypes : [];
        logonTypes = logonTypes.filter((loginType) => loginType.show & loginType.type !== "jwt-validation");
        if (AppCache.isMobile) logonTypes.filter((loginType) => loginType.type !== "oauth2");
        logonTypes.sort(sort_by("name", false));

        AppCache_loginTypes.removeAllItems();
        
        logonScreen.isExternal = data.launchpadIsExternal || false;
        logonScreen.smtpVerified = data.showForgotPassword || false;
        logonScreen.hideLoginSelection = data?.settingsLaunchpad?.config?.hideLoginSelection || false;

        let showLoginLocal = (!data.disableLocalAuth);
        if (data?.settingsLaunchpad?.config) {
            showLoginLocal = (data?.settingsLaunchpad?.config && !data.settingsLaunchpad.config.hideLoginLocal);
        }
        const internalLogonTypes = logonTypes.filter((loginType) =>
            ["local", "ldap", "sap"].includes(loginType.type)
        );
        let externalLogonTypes = logonTypes.filter((loginType) =>
            ["azure-bearer", "openid-connect", "saml", "oauth2"].includes(loginType.type)
        );
        const localDefaultIDP = internalLogonTypes.find(obj => obj.id === AppCache.defaultLoginIDP);
        const externalDefaultIDP = externalLogonTypes.find(obj => obj.id === AppCache.defaultLoginIDP);
        
        // If there are no login providers configred, always show local no matter what is configured on the launchpad
        if (internalLogonTypes.length === 0 && externalLogonTypes.length === 0) {
            showLoginLocal = true;
        }

        if (showLoginLocal) {
            AppCache_loginTypes.addItem(
                new sap.ui.core.Item({
                    key: "local",
                    text: "Local",
                })
            );
        }

        if (internalLogonTypes.length > 0) {
            internalLogonTypes.forEach((loginType) => {
                AppCache_loginTypes.addItem(
                    new sap.ui.core.Item({
                        key: loginType.id,
                        text: loginType.name,
                    })
                );
            });
        }

        if (data?.settingsLaunchpad?.config?.hideLoginSelection || AppCache_loginTypes.getItems().length <= 1) {
            AppCache_loginTypes.setVisible(false);
        } else {
            AppCache_loginTypes.setVisible(true);
        }

        if (AppCache_loginTypes.getItems().length > 0) {
            if (localDefaultIDP) {
                AppCache_loginTypes.setSelectedKey(localDefaultIDP.id);
            } else {
                AppCache_loginTypes.setSelectedKey(AppCache_loginTypes.getItems()[0].getKey());
            }
            neptune.Login.Utils.setupLoginScreen(AppCache_loginTypes.getSelectedKey());
        }

        let showLoginForm = (AppCache_loginTypes.getItems().length > 0);
        if (logonScreen.hideLoginSelection && externalDefaultIDP) {
            showLoginForm = false;
            externalLogonTypes = externalLogonTypes.filter(loginType => loginType.id === externalDefaultIDP.id);
        }
        AppCache_formLogon.setVisible(showLoginForm);
        AppCache_boxLogonButton.setVisible(showLoginForm);
        if (!showLoginForm) txtLogonSeparateProviders.setText(AppCache_tLoginWith.getText());

        /*
         * External Login Providers
         */
        boxLogonIDP.destroyItems();

        AppCache_boxLogonProviders.setVisible(externalLogonTypes.length > 0);

        let loginProviderCss = '';

        externalLogonTypes.forEach((loginType, ix) => {
            let btnIcon = (!!loginType.btnIcon) ? loginType.btnIcon : "sap-icon://nep/authentication";
            const btmImg = (AppCache?.CurrentLayout?.THEME_BRIGHTNESS === 'Dark') ? loginType.btnDarkImage : loginType.btnImage;
            if (btmImg) btnIcon = btmImg;

            const btnText = (!!loginType.btnText) ? loginType.btnText : loginType.name;
            const providerId = loginType.name.toLowerCase().replace(/[^a-z0-9]/g, '');

            const boxProvider = new sap.m.HBox(`boxProvider-${ix}-${providerId}`, {
                renderType: "Bare",
                width: "100%"
            });
            boxLogonIDP.addItem(boxProvider);

            const btnProvider = new sap.m.Button(`AppCache_butLogon-${ix}-${providerId}`, {
                visible: true,
                icon: btnIcon,
                text: btnText,
                tooltip: loginType.description || loginType.name,
                press: async function (oEvent, ui) {
                    AppCache_inUsername.setValue("");
                    AppCache_inPassword.setValue("");
                    AppCache_inUsername.setValueState(sap.ui.core.ValueState.None);
                    AppCache_inPassword.setValueState(sap.ui.core.ValueState.None);

                    if (loginType.type === "azure-bearer") AppCacheLogonAzure.Logon(loginType);
                    else if (loginType.type === "openid-connect") AppCacheLogonOIDC.Logon(loginType);
                    else if (loginType.type === "oauth2") logonOauth2(loginType);
                    else if (loginType.type === "saml") logonSAML(loginType);
                },
            }).addStyleClass(`nepLogonButtonBtn nepLogonButtonBtnProvider`);

            const btnStyleClass = (!!loginType.btnStyleClass) ? loginType.btnStyleClass : `nepLogonButtonBtn-${loginType.id}`;
            btnProvider.addStyleClass(btnStyleClass);

            loginProviderCss += neptune.Style.getLoginProviderCss({
                ...loginType,
                btnStyleClass: btnStyleClass,
            });

            boxProvider.addItem(btnProvider);
        });

        const elem = document.getElementById("LoginProviderStyleDiv");
        if (!!elem) elem.innerHTML = loginProviderCss;
    },

    getLoginProvider: function(providerId) {
        let loginProviders = modelDataSettings.getData().logonTypes;
        if (!Array.isArray(loginProviders)) loginProviders = [];

        const loginProvider = loginProviders.find((loginProvider) => loginProvider.id === providerId);
        if (loginProvider) {
            return loginProvider;            
        } else {
            return { 
                id: 'local',
                type: 'local'
            };
        }
    },

    setupLoginScreen: function (loginProviderId) {

        const loginProvider = neptune.Login.Utils.getLoginProvider(loginProviderId);
        localStorage.setItem('selectedLoginType', loginProvider.type);
        localStorage.setItem('p9logonData', JSON.stringify(loginProvider));
        
        linkForgot.setVisible(false);
        AppCache_boxLogonSeparatorRegister.setVisible(false);
        AppCache_boxLogonRegister.setVisible(false);

        if (['local', 'sap'].includes(loginProvider.type)) {
            if (logonScreen.isExternal) {
                AppCache_boxLogonSeparatorRegister.setVisible(true);
                AppCache_boxLogonRegister.setVisible(true);
            }
            linkForgot.setVisible(logonScreen.smtpVerified && !AppCache.isMobile);
            localStorage.removeItem("p9logonData");
        }
    }
}