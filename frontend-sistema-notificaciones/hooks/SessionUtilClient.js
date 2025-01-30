"use client";

export const getId = () => {
    if (typeof window === "undefined") return null;
    return window.sessionStorage.getItem("user") || null;
};

export const getExternal = () => {
    if (typeof window === "undefined") return null;
    return window.sessionStorage.getItem("external") || null;
};

export const getToken = () => {
    if (typeof window === "undefined") return null;
    return window.sessionStorage.getItem("token") || null;
};

export const borrarSesion = () => {
    if (typeof window !== "undefined") {
        window.sessionStorage.clear();
    }
};

export const estaSesion = () => {
    if (typeof window === "undefined") return false;
    const token = window.sessionStorage.getItem("token");
    return Boolean(token && token !== "undefined" && token !== "null");
};
