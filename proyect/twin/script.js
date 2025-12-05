// script.js - Corregido para funcionamiento en /whystore/twin/
// ================================================================

// 🔧 Detección automática de entorno y ruta base
const isLocal = window.location.hostname === 'localhost' || 
                window.location.hostname === '127.0.0.1';

// 🔥 Obtener la ruta base del proyecto (funciona en cualquier ubicación)
function getBasePath() {
    const path = window.location.pathname;
    // Si estamos en /whystore/twin/index.html, devuelve /whystore/twin
    // Si estamos en /whystore/twin/main.html, devuelve /whystore/twin
    const lastSlash = path.lastIndexOf('/');
    return path.substring(0, lastSlash);
}

const BASE_PATH = getBasePath();
const API_URL = `${window.location.origin}${BASE_PATH}/api`;

// 🔧 Ajustar polling según entorno
const POLLING_INTERVAL = isLocal ? 2000 : 5000;
const CONTACT_POLLING_INTERVAL = isLocal ? 6000 : 12000;

console.log('🌐 Entorno:', isLocal ? 'Local' : 'Producción');
console.log('📍 Base Path:', BASE_PATH);
console.log('📡 API URL:', API_URL);

// ===============================
// VARIABLES GLOBALES
// ===============================
let pollingTimer = null;
let contactPollingTimer = null;
let lastMessageId = 0;
let currentContactId = null;
let totalUnreadCount = 0;

const BUZZ_COOLDOWN = 5000;
const SOUND_ENABLED_KEY = 'twin_sound_enabled';
const BUZZ_TIMESTAMP_KEY = 'twin_last_buzz_time';

let audioCtx = null;
let audioUnlocked = false;

if (sessionStorage.getItem(SOUND_ENABLED_KEY) === null) {
    sessionStorage.setItem(SOUND_ENABLED_KEY, 'true');
}

// ===============================
// API CALL (CORREGIDO)
// ===============================
async function apiCall(endpoint, method = 'GET', data = null) {
    const options = {
        method: method,
        headers: {
            'Content-Type': 'application/json; charset=utf-8'
        }
    };
    
    if (data && method !== 'GET') {
        options.body = JSON.stringify(data);
    }
    
    try {
        // Obtener el ID de sesión
        const sessionId = sessionStorage.getItem('php_session_id');
        let url = `${API_URL}/${endpoint}`;
        
        // Añadir el ID de sesión a la URL
        if (sessionId) {
            url += (url.includes('?') ? '&' : '?') + `PHPSESSID=${sessionId}`;
        }

        console.log(`📤 ${method} ${url}`);
        
        const response = await fetch(url, options);
        
        console.log(`📥 Status: ${response.status} ${response.statusText}`);
        
        // Manejo de errores HTTP específicos
        if (response.status === 403) {
            console.error('❌ Error 403: Acceso prohibido');
            return {
                success: false,
                message: 'Acceso prohibido. Verifica permisos del servidor.'
            };
        }
        
        if (response.status === 401) {
            console.warn('⚠️ Sesión expirada (401)');
            handleLogout(false);
            return null;
        }

        if (response.status === 404) {
            console.error('❌ Error 404: Endpoint no encontrado');
            return {
                success: false,
                message: 'Endpoint no encontrado: ' + endpoint
            };
        }

        const text = await response.text();
        
        // Detectar respuestas HTML
        if (text.trim().startsWith('<')) {
            console.error('❌ Respuesta HTML en lugar de JSON');
            console.log('Respuesta recibida:', text.substring(0, 500));
            return { 
                success: false, 
                message: 'Error del servidor. Revisa los logs de PHP.' 
            };
        }
        
        try {
            const json = JSON.parse(text);
            console.log(`✅ Respuesta de ${endpoint}:`, json.success ? '✔' : '✗', json);
            return json;
        } catch (e) {
            console.error(`❌ Error parseando JSON de ${endpoint}:`, e);
            console.log('Texto recibido:', text);
            return { 
                success: false, 
                message: 'Respuesta inválida del servidor' 
            };
        }

    } catch (error) {
        console.error(`❌ Error de red en ${endpoint}:`, error);
        
        if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
            return { 
                success: false, 
                message: 'No se pudo conectar al servidor. Verifica la URL y CORS.' 
            };
        }
        
        return { 
            success: false, 
            message: 'Error de conexión: ' + error.message 
        };
    }
}

