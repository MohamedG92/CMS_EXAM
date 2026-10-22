const API_URL = window.APP_CONFIG.API_URL;

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

// Appel API : leve une erreur si le reseau echoue ou si la reponse HTTP n'est pas OK
async function apiRequest(path, options = {}) {
    const response = await fetch(API_URL + path, {
        ...options,
        headers: { "Content-Type": "application/json", ...(options.headers || {}) }
    });
    const data = await response.json().catch(() => null);
    if (!response.ok) {
        throw new Error((data && data.error) || "Erreur HTTP " + response.status);
    }
    return data;
}

async function checkHealth() {
    try {
        const data = await apiRequest("/api/health");
        statusElement.textContent = "Serveur : " + data.message;
        statusElement.className = "status ok";
    } catch (error) {
        statusElement.textContent = "Serveur injoignable";
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
        const items = await apiRequest("/api/items");
        renderItems(items);
        showMessage(listMessage, "");
    } catch (error) {
        showMessage(listMessage, "Erreur : impossible de charger les elements (" + error.message + ")", "error");
    }
}

form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const name = nameInput.value.trim();
    const description = descriptionInput.value.trim();

    if (name.length < 2) {
        showMessage(formMessage, "Le nom doit contenir au moins 2 caracteres.", "error");
        return;
    }

    submitButton.disabled = true;
    showMessage(formMessage, "Envoi...");
    try {
        await apiRequest("/api/items", {
            method: "POST",
            body: JSON.stringify({ name, description })
        });
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
