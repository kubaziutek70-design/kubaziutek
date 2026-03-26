import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getFirestore, doc, onSnapshot, updateDoc, increment, collection, addDoc, getDoc, setDoc, query, limit, orderBy, getDocs } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";
import { getAuth, signInAnonymously, onAuthStateChanged, signInWithCustomToken, GoogleAuthProvider, signInWithPopup, signOut } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";

// Global variables provided by the environment

// UWAGA: Tutaj musisz wkleić swoje dane z konsoli Firebase!
// Project Settings -> General -> Your apps -> Config
const firebaseConfig = {
    apiKey: "WKLEJ_TUTAJ_API_KEY",
    authDomain: "WKLEJ_TUTAJ_AUTH_DOMAIN",
    projectId: "WKLEJ_TUTAJ_PROJECT_ID",
    storageBucket: "WKLEJ_TUTAJ_STORAGE_BUCKET",
    messagingSenderId: "WKLEJ_TUTAJ_SENDER_ID",
    appId: "WKLEJ_TUTAJ_APP_ID"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const appId = typeof __app_id !== 'undefined' ? __app_id : 'kubaziutek-team-site';

// Task 6: Chat pagination limit
let chatLimit = 15;
let chatUnsubscribe = null;
let isFirstLoad = true;

// Auth logic
async function runAuth() {
    try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
            await signInWithCustomToken(auth, __initial_auth_token);
        } else {
            await signInAnonymously(auth);
        }
    } catch (error) {
        console.error("Auth failed:", error);
        document.getElementById('status-text').innerText = "Błąd połączenia";
    }
}

onAuthStateChanged(auth, (user) => {
    if (user) {
        document.getElementById('status-dot').style.background = "#ef4444";
        document.getElementById('status-dot').style.animation = "pulse-red 1s infinite";
        document.getElementById('status-text').innerText = user.isAnonymous ? "Gość (Anonim)" : "Zalogowano";
        document.getElementById('status-text').classList.remove('text-slate-400');
        document.getElementById('status-text').classList.add('text-white');
        console.log("%c TWOJE UID (Wklej do firestore.rules): " + user.uid, "background: #222; color: #bada55; font-size: 20px");
        
        // Task 4: UI Button Logic
        if (user.isAnonymous) {
            document.getElementById('google-login-btn').classList.remove('hidden');
            document.getElementById('logout-btn').classList.add('hidden');
        } else {
            document.getElementById('google-login-btn').classList.add('hidden');
            document.getElementById('logout-btn').classList.remove('hidden');
            // Auto-fill nick from Google
            if(user.displayName) document.getElementById('user-nick').value = user.displayName;
        }

        initSiteData(user);
        checkVipStatus(user.uid);
    }
});

// Task 4: Google Login Implementation
document.getElementById('google-login-btn').onclick = async () => {
    const provider = new GoogleAuthProvider();
    try {
        await signInWithPopup(auth, provider);
        // Page will refresh or auth state will change
    } catch (e) { console.error("Login failed", e); }
};

document.getElementById('logout-btn').onclick = async () => {
    await signOut(auth);
    window.location.reload();
};

// Task 11: Dark/Light Mode Logic
document.getElementById('theme-toggle').onclick = () => {
    document.body.classList.toggle('light-mode');
    // Opcjonalnie: zapisz wybór w localStorage, żeby przeglądarka pamiętała
};

// Confetti logic
function triggerConfetti() {
    var duration = 3 * 1000;
    var animationEnd = Date.now() + duration;
    var defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };
    var random = function(min, max) { return Math.random() * (max - min) + min; };
    var interval = setInterval(function() {
        var timeLeft = animationEnd - Date.now();
        if (timeLeft <= 0) { return clearInterval(interval); }
        var particleCount = 50 * (timeLeft / duration);
        confetti(Object.assign({}, defaults, { particleCount, origin: { x: random(0.1, 0.3), y: Math.random() - 0.2 } }));
        confetti(Object.assign({}, defaults, { particleCount, origin: { x: random(0.7, 0.9), y: Math.random() - 0.2 } }));
    }, 250);
}

// Task 8: Notification Sound Logic
function playSound() {
    const audio = document.getElementById('notif-sound');
    if (audio) {
        audio.volume = 0.5;
        audio.play().catch(e => console.log("Audio requires interaction first"));
    }
}

// Task 7: Fetch VIP Content
document.getElementById('vip-secret-btn').onclick = async () => {
    const contentArea = document.getElementById('vip-content-area');
    contentArea.innerHTML = "Ładowanie tajnych danych...";
    contentArea.classList.remove('hidden');
    
    try {
        const snapshot = await getDocs(collection(db, 'vip_secret'));
        if (snapshot.empty) {
            contentArea.innerHTML = "Brak tajnych akt w bazie (Jeszcze).";
        } else {
            contentArea.innerHTML = snapshot.docs.map(d => `<div class="mb-1 border-b border-yellow-500/20 pb-1">🕵️ ${d.data().title || 'Tajne info'}: ${d.data().content}</div>`).join('');
        }
    } catch (e) {
        console.error(e);
        contentArea.innerHTML = "⛔ Brak dostępu! Tylko dla VIP.";
    }
};

