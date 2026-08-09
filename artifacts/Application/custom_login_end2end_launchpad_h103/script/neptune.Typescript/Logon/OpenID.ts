namespace OIDC {
    export async function setSessionNonce(type, path) {
        const nonce = ModelData.genID();
        const { status, data, error } = await safeFetch(`/user/logon/${type}/${path}/session`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ nonce }),
        });

        if (status === 'ok') {
            return data.nonce;
        }
        
        let message = 'Error setting session nonce: ';
        if ('status' in error) {
            message += error.status;
        } else {
            message += error.message;
        }

        sap.m.MessageToast.show(message);
    }

    export async function loginWithCode(
        authParameters: string,
        path: string,
        type: "openid-connect" | "azure-bearer",
    ) {
        const { status, data, error } = await safeFetch(`/user/logon/${type}/${path}/callback?${authParameters}`, {
            method: "GET",
            headers: {
                "X-Requested-With": "XMLHttpRequest",
            },
        });

        if (status === "ok") {
            if (data?.redirect) {
                location.href = data.redirect;
                return;
            }
            location.reload();
            return;
        }

        if ("status" in error) {
            sap.m.MessageToast.show(`Error logging in: ${error.status}`);
            return;
        }

        sap.m.MessageToast.show(`Error logging in: ${error.message}`);
    }

    export function showLogonPopupAndWaitForCallbackDesktop(url: URL, callbackPath: string): Promise<string> {
        return new Promise(function (resolve, reject) {
            const popupWin = showPopupDesktop(url);

            (function check() {
                if (popupWin.closed) {
                    reject(new Error("Logon popup closed!"));
                }

                let callbackUrl = "";
                try {
                    callbackUrl = popupWin.location.href || "";
                } catch (e) {
                    // This will continuously throw until we are redirect back to the same origin.
                }

                if (callbackUrl) {
                    const url = new URL(callbackUrl);
                    const error = url.searchParams.get("error");
                    if (error) {
                        popupWin.close();
                        return reject(new Error(error));
                    }
                    const isCallbackUrl = `${url.origin}${url.pathname}` === `${location.origin}${callbackPath}`;

                    if (isCallbackUrl) {
                        popupWin.close();
                        resolve(url.searchParams.toString());
                        return;
                    }
                }
                setTimeout(check, 100);
            })();
        });
    }

    function showPopupDesktop(url: URL) {
        const popUpWidth = 483;
        const popUpHeight = 600;

        const winLeft = window.screenLeft ? window.screenLeft : window.screenX;
        const winTop = window.screenTop ? window.screenTop : window.screenY;

        const width = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
        const height = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;

        const left = width / 2 - popUpWidth / 2 + winLeft;
        const top = height / 2 - popUpHeight / 2 + winTop;

        const logonWin = window.open(
            url,
            "Login ",
            "location=no,width=" + popUpWidth + ",height=" + popUpHeight + ",left=" + left + ",top=" + top
        );

        if (!logonWin) {
            return;
        }

        if (logonWin.focus) logonWin.focus();

        return logonWin;
    }
}
