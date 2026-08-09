
namespace AppCacheLogonOIDC {
    let config: {
        type: string;
        path: string;
        useRedirect: boolean;
    } = undefined;

    const redirectPathDialog = "/public/oidc_redirect.html";
    const redirectPath = (path: string) => `/user/logon/openid-connect/${path}/callback`;

    export async function Logon(options: typeof config) {
        config = options;

        const path = config.path;
        const url = new URL(`/user/logon/openid-connect/${path}`, window.origin);

        if (!config.useRedirect) {
            url.searchParams.set("callback", `${location.origin}${redirectPathDialog}`);
            const authParameters = await OIDC.showLogonPopupAndWaitForCallbackDesktop(url, redirectPathDialog);
            return OIDC.loginWithCode(authParameters, path, 'openid-connect');
        }
        const searchQuery = getSearchQuery();
        url.searchParams.set("path", searchQuery);
        url.searchParams.set("callback", `${location.origin}${redirectPath(path)}`);
        location.href = url.toString();
    }
}
