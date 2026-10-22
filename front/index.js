const { PRIMARY_API_URL, FALLBACK_API_URL, TIMEOUT_MS } = window.APP_CONFIG;
const API_URLS = [PRIMARY_API_URL, FALLBACK_API_URL].filter(Boolean);

const statusElement = document.getElementById("status");
const form = document.getElementById("item-form");
const nameInput = document.getElementById("name");
const descriptionInput = document.getElementById("description");
const submitButton = document.getElementById("submit-btn");
const refreshButton = document.getElementById("refresh-btn");
const formMessage = document.getElementById("form-message");
const listMessage = document.getElementById("list-message");
const itemList = document.getElementById("item-list");

function showMessage(element, text, type) {
    element.textContent = text;
    element.className = "message " + (type || "");
}

// Une tentative sur un backend : echoue en cas d'erreur reseau,
// de delai depasse (AbortController) ou de reponse HTTP non reussie (!response.ok)
async function requestOnce(baseUrl, path, options) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
    try {
        const response = await fetch(baseUrl + path, {
            ...options,
            headers: { "Content-Type": "application/json", ...(options.headers || {}) },
            signal: controller.signal
        });
        const data = await response.json().catch(() => null);
        if (!response.ok) {
            throw new Error((data && data.error) || "Erreur HTTP " + response.status);
        }
        return data;
    } catch (error) {
        if (error.name === "AbortError") {
            throw new Error("delai de " + TIMEOUT_MS + " ms depasse");
        }
        throw error;
    } finally {
        clearTimeout(timer);
    }
}

// Essaie le backend principal, puis bascule vers le backend de secours
async function apiRequest(path, options = {}) {
    let lastError = null;
    for (const baseUrl of API_URLS) {
        try {
            const data = await requestOnce(baseUrl, path, options);
            return { data, baseUrl };
        } catch (error) {
            console.warn("Echec sur " + baseUrl + path + " : " + error.message);
            lastError = error;
        }
    }
    throw new Error("aucun backend disponible (" + lastError.message + ")");
}

async function checkHealth() {
    try {
        const { data, baseUrl } = await apiRequest("/api/health");
        statusElement.textContent = "Serveur : " + data.message + " (" + baseUrl + ")";
        statusElement.className = "status ok";
    } catch (error) {
        statusElement.textContent = "Les deux serveurs sont injoignables. Reessayez plus tard.";
        statusElement.className = "status error";
    }
}

function renderItems(items) {
    itemList.innerHTML = "";
    if (items.length === 0) {
        const li = document.createElement("li");
        li.className = "empty";
        li.textContent = "Aucun element pour le moment.";
        itemList.appendChild(li);
        return;
    }
    items.forEach((item) => {
        const li = document.createElement("li");
        const name = document.createElement("div");
        name.className = "item-name";
        name.textContent = item.name;
        li.appendChild(name);
        if (item.description) {
            const description = document.createElement("p");
            description.className = "item-description";
            description.textContent = item.description;
            li.appendChild(description);
        }
        itemList.appendChild(li);
    });
}

async function loadItems() {
    showMessage(listMessage, "Chargement...");
    try {
        const { data: items } = await apiRequest("/api/items");
        renderItems(items);
        showMessage(listMessage, "");
    } catch (error) {
        showMessage(listMessage, "Erreur : impossible de charger les elements (" + error.message + ")", "error");
    }
}

function generateRequestId() {
    if (window.crypto && crypto.randomUUID) {
        return crypto.randomUUID();
    }
    return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

// Identifiant unique d'une soumission : le meme est renvoye a chaque tentative
// (bascule ou nouvel essai) pour que le backend ne cree pas de doublon.
let pendingRequestId = null;
form.addEventListener("input", () => {
    pendingRequestId = null;
});

form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const name = nameInput.value.trim();
    const description = descriptionInput.value.trim();

    if (name.length < 2) {
        showMessage(formMessage, "Le nom doit contenir au moins 2 caracteres.", "error");
        return;
    }

    if (!pendingRequestId) {
        pendingRequestId = generateRequestId();
    }

    submitButton.disabled = true;
    showMessage(formMessage, "Envoi...");
    try {
        await apiRequest("/api/items", {
            method: "POST",
            body: JSON.stringify({ name, description, requestId: pendingRequestId })
        });
        pendingRequestId = null;
        form.reset();
        showMessage(formMessage, "Element ajoute.", "success");
        loadItems();
    } catch (error) {
        showMessage(formMessage, "Erreur : " + error.message, "error");
    } finally {
        submitButton.disabled = false;
    }
});

refreshButton.addEventListener("click", loadItems);

checkHealth();
loadItems();
