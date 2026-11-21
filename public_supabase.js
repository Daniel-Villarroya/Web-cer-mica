console.log("Executing Mohan Ceramics Public...");

/* ============================================================================
   Requiere que supabase.js defina el cliente:  const db = supabase.createClient(URL, ANON_KEY)
   ============================================================================ */
if (typeof db === "undefined") {
    console.error("Falta el cliente `db`. Comprueba que supabase.js crea el cliente de Supabase.");
}

const btnExplore = document.getElementById("explore_button");
const elementToScroll = document.getElementById("product_grid");
const btnHome = document.getElementById("home_button");
const btnChat = document.getElementById("chat_button");
const main_page = document.getElementById("main_page");
const chat_page = document.getElementById("chat_page");

let currentUser = null;
let currentProfile = null;
let adminUserId = null;
let pendingProduct = null; // producto que se quería chatear antes de iniciar sesión

const PLACEHOLDER_IMG = "data:image/svg+xml;utf8," + encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="500" viewBox="0 0 400 500">' +
    '<rect width="400" height="500" fill="#d9cab7"/>' +
    '<path d="M160 120h80l-10 40c40 30 55 80 40 140-10 40-30 70-70 70s-60-30-70-70c-15-60 0-110 40-140z" fill="#b89f84"/>' +
    '</svg>'
);

