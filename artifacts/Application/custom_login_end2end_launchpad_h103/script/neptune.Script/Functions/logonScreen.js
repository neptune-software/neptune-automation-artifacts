let logonScreen = {
    smtpVerified: false,
    isExternal: false,
    sapData: null,

    getLogonTypes: function () {
        let query = "";

        // From Browser
        if (location.pathname.toLowerCase().indexOf("/launchpad/") > -1) {
            let path = location.pathname.split("/");
            query = "?launchpad=" + path[path.length - 1];
        }

        $.ajax({
            type: "GET",
            url: "/user/logon/types" + query,
            success: function (data) {
                logonScreen.setSettings(data);
            },
            error: function (result, status) {},
        });
    },

    getDefaultLanguage: function (config) {

        let defaultLanguage = config.defaultLanguage;
        if (!!defaultLanguage) return defaultLanguage;

        let locales = config?.locales;
        if (!Array.isArray(locales) || locales.length === 0) locales = (!!AppCache.config.locales) ? AppCache.config.locales : [];
        const navigatorLanguages = navigator?.languages ?? [];

        const micro = navigatorLanguages.some(nav => {
            const locale = locales.find(locale => {
                const tags = locale.LOCALE.split(',');
                return (tags.includes(nav));
            });
            if (locale) {
                defaultLanguage = locale.ISOCODE;
                return true;
            }
        });
        if (micro) return defaultLanguage;

        const macro = navigatorLanguages.some(nav => {
            const locale = locales.find(locale => {
                const tags = locale.LOCALE.split(',').map(obj => obj.slice(0,2));
                return (tags.includes(nav.slice(0,2)));
            });
            if (locale) {
                defaultLanguage = locale.ISOCODE;
                return true;
            }
        });
        if (macro) return defaultLanguage;

        if (!!config.fallbackLanguage) return config.fallbackLanguage;

        return 'EN';
    },

    setSettings: function (data) {

        modelDataSettings.setData(data);
        setCacheDataSettings();

        let language = 'EN';

        if (data?.settingsLaunchpad?.config) {
            language = logonScreen.getDefaultLanguage(data.settingsLaunchpad.config);
        }

        const langSearchParam = new URLSearchParams(location.search).get('lang') ?? false;
        if (langSearchParam) {
            language = langSearchParam.trim().toUpperCase();
        }

        const laiso = language.toLowerCase();
        const promises = [];
        const allLibs = sap.ui.getCore().getLoadedLibraries();

        const excludedLibs = ['nep.ai'];

        for (let lib in allLibs) {
            if (allLibs[lib].loadResourceBundle && !excludedLibs.includes(lib)) {
                promises.push(allLibs[lib].loadResourceBundle(laiso));
            }
        }

        Promise.all(promises).finally(function() {

            sap.ui.getCore().getConfiguration().setLanguage(laiso);

            const translations = AppCache.LoginTranslation;
            if (typeof translations !== "undefined" && Object.keys(translations).length > 0) {
                Object.entries(translations).forEach(([fieldName, attributes]) => {
                    const obj = sap.ui.getCore().byId(fieldName);
                    if (obj) {
                        Object.entries(attributes).forEach(([attributeName, translationMap]) => {
                            const translated = translationMap[language];
                            if (!!translated) {
                                switch (attributeName) {
                                    case "text":
                                        obj.setText(translated);
                                        break;
                                    case "intro":
                                        obj.setIntro(translated);
                                        break;
                                    case "title":
                                        obj.setTitle(translated);
                                        break;
                                    case "tooltip":
                                        obj.setTooltip(translated);
                                        break;
                                    case "placeholder":
                                        obj.setPlaceholder(translated);
                                        break;
                                    case "headerText":
                                        obj.setHeaderText(translated);
                                        break;
                                    case "noDataText":
                                        obj.setNoDataText(translated);
                                        break;
                                    case "buttonText":
                                        obj.setButtonText(translated);
                                        break;
                                    default:
                                        if (neptune.debug.appcache) console.error(
                                            `translation attribute function not set`,
                                            attributeName
                                        );
                                }
                            }
                        });
                    }
                });
            }

            // Initialize login screen
            neptune.Login.Utils.initLoginScreen();

            // Get System Name/Description
            if (data.settings.name) {
                AppCache_txtSystemName.setText(neptune.i18n.getText(data.settings.name));
            }
            if (data.settings.description){
                AppCache_txtSystemDescription.setText(neptune.i18n.getText(data.settings.description));
            }

            // Launchpad Config
            if (data?.settingsLaunchpad?.config) {
                if (data.settingsLaunchpad.config.loginTitle) {
                    AppCache_txtSystemName.setText(
                        neptune.i18n.getText(data.settingsLaunchpad.config.loginTitle)
                    );
                }
                if (data.settingsLaunchpad.config.loginSubTitle) {
                    AppCache_txtSystemDescription.setText(
                        neptune.i18n.getText(data.settingsLaunchpad.config.loginSubTitle)
                    );
                }
            }

            if (Array.isArray(data.customizing) && data.customizing.length) {
                const customizing = data.customizing[0] || {};
                const translation = Array.isArray(customizing?.translation) ? customizing.translation : [];
                const local = translation.find(obj => obj.language === language) || {};
                const configData = modelAppCacheConfig.getData();

                configData.txtLogin1Enable = customizing.txtLogin1Enable || false;
                configData.txtLogin2Enable = customizing.txtLogin2Enable || false;
                configData.txtLogin3Enable = customizing.txtLogin3Enable || false;

                if (configData.txtLogin1Enable) {
                    configData.linkText1 = customizing.txtLogin1Label;
                    if (local.txtLogin1Label) configData.linkText1 = local.txtLogin1Label;

                    configData.txtLogin1 = customizing.txtLogin1;
                    if (local.txtLogin1) configData.txtLogin1 = local.txtLogin1;
                }

                if (customizing.txtLogin2Enable) {
                    configData.linkText2 = customizing.txtLogin2Label;
                    if (local.txtLogin2Label) configData.linkText2 = local.txtLogin2Label;

                    configData.txtLogin2 = customizing.txtLogin2;
                    if (local.txtLogin2) configData.txtLogin2 = local.txtLogin2;
                }

                if (customizing.txtLogin3Enable) {
                    configData.linkText3 = customizing.txtLogin3Label;
                    if (local.txtLogin3Label) configData.linkText3 = local.txtLogin3Label;

                    configData.txtLogin3 = customizing.txtLogin3;
                    if (local.txtLogin3) configData.txtLogin3 = local.txtLogin3;
                }
                modelAppCacheConfig.refresh();
            }

            // Call Custom Settings
            setSettingsCustom(data);
        });
    },

    resetPassword: function () {

        if (inNewPasswordOne.getValue() !== inNewPasswordTwo.getValue()) {
            sap.m.MessageToast.show("Password confirmation doesn't match password");

        } else if (!inNewPasswordOne.getValue()) {
            sap.m.MessageToast.show("Please provide a password");

        } else {
            if (AppCacheLogonSap.sapData) {
                return AppCacheLogonSap.resetPassword();
            }

            const url = new URL(location.href);
            const token = url.searchParams.get("token");

            sap.ui.core.BusyIndicator.show();
            $.ajax({
                type: "POST",
                contentType: "application/json",
                url: "/user/forgot/reset",
                data: JSON.stringify({
                    token,
                    password: inNewPasswordOne.getValue(),
                }),
                success: function (data) {
                    sap.ui.core.BusyIndicator.hide();
                    sap.m.MessageToast.show("Password updated");

                    setTimeout(function () {
                        const redirect = new URL(location.href).searchParams.get("redirect");
                        if (redirect) {
                            const redirectUrl = new URL(decodeURIComponent(redirect), location.origin);
                            redirectUrl.searchParams.delete('token');
                            redirectUrl.searchParams.delete('reason');
                            location.href = redirectUrl.toString();
                        } else {
                            AppCache.setEnableLogonScreen();
                            window.history.pushState(
                                {},
                                document.title,
                                location.href.split("?token=")[0]
                            );
                        }
                    }, 500);
                },
                error: function (result, status) {
                    sap.ui.core.BusyIndicator.hide();

                    console.error(result.responseJSON.status);
                    sap.m.MessageBox.show(result.responseJSON.status, {
                        title: "Error",
                        icon: "ERROR",
                        actions: ["CLOSE"],
                        onClose: function () {},
                    });

                    inNewPasswordOne.setValueState("Error");
                    inNewPasswordTwo.setValueState("Error");
                },
            });
        }
    },

    createPassword: function () {

        if (inSetPasswordOne.getValue() !== inSetPasswordTwo.getValue()) {
            sap.m.MessageToast.show("Password confirmation doesn't match password");

        } else if (!inSetPasswordOne.getValue()) {
            sap.m.MessageToast.show("Please provide a password");

        } else {

            const url = new URL(location.href);
            const token = url.searchParams.get("token");

            sap.ui.core.BusyIndicator.show();
            $.ajax({
                type: "POST",
                contentType: "application/json",
                url: "/user/activation/create",
                data: JSON.stringify({
                    token,
                    password: inSetPasswordOne.getValue(),
                }),
                success: function (data) {
                    sap.ui.core.BusyIndicator.hide();
                    sap.m.MessageToast.show("Account created");

                    setTimeout(function () {
                        const redirect = new URL(location.href).searchParams.get("redirect");
                        if (redirect) {
                            const redirectUrl = new URL(decodeURIComponent(redirect), location.origin);
                            redirectUrl.searchParams.delete('token');
                            redirectUrl.searchParams.delete('reason');
                            location.href = redirectUrl.toString();
                        } else {
                            AppCache.setEnableLogonScreen();
                            AppCache_inUsername.setValue(data.username);
                            window.history.pushState(
                                {},
                                document.title,
                                location.href.split("?activation&token=")[0]
                            );
                        }
                    }, 500);
                },
                error: function (result, status) {
                    sap.ui.core.BusyIndicator.hide();

                    console.error(result.responseJSON.status);
                    sap.m.MessageBox.show(result.responseJSON.status, {
                        title: "Error",
                        icon: "ERROR",
                        actions: ["CLOSE"],
                        onClose: function () {},
                    });

                    inSetPasswordOne.setValueState("Error");
                    inSetPasswordTwo.setValueState("Error");
                },
            });
        }
    },
};
