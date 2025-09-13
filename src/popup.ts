interface StoredLoginData {
  [key: string]: string;
}

interface SiteData {
  domain: string;
  provider: string;
  storageKey: string;
}

class PopupManager {
  private currentDomain: string = "";
  private allSites: SiteData[] = [];

  constructor() {
    this.init();
  }

  private async init(): Promise<void> {
    await this.getCurrentTab();
    await this.loadAllSites();
    this.setupEventListeners();
    this.renderCurrentSite();
    this.renderSitesList();
  }

  private async getCurrentTab(): Promise<void> {
    try {
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });
      if (tab.url) {
        const url = new URL(tab.url);
        this.currentDomain = url.hostname.replace(/^www\./, "");
      }
    } catch (error) {
      console.error("Error getting current tab:", error);
      this.currentDomain = "unknown";
    }
  }

  private async loadAllSites(): Promise<void> {
    try {
      const result = await chrome.storage.local.get(null);
      this.allSites = Object.entries(result)
        .filter(([key]) => key.startsWith("lastUsed_"))
        .map(([key, provider]) => ({
          domain: key.replace("lastUsed_", ""),
          provider: provider as string,
          storageKey: key,
        }))
        .sort((a, b) => a.domain.localeCompare(b.domain));
    } catch (error) {
      console.error("Error loading sites:", error);
      this.allSites = [];
    }
  }

  private renderCurrentSite(): void {
    const domainElement = document.getElementById("current-domain");
    const providerElement = document.getElementById("current-provider");
    const clearButton = document.getElementById("clear-current");

    if (domainElement) {
      domainElement.textContent = this.currentDomain;
    }

    const currentSite = this.allSites.find(
      (site) => site.domain === this.currentDomain
    );

    if (providerElement) {
      if (currentSite) {
        providerElement.textContent = currentSite.provider;
        providerElement.className = "provider";
      } else {
        providerElement.textContent = "None yet";
        providerElement.className = "provider none";
      }
    }

    if (clearButton) {
      clearButton.style.display = currentSite ? "block" : "none";
    }
  }

  private renderSitesList(): void {
    const sitesListElement = document.getElementById("sites-list");
    if (!sitesListElement) return;

    if (this.allSites.length === 0) {
      sitesListElement.innerHTML =
        '<div class="empty">No login history yet. Start using login buttons on websites!</div>';
      return;
    }

    const searchInput = document.getElementById(
      "search-input"
    ) as HTMLInputElement;
    const searchTerm = searchInput?.value.toLowerCase() || "";

    const filteredSites = this.allSites.filter(
      (site) =>
        site.domain.toLowerCase().includes(searchTerm) ||
        site.provider.toLowerCase().includes(searchTerm)
    );

    if (filteredSites.length === 0) {
      sitesListElement.innerHTML =
        '<div class="empty">No sites match your search.</div>';
      return;
    }

    sitesListElement.innerHTML = filteredSites
      .map(
        (site) => `
        <div class="site-item">
          <span class="domain">${this.escapeHtml(site.domain)}</span>
          <div class="last-used">
            <span class="provider">${this.escapeHtml(site.provider)}</span>
            <button class="clear-btn" data-domain="${this.escapeHtml(
              site.domain
            )}" title="Clear for ${this.escapeHtml(site.domain)}">✕</button>
          </div>
        </div>
      `
      )
      .join("");

    // Add event listeners for individual clear buttons
    sitesListElement.querySelectorAll(".clear-btn").forEach((button) => {
      button.addEventListener("click", (e) => {
        const domain = (e.target as HTMLElement).getAttribute("data-domain");
        if (domain) {
          this.clearSiteData(domain);
        }
      });
    });
  }

  private escapeHtml(text: string): string {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  private async clearSiteData(domain: string): Promise<void> {
    const storageKey = `lastUsed_${domain}`;
    try {
      await chrome.storage.local.remove(storageKey);
      await this.loadAllSites();
      this.renderCurrentSite();
      this.renderSitesList();
    } catch (error) {
      console.error("Error clearing site data:", error);
    }
  }

  private async clearAllData(): Promise<void> {
    if (
      !confirm(
        "Are you sure you want to clear all login history? This cannot be undone."
      )
    ) {
      return;
    }

    try {
      const keysToRemove = this.allSites.map((site) => site.storageKey);
      await chrome.storage.local.remove(keysToRemove);
      await this.loadAllSites();
      this.renderCurrentSite();
      this.renderSitesList();
    } catch (error) {
      console.error("Error clearing all data:", error);
    }
  }

  private async refreshData(): Promise<void> {
    await this.loadAllSites();
    this.renderCurrentSite();
    this.renderSitesList();
  }

  private setupEventListeners(): void {
    // Clear current site button
    const clearCurrentButton = document.getElementById("clear-current");
    if (clearCurrentButton) {
      clearCurrentButton.addEventListener("click", () => {
        this.clearSiteData(this.currentDomain);
      });
    }

    // Clear all button
    const clearAllButton = document.getElementById("clear-all");
    if (clearAllButton) {
      clearAllButton.addEventListener("click", () => {
        this.clearAllData();
      });
    }

    // Refresh button
    const refreshButton = document.getElementById("refresh");
    if (refreshButton) {
      refreshButton.addEventListener("click", () => {
        this.refreshData();
      });
    }

    // Search input
    const searchInput = document.getElementById("search-input");
    if (searchInput) {
      searchInput.addEventListener("input", () => {
        this.renderSitesList();
      });
    }

    // Listen for storage changes
    chrome.storage.onChanged.addListener((changes, namespace) => {
      if (namespace === "local") {
        this.refreshData();
      }
    });
  }
}

// Initialize popup when DOM is loaded
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => new PopupManager());
} else {
  new PopupManager();
}
