import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Trash, Edit, Save, X } from "lucide-react";
import "./LearningProgressPosts.css";

const API_BASE_URL = "http://localhost:8080/api";

export default function LearningProgressPosts() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [progressEntries, setProgressEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newProgressEntry, setNewProgressEntry] = useState({
    title: "",
    description: "",
  });
  const [comments, setComments] = useState({});
  const [editingComment, setEditingComment] = useState(null);
  const [editCommentContent, setEditCommentContent] = useState("");

  useEffect(() => {
    const storedUser = localStorage.getItem("loggedUser");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      navigate("/login");
    }
    fetchProgressEntries();
  }, [navigate]);

  const fetchProgressEntries = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/learning-progress`);
      setProgressEntries(response.data);
    } catch (err) {
      setError("Failed to fetch learning progress entries");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewProgressEntry({
      ...newProgressEntry,
      [name]: value,
    });
  };

  const handleProgressSubmit = async (e) => {
    e.preventDefault();
    if (
      !newProgressEntry.title.trim() ||
      !newProgressEntry.description.trim()
    ) {
      alert("Please add a title and description");
      return;
    }
    try {
      const progressData = {
        userId: user.id,
        userName: user.name,
        title: newProgressEntry.title,
        description: newProgressEntry.description,
      };
      const response = await axios.post(
        `${API_BASE_URL}/learning-progress/user/${user.id}`,
        progressData
      );
      setProgressEntries([response.data, ...progressEntries]);
      setNewProgressEntry({ title: "", description: "" });
    } catch (err) {
      setError("Failed to create learning progress entry");
      console.error(err);
    }
  };

  const handleCommentChange = (entryId, value) => {
    setComments({ ...comments, [entryId]: value });
  };

  const handleAddComment = async (entryId) => {
    if (!comments[entryId] || !comments[entryId].trim()) return;
    try {
      const commentData = {
        userId: user.id,
        userName: user.name,
        content: comments[entryId],
      };
      const response = await axios.post(
        `${API_BASE_URL}/learning-progress/${entryId}/comments`,
        commentData
      );
      setProgressEntries(
        progressEntries.map((entry) =>
          entry.id === entryId ? response.data : entry
        )
      );
      setComments({ ...comments, [entryId]: "" });
    } catch (err) {
      setError("Failed to add comment");
      console.error(err);
    }
  };

  const handleDeleteComment = async (entryId, commentId) => {
    try {
      const response = await axios.delete(
        `${API_BASE_URL}/learning-progress/${entryId}/comments/${commentId}?userId=${user.id}`
      );
      setProgressEntries(
        progressEntries.map((entry) =>
          entry.id === entryId ? response.data : entry
        )
      );
    } catch (err) {
      setError("Failed to delete comment");
      console.error(err);
    }
  };

  const startEditingComment = (entryId, commentId, currentContent) => {
    setEditingComment({ entryId, commentId });
    setEditCommentContent(currentContent);
  };

  const handleUpdateComment = async (entryId, commentId) => {
    if (!editCommentContent.trim()) {
      setEditingComment(null);
      return;
    }

    // Find the original comment to check if content actually changed
    const entry = progressEntries.find((entry) => entry.id === entryId);
    const comment = entry?.comments.find((comment) => comment.id === commentId);

    if (comment && editCommentContent === comment.content) {
      setEditingComment(null);
      return;
    }

    try {
      const updatedCommentData = { content: editCommentContent };
      const response = await axios.put(
        `${API_BASE_URL}/learning-progress/${entryId}/comments/${commentId}`,
        updatedCommentData
      );

      // Create a new array with the updated comment
      const updatedEntries = progressEntries.map((entry) => {
        if (entry.id !== entryId) return entry;

        return {
          ...entry,
          comments: entry.comments.map((comment) => {
            if (comment.id !== commentId) return comment;
            return {
              ...comment,
              content: editCommentContent, // Use the local state value
            };
          }),
        };
      });

      // Update state with new array
      setProgressEntries(updatedEntries);
      setEditingComment(null);
      setEditCommentContent("");
    } catch (err) {
      setError("Failed to update comment");
      console.error(err);
    }
  };

  const cancelEditingComment = () => {
    setEditingComment(null);
    setEditCommentContent("");
  };

  const handleLike = async (entryId) => {
    try {
      const entry = progressEntries.find((e) => e.id === entryId);
      const alreadyLiked =
        entry.likes && entry.likes.some((like) => like.userId === user.id);
      let response;
      if (alreadyLiked) {
        response = await axios.delete(
          `${API_BASE_URL}/learning-progress/${entryId}/likes/${user.id}`
        );
      } else {
        const likeData = { userId: user.id, userName: user.name };
        response = await axios.post(
          `${API_BASE_URL}/learning-progress/${entryId}/likes`,
          likeData
        );
      }
      setProgressEntries(
        progressEntries.map((entry) =>
          entry.id === entryId ? response.data : entry
        )
      );
    } catch (err) {
      setError("Failed to update like");
      console.error(err);
    }
  };

  const isEntryLikedByUser = (entry) =>
    entry.likes && entry.likes.some((like) => like.userId === user?.id);

  return (
    <div className="learning-progress-page-b">
      <header className="page-header-b">
        <button className="back-button-b" onClick={() => navigate("/dashboard")}>
          ← Back to Dashboard
        </button>
        <h1>Learning Progress</h1>
      </header>

      <div className="progress-create-section-b">
        <h2>Share Your Progress</h2>
        <form onSubmit={handleProgressSubmit} className="progress-form-b">
          <div className="form-group-b">
            <input
              type="text"
              name="title"
              placeholder="Progress Title"
              value={newProgressEntry.title}
              onChange={handleInputChange}
              className="progress-input-b"
              required
            />
          </div>
          <div className="form-group-b">
            <textarea
              name="description"
              placeholder="What have you learned?"
              value={newProgressEntry.description}
              onChange={handleInputChange}
              className="progress-textarea-b"
              required
            />
          </div>
          <button type="submit" className="progress-button-b">
            Share
          </button>
        </form>
      </div>

      {error && <div className="error-message-b">{error}</div>}

      <div className="progress-entries-section-b">
        <h2>Community Updates</h2>
        {loading && <div className="loading-spinner-b">Loading...</div>}
        {progressEntries.length === 0 && !loading ? (
          <div className="no-entries-b">
            No progress entries yet. Start sharing!
          </div>
        ) : (
          <div className="progress-entries-grid-b">
            {progressEntries.map((entry) => (
              <div key={entry.id} className="progress-card-b">
                <div className="progress-header-b">
                  <img
                    src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
                    alt="Profile"
                    className="progress-user-icon-b"
                  />
                  <div className="progress-user-info-b">
                    <span className="progress-username-b">{entry.userName}</span>
                    <span className="progress-time-b">
                      {new Date(entry.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <h3 className="progress-title-b">{entry.title}</h3>
                <p className="progress-content-b">{entry.description}</p>
                {entry.skillArea && (
                  <div className="progress-detail-b">
                    <strong>Skill:</strong> {entry.skillArea}
                  </div>
                )}
                {entry.learningResources && (
                  <div className="progress-detail-b">
                    <strong>Resources:</strong> {entry.learningResources}
                  </div>
                )}
                {entry.challengesFaced && (
                  <div className="progress-detail-b">
                    <strong>Challenges:</strong> {entry.challengesFaced}
                  </div>
                )}
                {entry.nextSteps && (
                  <div className="progress-detail-b">
                    <strong>Next:</strong> {entry.nextSteps}
                  </div>
                )}
                <div className="progress-actions-b">
                  <button
                    className={`like-button-b ${
                      isEntryLikedByUser(entry) ? "liked" : ""
                    }`}
                    onClick={() => handleLike(entry.id)}
                  >
                    <span className="like-icon-b">
                      {isEntryLikedByUser(entry) ? "❤️" : "🤍"}
                    </span>
                    <span>{entry.likes?.length || 0}</span>
                  </button>
                </div>
                <div className="comments-section-b">
                  <h4>Comments ({entry.comments?.length || 0})</h4>
                  <div className="add-comment-b">
                    <input
                      type="text"
                      placeholder="Add a comment..."
                      value={comments[entry.id] || ""}
                      onChange={(e) =>
                        handleCommentChange(entry.id, e.target.value)
                      }
                      className="comment-input-b"
                    />
                    <button
                      className="comment-button-b"
                      onClick={() => handleAddComment(entry.id)}
                    >
                      Comment
                    </button>
                  </div>
                  <div className="comments-list-b">
                    {entry.comments &&
                      entry.comments.map((comment) => (
                        <div key={comment.id} className="comment-item-b">
                          {editingComment &&
                          editingComment.entryId === entry.id &&
                          editingComment.commentId === comment.id ? (
                            <div className="edit-comment-b">
                              <textarea
                                value={editCommentContent}
                                onChange={(e) =>
                                  setEditCommentContent(e.target.value)
                                }
                                className="edit-comment-textarea-b"
                                placeholder="Edit your comment..."
                              />
                              <div className="edit-comment-actions-b">
                                <button
                                  className="save-comment-b"
                                  onClick={() =>
                                    handleUpdateComment(entry.id, comment.id)
                                  }
                                  aria-label="Save comment"
                                >
                                  <Save size={16} />
                                </button>
                                <button
                                  className="cancel-comment-b"
                                  onClick={cancelEditingComment}
                                  aria-label="Cancel editing"
                                >
                                  <X size={16} />
                                </button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <p className="comment-author-b">
                                {comment.userName}:{" "}
                                <span className="comment-content-b">
                                  {comment.content}
                                </span>
                              </p>
                              {comment.userId === user?.id && (
                                <div className="comment-actions-b">
                                  <button
                                    className="delete-comment-b"
                                    onClick={() =>
                                      handleDeleteComment(entry.id, comment.id)
                                    }
                                    aria-label="Delete comment"
                                  >
                                    <Trash size={16} />
                                  </button>
                                  <button
                                    className="update-comment-b"
                                    onClick={() =>
                                      startEditingComment(
                                        entry.id,
                                        comment.id,
                                        comment.content
                                      )
                                    }
                                    aria-label="Edit comment"
                                  >
                                    <Edit size={16} />
                                  </button>
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      ))}
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
