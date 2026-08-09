namespace AppCacheLogonAzure {
    let config: {
        type: string;
        path: string;
        azureMSALv2: string;
        useRedirect: boolean;
        clientID: string;
        tenantId: string;
        prompt: string;
    } = undefined;

    let msalClient = null;

    const redirectPathDialog = "/public/azure_redirect.html";
    const redirectPath = (path: string) => `/user/logon/azure-bearer/${path}/callback`;

    export async function Logon(options: typeof config) {
        config = options;

        if (useMsal()) {
            return loginMsal();
        }

        const path = config.path;
        const url = new URL(`/user/logon/azure-bearer/${path}`, window.origin);

        if (!config.useRedirect) {
            url.searchParams.set("callback", `${location.origin}${redirectPathDialog}`);
            const authParameters = await OIDC.showLogonPopupAndWaitForCallbackDesktop(url, redirectPathDialog);
            return OIDC.loginWithCode(authParameters, path, "azure-bearer");
        }
        const searchQuery = getSearchQuery();            
        url.searchParams.set("path", searchQuery);
        url.searchParams.set("callback", `${location.origin}${redirectPath(path)}`);
        location.href = url.toString();
    }    

    function useMsal() {
        if (typeof msal !== "undefined" && config.azureMSALv2) return true;
    }

    async function initMsal() {
        msalClient = new msal.PublicClientApplication({
            auth: {
                clientId: config.clientID,
                authority: "https://login.microsoftonline.com/" + config.tenantId,
                redirectUri: location.origin + redirectPathDialog,
            },
            cache: {
                cacheLocation: "sessionStorage",
                storeAuthStateInCookie: false, // Set this to 'true' if you are having issues on IE11 or Edge
            },
        });
        await msalClient.initialize();
    }

    async function loginMsal() {
        if (!msalClient) {
            await initMsal();
        }

        const nonce = await OIDC.setSessionNonce("azure-bearer", config.path);

        try {
            const response = await msalClient.loginPopup({
                scopes: ["openid", "profile", "offline_access", "user.read"],
                prompt: config.prompt || "select_account",
                nonce,
            });

            void loginWithIDToken(response);
        } catch (error) {
            if (error && error.toString().indexOf("Failed to fetch") > -1) {
                sap.m.MessageToast.show(
                    "Failed to fetch token. Redirect URI in azure must be set to Single Page Application"
                );
            } else {
                sap.m.MessageToast.show(error.toString());
            }
        }
    }

    async function loginWithIDToken({ idToken, refreshToken }: { idToken: string; refreshToken: string }) {
        const { status, error } = await safeFetch(`/user/logon/azure-bearer/${config.path}`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${idToken}`,
                "Content-Type": "application/json",
                "X-Requested-With": "XMLHttpRequest",
                "login-path": location.pathname,
            },
            body: JSON.stringify({ refreshToken }),
        });

        if (status === "ok") {
            location.reload();
            return;
        }

        if ("status" in error) {
            sap.m.MessageToast.show(`Error logging in: ${error.status}`);
            return;
        }

        sap.m.MessageToast.show(`Error logging in: ${error.message}`);
    }
}