function formatTime(dateString) {
    if (!dateString) return '';
    const safeDate = dateString.replace(/-/g, '/');
    const date = new Date(safeDate);
    
    if (isNaN(date.getTime())) return dateString;

    let hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    
    hours = hours % 12;
    hours = hours ? hours : 12;
    
    return `${hours}:${minutes} ${ampm}`;
}

// ===============================
// AUDIO
// ===============================
function getAudioContext() {
    if (!audioCtx) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (AudioContext) {
            audioCtx = new AudioContext();
        }
    }
    return audioCtx;
}

function unlockAudio() {
    if (audioUnlocked) return;
    const ctx = getAudioContext();
    if (ctx && ctx.state === 'suspended') {
        ctx.resume().then(() => {
            audioUnlocked = true;
            document.removeEventListener('click', unlockAudio);
            document.removeEventListener('keydown', unlockAudio);
            document.removeEventListener('touchstart', unlockAudio);
        });
    }
}

document.addEventListener('click', unlockAudio);
document.addEventListener('keydown', unlockAudio);
document.addEventListener('touchstart', unlockAudio);

function playNotificationSound() {
    if (sessionStorage.getItem(SOUND_ENABLED_KEY) !== 'true') return;
    
    const ctx = getAudioContext();
    if (!ctx) return;

    try {
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);
        
        oscillator.frequency.value = 440;
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.05, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
        
        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.3);
    } catch (e) {
        console.warn('Audio bloqueado:', e);
    }
}

function toggleNotificationSound() {
    const isEnabled = sessionStorage.getItem(SOUND_ENABLED_KEY) === 'true';
    const newState = !isEnabled;
    sessionStorage.setItem(SOUND_ENABLED_KEY, newState ? 'true' : 'false');
    
    updateSoundButtonUI();
    
    if (newState) {
        unlockAudio();
        playNotificationSound();
    }
}
window.toggleNotificationSound = toggleNotificationSound;

function updateSoundButtonUI() {
    const soundBtn = document.getElementById('sound-toggle-btn');
    if (soundBtn) {
        const isEnabled = sessionStorage.getItem(SOUND_ENABLED_KEY) === 'true';
        soundBtn.textContent = isEnabled ? '🔊 Sound: ON' : '🔇 Sound: OFF';
        soundBtn.style.opacity = isEnabled ? '1' : '0.7';
    }
}

// ===============================
// AUTH & LOGIN
// ===============================
function showRegistrationForm() {
    window.location.href = `${BASE_PATH}/register.html`;
}
window.showRegistrationForm = showRegistrationForm;

async function handleLogin(event) {
    if (event) event.preventDefault();
    
    const emailInput = document.getElementById('email-input');
    const passInput = document.getElementById('password-input');
    const btn = document.getElementById('signin-btn');

    const email = emailInput?.value.trim();
    const password = passInput?.value;
    
    if (!email || !password) {
        alert('Por favor, completa todos los campos.');
        return;
    }

    const originalText = btn ? btn.textContent : 'Sign In';
    if (btn) {
        btn.textContent = 'Cargando...';
        btn.disabled = true;
    }
    
    const result = await apiCall('login.php', 'POST', { email, password });
    
    if (result && result.success) {
        sessionStorage.setItem('user_id', result.user.id);
        sessionStorage.setItem('user_name', result.user.name);
        sessionStorage.setItem('user_email', result.user.email);
        
        if (result.session_id) {
            sessionStorage.setItem('php_session_id', result.session_id);
            console.log('✅ Session ID guardado:', result.session_id);
        } else {
            console.error("❌ login.php no devolvió un session_id!");
        }
        
        if ('Notification' in window && Notification.permission !== 'granted') {
            try { await Notification.requestPermission(); } catch(e) {}
        }

        window.location.href = `${BASE_PATH}/main.html`;
    } else {
        alert(result?.message || 'Error al iniciar sesión.');
        if (btn) {
            btn.textContent = originalText;
            btn.disabled = false;
        }
    }
}

