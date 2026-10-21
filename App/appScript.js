const buttons = document.querySelectorAll('.options_button');
const close_product_creator = document.getElementById('close_creator');
const close_view = document.getElementById('close_view');
const close_close_view = document.getElementById('close_close_view');
const selection_circle = document.getElementById('options_circle');
const swipe_container = document.getElementById('swipe_container');

const product_creator = document.getElementById('product_creator');
let isClicked = false;

//---------------NAVEGACIÓN (sin cambios de comportamiento)----------------//
if(buttons.length > 0) {
  selection_circle.style.width = `${buttons[0].getBoundingClientRect().width}px`;
  selection_circle.style.transform = `translateX(${buttons[0].getBoundingClientRect().left - selection_circle.parentElement.getBoundingClientRect().left}px)`;
}

selection_circle.style.transform = `translateX(${buttons[0].getBoundingClientRect().left - selection_circle.parentElement.getBoundingClientRect().left - 5}px)`;

// Coloca el círculo sobre el botón de la pestaña actual (home o stats)
function moveCircleToCurrentPage() {
  const posicionScroll = swipe_container.scrollLeft;
  const windowWidth = window.innerWidth;
  const target = posicionScroll >= windowWidth / 2 ? 'stats_button' : 'home_button';

  const rectBoton = document.getElementById(target).getBoundingClientRect();
  const rectPadre = selection_circle.parentElement.getBoundingClientRect();
  selection_circle.style.transform = `translateX(${rectBoton.left - rectPadre.left - 5}px)`;
}

buttons.forEach(button => {
  button.addEventListener('click', () => {
    isClicked = true;

    const rectBoton = button.getBoundingClientRect();
    const rect = selection_circle.parentElement.getBoundingClientRect();

    const xRelative = rectBoton.left - rect.left - 5;
    
    selection_circle.style.transform = `translateX(${xRelative}px)`;
    selection_circle.style.width = `${rectBoton.width}px`;
  
    if (button.id === 'home_button') {
      swipe_container.scrollTo({ left: 0, behavior: 'auto' });
    } else if (button.id === 'stats_button') {
      swipe_container.scrollTo({ left: window.innerWidth, behavior: 'auto' });
    } else if (button.id === 'add_product') {
      openCreator(null); // producto nuevo
    }

    setTimeout(() => {
      isClicked = false;
    }, 400); 
  });
});

moveCircleToCurrentPage();

swipe_container.addEventListener('scroll', () => {
  if (isClicked) return;
  moveCircleToCurrentPage();
});

//---------------ALMACENAMIENTO----------------//
const STORAGE_KEY = 'mohan_products';
const MAX_IMAGES = 6;
const MAX_TAGS = 8;

let products = loadProducts();

function loadProducts() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.log('Error leyendo productos', err);
    return [];
  }
}

// Devuelve true si se guardó bien
function saveProducts() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
    return true;
  } catch (err) {
    console.log('Error guardando productos', err);
    return false;
  }
}

//---------------RENDER DE LA LISTA----------------//
const product_grid = document.getElementById('product_grid');

function createTagChip(text) {
  const chip = document.createElement('span');
  chip.className = 'tag_chip';
  chip.textContent = text;
  return chip;
}

function renderProducts() {
  product_grid.innerHTML = '';

  if (products.length === 0) {
    const empty = document.createElement('p');
    empty.className = 'empty_text';
    empty.textContent = 'Aún no hay productos. Pulsa + para añadir el primero.';
    product_grid.appendChild(empty);
    return;
  }

  products.forEach(prod => {
    const card = document.createElement('div');
    card.className = 'product';
    card.id = 'product' + prod.id;

    const overlay = document.createElement('div');
    overlay.className = 'product_input_overlay';
    overlay.addEventListener('click', () => openDetail(prod.id));

    const img = document.createElement('img');
    img.className = 'product_img';
    img.src = prod.images[0];
    img.alt = prod.name;

    const info = document.createElement('div');
    info.className = 'product_info';

    const name = document.createElement('h4');
    name.className = 'product_name';
    name.textContent = prod.name;

    const tags = document.createElement('div');
    tags.className = 'tag_list';
    prod.tags.slice(0, 3).forEach(t => tags.appendChild(createTagChip(t)));
    if (prod.tags.length > 3) tags.appendChild(createTagChip('+' + (prod.tags.length - 3)));

    info.appendChild(name);
    info.appendChild(tags);
    card.appendChild(overlay);
    card.appendChild(img);
    card.appendChild(info);
    product_grid.appendChild(card);
  });
}

//---------------CREAR / EDITAR----------------//
const creator_title = document.getElementById('creator_title');
const image_input = document.getElementById('image_input');
const image_previews = document.getElementById('image_previews');
const add_image_tile = document.getElementById('add_image_tile');
const title_input = document.getElementById('title_input');
const tag_input = document.getElementById('tag_input');
const add_tag_button = document.getElementById('add_tag_button');
const tag_list = document.getElementById('tag_list');
const creator_error = document.getElementById('creator_error');
const save_product = document.getElementById('save_product');

let editingId = null;   // null = producto nuevo
let draftImages = [];
let draftTags = [];

function openCreator(prod) {
  editingId = prod ? prod.id : null;
  draftImages = prod ? [...prod.images] : [];
  draftTags = prod ? [...prod.tags] : [];

  creator_title.textContent = prod ? 'Editar producto' : 'Nuevo producto';
  title_input.value = prod ? prod.name : '';
  tag_input.value = '';
  creator_error.textContent = '';

  renderDraftImages();
  renderDraftTags();
  product_creator.scrollTop = 0;
  product_creator.style.transform = 'translateY(0)';
}

