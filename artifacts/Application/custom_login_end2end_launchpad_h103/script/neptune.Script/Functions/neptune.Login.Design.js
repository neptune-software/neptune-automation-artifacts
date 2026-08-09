neptune.Login.Design = {};

neptune.Login.Design.applyLayout = function(config) {

    const layout = AppCache?.CurrentLayout || {};

    let theme = "sap_horizon";
    let baseTheme = "sap_horizon";
    let themeRoot = ``;
    let themeBrightness = `Light`;

    if (layout?.THEME?.startsWith('neptune-generated') || layout?.THEME?.startsWith('neptune-horizon')) {
        theme = layout.THEME.includes('light') ? 'sap_horizon' : 'sap_horizon_dark';
        baseTheme = theme;
        themeRoot = '';
        themeBrightness = layout?.THEME_BRIGHTNESS;

    } else if (layout?.THEME) {
        theme = layout.THEME.toLowerCase();
        baseTheme = layout.BASE_THEME || theme;
        themeRoot = layout.THEME_ROOT;
        themeBrightness = layout.THEME_BRIGHTNESS;
    }

    $('html').attr('class', (i, c)=>{
        return c.replace(/(^|\s)nepBaseTheme-\S+/g, '');
    });
    document.documentElement.classList.add("nepBaseTheme-" + baseTheme);

    document.documentElement.classList.remove("sapContrastPlus");
    document.documentElement.classList.remove("nepThemeLight");
    document.documentElement.classList.remove("nepThemeDark");
    document.documentElement.classList.remove("nepTheme");
    document.documentElement.classList.remove("nepMat");
    document.documentElement.classList.add("nepTheme" + themeBrightness);
    document.documentElement.classList.add("nepLayout");


    if (ui5Compare(getUI5version(), '1.120') >= 0) {
        sap.ui.require(["sap/ui/core/Theming"], (Theme) => {
            if (layout?.THEME?.startsWith("neptune-generated") || layout?.THEME?.startsWith("neptune-horizon")) {
                if (theme !== Theme.getTheme()) {
                    Theme.setTheme(theme);
                } else {
                    neptune.Login.Design.afterTheme();
                }
                neptune.Style.setCssVariables(layout.THEME, neptune.generatedAt, false);

            } else if (theme !== Theme.getTheme()) {
                if (typeof themeRoot !== "undefined" && !!themeRoot) {
                    if (AppCache.isMobile && themeRoot.indexOf("/") === 0) {
                        themeRoot = themeRoot.substring(1);
                    }
                    Theme.setThemeRoot(theme, themeRoot);
                }
                Theme.setTheme(theme);
                if (ui5Compare(getUI5version(), '1.136') < 0) {
                    neptune.Style.setCssVariables(theme, neptune.generatedAt, false);
                } else {
                    neptune.Style.clearCssVariables();
                }

            } else {
                neptune.Login.Design.afterTheme();
            }
        });

    } else {
        if (theme !== sap.ui.getCore().getConfiguration().getTheme()) {        
            if (typeof themeRoot !== "undefined" && !!themeRoot) {
                if (AppCache.isMobile && themeRoot.indexOf("/") === 0) {
                    themeRoot = themeRoot.substring(1);
                }
                sap.ui.getCore().applyTheme(theme, themeRoot);

            } else {
                sap.ui.getCore().applyTheme(theme);
            }

        } else {
            neptune.Login.Design.afterTheme();
        }
    }
};

neptune.Login.Design.afterTheme = function() {

    if (!AppCache.CurrentLayout) return;

    neptune.Style.setCssVariables(AppCache?.CurrentLayout?.THEME);

    const style = neptune.Style.getLayoutCss({
        layout: AppCache.CurrentLayout,
        isDevice: AppCache.isMobile,
        tileLayoutData: null,
        groupLayoutData: null,
        customLogo: AppCache.CustomLogo,
    });
    // Branding image updated in neptune.Style.getLayoutCss
    modelAppCacheCurrentLayout.refresh();
    
    document.documentElement.classList.remove("nepLoginPlacementLeft", "nepLoginPlacementRight");
    if (modelAppCacheCurrentLayout.getData().LOGIN_PLACEMENT) {
        document.documentElement.classList.add(`nepLoginPlacement${modelAppCacheCurrentLayout.getData().LOGIN_PLACEMENT}`);
    }

    setLoginWidth();

    // Not mobile, only desktop and PWA
    if (!AppCache.isMobile) {
        const link = document.querySelector("link[type='image/x-icon']") || document.createElement('link');
        link.type = 'image/x-icon';
        link.rel = 'shortcut icon';
        link.href = AppCache.CurrentLayout.FAVICON;
        document.getElementsByTagName('head')[0].appendChild(link);
    }
    
    const elem = document.getElementById("NeptuneStyleCSSDiv")
    if (!!elem) elem.innerHTML = style.css;
    
    if (neptune.Login.Splash.init) neptune.Login.Splash.hide();
};

sap.ui.require(["sap/ui/core/Theming"], (Theme) => {
    if (!!Theme) {
        Theme.attachApplied(()=>{
            neptune.Login.Design.afterTheme();
        });

    } else {
        sap.ui.getCore().attachThemeChanged(()=>{
            neptune.Login.Design.afterTheme();
        });
    }
}, (e) => {
    sap.ui.getCore().attachThemeChanged(()=>{
        neptune.Login.Design.afterTheme();
    });
});
    
neptune.Login.Splash.init = true;
neptune.Login.Design.applyLayout();