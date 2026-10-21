const buttons = document.querySelectorAll('.options_button');
const close_product_creator = document.getElementById('close_creator');
const close_view = document.getElementById('close_view');
const close_close_view = document.getElementById('close_close_view');
const selection_circle = document.getElementById('options_circle');
const swipe_container = document.getElementById('swipe_container');

const product_creator = document.getElementById('product_creator');
let isClicked = false;

if(buttons.length > 0) {
  selection_circle.style.width = `${buttons[0].getBoundingClientRect().width}px`;
  selection_circle.style.transform = `translateX(${buttons[0].getBoundingClientRect().left - selection_circle.parentElement.getBoundingClientRect().left}px)`;
}

selection_circle.style.transform = `translateX(${buttons[0].getBoundingClientRect().left - selection_circle.parentElement.getBoundingClientRect().left - 5}px)`;

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
    }else if (button.id === 'add_product'){
      product_creator.style.transform = 'translateY(0)';
    }

    setTimeout(() => {
      isClicked = false;
    }, 400); 
  });
});

const rectBoton = document.getElementById('home_button').getBoundingClientRect();
const rectPadre = selection_circle.parentElement.getBoundingClientRect();
selection_circle.style.transform = `translateX(${rectBoton.left - rectPadre.left - 5}px)`;

swipe_container.addEventListener('scroll', () => {
  if (isClicked) return;

  const posicionScroll = swipe_container.scrollLeft;
  const windowWidth = window.innerWidth;

  if (posicionScroll >= windowWidth / 2) {
    const rectBoton = document.getElementById('stats_button').getBoundingClientRect();
    const rectPadre = selection_circle.parentElement.getBoundingClientRect();
    selection_circle.style.transform = `translateX(${rectBoton.left - rectPadre.left - 5}px)`;
  } else {
    const rectBoton = document.getElementById('home_button').getBoundingClientRect();
    const rectPadre = selection_circle.parentElement.getBoundingClientRect();
    selection_circle.style.transform = `translateX(${rectBoton.left - rectPadre.left - 5}px)`;
  }
});

close_product_creator.addEventListener('click', () => {
  product_creator.style.transform = 'translateY(150vh)';

  const posicionScroll = swipe_container.scrollLeft;
  const windowWidth = window.innerWidth;

  if (posicionScroll >= windowWidth / 2) {
    const rectBoton = document.getElementById('stats_button').getBoundingClientRect();
    const rectPadre = selection_circle.parentElement.getBoundingClientRect();
    selection_circle.style.transform = `translateX(${rectBoton.left - rectPadre.left - 5}px)`;
  } else {
    const rectBoton = document.getElementById('home_button').getBoundingClientRect();
    const rectPadre = selection_circle.parentElement.getBoundingClientRect();
    selection_circle.style.transform = `translateX(${rectBoton.left - rectPadre.left - 5}px)`;
  }
});
  
//---------------PRODUCTS RENDERING----------------//
const myProducts = [
    { name: "Jarrón de Arcilla", desc: "Un jarrón artesanal precioso.", img: "https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&w=500&q=60" },
    { name: "Plato Decorativo", desc: "Cerámica esmaltada azul.", img: "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=500&q=60" },
    { name: "Juego de Tazas", desc: "Tazas perfectas para café.", img: "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?auto=format&fit=crop&w=500&q=60" },
    { name: "Bote de Flores", desc: "Minimalismo en su estado puro.", img: "https://images.unsplash.com/photo-1581783330310-3574756353d2?auto=format&fit=crop&w=500&q=60" },
    { name: "Bote de Flore", desc: "Minimalismo en su estado puro.", img: "https://images.unsplash.com/photo-1581783330310-3574756353d2?auto=format&fit=crop&w=500&q=60" },
    { name: "Bote de Flore", desc: "Minimalismo en su estado puro.", img: "https://images.unsplash.com/photo-1581783330310-3574756353d2?auto=format&fit=crop&w=500&q=60" },
    { name: "Bote de Flore", desc: "Minimalismo en su estado puro.", img: "https://images.unsplash.com/photo-1581783330310-3574756353d2?auto=format&fit=crop&w=500&q=60" }
];

const productsList = [];

function renderProducts(products) {
    const container = document.getElementById('product_grid');
    container.innerHTML = ''; // We clear the container before rendering new products

    products.forEach((prod, index)   => {
        const card = document.createElement('div');
        card.className = 'product';
        card.id = 'product' + index;
        
        card.innerHTML = `
          <div class="product_input_overlay"></div>
          <img class="product_img" src="${prod.img}" alt="${prod.name}"></img>
            <div class="product_info">
                <h4 class="product_name">${prod.name}</h4>
            </div>
        `;

        productsList.push(card); // We add the card to the products array
        container.appendChild(card);
    });
}
renderProducts(myProducts);

productsList.forEach((product, index) => {
    product.querySelector('.product_input_overlay').addEventListener('click', () => {
      close_view.style.transform = 'translateY(0)';
    });
});

close_close_view.addEventListener('click', () => {
    close_view.style.transform = 'translateY(150vh)';
});

//------------------PWA------------------//
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('service-worker.js')
        .then(reg => console.log('PWA successfully registered', reg))
        .catch(err => console.log('Error registering PWA', err));
    });
}