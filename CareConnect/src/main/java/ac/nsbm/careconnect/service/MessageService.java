package ac.nsbm.careconnect.service;

import ac.nsbm.careconnect.model.Message;
import ac.nsbm.careconnect.repository.MessageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class MessageService {

    @Autowired
    private MessageRepository messageRepository;

    public Message sendMessage(Message message) {
        return messageRepository.save(message);
    }

    public List<Message> getAllMessages() {
        return messageRepository.findAll();
    }

    public List<Message> getMessagesByUserId(Long userId) {
        return messageRepository.findBySenderId(userId);
    }

    public List<Message> getConversation(Long user1, Long user2) {
        return messageRepository.findConversation(user1, user2);
    }

    // --- NEW METHODS ---

    // Get unread count for the notification dot
    public long getUnreadCount(Long userId) {
        return messageRepository.countByReceiverIdAndIsReadFalse(userId);
    }

    // Mark conversation as read (call this when opening a chat)
    public void markConversationAsRead(Long currentUserId, Long otherUserId) {
        List<Message> unreadMessages = messageRepository.findByReceiverIdAndSenderIdAndIsReadFalse(currentUserId, otherUserId);
        if (!unreadMessages.isEmpty()) {
            for (Message msg : unreadMessages) {
                msg.setRead(true);
            }
            messageRepository.saveAll(unreadMessages);
        }
    }
}