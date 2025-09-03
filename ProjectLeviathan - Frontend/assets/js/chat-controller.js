// /ProjectLeviathan - Frontend/assets/js/chat-controller.js

import * as api from './api-service.js';
import { updatePageTitle } from './url-manager.js';

let websocket = null;
let currentChatGroupUUID = null;
let allChatMembers = [];
let currentMessagesOffset = 0;
let isLoadingMessages = false;
let hasMoreMessages = true;
let chatScrollHandler = null;

const formatMessageTime = (isoTimestamp) => {
    if (!isoTimestamp) return '';
    try {
        const date = new Date(isoTimestamp);
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        return `${hours}:${minutes}`;
    } catch (e) {
        console.error("Invalid timestamp format:", isoTimestamp);
        return '';
    }
};

const formatDateSeparator = (isoTimestamp) => {
    const date = new Date(isoTimestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
        return 'Hoy';
    } else if (date.toDateString() === yesterday.toDateString()) {
        return 'Ayer';
    } else {
        return date.toLocaleDateString('es-ES', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }
};

const formatMessageText = (text) => {
    const mentionRegex = /(^|\s)@([a-zA-Z0-9_]{4,25})\b/g;
    return text.replace(mentionRegex, (match, precedingWhitespace, username) => {
        const userExists = allChatMembers.some(member => member.username === username);
        if (userExists) {
            return `${precedingWhitespace}<span class="mention">@${username}</span>`;
        }
        return match;
    });
};

const appendMessage = (data) => {
    const messagesContainer = document.getElementById('chat-messages-container');
    if (!messagesContainer) return;

    const chatScrollContainer = document.getElementById('chat-messages-wrapper');
    if (!chatScrollContainer) return;

    const welcomeMessage = document.getElementById('chat-welcome-message');
    if (welcomeMessage) {
        welcomeMessage.style.display = 'none';
    }

    const lastBubble = messagesContainer.querySelector('.message-bubble:last-child');
    const lastBubbleDate = lastBubble ? new Date(lastBubble.dataset.timestamp).toDateString() : null;
    const messageDate = new Date(data.timestamp).toDateString();

    if (!lastBubble || messageDate !== lastBubbleDate) {
        const dateSeparator = document.createElement('div');
        dateSeparator.className = 'chat-date-separator';
        dateSeparator.innerHTML = `<span>${formatDateSeparator(data.timestamp)}</span>`;
        messagesContainer.appendChild(dateSeparator);
    }

    const isSentByCurrentUser = data.user_id === window.PROJECT_CONFIG.userId;
    const messageClass = isSentByCurrentUser ? 'sent' : 'received';
    const username = isSentByCurrentUser ? 'Tú' : data.username;
    const time = formatMessageTime(data.timestamp);
    const formattedMessage = formatMessageText(data.message);

    const messageBubble = document.createElement('div');
    messageBubble.className = `message-bubble ${messageClass}`;
    messageBubble.dataset.messageId = data.message_id;
    messageBubble.dataset.authorId = data.user_id;
    messageBubble.dataset.timestamp = data.timestamp;

    let replyHTML = '';
    if (data.reply_context && !data.is_deleted) {
        const replyAuthor = data.reply_context.username === window.PROJECT_CONFIG.username ? 'Tú' : data.reply_context.username;
        const replyText = data.reply_context.message_text;
        const replyImage = data.reply_context.image_url;

        let replyContentHTML = '';
        if (replyImage) {
            replyContentHTML += `<img src="${replyImage}" class="reply-thumbnail" alt="Imagen respondida">`;
        }
        if (replyText) {
            replyContentHTML += `<p>${replyText}</p>`;
        }
        replyHTML = `
        <div class="reply-context">
            <strong>${replyAuthor}</strong>
            ${replyContentHTML}
        </div>
    `;
    }

    let imageHTML = '';
    if (data.image_url) {
        imageHTML = `<img src="${data.image_url}" alt="Imagen adjunta">`;
    }

    if (data.is_deleted) {
        messageBubble.classList.add('deleted-message');
        messageBubble.innerHTML = `
        <div class="message-content">
            <p><em>${data.message}</em></p>
        </div>`;
    } else {
        messageBubble.innerHTML = `
        ${replyHTML}
        <span class="message-info">${username}</span>
        <div class="message-content">
            <p>${formattedMessage}</p>
            <span class="message-time">${time}</span>
        </div>
        ${imageHTML}`;
    }

    messagesContainer.appendChild(messageBubble);
    chatScrollContainer.scrollTop = chatScrollContainer.scrollHeight;
};

const prependMessage = (data) => {
    const messagesContainer = document.getElementById('chat-messages-container');
    if (!messagesContainer) return;

    const isSentByCurrentUser = data.user_id === window.PROJECT_CONFIG.userId;
    const messageClass = isSentByCurrentUser ? 'sent' : 'received';
    const username = isSentByCurrentUser ? 'Tú' : data.username;
    const time = formatMessageTime(data.timestamp);
    const formattedMessage = formatMessageText(data.message);

    const messageBubble = document.createElement('div');
    messageBubble.className = `message-bubble ${messageClass}`;
    messageBubble.dataset.messageId = data.message_id;
    messageBubble.dataset.authorId = data.user_id;
    messageBubble.dataset.timestamp = data.timestamp;

    let replyHTML = '';
    if (data.reply_context && !data.is_deleted) {
        const replyAuthor = data.reply_context.username === window.PROJECT_CONFIG.username ? 'Tú' : data.reply_context.username;
        const replyText = data.reply_context.message_text;
        const replyImage = data.reply_context.image_url;

        let replyContentHTML = '';
        if (replyImage) {
            replyContentHTML += `<img src="${replyImage}" class="reply-thumbnail" alt="Imagen respondida">`;
        }
        if (replyText) {
            replyContentHTML += `<p>${replyText}</p>`;
        }

        replyHTML = `
        <div class="reply-context">
            <strong>${replyAuthor}</strong>
             ${replyContentHTML}
        </div>
    `;
    }

    let imageHTML = '';
    if (data.image_url) {
        imageHTML = `<img src="${data.image_url}" alt="Imagen adjunta">`;
    }

    if (data.is_deleted) {
        messageBubble.classList.add('deleted-message');
        messageBubble.innerHTML = `
        <div class="message-content">
            <p><em>${data.message}</em></p>
        </div>`;
    } else {
        messageBubble.innerHTML = `
        ${replyHTML}
        <span class="message-info">${username}</span>
        <div class="message-content">
            <p>${formattedMessage}</p>
            <span class="message-time">${time}</span>
        </div>
        ${imageHTML}`;
    }

    messagesContainer.insertBefore(messageBubble, messagesContainer.firstChild);
};

const connectWebSocket = async (groupUuid) => {
    if (websocket && websocket.readyState === WebSocket.OPEN) {
        websocket.close();
    }

    try {
        const formData = new FormData();
        formData.append('action', 'get_websocket_token');
        formData.append('csrf_token', window.PROJECT_CONFIG.csrfToken);

        const data = await api.getWebSocketToken(formData);

        if (!data.success) {
            console.error('No se pudo obtener el token para el WebSocket:', data.message);
            alert('Error de autenticación al conectar con el chat.');
            return;
        }

        const token = data.token;
        currentChatGroupUUID = groupUuid;

        websocket = new WebSocket('ws://localhost:8765');

        websocket.onopen = () => {
            console.log('WebSocket conectado.');
            const authMessage = {
                type: 'auth',
                token: token,
                group_uuid: groupUuid
            };
            websocket.send(JSON.stringify(authMessage));
        };

        websocket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.type === 'new_message') {
                appendMessage(data);
            }
            if (data.type === 'user_status_update') {
                updateMembersList(data.online_users);
            }
            if (data.type === 'message_deleted') {
                const messageBubble = document.querySelector(`[data-message-id="${data.message_id}"]`);
                if (messageBubble) {
                    messageBubble.classList.add('deleted-message');
                    messageBubble.innerHTML = `
                        <div class="message-content">
                            <p><em>Mensaje eliminado</em></p>
                        </div>
                    `;
                }
            }
        };

        websocket.onclose = () => {
            console.log('WebSocket desconectado.');
            websocket = null;
        };

        websocket.onerror = (error) => {
            console.error('Error en WebSocket:', error);
            websocket = null;
        };

    } catch (error) {
        console.error('Error al intentar conectar al WebSocket:', error);
        alert('Error de conexión con el chat.');
    }
};

