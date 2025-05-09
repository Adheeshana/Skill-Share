import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaGraduationCap, FaPlus, FaTimes, FaArrowLeft, FaBook, FaCalendarAlt, FaTag, FaLink, FaLightbulb } from 'react-icons/fa';
import LearningPathService from '../services/LearningPathService';
import { useAuth } from '../utils/AuthContext';

function CreateLearningPath() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [titleError, setTitleError] = useState('');
  const [descriptionError, setDescriptionError] = useState('');
  
  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [requirements, setRequirements] = useState('');
  const [difficulty, setDifficulty] = useState('Beginner');
  const [duration, setDuration] = useState(30);  const [tags, setTags] = useState([]);
  const [currentTag, setCurrentTag] = useState('');
  const [tips, setTips] = useState('');  
  const [milestones, setMilestones] = useState([{ 
    title: '', 
    description: '', 
    orderIndex: 0,
    estimatedDays: 1,
    resources: [],
    tips: ''
  }]);
  // isPublic is now handled as a constant
  const [activeSection, setActiveSection] = useState('basic');

  // Validation function to check if string contains only numbers
  const isNumericOnly = (text) => {
    return /^\d+$/.test(text.trim());
  };

  // Handle title change with validation
  const handleTitleChange = (e) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    
    if (newTitle.trim() && isNumericOnly(newTitle)) {
      setTitleError('Title cannot contain only numbers');
    } else {
      setTitleError('');
    }
  };

  // Handle description change with validation
  const handleDescriptionChange = (e) => {
    const newDescription = e.target.value;
    setDescription(newDescription);
    
    if (newDescription.trim() && isNumericOnly(newDescription)) {
      setDescriptionError('Description cannot contain only numbers');
    } else {
      setDescriptionError('');
    }
  };

  // Handle adding a tag
  const handleAddTag = () => {
    if (currentTag.trim() && !tags.includes(currentTag.trim())) {
      setTags([...tags, currentTag.trim()]);
      setCurrentTag('');
    }
  };

  // Handle removing a tag
  const handleRemoveTag = (index) => {
    setTags(tags.filter((_, i) => i !== index));
  };

  // Handle adding a milestone
  const handleAddMilestone = () => {
    setMilestones([
      ...milestones, 
      {
        title: '',
        description: '',
        orderIndex: milestones.length,
        estimatedDays: 1,
        resources: [],
        tips: ''
      }
    ]);
  };

  // Handle removing a milestone
  const handleRemoveMilestone = (index) => {
    if (milestones.length > 1) {
      setMilestones(milestones.filter((_, i) => i !== index));
    }
  };

  // Handle updating a milestone
  const handleMilestoneChange = (index, field, value) => {
    const updatedMilestones = [...milestones];
    updatedMilestones[index][field] = value;
    setMilestones(updatedMilestones);
  };

  // Handle adding a resource to a milestone
  const handleAddResource = (index, resource) => {
    if (resource.trim()) {
      const updatedMilestones = [...milestones];
      if (!updatedMilestones[index].resources) {
        updatedMilestones[index].resources = [];
      }
      updatedMilestones[index].resources.push(resource.trim());
      setMilestones(updatedMilestones);
      
      // Clear the input field
      document.getElementById(`resource-input-${index}`).value = '';
    }
  };

  // Handle removing a resource from a milestone
  const handleRemoveResource = (milestoneIndex, resourceIndex) => {
    const updatedMilestones = [...milestones];
    updatedMilestones[milestoneIndex].resources.splice(resourceIndex, 1);
    setMilestones(updatedMilestones);
  };

  // Handle milestone reordering
  const handleMoveUp = (index) => {
    if (index > 0) {
      const updatedMilestones = [...milestones];
      [updatedMilestones[index], updatedMilestones[index-1]] = [updatedMilestones[index-1], updatedMilestones[index]];
      
      // Update order indices
      updatedMilestones.forEach((milestone, idx) => {
        milestone.orderIndex = idx;
      });
      
      setMilestones(updatedMilestones);
    }
  };

  const handleMoveDown = (index) => {
    if (index < milestones.length - 1) {
      const updatedMilestones = [...milestones];
      [updatedMilestones[index], updatedMilestones[index+1]] = [updatedMilestones[index+1], updatedMilestones[index]];
      
      // Update order indices
      updatedMilestones.forEach((milestone, idx) => {
        milestone.orderIndex = idx;
      });
      
      setMilestones(updatedMilestones);
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!title.trim() || !description.trim()) {
      setError('Title and description are required');
      return;
    }
    
    // Check if title or description contains only numbers
    if (isNumericOnly(title)) {
      setTitleError('Title cannot contain only numbers');
      setError('Please correct the errors before submitting');
      return;
    }
    
    if (isNumericOnly(description)) {
      setDescriptionError('Description cannot contain only numbers');
      setError('Please correct the errors before submitting');
      return;
    }
    
    if (milestones.some(m => !m.title.trim() || !m.description.trim())) {
      setError('All milestones must have a title and description');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
        const learningPathData = {
        title,
        description,
        requirements,
        difficulty,
        duration: parseInt(duration),
        tags,
        milestones,
        isPublic: true, // Always set to public
        tips,
        userId: currentUser.id || currentUser._id,
      };
      
      const response = await LearningPathService.createPath(learningPathData);
      navigate(`/learning-paths/${response.data.id || response.data._id}`);
      
    } catch (err) {
      console.error('Failed to create learning path:', err);
      setError('Failed to create learning path. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Get difficulty badge color
  const getDifficultyColor = (level) => {
    switch(level) {
      case 'Beginner':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Intermediate':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Advanced':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-white pt-20 pb-10 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Back navigation */}
        <div className="mb-6">
          <button 
            onClick={() => navigate('/learning-paths')}
            className="text-purple-600 hover:text-purple-800 flex items-center transition-colors group"
          >
            <FaArrowLeft className="mr-2 group-hover:transform group-hover:-translate-x-1 transition-transform" /> 
            <span className="font-medium">Back to Learning Paths</span>
          </button>
        </div>
        
        {/* Main card with navigation tabs */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden relative">
          {/* Decorative top border with gradient */}
          <div className="h-2 bg-gradient-to-r from-purple-500 via-purple-400 to-indigo-600"></div>
          
          {/* Header with icon */}
          <div className="px-6 py-6 flex flex-col md:flex-row justify-between items-center mb-2 border-b border-gray-100">
            <div className="flex items-center mb-4 md:mb-0">
              <div className="bg-gradient-to-br from-purple-500 to-indigo-600 p-3 rounded-xl shadow-md">
                <FaGraduationCap className="text-2xl text-white" />
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800 ml-4">Create Learning Path</h1>
            </div>
            
            {/* Navigation tabs */}
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={() => setActiveSection('basic')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeSection === 'basic' 
                    ? 'bg-purple-100 text-purple-700' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`
              }
              >
                Basic Info
              </button>
              <button
                type="button"
                onClick={() => setActiveSection('milestones')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeSection === 'milestones' 
                    ? 'bg-purple-100 text-purple-700' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`
              }
              >
                Milestones
              </button>
              <button
                type="button"
                onClick={() => setActiveSection('preview')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeSection === 'preview' 
                    ? 'bg-purple-100 text-purple-700' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`
              }
              >
                Preview
              </button>
            </div>
          </div>
          
          {/* Error message */}
          {error && (
            <div className="mx-6 mb-6 bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-r-lg">
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                {error}
              </div>
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            {/* Basic information section */}
            <div className={`px-6 pb-6 transition-opacity duration-300 ${activeSection === 'basic' ? 'block' : 'hidden'}`}>
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label htmlFor="title" className="block text-gray-700 font-medium mb-2 flex items-center">
                    <FaBook className="mr-2 text-purple-500" /> Title <span className="text-red-500 ml-1">*</span>
                  </label>
                  <input
                    type="text"
                    id="title"
                    className={`w-full px-4 py-3 border ${titleError ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition-all`}
                    placeholder="e.g. Learning React from Scratch"
                    value={title}
                    onChange={handleTitleChange}
                    required
                  />
                  {titleError && (
                    <p className="mt-1 text-sm text-red-500">{titleError}</p>
                  )}
                </div>
                
                <div>
                  <label htmlFor="description" className="block text-gray-700 font-medium mb-2 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                    </svg>
                    Description <span className="text-red-500 ml-1">*</span>
                  </label>
                  <textarea
                    id="description"
                    className={`w-full px-4 py-3 border ${descriptionError ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition-all h-32`}
                    placeholder="Provide a detailed description of the learning path"
                    value={description}
                    onChange={handleDescriptionChange}
                    required
                  ></textarea>
                  {descriptionError && (
                    <p className="mt-1 text-sm text-red-500">{descriptionError}</p>
                  )}
                </div>
                
                <div>
                  <label htmlFor="requirements" className="block text-gray-700 font-medium mb-2 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    Prerequisites (optional)
                  </label>
                  <textarea
                    id="requirements"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition-all h-24"
                    placeholder="List any knowledge or tools needed before starting"
                    value={requirements}
                    onChange={(e) => setRequirements(e.target.value)}
                  ></textarea>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="difficulty" className="block text-gray-700 font-medium mb-2 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      Difficulty Level
                    </label>
                    <div className="relative">
                      <select
                        id="difficulty"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-purple-400 appearance-none transition-all"
                        value={difficulty}
                        onChange={(e) => setDifficulty(e.target.value)}
                      >
                        <option value="Beginner">Beginner</option>
                        <option value="Intermediate">Intermediate</option>
                        <option value="Advanced">Advanced</option>
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                        <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd"></path>
                        </svg>
                      </div>
                    </div>
                    
                    <div className="mt-2">
                      <span className={`inline-block px-3 py-1 text-xs font-medium rounded-full ${getDifficultyColor(difficulty)} border`}>
                        {difficulty}
                      </span>
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="duration" className="block text-gray-700 font-medium mb-2 flex items-center">
                      <FaCalendarAlt className="mr-2 text-purple-500" />
                      Estimated Duration (days)
                    </label>
                    <input
                      type="number"
                      id="duration"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition-all"
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      min="1"
                    />
                    
                    <div className="mt-2 text-sm text-gray-500">
                      Approximately {Math.round(duration/7)} weeks
                    </div>
                  </div>
                </div>
                
                <div>
                  <label className="block text-gray-700 font-medium mb-2 flex items-center">
                    <FaTag className="mr-2 text-purple-500" />
                    Tags
                  </label>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {tags.map((tag, index) => (
                      <div 
                        key={index}
                        className="bg-purple-100 text-purple-800 px-3 py-1.5 rounded-full flex items-center text-sm transition-all hover:bg-purple-200"
                      >
                        #{tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(index)}
                          className="ml-2 text-purple-600 hover:text-purple-800 focus:outline-none"
                        >
                          <FaTimes />
                        </button>
                      </div>
                    ))}
                    {tags.length === 0 && (
                      <div className="text-sm text-gray-400 italic">No tags added yet</div>
                    )}
                  </div>
                  <div className="flex">
                    <input
                      type="text"
                      className="flex-grow px-4 py-3 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition-all"
                      placeholder="Add a tag..."
                      value={currentTag}
                      onChange={(e) => setCurrentTag(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                    />
                    <button
                      type="button"
                      className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-4 py-3 rounded-r-lg hover:from-purple-700 hover:to-purple-800 transition-all"
                      onClick={handleAddTag}
                    >
                      Add
                    </button>
                  </div>
                  <div className="mt-2 text-sm text-gray-500">
                    Tags help others find your learning path (e.g. javascript, webdev, design)
                  </div>
                </div>
                
                <div>
                  <label htmlFor="tips" className="block text-gray-700 font-medium mb-2 flex items-center">
                    <FaLightbulb className="mr-2 text-purple-500" />
                    Tips for Success (optional)
                  </label>
                  <textarea
                    id="tips"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition-all h-24"
                    placeholder="Share advice to help others succeed with this learning path"
                    value={tips}
                    onChange={(e) => setTips(e.target.value)}
                  ></textarea>
                </div>
                  {/* Public/Private toggle removed */}
                
                <div className="flex justify-between pt-4">
                  <button
                    type="button"
                    onClick={() => navigate('/learning-paths')}
                    className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (!title.trim()) {
                        setError('Please enter a title for your learning path');
                        document.getElementById('title').focus();
                        return;
                      }
                      if (!description.trim()) {
                        setError('Please enter a description for your learning path');
                        document.getElementById('description').focus();
                        return;
                      }
                      setError('');
                      setActiveSection('milestones');
                    }}
                    className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg shadow hover:from-purple-700 hover:to-purple-800 transition-all hover:shadow-md flex items-center"
                  >
                    Next: Add Milestones
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
            
            {/* Milestones section */}
            <div className={`px-6 pb-6 transition-opacity duration-300 ${activeSection === 'milestones' ? 'block' : 'hidden'}`}>
              <div className="mb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                      </svg>
                      Milestones
                      <span className="ml-2 text-sm text-gray-500 font-normal">({milestones.length})</span>
                    </h2>
                    <p className="text-sm text-gray-500 mt-1 ml-8">Break down your learning path into steps</p>
                  </div>
                  
                  <button
                    type="button"
                    onClick={() => {
                      // Check if the last milestone has empty required fields
                      const lastIndex = milestones.length - 1;
                      const lastMilestone = milestones[lastIndex];
                      
                      if (!lastMilestone.title.trim() || !lastMilestone.description.trim()) {
                        setError('Please fill in the title and description of the current milestone before adding a new one');
                        
                        // Scroll to the last milestone to show the user where the problem is
                        const milestoneElement = document.getElementById(`milestone-title-${lastIndex}`);
                        if (milestoneElement) {
                          milestoneElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                          milestoneElement.focus();
                        }
                        return;
                      }
                      
                      setError('');
                      handleAddMilestone();
                    }}
                    className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-4 py-2 rounded-lg shadow hover:from-purple-700 hover:to-purple-800 transition-all hover:shadow-md flex items-center"
                  >
                    <FaPlus className="mr-2" /> Add Milestone
                  </button>
                </div>
              </div>
              
              <div className="space-y-6">
                {milestones.map((milestone, index) => (
                  <div 
                    key={index} 
                    className="border border-gray-200 rounded-xl overflow-hidden transition-all hover:shadow-md group"
                  >
                    <div className={`py-4 px-5 flex justify-between items-center bg-gradient-to-r ${
                      index === 0 ? 'from-purple-500/10 to-purple-600/5' : 
                      index % 2 === 0 ? 'from-blue-500/10 to-blue-600/5' : 
                      'from-indigo-500/10 to-indigo-600/5'
                    }`}>
                      <h3 className="font-medium text-gray-800 flex items-center">
                        <div className={`h-7 w-7 rounded-full flex items-center justify-center mr-2 text-sm font-bold ${
                          index === 0 ? 'bg-purple-100 text-purple-600' : 
                          index % 2 === 0 ? 'bg-blue-100 text-blue-600' : 
                          'bg-indigo-100 text-indigo-600'
                        }`}>
                          {index + 1}
                        </div>
                        {milestone.title ? (
                          <span>{milestone.title}</span>
                        ) : (
                          <span className="text-gray-400 italic">Untitled Milestone</span>
                        )}
                      </h3>
                      
                      <div className="flex items-center space-x-1">
                        {index > 0 && (
                          <button
                            type="button"
                            onClick={() => handleMoveUp(index)}
                            className="p-1.5 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded-md transition-colors"
                            title="Move up"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                            </svg>
                          </button>
                        )}
                        
                        {index < milestones.length - 1 && (
                          <button
                            type="button"
                            onClick={() => handleMoveDown(index)}
                            className="p-1.5 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded-md transition-colors"
                            title="Move down"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </button>
                        )}
                        
                        {milestones.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveMilestone(index)}
                            className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                            title="Remove milestone"
                          >
                            <FaTimes />
                          </button>
                        )}
                      </div>
                    </div>
                    
                    <div className="p-5 bg-white">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <label htmlFor={`milestone-title-${index}`} className="block text-gray-700 text-sm font-medium mb-1">
                            Title <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            id={`milestone-title-${index}`}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition-all"
                            placeholder={`Milestone ${index + 1} title`}
                            value={milestone.title}
                            onChange={(e) => handleMilestoneChange(index, 'title', e.target.value)}
                            required
                          />
                        </div>
                        
                        <div>
                          <label htmlFor={`milestone-days-${index}`} className="block text-gray-700 text-sm font-medium mb-1">
                            Estimated Days
                          </label>
                          <input
                            type="number"
                            id={`milestone-days-${index}`}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition-all"
                            value={milestone.estimatedDays || 1}
                            onChange={(e) => handleMilestoneChange(index, 'estimatedDays', parseInt(e.target.value))}
                            min="1"
                          />
                        </div>
                      </div>
                      
                      <div className="mb-4">
                        <label htmlFor={`milestone-description-${index}`} className="block text-gray-700 text-sm font-medium mb-1">
                          Description <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          id={`milestone-description-${index}`}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition-all h-24"
                          placeholder="What should be learned in this milestone"
                          value={milestone.description}
                          onChange={(e) => handleMilestoneChange(index, 'description', e.target.value)}
                          required
                        ></textarea>
                      </div>
                      
                      <div className="mb-4">
                        <label htmlFor={`milestone-tips-${index}`} className="block text-gray-700 text-sm font-medium mb-1 flex items-center">
                          <FaLightbulb className="mr-1 text-yellow-500" /> Tips (optional)
                        </label>
                        <textarea
                          id={`milestone-tips-${index}`}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition-all h-20"
                          placeholder="Helpful suggestions for completing this milestone"
                          value={milestone.tips || ''}
                          onChange={(e) => handleMilestoneChange(index, 'tips', e.target.value)}
                        ></textarea>
                      </div>
                      
                      <div>
                        <label className="block text-gray-700 text-sm font-medium mb-2 flex items-center">
                          <FaLink className="mr-1 text-blue-500" /> Resources (optional)
                        </label>
                        <div className="mb-2 space-y-2">
                          {milestone.resources && milestone.resources.length > 0 ? (
                            milestone.resources.map((resource, resourceIndex) => (
                              <div key={resourceIndex} className="flex items-center">
                                <span className="flex-grow bg-gray-50 px-3 py-2 border border-gray-300 rounded-lg text-sm">{resource}</span>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveResource(index, resourceIndex)}
                                  className="ml-2 p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
                                  aria-label="Remove resource"
                                >
                                  <FaTimes />
                                </button>
                              </div>
                            ))
                          ) : (
                            <div className="text-sm text-gray-400 italic">No resources added yet</div>
                          )}
                        </div>
                        <div className="flex">
                          <input
                            type="text"
                            id={`resource-input-${index}`}
                            className="flex-grow px-3 py-2 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition-all"
                            placeholder="Add a book, article, video or URL..."
                            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddResource(index, e.target.value))}
                          />
                          <button
                            type="button"
                            className="bg-blue-600 text-white px-3 py-2 rounded-r-lg hover:bg-blue-700 transition-colors"
                            onClick={() => handleAddResource(index, document.getElementById(`resource-input-${index}`).value)}
                          >
                            Add
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="flex justify-between mt-8">
                <button
                  type="button"
                  onClick={() => setActiveSection('basic')}
                  className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => {
                    // Validate that all milestones have title and description
                    const emptyMilestone = milestones.find(m => !m.title.trim() || !m.description.trim());
                    
                    if (emptyMilestone) {
                      setError('All milestones must have a title and description before previewing');
                      
                      // Find the index of the first empty milestone
                      const emptyIndex = milestones.findIndex(m => !m.title.trim() || !m.description.trim());
                      if (emptyIndex >= 0) {
                        // Focus on the empty milestone's title input
                        const milestoneElement = document.getElementById(`milestone-title-${emptyIndex}`);
                        if (milestoneElement) {
                          milestoneElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                          milestoneElement.focus();
                        }
                      }
                      return;
                    }
                    
                    setError('');
                    setActiveSection('preview');
                  }}
                  className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg shadow hover:from-purple-700 hover:to-purple-800 transition-all hover:shadow-md flex items-center"
                >
                  Preview
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </button>
              </div>
            </div>
            
            {/* Preview section */}
            <div className={`px-6 pb-6 transition-opacity duration-300 ${activeSection === 'preview' ? 'block' : 'hidden'}`}>
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Preview Your Learning Path
                </h2>
                <p className="text-sm text-gray-500 mt-1 ml-8">
                  Review all the details of your learning path before publishing
                </p>
              </div>
              
              <div className="bg-white rounded-xl shadow-md p-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">{title}</h3>
                
                <div className="mb-4">
                  <h4 className="text-md font-semibold text-gray-700 mb-2">Description</h4>
                  <p className="text-gray-600">{description}</p>
                </div>
                
                <div className="mb-4">
                  <h4 className="text-md font-semibold text-gray-700 mb-2">Details</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-gray-600">
                    <div>
                      <span className="font-medium text-gray-700">Duration:</span> {duration} days
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Difficulty:</span> {difficulty}
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Tags:</span> {tags.length > 0 ? tags.join(', ') : 'None'}
                    </div>                    <div>
                      <span className="font-medium text-gray-700">Public:</span> 
                      <span className="ml-1 px-2 py-0.5 rounded text-xs bg-green-100 text-green-800">
                        Yes
                      </span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-md font-semibold text-gray-700 mb-2">Milestones</h4>
                  <div className="space-y-4">
                    {milestones.map((milestone, index) => (
                      <div key={index} className="p-4 border border-gray-200 rounded-lg shadow-sm">
                        <div className="flex justify-between items-center mb-2">
                          <h5 className="font-medium text-gray-800">{milestone.title || `Milestone ${index + 1}`}</h5>
                          <div className="text-xs font-semibold rounded-full" style={{ paddingLeft: '0.5rem', paddingRight: '0.5rem', paddingTop: '0.125rem', paddingBottom: '0.125rem', backgroundColor: getDifficultyColor(milestone.difficulty || difficulty), color: 'inherit' }}>
                            {milestone.difficulty || difficulty}
                          </div>
                        </div>
                        <p className="text-gray-600 mb-2">{milestone.description}</p>
                        <div className="flex flex-wrap gap-2">
                          {milestone.resources && milestone.resources.length > 0 && (
                            <div className="w-full mb-2">
                              <span className="text-sm font-medium text-gray-700 mr-2">Resources:</span>
                              <div className="flex flex-wrap gap-2">
                                {milestone.resources.map((resource, resourceIndex) => (
                                  <span key={resourceIndex} className="bg-gray-100 text-gray-800 px-3 py-1.5 rounded-full text-xs">
                                    {resource}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {milestone.tips && (
                            <div className="w-full">
                              <span className="text-sm font-medium text-gray-700 mr-2">Tips:</span>
                              <p className="text-gray-600 text-sm italic">{milestone.tips}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={() => setActiveSection('milestones')}
                  className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Back to Milestones
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg shadow hover:from-purple-700 hover:to-purple-800 transition-all flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12h18M12 5l7 7-7 7" />
                  </svg>
                  Publish Learning Path
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default CreateLearningPath;