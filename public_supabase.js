console.log("Executing Mohan Ceramics Public...");

const btnExplore = document.getElementById("explore_button");
const elementToScroll = document.getElementById("product_grid");
const btnHome = document.getElementById("home_button");
const btnChat = document.getElementById("chat_button");
const main_page = document.getElementById("main_page");
const chat_page = document.getElementById("chat_page");

let currentUser = null;
let currentProfile = null;
let adminUserId = null;

function createAuthModal() {
    const modal = document.createElement("div");
    modal.id = "auth_modal";
    modal.style.cssText = `
        display: none; position: fixed; inset: 0; z-index: 1000;
        background: rgba(12, 36, 61, 0.75); backdrop-filter: blur(4px);
        justify-content: center; align-items: center;
        font-family: system-ui, -apple-system, sans-serif;
    `;

    modal.innerHTML = `
        <div style="background: white; padding: 28px; border-radius: 18px; width: 90%; max-width: 380px; position: relative; box-shadow: 0 10px 30px rgba(0,0,0,0.25);">
            <button id="close_auth_modal" type="button" style="position: absolute; top: 14px; right: 16px; background: none; border: none; font-size: 22px; cursor: pointer; color: #6B7A87;">×</button>
            <h3 id="auth_modal_title" style="color: #0C243D; margin-bottom: 6px; font-size: 1.35rem;">Iniciar Sesión</h3>
            <p id="auth_modal_sub" style="color: #6B7A87; font-size: 0.9rem; margin-bottom: 18px;">Accede para chatear con Mohan Ceramics.</p>
            <form id="auth_form" style="display: flex; flex-direction: column; gap: 12px;">
                <div id="auth_name_group" style="display: none; flex-direction: column; gap: 4px;">
                    <label style="font-size: 0.85rem; font-weight: 600; color: #0C243D;">Nombre de usuario</label>
                    <input id="auth_username" type="text" placeholder="Ej. Ana García" style="padding: 10px 12px; border: 1px solid #C5D3DB; border-radius: 10px; font-size: 16px;">
                </div>
                <div style="display: flex; flex-direction: column; gap: 4px;">
                    <label style="font-size: 0.85rem; font-weight: 600; color: #0C243D;">Correo electrónico</label>
                    <input id="auth_email" type="email" required placeholder="tu@email.com" style="padding: 10px 12px; border: 1px solid #C5D3DB; border-radius: 10px; font-size: 16px;">
                </div>
                <div style="display: flex; flex-direction: column; gap: 4px;">
                    <label style="font-size: 0.85rem; font-weight: 600; color: #0C243D;">Contraseña</label>
                    <input id="auth_password" type="password" required minlength="6" placeholder="Mínimo 6 caracteres" style="padding: 10px 12px; border: 1px solid #C5D3DB; border-radius: 10px; font-size: 16px;">
                </div>
                <p id="auth_error" style="color: #D8453B; font-size: 0.85rem; min-height: 1.1em;"></p>
                <button id="auth_submit_btn" type="submit" style="padding: 12px; background: #0B76C2; color: white; border: none; border-radius: 12px; font-weight: bold; font-size: 1rem; cursor: pointer;">Entrar</button>
            </form>
            <p style="margin-top: 16px; text-align: center; font-size: 0.88rem; color: #5B7284;">
                <span id="auth_switch_text">¿No tienes cuenta?</span>
                <button id="auth_switch_btn" type="button" style="background: none; border: none; color: #0B76C2; font-weight: bold; cursor: pointer; text-decoration: underline;">Regístrate</button>
            </p>
        </div>
    `;
    document.body.appendChild(modal);

    let isRegisterMode = false;
    const closeBtn = document.getElementById("close_auth_modal");
    const switchBtn = document.getElementById("auth_switch_btn");
    const authForm = document.getElementById("auth_form");
    const errorEl = document.getElementById("auth_error");
    const submitBtn = document.getElementById("auth_submit_btn");

    closeBtn.addEventListener("click", () => modal.style.display = "none");
    modal.addEventListener("click", (e) => { if (e.target === modal) modal.style.display = "none"; });

    switchBtn.addEventListener("click", () => {
        isRegisterMode = !isRegisterMode;
        errorEl.textContent = "";
        document.getElementById("auth_modal_title").textContent = isRegisterMode ? "Crear Cuenta" : "Iniciar Sesión";
        document.getElementById("auth_name_group").style.display = isRegisterMode ? "flex" : "none";
        document.getElementById("auth_username").required = isRegisterMode;
        submitBtn.textContent = isRegisterMode ? "Registrarse" : "Entrar";
        document.getElementById("auth_switch_text").textContent = isRegisterMode ? "¿Ya tienes cuenta?" : "¿No tienes cuenta?";
        switchBtn.textContent = isRegisterMode ? "Inicia sesión" : "Regístrate";
    });

    authForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        errorEl.textContent = "";
        submitBtn.disabled = true;

        const email = document.getElementById("auth_email").value.trim();
        const password = document.getElementById("auth_password").value;
        const userName = document.getElementById("auth_username").value.trim();

        try {
            if (isRegisterMode) {
                const { data, error } = await db.auth.signUp({ email, password });
                if (error) throw error;
                if (data.user) {
                    const { error: profErr } = await db.from("users").insert({
                        id: data.user.id,
                        user_name: userName,
                        email: email
                    });
                    if (profErr) throw profErr;
                    await onUserLoggedIn(data.user);
                }
            } else {
                const { data, error } = await db.auth.signInWithPassword({ email, password });
                if (error) throw error;
                await onUserLoggedIn(data.user);
            }
            modal.style.display = "none";
        } catch (err) {
            errorEl.textContent = err.message || "Error de autenticación.";
        } finally {
            submitBtn.disabled = false;
        }
    });

    return modal;
}