const showWelcomeMessageIfNeeded = () => {
    const messagesContainer = document.getElementById('chat-messages-container');
    const welcomeMessage = document.getElementById('chat-welcome-message');
    if (messagesContainer && welcomeMessage) {
        const hasMessages = messagesContainer.querySelector('.message-bubble');
        welcomeMessage.style.display = hasMessages ? 'none' : 'flex';
    }
};

const loadMoreMessages = async (groupUuid) => {
    if (isLoadingMessages || !hasMoreMessages) return;
    isLoadingMessages = true;

    const scrollLoader = document.getElementById('chat-loader-container');
    const initialLoader = document.getElementById('chat-initial-loader');
    const welcomeMessage = document.getElementById('chat-welcome-message');
    const chatScrollContainer = document.getElementById('chat-messages-wrapper');
    const messagesContainer = document.getElementById('chat-messages-container');

    if (!chatScrollContainer) return;

    if (currentMessagesOffset > 0 && scrollLoader) {
        scrollLoader.style.display = 'flex';
    }

    if (welcomeMessage) welcomeMessage.style.display = 'none';

    try {
        const data = await api.getChatMessages(groupUuid, currentMessagesOffset);

        if (data.success && data.messages.length === 0 && currentMessagesOffset === 0) {
            hasMoreMessages = false;
            showWelcomeMessageIfNeeded();
            return;
        }

        if (data.success && data.messages.length > 0) {
            const oldScrollHeight = chatScrollContainer.scrollHeight;

            data.messages.forEach(message => {
                prependMessage(message);
            });

            let lastDate = null;
            const allMessages = messagesContainer.querySelectorAll('.message-bubble');
            messagesContainer.querySelectorAll('.chat-date-separator').forEach(sep => sep.remove());

            allMessages.forEach(bubble => {
                const messageDate = new Date(bubble.dataset.timestamp).toDateString();
                if (messageDate !== lastDate) {
                    const separator = document.createElement('div');
                    separator.className = 'chat-date-separator';
                    separator.innerHTML = `<span>${formatDateSeparator(bubble.dataset.timestamp)}</span>`;
                    messagesContainer.insertBefore(separator, bubble);
                    lastDate = messageDate;
                }
            });

            if (currentMessagesOffset === 0) {
                setTimeout(() => {
                    chatScrollContainer.scrollTop = chatScrollContainer.scrollHeight;
                }, 0);
            } else {
                chatScrollContainer.scrollTop = chatScrollContainer.scrollHeight - oldScrollHeight;
            }
            currentMessagesOffset += data.messages.length;
        } else {
            hasMoreMessages = false;
        }

        if (data.messages.length < 50) {
            hasMoreMessages = false;
        }
    } catch (error) {
        console.error("Error de red al cargar más mensajes:", error);
        hasMoreMessages = false;
    } finally {
        isLoadingMessages = false;
        if (initialLoader) initialLoader.style.display = 'none';
        if (scrollLoader) scrollLoader.style.display = 'none';
        showWelcomeMessageIfNeeded();
    }
};

