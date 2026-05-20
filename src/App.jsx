import React, { useState, useEffect, useLayoutEffect, useRef } from 'react';
import { Share2, TrendingUp, AlertCircle, Star, MessageCircle, Send, Shield, Trash2, Search, Users, Target, Briefcase } from 'lucide-react';
import { createClient } from '@supabase/supabase-js'; 

const supabaseUrl = 'https://scurkpoasiulwkmmechz.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNjdXJrcG9hc2l1bHdrbW1lY2h6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzExOTAyNTAsImV4cCI6MjA4Njc2NjI1MH0.M1THE2tNymvwmAQ4P6wKii_ISAyKdzGS95Ou_T-VxCw';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

console.log('🔧 WhatIDid App loaded with Supabase!');   

// Add marquee animation styles
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
  .animate-marquee-slow {
    animation: marquee 150s linear infinite;
  }
  .animate-marquee-slow:hover {
    animation-play-state: paused;
  }
  
  /* Estilos para modal de vídeo no mobile - TELA CHEIA */
  @media (max-width: 640px) {
    .video-modal-container {
      height: 100vh !important;
      height: 100dvh !important;
      width: 100vw !important;
      max-width: 100vw !important;
      padding: 0 !important;
      margin: 0 !important;
      background-color: black !important;
    }
    .video-modal-close-btn {
      position: fixed !important;
      top: 1rem !important;
      left: 1rem !important;
      z-index: 99999 !important;
    }
    .video-modal-player {
      height: 100vh !important;
      height: 100dvh !important;
      width: 100vw !important;
      background-color: black !important;
    }
  }
  
  @media (min-width: 641px) {
    .video-modal-container {
      background-color: transparent !important;
    }
    .video-modal-player {
      background-color: transparent !important;
    }
  }
  /* ⭐ ADICIONAR AQUI - Highlight flash animation */
  @keyframes highlight-flash {
    0%, 100% { background-color: transparent; }
    50% { background-color: rgba(147, 51, 234, 0.1); }
  }
  .highlight-flash {
    animation: highlight-flash 2s ease-in-out;
    border: 2px solid #9333ea !important;
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
  const shuffleOrderRef = useRef(null);

  // ⭐ ADICIONAR AQUI (junto com os outros useState) ⭐
  const [appSettings, setAppSettings] = useState({
  requireEmployeeLogin: false,
  editionName: 'pro',
  allowCvUpload: true,
  documentType: 'cv',
  showTop3: false,
  showMarquee: false
});

const [companyName, setCompanyName] = useState('');
const [companyLogoUrl, setCompanyLogoUrl] = useState('');
const [companyNameSize, setCompanyNameSize] = useState('medium');
const [companyLogoSize, setCompanyLogoSize] = useState('medium');
  
  // ⭐ ADICIONAR AQUI - Estados para Employee Login ⭐
  const [isEmployeeLoggedIn, setIsEmployeeLoggedIn] = useState(false);
  const [employeeId, setEmployeeId] = useState('');
  const [employeePassword, setEmployeePassword] = useState('');
  const [loginError, setLoginError] = useState('');
  // ⭐ FIM ⭐
  
  // Employee Management states
  const [employees, setEmployees] = useState([]);
  const [employeeSearch, setEmployeeSearch] = useState('');
  const [newEmployee, setNewEmployee] = useState({ employee_id: '', name: '', country: '', email: '' });
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [editingEmployeeData, setEditingEmployeeData] = useState({});
  const [showFirstAccess, setShowFirstAccess] = useState(false);
  const [firstAccessId, setFirstAccessId] = useState('');
  const [firstAccessPassword, setFirstAccessPassword] = useState('');
  const [firstAccessConfirm, setFirstAccessConfirm] = useState('');
  const [firstAccessError, setFirstAccessError] = useState('');
  const [firstAccessSuccess, setFirstAccessSuccess] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordId, setForgotPasswordId] = useState('');
  const [forgotPasswordMsg, setForgotPasswordMsg] = useState('');
  const [forgotPasswordError, setForgotPasswordError] = useState('');
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [changePasswordNew, setChangePasswordNew] = useState('');
  const [changePasswordConfirm, setChangePasswordConfirm] = useState('');
  const [changePasswordError, setChangePasswordError] = useState('');

  const [userCountry, setUserCountry] = useState('');
  const [addingComment, setAddingComment] = useState(null);
  const [userCountryName, setUserCountryName] = useState('');

  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [carouselStartIndex, setCarouselStartIndex] = useState(0);
  // NOVOS ESTADOS: Mapeamento e Navegação
  const [showMappingModal, setShowMappingModal] = useState(false);
  const [suggestedMapping, setSuggestedMapping] = useState(null);
  const [pendingExperience, setPendingExperience] = useState(null);
  const [mappedFilter, setMappedFilter] = useState(null);
  
  // Responsivo: 4 no desktop, 3 no tablet, 2 no mobile
  const getVideosPerPage = () => {
    if (typeof window === 'undefined') return 4;
    if (window.innerWidth < 640) return 3; // Mobile - 3 vídeos
    if (window.innerWidth < 768) return 4; // Tablet - 4 vídeos
    return 4; // Desktop - 4 vídeos
  };
  
  const [videosPerPage, setVideosPerPage] = useState(getVideosPerPage());
  
  // Atualizar ao redimensionar
  useEffect(() => {
    const handleResize = () => {
      setVideosPerPage(getVideosPerPage());
      // Resetar para início ao mudar tamanho
      setCarouselStartIndex(0);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  useEffect(() => {
  detectUserCountry();
  loadExperiences();
  loadTopExperiences();
  loadAppSettings();
  loadQuotes();
  loadContentPages();
  loadPromotionalVideos();
  loadProblemCategories();
  loadEmployees();
}, []);

// Verificar login do funcionário ao carregar
useEffect(() => {
  const loggedIn = localStorage.getItem('employeeLoggedIn');
  const savedEmployeeId = localStorage.getItem('employeeId');
  
  if (loggedIn === 'true' && savedEmployeeId) {
    setIsEmployeeLoggedIn(true);
    setEmployeeId(savedEmployeeId);
  }
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
  
const loadExperiences = async (skipLoading = false) => {
  try {
    if (!skipLoading) {
      setLoading(true);
    }
    
    // Buscar primeiro lote (0-999) - Supabase limita em 1000
    const { data: batch1, error: error1 } = await supabase
      .from('experiences')
      .select('*')
      .order('source', { ascending: true })
      .order('id', { ascending: false })
      .range(0, 999);
    
    if (error1) throw error1;
    
    // Buscar segundo lote (1000-1999) - pega as 53 restantes
    const { data: batch2, error: error2 } = await supabase
      .from('experiences')
      .select('*')
      .order('source', { ascending: true })
      .order('id', { ascending: false })
      .range(1000, 1999);
    
    if (error2) throw error2;
    
    // Combinar os 2 lotes
    const data = [...(batch1 || []), ...(batch2 || [])];
    
    console.log('🔍 DEBUG - Total experiências carregadas:', data.length);
    
    const transformedData = data.map(exp => ({
      id: exp.id,
      problem: exp.problem,
      problemCategory: exp.problem_category,
      solution: exp.solution,
      result: exp.result,
      resultCategory: exp.result_category,
      industrySector: exp.industry_sector || '', // ⭐ ADICIONAR
      relatedCommonCaseId: exp.related_common_case_id || null, // ⭐ ADICIONAR
      author: exp.author || '',
      gender: exp.gender || '',
      age: exp.age || '',
      country: exp.country || '',
      avgRating: exp.avg_rating || 0,
      totalRatings: exp.total_ratings || 0,
      source: exp.source || 'upload',
      cvUrl: exp.cv_url || null,  // ⭐ ADICIONAR
      cvFilename: exp.cv_filename || null,  // ⭐ ADICIONAR
      employeeId: exp.employee_id || null,  // ⭐ ADICIONAR
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
      employeeId: c.employee_id || null,
      country: c.country,
      cvUrl: c.cv_url || null,
      cvFilename: c.cv_filename || null
    });
      });
      
      transformedData.forEach(exp => {
        exp.comments = commentsByExp[exp.id] || [];
      });
    }

   const userExps = transformedData.filter(e => e.source === 'app');
const syntheticExps = transformedData.filter(e => e.source !== 'app' && e.author !== 'key_insights');
const keyInsights = transformedData.filter(e => e.author === 'key_insights');

if (!shuffleOrderRef.current) {
  for (let i = syntheticExps.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [syntheticExps[i], syntheticExps[j]] = [syntheticExps[j], syntheticExps[i]];
  }
  shuffleOrderRef.current = syntheticExps.map(e => e.id);
}

const orderedSynthetic = shuffleOrderRef.current
  .map(id => syntheticExps.find(e => e.id === id))
  .filter(Boolean);

setExperiences([...keyInsights, ...userExps, ...orderedSynthetic]);
  } catch (error) {
    console.error('Error loading experiences:', error);
    alert('Error loading data. Please refresh the page.');
  } finally {
    if (!skipLoading) {
      setLoading(false);
    }
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

// ⭐ ADICIONAR AQUI ⭐
const loadAppSettings = async () => {
  try {
    const { data, error } = await supabase
      .from('app_settings')
      .select('*')
      .single();
    
    if (error) throw error;
    
    if (data) {
  setAppSettings({
    requireEmployeeLogin: data.require_employee_login,
    editionName: data.edition_name,
    allowCvUpload: data.allow_cv_upload,
    documentType: data.document_type || 'cv',
    showTop3: data.show_top3 || false,
    showMarquee: data.show_marquee || false
  });
  setCompanyName(data.company_name || '');
  setCompanyLogoUrl(data.company_logo_url || '');
  setCompanyNameSize(data.company_name_size || 'medium');
  setCompanyLogoSize(data.company_logo_size || 'medium');
}
  } catch (error) {
    console.error('Error loading app settings:', error);
  }
};

const loadProblemCategories = async () => {
  try {
    const { data, error } = await supabase
      .from('problem_categories')
      .select('*')
      .eq('active', true)
      .order('display_order', { ascending: true });
    if (error) throw error;
    if (data && data.length > 0) {
      setProblemCategories(data.map(c => c.name));
    }
  } catch (error) {
    console.error('Error loading problem categories:', error);
  }
};

// ==================== EMPLOYEE MANAGEMENT ====================

const loadEmployees = async () => {
  try {
    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .order('employee_id', { ascending: true });
    if (error) throw error;
    setEmployees(data || []);
  } catch (error) {
    console.error('Error loading employees:', error);
  }
};

const addEmployee = async () => {
  if (!newEmployee.employee_id.trim() || !newEmployee.name.trim()) {
    alert('Employee ID and Name are required');
    return;
  }
  try {
    const { error } = await supabase.from('employees').insert([{
      employee_id: newEmployee.employee_id.trim(),
      name: newEmployee.name.trim(),
      country: newEmployee.country.trim(),
      email: newEmployee.email.trim(),
      status: 'pending',
      active: true
    }]);
    if (error) throw error;
    setNewEmployee({ employee_id: '', name: '', country: '', email: '' });
    await loadEmployees();
    alert('Employee added successfully!');
  } catch (error) {
    console.error('Error adding employee:', error);
    alert('Error adding employee. ID may already exist.');
  }
};

const updateEmployee = async (empId) => {
  try {
    const { error } = await supabase.from('employees')
      .update({
        name: editingEmployeeData.name,
        country: editingEmployeeData.country,
        email: editingEmployeeData.email
      })
      .eq('employee_id', empId);
    if (error) throw error;
    setEditingEmployee(null);
    setEditingEmployeeData({});
    await loadEmployees();
  } catch (error) {
    console.error('Error updating employee:', error);
    alert('Error updating employee');
  }
};

const deleteEmployee = async (empId) => {
  if (!window.confirm(`Delete employee ${empId}? This will not delete their experiences.`)) return;
  try {
    const { error } = await supabase.from('employees').delete().eq('employee_id', empId);
    if (error) throw error;
    await loadEmployees();
  } catch (error) {
    console.error('Error deleting employee:', error);
    alert('Error deleting employee');
  }
};

const handleExcelUpload = async (file) => {
  try {
    const XLSX = await import('https://cdn.sheetjs.com/xlsx-0.20.0/package/xlsx.mjs');
    const data = await file.arrayBuffer();
    const wb = XLSX.read(data);
    const ws = wb.Sheets[wb.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(ws);
    
    let added = 0, errors = 0;
    for (const row of rows) {
      const empId = String(row['Employee ID'] || row['employee_id'] || '').trim();
      const name = String(row['Name'] || row['name'] || '').trim();
      const country = String(row['Country'] || row['country'] || '').trim();
      const email = String(row['Email'] || row['email'] || '').trim();
      if (!empId || !name) { errors++; continue; }
      const { error } = await supabase.from('employees').insert([{
        employee_id: empId, name, country, email, status: 'pending', active: true
      }]);
      if (error) { errors++; } else { added++; }
    }
    await loadEmployees();
    alert(`Upload complete! Added: ${added}, Errors/Skipped: ${errors}`);
  } catch (error) {
    console.error('Error uploading Excel:', error);
    alert('Error reading Excel file. Make sure columns are: Employee ID, Name, Country, Email');
  }
};

const handleFirstAccess = async () => {
  setFirstAccessError('');
  if (!firstAccessId.trim() || !firstAccessPassword.trim()) {
    setFirstAccessError('Please enter Employee ID and password');
    return;
  }
  if (firstAccessPassword !== firstAccessConfirm) {
    setFirstAccessError('Passwords do not match');
    return;
  }
  if (firstAccessPassword.length < 6) {
    setFirstAccessError('Password must be at least 6 characters');
    return;
  }
  try {
    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .eq('employee_id', firstAccessId.trim())
      .eq('active', true)
      .single();
    if (error || !data) {
      setFirstAccessError('Employee ID not found');
      return;
    }
    if (data.password && data.status === 'active') {
      setFirstAccessError('This Employee ID already has a password. Use Forgot Password instead.');
      return;
    }
    const { error: updateError } = await supabase
      .from('employees')
      .update({ password: firstAccessPassword, status: 'active' })
      .eq('employee_id', firstAccessId.trim());
    if (updateError) throw updateError;
    setFirstAccessSuccess(true);
  } catch (error) {
    console.error('First access error:', error);
    setFirstAccessError('Error setting password. Please try again.');
  }
};

const handleForgotPassword = async () => {
  setForgotPasswordError('');
  setForgotPasswordMsg('');
  if (!forgotPasswordId.trim()) {
    setForgotPasswordError('Please enter your Employee ID');
    return;
  }
  try {
    const { data, error } = await supabase
      .from('employees')
      .select('email, name')
      .eq('employee_id', forgotPasswordId.trim())
      .eq('active', true)
      .single();
    if (error || !data) {
      setForgotPasswordError('Employee ID not found');
      return;
    }
    if (!data.email) {
      setForgotPasswordError('No email registered for this Employee ID. Please contact your Admin.');
      return;
    }
    // Generate temp password
    const tempPassword = Math.random().toString(36).slice(-8);
    await supabase.from('employees')
      .update({ password: tempPassword, status: 'active', force_password_change: true })
      .eq('employee_id', forgotPasswordId.trim());

    // Load EmailJS and send email
    if (!window.emailjs) {
      await new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js';
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
      });
      window.emailjs.init('qvhCb3G8AEyQmrUCF');
    }

    await window.emailjs.send('service_ad7ltxl', 'template_ty07scl', {
      to_email: data.email,
      name: data.name || forgotPasswordId.trim(),
      email: data.email,
      message: `Hi ${data.name || forgotPasswordId.trim()},\n\nYour temporary password for WhatIDid is: ${tempPassword}\n\nPlease login with this password. You will be asked to set a new password after logging in.\n\nWhatIDid Team`
    });

    // Mask email for display
    const emailParts = data.email.split('@');
    const masked = emailParts[0].slice(0,2) + '***@' + emailParts[1];
    setForgotPasswordMsg(`A temporary password has been sent to ${masked}. Please check your inbox.`);
  } catch (error) {
    console.error('Forgot password error:', error);
    setForgotPasswordError('Error sending email. Please contact your Admin.');
  }
};

// ==================== END EMPLOYEE MANAGEMENT ====================

const handleEmployeeLogin = async () => {
  setLoginError('');
  
  if (!employeeId.trim() || !employeePassword.trim()) {
    setLoginError('Please enter Employee ID and Password');
    return;
  }
  
  try {
    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .eq('employee_id', employeeId)
      .eq('password', employeePassword)
      .eq('active', true)
      .single();
    
    if (error || !data) {
      setLoginError('Invalid Employee ID or Password');
      return;
    }
    
// Login bem-sucedido
  setIsEmployeeLoggedIn(true);
  localStorage.setItem('employeeLoggedIn', 'true');
  localStorage.setItem('employeeId', employeeId);
  setEmployeePassword('');
  
  // If force_password_change is set, prompt to change password
  if (data.force_password_change || data.status === 'pending') {
    setShowChangePassword(true);
  }
  
  } catch (error) {
    console.error('Login error:', error);
    setLoginError('Login failed. Please try again.');
  }
};

  const handleEmployeeLogout = () => {
  setIsEmployeeLoggedIn(false);
  setEmployeeId('');
  localStorage.removeItem('employeeLoggedIn');
  localStorage.removeItem('employeeId');
};

  
  // ⭐ FIM ⭐

  // ⭐ FUNÇÃO DE UPLOAD DE CV ⭐
  const uploadCvToSupabase = async (file) => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = fileName;

      const { data, error } = await supabase.storage
        .from('cvs')
        .upload(filePath, file);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('cvs')
        .getPublicUrl(filePath);

      return { url: publicUrl, filename: file.name };
    } catch (error) {
      console.error('Error uploading CV:', error);
      throw error;
    }
  };

const getEmployeeCountry = async (employeeId) => {
  try {
    const { data, error } = await supabase
      .from('employees')
      .select('country')
      .eq('employee_id', employeeId)
      .single();
    
    if (error) throw error;
    return data?.country || '';
  } catch (error) {
    console.error('Error getting employee country:', error);
    return '';
  }
};

const getEmployeeName = async (employeeId) => {
  try {
    const { data, error } = await supabase
      .from('employees')
      .select('name')
      .eq('employee_id', employeeId)
      .single();
    
    if (error) throw error;
    return data?.name || '';
  } catch (error) {
    console.error('Error getting employee name:', error);
    return '';
  }
};
  
const deleteFileFromStorage = async (fileUrl) => {
  if (!fileUrl) return;
  
  try {
    // Extrair o nome do arquivo da URL
    const urlParts = fileUrl.split('/');
    const fileName = urlParts[urlParts.length - 1];
    
    const { error } = await supabase.storage
      .from('cvs')
      .remove([fileName]);
    
    if (error) throw error;
    console.log('✅ File deleted from storage:', fileName);
  } catch (error) {
    console.error('❌ Error deleting file from storage:', error);
  }
};
  
  const setTopExperience = async (position, experienceId) => {
    try {
      // Check if this experience is already set in another position
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

// FUNÇÃO 1: Auto-matching
  const findBestCommonCaseMatch = (userExperience) => {
  const userProblemText = userExperience.problem.toLowerCase();
  
  console.log('🔍 USER PROBLEM:', userProblemText);
  
  const userKeywords = [...new Set(
    userProblemText.split(' ').filter(word => word.length > 4)
  )];
  
  console.log('🔑 PROBLEM KEYWORDS:', userKeywords.length, userKeywords);
  
  const keyInsights = experiences.filter(
    exp => exp.author === 'key_insights' && exp.problemCategory === userExperience.problemCategory
  );
  
  console.log('🎯 KEY INSIGHTS FOUND:', keyInsights.length);
  
  if (keyInsights.length === 0) return null;
  if (userKeywords.length === 0) return null;
  
  const matches = [];
  
  keyInsights.forEach(insight => {
    const insightText = insight.problem.toLowerCase();
    
    console.log('📝 INSIGHT:', insight.problem.substring(0, 50));
    
    let score = 0;
    userKeywords.forEach(keyword => {
      if (insightText.includes(keyword)) {
        score += 1;
        console.log('✅ MATCH:', keyword);
      }
    });
    
console.log('📊 MATCHES:', score);
    
    if (score >= 1) {
      matches.push({
        match: insight,
        confidence: score
      });
    }
  });
  
  console.log('🏆 TOTAL MATCHES ≥70%:', matches.length);
  
if (matches.length > 0) {
    matches.sort((a, b) => b.confidence - a.confidence);
    console.log('✅ MODAL SHOULD APPEAR WITH', matches.length, 'MATCHES!');
    return matches.slice(0, 5);
  }
  
  console.log('❌ NO MATCHES FOUND');
  return null;
};

  // FUNÇÃO 2: Reset form
  const resetForm = () => {
    setCurrentEntry({
      problem: '',
      problemCategory: '',
      solution: '',
      result: '',
      resultCategory: '',
      industrySector: '',
      author: '',
      gender: '',
      age: '',
      country: userCountryName || ''
    });

    // ⭐ FORÇAR MUDANÇA PARA INDIVIDUAL EXPERIENCES
    setFilterMode('individual');
    setShowKeyInsights(false);
    setKeyInsightCategory('');
    
    setCurrentPage(1);
    
    setTimeout(() => {
      const firstExp = document.getElementById('first-experience');
      if (firstExp) {
        const yOffset = -100;
        const y = firstExp.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
    }, 500);
  };

  // FUNÇÃO 3: Confirmar mapeamento
  const confirmMapping = async (selectedIds) => {
  setShowMappingModal(false);
  
  if (selectedIds && selectedIds.length > 0) {
    // Por enquanto, vamos linkar apenas com o primeiro selecionado
    // (Supabase aceita só 1 related_common_case_id por experiência)
    const relatedId = selectedIds[0];
    const success = await addExperienceToSupabase(pendingExperience, relatedId);
    
    if (success) {
      resetForm();
    }
  } else {
    // Usuário rejeitou todos
    console.log('❌ No mapping selected');
    const success = await addExperienceToSupabase(pendingExperience, null);
    
    if (success) {
      resetForm();
    }
  }
  
  setSuggestedMapping(null);
  setPendingExperience(null);
};

  // FUNÇÃO 4: Navegar Pro → Key Insight
  const navigateToKeyInsight = (commonCaseId) => {
    console.log('=== navigateToKeyInsight ===');
    console.log('commonCaseId:', commonCaseId);
    
    setFilterMode('key_insights');
    setShowKeyInsights(false);
    setKeyInsightCategory('');
    setFilters({
      problemCategory: '',
      searchText: '',
      resultCategory: '',
      rating: '',
      gender: '',
      age: '',
      country: '',
      industrySector: ''
    });
    setMappedFilter(null);
    // ⭐ CALCULAR PÁGINA CORRETA DO COMMON CASE
const keyInsights = experiences.filter(e => e.author === 'key_insights');
const index = keyInsights.findIndex(e => e.id === commonCaseId);
const correctPage = Math.ceil((index + 1) / experiencesPerPage);

console.log(`Common Case ${commonCaseId} está no índice ${index}, página ${correctPage}`);
setCurrentPage(correctPage > 0 ? correctPage : 1);
    
    console.log('Estado alterado para key_insights');


    
// Aguardar React renderizar a página correta
setTimeout(() => {
  // Tentar múltiplas vezes até encontrar o elemento
  let attempts = 0;
  const tryScroll = setInterval(() => {
    
      attempts++;
      console.log(`Tentativa ${attempts}: Procurando exp-${commonCaseId}`);
      
      const expElement = document.getElementById(`exp-${commonCaseId}`);
      
      if (expElement) {
        console.log('✅ ELEMENTO ENCONTRADO!');
        clearInterval(tryScroll);
        
        const yOffset = -100;
        const y = expElement.getBoundingClientRect().top + window.pageYOffset + yOffset;
        console.log('Scrollando para y:', y);
        window.scrollTo({ top: y, behavior: 'smooth' });
        
        expElement.classList.add('highlight-flash');
        setTimeout(() => expElement.classList.remove('highlight-flash'), 2000);
      } else if (attempts >= 15) {
        console.log('❌ Desistindo após 15 tentativas');
        clearInterval(tryScroll);
      }
    }, 200); // Tentar a cada 200ms
    }, 800); // ⭐ Aumentado para dar mais tempo ao React renderizar
  };

  // FUNÇÃO 5: Navegar Key Insight → Pro
  const showMappedExperiences = (commonCaseId) => {
  setFilterMode('individual');
  setFilters({
    problemCategory: '',
    searchText: '',
    resultCategory: '',
    rating: '',
    gender: '',
    age: '',
    country: '',
    industrySector: ''
  });
  setMappedFilter(commonCaseId);
  setCurrentPage(1);
  
  setTimeout(() => {
    // Scroll para o primeiro card de experiência (onde está o banner roxo)
    const firstExp = document.getElementById('first-experience');
    if (firstExp) {
      const yOffset = -120; // Margem do topo
      const y = firstExp.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  }, 500); // Aumentar timeout para dar tempo do banner renderizar
};

  // FUNÇÃO 6: Get Common Case Name
  const getCommonCaseName = (commonCaseId) => {
  const commonCase = experiences.find(e => e.id === commonCaseId);
  return commonCase ? commonCase.problem.substring(0, 60) + '...' : 'Common Case';
};
  
  const addExperienceToSupabase = async (newExperience, relatedCommonCaseId = null) => {
  try {
    let cvUrl = null;
    let cvFilename = null;
    
    // Se tem CV selecionado, fazer upload primeiro
    if (selectedCv) {
      const cvData = await uploadCvToSupabase(selectedCv);
      cvUrl = cvData.url;
      cvFilename = cvData.filename;
    }
    
    const { data, error } = await supabase
      .from('experiences')
      .insert([{
        problem: newExperience.problem,
        problem_category: newExperience.problemCategory,
        solution: newExperience.solution,
        result: newExperience.result,
        result_category: newExperience.resultCategory,
        industry_sector: newExperience.industrySector || '',
        related_common_case_id: relatedCommonCaseId,
        author: appSettings.requireEmployeeLogin ? (await getEmployeeName(employeeId)) : (newExperience.author || ''),
        gender: newExperience.gender || '',
        age: newExperience.age || '',
        country: newExperience.country || '',
        employee_id: appSettings.requireEmployeeLogin ? employeeId : null,  // ⭐ ADICIONAR
        avg_rating: 0,
        total_ratings: 0,
        source: 'app',
        cv_url: cvUrl,
        cv_filename: cvFilename
      }])
      .select();
    
    if (error) throw error;
    
    // Limpar CV selecionado após sucesso
    setSelectedCv(null);
    
    await loadExperiences(true);
    return true;
  } catch (error) {
    console.error('Error adding experience:', error);
    alert('Error saving experience.');
    return false;
  }
};
      
      

  const deleteExperienceFromSupabase = async (id) => {
  try {
    // Salvar posição
    const scrollPosition = window.pageYOffset;
    
    // Buscar a experiência para verificar owner e arquivos
    const exp = experiences.find(e => e.id === id);
    
    // Verificar se é o dono (modo Corp)
if (appSettings.requireEmployeeLogin && !isAdmin && exp.employeeId !== employeeId) {
  alert('You can only delete your own experiences!');
  return false;
}
    
    // Deletar arquivo da experiência (se existir) 
    if (exp.cvUrl) {
      await deleteFileFromStorage(exp.cvUrl);
    }
    
    // Deletar arquivos dos comentários (CASCADE vai deletar os comentários, mas não os arquivos)
    exp.comments.forEach(async (comment) => {
      if (comment.cvUrl) {
        await deleteFileFromStorage(comment.cvUrl);
      }
    });
    
    // Deletar experiência (CASCADE deleta comentários automaticamente)
    const { error } = await supabase
      .from('experiences')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    await loadExperiences(true);
    
    // Restaurar posição
    setTimeout(() => {
      window.scrollTo({ top: scrollPosition, behavior: 'instant' });
    }, 100);
    
    return true;
  } catch (error) {
    console.error('Error deleting experience:', error);
    alert('Error deleting experience.');
    return false;
  }
};

  const handleAddComment = async (experienceId) => {
  if (!newComment[experienceId]?.trim()) {
    alert('Please enter a comment!');
    return;
  }
  
  try {
    let cvUrl = null;
    let cvFilename = null;
    
    // Se tem CV selecionado para este comentário, fazer upload
    if (commentCvFiles[experienceId]) {
      const cvData = await uploadCvToSupabase(commentCvFiles[experienceId]);
      cvUrl = cvData.url;
      cvFilename = cvData.filename;
    }
    
    const { error } = await supabase
      .from('comments')
      .insert([{
        experience_id: experienceId,
        comment_text: newComment[experienceId],
        author: appSettings.requireEmployeeLogin ? (await getEmployeeName(employeeId)) : '',
        employee_id: appSettings.requireEmployeeLogin ? employeeId : null,
        country: userCountryName || '',
        cv_url: cvUrl,
        cv_filename: cvFilename
      }]);
    
    if (error) throw error;
    
    // Limpar campo e CV
    setNewComment({...newComment, [experienceId]: ''});
    const newFiles = {...commentCvFiles};
    delete newFiles[experienceId];
    setCommentCvFiles(newFiles);
    
    await loadExperiences(true);
  } catch (error) {
    console.error('Error adding comment:', error);
    alert('Error adding comment');
  }
  };


const [currentEntry, setCurrentEntry] = useState({
    problem: '',
    problemCategory: '',
    solution: '',
    result: '',
    resultCategory: '',
    industrySector: '', // ⭐ ADICIONAR ESTA LINHA
    author: '',
    gender: '',
    age: '',
    country: ''
  });

// ⭐ Estados para gerenciar CVs
const [selectedCv, setSelectedCv] = useState(null);
const [commentCvFiles, setCommentCvFiles] = useState({});
const [showCvModal, setShowCvModal] = useState(false);
const [currentCvUrl, setCurrentCvUrl] = useState(null);
  
  const [filters, setFilters] = useState({
    problemCategory: '',
    searchText: '',
    resultCategory: '',
    rating: '',
    gender: '',
    age: '',
    country: '',
    industrySector: ''
  });

  const [showKeyInsights, setShowKeyInsights] = useState(false);
  const [keyInsightCategory, setKeyInsightCategory] = useState('');
  const [filterMode, setFilterMode] = useState('individual');
  
  const [userRatings, setUserRatings] = useState({});
  const [ratedInSession, setRatedInSession] = useState(new Set());
  const [hoverRating, setHoverRating] = useState({});
  const [newComment, setNewComment] = useState({});
  const [showComments, setShowComments] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const experiencesPerPage = 20;
  const [topExperiences, setTopExperiences] = useState({ 1: null, 2: null, 3: null });
  const [editingExperience, setEditingExperience] = useState(null);
  const [editingData, setEditingData] = useState({});
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [quotes, setQuotes] = useState([]);
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);
  const [editingQuote, setEditingQuote] = useState(null);
  const [newQuote, setNewQuote] = useState({ text: '', author: '', position: 'top' });
  const [showGuidelinesModal, setShowGuidelinesModal] = useState(false);
  const [showHowItWorksModal, setShowHowItWorksModal] = useState(false);
  const [guidelines, setGuidelines] = useState('');
  const [editingGuidelines, setEditingGuidelines] = useState(false);
  const [contentPages, setContentPages] = useState({});
  const [editingContent, setEditingContent] = useState({ key: '', content: '' });
  const [showModal, setShowModal] = useState(null);
  
  // Estados para gerenciar vídeos promocionais
  const [promotionalVideos, setPromotionalVideos] = useState([]);
  const [newVideoFile, setNewVideoFile] = useState(null);
  const [newVideoDuration, setNewVideoDuration] = useState('');
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [editingVideoDuration, setEditingVideoDuration] = useState({});
  const [newItemType, setNewItemType] = useState('video');
  const [newLinkUrl, setNewLinkUrl] = useState('');
  const [newLinkLabel, setNewLinkLabel] = useState('');
  const [currentPdfPage, setCurrentPdfPage] = useState(1);
  const [pdfTotalPages, setPdfTotalPages] = useState(0);
  const [pdfThumbnails, setPdfThumbnails] = useState({});

  const maxChars = {
    problem: 300,
    solution: 300,
    result: 200,
    comment: 500
  };

  const [problemCategories, setProblemCategories] = useState([
  'Project Execution',
  'Process & Operations',
  'Technology & Systems',
  'Commercial Execution',
  'People & Leadership',
  'Governance & Compliance',
  'Strategy & Growth',
  'Cust. Exp. & Service',
  'Other'
]);
  const [editingCategory, setEditingCategory] = useState(null);
  const [newCategoryName, setNewCategoryName] = useState('');


const industrySectors = [
    'Technology & Digital',
    'Financial Services',
    'Industrial & Manufacturing',
    'Retail & Consumer',
    'Healthcare & Life Sciences',
    'Energy & Infrastructure',
    'Professional Services',
    'Public Sector / Non-Profit',
    'Others'
  ];

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
    
    const matchResults = findBestCommonCaseMatch(currentEntry);
    
    if (matchResults && matchResults.length > 0) {
      setSuggestedMapping(matchResults); // Array agora
      setPendingExperience(currentEntry);
      setShowMappingModal(true);
    } else {
      const success = await addExperienceToSupabase(currentEntry, null);
      
      if (success) {
        resetForm();
      }
    }
  }
};

  const handleUserRating = async (expId, rating) => {
  if (userRatings[expId]) {
    console.log('🔍 Rating:', { expId, rating, filterMode });
    alert('You have already rated this experience in this session!');
    return;
  }
  
  try {
    // Salvar posição atual
    const expElement = document.getElementById(`exp-${expId}`);
    const scrollPosition = expElement ? expElement.offsetTop - 100 : 0;
    
    setUserRatings({...userRatings, [expId]: rating});
    setRatedInSession(new Set([...ratedInSession, expId]));  
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
await loadExperiences(true);

// Aguardar renderização e scrollar
const scrollToExp = () => {
  const expElement = document.getElementById(`exp-${expId}`);
  if (expElement) {
    const yOffset = -100;
    const y = expElement.getBoundingClientRect().top + window.pageYOffset + yOffset;
    window.scrollTo({ top: y, behavior: 'smooth' });
    return true;
  }
  return false;
};
    
// Tentar várias vezes até encontrar
let attempts = 0;
const tryScroll = setInterval(() => {
  if (scrollToExp() || attempts >= 10) {
    clearInterval(tryScroll);
  }
  attempts++;
}, 200);
  } catch (error) {
    console.error('Error in handleUserRating:', error);
  }
};

const openVideoModal = (index) => {
  if (index !== currentVideoIndex) {
    setCurrentPdfPage(1);
    setPdfTotalPages(0);
  }
  setCurrentVideoIndex(index);
  setVideoModalOpen(true);
  document.body.style.overflow = 'hidden';
  
  // Forçar fullscreen no mobile após renderizar
  setTimeout(() => {
    const video = document.querySelector('.video-modal-player');
    if (video && window.innerWidth <= 640) {
      // Tentar entrar em fullscreen no mobile
      if (video.requestFullscreen) {
        video.requestFullscreen().catch(err => console.log('Fullscreen error:', err));
      } else if (video.webkitRequestFullscreen) {
        video.webkitRequestFullscreen();
      } else if (video.mozRequestFullScreen) {
        video.mozRequestFullScreen();
      } else if (video.msRequestFullscreen) {
        video.msRequestFullscreen();
      } else if (video.webkitEnterFullscreen) {
        // Para iOS Safari
        video.webkitEnterFullscreen();
      }
    }
  }, 300);
};

const closeVideoModal = () => {
  console.log('closeVideoModal called');
  
  // Verificar se estiver em fullscreen, sair primeiro
  const isFullscreen = !!(
    document.fullscreenElement || 
    document.webkitFullscreenElement || 
    document.mozFullScreenElement || 
    document.msFullscreenElement
  );
  
  if (isFullscreen) {
    console.log('In fullscreen, exiting...');
    
    // Tentar sair de fullscreen
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    } else if (document.mozCancelFullScreen) {
      document.mozCancelFullScreen();
    } else if (document.msExitFullscreen) {
      document.msExitFullscreen();
    }
    
    // Tentar também no elemento video para iOS
    const video = document.querySelector('.video-modal-player');
    if (video && video.webkitExitFullscreen) {
      video.webkitExitFullscreen();
    }
    
    // O useEffect vai detectar a saída de fullscreen e fechar o modal
    console.log('Waiting for fullscreen exit detection...');
    return;
  }
  
  // Se não está em fullscreen, fecha direto
  console.log('Not in fullscreen, closing modal directly');
  setVideoModalOpen(false);
  document.body.style.overflow = 'unset';
  // Pausar o vídeo ao fechar
  const videos = document.querySelectorAll('video');
  videos.forEach(video => {
    if (!video.paused) {
      video.pause();
    }
  });
};

const nextVideo = () => {
  setCurrentVideoIndex((prev) => (prev + 1) % promotionalVideos.length);
  
  // Forçar fullscreen novamente após trocar vídeo no mobile
  setTimeout(() => {
    const video = document.querySelector('.video-modal-player');
    if (video && window.innerWidth <= 640) {
      if (video.requestFullscreen) {
        video.requestFullscreen().catch(err => console.log('Fullscreen error:', err));
      } else if (video.webkitRequestFullscreen) {
        video.webkitRequestFullscreen();
      } else if (video.mozRequestFullScreen) {
        video.mozRequestFullScreen();
      } else if (video.msRequestFullscreen) {
        video.msRequestFullscreen();
      } else if (video.webkitEnterFullscreen) {
        video.webkitEnterFullscreen();
      }
    }
  }, 300);
};

const prevVideo = () => {
  setCurrentVideoIndex((prev) => (prev - 1 + promotionalVideos.length) % promotionalVideos.length);
  
  // Forçar fullscreen novamente após trocar vídeo no mobile
  setTimeout(() => {
    const video = document.querySelector('.video-modal-player');
    if (video && window.innerWidth <= 640) {
      if (video.requestFullscreen) {
        video.requestFullscreen().catch(err => console.log('Fullscreen error:', err));
      } else if (video.webkitRequestFullscreen) {
        video.webkitRequestFullscreen();
      } else if (video.mozRequestFullScreen) {
        video.mozRequestFullScreen();
      } else if (video.msRequestFullscreen) {
        video.msRequestFullscreen();
      } else if (video.webkitEnterFullscreen) {
        video.webkitEnterFullscreen();
      }
    }
  }, 300);
};

  const handleChangePassword = async () => {
  setChangePasswordError('');
  if (!changePasswordNew.trim()) {
    setChangePasswordError('Please enter a new password');
    return;
  }
  if (changePasswordNew.length < 6) {
    setChangePasswordError('Password must be at least 6 characters');
    return;
  }
  if (changePasswordNew !== changePasswordConfirm) {
    setChangePasswordError('Passwords do not match');
    return;
  }
  try {
    const { error } = await supabase
      .from('employees')
      .update({ password: changePasswordNew, status: 'active', force_password_change: false })
      .eq('employee_id', employeeId);
    if (error) throw error;
    setShowChangePassword(false);
    setChangePasswordNew('');
    setChangePasswordConfirm('');
    alert('Password updated successfully!');
  } catch (error) {
    console.error('Change password error:', error);
    setChangePasswordError('Error updating password. Please try again.');
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

  useLayoutEffect(() => {
  if (isEmployeeLoggedIn) {
    window.scrollTo(0, 0);
  }
}, [isEmployeeLoggedIn]);

useEffect(() => {
  if (appSettings.requireEmployeeLogin && !isEmployeeLoggedIn) {
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'instant' });
    }, 300);
  }
}, [appSettings.requireEmployeeLogin, isEmployeeLoggedIn]);

  // Rotate quotes every 7 seconds
  useEffect(() => {
    if (quotes.length === 0) return;
    
    const interval = setInterval(() => {
      setCurrentQuoteIndex(prev => (prev + 1) % quotes.length);
    }, 7000);
    
    return () => clearInterval(interval);
  }, [quotes.length]);

