if (!sap.n) sap.n = {};
neptune.Login = {};

if (typeof AppCache === 'undefined' || !AppCache) AppCache = {
    isDevice: false,
};

neptune.ui.attachInit(() => {
    modelAppCacheCurrentLayout.setData(AppCache.CurrentLayout);
    modelAppCacheConfig.setData({
        txtLogin1Enable: false,
        txtLogin2Enable: false,
        txtLogin3Enable: false,
        linkText1: "",
        linkText2: "",
        linkText3: "",
        txtLogin1: "",
        txtLogin2: "",
        txtLogin3: "",
    });
});