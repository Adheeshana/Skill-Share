package com.skillshare.controller;

import com.skillshare.model.LearningProgress;
import com.skillshare.service.LearningProgressService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import javax.validation.Valid;
import java.util.List;
import java.util.Optional;
import java.util.Objects;

/**
 * REST Controller for managing learning progress.
 * Provides endpoints for creating, retrieving, updating, and deleting learning progress records.
 * Handles user progress tracking, milestone completion, and badge awards.
 */
@RestController
@RequestMapping("/api/progress")
@CrossOrigin(origins = "*") //allow cross-origin requests
// This is a placeholder - replace with actual allowed origins
public class LearningProgressController {

    private final LearningProgressService learningProgressService;

    /**
     * Constructor for dependency injection.
     * @param learningProgressService Service for learning progress operations
     */
    public LearningProgressController(LearningProgressService learningProgressService) {
        this.learningProgressService = learningProgressService;
    }    /**
     * Creates a new learning progress record.
     */
    @PostMapping
    public ResponseEntity<LearningProgress> createProgress(@Valid @RequestBody LearningProgress progress) {
        // Validate required fields
        if (progress.getUserId() == null || progress.getUserId().trim().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "User ID is required");
        }
        if (progress.getLearningPathId() == null || progress.getLearningPathId().trim().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Learning Path ID is required");
        }
        
