import { CONFIG, apiUtils } from '../../config.js';

let stompClient = null;
let currentReceiverId = null;
const currentUserId = localStorage.getItem('userId');
const currentUserName = localStorage.getItem('userName');

document.addEventListener('DOMContentLoaded', function() {
    // 1. Check Auth
    if (!currentUserId) {
        window.location.href = "../login.html";
        return;
    }

    // 2. Connect WebSocket
    connectWebSocket();

    // 3. Load Contacts
    loadContacts();

    // 4. Setup Event Listeners (Including File Attach)
    setupEventListeners();
});

// --- LOAD CONTACTS ---
async function loadContacts() {
    const listContainer = document.getElementById('contactList');
    listContainer.innerHTML = '<p style="padding:1rem; text-align:center; color:#666">Loading...</p>';

    try {
        const govUrl = `${CONFIG.API_BASE_URL}${CONFIG.ENDPOINTS.USERS.BY_ROLE('government')}`;
        const govs = await apiUtils.get(govUrl).catch(() => []);

        const donorUrl = `${CONFIG.API_BASE_URL}${CONFIG.ENDPOINTS.USERS.BY_ROLE('donor')}`;
        const donors = await apiUtils.get(donorUrl).catch(() => []);

        const allContacts = [...govs, ...donors];

        listContainer.innerHTML = '';
        if (allContacts.length === 0) {
            listContainer.innerHTML = '<p style="padding:1rem; text-align:center;">No contacts found.</p>';
            return;
        }

        allContacts.forEach(user => {
            const initials = (user.firstName.charAt(0) + user.lastName.charAt(0)).toUpperCase();

            let roleBadge = user.role === 'government' ? 'Officer' : 'Donor';
            let roleClass = user.role === 'government' ? 'role-gov' : 'role-donor';

            const div = document.createElement('div');
            div.className = 'conversation-item';
            div.dataset.userId = user.id;

            div.innerHTML = `
                <div class="conversation-avatar">${initials}</div>
                <div class="conversation-info">
                    <h4>
                        ${user.firstName} ${user.lastName} 
                        <span class="role-badge ${roleClass}">${roleBadge}</span>
                    </h4>
                    <p class="last-message">Click to chat</p>
                </div>
            `;

            div.addEventListener('click', () => {
                document.querySelectorAll('.conversation-item').forEach(el => el.classList.remove('active'));
                div.classList.add('active');
                selectUser(user, roleBadge);
            });

            listContainer.appendChild(div);
        });

    } catch (error) {
        console.error("Error loading contacts:", error);
        listContainer.innerHTML = '<p style="color:red; padding:1rem;">Error loading contacts.</p>';
    }
}

// --- SELECT USER ---
function selectUser(user, roleTitle) {
    currentReceiverId = user.id;

    document.getElementById('chatHeaderName').textContent = `${user.firstName} ${user.lastName}`;
    document.getElementById('chatHeaderRole').textContent = roleTitle + " • Online";
    document.getElementById('chatAvatar').textContent = (user.firstName.charAt(0) + user.lastName.charAt(0)).toUpperCase();

    const input = document.getElementById('messageInput');
    const sendBtn = document.getElementById('sendBtn');
    input.disabled = false;
    sendBtn.disabled = false;
    input.focus();

    loadConversation(user.id);
}

// --- WEBSOCKET CONNECTION ---
function connectWebSocket() {
    const socket = new SockJS('http://localhost:8080/ws');
    stompClient = Stomp.over(socket);
    stompClient.debug = null;

    stompClient.connect({}, function (frame) {
        console.log('Connected to Real-time Chat');
        stompClient.subscribe('/topic/' + currentUserId, function (messageOutput) {
            const message = JSON.parse(messageOutput.body);
            displayIncomingMessage(message);
        });
    }, function(error) {
        console.error("WebSocket connection error:", error);
    });
}

// --- SEND MESSAGE (TEXT) ---
function sendRealTimeMessage() {
    if (!currentReceiverId) return;
    const input = document.getElementById('messageInput');
    const content = input.value.trim();
    if (!content) return;

    sendMessagePayload(content);
    input.value = '';
    input.focus();
}