async function handleRegistration(event) {
    if (event) event.preventDefault();
    
    const nameInput = document.getElementById('name-input');
    const emailInput = document.getElementById('email-input');
    const passInput = document.getElementById('password-input');
    const btn = document.getElementById('register-btn');

    if (!nameInput?.value || !emailInput?.value || !passInput?.value) {
        alert('Por favor, completa todos los campos.');
        return;
    }
    
    if (btn) {
        btn.textContent = 'Registrando...';
        btn.disabled = true;
    }
    
    const result = await apiCall('register.php', 'POST', { 
        name: nameInput.value.trim(), 
        email: emailInput.value.trim(), 
        password: passInput.value 
    });
    
    if (result && result.success) {
        alert('Registro exitoso. Inicia sesión.');
        window.location.href = `${BASE_PATH}/index.html`;
    } else {
        alert(result?.message || 'Error al registrarse.');
        if (btn) {
            btn.textContent = 'Sign Up';
            btn.disabled = false;
        }
    }
}

async function handleLogout(callApi = true) {
    stopPolling();
    stopContactPolling();
    
    if (callApi) {
        try { await apiCall('logout.php', 'POST'); } catch(e) {}
    }
    
    sessionStorage.clear();
    window.location.href = `${BASE_PATH}/index.html`;
}
window.handleLogout = handleLogout;

// ===============================
// CONTACTOS
// ===============================
async function loadContacts() {
    const userName = sessionStorage.getItem('user_name');
    if (!userName && !window.location.pathname.includes('index')) {
        return; 
    }

    const statusName = document.querySelector('.info h3');
    if (statusName && window.location.pathname.includes('main.html')) {
        statusName.textContent = `${userName} (Online)`;
    }

    const result = await apiCall('contacts.php');
    
    if (result && result.success) {
        const newTotalUnread = result.contacts.reduce((sum, c) => sum + parseInt(c.unread_count || 0), 0);
        
        const isChatPage = window.location.pathname.includes('conversation.html');
        if (newTotalUnread > totalUnreadCount) {
            const diff = newTotalUnread - totalUnreadCount;
            if (!isChatPage && diff > 0) {
                triggerNewMessageNotification(diff);
            }
        }
        
        totalUnreadCount = newTotalUnread;

        if (document.querySelector('.chats-p')) {
            renderContacts(result.contacts);
        }
    }
    
    if (contactPollingTimer) clearTimeout(contactPollingTimer);
    contactPollingTimer = setTimeout(loadContacts, CONTACT_POLLING_INTERVAL);
}

function renderContacts(contacts) {
    const chatsContainer = document.querySelector('.chats-p');
    if (!chatsContainer) return;
    
    chatsContainer.innerHTML = ''; 
    
    if (!contacts || contacts.length === 0) {
        chatsContainer.innerHTML = `
            <div style="text-align: center; padding: 40px 20px; color: #666;">
                <p>Sin contactos.</p>
                <button onclick="showAddContactModal()" style="margin-top:10px; padding:5px 10px;">+ Agregar</button>
            </div>
        `;
        return;
    }

    const sortedContacts = contacts.sort((a, b) => {
        const aUnread = a.unread_count > 0 ? 1 : 0;
        const bUnread = b.unread_count > 0 ? 1 : 0;
        if (aUnread !== bUnread) return bUnread - aUnread;
        
        const aStatus = a.status === 'online' ? 1 : 0;
        const bStatus = b.status === 'online' ? 1 : 0;
        if (aStatus !== bStatus) return bStatus - aStatus;
        
        return a.name.localeCompare(b.name);
    });

    sortedContacts.forEach(contact => {
        const div = document.createElement('div');
        div.className = 'user2';
        div.style.cursor = 'pointer';
        
        if (contact.unread_count > 0) {
            div.style.backgroundColor = '#eef6fc';
            div.style.borderLeft = '4px solid #007bff';
        }

        const statusColor = contact.status === 'online' ? '#2ecc71' : '#95a5a6';
        const badge = contact.unread_count > 0 
            ? `<span style="background:#e74c3c; color:white; padding:2px 8px; border-radius:12px; font-size:11px; font-weight:bold;">${contact.unread_count}</span>` 
            : '';
            
        div.innerHTML = `
            <div style="position:relative; margin-right:15px;">
                <img src="${BASE_PATH}/images/user.png" alt="User" style="width:40px; height:40px; border-radius:50%;">
                <span style="position:absolute; bottom:0; right:0; width:10px; height:10px; background:${statusColor}; border-radius:50%; border:2px solid white;"></span>
            </div>
            <div style="flex-grow:1; display:flex; align-items:center; justify-content:space-between;">
                <p style="margin:0; font-weight:${contact.unread_count > 0 ? '600' : '400'}; color:#333;">
                    ${contact.name}
                </p>
                ${badge}
            </div>
        `;
        
        div.addEventListener('click', () => openChat(contact.id, contact.name));
        chatsContainer.appendChild(div);
    });
}

