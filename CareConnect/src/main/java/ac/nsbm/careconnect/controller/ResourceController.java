package ac.nsbm.careconnect.controller;

import ac.nsbm.careconnect.model.ResourceItem;
import ac.nsbm.careconnect.service.ResourceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/resources")
@CrossOrigin(origins = "*")
public class ResourceController {

    @Autowired
    private ResourceService resourceService;

    // Get All Resources
    @GetMapping("/all")
    public List<ResourceItem> getAllResources() {
        return resourceService.getAllResources();
    }

    // Add New Resource
    @PostMapping("/add")
    public ResponseEntity<ResourceItem> addResource(@RequestBody ResourceItem item) {
        return ResponseEntity.ok(resourceService.addResource(item));
    }

    // Update Resource (Used for Allocation/Editing)
    @PutMapping("/update/{id}")
    public ResponseEntity<ResourceItem> updateResource(@PathVariable Long id, @RequestBody ResourceItem item) {
        ResourceItem updated = resourceService.updateResource(id, item);
        if (updated != null) {
            return ResponseEntity.ok(updated);
        }
        return ResponseEntity.notFound().build();
    }

    // Delete Resource
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteResource(@PathVariable Long id) {
        resourceService.deleteResource(id);
        return ResponseEntity.ok().build();
    }
}