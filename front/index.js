const API_URL = "https://mohamed-iraqi-cms.vercel.app";

const form = document.getElementById("item-form");
const nameInput = document.getElementById("name");
const descriptionInput = document.getElementById("description");
const submitButton = document.getElementById("submit-btn");
const submitLabel = submitButton.querySelector(".btn-label");
const formMessage = document.getElementById("form-message");
const listMessage = document.getElementById("list-message");
const itemList = document.getElementById("item-list");
const itemCount = document.getElementById("item-count");
const charCount = document.getElementById("char-count");
const apiStatus = document.getElementById("api-status");
const apiStatusText = document.getElementById("api-status-text");

const dateFormat = new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit"
});

function showMessage(element, text, type) {
    element.textContent = text;
    element.className = "message " + (type || "");
}

async function apiRequest(path, options = {}) {
    const response = await fetch(API_URL + path, {
        ...options,
        headers: { "Content-Type": "application/json" }
    });
    const data = await response.json().catch(() => null);
    if (!response.ok) {
        throw new Error((data && data.error) || "Erreur HTTP " + response.status);
    }
    return data;
}

async function checkApi() {
    try {
        const data = await apiRequest("/api/health");
        const online = data.database === "connected";
        apiStatus.className = "status-pill " + (online ? "online" : "offline");
        apiStatusText.textContent = online ? "API en ligne" : "Base indisponible";
    } catch (error) {
        apiStatus.className = "status-pill offline";
        apiStatusText.textContent = "API hors ligne";
    }
}

function renderSkeleton() {
    itemList.innerHTML = "";
    for (let i = 0; i < 3; i++) {
        const li = document.createElement("li");
        li.className = "skeleton";
        li.setAttribute("aria-hidden", "true");
        itemList.appendChild(li);
    }
}

function renderEmpty() {
    const li = document.createElement("li");
    li.className = "empty";
    const title = document.createElement("p");
    title.className = "empty-title";
    title.textContent = "Aucun élément pour le moment";
    const text = document.createElement("p");
    text.textContent = "Ajoutez votre premier élément avec le formulaire.";
    li.append(title, text);
    itemList.appendChild(li);
}

function renderItems(items) {
    itemList.innerHTML = "";
    itemCount.textContent = items.length;
    if (items.length === 0) {
        renderEmpty();
        return;
    }
    items.forEach((item, index) => {
        const li = document.createElement("li");
        li.className = "item";
        li.style.animationDelay = Math.min(index, 10) * 40 + "ms";

        const avatar = document.createElement("div");
        avatar.className = "item-avatar";
        avatar.setAttribute("aria-hidden", "true");
        avatar.textContent = item.name.charAt(0);

        const body = document.createElement("div");
        body.className = "item-body";

        const top = document.createElement("div");
        top.className = "item-top";

        const name = document.createElement("span");
        name.className = "item-name";
        name.textContent = item.name;
        top.appendChild(name);

        if (item.createdAt) {
            const date = document.createElement("time");
            date.className = "item-date";
            date.dateTime = item.createdAt;
            date.textContent = dateFormat.format(new Date(item.createdAt));
            top.appendChild(date);
        }

        body.appendChild(top);

        if (item.description) {
            const description = document.createElement("p");
            description.className = "item-description";
            description.textContent = item.description;
            body.appendChild(description);
        }

        li.append(avatar, body);
        itemList.appendChild(li);
    });
}

async function loadItems() {
    showMessage(listMessage, "");
    try {
        const items = await apiRequest("/api/items");
        renderItems(items);
    } catch (error) {
        itemList.innerHTML = "";
        showMessage(listMessage, "Impossible de charger les éléments : " + error.message, "error");
    }
}

descriptionInput.addEventListener("input", () => {
    charCount.textContent = descriptionInput.value.length + " / 500";
});

form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const name = nameInput.value.trim();
    const description = descriptionInput.value.trim();

    if (name.length < 2) {
        showMessage(formMessage, "Le nom doit contenir au moins 2 caractères.", "error");
        nameInput.focus();
        return;
    }

    submitButton.disabled = true;
    submitLabel.textContent = "Ajout en cours…";
    showMessage(formMessage, "");
    try {
        await apiRequest("/api/items", {
            method: "POST",
            body: JSON.stringify({ name, description })
        });
        form.reset();
        charCount.textContent = "0 / 500";
        showMessage(formMessage, "Élément ajouté.", "success");
        loadItems();
    } catch (error) {
        showMessage(formMessage, "Erreur : " + error.message, "error");
    } finally {
        submitButton.disabled = false;
        submitLabel.textContent = "Ajouter l'élément";
    }
});

renderSkeleton();
checkApi();
loadItems();
