import api from "./api";

const LearningProgressService = {
  // Validation functions
  validation: {
    // Validate progress data 
    validateProgressData: (progressData) => {
      if (!progressData) {
        throw new Error('Progress data is required');
      }
      
      if (!progressData.learningPathId) {
        throw new Error('Learning path ID is required');
      }
      
      if (!progressData.userId) {
        throw new Error('User ID is required');
      }
      
      return true;
    },
    
    // Validate completion status
    validateCompletionStatus: (completionStatus) => {
      if (completionStatus === undefined || completionStatus === null) {
        throw new Error('Completion status is required');
      }
      
      if (typeof completionStatus !== 'boolean') {
        throw new Error('Completion status must be a boolean value');
      }
      
      return true;
    },
    
    // Validate percentage
    validatePercentage: (percentage) => {
      if (percentage === undefined || percentage === null) {
        throw new Error('Percentage is required');
      }
      
      const numPercentage = Number(percentage);
      
      if (isNaN(numPercentage)) {
        throw new Error('Percentage must be a valid number');
      }
      
      if (numPercentage < 0 || numPercentage > 100) {
        throw new Error('Percentage must be between 0 and 100');
      }
      
      return true;
    },

    // Validate user ID
    validateUserId: (userId) => {
      if (!userId) {
        throw new Error('User ID is required');
      }
      
      return true;
    },

    // Validate progress ID
    validateProgressId: (progressId) => {
      if (!progressId) {
        throw new Error('Progress ID is required');
      }
      
      return true;
    }
  },

  // Get all progress entries for a user
  getUserProgress: (userId) => {
    LearningProgressService.validation.validateUserId(userId);
    return api.get(`/progress/users/${userId}`);
  },

  // Get single progress detail by ID
  getProgressDetail: async (progressId) => {
    try {
      const progress = await api.get(`/progress/${progressId}`);
      if (!progress.data || !progress.data.learningPathId) {
        console.error("Progress data or learningPathId missing", progress.data);
        return { data: null };
      }
      
      try {
        progress.data.learningPath = (await api.get(`/paths/${progress.data.learningPathId}`)).data;
      } catch (err) {
        console.error("Error fetching learning path details:", err);
        progress.data.learningPath = {}; // Provide empty object as fallback
      }
      
      return progress;
    } catch (err) {
      console.error("Error fetching progress details:", err);
      return { data: null };
    }
  },

  // Get progress for a specific user and learning path
  getProgressByUserAndPath: (userId, pathId) => {
    return api.get(`/progress/users/${userId}/paths/${pathId}`);
  },

  // Create new progress tracking
  createProgress: (progressData) => {
    return api.post("/progress", progressData);
  },
  
  // Start tracking progress for a path
  startProgress: (pathId, userId) => {
    return api.post("/progress", {
      learningPathId: pathId,
      userId: userId,
      startedAt: new Date().toISOString()
    });
  },

  // Complete a milestone
  completeMilestone: (progressId, milestoneId) => {
    return api.post(`/progress/${progressId}/milestones`, {
      milestoneId: milestoneId,
      completedAt: new Date().toISOString()
    });
  },

  // Uncomplete a milestone (remove from completed list)
  uncompleteMilestone: (progressId, milestoneId) => {
    return api.delete(`/progress/${progressId}/milestones/${milestoneId}`);
  },

  // Update notes
  updateNotes: (progressId, notes) => {
    return api.put(`/progress/${progressId}`, {
      notes: notes
    });
  },

  // Update progress percentage
  updateProgressPercentage: (progressId) => {
    return api.put(`/progress/${progressId}/percentage`);
  },

  // Update progress percentage manually (for when user wants to set specific percentage)
  updateManualPercentage: (progressId, percentage) => {
    LearningProgressService.validation.validateProgressId(progressId);
    LearningProgressService.validation.validatePercentage(percentage);
    
    return api.put(`/progress/${progressId}/manual-percentage`, {
      percentage: percentage
    });
  },
  
  // Mark progress as complete
  markAsComplete: (progressId, isComplete = true) => {
    LearningProgressService.validation.validateProgressId(progressId);
    LearningProgressService.validation.validateCompletionStatus(isComplete);
    
    return api.put(`/progress/${progressId}/complete`, {
      isComplete: isComplete,
      completedAt: isComplete ? new Date().toISOString() : null
    });
  },

  // Delete progress
  deleteProgress: (progressId) => {
    return api.delete(`/progress/${progressId}`);
  },

  // Like a progress
  likeProgress: (progressId) => {
    return api.put(`/progress/${progressId}/like`);
  },

  // Get recent progress for a user
  getRecentProgress: (userId) => {
    return api.get(`/progress/users/${userId}/recent`);
  }
};

export default LearningProgressService;