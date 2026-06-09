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

    // 3. Load User List
    loadUserList();

    // 4. Setup Listeners (Send, Attach, Refresh)
    setupEventListeners();
});

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

// --- SEND MESSAGE (Text) ---
function sendRealTimeMessage() {
    if (!currentReceiverId) {
        alert("Please select a user first.");
        return;
    }

    const input = document.getElementById('messageInput');
    const content = input.value.trim();

    if (!content || !stompClient) return;

    sendMessagePayload(content);
    input.value = '';
    input.focus();
}

// --- SEND FILE (Image/Doc) ---
function sendFile(file) {
    if (!currentReceiverId) {
        alert("Please select a user first.");
        return;
    }

    // Limit size to 500KB to prevent WebSocket disconnection
    if (file.size > 500 * 1024) {
        alert("File too large. Please select an image under 500KB.");
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        const base64Data = e.target.result;
        sendMessagePayload(base64Data);
    };
    reader.readAsDataURL(file);
}

// --- HELPER: SEND PAYLOAD ---
function sendMessagePayload(content) {
    const messageData = {
        senderId: parseInt(currentUserId),
        receiverId: parseInt(currentReceiverId),
        senderName: currentUserName || 'Officer',
        content: content
    };

    stompClient.send("/app/chat.send", {}, JSON.stringify(messageData));
}

// --- DISPLAY LOGIC ---
function displayIncomingMessage(message) {
    if (message.senderId == currentReceiverId || message.receiverId == currentReceiverId) {
        const historyContainer = document.getElementById('govMessageHistory');

        if (historyContainer.innerText.includes("Select a person")) {
            historyContainer.innerHTML = '';
        }

        renderMessage(message, historyContainer);
        historyContainer.scrollTop = historyContainer.scrollHeight;
    }
}

// --- RENDER MESSAGE (Detect Image vs Text) ---
function renderMessage(msg, container) {
    const isMe = (msg.senderId == currentUserId);
    const time = new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    let contentHtml = '';
    // Check if content looks like base64 image
    if (msg.content && msg.content.startsWith("data:image")) {
        contentHtml = `<img src="${msg.content}" class="chat-image" alt="Sent Image">`;
    } else if (msg.content && msg.content.startsWith("data:")) {
        contentHtml = `<a href="${msg.content}" download="file" class="file-link">📄 Download Attachment</a>`;
    } else {
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

// --- LOAD USERS (Displaced Persons) ---
async function loadUserList() {
    const listContainer = document.getElementById('userList');
    if(!listContainer) return;

    listContainer.innerHTML = '<p style="padding:1rem; text-align:center; color:#666">Loading users...</p>';

    try {
        const url = `${CONFIG.API_BASE_URL}${CONFIG.ENDPOINTS.USERS.BY_ROLE('displaced')}`;
        const users = await apiUtils.get(url);

        listContainer.innerHTML = '';
        if (!users || users.length === 0) {
            listContainer.innerHTML = '<p style="padding:1rem; text-align:center;">No displaced persons found.</p>';
            return;
        }

        users.forEach(user => {
            const initials = (user.firstName.charAt(0) + user.lastName.charAt(0)).toUpperCase();

            const div = document.createElement('div');
            div.className = 'conversation-item';
            div.dataset.userId = user.id;

            div.innerHTML = `
                <div class="conversation-avatar">${initials}</div>
                <div class="conversation-info">
                    <h4>${user.firstName} ${user.lastName} <span class="role-badge role-displaced">Displaced</span></h4>
                    <p class="last-message">Click to chat</p>
                </div>
            `;

            div.addEventListener('click', () => {
                document.querySelectorAll('.conversation-item').forEach(el => el.classList.remove('active'));
                div.classList.add('active');
                selectUser(user);
            });

            listContainer.appendChild(div);
        });
    } catch (error) {
        console.error("Error loading users:", error);
    }
}

// --- SELECT USER ---
function selectUser(user) {
    currentReceiverId = user.id;

    document.getElementById('chatHeaderName').textContent = `${user.firstName} ${user.lastName}`;
    document.getElementById('chatHeaderRole').textContent = "Displaced Person • Active";
    document.getElementById('chatAvatar').textContent = (user.firstName.charAt(0) + user.lastName.charAt(0)).toUpperCase();

    const input = document.getElementById('messageInput');
    const sendBtn = document.getElementById('sendBtn');
    if(input) {
        input.disabled = false;
        input.focus();
    }
    if(sendBtn) sendBtn.disabled = false;

    loadConversation(user.id);
}

// --- LOAD HISTORY ---
async function loadConversation(receiverId) {
    const historyContainer = document.getElementById('govMessageHistory');
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
    const refreshBtn = document.getElementById('refreshUsersBtn');

    // File elements
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

    if (refreshBtn) refreshBtn.addEventListener('click', loadUserList);

    // File Upload Logic
    if (attachBtn && fileInput) {
        attachBtn.addEventListener('click', () => {
            fileInput.click();
        });

        fileInput.addEventListener('change', (e) => {
            if (fileInput.files.length > 0) {
                sendFile(fileInput.files[0]);
                fileInput.value = ''; // Reset
            }
        });
    }
}