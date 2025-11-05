// main.js - Premium Restaurant Menu with Advanced Features
class PremiumMenu {
    constructor() {
        this.MENU = {};
        this.currentLang = 'en';
        this.openCategory = null;
        this.currentSearchQuery = '';
        this.activeFilters = [];
        this.activeSpiceFilters = [];
        this.maxPrice = 2000;
        this.favorites = new Set();
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

    // Utility Functions
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
        return function(...args) {
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
        
        // Favorites
        this.favoritesToggle = document.getElementById('favoritesToggle');
        this.favoritesSidebar = document.getElementById('favoritesSidebar');
        this.favoritesClose = document.getElementById('favoritesClose');
        this.favoritesList = document.getElementById('favoritesList');
        this.favoritesCount = document.querySelector('.favorites-count');
        
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
        this.modalFavorite = document.getElementById('modalFavorite');
        this.modalAddFavorite = document.getElementById('modalAddFavorite');
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
        // Navigation
        this.mobileMenuBtn.addEventListener('click', () => this.toggleMobileMenu());
        document.querySelectorAll('.nav-btn, .nav-item').forEach(btn => {
            btn.addEventListener('click', (e) => this.switchSection(e.currentTarget.dataset.section));
        });

        // Search
        this.searchToggle.addEventListener('click', () => this.toggleSearch());
        this.searchClose.addEventListener('click', () => this.toggleSearch(false));
        this.searchInput.addEventListener('input', this.debounce((e) => {
            this.handleSearch(e.target.value);
        }, 300));

        // Theme & Language
        this.themeToggle.addEventListener('click', () => this.toggleTheme());
        this.langSelect.addEventListener('change', (e) => {
            this.currentLang = e.target.value;
            this.updateContent();
        });

        // Favorites
        this.favoritesToggle.addEventListener('click', () => this.toggleFavoritesSidebar());
        this.favoritesClose.addEventListener('click', () => this.toggleFavoritesSidebar(false));

        // Filters
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

        // Scroll
        window.addEventListener('scroll', this.throttle(() => this.handleScroll(), 100));

        // Modals
        this.closeImageModal.addEventListener('click', () => this.closeModal(this.imageModal));
        this.modalFavorite.addEventListener('click', () => this.toggleFavorite(this.currentModalItem));
        this.modalAddFavorite.addEventListener('click', () => this.toggleFavorite(this.currentModalItem));
        this.modalAR.addEventListener('click', () => this.openARModal(this.currentModalItem));
        this.closeModelModal.addEventListener('click', () => this.closeModal(this.modelModal));

        // Modal backdrops
        document.querySelectorAll('.modal-backdrop').forEach(backdrop => {
            backdrop.addEventListener('click', (e) => {
                if (e.target === backdrop) {
                    this.closeAllModals();
                }
            });
        });

        // Keyboard
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));
    }

    // Data Management
    async loadMenuData() {
        try {
            const response = await fetch('menu_data.json');
            if (!response.ok) throw new Error('Failed to load menu data');
            this.MENU = await response.json();
            this.buildCategoryNav();
            this.renderMenu();
        } catch (error) {
            console.error('Error loading menu:', error);
            this.showError('Failed to load menu. Please refresh the page.');
        }
    }

    loadUserPreferences() {
        // Load theme
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark') {
            this.toggleTheme(true);
        }

        // Load favorites
        const savedFavorites = localStorage.getItem('favorites');
        if (savedFavorites) {
            this.favorites = new Set(JSON.parse(savedFavorites));
            this.updateFavoritesCount();
        }

        // Load language
        const savedLang = localStorage.getItem('language');
        if (savedLang) {
            this.currentLang = savedLang;
            this.langSelect.value = savedLang;
        }
    }

    // Navigation & UI
    toggleMobileMenu() {
        this.mobileMenuBtn.classList.toggle('active');
        this.mobileNav.classList.toggle('active');
    }

    switchSection(section) {
        // Update active states
        document.querySelectorAll('.nav-btn, .nav-item').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelectorAll(`[data-section="${section}"]`).forEach(btn => {
            btn.classList.add('active');
        });

        // Hide all sections
        document.querySelectorAll('.section').forEach(sec => {
            sec.classList.remove('active');
        });

        // Show target section
        const targetSection = document.getElementById(`${section}Section`);
        if (targetSection) {
            targetSection.classList.add('active');
        }

        this.currentSection = section;
        
        // Close mobile menu if open
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

    // Theme Management
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

    // Favorites System
    toggleFavoritesSidebar(show = null) {
        const shouldShow = show !== null ? show : !this.favoritesSidebar.classList.contains('active');
        
        if (shouldShow) {
            this.favoritesSidebar.classList.add('active');
            this.renderFavorites();
        } else {
            this.favoritesSidebar.classList.remove('active');
        }
    }

    toggleFavorite(item) {
        if (!item) return;

        const itemId = item.id;
        
        if (this.favorites.has(itemId)) {
            this.favorites.delete(itemId);
            this.showToast('Removed from favorites');
        } else {
            this.favorites.add(itemId);
            this.showToast('Added to favorites');
        }

        // Update UI
        this.updateFavoritesCount();
        this.updateFavoriteButtons(itemId);
        this.renderFavorites();
        
        // Save to localStorage
        localStorage.setItem('favorites', JSON.stringify([...this.favorites]));
    }

    updateFavoritesCount() {
        this.favoritesCount.textContent = this.favorites.size;
    }

    updateFavoriteButtons(itemId) {
        const isFavorite = this.favorites.has(itemId);
        
        // Update modal favorite button
        if (this.currentModalItem && this.currentModalItem.id === itemId) {
            const icon = this.modalFavorite.querySelector('i');
            icon.className = isFavorite ? 'fas fa-heart' : 'far fa-heart';
            this.modalFavorite.classList.toggle('active', isFavorite);
        }

        // Update card favorite buttons
        document.querySelectorAll(`[data-item-id="${itemId}"] .card-favorite`).forEach(btn => {
            const icon = btn.querySelector('i');
            icon.className = isFavorite ? 'fas fa-heart' : 'far fa-heart';
            btn.classList.toggle('active', isFavorite);
        });
    }

    renderFavorites() {
        if (!this.favoritesList) return;

        if (this.favorites.size === 0) {
            this.favoritesList.innerHTML = `
                <div class="empty-favorites">
                    <i class="far fa-heart"></i>
                    <p>No favorites yet</p>
                    <small>Click the heart icon to add items</small>
                </div>
            `;
            return;
        }

        const favoritesHTML = Array.from(this.favorites).map(itemId => {
            const item = this.findItemById(itemId);
            if (!item) return '';
            
            const t = item.translations?.[this.currentLang] || item.translations?.en || {};
            return `
                <div class="favorite-item" data-item-id="${item.id}">
                    <img src="${item.image}" alt="${t.name}" class="favorite-img">
                    <div class="favorite-info">
                        <h4>${t.name}</h4>
                        <p class="favorite-price">${t.price}</p>
                    </div>
                    <button class="favorite-remove" onclick="premiumMenu.toggleFavorite(${JSON.stringify(item).replace(/"/g, '&quot;')})">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            `;
        }).join('');

        this.favoritesList.innerHTML = favoritesHTML;
    }

    // Filter System
    toggleFilter(filter) {
        const index = this.activeFilters.indexOf(filter);
        if (index > -1) {
            this.activeFilters.splice(index, 1);
        } else {
            // Handle exclusive filters
            if (filter === 'VEG' || filter === 'NON_VEG') {
                this.activeFilters = this.activeFilters.filter(f => f !== 'VEG' && f !== 'NON_VEG');
            }
            this.activeFilters.push(filter);
        }
        
        this.updateFilterUI();
        this.renderMenu();
    }

    toggleSpiceFilter(spiceLevel) {
        const index = this.activeSpiceFilters.indexOf(spiceLevel);
        if (index > -1) {
            this.activeSpiceFilters.splice(index, 1);
        } else {
            this.activeSpiceFilters.push(spiceLevel);
        }
        
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
        // Update filter tags
        document.querySelectorAll('.filter-tag').forEach(tag => {
            const isActive = this.activeFilters.includes(tag.dataset.filter);
            tag.classList.toggle('active', isActive);
        });

        // Update spice buttons
        document.querySelectorAll('.spice-btn').forEach(btn => {
            const isActive = this.activeSpiceFilters.includes(btn.dataset.spice);
            btn.classList.toggle('active', isActive);
        });
    }

    // Menu Rendering
    buildCategoryNav() {
        if (!this.categoryNav) return;

        this.categoryNav.innerHTML = Object.keys(this.MENU).map(categoryKey => {
            const category = this.MENU[categoryKey];
            const label = category.label[this.currentLang] || categoryKey;
            return `
                <button class="category-btn" data-category="${categoryKey}">
                    ${label}
                </button>
            `;
        }).join('');

        // Add event listeners
        this.categoryNav.querySelectorAll('.category-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.openCategory = e.currentTarget.dataset.category;
                this.updateCategoryNav();
                this.renderMenu();
                
                // Scroll to category
                const categoryElement = document.querySelector(`[data-category="${this.openCategory}"]`);
                if (categoryElement) {
                    categoryElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            });
        });

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
        const isFavorite = this.favorites.has(item.id);
        const price = parseInt(t.price.replace(/[^0-9]/g, '')) || 0;
        
        // Create dietary badges
        const badges = this.createDietaryBadges(item);
        
        return `
            <div class="menu-card" data-item-id="${item.id}">
                <div class="card-media">
                    <img src="${item.image}" alt="${t.name}" class="card-img" loading="lazy">
                    <div class="card-badges">
                        ${badges}
                    </div>
                    <button class="card-favorite ${isFavorite ? 'active' : ''}" onclick="premiumMenu.toggleFavorite(${JSON.stringify(item).replace(/"/g, '&quot;')})">
                        <i class="${isFavorite ? 'fas' : 'far'} fa-heart"></i>
                    </button>
                </div>
                <div class="card-body">
                    <div class="card-header">
                        <h3 class="card-title">${t.name}</h3>
                        <div class="card-price">${t.price}</div>
                    </div>
                    <p class="card-desc">${t.desc}</p>
                    <div class="card-footer">
                        <div class="card-ingredients">
                            <small>${t.ingredients}</small>
                        </div>
                        <div class="card-actions">
                            <button class="btn btn-secondary" onclick="premiumMenu.openItemModal(${JSON.stringify(item).replace(/"/g, '&quot;')})">
                                <i class="fas fa-eye"></i>View
                            </button>
                            ${item.model ? `
                                <button class="btn btn-primary" onclick="premiumMenu.openARModal(${JSON.stringify(item).replace(/"/g, '&quot;')})">
                                    <i class="fas fa-cube"></i>AR
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
        
        if (flags.includes('VEG') || item.dietaryColor === 'green') {
            badges.push('<span class="badge veg">Veg</span>');
        }
        if (flags.includes('NON_VEG') || item.dietaryColor === 'red') {
            badges.push('<span class="badge nonveg">Non-Veg</span>');
        }
        if (flags.includes('GLUTEN_FREE')) {
            badges.push('<span class="badge gluten-free">GF</span>');
        }
        
        return badges.join('');
    }

    attachItemEventListeners() {
        // Card click opens modal
        this.menuArea.querySelectorAll('.menu-card').forEach(card => {
            card.addEventListener('click', (e) => {
                // Don't open modal if clicking buttons
                if (e.target.closest('button')) return;
                
                const itemId = card.dataset.itemId;
                const item = this.findItemById(itemId);
                if (item) {
                    this.openItemModal(item);
                }
            });
        });
    }

    // Filtering Logic
    filterMenu() {
        let filtered = { ...this.MENU };

        // Apply search
        if (this.currentSearchQuery) {
            filtered = this.applySearch(filtered);
            if (!filtered) return null;
        }

        // Apply dietary filters
        if (this.activeFilters.length > 0) {
            filtered = this.applyDietaryFilters(filtered);
            if (!filtered) return null;
        }

        // Apply price filter
        if (this.maxPrice < 2000) {
            filtered = this.applyPriceFilter(filtered);
            if (!filtered) return null;
        }

        // Apply category filter
        if (this.openCategory) {
            filtered = { [this.openCategory]: filtered[this.openCategory] };
            if (!filtered[this.openCategory]) return null;
        }

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

            if (matchingItems.length > 0) {
                results[categoryKey] = { ...category, items: matchingItems };
            }
        }

        return Object.keys(results).length > 0 ? results : null;
    }

    applyDietaryFilters(data) {
        const results = {};

        for (const [categoryKey, category] of Object.entries(data)) {
            const matchingItems = category.items.filter(item => {
                return this.activeFilters.every(filter => 
                    (item.dietaryFlags || []).includes(filter)
                );
            });

            if (matchingItems.length > 0) {
                results[categoryKey] = { ...category, items: matchingItems };
            }
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

            if (matchingItems.length > 0) {
                results[categoryKey] = { ...category, items: matchingItems };
            }
        }

        return Object.keys(results).length > 0 ? results : null;
    }

    // Modal System
    openItemModal(item) {
        this.currentModalItem = item;
        const t = item.translations?.[this.currentLang] || item.translations?.en || {};
        const isFavorite = this.favorites.has(item.id);

        // Update modal content
        this.modalImg.src = item.image;
        this.modalImg.alt = t.name;
        this.modalName.textContent = t.name;
        this.modalDesc.textContent = t.desc;
        this.modalPrice.textContent = t.price;
        this.modalIngredients.textContent = t.ingredients;

        // Update dietary badges
        this.modalBadges.innerHTML = this.createDietaryBadges(item);

        // Update favorite button
        const favoriteIcon = this.modalFavorite.querySelector('i');
        favoriteIcon.className = isFavorite ? 'fas fa-heart' : 'far fa-heart';
        this.modalFavorite.classList.toggle('active', isFavorite);

        // Show/hide AR button
        this.modalAR.style.display = item.model ? 'inline-flex' : 'none';

        this.openModal(this.imageModal);
    }

    openARModal(item) {
  if (!item.model) {
    this.showToast('AR model not available for this item');
    return;
  }

  try {
    // Dynamically assign the model and alt text
    this.mv.setAttribute('src', item.model);
    this.mv.setAttribute(
      'alt',
      `3D model of ${item.translations?.[this.currentLang]?.name || item.translations?.en?.name}`
    );

    // Make sure the AR button is visible
    const manualARButton = document.getElementById('manualARButton');
    if (manualARButton) manualARButton.style.display = 'inline-block';

    // Request camera permission before showing modal
    navigator.mediaDevices.getUserMedia({ video: true })
      .then(() => {
        console.log('✅ Camera permission granted');

        // Open the AR modal
        this.openModal(this.modelModal);

        // Wait a short delay to ensure <model-viewer> renders properly
        setTimeout(() => {
          const modelViewer = this.mv;

          // Auto-start AR if supported
          if (modelViewer.canActivateAR) {
            console.log('🚀 Launching AR mode automatically...');
            modelViewer.activateAR();
          } else {
            console.warn('⚠️ AR not supported, fallback to 3D view.');
            this.showToast('AR not supported — showing 3D preview.');
          }
        }, 800);
      })
      .catch(err => {
        console.error('❌ Camera access denied or unavailable:', err);
        alert('Camera access is required to view the 3D model in AR.');
      });
  } catch (error) {
    console.error('Error opening AR modal:', error);
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

    // Utility Methods
    findItemById(itemId) {
        for (const category of Object.values(this.MENU)) {
            const item = category.items.find(item => item.id === itemId);
            if (item) return item;
        }
        return null;
    }

    updateContent() {
        this.buildCategoryNav();
        this.renderMenu();
        this.renderFavorites();
        localStorage.setItem('language', this.currentLang);
    }

    handleScroll() {
        const scrolled = window.scrollY > 50;
        this.header.classList.toggle('scrolled', scrolled);
    }

    handleKeyboard(e) {
        // Escape key closes modals
        if (e.key === 'Escape') {
            this.closeAllModals();
        }

        // Ctrl+K opens search
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
            setTimeout(() => {
                this.loadingScreen.style.display = 'none';
            }, 500);
        }, 1000);
    }

    showToast(message, duration = 3000) {
        this.toast.textContent = message;
        this.toast.classList.add('active');
        
        setTimeout(() => {
            this.toast.classList.remove('active');
        }, duration);
    }

    showError(message) {
        this.showToast(message, 5000);
    }
}

// Initialize the application
let premiumMenu;
document.addEventListener('DOMContentLoaded', () => {
    premiumMenu = new PremiumMenu();
});