document.addEventListener('DOMContentLoaded', () => {

    // --- 1. GLOBAL STATE & TRANSLATIONS ---
    let allChats = {};
    let currentChatId = null;
    const translations = {
        en: { code: "en", dir: "ltr", name: "EN", new_chat: "New Chat", settings: "Settings", your_name: "Your Name", enter_your_name: "Enter your name", theme: "Theme", ui_language: "UI Language", voice_language: "Voice Language", ask_me_anything: "Ask me anything...", welcome_message: "Hello! I am NLVX Ai. How can I help you shape the future today?", clear_history: "Clear History", confirm_clear: "Are you sure you want to delete all conversations? This action cannot be undone." },
        ar: { code: "ar", dir: "rtl", name: "AR", new_chat: "محادثة جديدة", settings: "الإعدادات", your_name: "اسمك", enter_your_name: "أدخل اسمك", theme: "المظهر", ui_language: "لغة الواجهة", voice_language: "لغة الصوت", ask_me_anything: "اسألني أي شيء...", welcome_message: "مرحباً! أنا NLVX Ai. كيف يمكنني مساعدتك في تشكيل المستقبل اليوم؟", clear_history: "حذف السجل", confirm_clear: "هل أنت متأكد من أنك تريد حذف جميع المحادثات؟ لا يمكن التراجع عن هذا الإجراء." },
        es: { code: "es", dir: "ltr", name: "ES", new_chat: "Nuevo Chat", settings: "Ajustes", your_name: "Tu Nombre", enter_your_name: "Ingresa tu nombre", theme: "Tema", ui_language: "Idioma de UI", voice_language: "Idioma de Voz", ask_me_anything: "Pregúntame lo que sea...", welcome_message: "¡Hola! Soy NLVX Ai. ¿Cómo puedo ayudarte a dar forma al futuro hoy?", clear_history: "Borrar Historial", confirm_clear: "¿Estás seguro de que quieres borrar todas las conversaciones? Esta acción no se puede deshacer." },
        fr: { code: "fr", dir: "ltr", name: "FR", new_chat: "Nouveau Chat", settings: "Paramètres", your_name: "Votre Nom", enter_your_name: "Entrez votre nom", theme: "Thème", ui_language: "Langue de l'IU", voice_language: "Langue Vocale", ask_me_anything: "Demandez-moi n'importe quoi...", welcome_message: "Bonjour! Je suis NLVX Ai. Comment puis-je vous aider à façonner l'avenir aujourd'hui?", clear_history: "Effacer l'historique", confirm_clear: "Êtes-vous sûr de vouloir supprimer toutes les conversations ? Cette action est irréversible." },
        de: { code: "de", dir: "ltr", name: "DE", new_chat: "Neuer Chat", settings: "Einstellungen", your_name: "Dein Name", enter_your_name: "Gib deinen Namen ein", theme: "Thema", ui_language: "UI-Sprache", voice_language: "Stimme Sprache", ask_me_anything: "Frag mich irgendwas...", welcome_message: "Hallo! Ich bin NLVX Ai. Wie kann ich Ihnen heute helfen, die Zukunft zu gestalten?", clear_history: "Verlauf löschen", confirm_clear: "Möchten Sie wirklich alle Konversationen löschen? Diese Aktion kann nicht rückgängig gemacht werden." },
        ur: { code: "ur", dir: "rtl", name: "UR", new_chat: "نئی چیٹ", settings: "ترتیبات", your_name: "آپ کا نام", enter_your_name: "اپنا نام درج کریں", theme: "تھیم", ui_language: "UI زبان", voice_language: "آواز کی زبان", ask_me_anything: "مجھ سے کچھ بھی پوچھیں...", welcome_message: "ہیلو! میں NLVX Ai ہوں۔ میں آج مستقبل کو تشکیل دینے میں آپ کی مدد کیسے کرسکتا ہوں؟", clear_history: "تاریخ صاف کریں", confirm_clear: "کیا آپ واقعی تمام گفتگو حذف کرنا چاہتے ہیں؟ یہ عمل واپس نہیں کیا جا سکتا۔" },
        hi: { code: "hi", dir: "ltr", name: "HI", new_chat: "नई चैट", settings: "सेटिंग्स", your_name: "आपका नाम", enter_your_name: "अपना नाम दर्ज करें", theme: "थीम", ui_language: "UI भाषा", voice_language: "आवाज की भाषा", ask_me_anything: "मुझसे कुछ भी पूछें...", welcome_message: "नमस्ते! मैं NLVX Ai हूँ। मैं आज भविष्य को आकार देने में आपकी मदद कैसे कर सकता हूँ?", clear_history: "इतिहास साफ़ करें", confirm_clear: "क्या आप वाकई सभी वार्तालाप हटाना चाहते हैं? यह कार्रवाई पूर्ववत नहीं की जा सकती।" },
        ru: { code: "ru", dir: "ltr", name: "RU", new_chat: "Новый чат", settings: "Настройки", your_name: "Ваше имя", enter_your_name: "Введите ваше имя", theme: "Тема", ui_language: "Язык интерфейса", voice_language: "Язык голоса", ask_me_anything: "Спросите меня о чем угодно...", welcome_message: "Привет! Я NLVX Ai. Как я могу помочь вам сформировать будущее сегодня?", clear_history: "Очистить историю", confirm_clear: "Вы уверены, что хотите удалить все разговоры? Это действие нельзя отменить." },
        zh: { code: "zh", dir: "ltr", name: "ZH", new_chat: "新聊天", settings: "设置", your_name: "你的名字", enter_your_name: "输入你的名字", theme: "主题", ui_language: "界面语言", voice_language: "语音语言", ask_me_anything: "问我任何事...", welcome_message: "你好！我是 NLVX Ai。我今天如何帮助您塑造未来？", clear_history: "清除历史记录", confirm_clear: "您确定要删除所有对话吗？此操作无法撤销。" },
        ja: { code: "ja", dir: "ltr", name: "JA", new_chat: "新しいチャット", settings: "設定", your_name: "あなたの名前", enter_your_name: "あなたの名前を入力してください", theme: "テーマ", ui_language: "UI言語", voice_language: "音声言語", ask_me_anything: "何でも聞いてください...", welcome_message: "こんにちは！私はNLVX Aiです。今日は未来を形作るお手伝いをどうすればよいですか？", clear_history: "履歴をクリア", confirm_clear: "本当にすべての会話を削除しますか？この操作は元に戻せません。" },
    };

    // --- 2. ELEMENT SELECTORS ---
    const chatBox = document.getElementById('chat-box');
    const userInput = document.getElementById('user-input');
    const sendBtn = document.getElementById('send-btn');
    const newChatBtn = document.getElementById('new-chat-btn');
    const chatHistoryContainer = document.getElementById('chat-history');
    const chatTitle = document.getElementById('chat-title');
    const clearHistoryBtn = document.getElementById('clear-history-btn');
    const sidebar = document.querySelector('.sidebar');
    const menuBtn = document.getElementById('menu-btn');
    const settingsModal = document.getElementById('settings-modal');
    const settingsBtn = document.getElementById('settings-btn');
    const closeBtn = document.querySelector('.close-btn');
    const usernameInput = document.getElementById('username-input');
    const lightModeBtn = document.getElementById('light-mode-btn');
    const darkModeBtn = document.getElementById('dark-mode-btn');
    const langSwitcher = document.getElementById('language-switcher');
    const voiceLangSelect = document.getElementById('voice-language-select');
    const micBtn = document.getElementById('mic-btn');

    // --- 3. CORE CHAT FUNCTIONS ---
    const saveChats = () => {
        localStorage.setItem('nlvx-all-chats', JSON.stringify(allChats));
    };

    const addMessageToChatBox = (sender, message) => {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}`;
        const avatar = document.createElement('div');
        avatar.className = 'avatar';
        avatar.textContent = sender === 'user' ? (localStorage.getItem('nlvx-username') || 'U').charAt(0).toUpperCase() : 'A';
        const textDiv = document.createElement('div');
        textDiv.className = 'text';
        if (sender === 'assistant' && message === 'loading') {
            messageDiv.classList.add('loading');
            textDiv.innerHTML = `<div class="loading-dot"></div><div class="loading-dot"></div><div class="loading-dot"></div>`;
        } else {
            textDiv.textContent = message;
        }
        messageDiv.appendChild(avatar);
        messageDiv.appendChild(textDiv);
        chatBox.appendChild(messageDiv);
        chatBox.scrollTop = chatBox.scrollHeight;
    };

    const renderChat = (chatId) => {
        if (!allChats[chatId]) return;
        currentChatId = chatId;
        localStorage.setItem('nlvx-current-chat-id', chatId);
        chatBox.innerHTML = '';
        const chat = allChats[chatId];
        chat.messages.forEach(msg => addMessageToChatBox(msg.role, msg.content));
        chatTitle.textContent = chat.title;
        document.querySelectorAll('.history-item').forEach(item => {
            item.classList.toggle('active', item.dataset.chatId === chatId);
        });
    };

    const renderChatHistory = () => {
        chatHistoryContainer.innerHTML = '';
        Object.keys(allChats).sort((a, b) => b.localeCompare(a)).forEach(chatId => {
            const chat = allChats[chatId];
            const historyItem = document.createElement('div');
            historyItem.className = 'history-item';
            historyItem.textContent = chat.title;
            historyItem.dataset.chatId = chatId;
            historyItem.addEventListener('click', () => renderChat(chatId));
            chatHistoryContainer.appendChild(historyItem);
        });
    };

    const createNewChat = () => {
        const newChatId = `chat_${Date.now()}`;
        const lang = localStorage.getItem('nlvx-ui-language') || 'en';
        allChats[newChatId] = {
            title: translations[lang].new_chat,
            messages: [{ role: 'assistant', content: translations[lang].welcome_message }]
        };
        saveChats();
        renderChatHistory();
        renderChat(newChatId);
    };

    const clearAllHistory = () => {
        const lang = localStorage.getItem('nlvx-ui-language') || 'en';
        if (confirm(translations[lang].confirm_clear)) {
            allChats = {};
            currentChatId = null;
            localStorage.removeItem('nlvx-all-chats');
            localStorage.removeItem('nlvx-current-chat-id');
            chatHistoryContainer.innerHTML = '';
            createNewChat();
        }
    };

    const sendMessage = async () => {
        const prompt = userInput.value.trim();
        if (!prompt || !currentChatId) return;
        addMessageToChatBox('user', prompt);
        userInput.value = '';
        userInput.style.height = 'auto';
        allChats[currentChatId].messages.push({ role: 'user', content: prompt });
        if (allChats[currentChatId].messages.length === 2) {
            allChats[currentChatId].title = prompt.substring(0, 30) + (prompt.length > 30 ? '...' : '');
            renderChatHistory();
        }
        saveChats();
        addMessageToChatBox('assistant', 'loading');
        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    prompt: prompt,
                    history: allChats[currentChatId].messages.slice(0, -1)
                })
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to connect to the AI');
            }
            const data = await response.json();
            chatBox.querySelector('.message.loading').remove();
            addMessageToChatBox('assistant', data.reply);
            allChats[currentChatId].messages.push({ role: 'assistant', content: data.reply });
            saveChats();
        } catch (error) {
            console.error("Error sending message:", error);
            const loadingMessage = chatBox.querySelector('.message.loading');
            if (loadingMessage) loadingMessage.remove();
            addMessageToChatBox('assistant', `Sorry, an error occurred: ${error.message}`);
        }
    };

    // --- 4. DYNAMIC UI & TRANSLATION ---
    const applyLanguage = (lang) => {
        const langData = translations[lang];
        document.documentElement.lang = langData.code;
        document.documentElement.dir = langData.dir;
        document.querySelectorAll('[data-key]').forEach(el => {
            el.textContent = langData[el.dataset.key] || el.textContent;
        });
        document.querySelectorAll('[data-key-placeholder]').forEach(el => {
            el.placeholder = langData[el.dataset.keyPlaceholder] || el.placeholder;
        });
        document.querySelectorAll('#language-switcher button').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.lang === lang);
        });
        localStorage.setItem('nlvx-ui-language', lang);
    };

    const populateLanguageSwitcher = () => {
        langSwitcher.innerHTML = '';
        Object.keys(translations).forEach(lang => {
            const button = document.createElement('button');
            button.dataset.lang = lang;
            button.textContent = translations[lang].name;
            button.addEventListener('click', () => applyLanguage(lang));
            langSwitcher.appendChild(button);
        });
    };

    const applyTheme = (theme) => {
        document.body.setAttribute('data-theme', theme);
        lightModeBtn.classList.toggle('active', theme === 'light');
        darkModeBtn.classList.toggle('active', theme === 'dark');
        localStorage.setItem('nlvx-theme', theme);
    };

    // --- 5. EVENT LISTENERS ---
    sendBtn.addEventListener('click', sendMessage);
    userInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });
    userInput.addEventListener('input', () => {
        userInput.style.height = 'auto';
        userInput.style.height = `${userInput.scrollHeight}px`;
    });
    newChatBtn.addEventListener('click', createNewChat);
    clearHistoryBtn.addEventListener('click', clearAllHistory);
    settingsBtn.addEventListener('click', () => settingsModal.style.display = 'flex');
    closeBtn.addEventListener('click', () => settingsModal.style.display = 'none');
    window.addEventListener('click', (e) => e.target === settingsModal && (settingsModal.style.display = 'none'));
    lightModeBtn.addEventListener('click', () => applyTheme('light'));
    darkModeBtn.addEventListener('click', () => applyTheme('dark'));
    usernameInput.addEventListener('input', (e) => localStorage.setItem('nlvx-username', e.target.value));
    voiceLangSelect.addEventListener('change', (e) => localStorage.setItem('nlvx-voice-language', e.target.value));
    menuBtn.addEventListener('click', () => sidebar.classList.toggle('is-open'));
    chatHistoryContainer.addEventListener('click', (e) => {
        if (window.innerWidth <= 768 && e.target.classList.contains('history-item')) {
            sidebar.classList.remove('is-open');
        }
    });

    // --- 6. SPEECH RECOGNITION ---
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    let recognition;
    if (SpeechRecognition) {
        recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        micBtn.addEventListener('click', () => {
            recognition.lang = voiceLangSelect.value;
            try {
                recognition.start();
            } catch (e) {
                console.error("Error starting speech recognition:", e);
            }
        });
        recognition.onstart = () => micBtn.classList.add('is-recording');
        recognition.onend = () => micBtn.classList.remove('is-recording');
        recognition.onerror = (e) => console.error("Speech recognition error:", e.error);
        recognition.onresult = (e) => {
            userInput.value = e.results[0][0].transcript;
            userInput.style.height = 'auto';
            userInput.style.height = `${userInput.scrollHeight}px`;
        };
    } else {
        micBtn.style.display = 'none';
    }

    // --- 7. INITIALIZATION ---
    const initializeApp = () => {
        populateLanguageSwitcher();
        const savedLang = localStorage.getItem('nlvx-ui-language') || 'en';
        applyLanguage(savedLang);
        const savedTheme = localStorage.getItem('nlvx-theme') || 'dark';
        applyTheme(savedTheme);
        usernameInput.value = localStorage.getItem('nlvx-username') || '';
        voiceLangSelect.value = localStorage.getItem('nlvx-voice-language') || 'en-US';
        allChats = JSON.parse(localStorage.getItem('nlvx-all-chats')) || {};
        currentChatId = localStorage.getItem('nlvx-current-chat-id');
        if (Object.keys(allChats).length === 0 || !allChats[currentChatId]) {
            createNewChat();
        } else {
            renderChatHistory();
            renderChat(currentChatId);
        }
        console.log("NLVX Ai Final Edition Initialized!");
    };

    initializeApp();
});