// ===============================
// MODAL AGREGAR CONTACTO
// ===============================
function showAddContactModal() {
    const modal = document.getElementById('add-contact-modal');
    const input = document.getElementById('contact-email-input');
    if (modal) {
        modal.style.display = 'flex';
        if(input) {
            input.value = '';
            input.focus();
        }
    }
}
window.showAddContactModal = showAddContactModal;

function closeAddContactModal() {
    const modal = document.getElementById('add-contact-modal');
    if (modal) modal.style.display = 'none';
}
window.closeAddContactModal = closeAddContactModal;

async function submitAddContact() {
    const emailInput = document.getElementById('contact-email-input');
    const email = emailInput?.value.trim();
    
    if (!email) return alert("Escribe un correo.");
    
    closeAddContactModal();

    const result = await apiCall('add_contact.php', 'POST', { email });
    
    alert(result?.message || 'Error desconocido.');
    if (result && result.success) {
        if(contactPollingTimer) clearTimeout(contactPollingTimer);
        loadContacts();
    }
}
window.submitAddContact = submitAddContact;

function triggerNewMessageNotification(count) {
    playNotificationSound();
    
    if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Twin Messenger', {
            body: `Tienes ${count} mensaje(s) nuevo(s).`,
            icon: `${BASE_PATH}/images/user.png`,
            tag: 'new-message'
        });
    }
}

// ===============================
// CHAT
// ===============================
function openChat(id, name) {
    sessionStorage.setItem('current_contact_id', id);
    sessionStorage.setItem('current_contact_name', name);
    window.location.href = `${BASE_PATH}/conversation.html`;
}

async function loadChat() {
    currentContactId = sessionStorage.getItem('current_contact_id');
    const contactName = sessionStorage.getItem('current_contact_name');
    
    if (!currentContactId) {
        console.warn('⚠️ No hay contacto seleccionado');
        window.location.href = `${BASE_PATH}/main.html`;
        return;
    }

    console.log('💬 Cargando chat con:', contactName, '(ID:', currentContactId, ')');

    const title = document.querySelector('.info h3');
    if (title) title.textContent = contactName || 'Chat';

    lastMessageId = 0;
    
    const sendBtn = document.querySelector('.send');
    const input = document.getElementById('input-area');
    
    if (sendBtn) {
        const newBtn = sendBtn.cloneNode(true);
        sendBtn.parentNode.replaceChild(newBtn, sendBtn);
        newBtn.addEventListener('click', sendMessage);
    }
    
    if (input) {
        const newInput = input.cloneNode(true);
        input.parentNode.replaceChild(newInput, input);
        
        newInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        });
        newInput.focus();
    }

    await loadMessages(false);
    startPolling();
}

