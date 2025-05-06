import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Trash, Edit } from "lucide-react";
import "./LearningPlan.css";

const API_BASE_URL = "http://localhost:8080/api";

export default function LearningPlan() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [learningPlans, setLearningPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newLearningPlan, setNewLearningPlan] = useState({
    title: "",
    description: "",
    topics: "",
    resources: "",
  });
  const [comments, setComments] = useState({});

  useEffect(() => {
    const storedUser = localStorage.getItem("loggedUser");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      navigate("/login");
    }
    fetchLearningPlans();
  }, [navigate]);

  const fetchLearningPlans = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/learning-plan`);
      setLearningPlans(response.data);
    } catch (err) {
      setError("Failed to fetch learning plans");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewLearningPlan({
      ...newLearningPlan,
      [name]: value,
    });
  };

  const handleLearningPlanSubmit = async (e) => {
    e.preventDefault();
    if (!newLearningPlan.title.trim() || !newLearningPlan.description.trim()) {
      alert("Please add a title and description");
      return;
    }
    try {
      const planData = {
        userId: user.id,
        userName: user.name,
        title: newLearningPlan.title,
        description: newLearningPlan.description,
        topics: newLearningPlan.topics,
        resources: newLearningPlan.resources,
      };
      const response = await axios.post(
        `${API_BASE_URL}/learning-plan/user/${user.id}`,
        planData
      );
      setLearningPlans([response.data, ...learningPlans]);
      setNewLearningPlan({
        title: "",
        description: "",
        topics: "",
        resources: "",
      });
    } catch (err) {
      setError("Failed to create learning plan");
      console.error(err);
    }
  };

  const handleCommentChange = (planId, value) => {
    setComments({
      ...comments,
      [planId]: value,
    });
  };

  const handleAddComment = async (planId) => {
    if (!comments[planId] || !comments[planId].trim()) {
      return;
    }
    try {
      const commentData = {
        userId: user.id,
        userName: user.name,
        content: comments[planId],
      };
      const response = await axios.post(
        `${API_BASE_URL}/learning-plan/${planId}/comments`,
        commentData
      );
      setLearningPlans(
        learningPlans.map((plan) => (plan.id === planId ? response.data : plan))
      );
      setComments({ ...comments, [planId]: "" });
    } catch (err) {
      setError("Failed to add comment");
      console.error(err);
    }
  };

  const handleDeleteComment = async (planId, commentId) => {
    try {
      const response = await axios.delete(
        `${API_BASE_URL}/learning-plan/${planId}/comments/${commentId}?userId=${user.id}`
      );
      setLearningPlans(
        learningPlans.map((plan) => (plan.id === planId ? response.data : plan))
      );
    } catch (err) {
      setError("Failed to delete comment");
      console.error(err);
    }
  };

  const handleUpdateComment = async (planId, commentId, currentContent) => {
    const updatedContent = prompt("Update your comment", currentContent);
    if (
      updatedContent === null ||
      updatedContent.trim() === "" ||
      updatedContent === currentContent
    )
      return;
    try {
      const updatedCommentData = {
        content: updatedContent,
      };
      const response = await axios.put(
        `${API_BASE_URL}/learning-plan/${planId}/comments/${commentId}`,
        updatedCommentData
      );

      // Update the state immediately with the updated comment
      setLearningPlans((prevPlans) =>
        prevPlans.map((plan) => {
          if (plan.id === planId) {
            return {
              ...plan,
              comments: plan.comments.map((comment) =>
                comment.id === commentId
                  ? { ...comment, content: updatedContent }
                  : comment
              ),
            };
          }
          return plan;
        })
      );
    } catch (err) {
      setError("Failed to update comment");
      console.error(err);
    }
  };

  const handleLike = async (planId) => {
    try {
      const plan = learningPlans.find((p) => p.id === planId);
      const alreadyLiked =
        plan.likes && plan.likes.some((like) => like.userId === user.id);
      let response;
      if (alreadyLiked) {
        response = await axios.delete(
          `${API_BASE_URL}/learning-plan/${planId}/likes/${user.id}`
        );
      } else {
        const likeData = {
          userId: user.id,
          userName: user.name,
        };
        response = await axios.post(
          `${API_BASE_URL}/learning-plan/${planId}/likes`,
          likeData
        );
      }
      setLearningPlans(
        learningPlans.map((plan) => (plan.id === planId ? response.data : plan))
      );
    } catch (err) {
      setError("Failed to update like");
      console.error(err);
    }
  };

  const isPlanLikedByUser = (plan) => {
    return plan.likes && plan.likes.some((like) => like.userId === user?.id);
  };

  return (
    <div className="learning-plan-page">
      <header className="page-header">
        <button className="back-button" onClick={() => navigate("/dashboard")}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            fill="currentColor"
            viewBox="0 0 16 16"
          >
            <path
              fillRule="evenodd"
              d="M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0z"
            />
          </svg>
          Back to Dashboard
        </button>
        <h1>Learning Plans</h1>
      </header>

      <div className="plan-create-section">
        <h2>Create Your Learning Plan</h2>
        <form onSubmit={handleLearningPlanSubmit} className="plan-form">
          <div className="input-group">
            <label className="input-label" htmlFor="title">
              Title
            </label>
            <input
              type="text"
              id="title"
              name="title"
              placeholder="Give your learning plan a descriptive title"
              value={newLearningPlan.title}
              onChange={handleInputChange}
              className="plan-input"
              required
            />
          </div>
          <div className="input-group">
            <label className="input-label" htmlFor="description">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              placeholder="Describe your learning plan in detail..."
              value={newLearningPlan.description}
              onChange={handleInputChange}
              className="plan-textarea"
              required
            />
          </div>
          <div className="input-group">
            <label className="input-label" htmlFor="topics">
              Topics
            </label>
            <input
              type="text"
              id="topics"
              name="topics"
              placeholder="Topics to cover (comma separated)"
              value={newLearningPlan.topics}
              onChange={handleInputChange}
              className="plan-input"
            />
          </div>
          <div className="input-group">
            <label className="input-label" htmlFor="resources">
              Resources
            </label>
            <input
              type="text"
              id="resources"
              name="resources"
              placeholder="Learning resources (books, courses, websites, etc.)"
              value={newLearningPlan.resources}
              onChange={handleInputChange}
              className="plan-input"
            />
          </div>
          <button type="submit" className="plan-button">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              fill="currentColor"
              viewBox="0 0 16 16"
            >
              <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z" />
            </svg>
            Create Learning Plan
          </button>
        </form>
      </div>

      {error && (
        <div className="error-message">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            fill="currentColor"
            viewBox="0 0 16 16"
          >
            <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z" />
            <path d="M7.002 11a1 1 0 1 1 2 0 1 1 0 0 1-2 0zM7.1 4.995a.905.905 0 1 1 1.8 0l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 4.995z" />
          </svg>
          {error}
        </div>
      )}

      <div className="learning-plans-section">
        <div className="section-header">
          <h2>Community Learning Plans</h2>
        </div>

        {loading ? (
          <div className="loading-spinner">
            <div className="spinner"></div>
            <span>Loading learning plans...</span>
          </div>
        ) : learningPlans.length === 0 ? (
          <div className="no-plans">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="48"
              height="48"
              fill="#6b7280"
              viewBox="0 0 16 16"
              style={{ marginBottom: "15px" }}
            >
              <path d="M14.5 3a.5.5 0 0 1 .5.5v9a.5.5 0 0 1-.5.5h-13a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5h13zm-13-1A1.5 1.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h13a1.5 1.5 0 0 0 1.5-1.5v-9A1.5 1.5 0 0 0 14.5 2h-13z" />
              <path d="M3 5.5a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5zM3 8a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9A.5.5 0 0 1 3 8zm0 2.5a.5.5 0 0 1 .5-.5h6a.5.5 0 0 1 0 1h-6a.5.5 0 0 1-.5-.5z" />
            </svg>
            <p>No learning plans yet. Be the first to share!</p>
          </div>
        ) : (
          <div className="learning-plans-grid">
            {learningPlans.map((plan) => (
              <div key={plan.id} className="plan-card">
                <div className="plan-header">
                  <img
                    src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
                    alt="Profile"
                    className="plan-user-icon"
                  />
                  <div className="plan-user-info">
                    <span className="plan-username">{plan.userName}</span>
                    <span className="plan-time">
                      {new Date(plan.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="plan-content-container">
                  <h3 className="plan-title">{plan.title}</h3>
                  <p className="plan-content">{plan.description}</p>
                  {(plan.topics || plan.resources) && (
                    <div className="plan-meta">
                      {plan.topics && (
                        <div className="plan-detail">
                          <strong>Topics:</strong> {plan.topics}
                        </div>
                      )}
                      {plan.resources && (
                        <div className="plan-detail">
                          <strong>Resources:</strong> {plan.resources}
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <div className="plan-actions">
                  <button
                    className={`like-button ${
                      isPlanLikedByUser(plan) ? "liked" : ""
                    }`}
                    onClick={() => handleLike(plan.id)}
                  >
                    {isPlanLikedByUser(plan) ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        fill="currentColor"
                        viewBox="0 0 16 16"
                      >
                        <path
                          fillRule="evenodd"
                          d="M8 1.314C12.438-3.248 23.534 4.735 8 15-7.534 4.736 3.562-3.248 8 1.314z"
                        />
                      </svg>
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        fill="currentColor"
                        viewBox="0 0 16 16"
                      >
                        <path d="m8 2.748-.717-.737C5.6.281 2.514.878 1.4 3.053c-.523 1.023-.641 2.5.314 4.385.92 1.815 2.834 3.989 6.286 6.357 3.452-2.368 5.365-4.542 6.286-6.357.955-1.886.838-3.362.314-4.385C13.486.878 10.4.28 8.717 2.01L8 2.748zM8 15C-7.333 4.868 3.279-3.04 7.824 1.143c.06.055.119.112.176.171a3.12 3.12 0 0 1 .176-.17C12.72-3.042 23.333 4.867 8 15z" />
                      </svg>
                    )}{" "}
                    {plan.likes?.length || 0}{" "}
                    {plan.likes?.length === 1 ? "Like" : "Likes"}
                  </button>
                </div>
                <div className="comments-section">
                  <h4>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      fill="currentColor"
                      viewBox="0 0 16 16"
                    >
                      <path d="M14 1a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H4.414A2 2 0 0 0 3 11.586l-2 2V2a1 1 0 0 1 1-1h12zM2 0a2 2 0 0 0-2 2v12.793a.5.5 0 0 0 .854.353l2.853-2.853A1 1 0 0 1 4.414 12H14a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H2z" />
                      <path d="M3 3.5a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5zM3 6a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9A.5.5 0 0 1 3 6zm0 2.5a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5z" />
                    </svg>
                    Comments ({plan.comments?.length || 0})
                  </h4>
                  <div className="add-comment">
                    <input
                      type="text"
                      placeholder="Add a comment..."
                      value={comments[plan.id] || ""}
                      onChange={(e) =>
                        handleCommentChange(plan.id, e.target.value)
                      }
                      className="comment-input"
                    />
                    <button
                      className="comment-button"
                      onClick={() => handleAddComment(plan.id)}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        fill="currentColor"
                        viewBox="0 0 16 16"
                      >
                        <path d="M15.964.686a.5.5 0 0 0-.65-.65L.767 5.855H.766l-.452.18a.5.5 0 0 0-.082.887l.41.26.001.002 4.995 3.178 3.178 4.995.002.002.26.41a.5.5 0 0 0 .886-.083l6-15Zm-1.833 1.89L6.637 10.07l-.215-.338a.5.5 0 0 0-.154-.154l-.338-.215 7.494-7.494 1.178-.471-.47 1.178Z" />
                      </svg>
                      Comment
                    </button>
                  </div>
                  <div className="comments-list">
                    {plan.comments && plan.comments.length > 0 ? (
                      plan.comments.map((comment) => (
                        <div key={comment.id} className="comment-item">
                          <p className="comment-author">
                            <span className="comment-author-name">
                              {comment.userName}:
                            </span>{" "}
                            <span className="comment-content">
                              {comment.content}
                            </span>
                          </p>
                          {comment.userId === user?.id && (
                            <div className="comment-actions">
                              <button
                                className="update-comment"
                                onClick={() =>
                                  handleUpdateComment(
                                    plan.id,
                                    comment.id,
                                    comment.content
                                  )
                                }
                                aria-label="Edit comment"
                              >
                                <Edit size={16} />
                              </button>
                              <button
                                className="delete-comment"
                                onClick={() =>
                                  handleDeleteComment(plan.id, comment.id)
                                }
                                aria-label="Delete comment"
                              >
                                <Trash size={16} />
                              </button>
                            </div>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="no-comments">
                        <p>No comments yet. Be the first to comment!</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