const authModal = createAuthModal();
function openAuthModal() { authModal.style.display = "flex"; }

const userNameLabel = document.getElementById("user_name");
document.querySelectorAll(".user_menu_button").forEach(btn => {
    const txt = btn.textContent.trim().toLowerCase();
    if (txt.includes("iniciar")) {
        btn.addEventListener("click", openAuthModal);
    } else if (txt.includes("cerrar")) {
        btn.addEventListener("click", async () => {
            await db.auth.signOut();
            currentUser = null;
            currentProfile = null;
            chats = [];
            if (userNameLabel) userNameLabel.textContent = "Usuario";
            changePage(0);
        });
    }
});

async function onUserLoggedIn(user) {
    currentUser = user;
    const { data: perfil } = await db.from("users").select("*").eq("id", user.id).maybeSingle();
    currentProfile = perfil;
    if (userNameLabel) userNameLabel.textContent = perfil?.user_name || user.email.split("@")[0];
    await loadUserChats();
    subscribeToRealtimeMessages();
}

async function initSession() {
    const { data: adminData } = await db.from("users").select("id").eq("admin", true).limit(1).maybeSingle();
    if (adminData) adminUserId = adminData.id;
    const { data: { session } } = await db.auth.getSession();
    if (session && session.user) await onUserLoggedIn(session.user);
}

let myProducts = [];

async function fetchProductsFromDB() {
    const container = document.getElementById("product_grid");
    container.innerHTML = '<p style="color: white; font-family: sans-serif;">Cargando piezas...</p>';

    const { data, error } = await db
        .from("products")
        .select(`id, title, description, seller_id, created_at, previews ( url, type )`)
        .order("created_at", { ascending: false });

    if (error) {
        container.innerHTML = '<p style="color: white; font-family: sans-serif;">No se pudieron cargar los productos.</p>';
        return;
    }

    myProducts = data.map(item => {
        const imgs = (item.previews || []).filter(p => p.type === "image").map(p => p.url);
        const fallback = "https://unsplash.com";
        return {
            id: item.id,
            name: item.title,
            desc: item.description || "",
            sellerId: item.seller_id,
            images: imgs.length > 0 ? imgs : [fallback],
            img: imgs[0] || fallback
        };
    });

    renderProducts(myProducts);
}

