async function safeFetch<T = any, E = Error>(
    input: RequestInfo | URL,
    init?: RequestInit
): Promise<{ status: "network" | "ok" | "server" } & ResultOrError<T, E>> {
    const { data: response, error } = await tryCatch<Response, E>(fetch(input, init));

    if (error) {
        return { status: "network", data: null, error: error };
    }

    const data = await safeJson(response);

    if (response.ok) {
        return { status: "ok", data: data as T, error: null };
    }

    return { status: "server", data: null, error: data as E };
}

async function safeJson(res: { json: () => Promise<any> }) {
    try {
        return await res.json();
    } catch (e) {
        return null;
    }
}

function getSearchQuery() {
    return (location.pathname.substring(1) ? location.pathname : "") + location.search + location.hash;
}