const updateMembersList = (onlineUserIds) => {
    const container = document.getElementById('chat-members-list-page');
    if (!container) return;

    const onlineCountSpan = document.getElementById('members-online-count');
    if (onlineCountSpan) onlineCountSpan.textContent = `${onlineUserIds.length} de ${allChatMembers.length} miembros en línea`;

    container.innerHTML = '';

    const membersByRole = allChatMembers.reduce((acc, member) => {
        const role = member.role || 'user';
        if (!acc[role]) acc[role] = [];
        acc[role].push(member);
        return acc;
    }, {});

    const roleOrder = ['owner', 'admin', 'moderator', 'user'];

    roleOrder.forEach(role => {
        if (membersByRole[role] && membersByRole[role].length > 0) {
            const roleCard = document.createElement('div');
            roleCard.className = 'card';

            const roleName = role.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

            let cardHTML = `<div class="card-item with-divider member-list-header"><strong>${roleName}s</strong></div>`;

            membersByRole[role].forEach((member, index) => {
                const isOnline = onlineUserIds.includes(member.id);
                const statusClass = isOnline ? 'online' : 'offline';

                const dividerClass = index < membersByRole[role].length - 1 ? 'with-divider' : '';

                cardHTML += `
                    <div class="card-item member-list-item ${dividerClass}">
                        <div class="card-content">
                            <div class="member-status ${statusClass}" style="margin-right: 16px;"></div>
                            <div class="card-info">
                                <strong>${member.username}</strong>
                                <span>${roleName}</span>
                            </div>
                        </div>
                    </div>
                `;
            });

            roleCard.innerHTML = cardHTML;
            container.appendChild(roleCard);
        }
    });
};

