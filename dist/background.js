"use strict";
chrome.runtime.onInstalled.addListener(() => {
    console.log("Last Used Login Helper extension installed");
});
chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === "local") {
        chrome.tabs.query({}, (tabs) => {
            tabs.forEach((tab) => {
                if (tab.id) {
                    chrome.tabs.sendMessage(tab.id, {
                        type: "STORAGE_CHANGED",
                        changes: changes,
                    });
                }
            });
        });
    }
});
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === "GET_DOMAIN_DATA") {
        const domain = request.domain;
        const storageKey = `lastUsed_${domain}`;
        chrome.storage.local.get(storageKey, (result) => {
            sendResponse(result);
        });
        return true;
    }
    if (request.type === "CLEAR_DOMAIN_DATA") {
        const domain = request.domain;
        const storageKey = `lastUsed_${domain}`;
        chrome.storage.local.remove(storageKey, () => {
            sendResponse({ success: true });
        });
        return true;
    }
});
chrome.runtime.onStartup.addListener(async () => {
    const result = await chrome.storage.local.get(null);
    const lastUsedKeys = Object.keys(result).filter((key) => key.startsWith("lastUsed_"));
    if (lastUsedKeys.length > 100) {
        const keysToRemove = lastUsedKeys.slice(100);
        chrome.storage.local.remove(keysToRemove);
    }
});