async function loadMessages(isPolling = false) {
    if (!currentContactId) return;

    const url = `get_messages.php?contact_id=${currentContactId}` + 
                (isPolling && lastMessageId > 0 ? `&last_id=${lastMessageId}` : '');

    const result = await apiCall(url);

    if (result && result.success) {
        const messages = result.messages;
        
        if (messages.length > 0) {
            const chatBox = document.querySelector('.chat-real');
            let shouldScroll = true;
            
            if (chatBox) {
                const scrollBottom = chatBox.scrollHeight - chatBox.scrollTop - chatBox.clientHeight;
                shouldScroll = !isPolling || scrollBottom < 150; 
            }

            messages.forEach(msg => {
                displayMessage(msg);
                const mId = parseInt(msg.id);
                if (mId > lastMessageId) lastMessageId = mId;
            });

            if (shouldScroll && chatBox) {
                scrollToBottom();
            }
        }
    }
    
    if (pollingTimer) clearTimeout(pollingTimer);
    pollingTimer = setTimeout(() => loadMessages(true), POLLING_INTERVAL);
}

function startPolling() {
    loadMessages(true);
}

function displayMessage(msg) {
    const chatBox = document.querySelector('.chat-real');
    if (!chatBox) return;

    if (document.querySelector(`[data-message-id="${msg.id}"]`)) return;

    const div = document.createElement('div');
    div.dataset.messageId = msg.id;
    div.style.opacity = '0';
    div.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
    
    if (msg.is_buzz) {
        const isNewArrival = !msg.is_mine && msg.is_read == 0; 
        
        if (isNewArrival) { 
            triggerBuzzEffect();
        }

        div.innerHTML = `
            <div style="text-align:${msg.is_mine ? 'right' : 'left'}; margin: 10px 0;">
                <span style="font-size:0.75em; color:#999; margin-bottom:2px; display:block;">
                    ${msg.sender_name} • ${formatTime(msg.created_at)}
                </span>
                <div class="buzz-message" style="
                    display:inline-block; 
                    color:#c0392b; 
                    font-weight:bold; 
                    border: 2px dashed #e74c3c; 
                    padding: 10px 20px;
                    border-radius: 8px;
                    background: #fadbd8;
                ">
                    🔔 ¡ZUMBIDO!
                </div>
            </div>
        `;
    } else {
        const align = msg.is_mine ? 'right' : 'left';
        const bg = msg.is_mine ? '#dcf8c6' : '#ffffff';
        
        div.innerHTML = `
            <div style="display:flex; flex-direction:column; align-items:flex-${msg.is_mine ? 'end' : 'start'}; margin-bottom:10px;">
                <p class="dm" style="margin:0; font-size:0.75em; color:#666;">
                    ${msg.sender_name} - ${formatTime(msg.created_at)}
                </p>
                <p class="dm2" style="
                    margin:2px 0 0 0; 
                    background:${bg}; 
                    padding:8px 12px; 
                    border-radius:8px; 
                    box-shadow:0 1px 1px rgba(0,0,0,0.1); 
                    max-width:80%; 
                    word-wrap:break-word;
                    text-align:left;
                ">
                    ${escapeHtml(msg.message)}
                </p>
            </div>
        `;
    }

    chatBox.appendChild(div);
    
    requestAnimationFrame(() => {
        div.style.opacity = '1';
        div.style.transform = 'translateY(0)';
    });
}

