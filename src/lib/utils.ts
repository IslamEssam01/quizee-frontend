import { clsx, type ClassValue } from "clsx";
import { toast } from "sonner";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export async function fetchAPI(endpoint: string, options?: RequestInit) {
    try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}${endpoint}`, {
            credentials: "include",
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
        throw error;
    }
}

export function errorToast(msg: string) {
    toast.error(msg, { duration: 2000 });
}
