let inMemoryAccessToken: string | null = null;

export function setAccessToken(token: string) {
    inMemoryAccessToken = token;
}

export function getAccessToken() {
    return inMemoryAccessToken;
}

export function clearAccessToken() {
    inMemoryAccessToken = null;
}

async function rawFetch(endpoint: string, options?: RequestInit) {
    try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}${endpoint}`, {
            ...options,
        });
        if (!res.ok) {
            const data = await res.json();
            throw new Error(
                data.detail || "An error occurred while fetching the API.",
            );
        }
        return res.json();
    } catch (error) {
        console.error("Fetch API error:", error);
        throw new Error("An error occurred while fetching the API.", {
            cause: error,
        });
    }
}

let refreshPromise: Promise<void> | null = null;

async function refreshAccessToken() {
    refreshPromise ??= (async () => {
        const data = await rawFetch("/auth/refresh", {
            method: "POST",
            credentials: "include",
        });
        setAccessToken(data.access_token);
    })().finally(() => {
        refreshPromise = null;
    });

    return refreshPromise;
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
        const data = await res.json();
        throw new Error(
            data.detail || "An error occurred while fetching the API.",
        );
    }

    return res.json();
}
