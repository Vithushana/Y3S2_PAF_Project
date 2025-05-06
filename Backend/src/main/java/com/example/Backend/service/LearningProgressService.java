package com.example.Backend.service;

import com.example.Backend.model.Comment;
import com.example.Backend.model.LearningProgress;
import com.example.Backend.model.Like;
import com.example.Backend.repository.LearningProgressRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class LearningProgressService {

    @Autowired
    private LearningProgressRepository learningProgressRepository;

    // Create a new learning progress entry
    public LearningProgress createLearningProgress(LearningProgress progress) {
        if (progress.getUserId() == null || progress.getUserId().isEmpty()) {
            throw new IllegalArgumentException("User ID is required");
        }
        if (progress.getUserName() == null || progress.getUserName().isEmpty()) {
            progress.setUserName("Unknown User");
        }
        progress.setCreatedAt(new Date());
        progress.setUpdatedAt(new Date());
        progress.setLikes(new ArrayList<>());
        progress.setComments(new ArrayList<>());
        return learningProgressRepository.save(progress);
    }

    // Get all learning progress entries
    public List<LearningProgress> getAllLearningProgress() {
        return learningProgressRepository.findAllByOrderByCreatedAtDesc();
    }

    // Get a learning progress entry by ID
    public LearningProgress getLearningProgressById(String id) {
        return learningProgressRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Learning progress not found"));
    }

    // Get entries by user ID
    public List<LearningProgress> getLearningProgressByUserId(String userId) {
        return learningProgressRepository.findByUserId(userId);
    }

    // Update learning progress entry
    public LearningProgress updateLearningProgress(String id, LearningProgress progressDetails) {
        LearningProgress progress = getLearningProgressById(id);
        progress.setTitle(progressDetails.getTitle());
        progress.setDescription(progressDetails.getDescription());
        progress.setUpdatedAt(new Date());
        return learningProgressRepository.save(progress);
    }

    // Delete learning progress entry
    public void deleteLearningProgress(String id) {
        LearningProgress progress = getLearningProgressById(id);
        learningProgressRepository.delete(progress);
    }

    // Add comment
    public LearningProgress addComment(String entryId, Comment comment) {
        LearningProgress progress = getLearningProgressById(entryId);
        if (progress.getComments() == null) {
            progress.setComments(new ArrayList<>());
        }
        if (comment.getUserName() == null || comment.getUserName().isEmpty()) {
            comment.setUserName("Unknown User");
        }
        comment.setId(UUID.randomUUID().toString());
        comment.setCreatedAt(new Date());
        comment.setUpdatedAt(new Date());
        progress.getComments().add(comment);
        return learningProgressRepository.save(progress);
    }

    // Update comment
    public LearningProgress updateComment(String entryId, String commentId, Comment commentDetails) {
        LearningProgress progress = getLearningProgressById(entryId);
        progress.getComments().stream()
                .filter(c -> c.getId().equals(commentId))
                .findFirst()
                .ifPresent(c -> {
                    c.setContent(commentDetails.getContent());
                    c.setUpdatedAt(new Date());
                });
        return learningProgressRepository.save(progress);
    }

    // Delete comment
    public LearningProgress deleteComment(String entryId, String commentId, String userId) {
        LearningProgress progress = getLearningProgressById(entryId);
        boolean isOwner = progress.getUserId().equals(userId);
        progress.setComments(progress.getComments().stream()
                .filter(c -> !(c.getId().equals(commentId) && (c.getUserId().equals(userId) || isOwner)))
                .collect(Collectors.toList()));
        return learningProgressRepository.save(progress);
    }

    // Add like
    public LearningProgress addLike(String entryId, Like like) {
        LearningProgress progress = getLearningProgressById(entryId);
        if (progress.getLikes() == null) {
            progress.setLikes(new ArrayList<>());
        }
        boolean alreadyLiked = progress.getLikes().stream()
                .anyMatch(l -> l.getUserId().equals(like.getUserId()));

        if (!alreadyLiked) {
            like.setCreatedAt(new Date());
            progress.getLikes().add(like);
            return learningProgressRepository.save(progress);
        }
        return progress;
    }

    // Remove like
    public LearningProgress removeLike(String entryId, String userId) {
        LearningProgress progress = getLearningProgressById(entryId);
        progress.setLikes(progress.getLikes().stream()
                .filter(like -> !like.getUserId().equals(userId))
                .collect(Collectors.toList()));
        return learningProgressRepository.save(progress);
    }
}
