// main.js - Premium Restaurant Menu (ALL PHASES 1,2,3,4 COMPLETE)
class PremiumMenu {
    constructor() {
        this.MENU = {};
        this.currentLang = 'en';
        this.openCategory = null;
        this.currentSearchQuery = '';
        this.activeFilters = [];
        this.activeSpiceFilters = [];
        this.maxPrice = 2000;
        this.currentSection = 'menu';
        this.isDarkTheme = false;
        this.currentModalItem = null;

        // ========== PHASE 4: ADVANCED FEATURES ==========
        this.voiceActive = false;
        this.ambientSoundActive = false;
        this.ambientAudio = null;
        this.gestureEnabled = true;
        this.aiRecommendations = [];
        this.socialProofData = {};
        this.userPreferences = {};

        this.init();
    }

    async init() {
        this.cacheDOM();
        this.bindEvents();

        // ✅ Load user preferences everywhere
        this.loadUserPreferences();

        // ✅ Only load menu data if on menu page
        if (document.getElementById('menuArea')) {
            await this.loadMenuData();
        }

        // ========== PHASE 4 INITIALIZATION ==========
        this.initVoiceRecognition();
        this.initAmbientSound();
        this.initGestureNavigation();
        this.loadAIRecommendations();
        this.loadSocialProofData();
        this.initUserTracking();

        if (this.loadingScreen) this.hideLoadingScreen();
    }

