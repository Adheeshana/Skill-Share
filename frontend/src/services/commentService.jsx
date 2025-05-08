import api from "./api";

const CommentService = {
  addComment: (postId, commentData) => {
    return api.post(`/comments`, {
      ...commentData,
      referenceType: "POST",
      referenceId: postId,
    });
  },
  updateComment: (commentId, commentData) => {
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