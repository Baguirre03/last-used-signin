"use strict";
const providers = [
    { name: "Google", keywords: ["google", "gmail", "g+"] },
    { name: "Facebook", keywords: ["facebook", "fb", "meta"] },
    { name: "GitHub", keywords: ["github", "git hub"] },
    { name: "Apple", keywords: ["apple", "icloud", "sign in with apple"] },
    {
        name: "Microsoft",
        keywords: ["microsoft", "outlook", "hotmail", "live", "msn"],
    },
    { name: "Twitter", keywords: ["twitter", "x.com"] },
    { name: "LinkedIn", keywords: ["linkedin"] },
    { name: "Discord", keywords: ["discord"] },
    { name: "Amazon", keywords: ["amazon"] },
    { name: "Yahoo", keywords: ["yahoo"] },
];
function detectProvider(element) {
    const text = (element.textContent ||
        element.getAttribute("title") ||
        element.getAttribute("aria-label") ||
        "").toLowerCase();
    const href = element.getAttribute("href")?.toLowerCase() || "";
    const className = element.className.toLowerCase();
    const id = element.id.toLowerCase();
    const searchText = `${text} ${href} ${className} ${id}`;
    for (const provider of providers) {
        if (provider.keywords.some((keyword) => searchText.includes(keyword))) {
            return provider;
        }
    }
    return null;
}
function getCurrentDomain() {
    return window.location.hostname.replace(/^www\./, "");
}
function addLastUsedMarker(element, provider) {
    // Remove existing marker if present
    const existingMarker = element.querySelector(".last-used-marker");
    if (existingMarker) {
        existingMarker.remove();
    }
    const marker = document.createElement("span");
    marker.className = "last-used-marker";
    marker.textContent = "⭐ Last used";
    marker.style.cssText = `
    margin-left: 6px;
    font-size: 0.8em;
    color: #ff6b35;
    font-weight: 500;
    background: rgba(255, 107, 53, 0.1);
    padding: 2px 6px;
    border-radius: 4px;
    display: inline-block;
  `;
    element.appendChild(marker);
}
function setupLoginButton(element, provider) {
    const domain = getCurrentDomain();
    const storageKey = `lastUsed_${domain}`;
    // Add click listener to track usage
    element.addEventListener("click", () => {
        chrome.storage.local.set({ [storageKey]: provider.name });
    });
    // Check if this was the last used provider for this domain
    chrome.storage.local.get(storageKey, (result) => {
        if (result[storageKey] === provider.name) {
            addLastUsedMarker(element, provider);
        }
    });
}
function scanForLoginButtons() {
    const selectors = [
        "button",
        'a[href*="login"]',
        'a[href*="signin"]',
        'a[href*="auth"]',
        'input[type="submit"]',
        ".login-btn",
        ".signin-btn",
        ".auth-btn",
        '[role="button"]',
    ].join(", ");
    const elements = document.querySelectorAll(selectors);
    elements.forEach((element) => {
        const provider = detectProvider(element);
        if (provider && !element.hasAttribute("data-login-tracked")) {
            element.setAttribute("data-login-tracked", "true");
            setupLoginButton(element, provider);
        }
    });
}
// Initial scan
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", scanForLoginButtons);
}
else {
    scanForLoginButtons();
}
// Re-scan when new content is added (for SPAs)
const observer = new MutationObserver((mutations) => {
    let shouldScan = false;
    mutations.forEach((mutation) => {
        if (mutation.type === "childList" && mutation.addedNodes.length > 0) {
            shouldScan = true;
        }
    });
    if (shouldScan) {
        setTimeout(scanForLoginButtons, 100);
    }
});
observer.observe(document.body, {
    childList: true,
    subtree: true,
});
