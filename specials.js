// specials.js — Enhanced: Separate View / 3D / Video
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

  // 🟢 Create Dietary Badges
  const createBadges = (item) => {
    const flags = item.dietaryFlags || [];
    let badges = "";
    if (flags.includes("VEG") || item.dietaryColor === "green")
      badges += '<span class="badge veg">Veg</span>';
    if (flags.includes("NON_VEG") || item.dietaryColor === "red")
      badges += '<span class="badge nonveg">Non-Veg</span>';
    if (flags.includes("GLUTEN_FREE"))
      badges += '<span class="badge gluten-free">GF</span>';
    return badges;
  };

  // 🟢 Create Menu Card with View, 3D, and Video Buttons — Fixed Layout
const createCard = (item) => {
  const t = item.translations?.en || {};

  const mediaContent = item.model
    ? `<img src="${item.image}" alt="${t.name}" class="card-img" loading="lazy">`
    : item.video
      ? `<video class="card-video" autoplay muted loop playsinline>
          <source src="${item.video}" type="video/mp4">
          <img src="${item.image}" alt="${t.name}" class="card-img" />
        </video>`
      : `<img src="${item.image}" alt="${t.name}" class="card-img" loading="lazy">`;

  return `
    <div class="menu-card" data-id="${item.id}">
      <div class="card-media">
        ${mediaContent}
        <div class="card-badges">${createBadges(item)}</div>
      </div>

      <div class="card-body">
        <div class="card-header">
          <h3 class="card-title">${t.name}</h3>
          <div class="card-price">${t.price}</div>
        </div>

        <p class="card-desc">${t.desc}</p>

        ${
          t.ingredients
            ? `<div class="card-ingredients">
                <small>${t.ingredients}</small>
              </div>`
            : ""
        }

        <div class="card-footer">
          <div class="card-actions">
            <button class="btn btn-secondary view-btn">
              <i class="fas fa-eye"></i> View
            </button>
            ${
              item.model
                ? `<button class="btn btn-primary ar-btn">
                    <i class="fas fa-cube"></i> 3D
                  </button>`
                : ""
            }
            ${
              item.video
                ? `<button class="btn btn-secondary video-btn">
                    <i class="fas fa-play"></i> Video
                  </button>`
                : ""
            }
          </div>
        </div>
      </div>
    </div>
  `;
};


  // 🟢 Modal Handling
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

  // 🧊 Open AR (3D)
  const openAR = (item) => {
    if (!item.model) return;
    mv.setAttribute("src", item.model);
    modelModal.setAttribute("aria-hidden", "false");
    modelModal.style.zIndex = "99999";
    document.body.style.overflow = "hidden";
  };

  // ❌ Close Modals
  closeImageModal.addEventListener("click", () => closeModal(imageModal));
  closeModelModal.addEventListener("click", () => closeModal(modelModal));

  // 🟢 Load JSON Data
  try {
    const res = await fetch("menu_data.json");
    const data = await res.json();

    let specials = data["daily-specials"]?.items || [];
    if (!specials.length) {
      emptyState.style.display = "block";
      return;
    }

    // ✅ Render all special cards
    specialsGrid.innerHTML = specials.map(createCard).join("");

    // ✅ Attach event listeners
    specialsGrid.querySelectorAll(".menu-card").forEach((card) => {
      const id = card.dataset.id;
      const item = specials.find((i) => i.id === id);

      // View button
      const viewBtn = card.querySelector(".view-btn");
      if (viewBtn) viewBtn.addEventListener("click", () => openModal(item));

      // 3D button
      const arBtn = card.querySelector(".ar-btn");
      if (arBtn) arBtn.addEventListener("click", () => openAR(item));

      // Video button (open new tab)
      const videoBtn = card.querySelector(".video-btn");
      if (videoBtn && item.video) {
        videoBtn.addEventListener("click", () => {
          window.open(item.video, "_blank"); // Opens video in new page
        });
      }
    });
  } catch (err) {
    console.error("Failed to load specials:", err);
    emptyState.style.display = "block";
  }
});