// --- SEND MESSAGE (FILE/IMAGE) ---
function sendFile(file) {
    if (!currentReceiverId) {
        alert("Please select a user first.");
        return;
    }

    // Check file size (Limit to 500KB to prevent WebSocket errors)
    if (file.size > 500 * 1024) {
        alert("File too large. Please select an image under 500KB.");
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        const base64Data = e.target.result; // This looks like "data:image/png;base64,..."
        sendMessagePayload(base64Data);
    };
    reader.readAsDataURL(file);
}

// --- HELPER: SEND PAYLOAD VIA STOMP ---
function sendMessagePayload(content) {
    if(!stompClient) return;

    const messageData = {
        senderId: parseInt(currentUserId),
        receiverId: parseInt(currentReceiverId),
        senderName: currentUserName || 'User',
        content: content
    };

    stompClient.send("/app/chat.send", {}, JSON.stringify(messageData));
}

// --- DISPLAY MESSAGES ---
function displayIncomingMessage(message) {
    if (message.senderId == currentReceiverId || message.receiverId == currentReceiverId) {
        const historyContainer = document.getElementById('messageHistory');
        if (historyContainer.innerText.includes("Select a contact")) {
            historyContainer.innerHTML = '';
        }
        renderMessage(message, historyContainer);
        historyContainer.scrollTop = historyContainer.scrollHeight;
    }
}

// --- RENDER MESSAGE (Detects Image vs Text) ---
function renderMessage(msg, container) {
    const isMe = (msg.senderId == currentUserId);
    const time = new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Check if content is an image (Base64)
    let contentHtml = '';
    if (msg.content && msg.content.startsWith("data:image")) {
        // It's an image
        contentHtml = `<img src="${msg.content}" class="chat-image" alt="Sent Image">`;
    } else if (msg.content && msg.content.startsWith("data:")) {
        // It's another file type
        contentHtml = `<a href="${msg.content}" download="file" class="file-link">📄 Download Attachment</a>`;
    } else {
        // Normal text
        contentHtml = msg.content;
    }

    const div = document.createElement('div');
    div.className = `message-bubble ${isMe ? 'sent' : 'received'}`;
    div.innerHTML = `
        ${contentHtml}
        <span class="timestamp-small">${time}</span>
    `;
    container.appendChild(div);
}

// --- LOAD HISTORY ---
async function loadConversation(receiverId) {
    const historyContainer = document.getElementById('messageHistory');
    historyContainer.innerHTML = '<p style="text-align:center; padding:2rem; color:#666">Loading chat...</p>';

    try {
        const url = `${CONFIG.API_BASE_URL}${CONFIG.ENDPOINTS.COMMUNICATION.GET_CONVERSATION(currentUserId, receiverId)}`;
        const messages = await apiUtils.get(url);

        historyContainer.innerHTML = '';
        if (!messages || messages.length === 0) {
            historyContainer.innerHTML = '<p style="text-align:center; padding:3rem; color:#ccc">No messages yet. Say hello!</p>';
            return;
        }

        messages.forEach(msg => renderMessage(msg, historyContainer));
        historyContainer.scrollTop = historyContainer.scrollHeight;

    } catch (error) {
        console.error("Error loading chat:", error);
        historyContainer.innerHTML = '<p style="color:red; text-align:center">Failed to load conversation.</p>';
    }
}

// --- SETUP LISTENERS ---
function setupEventListeners() {
    const sendBtn = document.getElementById('sendBtn');
    const msgInput = document.getElementById('messageInput');
    const refreshBtn = document.getElementById('refreshContactsBtn');

    // File Upload Elements
    const attachBtn = document.getElementById('attachBtn');
    const fileInput = document.getElementById('fileInput');

    if (sendBtn) sendBtn.addEventListener('click', sendRealTimeMessage);

    if (msgInput) {
        msgInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendRealTimeMessage();
            }
        });
    }

    if (refreshBtn) refreshBtn.addEventListener('click', loadContacts);

    // Attach Button Logic
    if (attachBtn && fileInput) {
        attachBtn.addEventListener('click', () => {
            fileInput.click(); // Trigger hidden input
        });

        fileInput.addEventListener('change', (e) => {
            if (fileInput.files.length > 0) {
                sendFile(fileInput.files[0]);
                fileInput.value = ''; // Reset
            }
        });
    }
}