package com.skillshare.controller;

import com.skillshare.model.Comment;
import com.skillshare.service.CommentService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/comments")
@CrossOrigin(origins = "*")
public class CommentController {

    private final CommentService commentService;

    public CommentController(CommentService commentService) {
        this.commentService = commentService;
    }

    @PostMapping
    public ResponseEntity<Comment> createComment(@RequestBody Comment comment) {
        return new ResponseEntity<>(commentService.createComment(comment), HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Comment> getCommentById(@PathVariable String id) {
        return commentService.getCommentById(id)
                .map(comment -> new ResponseEntity<>(comment, HttpStatus.OK))
                .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    @GetMapping
    public ResponseEntity<List<Comment>> getAllComments() {
        return new ResponseEntity<>(commentService.getAllComments(), HttpStatus.OK);
    }

    @GetMapping("/users/{userId}")
    public ResponseEntity<List<Comment>> getCommentsByUserId(@PathVariable String userId) {
        return new ResponseEntity<>(commentService.getCommentsByUserId(userId), HttpStatus.OK);
    }

    @GetMapping("/references")
    public ResponseEntity<List<Comment>> getCommentsByReference(
            @RequestParam String referenceType,
            @RequestParam String referenceId) {
        return new ResponseEntity<>(
            commentService.getCommentsByReference(referenceType, referenceId),
            HttpStatus.OK
        );
    }

    @GetMapping("/top-level/references")
    public ResponseEntity<List<Comment>> getTopLevelCommentsByReference(
            @RequestParam String referenceType,
            @RequestParam String referenceId) {
        return new ResponseEntity<>(
            commentService.getTopLevelCommentsByReference(referenceType, referenceId),
            HttpStatus.OK
        );
    }

    @GetMapping("/replies/{parentId}")
    public ResponseEntity<List<Comment>> getRepliesByParentCommentId(@PathVariable String parentId) {
        return new ResponseEntity<>(
            commentService.getRepliesByParentCommentId(parentId),
            HttpStatus.OK
        );
    }

    @PutMapping("/{id}")
    public ResponseEntity<Comment> updateComment(@PathVariable String id, @RequestBody Map<String, Object> updates) {
        // Get the existing comment first
        Optional<Comment> existingCommentOpt = commentService.getCommentById(id);
        if (existingCommentOpt.isEmpty()) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }

        Comment existingComment = existingCommentOpt.get();

        // Update only the content field if it exists in the update
        if (updates.containsKey("content")) {
            existingComment.setContent((String) updates.get("content"));
        }

        // Update other fields as needed
        existingComment.setUpdatedAt(LocalDateTime.now());

        return new ResponseEntity<>(commentService.updateComment(existingComment), HttpStatus.OK);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteComment(@PathVariable String id) {
        commentService.deleteComment(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    @PutMapping("/{id}/like")
    public ResponseEntity<Void> likeComment(@PathVariable String id) {
        commentService.likeComment(id);
        return new ResponseEntity<>(HttpStatus.OK);
    }
}