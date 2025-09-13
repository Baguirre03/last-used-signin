"use strict";
// Background script for Last Used Login Helper extension
chrome.runtime.onInstalled.addListener(() => {
    console.log("Last Used Login Helper extension installed");
});
// Listen for storage changes to sync across tabs
chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === "local") {
        // Notify all tabs about storage changes
        chrome.tabs.query({}, (tabs) => {
            tabs.forEach((tab) => {
                if (tab.id) {
                    chrome.tabs
                        .sendMessage(tab.id, {
                        type: "STORAGE_CHANGED",
                        changes: changes,
                    })
                        .catch(() => {
                        // Ignore errors for tabs that can't receive messages
                    });
                }
            });
        });
    }
});
// Handle messages from content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === "GET_DOMAIN_DATA") {
        const domain = request.domain;
        const storageKey = `lastUsed_${domain}`;
        chrome.storage.local.get(storageKey, (result) => {
            sendResponse(result);
        });
        return true; // Keep message channel open for async response
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
// Cleanup old storage entries (keep only last 100 domains)
chrome.runtime.onStartup.addListener(async () => {
    const result = await chrome.storage.local.get(null);
    const lastUsedKeys = Object.keys(result).filter((key) => key.startsWith("lastUsed_"));
    if (lastUsedKeys.length > 100) {
        // Remove oldest entries (this is a simple cleanup, could be enhanced with timestamps)
        const keysToRemove = lastUsedKeys.slice(100);
        chrome.storage.local.remove(keysToRemove);
    }
});
