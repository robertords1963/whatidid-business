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
  .category-dropdown-trigger {
    background-color: #f3f4f6 !important;
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
  top3StartVisible: true,
  showMarquee: false
});

const [companyName, setCompanyName] = useState('');
const [companyLogoUrl, setCompanyLogoUrl] = useState('');
const [companyNameSize, setCompanyNameSize] = useState('medium');
const [companyLogoSize, setCompanyLogoSize] = useState('medium');
const [practices, setPractices] = useState([]);
const [selectedPracticeId, setSelectedPracticeId] = useState(null);
const [shareFormPracticeId, setShareFormPracticeId] = useState(null); // practice escolhida no Share Your Experience
const [filterPracticeId, setFilterPracticeId] = useState(null);
const [adminCategories, setAdminCategories] = useState([]);
const [uiPractices, setUiPractices] = useState([]);
const [demoGroups, setDemoGroups] = useState([]);
const [currentEmployeeGroup, setCurrentEmployeeGroup] = useState(null);

// ⭐ CATEGORY DESCRIPTIONS + TAGS
const [categoryData, setCategoryData] = useState({}); // { [catName]: { description, tags: [] } }
const [selectedTags, setSelectedTags] = useState([]);  // tags selecionadas no Share form
const [showCategoryDrawer, setShowCategoryDrawer] = useState(false); // drawer mobile
const [hoveredCategory, setHoveredCategory] = useState(null); // hover desktop
const [showCategoryDropdown, setShowCategoryDropdown] = useState(false); // custom dropdown aberto
const [filterTags, setFilterTags] = useState([]); // tags ativas no filtro See What Others Did
const [editingTags, setEditingTags] = useState(null); // id da experience com tags em edição
const [showFilterCategoryDropdown, setShowFilterCategoryDropdown] = useState(false);
const [reactions, setReactions] = useState({}); // { comment_id: { emoji: [employee_ids] } }

const REACTION_EMOJIS = ['👍','❤️','💡','🎯','😮','😢','🙂','😀','🤩','😂','👏','🙏','💪','👊'];

// ⭐ FOLLOW-ON EXPERIENCE
const [followOnParentId, setFollowOnParentId] = useState(null); // id da exp que originou o follow-on
const [expandedUpstream, setExpandedUpstream] = useState({});
const [expandedFollowOns, setExpandedFollowOns] = useState({});
const [expandedGaps, setExpandedGaps] = useState({}); // { [gapKey]: true }
const [top3VisibleInSession, setTop3VisibleInSession] = useState(true);
const [activeMainTab, setActiveMainTab] = useState('see'); // 'see' | 'share'
// ⭐ Snapshot para o botão Back contextual — guarda de onde o usuário veio ao clicar
// em Browse / Top3 / Share no rodapé de um card, e para onde deve voltar
const [navSnapshot, setNavSnapshot] = useState(null); // { destination: 'browse'|'top3'|'share', state: {...}, scrollY: number }
  
  // ⭐ ADICIONAR AQUI - Estados para Employee Login ⭐
  const [isEmployeeLoggedIn, setIsEmployeeLoggedIn] = useState(false);
  // ⭐ PWA Install
  const [deferredInstallPrompt, setDeferredInstallPrompt] = useState(null);
  const [isAppInstalled, setIsAppInstalled] = useState(false);
  const [showIosInstallModal, setShowIosInstallModal] = useState(false);
const [installPending, setInstallPending] = useState(false);
const [autoOpenedInstall, setAutoOpenedInstall] = useState(false);
 const [exitRequested, setExitRequested] = useState(false);
 const [installLogoutMessage, setInstallLogoutMessage] = useState(false);
  const [isIosDevice, setIsIosDevice] = useState(false);
  const [isDesktopDevice, setIsDesktopDevice] = useState(false);
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
  loadPractices();
  loadDemoGroups();
}, []);

// ⭐ PWA Install — detectar plataforma (mobile/desktop), estado de instalação,
// e capturar o prompt nativo do Chrome/Edge (funciona em Android E desktop)
useEffect(() => {
  // Detectar se já está rodando instalado (modo standalone)
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches
    || window.navigator.standalone === true; // iOS Safari específico
  setIsAppInstalled(isStandalone);

  // Detectar iOS (Safari não dispara beforeinstallprompt)
  const ua = window.navigator.userAgent;
  const isIos = /iPad|iPhone|iPod/.test(ua) && !window.MSStream;
  setIsIosDevice(isIos);

  // Detectar desktop vs mobile (para adaptar o texto do botão)
  const isMobileUA = /Android|iPhone|iPad|iPod/i.test(ua);
  setIsDesktopDevice(!isMobileUA);

  // Capturar o evento nativo — dispara tanto em Chrome/Edge Android quanto em Chrome/Edge desktop
  const handleBeforeInstallPrompt = (e) => {
    e.preventDefault();
    setDeferredInstallPrompt(e);
  };
  window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

  // Detectar quando o app é instalado, para esconder o botão
  const handleAppInstalled = () => {
    setIsAppInstalled(true);
    setDeferredInstallPrompt(null);
  };
  window.addEventListener('appinstalled', handleAppInstalled);

  return () => {
    window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.removeEventListener('appinstalled', handleAppInstalled);
  };
}, []);

useEffect(() => {
  const params = new URLSearchParams(window.location.search);
  if (params.get('install') === '1') {
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches
      || window.navigator.standalone === true;
    if (!isStandalone) {
      const ua = window.navigator.userAgent;
      const isIos = /iPad|iPhone|iPod/.test(ua) && !window.MSStream;
      if (isIos) {
        if (isEmployeeLoggedIn) {
          handleEmployeeLogout();
        }
        setInstallLogoutMessage(true);
        setAutoOpenedInstall(true);
        params.delete('install');
        const cleanUrl = window.location.pathname + (params.toString() ? '?' + params.toString() : '') + window.location.hash;
        window.history.replaceState(null, '', cleanUrl);
      } else if (deferredInstallPrompt) {
        deferredInstallPrompt.prompt();
      }
    }
  }
}, [deferredInstallPrompt]);

useEffect(() => {
  const handlePageShow = (event) => {
    if (event.persisted) {
      setInstallLogoutMessage(false);
    }
  };
  window.addEventListener('pageshow', handlePageShow);
  return () => window.removeEventListener('pageshow', handlePageShow);
}, []);
 
const handleInstallClick = async () => {
  if (isIosDevice) {
    if (isEmployeeLoggedIn) {
      handleEmployeeLogout();
    }
    setInstallLogoutMessage(true);
    return;
  }
  if (deferredInstallPrompt) {
    deferredInstallPrompt.prompt();
    const { outcome } = await deferredInstallPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsAppInstalled(true);
    }
    setDeferredInstallPrompt(null);
  }
};

 const handleExit = () => {
  setShowIosInstallModal(false);
  window.history.back();
};

const handleIconInstalled = () => {
  setShowIosInstallModal(false);
  window.history.back();
};

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
  
const loadExperiences = async (skipLoading = false, loggedEmpId = null) => {
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
      employeeId: exp.employee_id || null,
      practiceId: exp.practice_id || null,
      tags: exp.tags || [],
      parentExperienceId: exp.parent_experience_id || null,
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

const keyInsights = transformedData.filter(e => e.author === 'key_insights');
  const syntheticExps = transformedData.filter(e => e.source !== 'app' && e.author !== 'key_insights');

  // Lógica de visibilidade por grupo
  const resolvedEmpId = loggedEmpId || localStorage.getItem('employeeId');
  const { data: empData } = await supabase
    .from('employees')
    .select('group_id, is_demo')
    .eq('employee_id', resolvedEmpId || '')
    .single();

  const currentGroupId = empData?.group_id || null;

  let userExps;
  const adminMode = localStorage.getItem('isAdmin') === 'true';
  if (adminMode) {
    // Admin vê tudo
    userExps = transformedData.filter(e => e.source === 'app');
  } else if (currentGroupId) {
    // Usuário com grupo: vê só próprias + mesmo grupo
    const { data: groupMembers } = await supabase
      .from('employees')
      .select('employee_id')
      .eq('group_id', currentGroupId);
    const groupIds = (groupMembers || []).map(m => m.employee_id);
    userExps = transformedData.filter(e =>
      e.source === 'app' && groupIds.includes(e.employeeId)
    );
  } else {
    // Usuário sem grupo: vê tudo exceto experiences de IDs em algum grupo
    const { data: groupedEmps } = await supabase
      .from('employees')
      .select('employee_id')
      .not('group_id', 'is', null);
    const groupedIds = (groupedEmps || []).map(m => m.employee_id);
    userExps = transformedData.filter(e =>
      e.source === 'app' && !groupedIds.includes(e.employeeId)
    );
  }

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
    top3StartVisible: data.top3_start_visible !== false,
    showMarquee: data.show_marquee || false
  });
  setCompanyName(data.company_name || '');
  setCompanyLogoUrl(data.company_logo_url || '');
  setCompanyNameSize(data.company_name_size || 'medium');
  setCompanyLogoSize(data.company_logo_size || 'medium');
  setTop3VisibleInSession(data.top3_start_visible !== false);
}
  } catch (error) {
    console.error('Error loading app settings:', error);
  }
};

const loadProblemCategories = async (practiceId = null) => {
  try {
    let query = supabase
      .from('problem_categories')
      .select('*')
      .eq('active', true)
      .order('display_order', { ascending: true });

    if (practiceId) {
      query = query.eq('practice_id', practiceId);
    }
    // Se practiceId = null → carrega todas as categorias (sem filtro de practice)

    const { data, error } = await query;
    if (error) throw error;
    if (data && data.length > 0) {
      // Deduplicar nomes de categorias (podem existir em múltiplas practices)
      const uniqueNames = [...new Set(data.map(c => c.name))];
      setProblemCategories(uniqueNames);
      // ⭐ Salvar description + tags por categoria
      const catMap = {};
      data.forEach(c => {
        catMap[c.name] = {
          description: c.description || '',
          tags: c.tags || []
        };
      });
      setCategoryData(catMap);
    }
  } catch (error) {
    console.error('Error loading problem categories:', error);
  }
};

const loadDemoGroups = async () => {
  try {
    const { data, error } = await supabase
      .from('demo_groups')
      .select(`
        *,
        employees (employee_id, name, is_demo, group_id)
      `)
      .order('created_at', { ascending: false });
    if (error) throw error;
    setDemoGroups(data || []);
  } catch (error) {
    console.error('Error loading demo groups:', error);
  }
};

const loadCurrentEmployeeGroup = async (empId) => {
  try {
    const { data, error } = await supabase
      .from('employees')
      .select('group_id, is_demo')
      .eq('employee_id', empId)
      .single();
    if (error) throw error;
    setCurrentEmployeeGroup(data?.group_id || null);
  } catch (error) {
    console.error('Error loading employee group:', error);
  }
};
 
const loadPractices = async () => {
  try {
    const { data, error } = await supabase
      .from('practices')
      .select('*')
      .eq('active', true)
      .order('display_order', { ascending: true });
    if (error) throw error;
    // Para o Admin: todas as practices ativas
    // Para o UI: só as com show_in_ui = true
    setPractices(data || []);
    setUiPractices((data || []).filter(p => p.show_in_ui));

    // Practices visíveis no UI (show_in_ui = true), excluindo General se for a única
    const uiPractices = (data || []).filter(p => p.show_in_ui);
    const onlyGeneral = uiPractices.length === 1 && uiPractices[0].name === 'General';
    if (!onlyGeneral) {
      // já está no state practices, a lógica do UI usa essa regra diretamente
    }
    if (data && data.length > 0) {
      setSelectedPracticeId(data[0].id);
      loadAdminCategories(data[0].id);
    }
  } catch (error) {
    console.error('Error loading practices:', error);
  }
};

