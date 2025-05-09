import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../utils/AuthContext";
import PostService from "../services/postService";

function CreatePostPage() {
  const navigate = useNavigate();
  const { currentUser, isAuthenticated } = useAuth();
  const [formData, setFormData] = useState({
    userId: currentUser.id,
    title: "",
    content: "",
    mediaItems: [], // New structure for multiple media items
    tags: ""
  });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // For file uploads
  const fileInputRef = useRef(null);
  const videoInputRef = useRef(null);
  const [mediaErrors, setMediaErrors] = useState({});

  // Move navigation to useEffect
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

  // If not authenticated, don't render the form
  if (!isAuthenticated) {
    return null; // Return null during initial render, useEffect will handle redirect
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Handle adding a description to a media item
  const handleMediaDescriptionChange = (index, description) => {
    const updatedMediaItems = [...formData.mediaItems];
    updatedMediaItems[index] = {
      ...updatedMediaItems[index],
      description
    };
    setFormData({ ...formData, mediaItems: updatedMediaItems });
  };

  // Handle photo file upload
  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files);
    
    if (formData.mediaItems.length + files.length > 3) {
      setMediaErrors({...mediaErrors, limit: "You can only upload up to 3 media items in total"});
      return;
    }
    
    files.forEach(file => {
      // Validate file is an image
      if (!file.type.startsWith('image/')) {
        setMediaErrors({...mediaErrors, type: "Only image files are supported for photos"});
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (event) => {
        setFormData(prevData => ({
          ...prevData,
          mediaItems: [
            ...prevData.mediaItems,
            {
              type: 'image',
              file: file,
              preview: event.target.result,
              description: ''
            }
          ]
        }));
      };
      reader.readAsDataURL(file);
    });
    
    // Clear file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Handle video file upload
  const handleVideoUpload = (e) => {
    const files = Array.from(e.target.files);
    
    if (formData.mediaItems.length + files.length > 3) {
      setMediaErrors({...mediaErrors, limit: "You can only upload up to 3 media items in total"});
      return;
    }
    
    files.forEach(file => {
      // Validate file is a video
      if (!file.type.startsWith('video/')) {
        setMediaErrors({...mediaErrors, type: "Only video files are supported for videos"});
        return;
      }
      
      // Create video element to check duration
      const video = document.createElement('video');
      video.preload = 'metadata';
      
      video.onloadedmetadata = function() {
        window.URL.revokeObjectURL(video.src);
        
        if (video.duration > 30) {
          setMediaErrors({...mediaErrors, duration: "Videos must be 30 seconds or less"});
          return;
        }
        
        const reader = new FileReader();
        reader.onload = (event) => {
          setFormData(prevData => ({
            ...prevData,
            mediaItems: [
              ...prevData.mediaItems,
              {
                type: 'video',
                file: file,
                preview: event.target.result,
                description: '',
                duration: video.duration
              }
            ]
          }));
        };
        reader.readAsDataURL(file);
      };
      
      video.src = URL.createObjectURL(file);
    });
    
    // Clear file input
    if (videoInputRef.current) {
      videoInputRef.current.value = "";
    }
  };

  // Remove a media item
  const removeMedia = (index) => {
    const updatedMediaItems = [...formData.mediaItems];
    updatedMediaItems.splice(index, 1);
    setFormData({ ...formData, mediaItems: updatedMediaItems });
    
    // Clear any media-related errors when removing items
    if (Object.keys(mediaErrors).length > 0) {
      setMediaErrors({});
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMediaErrors({});
    
    // Basic validation
    if (!formData.title.trim() || !formData.content.trim()) {
      setError("Title and content are required");
      return;
    }

    // Word count validation
    const wordCount = formData.content.trim().split(/\s+/).length;
    if (wordCount < 50) {
      setError(`Content must be at least 50 words. Current word count: ${wordCount}`);
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Process tags from comma-separated string to array
      const processedData = {
        ...formData,
        tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()) : [],
      };
      
      // Format media data for backend storage based on the backend model structure
      let postData = {
        ...processedData
      };
      
      // Backend expects mediaUrls as an array of strings
      if (formData.mediaItems.length > 0) {
        // For backward compatibility, use the first image as the main image
        postData.image = formData.mediaItems[0].preview;
        
        // Extract just the URLs for the backend's mediaUrls field
        postData.mediaUrls = formData.mediaItems.map(item => item.preview);
        
        // Remove the complex mediaItems structure that the backend doesn't understand
        delete postData.mediaItems;
      }
      
      console.log("Sending post data to backend:", postData);
      
      const response = await PostService.createPost(postData);
      
      console.log("Post created response:", response.data);
      
      // Check if we got a valid post ID back
      if (response.data && response.data._id) {
        navigate(`/posts/${response.data._id}`);
      } else {
        // Navigate to the posts list if we don't have a valid post ID
        setError("Post was created but couldn't retrieve its details. Redirecting to posts list.");
        setTimeout(() => navigate("/posts"), 2000);
      }
    } catch (err) {
      console.error("Error creating post:", err);
      setError("Failed to create post. " + (err.response?.data?.message || "Please try again."));
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mt-4">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card">
            <div className="card-header">
              <h2 className="mb-0">Create New Post</h2>
            </div>
            <div className="card-body">
              {error && <div className="alert alert-danger">{error}</div>}
              
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="title" className="form-label">Title *</label>
                  <input
                    type="text"
                    className="form-control"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                  />
                </div>
                
                <div className="mb-3">
                  <label htmlFor="content" className="form-label">Content * <span className="text-muted">(minimum 50 words)</span></label>
                  <textarea
                    className="form-control"
                    id="content"
                    name="content"
                    rows="8"
                    value={formData.content}
                    onChange={handleChange}
                    required
                  ></textarea>
                  <div className="d-flex justify-content-between align-items-center mt-1">
                    <small className="text-muted">
                      Share your knowledge, experiences, or questions with the community.
                    </small>
                    <small className={`${formData.content.trim().split(/\s+/).length >= 50 ? 'text-success' : 'text-muted'}`}>
                      Word count: {formData.content.trim() ? formData.content.trim().split(/\s+/).length : 0}/50
                    </small>
                  </div>
                </div>
                
                {/* Media Upload Section */}
                <div className="mb-4">
                  <label className="form-label fw-medium">
                    Media (Photos & Videos)
                    <span className="ms-2 badge bg-secondary">Optional • Max 3 items</span>
                  </label>
                  
                  {/* Error Messages */}
                  {Object.values(mediaErrors).map((msg, i) => (
                    <div key={i} className="alert alert-warning py-2 mb-2">{msg}</div>
                  ))}
                  
                  {/* Upload Buttons */}
                  <div className="d-flex gap-2 mb-3">
                    <div>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        className="d-none"
                        ref={fileInputRef}
                        onChange={handlePhotoUpload}
                        disabled={formData.mediaItems.length >= 3}
                      />
                      <button
                        type="button"
                        className="btn btn-outline-primary"
                        onClick={() => fileInputRef.current.click()}
                        disabled={formData.mediaItems.length >= 3}
                      >
                        <i className="bi bi-image me-2"></i>
                        Add Photos
                      </button>
                    </div>
                    
                    <div>
                      <input
                        type="file"
                        accept="video/*"
                        multiple
                        className="d-none"
                        ref={videoInputRef}
                        onChange={handleVideoUpload}
                        disabled={formData.mediaItems.length >= 3}
                      />
                      <button
                        type="button"
                        className="btn btn-outline-primary"
                        onClick={() => videoInputRef.current.click()}
                        disabled={formData.mediaItems.length >= 3}
                      >
                        <i className="bi bi-camera-video me-2"></i>
                        Add Videos
                      </button>
                    </div>
                  </div>
                  
                  {/* Added Media Preview */}
                  {formData.mediaItems.length > 0 && (
                    <div className="row g-3">
                      {formData.mediaItems.map((item, index) => (
                        <div key={index} className="col-md-4">
                          <div className="card h-100">
                            <div className="position-relative">
                              {item.type === 'image' ? (
                                <img 
                                  src={item.preview} 
                                  alt={`Media ${index + 1}`}
                                  className="card-img-top"
                                  style={{ height: "160px", objectFit: "cover" }}
                                />
                              ) : (
                                <video 
                                  src={item.preview}
                                  className="card-img-top"
                                  style={{ height: "160px", objectFit: "cover" }}
                                  controls
                                />
                              )}
                              <button
                                type="button"
                                className="btn btn-sm btn-danger position-absolute top-0 end-0 m-2"
                                onClick={() => removeMedia(index)}
                              >
                                <i className="bi bi-x"></i>
                              </button>
                            </div>
                            <div className="card-body">
                              <textarea
                                className="form-control form-control-sm"
                                placeholder="Add a description for this media"
                                value={item.description || ''}
                                onChange={(e) => handleMediaDescriptionChange(index, e.target.value)}
                                rows="2"
                              ></textarea>
                            </div>
                            <div className="card-footer bg-light text-muted small py-1">
                              {item.type === 'image' ? 'Photo' : `Video (${Math.round(item.duration)}s)`}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="mb-3">
                  <label htmlFor="tags" className="form-label">Tags (optional)</label>
                  <input
                    type="text"
                    className="form-control"
                    id="tags"
                    name="tags"
                    value={formData.tags}
                    onChange={handleChange}
                    placeholder="Beginner, Intermediate, Advanced"
                  />
                  <small className="text-muted">
                    Enter comma-separated tags to help others find your post.
                  </small>
                </div>
                
                <div className="d-flex justify-content-between">
                  <Link to="/posts" className="btn btn-outline-secondary">
                    Cancel
                  </Link>
                  <button 
                    type="submit" 
                    className="btn btn-primary"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Creating..." : "Create Post"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CreatePostPage;