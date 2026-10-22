const form = document.getElementById("item-form");
const nameInput = document.getElementById("name");
const descriptionInput = document.getElementById("description");
const formMessage = document.getElementById("form-message");
const itemList = document.getElementById("item-list");

const items = [];

function showMessage(element, text, type) {
    element.textContent = text;
    element.className = "message " + (type || "");
}

function renderItems() {
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

form.addEventListener("submit", (event) => {
    event.preventDefault();
    const name = nameInput.value.trim();
    const description = descriptionInput.value.trim();

    if (name.length < 2) {
        showMessage(formMessage, "Le nom doit contenir au moins 2 caracteres.", "error");
        return;
    }

    items.unshift({ name, description });
    form.reset();
    showMessage(formMessage, "Element ajoute.", "success");
    renderItems();
});

renderItems();