    // ========== PHASE 1: ENHANCED PERFORMANCE ==========
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
                setTimeout(() => (inThrottle = false), limit);
            }
        };
    }

    // ========== ORIGINAL CACHE DOM (ENHANCED) ==========
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

        // ========== PHASE 4: ADVANCED FEATURES DOM ==========
        this.voiceBtn = document.getElementById('voiceCommand');
        this.voiceFeedback = document.getElementById('voiceFeedback');
        this.ambientSoundBtn = document.getElementById('ambientSound');
        this.gestureHint = document.getElementById('gestureHint');
        this.aiRecommendationSection = document.querySelector('.ai-recommendation-section');
    }

    // ========== ENHANCED EVENT BINDING ==========
    bindEvents() {
        // Safe event bindings (works even if some elements are missing)
        if (this.mobileMenuBtn) {
            this.mobileMenuBtn.addEventListener('click', () => this.toggleMobileMenu());
        }

        document.querySelectorAll('.nav-btn, .nav-item').forEach(btn => {
            btn.addEventListener('click', (e) => {
                if (e.currentTarget.dataset.section)
                    this.switchSection(e.currentTarget.dataset.section);
            });
        });

        if (this.searchToggle && this.searchClose && this.searchInput) {
            this.searchToggle.addEventListener('click', () => this.toggleSearch());
            this.searchClose.addEventListener('click', () => this.toggleSearch(false));
            this.searchInput.addEventListener('input', this.debounce((e) => {
                this.handleSearch(e.target.value);
            }, 300));
        }

        // ✅ Theme toggle always available
        if (this.themeToggle) {
            this.themeToggle.addEventListener('click', () => this.toggleTheme());
        }

        if (this.langSelect) {
            this.langSelect.addEventListener('change', (e) => {
                this.currentLang = e.target.value;
                this.updateContent();
            });
        }

        // Filter events
        document.querySelectorAll('.filter-tag').forEach(tag => {
            tag.addEventListener('click', (e) => this.toggleFilter(e.currentTarget.dataset.filter));
        });

        document.querySelectorAll('.spice-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.toggleSpiceFilter(e.currentTarget.dataset.spice));
        });

        if (this.priceRange) {
            this.priceRange.addEventListener('input', (e) => {
                this.updatePriceFilter(parseInt(e.target.value));
            });
        }

        if (this.clearFilters) {
            this.clearFilters.addEventListener('click', () => this.clearAllFilters());
        }

        window.addEventListener('scroll', this.throttle(() => this.handleScroll(), 100));

        if (this.closeImageModal) {
            this.closeImageModal.addEventListener('click', () => this.closeModal(this.imageModal));
        }

        if (this.modalAR) {
            this.modalAR.addEventListener('click', () => this.openARModal(this.currentModalItem));
        }

        if (this.closeModelModal) {
            this.closeModelModal.addEventListener('click', () => this.closeModal(this.modelModal));
        }

        document.querySelectorAll('.modal-backdrop').forEach(backdrop => {
            backdrop.addEventListener('click', (e) => {
                if (e.target === backdrop) {
                    this.closeAllModals();
                }
            });
        });

        document.addEventListener('keydown', (e) => this.handleKeyboard(e));

        // ========== PHASE 4: ADVANCED EVENT BINDING ==========
        if (this.voiceBtn) {
            this.voiceBtn.addEventListener('click', () => this.toggleVoiceRecognition());
        }

        if (this.ambientSoundBtn) {
            this.ambientSoundBtn.addEventListener('click', () => this.toggleAmbientSound());
        }

        // Enhanced gesture support
        this.bindGestureEvents();
    }

    // ========== ORIGINAL MENU DATA LOADING ==========
    async loadMenuData() {
        try {
            const response = await fetch('menu_data.json');
            if (!response.ok) throw new Error('Failed to load menu data');
            const data = await response.json();

            // 🧩 Create "All" category dynamically — skip any specials
            const allItems = [];
            Object.keys(data).forEach(category => {
                const key = category.toLowerCase();
                // Skip specials categories
                if (
                    key.includes('today_special') ||
                    key.includes('todayspecial') ||
                    key.includes('specials_today') ||
                    key.includes('daily-special') ||
                    key.includes('daily_special') ||
                    key.includes('special')
                ) return;

                if (data[category].items && Array.isArray(data[category].items)) {
                    allItems.push(...data[category].items);
                }
            });

            // ✅ Create menu object without specials
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
                }
            };

            // ✅ Copy over only non-special categories
            for (const [key, value] of Object.entries(data)) {
                const lowerKey = key.toLowerCase();
                if (
                    lowerKey.includes('today_special') ||
                    lowerKey.includes('todayspecial') ||
                    lowerKey.includes('specials_today') ||
                    lowerKey.includes('daily-special') ||
                    lowerKey.includes('daily_special') ||
                    lowerKey.includes('special')
                ) {
                    continue; // skip specials completely
                }

                this.MENU[key] = value;
            }

            // ✅ Now build and render
            this.buildCategoryNav();
            this.openCategory = "all";
            this.renderMenu();

            // ========== PHASE 4: POST MENU LOAD ==========
            this.generateSocialProof();
            this.updateAIRecommendations();

        } catch (error) {
            console.error('Error loading menu:', error);
            this.showError('Failed to load menu. Please refresh the page.');
        }
    }

    loadUserPreferences() {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark') this.toggleTheme(true);
        else this.toggleTheme(false);

        const savedLang = localStorage.getItem('language');
        if (savedLang && this.langSelect) {
            this.currentLang = savedLang;
            this.langSelect.value = savedLang;
        }

        // ========== PHASE 4: LOAD ADVANCED PREFERENCES ==========
        const savedVoice = localStorage.getItem('voiceEnabled');
        if (savedVoice === 'true') this.voiceActive = true;

        const savedAmbient = localStorage.getItem('ambientSound');
        if (savedAmbient === 'true') {
            this.ambientSoundActive = true;
            this.initAmbientSound(true);
        }

        const savedGestures = localStorage.getItem('gesturesEnabled');
        if (savedGestures === 'false') this.gestureEnabled = false;
    }

    // ========== ORIGINAL FUNCTIONALITY (ENHANCED) ==========
    toggleMobileMenu() {
        if (!this.mobileMenuBtn || !this.mobileNav) return;
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
        if (this.mobileMenuBtn) this.mobileMenuBtn.classList.remove('active');
        if (this.mobileNav) this.mobileNav.classList.remove('active');

        // ========== PHASE 4: SECTION TRACKING ==========
        this.trackUserBehavior('section_switch', { section: section });
    }

    toggleSearch(show = null) {
        if (!this.searchExpandable) return;
        const shouldShow = show !== null ? show : !this.searchExpandable.classList.contains('active');
        if (shouldShow) {
            this.searchExpandable.classList.add('active');
            if (this.searchInput) this.searchInput.focus();
        } else {
            this.searchExpandable.classList.remove('active');
            if (this.searchInput) {
                this.searchInput.value = '';
                this.handleSearch('');
            }
        }
    }

    handleSearch(query) {
        this.currentSearchQuery = query.trim().toLowerCase();
        if (this.menuArea) this.renderMenu();
        
        // ========== PHASE 4: SEARCH ANALYTICS ==========
        if (query.length > 2) {
            this.trackUserBehavior('search', { query: query, results: this.getFilteredItemsCount() });
        }
    }

    toggleTheme(forceDark = null) {
        this.isDarkTheme = forceDark !== null ? forceDark : !this.isDarkTheme;
        if (this.isDarkTheme) {
            document.documentElement.setAttribute('data-theme', 'dark');
            if (this.themeToggle) this.themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.removeAttribute('data-theme');
            if (this.themeToggle) this.themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
            localStorage.setItem('theme', 'light');
        }
    }

    toggleFilter(filter) {
        const index = this.activeFilters.indexOf(filter);
        if (index > -1) this.activeFilters.splice(index, 1);
        else {
            if (filter === 'VEG' || filter === 'NON_VEG')
                this.activeFilters = this.activeFilters.filter(f => f !== 'VEG' && f !== 'NON_VEG');
            this.activeFilters.push(filter);
        }
        this.updateFilterUI();
        if (this.menuArea) this.renderMenu();
        
        // ========== PHASE 4: FILTER TRACKING ==========
        this.trackUserBehavior('filter_applied', { filter: filter, activeFilters: this.activeFilters });
    }

    toggleSpiceFilter(spiceLevel) {
        const index = this.activeSpiceFilters.indexOf(spiceLevel);
        if (index > -1) this.activeSpiceFilters.splice(index, 1);
        else this.activeSpiceFilters.push(spiceLevel);
        this.updateFilterUI();
        if (this.menuArea) this.renderMenu();
    }

    updatePriceFilter(price) {
        this.maxPrice = price;
        if (this.priceDisplay) this.priceDisplay.textContent = `Up to ₹${price}`;
        if (this.menuArea) this.renderMenu();
    }

    clearAllFilters() {
        this.activeFilters = [];
        this.activeSpiceFilters = [];
        this.maxPrice = 2000;
        if (this.priceRange) this.priceRange.value = 2000;
        if (this.priceDisplay) this.priceDisplay.textContent = 'Up to ₹2000';
        this.currentSearchQuery = '';
        if (this.searchInput) this.searchInput.value = '';
        this.updateFilterUI();
        if (this.menuArea) this.renderMenu();
        
        // ========== PHASE 4: CLEAR FILTERS TRACKING ==========
        this.trackUserBehavior('filters_cleared');
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
                return `<button class="category-btn stagger-item" data-category="${categoryKey}">${label}</button>`;
            })
            .join('');

        this.categoryNav.querySelectorAll('.category-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.openCategory = e.currentTarget.dataset.category;
                this.updateCategoryNav();
                this.renderMenu();
                
                // ========== PHASE 4: CATEGORY TRACKING ==========
                this.trackUserBehavior('category_click', { category: this.openCategory });
            });
        });

        this.openCategory = "all";
        this.updateCategoryNav();
    }

    updateCategoryNav() {
        if (!this.categoryNav) return;
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
        
        // ========== PHASE 4: ADD SOCIAL PROOF ==========
        this.addSocialProofToItems();
    }

    // ========== ENHANCED MENU ITEM CREATION ==========
    createMenuItemHTML(item) {
        const t = item.translations?.[this.currentLang] || item.translations?.en || {};
        const badges = this.createDietaryBadges(item);
        
        // ========== PHASE 4: SOCIAL PROOF BADGES ==========
        const socialProof = this.getSocialProofForItem(item.id);
        const socialProofHTML = socialProof ? this.createSocialProofHTML(socialProof) : '';

        return `
        <div class="menu-card stagger-item" data-item-id="${item.id}">
            <div class="card-media">
                <img src="${item.image}" alt="${t.name}" class="card-img" loading="lazy">
                <div class="card-badges">${badges}</div>
                ${socialProofHTML}
            </div>
            <div class="card-body">
                <div class="card-header">
                    <h3 class="card-title">${t.name}</h3>
                    <div class="card-price">${t.price}</div>
                </div>
                <p class="card-desc">${t.desc}</p>
                ${t.ingredients ? `<div class="card-ingredients"><small>${t.ingredients}</small></div>` : ''}
                <div class="card-footer">
                    <div class="card-actions">
                        <button class="btn btn-secondary" onclick="premiumMenu.openItemModal(${JSON.stringify(item).replace(/"/g, '&quot;')})">
                            <i class="fas fa-eye"></i> View
                        </button>
                        ${item.model ? `
                            <button class="btn btn-primary" onclick="premiumMenu.openARModal(${JSON.stringify(item).replace(/"/g, '&quot;')})">
                                <i class="fas fa-cube"></i> 3D
                            </button>` : ''}
                        ${item.video ? `
                            <button class="btn btn-secondary" onclick="premiumMenu.openVideo(${JSON.stringify(item).replace(/"/g, '&quot;')})">
                                <i class="fas fa-play"></i> Video
                            </button>` : ''}
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
        if (!this.menuArea) return;
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
        if (!this.imageModal) return;
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
        
        // ========== PHASE 4: ITEM VIEW TRACKING ==========
        this.trackUserBehavior('item_view', { 
            itemId: item.id, 
            itemName: t.name,
            category: this.findItemCategory(item.id)
        });
    }

    openARModal(item) {
        if (!item || !this.mv) return;
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
        
        // ========== PHASE 4: AR INTERACTION TRACKING ==========
        this.trackUserBehavior('ar_interaction', { itemId: item.id });
    }

    // 🎥 Open video in new tab
    openVideo(item) {
        if (!item || !item.video) {
            this.showToast('Video not available for this item');
            return;
        }

        try {
            window.open(item.video, "_blank");
            // ========== PHASE 4: VIDEO PLAY TRACKING ==========
            this.trackUserBehavior('video_play', { itemId: item.id });
        } catch {
            this.showToast('Unable to open video.');
        }
    }

    openModal(modal) {
        if (!modal) return;
        modal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
    }

    closeModal(modal) {
        if (!modal) return;
        modal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
    }

    closeAllModals() {
        if (this.imageModal) this.closeModal(this.imageModal);
        if (this.modelModal) this.closeModal(this.modelModal);
    }

    findItemById(itemId) {
        for (const category of Object.values(this.MENU)) {
            const item = category.items.find(i => i.id === itemId);
            if (item) return item;
        }
        return null;
    }

    findItemCategory(itemId) {
        for (const [categoryName, category] of Object.entries(this.MENU)) {
            const item = category.items.find(i => i.id === itemId);
            if (item) return categoryName;
        }
        return null;
    }

    updateContent() {
        this.buildCategoryNav();
        this.renderMenu();
        localStorage.setItem('language', this.currentLang);
    }

    handleScroll() {
        if (this.header) {
            const scrolled = window.scrollY > 50;
            this.header.classList.toggle('scrolled', scrolled);
        }
    }

    handleKeyboard(e) {
        if (e.key === 'Escape') this.closeAllModals();
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            this.toggleSearch(true);
        }
        
        // ========== PHASE 4: VOICE COMMAND SHORTCUT ==========
        if ((e.ctrlKey || e.metaKey) && e.key === 'j') {
            e.preventDefault();
            this.toggleVoiceRecognition();
        }
    }

    showEmptyState() {
        if (this.menuArea && this.emptyState) {
            this.menuArea.style.display = 'none';
            this.emptyState.style.display = 'block';
        }
    }

    hideEmptyState() {
        if (this.menuArea && this.emptyState) {
            this.menuArea.style.display = 'block';
            this.emptyState.style.display = 'none';
        }
    }

    hideLoadingScreen() {
        if (!this.loadingScreen) return;
        setTimeout(() => {
            this.loadingScreen.style.opacity = '0';
            setTimeout(() => (this.loadingScreen.style.display = 'none'), 500);
        }, 1000);
    }

    showToast(message, duration = 3000) {
        if (!this.toast) return;
        this.toast.textContent = message;
        this.toast.classList.add('active');
        setTimeout(() => this.toast.classList.remove('active'), duration);
    }

    showError(message) {
        this.showToast(message, 5000);
    }

    getFilteredItemsCount() {
        const filtered = this.filterMenu();
        if (!filtered) return 0;
        return Object.values(filtered).reduce((total, category) => total + category.items.length, 0);
    }

    // ========== PHASE 4: ADVANCED FEATURES IMPLEMENTATION ==========

    // VOICE COMMAND SYSTEM
    initVoiceRecognition() {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            console.warn('Voice recognition not supported');
            return;
        }

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = false;
        this.recognition.interimResults = false;
        this.recognition.lang = 'en-US';

        this.recognition.onstart = () => {
            this.voiceActive = true;
            this.voiceBtn.classList.add('listening');
            this.showVoiceFeedback('Listening... Speak now');
        };

        this.recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript.toLowerCase();
            this.processVoiceCommand(transcript);
        };

        this.recognition.onerror = (event) => {
            console.error('Voice recognition error:', event.error);
            this.showVoiceFeedback('Error: ' + event.error);
            this.stopVoiceRecognition();
        };

        this.recognition.onend = () => {
            this.stopVoiceRecognition();
        };
    }

    toggleVoiceRecognition() {
        if (this.voiceActive) {
            this.stopVoiceRecognition();
        } else {
            this.startVoiceRecognition();
        }
    }

    startVoiceRecognition() {
        try {
            this.recognition.start();
            this.trackUserBehavior('voice_command_started');
        } catch (error) {
            console.error('Voice recognition start failed:', error);
            this.showVoiceFeedback('Voice recognition failed to start');
        }
    }

    stopVoiceRecognition() {
        this.voiceActive = false;
        this.voiceBtn.classList.remove('listening');
        this.hideVoiceFeedback();
        try {
            this.recognition.stop();
        } catch (error) {
            // Ignore stop errors
        }
    }

    processVoiceCommand(transcript) {
        this.showVoiceFeedback(`Heard: "${transcript}"`);
        
        const commands = {
            'show me (.*)': (category) => this.filterByVoiceCategory(category),
            'search for (.*)': (query) => this.searchByVoice(query),
            'filter (.*)': (filter) => this.filterByVoice(filter),
            'clear filters': () => this.clearAllFilters(),
            'show all': () => this.showAllItems(),
            'what is (.*)': (item) => this.findItemByVoice(item),
            'open (.*)': (section) => this.navigateByVoice(section),
            'dark mode': () => this.toggleTheme(true),
            'light mode': () => this.toggleTheme(false)
        };

        let commandMatched = false;
        for (const [pattern, handler] of Object.entries(commands)) {
            const regex = new RegExp(pattern, 'i');
            const match = transcript.match(regex);
            if (match) {
                handler(match[1] || '');
                commandMatched = true;
                break;
            }
        }

        if (!commandMatched) {
            this.showVoiceFeedback('Command not recognized. Try "show me starters" or "search for chicken"');
        }

        this.trackUserBehavior('voice_command', { transcript: transcript, matched: commandMatched });
    }

    filterByVoiceCategory(category) {
        const normalizedCategory = category.toLowerCase();
        const availableCategories = Object.keys(this.MENU);
        const matchedCategory = availableCategories.find(cat => 
            cat.toLowerCase().includes(normalizedCategory)
        );

        if (matchedCategory) {
            this.openCategory = matchedCategory;
            this.updateCategoryNav();
            this.renderMenu();
            this.showVoiceFeedback(`Showing ${matchedCategory}`);
        } else {
            this.showVoiceFeedback(`Category "${category}" not found`);
        }
    }

    searchByVoice(query) {
        this.currentSearchQuery = query;
        if (this.searchInput) this.searchInput.value = query;
        this.renderMenu();
        this.showVoiceFeedback(`Searching for "${query}"`);
    }

    filterByVoice(filter) {
        const normalizedFilter = filter.toLowerCase();
        const filterMap = {
            'vegetarian': 'VEG',
            'veg': 'VEG',
            'non veg': 'NON_VEG',
            'non-vegetarian': 'NON_VEG',
            'gluten free': 'GLUTEN_FREE',
            'spicy': '2',
            'mild': '0'
        };

        if (filterMap[normalizedFilter]) {
            if (['0', '1', '2', '3'].includes(filterMap[normalizedFilter])) {
                this.toggleSpiceFilter(filterMap[normalizedFilter]);
            } else {
                this.toggleFilter(filterMap[normalizedFilter]);
            }
            this.showVoiceFeedback(`Applied ${filter} filter`);
        } else {
            this.showVoiceFeedback(`Filter "${filter}" not recognized`);
        }
    }

    showAllItems() {
        this.openCategory = "all";
        this.clearAllFilters();
        this.showVoiceFeedback('Showing all items');
    }

    findItemByVoice(itemName) {
        const allItems = Object.values(this.MENU).flatMap(category => category.items);
        const matchedItem = allItems.find(item => {
            const name = item.translations?.en?.name.toLowerCase();
            return name && name.includes(itemName.toLowerCase());
        });

        if (matchedItem) {
            this.openItemModal(matchedItem);
            this.showVoiceFeedback(`Showing ${matchedItem.translations?.en?.name}`);
        } else {
            this.showVoiceFeedback(`Item "${itemName}" not found`);
        }
    }

    navigateByVoice(section) {
        const sectionMap = {
            'menu': 'index.html',
            'specials': 'specials.html',
            'ambience': 'ambience.html',
            'story': 'story.html',
            'home': 'index.html'
        };

        const target = sectionMap[section.toLowerCase()];
        if (target) {
            window.location.href = target;
        } else {
            this.showVoiceFeedback(`Section "${section}" not found`);
        }
    }

    showVoiceFeedback(message) {
        if (this.voiceFeedback) {
            this.voiceFeedback.textContent = message;
            this.voiceFeedback.classList.add('show');
            setTimeout(() => {
                this.voiceFeedback.classList.remove('show');
            }, 3000);
        }
    }

    hideVoiceFeedback() {
        if (this.voiceFeedback) {
            this.voiceFeedback.classList.remove('show');
        }
    }

    // AMBIENT SOUND SYSTEM
    initAmbientSound(autoPlay = false) {
        // Create ambient audio context
        this.ambientAudio = new Audio('assets/audio/restaurant-ambience.mp3');
        this.ambientAudio.loop = true;
        this.ambientAudio.volume = 0.3;

        if (autoPlay && this.ambientSoundActive) {
            this.playAmbientSound();
        }
    }

    toggleAmbientSound() {
        if (this.ambientSoundActive) {
            this.pauseAmbientSound();
        } else {
            this.playAmbientSound();
        }
    }

    playAmbientSound() {
        if (this.ambientAudio) {
            this.ambientAudio.play().catch(e => {
                console.warn('Ambient sound play failed:', e);
            });
            this.ambientSoundActive = true;
            this.ambientSoundBtn.innerHTML = '<i class="fas fa-volume-up"></i>';
            this.ambientSoundBtn.style.background = 'var(--primary)';
            this.ambientSoundBtn.style.color = 'white';
            localStorage.setItem('ambientSound', 'true');
        }
    }

    pauseAmbientSound() {
        if (this.ambientAudio) {
            this.ambientAudio.pause();
            this.ambientSoundActive = false;
            this.ambientSoundBtn.innerHTML = '<i class="fas fa-music"></i>';
            this.ambientSoundBtn.style.background = 'var(--glass-bg)';
            this.ambientSoundBtn.style.color = 'var(--text)';
            localStorage.setItem('ambientSound', 'false');
        }
    }

    // GESTURE NAVIGATION
    initGestureNavigation() {
        if (!this.gestureEnabled) return;

        let startX = 0;
        let startY = 0;

        document.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
        });

        document.addEventListener('touchend', (e) => {
            if (!startX || !startY) return;

            const endX = e.changedTouches[0].clientX;
            const endY = e.changedTouches[0].clientY;
            const diffX = startX - endX;
            const diffY = startY - endY;

            // Horizontal swipe (navigation)
            if (Math.abs(diffX) > 50 && Math.abs(diffX) > Math.abs(diffY)) {
                if (diffX > 0) {
                    this.handleSwipeLeft();
                } else {
                    this.handleSwipeRight();
                }
            }

            // Vertical swipe (close modals)
            if (Math.abs(diffY) > 50 && Math.abs(diffY) > Math.abs(diffX)) {
                if (diffY > 0) {
                    this.handleSwipeDown();
                }
            }

            startX = 0;
            startY = 0;
        });

        // Show gesture hint on mobile
        if (window.innerWidth <= 768) {
            setTimeout(() => {
                this.showGestureHint();
            }, 3000);
        }
    }

    handleSwipeLeft() {
        const pages = ['index.html', 'specials.html', 'ambience.html', 'story.html'];
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        const currentIndex = pages.indexOf(currentPage);
        const nextIndex = (currentIndex + 1) % pages.length;
        window.location.href = pages[nextIndex];
    }

    handleSwipeRight() {
        const pages = ['index.html', 'specials.html', 'ambience.html', 'story.html'];
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        const currentIndex = pages.indexOf(currentPage);
        const prevIndex = (currentIndex - 1 + pages.length) % pages.length;
        window.location.href = pages[prevIndex];
    }

    handleSwipeDown() {
        this.closeAllModals();
    }

    showGestureHint() {
        if (this.gestureHint) {
            this.gestureHint.classList.add('show');
            setTimeout(() => {
                this.gestureHint.classList.remove('show');
            }, 5000);
        }
    }

    bindGestureEvents() {
        // Pinch to zoom on menu cards
        document.addEventListener('gesturestart', (e) => {
            e.preventDefault();
        });

        document.addEventListener('gesturechange', (e) => {
            e.preventDefault();
        });

        document.addEventListener('gestureend', (e) => {
            e.preventDefault();
        });
    }

    // AI RECOMMENDATIONS
    async loadAIRecommendations() {
        // Simulate AI recommendations based on user behavior
        this.aiRecommendations = [
            {
                id: 'ai-rec-1',
                type: 'popular',
                message: 'Based on popular choices, you might enjoy our Chef Special Seafood',
                action: { type: 'navigate', target: 'specials.html#chef-special' }
            },
            {
                id: 'ai-rec-2',
                type: 'dietary',
                message: 'Since you viewed vegetarian items, try our Spicy Paneer Kebab',
                action: { type: 'filter', target: 'VEG' }
            },
            {
                id: 'ai-rec-3',
                type: 'seasonal',
                message: 'Perfect for the season: Tropical Sunrise mocktail',
                action: { type: 'item', target: 'tropical-sunrise' }
            }
        ];
    }

    updateAIRecommendations() {
        if (!this.aiRecommendationSection) return;

        // Simple AI logic based on user behavior
        const userPreferences = this.analyzeUserBehavior();
        let recommendation = null;

        if (userPreferences.vegInterest > 0.7) {
            recommendation = this.aiRecommendations.find(r => r.type === 'dietary');
        } else if (userPreferences.seafoodInterest > 0.6) {
            recommendation = this.aiRecommendations.find(r => r.id === 'ai-rec-1');
        } else {
            recommendation = this.aiRecommendations.find(r => r.type === 'popular');
        }

        if (recommendation && this.aiRecommendationSection) {
            this.aiRecommendationSection.innerHTML = `
                <div class="ai-recommendation">
                    <h3>🤖 AI Suggestion</h3>
                    <p>${recommendation.message}</p>
                    <button class="btn btn-primary" onclick="premiumMenu.followAIRecommendation('${recommendation.id}')">
                        <i class="fas fa-lightbulb"></i> Try This
                    </button>
                </div>
            `;
        }
    }

    followAIRecommendation(recommendationId) {
        const recommendation = this.aiRecommendations.find(r => r.id === recommendationId);
        if (!recommendation) return;

        switch (recommendation.action.type) {
            case 'navigate':
                window.location.href = recommendation.action.target;
                break;
            case 'filter':
                this.toggleFilter(recommendation.action.target);
                break;
            case 'item':
                const item = this.findItemById(recommendation.action.target);
                if (item) this.openItemModal(item);
                break;
        }

        this.trackUserBehavior('ai_recommendation_followed', { recommendationId: recommendationId });
    }

    analyzeUserBehavior() {
        // Simple analysis based on viewed items and filters
        const viewedItems = this.userPreferences.viewedItems || [];
        const vegCount = viewedItems.filter(id => {
            const item = this.findItemById(id);
            return item && (item.dietaryFlags.includes('VEG') || item.dietaryColor === 'green');
        }).length;

        const seafoodCount = viewedItems.filter(id => {
            const item = this.findItemById(id);
            return item && item.translations?.en?.name.toLowerCase().includes('seafood');
        }).length;

        return {
            vegInterest: vegCount / Math.max(viewedItems.length, 1),
            seafoodInterest: seafoodCount / Math.max(viewedItems.length, 1),
            totalInteractions: viewedItems.length
        };
    }

    // SOCIAL PROOF SYSTEM
    loadSocialProofData() {
        // Simulate social proof data
        this.socialProofData = {
            'mint-mojito-virgin': { ordersLastHour: 12, rating: 4.8, reviews: 47 },
            'chicken-65': { ordersLastHour: 8, rating: 4.9, reviews: 89, popular: true },
            'signature-tandoori-platter': { ordersLastHour: 5, rating: 4.7, reviews: 34, chefPick: true },
            'tropical-sunrise': { ordersLastHour: 15, rating: 4.6, reviews: 23 },
            'spicy-paneer-kebab': { ordersLastHour: 7, rating: 4.8, reviews: 56 }
        };
    }

    generateSocialProof() {
        // Update social proof data with random variations
        Object.keys(this.socialProofData).forEach(itemId => {
            const data = this.socialProofData[itemId];
            // Simulate live updates
            data.ordersLastHour += Math.floor(Math.random() * 3);
        });
    }

    getSocialProofForItem(itemId) {
        return this.socialProofData[itemId];
    }

    createSocialProofHTML(socialProof) {
        let html = '<div class="social-proof-overlay">';
        
        if (socialProof.popular) {
            html += '<span class="popular-badge"><i class="fas fa-fire"></i> Popular</span>';
        }
        
        if (socialProof.chefPick) {
            html += '<span class="chef-pick-badge"><i class="fas fa-star"></i> Chef Pick</span>';
        }

        html += `<div class="live-counter"><i class="fas fa-bolt"></i> ${socialProof.ordersLastHour} ordered</div>`;
        html += `<div class="rating"><i class="fas fa-star"></i> ${socialProof.rating} (${socialProof.reviews})</div>`;
        html += '</div>';
        
        return html;
    }

    addSocialProofToItems() {
        const menuCards = document.querySelectorAll('.menu-card');
        menuCards.forEach(card => {
            const itemId = card.dataset.itemId;
            const socialProof = this.getSocialProofForItem(itemId);
            if (socialProof) {
                const socialProofHTML = this.createSocialProofHTML(socialProof);
                card.querySelector('.card-media').insertAdjacentHTML('beforeend', socialProofHTML);
            }
        });
    }

    // USER TRACKING AND ANALYTICS
    initUserTracking() {
        this.userPreferences = {
            viewedItems: [],
            searchHistory: [],
            filterUsage: {},
            sessionStart: new Date(),
            pageViews: 0
        };

        // Load from localStorage if available
        const savedPreferences = localStorage.getItem('userPreferences');
        if (savedPreferences) {
            this.userPreferences = { ...this.userPreferences, ...JSON.parse(savedPreferences) };
        }

        this.userPreferences.pageViews++;
        this.saveUserPreferences();
    }

    trackUserBehavior(action, data = {}) {
        const event = {
            action,
            data,
            timestamp: new Date().toISOString(),
            page: window.location.pathname,
            userAgent: navigator.userAgent
        };

        // Update user preferences based on behavior
        switch (action) {
            case 'item_view':
                if (!this.userPreferences.viewedItems.includes(data.itemId)) {
                    this.userPreferences.viewedItems.push(data.itemId);
                }
                break;
            case 'search':
                this.userPreferences.searchHistory.push({
                    query: data.query,
                    timestamp: new Date().toISOString(),
                    results: data.results
                });
                break;
            case 'filter_applied':
                this.userPreferences.filterUsage[data.filter] = 
                    (this.userPreferences.filterUsage[data.filter] || 0) + 1;
                break;
        }

        this.saveUserPreferences();
        
        // In a real app, you would send this to your analytics service
        console.log('User Behavior:', event);
    }

    saveUserPreferences() {
        localStorage.setItem('userPreferences', JSON.stringify(this.userPreferences));
    }

    // UTILITY METHODS
    getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    // ENHANCED STAGGER ANIMATIONS
    applyStaggerAnimations() {
        const staggerItems = document.querySelectorAll('.stagger-item');
        staggerItems.forEach((item, index) => {
            item.style.animationDelay = `${index * 0.1}s`;
        });
    }
}

// ========== GLOBAL INITIALIZATION ==========
let premiumMenu;

document.addEventListener('DOMContentLoaded', () => {
    premiumMenu = new PremiumMenu();
    
    // Apply stagger animations after DOM is ready
    setTimeout(() => {
        premiumMenu.applyStaggerAnimations();
    }, 100);
});

// Global function for AI recommendations
window.followAIRecommendation = function(recommendationId) {
    if (premiumMenu) {
        premiumMenu.followAIRecommendation(recommendationId);
    }
};

// Export for module usage if needed
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PremiumMenu;
}