function escapeHtml(text) {
    if (!text) return '';
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

async function sendMessage() {
    const input = document.getElementById('input-area');
    const text = input?.value.trim();
    
    if (!text) return;

    input.value = '';
    
    const data = {
        receiver_id: parseInt(currentContactId),
        message: text
    };
    
    const result = await apiCall('send_message.php', 'POST', data);
    
    if (result && result.success) {
        if(pollingTimer) clearTimeout(pollingTimer);
        loadMessages(true);
    } else {
        alert('Error enviando mensaje.');
        input.value = text;
    }
}

async function sendBuzz() {
    const now = Date.now();
    const lastBuzz = parseInt(sessionStorage.getItem(BUZZ_TIMESTAMP_KEY) || '0');
    
    if (now - lastBuzz < BUZZ_COOLDOWN) {
        const wait = Math.ceil((BUZZ_COOLDOWN - (now - lastBuzz)) / 1000);
        alert(`Espera ${wait}s para enviar otro Buzz.`);
        return;
    }

    const result = await apiCall('send_buzz.php', 'POST', { receiver_id: parseInt(currentContactId) });

    if (result && result.success) {
        sessionStorage.setItem(BUZZ_TIMESTAMP_KEY, now.toString());
        
        if(pollingTimer) clearTimeout(pollingTimer);
        loadMessages(true);
        
        const chatBox = document.querySelector('.chat-real');
        shakeElement(chatBox, 5, 3);
    } else {
        alert('No se pudo enviar el Zumbido.');
    }
}
window.sendBuzz = sendBuzz;

function triggerBuzzEffect() {
    const chatBox = document.querySelector('.chat-real');
    
    const ctx = getAudioContext();
    if (ctx && sessionStorage.getItem(SOUND_ENABLED_KEY) === 'true') {
        try {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            
            osc.frequency.setValueAtTime(800, ctx.currentTime);
            osc.frequency.linearRampToValueAtTime(300, ctx.currentTime + 0.15);
            osc.type = 'sawtooth';
            
            gain.gain.setValueAtTime(0.3, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
            
            osc.start(ctx.currentTime);
            osc.stop(ctx.currentTime + 0.4);
        } catch(e) {}
    }

    if (navigator.vibrate) navigator.vibrate([200, 50, 200]);

    shakeElement(chatBox, 10, 8, true);
}

function shakeElement(element, times, distance, flash = false) {
    if (!element) return;
    
    const originalTransform = element.style.transform;
    const originalTransition = element.style.transition;
    
    element.style.transition = 'none';
    
    let count = 0;
    const interval = setInterval(() => {
        if (count >= times) {
            clearInterval(interval);
            element.style.transform = originalTransform;
            element.style.transition = originalTransition;
            if(flash) element.style.backgroundColor = '';
            return;
        }

        const x = (Math.random() * distance * 2) - distance;
        const y = (Math.random() * distance * 2) - distance;
        
        element.style.transform = `${originalTransform} translate(${x}px, ${y}px)`;

        if (flash) {
            element.style.backgroundColor = (count % 2 === 0) ? '#ffebee' : '';
        }

        count++;
    }, 50);
}

function scrollToBottom() {
    const chatBox = document.querySelector('.chat-real');
    if (chatBox) chatBox.scrollTop = chatBox.scrollHeight;
}

function stopPolling() {
    if (pollingTimer) clearTimeout(pollingTimer);
    pollingTimer = null;
}

function stopContactPolling() {
    if (contactPollingTimer) clearTimeout(contactPollingTimer);
    contactPollingTimer = null;
}

// ===============================
// INICIALIZACIÓN
// ===============================
document.addEventListener('DOMContentLoaded', () => {
    const path = window.location.pathname;
    const page = path.substring(path.lastIndexOf('/') + 1).split('?')[0];

    console.log('📄 Página actual:', page || 'index.html');

    const userId = sessionStorage.getItem('user_id');
    console.log('🔐 User ID:', userId);
    
    if (page === 'index.html' || page === '' || page === 'login.php') {
        const loginForm = document.getElementById('login-form');
        const loginBtn = document.getElementById('signin-btn');
        
        if (loginForm) loginForm.addEventListener('submit', handleLogin);
        if (loginBtn) loginBtn.addEventListener('click', handleLogin);

    } else if (page === 'register.html') {
        const regForm = document.getElementById('register-form');
        const regBtn = document.getElementById('register-btn');
        
        if (regForm) regForm.addEventListener('submit', handleRegistration);
        if (regBtn) regBtn.addEventListener('click', handleRegistration);

    } else {
        if (!userId) {
            console.warn('⚠️ No hay sesión activa');
            sessionStorage.clear();
            window.location.href = `${BASE_PATH}/index.html`;
            return;
        }

        updateSoundButtonUI();

        if (page === 'main.html') {
            console.log('🏠 Cargando página principal');
            loadContacts();
        } else if (page === 'conversation.html') {
            console.log('💬 Cargando conversación');
            loadChat();
        }
    }
});