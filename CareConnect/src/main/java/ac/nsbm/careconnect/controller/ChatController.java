package ac.nsbm.careconnect.controller;

import ac.nsbm.careconnect.model.Message;
import ac.nsbm.careconnect.service.MessageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.time.LocalDateTime;

@Controller
public class ChatController {

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @Autowired
    private MessageService messageService;

    // Handles messages sent to /app/chat.send
    @MessageMapping("/chat.send")
    public void sendMessage(@Payload Message message) {
        // 1. Set timestamp
        message.setTimestamp(LocalDateTime.now());

        // 2. Save to Database
        Message savedMessage = messageService.sendMessage(message);

        // 3. Send to Receiver's Topic (Real-time)
        messagingTemplate.convertAndSend("/topic/" + message.getReceiverId(), savedMessage);

        // 4. Send back to Sender (so they see it instantly too)
        messagingTemplate.convertAndSend("/topic/" + message.getSenderId(), savedMessage);
    }
}