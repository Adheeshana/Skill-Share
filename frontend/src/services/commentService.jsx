import api from "./api";

// Validation functions
const validateComment = (content) => {
  const errors = {};
  
  // Content validations
  if (!content) {
    errors.content = "Comment cannot be empty";
  } else if (content.trim().length === 0) {
    errors.content = "Comment cannot be just whitespace";
  } else if (content.length > 500) {
    errors.content = "Comment is too long (maximum 500 characters)";
  } else if (content.trim().length < 2) {
    errors.content = "Comment is too short (minimum 2 characters)";
  }
  
 
  
  for (const pattern of spamPatterns) {
    if (pattern.test(content)) {
      errors.content = "Comment appears to contain promotional content";
      break;
    }
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

const CommentService = {
  validateComment,
  
  addComment: (postId, commentData) => {
    // Validate comment content before sending
    const { isValid, errors } = validateComment(commentData.content);
    
    if (!isValid) {
      return Promise.reject({ 
        validationError: true, 
        message: Object.values(errors)[0],
        errors 
      });
    }
    
    return api.post(`/comments`, {
      ...commentData,
      referenceType: "POST",
      referenceId: postId,
    });
  },
  
  updateComment: (commentId, commentData) => {
    // Validate comment content before updating
    const { isValid, errors } = validateComment(commentData.content);
    
    if (!isValid) {
      return Promise.reject({ 
        validationError: true, 
        message: Object.values(errors)[0],
        errors 
      });
    }
    
    // Send only the necessary fields for the update
    return api.put(`/comments/${commentId}`, {
      content: commentData.content
    });
  },
  
  deleteComment: (commentId) => {
    console.log(`Sending delete request for comment ID: ${commentId}`);
    return api.delete(`/comments/${commentId}`);
  },
  
  getCommentsByReference: (referenceType, referenceId) => {
    return api.get(`/comments/references?referenceType=${referenceType}&referenceId=${referenceId}`);
  },
};

export default CommentService;