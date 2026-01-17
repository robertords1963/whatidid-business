import React, { useState, useEffect } from 'react';
import { Share2, TrendingUp, AlertCircle, Star, MessageCircle, Send, Shield, Trash2, Search } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vtnzsyrojybyfeenkave.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ0bnpzeXJvanlieWZlZW5rYXZlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY3OTg1ODEsImV4cCI6MjA4MjM3NDU4MX0.6W9ueperYZpiIsLmBzNgJ9-wxPrwJ-mkhdDe2VGbKxU';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

console.log('🔧 WhatIDid App loaded with Supabase!');

const marqueeStyles = `
  @keyframes marquee {
    0% { transform: translateX(0); }
    100% { transform: translateX(-50%); }
  }
  .animate-marquee {
    animation: marquee 90s linear infinite;
  }
  .animate-marquee:hover {
    animation-play-state: paused;
  }
`;

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
    loadTopExperiences();
    loadQuotes();
    loadContentPages();
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
      
      const { data: batch1, error: error1 } = await supabase
        .from('experiences')
        .select('*')
        .order('source', { ascending: true })
        .order('random_order', { ascending: true })
        .range(0, 999);
      
      if (error1) throw error1;
      
      const { data: batch2, error: error2 } = await supabase
        .from('experiences')
        .select('*')
        .order('source', { ascending: true })
        .order('random_order', { ascending: true })
        .range(1000, 1999);
      
      if (error2) throw error2;
      
      const data = [...(batch1 || []), ...(batch2 || [])];
      
      console.log('🔍 DEBUG - Total experiências carregadas:', data.length);
      
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
        source: exp.source || 'upload',
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

  const loadTopExperiences = async () => {
    try {
      const { data, error } = await supabase
        .from('top_experiences')
        .select('position, experience_id');
      
      if (error) throw error;
      
      const topExp = { 1: null, 2: null, 3: null };
      if (data) {
        data.forEach(item => {
          if (item.experience_id) {
            topExp[item.position] = item.experience_id;
          }
        });
      }
      setTopExperiences(topExp);
    } catch (error) {
      console.error('Error loading top experiences:', error);
    }
  };

  const setTopExperience = async (position, experienceId) => {
    try {
      const currentPosition = Object.entries(topExperiences).find(
        ([pos, id]) => id === experienceId && parseInt(pos) !== position
      );
      
      if (currentPosition) {
        alert(`This experience is already set as Top ${currentPosition[0]}`);
        return;
      }

      const { error } = await supabase
        .from('top_experiences')
        .upsert({ 
          position, 
          experience_id: experienceId 
        }, { 
          onConflict: 'position' 
        });
      
      if (error) throw error;
      
      await loadTopExperiences();
    } catch (error) {
      console.error('Error setting top experience:', error);
      alert('Error setting top experience');
    }
  };

  const removeTopExperience = async (position) => {
    try {
      const { error } = await supabase
        .from('top_experiences')
        .update({ experience_id: null })
        .eq('position', position);
      
      if (error) throw error;
      
      await loadTopExperiences();
    } catch (error) {
      console.error('Error removing top experience:', error);
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
          total_ratings: 0,
          source: 'app'
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

  const [showKeyInsights, setShowKeyInsights] = useState(false);
  const [keyInsightCategory, setKeyInsightCategory] = useState('');
  const [filterMode, setFilterMode] = useState('individual');
  
  const [userRatings, setUserRatings] = useState({});
  const [hoverRating, setHoverRating] = useState({});
  const [newComment, setNewComment] = useState({});
  const [showComments, setShowComments] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const experiencesPerPage = 20;
  const [topExperiences, setTopExperiences] = useState({ 1: null, 2: null, 3: null });
  const [quotes, setQuotes] = useState([]);
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);
  const [editingQuote, setEditingQuote] = useState(null);
  const [newQuote, setNewQuote] = useState({ text: '', author: '', position: 'top' });
  const [contentPages, setContentPages] = useState({});
  const [editingContent, setEditingContent] = useState({ key: '', content: '' });
  const [showModal, setShowModal] = useState(null);

  const maxChars = {
    problem: 300,
    solution: 300,
    result: 200,
    comment: 500
  };

  const problemCategories = ['Health', 'Work', 'Relationship', 'Family', 'Finance', 'Education', 'Well-Being / Lifestyle', 'Entertainment / Creativity', 'Travel / Adventure', 'Technology / Others'];
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

  useEffect(() => {
    if (showAdminLogin || isAdmin) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [showAdminLogin, isAdmin]);

  useEffect(() => {
    if (quotes.length === 0) return;
    
    const interval = setInterval(() => {
      setCurrentQuoteIndex(prev => (prev + 1) % quotes.length);
    }, 7000);
    
    return () => clearInterval(interval);
  }, [quotes.length]);

  const loadQuotes = async () => {
    try {
      const { data, error } = await supabase
        .from('quotes')
        .select('*')
        .eq('active', true)
        .order('id', { ascending: true });
      
      if (error) throw error;
      
      const shuffled = data ? [...data].sort(() => Math.random() - 0.5) : [];
      setQuotes(shuffled);
    } catch (error) {
      console.error('Error loading quotes:', error);
    }
  };

  const addQuote = async () => {
    if (!newQuote.text.trim()) {
      alert('Please enter quote text');
      return;
    }
    
    if (newQuote.position === 'bottom' && !newQuote.author.trim()) {
      alert('Author is required for bottom quotes');
      return;
    }
    
    try {
      const { error } = await supabase
        .from('quotes')
        .insert([{
          text: newQuote.text,
          author: newQuote.author,
          position: newQuote.position,
          active: true
        }]);
      
      if (error) throw error;
      
      setNewQuote({ text: '', author: '', position: 'top' });
      await loadQuotes();
    } catch (error) {
      console.error('Error adding quote:', error);
      alert('Error adding quote');
    }
  };

  const updateQuote = async (id, text, author, position) => {
    try {
      const { error } = await supabase
        .from('quotes')
        .update({ text, author, position })
        .eq('id', id);
      
      if (error) throw error;
      
      setEditingQuote(null);
      await loadQuotes();
    } catch (error) {
      console.error('Error updating quote:', error);
      alert('Error updating quote');
    }
  };

  const deleteQuote = async (id) => {
    try {
      const { error } = await supabase
        .from('quotes')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      await loadQuotes();
    } catch (error) {
      console.error('Error deleting quote:', error);
      alert('Error deleting quote');
    }
  };

  const loadContentPages = async () => {
    try {
      const { data, error } = await supabase
        .from('content_pages')
        .select('*');
      
      if (error) throw error;
      
      const pagesObj = {};
      data?.forEach(page => {
        pagesObj[page.page_key] = page;
      });
      setContentPages(pagesObj);
    } catch (error) {
      console.error('Error loading content pages:', error);
    }
  };

  const updateContentPage = async (pageKey, content) => {
    try {
      const { error } = await supabase
        .from('content_pages')
        .update({ content, updated_at: new Date().toISOString() })
        .eq('page_key', pageKey);
      
      if (error) throw error;
      
      await loadContentPages();
      setEditingContent({ key: '', content: '' });
      alert('Content updated successfully!');
    } catch (error) {
      console.error('Error updating content:', error);
      alert('Error updating content');
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

  // ✅ MUDANÇA 1 APLICADA: Lógica de filtro ajustada
  const filteredExperiences = experiences.filter(exp => {
    // Se está na tab Key Insights
    if (filterMode === 'key_insights') {
      // Se selecionou categoria específica, filtrar por ela
      if (showKeyInsights && keyInsightCategory) {
        return exp.author === 'key_insights' && exp.problemCategory === keyInsightCategory;
      }
      // Se não selecionou categoria (All), mostrar todos os Key Insights
      return exp.author === 'key_insights';
    }
    
    // IMPORTANTE: Excluir Key Insights dos filtros normais (Individual Experiences)
    if (exp.author === 'key_insights') {
      return false;
    }
    
    // Filtros normais (sem Key Insights)
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

  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  const totalPages = Math.ceil(filteredExperiences.length / experiencesPerPage);
  const indexOfLastExperience = currentPage * experiencesPerPage;
  const indexOfFirstExperience = indexOfLastExperience - experiencesPerPage;
  const currentExperiences = filteredExperiences.slice(indexOfFirstExperience, indexOfLastExperience);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    const paginationTop = document.getElementById('pagination-top');
    if (paginationTop) {
      const yOffset = -100;
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
    <>
      <style>{marqueeStyles}</style>
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
                      placeholder="e.g., spam, scam, inappropriate"
                      className="w-full p-2 border-2 border-gray-300 rounded-lg"
                    />
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
                                </div>
                                <button
                                  onClick={async () => {
                                    const confirmKey = match.type === 'comment' 
                                      ? `comment-${match.expId}-${match.commentId}`
                                      : `exp-${match.expId}`;
                                    const isConfirming = confirmDelete === confirmKey;
                                    if (isConfirming) {
                                      await deleteExperienceFromSupabase(match.expId);
                                      setConfirmDelete(null);
                                    } else {
                                      setConfirmDelete(confirmKey);
                                    }
                                  }}
                                  className={`px-3 py-1 text-white text-xs rounded flex items-center gap-1 ${
                                    confirmDelete === (match.type === 'comment' ? `comment-${match.expId}-${match.commentId}` : `exp-${match.expId}`)
                                      ? 'bg-orange-600 hover:bg-orange-700 animate-pulse' 
                                      : 'bg-red-600 hover:bg-red-700'
                                  }`}
                                >
                                  <Trash2 size={12} />
                                  {confirmDelete === (match.type === 'comment' ? `comment-${match.expId}-${match.commentId}` : `exp-${match.expId}`) ? 'Confirm!' : 'Delete'}
                                </button>
                              </div>
                              <p className="text-sm text-gray-700 mb-1">
                                <span className="font-medium">Keyword:</span>{' '}
                                <span className="bg-yellow-300 px-1 rounded font-semibold">{match.keyword}</span>
                              </p>
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

            {isAdmin && (
              <div className="mt-4 bg-green-50 border-2 border-green-300 rounded-lg shadow-md p-4 max-w-4xl mx-auto">
                <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <MessageCircle size={20} />
                  Manage Inspirational Quotes
                </h3>
                
                <div className="bg-white rounded p-4 mb-4">
                  <h4 className="font-medium text-gray-700 mb-3">Add New Quote</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Quote Text</label>
                      <textarea
                        value={newQuote.text}
                        onChange={(e) => setNewQuote({...newQuote, text: e.target.value})}
                        placeholder="Enter the quote..."
                        className="w-full p-2 border-2 border-gray-300 rounded-lg resize-none"
                        rows="3"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Author</label>
                      <input
                        type="text"
                        value={newQuote.author}
                        onChange={(e) => setNewQuote({...newQuote, author: e.target.value})}
                        placeholder="Author name..."
                        className="w-full p-2 border-2 border-gray-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
                      <select
                        value={newQuote.position}
                        onChange={(e) => setNewQuote({...newQuote, position: e.target.value})}
                        className="w-full p-2 border-2 border-gray-300 rounded-lg"
                      >
                        <option value="top">Top</option>
                        <option value="bottom">Bottom</option>
                      </select>
                    </div>
                    <button
                      onClick={addQuote}
                      className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                    >
                      Add Quote
                    </button>
                  </div>
                </div>

                <div className="bg-white rounded p-4">
                  <h4 className="font-medium text-gray-700 mb-3">Existing Quotes ({quotes.length})</h4>
                  {quotes.length === 0 ? (
                    <p className="text-sm text-gray-500">No quotes yet</p>
                  ) : (
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {quotes.map((quote) => (
                        <div key={quote.id} className="border border-gray-300 rounded p-3">
                          <p className="text-sm italic text-gray-700 mb-2">"{quote.text}"</p>
                          <p className="text-xs text-gray-600 mb-2">— {quote.author}</p>
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                if (window.confirm('Delete this quote?')) {
                                  deleteQuote(quote.id);
                                }
                              }}
                              className="px-3 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700 flex items-center gap-1"
                            >
                              <Trash2 size={12} />
                              Delete
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {isAdmin && (
              <div className="mt-4 bg-blue-50 border-2 border-blue-300 rounded-lg shadow-md p-4 max-w-4xl mx-auto">
                <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <MessageCircle size={20} />
                  Manage Content Pages
                </h3>
                
                <div className="space-y-4">
                  {['community_guidelines', 'how_it_works', 'about'].map(pageKey => {
                    const page = contentPages[pageKey];
                    if (!page) return null;
                    
                    return (
                      <div key={pageKey} className="bg-white rounded p-4">
                        <div className="flex justify-between items-center mb-3">
                          <h4 className="font-medium text-gray-700">{page.title}</h4>
                          <button
                            onClick={() => setEditingContent({ key: pageKey, content: page.content })}
                            className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                          >
                            Edit Content
                          </button>
                        </div>
                        
                        {editingContent.key === pageKey ? (
                          <div className="space-y-3">
                            <textarea
                              value={editingContent.content}
                              onChange={(e) => setEditingContent({ ...editingContent, content: e.target.value })}
                              className="w-full p-3 border-2 border-gray-300 rounded-lg resize-none font-mono text-sm"
                              rows="15"
                            />
                            <div className="flex gap-2">
                              <button
                                onClick={() => updateContentPage(pageKey, editingContent.content)}
                                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                              >
                                Save Changes
                              </button>
                              <button
                                onClick={() => setEditingContent({ key: '', content: '' })}
                                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <p className="text-sm text-gray-600">
                            {page.content.substring(0, 200)}...
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {(() => {
            const topQuotes = quotes.filter(q => q.position === 'top');
            if (topQuotes.length === 0) return null;
            return (
              <div className="overflow-hidden py-2 mb-8">
                <div className="animate-marquee whitespace-nowrap inline-block">
                  {topQuotes.concat(topQuotes).map((quote, index) => (
                    <span key={index} className="inline-block mx-8 text-gray-700">
                      <span className="italic">{quote.text}</span>
                      {quote.author && <span className="text-indigo-600 ml-2">— {quote.author}</span>}
                    </span>
                  ))}
                </div>
              </div>
            );
          })()}

          {(() => {
            const top3Data = [1, 2, 3]
              .map(pos => experiences.find(exp => exp.id === topExperiences[pos]))
              .filter(Boolean);
            
            if (top3Data.length === 0) return null;
            
            return (
              <div className="bg-gradient-to-r from-purple-100 to-blue-100 rounded-2xl shadow-xl p-8 mb-8 border-2 border-purple-300">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-800 flex items-center justify-center gap-3 mb-2">
                    <Star className="text-yellow-500 fill-yellow-500" size={28} />
                    Top 3 Experiences This Week
                    <Star className="text-yellow-500 fill-yellow-500" size={28} />
                  </h2>
                  <p className="text-gray-600">Handpicked experiences, worth learning from</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {top3Data.map((exp, index) => (
                    <div key={exp.id} className="bg-white rounded-xl shadow-lg p-6 relative">
                      <div className="absolute -top-3 -left-3 bg-yellow-500 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg shadow-lg">
                        #{index + 1}
                      </div>
                      
                      <div className="space-y-4 mt-2">
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold text-red-600 flex items-center gap-2">
                              <AlertCircle size={16} />
                              Problem
                            </h4>
                            <span className="text-xs bg-red-100 text-red-700 px-3 py-1 rounded-full">
                              {exp.problemCategory}
                            </span>
                          </div>
                          <p className="text-sm text-gray-700 line-clamp-3">{exp.problem}</p>
                        </div>

                        <div>
                          <h4 className="font-semibold text-blue-600 flex items-center gap-2 mb-2">
                            <TrendingUp size={16} />
                            Action
                          </h4>
                          <p className={`text-sm text-gray-700 ${exp.author === 'key_insights' ? 'whitespace-pre-line' : 'line-clamp-3'}`}>
                            {exp.solution}
                          </p>
                        </div>

                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold text-green-600 flex items-center gap-2">
                              <Share2 size={16} />
                              Result
                            </h4>
                            <span className={`text-xs px-3 py-1 rounded-full ${getResultColor(exp.resultCategory)}`}>
                              {getResultLabel(exp.resultCategory)}
                            </span>
                          </div>
                          <p className="text-sm text-gray-700 line-clamp-3">{exp.result}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}

          {(() => {
            const bottomQuotes = quotes.filter(q => q.position === 'bottom');
            if (bottomQuotes.length === 0) return null;
            return (
              <div className="overflow-hidden py-2 mb-8">
                <div className="animate-marquee whitespace-nowrap inline-block">
                  {bottomQuotes.concat(bottomQuotes).map((quote, index) => (
                    <span key={index} className="inline-block mx-8 text-gray-700">
                      <span className="italic">"{quote.text}"</span>
                      <span className="text-indigo-600 ml-2">— {quote.author}</span>
                    </span>
                  ))}
                </div>
              </div>
            );
          })()}

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
                    placeholder="Describe the problem..."
                    className="w-full h-40 p-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none resize-none"
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
                    placeholder="What did you do?"
                    className="w-full h-40 p-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none resize-none"
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
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
            <div className="flex items-center gap-6 mb-4 flex-wrap">
              <h2 className="text-2xl font-bold text-gray-800">Shared Experiences ({experiences.length})</h2>
              
              <div className="flex items-center gap-2">
                {(() => {
                  const ratedExperiences = experiences.filter(exp => exp.totalRatings > 0);
                  const avgRating = ratedExperiences.length > 0 
                    ? ratedExperiences.reduce((sum, exp) => sum + exp.avgRating, 0) / ratedExperiences.length 
                    : 0;
                  
                  if (ratedExperiences.length === 0) return null;
                  
                  return (
                    <>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map(star => {
                          const fillPercentage = Math.min(Math.max(avgRating - star + 1, 0), 1) * 100;
                          return (
                            <div key={star} className="relative inline-block">
                              <Star size={18} className="text-gray-300" />
                              <div 
                                className="absolute top-0 left-0 overflow-hidden"
                                style={{ width: `${fillPercentage}%` }}
                              >
                                <Star size={18} className="text-yellow-500 fill-yellow-500" />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      <span className="text-lg font-bold text-gray-700">
                        {avgRating.toFixed(1)}
                      </span>
                      <span className="text-sm text-gray-600">out of 5</span>
                    </>
                  );
                })()}
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-md p-6 mb-6">
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-700">Filter Experiences</h3>
              </div>
              
              <div className="flex gap-2 mb-6 border-b-2 border-gray-200 pb-2">
                <button
                  onClick={() => {
                    setFilterMode('individual');
                    setShowKeyInsights(false);
                    setKeyInsightCategory('');
                    setFilters({ problemCategory: '', searchText: '', resultCategory: '', rating: '', gender: '', age: '', country: '' });
                  }}
                  className={`flex flex-col items-center justify-center px-4 py-3 rounded-t-lg font-medium transition-all ${
                    filterMode === 'individual'
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <span className="text-2xl mb-1">👥</span>
                  <span className="font-bold text-sm">Individual</span>
                  <span className="font-bold text-sm">Experiences</span>
                  <span className="text-[10px] opacity-80">(User Stories)</span>
                </button>
                
                <button
                  onClick={() => {
                    setFilterMode('key_insights');
                    setShowKeyInsights(false);
                    setKeyInsightCategory('');
                    setFilters({ problemCategory: '', searchText: '', resultCategory: '', rating: '', gender: '', age: '', country: '' });
                  }}
                  className={`flex flex-col items-center justify-center px-4 py-3 rounded-t-lg font-medium transition-all ${
                    filterMode === 'key_insights'
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <span className="text-2xl mb-1">🎯</span>
                  <span className="font-bold text-sm">Key</span>
                  <span className="font-bold text-sm">Insights</span>
                  <span className="text-[10px] opacity-80">(Curated Patterns)</span>
                </button>
              </div>

              {filterMode === 'individual' && (
                <>
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
                  <div className="mt-4">
                    <div className="text-sm font-bold text-purple-600 mb-2">
                      {filteredExperiences.length} {filteredExperiences.length === 1 ? 'experience found' : 'experiences found'}
                    </div>
                    {(filters.problemCategory || filters.searchText || filters.resultCategory || filters.rating || filters.gender || filters.age || filters.country) && (
                      <button
                        onClick={() => setFilters({ problemCategory: '', searchText: '', resultCategory: '', rating: '', gender: '', age: '', country: '' })}
                        className="text-sm text-purple-600 hover:text-purple-800 font-medium"
                      >
                        Clear filters
                      </button>
                    )}
                  </div>
                </>
              )}

              {/* ✅ MUDANÇA 2 APLICADA: Seção Key Insights reorganizada */}
              {filterMode === 'key_insights' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Select Category:</label>
                  <select
                    value={keyInsightCategory}
                    onChange={(e) => {
                      const value = e.target.value;
                      setKeyInsightCategory(value);
                      if (value) {
                        setShowKeyInsights(true);
                      } else {
                        setShowKeyInsights(false);
                      }
                      setFilters({ problemCategory: '', searchText: '', resultCategory: '', rating: '', gender: '', age: '', country: '' });
                    }}
                    className="w-full md:w-1/3 p-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
                  >
                    <option value="">All</option>
                    {problemCategories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                  
                  <div className="mt-4">
                    <div className="text-sm font-bold text-purple-600 mb-2">
                      {filteredExperiences.length} {filteredExperiences.length === 1 ? 'common case found' : 'common cases found'}
                    </div>
                    {keyInsightCategory && (
                      <button
                        onClick={() => {
                          setShowKeyInsights(false);
                          setKeyInsightCategory('');
                        }}
                        className="text-sm text-purple-600 hover:text-purple-800 font-medium"
                      >
                        Clear filters
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

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
                        pages.push(<span key="ellipsis-start" className="px-2 text-gray-500">...</span>);
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
                        pages.push(<span key="ellipsis-end" className="px-2 text-gray-500">...</span>);
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
              <div className="space-y-4">
                {currentExperiences.map(exp => (
                  <div key={exp.id} id={`exp-${exp.id}`} className="bg-white rounded-2xl shadow-lg p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3 flex-wrap">
                        {(exp.author || exp.gender || exp.age) && (
                          <span className="text-xs font-medium text-purple-600 bg-purple-50 px-3 py-1 rounded-full">
                            By: {exp.author === 'key_insights' ? 'KEY INSIGHTS - COMMON CASES' : [exp.author, exp.gender, exp.age].filter(Boolean).join(', ')}
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
                        <p className={`text-sm text-gray-700 ${exp.author === 'key_insights' ? 'whitespace-pre-line' : ''}`}>
                          {exp.solution}
                        </p>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold text-green-600 flex items-center gap-2">
                            <Share2 size={16} />
                            Result
                          </h4>
                          {exp.author === 'key_insights' && exp.resultCategory === 'varies' ? (
                            <span className="text-xs px-3 py-1 rounded-full bg-purple-100 text-purple-800">
                              Result Varies
                            </span>
                          ) : (
                            <span className={`text-xs px-3 py-1 rounded-full ${getResultColor(exp.resultCategory)}`}>
                              {getResultLabel(exp.resultCategory)}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-700">{exp.result}</p>
                      </div>
                    </div>
                    {isAdmin && (
                      <div className="mt-4 mb-4">
                        <div className="flex gap-2 items-center flex-wrap">
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
                            className={`px-4 py-2 text-white rounded text-sm flex items-center gap-2 ${
                              confirmDelete === `exp-${exp.id}` ? 'bg-orange-600 hover:bg-orange-700 animate-pulse' : 'bg-red-600 hover:bg-red-700'
                            }`}
                          >
                            <Trash2 size={14} />
                            {confirmDelete === `exp-${exp.id}` ? 'Confirm!' : 'Delete Experience'}
                          </button>
                          {confirmDelete === `exp-${exp.id}` && (
                            <button
                              onClick={() => setConfirmDelete(null)}
                              className="px-4 py-2 bg-gray-500 text-white rounded text-sm hover:bg-gray-600"
                            >
                              Cancel
                            </button>
                          )}
                          
                          <div className="flex gap-3 ml-4 items-center">
                            <span className="text-sm font-medium text-gray-700">Set as Top:</span>
                            {[1, 2, 3].map(position => (
                              <label key={position} className="flex items-center gap-1 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={topExperiences[position] === exp.id}
                                  onChange={async (e) => {
                                    if (e.target.checked) {
                                      await setTopExperience(position, exp.id);
                                    } else {
                                      await removeTopExperience(position);
                                    }
                                  }}
                                  className="w-4 h-4 text-yellow-500 rounded focus:ring-yellow-500"
                                />
                                <span className="text-sm font-medium text-yellow-600">
                                  #{position}
                                </span>
                              </label>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

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

          {showModal && contentPages[showModal] && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setShowModal(null)}>
              <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                <div className="sticky top-0 bg-white border-b-2 border-gray-200 p-6 flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-gray-800">{contentPages[showModal].title}</h2>
                  <button
                    onClick={() => setShowModal(null)}
                    className="text-gray-500 hover:text-gray-700 text-3xl leading-none"
                  >
                    ×
                  </button>
                </div>
                <div className="p-6">
                  <div className="prose prose-sm max-w-none">
                    {contentPages[showModal].content.split('\n').map((line, index) => {
                      if (line.startsWith('# ')) {
                        return <h1 key={index} className="text-2xl font-bold mb-4 mt-6">{line.substring(2)}</h1>;
                      } else if (line.startsWith('## ')) {
                        return <h2 key={index} className="text-xl font-bold mb-3 mt-5">{line.substring(3)}</h2>;
                      } else if (line.startsWith('### ')) {
                        return <h3 key={index} className="text-lg font-bold mb-2 mt-4">{line.substring(4)}</h3>;
                      } else if (line.startsWith('- ')) {
                        return <li key={index} className="ml-6 mb-1">{line.substring(2)}</li>;
                      } else if (line.trim() === '') {
                        return <br key={index} />;
                      } else {
                        return <p key={index} className="mb-3">{line}</p>;
                      }
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          <footer className="mt-12 pt-8 border-t-2 border-gray-200">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex gap-6 text-sm">
                <button 
                  onClick={() => setShowModal('how_it_works')}
                  className="text-gray-600 hover:text-purple-600 font-medium transition-colors"
                >
                  How It Works
                </button>
                <span className="text-gray-300">|</span>
                <button 
                  onClick={() => setShowModal('community_guidelines')}
                  className="text-gray-600 hover:text-purple-600 font-medium transition-colors"
                >
                  Community Guidelines
                </button>
                <span className="text-gray-300">|</span>
                <button 
                  onClick={() => setShowModal('about')}
                  className="text-gray-600 hover:text-purple-600 font-medium transition-colors"
                >
                  About
                </button>
                <span className="text-gray-300">|</span>
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
              </div>
              <div className="text-sm text-gray-500">
                © 2026 WhatIDid - All rights reserved
              </div>
            </div>
          </footer>
        </div>
      </div>
    </>
  );
}

