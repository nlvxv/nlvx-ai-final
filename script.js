document.addEventListener('DOMContentLoaded', () => {

    // --- 1. GLOBAL STATE & TRANSLATIONS ---
    let allChats = {};
    let currentChatId = null;
    const translations = {
        en: { code: "en", dir: "ltr", name: "EN", new_chat: "New Chat", settings: "Settings", your_name: "Your Name", enter_your_name: "Enter your name", theme: "Theme", ui_language: "UI Language", voice_language: "Voice Language", ask_me_anything: "Ask me anything...", welcome_message: "Hello! I am NLVX Ai. How can I help you shape the future today?" },
        ar: { code: "ar", dir: "rtl", name: "AR", new_chat: "محادثة جديدة", settings: "الإعدادات", your_name: "اسمك", enter_your_name: "أدخل اسمك", theme: "المظهر", ui_language: "لغة الواجهة", voice_language: "لغة الصوت", ask_me_anything: "اسألني أي شيء...", welcome_message: "مرحباً! أنا NLVX Ai. كيف يمكنني مساعدتك في تشكيل المستقبل اليوم؟" },
        // Add other 8 languages here...
    };

    // --- 2. ELEMENT SELECTORS ---
    const chatBox = document.getElementById('chat-box');
    const userInput = document.getElementById('user-input');
    const sendBtn = document.getElementById('send-btn');
    const newChatBtn = document.getElementById('new-chat-btn');
    const chatHistoryContainer = document.getElementById('chat-history');
    const chatTitle = document.getElementById('chat-title');
    // ... other selectors from previous steps

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

        // Highlight active chat in history
        document.querySelectorAll('.history-item').forEach(item => {
            item.classList.toggle('active', item.dataset.chatId === chatId);
        });
    };

    const renderChatHistory = () => {
        chatHistoryContainer.innerHTML = '';
        Object.keys(allChats).forEach(chatId => {
            const chat = allChats[chatId];
            const historyItem = document.createElement('div');
            historyItem.className = 'history-item';
            historyItem.textContent = chat.title;
            historyItem.dataset.chatId = chatId;
            historyItem.addEventListener('click', () => renderChat(chatId));
            chatHistoryContainer.prepend(historyItem); // Show newest first
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

    const sendMessage = async () => {
        const prompt = userInput.value.trim();
        if (!prompt) return;

        addMessageToChatBox('user', prompt);
        userInput.value = '';

        // Add user message to current chat object
        allChats[currentChatId].messages.push({ role: 'user', content: prompt });

        // If it's the first user message, set chat title
        if (allChats[currentChatId].messages.length === 2) {
            allChats[currentChatId].title = prompt.substring(0, 30);
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
                    // Send only the last few messages as history to save tokens
                    history: allChats[currentChatId].messages.slice(0, -1) 
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to connect to the AI');
            }

            const data = await response.json();
            
            // Remove loading indicator and add AI response
            chatBox.removeChild(chatBox.lastChild);
            addMessageToChatBox('assistant', data.reply);

            // Add AI response to current chat object and save
            allChats[currentChatId].messages.push({ role: 'assistant', content: data.reply });
            saveChats();

        } catch (error) {
            console.error("Error sending message:", error);
            chatBox.removeChild(chatBox.lastChild);
            addMessageToChatBox('assistant', `Sorry, an error occurred: ${error.message}`);
        }
    };

    // --- 4. EVENT LISTENERS (for chat) ---
    sendBtn.addEventListener('click', sendMessage);
    userInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });
    newChatBtn.addEventListener('click', createNewChat);

    // --- 5. ALL SETTINGS & INITIALIZATION LOGIC ---
    // (Paste the entire settings and initialization code from the previous step here)
    // ... This includes translations, element selectors for settings, applyLanguage,
    // ... populateLanguageSwitcher, applyTheme, username/voice language listeners,
    // ... speech