function renderProducts(products) {
    const container = document.getElementById('product_grid');
    container.innerHTML = '';

    if (products.length === 0) {
        container.innerHTML = '<p style="color: white; font-family: sans-serif;">Próximamente nuevas piezas disponibles.</p>';
        return;
    }

    products.forEach((prod) => {
        let currentImgIndex = 0;

        const card = document.createElement('div');
        card.className = 'card';
        card.id = 'card' + prod.id;
        
        card.innerHTML = `
            <div class="card-info">
                <h4>${prod.name}</h4>
            </div>
            <img class="card-img" src="${prod.images}" alt="${prod.name}">
            <div class="card-text-fade"></div>

            <div class="img-arrows" style="${prod.images.length <= 1 ? 'display:none;' : ''}">
                <div class="img-arrow-circle">
                    <svg width="256px" height="256px" viewBox="0 0 24 24" fill="white" xmlns="http://w3.org" id="img-arrow-L"><path d="M5.70711 9.71069C5.31658 10.1012 5.31658 10.7344 5.70711 11.1249L10.5993 16.0123C11.3805 16.7927 12.6463 16.7924 13.4271 16.0117L18.3174 11.1213C18.708 10.7308 18.708 10.0976 18.3174 9.70708C17.9269 9.31655 17.2937 9.31655 16.9032 9.70708L12.7176 13.8927C12.3271 14.2833 11.6939 14.2832 11.3034 13.8927L7.12132 9.71069C6.7308 9.32016 6.09763 9.32016 5.70711 9.71069Z" fill="white"></path></svg>
                </div>
                <div class="img-arrow-circle">
                    <svg width="256px" height="256px" viewBox="0 0 24 24" fill="white" xmlns="http://w3.org" id="img-arrow-R"><path d="M5.70711 9.71069C5.31658 10.1012 5.31658 10.7344 5.70711 11.1249L10.5993 16.0123C11.3805 16.7927 12.6463 16.7924 13.4271 16.0117L18.3174 11.1213C18.708 10.7308 18.708 10.0976 18.3174 9.70708C17.9269 9.31655 17.2937 9.31655 16.9032 9.70708L12.7176 13.8927C12.3271 14.2833 11.6939 14.2832 11.3034 13.8927L7.12132 9.71069C6.7308 9.32016 6.09763 9.32016 5.70711 9.71069Z" fill="white"></path></svg>
                </div>
            </div>

            <button class="card-button">
                <h4 class="card-button-text">Iniciar chat</h4>
                <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://w3.org" class="card-button-x"><path d="M19 5L5 19M5.00001 5L19 19" stroke="white" stroke-width="1.248" stroke-linecap="round" stroke-linejoin="round"></path></svg>
            </button>
        `;

        const cardImg = card.querySelector('.card-img');
        const arrowLeft = card.querySelector('#img-arrow-L').closest('.img-arrow-circle');
        const arrowRight = card.querySelector('#img-arrow-R').closest('.img-arrow-circle');
        const chatButton = card.querySelector('.card-button');

        arrowLeft.addEventListener("click", (e) => {
            e.stopPropagation();
            currentImgIndex = (currentImgIndex - 1 + prod.images.length) % prod.images.length;
            cardImg.src = prod.images[currentImgIndex];
        });

        arrowRight.addEventListener("click", (e) => {
            e.stopPropagation();
            currentImgIndex = (currentImgIndex + 1) % prod.images.length;
            cardImg.src = prod.images[currentImgIndex];
        });

        chatButton.addEventListener("click", async () => {
            if (!currentUser) {
                openAuthModal();
                return;
            }
            await openChatForProduct(prod);
            changePage(1);
        });

        container.appendChild(card);
    });
}

//---------------------------------------------------------------------------------//
chat_page.style.display = "none";

function changePage(pageToChangeTo) {
    if (pageToChangeTo == 0) {
        main_page.style.display = "block";
        chat_page.style.display = "none";
    } else if (pageToChangeTo == 1) {
        if (!currentUser) {
            openAuthModal();
            return;
        }
        main_page.style.display = "none";
        chat_page.style.display = "block";
        scrollMessagesToBottom(false);
    } else if (pageToChangeTo == 2) {
        openAuthModal();
    }
}

btnHome.addEventListener("click", () => changePage(0));
btnChat.addEventListener("click", () => changePage(1));

btnExplore.addEventListener("click", () => {
    if (elementToScroll) {
        elementToScroll.scrollIntoView({ behavior: "smooth", block: "start" });
    }
});

