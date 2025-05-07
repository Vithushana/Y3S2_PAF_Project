import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // Added for navigation
import axios from "axios";
import {
  Trash,
  Edit,
  MessageCircle,
  Heart,
  Save,
  X,
  ArrowLeft,
} from "lucide-react"; // Added ArrowLeft
import "./ProfilePage.css";
const ProfilePage = () => {
  const [activeTab, setActiveTab] = useState("posts");
  const [userPosts, setUserPosts] = useState([]);
  const [learningProgress, setLearningProgress] = useState([]);
  const [learningPlans, setLearningPlans] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingPost, setEditingPost] = useState(null);
  const [editContent, setEditContent] = useState("");
  const [editMediaFiles, setEditMediaFiles] = useState([]);
  const [editMediaUrls, setEditMediaUrls] = useState([]);
  const [userData, setUserData] = useState(null);
  const [editingProgress, setEditingProgress] = useState(null);
  const [editProgressTitle, setEditProgressTitle] = useState("");
  const [editProgressDescription, setEditProgressDescription] = useState("");
  const [editingPlan, setEditingPlan] = useState(null);
  const [editPlanTitle, setEditPlanTitle] = useState("");
  const [editPlanDescription, setEditPlanDescription] = useState("");
  const [editPlanTopics, setEditPlanTopics] = useState("");
  const [editPlanResources, setEditPlanResources] = useState("");
  const [formErrors, setFormErrors] = useState({});
  const [editUserData, setEditUserData] = useState({
    name: "",
    email: "",
  });

  const navigate = useNavigate(); // Added for navigation
  const loggedInUser = JSON.parse(localStorage.getItem("loggedUser"));
  const userId = loggedInUser?.id;

  useEffect(() => {
    if (!userId) {
      setError("User not logged in.");
      setIsLoading(false);
      return;
    }

    fetchUserData();
    fetchUserPosts();
    fetchLearningProgress();
    fetchLearningPlans();
  }, [userId]);

  const fetchUserData = async () => {
    try {
      const response = await axios.get(
        `http://localhost:8080/api/user/${userId}`
      );
      setUserData(response.data);
      setEditUserData({
        name: response.data.name || "",
        email: response.data.email || "",
      });
    } catch (err) {
      setError("Failed to fetch user data.");
      console.error(err);
    }
  };

  const fetchUserPosts = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(
        `http://localhost:8080/api/posts/user/${userId}`
      );
      setUserPosts(response.data);
      setError(null);
    } catch (err) {
      setError("Failed to load posts.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchLearningProgress = async () => {
    try {
      const response = await axios.get(
        `http://localhost:8080/api/learning-progress/user/${userId}`
      );
      setLearningProgress(response.data);
    } catch (err) {
      console.error("Error fetching learning progress:", err);
    }
  };

  const fetchLearningPlans = async () => {
    try {
      const response = await axios.get(
        `http://localhost:8080/api/learning-plan/user/${userId}`
      );
      setLearningPlans(response.data);
    } catch (err) {
      console.error("Error fetching learning plans:", err);
    }
  };

  const handleDelete = async (postId) => {
    if (window.confirm("Are you sure you want to delete this post?")) {
      try {
        await axios.delete(`http://localhost:8080/api/posts/${postId}`);
        setUserPosts(userPosts.filter((post) => post.id !== postId));
      } catch (err) {
        alert("Failed to delete post.");
        console.error(err);
      }
    }
  };

  const handleDeleteProgress = async (progressId) => {
    if (
      window.confirm("Are you sure you want to delete this learning progress?")
    ) {
      try {
        await axios.delete(
          `http://localhost:8080/api/learning-progress/${progressId}`
        );
        setLearningProgress(
          learningProgress.filter((progress) => progress.id !== progressId)
        );
      } catch (err) {
        alert("Failed to delete learning progress.");
        console.error(err);
      }
    }
  };

  const handleDeletePlan = async (planId) => {
    if (window.confirm("Are you sure you want to delete this learning plan?")) {
      try {
        await axios.delete(`http://localhost:8080/api/learning-plan/${planId}`);
        setLearningPlans(learningPlans.filter((plan) => plan.id !== planId));
      } catch (err) {
        alert("Failed to delete learning plan.");
        console.error(err);
      }
    }
  };

  const startEditing = (post) => {
    setEditingPost(post.id);
    setEditContent(post.description || "");
    setEditMediaUrls(post.mediaUrls || []);
    setEditMediaFiles([]);
    setFormErrors({});
  };

  const startEditingProgress = (progress) => {
    setEditingProgress(progress.id);
    setEditProgressTitle(progress.title || "");
    setEditProgressDescription(progress.description || "");
    setFormErrors({});
  };

  const startEditingPlan = (plan) => {
    setEditingPlan(plan.id);
    setEditPlanTitle(plan.title || "");
    setEditPlanDescription(plan.description || "");
    setEditPlanTopics(plan.topics || "");
    setEditPlanResources(plan.resources || "");
    setFormErrors({});
  };

  const cancelEditing = () => {
    setEditingPost(null);
    setEditContent("");
    setEditMediaFiles([]);
    setEditMediaUrls([]);
    setFormErrors({});
  };

  const cancelEditingProgress = () => {
    setEditingProgress(null);
    setEditProgressTitle("");
    setEditProgressDescription("");
    setFormErrors({});
  };

  const cancelEditingPlan = () => {
    setEditingPlan(null);
    setEditPlanTitle("");
    setEditPlanDescription("");
    setEditPlanTopics("");
    setEditPlanResources("");
    setFormErrors({});
  };

  const handleEditFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 3) {
      alert("You can upload a maximum of 3 images");
      return;
    }
    const validFiles = files.filter((file) =>
      file.type.match(/^image\/(jpe?g|png|gif)$/)
    );
    if (validFiles.length !== files.length) {
      alert("Please select valid image files (JPEG, PNG, or GIF)");
      return;
    }
    const base64Promises = validFiles.map(
      (file) =>
        new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        })
    );
    Promise.all(base64Promises)
      .then((base64Urls) => {
        setEditMediaFiles(validFiles);
        setEditMediaUrls(base64Urls);
      })
      .catch((err) => {
        alert("Error converting images to Base64");
        console.error(err);
      });
  };

  const validatePostForm = () => {
    const errors = {};
    if (!editContent.trim()) errors.content = "Description is required";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateProgressForm = () => {
    const errors = {};
    if (!editProgressTitle.trim()) errors.title = "Title is required";
    if (!editProgressDescription.trim())
      errors.description = "Description is required";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validatePlanForm = () => {
    const errors = {};
    if (!editPlanTitle.trim()) errors.title = "Title is required";
    if (!editPlanDescription.trim())
      errors.description = "Description is required";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateUserForm = () => {
    const errors = {};
    if (!editUserData.name.trim()) errors.name = "Name is required";
    if (!editUserData.email.trim()) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editUserData.email)) {
      errors.email = "Please enter a valid email address";
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const saveEdit = async (postId) => {
    if (!validatePostForm()) return;
    try {
      const updatedPost = {
        description: editContent,
        mediaUrls: editMediaUrls,
      };
      const response = await axios.put(
        `http://localhost:8080/api/posts/${postId}`,
        updatedPost
      );
      setUserPosts(
        userPosts.map((post) => (post.id === postId ? response.data : post))
      );
      cancelEditing();
    } catch (err) {
      alert("Failed to update post.");
      console.error(err);
    }
  };

  const saveProgressEdit = async (progressId) => {
    if (!validateProgressForm()) return;
    try {
      const updatedProgress = {
        title: editProgressTitle,
        description: editProgressDescription,
      };
      const response = await axios.put(
        `http://localhost:8080/api/learning-progress/${progressId}`,
        updatedProgress
      );
      setLearningProgress(
        learningProgress.map((progress) =>
          progress.id === progressId ? response.data : progress
        )
      );
      cancelEditingProgress();
    } catch (err) {
      alert("Failed to update learning progress.");
      console.error(err);
    }
  };

  const savePlanEdit = async (planId) => {
    if (!validatePlanForm()) return;
    try {
      const updatedPlan = {
        title: editPlanTitle,
        description: editPlanDescription,
        topics: editPlanTopics,
        resources: editPlanResources,
      };
      const response = await axios.put(
        `http://localhost:8080/api/learning-plan/${planId}`,
        updatedPlan
      );
      setLearningPlans(
        learningPlans.map((plan) => (plan.id === planId ? response.data : plan))
      );
      cancelEditingPlan();
    } catch (err) {
      alert("Failed to update learning plan.");
      console.error(err);
    }
  };

  const saveUserEdit = async () => {
    if (!validateUserForm()) return;
    try {
      const updatedUser = {
        name: editUserData.name,
        email: editUserData.email,
      };
      const response = await axios.put(
        `http://localhost:8080/api/user/${userId}`,
        updatedUser
      );
      setUserData(response.data);
      localStorage.setItem("loggedUser", JSON.stringify(response.data));
      setError(null);
      alert("Profile updated successfully!");
    } catch (err) {
      setError("Failed to update profile.");
      console.error(err);
    }
  };

  const cancelUserEdit = () => {
    setEditUserData({
      name: userData?.name || "",
      email: userData?.email || "",
    });
    setFormErrors({});
  };

  const addLike = async (postId) => {
    try {
      await axios.post(`http://localhost:8080/api/posts/${postId}/likes`, {
        userId,
      });
      fetchUserPosts();
    } catch (err) {
      console.error("Error liking post:", err);
    }
  };

  const removeLike = async (postId) => {
    try {
      await axios.delete(
        `http://localhost:8080/api/posts/${postId}/likes/${userId}`
      );
      fetchUserPosts();
    } catch (err) {
      console.error("Error removing like:", err);
    }
  };

  const isPostLiked = (post) =>
    post.likes && post.likes.some((like) => like.userId === userId);

  const handleBackToDashboard = () => {
    navigate("/dashboard"); // Navigate to dashboard route
  };

  const renderTabs = () => (
    <div className="profile-tabs">
      <button
        className={`tab-button ${activeTab === "posts" ? "active" : ""}`}
        onClick={() => setActiveTab("posts")}
      >
        My Posts
      </button>
      <button
        className={`tab-button ${activeTab === "liked" ? "active" : ""}`}
        onClick={() => setActiveTab("liked")}
      >
        Learning Progress
      </button>
      <button
        className={`tab-button ${activeTab === "saved" ? "active" : ""}`}
        onClick={() => setActiveTab("saved")}
      >
        Learning Plans
      </button>
      <button
        className={`tab-button ${activeTab === "edit-profile" ? "active" : ""}`}
        onClick={() => setActiveTab("edit-profile")}
      >
        Edit Profile
      </button>
    </div>
  );

  const renderPostContent = (post) => {
    if (editingPost === post.id) {
      return (
        <div className="edit-form">
          <div className="form-group">
            <label
              htmlFor={`post-description-${post.id}`}
              className="form-label"
            >
              Description <span className="required">*</span>
            </label>
            <textarea
              id={`post-description-${post.id}`}
              className="edit-textarea"
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              rows={4}
              placeholder="Enter post description"
              aria-required="true"
            />
            {formErrors.content && (
              <span className="error-text">{formErrors.content}</span>
            )}
          </div>
          <div className="form-group">
            <label className="form-label">Upload Images (up to 3)</label>
            <input
              type="file"
              id={`edit-media-files-${post.id}`}
              accept="image/jpeg,image/png,image/gif"
              multiple
              onChange={handleEditFileChange}
              className="file-input"
              aria-describedby="file-help"
            />
            <small id="file-help" className="form-help">
              JPEG, PNG, or GIF only
            </small>
          </div>
          {editMediaUrls.length > 0 && (
            <div className="media-previews">
              {editMediaUrls.map((url, index) => (
                <div key={index} className="media-preview">
                  <img src={url} alt={`Preview ${index + 1}`} />
                </div>
              ))}
            </div>
          )}
          <div className="form-actions">
            <button className="cancel-button" onClick={cancelEditing}>
              <X size={18} /> Cancel
            </button>
            <button className="save-button" onClick={() => saveEdit(post.id)}>
              <Save size={18} /> Save
            </button>
          </div>
        </div>
      );
    }

    return (
      <>
        <p className="post-content">{post.description}</p>
        {post.mediaUrls && post.mediaUrls.length > 0 && (
          <div className="post-media">
            {post.mediaUrls.map((url, index) => (
              <img
                key={index}
                src={url}
                alt={`Post Media ${index + 1}`}
                className="post-image"
              />
            ))}
          </div>
        )}
      </>
    );
  };

  const renderProgressContent = (progress) => {
    if (editingProgress === progress.id) {
      return (
        <div className="edit-form">
          <div className="form-group">
            <label
              htmlFor={`progress-title-${progress.id}`}
              className="form-label"
            >
              Title <span className="required">*</span>
            </label>
            <input
              id={`progress-title-${progress.id}`}
              className="edit-input"
              value={editProgressTitle}
              onChange={(e) => setEditProgressTitle(e.target.value)}
              placeholder="Enter progress title"
              aria-required="true"
            />
            {formErrors.title && (
              <span className="error-text">{formErrors.title}</span>
            )}
          </div>
          <div className="form-group">
            <label
              htmlFor={`progress-description-${progress.id}`}
              className="form-label"
            >
              Description <span className="required">*</span>
            </label>
            <textarea
              id={`progress-description-${progress.id}`}
              className="edit-textarea"
              value={editProgressDescription}
              onChange={(e) => setEditProgressDescription(e.target.value)}
              rows={4}
              placeholder="Enter progress description"
              aria-required="true"
            />
            {formErrors.description && (
              <span className="error-text">{formErrors.description}</span>
            )}
          </div>
          <div className="form-actions">
            <button className="cancel-button" onClick={cancelEditingProgress}>
              <X size={18} /> Cancel
            </button>
            <button
              className="save-button"
              onClick={() => saveProgressEdit(progress.id)}
            >
              <Save size={18} /> Save
            </button>
          </div>
        </div>
      );
    }

    return (
      <>
        <h3 className="post-title">{progress.title || "Untitled Progress"}</h3>
        <p className="post-content">{progress.description}</p>
      </>
    );
  };

  const renderPlanContent = (plan) => {
    if (editingPlan === plan.id) {
      return (
        <div className="edit-form">
          <div className="form-group">
            <label htmlFor={`plan-title-${plan.id}`} className="form-label">
              Title <span className="required">*</span>
            </label>
            <input
              id={`plan-title-${plan.id}`}
              className="edit-input"
              value={editPlanTitle}
              onChange={(e) => setEditPlanTitle(e.target.value)}
              placeholder="Enter plan title"
              aria-required="true"
            />
            {formErrors.title && (
              <span className="error-text">{formErrors.title}</span>
            )}
          </div>
          <div className="form-group">
            <label
              htmlFor={`plan-description-${plan.id}`}
              className="form-label"
            >
              Description <span className="required">*</span>
            </label>
            <textarea
              id={`plan-description-${plan.id}`}
              className="edit-textarea"
              value={editPlanDescription}
              onChange={(e) => setEditPlanDescription(e.target.value)}
              rows={4}
              placeholder="Enter plan description"
              aria-required="true"
            />
            {formErrors.description && (
              <span className="error-text">{formErrors.description}</span>
            )}
          </div>
          <div className="form-group">
            <label htmlFor={`plan-topics-${plan.id}`} className="form-label">
              Topics
            </label>
            <input
              id={`plan-topics-${plan.id}`}
              className="edit-input"
              value={editPlanTopics}
              onChange={(e) => setEditPlanTopics(e.target.value)}
              placeholder="Enter topics (e.g., React, JavaScript)"
            />
          </div>
          <div className="form-group">
            <label htmlFor={`plan-resources-${plan.id}`} className="form-label">
              Resources
            </label>
            <input
              id={`plan-resources-${plan.id}`}
              className="edit-input"
              value={editPlanResources}
              onChange={(e) => setEditPlanResources(e.target.value)}
              placeholder="Enter resources (e.g., URLs, books)"
            />
          </div>
          <div className="form-actions">
            <button className="cancel-button" onClick={cancelEditingPlan}>
              <X size={18} /> Cancel
            </button>
            <button
              className="save-button"
              onClick={() => savePlanEdit(plan.id)}
            >
              <Save size={18} /> Save
            </button>
          </div>
        </div>
      );
    }

    return (
      <>
        <h3 className="post-title">{plan.title || "Untitled Plan"}</h3>
        <p className="post-content">{plan.description}</p>
        {plan.topics && (
          <p className="post-content">
            <strong>Topics:</strong> {plan.topics}
          </p>
        )}
        {plan.resources && (
          <p className="post-content">
            <strong>Resources:</strong> {plan.resources}
          </p>
        )}
      </>
    );
  };

  const renderEditProfile = () => (
    <div className="edit-profile-container">
      <h3 className="edit-profile-title">Edit Profile</h3>
      {error && <div className="error-message">{error}</div>}
      <div className="edit-form">
        <div className="form-group">
          <label htmlFor="edit-name" className="form-label">
            Name <span className="required">*</span>
          </label>
          <input
            id="edit-name"
            className="edit-input"
            value={editUserData.name}
            onChange={(e) =>
              setEditUserData({ ...editUserData, name: e.target.value })
            }
            placeholder="Enter your name"
            aria-required="true"
          />
          {formErrors.name && (
            <span className="error-text">{formErrors.name}</span>
          )}
        </div>
        <div className="form-group">
          <label htmlFor="edit-email" className="form-label">
            Email <span className="required">*</span>
          </label>
          <input
            id="edit-email"
            className="edit-input"
            type="email"
            value={editUserData.email}
            onChange={(e) =>
              setEditUserData({ ...editUserData, email: e.target.value })
            }
            placeholder="Enter your email"
            aria-required="true"
          />
          {formErrors.email && (
            <span className="error-text">{formErrors.email}</span>
          )}
        </div>
        <div className="form-actions">
          <button className="cancel-button" onClick={cancelUserEdit}>
            <X size={18} /> Cancel
          </button>
          <button className="save-button" onClick={saveUserEdit}>
            <Save size={18} /> Save
          </button>
        </div>
      </div>
    </div>
  );

  const renderPosts = () => {
    if (isLoading)
      return <div className="loading-message">Loading posts...</div>;
    if (error) return <div className="error-message">{error}</div>;
    if (userPosts.length === 0)
      return <div className="empty-message">No posts found.</div>;

    return (
      <div className="posts-container">
        {userPosts.map((post) => (
          <div key={post.id} className="post-card">
            <div className="post-header">
              <div className="post-info">
                <h3 className="post-title">
                  {post.description || "Untitled Post"}
                </h3>
                <p className="post-date">
                  {new Date(post.createdAt).toLocaleDateString()}
                </p>
              </div>
              {post.userId === userId && (
                <div className="post-actions">
                  <button
                    onClick={() => startEditing(post)}
                    className="action-button edit-button"
                    disabled={editingPost === post.id}
                    aria-label="Edit post"
                  >
                    <Edit size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(post.id)}
                    className="action-button delete-button"
                    aria-label="Delete post"
                  >
                    <Trash size={18} />
                  </button>
                </div>
              )}
            </div>
            {renderPostContent(post)}
            <div className="post-footer">
              <button
                className={`like-button ${isPostLiked(post) ? "liked" : ""}`}
                onClick={() =>
                  isPostLiked(post) ? removeLike(post.id) : addLike(post.id)
                }
                aria-label={isPostLiked(post) ? "Unlike post" : "Like post"}
              >
                <Heart
                  size={18}
                  className="like-icon"
                  fill={isPostLiked(post) ? "currentColor" : "none"}
                />
                <span>{post.likes ? post.likes.length : 0}</span>
              </button>
              <div className="comment-count">
                <MessageCircle size={18} className="comment-icon" />
                <span>{post.comments ? post.comments.length : 0}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderLearningProgress = () => {
    if (!learningProgress.length) {
      return <div className="empty-message">No learning progress found.</div>;
    }
    return (
      <div className="posts-container">
        {learningProgress.map((progress) => (
          <div key={progress.id} className="post-card">
            <div className="post-header">
              <div className="post-info">
                <p className="post-date">
                  {new Date(progress.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="post-actions">
                <button
                  onClick={() => startEditingProgress(progress)}
                  className="action-button edit-button"
                  disabled={editingProgress === progress.id}
                  aria-label="Edit progress"
                >
                  <Edit size={18} />
                </button>
                <button
                  onClick={() => handleDeleteProgress(progress.id)}
                  className="action-button delete-button"
                  aria-label="Delete progress"
                >
                  <Trash size={18} />
                </button>
              </div>
            </div>
            {renderProgressContent(progress)}
          </div>
        ))}
      </div>
    );
  };

  const renderLearningPlans = () => {
    if (!learningPlans.length) {
      return <div className="empty-message">No learning plans found.</div>;
    }
    return (
      <div className="posts-container">
        {learningPlans.map((plan) => (
          <div key={plan.id} className="post-card">
            <div className="post-header">
              <div className="post-info">
                <p className="post-date">
                  {new Date(plan.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="post-actions">
                <button
                  onClick={() => startEditingPlan(plan)}
                  className="action-button edit-button"
                  disabled={editingPlan === plan.id}
                  aria-label="Edit plan"
                >
                  <Edit size={18} />
                </button>
                <button
                  onClick={() => handleDeletePlan(plan.id)}
                  className="action-button delete-button"
                  aria-label="Delete plan"
                >
                  <Trash size={18} />
                </button>
              </div>
            </div>
            {renderPlanContent(plan)}
          </div>
        ))}
      </div>
    );
  };

  const renderContent = () => {
    switch (activeTab) {
      case "posts":
        return renderPosts();
      case "liked":
        return renderLearningProgress();
      case "saved":
        return renderLearningPlans();
      case "edit-profile":
        return renderEditProfile();
      default:
        return renderPosts();
    }
  };

  return (
    <div className="profile-page">
      <div className="profile-container">
        <div className="profile-navigation">
          <button
            className="back-button"
            onClick={handleBackToDashboard}
            aria-label="Back to Dashboard"
          >
            <ArrowLeft size={18} /> Back to Dashboard
          </button>
        </div>
        <div className="profile-header">
          <div className="profile-avatar">
            {userData?.profileImage ? (
              <img src={userData.profileImage} alt="Profile" />
            ) : (
              <img
                src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
                alt="Default Profile"
              />
            )}
          </div>
          <div className="profile-info">
            <h2 className="profile-name">{userData?.name || "My Profile"}</h2>
            <p className="profile-username">{userData?.email || "username"}</p>
          </div>
        </div>
        {renderTabs()}
        {renderContent()}
      </div>
    </div>
  );
};

export default ProfilePage;
