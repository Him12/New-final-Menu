// main.js — World-Class UI/UX with Asynchronous Data Loading
document.addEventListener('DOMContentLoaded', () => {

  // --- Initial Setup and Data Fetch ---
  let MENU = {}; // MENU data will be loaded here
  let currentLang = 'en';
  let openCategory = null;
  let lastScrollY = window.scrollY;

  // DOM elements (same as before)
  const topbar = document.querySelector('.topbar');
  const categoryBar = document.getElementById('categoryBar');
  const menuArea = document.getElementById('menuArea');
  const langSelect = document.getElementById('lang');
  
  const imageModal = document.getElementById('imageModal');
  const closeImageModalBtn = document.getElementById('closeImageModal');
  const modalImg = document.getElementById('modalImg');
  const modalName = document.getElementById('modalName');
  const modalDesc = document.getElementById('modalDesc');
  const modalPrice = document.getElementById('modalPrice');
  const modalARBtn = document.getElementById('modalAR');

  const modelModal = document.getElementById('modelModal');
  const closeModelModalBtn = document.getElementById('closeModelModal');
  const mv = document.getElementById('mv');
  const modelNameEl = document.getElementById('modelName');
  const modelIngredients = document.getElementById('modelIngredients');
  
  const toastEl = document.getElementById('toast');


  async function fetchMenuData() {
    try {
      // Fetch the separate JSON file
      const response = await fetch('menu_data.json');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      MENU = await response.json();
      
      // Set the first category as the default open category
      openCategory = Object.keys(MENU)[0]; 

      // Once data is loaded, run the initial build functions
      buildCategoryBar();
      renderMenuArea();

    } catch (e) {
      console.error("Could not load menu data:", e);
      menuArea.innerHTML = '<p class="error-msg">Error loading menu. Please try again later.</p>';
    }
  }

  // --- Utilities ---

  function label(key){
    const L = {
      ingredients:{en:'Ingredients',fr:'Ingrédients',es:'Ingredientes',it:'Ingredienti',jp:'材料'},
      viewButton:{en:'View', fr:'Voir', es:'Ver', it:'Vedi', jp:'表示'},
      arComingSoon: {en:'AR feature coming soon',fr:'Fonctionnalité AR bientôt',es:'AR pronto',it:'AR in arrivo',jp:'AR 近日公開'}
    };
    return (L[key] && L[key][currentLang]) ? L[key][currentLang] : (L[key]?.en || key);
  }

  function showToast(msg, ms=1800){
    toastEl.textContent = msg;
    toastEl.style.opacity = '1';
    toastEl.setAttribute('aria-hidden','false');
    setTimeout(()=>{ toastEl.style.opacity = '0'; toastEl.setAttribute('aria-hidden','true'); }, ms);
  }

  // --- Header/Scroll Logic ---

  window.addEventListener('scroll', () => {
      topbar.classList.toggle('has-shadow', window.scrollY > 10);
      
      if (window.scrollY > 80 && window.scrollY > lastScrollY) {
          topbar.classList.add('is-hidden');
      } else {
          topbar.classList.remove('is-hidden');
      }
      
      lastScrollY = window.scrollY;
  });

  // --- Build/Render Functions ---

  function buildCategoryBar(){
    categoryBar.innerHTML = '';
    Object.keys(MENU).forEach(key => {
      const btn = document.createElement('button');
      btn.className = 'cat-btn';
      btn.dataset.cat = key;
      btn.innerText = MENU[key].label[currentLang] || key;
      btn.addEventListener('click', () => {
        const wasOpen = openCategory === key;
        openCategory = wasOpen ? null : key;
        
        // Use a slight delay if closing to allow CSS transition to start
        if(wasOpen){
          document.querySelector(`.cat-block[data-cat="${key}"]`)?.classList.remove('is-open');
          setTimeout(() => renderMenuArea(key), 250);
        } else {
          renderMenuArea(key);
        }

        // Smooth scroll to category
        const el = document.querySelector(`.cat-block[data-cat="${key}"]`);
        if(el) {
          const headerHeight = topbar.offsetHeight + categoryBar.offsetHeight + 10;
          const targetY = el.offsetTop - headerHeight;
          window.scrollTo({top: targetY, behavior:'smooth'});
        }
      });
      categoryBar.appendChild(btn);
    });
    highlightActiveButton();
  }

  function highlightActiveButton(){
    document.querySelectorAll('.cat-btn').forEach(b => {
      b.classList.toggle('active', b.dataset.cat === openCategory);
    });
  }

  function renderMenuArea(){
    menuArea.innerHTML = '';
    Object.keys(MENU).forEach(key => {
      const cat = MENU[key];
      const block = document.createElement('div');
      block.className = 'cat-block';
      block.dataset.cat = key;
      
      const isOpen = openCategory === key;
      if (isOpen) {
        block.classList.add('is-open');
      }

      const header = document.createElement('div');
      header.className = 'cat-header';
      const h = document.createElement('h2'); 
      // Use innerHTML for description to allow bolding via ** (not yet fully implemented but ready for it)
      h.innerHTML = cat.label[currentLang] || ''; 
      const p = document.createElement('p'); p.textContent = `${cat.items.length} items`;
      header.appendChild(h); header.appendChild(p);

      header.addEventListener('click', () => {
        document.querySelector(`.cat-btn[data-cat="${key}"]`).click();
      });

      const body = document.createElement('div');
      body.className = 'cat-body';
      
      const grid = document.createElement('div');
      grid.className = 'grid';

      cat.items.forEach(item => {
        const t = item.translations[currentLang] || item.translations.en || {};
        const card = document.createElement('article');
        card.className = 'card';
        
        // Add press effect listeners
        card.addEventListener('mousedown', () => card.classList.add('is-pressed'));
        card.addEventListener('mouseup', () => card.classList.remove('is-pressed'));
        card.addEventListener('touchstart', () => card.classList.add('is-pressed'));
        card.addEventListener('touchend', () => card.classList.remove('is-pressed'));


        const media = document.createElement('div');
        media.className = 'card-media';
        
        const img = document.createElement('img');
        img.className = 'card-img';
        img.src = item.image;
        img.alt = t.name || '';
        img.loading = 'lazy'; 
        
        img.onload = () => { img.style.opacity = '1'; };
        
        media.appendChild(img);


        const cbody = document.createElement('div');
        cbody.className = 'card-body';
        const title = document.createElement('h3'); title.className='card-title'; title.textContent = t.name || '';
        
        const desc = document.createElement('p'); 
        desc.className='card-desc'; 
        // Quick regex to handle simple **bolding** from the JSON data
        desc.innerHTML = (t.desc || '').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        
        const footer = document.createElement('div'); footer.className = 'card-footer';
        const price = document.createElement('div'); price.className='price'; price.textContent = t.price || '';
        const actions = document.createElement('div'); actions.className='actions';

        const viewBtn = document.createElement('button'); viewBtn.className='btn'; viewBtn.textContent = label('viewButton');
        viewBtn.addEventListener('click', (ev) => {
          ev.stopPropagation();
          openImageModal(item);
        });

        const arBtn = document.createElement('button'); arBtn.className='btn primary'; arBtn.textContent = 'AR';
        arBtn.addEventListener('click', (ev) => {
          ev.stopPropagation();
          if(item.model && item.model.length){
            openModelModal(item);
          } else {
            showToast(label('arComingSoon'));
          }
        });

        actions.appendChild(viewBtn);
        if(item.model && item.model.length) {
            actions.appendChild(arBtn);
        }

        footer.appendChild(price);
        footer.appendChild(actions);

        cbody.appendChild(title);
        cbody.appendChild(desc);
        cbody.appendChild(footer);

        card.appendChild(media);
        card.appendChild(cbody);

        card.addEventListener('click', () => openImageModal(item));

        grid.appendChild(card);
      });

      body.appendChild(grid);

      block.appendChild(header);
      block.appendChild(body);
      menuArea.appendChild(block);
    });

    highlightActiveButton();
  }

  // --- Modal Logic (unchanged) ---

  function openImageModal(item){
    const t = item.translations[currentLang] || item.translations.en || {};
    
    modalImg.src = ''; 
    modalImg.src = item.image;
    modalImg.alt = t.name || '';
    modalName.textContent = t.name || '';
    modalDesc.innerHTML = (t.desc || '').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    modalPrice.textContent = t.price || '';
    
    const hasModel = item.model && item.model.length;
    modalARBtn.style.display = hasModel ? 'inline-block' : 'none';
    modalARBtn.onclick = hasModel ? () => { 
        closeImageModal(); 
        openModelModal(item); 
    } : null;
    
    imageModal.setAttribute('aria-hidden','false');
  }

  function closeImageModal(){
    imageModal.setAttribute('aria-hidden','true');
  }

  function openModelModal(item){
    const t = item.translations[currentLang] || item.translations.en || {};
    
    mv.removeAttribute('src');
    if(item.model && item.model.length){
      mv.setAttribute('src', item.model);
    }
    modelNameEl.textContent = t.name || '';
    // Use innerHTML to style ingredients if needed
    modelIngredients.innerHTML = (t.ingredients ? (label('ingredients') + ': ' + t.ingredients) : ''); 
    modelModal.setAttribute('aria-hidden','false');
  }

  function closeModelModal(){
    mv.removeAttribute('src');
    modelModal.setAttribute('aria-hidden','true');
  }

  // --- Event Listeners ---

  langSelect.addEventListener('change', (e) => {
    currentLang = e.target.value;
    // Re-render entire menu with new language
    buildCategoryBar();
    renderMenuArea();
  });

  closeImageModalBtn.addEventListener('click', closeImageModal);
  closeModelModalBtn.addEventListener('click', closeModelModal);

  [imageModal, modelModal].forEach(m => {
    m.addEventListener('click', (ev) => {
      if(ev.target === m) { if(m===imageModal) closeImageModal(); else closeModelModal(); }
    });
  });

  document.addEventListener('keydown', (e) => {
    if(e.key === 'Escape'){ 
      if(imageModal.getAttribute('aria-hidden') === 'false') closeImageModal(); 
      if(modelModal.getAttribute('aria-hidden') === 'false') closeModelModal(); 
    }
  });

  // --- Final Execution ---
  fetchMenuData();

});