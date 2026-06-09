package ac.nsbm.careconnect.repository;

import ac.nsbm.careconnect.model.ResourceItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ResourceItemRepository extends JpaRepository<ResourceItem, Long> {
    List<ResourceItem> findByType(String type);
    List<ResourceItem> findByWarehouse(String warehouse);
}