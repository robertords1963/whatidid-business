import React, { useState, useEffect } from 'react';
import { Share2, TrendingUp, AlertCircle, Star, MessageCircle, Send, Shield, Trash2, Search } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vtnzsyrojybyfeenkave.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ0bnpzeXJvanlieWZlZW5rYXZlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY3OTg1ODEsImV4cCI6MjA4MjM3NDU4MX0.6W9ueperYZpiIsLmBzNgJ9-wxPrwJ-mkhdDe2VGbKxU';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

console.log('🔧 WhatIDid App loaded with Supabase!');

export default function WhatIDid() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [adminKeywords, setAdminKeywords] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [loading, setLoading] = useState(true);
  const [experiences, setExperiences] = useState([]);
  const [userCountry, setUserCountry] = useState('');
  const [addingComment, setAddingComment] = useState(null);
  const [userCountryName, setUserCountryName] = useState('');

  useEffect(() => {
    detectUserCountry();
    loadExperiences();
  }, []);
  
  const detectUserCountry = async () => {
    try {
      const response = await fetch('https://ipapi.co/json/');
      const data = await response.json();
      
      if (data.country_code && data.country_name) {
        setUserCountry(data.country_code);
        setUserCountryName(data.country_name);
        
        setCurrentEntry(prev => ({
          ...prev,
          country: data.country_name
        }));
      }
    } catch (error) {
      console.error('Error detecting country:', error);
      setUserCountry('');
      setUserCountryName('');
    }
  };
  
  const loadExperiences = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('experiences')
        .select('*')
        .order('id', { ascending: false });
      
      if (error) throw error;
      
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
        country: exp.country || '',
        avgRating: exp.avg_rating || 0,
        totalRatings: exp.total_ratings || 0,
        comments: []
      }));
      
      const { data: allComments } = await supabase
        .from('comments')
        .select('*')
        .order('created_at', { ascending: true });

      if (allComments) {
        const commentsByExp = {};
        allComments.forEach(c => {
          if (!commentsByExp[c.experience_id]) {
            commentsByExp[c.experience_id] = [];
          }
          commentsByExp[c.experience_id].push({
            id: c.id,
            text: c.comment_text,
            author: c.author,
            country: c.country
          });
        });
        
        transformedData.forEach(exp => {
          exp.comments = commentsByExp[exp.id] || [];
        });
      }

      setExperiences(transformedData);
    } catch (error) {
      console.error('Error loading experiences:', error);
      alert('Error loading data. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  };

  const addExperienceToSupabase = async (newExperience) => {
    try {
      const { data, error } = await supabase
        .from('experiences')
        .insert([{
          problem: newExperience.problem,
          problem_category: newExperience.problemCategory,
          solution: newExperience.solution,
          result: newExperience.result,
          result_category: newExperience.resultCategory,
          author: newExperience.author || '',
          gender: newExperience.gender || '',
          age: newExperience.age || '',
          country: newExperience.country || '',
          avg_rating: 0,
          total_ratings: 0
        }])
        .select();
      
      if (error) throw error;
      await loadExperiences();
      return true;
    } catch (error) {
      console.error('Error adding experience:', error);
      alert('Error saving experience.');
      return false;
    }
  };

  const deleteExperienceFromSupabase = async (id) => {
    try {
      const { error } = await supabase
        .from('experiences')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      await loadExperiences();
      return true;
    } catch (error) {
      console.error('Error deleting experience:', error);
      alert('Error deleting experience.');
      return false;
    }
  };

  const handleAddComment = async (experienceId) => {
    const commentText = newComment[experienceId];
    
    if (!commentText?.trim()) {
      alert('Please enter a comment!');
      return;
    }
    
    try {
      setAddingComment(experienceId);
      
      const { data, error } = await supabase
        .from('comments')
        .insert([{
          experience_id: experienceId,
          comment_text: commentText,
          author: '',
          country: userCountryName || ''
        }])
        .select();
      
      if (error) throw error;
      
      const updatedComments = {...newComment};
      delete updatedComments[experienceId];
      setNewComment(updatedComments);
      
      await loadExperiences();
      
    } catch (error) {
      console.error('Error:', error);
      alert('Error adding comment.');
    } finally {
      setAddingComment(null);
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
    country: ''
  });

  const [filters, setFilters] = useState({
    problemCategory: '',
    searchText: '',
    resultCategory: '',
    rating: '',
    gender: '',
    age: '',
    country: ''
  });

  const [userRatings, setUserRatings] = useState({});
  const [hoverRating, setHoverRating] = useState({});
  const [newComment, setNewComment] = useState({});
  const [showComments, setShowComments] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const experiencesPerPage = 20;

  const maxChars = {
    problem: 300,
    solution: 300,
    result: 200,
    comment: 500
  };

  const problemCategories = ['Health', 'Work', 'Relationship', 'Finance', 'Family', 'Education', 'Well-being', 'Other'];
  const genderOptions = ['Male', 'Female', 'Other'];
  const ageOptions = ['0-20', '21-40', '41-60', '61-Up'];
  const countryOptions = [
    'Afghanistan', 'Albania', 'Algeria', 'Andorra', 'Angola', 'Argentina', 
    'Armenia', 'Australia', 'Austria', 'Azerbaijan', 'Bahamas', 'Bahrain', 
    'Bangladesh', 'Barbados', 'Belarus', 'Belgium', 'Belize', 'Benin', 
    'Bhutan', 'Bolivia', 'Bosnia and Herzegovina', 'Botswana', 'Brazil', 
    'Brunei', 'Bulgaria', 'Burkina Faso', 'Burundi', 'Cambodia', 'Cameroon', 
    'Canada', 'Cape Verde', 'Central African Republic', 'Chad', 'Chile', 
    'China', 'Colombia', 'Comoros', 'Congo', 'Costa Rica', 'Croatia', 'Cuba', 
    'Cyprus', 'Czech Republic', 'Denmark', 'Djibouti', 'Dominica', 
    'Dominican Republic', 'East Timor', 'Ecuador', 'Egypt', 'El Salvador', 
    'Equatorial Guinea', 'Eritrea', 'Estonia', 'Ethiopia', 'Fiji', 'Finland', 
    'France', 'Gabon', 'Gambia', 'Georgia', 'Germany', 'Ghana', 'Greece', 
    'Grenada', 'Guatemala', 'Guinea', 'Guinea-Bissau', 'Guyana', 'Haiti', 
    'Honduras', 'Hungary', 'Iceland', 'India', 'Indonesia', 'Iran', 'Iraq', 
    'Ireland', 'Israel', 'Italy', 'Jamaica', 'Japan', 'Jordan', 'Kazakhstan', 
    'Kenya', 'Kiribati', 'North Korea', 'South Korea', 'Kuwait', 'Kyrgyzstan', 
    'Laos', 'Latvia', 'Lebanon', 'Lesotho', 'Liberia', 'Libya', 'Liechtenstein', 
    'Lithuania', 'Luxembourg', 'Macedonia', 'Madagascar', 'Malawi', 'Malaysia', 
    'Maldives', 'Mali', 'Malta', 'Marshall Islands', 'Mauritania', 'Mauritius', 
    'Mexico', 'Micronesia', 'Moldova', 'Monaco', 'Mongolia', 'Montenegro', 
    'Morocco', 'Mozambique', 'Myanmar', 'Namibia', 'Nauru', 'Nepal', 
    'Netherlands', 'New Zealand', 'Nicaragua', 'Niger', 'Nigeria', 'Norway', 
    'Oman', 'Pakistan', 'Palau', 'Palestine', 'Panama', 'Papua New Guinea', 
    'Paraguay', 'Peru', 'Philippines', 'Poland', 'Portugal', 'Qatar', 'Romania', 
    'Russia', 'Rwanda', 'Saint Kitts and Nevis', 'Saint Lucia', 
    'Saint Vincent and the Grenadines', 'Samoa', 'San Marino', 
    'Sao Tome and Principe', 'Saudi Arabia', 'Senegal', 'Serbia', 'Seychelles', 
    'Sierra Leone', 'Singapore', 'Slovakia', 'Slovenia', 'Solomon Islands', 
    'Somalia', 'South Africa', 'South Sudan', 'Spain', 'Sri Lanka', 'Sudan', 
    'Suriname', 'Swaziland', 'Sweden', 'Switzerland', 'Syria', 'Taiwan', 
    'Tajikistan', 'Tanzania', 'Thailand', 'Togo', 'Tonga', 'Trinidad and Tobago', 
    'Tunisia', 'Turkey', 'Turkmenistan', 'Tuvalu', 'Uganda', 'Ukraine', 
    'United Arab Emirates', 'United Kingdom', 'United States', 'Uruguay', 
    'Uzbekistan', 'Vanuatu', 'Vatican City', 'Venezuela', 'Vietnam', 'Yemen', 
    'Zambia', 'Zimbabwe'
  ];
  
  const resultCategories = [
    { value: 'worked', label: 'Worked', color: 'bg-green-100 text-green-800' },
    { value: 'no-change', label: 'No Change', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'got-worse', label: 'Got Worse', color: 'bg-red-100 text-red-800' }
  ];

  const handleSubmit = async () => {
    if (currentEntry.problem && currentEntry.problemCategory && 
        currentEntry.solution && currentEntry.result && currentEntry.resultCategory) {
      await addExperienceToSupabase(currentEntry);
      setCurrentEntry({
        problem: '',
        problemCategory: '',
        solution: '',
        result: '',
        resultCategory: '',
        author: '',
        gender: '',
        age: '',
        country: userCountryName || ''
      });
    }
  };

  const handleUserRating = async (expId, rating) => {
    try {
      setUserRatings({...userRatings, [expId]: rating});
      const exp = experiences.find(e => e.id === expId);
      if (!exp) return;
      const newTotalRatings = exp.totalRatings + 1;
      const newAvgRating = ((exp.avgRating * exp.totalRatings) + rating) / newTotalRatings;
      const { error } = await supabase
        .from('experiences')
        .update({ avg_rating: newAvgRating, total_ratings: newTotalRatings })
        .eq('id', expId);
      if (error) {
        console.error('Error saving rating:', error);
        return;
      }
      await loadExperiences();
    } catch (error) {
      console.error('Error in handleUserRating:', error);
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

  // Scroll to top when admin box is opened
  useEffect(() => {
    if (showAdminLogin || isAdmin) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [showAdminLogin, isAdmin]);

  const handleDelete = (expId) => {
    if (confirmDelete === `exp-${expId}`) {
      setExperiences(experiences.filter(e => e.id !== expId));
      setConfirmDelete(null);
    } else {
      setConfirmDelete(`exp-${expId}`);
    }
  };

  const handleDeleteComment = (expId, commentId) => {
    const confirmKey = `comment-${expId}-${commentId}`;
    if (confirmDelete === confirmKey) {
      setExperiences(experiences.map(exp => {
        if (exp.id === expId) {
          return { ...exp, comments: exp.comments.filter(c => c.id !== commentId) };
        }
        return exp;
      }));
      setConfirmDelete(null);
    } else {
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
    const matchesRating = !filters.rating || 
      (filters.rating === '0' ? exp.totalRatings === 0 : roundedRating === parseInt(filters.rating) && exp.totalRatings > 0);
    const matchesGender = !filters.gender || exp.gender === filters.gender;
    const matchesAge = !filters.age || exp.age === filters.age;
    const matchesCountry = !filters.country || exp.country === filters.country;
    return matchesProblemCategory && matchesSearchText && matchesResultCategory && matchesRating && matchesGender && matchesAge && matchesCountry;
  });

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  // Pagination logic
  const totalPages = Math.ceil(filteredExperiences.length / experiencesPerPage);
  const indexOfLastExperience = currentPage * experiencesPerPage;
  const indexOfFirstExperience = indexOfLastExperience - experiencesPerPage;
  const currentExperiences = filteredExperiences.slice(indexOfFirstExperience, indexOfLastExperience);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    const paginationTop = document.getElementById('pagination-top');
    if (paginationTop) {
      const yOffset = -100; // 100px de espaço acima
      const y = paginationTop.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

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
              WhatIDid
            </h1>
            <div className="flex-1"></div>
          </div>
          <p className="text-gray-700 font-medium mb-1">Real problems. Real solutions. Real people.</p>
          <p className="text-gray-600">Share your experience, help someone else</p>

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

          {isAdmin && (
            <div className="mt-4 bg-purple-50 border-2 border-purple-300 rounded-lg shadow-md p-4 max-w-md mx-auto">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Shield size={20} className="text-purple-600" />
                  <h3 className="font-semibold text-purple-800">Admin Mode Active</h3>
                </div>
                <button
                  onClick={() => { 
                    setIsAdmin(false); 
                    setAdminKeywords(''); 
                    setShowAdminLogin(false);
                  }}
                  className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
                >
                  Logout
                </button>
              </div>
              <p className="text-sm text-gray-600">You have access to admin features</p>
            </div>
          )}

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
                                        const confirmKey = match.type === 'comment' 
                                          ? `comment-${match.expId}-${match.commentId}`
                                          : `exp-${match.expId}`;
                                        const isConfirming = confirmDelete === confirmKey;
                                        if (isConfirming) {
                                          if (match.type === 'comment') {
                                            handleDeleteComment(match.expId, match.commentId);
                                          } else {
                                            await deleteExperienceFromSupabase(match.expId);
                                          }
                                          setConfirmDelete(null);
                                        } else {
                                          setConfirmDelete(confirmKey);
                                        }
                                      }}
                                      className={`px-3 py-1 text-white text-xs rounded flex items-center gap-1 ${
                                        isConfirming ? 'bg-orange-600 hover:bg-orange-700 animate-pulse' : 'bg-red-600 hover:bg-red-700'
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

        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Share Your Experiences</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
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

          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Author (optional)</label>
              <input
                type="text"
                value={currentEntry.author}
                onChange={(e) => setCurrentEntry({...currentEntry, author: e.target.value})}
                placeholder="Your name..."
                className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
                maxLength={50}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Gender (optional)</label>
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
              <label className="block text-sm font-medium text-gray-700 mb-2">Age Range (optional)</label>
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Country (auto-detected)</label>
              <select
                value={currentEntry.country}
                onChange={(e) => setCurrentEntry({...currentEntry, country: e.target.value})}
                className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
              >
                <option value="">Select country</option>
                {countryOptions.map(country => (
                  <option key={country} value={country}>{country}</option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">Detected: {userCountryName || 'Not detected'}</p>
            </div>
          </div>
          <button
            onClick={handleSubmit}
            className="w-full mt-6 bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition-all shadow-lg"
          >
            Share Experience
          </button>
        </div>

        <div className="space-y-6" id="experiences-section">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Shared Experiences ({experiences.length})</h2>
          
          {/* Rating Statistics - Compact Left-Aligned Layout */}
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl shadow-md p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Rating Statistics</h3>
            
            {/* Overall Average Rating */}
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                {(() => {
                  const ratedExperiences = experiences.filter(exp => exp.totalRatings > 0);
                  const avgRating = ratedExperiences.length > 0 
                    ? ratedExperiences.reduce((sum, exp) => sum + exp.avgRating, 0) / ratedExperiences.length 
                    : 0;
                  
                  return (
                    <>
                      {[1, 2, 3, 4, 5].map(star => {
                        const fillPercentage = Math.min(Math.max(avgRating - star + 1, 0), 1) * 100;
                        
                        return (
                          <div key={star} className="relative inline-block">
                            {/* Background star (empty) */}
                            <Star size={24} className="text-gray-300" />
                            {/* Foreground star (filled) with clip */}
                            <div 
                              className="absolute top-0 left-0 overflow-hidden"
                              style={{ width: `${fillPercentage}%` }}
                            >
                              <Star size={24} className="text-yellow-500 fill-yellow-500" />
                            </div>
                          </div>
                        );
                      })}
                      <span className="text-2xl font-bold text-gray-800 ml-2">
                        {avgRating.toFixed(1)}
                      </span>
                      <span className="text-gray-600">out of 5</span>
                    </>
                  );
                })()}
              </div>
              <div className="text-sm font-medium text-gray-600">
                {(() => {
                  const ratedCount = experiences.filter(exp => exp.totalRatings > 0).length;
                  return `${ratedCount} global ${ratedCount === 1 ? 'rating' : 'ratings'}`;
                })()}
              </div>
            </div>

            {/* Rating Breakdown - 3 Column Compact */}
            <div className="space-y-2">
              {[5, 4, 3, 2, 1, 0].map(stars => {
                const count = stars === 0 
                  ? experiences.filter(exp => exp.totalRatings === 0).length
                  : experiences.filter(exp => Math.round(exp.avgRating) === stars && exp.totalRatings > 0).length;
                const totalExperiences = experiences.length;
                const percentage = totalExperiences > 0 ? ((count / totalExperiences) * 100).toFixed(1) : 0;
                const label = stars === 0 ? 'None' : `${stars} ${stars === 1 ? 'Star' : 'Stars'}`;
                
                return (
                  <button
                    key={stars}
                    onClick={() => setFilters({...filters, rating: stars.toString()})}
                    className="flex items-center gap-4 hover:bg-white/50 px-3 py-2 rounded transition-colors w-fit"
                  >
                    <span className="font-medium text-gray-700 w-16">
                      {label}
                    </span>
                    <span className="font-bold text-purple-600 w-12 text-right">
                      {count}
                    </span>
                    <span className="text-sm text-gray-600 w-16">
                      ({percentage}%)
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-md p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-700">Filter Experiences</h3>
              <div className="text-sm font-medium text-purple-600">
                {filteredExperiences.length} {filteredExperiences.length === 1 ? 'experience found' : 'experiences found'}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-4">
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
                  <option value="0">None (Not rated)</option>
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
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">Country</label>
                <select
                  value={filters.country}
                  onChange={(e) => setFilters({...filters, country: e.target.value})}
                  className="w-full p-2 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
                >
                  <option value="">All</option>
                  {countryOptions.map(country => <option key={country} value={country}>{country}</option>)}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-600 mb-2">Enter Keywords</label>
                <input
                  type="text"
                  value={filters.searchText}
                  onChange={(e) => setFilters({...filters, searchText: e.target.value})}
                  placeholder="Search..."
                  className="w-full p-2 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
                />
              </div>
            </div>
            {(filters.problemCategory || filters.searchText || filters.resultCategory || filters.rating || filters.gender || filters.age || filters.country) && (
              <button
                onClick={() => setFilters({ problemCategory: '', searchText: '', resultCategory: '', rating: '', gender: '', age: '', country: '' })}
                className="mt-4 text-sm text-purple-600 hover:text-purple-800 font-medium"
              >
                Clear filters
              </button>
            )}
          </div>

          {/* Pagination - Top */}
          {filteredExperiences.length > experiencesPerPage && (
            <div id="pagination-top" className="mb-6 flex flex-col items-center gap-4">
              <div className="text-sm text-gray-600">
                Page {currentPage} of {totalPages} • Showing {indexOfFirstExperience + 1}-{Math.min(indexOfLastExperience, filteredExperiences.length)} of {filteredExperiences.length} experiences
              </div>
              <div className="flex items-center gap-2 flex-wrap justify-center">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-white border-2 border-gray-200 rounded-lg font-medium text-gray-700 hover:bg-purple-50 hover:border-purple-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
                >
                  ← Previous
                </button>
                
                <div className="flex gap-2 flex-wrap justify-center">
                  {(() => {
                    const pages = [];
                    const showEllipsisStart = currentPage > 3;
                    const showEllipsisEnd = currentPage < totalPages - 2;
                    
                    pages.push(
                      <button
                        key={1}
                        onClick={() => handlePageChange(1)}
                        className={`px-3 py-2 rounded-lg font-medium transition-colors text-sm ${
                          currentPage === 1
                            ? 'bg-purple-600 text-white'
                            : 'bg-white border-2 border-gray-200 text-gray-700 hover:bg-purple-50 hover:border-purple-300'
                        }`}
                      >
                        1
                      </button>
                    );
                    
                    if (showEllipsisStart) {
                      pages.push(<span key="ellipsis-start-top" className="px-2 text-gray-500">...</span>);
                    }
                    
                    const startPage = Math.max(2, currentPage - 1);
                    const endPage = Math.min(totalPages - 1, currentPage + 1);
                    
                    for (let i = startPage; i <= endPage; i++) {
                      pages.push(
                        <button
                          key={i}
                          onClick={() => handlePageChange(i)}
                          className={`px-3 py-2 rounded-lg font-medium transition-colors text-sm ${
                            currentPage === i
                              ? 'bg-purple-600 text-white'
                              : 'bg-white border-2 border-gray-200 text-gray-700 hover:bg-purple-50 hover:border-purple-300'
                          }`}
                        >
                          {i}
                        </button>
                      );
                    }
                    
                    if (showEllipsisEnd) {
                      pages.push(<span key="ellipsis-end-top" className="px-2 text-gray-500">...</span>);
                    }
                    
                    if (totalPages > 1) {
                      pages.push(
                        <button
                          key={totalPages}
                          onClick={() => handlePageChange(totalPages)}
                          className={`px-3 py-2 rounded-lg font-medium transition-colors text-sm ${
                            currentPage === totalPages
                              ? 'bg-purple-600 text-white'
                              : 'bg-white border-2 border-gray-200 text-gray-700 hover:bg-purple-50 hover:border-purple-300'
                          }`}
                        >
                          {totalPages}
                        </button>
                      );
                    }
                    
                    return pages;
                  })()}
                </div>
                
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 bg-white border-2 border-gray-200 rounded-lg font-medium text-gray-700 hover:bg-purple-50 hover:border-purple-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
                >
                  Next →
                </button>
              </div>
            </div>
          )}

          {filteredExperiences.length === 0 ? (
            <div className="bg-gray-50 rounded-xl p-8 text-center">
              <p className="text-gray-500">No experiences found.</p>
            </div>
          ) : (
            <div className="space-y-4" id="first-experience">
              {currentExperiences.map(exp => (
                <div key={exp.id} className="bg-white rounded-2xl shadow-lg p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3 flex-wrap">
                      {(exp.author || exp.gender || exp.age) && (
                        <span className="text-xs font-medium text-purple-600 bg-purple-50 px-3 py-1 rounded-full">
                          By: {[exp.author, exp.gender, exp.age].filter(Boolean).join(', ')}
                        </span>
                      )}
                      {exp.country && (
                        <span className="text-xs font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                          {exp.country}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-3">
                      <div className="flex items-center gap-2 bg-yellow-50 px-3 py-2 rounded-lg">
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map(star => (
                            <Star
                              key={star}
                              size={18}
                              className={star <= Math.round(exp.avgRating) ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}
                            />
                          ))}
                        </div>
                        <div className="text-sm font-semibold text-gray-700">
                          {exp.avgRating.toFixed(1)} 
                          <span className="text-xs text-gray-500 ml-1">({exp.totalRatings} {exp.totalRatings === 1 ? 'rating' : 'ratings'})</span>
                        </div>
                      </div>
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
                                className={star <= (hoverRating[exp.id] || userRatings[exp.id] || 0) ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}
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
                        <span className="text-xs bg-red-100 text-red-700 px-3 py-1 rounded-full">{exp.problemCategory}</span>
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

                  {isAdmin && (() => {
                    const confirmKey = `exp-${exp.id}`;
                    const isConfirming = confirmDelete === confirmKey;
                    return (
                      <div className="mt-4 mb-4 flex gap-2">
                        <button
                          onClick={async () => {
                            const isConfirming = confirmDelete === `exp-${exp.id}`;
                            if (isConfirming) {
                              await deleteExperienceFromSupabase(exp.id);
                              setConfirmDelete(null);
                            } else {
                              setConfirmDelete(`exp-${exp.id}`);
                            }
                          }}
                          className={`px-4 py-2 text-white rounded text-sm flex items-center gap-2 ${isConfirming ? 'bg-orange-600 hover:bg-orange-700 animate-pulse' : 'bg-red-600 hover:bg-red-700'}`}
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

                  <div className="border-t pt-4 mt-4">
                    <div className="mb-4">
                      <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                        <MessageCircle size={18} />
                        Add a Comment
                      </h4>
                      <div className="flex gap-2">
                        <textarea
                          value={newComment[exp.id] || ''}
                          onChange={(e) => {
                            if (e.target.value.length <= maxChars.comment) {
                              setNewComment({...newComment, [exp.id]: e.target.value});
                            }
                          }}
                          placeholder="Share your thoughts..."
                          className="flex-1 p-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none resize-none"
                          rows="2"
                        />
                        <button
                          onClick={() => handleAddComment(exp.id)}
                          disabled={!newComment[exp.id]?.trim() || addingComment === exp.id}
                          className="px-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                          <Send size={18} />
                        </button>
                      </div>
                      <div className="text-xs text-gray-500 text-right mt-1">
                        {(newComment[exp.id] || '').length}/{maxChars.comment}
                      </div>
                    </div>

                    {exp.comments.length > 0 && (
                      <div>
                        <button
                          onClick={() => setShowComments({...showComments, [exp.id]: !showComments[exp.id]})}
                          className="text-sm text-purple-600 hover:text-purple-800 font-medium mb-3 flex items-center gap-2"
                        >
                          <MessageCircle size={16} />
                          {showComments[exp.id] ? 'Hide' : 'Show'} {exp.comments.length} Previous {exp.comments.length === 1 ? 'Comment' : 'Comments'}
                        </button>
                        {showComments[exp.id] && (
                          <div className="space-y-3">
                            {exp.comments.map(comment => (
                              <div key={comment.id} className="bg-gray-50 rounded-lg p-3">
                                <p className="text-sm text-gray-700">
                                  {comment.text}
                                  {comment.country && (
                                    <span className="text-gray-500 ml-2">({comment.country})</span>
                                  )}
                                </p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {filteredExperiences.length > experiencesPerPage && (
            <div className="mt-8 flex flex-col items-center gap-4">
              <div className="text-sm text-gray-600">
                Page {currentPage} of {totalPages} • Showing {indexOfFirstExperience + 1}-{Math.min(indexOfLastExperience, filteredExperiences.length)} of {filteredExperiences.length} experiences
              </div>
              <div className="flex items-center gap-2 flex-wrap justify-center">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-white border-2 border-gray-200 rounded-lg font-medium text-gray-700 hover:bg-purple-50 hover:border-purple-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  ← Previous
                </button>
                
                <div className="flex gap-2 flex-wrap justify-center">
                  {(() => {
                    const pages = [];
                    const showEllipsisStart = currentPage > 3;
                    const showEllipsisEnd = currentPage < totalPages - 2;
                    
                    pages.push(
                      <button
                        key={1}
                        onClick={() => handlePageChange(1)}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                          currentPage === 1
                            ? 'bg-purple-600 text-white'
                            : 'bg-white border-2 border-gray-200 text-gray-700 hover:bg-purple-50 hover:border-purple-300'
                        }`}
                      >
                        1
                      </button>
                    );
                    
                    if (showEllipsisStart) {
                      pages.push(<span key="ellipsis-start" className="px-2 text-gray-500">...</span>);
                    }
                    
                    const startPage = Math.max(2, currentPage - 1);
                    const endPage = Math.min(totalPages - 1, currentPage + 1);
                    
                    for (let i = startPage; i <= endPage; i++) {
                      pages.push(
                        <button
                          key={i}
                          onClick={() => handlePageChange(i)}
                          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                            currentPage === i
                              ? 'bg-purple-600 text-white'
                              : 'bg-white border-2 border-gray-200 text-gray-700 hover:bg-purple-50 hover:border-purple-300'
                          }`}
                        >
                          {i}
                        </button>
                      );
                    }
                    
                    if (showEllipsisEnd) {
                      pages.push(<span key="ellipsis-end" className="px-2 text-gray-500">...</span>);
                    }
                    
                    if (totalPages > 1) {
                      pages.push(
                        <button
                          key={totalPages}
                          onClick={() => handlePageChange(totalPages)}
                          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                            currentPage === totalPages
                              ? 'bg-purple-600 text-white'
                              : 'bg-white border-2 border-gray-200 text-gray-700 hover:bg-purple-50 hover:border-purple-300'
                          }`}
                        >
                          {totalPages}
                        </button>
                      );
                    }
                    
                    return pages;
                  })()}
                </div>
                
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 bg-white border-2 border-gray-200 rounded-lg font-medium text-gray-700 hover:bg-purple-50 hover:border-purple-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next →
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="mt-12 pt-8 border-t-2 border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex gap-6 text-sm">
              <button
                onClick={() => {
                  if (isAdmin) {
                    setIsAdmin(false);
                    setAdminKeywords('');
                    setShowAdminLogin(false);
                  } else {
                    setShowAdminLogin(!showAdminLogin);
                  }
                }}
                className={`font-medium transition-colors flex items-center gap-2 ${
                  isAdmin ? 'text-purple-600' : 'text-gray-600 hover:text-purple-600'
                }`}
              >
                {isAdmin && <Shield size={14} />}
                {isAdmin ? 'Admin Mode (Click to Logout)' : 'Admin'}
              </button>
              <span className="text-gray-300">|</span>
              <button className="text-gray-600 hover:text-purple-600 font-medium transition-colors">
                Contact
              </button>
              <span className="text-gray-300">|</span>
              <button className="text-gray-600 hover:text-purple-600 font-medium transition-colors">
                Privacy Policy
              </button>
              <span className="text-gray-300">|</span>
              <button className="text-gray-600 hover:text-purple-600 font-medium transition-colors">
                About
              </button>
            </div>
            <div className="text-sm text-gray-500">
              © 2026 WhatIDid - All rights reserved
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
