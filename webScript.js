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
            openChatForProduct(prod, index);
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
        scrollMessagesToBottom(false);  
    }else if(pageToChangeTo == 2){
        console.log("Change to login page");
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
            behavior: "smooth",
            block: "start"
        });
    }
})

//---------------------------------------------------------------------------------//
//------------------------------------- CHAT --------------------------------------//
// De momento los chats son datos inventados. Al conectar Firebase:
//  - cuando llegue un mensaje de la otra persona -> addMessage(chatId, 'them', texto)
//  - al enviar (mira sendMessage)                -> guarda también el mensaje en Firebase
const SIMULATE_REPLIES = true; // ponlo en false cuando conectes Firebase

const chat_list = document.getElementById('chat_list');
const message_list = document.getElementById('message_list');
const conversation_avatar = document.getElementById('conversation_avatar');
const conversation_title = document.getElementById('conversation_title');
const chat_form = document.getElementById('chat-bar');
const chat_text = document.getElementById('chat-bar-text');
const send_button = document.getElementById('send_button');

const minutesAgo = m => Date.now() - m * 60000;

// Un chat por producto. id = 'p' + posición del producto en myProducts
const chats = [
    { id: 'p0', title: myProducts[0].name, img: myProducts[0].img, unread: 2, created: minutesAgo(200), messages: [
        { from: 'me',   text: 'Hola, ¿el jarrón sigue disponible?', ts: minutesAgo(180) },
        { from: 'them', text: '¡Hola! Sí, sigue disponible. Está hecho a mano.', ts: minutesAgo(172) },
        { from: 'me',   text: '¿Qué altura tiene?', ts: minutesAgo(165) },
        { from: 'them', text: 'Mide unos 28 cm de alto.', ts: minutesAgo(160) },
        { from: 'them', text: 'Si quieres te mando más fotos.', ts: minutesAgo(159) }
    ]},
    { id: 'p1', title: myProducts[1].name, img: myProducts[1].img, unread: 0, created: minutesAgo(900), messages: [
        { from: 'me',   text: 'Buenas, ¿hacéis envíos a Barcelona?', ts: minutesAgo(620) },
        { from: 'them', text: 'Sí, enviamos a toda España en 3-4 días.', ts: minutesAgo(600) },
        { from: 'me',   text: '¡Perfecto, gracias!', ts: minutesAgo(598) }
    ]},
    { id: 'p2', title: myProducts[2].name, img: myProducts[2].img, unread: 0, created: minutesAgo(3000), messages: [
        { from: 'me',   text: '¿Se puede pedir el juego con otro color?', ts: minutesAgo(1600) },
        { from: 'them', text: 'Claro, puedo hacerlo en verde o en blanco.', ts: minutesAgo(1580) }
    ]}
];

let activeChatId = chats[0].id;
let typingItem = null;
let replyTimers = [];

function getChat(id) {
    return chats.find(c => c.id === id);
}

function chatUpdated(chat) {
    return chat.messages.length ? chat.messages[chat.messages.length - 1].ts : chat.created;
}

function formatClock(ts) {
    return new Date(ts).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
}

function formatChatTime(ts) {
    const now = new Date();
    const startToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    if (ts >= startToday) return formatClock(ts);
    if (ts >= startToday - 86400000) return 'ayer';
    return new Date(ts).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' });
}

function scrollMessagesToBottom(smooth = true) {
    message_list.scrollTo({ top: message_list.scrollHeight, behavior: smooth ? 'smooth' : 'auto' });
}

// ---- Columna de chats ----
function renderChatList() {
    chat_list.innerHTML = '';

    [...chats].sort((a, b) => chatUpdated(b) - chatUpdated(a)).forEach(chat => {
        const item = document.createElement('li');

        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'chat_item';
        button.setAttribute('aria-current', chat.id === activeChatId ? 'true' : 'false');
        button.setAttribute('aria-label', 'Abrir chat de ' + chat.title);
        button.addEventListener('click', () => selectChat(chat.id));

        const avatar = document.createElement('img');
        avatar.className = 'chat_avatar';
        avatar.src = chat.img;
        avatar.alt = '';

        const text = document.createElement('span');
        text.className = 'chat_item_text';

        const title = document.createElement('strong');
        title.className = 'chat_item_title';
        title.textContent = chat.title;

        const preview = document.createElement('span');
        preview.className = 'chat_preview';
        const last = chat.messages[chat.messages.length - 1];
        preview.textContent = last ? (last.from === 'me' ? 'Tú: ' : '') + last.text : 'Chat nuevo';

        text.appendChild(title);
        text.appendChild(preview);

        const meta = document.createElement('span');
        meta.className = 'chat_item_meta';

        if (last) {
            const time = document.createElement('time');
            time.className = 'chat_time';
            time.dateTime = new Date(last.ts).toISOString();
            time.textContent = formatChatTime(last.ts);
            meta.appendChild(time);
        }

        if (chat.unread > 0) {
            const badge = document.createElement('span');
            badge.className = 'chat_badge';
            badge.textContent = chat.unread;
            badge.setAttribute('aria-label', chat.unread + ' mensajes sin leer');
            meta.appendChild(badge);
        }

        button.appendChild(avatar);
        button.appendChild(text);
        button.appendChild(meta);
        item.appendChild(button);
        chat_list.appendChild(item);
    });
}