//---------------------------------------------------------------------------------//
//----------------------------- CHAT REAL CON SUPABASE ----------------------------//
const chat_list = document.getElementById('chat_list');
const message_list = document.getElementById('message_list');
const conversation_avatar = document.getElementById('conversation_avatar');
const conversation_title = document.getElementById('conversation_title');
const chat_form = document.getElementById('chat-bar');
const chat_text = document.getElementById('chat-bar-text');
const send_button = document.getElementById('send_button');

let chats = [];
let activeChatId = null;
let activeProductId = null;
let realtimeChannel = null;

function getChat(id) { return chats.find(c => c.id === id); }
function chatUpdated(chat) { return chat.messages.length ? chat.messages[chat.messages.length - 1].ts : chat.created; }
function formatClock(ts) { return new Date(ts).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }); }

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

async function loadUserChats() {
    if (!currentUser) return;

    const { data: userChats, error } = await db
        .from('chats')
        .select(`id, created_at, user1_id, user2_id, messages ( id, sender_id, product_id, text, send_date, viewed )`)
        .or(`user1_id.eq.${currentUser.id},user2_id.eq.${currentUser.id}`)
        .order('created_at', { ascending: false });

    if (error) return;

    const fallbackImg = "https://unsplash.com";

    chats = (userChats || []).map(c => {
        const sortedMsgs = (c.messages || []).sort((a, b) => new Date(a.send_date) - new Date(b.send_date));
        const lastWithProd = [...sortedMsgs].reverse().find(m => m.product_id);
        const linkedProd = lastWithProd ? myProducts.find(p => p.id === lastWithProd.product_id) : null;

        return {
            id: c.id,
            title: linkedProd ? linkedProd.name : 'Mohan Ceramics',
            img: linkedProd ? linkedProd.img : (myProducts?.img || fallbackImg),
            productId: linkedProd ? linkedProd.id : null,
            unread: sortedMsgs.filter(m => m.sender_id !== currentUser.id && !m.viewed).length,
            created: new Date(c.created_at).getTime(),
            messages: sortedMsgs.map(m => ({
                id: m.id,
                from: m.sender_id === currentUser.id ? 'me' : 'them',
                text: m.text,
                ts: new Date(m.send_date).getTime()
            }))
        };
    });

    if (chats.length > 0 && !activeChatId) activeChatId = chats.id;
    renderChatList();
    renderConversation();
}

function subscribeToRealtimeMessages() {
    if (realtimeChannel) db.removeChannel(realtimeChannel);

    realtimeChannel = db
        .channel('public-user-messages')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, async (payload) => {
            const newMsg = payload.new;
            let chat = getChat(newMsg.chat_id);
            if (!chat) {
                await loadUserChats();
                return;
            }
            if (chat.messages.some(m => m.id === newMsg.id)) return;
            const from = newMsg.sender_id === currentUser.id ? 'me' : 'them';
            addMessageToUI(newMsg.chat_id, from, newMsg.text, new Date(newMsg.send_date).getTime(), newMsg.id);
        })
        .subscribe();
}

function renderChatList() {
    chat_list.innerHTML = '';

    if (chats.length === 0) {
        chat_list.innerHTML = '<li style="padding: 20px; text-align: center; color: #6B7A87; font-size: 0.9rem;">Aún no tienes conversaciones. Pulsa «Iniciar chat» en cualquier pieza.</li>';
        return;
    }

    [...chats].sort((a, b) => chatUpdated(b) - chatUpdated(a)).forEach(chat => {
        const item = document.createElement('li');
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'chat_item';
        button.setAttribute('aria-current', chat.id === activeChatId ? 'true' : 'false');
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
            time.textContent = formatChatTime(last.ts);
            meta.appendChild(time);
        }

        if (chat.unread > 0) {
            const badge = document.createElement('span');
            badge.className = 'chat_badge';
            badge.textContent = chat.unread;
            meta.appendChild(badge);
        }

        button.appendChild(avatar);
        button.appendChild(text);
        button.appendChild(meta);
        item.appendChild(button);
        chat_list.appendChild(item);
    });
}

function createMessageItem(msg, isNew) {
    const item = document.createElement('li');
    item.className = 'message ' + (msg.from === 'me' ? 'mine' : 'theirs') + (isNew ? ' new' : '');

    const bubble = document.createElement('p');
    bubble.className = 'bubble';
    bubble.textContent = msg.text;

    const time = document.createElement('time');
    time.className = 'message_time';
    time.textContent = formatClock(msg.ts);

    item.appendChild(bubble);
    item.appendChild(time);
    return item;
}