// PDF.js renderer
  useEffect(() => {
    if (!videoModalOpen) return;
    const item = promotionalVideos[currentVideoIndex];
    if (!item || item.fileType !== 'presentation') return;

    const renderPage = async () => {
      if (!window.pdfjsLib) {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
        await new Promise(resolve => { script.onload = resolve; document.head.appendChild(script); });
        window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
      }
      try {
        const pdf = await window.pdfjsLib.getDocument(item.url).promise;
        setPdfTotalPages(pdf.numPages);
        const page = await pdf.getPage(currentPdfPage);
        const canvas = document.getElementById('pdf-canvas');
        if (!canvas) return;
        const viewport = page.getViewport({ scale: 1.5 });
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        await page.render({ canvasContext: canvas.getContext('2d'), viewport }).promise;
      } catch(err) { console.log('PDF render error:', err); }
    };

    renderPage();
  }, [videoModalOpen, currentVideoIndex, currentPdfPage]);

  // Fullscreen nav overlay + keyboard navigation
  useEffect(() => {
    const handleFullscreenChange = () => {
      const navEl = document.querySelector('.pdf-fullscreen-nav');
      if (!navEl) return;
      if (document.fullscreenElement) {
        navEl.classList.remove('hidden');
        navEl.classList.add('flex');
      } else {
        navEl.classList.add('hidden');
        navEl.classList.remove('flex');
      }
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);

    const handleKeyDown = (e) => {
      const item = promotionalVideos[currentVideoIndex];
      if (!videoModalOpen || !item || item.fileType !== 'presentation') return;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        setCurrentPdfPage(p => pdfTotalPages > 0 ? Math.min(pdfTotalPages, p + 1) : p + 1);
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        setCurrentPdfPage(p => Math.max(1, p - 1));
      } else if (e.key === 'Escape') {
        closeVideoModal();
      }
    };
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [videoModalOpen, currentVideoIndex, pdfTotalPages]);
    
  // Detectar quando o vídeo sai de fullscreen e fechar o modal automaticamente
  useEffect(() => {
    if (!videoModalOpen) return;

    const handleFullscreenChange = () => {
      const isFullscreen = !!(
        document.fullscreenElement || 
        document.webkitFullscreenElement || 
        document.mozFullScreenElement || 
        document.msFullscreenElement
      );

      console.log('Fullscreen change detected. Is fullscreen:', isFullscreen);

      // Se for apresentação, nunca fechar o modal ao sair do fullscreen
      const currentItem = promotionalVideos[currentVideoIndex];
      if (currentItem?.fileType === 'presentation') return;

      if (!isFullscreen) {
        console.log('Closing modal automatically...');
        setTimeout(() => {
          setVideoModalOpen(false);
          document.body.style.overflow = 'unset';
          const videos = document.querySelectorAll('video');
          videos.forEach(video => {
            if (!video.paused) {
              video.pause();
            }
          });
        }, 300);
      }
    };

    // Adicionar listeners para todos os navegadores
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);
    
    // Eventos adicionais para iOS e outros navegadores
    document.addEventListener('webkitendfullscreen', handleFullscreenChange);
    
    // Listener no próprio elemento video para iOS
    const videos = document.querySelectorAll('.video-modal-player');
    videos.forEach(video => {
      video.addEventListener('webkitendfullscreen', handleFullscreenChange);
    });

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
      document.removeEventListener('webkitendfullscreen', handleFullscreenChange);
      
      const videos = document.querySelectorAll('.video-modal-player');
      videos.forEach(video => {
        video.removeEventListener('webkitendfullscreen', handleFullscreenChange);
      });
    };
  }, [videoModalOpen]);

  const loadQuotes = async () => {
    try {
      const { data, error } = await supabase
        .from('quotes')
        .select('*')
        .eq('active', true)
        .order('id', { ascending: true });
      
      if (error) throw error;
      
      // Randomize order
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

  // ==================== FUNÇÕES PARA GERENCIAR VÍDEOS PROMOCIONAIS ====================
  
  const loadPromotionalVideos = async () => {
    try {
      const { data, error } = await supabase
        .from('promotional_videos')
        .select('*')
        .order('display_order', { ascending: true });
      
      if (error) throw error;
      
      const videos = data.map(video => ({
        id: video.id,
        url: video.video_url,
        duration: video.duration,
        display_order: video.display_order,
        fileType: video.file_type || 'video',
        linkUrl: video.link_url || null,
        linkLabel: video.link_label || null
      }));
      
      setPromotionalVideos(videos);
      console.log('✅ Vídeos carregados do banco:', videos.length);

      // Gerar thumbnails para apresentações
      const presentations = videos.filter(v => v.fileType === 'presentation');
      if (presentations.length > 0) {
        const loadPdfJs = async () => {
          if (!window.pdfjsLib) {
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
            await new Promise(resolve => { script.onload = resolve; document.head.appendChild(script); });
            window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
          }
        };
        await loadPdfJs();
        const thumbs = {};
        for (const pres of presentations) {
          try {
            const pdf = await window.pdfjsLib.getDocument(pres.url).promise;
            const page = await pdf.getPage(1);
            const viewport = page.getViewport({ scale: 0.3 });
            const canvas = document.createElement('canvas');
            canvas.width = viewport.width;
            canvas.height = viewport.height;
            await page.render({ canvasContext: canvas.getContext('2d'), viewport }).promise;
            thumbs[pres.id] = canvas.toDataURL();
          } catch(err) { console.log('Thumb error:', err); }
        }
        setPdfThumbnails(thumbs);
      }
    } catch (error) {
      console.error('❌ Error loading promotional videos:', error);
      setPromotionalVideos([]);
    }
  };

  const uploadVideoToSupabase = async (file) => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `video-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { data, error } = await supabase.storage
        .from('promotional-videos')
        .upload(filePath, file);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('promotional-videos')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading video:', error);
      throw error;
    }
  };

  const addPromotionalVideo = async () => {
    if (newItemType === 'link') {
      if (!newLinkUrl.trim()) {
        alert('Please enter a URL');
        return;
      }
      try {
        const maxOrder = promotionalVideos.length > 0
          ? Math.max(...promotionalVideos.map(v => v.display_order || 0))
          : 0;
        const { error } = await supabase
          .from('promotional_videos')
          .insert([{
            video_url: '',
            duration: '',
            display_order: maxOrder + 1,
            file_type: 'link',
            link_url: newLinkUrl.trim(),
            link_label: newLinkLabel.trim() || 'Visit Link'
          }]);
        if (error) throw error;
        await loadPromotionalVideos();
        setNewLinkUrl('');
        setNewLinkLabel('');
        alert('Link added successfully!');
      } catch (error) {
        alert('Error adding link: ' + error.message);
      }
      return;
    }

    if (!newVideoFile) {
      alert('Please select a file');
      return;
    }

    if (newItemType === 'video' && !newVideoDuration) {
      alert('Please enter video duration (e.g., 1:30)');
      return;
    }

    setUploadingVideo(true);

    try {
      // 1. Upload do arquivo
      const videoUrl = await uploadVideoToSupabase(newVideoFile);

      // 2. Pegar a maior ordem atual
      const maxOrder = promotionalVideos.length > 0 
        ? Math.max(...promotionalVideos.map(v => v.display_order || 0))
        : 0;

      // 3. Inserir no banco
      const { error } = await supabase
        .from('promotional_videos')
        .insert([{
          video_url: videoUrl,
          duration: newItemType === 'video' ? newVideoDuration : '',
          display_order: maxOrder + 1,
          file_type: newItemType
        }]);

      if (error) throw error;

      // 4. Recarregar lista
      await loadPromotionalVideos();

      // 5. Limpar campos
      setNewVideoFile(null);
      setNewVideoDuration('');
      
      // Limpar input file
      const fileInput = document.querySelector('input[type="file"]');
      if (fileInput) fileInput.value = '';

      alert('Video added successfully!');
    } catch (error) {
      console.error('Error adding video:', error);
      alert('Error adding video: ' + error.message);
    } finally {
      setUploadingVideo(false);
    }
  };

  const deletePromotionalVideo = async (videoId) => {
    if (!confirm('Are you sure you want to delete this video?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('promotional_videos')
        .delete()
        .eq('id', videoId);

      if (error) throw error;

      await loadPromotionalVideos();
      alert('Video deleted successfully!');
    } catch (error) {
      console.error('Error deleting video:', error);
      alert('Error deleting video');
    }
  };

  const moveVideoUp = async (index) => {
    if (index === 0) return; // Já está no topo

    const newVideos = [...promotionalVideos];
    [newVideos[index], newVideos[index - 1]] = [newVideos[index - 1], newVideos[index]];
    
    setPromotionalVideos(newVideos);
    await updateVideoOrders(newVideos);
  };

  const moveVideoDown = async (index) => {
    if (index === promotionalVideos.length - 1) return; // Já está no final

    const newVideos = [...promotionalVideos];
    [newVideos[index], newVideos[index + 1]] = [newVideos[index + 1], newVideos[index]];
    
    setPromotionalVideos(newVideos);
    await updateVideoOrders(newVideos);
  };

  const updateVideoOrders = async (videos) => {
    try {
      // Atualizar display_order de todos os vídeos
      const updates = videos.map((video, index) => 
        supabase
          .from('promotional_videos')
          .update({ display_order: index + 1 })
          .eq('id', video.id)
      );

      await Promise.all(updates);
    } catch (error) {
      console.error('Error updating video orders:', error);
      alert('Error updating video order');
    }
  };

  const updateVideoDuration = async (videoId, newDuration) => {
    try {
      const { error } = await supabase
        .from('promotional_videos')
        .update({ duration: newDuration })
        .eq('id', videoId);

      if (error) throw error;

      await loadPromotionalVideos();
      setEditingVideoDuration({});
      alert('Duration updated successfully!');
    } catch (error) {
      console.error('Error updating duration:', error);
      alert('Error updating duration');
    }
  };

  // ==================== FIM DAS FUNÇÕES DE VÍDEOS ====================

  const handleDelete = (expId) => {
    if (confirmDelete === `exp-${expId}`) {
      setExperiences(experiences.filter(e => e.id !== expId));
      setConfirmDelete(null);
    } else {
      setConfirmDelete(`exp-${expId}`);
    }
  };

  const handleDeleteComment = async (expId, commentId) => {
  try {
    // Salvar posição
    const scrollPosition = window.pageYOffset;
    
    // Buscar o comentário para verificar owner e arquivo
    const exp = experiences.find(e => e.id === expId);
    const comment = exp?.comments.find(c => c.id === commentId);
    
    if (!comment) {
      alert('Comment not found!');
      return;
    }
    
    // Verificar se é o dono (modo Corp)
if (appSettings.requireEmployeeLogin && !isAdmin && comment.employeeId !== employeeId) {
  alert('You can only delete your own comments!');
  return;
}
    
    // Deletar arquivo do comentário (se existir)
    if (comment.cvUrl) {
      await deleteFileFromStorage(comment.cvUrl);
    }
    
    // Deletar do banco
    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('id', commentId);
    
    if (error) throw error;
    
    // Recarregar experiências
    await loadExperiences(true);
    
    // Restaurar posição
    setTimeout(() => {
      window.scrollTo({ top: scrollPosition, behavior: 'instant' });
    }, 100);
  } catch (error) {
    console.error('Error deleting comment:', error);
    alert('Error deleting comment.');
  }
};


  const getKeywordMatches = () => {
  if (!adminKeywords.trim()) return [];
  const keywords = adminKeywords.toLowerCase().split(',').map(k => k.trim()).filter(k => k);
  const matches = [];
  experiences.forEach(exp => {
    const searchText = `${exp.problem} ${exp.solution} ${exp.result} ${exp.author} ${exp.employeeId || ''}`.toLowerCase();
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

  const highlightText = (text, searchTerms) => {
  if (!searchTerms || searchTerms.length === 0 || !filters.searchText) return text;
  
  let highlightedText = text;
  searchTerms.forEach(term => {
    if (term.length > 0) {
      const regex = new RegExp(`(${term})`, 'gi');
      highlightedText = highlightedText.replace(regex, '<mark class="bg-yellow-300 font-semibold">$1</mark>');
    }
  });
  
  return <span dangerouslySetInnerHTML={{ __html: highlightedText }} />;
};

const filteredExperiences = experiences.filter(exp => {
  // NOVO: Filtro por Common Case mapeado
if (mappedFilter) {
    return (exp.source === 'uploaded' || exp.source === 'app') && exp.relatedCommonCaseId === mappedFilter;
  }

  // Se está na tab Key Insights
  if (filterMode === 'key_insights') {
    // Se selecionou categoria específica, filtrar por ela
    if (showKeyInsights && keyInsightCategory) {
      return exp.author === 'key_insights' && exp.problemCategory === keyInsightCategory;
    }
    // Se não selecionou categoria (All), mostrar todos os Key Insights
    return exp.author === 'key_insights';
  }
  
  // IMPORTANTE: Excluir Key Insights dos filtros normais
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
  (exp.author && exp.author.toLowerCase().includes(term)) ||
  (exp.employeeId && exp.employeeId.toLowerCase().includes(term))
);
  const matchesResultCategory = !filters.resultCategory || exp.resultCategory === filters.resultCategory;
  const roundedRating = Math.round(exp.avgRating);
  const matchesRating = !filters.rating || 
    (filters.rating === '0' ? exp.totalRatings === 0 : roundedRating === parseInt(filters.rating) && exp.totalRatings > 0);
  const matchesGender = !filters.gender || exp.gender === filters.gender;
  const matchesAge = !filters.age || exp.age === filters.age;
  const matchesCountry = !filters.country || exp.country === filters.country;
  const matchesIndustrySector = !filters.industrySector || exp.industrySector === filters.industrySector; // ⭐ ADICIONAR
  // Sempre mostrar experiências avaliadas/comentadas na sessão, mesmo que não atendam o filtro
const wasInteractedInSession = ratedInSession.has(exp.id);
if (wasInteractedInSession) return true;


return matchesProblemCategory && matchesSearchText && matchesResultCategory && matchesRating && matchesGender && matchesAge && matchesCountry && matchesIndustrySector;
});
  // Reset to page 1 when filters change
// Reset to page 1 when filters change (exceto quando navegando para Key Insight)
useEffect(() => {
  // Não resetar se estiver no modo Key Insights sem filtros ativos
  const hasActiveFilters = filters.problemCategory || filters.searchText || 
                          filters.resultCategory || filters.rating || 
                          filters.gender || filters.age || filters.country || 
                          filters.industrySector;
  
  if (hasActiveFilters) {
    setCurrentPage(1);
  }
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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center">
      <div className="text-center">
        <div className="mb-4">
          <Share2 className="text-purple-600 mx-auto mb-3" size={48} />
          <h1 className="text-3xl font-bold text-gray-800">WhatIDid</h1>
        </div>
        <div className="animate-spin rounded-full h-12 w-12 border-b-3 border-purple-600 mx-auto mb-3"></div>
        <p className="text-gray-600">Loading experiences...</p>
      </div>
    </div>
  );
}
  return (
    <>

{/* ⭐ TELA DE LOGIN - Bloqueia acesso se requireEmployeeLogin = true ⭐ */}
    {appSettings.requireEmployeeLogin && !isEmployeeLoggedIn ? (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 px-4 pt-16 pb-8">
  <div className="text-center mb-6">
    <h1 className="text-3xl font-bold text-gray-800 flex items-center justify-center gap-2">
      <Share2 className="text-purple-600" size={28} />
      WhatIDid{' '}
      <span className="text-xl font-normal italic text-gray-600">
        {appSettings.editionName === 'pro' ? 'Pro' : 'Corp'}
      </span>
    </h1>
  </div>
  <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full mx-auto">
        <p className="text-gray-600 text-center mb-6">Employee Login</p>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Employee ID
              </label>
              <input
                type="text"
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleEmployeeLogin()}
                className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
placeholder="Enter your Employee ID"
autoComplete="off"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                value={employeePassword}
                onChange={(e) => setEmployeePassword(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleEmployeeLogin()}
                className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
                placeholder="Enter your password"
              />
            </div>
            
            {loginError && (
              <div className="bg-red-50 border-2 border-red-200 rounded-lg p-3">
                <p className="text-red-700 text-sm">{loginError}</p>
              </div>
            )}
            
            <button
              onClick={handleEmployeeLogin}
              className="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 font-semibold transition-colors"
            >
              Login
            </button>

            <div className="flex justify-between mt-3">
              <button
                onClick={() => { setShowFirstAccess(true); setShowForgotPassword(false); setFirstAccessError(''); setFirstAccessSuccess(false); setFirstAccessId(''); setFirstAccessPassword(''); setFirstAccessConfirm(''); }}
                className="text-sm text-purple-600 hover:text-purple-800 font-medium"
              >
                First Access / Set Password
              </button>
              <button
                onClick={() => { setShowForgotPassword(true); setShowFirstAccess(false); setForgotPasswordError(''); setForgotPasswordMsg(''); setForgotPasswordId(''); }}
                className="text-sm text-gray-500 hover:text-gray-700 font-medium"
              >
                Forgot Password?
              </button>
            </div>
          </div>
        </div>

        {/* First Access Modal */}
        {showFirstAccess && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-800">First Access — Set Password</h3>
                <button onClick={() => setShowFirstAccess(false)} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">×</button>
              </div>
              {firstAccessSuccess ? (
                <div className="text-center py-4">
                  <div className="text-4xl mb-3">✅</div>
                  <h4 className="text-lg font-bold text-gray-800 mb-2">Password Set!</h4>
                  <p className="text-gray-600 text-sm mb-4">You can now login with your Employee ID and new password.</p>
                  <button
                    onClick={() => setShowFirstAccess(false)}
                    className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 font-semibold"
                  >
                    Go to Login
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Employee ID</label>
                    <input type="text" value={firstAccessId} onChange={(e) => setFirstAccessId(e.target.value)}
                      className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
                      placeholder="Enter your Employee ID" autoComplete="off" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                    <input type="password" value={firstAccessPassword} onChange={(e) => setFirstAccessPassword(e.target.value)}
                      className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
                      placeholder="At least 6 characters" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                    <input type="password" value={firstAccessConfirm} onChange={(e) => setFirstAccessConfirm(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleFirstAccess()}
                      className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
                      placeholder="Repeat your password" />
                  </div>
                  {firstAccessError && (
                    <div className="bg-red-50 border-2 border-red-200 rounded-lg p-3">
                      <p className="text-red-700 text-sm">{firstAccessError}</p>
                    </div>
                  )}
                  <button onClick={handleFirstAccess}
                    className="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 font-semibold transition-colors">
                    Set Password
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Forgot Password Modal */}
        {showForgotPassword && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-800">Forgot Password</h3>
                <button onClick={() => setShowForgotPassword(false)} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">×</button>
              </div>
              {forgotPasswordMsg ? (
                <div className="text-center py-4">
                  <div className="text-4xl mb-3">📧</div>
                  <p className="text-gray-700 text-sm mb-4">{forgotPasswordMsg}</p>
                  <button onClick={() => setShowForgotPassword(false)}
                    className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 font-semibold">
                    Back to Login
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-sm text-gray-600">Enter your Employee ID and a temporary password will be generated. Contact your Admin to receive it.</p>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Employee ID</label>
                    <input type="text" value={forgotPasswordId} onChange={(e) => setForgotPasswordId(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleForgotPassword()}
                      className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
                      placeholder="Enter your Employee ID" autoComplete="off" />
                  </div>
                  {forgotPasswordError && (
                    <div className="bg-red-50 border-2 border-red-200 rounded-lg p-3">
                      <p className="text-red-700 text-sm">{forgotPasswordError}</p>
                    </div>
                  )}
                  <button onClick={handleForgotPassword}
                    className="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 font-semibold transition-colors">
                    Reset Password
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    ) : (
      <>
      {/* ⭐ App normal continua aqui ⭐ */}

      
      <style>{marqueeStyles}</style>
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8"> 
          
          <div className="flex items-center justify-between mb-4">
  <div className="flex-1"></div>
  <div className="flex flex-col items-center">
    <h1 className="text-4xl font-bold text-gray-800 mb-2 flex items-center justify-center gap-3">
      <Share2 className="text-purple-600" size={36} />
      WhatIDid{' '}
      <span className="text-2xl font-normal italic text-gray-600">
        {appSettings.editionName === 'pro' ? 'Pro' : 'Corp'}
      </span>
    </h1>
    {companyName && (
  <div className={`flex items-center justify-center gap-3 mt-1 ${
    companyNameSize === 'small' ? 'text-xs' :
    companyNameSize === 'large' ? 'text-xl' : 'text-base'
  }`}>
    <div className="h-px w-8 bg-gray-400 opacity-50"></div>
    <p className="font-semibold text-gray-500 tracking-wide">{companyName}</p>
    <div className="h-px w-8 bg-gray-400 opacity-50"></div>
  </div>
)}
  </div>
  <div className="flex-1 flex justify-end items-start pt-1">
    {companyLogoUrl && (
  <img src={companyLogoUrl} alt="Company logo"
    className={`hidden sm:block object-contain ${
      companyLogoSize === 'small' ? 'h-8 max-w-[100px]' :
      companyLogoSize === 'large' ? 'h-20 max-w-[280px]' : 'h-14 max-w-[220px]'
    }`} />
)}
  </div>
</div>
{companyLogoUrl && (
  <div className="flex justify-center sm:hidden mb-3">
<img src={companyLogoUrl} alt="Company logo" className={`object-contain ${
      companyLogoSize === 'small' ? 'h-10 max-w-[120px]' :
      companyLogoSize === 'large' ? 'h-20 max-w-[220px]' : 'h-14 max-w-[160px]'
    }`} />
  </div>
)}          
          <p className="text-gray-700 font-medium mb-1 text-sm sm:text-base">Real problems. Real actions. Real results.</p>
<p className="text-gray-600 text-sm sm:text-base">
  <span className="block sm:inline">Share your work experiences.</span>
  <span className="hidden sm:inline"> </span>
  <span className="block sm:inline">Accelerate organizational learning.</span>
</p>

{/* Video Carousel Section - Esteira Rolante */}
<div className="my-5">
  <div className="flex items-center justify-center gap-2 max-w-4xl mx-auto">
    
    {/* Coluna Esquerda: 24px fixo */}
    <div className="w-6 flex items-center justify-end">
      {carouselStartIndex > 0 && (
        <button
          onClick={() => setCarouselStartIndex(Math.max(0, carouselStartIndex - 1))}
          className="text-black hover:text-gray-600 transition-colors cursor-pointer"
          aria-label="Previous videos"
        >
          <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      )}
    </div>
    
    {/* Container dos vídeos */}
    <div className="flex justify-center items-center gap-2">
      {promotionalVideos
        .slice(carouselStartIndex, carouselStartIndex + videosPerPage)
        .map((video, displayIndex) => {
          const actualIndex = carouselStartIndex + displayIndex;
          return (
            <div 
              key={video.id}
              onClick={() => {
                if (video.fileType === 'link') {
                  window.open(video.linkUrl, '_blank');
                } else {
                  openVideoModal(actualIndex);
                }
              }}
              className="relative w-16 h-11 sm:w-20 sm:h-14 rounded-md overflow-hidden cursor-pointer group shadow-md hover:shadow-lg transition-all transform hover:scale-105 flex-shrink-0"
            >
              {video.fileType === 'link' ? (
                <img
                  src={video.thumbnail || "https://scurkpoasiulwkmmechz.supabase.co/storage/v1/object/public/promotional-videos/Screenshot%202026-04-22%20at%209.56.05%20PM.png"}
                  className="w-full h-full object-cover object-top"
                  alt="Link preview"
                />
              ) : video.fileType === 'presentation' ? (
                pdfThumbnails[video.id] ? (
                  <img src={pdfThumbnails[video.id]} className="w-full h-full object-cover" alt="Slide preview" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
                    <span className="text-white text-lg">📊</span>
                  </div>
                )
              ) : (
                <video className="w-full h-full object-cover" preload="metadata">
                  <source src={`${video.url}#t=0.1`} type="video/mp4" />
                </video>
              )}

              <div className="absolute inset-0 bg-black bg-opacity-30 group-hover:bg-opacity-40 transition-all"></div>

              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-5 h-5 sm:w-6 sm:h-6 bg-white bg-opacity-90 rounded-full flex items-center justify-center group-hover:bg-opacity-100 transition-all group-hover:scale-110">
                  {video.fileType === 'link' ? (
                    <span className="text-purple-600 text-[8px] font-bold">↗</span>
                  ) : video.fileType === 'presentation' ? (
                    <span className="text-purple-600 text-[8px] font-bold">PDF</span>
                  ) : (
                    <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-purple-600 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                  )}
                </div>
              </div>

              {video.fileType === 'video' && (
                <div className="absolute bottom-1 right-1 bg-black bg-opacity-75 text-white text-[5.5px] sm:text-[6px] px-1 py-0.5 rounded leading-none">
                  {video.duration}
                </div>
              )}
              {video.fileType === 'link' && (
                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-60 text-white text-[5px] sm:text-[6px] px-1 py-0.5 text-center leading-tight truncate">
                  {video.linkLabel || 'Link'}
                </div>
              )}
            </div>
          );
        })}
    </div>
    
    {/* Coluna Direita: 24px fixo */}
    <div className="w-6 flex items-center justify-start">
      {carouselStartIndex < promotionalVideos.length - videosPerPage && (
        <button
          onClick={() => setCarouselStartIndex(Math.min(promotionalVideos.length - videosPerPage, carouselStartIndex + 1))}
          className="text-black hover:text-gray-600 transition-colors cursor-pointer"
          aria-label="Next videos"
        >
          <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      )}
    </div>
    
  </div>