function closeCreator() {
  product_creator.style.transform = 'translateY(150vh)';
  moveCircleToCurrentPage();
}

close_product_creator.addEventListener('click', closeCreator);

// Imágenes: se reducen para que quepan en el almacenamiento del móvil
function fileToDataURL(file, maxSize = 900, quality = 0.75) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

image_input.addEventListener('change', async () => {
  const files = Array.from(image_input.files);
  creator_error.textContent = '';

  for (const file of files) {
    if (draftImages.length >= MAX_IMAGES) {
      creator_error.textContent = `Máximo ${MAX_IMAGES} imágenes por producto.`;
      break;
    }
    try {
      draftImages.push(await fileToDataURL(file));
    } catch (err) {
      creator_error.textContent = 'No se pudo leer una de las imágenes.';
    }
  }

  image_input.value = ''; // permite volver a elegir el mismo archivo
  renderDraftImages();
});

function renderDraftImages() {
  image_previews.querySelectorAll('.preview_item').forEach(el => el.remove());

  draftImages.forEach((src, i) => {
    const item = document.createElement('div');
    item.className = 'preview_item';

    const img = document.createElement('img');
    img.src = src;
    img.alt = 'Imagen ' + (i + 1);

    const remove = document.createElement('button');
    remove.type = 'button';
    remove.className = 'remove_badge';
    remove.textContent = '×';
    remove.addEventListener('click', () => {
      draftImages.splice(i, 1);
      renderDraftImages();
    });

    item.appendChild(img);
    item.appendChild(remove);
    image_previews.insertBefore(item, add_image_tile);
  });

  add_image_tile.style.display = draftImages.length >= MAX_IMAGES ? 'none' : 'flex';
}

// Etiquetas
function addTag() {
  const value = tag_input.value.trim().toLowerCase();
  if (!value) return;

  if (draftTags.includes(value)) {
    creator_error.textContent = 'Esa etiqueta ya está añadida.';
  } else if (draftTags.length >= MAX_TAGS) {
    creator_error.textContent = `Máximo ${MAX_TAGS} etiquetas.`;
  } else {
    draftTags.push(value);
    creator_error.textContent = '';
    renderDraftTags();
  }
  tag_input.value = '';
}

function renderDraftTags() {
  tag_list.innerHTML = '';
  draftTags.forEach((tag, i) => {
    const chip = createTagChip(tag);
    chip.classList.add('removable');
    chip.addEventListener('click', () => {
      draftTags.splice(i, 1);
      renderDraftTags();
    });
    tag_list.appendChild(chip);
  });
}

add_tag_button.addEventListener('click', addTag);
tag_input.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' || e.key === ',') {
    e.preventDefault();
    addTag();
  }
});

save_product.addEventListener('click', () => {
  addTag(); // por si dejó una etiqueta escrita sin pulsar "Añadir"

  const name = title_input.value.trim();
  if (!name) {
    creator_error.textContent = 'Escribe un título para el producto.';
    return;
  }
  if (draftImages.length === 0) {
    creator_error.textContent = 'Añade al menos una imagen.';
    return;
  }

  const backup = JSON.stringify(products);

  if (editingId === null) {
    products.unshift({
      id: Date.now().toString(),
      name,
      images: [...draftImages],
      tags: [...draftTags]
    });
  } else {
    const prod = products.find(p => p.id === editingId);
    prod.name = name;
    prod.images = [...draftImages];
    prod.tags = [...draftTags];
  }

  if (!saveProducts()) {
    products = JSON.parse(backup); // deshace el cambio si no cabe
    creator_error.textContent = 'No hay espacio para guardar. Prueba con menos imágenes.';
    return;
  }

  renderProducts();
  closeCreator();
});

//---------------VISTA DE DETALLE----------------//
const detail_gallery = document.getElementById('detail_gallery');
const detail_title = document.getElementById('detail_title');
const detail_tags = document.getElementById('detail_tags');
const edit_product = document.getElementById('edit_product');
const delete_product = document.getElementById('delete_product');

let currentDetailId = null;

function openDetail(id) {
  const prod = products.find(p => p.id === id);
  if (!prod) return;
  currentDetailId = id;

  detail_gallery.innerHTML = '';
  prod.images.forEach((src, i) => {
    const img = document.createElement('img');
    img.src = src;
    img.alt = prod.name + ' ' + (i + 1);
    detail_gallery.appendChild(img);
  });
  detail_gallery.scrollLeft = 0;

  detail_title.textContent = prod.name;

  detail_tags.innerHTML = '';
  prod.tags.forEach(t => detail_tags.appendChild(createTagChip(t)));

  close_view.scrollTop = 0;
  close_view.style.transform = 'translateY(0)';
}

function closeDetail() {
  close_view.style.transform = 'translateY(150vh)';
}

close_close_view.addEventListener('click', closeDetail);

edit_product.addEventListener('click', () => {
  const prod = products.find(p => p.id === currentDetailId);
  if (!prod) return;
  closeDetail();
  openCreator(prod);
});

delete_product.addEventListener('click', () => {
  if (!confirm('¿Seguro que quieres borrar este producto?')) return;

  products = products.filter(p => p.id !== currentDetailId);
  saveProducts();
  renderProducts();
  closeDetail();
});

renderProducts();

//------------------PWA------------------//
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('service-worker.js')
        .then(reg => console.log('PWA successfully registered', reg))
        .catch(err => console.log('Error registering PWA', err));
    });
}
