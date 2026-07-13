let inMemoryAccessToken: string | null = null;

const authChannel = new BroadcastChannel("auth");
authChannel.onmessage = (event) => {
    if (event.data?.type === "token-refreshed") {
        setAccessToken(event.data.token);
    } else if (event.data?.type === "token-cleared") {
        // Set the underlying value directly rather than calling
        // clearAccessToken(), which would re-broadcast and loop forever.
        inMemoryAccessToken = null;
    }
};

export function setAccessToken(token: string) {
    inMemoryAccessToken = token;
}

export function getAccessToken() {
    return inMemoryAccessToken;
}

export function clearAccessToken() {
    inMemoryAccessToken = null;
    authChannel.postMessage({ type: "token-cleared" });
}

async function parseJSON(res: Response) {
    const text = await res.text();
    return text ? JSON.parse(text) : null;
}

async function rawFetch(endpoint: string, options?: RequestInit) {
    try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}${endpoint}`, {
            ...options,
        });
        if (!res.ok) {
            const data = await parseJSON(res);
            throw new Error(
                data?.detail || "An error occurred while fetching the API.",
            );
        }
        return parseJSON(res);
    } catch (error) {
        console.error("Fetch API error:", error);
        throw new Error("An error occurred while fetching the API.", {
            cause: error,
        });
    }
}

async function refreshAccessToken() {
    const tokenBeforeLock = getAccessToken();

    return navigator.locks.request("refresh-token-lock", async () => {
        // Another tab (or an in-flight call in this tab) may have already
        // refreshed while we were waiting for the lock. Skip the network
        // call and reuse that token instead of racing the refresh cookie.
        if (getAccessToken() !== tokenBeforeLock) {
            return;
        }

        const data = await rawFetch("/auth/refresh", {
            method: "POST",
            credentials: "include",
        });
        setAccessToken(data.access_token);
        authChannel.postMessage({ type: "token-refreshed", token: data.access_token });
    });
}

export async function fetchAPI(
    endpoint: string,
    options?: RequestInit,
    skipAuthCheck = false,
) {
    if (skipAuthCheck) {
        return rawFetch(endpoint, options);
    }

    const accessToken = getAccessToken();

    const res = await fetch(`${import.meta.env.VITE_API_URL}${endpoint}`, {
        ...options,
        headers: {
            ...options?.headers,
            Authorization: `Bearer ${accessToken}`,
        },
    });

    if (res.status === 401) {
        try {
            await refreshAccessToken();
        } catch (error) {
            clearAccessToken();
            throw new Error("Session expired. Please log in again.", {
                cause: error,
            });
        }

        const newAccessToken = getAccessToken();
        if (!newAccessToken) {
            clearAccessToken();
            throw new Error("Session expired. Please log in again.");
        }

        return rawFetch(endpoint, {
            ...options,
            headers: {
                ...options?.headers,
                Authorization: `Bearer ${newAccessToken}`,
            },
        });
    }

    if (!res.ok) {
        const data = await parseJSON(res);
        throw new Error(
            data?.detail || "An error occurred while fetching the API.",
        );
    }

    return parseJSON(res);
}
