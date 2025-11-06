// specials.js — Simplified version (only for Today's Specials)
document.addEventListener("DOMContentLoaded", async () => {
  const specialsGrid = document.getElementById("specialsGrid");
  const emptyState = document.getElementById("specialsEmpty");

  // Modals
  const imageModal = document.getElementById("imageModal");
  const modalImg = document.getElementById("modalImg");
  const modalName = document.getElementById("modalName");
  const modalDesc = document.getElementById("modalDesc");
  const modalPrice = document.getElementById("modalPrice");
  const modalIngredients = document.getElementById("modalIngredients");
  const modalBadges = document.getElementById("modalBadges");
  const modalAR = document.getElementById("modalAR");
  const closeImageModal = document.getElementById("closeImageModal");

  const modelModal = document.getElementById("modelModal");
  const mv = document.getElementById("mv");
  const closeModelModal = document.getElementById("closeModelModal");

  let currentItem = null;

  const createBadges = (item) => {
    const flags = item.dietaryFlags || [];
    let badges = "";
    if (flags.includes("VEG") || item.dietaryColor === "green") badges += '<span class="badge veg">Veg</span>';
    if (flags.includes("NON_VEG") || item.dietaryColor === "red") badges += '<span class="badge nonveg">Non-Veg</span>';
    if (flags.includes("GLUTEN_FREE")) badges += '<span class="badge gluten-free">GF</span>';
    return badges;
  };

  const createCard = (item) => {
    const t = item.translations?.en || {};
    return `
      <div class="menu-card" data-id="${item.id}">
        <div class="card-media">
          <img src="${item.image}" alt="${t.name}" class="card-img" />
          <div class="card-badges">${createBadges(item)}</div>
        </div>
        <div class="card-body">
          <div class="card-header">
            <h3>${t.name}</h3>
            <span>${t.price}</span>
          </div>
          <p>${t.desc}</p>
          <div class="card-footer">
            <button class="btn btn-secondary view-btn">View</button>
            ${item.model ? `<button class="btn btn-primary ar-btn">AR</button>` : ""}
          </div>
        </div>
      </div>`;
  };

  const openModal = (item) => {
    const t = item.translations?.en || {};
    modalImg.src = item.image;
    modalName.textContent = t.name;
    modalDesc.textContent = t.desc;
    modalPrice.textContent = t.price;
    modalIngredients.textContent = t.ingredients;
    modalBadges.innerHTML = createBadges(item);
    modalAR.style.display = item.model ? "inline-flex" : "none";
    imageModal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    currentItem = item;
  };

  const closeModal = (modal) => {
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  };

  modalAR.addEventListener("click", () => {
    if (!currentItem?.model) return;
    mv.setAttribute("src", currentItem.model);
    modelModal.setAttribute("aria-hidden", "false");
  });

  closeImageModal.addEventListener("click", () => closeModal(imageModal));
  closeModelModal.addEventListener("click", () => closeModal(modelModal));

  // Load JSON
  try {
    const res = await fetch("menu_data.json");
    const data = await res.json();

    let specials = data["daily-specials"]?.items || [];
    if (!specials.length) {
      emptyState.style.display = "block";
      return;
    }

    specialsGrid.innerHTML = specials.map(createCard).join("");

    specialsGrid.querySelectorAll(".menu-card").forEach((card) => {
      const id = card.dataset.id;
      const item = specials.find((i) => i.id === id);
      card.querySelector(".view-btn").addEventListener("click", () => openModal(item));
      const arBtn = card.querySelector(".ar-btn");
      if (arBtn) arBtn.addEventListener("click", () => {
        mv.setAttribute("src", item.model);
        modelModal.setAttribute("aria-hidden", "false");
      });
    });
  } catch (err) {
    console.error("Failed to load specials:", err);
    emptyState.style.display = "block";
  }
});