async function checkVipStatus(uid) {
    // Task 3: Sprawdzamy czy użytkownik kupił VIPa
    const vipRef = doc(db, 'customers', uid);
    const snap = await getDoc(vipRef);
    if (snap.exists() && snap.data().vip) {
        document.getElementById('shop-status').innerText = "Status: Jesteś VIP-em! 💎";
        document.getElementById('shop-status').classList.add('text-yellow-400');
        // Odblokuj opcję VIP w select
        const vipOption = document.querySelector('option[value="vip"]');
        if (vipOption) vipOption.text = "VIP (Odblokowany)";
    }
}

async function initSiteData(user) {
    const statsRef = doc(db, 'artifacts', appId, 'public', 'data', 'stats', 'global');
    
    // Initial stats check
    try {
        const snap = await getDoc(statsRef);
        if (!snap.exists()) {
            await setDoc(statsRef, { kuba: 900, ksawi: 6, visits: 1 });
        } else {
            await updateDoc(statsRef, { visits: increment(1) });
        }
    } catch (e) { console.error(e); }

    // Stats listener
    onSnapshot(statsRef, (doc) => {
        if (doc.exists()) {
            const data = doc.data();
            document.getElementById('kuba-count').innerText = data.kuba || 0;
            document.getElementById('ksawi-count').innerText = data.ksawi || 0;
            
            const kProgress = Math.min(((data.kuba || 0) / 1000) * 100, 100);
            const xProgress = Math.min(((data.ksawi || 0) / 50) * 100, 100);
            
            document.getElementById('kuba-bar').style.width = kProgress + '%';
            document.getElementById('ksawi-bar').style.width = xProgress + '%';
            
            document.getElementById('admin-kuba').placeholder = data.kuba || 0;
            document.getElementById('admin-ksawi').placeholder = data.ksawi || 0;

            // Check for celebration
            if (kProgress >= 100 || xProgress >= 100) {
                triggerConfetti();
            }
        }
    }, (error) => console.error("Stats Error:", error));

    setupChatListener(chatLimit);
}

// Task 6: Chat pagination logic
document.getElementById('load-more-chat').onclick = () => {
    chatLimit += 15;
    setupChatListener(chatLimit);
};

function setupChatListener(limitCount) {
    if (chatUnsubscribe) chatUnsubscribe(); // Detach previous listener

    const msgCol = collection(db, 'artifacts', appId, 'public', 'data', 'messages');
    const q = query(msgCol, orderBy('time', 'desc'), limit(limitCount));

    chatUnsubscribe = onSnapshot(q, (snap) => {
        const chatBox = document.getElementById('chat-box');
        chatBox.innerHTML = '';
        
        // Sortuj rosnąco do wyświetlania (najstarsze na górze)
        const msgs = snap.docs.map(d => d.data()).sort((a,b) => a.time - b.time);
        
        if(msgs.length === 0) {
            chatBox.innerHTML = '<p class="text-center text-slate-500 text-sm uppercase font-bold">Brak wiadomości</p>';
        } else {
            msgs.forEach(m => {
                const div = document.createElement('div');
                
                const rankColors = {
                    'admin': 'text-red-500 border-red-500',
                    'vip': 'text-yellow-400 border-yellow-400',
                    'widz': 'text-blue-400 border-blue-400'
                };
                const rankStyle = rankColors[m.rank] || rankColors['widz'];
                const [textColor, borderColor] = rankStyle.split(' ');
                const avatar = m.avatar || '👤'; // Task 12: Domyślny awatar jeśli brak w bazie

                div.className = `bg-slate-800/80 p-3 rounded-xl border-l-4 ${borderColor} mb-2`;
                // Task 2: Dodajemy UID do wiadomości (tylko w kodzie/inspekcji) dla Admina, aby mógł banować
                div.innerHTML = `<div class="flex justify-between items-center"><span class="${textColor} font-black text-[10px] uppercase flex items-center gap-1"><span class="text-base">${avatar}</span> ${m.nick || 'Anonim'}</span><span class="text-[8px] text-slate-600 cursor-pointer" onclick="navigator.clipboard.writeText('${m.uid}')" title="Kopiuj UID (Dla Admina)">ID</span></div><p class="text-sm mt-1 text-slate-200">${m.text || ''}</p>`;
                chatBox.appendChild(div);
            });
            
            // Task 8: Play sound on new message (if not first load and not self)
            if (!isFirstLoad) {
                const lastMsg = msgs[msgs.length - 1];
                if (lastMsg.uid !== auth.currentUser.uid) {
                    playSound();
                }
            }
            isFirstLoad = false;
            
            // Scroll to bottom
            chatBox.scrollTop = chatBox.scrollHeight;
        }
    }, (error) => console.error("Chat Error:", error));
}