// ---- Mensajes ----
// Burbuja azul a la derecha (from: 'me') o gris a la izquierda (from: 'them')
function createMessageItem(msg, isNew) {
    const item = document.createElement('li');
    item.className = 'message ' + (msg.from === 'me' ? 'mine' : 'theirs') + (isNew ? ' new' : '');

    const bubble = document.createElement('p');
    bubble.className = 'bubble';
    bubble.textContent = msg.text;

    const time = document.createElement('time');
    time.className = 'message_time';
    time.dateTime = new Date(msg.ts).toISOString();
    time.textContent = formatClock(msg.ts);

    item.appendChild(bubble);
    item.appendChild(time);
    return item;
}

function createHint(chat) {
    const hint = document.createElement('li');
    hint.className = 'chat_hint';
    hint.textContent = 'Escribe tu primer mensaje sobre «' + chat.title + '».';
    return hint;
}

function renderConversation() {
    const chat = getChat(activeChatId);
    if (!chat) return;

    conversation_avatar.src = chat.img;
    conversation_title.textContent = chat.title;

    message_list.innerHTML = '';
    typingItem = null;

    if (chat.messages.length === 0) {
        message_list.appendChild(createHint(chat));
    } else {
        chat.messages.forEach(msg => message_list.appendChild(createMessageItem(msg, false)));
    }
    scrollMessagesToBottom(false);
}

function selectChat(id) {
    const chat = getChat(id);
    if (!chat) return;

    activeChatId = id;
    chat.unread = 0;
    renderChatList();
    renderConversation();
}

// Añade un mensaje a un chat. Esta es la función que usará Firebase para los mensajes entrantes.
function addMessage(chatId, from, text) {
    const chat = getChat(chatId);
    if (!chat) return;

    const msg = { from, text, ts: Date.now() };
    chat.messages.push(msg);

    if (chatId === activeChatId) {
        const hint = message_list.querySelector('.chat_hint');
        if (hint) hint.remove();
        hideTyping();
        message_list.appendChild(createMessageItem(msg, true));
        scrollMessagesToBottom();
    } else if (from === 'them') {
        chat.unread = (chat.unread || 0) + 1;
    }

    renderChatList();
}

// ---- Indicador "escribiendo..." ----
function showTyping() {
    if (typingItem) return;

    typingItem = document.createElement('li');
    typingItem.className = 'message theirs typing new';
    typingItem.setAttribute('aria-label', 'Escribiendo...');

    const bubble = document.createElement('p');
    bubble.className = 'bubble';
    for (let i = 0; i < 3; i++) bubble.appendChild(document.createElement('span'));

    typingItem.appendChild(bubble);
    message_list.appendChild(typingItem);
    scrollMessagesToBottom();
}

function hideTyping() {
    if (typingItem) {
        typingItem.remove();
        typingItem = null;
    }
}

// ---- Respuestas inventadas (solo para probar el diseño) ----
const FAKE_REPLIES = [
    '¡Gracias por tu mensaje! Te contesto enseguida.',
    'Claro, cada pieza está hecha a mano, así que puede haber pequeñas diferencias.',
    'Sí, puedo enviarlo a toda España.',
    '¿Quieres que te mande más fotos?',
    'Perfecto, lo reservo para ti.'
];
let fakeReplyIndex = 0;

function simulateReply(chatId) {
    replyTimers.forEach(clearTimeout);
    replyTimers = [
        setTimeout(() => { if (chatId === activeChatId) showTyping(); }, 600),
        setTimeout(() => {
            addMessage(chatId, 'them', FAKE_REPLIES[fakeReplyIndex++ % FAKE_REPLIES.length]);
        }, 2200)
    ];
}

// ---- Enviar ----
function sendMessage() {
    const text = chat_text.value.trim();
    if (!text) return;

    addMessage(activeChatId, 'me', text);
    // Aquí irá también el guardado en Firebase

    chat_text.value = '';
    resizeTextarea();
    send_button.disabled = true;
    chat_text.focus();

    if (SIMULATE_REPLIES) simulateReply(activeChatId);
}

function resizeTextarea() {
    chat_text.style.height = 'auto';
    chat_text.style.height = Math.min(chat_text.scrollHeight, 150) + 'px';
}

chat_text.addEventListener('input', () => {
    resizeTextarea();
    send_button.disabled = chat_text.value.trim() === '';
});

// Enter envía, Shift+Enter hace un salto de línea
chat_text.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) {
        e.preventDefault();
        sendMessage();
    }
});

chat_form.addEventListener('submit', (e) => {
    e.preventDefault();
    sendMessage();
});

// Botón "Iniciar chat" de un producto: abre el chat de ese producto (lo crea si no existe)
function openChatForProduct(prod, index) {
    const id = 'p' + index;
    if (!getChat(id)) {
        chats.push({ id, title: prod.name, img: prod.img, unread: 0, created: Date.now(), messages: [] });
    }
    selectChat(id);
}

renderChatList();
renderConversation();
