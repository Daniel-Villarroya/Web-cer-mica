console.log("Executing...");

const btnExplore = document.getElementById("explore_button");
const elementToScroll = document.getElementById("product_grid");

const btnHome = document.getElementById("home_button");
const btnChat = document.getElementById("chat_button");

const main_page = document.getElementById("main_page");
const chat_page = document.getElementById("chat_page");

const myProducts = [
    { name: "Jarrón de Arcilla", desc: "Un jarrón artesanal precioso.", img: "https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&w=500&q=60" },
    { name: "Plato Decorativo", desc: "Cerámica esmaltada azul.", img: "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=500&q=60" },
    { name: "Juego de Tazas", desc: "Tazas perfectas para café.", img: "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?auto=format&fit=crop&w=500&q=60" },
    { name: "Bote de Flores", desc: "Minimalismo en su estado puro.", img: "https://images.unsplash.com/photo-1581783330310-3574756353d2?auto=format&fit=crop&w=500&q=60" },
    { name: "Bote de Flore", desc: "Minimalismo en su estado puro.", img: "https://images.unsplash.com/photo-1581783330310-3574756353d2?auto=format&fit=crop&w=500&q=60" },
    { name: "Bote de Flore", desc: "Minimalismo en su estado puro.", img: "https://images.unsplash.com/photo-1581783330310-3574756353d2?auto=format&fit=crop&w=500&q=60" },
    { name: "Bote de Flore", desc: "Minimalismo en su estado puro.", img: "https://images.unsplash.com/photo-1581783330310-3574756353d2?auto=format&fit=crop&w=500&q=60" }
];

function renderProducts(products) {
    const container = document.getElementById('product_grid');
    container.innerHTML = ''; // Limpiamos antes de empezar

    products.forEach((prod, index)   => {
        const card = document.createElement('div');
        card.className = 'card';
        card.id = 'card' + index;
        
        card.innerHTML = `
            <div class="card-info">
                <h4>${prod.name}</h4>
            </div>
            <img class="card-img" src="${prod.img}" alt="${prod.name}">
                <div class="card-text-fade"></div>
            </img>

            <div class="img-arrows">
                <div class="img-arrow-circle">
                    <svg width="256px" height="256px" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg" stroke="currentColor" stroke-width="0.00024000000000000003" id="img-arrow-L"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M5.70711 9.71069C5.31658 10.1012 5.31658 10.7344 5.70711 11.1249L10.5993 16.0123C11.3805 16.7927 12.6463 16.7924 13.4271 16.0117L18.3174 11.1213C18.708 10.7308 18.708 10.0976 18.3174 9.70708C17.9269 9.31655 17.2937 9.31655 16.9032 9.70708L12.7176 13.8927C12.3271 14.2833 11.6939 14.2832 11.3034 13.8927L7.12132 9.71069C6.7308 9.32016 6.09763 9.32016 5.70711 9.71069Z" fill="white"></path> </g></svg>
                </div>

                <div class="img-arrow-circle">
                    <svg width="256px" height="256px" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg" stroke="currentColor" stroke-width="0.00024000000000000003" id="img-arrow-R"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M5.70711 9.71069C5.31658 10.1012 5.31658 10.7344 5.70711 11.1249L10.5993 16.0123C11.3805 16.7927 12.6463 16.7924 13.4271 16.0117L18.3174 11.1213C18.708 10.7308 18.708 10.0976 18.3174 9.70708C17.9269 9.31655 17.2937 9.31655 16.9032 9.70708L12.7176 13.8927C12.3271 14.2833 11.6939 14.2832 11.3034 13.8927L7.12132 9.71069C6.7308 9.32016 6.09763 9.32016 5.70711 9.71069Z" fill="white"></path> </g></svg>
                </div>
            </div>

            <button class="card-button">
                <h4 class="card-button-text">Iniciar chat</h4>
                <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" class="card-button-x"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M19 5L5 19M5.00001 5L19 19" stroke="white" stroke-width="1.248" stroke-linecap="round" stroke-linejoin="round"></path> </g></svg>
            </button>
        `;

        const arrowLeft = card.querySelector('#img-arrow-L').closest('.img-arrow-circle');
        const arrowRight = card.querySelector('#img-arrow-R').closest('.img-arrow-circle');
        const chatButton = card.querySelector('.card-button');

        arrowLeft.addEventListener("click", () => {
            console.log("Flecha IZQUIERDA pulsada en: " + prod.name);
        });

        arrowRight.addEventListener("click", () => {
            console.log("Flecha DERECHA pulsada en: " + prod.name);
        });

        chatButton.addEventListener("click", () => {
            changePage(1); 
        });

        container.appendChild(card);
    });
}

renderProducts(myProducts);

//---------------------------------------------------------------------------------//
chat_page.style.display = "none";

function changePage(pageToChangeTo){
    if(pageToChangeTo == 0){
        main_page.style.display = "block";
        chat_page.style.display = "none";
    }else if(pageToChangeTo == 1){
        main_page.style.display = "none";
        chat_page.style.display = "block";  
    }else if(pageToChangeTo == 2){
        print("Change to login page");
    }
}

btnHome.addEventListener("click", () => {
    changePage(0);
})

btnChat.addEventListener("click", () => {
    changePage(1);
})

btnExplore.addEventListener("click", () => {
    if(elementToScroll){
        elementToScroll.scrollIntoView({
            behaviour: "smooth",
            block: "start"
        });
    }
})