import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiUpload, FiX, FiPlus, FiMinus } from 'react-icons/fi';
import './SubmitAgent.css';

export default function SubmitAgent() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    price: '',
    tags: [],
    image: null,
    imagePreview: null
  });
  const [newTag, setNewTag] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const categories = [
    'AI Assistant',
    'Data Analysis',
    'Content Creation',
    'Customer Support',
    'Developer Tools',
    'Gaming',
    'Productivity',
    'Education',
    'Other'
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          image: file,
          imagePreview: reader.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Basic validation
    if (!formData.name.trim() || !formData.description.trim() || !formData.category) {
      setError('Please fill in all required fields');
      return;
    }

    if (formData.tags.length === 0) {
      setError('Please add at least one tag');
      return;
    }

    setIsSubmitting(true);

    try {
      // Here you would typically send the data to your backend
      console.log('Submitting agent:', formData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Navigate to agents list or show success message
      navigate('/agents');
    } catch (err) {
      console.error('Error submitting agent:', err);
      setError('Failed to submit agent. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="submit-agent-container">
      <div className="submit-agent-card">
        <h1 className="form-title">Submit New Agent</h1>
        <p className="form-subtitle">Fill in the details below to submit your AI agent to the marketplace</p>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit} className="agent-form">
          <div className="form-group">
            <label htmlFor="name">Agent Name *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Enter agent name"
              className="form-input"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="description">Description *</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Describe what your agent does"
              className="form-textarea"
              rows="4"
              required
            />
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="category">Category *</label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="form-select"
                required
              >
                <option value="">Select a category</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
            
            <div className="form-group">
              <label htmlFor="price">Price (ALGO)</label>
              <div className="price-input-container">
                <input
                  type="number"
                  id="price"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  placeholder="0.00"
                  min="0"
                  step="0.1"
                  className="form-input"
                />
                <span className="price-suffix">ALGO</span>
              </div>
              <p className="helper-text">Set to 0 for free agents</p>
            </div>
          </div>
          
          <div className="form-group">
            <label>Tags *</label>
            <div className="tags-input-container">
              <div className="tags-list">
                {formData.tags.map(tag => (
                  <span key={tag} className="tag">
                    {tag}
                    <button 
                      type="button" 
                      onClick={() => handleRemoveTag(tag)}
                      className="remove-tag"
                      aria-label={`Remove ${tag} tag`}
                    >
                      <FiX size={14} />
                    </button>
                  </span>
                ))}
                <div className="add-tag-input">
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                    placeholder="Add a tag"
                    className="tag-input"
                  />
                  <button 
                    type="button" 
                    onClick={handleAddTag}
                    className="add-tag-button"
                    disabled={!newTag.trim()}
                    aria-label="Add tag"
                  >
                    <FiPlus size={18} />
                  </button>
                </div>
              </div>
              <p className="helper-text">Press Enter or click + to add a tag</p>
            </div>
          </div>
          
          <div className="form-group">
            <label>Agent Image</label>
            <div className="image-upload-container">
              {formData.imagePreview ? (
                <div className="image-preview">
                  <img src={formData.imagePreview} alt="Preview" />
                  <button 
                    type="button" 
                    onClick={() => setFormData(prev => ({ ...prev, image: null, imagePreview: null }))}
                    className="remove-image"
                    aria-label="Remove image"
                  >
                    <FiX size={18} />
                  </button>
                </div>
              ) : (
                <label className="image-upload">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="file-input"
                  />
                  <div className="upload-content">
                    <FiUpload size={32} className="upload-icon" />
                    <p>Click to upload an image</p>
                    <p className="helper-text">Recommended: 800×400px, JPG or PNG</p>
                  </div>
                </label>
              )}
            </div>
          </div>
          
          <div className="form-actions">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="cancel-button"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="submit-button"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Agent'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
