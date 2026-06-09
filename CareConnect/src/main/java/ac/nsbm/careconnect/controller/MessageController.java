package ac.nsbm.careconnect.controller;

import ac.nsbm.careconnect.model.Message;
import ac.nsbm.careconnect.repository.MessageRepository;
import ac.nsbm.careconnect.service.MessageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/messages")
@CrossOrigin(origins = "*")
public class MessageController {

    @Autowired
    private MessageRepository messageRepository;

    @Autowired
    private MessageService messageService;

    @PostMapping("/send")
    public Message sendMessage(@RequestBody Message message) {
        if(message.getTimestamp() == null) {
            message.setTimestamp(LocalDateTime.now());
        }
        // Ensure new messages are unread by default
        message.setRead(false);
        return messageRepository.save(message);
    }

    @GetMapping("/conversation")
    public List<Message> getConversation(@RequestParam Long userId1, @RequestParam Long userId2) {
        // When user1 requests the conversation, we mark messages from user2 as read
        messageService.markConversationAsRead(userId1, userId2);
        return messageRepository.findConversation(userId1, userId2);
    }

    // Endpoint to get the number of unread messages for the badge
    @GetMapping("/unread-count")
    public long getUnreadCount(@RequestParam Long userId) {
        return messageService.getUnreadCount(userId);
    }
}