        // Check for duplicates
        Optional<LearningProgress> existingProgress = 
            learningProgressService.getProgressByUserAndPath(progress.getUserId(), progress.getLearningPathId());
        if (existingProgress.isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, 
                "Progress for this user and learning path already exists");
        }
        
        return new ResponseEntity<>(learningProgressService.createProgress(progress), HttpStatus.CREATED);
    }      /**
     * Retrieves a progress record by ID.
     */
    @GetMapping("/{id}")
    public ResponseEntity<LearningProgress> getProgressById(@PathVariable String id) {
        // Validate ID
        if (id == null || id.trim().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "ID cannot be empty");
        }
        
        Optional<LearningProgress> result = learningProgressService.getProgressById(id);
        if (result.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Learning progress not found with ID: " + id);
        }
        
        LearningProgress progress = result.get();
        return new ResponseEntity<>(progress, HttpStatus.OK);
    }     /**
     * Retrieves all progress records.
     */
    @GetMapping
    public ResponseEntity<List<LearningProgress>> getAllProgress() {
        List<LearningProgress> allProgress = learningProgressService.getAllProgress();
        return new ResponseEntity<>(allProgress, HttpStatus.OK);
    }

    /**
     * Retrieves all learning progress records for a specific user.
     * @param userId The ID of the user
     * @return List of progress records for the user with status 200 (OK)
     */
    @GetMapping("/users/{userId}")
    public ResponseEntity<List<LearningProgress>> getProgressByUserId(@PathVariable String userId) {
        // Validate userId
        if (userId == null || userId.trim().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "User ID cannot be empty");
        }
        
        List<LearningProgress> userProgress = learningProgressService.getProgressByUserId(userId);
        return new ResponseEntity<>(userProgress, HttpStatus.OK);
    }

    /**
     * Retrieves all learning progress records for a specific learning path.
     * @param pathId The ID of the learning path
     * @return List of progress records for the learning path with status 200 (OK)
     */
     @GetMapping("/paths/{pathId}")
    public ResponseEntity<List<LearningProgress>> getProgressByLearningPathId(@PathVariable String pathId) {
        if (pathId == null || pathId.trim().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Learning Path ID cannot be empty");
        }
        
        List<LearningProgress> pathProgress = learningProgressService.getProgressByLearningPathId(pathId);
        return new ResponseEntity<>(pathProgress, HttpStatus.OK);
    }    /**
     * Retrieves learning progress for a specific user and learning path.
     * @param userId The ID of the user
     * @param pathId The ID of the learning path
     * @return The progress if found with status 200 (OK), or 404 (Not Found)
     */
   @GetMapping("/users/{userId}/paths/{pathId}")
    public ResponseEntity<LearningProgress> getProgressByUserAndPath(
            @PathVariable String userId,
            @PathVariable String pathId) {
        if (userId == null || userId.trim().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "User ID cannot be empty");
        }
        if (pathId == null || pathId.trim().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Learning Path ID cannot be empty");
        }
        
        return learningProgressService.getProgressByUserAndPath(userId, pathId)
                .map(progress -> new ResponseEntity<>(progress, HttpStatus.OK))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, 
                    "No progress found for user " + userId + " on learning path " + pathId));
    }    /**
     * Updates an existing progress record.
     */
    @PutMapping("/{id}")
    public ResponseEntity<LearningProgress> updateProgress(
            @PathVariable String id,
            @Valid @RequestBody LearningProgress progress) {
        if (id == null || id.trim().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Progress ID cannot be empty");
        }
        
        // Check if the progress exists
       if (!learningProgressService.getProgressById(id).isPresent()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Progress not found");
        }
        
        // Validate required fields
        if (progress.getUserId() == null || progress.getUserId().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "User ID is required");
        }
        if (progress.getLearningPathId() == null || progress.getLearningPathId().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Learning Path ID is required");
        }
        
        progress.setId(id);
        return new ResponseEntity<>(learningProgressService.updateProgress(progress), HttpStatus.OK);
    }    /**
     * Deletes a learning progress record.
     * @param id The ID of the progress to delete
     * @return Empty response with status 204 (No Content) or 404 (Not Found)
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProgress(@PathVariable String id) {
        // Validate ID
        if (id == null || id.trim().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "ID cannot be empty");
        }
        
        // Check if the progress exists
        Optional<LearningProgress> existingProgress = learningProgressService.getProgressById(id);
        if (existingProgress.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, 
                "Cannot delete progress: record not found with ID: " + id);
        }
        
        learningProgressService.deleteProgress(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }    /**
     * Marks a milestone as completed in a learning progress record.
     * @param id The ID of the progress to update
     * @param milestone The milestone to mark as completed
     * @return Empty response with status 200 (OK)
     */
    @PostMapping("/{id}/milestones")
    public ResponseEntity<Void> completeMilestone(
            @PathVariable String id, 
            @Valid @RequestBody LearningProgress.CompletedMilestone milestone) {
        // Validate ID and milestone
        if (id == null || id.trim().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Progress ID cannot be empty");
        }
        if (milestone == null || milestone.getMilestoneId() == null || milestone.getMilestoneId().trim().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Milestone ID cannot be empty");
        }
        
        // Check if the progress exists
        Optional<LearningProgress> existingProgress = learningProgressService.getProgressById(id);
        if (existingProgress.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, 
                "Cannot update progress: record not found with ID: " + id);
        }
        
        learningProgressService.completeMilestone(id, milestone);
        return new ResponseEntity<>(HttpStatus.OK);
    }    /**
     * Unmarks a milestone as completed in a learning progress record.
     * @param progressId The ID of the progress record
     * @param milestoneId The ID of the milestone to unmark
     * @return Empty response with status 204 (No Content)
     */
    @DeleteMapping("/{progressId}/milestones/{milestoneId}")
    public ResponseEntity<Void> unmarkMilestone(
            @PathVariable String progressId,
            @PathVariable String milestoneId) {
        // Validate parameters
        if (progressId == null || progressId.trim().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Progress ID cannot be empty");
        }
        if (milestoneId == null || milestoneId.trim().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Milestone ID cannot be empty");
        }
        
        // Check if the progress exists
        Optional<LearningProgress> existingProgress = learningProgressService.getProgressById(progressId);
        if (existingProgress.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, 
                "Cannot update progress: record not found with ID: " + progressId);
        }
        
        // Check if the milestone is actually marked as completed
        boolean milestoneFound = existingProgress.get().getCompletedMilestones().stream()
            .anyMatch(m -> Objects.equals(m.getMilestoneId(), milestoneId));
        if (!milestoneFound) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, 
                "Milestone " + milestoneId + " is not marked as completed for this progress");
        }
        
        learningProgressService.unmarkMilestone(progressId, milestoneId);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
    /**
     * Updates the percentage completion of a learning progress record.
     * @param id The ID of the progress to update
     * @return Empty response with status 200 (OK)
     */
    @PutMapping("/{id}/percentage")
    public ResponseEntity<Void> updateProgressPercentage(@PathVariable String id) {
        // Validate ID
        if (id == null || id.trim().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Progress ID cannot be empty");
        }
        
        // Check if the progress exists
        Optional<LearningProgress> existingProgress = learningProgressService.getProgressById(id);
        if (existingProgress.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, 
                "Cannot update percentage: progress not found with ID: " + id);
        }
        
        learningProgressService.updateProgressPercentage(id);
        return new ResponseEntity<>(HttpStatus.OK);
    }    /**
     * Awards a badge to a learning progress record.
     * @param id The ID of the progress to update
     * @param badge The badge to award
     * @return Empty response with status 200 (OK)
     */
    @PutMapping("/{id}/badges/{badge}")
    public ResponseEntity<Void> awardBadge(@PathVariable String id, @PathVariable String badge) {
        // Validate parameters
        if (id == null || id.trim().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Progress ID cannot be empty");
        }
        if (badge == null || badge.trim().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Badge name cannot be empty");
        }
        
        // Check if the progress exists
        Optional<LearningProgress> existingProgress = learningProgressService.getProgressById(id);
        if (existingProgress.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, 
                "Cannot award badge: progress not found with ID: " + id);
        }
        
        // Validate badge is a recognized value
        if (!isValidBadge(badge)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, 
                "Invalid badge type: " + badge);
        }
        
        learningProgressService.awardBadge(id, badge);
        return new ResponseEntity<>(HttpStatus.OK);
    }

    /**
     * Increments the like count for a learning progress record.
     * @param id The ID of the progress to like
     * @return Empty response with status 200 (OK)
     */
    @PutMapping("/{id}/like")
    public ResponseEntity<Void> likeProgress(@PathVariable String id) {
        // Validate ID
        if (id == null || id.trim().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Progress ID cannot be empty");
        }
        
        // Check if the progress exists
        Optional<LearningProgress> existingProgress = learningProgressService.getProgressById(id);
        if (existingProgress.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, 
                "Cannot like progress: record not found with ID: " + id);
        }
        
        learningProgressService.likeProgress(id);
        return new ResponseEntity<>(HttpStatus.OK);
    }
    
    /**
     * Validates if a badge type is recognized by the system.
     * @param badge The badge name to validate
     * @return true if valid, false otherwise
     */
    private boolean isValidBadge(String badge) {
        // Add validation logic for badge types
        // This is a placeholder - replace with actual badge type validation
        return List.of("BEGINNER", "INTERMEDIATE", "ADVANCED", "MASTER", "EXPERT").contains(badge.toUpperCase());
    }

    /**
     * Retrieves recent learning progress records for a specific user.
     * @param userId The ID of the user
     * @return List of recent progress records for the user with status 200 (OK)
     */
    @GetMapping("/users/{userId}/recent")
    public ResponseEntity<List<LearningProgress>> getRecentProgressByUser(@PathVariable String userId) {
        // Validate userId
        if (userId == null || userId.trim().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "User ID cannot be empty");
        }
        
        List<LearningProgress> recentProgress = learningProgressService.getRecentProgressByUser(userId);
        return new ResponseEntity<>(recentProgress, HttpStatus.OK);
    }
}