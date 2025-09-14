"use strict";
const providers = [
    { name: "Google", keywords: ["google", "gmail", "g+"] },
    { name: "Facebook", keywords: ["facebook", "meta"] },
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
    { name: "Phone", keywords: ["phone"] },
    { name: "Email", keywords: ["email"] },
];
function detectProvider(element) {
    const text = (element.textContent ||
        element.getAttribute("title") ||
        element.getAttribute("aria-label") ||
        "")
        .toLowerCase()
        .trim();
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
    const htmlElement = element;
    // Ensure unique id for this element and remove any previous marker tied to it
    if (!htmlElement._lastUsedId) {
        htmlElement._lastUsedId = Math.random().toString(36).slice(2, 9);
    }
    const elementId = htmlElement._lastUsedId;
    const existing = document.querySelector(`.last-used-marker[data-element-id="${elementId}"]`);
    if (existing)
        existing.remove();
    htmlElement.style.cssText = `
    ${htmlElement.style.cssText}
    border: 2px solid #4A90E2 !important;
    position: relative !important;
  `;
    const badge = document.createElement("span");
    badge.className = "last-used-marker";
    badge.setAttribute("data-element-id", elementId);
    badge.textContent = "Last used";
    badge.style.cssText = `
    position: absolute;
    font-size: 12px;
    line-height: 1;
    color: #111;
    background: #fff;
    padding: 4px 8px;
    border-radius: 9999px;
    border: 1px solid #4A90E2;
    box-shadow: 0 2px 6px rgba(0,0,0,0.12);
    white-space: nowrap;
    pointer-events: none;
  `;
    htmlElement.style.overflow = "visible";
    badge.style.top = "0";
    badge.style.right = "0";
    badge.style.transform = "translate(25%, -50%)";
    htmlElement.appendChild(badge);
}
function setupLoginButton(element, provider) {
    const domain = getCurrentDomain();
    const storageKey = `lastUsed_${domain}`;
    element.addEventListener("click", () => {
        chrome.storage.local.set({ [storageKey]: provider.name });
    });
    chrome.storage.local.get(storageKey, (result) => {
        if (result[storageKey] === provider.name) {
            addLastUsedMarker(element, provider);
        }
    });
}
function scanForLoginButtons() {
    const selectors = ["button", '[role="button"]'].join(", ");
    const formElements = document.querySelectorAll('form button, form input[type="submit"], form a');
    const allElements = document.querySelectorAll(selectors);
    const combinedElements = new Set([
        ...Array.from(allElements),
        ...Array.from(formElements),
    ]);
    combinedElements.forEach((element) => {
        const provider = detectProvider(element);
        if (provider && !element.hasAttribute("data-login-tracked")) {
            element.setAttribute("data-login-tracked", "true");
            setupLoginButton(element, provider);
        }
    });
}
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", scanForLoginButtons);
}
else {
    scanForLoginButtons();
}
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
