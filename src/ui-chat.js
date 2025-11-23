export function initChatListeners(uiManager) {
    if (uiManager.chatInput && uiManager.chatSendBtn) {
        const sendChat = () => {
            const text = uiManager.chatInput.value.trim();
            if (!text) return;

            // Optimistically render own message
            const username =
                (uiManager.state && uiManager.state.username) ||
                (uiManager.network.user && (uiManager.network.user.username || uiManager.network.user.name)) ||
                'You';
            
            appendChatMessage(uiManager, {
                username,
                text,
                self: true
            });

            uiManager.network.sendChatMessage(text);
            uiManager.chatInput.value = '';
        };

        uiManager.chatSendBtn.addEventListener('click', sendChat);
        uiManager.chatInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                sendChat();
            }
        });
    }

    // Receive chat messages from network
    uiManager.network.onChatMessage = (data) => {
        // Skip rendering if this message originated from this client;
        // we already rendered it optimistically.
        if (uiManager.network.room && data && data.clientId && data.clientId === uiManager.network.room.clientId) {
            return;
        }

        const isSelf =
            uiManager.network.room &&
            data &&
            data.clientId &&
            data.clientId === uiManager.network.room.clientId;

        appendChatMessage(uiManager, {
            username: data.username || 'Player',
            text: data.text || '',
            self: !!isSelf
        });
    };
}

export function appendChatMessage(uiManager, { username, text, self }) {
    if (!uiManager.chatLog || !text) return;

    // Ensure bottom-aligned layout in chat view by inserting a spacer
    if (uiManager.hostConsoleContainer && uiManager.hostConsoleContainer.classList.contains('chat-view')) {
        let spacer = uiManager.chatLog.querySelector('.chat-spacer');
        if (!spacer) {
            spacer = document.createElement('div');
            spacer.className = 'chat-spacer';
            uiManager.chatLog.insertBefore(spacer, uiManager.chatLog.firstChild);
        }
    }

    const line = document.createElement('div');
    line.className = 'chat-line' + (self ? ' self' : '');
    const userSpan = document.createElement('span');
    userSpan.className = 'chat-user';
    userSpan.textContent = `${username}:`;
    const msgSpan = document.createElement('span');
    msgSpan.textContent = text;
    line.appendChild(userSpan);
    line.appendChild(msgSpan);
    uiManager.chatLog.appendChild(line);
    uiManager.chatLog.scrollTop = uiManager.chatLog.scrollHeight;
}