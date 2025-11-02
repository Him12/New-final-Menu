// main.js — improved UI/UX: square cards, categories accordion, modal, 5-language support
document.addEventListener('DOMContentLoaded', () => {

  // Menu data: categories each have multiple items. Provide translations for each item per language.
  const MENU = {
    bestsellers: {
      label: {en:'Best Sellers', fr:'Meilleures ventes', es:'Más vendidos', it:'Più venduti', jp:'ベストセラー'},
      items: [
        {
          id:'tandoori-burger',
          image:'https://images.unsplash.com/photo-1541691538877-1d6b6c9cdd88?auto=format&fit=crop&w=900&q=80',
          model:'assets/models/burger_realistic_free.glb', // place a valid .glb here to enable AR
          translations:{
            en:{name:'Tandoori Burger', desc:'Smoky spice burger with yogurt', price:'₹480', ingredients:'Bun, patty, tandoori masala, yogurt'},
            fr:{name:'Burger Tandoori', desc:'Burger épicé fumé avec yaourt', price:'₹480', ingredients:'Pain, steak, masala, yaourt'},
            es:{name:'Hamburguesa Tandoori', desc:'Hamburguesa especiada con yogur', price:'₹480', ingredients:'Pan, carne, masala, yogur'},
            it:{name:'Burger Tandoori', desc:'Burger speziato con yogurt', price:'₹480', ingredients:'Panino, polpetta, masala, yogurt'},
            jp:{name:'タンドリーバーガー', desc:'ヨーグルトのスパイシーバーガー', price:'₹480', ingredients:'バンズ、パティ、タンドリーマサラ、ヨーグルト'}
          }
        },
        {
          id:'butter-chicken',
          image:'https://images.unsplash.com/photo-1604908176836-2266d94c69b1?auto=format&fit=crop&w=900&q=80',
          model:'',
          translations:{
            en:{name:'Butter Chicken', desc:'Creamy tomato gravy with tandoori chicken', price:'₹550', ingredients:'Chicken, tomato, cream, butter, spices'},
            fr:{name:'Poulet au Beurre', desc:'Poulet dans sauce crémeuse à la tomate', price:'₹550', ingredients:'Poulet, tomate, crème, beurre, épices'},
            es:{name:'Pollo con Mantequilla', desc:'Pollo en salsa cremosa de tomate', price:'₹550', ingredients:'Pollo, tomate, crema, mantequilla, especias'},
            it:{name:'Pollo al Burro', desc:'Pollo in salsa cremosa di pomodoro', price:'₹550', ingredients:'Pollo, pomodoro, panna, burro'},
            jp:{name:'バターチキン', desc:'トマトクリームのチキン', price:'₹550', ingredients:'チキン、トマト、クリーム、バター'}
          }
        }
      ]
    },

    appetizers: {
      label: {en:'Appetizers', fr:'Entrées', es:'Entrantes', it:'Antipasti', jp:'前菜'},
      items: [
        {
          id:'crispy-corn',
          image:'https://images.unsplash.com/photo-1627308595229-7830a5c91f9f?auto=format&fit=crop&w=900&q=80',
          model:'',
          translations:{
            en:{name:'Crispy Corn', desc:'Lightly spiced fried corn kernels', price:'₹280', ingredients:'Corn, spices, herbs'},
            fr:{name:'Maïs croustillant', desc:'Maïs frit légèrement épicé', price:'₹280', ingredients:'Maïs, épices, herbes'},
            es:{name:'Maíz Crujiente', desc:'Maíz frito ligeramente especiado', price:'₹280', ingredients:'Maíz, especias'},
            it:{name:'Mais Croccante', desc:'Mais fritto leggermente speziato', price:'₹280', ingredients:'Mais, spezie'},
            jp:{name:'クリスピ―コーン', desc:'軽くスパイスした揚げコーン', price:'₹280', ingredients:'コーン、スパイス'}
          }
        },
        {
          id:'spring-rolls',
          image:'https://images.unsplash.com/photo-1604908176836-2266d94c69b1?auto=format&fit=crop&w=900&q=80',
          model:'',
          translations:{
            en:{name:'Veg Spring Rolls', desc:'Crispy rolls with vegetable filling', price:'₹250', ingredients:'Vegetables, wrapper, sauce'},
            fr:{name:'Rouleaux de Printemps', desc:'Rouleaux croustillants aux légumes', price:'₹250', ingredients:'Légumes, feuille, sauce'},
            es:{name:'Rollitos de Primavera', desc:'Rollitos crujientes rellenos de verduras', price:'₹250', ingredients:'Verduras, masa'},
            it:{name:'Involtini Primavera', desc:'Involtini croccanti con verdure', price:'₹250', ingredients:'Verdure, involucro'},
            jp:{name:'春巻き', desc:'野菜入りの春巻き', price:'₹250', ingredients:'野菜、皮'}
          }
        }
      ]
    },

    indian: {
      label: {en:'Indian', fr:'Indien', es:'Indio', it:'Indiano', jp:'インド料理'},
      items:[
        {
          id:'dal-makhani',
          image:'https://images.unsplash.com/photo-1627328715728-7bcc1b5db87d?auto=format&fit=crop&w=900&q=80',
          model:'',
          translations:{
            en:{name:'Dal Makhani', desc:'Slow-cooked black lentils', price:'₹380', ingredients:'Black lentils, butter, cream'},
            fr:{name:'Dal Makhani', desc:'Lentilles noires mijotées', price:'₹380', ingredients:'Lentilles, beurre, crème'},
            es:{name:'Dal Makhani', desc:'Lentejas negras cocinadas lentamente', price:'₹380', ingredients:'Lentejas, mantequilla, crema'},
            it:{name:'Dal Makhani', desc:'Lenticchie nere cotte lentamente', price:'₹380', ingredients:'Lenticchie, burro, panna'},
            jp:{name:'ダールマカニ', desc:'じっくり煮込んだ黒レンズ豆', price:'₹380', ingredients:'黒レンズ豆、バター、クリーム'}
          }
        }
      ]
    },

    french: {
      label: {en:'French', fr:'Français', es:'Francés', it:'Francese', jp:'フランス料理'},
      items:[
        {
          id:'ratatouille',
          image:'https://images.unsplash.com/photo-1543353071-087092ec3935?auto=format&fit=crop&w=900&q=80',
          model:'',
          translations:{
            en:{name:'Ratatouille', desc:'Provençal vegetable medley', price:'₹420', ingredients:'Eggplant, zucchini, tomato, herbs'},
            fr:{name:'Ratatouille', desc:'Mélange de légumes provençal', price:'₹420', ingredients:'Aubergine, courgette, tomate, herbes'},
            es:{name:'Ratatouille', desc:'Mezcla de verduras provenzal', price:'₹420', ingredients:'Berenjena, calabacín, tomate'},
            it:{name:'Ratatouille', desc:'Misto di verdure alla provenzale', price:'₹420', ingredients:'Melanzane, zucchine, pomodoro'},
            jp:{name:'ラタトゥイユ', desc:'プロヴァンス風の野菜の煮込み', price:'₹420', ingredients:'なす、ズッキーニ、トマト'}
          }
        }
      ]
    },

    breads: {
      label: {en:'Breads', fr:'Pains', es:'Panes', it:'Pane', jp:'パン'},
      items:[
        {
          id:'garlic-naan',
          image:'https://images.unsplash.com/photo-1579613832129-df17d44fd7d4?auto=format&fit=crop&w=900&q=80',
          model:'',
          translations:{
            en:{name:'Garlic Naan', desc:'Fresh naan brushed with garlic butter', price:'₹120', ingredients:'Flour, garlic, butter'},
            fr:{name:'Naan à l\'Ail', desc:'Naan frais au beurre d\'ail', price:'₹120', ingredients:'Farine, ail, beurre'},
            es:{name:'Naan con Ajo', desc:'Naan recién horneado con mantequilla de ajo', price:'₹120', ingredients:'Harina, ajo, mantequilla'},
            it:{name:'Naan all\'Aglio', desc:'Naan appena sfornato con burro all\'aglio', price:'₹120', ingredients:'Farina, aglio, burro'},
            jp:{name:'ガーリックナン', desc:'ガーリックバターの焼きたてナン', price:'₹120', ingredients:'小麦粉、にんにく、バター'}
          }
        },
        {
          id:'laccha-paratha',
          image:'https://images.unsplash.com/photo-1606490197593-0cde59e6f69c?auto=format&fit=crop&w=900&q=80',
          model:'',
          translations:{
            en:{name:'Laccha Paratha', desc:'Layered whole wheat paratha', price:'₹160', ingredients:'Wheat, oil'},
            fr:{name:'Paratha Laccha', desc:'Paratha feuilleté', price:'₹160', ingredients:'Blé, huile'},
            es:{name:'Paratha Laccha', desc:'Paratha con capas', price:'₹160', ingredients:'Trigo, aceite'},
            it:{name:'Laccha Paratha', desc:'Paratha integrale a strati', price:'₹160', ingredients:'Grano, olio'},
            jp:{name:'ラッチャパラタ', desc:'層になったパラタ', price:'₹160', ingredients:'小麦、油'}
          }
        }
      ]
    },

    desserts: {
      label: {en:'Desserts', fr:'Desserts', es:'Postres', it:'Dolci', jp:'デザート'},
      items:[
        {
          id:'gulab-jamun',
          image:'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=900&q=80',
          model:'',
          translations:{
            en:{name:'Gulab Jamun', desc:'Soft milk dumplings in syrup', price:'₹220', ingredients:'Milk solids, sugar'},
            fr:{name:'Gulab Jamun', desc:'Boules de lait dans un sirop', price:'₹220', ingredients:'Lait, sucre'},
            es:{name:'Gulab Jamun', desc:'Bolas de leche en almíbar', price:'₹220', ingredients:'Leche, azúcar'},
            it:{name:'Gulab Jamun', desc:'Polpette di latte in sciroppo', price:'₹220', ingredients:'Latte, zucchero'},
            jp:{name:'グラブジャムン', desc:'シロップのミルク団子', price:'₹220', ingredients:'練乳、砂糖'}
          }
        },
        {
          id:'rasmalai',
          image:'https://images.unsplash.com/photo-1604152135912-04a022e23696?auto=format&fit=crop&w=900&q=80',
          model:'',
          translations:{
            en:{name:'Rasmalai', desc:'Saffron milk with soft cheese patties', price:'₹250', ingredients:'Milk, saffron, cheese'},
            fr:{name:'Rasmalai', desc:'Lait au safran et galettes de fromage', price:'₹250', ingredients:'Lait, safran, fromage'},
            es:{name:'Rasmalai', desc:'Leche de azafrán con tortitas de queso', price:'₹250', ingredients:'Leche, azafrán, queso'},
            it:{name:'Rasmalai', desc:'Latte di zafferano con polpette di formaggio', price:'₹250', ingredients:'Latte, zafferano, formaggio'},
            jp:{name:'ラスマライ', desc:'サフランミルクとチーズの菓子', price:'₹250', ingredients:'牛乳、サフラン、チーズ'}
          }
        }
      ]
    },

    beverages: {
      label: {en:'Beverages', fr:'Boissons', es:'Bebidas', it:'Bevande', jp:'飲み物'},
      items:[
        {
          id:'mango-lassi',
          image:'https://images.unsplash.com/photo-1606787366850-de6330128bfc?auto=format&fit=crop&w=900&q=80',
          model:'',
          translations:{
            en:{name:'Mango Lassi', desc:'Yogurt drink with fresh mango', price:'₹180', ingredients:'Yogurt, mango'},
            fr:{name:'Lassi à la Mangue', desc:'Boisson au yaourt et mangue', price:'₹180', ingredients:'Yaourt, mangue'},
            es:{name:'Lassi de Mango', desc:'Bebida de yogur con mango', price:'₹180', ingredients:'Yogur, mango'},
            it:{name:'Lassi al Mango', desc:'Bevanda yogurt e mango', price:'₹180', ingredients:'Yogurt, mango'},
            jp:{name:'マンゴーラッシー', desc:'マンゴー入りヨーグルト', price:'₹180', ingredients:'ヨーグルト、マンゴー'}
          }
        },
        {
          id:'masala-chai',
          image:'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=900&q=80',
          model:'',
          translations:{
            en:{name:'Masala Chai', desc:'Spiced Indian tea', price:'₹150', ingredients:'Tea, milk, spices'},
            fr:{name:'Chai Masala', desc:'Thé indien épicé', price:'₹150', ingredients:'Thé, lait, épices'},
            es:{name:'Masala Chai', desc:'Té especiado indio', price:'₹150', ingredients:'Té, leche, especias'},
            it:{name:'Masala Chai', desc:'Tè speziato indiano', price:'₹150', ingredients:'Tè, latte, spezie'},
            jp:{name:'マサラチャイ', desc:'スパイス紅茶', price:'₹150', ingredients:'紅茶、ミルク、スパイス'}
          }
        }
      ]
    }
  }; // MENU end

  // DOM elements
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
  const modelName = document.getElementById('modelName');
  const modelIngredients = document.getElementById('modelIngredients');

  const toastEl = document.getElementById('toast');

  // state
  let currentLang = 'en';
  let openCategory = null;
  let currentItem = null;

  // utilities
  function showToast(msg, ms=1800){
    toastEl.textContent = msg;
    toastEl.style.opacity = '1';
    toastEl.setAttribute('aria-hidden','false');
    setTimeout(()=>{ toastEl.style.opacity = '0'; toastEl.setAttribute('aria-hidden','true'); }, ms);
  }

  function safeImg(url){
    // small helper to return url (we rely on onerror fallback)
    return url;
  }

  // build category bar
  function buildCategoryBar(){
    categoryBar.innerHTML = '';
    Object.keys(MENU).forEach(key => {
      const btn = document.createElement('button');
      btn.className = 'cat-btn';
      btn.dataset.cat = key;
      btn.innerText = MENU[key].label[currentLang] || key;
      btn.addEventListener('click', () => {
        // collapse if already open
        if(openCategory === key){ openCategory = null; renderMenuArea(); return; }
        openCategory = key;
        renderMenuArea();
        // scroll to category
        const el = document.querySelector(`.cat-block[data-cat="${key}"]`);
        if(el) el.scrollIntoView({behavior:'smooth', block:'start'});
      });
      categoryBar.appendChild(btn);
    });
    highlightActiveButton();
  }

  // highlight active button
  function highlightActiveButton(){
    document.querySelectorAll('.cat-btn').forEach(b => {
      b.classList.toggle('active', b.dataset.cat === openCategory);
    });
  }

  // render all categories as accordion blocks
  function renderMenuArea(){
    menuArea.innerHTML = '';
    Object.keys(MENU).forEach(key => {
      const cat = MENU[key];
      const block = document.createElement('div');
      block.className = 'cat-block';
      block.dataset.cat = key;

      const header = document.createElement('div');
      header.className = 'cat-header';
      const h = document.createElement('h2'); h.textContent = cat.label[currentLang] || '';
      const p = document.createElement('p'); p.textContent = `${cat.items.length} items`;
      header.appendChild(h); header.appendChild(p);

      header.addEventListener('click', () => {
        openCategory = (openCategory === key) ? null : key;
        renderMenuArea();
      });

      const body = document.createElement('div');
      body.className = 'cat-body';
      if(openCategory !== key){
        body.style.display = 'none';
      }

      // grid of cards
      const grid = document.createElement('div');
      grid.className = 'grid';

      cat.items.forEach(item => {
        const t = item.translations[currentLang] || item.translations.en || {};
        const card = document.createElement('article');
        card.className = 'card';

        const media = document.createElement('div');
        media.className = 'card-media';
        media.style.backgroundImage = `url('${safeImg(item.image)}')`;

        // body
        const cbody = document.createElement('div');
        cbody.className = 'card-body';
        const title = document.createElement('h3'); title.className='card-title'; title.textContent = t.name || '';
        const desc = document.createElement('p'); desc.className='card-desc'; desc.textContent = t.desc || '';
        const footer = document.createElement('div'); footer.className = 'card-footer';
        const price = document.createElement('div'); price.className='price'; price.textContent = t.price || '';
        const actions = document.createElement('div'); actions.className='actions';

        const viewBtn = document.createElement('button'); viewBtn.className='btn'; viewBtn.textContent = (currentLang==='fr'?'Voir':currentLang==='es'?'Ver':currentLang==='it'?'Vedi':currentLang==='jp'?'表示':'View');
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
            showToast( {en:'AR coming soon',fr:'AR bientôt',es:'AR pronto',it:'AR in arrivo',jp:'AR 近日公開'}[currentLang] || 'AR coming soon' );
          }
        });

        actions.appendChild(viewBtn);
        actions.appendChild(arBtn);

        footer.appendChild(price);
        footer.appendChild(actions);

        cbody.appendChild(title);
        cbody.appendChild(desc);
        cbody.appendChild(footer);

        card.appendChild(media);
        card.appendChild(cbody);

        // click on whole card opens image modal
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

  // open image modal (fill content)
  function openImageModal(item){
    const t = item.translations[currentLang] || item.translations.en || {};
    modalImg.src = item.image;
    modalImg.alt = t.name || '';
    modalName.textContent = t.name || '';
    modalDesc.textContent = t.desc || '';
    modalPrice.textContent = t.price || '';
    modalARBtn.style.display = item.model && item.model.length ? 'inline-block' : 'none';
    modalARBtn.onclick = item.model && item.model.length ? () => { openModelModal(item); } : null;
    currentItem = item;
    imageModal.setAttribute('aria-hidden','false');
  }

  function closeImageModal(){
    modalImg.removeAttribute('src');
    imageModal.setAttribute('aria-hidden','true');
  }

  // open model modal
  function openModelModal(item){
    const t = item.translations[currentLang] || item.translations.en || {};
    mv.removeAttribute('src');
    if(item.model && item.model.length){
      mv.setAttribute('src', item.model);
    }
    modelName.textContent = t.name || '';
    modelIngredients.textContent = (t.ingredients ? (label('ingredients') + ': ' + t.ingredients) : '');
    modelModal.setAttribute('aria-hidden','false');
  }

  function closeModelModal(){
    mv.removeAttribute('src');
    modelModal.setAttribute('aria-hidden','true');
  }

  // label helper
  function label(key){
    const L = {
      ingredients:{en:'Ingredients',fr:'Ingrédients',es:'Ingredientes',it:'Ingredienti',jp:'材料'}
    };
    return (L[key] && L[key][currentLang]) ? L[key][currentLang] : (L[key].en || key);
  }

  // language change
  langSelect.addEventListener('change', (e) => {
    currentLang = e.target.value;
    buildCategoryBar();
    renderMenuArea();
  });

  // modal close buttons and outside click
  closeImageModalBtn.addEventListener('click', closeImageModal);
  closeModelModalBtn.addEventListener('click', closeModelModal);

  [imageModal, modelModal].forEach(m => {
    m.addEventListener('click', (ev) => {
      if(ev.target === m) { if(m===imageModal) closeImageModal(); else closeModelModal(); }
    });
  });

  // escape key closes modals
  document.addEventListener('keydown', (e) => {
    if(e.key === 'Escape'){ if(imageModal.getAttribute('aria-hidden') === 'false') closeImageModal(); if(modelModal.getAttribute('aria-hidden') === 'false') closeModelModal(); }
  });

  // initial build
  buildCategoryBar();
  renderMenuArea();

}); // DOMContentLoaded end