async function loadChat(groupInfo, navigateHomeCallback) {
    const messagesContainer = document.getElementById('chat-messages-container');
    const chatScrollContainer = document.getElementById('chat-messages-wrapper');
    const initialLoader = document.getElementById('chat-initial-loader');

    if (!chatScrollContainer || !messagesContainer || !initialLoader) {
        console.error("Elementos del DOM del chat no encontrados.");
        return null;
    }

    initialLoader.style.display = 'flex';
    messagesContainer.innerHTML = '';

    currentMessagesOffset = 0;
    isLoadingMessages = false;
    hasMoreMessages = true;

    if (chatScrollHandler) {
        chatScrollContainer.removeEventListener('scroll', chatScrollHandler);
    }

    chatScrollHandler = () => {
        if (chatScrollContainer.scrollTop === 0) {
            loadMoreMessages(groupInfo.uuid);
        }
    };

    chatScrollContainer.addEventListener('scroll', chatScrollHandler);

    if (!groupInfo || !groupInfo.uuid) {
        console.error("No se proporcionó información del grupo para cargar el chat.");
        navigateHomeCallback();
        return null;
    }

    document.getElementById('chat-messages-menu-title').textContent = 'Cargando...';
    document.getElementById('members-group-title').textContent = 'Cargando...';

    try {
        const [detailsData, membersData] = await Promise.all([
            api.getGroupDetails(groupInfo.uuid),
            api.getGroupMembers(groupInfo.uuid)
        ]);

        if (detailsData.success && membersData.success) {
            const realTitle = detailsData.group.group_title;
            const activeChatGroup = { uuid: groupInfo.uuid, title: realTitle, type: groupInfo.type || 'messages' };
            updatePageTitle('chat', activeChatGroup);
            document.getElementById('chat-messages-menu-title').textContent = realTitle;
            document.getElementById('members-group-title').textContent = realTitle;

            allChatMembers = membersData.members;
            updateMembersList([], document.getElementById('chat-members-list-page'));

            await loadMoreMessages(groupInfo.uuid);
            connectWebSocket(groupInfo.uuid);
            
            return activeChatGroup;

        } else {
            const errorMessage = detailsData.message || membersData.message || 'Ocurrió un error inesperado.';
            alert(errorMessage);
            navigateHomeCallback();
            return null;
        }
    } catch (error) {
        console.error("Error al cargar los detalles del chat:", error);
        alert("Error de conexión al intentar cargar el chat.");
        navigateHomeCallback();
        return null;
    }
}

function disconnectWebSocket() {
    if (websocket) {
        websocket.close();
    }
    websocket = null;
    currentChatGroupUUID = null;
    
    const chatScrollContainer = document.getElementById('chat-messages-wrapper');
    if (chatScrollContainer && chatScrollHandler) {
        chatScrollContainer.removeEventListener('scroll', chatScrollHandler);
        chatScrollHandler = null;
    }
}

function getWebSocket() {
    return websocket;
}

function getCurrentChatGroupUUID() {
    return currentChatGroupUUID;
}

function getAllChatMembers() {
    return allChatMembers;
}

export {
    loadChat,
    disconnectWebSocket,
    getWebSocket,
    getCurrentChatGroupUUID,
    getAllChatMembers
};