const loadAdminCategories = async (practiceId) => {
  try {
    let query = supabase
      .from('problem_categories')
      .select('*')
      .eq('active', true)
      .order('display_order', { ascending: true });
    if (practiceId) {
      query = query.eq('practice_id', practiceId);
    }
    const { data, error } = await query;
    if (error) throw error;
    setAdminCategories(data || []);
  } catch (error) {
    console.error('Error loading admin categories:', error);
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

    // Se é demo ID, só pode logar se estiver em um grupo
    if (data.is_demo && !data.group_id) {
      setLoginError('This demo account is not currently active. Please contact your Admin.');
      return;
    }
    
// Login bem-sucedido
  setIsEmployeeLoggedIn(true);
  localStorage.setItem('employeeLoggedIn', 'true');
  localStorage.setItem('employeeId', employeeId);
  setEmployeePassword('');
  await loadCurrentEmployeeGroup(employeeId);
  await loadExperiences(false, employeeId);
  
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
  // Reset filters
  setFilters({ problemCategory: '', searchText: '', resultCategory: '', rating: '', gender: '', age: '', country: '', industrySector: '' });
  setFilterMode('individual');
  setFilterPracticeId(null);
  setFilterTags([]);
  setCurrentPage(1);
  setMappedFilter(null);
  loadExperiences(false, null);
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
  // ⭐ Clear All — limpa só os campos digitados pelo usuário, preserva o que veio pré-preenchido de um Follow-On
  const handleClearAll = () => {
    setCurrentEntry(prev => ({
      problem: '',
      // Se for Follow-On, problemCategory já vinha pré-preenchida do parent — preservar
      problemCategory: followOnParentId ? prev.problemCategory : '',
      solution: '',
      result: '',
      resultCategory: '',
      industrySector: '',
      author: '',
      gender: '',
      age: '',
      country: userCountryName || ''
    }));
    setSelectedTags([]);
    setSelectedCv(null);
  };

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
    setActiveMainTab('see');
    setFilterMode('individual');
    setShowKeyInsights(false);
    setKeyInsightCategory('');
    setSelectedTags([]);
    setFollowOnParentId(null);
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
    
    setActiveMainTab('see');
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
  setActiveMainTab('see');
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
        employee_id: appSettings.requireEmployeeLogin ? employeeId : null,
        practice_id: selectedPracticeId || null,
        parent_experience_id: followOnParentId || null,
        tags: selectedTags.length > 0 ? selectedTags : [],
        avg_rating: 0,
        total_ratings: 0,
        source: 'app',
        cv_url: cvUrl,
        cv_filename: cvFilename
      }])
      .select();
    
    if (error) throw error;

    // Capturar o ID do novo card inserido
    const newExpId = data?.[0]?.id;

    // Auto-expandir todo o thread até o novo card
    if (followOnParentId) {
      const findAllAncestors = (id) => {
        const ancestors = [];
        let current = experiences.find(e => e.id === id);
        while (current) {
          ancestors.push(current.id);
          current = experiences.find(e => e.id === current.parentExperienceId);
        }
        return ancestors;
      };
      const ancestorIds = findAllAncestors(followOnParentId);
      setExpandedFollowOns(prev => {
        const next = { ...prev };
        ancestorIds.forEach(id => { next[id] = true; });
        next[followOnParentId] = true;
        return next;
      });
    }

    // Limpar CV selecionado após sucesso
    setSelectedCv(null);

    await loadExperiences(true);

    // Fix 2 — Scroll para o novo card após carregar
    if (newExpId) {
      setActiveMainTab('see');
      setTimeout(() => {
        const el = document.getElementById(`exp-${newExpId}`);
        if (el) {
          const y = el.getBoundingClientRect().top + window.pageYOffset - 100;
          window.scrollTo({ top: y, behavior: 'smooth' });
        }
      }, 600);
    }

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
    
    // ⭐ Reencadear Follow-Ons antes de deletar
    const firstChild = experiences.find(e => e.parentExperienceId === id);
    if (firstChild) {
      await supabase.from('experiences')
        .update({ parent_experience_id: exp.parentExperienceId || null })
        .eq('id', firstChild.id);
    }

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
    // Recarregar reações depois do reload
    const { data: freshComments } = await supabase
      .from('comments')
      .select('id')
      .eq('experience_id', experienceId);
    if (freshComments?.length) {
      await loadReactions(freshComments.map(c => c.id));
    }
  } catch (error) {
    console.error('Error adding comment:', error);
    alert('Error adding comment');
  }
  };

  const loadReactions = async (commentIds) => {
    if (!commentIds?.length) return;
    const { data, error } = await supabase
      .from('reactions')
      .select('comment_id, emoji, employee_id')
      .in('comment_id', commentIds);
    if (error) { console.error('Error loading reactions:', error); return; }
    const grouped = {};
    (data || []).forEach(r => {
      if (!grouped[r.comment_id]) grouped[r.comment_id] = {};
      if (!grouped[r.comment_id][r.emoji]) grouped[r.comment_id][r.emoji] = [];
      grouped[r.comment_id][r.emoji].push(r.employee_id);
    });
    setReactions(prev => ({ ...prev, ...grouped }));
  };

  const toggleReaction = async (commentId, emoji) => {
    if (!employeeId) return;
    const existing = reactions[commentId]?.[emoji] || [];
    const hasReacted = existing.includes(employeeId);
    if (hasReacted) {
      await supabase.from('reactions').delete()
        .eq('comment_id', commentId).eq('emoji', emoji).eq('employee_id', employeeId);
    } else {
      await supabase.from('reactions').insert([{ comment_id: commentId, emoji, employee_id: employeeId }]);
    }
    setReactions(prev => {
      const updated = JSON.parse(JSON.stringify(prev));
      if (!updated[commentId]) updated[commentId] = {};
      if (!updated[commentId][emoji]) updated[commentId][emoji] = [];
      if (hasReacted) {
        updated[commentId][emoji] = updated[commentId][emoji].filter(id => id !== employeeId);
        if (updated[commentId][emoji].length === 0) delete updated[commentId][emoji];
      } else {
        updated[commentId][emoji] = [...updated[commentId][emoji], employeeId];
      }
      return updated;
    });
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
      localStorage.setItem('isAdmin', 'true');
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

  // Fechar dropdown de categoria ao clicar fora
  useEffect(() => {
    if (!showCategoryDropdown) return;
    const handleClick = (e) => {
      if (!e.target.closest('.category-dropdown-container')) {
        setShowCategoryDropdown(false);
        setHoveredCategory(null);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [showCategoryDropdown]);

  // Carregar reações quando comentários são expandidos
  useEffect(() => {
    const visibleCommentIds = Object.entries(showComments)
      .filter(([, v]) => v)
      .flatMap(([expId]) => {
        const exp = experiences.find(e => String(e.id) === String(expId));
        return (exp?.comments || []).map(c => c.id);
      });
    if (visibleCommentIds.length > 0) loadReactions(visibleCommentIds);
  }, [showComments, experiences]);

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
    if (!exp.author === 'key_insights') return false;
    // Filtro por practice
    if (filterPracticeId && exp.practiceId !== filterPracticeId) return false;
    if (showKeyInsights && keyInsightCategory) {
      return exp.author === 'key_insights' && exp.problemCategory === keyInsightCategory;
    }
    return exp.author === 'key_insights';
  }
  
  // IMPORTANTE: Excluir Key Insights dos filtros normais
  if (exp.author === 'key_insights') {
    return false;
  }

  // Filtro por Practice
  const matchesPractice = !filterPracticeId || exp.practiceId === filterPracticeId;

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
  const matchesIndustrySector = !filters.industrySector || exp.industrySector === filters.industrySector;
  // Filtro por tags (OR — basta ter qualquer uma das tags selecionadas)
  const matchesTags = filterTags.length === 0 || filterTags.some(tag => (exp.tags || []).includes(tag));
  // ⭐ Excluir Follow-Ons do feed principal (aparecem dentro do thread da original)
  // Se há busca ativa, mostrar follow-ons também para que o search as encontre
  const hasAnyFilter = filters.searchText || filters.problemCategory || filters.resultCategory ||
    filters.rating || filters.gender || filters.age || filters.country ||
    filters.industrySector || filterTags.length > 0 || filterPracticeId;
  if (exp.parentExperienceId && !hasAnyFilter) {
    return false;
  }

  // Sempre mostrar experiências avaliadas/comentadas na sessão, mesmo que não atendam o filtro
const wasInteractedInSession = ratedInSession.has(exp.id);
if (wasInteractedInSession) return true;


return matchesPractice && matchesProblemCategory && matchesSearchText && matchesResultCategory && matchesRating && matchesGender && matchesAge && matchesCountry && matchesIndustrySector && matchesTags;
});

// ⭐ Quando um Follow-On bate no filtro, garantir que a raiz do thread apareça no feed
const filteredWithRoots = (() => {
  const hasAnyFilter = filters.searchText || filters.problemCategory || filters.resultCategory ||
    filters.rating || filters.gender || filters.age || filters.country ||
    filters.industrySector || filterTags.length > 0 || filterPracticeId;
  if (!hasAnyFilter || filterMode === 'key_insights') return filteredExperiences;

  const getRoot = (id) => {
    let c = experiences.find(e => e.id === id);
    while (c?.parentExperienceId) c = experiences.find(e => e.id === c.parentExperienceId);
    return c;
  };
  const filteredIds = new Set(filteredExperiences.map(e => e.id));
  const rootsToAdd = [];
  filteredExperiences.forEach(exp => {
    if (exp.parentExperienceId) {
      const root = getRoot(exp.id);
      if (root && !filteredIds.has(root.id)) {
        filteredIds.add(root.id);
        rootsToAdd.push(root);
      }
    }
  });
  if (rootsToAdd.length === 0) return filteredExperiences;
  // Inserir raízes antes dos Follow-Ons correspondentes, remover Follow-Ons do nível top
  const withoutFollowOns = filteredExperiences.filter(e => !e.parentExperienceId);
  return [...withoutFollowOns, ...rootsToAdd];
})();
  // Reset to page 1 when filters change
// Reset to page 1 when filters change (exceto quando navegando para Key Insight)
useEffect(() => {
  const hasActiveFilters = filters.problemCategory || filters.searchText || 
                          filters.resultCategory || filters.rating || 
                          filters.gender || filters.age || filters.country || 
                          filters.industrySector;
  
  if (hasActiveFilters) {
    setCurrentPage(1);
    // Expandir apenas a raiz de cada thread que tem follow-on no filtro
    const _getRoot = (id) => {
      let c = experiences.find(e => e.id === id);
      while (c?.parentExperienceId) c = experiences.find(e => e.id === c.parentExperienceId);
      return c;
    };
    const newExpanded = {};
    filteredExperiences.forEach(exp => {
      if (!exp.parentExperienceId) return;
      const root = _getRoot(exp.id);
      if (root) newExpanded[root.id] = true;
    });
    setExpandedFollowOns(newExpanded);
    setExpandedUpstream({});
    setExpandedGaps({});
  }
}, [filters]);

  // Pagination logic
  const totalPages = Math.ceil(filteredWithRoots.length / experiencesPerPage);
  const indexOfLastExperience = currentPage * experiencesPerPage;
  const indexOfFirstExperience = indexOfLastExperience - experiencesPerPage;
  const currentExperiences = filteredWithRoots.slice(indexOfFirstExperience, indexOfLastExperience);

  // ⭐ Scroll robusto até as abas — usa requestAnimationFrame duplo para garantir
  // que o layout já foi recalculado após mudanças de estado (ex: Top3 aparecer/desaparecer)
  // ⭐ Captura o estado atual antes de navegar para Browse/Top3/Share via rodapé de um card
  const captureNavSnapshot = (destination) => {
    setNavSnapshot({
      destination, // 'browse' | 'top3' | 'share'
      state: {
        activeMainTab,
        filterMode,
        filters: { ...filters },
        filterPracticeId,
        currentPage,
        showKeyInsights,
        keyInsightCategory,
        mappedFilter
      },
      scrollY: window.pageYOffset
    });
  };

  // ⭐ Restaura o snapshot e remove o botão Back
  const goBackToSnapshot = () => {
    if (!navSnapshot) return;
    const { state, scrollY } = navSnapshot;
    setActiveMainTab(state.activeMainTab);
    setFilterMode(state.filterMode);
    setFilters(state.filters);
    setFilterPracticeId(state.filterPracticeId);
    setCurrentPage(state.currentPage);
    setShowKeyInsights(state.showKeyInsights);
    setKeyInsightCategory(state.keyInsightCategory);
    setMappedFilter(state.mappedFilter);
    setNavSnapshot(null);
    setTimeout(() => {
      window.scrollTo({ top: scrollY, behavior: 'smooth' });
    }, 100);
  };

  const scrollToTabs = () => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const el = document.getElementById('main-tabs-anchor');
        if (el) {
          const y = el.getBoundingClientRect().top + window.pageYOffset - 12;
          window.scrollTo({ top: y, behavior: 'smooth' });
        }
      });
    });
  };

  // ⭐ Hide/Show Top3 — só no desktop (>=768px), compensa o scroll pela altura
  // exata do bloco que aparece/desaparece, evitando o salto para o topo.
  // No mobile (<768px) não faz nada — o comportamento nativo do navegador já funciona bem.
  const handleTop3Toggle = (show) => {
    const isDesktop = window.innerWidth >= 768;

    if (!isDesktop) {
      setTop3VisibleInSession(show);
      return;
    }

    if (!show) {
      // Esconder: medir a altura do bloco Top3 ANTES de remover
      const top3Block = document.querySelector('.bg-gradient-to-r.from-purple-100.to-blue-100');
      const blockHeight = top3Block ? top3Block.offsetHeight : 0;
      // mb-8 do bloco = 32px de margem inferior, incluída no offsetHeight? offsetHeight não inclui margin, então somamos
      const totalRemoved = blockHeight + 32;

      setTop3VisibleInSession(false);

      requestAnimationFrame(() => {
        window.scrollTo({ top: Math.max(0, window.pageYOffset - totalRemoved), behavior: 'auto' });
      });
    } else {
      // Mostrar: a altura do bloco só existe DEPOIS de renderizar, então
      // aplicamos o estado primeiro e medimos no frame seguinte
      setTop3VisibleInSession(true);

      requestAnimationFrame(() => {
        const top3Block = document.querySelector('.bg-gradient-to-r.from-purple-100.to-blue-100');
        const blockHeight = top3Block ? top3Block.offsetHeight : 0;
        const totalAdded = blockHeight + 32;
        window.scrollTo({ top: window.pageYOffset + totalAdded, behavior: 'auto' });
      });
    }
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    const paginationTop = document.getElementById('pagination-top');
    if (paginationTop) {
      const yOffset = -100; // 100px de espaço acima
      const y = paginationTop.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  // ⭐ FUNÇÃO RECURSIVA — renderiza Follow-On cards em qualquer profundidade
  // ⭐ buildThreadRenderList: percorre o thread em DFS e retorna lista plana de itens a renderizar
  // [{type:'card', exp, index}, {type:'gap', cards, gapKey}]
  // index = posição absoluta no thread (1-based)
  // gaps = grupos de cards não-matched entre/após matched
  const buildThreadRenderList = (rootId, matchedIds) => {
    if (!matchedIds) return null;
    // DFS em ordem de criação
    const allNodes = [];
    const traverse = (id) => {
      const exp = experiences.find(e => e.id === id);
      if (!exp) return;
      if (exp.id !== rootId) allNodes.push(exp);
      experiences.filter(e => e.parentExperienceId === id)
        .sort((a, b) => a.id - b.id)
        .forEach(child => traverse(child.id));
    };
    traverse(rootId);

    const items = [];
    let gapBuffer = [];
    let absoluteIndex = 0;

    allNodes.forEach(exp => {
      absoluteIndex++;
      if (matchedIds.has(exp.id)) {
        if (gapBuffer.length > 0) {
          const gapKey = `gap_${rootId}_before_${exp.id}`;
          items.push({ type: 'gap', cards: [...gapBuffer], gapKey });
          gapBuffer = [];
        }
        items.push({ type: 'card', exp, index: absoluteIndex });
      } else {
        gapBuffer.push({ exp, index: absoluteIndex });
      }
    });
    // Gap no final (não-matched após o último matched)
    if (gapBuffer.length > 0 && items.some(i => i.type === 'card')) {
      const lastCard = [...items].reverse().find(i => i.type === 'card');
      const gapKey = `gap_${rootId}_after_${lastCard.exp.id}`;
      items.push({ type: 'gap', cards: [...gapBuffer], gapKey });
    }
    return items;
  };

  const renderFollowOnCard = (fo, matchedIds = null, threadIndex = 1, nextGapInfo = null, hideConnector = false) => {
    const foChildren = experiences.filter(e => e.parentExperienceId === fo.id);
    const isGreyed = matchedIds !== null && !matchedIds.has(fo.id);
    const countAllDescendants = (id) => {
      const kids = experiences.filter(e => e.parentExperienceId === id);
      return kids.reduce((acc, k) => acc + 1 + countAllDescendants(k.id), 0);
    };
    const totalChildCount = countAllDescendants(fo.id);
    const practiceName = practices.find(p => p.id === fo.practiceId)?.name;
    const categoryLabel = practiceName && practiceName !== 'General'
      ? `${practiceName} / ${fo.problemCategory}`
      : fo.problemCategory;
    const searchTerms = filters.searchText ? filters.searchText.toLowerCase().trim().split(/\s+/) : [];

    return (
      <div key={fo.id}>
        {/* Conector vertical — só mostra se não foi suprimido */}
        {!hideConnector && (
          <div style={{ display: 'flex', justifyContent: 'center', height: '32px' }}>
            <div style={{ width: '4px', height: '100%', backgroundColor: '#93c5fd', borderRadius: '2px' }} />
          </div>
        )}
        {/* Card */}
        <div className="sm:mx-6">
          <div id={`exp-${fo.id}`} className={`bg-white rounded-2xl shadow-lg p-6 border-l-4 border-blue-300 ${isGreyed ? 'opacity-40' : ''}`}>
            {/* Badge */}
            <div className="mb-3 text-center">
              <span className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-medium">🔗 Follow-On Experience {threadIndex}</span>
            </div>
            {/* By + delete */}
            <div className="mb-3">
              {(fo.author || fo.gender || fo.age || fo.country || fo.employeeId) && (
                <span className="text-xs text-gray-600 block">
                  By: {appSettings.requireEmployeeLogin
                    ? [fo.author, fo.employeeId, fo.country].filter(Boolean).join(', ')
                    : [fo.author, fo.gender, fo.age, fo.country].filter(Boolean).join(', ')}
                </span>
              )}
              {appSettings.requireEmployeeLogin && fo.employeeId === employeeId && (
                <button onClick={async () => { if (window.confirm('Delete this experience?')) await deleteExperienceFromSupabase(fo.id); }}
                  className="text-red-600 hover:text-red-800 text-xs mt-3 inline-flex items-center gap-1">
                  🗑️ Delete Experience
                </button>
              )}
            </div>
            {/* Ratings */}
            <div className="flex justify-end mb-4">
              <div className="flex flex-col items-end gap-3">
                <div className="flex items-center gap-2 bg-yellow-50 px-3 py-2 rounded-lg">
                  <div className="flex gap-1">
                    {[1,2,3,4,5].map(star => (
                      <Star key={star} size={18} className={star <= Math.round(fo.avgRating) ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'} />
                    ))}
                  </div>
                  <div className="text-sm font-semibold text-gray-700">
                    {fo.avgRating.toFixed(1)}
                    <span className="text-xs text-gray-500 ml-1">({fo.totalRatings} {fo.totalRatings === 1 ? 'rating' : 'ratings'})</span>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <div className="text-xs text-gray-600 mb-1">Your rating:</div>
                  <div className="flex gap-1">
                    {[1,2,3,4,5].map(star => (
                      <button key={star} onClick={() => handleUserRating(fo.id, star)}
                        onMouseEnter={() => setHoverRating(h => ({...h, [fo.id]: star}))}
                        onMouseLeave={() => setHoverRating(h => ({...h, [fo.id]: 0}))}
                        className="transition-transform hover:scale-110">
                        <Star size={20} className={star <= (hoverRating[fo.id] || userRatings[fo.id] || 0) ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'} />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            {/* P/A/R grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-red-600 flex items-center gap-2"><AlertCircle size={16}/>Problem</h4>
                  <span className="text-xs bg-red-100 text-red-700 px-3 py-1 rounded-full">{categoryLabel}</span>
                </div>
                <p className="text-sm text-gray-700">{highlightText(fo.problem, searchTerms)}</p>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-blue-600 flex items-center gap-2"><TrendingUp size={16}/>Action</h4>
                <p className="text-sm text-gray-700">{highlightText(fo.solution, searchTerms)}</p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-green-600 flex items-center gap-2"><Share2 size={16}/>Result</h4>
                  <span className={`text-xs px-3 py-1 rounded-full ${getResultColor(fo.resultCategory)}`}>{getResultLabel(fo.resultCategory)}</span>
                </div>
                <p className="text-sm text-gray-700">{highlightText(fo.result, searchTerms)}</p>
              </div>
            </div>
            {/* Tags */}
            {fo.tags && fo.tags.length > 0 && (
              <div className="mb-4 flex flex-wrap gap-1">
                {fo.tags.map(tag => <span key={tag} className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">{tag}</span>)}
              </div>
            )}
            {/* Comments */}
            <div className="border-t pt-4 mt-4">
              <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2"><MessageCircle size={18}/>Add a Comment</h4>
              <div className="space-y-2">
                <textarea value={newComment[fo.id] || ''}
                  onChange={(e) => { if (e.target.value.length <= maxChars.comment) setNewComment(c => ({...c, [fo.id]: e.target.value})); }}
                  placeholder="Share your thoughts..."
                  className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none resize-none" rows="2" />
                <div className="flex gap-2 items-center">
                  {appSettings.allowCvUpload && (
                    !commentCvFiles[fo.id] ? (
                      <label className="px-3 py-2 bg-gray-100 border-2 border-gray-200 rounded-lg hover:bg-gray-200 cursor-pointer flex items-center gap-1 text-sm">
                        <input type="file" accept={appSettings.documentType === 'cv' ? '.pdf' : '.pdf,.pptx,.xlsx,.docx,.ppt,.xls,.doc'}
                          onChange={(e) => { const file = e.target.files[0]; if (file && file.size <= 5000000) setCommentCvFiles(f => ({...f, [fo.id]: file})); e.target.value = ''; }}
                          className="hidden" />
                        {appSettings.documentType === 'cv' ? '📎 CV' : '📎 File'}
                      </label>
                    ) : (
                      <div className="flex items-center gap-1 bg-green-50 border-2 border-green-300 rounded-lg px-2 py-1">
                        <span className="text-xs text-green-700">✓ {appSettings.documentType === 'cv' ? 'CV' : 'File'}</span>
                        <button onClick={() => setCommentCvFiles(f => { const n = {...f}; delete n[fo.id]; return n; })} className="text-red-600 text-xs">✕</button>
                      </div>
                    )
                  )}
                  <button onClick={() => handleAddComment(fo.id)} disabled={!newComment[fo.id]?.trim()}
                    className="px-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-300 flex items-center gap-2 py-2">
                    <Send size={18}/>
                  </button>
                </div>
                <div className="text-xs text-gray-500 text-right">{(newComment[fo.id] || '').length}/{maxChars.comment}</div>
              </div>
              {fo.comments.length > 0 && (
                <div className="mt-3">
                  <button onClick={() => setShowComments(s => ({...s, [fo.id]: !s[fo.id]}))}
                    className="text-sm text-purple-600 hover:text-purple-800 font-medium mb-3 flex items-center gap-2">
                    <MessageCircle size={16}/>
                    {showComments[fo.id] ? 'Hide all comments' : `Show all ${fo.comments.length} ${fo.comments.length === 1 ? 'comment' : 'comments'}`}
                  </button>
                  {showComments[fo.id] && (
                    <div className="space-y-3">
                      {fo.comments.map(comment => (
                        <div key={comment.id} className="bg-gray-50 rounded-lg p-3">
                          <p className="text-sm text-gray-700">{comment.text}</p>
                          <div className="flex flex-wrap gap-1 mt-2 items-center">
                            {Object.entries(reactions[comment.id] || {}).map(([emoji, ids]) => (
                              <button
                                key={emoji}
                                onClick={() => toggleReaction(comment.id, emoji)}
                                className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-sm border transition-colors ${ids.includes(employeeId) ? 'bg-purple-100 border-purple-300 text-purple-700' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-100'}`}
                              >
                                <span>{emoji}</span>
                                <span className="text-xs font-medium">{ids.length}</span>
                              </button>
                            ))}
                            <div className="relative group">
                              <button
                                className="flex items-center justify-center w-7 h-7 rounded-full border border-gray-300 bg-white text-gray-400 hover:border-purple-400 hover:text-purple-500 transition-colors"
                                title="React"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z"/><path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/></svg>
                              </button>
                              <div className="hidden group-hover:block absolute bottom-0 left-0 z-50" style={{ paddingBottom: '28px', width: '196px' }}>
                                <div className="bg-white border border-gray-200 rounded-xl shadow-xl p-2">
                                  <div className="grid grid-cols-7 gap-1">
                                    {REACTION_EMOJIS.map(emoji => (
                                      <button
                                        key={emoji}
                                        onClick={() => toggleReaction(comment.id, emoji)}
                                        className="text-xl hover:scale-125 transition-transform p-0.5 rounded"
                                      >{emoji}</button>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
              {/* ↓ Follow-Ons counter — abaixo dos comments */}
              {totalChildCount > 0 && !matchedIds && (
                <button onClick={() => {
                  const isExpanding = !expandedFollowOns[fo.id];
                  // Coletar todos os descendentes para abrir/fechar de uma vez
                  const getAllDescendantIds = (id) => {
                    const kids = experiences.filter(e => e.parentExperienceId === id);
                    return kids.reduce((acc, k) => [...acc, k.id, ...getAllDescendantIds(k.id)], []);
                  };
                  const allIds = [fo.id, ...getAllDescendantIds(fo.id)];
                  setExpandedFollowOns(prev => {
                    const next = { ...prev };
                    allIds.forEach(id => { next[id] = isExpanding; });
                    return next;
                  });
                }}
                  className="mt-3 text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1">
                  {expandedFollowOns[fo.id] ? '▲' : '▼'} ↓ {totalChildCount} Follow-On {totalChildCount === 1 ? 'Experience' : 'Experiences'}
                </button>
              )}
              {/* Gap button — aparece no rodapé do último card matched antes de um gap */}
              {nextGapInfo && (
                <button
                  onClick={() => setExpandedGaps(g => ({ ...g, [nextGapInfo.gapKey]: !g[nextGapInfo.gapKey] }))}
                  className="mt-2 text-xs text-blue-500 hover:text-blue-700 font-medium flex items-center gap-1"
                >
                  {expandedGaps[nextGapInfo.gapKey] ? '▲' : '▼'} ↓ {nextGapInfo.cards.length} Follow-On Unfiltered {nextGapInfo.cards.length === 1 ? 'Experience' : 'Experiences'}
                </button>
              )}
              {/* 🔗 Add Follow-On — inibido se já tem filho */}
              {foChildren.length === 0 && !isGreyed && (
                <button onClick={() => {
                  setFollowOnParentId(fo.id);
                  if (fo.practiceId) { setSelectedPracticeId(fo.practiceId); loadProblemCategories(fo.practiceId); }
                  setCurrentEntry(prev => ({ ...prev, problemCategory: fo.problemCategory || '' }));
                  setActiveMainTab('share'); scrollToTabs();
                }} className="mt-3 text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1">
                  🔗 Add a Follow-On Experience
                </button>
              )}
            </div>
          </div>
        </div>
        {/* Filhos recursivos — apenas no modo não-filtrado (modo filtrado usa buildThreadRenderList na raiz) */}
        {!matchedIds && expandedFollowOns[fo.id] && foChildren.map((child, idx) => renderFollowOnCard(child, null, threadIndex + 1 + idx))}
      </div>
    );
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
{exitRequested ? (
  <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center p-6 text-center">
    <div>
      <p className="text-xl text-gray-700 font-semibold mb-2">All set!</p>
      <p className="text-gray-500">You can now close this browser tab — swipe up from the bottom or use your tab switcher to close it.</p>
    </div>
  </div>
) : installLogoutMessage ? (
  <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 px-4 pt-16 pb-8 flex justify-center">
    <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6">
      <div className="mb-4 flex items-center gap-3">
        <img src="data:image/png;base64,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" alt="WID icon" width="44" height="44" style={{ borderRadius: '8px', flexShrink: 0 }} />
        <h3 className="text-lg font-bold text-gray-800">Add WhatIDid Icon to Home Screen</h3>
      </div>
      <div className="space-y-4 text-sm text-gray-700">
        <p>To add the WhatIDid icon to your phone:</p>
        <div className="flex items-center gap-3">
          <span className="flex-shrink-0 w-7 h-7 bg-purple-100 text-purple-700 rounded-full flex items-center justify-center font-bold">1</span>
          <img src="data:image/png;base64,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" alt="More options" width="32" height="32" style={{ flexShrink: 0 }} />
          <span>Tap the <strong>"•••"</strong> button at the bottom-right of Safari</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex-shrink-0 w-7 h-7 bg-purple-100 text-purple-700 rounded-full flex items-center justify-center font-bold">2</span>
          <img src="data:image/png;base64,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" alt="Share" width="32" height="32" style={{ flexShrink: 0 }} />
          <span>Tap <strong>Share</strong></span>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex-shrink-0 w-7 h-7 bg-purple-100 text-purple-700 rounded-full flex items-center justify-center font-bold">3</span>
          <img src="data:image/png;base64,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" alt="Add to Home Screen" width="32" height="32" style={{ flexShrink: 0 }} />
          <span>Tap <strong>"Add to Home Screen"</strong></span>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex-shrink-0 w-7 h-7 bg-purple-100 text-purple-700 rounded-full flex items-center justify-center font-bold">4</span>
          <img src="data:image/png;base64,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" alt="Add" width="32" height="32" style={{ flexShrink: 0 }} />
          <span>Tap <strong>"Add"</strong> — done!</span>
        </div>
      </div>
      <p className="text-sm text-gray-600 mt-4 text-center font-medium flex items-center justify-center gap-1.5 flex-wrap">
        Then open the new WID icon
        <img src="data:image/png;base64,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" alt="WID icon" width="20" height="20" style={{ borderRadius: '4px', verticalAlign: 'middle' }} />
        on your Home Screen and log in there.
      </p>
      <div className="mt-5 space-y-3">
        <button
          onClick={handleIconInstalled}
          className="w-full bg-purple-600 text-white py-2.5 rounded-lg hover:bg-purple-700 font-semibold transition-colors"
        >
          Icon installed
        </button>
        <div className="flex gap-3">
          {!autoOpenedInstall && (
            <button
              onClick={() => setInstallLogoutMessage(false)}
              className="flex-1 bg-gray-200 text-gray-700 py-2.5 rounded-lg hover:bg-gray-300 font-semibold transition-colors"
            >
              Not now, Back to login
            </button>
          )}
          <button
            onClick={handleExit}
            className="flex-1 bg-gray-200 text-gray-700 py-2.5 rounded-lg hover:bg-gray-300 font-semibold transition-colors"
          >
            Exit
          </button>
        </div>
      </div>
    </div>
  </div>
) : appSettings.requireEmployeeLogin && !isEmployeeLoggedIn ? (
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
  <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full mx-auto relative">
        {autoOpenedInstall && (
          <button
            onClick={() => setShowIosInstallModal(true)}
            className="absolute top-4 left-4 text-sm text-gray-400 hover:text-gray-600 font-medium"
            aria-label="Back"
          >
            ← Back
          </button>
        )}
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
    <div className="h-px w-8 bg-gray-600 opacity-80"></div>
    <p className="font-semibold text-gray-500 tracking-wide">{companyName}</p>
    <div className="h-px w-8 bg-gray-600 opacity-80"></div>
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
<div className="flex items-center justify-center gap-3 mt-4 mb-2 flex-wrap">
  {isEmployeeLoggedIn && (
    <>
      <span className="text-sm text-gray-700 font-medium">👤 {employeeId}</span>
      <button
        onClick={handleEmployeeLogout}
        className="text-sm bg-gray-200 text-gray-700 px-3 py-1 rounded hover:bg-gray-300 transition-colors"
      >
        Logout
      </button>
    </>
  )}
  {!isAppInstalled && (deferredInstallPrompt || isIosDevice) && (
    <button
      onClick={handleInstallClick}
      className="text-sm bg-gray-200 text-gray-700 px-3 py-1 rounded hover:bg-gray-300 transition-colors flex items-center gap-1.5 whitespace-nowrap"
    >
            <img
        src="data:image/png;base64,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"
        alt=""
        width="16"
        height="16"
        style={{ borderRadius: '3px', flexShrink: 0 }}
      />
      {isDesktopDevice ? 'Add to Desktop' : 'Add to Phone'}
    </button>
  )}
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
                    localStorage.removeItem('isAdmin');
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

      {appSettings.showTop3 && (
        <div className="ml-8 flex items-center gap-3">
          <input type="checkbox" id="top3StartVisible" checked={appSettings.top3StartVisible}
            onChange={async (e) => {
              setAppSettings({...appSettings, top3StartVisible: e.target.checked});
              setTop3VisibleInSession(e.target.checked);
              await supabase.from('app_settings').update({ top3_start_visible: e.target.checked }).eq('id', 1);
            }} className="w-4 h-4" />
          <label htmlFor="top3StartVisible" className="text-xs text-gray-600 cursor-pointer">Start visible (users can still hide/show it)</label>
        </div>
      )}

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
  <div className="mt-4 bg-pink-50 border-2 border-pink-300 rounded-lg shadow-md p-4 max-w-4xl mx-auto">
    <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
      🎯 Manage Demo Groups
    </h3>

    {/* Create New Group */}
    <div className="bg-white rounded p-4 mb-4">
      <h4 className="font-medium text-gray-700 mb-3">Create New Group</h4>
      <div className="flex gap-2 mb-3">
        <input
          type="text"
          id="new-group-name"
          placeholder="Group name (e.g. Demo XYZ Bank)"
          className="flex-1 p-2 border-2 border-gray-300 rounded-lg text-sm"
        />
        <button
          onClick={async () => {
            const name = document.getElementById('new-group-name').value.trim();
            if (!name) { alert('Please enter a group name'); return; }
            const { data, error } = await supabase
              .from('demo_groups')
              .insert([{ name }])
              .select();
            if (error) { alert('Error creating group: ' + error.message); return; }
            document.getElementById('new-group-name').value = '';
            await loadDemoGroups();
            alert(`Group "${name}" created!`);
          }}
          className="px-4 py-2 bg-pink-600 text-white rounded-lg text-sm hover:bg-pink-700"
        >+ Create Group</button>
      </div>
    </div>

    {/* Available Demo IDs */}
    <div className="bg-white rounded p-4 mb-4">
      <h4 className="font-medium text-gray-700 mb-3">
        Available Demo IDs ({employees.filter(e => e.is_demo && !e.group_id).length})
      </h4>
      <div className="flex flex-wrap gap-2">
        {employees.filter(e => e.is_demo && !e.group_id).map(emp => (
          <span key={emp.employee_id} className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
            {emp.employee_id}
          </span>
        ))}
        {employees.filter(e => e.is_demo && !e.group_id).length === 0 && (
          <p className="text-sm text-gray-500">No available IDs — all in use</p>
        )}
      </div>
    </div>

    {/* Existing Groups */}
    <div className="bg-white rounded p-4">
      <h4 className="font-medium text-gray-700 mb-3">Active Groups ({demoGroups.length})</h4>
      {demoGroups.length === 0 ? (
        <p className="text-sm text-gray-500">No groups yet</p>
      ) : (
        <div className="space-y-4">
          {demoGroups.map(group => (
            <div key={group.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h5 className="font-semibold text-gray-800">{group.name}</h5>
                <button
                  onClick={async () => {
                    if (!window.confirm(`Delete group "${group.name}"? All experiences and comments from its members will be deleted.`)) return;
                    try {
                      // Get group members
                      const { data: members } = await supabase
                        .from('employees')
                        .select('employee_id, group_id')
                        .eq('group_id', group.id);
                      
                      for (const member of members || []) {
                        // Delete comments
                        await supabase.from('comments').delete().eq('employee_id', member.employee_id);
                        // Delete experiences files
                        const { data: exps } = await supabase.from('experiences').select('id, cv_url').eq('employee_id', member.employee_id);
                        for (const exp of exps || []) {
                          if (exp.cv_url) await deleteFileFromStorage(exp.cv_url);
                        }
                        // Delete experiences
                        await supabase.from('experiences').delete().eq('employee_id', member.employee_id);
                        // Release ID from group
                        await supabase.from('employees').update({ group_id: null }).eq('employee_id', member.employee_id);
                      }
                      // Delete group
                      await supabase.from('demo_groups').delete().eq('id', group.id);
                      await loadDemoGroups();
                      await loadEmployees();
                      await loadExperiences(true);
                      alert(`Group "${group.name}" deleted and data cleared!`);
                    } catch (error) {
                      alert('Error deleting group: ' + error.message);
                    }
                  }}
                  className="px-3 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700"
                >🗑️ Delete Group</button>
              </div>

              {/* Members */}
              <div className="mb-3">
                <p className="text-xs font-medium text-gray-600 mb-2">Members:</p>
                <div className="flex flex-wrap gap-2">
                  {(group.employees || []).map(emp => (
                    <span key={emp.employee_id} className="px-3 py-1 bg-pink-100 text-pink-800 rounded-full text-xs font-medium">
                      {emp.employee_id}
                    </span>
                  ))}
                  {(group.employees || []).length === 0 && (
                    <span className="text-xs text-gray-400">No members yet</span>
                  )}
                </div>
              </div>

              {/* Add member */}
              <div className="flex gap-2">
                <select
                  id={`add-member-${group.id}`}
                  className="flex-1 p-2 border-2 border-gray-200 rounded-lg text-sm"
                >
                  <option value="">Add available ID...</option>
                  {employees.filter(e => e.is_demo && !e.group_id).map(emp => (
                    <option key={emp.employee_id} value={emp.employee_id}>{emp.employee_id}</option>
                  ))}
                </select>
                <button
                  onClick={async () => {
                    const empId = document.getElementById(`add-member-${group.id}`).value;
                    if (!empId) { alert('Please select an ID'); return; }
                    const { error } = await supabase
                      .from('employees')
                      .update({ group_id: group.id })
                      .eq('employee_id', empId);
                    if (error) { alert('Error adding member: ' + error.message); return; }
                    await loadDemoGroups();
                    await loadEmployees();
                  }}
                  className="px-3 py-2 bg-pink-600 text-white rounded-lg text-sm hover:bg-pink-700"
                >Add</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  </div>
)}
       
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
          📊 Import Excel
          <input type="file" accept=".xlsx,.xls" className="hidden" onChange={(e) => { if(e.target.files[0]) handleExcelUpload(e.target.files[0]); e.target.value=''; }} />
        </label>
        <button
          onClick={async () => {
            try {
              const XLSX = await import('https://cdn.sheetjs.com/xlsx-0.20.0/package/xlsx.mjs');
              const rows = employees.map(emp => ({
                'Employee ID': emp.employee_id,
                'Name': emp.name || '',
                'Country': emp.country || '',
                'Email': emp.email || '',
                'Status': emp.status || 'pending'
              }));
              const ws = XLSX.utils.json_to_sheet(rows);
              const wb = XLSX.utils.book_new();
              XLSX.utils.book_append_sheet(wb, ws, 'Employees');
              XLSX.writeFile(wb, `employees_${new Date().toISOString().slice(0,10)}.xlsx`);
            } catch(err) { alert('Error exporting: ' + err.message); }
          }}
          className="px-4 py-2 bg-gray-600 text-white rounded-lg text-sm hover:bg-gray-700"
        >
          📤 Export Excel
        </button>
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
                <button onClick={async () => {
                  if (!window.confirm(`Delete all experiences and comments by ${emp.employee_id}? This cannot be undone.`)) return;
                  try {
                    // Deletar comments do employee
                    const { error: commentsError } = await supabase
                      .from('comments')
                      .delete()
                      .eq('employee_id', emp.employee_id);
                    if (commentsError) throw commentsError;

                    // Buscar experiences do employee para deletar arquivos
                    const { data: exps } = await supabase
                      .from('experiences')
                      .select('id, cv_url')
                      .eq('employee_id', emp.employee_id);

                    // Deletar arquivos do storage
                    if (exps) {
                      for (const exp of exps) {
                        if (exp.cv_url) await deleteFileFromStorage(exp.cv_url);
                      }
                    }

                    // Deletar experiences do employee
                    const { error: expsError } = await supabase
                      .from('experiences')
                      .delete()
                      .eq('employee_id', emp.employee_id);
                    if (expsError) throw expsError;

                    await loadExperiences(true);
                    alert(`All data cleared for ${emp.employee_id}!`);
                  } catch (error) {
                    console.error('Error clearing data:', error);
                    alert('Error clearing data: ' + error.message);
                  }
                }} className="px-2 py-1 bg-orange-600 text-white rounded text-xs hover:bg-orange-700">Clear Data</button>
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

    {/* Practice selector + New Practice */}
    <div className="bg-white rounded p-4 mb-4">
      <div className="flex items-center gap-3 mb-4">
        <label className="text-sm font-medium text-gray-700 whitespace-nowrap">Practice:</label>
        <select
          value={selectedPracticeId || ''}
          onChange={(e) => {
            const id = parseInt(e.target.value);
            setSelectedPracticeId(id);
            loadAdminCategories(id);
          }}
          className="flex-1 p-2 border-2 border-gray-300 rounded-lg text-sm"
        >
          {practices.map(p => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
        {/* Show in UI checkbox */}
        {selectedPracticeId && practices.find(p => p.id === selectedPracticeId)?.name !== 'General' && (
          <label className="flex items-center gap-2 cursor-pointer whitespace-nowrap">
            <input
              type="checkbox"
              checked={practices.find(p => p.id === selectedPracticeId)?.show_in_ui || false}
              onChange={async (e) => {
                const { error } = await supabase
                  .from('practices')
                  .update({ show_in_ui: e.target.checked })
                  .eq('id', selectedPracticeId);
                if (error) { alert('Error updating practice: ' + error.message); return; }
                await loadPractices();
              }}
              className="w-4 h-4"
            />
            <span className="text-sm text-gray-700">Show in UI</span>
          </label>
        )}
        <button
          onClick={async () => {
            const name = window.prompt('New Practice name:');
            if (!name?.trim()) return;
            const maxOrder = practices.length > 0 ? Math.max(...practices.map(p => p.display_order || 0)) : 0;
            const { data, error } = await supabase
              .from('practices')
              .insert([{ name: name.trim(), show_in_ui: true, display_order: maxOrder + 1, active: true }])
              .select();
            if (error) { alert('Error creating practice: ' + error.message); return; }
            await loadPractices();
            if (data && data[0]) {
              setSelectedPracticeId(data[0].id);
              loadProblemCategories(data[0].id);
            }
            alert(`Practice "${name.trim()}" created!`);
          }}
          className="px-3 py-2 bg-teal-600 text-white rounded-lg text-sm hover:bg-teal-700 whitespace-nowrap"
        >+ New Practice</button>
        {selectedPracticeId && practices.find(p => p.id === selectedPracticeId)?.name !== 'General' && (
          <button
            onClick={async () => {
              const practice = practices.find(p => p.id === selectedPracticeId);
              if (!window.confirm(`Delete practice "${practice?.name}"? Categories will not be deleted.`)) return;
              const { error } = await supabase
                .from('practices')
                .update({ active: false })
                .eq('id', selectedPracticeId);
              if (error) { alert('Error deleting practice'); return; }
              await loadPractices();
              setSelectedPracticeId(practices[0]?.id || null);
              loadProblemCategories(practices[0]?.id || null);
            }}
            className="px-3 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 whitespace-nowrap"
          >Delete Practice</button>
        )}
      </div>
    </div>

    <div className="bg-white rounded p-4 mb-4">
      <h4 className="font-medium text-gray-700 mb-3">Add New Category</h4>
      <div className="flex gap-2 mb-3">
        <input
          type="text"
          value={newCategoryName}
          onChange={(e) => setNewCategoryName(e.target.value)}
          placeholder="Category name..."
          className="flex-1 p-2 border-2 border-gray-300 rounded-lg text-sm"
          onKeyPress={(e) => e.key === 'Enter' && newCategoryName.trim() && (async () => {
            const maxOrder = adminCategories.length;
            const { error } = await supabase.from('problem_categories').insert([{ name: newCategoryName.trim(), display_order: maxOrder + 1, active: true, practice_id: selectedPracticeId }]);
            if (!error) { setNewCategoryName(''); await loadAdminCategories(selectedPracticeId); await loadProblemCategories(selectedPracticeId); }
            else alert('Error adding category');
          })()}
        />
        <button
          onClick={async () => {
            if (!newCategoryName.trim()) return;
            const maxOrder = adminCategories.length;
            const { error } = await supabase.from('problem_categories').insert([{ name: newCategoryName.trim(), display_order: maxOrder + 1, active: true, practice_id: selectedPracticeId }]);
            if (!error) { setNewCategoryName(''); await loadAdminCategories(selectedPracticeId); await loadProblemCategories(selectedPracticeId); }
            else alert('Error adding category');
          }}
          className="px-4 py-2 bg-teal-600 text-white rounded-lg text-sm hover:bg-teal-700"
        >Add</button>
      </div>

      {/* Import / Export Excel */}
      <div className="border-t pt-3 mt-1 flex gap-2 flex-wrap">
        {/* Export */}
        <button
          onClick={async () => {
            try {
              const XLSX = await import('https://cdn.sheetjs.com/xlsx-0.20.0/package/xlsx.mjs');
              const practiceName = practices.find(p => p.id === selectedPracticeId)?.name || 'Practice';
              const rows = adminCategories.map(cat => ({
                Practice: practiceName,
                Category: cat.name,
                Description: cat.description || '',
                Tags: (cat.tags || []).join(', ')
              }));
              const ws = XLSX.utils.json_to_sheet(rows);
              const wb = XLSX.utils.book_new();
              XLSX.utils.book_append_sheet(wb, ws, 'Categories');
              XLSX.writeFile(wb, `categories_${practiceName.replace(/\s+/g,'_')}.xlsx`);
            } catch(err) { alert('Error exporting: ' + err.message); }
          }}
          className="px-3 py-1.5 bg-gray-600 text-white rounded-lg text-xs hover:bg-gray-700 flex items-center gap-1"
        >📤 Export Excel</button>

        {/* Import */}
        <label className="px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs hover:bg-green-700 cursor-pointer flex items-center gap-1">
          📥 Import Excel
          <input
            type="file"
            accept=".xlsx,.xls"
            className="hidden"
            onChange={async (e) => {
              const file = e.target.files[0];
              if (!file) return;
              try {
                const XLSX = await import('https://cdn.sheetjs.com/xlsx-0.20.0/package/xlsx.mjs');
                const data = await file.arrayBuffer();
                const wb = XLSX.read(data);
                const ws = wb.Sheets[wb.SheetNames[0]];
                const rows = XLSX.utils.sheet_to_json(ws);
let updated = 0, added = 0, errors = 0;

// Buscar todas as categories do banco
const { data: allCats } = await supabase.from('problem_categories').select('*').eq('active', true);

for (const row of rows) {
  const practiceName = String(row['Practice'] || '').trim();
  const catName = String(row['Category'] || '').trim();
  const desc = String(row['Description'] || '').trim();
  const tagsRaw = String(row['Tags'] || '').trim();
  const tags = tagsRaw ? tagsRaw.split(',').map(t => t.trim()).filter(Boolean) : [];
  if (!catName) { errors++; continue; }

  // Encontrar practice_id pelo nome
  let practiceId = selectedPracticeId;
  if (practiceName) {
    const matchedPractice = practices.find(p => p.name.toLowerCase() === practiceName.toLowerCase());
    if (matchedPractice) {
      practiceId = matchedPractice.id;
    } else {
      errors++;
      continue;
    }
  }

  // Verificar se categoria já existe nessa practice
  const existing = (allCats || []).find(c =>
    c.name.toLowerCase() === catName.toLowerCase() &&
    c.practice_id === practiceId
  );

  if (existing) {
    const { error } = await supabase.from('problem_categories').update({
      description: desc || null,
      tags: tags
    }).eq('id', existing.id);
    if (error) { errors++; } else { updated++; }
  } else {
    const maxOrder = (allCats || []).filter(c => c.practice_id === practiceId).length + added;
    const { error } = await supabase.from('problem_categories').insert([{
      name: catName, description: desc || null, tags: tags,
      display_order: maxOrder + 1, active: true, practice_id: practiceId
    }]);
    if (error) { errors++; } else { added++; }
  }
}
              } catch(err) { alert('Error importing: ' + err.message); }
              e.target.value = '';
            }}
          />
        </label>
        <span className="text-xs text-gray-400 self-center">Excel columns: Practice, Category, Description, Tags</span>
      </div>
    </div>
    <div className="bg-white rounded p-4">
      <h4 className="font-medium text-gray-700 mb-3">Current Categories ({adminCategories.length})</h4>
<div className="space-y-2 max-h-80 overflow-y-auto">
        {adminCategories.map((cat, index) => (
          <div key={index} className="flex items-center gap-2 p-2 border border-gray-200 rounded-lg">
            {editingCategory === index ? (
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    defaultValue={cat.name}
                    id={`edit-cat-name-${index}`}
                    placeholder="Category name"
                    className="flex-1 p-1 border border-gray-300 rounded text-sm"
                    autoFocus
                  />
                </div>
                <textarea
                  defaultValue={cat.description || ''}
                  id={`edit-cat-desc-${index}`}
                  placeholder="Description (shown to users as hint)..."
                  className="w-full p-2 border-2 border-gray-300 rounded-lg text-sm resize-none"
                  style={{ fontFamily: 'inherit' }}
                  rows="2"
                />
                <input
                  type="text"
                  defaultValue={(cat.tags || []).join(', ')}
                  id={`edit-cat-tags-${index}`}
                  placeholder="Tags separated by comma: Underwriting, Scorecard, Fraud"
                  className="w-full p-2 border-2 border-gray-300 rounded-lg text-sm"
                  style={{ fontFamily: 'inherit' }}
                />
                <div className="flex gap-2">
                  <button
                    onClick={async () => {
                      const newName = document.getElementById(`edit-cat-name-${index}`).value.trim();
                      const newDesc = document.getElementById(`edit-cat-desc-${index}`).value.trim();
                      const newTagsRaw = document.getElementById(`edit-cat-tags-${index}`).value;
                      const newTags = newTagsRaw.split(',').map(t => t.trim()).filter(Boolean);
                      if (!newName) return;
                      const { error } = await supabase.from('problem_categories').update({
                        name: newName,
                        description: newDesc || null,
                        tags: newTags.length > 0 ? newTags : []
                      }).eq('id', cat.id);
                      if (!error) { setEditingCategory(null); await loadAdminCategories(selectedPracticeId); await loadProblemCategories(selectedPracticeId); }
                      else alert('Error updating category: ' + error.message);
                    }}
                    className="px-2 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700"
                  >Save</button>
                  <button onClick={() => setEditingCategory(null)} className="px-2 py-1 bg-gray-400 text-white rounded text-xs hover:bg-gray-500">Cancel</button>
                </div>
              </div>
            ) : (
              <>
                <button
                    onClick={async () => {
                      if (index === 0) return;
                      await supabase.from('problem_categories').update({ display_order: index }).eq('name', cat.name);
                      await supabase.from('problem_categories').update({ display_order: index + 1 }).eq('name', adminCategories[index - 1].name);
                      await loadAdminCategories(selectedPracticeId);
                    }}
                    disabled={index === 0}
                    className="px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 disabled:opacity-30 disabled:cursor-not-allowed"
                  >↑ Up</button>
                  <button
                    onClick={async () => {
                      if (index === adminCategories.length - 1) return;
                      await supabase.from('problem_categories').update({ display_order: index + 2 }).eq('name', cat.name);
                      await supabase.from('problem_categories').update({ display_order: index + 1 }).eq('name', adminCategories[index + 1].name);
                      await loadAdminCategories(selectedPracticeId);
                    }}
                    disabled={index === adminCategories.length - 1}
                    className="px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 disabled:opacity-30 disabled:cursor-not-allowed"
                  >↓ Down</button>
                <div className="flex-1 min-w-0">
                  <span className="text-sm text-gray-700 font-medium">{cat.name}</span>
                  {cat.description && (
                    <p className="text-xs text-gray-400 truncate mt-0.5">{cat.description}</p>
                  )}
                  {cat.tags && cat.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {cat.tags.map(tag => (
                        <span key={tag} className="text-[10px] bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded-full">{tag}</span>
                      ))}
                    </div>
                  )}
                </div>
                <button onClick={() => setEditingCategory(index)} className="px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 flex-shrink-0">Edit</button>
                <button
                  onClick={async () => {
                    if (!window.confirm(`Delete "${cat.name}"? Existing experiences with this category will keep it.`)) return;
                    const { error } = await supabase.from('problem_categories').update({ active: false }).eq('id', cat.id);
                    if (!error) { await loadAdminCategories(selectedPracticeId); await loadProblemCategories(selectedPracticeId); }
                    else alert('Error deleting category');
                  }}
                  className="px-2 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700 flex-shrink-0"
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
        {appSettings.showTop3 && top3VisibleInSession && (() => {
          const top3Data = [1, 2, 3]
            .map(pos => experiences.find(exp => exp.id === topExperiences[pos]))
            .filter(Boolean);
          
          if (top3Data.length === 0) return null;
          
          return (
            <div className="bg-gradient-to-r from-purple-100 to-blue-100 rounded-2xl shadow-xl p-8 mb-8 border-2 border-purple-300 relative">
              {navSnapshot?.destination === 'top3' && (
                <button
                  onClick={goBackToSnapshot}
                  className="absolute top-4 left-4 text-gray-500 hover:text-gray-700 text-sm bg-white bg-opacity-70 hover:bg-opacity-100 rounded-full px-3 py-1 transition-colors"
                  title="Back to where you were"
                >
                  ← Back
                </button>
              )}
              <button
                onClick={() => handleTop3Toggle(false)}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-sm bg-white bg-opacity-70 hover:bg-opacity-100 rounded-full px-3 py-1 transition-colors"
                title="Hide Top 3"
              >
                ✕ Hide
              </button>
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
  setActiveMainTab('see');
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
                    setActiveMainTab('see');
                    scrollToTabs();
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

{/* Tabs estilo fichário — substitui os botões de navegação */}
<div className="mt-5 mb-8">
<div id="main-tabs-anchor" className="flex justify-center mb-0 relative">
  <div className="flex w-full">
    <button
      onClick={() => {
        setActiveMainTab('see');
        scrollToTabs();
      }}
      className={`flex-1 px-4 py-3 font-bold text-base md:text-xl transition-all rounded-t-2xl border-2 border-b-0 relative ${
        activeMainTab === 'see'
          ? 'bg-white text-purple-700 border-purple-300 relative z-10'
          : 'bg-gray-100 text-gray-400 border-gray-200 hover:bg-gray-200'
      }`}
    >
      See What Others Did
      {activeMainTab === 'see' && (navSnapshot?.destination === 'browse') && (
        <span
          onClick={(e) => { e.stopPropagation(); goBackToSnapshot(); }}
          className="block md:hidden text-xs font-medium text-purple-500 hover:text-purple-700 bg-purple-50 rounded-full px-2 py-1 cursor-pointer mt-1"
        >
          ← Back
        </span>
      )}
      {activeMainTab === 'see' && (navSnapshot?.destination === 'browse') && (
        <span
          onClick={(e) => { e.stopPropagation(); goBackToSnapshot(); }}
          className="hidden md:block absolute left-3 top-1/2 -translate-y-1/2 text-xs font-medium text-purple-500 hover:text-purple-700 bg-purple-50 rounded-full px-2 py-1 cursor-pointer"
        >
          ← Back
        </span>
      )}
    </button>
    <button
      onClick={() => {
        setActiveMainTab('share');
        scrollToTabs();
      }}
      className={`flex-1 px-4 py-3 font-bold text-base md:text-xl transition-all rounded-t-2xl border-2 border-b-0 -ml-px relative ${
        activeMainTab === 'share'
          ? 'bg-white text-blue-700 border-blue-300 relative z-10'
          : 'bg-gray-100 text-gray-400 border-gray-200 hover:bg-gray-200'
      }`}
    >
      Share Your Experience
      {activeMainTab === 'share' && (navSnapshot?.destination === 'share') && (
        <span
          onClick={(e) => { e.stopPropagation(); goBackToSnapshot(); }}
          className="block md:hidden text-xs font-medium text-blue-500 hover:text-blue-700 bg-blue-50 rounded-full px-2 py-1 cursor-pointer mt-1"
        >
          ← Back
        </span>
      )}
      {activeMainTab === 'share' && (navSnapshot?.destination === 'share') && (
        <span
          onClick={(e) => { e.stopPropagation(); goBackToSnapshot(); }}
          className="hidden md:block absolute left-3 top-1/2 -translate-y-1/2 text-xs font-medium text-blue-500 hover:text-blue-700 bg-blue-50 rounded-full px-2 py-1 cursor-pointer"
        >
          ← Back
        </span>
      )}
    </button>
  </div>
  {/* Linha conectora — fecha o friso colorido por baixo da aba inativa, sem sobrepor a aba ativa */}
  <div
    className={`absolute bottom-0 h-0.5 ${activeMainTab === 'see' ? 'bg-purple-300 right-0 left-1/2' : 'bg-blue-300 left-0 right-1/2'}`}
  />
</div>

<div id="share-section" className={`bg-white p-8 rounded-b-2xl border-2 border-t-0 border-blue-300 ${activeMainTab !== 'share' ? 'hidden' : ''}`}>

  {/* Clear All — limpa só o que o usuário digitou */}
  <div className="flex justify-end mb-3">
    <button
      onClick={handleClearAll}
      className="text-xs text-gray-500 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-full px-3 py-1 transition-colors"
    >
      Clear All
    </button>
  </div>

  {/* ⭐ FOLLOW-ON BANNER */}
  {followOnParentId && (() => {
    const parentExp = experiences.find(e => e.id === followOnParentId);
    return parentExp ? (
      <div className="mb-5 p-3 bg-blue-50 border-2 border-blue-200 rounded-lg flex items-start justify-between gap-3">
        <div className="flex-1">
          <p className="text-xs font-semibold text-blue-700 mb-1">🔗 Follow-On to:</p>
          <p className="text-xs text-blue-600 italic line-clamp-2">{parentExp.problem.substring(0, 150)}{parentExp.problem.length > 150 ? '...' : ''}</p>
        </div>
        <button onClick={() => setFollowOnParentId(null)} className="text-blue-400 hover:text-blue-600 text-xl leading-none flex-shrink-0">×</button>
      </div>
    ) : null;
  })()}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="text-red-500" size={20} />
                <h3 className="text-lg font-semibold text-gray-800">Problem</h3>
              </div>
              
              {/* Practice dropdown - só aparece se 2+ practices ativas, ou se 1 prática com nome diferente de General */}
              {uiPractices.length > 1 || (uiPractices.length === 1 && uiPractices[0].name !== 'General') ? (
  <div className="mb-2">
    <select
      value={(uiPractices.length === 1 ? uiPractices[0].id : shareFormPracticeId) || ''}
      onChange={(e) => {
        const id = parseInt(e.target.value);
        setShareFormPracticeId(id);
        setSelectedPracticeId(id);
        setCurrentEntry({...currentEntry, problemCategory: ''});
        loadProblemCategories(id);
      }}
      className={`w-full p-2 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none bg-gray-100 ${uiPractices.length === 1 ? 'cursor-not-allowed' : ''}`}
      disabled={uiPractices.length === 1}
    >
      {uiPractices.length > 1 && <option value="">Select practice</option>}
      {uiPractices.map(p => (
        <option key={p.id} value={p.id}>{p.name}</option>
      ))}
    </select>
  </div>
) : null}

              {/* ⭐ CATEGORY SELECT + DESCRIPTION */}
              {(() => {
                const selectedCatData = currentEntry.problemCategory ? categoryData[currentEntry.problemCategory] : null;
                const hasTags = selectedCatData?.tags?.length > 0;
                const hasAnyDesc = problemCategories.some(cat => categoryData[cat]?.description);

                return (
                  <div className="relative">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 relative category-dropdown-container">
                        <div
                          role="button"
                          tabIndex={0}
                          onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                          onKeyDown={(e) => e.key === 'Enter' && setShowCategoryDropdown(!showCategoryDropdown)}
                          className="w-full p-2 border-2 border-gray-200 rounded-lg text-left flex items-center justify-between cursor-default"
                          style={{ fontFamily: 'inherit', fontSize: 'inherit', color: currentEntry.problemCategory ? 'inherit' : '#6b7280', backgroundColor: '#f3f4f6' }}
                        >
                          <span>{currentEntry.problemCategory || 'Select category'}</span>
                          <span className="text-gray-500" style={{ fontSize: '10px' }}>▼</span>
                        </div>

                        {showCategoryDropdown && (
                          <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-gray-100 border-2 border-gray-200 rounded-lg shadow-xl" style={{ overflow: 'visible' }}>
                            {problemCategories.map(cat => {
                              const desc = categoryData[cat]?.description;
                              return (
                                <div
                                  key={cat}
                                  className="relative flex items-center"
                                  onMouseEnter={() => setHoveredCategory(cat)}
                                  onMouseLeave={() => setHoveredCategory(null)}
                                >
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setCurrentEntry({...currentEntry, problemCategory: cat});
                                      setSelectedTags([]);
                                      setShowCategoryDropdown(false);
                                      setHoveredCategory(null);
                                    }}
                                    className={`flex-1 text-left px-3 py-2 hover:bg-purple-50 transition-colors ${currentEntry.problemCategory === cat ? 'bg-purple-50 text-purple-700 font-medium' : 'text-gray-700'}`}
                                    style={{ fontFamily: 'inherit', fontSize: 'inherit' }}
                                  >
                                    {cat}
                                  </button>
                                  {desc && (
                                    <>
                                      <span className="pr-2 text-gray-400 text-xs cursor-default select-none">ⓘ</span>
                                      {hoveredCategory === cat && (
                                        <div className="hidden sm:block absolute left-full top-0 ml-2 z-[999] w-64 bg-gray-800 text-white rounded-lg p-3 shadow-2xl pointer-events-none" style={{ fontSize: '12px', lineHeight: '1.5' }}>
                                          <p className="text-gray-200">{desc}</p>
                                        </div>
                                      )}
                                    </>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>

                      {/* ⓘ mobile */}
                      {hasAnyDesc && (
                        <button
                          type="button"
                          onClick={() => setShowCategoryDrawer(true)}
                          className="sm:hidden flex-shrink-0 w-8 h-8 rounded-full border-2 border-gray-300 text-gray-500 hover:border-purple-400 hover:text-purple-600 flex items-center justify-center font-medium transition-colors"
                          style={{ fontSize: '14px' }}
                        >ⓘ</button>
                      )}
                    </div>

                    {/* Tags checkboxes */}
                    {hasTags && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {selectedCatData.tags.map(tag => (
                          <label key={tag} className="flex items-center gap-1.5 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={selectedTags.includes(tag)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedTags([...selectedTags, tag]);
                                } else {
                                  setSelectedTags(selectedTags.filter(t => t !== tag));
                                }
                              }}
                              className="w-3.5 h-3.5 text-purple-600 rounded"
                            />
                            <span className="text-xs text-gray-600">{tag}</span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })()}

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
    
    <div className="flex gap-2 items-center">
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
            className="text-red-600 hover:text-red-800"
          >
            ❌ Remove
          </button>
        </div>
      )}

      <button
        onClick={handleSubmit}
        disabled={!(currentEntry.problem && currentEntry.problemCategory && currentEntry.solution && currentEntry.result && currentEntry.resultCategory)}
        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
        title="Share Experience"
      >
        <Send size={18} />
      </button>
    </div>
    
    <p className="text-xs text-gray-500 mt-1">Max 5MB</p>
  </div>
)}

{/* Fallback: se upload não estiver habilitado, mostrar botão de envio sozinho */}
{!appSettings.allowCvUpload && (
  <div className="md:col-span-2 flex justify-end">
    <button
      onClick={handleSubmit}
      disabled={!(currentEntry.problem && currentEntry.problemCategory && currentEntry.solution && currentEntry.result && currentEntry.resultCategory)}
      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
      title="Share Experience"
    >
      <Send size={18} />
    </button>
  </div>
)}
        </div>
        
<div className={`space-y-6 ${activeMainTab !== 'see' ? 'hidden' : ''} p-4 rounded-b-2xl border-2 border-t-0 border-purple-300`} id="experiences-section">
          
          
          
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

                {/* Botão Show Top 3 — só na aba Individual Experiences, e só quando Top3 está escondido */}
                {appSettings.showTop3 && !top3VisibleInSession && filterMode === 'individual' && (
                  <>
                    <span className="text-gray-400">•</span>
                    <button
                      onClick={() => handleTop3Toggle(true)}
                      className="text-yellow-700 hover:text-yellow-800 text-xs bg-yellow-100 hover:bg-yellow-200 rounded-full px-3 py-1 transition-colors inline-block"
                      style={{ whiteSpace: 'nowrap' }}
                    >
                      Show Top 3
                    </button>
                  </>
                )}
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
                  {/* Practice filter - só aparece se 2+ practices ativas, ou se 1 com nome diferente de General */}
                  {uiPractices.length > 1 || (uiPractices.length === 1 && uiPractices[0].name !== 'General') ? (
  <div>
    <label className="block text-sm font-medium text-gray-600 mb-2">Practice</label>
    <select
      value={filterPracticeId || ''}
      onChange={(e) => {
        const id = e.target.value ? parseInt(e.target.value) : null;
        setFilterPracticeId(id);
        setFilters({...filters, problemCategory: ''});
        loadProblemCategories(id);
      }}
      className={`w-full p-2 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none bg-gray-100 ${uiPractices.length === 1 ? 'cursor-not-allowed' : ''}`}
      disabled={uiPractices.length === 1}
    >
      <option value="">All</option>
      {uiPractices.map(p => (
        <option key={p.id} value={p.id}>{p.name}</option>
      ))}
    </select>
  </div>
) : null}

                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-2">Category</label>
                    <select
                      value={filters.problemCategory}
                      onChange={(e) => {
                        setFilters({...filters, problemCategory: e.target.value});
                        setFilterTags([]); // reset tags ao trocar categoria
                      }}
                      className="w-full p-2 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
                    >
                      <option value="">All</option>
                      {problemCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                    {/* Tag chips — aparecem quando categoria selecionada tem tags */}
                    {filters.problemCategory && categoryData[filters.problemCategory]?.tags?.length > 0 && (() => {
                      // Só mostrar tags que já foram usadas em experiences dessa categoria
                      const usedTags = [...new Set(
                        experiences
                          .filter(e => e.problemCategory === filters.problemCategory && e.tags?.length > 0)
                          .flatMap(e => e.tags)
                      )];
                      const availableTags = categoryData[filters.problemCategory].tags.filter(t => usedTags.includes(t));
                      if (availableTags.length === 0) return null;
                      return (
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {availableTags.map(tag => (
                            <button
                              key={tag}
                              type="button"
                              onClick={() => {
                                if (filterTags.includes(tag)) {
                                  setFilterTags(filterTags.filter(t => t !== tag));
                                } else {
                                  setFilterTags([...filterTags, tag]);
                                }
                              }}
                              className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                                filterTags.includes(tag)
                                  ? 'bg-purple-600 text-white border-purple-600'
                                  : 'bg-white text-gray-600 border-gray-300 hover:border-purple-400'
                              }`}
                            >
                              {tag}
                            </button>
                          ))}
                        </div>
                      );
                    })()}
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
                  {(filters.problemCategory || filters.searchText || filters.resultCategory || filters.rating || filters.gender || filters.age || filters.country || filters.industrySector || filterPracticeId || filterTags.length > 0) && (
                    <button
                      onClick={() => { setFilters({ problemCategory: '', searchText: '', resultCategory: '', rating: '', gender: '', age: '', country: '', industrySector: '' }); setFilterPracticeId(null); setFilterTags([]); }}
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
    {/* Practice filter - mesma lógica dos outros lugares */}
    {uiPractices.length > 1 || (uiPractices.length === 1 && uiPractices[0].name !== 'General') ? (
  <div className="mb-3">
    <label className="block text-sm font-medium text-gray-700 mb-2">Practice:</label>
    <select
      value={filterPracticeId || ''}
      onChange={(e) => {
        const id = e.target.value ? parseInt(e.target.value) : null;
        setFilterPracticeId(id);
        setKeyInsightCategory('');
        setShowKeyInsights(false);
        loadProblemCategories(id);
      }}
      className={`w-full p-2 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none bg-gray-100 ${uiPractices.length === 1 ? 'cursor-not-allowed' : ''}`}
      disabled={uiPractices.length === 1}
    >
      <option value="">All</option>
      {uiPractices.map(p => (
        <option key={p.id} value={p.id}>{p.name}</option>
      ))}
    </select>
  </div>
) : null}

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
          {filteredWithRoots.length > experiencesPerPage && (
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

{/* ⭐ FOLLOW-ON BANNER quando filtrando */}
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

            {(() => {
              // ⭐ AGRUPAMENTO POR THREAD
              // Quando 2+ cards do mesmo thread batem no filtro, mostrar o thread completo uma vez

              const hasAnyFilter = filters.searchText || filters.problemCategory || filters.resultCategory ||
                filters.rating || filters.gender || filters.age || filters.country ||
                filters.industrySector || filterTags.length > 0 || filterPracticeId;

              // Encontrar a raiz de qualquer experience
              const getRoot = (id) => {
                let current = experiences.find(e => e.id === id);
                while (current?.parentExperienceId) {
                  current = experiences.find(e => e.id === current.parentExperienceId);
                }
                return current;
              };

              // IDs dos cards que batem no filtro atual
              const matchedIds = new Set(filteredExperiences.map(e => e.id));

              // Construir lista de itens a renderizar:
              // - Se root aparece no feed E tem filhos também no feed → substituir por thread completo
              // - Caso contrário → render normal
              const seenThreadRoots = new Set();
              const renderItems = []; // { type: 'normal', exp } | { type: 'thread', root, matchedIds }

              currentExperiences.forEach(exp => {
                const root = getRoot(exp.id);
                if (!root) return;

                // Verificar se há outros cards do mesmo thread no filtro
                const threadMatesInFilter = currentExperiences.filter(e => {
                  if (e.id === exp.id) return false;
                  return getRoot(e.id)?.id === root.id;
                });

                if (threadMatesInFilter.length > 0) {
                  // Thread com múltiplos matches — mostrar thread completo uma vez
                  if (!seenThreadRoots.has(root.id)) {
                    seenThreadRoots.add(root.id);
                    renderItems.push({ type: 'thread', root, matchedIds });
                  }
                } else {
                  // Card único do thread — render normal
                  renderItems.push({ type: 'normal', exp });
                }
              });

              // Função recursiva para renderizar thread completo com cards acinzentados
              const renderFullThread = (exp, isMatched, isRootLevel, threadIndex = 1) => {
                const children = experiences.filter(e => e.parentExperienceId === exp.id);
                const pname = practices.find(p => p.id === exp.practiceId)?.name;
                const catLabel = pname && pname !== 'General' ? `${pname} / ${exp.problemCategory}` : exp.problemCategory;
                const searchTerms = filters.searchText ? filters.searchText.toLowerCase().trim().split(/\s+/) : [];

                return (
                  <React.Fragment key={exp.id}>
                    <div
                      id={`exp-${exp.id}`}
                      className={`bg-white rounded-2xl shadow-lg p-6 transition-opacity ${isRootLevel ? '' : 'sm:mx-6 border-l-4 border-blue-300'} ${!isMatched ? 'opacity-40' : ''}`}
                    >
                      {!isRootLevel && (
                        <div className="mb-3 text-center">
                          <span className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-medium">🔗 Follow-On Experience {threadIndex}</span>
                        </div>
                      )}
                      <div className="mb-3">
                        {(exp.author || exp.gender || exp.age || exp.country || exp.employeeId) && (
                          <span className="text-xs text-gray-600 block">
                            By: {appSettings.requireEmployeeLogin
                              ? [exp.author, exp.employeeId, exp.country].filter(Boolean).join(', ')
                              : [exp.author, exp.gender, exp.age, exp.country].filter(Boolean).join(', ')}
                          </span>
                        )}
                      </div>
                      <div className="flex justify-end mb-4">
                        <div className="flex items-center gap-2 bg-yellow-50 px-3 py-2 rounded-lg">
                          <div className="flex gap-1">{[1,2,3,4,5].map(star => <Star key={star} size={18} className={star <= Math.round(exp.avgRating) ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'} />)}</div>
                          <span className="text-sm font-semibold text-gray-700">{exp.avgRating.toFixed(1)} <span className="text-xs text-gray-500">({exp.totalRatings})</span></span>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <h4 className="font-semibold text-red-600 flex items-center gap-2"><AlertCircle size={16}/>Problem</h4>
                            <span className="text-xs bg-red-100 text-red-700 px-3 py-1 rounded-full">{catLabel}</span>
                          </div>
                          <p className="text-sm text-gray-700">{highlightText(exp.problem, searchTerms)}</p>
                        </div>
                        <div className="space-y-2">
                          <h4 className="font-semibold text-blue-600 flex items-center gap-2"><TrendingUp size={16}/>Action</h4>
                          <p className="text-sm text-gray-700">{highlightText(exp.solution, searchTerms)}</p>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <h4 className="font-semibold text-green-600 flex items-center gap-2"><Share2 size={16}/>Result</h4>
                            <span className={`text-xs px-3 py-1 rounded-full ${getResultColor(exp.resultCategory)}`}>{getResultLabel(exp.resultCategory)}</span>
                          </div>
                          <p className="text-sm text-gray-700">{highlightText(exp.result, searchTerms)}</p>
                        </div>
                      </div>
                      {exp.tags && exp.tags.length > 0 && (
                        <div className="mb-3 flex flex-wrap gap-1">
                          {exp.tags.map(tag => <span key={tag} className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">{tag}</span>)}
                        </div>
                      )}
                      {exp.comments?.length > 0 && (
                        <div className="border-t pt-2 mt-2">
                          <span className="text-xs text-gray-500 flex items-center gap-1"><MessageCircle size={12}/> {exp.comments.length} {exp.comments.length === 1 ? 'comment' : 'comments'}</span>
                        </div>
                      )}
                    </div>
                    {children.length > 0 && (
                      <div className="space-y-0" style={{ marginTop: '0px' }}>
                        {children.map(child => (
                          <div key={child.id}>
                            <div style={{ display: 'flex', justifyContent: 'center', height: '32px' }}>
                              <div style={{ width: '4px', height: '100%', backgroundColor: '#93c5fd', borderRadius: '2px' }} />
                            </div>
                            {renderFullThread(child, matchedIds.has(child.id), false, threadIndex + 1)}
                          </div>
                        ))}
                      </div>
                    )}
                  </React.Fragment>
                );
              };

              return renderItems.map((item, idx) => {
                // Raiz renderizada pelo map normal abaixo
                return null;
              });
            })()}

            {currentExperiences.map(exp => {
              // ⭐ Lógica de thread: sempre mostrar a raiz quando um Follow-On bate no filtro
              const getRoot = (id) => {
                let current = experiences.find(e => e.id === id);
                while (current?.parentExperienceId) current = experiences.find(e => e.id === current.parentExperienceId);
                return current;
              };
              const root = getRoot(exp.id);
              const isFollowOn = !!exp.parentExperienceId;

              if (isFollowOn) {
                // Pular — a raiz vai aparecer no feed (já está ou será adicionada)
                // Se a raiz não está em currentExperiences, será mostrada via uma entrada separada
                return null;
              }

              // Para raízes: verificar se algum descendente bateu no filtro
              const allDescendantIds = (() => {
                const getAllDesc = (id) => {
                  const kids = experiences.filter(e => e.parentExperienceId === id);
                  return kids.reduce((acc, k) => [...acc, k.id, ...getAllDesc(k.id)], []);
                };
                return new Set(getAllDesc(exp.id));
              })();
              const descendantMatchedInFilter = filteredExperiences.some(e => allDescendantIds.has(e.id));
              const threadMatesInFilter = currentExperiences.filter(e => e.id !== exp.id && getRoot(e.id)?.id === root?.id);
              const hasAnyThreadMatch = descendantMatchedInFilter || threadMatesInFilter.length > 0;
              const matchedIds = hasAnyThreadMatch ? new Set(filteredExperiences.map(e => e.id)) : null;

              const expFollowOns = experiences.filter(e => e.parentExperienceId === exp.id);
              // Cadeia de ancestrais para upstream
              const expAncestorChain = (() => {
                const chain = [];
                let current = experiences.find(e => e.id === exp.id);
                while (current?.parentExperienceId) {
                  const parent = experiences.find(e => e.id === current.parentExperienceId);
                  if (parent) chain.unshift(parent);
                  current = parent;
                }
                return chain;
              })();
              return (
              <React.Fragment key={exp.id}>
                {/* ⭐ UPSTREAM CARDS — renderizados ACIMA do card atual */}
                {expAncestorChain.length > 0 && expandedUpstream[exp.id] && (
                  <div className="space-y-0">
                    {expAncestorChain.map((ancestor, idx) => {
                      const isRoot = !ancestor.parentExperienceId;
                      const pname = practices.find(p => p.id === ancestor.practiceId)?.name;
                      const catLabel = pname && pname !== 'General' ? `${pname} / ${ancestor.problemCategory}` : ancestor.problemCategory;
                      return (
                        <div key={ancestor.id}>
                          {/* Card ancestral: raiz em tamanho normal, intermediários com mx-6 */}
                          <div className={isRoot ? '' : 'sm:mx-6'}>
                            <div className={`bg-white rounded-2xl shadow-lg p-6 border-l-4 ${isRoot ? 'border-purple-400' : 'border-purple-300'}`}>
                              <div className="mb-3 text-center">
                                <span className="text-xs bg-purple-100 text-purple-700 px-3 py-1 rounded-full font-medium">
                                  {isRoot ? '↑ Original Experience' : '↑ Upstream Experience'}
                                </span>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
                                <div className="space-y-2">
                                  <div className="flex items-center justify-between">
                                    <h4 className="font-semibold text-red-600 flex items-center gap-2"><AlertCircle size={16}/>Problem</h4>
                                    <span className="text-xs bg-red-100 text-red-700 px-3 py-1 rounded-full">{catLabel}</span>
                                  </div>
                                  <p className="text-sm text-gray-700">{ancestor.problem}</p>
                                </div>
                                <div className="space-y-2">
                                  <h4 className="font-semibold text-blue-600 flex items-center gap-2"><TrendingUp size={16}/>Action</h4>
                                  <p className="text-sm text-gray-700">{ancestor.solution}</p>
                                </div>
                                <div className="space-y-2">
                                  <div className="flex items-center justify-between">
                                    <h4 className="font-semibold text-green-600 flex items-center gap-2"><Share2 size={16}/>Result</h4>
                                    <span className={`text-xs px-3 py-1 rounded-full ${getResultColor(ancestor.resultCategory)}`}>{getResultLabel(ancestor.resultCategory)}</span>
                                  </div>
                                  <p className="text-sm text-gray-700">{ancestor.result}</p>
                                </div>
                              </div>
                              {(ancestor.author || ancestor.employeeId) && (
                                <p className="text-xs text-gray-500 border-t pt-2">
                                  By: {[ancestor.author, ancestor.employeeId, ancestor.country].filter(Boolean).join(', ')}
                                </p>
                              )}
                            </div>
                          </div>
                          {/* Conector roxo para o próximo */}
                          <div style={{ display: 'flex', justifyContent: 'center', height: '32px' }}>
                            <div style={{ width: '4px', height: '100%', backgroundColor: '#c4b5fd', borderRadius: '2px' }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
                <div>
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
                        <span className="text-xs bg-red-100 text-red-700 px-3 py-1 rounded-full">
                          {(() => {
                            const pname = practices.find(p => p.id === exp.practiceId)?.name;
                            return pname && pname !== 'General' ? `${pname} / ${exp.problemCategory}` : exp.problemCategory;
                          })()}
                        </span>
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
                    {/* Tags badges — só para experiences do próprio usuário */}
                    {exp.tags && exp.tags.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1 mr-auto">
                        {editingTags === exp.id ? (
                          // Modo edição: checkboxes de todas as tags da categoria
                          <div className="flex flex-wrap gap-1.5 items-center">
                            {(categoryData[exp.problemCategory]?.tags || exp.tags).map(tag => (
                              <label key={tag} className="flex items-center gap-1 cursor-pointer">
                                <input
                                  type="checkbox"
                                  defaultChecked={exp.tags.includes(tag)}
                                  id={`edit-tag-${exp.id}-${tag}`}
                                  className="w-3 h-3 text-purple-600 rounded"
                                />
                                <span className="text-xs text-gray-600">{tag}</span>
                              </label>
                            ))}
                            <button
                              onClick={async () => {
                                const allTags = categoryData[exp.problemCategory]?.tags || exp.tags;
                                const newTags = allTags.filter(tag =>
                                  document.getElementById(`edit-tag-${exp.id}-${tag}`)?.checked
                                );
                                const { error } = await supabase.from('experiences').update({ tags: newTags }).eq('id', exp.id);
                                if (!error) { setEditingTags(null); await loadExperiences(true); }
                                else alert('Error saving tags');
                              }}
                              className="px-2 py-0.5 bg-purple-600 text-white rounded text-xs hover:bg-purple-700"
                            >Save</button>
                            <button onClick={() => setEditingTags(null)} className="px-2 py-0.5 bg-gray-400 text-white rounded text-xs">✕</button>
                          </div>
                        ) : (
                          // Modo visualização: badges + botão Edit (só para o dono)
                          <>
                            {exp.tags.map(tag => (
                              <span key={tag} className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">{tag}</span>
                            ))}
                            {(appSettings.requireEmployeeLogin ? exp.employeeId === employeeId : true) && exp.source === 'app' && (
                              <button
                                onClick={() => setEditingTags(exp.id)}
                                className="text-sm text-gray-700 hover:text-black px-1 ml-1"
                                title="Edit tags"
                              >✎</button>
                            )}
                          </>
                        )}
                      </div>
                    )}
                    {/* Se não tem tags mas é do usuário e a categoria tem tags disponíveis */}
                    {(!exp.tags || exp.tags.length === 0) && (appSettings.requireEmployeeLogin ? exp.employeeId === employeeId : true) && exp.source === 'app' && categoryData[exp.problemCategory]?.tags?.length > 0 && editingTags !== exp.id && (
                      <button
                        onClick={() => setEditingTags(exp.id)}
                        className="text-xs text-gray-400 hover:text-purple-600 mr-auto"
                        title="Add tags"
                      >+ tags</button>
                    )}
                    {editingTags === exp.id && (!exp.tags || exp.tags.length === 0) && (
                      <div className="flex flex-wrap gap-1.5 items-center mr-auto">
                        {(categoryData[exp.problemCategory]?.tags || []).map(tag => (
                          <label key={tag} className="flex items-center gap-1 cursor-pointer">
                            <input type="checkbox" id={`edit-tag-${exp.id}-${tag}`} className="w-3 h-3 text-purple-600 rounded" />
                            <span className="text-xs text-gray-600">{tag}</span>
                          </label>
                        ))}
                        <button
                          onClick={async () => {
                            const allTags = categoryData[exp.problemCategory]?.tags || [];
                            const newTags = allTags.filter(tag => document.getElementById(`edit-tag-${exp.id}-${tag}`)?.checked);
                            const { error } = await supabase.from('experiences').update({ tags: newTags }).eq('id', exp.id);
                            if (!error) { setEditingTags(null); await loadExperiences(true); }
                            else alert('Error saving tags');
                          }}
                          className="px-2 py-0.5 bg-purple-600 text-white rounded text-xs hover:bg-purple-700"
                        >Save</button>
                        <button onClick={() => setEditingTags(null)} className="px-2 py-0.5 bg-gray-400 text-white rounded text-xs">✕</button>
                      </div>
                    )}
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
        {/* Reações */}
        <div className="flex flex-wrap gap-1 mt-2 items-center">
          {Object.entries(reactions[comment.id] || {}).map(([emoji, ids]) => (
            <button
              key={emoji}
              onClick={() => toggleReaction(comment.id, emoji)}
              className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-sm border transition-colors ${ids.includes(employeeId) ? 'bg-purple-100 border-purple-300 text-purple-700' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-100'}`}
            >
              <span>{emoji}</span>
              <span className="text-xs font-medium">{ids.length}</span>
            </button>
          ))}
          <div className="relative group">
            <button
              className="flex items-center justify-center w-7 h-7 rounded-full border border-gray-300 bg-white text-gray-400 hover:border-purple-400 hover:text-purple-500 transition-colors"
              title="React"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z"/><path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/></svg>
            </button>
            <div className="hidden group-hover:block absolute bottom-0 left-0 z-50" style={{ paddingBottom: '28px', width: '196px' }}>
              <div className="bg-white border border-gray-200 rounded-xl shadow-xl p-2">
                <div className="grid grid-cols-7 gap-1">
                  {REACTION_EMOJIS.map(emoji => (
                    <button
                      key={emoji}
                      onClick={() => toggleReaction(comment.id, emoji)}
                      className="text-xl hover:scale-125 transition-transform p-0.5 rounded"
                    >{emoji}</button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
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

{/* ⭐ FOLLOW-ON BUTTON — abaixo dos comments, inibido se já tem follow-on */}
{exp.author !== 'key_insights' && (() => {
  const hasFollowOn = experiences.some(e => e.parentExperienceId === exp.id);
  if (hasFollowOn) return null;
  return (
    <button
      onClick={() => {
        setFollowOnParentId(exp.id);
        // Pré-preencher practice e category do parent
        if (exp.practiceId) setSelectedPracticeId(exp.practiceId);
        setCurrentEntry(prev => ({
          ...prev,
          problemCategory: exp.problemCategory || ''
        }));
        if (exp.practiceId) loadProblemCategories(exp.practiceId);
        setActiveMainTab('share'); scrollToTabs();
      }}
      className="mt-3 text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
    >
      🔗 Add a Follow-On Experience
    </button>
  );
})()}

{/* Navigation CTA */}
                  <div className="mt-4 pt-3 border-t border-gray-100">
                    {/* ⭐ FOLLOW-ON THREAD INDICATORS */}
                    {exp.author !== 'key_insights' && (() => {
                      const followOns = experiences.filter(e => e.parentExperienceId === exp.id);
                      // Contar todos os descendentes do thread
                      const countAllDescendants = (parentId) => {
                        const children = experiences.filter(e => e.parentExperienceId === parentId);
                        return children.reduce((acc, child) => acc + 1 + countAllDescendants(child.id), 0);
                      };
                      const totalThreadCount = countAllDescendants(exp.id);
                      const ancestorChain = (() => {
                        const chain = [];
                        let current = experiences.find(e => e.id === exp.id);
                        while (current?.parentExperienceId) {
                          const parent = experiences.find(e => e.id === current.parentExperienceId);
                          if (parent) chain.unshift(parent);
                          current = parent;
                        }
                        return chain;
                      })();

                      return (
                        <div className="mb-3 space-y-2">
                          {/* Upstream — só botão; cards renderizados fora do card atual */}
                          {ancestorChain.length > 0 && (
                            <button
                              onClick={() => setExpandedUpstream({...expandedUpstream, [exp.id]: !expandedUpstream[exp.id]})}
                              className="text-xs text-purple-600 hover:text-purple-800 font-medium flex items-center gap-1"
                            >
                              {expandedUpstream[exp.id] ? '▲' : '▼'} ↑ {ancestorChain.length} Upstream {ancestorChain.length === 1 ? 'Experience' : 'Experiences'}
                            </button>
                          )}
                          {/* Follow-Ons */}
                          {followOns.length > 0 && (
                            <button
                              onClick={() => {
                                const isExpanding = !expandedFollowOns[exp.id];
                                const getAllDescendantIds = (id) => {
                                  const kids = experiences.filter(e => e.parentExperienceId === id);
                                  return kids.reduce((acc, k) => [...acc, k.id, ...getAllDescendantIds(k.id)], []);
                                };
                                const allIds = [exp.id, ...getAllDescendantIds(exp.id)];
                                setExpandedFollowOns(prev => {
                                  const next = { ...prev };
                                  allIds.forEach(id => { next[id] = isExpanding; });
                                  return next;
                                });
                              }}
                              className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
                            >
                              {expandedFollowOns[exp.id] ? '▲' : '▼'} ↓ {totalThreadCount} Follow-On {totalThreadCount === 1 ? 'Experience' : 'Experiences'}
                            </button>
                          )}
                          {/* Gap button na raiz — quando filtro ativo e há unfiltered antes do primeiro match */}
                          {matchedIds && (() => {
                            const renderList = buildThreadRenderList(exp.id, matchedIds);
                            if (!renderList) return null;
                            const firstGap = renderList[0]?.type === 'gap' ? renderList[0] : null;
                            if (!firstGap) return null;
                            return (
                              <button
                                onClick={() => setExpandedGaps(g => ({ ...g, [firstGap.gapKey]: !g[firstGap.gapKey] }))}
                                className="text-xs text-blue-500 hover:text-blue-700 font-medium flex items-center gap-1"
                              >
                                {expandedGaps[firstGap.gapKey] ? '▲' : '▼'} ↓ {firstGap.cards.length} Follow-On Unfiltered {firstGap.cards.length === 1 ? 'Experience' : 'Experiences'}
                              </button>
                            );
                          })()}
                        </div>
                      );
                    })()}

                  </div>

                  <div className="pt-2 border-t-2 border-gray-100 text-center">
                    <div className="flex items-center justify-center gap-3 text-sm">
                      <button
                        onClick={() => { captureNavSnapshot('browse'); setActiveMainTab('see'); scrollToTabs(); }}
                        className="text-purple-600 hover:text-purple-800 font-medium transition-colors"
                      >
                        Browse
                      </button>
                      {appSettings.showTop3 && top3VisibleInSession && <>
                      <span className="text-gray-400">•</span>
                      <button
                        onClick={() => { captureNavSnapshot('top3'); document.querySelector('.bg-gradient-to-r.from-purple-100.to-blue-100')?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }}
                        className="text-purple-600 hover:text-purple-800 font-medium transition-colors"
                      >
                        Top3
                      </button>
                      </>}
                      <span className="text-gray-400">•</span>
                      <button
                        onClick={() => { captureNavSnapshot('share'); setActiveMainTab('share'); scrollToTabs(); }}
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

            {/* ⭐ FOLLOW-ON CARDS — usando buildThreadRenderList no modo filtrado */}
            {exp.author !== 'key_insights' && expFollowOns.length > 0 && expandedFollowOns[exp.id] && (
              <div className="space-y-0" style={{ marginTop: '0px' }}>
                {(() => {
                  const renderList = matchedIds ? buildThreadRenderList(exp.id, matchedIds) : null;
                  if (!renderList) {
                    return expFollowOns.map((fo, idx) => renderFollowOnCard(fo, null, idx + 1));
                  }
                  return renderList.map((item, i) => {
                    if (item.type === 'card') {
                      const nextItem = renderList[i + 1];
                      const nextGapInfo = nextItem?.type === 'gap' ? nextItem : null;
                      const prevItem = i > 0 ? renderList[i - 1] : null;
                      const hideConnector = prevItem?.type === 'gap';
                      return renderFollowOnCard(item.exp, matchedIds, item.index, nextGapInfo, hideConnector);
                    }
                    // type === 'gap'
                    const { cards, gapKey } = item;
                    const isExpanded = expandedGaps[gapKey];
                    const isTrailingGap = gapKey.includes('_after_');
                    const prevItem = i > 0 ? renderList[i - 1] : null;
                    return (
                      <div key={gapKey}>
                        {/* Conector: só para gaps não-trailing. Pontilhado=fechado, sólido=aberto */}
                        {!isTrailingGap && (
                          <div style={{ display: 'flex', justifyContent: 'center', height: '32px' }}>
                            {isExpanded
                              ? <div style={{ width: '4px', height: '100%', backgroundColor: '#93c5fd', borderRadius: '2px' }} />
                              : <div style={{ width: '0', borderLeft: '4px dotted #93c5fd', height: '100%' }} />
                            }
                          </div>
                        )}
                        {isExpanded && cards.map(({ exp: card, index: cardIdx }, cardI) =>
                          renderFollowOnCard(card, matchedIds, cardIdx, null, !isTrailingGap && cardI === 0)
                        )}
                        {/* Conector sólido após gap expandido (não-trailing) antes do próximo card */}
                        {isExpanded && !isTrailingGap && (
                          <div style={{ display: 'flex', justifyContent: 'center', height: '32px' }}>
                            <div style={{ width: '4px', height: '100%', backgroundColor: '#93c5fd', borderRadius: '2px' }} />
                          </div>
                        )}
                      </div>
                    );
                  });
                })()}
              </div>
            )}

              </React.Fragment>
              );
            })}



              
            </div>
          )}


          
          {/* Pagination */}
          {filteredWithRoots.length > experiencesPerPage && (
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
    
{/* ⭐ MOBILE CATEGORY DRAWER */}
{showCategoryDrawer && (
  <div className="fixed inset-0 z-50 flex flex-col justify-end sm:hidden">
    {/* Backdrop */}
    <div
      className="absolute inset-0 bg-black bg-opacity-40"
      onClick={() => setShowCategoryDrawer(false)}
    />
    {/* Drawer */}
    <div className="relative bg-white rounded-t-2xl shadow-2xl max-h-[75vh] flex flex-col">
      {/* Handle */}
      <div className="flex justify-center pt-3 pb-1">
        <div className="w-10 h-1 bg-gray-300 rounded-full" />
      </div>
      <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
        <h3 className="font-semibold text-gray-800 text-base">Category Guide</h3>
        <button
          onClick={() => setShowCategoryDrawer(false)}
          className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
        >×</button>
      </div>
      <div className="overflow-y-auto px-5 py-4 space-y-4">
        {problemCategories.map(cat => {
          const catDesc = categoryData[cat];
          if (!catDesc?.description) return (
            <div key={cat}>
              <p className="font-medium text-gray-800 text-sm">{cat}</p>
            </div>
          );
          return (
            <div key={cat} className="pb-3 border-b border-gray-100 last:border-0">
              <p className="font-semibold text-gray-800 text-sm mb-1">{cat}</p>
              <p className="text-gray-500 text-xs leading-relaxed">{catDesc.description}</p>
            </div>
          );
        })}
      </div>
    </div>
  </div>
)}

    </>
    )}

{/* iOS Install Instructions Modal */}
        {showIosInstallModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setShowIosInstallModal(false)}>
            <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-800">Add WhatIDid Icon to Home Screen</h3>
                <button onClick={() => setShowIosInstallModal(false)} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">×</button>
              </div>
                            <div className="space-y-4 text-sm text-gray-700">
                <p>To add the WhatIDid icon to your phone:</p>
                <div className="flex items-center gap-3">
                  <span className="flex-shrink-0 w-7 h-7 bg-purple-100 text-purple-700 rounded-full flex items-center justify-center font-bold">1</span>
                  <img src="data:image/png;base64,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" alt="More options" width="22" height="22" style={{ flexShrink: 0 }} />
                  <span>Tap the <strong>"•••"</strong> button at the bottom-right of Safari</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="flex-shrink-0 w-7 h-7 bg-purple-100 text-purple-700 rounded-full flex items-center justify-center font-bold">2</span>
                  <img src="data:image/png;base64,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" alt="Share" width="20" height="20" style={{ flexShrink: 0 }} />
                  <span>Tap <strong>Share</strong></span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="flex-shrink-0 w-7 h-7 bg-purple-100 text-purple-700 rounded-full flex items-center justify-center font-bold">3</span>
                  <img src="data:image/png;base64,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" alt="Add to Home Screen" width="20" height="20" style={{ flexShrink: 0 }} />
                  <span>Tap <strong>"Add to Home Screen"</strong></span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="flex-shrink-0 w-7 h-7 bg-purple-100 text-purple-700 rounded-full flex items-center justify-center font-bold">4</span>
                  <img src="data:image/png;base64,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" alt="Add" width="44" height="28" style={{ flexShrink: 0 }} />
                  <span>Tap <strong>"Add"</strong> — done!</span>
                </div>
              </div>
              {autoOpenedInstall ? (
  <div className="flex gap-3 mt-5">
    <button
      onClick={() => setShowIosInstallModal(false)}
      className="flex-1 bg-purple-600 text-white py-2.5 rounded-lg hover:bg-purple-700 font-semibold transition-colors"
    >
      Skip to Login
    </button>
    <button
      onClick={handleExit}
      className="flex-1 bg-gray-200 text-gray-700 py-2.5 rounded-lg hover:bg-gray-300 font-semibold transition-colors"
    >
      Exit
    </button>
  </div>
) : (
  <button
    onClick={() => {
      setShowIosInstallModal(false);
      if (isEmployeeLoggedIn) {
        handleEmployeeLogout();
        setInstallLogoutMessage(true);
      }
    }}
    className="w-full mt-5 bg-purple-600 text-white py-2.5 rounded-lg hover:bg-purple-700 font-semibold transition-colors"
  >
    Will do it
  </button>
)}
            </div>
          </div>
        )}
     
    </>
  );
}
