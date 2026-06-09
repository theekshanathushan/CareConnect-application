package ac.nsbm.careconnect.service;

import ac.nsbm.careconnect.model.ResourceItem;
import ac.nsbm.careconnect.repository.ResourceItemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ResourceService {

    @Autowired
    private ResourceItemRepository resourceItemRepository;

    public ResourceItem addResource(ResourceItem resourceItem) {
        // Auto-set status based on quantity logic in Model
        return resourceItemRepository.save(resourceItem);
    }

    public List<ResourceItem> getAllResources() {
        return resourceItemRepository.findAll();
    }

    public Optional<ResourceItem> getResourceById(Long id) {
        return resourceItemRepository.findById(id);
    }

    public ResourceItem updateResource(Long id, ResourceItem details) {
        return resourceItemRepository.findById(id).map(item -> {
            if(details.getTitle() != null) item.setTitle(details.getTitle());
            if(details.getType() != null) item.setType(details.getType());
            if(details.getDescription() != null) item.setDescription(details.getDescription());
            if(details.getWarehouse() != null) item.setWarehouse(details.getWarehouse());

            // Updating quantity will auto-update status via @PreUpdate
            item.setQuantity(details.getQuantity());

            return resourceItemRepository.save(item);
        }).orElse(null);
    }

    public void deleteResource(Long id) {
        resourceItemRepository.deleteById(id);
    }
}