// Secure Admin Panel (Task 1: Server-side check preparation)
const adminPanel = document.getElementById('admin-panel');
adminPanel.addEventListener('toggle', (event) => {
    if (adminPanel.open) {
        // Usunięto client-side hasło "team". Teraz zabezpiecza to firestore.rules i UID.
        console.log("Panel otwarty. Pamiętaj, edycja zadziała tylko jeśli Twoje UID jest w firestore.rules!");
    }
});

// Shop actions
// Task 3: Płatności (Symulacja + Baza)
document.getElementById('buy-vip-btn').onclick = async () => {
    if(!auth.currentUser) return alert("Musisz być połączony!");
    
    const btn = document.getElementById('buy-vip-btn');
    const originalText = btn.innerText;
    
    // Symulacja procesu płatności
    btn.disabled = true;
    btn.innerText = "Przetwarzanie...";
    btn.classList.add('bg-gray-500');
    
    setTimeout(async () => {
        try {
            // Zapisz zakup w bazie
            await setDoc(doc(db, 'customers', auth.currentUser.uid), {
                vip: true,
                boughtAt: Date.now()
            });
            
            triggerConfetti();
            btn.innerText = "Kupiono! 💎";
            btn.classList.remove('bg-gray-500');
            btn.classList.add('bg-green-600');
            checkVipStatus(auth.currentUser.uid);
            alert("Płatność przyjęta! Ranga VIP została przypisana do Twojego konta.");
        } catch (e) {
            console.error(e);
            alert("Błąd zakupu. Spróbuj ponownie.");
            btn.innerText = originalText;
            btn.disabled = false;
        }
    }, 2000); 
};

// Task 2: Banowanie (Admin Action)
document.getElementById('ban-btn').onclick = async () => {
    const uidToBan = prompt("Podaj UID użytkownika do zbanowania (skopiuj z czatu):");
    if (uidToBan) {
        try {
            await setDoc(doc(db, 'banned_users', uidToBan), {
                bannedBy: auth.currentUser.uid,
                reason: 'Admin Action',
                date: Date.now()
            });
            alert(`Użytkownik ${uidToBan} został zbanowany.`);
        } catch (e) {
            console.error("Ban failed:", e);
            alert("Nie masz uprawnień do banowania (Sprawdź firestore.rules i swoje UID).");
        }
    }
};

// Admin actions
document.getElementById('update-stats-btn').onclick = async () => {
    if (!auth.currentUser) return;
    const kVal = parseInt(document.getElementById('admin-kuba').value);
    const xVal = parseInt(document.getElementById('admin-ksawi').value);
    const statsRef = doc(db, 'artifacts', appId, 'public', 'data', 'stats', 'global');
    
    const updateData = {};
    if(!isNaN(kVal)) updateData.kuba = kVal;
    if(!isNaN(xVal)) updateData.ksawi = xVal;

    if(Object.keys(updateData).length > 0) {
        try {
            await updateDoc(statsRef, updateData);
            document.getElementById('admin-kuba').value = '';
            document.getElementById('admin-ksawi').value = '';
            alert("Zaktualizowano!");
        } catch (e) { 
            console.error("Update failed:", e);
            alert("Brak uprawnień! Upewnij się, że Twoje UID jest wpisane w pliku firestore.rules w sekcji STATYSTYKI.");
        }
    }
};

// Form handling
document.getElementById('msg-form').onsubmit = async (e) => {
    e.preventDefault();
    if (!auth.currentUser) return;
    const nick = document.getElementById('user-nick').value;
    const rank = document.getElementById('user-rank').value;
    const text = document.getElementById('user-msg').value;
    const avatar = document.getElementById('user-avatar').value; // Task 12
    if(!nick || !text) return;

    try {
        const msgCol = collection(db, 'artifacts', appId, 'public', 'data', 'messages');
        
        // Walidacja rangi VIP po stronie klienta (dodatkowa)
        if (rank === 'vip') {
             const vipSnap = await getDoc(doc(db, 'customers', auth.currentUser.uid));
             if (!vipSnap.exists() || !vipSnap.data().vip) {
                 alert("Musisz kupić VIP, aby używać tej rangi!");
                 return;
             }
        }

        await addDoc(msgCol, { nick, text, rank, avatar, time: Date.now(), uid: auth.currentUser.uid });
        document.getElementById('user-msg').value = '';
    } catch (e) { 
        console.error("Send failed:", e);
        alert("Nie udało się wysłać wiadomości. Możliwe, że zostałeś zbanowany.");
    }
};

runAuth();