</div>

{/* Employee Info - Centralizado */}
{isEmployeeLoggedIn && (
  <div className="flex items-center justify-center gap-3 mt-4 mb-2">
    <span className="text-sm text-gray-700 font-medium">👤 {employeeId}</span>
    <button
      onClick={handleEmployeeLogout}
      className="text-sm bg-gray-200 text-gray-700 px-3 py-1 rounded hover:bg-gray-300 transition-colors"
    >
      Logout
    </button>
  </div>
)}
          
{/* Navigation Buttons */}
<div className="flex flex-wrap gap-3 justify-center mt-5 mb-2">
  <button
    onClick={() => {
      document.getElementById('experiences-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }}
    className="px-6 py-2.5 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors text-sm md:text-base shadow-md hover:shadow-lg"
  >
    See What Others Did
  </button>
  <button
    onClick={() => {
      document.getElementById('share-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }}
    className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors text-sm md:text-base shadow-md hover:shadow-lg"
  >
    Share Your Experience
  </button>
</div>

          
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
                  Logout ADM
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
          
{isAdmin && (
  <div className="mt-4 bg-indigo-50 border-2 border-indigo-300 rounded-lg shadow-md p-4 max-w-4xl mx-auto">
    <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
      ⚙️ App Configuration
    </h3>
    
    <div className="bg-white rounded p-4 space-y-4">
      {/* 1. Nome da Edição */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Edition Name
        </label>
        <select
          value={appSettings.editionName}
          onChange={async (e) => {
            const newSettings = {...appSettings, editionName: e.target.value};
            setAppSettings(newSettings);
            
            const { error } = await supabase
              .from('app_settings')
              .update({ edition_name: e.target.value })
              .eq('id', 1);
            
            if (error) {
              alert('Error updating setting');
              console.error(error);
            } else {
              alert('Edition name updated!');
            }
          }}
          className="w-full p-2 border-2 border-gray-300 rounded-lg"
        >
          <option value="pro">Pro</option>
          <option value="corp">Corp</option>
        </select>
      </div>
      
      {/* 2. Employee Login */}
      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          id="employeeLogin"
          checked={appSettings.requireEmployeeLogin}
          onChange={async (e) => {
            const newSettings = {...appSettings, requireEmployeeLogin: e.target.checked};
            setAppSettings(newSettings);
            
            const { error } = await supabase
              .from('app_settings')
              .update({ require_employee_login: e.target.checked })
              .eq('id', 1);
            
            if (error) {
              alert('Error updating setting');
              console.error(error);
            } else {
              alert(`Employee login ${e.target.checked ? 'enabled' : 'disabled'}!`);
            }
          }}
          className="w-5 h-5"
        />
        <label htmlFor="employeeLogin" className="text-sm font-medium text-gray-700 cursor-pointer">
          Require Employee ID for access
        </label>
      </div>
      
{/* 3. Upload Documents */}
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="cvUpload"
            checked={appSettings.allowCvUpload}
            onChange={async (e) => {
              const newSettings = {...appSettings, allowCvUpload: e.target.checked};
              setAppSettings(newSettings);
              
              const { error } = await supabase
                .from('app_settings')
                .update({ allow_cv_upload: e.target.checked })
                .eq('id', 1);
              
              if (error) {
                alert('Error updating setting');
                console.error(error);
              } else {
                alert(`Document upload ${e.target.checked ? 'enabled' : 'disabled'}!`);
              }
            }}
            className="w-5 h-5"
          />
          <label htmlFor="cvUpload" className="text-sm font-medium text-gray-700 cursor-pointer">
            Allow Document Upload
          </label>
        </div>
        
        {/* Radio buttons - só aparecem se upload estiver habilitado */}
        {appSettings.allowCvUpload && (
          <div className="ml-8 space-y-2 bg-gray-50 p-3 rounded">
            <label className="block text-xs font-medium text-gray-600 mb-2">Document Type:</label>
            
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="documentType"
                value="cv"
                checked={appSettings.documentType === 'cv'}
                onChange={async (e) => {
                  const newSettings = {...appSettings, documentType: 'cv'};
                  setAppSettings(newSettings);
                  
                  const { error } = await supabase
                    .from('app_settings')
                    .update({ document_type: 'cv' })
                    .eq('id', 1);
                  
                  if (error) {
                    alert('Error updating document type');
                    console.error(error);
                  }
                }}
                className="w-4 h-4"
              />
              <span className="text-sm">📄 CV (PDF only) - for Pro edition</span>
            </label>
            
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="documentType"
                value="other"
                checked={appSettings.documentType === 'other'}
                onChange={async (e) => {
                  const newSettings = {...appSettings, documentType: 'other'};
                  setAppSettings(newSettings);
                  
                  const { error } = await supabase
                    .from('app_settings')
                    .update({ document_type: 'other' })
                    .eq('id', 1);
                  
                  if (error) {
                    alert('Error updating document type');
                    console.error(error);
                  }
                }}
                className="w-4 h-4"
              />
              <span className="text-sm">📎 Other Docs (PPT, XLS, PDF, DOCX) - for Corp edition</span>
            </label>
          </div>
        )}
      </div>

      {/* Show Top 3 */}
      <div className="flex items-center gap-3">
        <input type="checkbox" id="showTop3" checked={appSettings.showTop3}
          onChange={async (e) => {
            setAppSettings({...appSettings, showTop3: e.target.checked});
            await supabase.from('app_settings').update({ show_top3: e.target.checked }).eq('id', 1);
          }} className="w-5 h-5" />
        <label htmlFor="showTop3" className="text-sm font-medium text-gray-700 cursor-pointer">Show Top 3 Experiences</label>
      </div>

      {/* Show Marquee */}
      <div className="flex items-center gap-3">
        <input type="checkbox" id="showMarquee" checked={appSettings.showMarquee}
          onChange={async (e) => {
            setAppSettings({...appSettings, showMarquee: e.target.checked});
            await supabase.from('app_settings').update({ show_marquee: e.target.checked }).eq('id', 1);
          }} className="w-5 h-5" />
        <label htmlFor="showMarquee" className="text-sm font-medium text-gray-700 cursor-pointer">Show Inspirational Quotes (Marquee)</label>
      </div>

      {/* 🏢 Company Branding */}
      <div className="border-t pt-4 mt-2">
        <label className="block text-sm font-semibold text-gray-700 mb-3">🏢 Company Branding</label>

        <div className="mb-4">
          <label className="block text-xs font-medium text-gray-600 mb-1">Company Name</label>
          <p className="text-xs text-gray-400 mb-2">Displayed below "WhatIDid Corp" in the header</p>
          <div className="flex gap-2 mb-2">
            <input type="text" value={companyName} onChange={(e) => setCompanyName(e.target.value)}
              placeholder="e.g. XYZ Financial Services"
              className="flex-1 p-2 border-2 border-gray-300 rounded-lg text-sm" maxLength={60} />
            <button onClick={async () => {
              const { error } = await supabase.from('app_settings').update({ company_name: companyName }).eq('id', 1);
              if (error) alert('Error: ' + error.message);
              else alert('Company name saved!');
            }} className="px-3 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700">Save</button>
            {companyName && (
              <button onClick={async () => {
                setCompanyName('');
                await supabase.from('app_settings').update({ company_name: null }).eq('id', 1);
              }} className="px-3 py-2 bg-gray-400 text-white rounded-lg text-sm hover:bg-gray-500">Clear</button>
            )}
          </div>
          <div className="flex gap-3 bg-gray-50 p-2 rounded-lg">
            <span className="text-xs text-gray-500 self-center">Size:</span>
            {['small', 'medium', 'large'].map(size => (
              <label key={size} className="flex items-center gap-1 cursor-pointer">
                <input type="radio" name="companyNameSize" value={size}
                  checked={companyNameSize === size}
                  onChange={async () => {
                    setCompanyNameSize(size);
                    await supabase.from('app_settings').update({ company_name_size: size }).eq('id', 1);
                  }}
                  className="w-3 h-3" />
                <span className="text-xs capitalize">{size}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Company Logo</label>
          <p className="text-xs text-gray-400 mb-2">Top-right on desktop, below header on mobile (PNG, JPG, SVG — max 2MB)</p>
          {companyLogoUrl && (
            <div className="mb-3 flex items-center gap-3 p-2 bg-gray-50 rounded-lg border border-gray-200">
              <img src={companyLogoUrl} alt="logo" className="h-10 object-contain border border-gray-200 rounded p-1 bg-white" />
              <span className="text-xs text-gray-500 flex-1">Logo active</span>
              <button onClick={async () => {
                const { error } = await supabase.from('app_settings').update({ company_logo_url: null }).eq('id', 1);
                if (!error) { setCompanyLogoUrl(''); alert('Logo removed!'); }
              }} className="text-xs text-red-600 hover:text-red-800 font-medium">✕ Remove</button>
            </div>
          )}
          <label className="px-3 py-2 bg-gray-100 border-2 border-gray-200 rounded-lg hover:bg-gray-200 cursor-pointer inline-flex items-center gap-1 text-sm">
            <input type="file" accept="image/png,image/jpeg,image/svg+xml,image/gif,image/webp" className="hidden"
              onChange={async (e) => {
                const file = e.target.files[0];
                if (!file) return;
                if (file.size > 2000000) { alert('Max 2MB'); return; }
                try {
                  const ext = file.name.split('.').pop();
                  const path = `logo-${Date.now()}.${ext}`;
                  const { error: upErr } = await supabase.storage.from('cvs').upload(path, file);
                  if (upErr) throw upErr;
                  const { data: { publicUrl } } = supabase.storage.from('cvs').getPublicUrl(path);
                  const { error: dbErr } = await supabase.from('app_settings').update({ company_logo_url: publicUrl }).eq('id', 1);
                  if (dbErr) throw dbErr;
                  setCompanyLogoUrl(publicUrl);
                  alert('Logo uploaded!');
                } catch(err) { alert('Error: ' + err.message); }
                e.target.value = '';
              
              }} />
            📷 Upload Logo
          </label>
          <p className="text-xs text-gray-400 mt-1">💡 Recommended: PNG or SVG with transparent background, min 200px wide.</p>
          <div className="flex gap-3 bg-gray-50 p-2 rounded-lg mt-2">
            <span className="text-xs text-gray-500 self-center">Size:</span>
            {['small', 'medium', 'large'].map(size => (
              <label key={size} className="flex items-center gap-1 cursor-pointer">
                <input type="radio" name="companyLogoSize" value={size}
                  checked={companyLogoSize === size}
                  onChange={async () => {
                    setCompanyLogoSize(size);
                    await supabase.from('app_settings').update({ company_logo_size: size }).eq('id', 1);
                  }}
                  className="w-3 h-3" />
                <span className="text-xs capitalize">{size}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

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
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Author {newQuote.position === 'top' && <span className="text-gray-500 font-normal">(optional for Top)</span>}
                    </label>
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
                      <option value="top">Top (above Top 3)</option>
                      <option value="bottom">Bottom (below Top 3)</option>
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
                        {editingQuote === quote.id ? (
                          <div className="space-y-2">
                            <textarea
                              defaultValue={quote.text}
                              id={`edit-text-${quote.id}`}
                              className="w-full p-2 border-2 border-gray-300 rounded resize-none"
                              rows="2"
                            />
                            <input
                              type="text"
                              defaultValue={quote.author}
                              id={`edit-author-${quote.id}`}
                              className="w-full p-2 border-2 border-gray-300 rounded"
                            />
                            <select
                              defaultValue={quote.position || 'top'}
                              id={`edit-position-${quote.id}`}
                              className="w-full p-2 border-2 border-gray-300 rounded"
                            >
                              <option value="top">Top (above Top 3)</option>
                              <option value="bottom">Bottom (below Top 3)</option>
                            </select>
                            <div className="flex gap-2">
                              <button
                                onClick={() => {
                                  const text = document.getElementById(`edit-text-${quote.id}`).value;
                                  const author = document.getElementById(`edit-author-${quote.id}`).value;
                                  const position = document.getElementById(`edit-position-${quote.id}`).value;
                                  updateQuote(quote.id, text, author, position);
                                }}
                                className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                              >
                                Save
                              </button>
                              <button
                                onClick={() => setEditingQuote(null)}
                                className="px-3 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="flex items-start justify-between mb-2">
                              <p className="text-sm italic text-gray-700 flex-1">"{quote.text}"</p>
                              <span className={`ml-2 px-2 py-1 text-xs rounded ${quote.position === 'top' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                                {quote.position === 'top' ? 'Top' : 'Bottom'}
                              </span>
                            </div>
                            <p className="text-xs text-gray-600 mb-2">— {quote.author}</p>
                            <div className="flex gap-2">
                              <button
                                onClick={() => setEditingQuote(quote.id)}
                                className="px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700"
                              >
                                Edit
                              </button>
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
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {isAdmin && (
            <div className="mt-4 bg-purple-50 border-2 border-purple-300 rounded-lg shadow-md p-4 max-w-4xl mx-auto">
              <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                🎬 Manage Promotional Videos
              </h3>
              
              <div className="bg-white rounded p-4 mb-4">
                <h4 className="font-medium text-gray-700 mb-3">Add New Item</h4>
                <div className="space-y-3">
                  {/* Type selector */}
                  <div className="flex gap-4 bg-gray-50 p-3 rounded-lg flex-wrap">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="newItemType"
                        value="video"
                        checked={newItemType === 'video'}
                        onChange={() => { setNewItemType('video'); setNewVideoFile(null); }}
                        className="w-4 h-4"
                      />
                      <span className="text-sm font-medium">🎬 Video (MP4, WebM)</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="newItemType"
                        value="presentation"
                        checked={newItemType === 'presentation'}
                        onChange={() => { setNewItemType('presentation'); setNewVideoFile(null); setNewVideoDuration(''); }}
                        className="w-4 h-4"
                      />
                      <span className="text-sm font-medium">📊 Presentation (PDF)</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="newItemType"
                        value="link"
                        checked={newItemType === 'link'}
                        onChange={() => { setNewItemType('link'); setNewVideoFile(null); setNewVideoDuration(''); }}
                        className="w-4 h-4"
                      />
                      <span className="text-sm font-medium">🔗 Link (URL)</span>
                    </label>
                  </div>

                  {newItemType === 'link' ? (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">URL</label>
                        <input
                          type="url"
                          value={newLinkUrl}
                          onChange={(e) => setNewLinkUrl(e.target.value)}
                          placeholder="https://intro.corp.whatidid.app"
                          className="w-full p-2 border-2 border-gray-300 rounded-lg text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Label (optional)</label>
                        <input
                          type="text"
                          value={newLinkLabel}
                          onChange={(e) => setNewLinkLabel(e.target.value)}
                          placeholder="Intro"
                          className="w-full p-2 border-2 border-gray-300 rounded-lg text-sm"
                        />
                      </div>
                    </div>
                  ) : (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {newItemType === 'video' ? 'Video File' : 'PDF File'}
                      </label>
                      <input
                        type="file"
                        accept={newItemType === 'video' ? 'video/mp4,video/webm' : '.pdf'}
                        onChange={(e) => setNewVideoFile(e.target.files[0])}
                        className="w-full p-2 border-2 border-gray-300 rounded-lg text-sm"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        {newItemType === 'video' ? 'Supported: MP4, WebM' : 'Supported: PDF'}
                      </p>
                    </div>
                  )}

                  {newItemType === 'video' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Duration (e.g., 1:30)</label>
                      <input
                        type="text"
                        value={newVideoDuration}
                        onChange={(e) => setNewVideoDuration(e.target.value)}
                        placeholder="0:00"
                        className="w-full p-2 border-2 border-gray-300 rounded-lg"
                      />
                    </div>
                  )}

                  <button
                    onClick={addPromotionalVideo}
                    disabled={uploadingVideo && newItemType !== 'link'}
                    className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {uploadingVideo ? 'Uploading...' : `Add ${newItemType === 'video' ? 'Video' : newItemType === 'presentation' ? 'Presentation' : 'Link'}`}
                  </button>
                </div>
              </div>

              <div className="bg-white rounded p-4">
                <h4 className="font-medium text-gray-700 mb-3">Promotional Videos ({promotionalVideos.length})</h4>
                {promotionalVideos.length === 0 ? (
                  <p className="text-sm text-gray-500">No videos yet</p>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {promotionalVideos.map((video, index) => (
                      <div key={video.id} className="border border-gray-300 rounded p-3">
                        <div className="flex items-start gap-3">
                          {/* Thumbnail */}
                          <div className="flex-shrink-0 w-24 h-16 rounded border border-gray-200 overflow-hidden bg-gray-100 flex items-center justify-center">
                            {video.fileType === 'link' ? (
                              <img
                                src="https://scurkpoasiulwkmmechz.supabase.co/storage/v1/object/public/promotional-videos/Screenshot%202026-04-22%20at%209.56.05%20PM.png"
                                className="w-full h-full object-cover object-top"
                                alt="Link preview"
                              />
                            ) : video.fileType === 'presentation' ? (
                              pdfThumbnails[video.id] ? (
                                <img src={pdfThumbnails[video.id]} className="w-full h-full object-cover" alt="PDF preview" />
                              ) : (
                                <div className="flex flex-col items-center justify-center w-full h-full bg-purple-50">
                                  <span className="text-2xl">📊</span>
                                  <span className="text-[9px] text-purple-600 font-medium mt-1">PDF</span>
                                </div>
                              )
                            ) : (
                              <video
                                className="w-full h-full object-cover"
                                preload="metadata"
                              >
                                <source src={`${video.url}#t=0.1`} type="video/mp4" />
                              </video>
                            )}
                          </div>
                          
                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-xs font-bold bg-purple-100 text-purple-700 px-2 py-1 rounded">
                                #{index + 1}
                              </span>
                              {editingVideoDuration[video.id] ? (
                                <div className="flex items-center gap-2">
                                  <input
                                    type="text"
                                    defaultValue={video.duration}
                                    id={`duration-${video.id}`}
                                    className="w-20 p-1 border border-gray-300 rounded text-sm"
                                    placeholder="0:00"
                                  />
                                  <button
                                    onClick={() => {
                                      const newDuration = document.getElementById(`duration-${video.id}`).value;
                                      updateVideoDuration(video.id, newDuration);
                                    }}
                                    className="px-2 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700"
                                  >
                                    Save
                                  </button>
                                  <button
                                    onClick={() => setEditingVideoDuration({})}
                                    className="px-2 py-1 bg-gray-500 text-white rounded text-xs hover:bg-gray-600"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => setEditingVideoDuration({ [video.id]: true })}
                                  className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded"
                                >
                                  ⏱️ {video.duration}
                                </button>
                              )}
                            </div>
                            <p className="text-xs text-gray-600 truncate mb-2">{video.url}</p>
                            
                            {/* Botões de ação */}
                            <div className="flex gap-2 flex-wrap">
                              <button
                                onClick={() => moveVideoUp(index)}
                                disabled={index === 0}
                                className="px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 disabled:opacity-30 disabled:cursor-not-allowed"
                              >
                                ↑ Up
                              </button>
                              <button
                                onClick={() => moveVideoDown(index)}
                                disabled={index === promotionalVideos.length - 1}
                                className="px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 disabled:opacity-30 disabled:cursor-not-allowed"
                              >
                                ↓ Down
                              </button>
                              <button
                                onClick={() => {
                                  if (window.confirm('Delete this video?')) {
                                    deletePromotionalVideo(video.id);
                                  }
                                }}
                                className="px-2 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700"
                              >
                                🗑️ Delete
                              </button>
                            </div>
                          </div>
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
                            placeholder="Enter content in Markdown format..."
                          />
                          <div className="text-xs text-gray-600 mb-2">
                            <strong>Markdown Tips:</strong> Use # for titles, ## for subtitles, ### for sections, - for bullet points
                          </div>
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

{isAdmin && (
  <div className="mt-4 bg-slate-50 border-2 border-slate-300 rounded-lg shadow-md p-4 max-w-4xl mx-auto">
    <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
      👥 Manage Employees
    </h3>

    {/* Add Employee */}
    <div className="bg-white rounded p-4 mb-4">
      <h4 className="font-medium text-gray-700 mb-3">Add Employee</h4>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
        <input type="text" value={newEmployee.employee_id} onChange={(e) => setNewEmployee({...newEmployee, employee_id: e.target.value})}
          placeholder="Employee ID *" className="p-2 border-2 border-gray-300 rounded-lg text-sm" />
        <input type="text" value={newEmployee.name} onChange={(e) => setNewEmployee({...newEmployee, name: e.target.value})}
          placeholder="Full Name *" className="p-2 border-2 border-gray-300 rounded-lg text-sm" />
        <input type="text" value={newEmployee.country} onChange={(e) => setNewEmployee({...newEmployee, country: e.target.value})}
          placeholder="Country" className="p-2 border-2 border-gray-300 rounded-lg text-sm" />
        <input type="email" value={newEmployee.email} onChange={(e) => setNewEmployee({...newEmployee, email: e.target.value})}
          placeholder="Corporate Email" className="p-2 border-2 border-gray-300 rounded-lg text-sm" />
      </div>
      <div className="flex gap-2 flex-wrap">
        <button onClick={addEmployee} className="px-4 py-2 bg-slate-600 text-white rounded-lg text-sm hover:bg-slate-700">
          + Add Employee
        </button>
        <label className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 cursor-pointer">
          📊 Upload Excel
          <input type="file" accept=".xlsx,.xls" className="hidden" onChange={(e) => { if(e.target.files[0]) handleExcelUpload(e.target.files[0]); e.target.value=''; }} />
        </label>
        <span className="text-xs text-gray-500 self-center">Excel columns: Employee ID, Name, Country, Email</span>
      </div>
    </div>

    {/* Search + List */}
    <div className="bg-white rounded p-4">
      <div className="flex items-center gap-3 mb-3">
        <h4 className="font-medium text-gray-700">Employees ({employees.length})</h4>
        <input type="text" value={employeeSearch} onChange={(e) => setEmployeeSearch(e.target.value)}
          placeholder="Search by ID, name or email..." className="flex-1 p-2 border-2 border-gray-200 rounded-lg text-sm" />
      </div>
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {employees.filter(emp => {
          const q = employeeSearch.toLowerCase();
          return !q || emp.employee_id?.toLowerCase().includes(q) || emp.name?.toLowerCase().includes(q) || emp.email?.toLowerCase().includes(q);
        }).map(emp => (
          <div key={emp.employee_id} className="flex items-center gap-2 p-2 border border-gray-200 rounded-lg flex-wrap">
            {editingEmployee === emp.employee_id ? (
              <>
                <span className="text-xs font-bold text-gray-500 w-20 shrink-0">{emp.employee_id}</span>
                <input type="text" defaultValue={emp.name} onChange={(e) => setEditingEmployeeData({...editingEmployeeData, name: e.target.value})}
                  className="flex-1 min-w-24 p-1 border border-gray-300 rounded text-sm" placeholder="Name" />
                <input type="text" defaultValue={emp.country} onChange={(e) => setEditingEmployeeData({...editingEmployeeData, country: e.target.value})}
                  className="flex-1 min-w-20 p-1 border border-gray-300 rounded text-sm" placeholder="Country" />
                <input type="email" defaultValue={emp.email} onChange={(e) => setEditingEmployeeData({...editingEmployeeData, email: e.target.value})}
                  className="flex-1 min-w-32 p-1 border border-gray-300 rounded text-sm" placeholder="Email" />
                <button onClick={() => updateEmployee(emp.employee_id)} className="px-2 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700">Save</button>
                <button onClick={() => { setEditingEmployee(null); setEditingEmployeeData({}); }} className="px-2 py-1 bg-gray-400 text-white rounded text-xs">Cancel</button>
              </>
            ) : (
              <>
                <span className="text-xs font-bold text-gray-500 w-20 shrink-0">{emp.employee_id}</span>
                <span className="text-sm text-gray-700 flex-1 min-w-24">{emp.name}</span>
                <span className="text-xs text-gray-500 min-w-16">{emp.country}</span>
                <span className="text-xs text-gray-500 flex-1 min-w-32 truncate">{emp.email}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${emp.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                  {emp.status === 'active' ? '✓ Active' : '⏳ Pending'}
                </span>
                <button onClick={() => { setEditingEmployee(emp.employee_id); setEditingEmployeeData({ name: emp.name, country: emp.country, email: emp.email }); }}
                  className="px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700">Edit</button>
                <button onClick={() => deleteEmployee(emp.employee_id)}
                  className="px-2 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700">Delete</button>
              </>
            )}
          </div>
        ))}
        {employees.length === 0 && <p className="text-sm text-gray-500 text-center py-4">No employees yet.</p>}
      </div>
    </div>
  </div>
)}

{isAdmin && (
  <div className="mt-4 bg-teal-50 border-2 border-teal-300 rounded-lg shadow-md p-4 max-w-4xl mx-auto">
    <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
      🗂️ Manage Problem Categories
    </h3>
    <div className="bg-white rounded p-4 mb-4">
      <h4 className="font-medium text-gray-700 mb-3">Add New Category</h4>
      <div className="flex gap-2">
        <input
          type="text"
          value={newCategoryName}
          onChange={(e) => setNewCategoryName(e.target.value)}
          placeholder="Category name..."
          className="flex-1 p-2 border-2 border-gray-300 rounded-lg text-sm"
          onKeyPress={(e) => e.key === 'Enter' && newCategoryName.trim() && (async () => {
            const maxOrder = problemCategories.length;
            const { error } = await supabase.from('problem_categories').insert([{ name: newCategoryName.trim(), display_order: maxOrder + 1, active: true }]);
            if (!error) { setNewCategoryName(''); await loadProblemCategories(); }
            else alert('Error adding category');
          })()}
        />
        <button
          onClick={async () => {
            if (!newCategoryName.trim()) return;
            const maxOrder = problemCategories.length;
            const { error } = await supabase.from('problem_categories').insert([{ name: newCategoryName.trim(), display_order: maxOrder + 1, active: true }]);
            if (!error) { setNewCategoryName(''); await loadProblemCategories(); }
            else alert('Error adding category');
          }}
          className="px-4 py-2 bg-teal-600 text-white rounded-lg text-sm hover:bg-teal-700"
        >
          Add
        </button>
      </div>
    </div>
    <div className="bg-white rounded p-4">
      <h4 className="font-medium text-gray-700 mb-3">Current Categories ({problemCategories.length})</h4>
      <div className="space-y-2 max-h-80 overflow-y-auto">
        {problemCategories.map((cat, index) => (
          <div key={index} className="flex items-center gap-2 p-2 border border-gray-200 rounded-lg">
            {editingCategory === index ? (
              <>
                <input
                  type="text"
                  defaultValue={cat}
                  id={`edit-cat-${index}`}
                  className="flex-1 p-1 border border-gray-300 rounded text-sm"
                  autoFocus
                />
                <button
                  onClick={async () => {
                    const newName = document.getElementById(`edit-cat-${index}`).value.trim();
                    if (!newName) return;
                    const { error } = await supabase.from('problem_categories').update({ name: newName }).eq('name', cat);
                    if (!error) { setEditingCategory(null); await loadProblemCategories(); }
                    else alert('Error updating category');
                  }}
                  className="px-2 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700"
                >Save</button>
                <button onClick={() => setEditingCategory(null)} className="px-2 py-1 bg-gray-400 text-white rounded text-xs hover:bg-gray-500">Cancel</button>
              </>
            ) : (
              <>
                <button
                    onClick={async () => {
                      if (index === 0) return;
                      await supabase.from('problem_categories').update({ display_order: index }).eq('name', cat);
                      await supabase.from('problem_categories').update({ display_order: index + 1 }).eq('name', problemCategories[index - 1]);
                      await loadProblemCategories();
                    }}
                    disabled={index === 0}
                    className="px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 disabled:opacity-30 disabled:cursor-not-allowed"
                  >↑ Up</button>
                  <button
                    onClick={async () => {
                      if (index === problemCategories.length - 1) return;
                      await supabase.from('problem_categories').update({ display_order: index + 2 }).eq('name', cat);
                      await supabase.from('problem_categories').update({ display_order: index + 1 }).eq('name', problemCategories[index + 1]);
                      await loadProblemCategories();
                    }}
                    disabled={index === problemCategories.length - 1}
                    className="px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 disabled:opacity-30 disabled:cursor-not-allowed"
                  >↓ Down</button>
                <span className="flex-1 text-sm text-gray-700">{cat}</span>
                <button onClick={() => setEditingCategory(index)} className="px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700">Edit</button>
                <button
                  onClick={async () => {
                    if (!window.confirm(`Delete "${cat}"? Existing experiences with this category will keep it.`)) return;
                    const { error } = await supabase.from('problem_categories').update({ active: false }).eq('name', cat);
                    if (!error) await loadProblemCategories();
                    else alert('Error deleting category');
                  }}
                  className="px-2 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700"
                >Delete</button>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  </div>
)}

{isAdmin && (
  <div className="mt-4 bg-orange-50 border-2 border-orange-300 rounded-lg shadow-md p-4 max-w-4xl mx-auto">
    <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
      ⭐ Assign Ratings to Experiences
    </h3>
    
    <div className="bg-white rounded p-4">
      <div className="space-y-4 mb-4">
        {/* 1. TARGET SELECTION */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            1. Select Target:
          </label>
          <select
            id="rating-target"
            className="w-full p-2 border-2 border-gray-300 rounded"
            defaultValue="upload"
          >
            <option value="upload">Upload (User Experiences)</option>
            <option value="key_insights">Key Insights (Curated)</option>
            <option value="both">Both</option>
          </select>
        </div>

        {/* 2. MODE SELECTION */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            2. Apply To:
          </label>
          <div className="space-y-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="rating-mode"
                value="without"
                defaultChecked
                className="w-4 h-4"
              />
              <span className="text-sm">Only experiences WITHOUT ratings (safe)</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="rating-mode"
                value="all"
                className="w-4 h-4"
              />
              <span className="text-sm text-red-600 font-medium">ALL experiences (will RESET all ratings to 0 first, then assign new ones!)</span>
            </label>
          </div>
        </div>

        {/* 3. PERCENTAGE */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            3. Percentage of Target to Receive Ratings:
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              id="rating-percentage"
              min="1"
              max="100"
              defaultValue="50"
              className="w-24 p-2 border-2 border-gray-300 rounded"
            />
            <span className="text-sm text-gray-600">%</span>
          </div>
          <p className="text-xs text-gray-500 mt-1">Enter a number between 1-100</p>
        </div>

        {/* 4. RATINGS RANGE */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            4. Number of Ratings per Experience (Range):
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              id="rating-min"
              min="1"
              defaultValue="1"
              className="w-24 p-2 border-2 border-gray-300 rounded"
            />
            <span className="text-sm text-gray-600">to</span>
            <input
              type="number"
              id="rating-max"
              min="1"
              defaultValue="100"
              className="w-24 p-2 border-2 border-gray-300 rounded"
            />
            <span className="text-sm text-gray-600">ratings</span>
          </div>
          <p className="text-xs text-gray-500 mt-1">e.g., 1-100, or 20-30</p>
        </div>

        {/* 5. STARS DISTRIBUTION */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            5. Stars Distribution (Default):
          </label>
          <div className="bg-gray-50 p-3 rounded text-xs space-y-1">
            <div className="flex justify-between">
              <span>⭐ 1-2 stars:</span>
              <span className="font-semibold">5%</span>
            </div>
            <div className="flex justify-between">
              <span>⭐⭐ 2-3 stars:</span>
              <span className="font-semibold">15%</span>
            </div>
            <div className="flex justify-between">
              <span>⭐⭐⭐ 3-4 stars:</span>
              <span className="font-semibold">30%</span>
            </div>
            <div className="flex justify-between">
              <span>⭐⭐⭐⭐ 4-5 stars:</span>
              <span className="font-semibold">50%</span>
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={async () => {
          const target = document.getElementById('rating-target').value;
          const mode = document.querySelector('input[name="rating-mode"]:checked').value;
          const percentage = parseInt(document.getElementById('rating-percentage').value);
          const ratingMin = parseInt(document.getElementById('rating-min').value);
          const ratingMax = parseInt(document.getElementById('rating-max').value);

          // Validações
          if (!percentage || percentage < 1 || percentage > 100) {
            alert('⚠️ Percentage must be between 1-100');
            return;
          }

          if (!ratingMin || !ratingMax || ratingMin < 1 || ratingMax < ratingMin) {
            alert('⚠️ Invalid ratings range. Max must be >= Min, and both must be >= 1');
            return;
          }

          let confirmMsg = '';
          if (mode === 'all') {
            confirmMsg = `🔴 WARNING: This will RESET ALL RATINGS TO ZERO first!\n\nThen assign new ratings to:\nTarget: ${target}\nPercentage: ${percentage}%\nRatings: ${ratingMin}-${ratingMax}\n\nContinue?`;
          } else {
            confirmMsg = `Target: ${target}\nMode: Only without ratings\nPercentage: ${percentage}%\nRatings: ${ratingMin}-${ratingMax}\n\nContinue?`;
          }

          if (!window.confirm(confirmMsg)) return;

          const button = document.getElementById('assign-ratings-btn');
          const originalText = button.textContent;
          button.disabled = true;

          try {
            // STEP 1: Reset ALL ratings if mode is "all"
            if (mode === 'all') {
              button.textContent = '⏳ Step 1/2: Resetting ALL ratings to 0...';
              
              let resetQuery = supabase
                .from('experiences')
                .update({ avg_rating: 0, total_ratings: 0 });
              
              // Aplicar filtro de target no reset também
              if (target === 'upload') {
                resetQuery = resetQuery.or('author.neq.key_insights,author.is.null');
              } else if (target === 'key_insights') {
                resetQuery = resetQuery.eq('author', 'key_insights');
              }
              // Se target === 'both', reseta todos
              
              const { error: resetError } = await resetQuery;
              if (resetError) throw resetError;
              
              console.log('✅ All ratings reset to 0');
            }

            // STEP 2: Query experiences based on mode
            button.textContent = mode === 'all' ? '⏳ Step 2/2: Assigning new ratings...' : '⏳ Processing...';
            
            let query = supabase
              .from('experiences')
              .select('id, author, total_ratings');

            // Aplicar filtro de target
            if (target === 'upload') {
              query = query.or('author.neq.key_insights,author.is.null');
            } else if (target === 'key_insights') {
              query = query.eq('author', 'key_insights');
            }

            // Aplicar filtro de mode (apenas se mode = 'without')
            if (mode === 'without') {
              query = query.eq('total_ratings', 0);
            }

            const { data: experiences, error } = await query;

            if (error) throw error;

            if (!experiences || experiences.length === 0) {
              alert('ℹ️ No experiences found matching the criteria.');
              return;
            }

            console.log(`📊 Found ${experiences.length} experiences`);

            // Embaralhar usando Fisher-Yates
            const shuffled = [...experiences];
            for (let i = shuffled.length - 1; i > 0; i--) {
              const j = Math.floor(Math.random() * (i + 1));
              [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
            }

            // Calcular quantas experiências receberão ratings
            const count = Math.ceil(shuffled.length * (percentage / 100));
            const selectedExps = shuffled.slice(0, count);

            console.log(`✨ Assigning ratings to ${selectedExps.length} experiences (${percentage}%)...`);

            let updates = [];

            selectedExps.forEach(exp => {
              // Distribuição de stars
              const rand = Math.random();
              let avgRating;
              let totalRatings;

              // Gerar número aleatório de ratings entre min e max
              totalRatings = Math.floor(Math.random() * (ratingMax - ratingMin + 1)) + ratingMin;

              if (rand < 0.05) {
                // 5% → 1-2 stars
                avgRating = 1 + Math.random() * 1;
              } else if (rand < 0.20) {
                // 15% → 2-3 stars
                avgRating = 2 + Math.random() * 1;
              } else if (rand < 0.50) {
                // 30% → 3-4 stars
                avgRating = 3 + Math.random() * 1;
              } else {
                // 50% → 4-5 stars
                avgRating = 4 + Math.random() * 1;
              }

              updates.push({
                id: exp.id,
                avg_rating: parseFloat(avgRating.toFixed(2)),
                total_ratings: totalRatings
              });
            });

            console.log(`💾 Updating ${updates.length} experiences...`);

            // Atualizar em lotes de 10
            let processed = 0;
            for (let i = 0; i < updates.length; i += 10) {
              const batch = updates.slice(i, i + 10);

              for (const update of batch) {
                const { error } = await supabase
                  .from('experiences')
                  .update({
                    avg_rating: update.avg_rating,
                    total_ratings: update.total_ratings
                  })
                  .eq('id', update.id);

                if (error) {
                  console.error(`❌ Error updating ${update.id}:`, error);
                } else {
                  processed++;
                }
              }

              button.textContent = `⏳ Processing... ${processed}/${updates.length}`;
            }

            const successMsg = mode === 'all'
              ? `🎉 Success!\n\nStep 1: All ratings reset to 0\nStep 2: Assigned new ratings to ${processed} experiences!\n\nRatings range: ${ratingMin}-${ratingMax}\nStars: Distributed according to default pattern`
              : `🎉 Success!\n\nAssigned ratings to ${processed} experiences!\n\nRatings range: ${ratingMin}-${ratingMax}\nStars: Distributed according to default pattern`;
            
            alert(successMsg);
            await loadExperiences(true);

          } catch (error) {
            console.error('Error:', error);
            alert('❌ Error assigning ratings. Check console for details.');
          } finally {
            button.disabled = false;
            button.textContent = originalText;
          }
        }}
        id="assign-ratings-btn"
        className="w-full px-6 py-3 bg-orange-600 text-white rounded hover:bg-orange-700 font-semibold transition-colors"
      >
        ⭐ Execute: Assign Ratings
      </button>

      <p className="text-xs text-gray-500 mt-3 text-center">
        💡 Tip: Use "ALL" mode to reset and redistribute ratings from scratch
      </p>
    </div>
  </div>
)}
        
        {/* Inspirational Quotes Marquee - Top */}
        {appSettings.showMarquee && (() => {
          const topQuotes = quotes.filter(q => q.position === 'top');
          if (topQuotes.length === 0) return null;
          return (
            <div className="overflow-hidden py-2 mb-8">
              <div className="animate-marquee whitespace-nowrap inline-block">
                {topQuotes.concat(topQuotes).map((quote, index) => (
                  <span key={index} className="inline-block mx-8 text-gray-700" style={{ whiteSpace: 'pre' }}>
                    <span className="italic">{quote.text}</span>
                    {quote.author && <span className="text-indigo-600 ml-2">— {quote.author}</span>}
                  </span>
                ))}
              </div>
            </div>
          );
        })()}

        {/* Top 3 Experiences This Week - MOVED TO TOP */}
        {appSettings.showTop3 && (() => {
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
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                {top3Data.map((exp, index) => (
                  <button
                    key={exp.id}

onClick={() => {
  const expId = exp.id;
  
  // SEMPRE mudar para Individual e limpar TODOS os filtros
  setFilterMode('individual');
  setShowKeyInsights(false);
  setKeyInsightCategory('');
  setFilters({ problemCategory: '', searchText: '', resultCategory: '', rating: '', gender: '', age: '', country: '', industrySector: '' });
  setMappedFilter(null);
  // Aguardar React renderizar (reduzido)
  setTimeout(() => {
    const individualExps = experiences.filter(e => e.author !== 'key_insights');
    const expIndex = individualExps.findIndex(e => e.id === expId);
    
    if (expIndex !== -1) {
      const expPage = Math.ceil((expIndex + 1) / experiencesPerPage);
      setCurrentPage(expPage);
      
      // Aguardar renderização e scrollar (MAIS RÁPIDO)
      setTimeout(() => {
        let attempts = 0;
        const tryScroll = setInterval(() => {
          const expElement = document.getElementById(`exp-${expId}`);
          
          if (expElement) {
            clearInterval(tryScroll);
            const yOffset = -100;
            const y = expElement.getBoundingClientRect().top + window.pageYOffset + yOffset;
            window.scrollTo({ top: y, behavior: 'smooth' });
          } else if (attempts >= 15) {
            clearInterval(tryScroll);
          }
          
          attempts++;
        }, 150);
      }, 400);
    }
  }, 50);
}}


                    
                    className="bg-white rounded-xl shadow-lg p-6 relative hover:shadow-2xl hover:scale-105 transition-all duration-300 text-left cursor-pointer"
                  
                >
                    <div className="absolute -top-3 -left-3 bg-yellow-500 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg shadow-lg">
                      #{index + 1}
                    </div>
                    
                    <div className="space-y-4 mt-2">
                      <div>
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <h4 className="font-semibold text-red-600 flex items-center gap-2">
                            <AlertCircle size={16} />
                            Problem
                          </h4>
                          <span className="text-xs bg-red-100 text-red-700 px-3 py-1 rounded-full shrink-0 ml-auto">
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
<p 
  className={`text-sm text-gray-700 ${exp.author === 'key_insights' ? 'whitespace-pre-line' : 'line-clamp-3 whitespace-pre-line'}`}
>
  {exp.solution}
</p>
                      </div>

                      <div>
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <h4 className="font-semibold text-green-600 flex items-center gap-2">
                            <Share2 size={16} />
                            Result
                          </h4>
                          <span className={`text-xs px-3 py-1 rounded-full shrink-0 ml-auto ${getResultColor(exp.resultCategory)}`}>
                            {getResultLabel(exp.resultCategory)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 line-clamp-3">{exp.result}</p>
                      </div>
                    </div>

                    {/* Click to comment CTA */}
                    <div className="mt-4 pt-4 border-t-2 border-purple-200">
                    <p className="text-center text-lg">
                      💬 ✍️
                    </p>
                    </div>
                    
                  </button>
                ))}
              </div>
              
              <div className="text-center">
                <button
                  onClick={() => {
                    const experiencesSection = document.getElementById('experiences-section');
                    if (experiencesSection) {
                      experiencesSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                  }}
                  className="text-purple-600 hover:text-purple-800 font-medium text-sm flex items-center gap-2 mx-auto transition-colors"
                >
                  <TrendingUp size={16} />
                  Check all experiences shared
                  <TrendingUp size={16} className="rotate-180" />
                </button>
              </div>
            </div>
          );
        })()}

        {/* Inspirational Quotes Marquee - Bottom */}
        {appSettings.showMarquee && (() => {
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

<div id="share-section" className="bg-white rounded-2xl shadow-xl p-8 mb-8">
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

{/* Industry Sector - só no Pro */}
{!appSettings.requireEmployeeLogin && (
  <div className="mt-3">
    <select
      value={currentEntry.industrySector}
      onChange={(e) => setCurrentEntry({...currentEntry, industrySector: e.target.value})}
      className="w-full p-2 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
      required
    >
      <option value="">Select your industry sector...</option>
      {industrySectors.map(sector => (
        <option key={sector} value={sector}>{sector}</option>
      ))}
    </select>
  </div>
)}
              
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
  {/* Author - só no Pro */}
  {!appSettings.requireEmployeeLogin && (
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
  )}
  
  {/* Gender - só no Pro */}
  {!appSettings.requireEmployeeLogin && (
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
  )}
  
  {/* Age - só no Pro */}
  {!appSettings.requireEmployeeLogin && (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">Age Range (optional)</label>
      <select
        value={currentEntry.age}
        onChange={(e) => setCurrentEntry({...currentEntry, age: e.target.value})}
        className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none bg-white"
        style={{ backgroundImage: 'none' }} 
      >
        <option value="">Prefer not to say</option>
        {ageOptions.map(age => (
          <option key={age} value={age}>{age}</option>
        ))}
      </select>
    </div>
  )}
  
  {/* Country - só no Pro */}
  {!appSettings.requireEmployeeLogin && (
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
  )}
</div>

{/* Upload Document - dinâmico baseado em documentType */}
{appSettings.allowCvUpload && (
  <div className="md:col-span-2">
    <label className="block text-sm font-medium text-gray-700 mb-2">
      {appSettings.documentType === 'cv' 
        ? 'Upload CV (optional) - PDF only'
        : 'Upload File (optional) - PPT, XLS, PDF, DOCX'}
    </label>
    
    {!selectedCv ? (
      <label className="px-3 py-2 bg-gray-100 border-2 border-gray-200 rounded-lg hover:bg-gray-200 cursor-pointer inline-flex items-center gap-1 text-sm">
  <input
    type="file"
    accept={appSettings.documentType === 'cv' ? '.pdf' : '.pdf,.pptx,.xlsx,.docx,.ppt,.xls,.doc'}
    onChange={(e) => {
      const file = e.target.files[0];
      if (file) {
        if (file.size > 5000000) {
          alert('File too large. Max 5MB');
          e.target.value = '';
        } else {
          setSelectedCv(file);
        }
      }
    }}
    className="hidden"
  />
  {appSettings.documentType === 'cv' ? '📎 CV' : '📎 File'}
</label>
    ) : (
      <div className="flex items-center gap-2 p-2 bg-green-50 border-2 border-green-300 rounded-lg">
        <span className="text-sm text-green-700">
          {appSettings.documentType === 'cv' ? '📄' : '📎'} {selectedCv.name}
        </span>
        <button
          onClick={() => setSelectedCv(null)}
          className="ml-auto text-red-600 hover:text-red-800"
        >
          ❌ Remove
        </button>
      </div>
    )}
    
    <p className="text-xs text-gray-500 mt-1">Max 5MB</p>
  </div>
)}
  
          <button
            onClick={handleSubmit}
            className="w-full mt-6 bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition-all shadow-lg"
          >
            Share Experience
          </button>
        </div>
        
<div className="space-y-6" id="experiences-section">
          
          
          
          {/* RATING STATISTICS - TEMPORARILY DISABLED */}
          {/* 
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl shadow-md p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Rating Statistics</h3>
            
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
                            <Star size={24} className="text-gray-300" />
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
          */}
          
<div className="bg-white rounded-xl shadow-md p-6 mb-6">
{/* Título e Info */}
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">See What Others Did</h2>
              <div className="flex items-center gap-4 text-sm text-gray-600 flex-wrap">
                <span className="font-medium">{experiences.length} experiences shared</span>
                
                {/* Average Rating */}
                {(() => {
                  const ratedExperiences = experiences.filter(exp => exp.totalRatings > 0);
                  const avgRating = ratedExperiences.length > 0 
                    ? ratedExperiences.reduce((sum, exp) => sum + exp.avgRating, 0) / ratedExperiences.length 
                    : 0;
                  
                  if (ratedExperiences.length === 0) return null;
                  
                  return (
                    <>
                      <span className="text-gray-400">•</span>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map(star => {
                            const fillPercentage = Math.min(Math.max(avgRating - star + 1, 0), 1) * 100;
                            return (
                              <div key={star} className="relative inline-block">
                                <Star size={16} className="text-gray-300" />
                                <div 
                                  className="absolute top-0 left-0 overflow-hidden"
                                  style={{ width: `${fillPercentage}%` }}
                                >
                                  <Star size={16} className="text-yellow-500 fill-yellow-500" />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                        <span className="font-medium text-gray-700"><span className="font-bold">{avgRating.toFixed(1)}</span> out of 5</span>
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>
            
            {/* TABS */}
           <div id="experiences-section" className="flex gap-2 mb-6 border-b-2 border-gray-200 pb-2">
              <button
  onClick={() => {
    setFilterMode('individual');
    setShowKeyInsights(false);
    setKeyInsightCategory('');
    setFilters({ problemCategory: '', searchText: '', resultCategory: '', rating: '', gender: '', age: '', country: '', industrySector: '' });
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
    setFilters({ problemCategory: '', searchText: '', resultCategory: '', rating: '', gender: '', age: '', country: '', industrySector: '' });
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

{/* CONTEÚDO DA TAB INDIVIDUAL EXPERIENCES */}
            {filterMode === 'individual' && (
              <>
                {/* Filtros principais */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
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

                  {/* Industry Sector Filter - só no Pro */}
{!appSettings.requireEmployeeLogin && (
  <div>
    <label className="block text-sm font-medium text-gray-600 mb-2">
      <Briefcase className="inline mr-1" size={14} />
      Industry Sector
    </label>
    <select
      value={filters.industrySector}
      onChange={(e) => setFilters({...filters, industrySector: e.target.value})}
      className="w-full p-2 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
    >
      <option value="">All Sectors</option>
      {industrySectors.map(sector => (
        <option key={sector} value={sector}>{sector}</option>
      ))}
    </select>
  </div>
)}
                  
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
                
                {/* Botão More/Less filters */}
                <div className="mb-4">
                  <button
                    onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                    className="text-sm text-purple-600 hover:text-purple-800 font-medium flex items-center gap-2"
                  >
                    {showAdvancedFilters ? '▲ Less filters' : '▼ More filters'}
                  </button>
                </div>
                
                {/* Filtros avançados (colapsáveis) */}
{showAdvancedFilters && (
  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
    {/* Rating - mantém em ambos */}
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
    
    {/* Gender - só no Pro */}
    {!appSettings.requireEmployeeLogin && (
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
    )}
    
    {/* Age - só no Pro */}
    {!appSettings.requireEmployeeLogin && (
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
    )}
    
    {/* Country - só no Pro */}
    {!appSettings.requireEmployeeLogin && (
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
    )}
  </div>
)}
                
                
                <div className="mt-4">
<div className="text-sm font-bold text-purple-600 mb-2">
  {filteredExperiences.length} {filteredExperiences.length === 1 ? 'experience found' : 'experiences found'} - Listed below
</div>
                  {(filters.problemCategory || filters.searchText || filters.resultCategory || filters.rating || filters.gender || filters.age || filters.country) && (
                    <button
                      onClick={() => setFilters({ problemCategory: '', searchText: '', resultCategory: '', rating: '', gender: '', age: '', country: '', industrySector: '' })}
                      className="text-sm text-purple-600 hover:text-purple-800 font-medium"
                    >
                      Clear filters
                    </button>
                  )}
                </div>
              </>
            )}

            {/* CONTEÚDO DA TAB KEY INSIGHTS */}
{filterMode === 'key_insights' && (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-3">Category:</label>
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
      className="w-full p-2 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
    >
      <option value="">All</option>
      {problemCategories.map(cat => (
        <option key={cat} value={cat}>{cat}</option>
      ))}
    </select>
    
    <div className="mt-4">
      <div className="text-sm font-bold text-purple-600 mb-2">
        {filteredExperiences.length} {filteredExperiences.length === 1 ? 'common case found' : 'common cases found'} - Listed below
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
            {/* REST OF THE EXPERIENCES RENDERING CODE - CONTINUES IN NEXT MESSAGE DUE TO LENGTH */}

{/* ⭐ NOVO: Banner quando filtrando por Common Case */}
            {mappedFilter && (
              <div className="bg-purple-50 border-2 border-purple-300 rounded-lg p-4 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3 flex-1">
                  <Target className="text-purple-600 flex-shrink-0 mt-1" size={20} />
                  <div>
                    <p className="font-semibold text-purple-900">
                      Showing {filteredExperiences.length} {filteredExperiences.length === 1 ? 'experience' : 'experiences'} mapped to:
                    </p>
                    <p className="text-sm text-purple-700 mt-1">
                      {getCommonCaseName(mappedFilter)}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setMappedFilter(null)}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm font-semibold transition-colors whitespace-nowrap"
                >
                  Clear Filter
                </button>
              </div>
            )}

{/* DEBUG: Verificar o que está sendo renderizado */}
{console.log('🎨 Renderizando página', currentPage, '- Total cards:', currentExperiences.length, '- IDs:', currentExperiences.map(e => e.id))}
              
            {currentExperiences.map(exp => (
              <div key={exp.id}>
                <div id={`exp-${exp.id}`} className="bg-white rounded-2xl shadow-lg p-6">
                  <div className="mb-4">
{/* Linha 1: By à esquerda */}
<div className="mb-3">
  {(exp.author || exp.gender || exp.age || exp.country || exp.employeeId) && (
    <div>
      <span className="text-xs text-gray-600 block">
        By: {exp.author === 'key_insights' ? 'COMMON CASES' : 
             appSettings.requireEmployeeLogin 
               ? [exp.author, exp.employeeId, exp.country].filter(Boolean).join(', ')
               : [exp.author, exp.gender, exp.age, exp.country].filter(Boolean).join(', ')
            }
      </span>
      
      {/* Ícone Document - linha separada */}
{exp.cvUrl && exp.author !== 'key_insights' && (
  <div className="flex items-center gap-2 mt-1">
    <button
      onClick={() => {
        setCurrentCvUrl(exp.cvUrl);
        setShowCvModal(true);
      }}
      className="text-blue-600 hover:text-blue-800 inline-flex items-center gap-1 text-xs"
      title={`View ${appSettings.documentType === 'cv' ? 'CV' : 'File'} - ${exp.cvFilename || 'Document'}`}
    >
      <span className="font-semibold">{appSettings.documentType === 'cv' ? 'CV' : 'File'}</span> {appSettings.documentType === 'cv' ? '📄' : '📎'}
    </button>
    
    {/* Botão Delete File - só para o dono */}
    {appSettings.requireEmployeeLogin && exp.employeeId === employeeId && (
      <button
        onClick={async () => {
          if (window.confirm('Delete this file?')) {
            await deleteFileFromStorage(exp.cvUrl);
            
            const { error } = await supabase
              .from('experiences')
              .update({ cv_url: null, cv_filename: null })
              .eq('id', exp.id);
            
            if (error) {
              alert('Error removing file');
            } else {
              await loadExperiences(true);
            }
          }
        }}
        className="text-red-600 hover:text-red-800 text-xs"
        title="Delete file"
      >
        ✕
      </button>
    )}
  </div>
)}
    </div>
  )}
</div>

 {/* Delete Experience - só para o dono */}
{appSettings.requireEmployeeLogin && exp.employeeId === employeeId && exp.author !== 'key_insights' && (
  <button
    onClick={async () => {
      if (window.confirm('Delete this experience? All comments will also be deleted.')) {
        await deleteExperienceFromSupabase(exp.id);
      }
    }}
    className="text-red-600 hover:text-red-800 text-xs mt-2 inline-flex items-center gap-1"
  >
    🗑️ Delete Experience
  </button>
)}                   
                    
{exp.industrySector && !appSettings.requireEmployeeLogin && (
  <div className="mb-3">
    <span className="inline-flex items-center gap-1 text-xs bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full">
      <Briefcase size={12} />
      {exp.industrySector}
    </span>
  </div>
)}
  
                    

  <div className="flex justify-end">
    <div className="flex flex-col items-end gap-3">
      {/* Linha 2: Rating médio */}
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
      
      {/* Linhas 3-4: Your rating */}
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
                      <p className="text-sm text-gray-700">
  {highlightText(exp.problem, filters.searchText ? filters.searchText.toLowerCase().trim().split(/\s+/) : [])}
</p>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-semibold text-blue-600 flex items-center gap-2">
                        <TrendingUp size={16} />
                        Action
                      </h4>
<p className={`text-sm text-gray-700 ${exp.author === 'key_insights' ? 'whitespace-pre-line' : ''}`}>
  {highlightText(exp.solution, filters.searchText ? filters.searchText.toLowerCase().trim().split(/\s+/) : [])}
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
<p className="text-sm text-gray-700">
  {highlightText(exp.result, filters.searchText ? filters.searchText.toLowerCase().trim().split(/\s+/) : [])}
</p>
</div>
</div>

                  {/* Badges - Agora embaixo do grid */}
                  <div className="mb-4 flex flex-wrap gap-2">
                    
                    
                    
                  </div>
{/* Badges bi-direcionais - Movidos para baixo */}
                  <div className="mb-4 flex flex-wrap gap-2 justify-end">
                    {exp.relatedCommonCaseId && (exp.source === 'uploaded' || exp.source === 'app') && (
  <button
    onClick={() => {
      console.log('=== BADGE CLICADO ===');
      console.log('Exp ID:', exp.id);
      console.log('Exp Category:', exp.problemCategory);
      console.log('Related Common Case ID:', exp.relatedCommonCaseId);
      
      const commonCase = experiences.find(e => e.id === exp.relatedCommonCaseId);
      console.log('Common Case encontrado:', commonCase);
      console.log('Common Case problem:', commonCase?.problem);
      console.log('Common Case category:', commonCase?.problemCategory);
      
      navigateToKeyInsight(exp.relatedCommonCaseId);
    }}
    className="inline-flex items-center gap-1 text-xs bg-purple-100 text-purple-800 px-3 py-1 rounded-full border-2 border-purple-300 hover:bg-purple-200 transition-colors cursor-pointer"
  >
    <Target size={12} />
    🎯 Matching Common Case →
  </button>
)}
                    
                    {(() => {
                      const mappedCount = experiences.filter(e => (e.source === 'uploaded' || e.source === 'app') && e.relatedCommonCaseId === exp.id).length;
                      if (mappedCount > 0) {
                        return (
                          <button
                            onClick={() => showMappedExperiences(exp.id)}
                            className="inline-flex items-center gap-1 text-xs bg-green-100 text-green-800 px-3 py-1 rounded-full border-2 border-green-300 hover:bg-green-200 transition-colors cursor-pointer"
                          >
                            <Users size={12} />
                            👥 {mappedCount} Matching {mappedCount === 1 ? 'Experience' : 'Experiences'} →
                          </button>
                        );
                      }
                      return null;
                    })()}
                  </div>


                  
                  {isAdmin && (() => {
                    const confirmKey = `exp-${exp.id}`;
                    const isConfirming = confirmDelete === confirmKey;
                    return (
                      <div className="mt-4 mb-4">
                        <div className="flex gap-2 items-center flex-wrap">
                          <button
                            onClick={() => setEditingExperience(editingExperience === exp.id ? null : exp.id)}
                            className="px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 flex items-center gap-2"
                          >
                            ✏️ {editingExperience === exp.id ? 'Cancel Edit' : 'Edit Experience'}
                          </button>
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
                          
                          {/* Top 3 Checkboxes */}
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
                    );
                  })()}

                  <div className="border-t pt-4 mt-4">
                    <div className="mb-4">
                      <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                        <MessageCircle size={18} />
                        Add a Comment
                      </h4>
                      
<div className="space-y-2">
  {/* Linha 1: Textarea */}
  <textarea
    value={newComment[exp.id] || ''}
    onChange={(e) => {
      if (e.target.value.length <= maxChars.comment) {
        setNewComment({...newComment, [exp.id]: e.target.value});
      }
    }}
    placeholder="Share your thoughts..."
    className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none resize-none"
    rows="2"
  />
  
  {/* Linha 2: Upload + Enviar */}
  <div className="flex gap-2 items-center">
    {/* Upload Document - dinâmico */}
    {appSettings.allowCvUpload && (
      <div className="flex items-center">
        {!commentCvFiles[exp.id] ? (
          <label className="px-3 py-2 bg-gray-100 border-2 border-gray-200 rounded-lg hover:bg-gray-200 cursor-pointer flex items-center gap-1 text-sm">
            <input
              type="file"
              accept={appSettings.documentType === 'cv' ? '.pdf' : '.pdf,.pptx,.xlsx,.docx,.ppt,.xls,.doc'}
              onChange={(e) => {
                const file = e.target.files[0];
                if (file) {
                  if (file.size > 5000000) {
                    alert('File too large. Max 5MB');
                    e.target.value = '';
                  } else {
                    setCommentCvFiles({...commentCvFiles, [exp.id]: file});
                  }
                }
              }}
              className="hidden"
            />
            {appSettings.documentType === 'cv' ? '📎 CV' : '📎 File'}
          </label>
        ) : (
          <div className="flex items-center gap-1 bg-green-50 border-2 border-green-300 rounded-lg px-2 py-1">
            <span className="text-xs text-green-700">✓ {appSettings.documentType === 'cv' ? 'CV' : 'File'}</span>
            <button
              onClick={() => {
                const newFiles = {...commentCvFiles};
                delete newFiles[exp.id];
                setCommentCvFiles(newFiles);
              }}
              className="text-red-600 hover:text-red-800 text-xs"
            >
              ✕
            </button>
          </div>
        )}
      </div>
    )}
    
    <button
      onClick={() => handleAddComment(exp.id)}
      disabled={!newComment[exp.id]?.trim()}
      className="px-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2 py-2"
    >
      <Send size={18} />
    </button>
  </div>
</div>

                      
                      <div className="text-xs text-gray-500 text-right mt-1">
                        {(newComment[exp.id] || '').length}/{maxChars.comment}
                      </div>
                    </div>

                    {exp.comments.length > 0 && (
  <div>
    <button
      onClick={() => {
  if (showComments[exp.id] === true) {
    setShowComments({...showComments, [exp.id]: false});
  } else if (showComments[exp.id] === false) {
    setShowComments({...showComments, [exp.id]: true});
  } else {
    if (exp.comments.length === 1) {
      setShowComments({...showComments, [exp.id]: false});
    } else {
      setShowComments({...showComments, [exp.id]: true});
    }
  }
}}
      className="text-sm text-purple-600 hover:text-purple-800 font-medium mb-3 flex items-center gap-2"
    >
      <MessageCircle size={16} />
      {showComments[exp.id] === true ? 'Hide all comments' : 
 showComments[exp.id] === false ? `Show all ${exp.comments.length} previous ${exp.comments.length === 1 ? 'comment' : 'comments'}` :
 exp.comments.length === 1 ? 'Hide all comments' : `Show all ${exp.comments.length} previous ${exp.comments.length === 1 ? 'comment' : 'comments'}`}
    </button>
   {showComments[exp.id] === true && (
  <div className="space-y-3">
    {exp.comments.map(comment => (
      <div key={comment.id} className="bg-gray-50 rounded-lg p-3 relative">

{/* By: info - SÓ NO CORP */}
        {appSettings.requireEmployeeLogin && (comment.author || comment.employeeId || comment.country) && (
          <div className="mb-2">
            <span className="text-xs text-gray-600 block">
              By: {[comment.author, comment.employeeId, comment.country].filter(Boolean).join(', ')}
            </span>
            
            {/* Ícone Document - linha separada */}
{comment.cvUrl && (
  <div className="flex items-center gap-2 mt-1">
    <button
      onClick={() => {
        setCurrentCvUrl(comment.cvUrl);
        setShowCvModal(true);
      }}
      className="text-blue-600 hover:text-blue-800 inline-flex items-center gap-1 text-xs"
    >
      <span className="font-semibold">{appSettings.documentType === 'cv' ? 'CV' : 'File'}</span> {appSettings.documentType === 'cv' ? '📄' : '📎'}
    </button>
    
    {/* Botão Delete File - só para o dono */}
    {comment.employeeId === employeeId && (
      <button
        onClick={async () => {
          if (window.confirm('Delete this file?')) {
            await deleteFileFromStorage(comment.cvUrl);
            
            const { error } = await supabase
              .from('comments')
              .update({ cv_url: null, cv_filename: null })
              .eq('id', comment.id);
            
            if (error) {
              alert('Error removing file');
            } else {
              await loadExperiences(true);
            }
          }
        }}
        className="text-red-600 hover:text-red-800 text-xs"
        title="Delete file"
      >
        ✕
      </button>
    )}
  </div>
)}
          </div>
        )}
        
        {/* Botão delete admin */}
        {isAdmin && (() => {
          const confirmKey = `comment-${exp.id}-${comment.id}`;
          const isConfirming = confirmDelete === confirmKey;
          return (
            <div className="absolute top-2 right-2 flex gap-2">
              <button
                onClick={() => handleDeleteComment(exp.id, comment.id)}
                className={`px-2 py-1 text-white text-xs rounded flex items-center gap-1 ${
                  isConfirming ? 'bg-orange-600 hover:bg-orange-700 animate-pulse' : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                <Trash2 size={12} />
                {isConfirming ? 'Confirm!' : 'Delete'}
              </button>
              {isConfirming && (
                <button
                  onClick={() => setConfirmDelete(null)}
                  className="px-2 py-1 bg-gray-500 text-white text-xs rounded hover:bg-gray-600"
                >
                  Cancel
                </button>
              )}
            </div>
          );
        })()}
        
        
        
        {comment.rating && (
           <div className="flex items-center gap-1 mb-2 mt-1">
            {[1, 2, 3, 4, 5].map(star => (
              <Star
                key={star}
                size={14}
                className={star <= comment.rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}
              />
            ))}
          </div>
        )}
        
        <p className="text-sm text-gray-700">
          {comment.text}
        </p>

{/* Delete Comment - só para o dono */}
{comment.employeeId === employeeId && (
  <button
    onClick={() => {
      if (window.confirm('Delete this comment?')) {
        handleDeleteComment(exp.id, comment.id);
      }
    }}
    className="text-red-600 hover:text-red-800 text-xs mt-2 inline-flex items-center gap-1"
  >
    🗑️ Delete Comment
  </button>
)}
      </div>
    ))}
  </div>
)}

{/* ⭐ NOVO: Último comentário sempre visível quando lista está fechada */}
{showComments[exp.id] !== true && showComments[exp.id] !== false && exp.comments.length > 0 && (
  <div className="space-y-3 mt-3">
    {(() => {
      const lastComment = exp.comments[exp.comments.length - 1];
      return (
        <div key={lastComment.id} className="bg-gray-50 rounded-lg p-3 border-2 border-purple-200 relative">

{/* By: info - SÓ NO CORP */}
          {appSettings.requireEmployeeLogin && (lastComment.author || lastComment.employeeId || lastComment.country) && (
            <div className="mb-2">
              <span className="text-xs text-gray-600 block">
                By: {[lastComment.author, lastComment.employeeId, lastComment.country].filter(Boolean).join(', ')}
              </span>
              
              {/* Ícone Document - linha separada */}
{lastComment.cvUrl && (
  <div className="flex items-center gap-2 mt-1">
    <button
      onClick={() => {
        setCurrentCvUrl(lastComment.cvUrl);
        setShowCvModal(true);
      }}
      className="text-blue-600 hover:text-blue-800 inline-flex items-center gap-1 text-xs"
    >
      <span className="font-semibold">{appSettings.documentType === 'cv' ? 'CV' : 'File'}</span> {appSettings.documentType === 'cv' ? '📄' : '📎'}
    </button>
    
    {/* Botão Delete File - só para o dono */}
    {lastComment.employeeId === employeeId && (
      <button
        onClick={async () => {
          if (window.confirm('Delete this file?')) {
            await deleteFileFromStorage(lastComment.cvUrl);
            
            const { error } = await supabase
              .from('comments')
              .update({ cv_url: null, cv_filename: null })
              .eq('id', lastComment.id);
            
            if (error) {
              alert('Error removing file');
            } else {
              await loadExperiences(true);
            }
          }
        }}
        className="text-red-600 hover:text-red-800 text-xs"
        title="Delete file"
      >
        ✕
      </button>
    )}
  </div>
)}
            </div>
          )}
          
          {/* Botão delete admin */}
          {isAdmin && (() => {
            const confirmKey = `comment-${exp.id}-${lastComment.id}`;
            const isConfirming = confirmDelete === confirmKey;
            return (
              <div className="absolute top-2 right-2 flex gap-2">
                <button
                  onClick={() => handleDeleteComment(exp.id, lastComment.id)}
                  className={`px-2 py-1 text-white text-xs rounded flex items-center gap-1 ${
                    isConfirming ? 'bg-orange-600 hover:bg-orange-700 animate-pulse' : 'bg-red-600 hover:bg-red-700'
                  }`}
                >
                  <Trash2 size={12} />
                  {isConfirming ? 'Confirm!' : 'Delete'}
                </button>
                {isConfirming && (
                  <button
                    onClick={() => setConfirmDelete(null)}
                    className="px-2 py-1 bg-gray-500 text-white text-xs rounded hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                )}
              </div>
            );
          })()}
          

          
          {lastComment.rating && (
            <div className="flex items-center gap-1 mb-2">
              {[1, 2, 3, 4, 5].map(star => (
                <Star
                  key={star}
                  size={14}
                  className={star <= lastComment.rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}
                />
              ))}
            </div>
          )}
          
          <p className="text-sm text-gray-700">
            {lastComment.text}
          </p>

          {/* Delete Comment - só para o dono */}
{lastComment.employeeId === employeeId && (
  <button
    onClick={() => {
      if (window.confirm('Delete this comment?')) {
        handleDeleteComment(exp.id, lastComment.id);
      }
    }}
    className="text-red-600 hover:text-red-800 text-xs mt-2 inline-flex items-center gap-1"
  >
    🗑️ Delete Comment
  </button>
)}

          
        </div>
      );
    })()}
  </div>
)}
                    
             

              </div>
            )}

{/* Navigation CTA */}
                  <div className="mt-6 pt-4 border-t-2 border-gray-100 text-center">
                    <div className="flex items-center justify-center gap-3 text-sm">
                      <button
                        onClick={() => document.getElementById('experiences-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                        className="text-purple-600 hover:text-purple-800 font-medium transition-colors"
                      >
                        Browse
                      </button>
                      {appSettings.showTop3 && <>
                      <span className="text-gray-400">•</span>
                      <button
                        onClick={() => document.querySelector('.bg-gradient-to-r.from-purple-100.to-blue-100')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                        className="text-purple-600 hover:text-purple-800 font-medium transition-colors"
                      >
                        Top3
                      </button>
                      </>}
                      <span className="text-gray-400">•</span>
                      <button
                        onClick={() => document.getElementById('share-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                        className="text-purple-600 hover:text-purple-800 font-medium transition-colors"
                      >
                        Share your stories
                      </button>
                    </div>
                  </div>

              {isAdmin && editingExperience === -1 && (
                  <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-4 mt-4">
                    <h4 className="font-semibold text-gray-800 mb-3">Edit Experience #{exp.id}</h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Problem Category</label>
                        <select
                          value={editingData[exp.id]?.problemCategory || exp.problemCategory}
                          onChange={(e) => setEditingData({...editingData, [exp.id]: {...(editingData[exp.id] || exp), problemCategory: e.target.value}})}
                          className="w-full p-2 border-2 border-gray-300 rounded"
                        >
                          {problemCategories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-1">Result Category</label>
                        <select
                          value={editingData[exp.id]?.resultCategory || exp.resultCategory}
                          onChange={(e) => setEditingData({...editingData, [exp.id]: {...(editingData[exp.id] || exp), resultCategory: e.target.value}})}
                          className="w-full p-2 border-2 border-gray-300 rounded"
                        >
                          {resultCategories.map(cat => (
                            <option key={cat.value} value={cat.value}>{cat.label}</option>
                          ))}
                        </select> 
                      </div>
                    </div>
                    
                    <div className="space-y-3 mb-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Problem</label>
                        <textarea
                          value={editingData[exp.id]?.problem || exp.problem}
                          onChange={(e) => setEditingData({...editingData, [exp.id]: {...(editingData[exp.id] || exp), problem: e.target.value}})}
                          className="w-full p-2 border-2 border-gray-300 rounded"
                          rows="3"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-1">Solution</label>
                        <textarea
                          value={editingData[exp.id]?.solution || exp.solution}
                          onChange={(e) => setEditingData({...editingData, [exp.id]: {...(editingData[exp.id] || exp), solution: e.target.value}})}
                          className="w-full p-2 border-2 border-gray-300 rounded"
                          rows="3"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-1">Result</label>
                        <textarea
                          value={editingData[exp.id]?.result || exp.result}
                          onChange={(e) => setEditingData({...editingData, [exp.id]: {...(editingData[exp.id] || exp), result: e.target.value}})}
                          className="w-full p-2 border-2 border-gray-300 rounded"
                          rows="2"
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Author</label>
                        <input
                          type="text"
                          value={editingData[exp.id]?.author || exp.author}
                          onChange={(e) => setEditingData({...editingData, [exp.id]: {...(editingData[exp.id] || exp), author: e.target.value}})}
                          className="w-full p-2 border-2 border-gray-300 rounded"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-1">Gender</label>
                        <select
                          value={editingData[exp.id]?.gender || exp.gender}
                          onChange={(e) => setEditingData({...editingData, [exp.id]: {...(editingData[exp.id] || exp), gender: e.target.value}})}
                          className="w-full p-2 border-2 border-gray-300 rounded"
                        >
                          <option value="">None</option>
                          {genderOptions.map(g => (
                            <option key={g} value={g}>{g}</option>
                          ))}
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-1">Age</label>
                        <select
                          value={editingData[exp.id]?.age || exp.age}
                          onChange={(e) => setEditingData({...editingData, [exp.id]: {...(editingData[exp.id] || exp), age: e.target.value}})}
                          className="w-full p-2 border-2 border-gray-300 rounded"
                        >
                          <option value="">None</option>
                          {ageOptions.map(a => (
                            <option key={a} value={a}>{a}</option>
                          ))}
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-1">Country</label>
                        <input
                          type="text"
                          value={editingData[exp.id]?.country || exp.country}
                          onChange={(e) => setEditingData({...editingData, [exp.id]: {...(editingData[exp.id] || exp), country: e.target.value}})}
                          className="w-full p-2 border-2 border-gray-300 rounded"
                        />
                      </div>
                    </div>
                    
                    <button
                      
                      onClick={async () => {
  // Salvar posição
  const expElement = document.getElementById(`exp-${exp.id}`);
  const scrollPosition = expElement ? expElement.offsetTop - 100 : window.pageYOffset;
  
  const updatedExp = editingData[exp.id] || exp;
  const { error } = await supabase
    .from('experiences')
    .update({
      problem: updatedExp.problem,
      problem_category: updatedExp.problemCategory,
      solution: updatedExp.solution,
      result: updatedExp.result,
      result_category: updatedExp.resultCategory,
      author: updatedExp.author,
      gender: updatedExp.gender,
      age: updatedExp.age,
      country: updatedExp.country
    })
    .eq('id', exp.id);
  
  if (error) {
    alert('Error updating experience');
  } else {
    await loadExperiences(true);
    setEditingExperience(null);
    setEditingData({});
    
    // Restaurar posição
    setTimeout(() => {
      window.scrollTo({ top: scrollPosition, behavior: 'instant' });
    }, 100);
  }
}}
                      
                      className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 font-semibold"
                    >
                      💾 Save Changes
                    </button>
                  </div>
                )}
            </div>
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

        {/* Content Modal */}
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

        {/* Footer */}
<footer className="mt-12 pt-8 border-t-2 border-gray-200">
  <div className="flex flex-col items-center gap-4">
    <div className="flex gap-3 text-sm flex-wrap justify-center">
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
              <a
                href="https://portal.whatidid.app"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-purple-600 font-medium transition-colors"
              >
                Portal
              </a>
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

{/* Mapping Confirmation Modal */}
{showMappingModal && suggestedMapping && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full p-6 max-h-[80vh] overflow-y-auto">
<h3 className="text-xl font-bold text-gray-800 mb-4">
  🎯 We found {suggestedMapping.length} Common Case {suggestedMapping.length === 1 ? 'match' : 'matches'} for: {suggestedMapping[0]?.match.problemCategory}
</h3>
      
<p className="text-sm text-gray-600 mb-6">
  Your problem matches these common cases. Select the ONE that best describes your situation:
</p>
      
      <div className="space-y-3 mb-6">
        {suggestedMapping.map((item, index) => (
          <label 
            key={item.match.id}
            className="flex items-start gap-3 p-4 bg-purple-50 rounded-lg border-2 border-purple-200 hover:border-purple-400 cursor-pointer transition-all"
          >
<input
  type="radio"
  name="commonCaseSelection"
  id={`match-${item.match.id}`}
  className="mt-1 w-5 h-5 text-purple-600 focus:ring-purple-500"
/>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <p className="font-semibold text-gray-800">
                  {item.match.problem}
                </p>
<span></span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-purple-600 h-2 rounded-full transition-all"
                  style={{ width: `${item.confidence}%` }}
                ></div>
              </div>
            </div>
          </label>
        ))}
      </div>
      
      <p className="text-xs text-gray-500 mb-6">
        Note: Linking helps other users find real examples related to these common cases.
      </p>
      
      <div className="flex gap-3">
        <button
          onClick={() => confirmMapping([])}
          className="flex-1 px-4 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-semibold transition-colors"
        >
          No, it's different
        </button>
        <button
          onClick={() => {
            const selected = suggestedMapping
              .filter((item, index) => 
                document.getElementById(`match-${item.match.id}`).checked
              )
              .map(item => item.match.id);
            
if (selected.length === 0) {
  alert('Please select one Common Case or click "No, it\'s different"');
  return;
}
            
            confirmMapping(selected);
          }}
          className="flex-1 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-semibold transition-colors"
        >
          ✓ Link to this case
        </button>
      </div>
    </div>
  </div>
)}

      
    {/* Video Modal */}
    {videoModalOpen && (
      <div 
        className="fixed inset-0 bg-black sm:bg-black sm:bg-opacity-60 z-50 flex items-center justify-center p-0 sm:p-4"
        onClick={closeVideoModal}
      >
        <div 
          className="video-modal-container relative w-full h-full sm:h-auto sm:max-w-2xl flex flex-col justify-center"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Botão Fechar - X preto simples sem fundo */}
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              closeVideoModal();
            }}
            className={`video-modal-close-btn fixed sm:absolute top-4 left-4 z-[99999] text-black sm:text-black hover:text-gray-700 w-10 h-10 sm:w-10 sm:h-10 font-bold transition-colors flex items-center justify-center ${promotionalVideos[currentVideoIndex]?.fileType === 'presentation' ? 'hidden' : ''}`}
            aria-label="Close video"
            style={{ 
              touchAction: 'manipulation', 
              WebkitTapHighlightColor: 'transparent',
              WebkitUserSelect: 'none',
              userSelect: 'none',
              textShadow: '0 0 3px white, 0 0 5px white'
            }}
          >
            <span className="text-4xl sm:text-3xl leading-none pointer-events-none">✕</span>
          </button>
          
          {/* Container do conteúdo */}
          <div className="relative w-full h-full sm:h-auto sm:rounded-lg overflow-hidden shadow-2xl flex items-center justify-center bg-black sm:bg-transparent">
            {promotionalVideos[currentVideoIndex]?.fileType === 'presentation' ? (
              <div className="w-full bg-gray-900 flex flex-col rounded-lg overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-2 bg-gray-800 flex-shrink-0">
                  <span className="text-white text-sm font-medium">📊 Presentation</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const el = document.getElementById('pdf-canvas-container');
                        if (document.fullscreenElement) {
                          document.exitFullscreen();
                        } else if (el?.requestFullscreen) {
                          el.requestFullscreen();
                        } else if (el?.webkitRequestFullscreen) {
                          el.webkitRequestFullscreen();
                        }
                      }}
                      className="px-3 py-1 bg-gray-600 hover:bg-gray-500 text-white rounded text-sm"
                    >⛶ Full</button>
                    <button
                      onClick={(e) => { e.stopPropagation(); closeVideoModal(); }}
                      className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm font-bold"
                    >✕</button>
                  </div>
                </div>

                {/* Canvas */}
                <div
                  id="pdf-canvas-container"
                  className="flex flex-col items-center justify-center bg-gray-900"
                  style={{ minHeight: '60vh' }}
                >
                  <canvas
                    id="pdf-canvas"
                    className="shadow-2xl"
                    style={{ maxWidth: '100%', maxHeight: '70vh' }}
                  />
                  {/* Fullscreen-only navigation overlay */}
                  <div className="pdf-fullscreen-nav hidden items-center gap-4 py-3 mt-2">
                    <button
                      onClick={(e) => { e.stopPropagation(); setCurrentPdfPage(p => Math.max(1, p - 1)); }}
                      disabled={currentPdfPage <= 1}
                      className="px-4 py-2 bg-purple-600 text-white rounded text-sm disabled:opacity-40 hover:bg-purple-700"
                    >← Prev</button>
                    <span className="text-sm text-white font-medium">
                      Slide {currentPdfPage}{pdfTotalPages > 0 ? ` of ${pdfTotalPages}` : ''}
                    </span>
                    <button
                      onClick={(e) => { e.stopPropagation(); setCurrentPdfPage(p => pdfTotalPages > 0 ? Math.min(pdfTotalPages, p + 1) : p + 1); }}
                      disabled={pdfTotalPages > 0 && currentPdfPage >= pdfTotalPages}
                      className="px-4 py-2 bg-purple-600 text-white rounded text-sm disabled:opacity-40 hover:bg-purple-700"
                    >Next →</button>
                    <button
                      onClick={(e) => { e.stopPropagation(); document.exitFullscreen?.() || document.webkitExitFullscreen?.(); }}
                      className="px-4 py-2 bg-gray-600 text-white rounded text-sm hover:bg-gray-500 ml-4"
                    >⊡ Exit Full</button>
                  </div>
                </div>

                {/* Navigation */}
                <div className="flex items-center gap-4 py-2 px-4 bg-gray-800 w-full justify-center flex-shrink-0">
                  <button
                    onClick={(e) => { e.stopPropagation(); setCurrentPdfPage(p => Math.max(1, p - 1)); }}
                    disabled={currentPdfPage <= 1}
                    className="px-4 py-1.5 bg-purple-600 text-white rounded text-sm disabled:opacity-40 hover:bg-purple-700"
                  >← Prev</button>
                  <span className="text-sm text-white font-medium">
                    Slide {currentPdfPage}{pdfTotalPages > 0 ? ` of ${pdfTotalPages}` : ''}
                  </span>
                  <button
                    onClick={(e) => { e.stopPropagation(); setCurrentPdfPage(p => pdfTotalPages > 0 ? Math.min(pdfTotalPages, p + 1) : p + 1); }}
                    disabled={pdfTotalPages > 0 && currentPdfPage >= pdfTotalPages}
                    className="px-4 py-1.5 bg-purple-600 text-white rounded text-sm disabled:opacity-40 hover:bg-purple-700"
                  >Next →</button>
                </div>
              </div>
            ) : (
            <video 
              key={currentVideoIndex}
              controls 
              autoPlay
              preload="auto"
              className="video-modal-player w-full h-full sm:h-auto sm:max-h-[70vh] sm:rounded-lg object-contain"
              onLoadedMetadata={(e) => {
                // Forçar fullscreen no mobile quando o vídeo carregar
                if (window.innerWidth <= 640) {
                  const video = e.target;
                  
                  // Adicionar listener para saída de fullscreen (iOS)
                  video.addEventListener('webkitendfullscreen', () => {
                    console.log('webkitendfullscreen event detected');
                    setTimeout(() => {
                      setVideoModalOpen(false);
                      document.body.style.overflow = 'unset';
                    }, 200);
                  });
                  
                  setTimeout(() => {
                    if (video.requestFullscreen) {
                      video.requestFullscreen().catch(err => console.log('Fullscreen error:', err));
                    } else if (video.webkitRequestFullscreen) {
                      video.webkitRequestFullscreen();
                    } else if (video.mozRequestFullScreen) {
                      video.mozRequestFullScreen();
                    } else if (video.msRequestFullscreen) {
                      video.msRequestFullscreen();
                    } else if (video.webkitEnterFullscreen) {
                      video.webkitEnterFullscreen();
                    }
                  }, 100);
                }
              }}
            >
              <source src={promotionalVideos[currentVideoIndex].url} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
            )}
          </div>
          
          <div className={`flex justify-between items-center mt-0 sm:mt-4 px-4 py-3 sm:py-0 sm:px-0 bg-black sm:bg-transparent absolute sm:relative bottom-4 sm:bottom-auto left-0 right-0 sm:left-auto sm:right-auto z-10 ${promotionalVideos[currentVideoIndex]?.fileType === 'presentation' ? 'hidden' : ''}`}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                prevVideo();
              }}
              className="flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm md:text-base shadow-lg"
            >
              <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="hidden sm:inline">Previous</span>
              <span className="sm:hidden text-xs">◀</span>
            </button>
            
            <span className="text-sm md:text-lg font-semibold text-white bg-black sm:bg-black bg-opacity-70 sm:bg-opacity-70 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg">
              {currentVideoIndex + 1} / {promotionalVideos.length}
            </span>
            
            <button
              onClick={(e) => {
                e.stopPropagation();
                nextVideo();
              }}
              className="flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm md:text-base shadow-lg"
            >
              <span className="hidden sm:inline">Next</span>
              <span className="sm:hidden text-xs">▶</span>
              <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    )}

  {isAdmin && editingExperience && (() => {
  const exp = experiences.find(e => e.id === editingExperience);
  if (!exp) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-semibold text-gray-800 text-lg">Edit Experience #{exp.id}</h4>
          <button onClick={() => { setEditingExperience(null); setEditingData({}); }} className="text-gray-500 hover:text-gray-700 text-3xl leading-none">×</button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-1">Problem Category</label>
            <select value={editingData[exp.id]?.problemCategory || exp.problemCategory} onChange={(e) => setEditingData({...editingData, [exp.id]: {...(editingData[exp.id] || exp), problemCategory: e.target.value}})} className="w-full p-2 border-2 border-gray-300 rounded">
              {problemCategories.map(cat => (<option key={cat} value={cat}>{cat}</option>))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Result Category</label>
            <select value={editingData[exp.id]?.resultCategory || exp.resultCategory} onChange={(e) => setEditingData({...editingData, [exp.id]: {...(editingData[exp.id] || exp), resultCategory: e.target.value}})} className="w-full p-2 border-2 border-gray-300 rounded">
              {resultCategories.map(cat => (<option key={cat.value} value={cat.value}>{cat.label}</option>))}
            </select>
          </div>
        </div>
        <div className="space-y-3 mb-4">
          <div>
            <label className="block text-sm font-medium mb-1">Problem</label>
            <textarea value={editingData[exp.id]?.problem || exp.problem} onChange={(e) => setEditingData({...editingData, [exp.id]: {...(editingData[exp.id] || exp), problem: e.target.value}})} className="w-full p-2 border-2 border-gray-300 rounded" rows="3"/>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Solution</label>
            <textarea value={editingData[exp.id]?.solution || exp.solution} onChange={(e) => setEditingData({...editingData, [exp.id]: {...(editingData[exp.id] || exp), solution: e.target.value}})} className="w-full p-2 border-2 border-gray-300 rounded" rows="3"/>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Result</label>
            <textarea value={editingData[exp.id]?.result || exp.result} onChange={(e) => setEditingData({...editingData, [exp.id]: {...(editingData[exp.id] || exp), result: e.target.value}})} className="w-full p-2 border-2 border-gray-300 rounded" rows="2"/>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
          <div>
            <label className="block text-sm font-medium mb-1">Author</label>
            <input type="text" value={editingData[exp.id]?.author || exp.author} onChange={(e) => setEditingData({...editingData, [exp.id]: {...(editingData[exp.id] || exp), author: e.target.value}})} className="w-full p-2 border-2 border-gray-300 rounded"/>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Gender</label>
            <select value={editingData[exp.id]?.gender || exp.gender} onChange={(e) => setEditingData({...editingData, [exp.id]: {...(editingData[exp.id] || exp), gender: e.target.value}})} className="w-full p-2 border-2 border-gray-300 rounded">
              <option value="">None</option>
              {genderOptions.map(g => (<option key={g} value={g}>{g}</option>))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Age</label>
            <select value={editingData[exp.id]?.age || exp.age} onChange={(e) => setEditingData({...editingData, [exp.id]: {...(editingData[exp.id] || exp), age: e.target.value}})} className="w-full p-2 border-2 border-gray-300 rounded">
              <option value="">None</option>
              {ageOptions.map(a => (<option key={a} value={a}>{a}</option>))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Country</label>
            <input type="text" value={editingData[exp.id]?.country || exp.country} onChange={(e) => setEditingData({...editingData, [exp.id]: {...(editingData[exp.id] || exp), country: e.target.value}})} className="w-full p-2 border-2 border-gray-300 rounded"/>
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={async () => {
            const updatedExp = editingData[exp.id] || exp;
            const { error } = await supabase.from('experiences').update({
              problem: updatedExp.problem, problem_category: updatedExp.problemCategory,
              solution: updatedExp.solution, result: updatedExp.result,
              result_category: updatedExp.resultCategory, author: updatedExp.author,
              gender: updatedExp.gender, age: updatedExp.age, country: updatedExp.country
            }).eq('id', exp.id);
            if (error) { alert('Error updating experience'); }
            else { await loadExperiences(true); setEditingExperience(null); setEditingData({}); }
          }} className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 font-semibold">
            💾 Save Changes
          </button>
          <button onClick={() => { setEditingExperience(null); setEditingData({}); }} className="px-6 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 font-semibold">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
})()}      

        {/* Change Password Modal */}
    {showChangePassword && (
      <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full">
          <div className="text-center mb-5">
            <div className="text-4xl mb-3">🔐</div>
            <h3 className="text-xl font-bold text-gray-800">Set Your New Password</h3>
            <p className="text-sm text-gray-500 mt-1">You logged in with a temporary password. Please set a permanent one.</p>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
              <input
                type="password"
                value={changePasswordNew}
                onChange={(e) => setChangePasswordNew(e.target.value)}
                className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
                placeholder="At least 6 characters"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
              <input
                type="password"
                value={changePasswordConfirm}
                onChange={(e) => setChangePasswordConfirm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleChangePassword()}
                className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
                placeholder="Repeat your password"
              />
            </div>
            {changePasswordError && (
              <div className="bg-red-50 border-2 border-red-200 rounded-lg p-3">
                <p className="text-red-700 text-sm">{changePasswordError}</p>
              </div>
            )}
            <button
              onClick={handleChangePassword}
              className="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 font-semibold transition-colors"
            >
              Save New Password
            </button>
            <button
              onClick={() => setShowChangePassword(false)}
              className="w-full text-gray-500 hover:text-gray-700 text-sm py-1"
            >
              Skip for now
            </button>
          </div>
        </div>
      </div>
    )}

    {/* Modal de CV */}
    {showCvModal && currentCvUrl && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] flex flex-col">
          <div className="flex items-center justify-between p-4 border-b">
            <h3 className="text-lg font-semibold">CV Preview</h3>
            <button
              onClick={() => {
                setShowCvModal(false);
                setCurrentCvUrl(null);
              }}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ×
            </button>
          </div>
          
          <div className="flex-1 overflow-auto p-4">
            <iframe
              src={currentCvUrl}
              className="w-full h-[600px] border-2 border-gray-200 rounded"
              title="CV Preview"
            />
          </div>
          
          <div className="p-4 border-t">
            <a
              href={currentCvUrl}
              download
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
            >
              ⬇️ Download PDF
            </a>
          </div>
        </div>
      </div>
    )}
    
    </>
    )}
    </>
  );
}








