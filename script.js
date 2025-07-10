document.addEventListener('DOMContentLoaded', () => {

    // --- 1. GLOBAL STATE & TRANSLATIONS ---
    let allChats = {};
    let currentChatId = null;
    const translations = {
        en: { code: "en", dir: "ltr", name: "EN", new_chat: "New Chat", settings: "Settings", your_name: "Your Name", enter_your_name: "Enter your name", theme: "Theme", ui_language: "UI Language", voice_language: "Voice Language", ask_me_anything: "Ask me anything...", welcome_message: "Hello! I am NLVX Ai. How can I help you shape the future today?", clear_history: "Clear History", confirm_clear: "Are you sure you want to delete all conversations? This action cannot be undone." },
        ar: { code: "ar", dir: "rtl", name: "AR", new_chat: "محادثة جديدة", settings: "الإعدادات", your_name: "اسمك", enter_your_name: "أدخل اسمك", theme: "المظهر", ui_language: "لغة الواجهة", voice_language: "لغة الصوت", ask_me_anything: "اسألني أي شيء...", welcome_message: "مرحباً! أنا NLVX Ai. كيف يمكنني مساعدتك في تشكيل المستقبل اليوم؟", clear_history: "حذف السجل", confirm_clear: "هل أنت متأكد من أنك تريد حذف جميع المحادثات؟ لا يمكن التراجع عن هذا الإجراء." },
        // ... other languages
    };

    // --- 2. ELEMENT SELECTORS ---
    const chatBox = document.getElementById('chat-box');
    const userInput = document.getElementById('user-input');
    const sendBtn = document.getElementById('send-btn');
    const newChatBtn = document.getElementById('new-chat-btn');
    const chatHistoryContainer = document.getElementById('chat-history');
    const chatTitle = document.getElementById('chat-title');
    const clearHistoryBtn = document.getElementById('clear-history-btn'); // NEW
    const sidebar = document.querySelector('.sidebar');
    const menuBtn = document.getElementById('menu-btn');
    // ... other selectors
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

    // NEW: Function to clear all chat history
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
    clearHistoryBtn.addEventListener('click', clearAllHistory); // NEW
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
