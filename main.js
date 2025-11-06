// main.js - Premium Restaurant Menu (Favorites Removed Version)
class PremiumMenu {
    constructor() {
        this.MENU = {};
        this.currentLang = 'en';
        this.openCategory = null;
        this.currentSearchQuery = '';
        this.activeFilters = [];
        this.activeSpiceFilters = [];
        this.maxPrice = 2000;
        // this.favorites = new Set(); // ❌ Favorites disabled
        this.currentSection = 'menu';
        this.isDarkTheme = false;
        this.currentModalItem = null;

        this.init();
    }

    async init() {
        this.cacheDOM();
        this.bindEvents();
        await this.loadMenuData();
        this.loadUserPreferences();
        this.hideLoadingScreen();
    }

    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    throttle(func, limit) {
        let inThrottle;
        return function (...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    cacheDOM() {
        // Header & Navigation
        this.header = document.getElementById('mainHeader');
        this.mobileMenuBtn = document.getElementById('mobileMenuBtn');
        this.mobileNav = document.getElementById('mobileNav');
        this.searchToggle = document.getElementById('searchToggle');
        this.searchExpandable = document.getElementById('searchExpandable');
        this.searchInput = document.getElementById('searchInput');
        this.searchClose = document.getElementById('searchClose');

        // Theme & Language
        this.themeToggle = document.getElementById('themeToggle');
        this.langSelect = document.getElementById('lang');

        // ❌ Favorites Removed
        // this.favoritesToggle = document.getElementById('favoritesToggle');
        // this.favoritesSidebar = document.getElementById('favoritesSidebar');
        // this.favoritesClose = document.getElementById('favoritesClose');
        // this.favoritesList = document.getElementById('favoritesList');
        // this.favoritesCount = document.querySelector('.favorites-count');

        // Filters
        this.advancedFilters = document.getElementById('advancedFilters');
        this.clearFilters = document.getElementById('clearFilters');
        this.priceRange = document.getElementById('priceRange');
        this.priceDisplay = document.getElementById('priceDisplay');

        // Content Areas
        this.categoryNav = document.querySelector('.category-scroll');
        this.menuArea = document.getElementById('menuArea');
        this.emptyState = document.getElementById('emptyState');

        // Modals
        this.imageModal = document.getElementById('imageModal');
        this.modalImg = document.getElementById('modalImg');
        this.modalName = document.getElementById('modalName');
        this.modalDesc = document.getElementById('modalDesc');
        this.modalPrice = document.getElementById('modalPrice');
        this.modalIngredients = document.getElementById('modalIngredients');
        this.modalBadges = document.getElementById('modalBadges');
        // this.modalFavorite = document.getElementById('modalFavorite'); // ❌ Hidden
        // this.modalAddFavorite = document.getElementById('modalAddFavorite'); // ❌ Hidden
        this.closeImageModal = document.getElementById('closeImageModal');
        this.modalAR = document.getElementById('modalAR');

        // AR Modal
        this.modelModal = document.getElementById('modelModal');
        this.mv = document.getElementById('mv');
        this.closeModelModal = document.getElementById('closeModelModal');

        // Loading
        this.loadingScreen = document.getElementById('loadingScreen');

        // Toast
        this.toast = document.getElementById('toast');
    }

    bindEvents() {
        this.mobileMenuBtn.addEventListener('click', () => this.toggleMobileMenu());
        document.querySelectorAll('.nav-btn, .nav-item').forEach(btn => {
            btn.addEventListener('click', (e) => this.switchSection(e.currentTarget.dataset.section));
        });

        this.searchToggle.addEventListener('click', () => this.toggleSearch());
        this.searchClose.addEventListener('click', () => this.toggleSearch(false));
        this.searchInput.addEventListener('input', this.debounce((e) => {
            this.handleSearch(e.target.value);
        }, 300));

        this.themeToggle.addEventListener('click', () => this.toggleTheme());
        this.langSelect.addEventListener('change', (e) => {
            this.currentLang = e.target.value;
            this.updateContent();
        });

        // ❌ Favorites event bindings removed

        document.querySelectorAll('.filter-tag').forEach(tag => {
            tag.addEventListener('click', (e) => this.toggleFilter(e.currentTarget.dataset.filter));
        });

        document.querySelectorAll('.spice-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.toggleSpiceFilter(e.currentTarget.dataset.spice));
        });

        this.priceRange.addEventListener('input', (e) => {
            this.updatePriceFilter(parseInt(e.target.value));
        });

        this.clearFilters.addEventListener('click', () => this.clearAllFilters());

        window.addEventListener('scroll', this.throttle(() => this.handleScroll(), 100));

        this.closeImageModal.addEventListener('click', () => this.closeModal(this.imageModal));
        // this.modalFavorite.addEventListener('click', () => this.toggleFavorite(this.currentModalItem)); // ❌
        // this.modalAddFavorite.addEventListener('click', () => this.toggleFavorite(this.currentModalItem)); // ❌
        this.modalAR.addEventListener('click', () => this.openARModal(this.currentModalItem));
        this.closeModelModal.addEventListener('click', () => this.closeModal(this.modelModal));

        document.querySelectorAll('.modal-backdrop').forEach(backdrop => {
            backdrop.addEventListener('click', (e) => {
                if (e.target === backdrop) {
                    this.closeAllModals();
                }
            });
        });

        document.addEventListener('keydown', (e) => this.handleKeyboard(e));
    }

    async loadMenuData() {
        try {
            const response = await fetch('menu_data.json');
            if (!response.ok) throw new Error('Failed to load menu data');
            const data = await response.json();

            // 🧩 Create “All” category dynamically from all categories
            const allItems = [];
            Object.keys(data).forEach(category => {
                if (data[category].items && Array.isArray(data[category].items)) {
                    allItems.push(...data[category].items);
                }
            });

            this.MENU = {
                all: {
                    label: {
                        en: "All",
                        fr: "Tout",
                        es: "Todo",
                        it: "Tutti",
                        jp: "すべて"
                    },
                    items: allItems
                },
                ...data
            };

            // Build categories and render default
            this.buildCategoryNav();
            this.openCategory = "all";
            this.renderMenu();
        } catch (error) {
            console.error('Error loading menu:', error);
            this.showError('Failed to load menu. Please refresh the page.');
        }
    }


    loadUserPreferences() {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark') this.toggleTheme(true);

        // ❌ Favorites loading removed

        const savedLang = localStorage.getItem('language');
        if (savedLang) {
            this.currentLang = savedLang;
            this.langSelect.value = savedLang;
        }
    }

    toggleMobileMenu() {
        this.mobileMenuBtn.classList.toggle('active');
        this.mobileNav.classList.toggle('active');
    }

    switchSection(section) {
        document.querySelectorAll('.nav-btn, .nav-item').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll(`[data-section="${section}"]`).forEach(btn => btn.classList.add('active'));

        document.querySelectorAll('.section').forEach(sec => sec.classList.remove('active'));
        const targetSection = document.getElementById(`${section}Section`);
        if (targetSection) targetSection.classList.add('active');

        this.currentSection = section;
        this.mobileMenuBtn.classList.remove('active');
        this.mobileNav.classList.remove('active');
    }

    toggleSearch(show = null) {
        const shouldShow = show !== null ? show : !this.searchExpandable.classList.contains('active');
        if (shouldShow) {
            this.searchExpandable.classList.add('active');
            this.searchInput.focus();
        } else {
            this.searchExpandable.classList.remove('active');
            this.searchInput.value = '';
            this.handleSearch('');
        }
    }

    handleSearch(query) {
        this.currentSearchQuery = query.trim().toLowerCase();
        this.renderMenu();
    }

    toggleTheme(forceDark = null) {
        this.isDarkTheme = forceDark !== null ? forceDark : !this.isDarkTheme;
        if (this.isDarkTheme) {
            document.documentElement.setAttribute('data-theme', 'dark');
            this.themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.removeAttribute('data-theme');
            this.themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
            localStorage.setItem('theme', 'light');
        }
    }

    // ❌ All favorites methods commented out
    /*
    toggleFavoritesSidebar() {}
    toggleFavorite(item) {}
    updateFavoritesCount() {}
    updateFavoriteButtons() {}
    renderFavorites() {}
    */

    toggleFilter(filter) {
        const index = this.activeFilters.indexOf(filter);
        if (index > -1) this.activeFilters.splice(index, 1);
        else {
            if (filter === 'VEG' || filter === 'NON_VEG')
                this.activeFilters = this.activeFilters.filter(f => f !== 'VEG' && f !== 'NON_VEG');
            this.activeFilters.push(filter);
        }
        this.updateFilterUI();
        this.renderMenu();
    }

    toggleSpiceFilter(spiceLevel) {
        const index = this.activeSpiceFilters.indexOf(spiceLevel);
        if (index > -1) this.activeSpiceFilters.splice(index, 1);
        else this.activeSpiceFilters.push(spiceLevel);
        this.updateFilterUI();
        this.renderMenu();
    }

    updatePriceFilter(price) {
        this.maxPrice = price;
        this.priceDisplay.textContent = `Up to ₹${price}`;
        this.renderMenu();
    }

    clearAllFilters() {
        this.activeFilters = [];
        this.activeSpiceFilters = [];
        this.maxPrice = 2000;
        this.priceRange.value = 2000;
        this.priceDisplay.textContent = 'Up to ₹2000';
        this.currentSearchQuery = '';
        this.searchInput.value = '';
        this.updateFilterUI();
        this.renderMenu();
    }

    updateFilterUI() {
        document.querySelectorAll('.filter-tag').forEach(tag => {
            tag.classList.toggle('active', this.activeFilters.includes(tag.dataset.filter));
        });
        document.querySelectorAll('.spice-btn').forEach(btn => {
            btn.classList.toggle('active', this.activeSpiceFilters.includes(btn.dataset.spice));
        });
    }

    buildCategoryNav() {
        if (!this.categoryNav) return;
        this.categoryNav.innerHTML = Object.keys(this.MENU)
            .map(categoryKey => {
                const category = this.MENU[categoryKey];
                const label = category.label[this.currentLang] || categoryKey;
                return `<button class="category-btn" data-category="${categoryKey}">${label}</button>`;
            })
            .join('');

        this.categoryNav.querySelectorAll('.category-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.openCategory = e.currentTarget.dataset.category;
                this.updateCategoryNav();
                this.renderMenu();
            });
        });

        // Default to “All”
        this.openCategory = "all";
        this.updateCategoryNav();
    }


    updateCategoryNav() {
        this.categoryNav.querySelectorAll('.category-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.category === this.openCategory);
        });
    }

    renderMenu() {
        if (!this.menuArea) return;
        const filteredData = this.filterMenu();
        if (!filteredData || Object.keys(filteredData).length === 0) {
            this.showEmptyState();
            return;
        }

        this.hideEmptyState();
        let menuHTML = '';

        Object.keys(filteredData).forEach(categoryKey => {
            const category = filteredData[categoryKey];
            const categoryLabel = category.label[this.currentLang] || categoryKey;

            menuHTML += `
                <div class="category-section" data-category="${categoryKey}">
                    <h3 class="category-title">${categoryLabel}</h3>
                    <div class="menu-grid">
                        ${category.items.map(item => this.createMenuItemHTML(item)).join('')}
                    </div>
                </div>
            `;
        });

        this.menuArea.innerHTML = menuHTML;
        this.attachItemEventListeners();
    }

    createMenuItemHTML(item) {
        const t = item.translations?.[this.currentLang] || item.translations?.en || {};
        const badges = this.createDietaryBadges(item);

        return `
            <div class="menu-card" data-item-id="${item.id}">
                <div class="card-media">
                    <img src="${item.image}" alt="${t.name}" class="card-img" loading="lazy">
                    <div class="card-badges">${badges}</div>
                </div>
                <div class="card-body">
                    <div class="card-header">
                        <h3 class="card-title">${t.name}</h3>
                        <div class="card-price">${t.price}</div>
                    </div>
                    <p class="card-desc">${t.desc}</p>
                    <div class="card-footer">
                        <div class="card-ingredients"><small>${t.ingredients}</small></div>
                        <div class="card-actions">
                            <button class="btn btn-secondary" onclick="premiumMenu.openItemModal(${JSON.stringify(item).replace(/"/g, '&quot;')})">
                                <i class="fas fa-eye"></i> View
                            </button>
                            ${item.model ? `
                                <button class="btn btn-primary" onclick="premiumMenu.openARModal(${JSON.stringify(item).replace(/"/g, '&quot;')})">
                                    <i class="fas fa-cube"></i> AR
                                </button>
                            ` : ''}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    createDietaryBadges(item) {
        const badges = [];
        const flags = item.dietaryFlags || [];
        if (flags.includes('VEG') || item.dietaryColor === 'green') badges.push('<span class="badge veg">Veg</span>');
        if (flags.includes('NON_VEG') || item.dietaryColor === 'red') badges.push('<span class="badge nonveg">Non-Veg</span>');
        if (flags.includes('GLUTEN_FREE')) badges.push('<span class="badge gluten-free">GF</span>');
        return badges.join('');
    }

    attachItemEventListeners() {
        this.menuArea.querySelectorAll('.menu-card').forEach(card => {
            card.addEventListener('click', (e) => {
                if (e.target.closest('button')) return;
                const itemId = card.dataset.itemId;
                const item = this.findItemById(itemId);
                if (item) this.openItemModal(item);
            });
        });
    }

    filterMenu() {
        let filtered = { ...this.MENU };
        if (this.currentSearchQuery) filtered = this.applySearch(filtered) || {};
        if (this.activeFilters.length > 0) filtered = this.applyDietaryFilters(filtered) || {};
        if (this.maxPrice < 2000) filtered = this.applyPriceFilter(filtered) || {};
        if (this.openCategory) filtered = { [this.openCategory]: filtered[this.openCategory] };
        return Object.keys(filtered).length > 0 ? filtered : null;
    }

    applySearch(data) {
        const results = {};
        const query = this.currentSearchQuery.toLowerCase();
        for (const [categoryKey, category] of Object.entries(data)) {
            const matchingItems = category.items.filter(item => {
                const t = item.translations?.[this.currentLang] || item.translations?.en || {};
                const searchText = `${t.name} ${t.desc} ${t.ingredients}`.toLowerCase();
                return searchText.includes(query);
            });
            if (matchingItems.length > 0) results[categoryKey] = { ...category, items: matchingItems };
        }
        return Object.keys(results).length > 0 ? results : null;
    }

    applyDietaryFilters(data) {
        const results = {};
        for (const [categoryKey, category] of Object.entries(data)) {
            const matchingItems = category.items.filter(item =>
                this.activeFilters.every(filter => (item.dietaryFlags || []).includes(filter))
            );
            if (matchingItems.length > 0) results[categoryKey] = { ...category, items: matchingItems };
        }
        return Object.keys(results).length > 0 ? results : null;
    }

    applyPriceFilter(data) {
        const results = {};
        for (const [categoryKey, category] of Object.entries(data)) {
            const matchingItems = category.items.filter(item => {
                const t = item.translations?.[this.currentLang] || item.translations?.en || {};
                const price = parseInt(t.price.replace(/[^0-9]/g, '')) || 0;
                return price <= this.maxPrice;
            });
            if (matchingItems.length > 0) results[categoryKey] = { ...category, items: matchingItems };
        }
        return Object.keys(results).length > 0 ? results : null;
    }

    openItemModal(item) {
        this.currentModalItem = item;
        const t = item.translations?.[this.currentLang] || item.translations?.en || {};
        this.modalImg.src = item.image;
        this.modalName.textContent = t.name;
        this.modalDesc.textContent = t.desc;
        this.modalPrice.textContent = t.price;
        this.modalIngredients.textContent = t.ingredients;
        this.modalBadges.innerHTML = this.createDietaryBadges(item);
        this.modalAR.style.display = item.model ? 'inline-flex' : 'none';
        this.openModal(this.imageModal);
    }

    openARModal(item) {
        if (!item.model) {
            this.showToast('AR model not available for this item');
            return;
        }
        try {
            this.mv.setAttribute('src', item.model);
            this.mv.setAttribute('alt', `3D model of ${item.translations?.[this.currentLang]?.name || item.translations?.en?.name}`);
            navigator.mediaDevices.getUserMedia({ video: true })
                .then(() => {
                    this.openModal(this.modelModal);
                    setTimeout(() => {
                        const modelViewer = this.mv;
                        if (modelViewer.canActivateAR) modelViewer.activateAR();
                        else this.showToast('AR not supported — showing 3D preview.');
                    }, 800);
                })
                .catch(() => alert('Camera access is required to view the 3D model in AR.'));
        } catch {
            this.showToast('AR feature not supported on this device');
        }
    }

    openModal(modal) {
        modal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
    }

    closeModal(modal) {
        modal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
    }

    closeAllModals() {
        this.closeModal(this.imageModal);
        this.closeModal(this.modelModal);
    }

    findItemById(itemId) {
        for (const category of Object.values(this.MENU)) {
            const item = category.items.find(i => i.id === itemId);
            if (item) return item;
        }
        return null;
    }

    updateContent() {
        this.buildCategoryNav();
        this.renderMenu();
        // this.renderFavorites(); // ❌
        localStorage.setItem('language', this.currentLang);
    }

    handleScroll() {
        const scrolled = window.scrollY > 50;
        this.header.classList.toggle('scrolled', scrolled);
    }

    handleKeyboard(e) {
        if (e.key === 'Escape') this.closeAllModals();
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            this.toggleSearch(true);
        }
    }

    showEmptyState() {
        this.menuArea.style.display = 'none';
        this.emptyState.style.display = 'block';
    }

    hideEmptyState() {
        this.menuArea.style.display = 'block';
        this.emptyState.style.display = 'none';
    }

    hideLoadingScreen() {
        setTimeout(() => {
            this.loadingScreen.style.opacity = '0';
            setTimeout(() => this.loadingScreen.style.display = 'none', 500);
        }, 1000);
    }

    showToast(message, duration = 3000) {
        this.toast.textContent = message;
        this.toast.classList.add('active');
        setTimeout(() => this.toast.classList.remove('active'), duration);
    }

    showError(message) {
        this.showToast(message, 5000);
    }
}

let premiumMenu;
document.addEventListener('DOMContentLoaded', () => {
    premiumMenu = new PremiumMenu();
});