function escapeHtml(str) {
    return String(str ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

/* ============================================================================
   AUTENTICACIÓN
   ============================================================================ */
function createAuthModal() {
    const modal = document.createElement("div");
    modal.id = "auth_modal";
    modal.style.cssText = `
        display: none; position: fixed; inset: 0; z-index: 1000;
        background: rgba(12, 36, 61, 0.75); backdrop-filter: blur(4px);
        justify-content: center; align-items: center;
        font-family: system-ui, -apple-system, sans-serif;
    `;

    const inputStyle = "padding: 10px 12px; border: 1px solid #C5D3DB; border-radius: 10px; font-size: 16px;";
    const labelStyle = "font-size: 0.85rem; font-weight: 600; color: #0C243D;";

    modal.innerHTML = `
        <div style="background: white; padding: 28px; border-radius: 18px; width: 90%; max-width: 380px; position: relative; box-shadow: 0 10px 30px rgba(0,0,0,0.25);">
            <button id="close_auth_modal" type="button" aria-label="Cerrar" style="position: absolute; top: 14px; right: 16px; background: none; border: none; font-size: 22px; cursor: pointer; color: #6B7A87;">×</button>
            <h3 id="auth_modal_title" style="color: #0C243D; margin-bottom: 6px; font-size: 1.35rem;">Iniciar Sesión</h3>
            <p id="auth_modal_sub" style="color: #6B7A87; font-size: 0.9rem; margin-bottom: 18px;">Accede para chatear con Mohan Ceramics.</p>
            <form id="auth_form" style="display: flex; flex-direction: column; gap: 12px;">
                <div id="auth_name_group" style="display: none; flex-direction: column; gap: 4px;">
                    <label for="auth_username" style="${labelStyle}">Nombre de usuario</label>
                    <input id="auth_username" type="text" placeholder="Ej. Ana García" style="${inputStyle}">
                </div>
                <div style="display: flex; flex-direction: column; gap: 4px;">
                    <label for="auth_email" style="${labelStyle}">Correo electrónico</label>
                    <input id="auth_email" type="email" required autocomplete="email" placeholder="tu@email.com" style="${inputStyle}">
                </div>
                <div style="display: flex; flex-direction: column; gap: 4px;">
                    <label for="auth_password" style="${labelStyle}">Contraseña</label>
                    <input id="auth_password" type="password" required minlength="6" autocomplete="current-password" placeholder="Mínimo 6 caracteres" style="${inputStyle}">
                </div>
                <p id="auth_error" role="alert" style="color: #D8453B; font-size: 0.85rem; min-height: 1.1em;"></p>
                <p id="auth_info" style="color: #1E7B4B; font-size: 0.85rem;"></p>
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
    const $ = (id) => modal.querySelector("#" + id);
    const errorEl = $("auth_error");
    const infoEl = $("auth_info");
    const submitBtn = $("auth_submit_btn");

    function setMode(register) {
        isRegisterMode = register;
        errorEl.textContent = "";
        $("auth_modal_title").textContent = register ? "Crear Cuenta" : "Iniciar Sesión";
        $("auth_name_group").style.display = register ? "flex" : "none";
        $("auth_username").required = register;
        $("auth_password").autocomplete = register ? "new-password" : "current-password";
        submitBtn.textContent = register ? "Registrarse" : "Entrar";
        $("auth_switch_text").textContent = register ? "¿Ya tienes cuenta?" : "¿No tienes cuenta?";
        $("auth_switch_btn").textContent = register ? "Inicia sesión" : "Regístrate";
    }

    const close = () => { modal.style.display = "none"; };
    $("close_auth_modal").addEventListener("click", close);
    modal.addEventListener("click", (e) => { if (e.target === modal) close(); });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") close(); });
    $("auth_switch_btn").addEventListener("click", () => { infoEl.textContent = ""; setMode(!isRegisterMode); });

    $("auth_form").addEventListener("submit", async (e) => {
        e.preventDefault();
        errorEl.textContent = "";
        infoEl.textContent = "";
        submitBtn.disabled = true;

        const email = $("auth_email").value.trim();
        const password = $("auth_password").value;
        const userName = $("auth_username").value.trim();

        try {
            if (isRegisterMode) {
                const { data, error } = await db.auth.signUp({
                    email,
                    password,
                    options: { data: { user_name: userName } }
                });
                if (error) throw error;

                if (data.session && data.user) {
                    // Registro con sesión inmediata (confirmación de email desactivada)
                    await onUserLoggedIn(data.user, userName);
                    close();
                } else {
                    // Hay que confirmar el correo antes de poder entrar
                    setMode(false);
                    infoEl.textContent = "Cuenta creada. Revisa tu correo para confirmarla y luego inicia sesión.";
                }
            } else {
                const { data, error } = await db.auth.signInWithPassword({ email, password });
                if (error) throw error;
                await onUserLoggedIn(data.user);
                close();
            }
        } catch (err) {
            errorEl.textContent = translateAuthError(err);
        } finally {
            submitBtn.disabled = false;
        }
    });

    modal.setMode = setMode;
    return modal;
}

function translateAuthError(err) {
    const msg = (err && err.message) || "";
    if (/invalid login credentials/i.test(msg)) return "Correo o contraseña incorrectos.";
    if (/already registered|already been registered/i.test(msg)) return "Ese correo ya está registrado.";
    if (/email not confirmed/i.test(msg)) return "Debes confirmar tu correo antes de entrar.";
    if (/password should be at least/i.test(msg)) return "La contraseña debe tener al menos 6 caracteres.";
    if (/rate limit/i.test(msg)) return "Demasiados intentos. Espera un momento.";
    return msg || "Error de autenticación.";
}

const authModal = createAuthModal();
function openAuthModal() {
    authModal.setMode(false);
    authModal.style.display = "flex";
}

const userNameLabel = document.getElementById("user_name");
const loginBtn = document.getElementById("login_button");
const logoutBtn = document.getElementById("logout_button");

function updateAuthUI() {
    const logged = !!currentUser;
    loginBtn.hidden = logged;
    logoutBtn.hidden = !logged;
    if (!logged && userNameLabel) userNameLabel.textContent = "Usuario";
}

loginBtn.addEventListener("click", openAuthModal);
logoutBtn.addEventListener("click", async () => {
    await db.auth.signOut();
    handleSignedOut();
});

function handleSignedOut() {
    currentUser = null;
    currentProfile = null;
    chats = [];
    activeChatId = null;
    activeProductId = null;
    if (realtimeChannel) { db.removeChannel(realtimeChannel); realtimeChannel = null; }
    updateAuthUI();
    renderChatList();
    renderConversation();
    changePage(0);
}

async function onUserLoggedIn(user, preferredName) {
    currentUser = user;

    let { data: perfil } = await db.from("users").select("*").eq("id", user.id).maybeSingle();

    // Si el perfil aún no existe (primer login tras confirmar el correo), se crea ahora
    if (!perfil) {
        const name = preferredName || user.user_metadata?.user_name || user.email.split("@")[0];
        const { data: created } = await db
            .from("users")
            .insert({ id: user.id, user_name: name, email: user.email })
            .select()
            .maybeSingle();
        perfil = created;
    }

    currentProfile = perfil;
    if (userNameLabel) userNameLabel.textContent = perfil?.user_name || user.email.split("@")[0];
    updateAuthUI();

    await loadUserChats();
    subscribeToRealtimeMessages();

    if (pendingProduct) {
        const prod = pendingProduct;
        pendingProduct = null;
        await openChatForProduct(prod);
        changePage(1);
    }
}

async function initSession() {
    const { data: adminData } = await db.from("users").select("id").eq("admin", true).limit(1).maybeSingle();
    if (adminData) adminUserId = adminData.id;

    const { data: { session } } = await db.auth.getSession();
    if (session && session.user) await onUserLoggedIn(session.user);
    else updateAuthUI();

    // Sesión caducada o cerrada desde otra pestaña
    db.auth.onAuthStateChange((event) => {
        if (event === "SIGNED_OUT" && currentUser) handleSignedOut();
    });
}

/* ============================================================================
   PRODUCTOS + VISOR 3D
   ============================================================================ */
const MODEL_EXTENSIONS = ["glb", "gltf", "obj", "stl"];

function getExtension(url) {
    try { return new URL(url, location.href).pathname.split(".").pop().toLowerCase(); }
    catch (e) { return ""; }
}

// Convierte una fila de `previews` en { kind: 'image' | 'model', url, ext }
function classifyPreview(p) {
    const type = (p.type || "").toLowerCase();
    const ext = getExtension(p.url);
    if (MODEL_EXTENSIONS.includes(ext)) return { kind: "model", url: p.url, ext };
    if (/3d|model|mesh|glb|gltf|obj|stl/.test(type)) return { kind: "model", url: p.url, ext: "glb" };
    return { kind: "image", url: p.url };
}

class ModelViewer {
    constructor(container, url, ext) {
        this.container = container;
        this.disposed = false;
        this.raf = null;

        this.loadingEl = document.createElement("div");
        this.loadingEl.className = "model-loading";
        this.loadingEl.textContent = "Cargando 3D…";
        container.appendChild(this.loadingEl);

        if (typeof THREE === "undefined") {
            this.loadingEl.textContent = "3D no disponible";
            return;
        }

        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
        this.renderer.outputEncoding = THREE.sRGBEncoding;
        container.appendChild(this.renderer.domElement);

        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(35, 1, 0.01, 100);
        this.camera.position.set(0, 0.35, 4);
        this.camera.lookAt(0, 0, 0);

        this.scene.add(new THREE.HemisphereLight(0xffffff, 0x8a7a68, 1.1));
        const key = new THREE.DirectionalLight(0xffffff, 1.4);
        key.position.set(3, 4, 5);
        this.scene.add(key);
        const rim = new THREE.DirectionalLight(0xffffff, 0.6);
        rim.position.set(-4, 2, -3);
        this.scene.add(rim);

        this.pivot = new THREE.Group();
        this.scene.add(this.pivot);

        this.resizeObserver = new ResizeObserver(() => this.resize());
        this.resizeObserver.observe(container);
        this.resize();

        this.load(url, ext);

        const tick = () => {
            if (this.disposed) return;
            this.pivot.rotation.y += 0.012;
            this.renderer.render(this.scene, this.camera);
            this.raf = requestAnimationFrame(tick);
        };
        tick();
    }

    resize() {
        if (this.disposed || !this.renderer) return;
        const w = this.container.clientWidth || 220;
        const h = this.container.clientHeight || 290;
        this.renderer.setSize(w, h, false);
        this.camera.aspect = w / h;
        this.camera.updateProjectionMatrix();
    }

    defaultMaterial() {
        return new THREE.MeshStandardMaterial({ color: 0xe6d8c3, roughness: 0.55, metalness: 0.05 });
    }

    load(url, ext) {
        const onError = (err) => {
            console.error("No se pudo cargar el modelo 3D:", url, err);
            if (!this.disposed) this.loadingEl.textContent = "No se pudo cargar el 3D";
        };

        try {
            if (ext === "obj") {
                new THREE.OBJLoader().load(url, (obj) => {
                    obj.traverse(o => { if (o.isMesh) o.material = this.defaultMaterial(); });
                    this.addModel(obj);
                }, undefined, onError);
            } else if (ext === "stl") {
                new THREE.STLLoader().load(url, (geometry) => {
                    geometry.computeVertexNormals();
                    this.addModel(new THREE.Mesh(geometry, this.defaultMaterial()));
                }, undefined, onError);
            } else {
                new THREE.GLTFLoader().load(url, (gltf) => this.addModel(gltf.scene), undefined, onError);
            }
        } catch (err) {
            onError(err);
        }
    }

    // Centra el modelo y lo escala para que quepa siempre en el recuadro
    addModel(model) {
        if (this.disposed) return;
        const box = new THREE.Box3().setFromObject(model);
        const size = box.getSize(new THREE.Vector3());
        const center = box.getCenter(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z) || 1;

        model.position.sub(center);
        const holder = new THREE.Group();
        holder.add(model);
        holder.scale.setScalar(1.7 / maxDim);
        this.pivot.add(holder);

        if (this.loadingEl) { this.loadingEl.remove(); this.loadingEl = null; }
    }

    dispose() {
        this.disposed = true;
        if (this.raf) cancelAnimationFrame(this.raf);
        if (this.resizeObserver) this.resizeObserver.disconnect();
        if (this.scene) {
            this.scene.traverse(o => {
                if (o.geometry) o.geometry.dispose();
                if (o.material) {
                    (Array.isArray(o.material) ? o.material : [o.material]).forEach(m => {
                        Object.values(m).forEach(v => { if (v && v.isTexture) v.dispose(); });
                        m.dispose();
                    });
                }
            });
        }
        if (this.renderer) {
            this.renderer.dispose();
            this.renderer.forceContextLoss();
            this.renderer.domElement.remove();
        }
        if (this.loadingEl) this.loadingEl.remove();
    }
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
        console.error(error);
        container.innerHTML = '<p style="color: white; font-family: sans-serif;">No se pudieron cargar los productos.</p>';
        return;
    }

    myProducts = (data || []).map(item => {
        const media = (item.previews || []).filter(p => p.url).map(classifyPreview);
        const firstImage = media.find(m => m.kind === "image");
        return {
            id: item.id,
            name: item.title,
            desc: item.description || "",
            sellerId: item.seller_id,
            media: media.length > 0 ? media : [{ kind: "image", url: PLACEHOLDER_IMG }],
            img: firstImage ? firstImage.url : PLACEHOLDER_IMG
        };
    });

    renderProducts(myProducts);
}

const ARROW_SVG = '<svg viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg"><path d="M5.70711 9.71069C5.31658 10.1012 5.31658 10.7344 5.70711 11.1249L10.5993 16.0123C11.3805 16.7927 12.6463 16.7924 13.4271 16.0117L18.3174 11.1213C18.708 10.7308 18.708 10.0976 18.3174 9.70708C17.9269 9.31655 17.2937 9.31655 16.9032 9.70708L12.7176 13.8927C12.3271 14.2833 11.6939 14.2832 11.3034 13.8927L7.12132 9.71069C6.7308 9.32016 6.09763 9.32016 5.70711 9.71069Z" fill="white"></path></svg>';

function renderProducts(products) {
    const container = document.getElementById("product_grid");
    container.innerHTML = "";

    if (products.length === 0) {
        container.innerHTML = '<p style="color: white; font-family: sans-serif;">Próximamente nuevas piezas disponibles.</p>';
        return;
    }

    products.forEach((prod) => {
        const card = document.createElement("div");
        card.className = "card";
        card.id = "card" + prod.id;

        card.innerHTML = `
            <div class="card-media"></div>
            <div class="card-info"><h4>${escapeHtml(prod.name)}</h4></div>
            <div class="card-text-fade"></div>
            <span class="badge-3d">3D</span>

            <div class="img-arrows" style="${prod.media.length <= 1 ? "display:none;" : ""}">
                <div class="img-arrow-circle arrow-prev">${ARROW_SVG}</div>
                <div class="img-arrow-circle arrow-next">${ARROW_SVG}</div>
            </div>

            <button class="card-button" type="button">
                <h4 class="card-button-text">Iniciar chat</h4>
                <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" class="card-button-x"><path d="M19 5L5 19M5.00001 5L19 19" stroke="white" stroke-width="1.248" stroke-linecap="round" stroke-linejoin="round"></path></svg>
            </button>
        `;

        const mediaBox = card.querySelector(".card-media");
        let index = 0;
        let viewer = null;
        let visible = false;

        // Muestra la imagen o el modelo 3D actual dentro del mismo recuadro
        function showMedia() {
            if (viewer) { viewer.dispose(); viewer = null; }
            mediaBox.innerHTML = "";

            const item = prod.media[index];
            card.classList.toggle("is-3d", item.kind === "model");

            if (item.kind === "image") {
                const img = document.createElement("img");
                img.className = "card-img";
                img.alt = prod.name;
                img.src = item.url;
                img.onerror = () => { img.onerror = null; img.src = PLACEHOLDER_IMG; };
                mediaBox.appendChild(img);
            } else if (visible) {
                viewer = new ModelViewer(mediaBox, item.url, item.ext);
            }
        }

        // Solo se crea el visor 3D mientras la tarjeta está en pantalla (límite de contextos WebGL)
        const observer = new IntersectionObserver((entries) => {
            const nowVisible = entries[0].isIntersecting;
            if (nowVisible === visible) return;
            visible = nowVisible;
            if (prod.media[index].kind === "model") showMedia();
        }, { rootMargin: "150px" });
        observer.observe(card);

        card.querySelector(".arrow-prev").addEventListener("click", (e) => {
            e.stopPropagation();
            index = (index - 1 + prod.media.length) % prod.media.length;
            showMedia();
        });

        card.querySelector(".arrow-next").addEventListener("click", (e) => {
            e.stopPropagation();
            index = (index + 1) % prod.media.length;
            showMedia();
        });

        card.querySelector(".card-button").addEventListener("click", async () => {
            if (!currentUser) {
                pendingProduct = prod;
                openAuthModal();
                return;
            }
            await openChatForProduct(prod);
            changePage(1);
        });

        showMedia();
        container.appendChild(card);
    });
}

/* ============================================================================
   NAVEGACIÓN
   ============================================================================ */
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
    if (elementToScroll) elementToScroll.scrollIntoView({ behavior: "smooth", block: "start" });
});

/* ============================================================================
   CHAT REAL CON SUPABASE
   ============================================================================ */
const chat_list = document.getElementById("chat_list");
const message_list = document.getElementById("message_list");
const conversation_avatar = document.getElementById("conversation_avatar");
const conversation_title = document.getElementById("conversation_title");
const chat_form = document.getElementById("chat-bar");
const chat_text = document.getElementById("chat-bar-text");
const send_button = document.getElementById("send_button");

let chats = [];
let activeChatId = null;
let activeProductId = null;
let realtimeChannel = null;
const chatProductHint = {}; // chatId -> productId (para chats nuevos aún sin mensajes)

function getChat(id) { return chats.find(c => c.id === id); }
function chatUpdated(chat) { return chat.messages.length ? chat.messages[chat.messages.length - 1].ts : chat.created; }
function formatClock(ts) { return new Date(ts).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" }); }

function formatChatTime(ts) {
    const now = new Date();
    const startToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    if (ts >= startToday) return formatClock(ts);
    if (ts >= startToday - 86400000) return "ayer";
    return new Date(ts).toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit" });
}

function scrollMessagesToBottom(smooth = true) {
    message_list.scrollTo({ top: message_list.scrollHeight, behavior: smooth ? "smooth" : "auto" });
}

async function loadUserChats() {
    if (!currentUser) return;

    const { data: userChats, error } = await db
        .from("chats")
        .select(`id, created_at, user1_id, user2_id, messages ( id, sender_id, product_id, text, send_date, viewed )`)
        .or(`user1_id.eq.${currentUser.id},user2_id.eq.${currentUser.id}`)
        .order("created_at", { ascending: false });

    if (error) { console.error(error); return; }

    // Nombres de la otra persona (por si el chat no está ligado a un producto)
    const otherIds = [...new Set((userChats || []).map(c => c.user1_id === currentUser.id ? c.user2_id : c.user1_id))];
    const names = {};
    if (otherIds.length) {
        const { data: others } = await db.from("users").select("id, user_name").in("id", otherIds);
        (others || []).forEach(u => { names[u.id] = u.user_name; });
    }

    chats = (userChats || []).map(c => {
        const sortedMsgs = (c.messages || []).sort((a, b) => new Date(a.send_date) - new Date(b.send_date));
        const lastWithProd = [...sortedMsgs].reverse().find(m => m.product_id);
        const productId = lastWithProd ? lastWithProd.product_id : (chatProductHint[c.id] || null);
        const linkedProd = productId ? myProducts.find(p => p.id === productId) : null;
        const otherId = c.user1_id === currentUser.id ? c.user2_id : c.user1_id;

        return {
            id: c.id,
            title: linkedProd ? linkedProd.name : (names[otherId] || "Mohan Ceramics"),
            img: linkedProd ? linkedProd.img : PLACEHOLDER_IMG,
            productId: linkedProd ? linkedProd.id : null,
            unread: sortedMsgs.filter(m => m.sender_id !== currentUser.id && !m.viewed).length,
            created: new Date(c.created_at).getTime(),
            messages: sortedMsgs.map(m => ({
                id: m.id,
                from: m.sender_id === currentUser.id ? "me" : "them",
                text: m.text,
                ts: new Date(m.send_date).getTime()
            }))
        };
    });

    if (!getChat(activeChatId)) activeChatId = chats.length ? chats[0].id : null;
    const active = getChat(activeChatId);
    activeProductId = active ? active.productId : null;

    renderChatList();
    renderConversation();
}

function subscribeToRealtimeMessages() {
    if (realtimeChannel) db.removeChannel(realtimeChannel);

    realtimeChannel = db
        .channel("public-user-messages")
        .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages" }, async (payload) => {
            const newMsg = payload.new;
            const chat = getChat(newMsg.chat_id);
            if (!chat) {
                await loadUserChats();
                return;
            }
            if (chat.messages.some(m => m.id === newMsg.id)) return;
            const from = newMsg.sender_id === currentUser.id ? "me" : "them";
            addMessageToUI(newMsg.chat_id, from, newMsg.text, new Date(newMsg.send_date).getTime(), newMsg.id);

            // Si ese chat está abierto, el mensaje ya se ha visto
            if (from === "them" && newMsg.chat_id === activeChatId && chat_page.style.display !== "none") {
                chat.unread = 0;
                renderChatList();
                await db.from("messages").update({ viewed: true }).eq("id", newMsg.id);
            }
        })
        .subscribe();
}

function renderChatList() {
    chat_list.innerHTML = "";

    if (chats.length === 0) {
        chat_list.innerHTML = '<li style="padding: 20px; text-align: center; color: #6B7A87; font-size: 0.9rem;">Aún no tienes conversaciones. Pulsa «Iniciar chat» en cualquier pieza.</li>';
        return;
    }

    [...chats].sort((a, b) => chatUpdated(b) - chatUpdated(a)).forEach(chat => {
        const item = document.createElement("li");
        const button = document.createElement("button");
        button.type = "button";
        button.className = "chat_item";
        button.setAttribute("aria-current", chat.id === activeChatId ? "true" : "false");
        button.setAttribute("aria-label", "Abrir chat de " + chat.title);
        button.addEventListener("click", () => selectChat(chat.id));

        const avatar = document.createElement("img");
        avatar.className = "chat_avatar";
        avatar.src = chat.img;
        avatar.alt = "";

        const text = document.createElement("span");
        text.className = "chat_item_text";

        const title = document.createElement("strong");
        title.className = "chat_item_title";
        title.textContent = chat.title;

        const preview = document.createElement("span");
        preview.className = "chat_preview";
        const last = chat.messages[chat.messages.length - 1];
        preview.textContent = last ? (last.from === "me" ? "Tú: " : "") + last.text : "Chat nuevo";

        text.appendChild(title);
        text.appendChild(preview);

        const meta = document.createElement("span");
        meta.className = "chat_item_meta";

        if (last) {
            const time = document.createElement("time");
            time.className = "chat_time";
            time.textContent = formatChatTime(last.ts);
            meta.appendChild(time);
        }

        if (chat.unread > 0) {
            const badge = document.createElement("span");
            badge.className = "chat_badge";
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
    const item = document.createElement("li");
    item.className = "message " + (msg.from === "me" ? "mine" : "theirs") + (isNew ? " new" : "");

    const bubble = document.createElement("p");
    bubble.className = "bubble";
    bubble.textContent = msg.text;

    const time = document.createElement("time");
    time.className = "message_time";
    time.textContent = formatClock(msg.ts);

    item.appendChild(bubble);
    item.appendChild(time);
    return item;
}

function renderConversation() {
    const chat = getChat(activeChatId);
    message_list.innerHTML = "";

    if (!chat) {
        conversation_title.textContent = "Mohan Ceramics";
        conversation_avatar.removeAttribute("src");
        const emptyHint = document.createElement("li");
        emptyHint.className = "chat_hint";
        emptyHint.textContent = "Selecciona un producto del catálogo para iniciar una conversación con el taller.";
        message_list.appendChild(emptyHint);
        return;
    }

    conversation_avatar.src = chat.img;
    conversation_title.textContent = chat.title;

    if (chat.messages.length === 0) {
        const hint = document.createElement("li");
        hint.className = "chat_hint";
        hint.textContent = "Escribe tu primer mensaje sobre «" + chat.title + "».";
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
        await db.from("messages")
            .update({ viewed: true })
            .eq("chat_id", id)
            .neq("sender_id", currentUser.id)
            .eq("viewed", false);
    }
}

function addMessageToUI(chatId, from, text, ts = Date.now(), msgId = null) {
    const chat = getChat(chatId);
    if (!chat) return;
    if (msgId && chat.messages.some(m => m.id === msgId)) return; // evita duplicados (insert + realtime)

    const msg = { id: msgId, from, text, ts };
    chat.messages.push(msg);

    if (chatId === activeChatId) {
        const hint = message_list.querySelector(".chat_hint");
        if (hint) hint.remove();
        message_list.appendChild(createMessageItem(msg, true));
        scrollMessagesToBottom();
    } else if (from === "them") {
        chat.unread = (chat.unread || 0) + 1;
    }
    renderChatList();
}

async function sendMessage() {
    const text = chat_text.value.trim();
    if (!text || !currentUser || !activeChatId) return;

    chat_text.value = "";
    resizeTextarea();
    send_button.disabled = true;
    chat_text.focus();

    const { data: inserted, error } = await db
        .from("messages")
        .insert({
            chat_id: activeChatId,
            product_id: activeProductId,
            sender_id: currentUser.id,
            text: text
        })
        .select()
        .single();

    if (error) {
        console.error(error);
        chat_text.value = text; // no se pierde lo escrito
        resizeTextarea();
        send_button.disabled = false;
        alert("No se pudo enviar el mensaje.");
        return;
    }

    if (inserted) {
        addMessageToUI(activeChatId, "me", inserted.text, new Date(inserted.send_date).getTime(), inserted.id);
    }
}

function resizeTextarea() {
    chat_text.style.height = "auto";
    chat_text.style.height = Math.min(chat_text.scrollHeight, 150) + "px";
}

chat_text.addEventListener("input", () => {
    resizeTextarea();
    send_button.disabled = chat_text.value.trim() === "";
});

chat_text.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey && !e.isComposing) {
        e.preventDefault();
        sendMessage();
    }
});

chat_form.addEventListener("submit", (e) => {
    e.preventDefault();
    sendMessage();
});

async function openChatForProduct(prod) {
    if (!currentUser) {
        pendingProduct = prod;
        openAuthModal();
        return;
    }

    const targetId = prod.sellerId || adminUserId;
    if (!targetId) {
        alert("No hay ningún administrador disponible en este momento.");
        return;
    }
    if (targetId === currentUser.id) {
        alert("Este producto es tuyo; no puedes abrir un chat contigo mismo.");
        return;
    }

    const { data: existingChat } = await db
        .from("chats")
        .select("id")
        .or(`and(user1_id.eq.${currentUser.id},user2_id.eq.${targetId}),and(user1_id.eq.${targetId},user2_id.eq.${currentUser.id})`)
        .limit(1)
        .maybeSingle();

    let chatId = existingChat?.id;

    if (!chatId) {
        const { data: newChat, error } = await db
            .from("chats")
            .insert({ user1_id: currentUser.id, user2_id: targetId })
            .select("id")
            .single();

        if (error) {
            console.error(error);
            alert("Error al iniciar la conversación.");
            return;
        }
        chatId = newChat.id;
    }

    chatProductHint[chatId] = prod.id;
    await loadUserChats();
    activeProductId = prod.id;
    await selectChat(chatId);
    const chat = getChat(chatId);
    if (chat) { chat.productId = prod.id; chat.title = prod.name; chat.img = prod.img; renderChatList(); renderConversation(); }
}

(async function initPublicApp() {
    updateAuthUI();
    renderChatList();
    renderConversation();
    await fetchProductsFromDB();
    await initSession();
})();
