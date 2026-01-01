import React, { useState, useEffect } from 'react';
import { Share2, TrendingUp, AlertCircle, Star, MessageCircle, Send, Shield, Trash2, Search } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = 'https://vtnzsyrojybyfeenkave.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ0bnpzeXJvanlieWZlZW5rYXZlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY3OTg1ODEsImV4cCI6MjA4MjM3NDU4MX0.6W9ueperYZpiIsLmBzNgJ9-wxPrwJ-mkhdDe2VGbKxU';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

console.log('🔧 HowWas App loaded with Supabase!');

export default function HowWas() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [adminKeywords, setAdminKeywords] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [loading, setLoading] = useState(true);

  // Change from hardcoded array to empty array - will load from Supabase
  const [experiences, setExperiences] = useState([]);
  const [userCountry, setUserCountry] = useState('');
  const [userCountryName, setUserCountryName] = useState('');

  // Load experiences from Supabase on component mount
  useEffect(() => {
    loadExperiences();
  }, []);

  // Function to load experiences from Supabase
  const loadExperiences = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('experiences')
        .select('*')
        .order('id', { ascending: false });
      
      if (error) throw error;
      
      // Transform database format to app format
      const transformedData = data.map(exp => ({
        id: exp.id,
        problem: exp.problem,
        problemCategory: exp.problem_category,
        solution: exp.solution,
        result: exp.result,
        resultCategory: exp.result_category,
        author: exp.author || '',
        gender: exp.gender || '',
        age: exp.age || '',
        avgRating: exp.avg_rating || 0,
        totalRatings: exp.total_ratings || 0,
        comments: [] // Comments can be added later
      }));
      
      setExperiences(transformedData);
    } catch (error) {
      console.error('Error loading experiences:', error);
      alert('Error loading data. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  };

  // Function to add new experience to Supabase
  const addExperienceToSupabase = async (newExperience) => {
    console.log('🚀 Starting to save experience...');
    console.log('📝 Experience data:', newExperience);
    
    try {
      console.log('📡 Sending to Supabase...');
      
      const { data, error } = await supabase
        .from('experiences')
        .insert([
          {
            problem: newExperience.problem,
            problem_category: newExperience.problemCategory,
            solution: newExperience.solution,
            result: newExperience.result,
            result_category: newExperience.resultCategory,
            author: newExperience.author || '',
            gender: newExperience.gender || '',
            age: newExperience.age || '',
            avg_rating: 0,
            total_ratings: 0
          }
        ])
        .select();
      
      console.log('📊 Supabase response - data:', data);
      console.log('📊 Supabase response - error:', error);
      
      if (error) {
        console.error('❌ Supabase error:', error);
        throw error;
      }
      
      console.log('✅ Experience saved successfully!');
      
      // Reload experiences to get the new one with its ID
      console.log('🔄 Reloading all experiences...');
      await loadExperiences();
      
      console.log('✅ All done!');
      return true;
    } catch (error) {
      console.error('❌ Error adding experience:', error);
      console.error('❌ Error details:', error.message, error.code);
      alert('Error saving experience. Please check console for details.');
      return false;
    }
  };

  // Function to delete experience from Supabase
  const deleteExperienceFromSupabase = async (id) => {
    try {
      const { error } = await supabase
        .from('experiences')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      // Reload experiences
      await loadExperiences();
      
      return true;
    } catch (error) {
      console.error('Error deleting experience:', error);
      alert('Error deleting experience. Please try again.');
      return false;
    }
  };


  const [currentEntry, setCurrentEntry] = useState({
    problem: '',
    problemCategory: '',
    solution: '',
    result: '',
    resultCategory: '',
    author: '',
    gender: '',
    age: '',
  });

  const [filters, setFilters] = useState({
    problemCategory: '',
    searchText: '',
    resultCategory: '',
    rating: '',
    gender: '',
    age: ''
  });

  const [userRatings, setUserRatings] = useState({});
  const [hoverRating, setHoverRating] = useState({});
  const [newComment, setNewComment] = useState({});
  const [showComments, setShowComments] = useState({});

  const maxChars = {
    problem: 300,
    solution: 300,
    result: 200,
    comment: 500
  };

  const problemCategories = ['Health', 'Work', 'Relationship', 'Finance', 'Family', 'Education', 'Well-being', 'Other'];
  
  const genderOptions = ['Male', 'Female', 'Other'];
  const ageOptions = ['0-20', '21-40', '41-60', '61-Up'];
  
  const resultCategories = [
    { value: 'worked', label: 'Worked', color: 'bg-green-100 text-green-800' },
    { value: 'no-change', label: 'No Change', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'got-worse', label: 'Got Worse', color: 'bg-red-100 text-red-800' }
  ];

  const handleSubmit = async () => {
    if (currentEntry.problem && currentEntry.problemCategory && 
        currentEntry.solution && currentEntry.result && currentEntry.resultCategory) {
      
      // Save to Supabase
      await addExperienceToSupabase(currentEntry);
      
      // Clear form
      setCurrentEntry({
        problem: '',
        problemCategory: '',
        solution: '',
        result: '',
        resultCategory: '',
        author: '',
        gender: '',
        age: '',
      });
    }
  };
  const handleUserRating = async (expId, rating) => {
    try {
      // Save user's rating locally
      setUserRatings({...userRatings, [expId]: rating});
      
      // Find the experience
      const exp = experiences.find(e => e.id === expId);
      if (!exp) return;
      
      // Calculate new average
      const newTotalRatings = exp.totalRatings + 1;
      const newAvgRating = ((exp.avgRating * exp.totalRatings) + rating) / newTotalRatings;
      
      // Update in Supabase
      const { error } = await supabase
        .from('experiences')
        .update({ 
          avg_rating: newAvgRating,
          total_ratings: newTotalRatings
        })
        .eq('id', expId);
      
      if (error) {
        console.error('❌ Error saving rating:', error);
        return;
      }
      
      console.log('⭐ Rating saved successfully!');
      
      // Reload experiences to show updated rating
      await loadExperiences();
      
    } catch (error) {
      console.error('❌ Error in handleUserRating:', error);
    }
  };

  const handleAdminLogin = () => {
    if (adminPassword === 'admin123') {
      setIsAdmin(true);
      setShowAdminLogin(false);
    } else {
      alert('Incorrect password');
    }
  };

  const handleDelete = (expId) => {
    // Check if this item is already in confirm mode
    if (confirmDelete === `exp-${expId}`) {
      // Second click - actually delete
      setExperiences(experiences.filter(e => e.id !== expId));
      setConfirmDelete(null); // Reset confirm state
    } else {
      // First click - enter confirm mode
      setConfirmDelete(`exp-${expId}`);
    }
  };

  const handleDeleteComment = (expId, commentId) => {
    const confirmKey = `comment-${expId}-${commentId}`;
    
    // Check if this item is already in confirm mode
    if (confirmDelete === confirmKey) {
      // Second click - actually delete
      setExperiences(experiences.map(exp => {
        if (exp.id === expId) {
          return { ...exp, comments: exp.comments.filter(c => c.id !== commentId) };
        }
        return exp;
      }));
      setConfirmDelete(null); // Reset confirm state
    } else {
      // First click - enter confirm mode
      setConfirmDelete(confirmKey);
    }
  };

  const getKeywordMatches = () => {
    if (!adminKeywords.trim()) return [];
    
    const keywords = adminKeywords.toLowerCase().split(',').map(k => k.trim()).filter(k => k);
    const matches = [];

    experiences.forEach(exp => {
      const searchText = `${exp.problem} ${exp.solution} ${exp.result}`.toLowerCase();
      
      keywords.forEach(keyword => {
        if (searchText.includes(keyword)) {
          matches.push({
            type: 'experience',
            expId: exp.id,
            keyword: keyword,
            text: `Problem: ${exp.problem}. Solution: ${exp.solution}. Result: ${exp.result}`
          });
        }
      });

      exp.comments.forEach(comment => {
        keywords.forEach(keyword => {
          if (comment.text.toLowerCase().includes(keyword)) {
            matches.push({
              type: 'comment',
              expId: exp.id,
              commentId: comment.id,
              keyword: keyword,
              text: comment.text,
              author: comment.author
            });
          }
        });
      });
    });

    return matches;
  };

  const handleAddComment = (expId) => {
    const commentText = newComment[expId];
    if (!commentText || !commentText.trim()) return;

    const updatedExperiences = experiences.map(exp => {
      if (exp.id === expId) {
        const newCommentObj = {
          id: Date.now(),
          author: '',
          text: commentText.trim(),
          timestamp: 'Just now'
        };
        return {
          ...exp,
          comments: []
        };
      }
      return exp;
    });

    setExperiences(updatedExperiences);
    setNewComment({...newComment, [expId]: ''});
  };

  const getResultColor = (category) => resultCategories.find(r => r.value === category)?.color || '';
  const getResultLabel = (category) => resultCategories.find(r => r.value === category)?.label || '';

  const filteredExperiences = experiences.filter(exp => {
    const matchesProblemCategory = !filters.problemCategory || exp.problemCategory === filters.problemCategory;
    const searchTerms = filters.searchText.toLowerCase().trim().split(/\s+/);
    const matchesSearchText = !filters.searchText || searchTerms.every(term => 
      exp.problem.toLowerCase().includes(term) ||
      exp.solution.toLowerCase().includes(term) ||
      exp.result.toLowerCase().includes(term) ||
      (exp.author && exp.author.toLowerCase().includes(term))
    );
    const matchesResultCategory = !filters.resultCategory || exp.resultCategory === filters.resultCategory;
    const roundedRating = Math.round(exp.avgRating);
    const matchesRating = !filters.rating || roundedRating === parseInt(filters.rating);
    const matchesGender = !filters.gender || exp.gender === filters.gender;
    const matchesAge = !filters.age || exp.age === filters.age;
    
    return matchesProblemCategory && matchesSearchText && matchesResultCategory && matchesRating && matchesGender && matchesAge;
  });

  const ratingStats = [1, 2, 3, 4, 5].map(stars => ({
    stars,
    count: experiences.filter(exp => Math.round(exp.avgRating) === stars).length
  }));

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading experiences...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex-1"></div>
            <h1 className="text-4xl font-bold text-gray-800 mb-2 flex items-center justify-center gap-3">
              <Share2 className="text-purple-600" size={36} />
              HowWas
            </h1>
            <div className="flex-1 flex justify-end">
              {!isAdmin ? (
                <button
                  onClick={() => setShowAdminLogin(!showAdminLogin)}
                  className="text-sm text-gray-500 hover:text-purple-600 flex items-center gap-2"
                >
                  <Shield size={16} />
                  Admin
                </button>
              ) : (
                <div className="flex items-center gap-2 text-sm text-purple-600">
                  <Shield size={16} />
                  <span>Admin Mode</span>
                  <button
                    onClick={() => { setIsAdmin(false); setAdminKeywords(''); }}
                    className="text-xs text-gray-500 hover:text-red-600"
                  >
                    (Logout)
                  </button>
                </div>
              )}
            </div>
          </div>
          <p className="text-gray-700 font-medium mb-1">Real problems. Real solutions. Real people.</p>
          <p className="text-gray-600">Share your experience, help someone else</p>

          {/* Admin Login */}
          {showAdminLogin && !isAdmin && (
            <div className="mt-4 bg-white rounded-lg shadow-md p-4 max-w-md mx-auto">
              <h3 className="font-semibold mb-2">Admin Login</h3>
              <input
                type="password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                placeholder="Password"
                className="w-full p-2 border-2 border-gray-200 rounded-lg mb-2"
                onKeyPress={(e) => e.key === 'Enter' && handleAdminLogin()}
              />
              <button
                onClick={handleAdminLogin}
                className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700"
              >
                Login
              </button>
            </div>
          )}

          {/* Admin Keyword Filter */}
          {isAdmin && (
            <div className="mt-4 bg-yellow-50 border-2 border-yellow-300 rounded-lg shadow-md p-4 max-w-4xl mx-auto">
              <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <Search size={20} />
                Admin Keyword Filter
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Keywords (separate with commas)
                  </label>
                  <input
                    type="text"
                    value={adminKeywords}
                    onChange={(e) => setAdminKeywords(e.target.value)}
                    placeholder="e.g., spam, scam, inappropriate, viagra"
                    className="w-full p-2 border-2 border-gray-300 rounded-lg"
                  />
                  <p className="text-xs text-gray-600 mt-1">
                    Will search in problems, solutions, results, and comments
                  </p>
                </div>
                {adminKeywords && (
                  <div className="bg-white rounded p-3">
                    <p className="text-sm font-semibold mb-2">
                      Found {getKeywordMatches().length} matches
                    </p>
                    {getKeywordMatches().length === 0 ? (
                      <p className="text-sm text-gray-500">No matches found</p>
                    ) : (
                      <div className="space-y-2 max-h-96 overflow-y-auto">
                        {getKeywordMatches().map((match, idx) => (
                          <div key={idx} className="border border-red-300 bg-red-50 rounded p-3">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <span className="text-xs font-semibold text-red-700 uppercase bg-red-200 px-2 py-1 rounded">
                                  {match.type}
                                </span>
                                {match.type === 'comment' && (
                                  <span className="text-xs text-gray-600 ml-2">
                                    on experience #{match.expId}
                                  </span>
                                )}
                              </div>
                              {(() => {
                                const confirmKey = match.type === 'comment' 
                                  ? `comment-${match.expId}-${match.commentId}`
                                  : `exp-${match.expId}`;
                                const isConfirming = confirmDelete === confirmKey;
                                
                                return (
                                  <div className="flex gap-2">
                                    <button
                                    onClick={async () => {
                                    console.log('🔍 Search Delete clicked');
                                    
                                    const confirmKey = match.type === 'comment' 
                                      ? `comment-${match.expId}-${match.commentId}`
                                      : `exp-${match.expId}`;
                                    const isConfirming = confirmDelete === confirmKey;
                                    
                                    if (isConfirming) {
                                      // Second click - actually delete
                                      if (match.type === 'comment') {
                                        handleDeleteComment(match.expId, match.commentId);
                                      } else {
                                        console.log('🔍 Deleting match:', match.expId);
                                        await deleteExperienceFromSupabase(match.expId);
                                      }
                                      setConfirmDelete(null);
                                    } else {
                                      // First click - enter confirm mode
                                      setConfirmDelete(confirmKey);
                                    }
                                  }}
                                      className={`px-3 py-1 text-white text-xs rounded flex items-center gap-1 ${
                                        isConfirming 
                                          ? 'bg-orange-600 hover:bg-orange-700 animate-pulse' 
                                          : 'bg-red-600 hover:bg-red-700'
                                      }`}
                                    >
                                      <Trash2 size={12} />
                                      {isConfirming ? 'Confirm!' : 'Delete'}
                                    </button>
                                    {isConfirming && (
                                      <button
                                        onClick={() => setConfirmDelete(null)}
                                        className="px-3 py-1 bg-gray-500 text-white text-xs rounded hover:bg-gray-600"
                                      >
                                        Cancel
                                      </button>
                                    )}
                                  </div>
                                );
                              })()}
                            </div>
                            <p className="text-sm text-gray-700 mb-1">
                              <span className="font-medium">Keyword found:</span>{' '}
                              <span className="bg-yellow-300 px-1 rounded font-semibold">{match.keyword}</span>
                            </p>
                            {match.author && (
                              <p className="text-xs text-gray-600 mb-1">By: {match.author}</p>
                            )}
                            <p className="text-sm text-gray-600 italic border-l-4 border-yellow-400 pl-2">
                              "{match.text.substring(0, 200)}{match.text.length > 200 ? '...' : ''}"
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Formulário de Entrada */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Share Your Experiences</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {/* Problem */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="text-red-500" size={20} />
                <h3 className="text-lg font-semibold text-gray-800">Problem</h3>
              </div>
              
              <select
                value={currentEntry.problemCategory}
                onChange={(e) => setCurrentEntry({...currentEntry, problemCategory: e.target.value})}
                className="w-full p-2 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
                required
              >
                <option value="">Select category</option>
                {problemCategories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>

              <div className="relative">
                <textarea
                  value={currentEntry.problem}
                  onChange={(e) => {
                    if (e.target.value.length <= maxChars.problem) {
                      setCurrentEntry({...currentEntry, problem: e.target.value});
                    }
                  }}
                  placeholder="Describe the problem you faced..."
                  className="w-full h-40 p-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none resize-none"
                  required
                />
                <div className="text-xs text-gray-500 mt-1 text-right">
                  {currentEntry.problem.length}/{maxChars.problem}
                </div>
              </div>
            </div>

            {/* Action */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="text-blue-500" size={20} />
                <h3 className="text-lg font-semibold text-gray-800">Action</h3>
              </div>

              <div className="relative">
                <textarea
                  value={currentEntry.solution}
                  onChange={(e) => {
                    if (e.target.value.length <= maxChars.solution) {
                      setCurrentEntry({...currentEntry, solution: e.target.value});
                    }
                  }}
                  placeholder="What did you do to solve it?"
                  className="w-full h-40 p-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none resize-none"
                  required
                />
                <div className="text-xs text-gray-500 mt-1 text-right">
                  {currentEntry.solution.length}/{maxChars.solution}
                </div>
              </div>
            </div>

            {/* Result */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-2">
                <Share2 className="text-green-500" size={20} />
                <h3 className="text-lg font-semibold text-gray-800">Result</h3>
              </div>
              
              <select
                value={currentEntry.resultCategory}
                onChange={(e) => setCurrentEntry({...currentEntry, resultCategory: e.target.value})}
                className="w-full p-2 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none"
                required
              >
                <option value="">How was the result?</option>
                {resultCategories.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>

              <div className="relative">
                <textarea
                  value={currentEntry.result}
                  onChange={(e) => {
                    if (e.target.value.length <= maxChars.result) {
                      setCurrentEntry({...currentEntry, result: e.target.value});
                    }
                  }}
                  placeholder="What was the outcome?"
                  className="w-full h-40 p-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none resize-none"
                  required
                />
                <div className="text-xs text-gray-500 mt-1 text-right">
                  {currentEntry.result.length}/{maxChars.result}
                </div>
              </div>
            </div>
          </div>

          {/* Author Field */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Author (optional)
            </label>
            <input
              type="text"
              value={currentEntry.author}
              onChange={(e) => setCurrentEntry({...currentEntry, author: e.target.value})}
              placeholder="Enter your name..."
              className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
              maxLength={50}
            />
          </div>

          {/* Gender and Age Fields */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Gender (optional)
              </label>
              <select
                value={currentEntry.gender}
                onChange={(e) => setCurrentEntry({...currentEntry, gender: e.target.value})}
                className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
              >
                <option value="">Prefer not to say</option>
                {genderOptions.map(gender => (
                  <option key={gender} value={gender}>{gender}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Age Range (optional)
              </label>
              <select
                value={currentEntry.age}
                onChange={(e) => setCurrentEntry({...currentEntry, age: e.target.value})}
                className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
              >
                <option value="">Prefer not to say</option>
                {ageOptions.map(age => (
                  <option key={age} value={age}>{age}</option>
                ))}
              </select>
            </div>
          </div>

          <button
            onClick={handleSubmit}
            className="w-full mt-6 bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition-all shadow-lg"
          >
            Share Experience
          </button>
        </div>

        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Shared Experiences ({experiences.length})</h2>
          
          {/* Estatísticas de Reviews */}
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl shadow-md p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Rating Statistics</h3>
            <div className="grid grid-cols-5 gap-4">
              {ratingStats.reverse().map(stat => (
                <div key={stat.stars} className="bg-white rounded-lg p-4 text-center shadow-sm">
                  <div className="flex items-center justify-center gap-1 mb-2">
                    <Star className="text-yellow-500 fill-yellow-500" size={20} />
                    <span className="font-bold text-lg">{stat.stars}</span>
                  </div>
                  <div className="text-2xl font-bold text-purple-600">{stat.count}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {stat.count === 1 ? 'experience' : 'experiences'}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Filtros */}
          <div className="bg-white rounded-xl shadow-md p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-700">Filter Experiences</h3>
              <div className="text-sm font-medium text-purple-600">
                {filteredExperiences.length} {filteredExperiences.length === 1 ? 'experience found' : 'experiences found'}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">Category</label>
                <select
                  value={filters.problemCategory}
                  onChange={(e) => setFilters({...filters, problemCategory: e.target.value})}
                  className="w-full p-2 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
                >
                  <option value="">All</option>
                  {problemCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">Search</label>
                <input
                  type="text"
                  value={filters.searchText}
                  onChange={(e) => setFilters({...filters, searchText: e.target.value})}
                  placeholder="Search..."
                  className="w-full p-2 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">Result</label>
                <select
                  value={filters.resultCategory}
                  onChange={(e) => setFilters({...filters, resultCategory: e.target.value})}
                  className="w-full p-2 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none"
                >
                  <option value="">All</option>
                  {resultCategories.map(cat => <option key={cat.value} value={cat.value}>{cat.label}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">Rating</label>
                <select
                  value={filters.rating}
                  onChange={(e) => setFilters({...filters, rating: e.target.value})}
                  className="w-full p-2 border-2 border-gray-200 rounded-lg focus:border-yellow-500 focus:outline-none"
                >
                  <option value="">All</option>
                  <option value="5">⭐⭐⭐⭐⭐ (5)</option>
                  <option value="4">⭐⭐⭐⭐ (4)</option>
                  <option value="3">⭐⭐⭐ (3)</option>
                  <option value="2">⭐⭐ (2)</option>
                  <option value="1">⭐ (1)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">Gender</label>
                <select
                  value={filters.gender}
                  onChange={(e) => setFilters({...filters, gender: e.target.value})}
                  className="w-full p-2 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
                >
                  <option value="">All</option>
                  {genderOptions.map(gender => <option key={gender} value={gender}>{gender}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">Age</label>
                <select
                  value={filters.age}
                  onChange={(e) => setFilters({...filters, age: e.target.value})}
                  className="w-full p-2 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
                >
                  <option value="">All</option>
                  {ageOptions.map(age => <option key={age} value={age}>{age}</option>)}
                </select>
              </div>
            </div>
            
            {(filters.problemCategory || filters.searchText || filters.resultCategory || filters.rating || filters.gender || filters.age) && (
              <button
                onClick={() => setFilters({ problemCategory: '', searchText: '', resultCategory: '', rating: '', gender: '', age: '' })}
                className="mt-4 text-sm text-purple-600 hover:text-purple-800 font-medium"
              >
                Clear filters
              </button>
            )}
          </div>

          {filteredExperiences.length === 0 ? (
            <div className="bg-gray-50 rounded-xl p-8 text-center">
              <p className="text-gray-500">No experiences found.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredExperiences.map(exp => (
                <div key={exp.id} className="bg-white rounded-2xl shadow-lg p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3 flex-wrap">
                      {(exp.author || exp.gender || exp.age) && (
                        <span className="text-xs font-medium text-purple-600 bg-purple-50 px-3 py-1 rounded-full">
                          By: {[exp.author, exp.gender, exp.age].filter(Boolean).join(', ')}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex flex-col items-end gap-3">
                      {/* Average Rating Display */}
                      <div className="flex items-center gap-2 bg-yellow-50 px-3 py-2 rounded-lg">
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map(star => (
                            <Star
                              key={star}
                              size={18}
                              className={
                                star <= Math.round(exp.avgRating)
                                  ? 'text-yellow-500 fill-yellow-500'
                                  : 'text-gray-300'
                              }
                            />
                          ))}
                        </div>
                        <div className="text-sm font-semibold text-gray-700">
                          {exp.avgRating.toFixed(1)} 
                          <span className="text-xs text-gray-500 ml-1">({exp.totalRatings} {exp.totalRatings === 1 ? 'rating' : 'ratings'})</span>
                        </div>
                      </div>
                      
                      {/* User Rating Input */}
                      <div className="flex flex-col items-end">
                        <div className="text-xs text-gray-600 mb-1">Your rating:</div>
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map(star => (
                            <button
                              key={star}
                              onClick={() => handleUserRating(exp.id, star)}
                              onMouseEnter={() => setHoverRating({...hoverRating, [exp.id]: star})}
                              onMouseLeave={() => setHoverRating({...hoverRating, [exp.id]: 0})}
                              className="transition-transform hover:scale-110"
                            >
                              <Star
                                size={20}
                                className={
                                  star <= (hoverRating[exp.id] || userRatings[exp.id] || 0)
                                    ? 'text-yellow-500 fill-yellow-500'
                                    : 'text-gray-300'
                                }
                              />
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-red-600 flex items-center gap-2">
                          <AlertCircle size={16} />
                          Problem
                        </h4>
                        <span className="text-xs bg-red-100 text-red-700 px-3 py-1 rounded-full">
                          {exp.problemCategory}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700">{exp.problem}</p>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-semibold text-blue-600 flex items-center gap-2">
                        <TrendingUp size={16} />
                        Action
                      </h4>
                      <p className="text-sm text-gray-700">{exp.solution}</p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-green-600 flex items-center gap-2">
                          <Share2 size={16} />
                          Result
                        </h4>
                        <span className={`text-xs px-3 py-1 rounded-full ${getResultColor(exp.resultCategory)}`}>
                          {getResultLabel(exp.resultCategory)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700">{exp.result}</p>
                    </div>
                  </div>

                  {/* Admin Delete Experience Button */}
                  {isAdmin && (() => {
                    const confirmKey = `exp-${exp.id}`;
                    const isConfirming = confirmDelete === confirmKey;
                    
                    return (
                      <div className="mt-4 mb-4 flex gap-2">
                        <button
                          onClick={async () => {
                          console.log('🗑️ Delete button clicked!');
                          console.log('🔘 confirmDelete:', confirmDelete);
                          console.log('🔘 exp.id:', exp.id);
                          const isConfirming = confirmDelete === `exp-${exp.id}`;
                          console.log('🔘 isConfirming:', isConfirming);
                          
                          if (isConfirming) {
                            // Second click - actually delete from Supabase
                            await deleteExperienceFromSupabase(exp.id);
                            setConfirmDelete(null);
                          } else {
                            // First click - enter confirm mode
                            setConfirmDelete(`exp-${exp.id}`);
                          }
                        }}
                          className={`px-4 py-2 text-white rounded text-sm flex items-center gap-2 ${
                            isConfirming 
                              ? 'bg-orange-600 hover:bg-orange-700 animate-pulse' 
                              : 'bg-red-600 hover:bg-red-700'
                          }`}
                        >
                          <Trash2 size={14} />
                          {isConfirming ? 'Click to CONFIRM DELETE!' : 'Delete Experience'}
                        </button>
                        {isConfirming && (
                          <button
                            onClick={() => setConfirmDelete(null)}
                            className="px-4 py-2 bg-gray-500 text-white rounded text-sm hover:bg-gray-600"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    );
                  })()}

                  {/* Comments Section */}
                  <div className="border-t pt-4 mt-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-gray-700 flex items-center gap-2">
                        <MessageCircle size={18} />
                        Comments ({exp.comments.length})
                      </h4>
                      <button
                        onClick={() => setShowComments({...showComments, [exp.id]: !showComments[exp.id]})}
                        className="text-sm text-purple-600 hover:text-purple-800 font-medium"
                      >
                        {showComments[exp.id] ? 'Hide' : 'Show'} Comments
                      </button>
                    </div>

                    {showComments[exp.id] && (
                      <div className="space-y-4">
                        {/* Existing Comments */}
                        {exp.comments.length > 0 && (
                          <div className="space-y-3 mb-4">
                            {exp.comments.map(comment => (
                              <div key={comment.id} className="bg-gray-50 rounded-lg p-3">
                                <div className="flex justify-between items-start mb-1">
                                  <span className="font-semibold text-sm text-gray-800">{comment.author}</span>
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs text-gray-500">{comment.timestamp}</span>
                                    {isAdmin && (
                                      <button
                                        onClick={() => handleDeleteComment(exp.id, comment.id)}
                                        className="text-xs text-red-600 hover:text-red-800 font-medium"
                                      >
                                        Delete
                                      </button>
                                    )}
                                  </div>
                                </div>
                                <p className="text-sm text-gray-700">{comment.text}</p>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Add Comment Input */}
                        <div className="flex gap-2">
                          <textarea
                            value={newComment[exp.id] || ''}
                            onChange={(e) => {
                              if (e.target.value.length <= maxChars.comment) {
                                setNewComment({...newComment, [exp.id]: e.target.value});
                              }
                            }}
                            placeholder="Add a comment..."
                            className="flex-1 p-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none resize-none"
                            rows="2"
                          />
                          <button
                            onClick={() => handleAddComment(exp.id)}
                            disabled={!newComment[exp.id]?.trim()}
                            className="px-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
                          >
                            <Send size={18} />
                          </button>
                        </div>
                        <div className="text-xs text-gray-500 text-right">
                          {(newComment[exp.id] || '').length}/{maxChars.comment}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