function renderConversation() {
    const chat = getChat(activeChatId);
    message_list.innerHTML = '';

    if (!chat) {
        conversation_title.textContent = 'Mohan Ceramics';
        const emptyHint = document.createElement('li');
        emptyHint.className = 'chat_hint';
        emptyHint.textContent = 'Selecciona un producto del catálogo para iniciar una conversación con el taller.';
        message_list.appendChild(emptyHint);
        return;
    }

    conversation_avatar.src = chat.img;
    conversation_title.textContent = chat.title;

    if (chat.messages.length === 0) {
        const hint = document.createElement('li');
        hint.className = 'chat_hint';
        hint.textContent = 'Escribe tu primer mensaje sobre «' + chat.title + '».';
        message_list.appendChild(hint);
    } else {
        chat.messages.forEach(msg => message_list.appendChild(createMessageItem(msg, false)));
    }
    scrollMessagesToBottom(false);
}

async function selectChat(id) {
    const chat = getChat(id);
    if (!chat) return;

    activeChatId = id;
    activeProductId = chat.productId || null;
    chat.unread = 0;
    renderChatList();
    renderConversation();

    if (currentUser) {
        await db.from('messages')
            .update({ viewed: true })
            .eq('chat_id', id)
            .neq('sender_id', currentUser.id)
            .eq('viewed', false);
    }
}

function addMessageToUI(chatId, from, text, ts = Date.now(), msgId = null) {
    const chat = getChat(chatId);
    if (!chat) return;

    const msg = { id: msgId, from, text, ts };
    chat.messages.push(msg);

    if (chatId === activeChatId) {
        const hint = message_list.querySelector('.chat_hint');
        if (hint) hint.remove();
        message_list.appendChild(createMessageItem(msg, true));
        scrollMessagesToBottom();
    } else if (from === 'them') {
        chat.unread = (chat.unread || 0) + 1;
    }
    renderChatList();
}

async function sendMessage() {
    const text = chat_text.value.trim();
    if (!text || !currentUser || !activeChatId) return;

    chat_text.value = '';
    resizeTextarea();
    send_button.disabled = true;
    chat_text.focus();

    const { data: inserted, error } = await db
        .from('messages')
        .insert({
            chat_id: activeChatId,
            product_id: activeProductId,
            sender_id: currentUser.id,
            text: text
        })
        .select()
        .single();

    if (error) {
        alert('No se pudo enviar el mensaje.');
        return;
    }

    if (inserted) {
        addMessageToUI(activeChatId, 'me', inserted.text, new Date(inserted.send_date).getTime(), inserted.id);
    }
}

function resizeTextarea() {
    chat_text.style.height = 'auto';
    chat_text.style.height = Math.min(chat_text.scrollHeight, 150) + 'px';
}

chat_text.addEventListener('input', () => {
    resizeTextarea();
    send_button.disabled = chat_text.value.trim() === '';
});

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

async function openChatForProduct(prod) {
    if (!currentUser) {
        openAuthModal();
        return;
    }

    const targetAdminId = prod.sellerId || adminUserId;
    if (!targetAdminId) {
        alert('No hay ningún administrador disponible en este momento.');
        return;
    }

    let { data: existingChat } = await db
        .from('chats')
        .select('id')
        .or(`and(user1_id.eq.${currentUser.id},user2_id.eq.${targetAdminId}),and(user1_id.eq.${targetAdminId},user2_id.eq.${currentUser.id})`)
        .maybeSingle();

    let chatId = existingChat?.id;

    if (!chatId) {
        const { data: newChat, error } = await db
            .from('chats')
            .insert({ user1_id: currentUser.id, user2_id: targetAdminId })
            .select('id')
            .single();

        if (error) {
            alert('Error al iniciar la conversación.');
            return;
        }
        chatId = newChat.id;
    }

    await loadUserChats();
    let localChat = getChat(chatId);
    if (localChat) {
        localChat.title = prod.name;
        localChat.img = prod.img;
        localChat.productId = prod.id;
    }
    activeProductId = prod.id;
    await selectChat(chatId);
}

(async function initPublicApp() {
    await fetchProductsFromDB();
    await initSession();
    renderChatList();
    renderConversation();
})();

