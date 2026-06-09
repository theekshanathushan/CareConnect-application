package ac.nsbm.careconnect.repository;

import ac.nsbm.careconnect.model.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {

    List<Message> findBySenderId(Long senderId);
    List<Message> findByReceiverId(Long receiverId);

    @Query("SELECT m FROM Message m WHERE " +
            "(m.senderId = :user1Id AND m.receiverId = :user2Id) OR " +
            "(m.senderId = :user2Id AND m.receiverId = :user1Id) " +
            "ORDER BY m.timestamp ASC")
    List<Message> findConversation(@Param("user1Id") Long user1Id, @Param("user2Id") Long user2Id);

    // Count unread messages for a specific receiver
    long countByReceiverIdAndIsReadFalse(Long receiverId);

    // Find unread messages between two users (for marking as read)
    List<Message> findByReceiverIdAndSenderIdAndIsReadFalse(Long receiverId, Long senderId);
}