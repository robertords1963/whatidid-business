import React, { useState, useEffect, useLayoutEffect, useRef, useMemo } from 'react';
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

// Nomes de Practice que não devem aparecer no badge (mostrar só a Category).
// "General" é o nome legado; "Corporate Areas" é o nome atual pós-rename no Supabase.
const HIDDEN_PRACTICE_NAMES = ['General', 'Corporate Areas'];

// ============================================================
// TRADUÇÃO DE UI (não confundir com o idioma do CONTEÚDO, que já
// é resolvido por effectiveViewingLanguage). Isso traduz os textos
// fixos da interface — títulos de seção, botões, labels.
//
// A partir de agora, a FONTE PRINCIPAL é a tabela `ui_translations`
// no banco — carregada em loadUITranslations() e guardada em
// uiTranslationsDB. Esse objeto aqui embaixo (UI_STRINGS) vira só uma
// RESERVA embutida no código: garante que o app nunca mostra texto
// quebrado, mesmo se o banco estiver fora do ar ou ainda carregando.
// Pra adicionar um idioma novo, não precisa mexer aqui — basta
// cadastrar linhas na tabela `ui_translations` com o novo código de
// idioma (e nas telas onde o idioma é selecionado, adicionar a opção).
const UI_STRINGS = {
  section_settings: { en: 'Section Settings', es: 'Configuración de Secciones', pt: 'Configurações de Seção', zh: '版块设置' },
  manage_companies: { en: 'Manage Companies', es: 'Gestionar Empresas', pt: 'Gerenciar Empresas', zh: '管理公司' },
  manage_sellers: { en: 'Manage Sellers', es: 'Gestionar Vendedores', pt: 'Gerenciar Vendedores', zh: '管理销售代表' },
  manage_demo_groups: { en: 'Manage Demo Groups', es: 'Gestionar Grupos Demo', pt: 'Gerenciar Grupos Demo', zh: '管理演示组' },
  sellers_demo_activity_overview: { en: 'Sellers & Demo Activity Overview', es: 'Resumen de Actividad de Vendedores y Demos', pt: 'Visão Geral de Atividade de Vendedores e Demos', zh: '销售代表与演示活动概览' },
  manage_promotional_videos: { en: 'Manage Promotional Videos', es: 'Gestionar Videos Promocionales', pt: 'Gerenciar Vídeos Promocionais', zh: '管理宣传视频' },
  manage_content_pages: { en: 'Manage Content Pages', es: 'Gestionar Páginas de Contenido', pt: 'Gerenciar Páginas de Conteúdo', zh: '管理内容页面' },
  manage_employees: { en: 'Manage Employees', es: 'Gestionar Empleados', pt: 'Gerenciar Funcionários', zh: '管理员工' },
  manage_group_deletion: { en: 'Manage Group Deletion', es: 'Gestionar Eliminación de Grupos', pt: 'Gerenciar Exclusão de Grupos', zh: '管理分组删除' },
  // Lote ADM 1 — títulos de formulários "Add New ..."
  add_company: { en: 'Add Company', es: 'Agregar Empresa', pt: 'Adicionar Empresa', zh: '添加公司' },
  add_seller: { en: 'Add Seller', es: 'Agregar Vendedor', pt: 'Adicionar Vendedor', zh: '添加销售代表' },
  create_new_group: { en: 'Create New Group', es: 'Crear Nuevo Grupo', pt: 'Criar Novo Grupo', zh: '创建新分组' },
  add_new_quote: { en: 'Add New Quote', es: 'Agregar Nueva Cita', pt: 'Adicionar Nova Citação', zh: '添加新语录' },
  add_new_item: { en: 'Add New Item', es: 'Agregar Nuevo Elemento', pt: 'Adicionar Novo Item', zh: '添加新项目' },
  add_employee: { en: 'Add Employee', es: 'Agregar Empleado', pt: 'Adicionar Funcionário', zh: '添加员工' },
  add_new_category: { en: 'Add New Category', es: 'Agregar Nueva Categoría', pt: 'Adicionar Nova Categoria', zh: '添加新分类' },
  no_groups_yet: { en: 'No groups yet', es: 'Aún no hay grupos', pt: 'Ainda não há grupos', zh: '暂无分组' },
  no_members_yet: { en: 'No members yet', es: 'Aún no hay miembros', pt: 'Ainda não há membros', zh: '暂无成员' },
  no_quotes_yet: { en: 'No quotes yet', es: 'Aún no hay citas', pt: 'Ainda não há citações', zh: '暂无语录' },
  no_videos_yet: { en: 'No videos yet', es: 'Aún no hay videos', pt: 'Ainda não há vídeos', zh: '暂无视频' },
  no_name_set: { en: 'No name set', es: 'Sin nombre asignado', pt: 'Nenhum nome definido', zh: '未设置名称' },
  no_matches_found: { en: 'No matches found', es: 'No se encontraron coincidencias', pt: 'Nenhuma correspondência encontrada', zh: '未找到匹配项' },
  company_name: { en: 'Company Name', es: 'Nombre de la Empresa', pt: 'Nome da Empresa', zh: '公司名称' },
  company_logo: { en: 'Company Logo', es: 'Logo de la Empresa', pt: 'Logotipo da Empresa', zh: '公司徽标' },
  logo_active: { en: 'Logo active', es: 'Logo activo', pt: 'Logotipo ativo', zh: '徽标已启用' },
  clear_data: { en: 'Clear Data', es: 'Borrar Datos', pt: 'Limpar Dados', zh: '清除数据' },
  show_in_ui: { en: 'Show in UI', es: 'Mostrar en la Interfaz', pt: 'Mostrar na Interface', zh: '在界面中显示' },
  delete_practice: { en: 'Delete Practice', es: 'Eliminar Práctica', pt: 'Excluir Prática', zh: '删除领域' },
  problem_category: { en: 'Problem Category', es: 'Categoría del Problema', pt: 'Categoria do Problema', zh: '问题分类' },
  result_category: { en: 'Result Category', es: 'Categoría del Resultado', pt: 'Categoria do Resultado', zh: '结果分类' },
  solution: { en: 'Solution', es: 'Solución', pt: 'Solução', zh: '解决方案' },
  author: { en: 'Author', es: 'Autor', pt: 'Autor', zh: '作者' },
  data_type: { en: 'Data Type', es: 'Tipo de Dato', pt: 'Tipo de Dado', zh: '数据类型' },
  source: { en: 'Source', es: 'Fuente', pt: 'Fonte', zh: '来源' },
  company_added_success: { en: 'Company added successfully!', es: '¡Empresa agregada con éxito!', pt: 'Empresa adicionada com sucesso!', zh: '公司添加成功！' },
  content_updated_success: { en: 'Content updated successfully!', es: '¡Contenido actualizado con éxito!', pt: 'Conteúdo atualizado com sucesso!', zh: '内容更新成功！' },
  link_added_success: { en: 'Link added successfully!', es: '¡Enlace agregado con éxito!', pt: 'Link adicionado com sucesso!', zh: '链接添加成功！' },
  video_added_success: { en: 'Video added successfully!', es: '¡Video agregado con éxito!', pt: 'Vídeo adicionado com sucesso!', zh: '视频添加成功！' },
  video_deleted_success: { en: 'Video deleted successfully!', es: '¡Video eliminado con éxito!', pt: 'Vídeo excluído com sucesso!', zh: '视频删除成功！' },
  duration_updated_success: { en: 'Duration updated successfully!', es: '¡Duración actualizada con éxito!', pt: 'Duração atualizada com sucesso!', zh: '时长更新成功！' },
  confirm_delete_experience: { en: 'Delete this experience?', es: '¿Eliminar esta experiencia?', pt: 'Excluir esta experiência?', zh: '删除这条经验？' },
  confirm_delete_comment: { en: 'Delete this comment?', es: '¿Eliminar este comentario?', pt: 'Excluir este comentário?', zh: '删除这条评论？' },
  confirm_delete_quote: { en: 'Delete this quote?', es: '¿Eliminar esta cita?', pt: 'Excluir esta citação?', zh: '删除这条语录？' },
  confirm_delete_video: { en: 'Delete this video?', es: '¿Eliminar este video?', pt: 'Excluir este vídeo?', zh: '删除这个视频？' },
  confirm_delete_file: { en: 'Delete this file?', es: '¿Eliminar este archivo?', pt: 'Excluir este arquivo?', zh: '删除这个文件？' },
  confirm_delete_experience_comments: { en: 'Delete this experience? All comments will also be deleted.', es: '¿Eliminar esta experiencia? Todos los comentarios también se eliminarán.', pt: 'Excluir esta experiência? Todos os comentários também serão excluídos.', zh: '删除这条经验？所有评论也将一并删除。' },
  error_loading_data: { en: 'Error loading data. Please refresh the page.', es: 'Error al cargar los datos. Por favor, actualiza la página.', pt: 'Erro ao carregar os dados. Por favor, atualize a página.', zh: '加载数据出错，请刷新页面。' },
  error_saving_experience: { en: 'Error saving experience.', es: 'Error al guardar la experiencia.', pt: 'Erro ao salvar a experiência.', zh: '保存经验时出错。' },
  can_only_delete_own_experiences: { en: 'You can only delete your own experiences!', es: '¡Solo puedes eliminar tus propias experiencias!', pt: 'Você só pode excluir suas próprias experiências!', zh: '您只能删除自己的经验！' },
  error_deleting_experience: { en: 'Error deleting experience.', es: 'Error al eliminar la experiencia.', pt: 'Erro ao excluir a experiência.', zh: '删除经验时出错。' },
  please_enter_comment: { en: 'Please enter a comment!', es: '¡Por favor, ingresa un comentario!', pt: 'Por favor, digite um comentário!', zh: '请输入评论！' },
  error_adding_comment: { en: 'Error adding comment', es: 'Error al agregar el comentario', pt: 'Erro ao adicionar o comentário', zh: '添加评论时出错' },
  already_rated_session: { en: 'You have already rated this experience in this session!', es: '¡Ya calificaste esta experiencia en esta sesión!', pt: 'Você já avaliou esta experiência nesta sessão!', zh: '您在本次会话中已经评价过这条经验了！' },
  comment_not_found: { en: 'Comment not found!', es: '¡Comentario no encontrado!', pt: 'Comentário não encontrado!', zh: '未找到该评论！' },
  can_only_delete_own_comments: { en: 'You can only delete your own comments!', es: '¡Solo puedes eliminar tus propios comentarios!', pt: 'Você só pode excluir seus próprios comentários!', zh: '您只能删除自己的评论！' },
  error_deleting_comment: { en: 'Error deleting comment.', es: 'Error al eliminar el comentario.', pt: 'Erro ao excluir o comentário.', zh: '删除评论时出错。' },
  employee_id_name_required: { en: 'Employee ID and Name are required', es: 'El ID de Empleado y el Nombre son obligatorios', pt: 'ID de Funcionário e Nome são obrigatórios', zh: '员工 ID 和姓名为必填项' },
  seller_email_required: { en: "Email is required — the seller needs it to complete 1st Access.", es: 'El correo es obligatorio — el vendedor lo necesita para completar el Primer Acceso.', pt: 'O e-mail é obrigatório — o vendedor precisa dele para concluir o 1º Acesso.', zh: '邮箱为必填项——销售代表需要用它完成首次访问。' },
  error_creating_seller: { en: 'Error creating seller. ID may already exist.', es: 'Error al crear el vendedor. El ID puede que ya exista.', pt: 'Erro ao criar o vendedor. O ID pode já existir.', zh: '创建销售代表出错，该 ID 可能已存在。' },
  error_updating_seller: { en: 'Error updating seller', es: 'Error al actualizar el vendedor', pt: 'Erro ao atualizar o vendedor', zh: '更新销售代表时出错' },
  error_deleting_seller: { en: 'Error deleting seller:', es: 'Error al eliminar el vendedor:', pt: 'Erro ao excluir o vendedor:', zh: '删除销售代表时出错：' },
  demo_content_deleted: { en: 'Demo content deleted.', es: 'Contenido demo eliminado.', pt: 'Conteúdo demo excluído.', zh: '演示内容已删除。' },
  error_deleting_demo_content: { en: 'Error deleting demo content:', es: 'Error al eliminar el contenido demo:', pt: 'Erro ao excluir o conteúdo demo:', zh: '删除演示内容时出错：' },
  company_name_required: { en: 'Company name is required', es: 'El nombre de la empresa es obligatorio', pt: 'O nome da empresa é obrigatório', zh: '公司名称为必填项' },
  error_adding_company: { en: 'Error adding company. Code may already exist.', es: 'Error al agregar la empresa. El código puede que ya exista.', pt: 'Erro ao adicionar a empresa. O código pode já existir.', zh: '添加公司出错，该代码可能已存在。' },
  default_company_cannot_delete: { en: 'The Default company cannot be deleted.', es: 'La empresa Default no se puede eliminar.', pt: 'A empresa Default não pode ser excluída.', zh: '默认公司无法删除。' },
  error_deleting_company: { en: 'Error deleting company:', es: 'Error al eliminar la empresa:', pt: 'Erro ao excluir a empresa:', zh: '删除公司时出错：' },
  error_saving_visibility: { en: 'Error saving visibility setting.', es: 'Error al guardar la configuración de visibilidad.', pt: 'Erro ao salvar a configuração de visibilidade.', zh: '保存可见性设置时出错。' },
  error_during_import: { en: 'Error during import:', es: 'Error durante la importación:', pt: 'Erro durante a importação:', zh: '导入过程中出错：' },
  import_metadata_first: { en: "Import Metadata first — Synthetic/Curated Content links to Practices/Categories, which this company doesn't have yet.", es: 'Importa primero los Metadatos — el Contenido Sintético/Curado se vincula a Prácticas/Categorías, que esta empresa aún no tiene.', pt: 'Importe os Metadados primeiro — o Conteúdo Sintético/Curado se vincula a Práticas/Categorias, que esta empresa ainda não tem.', zh: '请先导入元数据——合成/精选内容会链接到该公司尚未拥有的领域/分类。' },
  error_importing_quotes: { en: 'Error importing quotes:', es: 'Error al importar las citas:', pt: 'Erro ao importar as citações:', zh: '导入语录时出错：' },
  generic_error: { en: 'Error:', es: 'Error:', pt: 'Erro:', zh: '错误：' },
  no_app_config_to_copy: { en: 'Default has no App Configuration to copy from.', es: 'Default no tiene una Configuración de App para copiar.', pt: 'O Default não tem uma Configuração de App para copiar.', zh: 'Default 没有可复制的应用配置。' },
  app_config_copied: { en: 'App Configuration copied from Default.', es: 'Configuración de App copiada de Default.', pt: 'Configuração de App copiada do Default.', zh: '已从 Default 复制应用配置。' },
  error_deleting_category: { en: 'Error deleting category:', es: 'Error al eliminar la categoría:', pt: 'Erro ao excluir a categoria:', zh: '删除分类时出错：' },
  error_adding_employee: { en: 'Error adding employee. ID may already exist.', es: 'Error al agregar el empleado. El ID puede que ya exista.', pt: 'Erro ao adicionar o funcionário. O ID pode já existir.', zh: '添加员工出错，该 ID 可能已存在。' },
  error_updating_employee: { en: 'Error updating employee', es: 'Error al actualizar el empleado', pt: 'Erro ao atualizar o funcionário', zh: '更新员工时出错' },
  error_deleting_employee: { en: 'Error deleting employee', es: 'Error al eliminar el empleado', pt: 'Erro ao excluir o funcionário', zh: '删除员工时出错' },
  error_reading_excel: { en: 'Error reading Excel file. Make sure columns are: Employee ID, Name, Country, Email', es: 'Error al leer el archivo Excel. Asegúrate de que las columnas sean: Employee ID, Name, Country, Email', pt: 'Erro ao ler o arquivo Excel. Verifique se as colunas são: Employee ID, Name, Country, Email', zh: '读取 Excel 文件出错，请确认列名为：Employee ID、Name、Country、Email' },
  error_setting_top_experience: { en: 'Error setting top experience', es: 'Error al establecer la experiencia destacada', pt: 'Erro ao definir a experiência em destaque', zh: '设置精选经验时出错' },
  please_enter_quote_text: { en: 'Please enter quote text', es: 'Por favor, ingresa el texto de la cita', pt: 'Por favor, digite o texto da citação', zh: '请输入语录文本' },
  author_required_bottom: { en: 'Author is required for bottom quotes', es: 'El autor es obligatorio para las citas inferiores', pt: 'O autor é obrigatório para citações no rodapé', zh: '底部语录必须填写作者' },
  error_adding_quote: { en: 'Error adding quote', es: 'Error al agregar la cita', pt: 'Erro ao adicionar a citação', zh: '添加语录时出错' },
  error_updating_quote: { en: 'Error updating quote', es: 'Error al actualizar la cita', pt: 'Erro ao atualizar a citação', zh: '更新语录时出错' },
  error_deleting_quote: { en: 'Error deleting quote', es: 'Error al eliminar la cita', pt: 'Erro ao excluir a citação', zh: '删除语录时出错' },
  error_updating_content: { en: 'Error updating content', es: 'Error al actualizar el contenido', pt: 'Erro ao atualizar o conteúdo', zh: '更新内容时出错' },
  please_enter_url: { en: 'Please enter a URL', es: 'Por favor, ingresa una URL', pt: 'Por favor, digite uma URL', zh: '请输入网址' },
  error_adding_link: { en: 'Error adding link:', es: 'Error al agregar el enlace:', pt: 'Erro ao adicionar o link:', zh: '添加链接时出错：' },
  please_select_file: { en: 'Please select a file', es: 'Por favor, selecciona un archivo', pt: 'Por favor, selecione um arquivo', zh: '请选择文件' },
  please_enter_video_duration: { en: 'Please enter video duration (e.g., 1:30)', es: 'Por favor, ingresa la duración del video (ej. 1:30)', pt: 'Por favor, digite a duração do vídeo (ex: 1:30)', zh: '请输入视频时长（例如 1:30）' },
  error_adding_video: { en: 'Error adding video:', es: 'Error al agregar el video:', pt: 'Erro ao adicionar o vídeo:', zh: '添加视频时出错：' },
  error_deleting_video: { en: 'Error deleting video', es: 'Error al eliminar el video', pt: 'Erro ao excluir o vídeo', zh: '删除视频时出错' },
  error_updating_video_order: { en: 'Error updating video order', es: 'Error al actualizar el orden de los videos', pt: 'Erro ao atualizar a ordem dos vídeos', zh: '更新视频顺序时出错' },
  error_updating_duration: { en: 'Error updating duration', es: 'Error al actualizar la duración', pt: 'Erro ao atualizar a duração', zh: '更新时长时出错' },
  error_updating_name: { en: 'Error updating name', es: 'Error al actualizar el nombre', pt: 'Erro ao atualizar o nome', zh: '更新名称时出错' },
  error_deleting_items: { en: 'Error deleting some items:', es: 'Error al eliminar algunos elementos:', pt: 'Erro ao excluir alguns itens:', zh: '删除部分项目时出错：' },
  error_deleting: { en: 'Error deleting:', es: 'Error al eliminar:', pt: 'Erro ao excluir:', zh: '删除时出错：' },
  error_updating_status: { en: 'Error updating status:', es: 'Error al actualizar el estado:', pt: 'Erro ao atualizar o status:', zh: '更新状态时出错：' },
  error_saving_contact_info: { en: 'Error saving contact info:', es: 'Error al guardar la información de contacto:', pt: 'Erro ao salvar as informações de contato:', zh: '保存联系信息时出错：' },
  contact_info_saved: { en: 'Contact info saved.', es: 'Información de contacto guardada.', pt: 'Informações de contato salvas.', zh: '联系信息已保存。' },
  contact_name_placeholder: { en: 'Contact Name', es: 'Nombre de Contacto', pt: 'Nome de Contato', zh: '联系人姓名' },
  phone: { en: 'Phone', es: 'Teléfono', pt: 'Telefone', zh: '电话' },
  city_country: { en: 'City/Country', es: 'Ciudad/País', pt: 'Cidade/País', zh: '城市/国家' },
  comments_optional: { en: 'Comments (optional)', es: 'Comentarios (opcional)', pt: 'Comentários (opcional)', zh: '备注（选填）' },
  enter_quote_placeholder: { en: 'Enter the quote...', es: 'Ingresa la cita...', pt: 'Digite a citação...', zh: '输入语录内容……' },
  author_name_placeholder: { en: 'Author name...', es: 'Nombre del autor...', pt: 'Nome do autor...', zh: '作者姓名……' },
  enter_content_markdown: { en: 'Enter content in Markdown format...', es: 'Ingresa el contenido en formato Markdown...', pt: 'Digite o conteúdo em formato Markdown...', zh: '请输入 Markdown 格式的内容……' },
  corporate_email: { en: 'Corporate Email', es: 'Correo Corporativo', pt: 'E-mail Corporativo', zh: '公司邮箱' },
  search_by_id_name_email: { en: 'Search by ID, name or email...', es: 'Buscar por ID, nombre o correo...', pt: 'Buscar por ID, nome ou e-mail...', zh: '按 ID、姓名或邮箱搜索……' },
  category_name_placeholder: { en: 'Category name...', es: 'Nombre de la categoría...', pt: 'Nome da categoria...', zh: '分类名称……' },
  category_name_placeholder_short: { en: 'Category name', es: 'Nombre de la categoría', pt: 'Nome da categoria', zh: '分类名称' },
  add_to_desktop: { en: 'Add to Desktop', es: 'Agregar al Escritorio', pt: 'Adicionar à Área de Trabalho', zh: '添加到桌面' },
  add_to_phone: { en: 'Add to Phone', es: 'Agregar al Teléfono', pt: 'Adicionar ao Celular', zh: '添加到手机' },
  clear_all: { en: 'Clear All', es: 'Limpiar Todo', pt: 'Limpar Tudo', zh: '清空全部' },
  follow_on_to: { en: '🔗 Follow-On to:', es: '🔗 Continuación de:', pt: '🔗 Continuação de:', zh: '🔗 续写自：' },
  require_employee_id: { en: 'Require Employee ID for access', es: 'Requerir ID de Empleado para acceder', pt: 'Exigir ID de Funcionário para acesso', zh: '需要员工 ID 才能访问' },
  allow_document_upload: { en: 'Allow Document Upload', es: 'Permitir Subida de Documentos', pt: 'Permitir Envio de Documentos', zh: '允许上传文件' },
  document_type_label: { en: 'Document Type:', es: 'Tipo de Documento:', pt: 'Tipo de Documento:', zh: '文件类型：' },
  show_top3_experiences: { en: 'Show Top 3 Experiences', es: 'Mostrar Top 3 Experiencias', pt: 'Mostrar Top 3 Experiências', zh: '显示前三名经验' },
  show_inspirational_quotes: { en: 'Show Inspirational Quotes (Marquee)', es: 'Mostrar Citas Inspiradoras (Marquesina)', pt: 'Mostrar Citações Inspiradoras (Faixa)', zh: '显示励志语录（滚动条）' },
  doc_type_cv: { en: '📄 CV (PDF only) - for Pro edition', es: '📄 CV (solo PDF) - para la edición Pro', pt: '📄 Currículo (apenas PDF) - para a edição Pro', zh: '📄 简历（仅限 PDF）— 适用于 Pro 版' },
  doc_type_other: { en: '📎 Other Docs (PPT, XLS, PDF, DOCX) - for Corp edition', es: '📎 Otros Documentos (PPT, XLS, PDF, DOCX) - para la edición Corp', pt: '📎 Outros Documentos (PPT, XLS, PDF, DOCX) - para a edição Corp', zh: '📎 其他文件（PPT、XLS、PDF、DOCX）— 适用于 Corp 版' },
  error_updating_doc_type: { en: 'Error updating document type', es: 'Error al actualizar el tipo de documento', pt: 'Erro ao atualizar o tipo de documento', zh: '更新文件类型时出错' },
  start_visible_top3: { en: 'Start visible (users can still hide/show it)', es: 'Comenzar visible (los usuarios aún pueden ocultarlo/mostrarlo)', pt: 'Começar visível (usuários ainda podem ocultar/mostrar)', zh: '默认可见（用户仍可隐藏/显示）' },
  quote_text: { en: 'Quote Text', es: 'Texto de la Cita', pt: 'Texto da Citação', zh: '语录内容' },
  position: { en: 'Position', es: 'Posición', pt: 'Posição', zh: '位置' },
  name_optional: { en: 'Name (optional)', es: 'Nombre (opcional)', pt: 'Nome (opcional)', zh: '名称（选填）' },
  only_without_ratings: { en: 'Only experiences WITHOUT ratings (safe)', es: 'Solo experiencias SIN calificaciones (seguro)', pt: 'Apenas experiências SEM avaliações (seguro)', zh: '仅限没有评分的经验（安全）' },
  all_done: { en: 'All done!', es: '¡Todo listo!', pt: 'Tudo pronto!', zh: '全部完成！' },
  type_next_stop: { en: 'Just type your next stop in the address bar below.', es: 'Escribe tu próximo destino en la barra de direcciones abajo.', pt: 'Digite seu próximo destino na barra de endereço abaixo.', zh: '请在下方地址栏中输入下一个网址。' },
  promotional_videos_label: { en: 'Promotional Videos', es: 'Videos Promocionales', pt: 'Vídeos Promocionais', zh: '宣传视频' },
  metadata_model: { en: 'Metadata Model', es: 'Modelo de Metadatos', pt: 'Modelo de Metadados', zh: '元数据模型' },
  functions_categories_desc: { en: 'Functions/Practices, Categories, Descriptions, Tags', es: 'Funciones/Prácticas, Categorías, Descripciones, Etiquetas', pt: 'Funções/Práticas, Categorias, Descrições, Tags', zh: '职能/领域、分类、描述、标签' },
  synthetic_curated_content: { en: 'Synthetic/Curated Content', es: 'Contenido Sintético/Curado', pt: 'Conteúdo Sintético/Selecionado', zh: '合成/精选内容' },
  loading_ellipsis: { en: 'Loading...', es: 'Cargando...', pt: 'Carregando...', zh: '加载中……' },
  no_companies_yet: { en: 'No companies yet.', es: 'Aún no hay empresas.', pt: 'Ainda não há empresas.', zh: '暂无公司。' },
  no_sellers_yet: { en: 'No sellers yet.', es: 'Aún no hay vendedores.', pt: 'Ainda não há vendedores.', zh: '暂无销售代表。' },
  no_employees_yet: { en: 'No employees yet.', es: 'Aún no hay empleados.', pt: 'Ainda não há funcionários.', zh: '暂无员工。' },
  no_categories_match: { en: 'No Categories match this Source.', es: 'Ninguna Categoría coincide con esta Fuente.', pt: 'Nenhuma Categoria corresponde a esta Fonte.', zh: '没有分类与该来源匹配。' },
  no_functions_match: { en: 'No Functions/Practices match this Source.', es: 'Ninguna Función/Práctica coincide con esta Fuente.', pt: 'Nenhuma Função/Prática corresponde a esta Fonte.', zh: '没有职能/领域与该来源匹配。' },
  save_contact_info: { en: 'Save Contact Info', es: 'Guardar Información de Contacto', pt: 'Salvar Informações de Contato', zh: '保存联系信息' },
  clear: { en: 'Clear', es: 'Limpiar', pt: 'Limpar', zh: '清除' },
  delete_whole_function: { en: 'Delete the whole Function/Practice instead', es: 'Eliminar toda la Función/Práctica en su lugar', pt: 'Excluir toda a Função/Prática em vez disso', zh: '改为删除整个职能/领域' },
  react_tooltip: { en: 'React', es: 'Reaccionar', pt: 'Reagir', zh: '表态' },
  contact_info_tooltip: { en: 'Contact info', es: 'Información de contacto', pt: 'Informações de contato', zh: '联系信息' },
  retires_id_permanently: { en: 'Retires this ID/PW permanently', es: 'Retira este ID/Contraseña permanentemente', pt: 'Aposenta este ID/Senha permanentemente', zh: '永久停用此 ID/密码' },
  demo_language_tooltip: { en: 'Language the demo will show', es: 'Idioma en que se mostrará la demo', pt: 'Idioma que a demo vai mostrar', zh: '演示将显示的语言' },
  max_active_demo_ids: { en: 'Max active Demo IDs this seller can have at once', es: 'Máximo de IDs Demo activos que este vendedor puede tener a la vez', pt: 'Máximo de IDs Demo ativos que este vendedor pode ter ao mesmo tempo', zh: '该销售代表可同时拥有的最大活跃演示 ID 数量' },
  delete_file_tooltip: { en: 'Delete file', es: 'Eliminar archivo', pt: 'Excluir arquivo', zh: '删除文件' },
  cv_preview_tooltip: { en: 'CV Preview', es: 'Vista Previa del CV', pt: 'Pré-visualização do Currículo', zh: '简历预览' },
  select_industry_sector: { en: 'Select your industry sector...', es: 'Selecciona tu sector industrial...', pt: 'Selecione seu setor de atuação...', zh: '选择你的行业领域……' },
  select_country: { en: 'Select country', es: 'Selecciona el país', pt: 'Selecione o país', zh: '选择国家' },
  all_sectors: { en: 'All Sectors', es: 'Todos los Sectores', pt: 'Todos os Setores', zh: '所有行业' },
  my_seller_view: { en: 'My Seller View', es: 'Mi Vista de Vendedor', pt: 'Minha Visão de Vendedor', zh: '我的销售代表视图' },
  my_company: { en: 'My Company', es: 'Mi Empresa', pt: 'Minha Empresa', zh: '我的公司' },
  prospect: { en: 'Prospect', es: 'Prospecto', pt: 'Prospect', zh: '潜在客户' },
  pilot: { en: 'Pilot', es: 'Piloto', pt: 'Piloto', zh: '试点' },
  customer: { en: 'Customer', es: 'Cliente', pt: 'Cliente', zh: '正式客户' },
  pending: { en: 'Pending', es: 'Pendiente', pt: 'Pendente', zh: '待处理' },
  blocked: { en: 'Blocked', es: 'Bloqueado', pt: 'Bloqueado', zh: '已封禁' },
  upload_user_experiences: { en: 'Upload (User Experiences)', es: 'Subida (Experiencias de Usuarios)', pt: 'Upload (Experiências de Usuários)', zh: '上传（用户经验）' },
  key_insights_curated: { en: 'Key Insights (Curated)', es: 'Key Insights (Curados)', pt: 'Key Insights (Selecionados)', zh: 'Key Insights（精选）' },
  both: { en: 'Both', es: 'Ambos', pt: 'Ambos', zh: '两者都' },
  metadata: { en: 'Metadata', es: 'Metadatos', pt: 'Metadados', zh: '元数据' },
  individual_experiences_opt: { en: 'Individual Experiences', es: 'Experiencias Individuales', pt: 'Experiências Individuais', zh: '个人经验' },
  common_cases_key_insights: { en: 'Common Cases / Key Insights', es: 'Casos Comunes / Key Insights', pt: 'Casos Comuns / Key Insights', zh: '共性案例 / Key Insights' },
  curated_sample: { en: 'Curated / Sample', es: 'Curado / Muestra', pt: 'Selecionado / Amostra', zh: '精选 / 示例' },
  entered_by_users: { en: 'Entered by Users', es: 'Ingresado por Usuarios', pt: 'Inserido por Usuários', zh: '用户输入' },
  none_option: { en: 'None', es: 'Ninguno', pt: 'Nenhum', zh: '无' },
  app_configuration: { en: 'Experience Configuration', es: 'Configuración de la Experiencia', pt: 'Configuração da Experiência', zh: '体验配置' },
  quotes_label: { en: 'Quotes', es: 'Citas', pt: 'Citações', zh: '语录' },
  content_pages_label: { en: 'Content Pages', es: 'Páginas de Contenido', pt: 'Páginas de Conteúdo', zh: '内容页面' },
  page_subtitles_label: { en: 'Page Subtitles', es: 'Subtítulos de la Página', pt: 'Subtítulos da Página', zh: '页面副标题' },
  pro_signup_links_title: { en: '🔗 Pro Signup Links', es: '🔗 Enlaces de Registro Pro', pt: '🔗 Links de Cadastro Pro', zh: '🔗 Pro 注册链接' },
  professional_link_label: { en: 'Professional link:', es: 'Enlace de Profesional:', pt: 'Link do Profissional:', zh: 'Professional 链接：' },
  contratante_link_label: { en: 'Hiring Company link:', es: 'Enlace de Empresa Contratante:', pt: 'Link da Contratante:', zh: 'Contratante 链接：' },
  copy_link_btn: { en: 'Copy', es: 'Copiar', pt: 'Copiar', zh: '复制' },
  link_copied: { en: 'Link copied!', es: '¡Enlace copiado!', pt: 'Link copiado!', zh: '链接已复制！' },
  pro_signup_confirm_title: { en: 'Sign Up', es: 'Registro', pt: 'Cadastro', zh: '注册' },
  pro_signup_confirm_professional: { en: 'You are signing up as a Professional of', es: 'Te estás registrando como Profesional de', pt: 'Você está se cadastrando como Profissional da', zh: '您正在以专业人士身份注册' },
  pro_signup_confirm_contratante: { en: 'You are signing up as a Hiring Company representative of', es: 'Te estás registrando como representante de Empresa Contratante de', pt: 'Você está se cadastrando como representante de Empresa Contratante da', zh: '您正在以招聘企业代表身份注册' },
  pro_signup_confirm_button: { en: 'Yes, continue', es: 'Sí, continuar', pt: 'Sim, continuar', zh: '是的，继续' },
  pro_signup_invalid_title: { en: 'Invalid or expired link', es: 'Enlace inválido o expirado', pt: 'Link inválido ou expirado', zh: '链接无效或已过期' },
  pro_signup_invalid_message: { en: 'This signup link is not valid. Please check with the company that shared it with you.', es: 'Este enlace de registro no es válido. Por favor, verifica con la empresa que te lo compartió.', pt: 'Este link de cadastro não é válido. Por favor, verifique com a empresa que compartilhou ele com você.', zh: '此注册链接无效，请与向您分享该链接的公司核实。' },
  pro_signup_your_name: { en: 'Your Name', es: 'Tu Nombre', pt: 'Seu Nome', zh: '您的姓名' },
  pro_signup_your_email: { en: 'Your Email', es: 'Tu Correo', pt: 'Seu E-mail', zh: '您的邮箱' },
  pro_signup_continue_btn: { en: 'Continue', es: 'Continuar', pt: 'Continuar', zh: '继续' },
  pro_signup_verify_hint: { en: 'We sent a verification code to your email.', es: 'Enviamos un código de verificación a tu correo.', pt: 'Enviamos um código de verificação para o seu e-mail.', zh: '我们已向您的邮箱发送了验证码。' },
  pro_signup_verify_btn: { en: 'Verify Code', es: 'Verificar Código', pt: 'Verificar Código', zh: '验证码确认' },
  pro_signup_create_password: { en: 'Create your password', es: 'Crea tu contraseña', pt: 'Crie sua senha', zh: '创建您的密码' },
  pro_signup_create_account_btn: { en: 'Create Account', es: 'Crear Cuenta', pt: 'Criar Conta', zh: '创建账户' },
  pro_signup_done_title: { en: 'Account created!', es: '¡Cuenta creada!', pt: 'Conta criada!', zh: '账户创建成功！' },
  pro_signup_done_message: { en: 'You can now log in with your email and password.', es: 'Ahora puedes iniciar sesión con tu correo y contraseña.', pt: 'Agora você pode fazer login com seu e-mail e senha.', zh: '您现在可以使用邮箱和密码登录了。' },
  pro_signup_go_to_login: { en: 'Go to Login', es: 'Ir a Iniciar Sesión', pt: 'Ir para o Login', zh: '前往登录' },
  pro_signup_pars_found_title: { en: 'We found existing PAR(s)', es: 'Encontramos PAR(es) existente(s)', pt: 'Encontramos PAR(es) existente(s)', zh: '我们找到了已有的 PAR' },
  pro_signup_pars_found_hint: { en: 'Select which ones you want to bring to this new profile — you can also uncheck all and start fresh.', es: 'Selecciona cuáles quieres traer a este nuevo perfil — también puedes desmarcar todos y empezar de cero.', pt: 'Selecione quais você quer trazer para este novo perfil — você também pode desmarcar todos e começar do zero.', zh: '请选择要带入此新档案的内容——您也可以全部取消勾选，从头开始。' },
  pro_signup_pars_choice_continue: { en: 'Continue', es: 'Continuar', pt: 'Continuar', zh: '继续' },
  seller_id_hint_intro: { en: "Creates the seller's own account (goes through 1st Access like any employee) — both the Seller ID and email need to match exactly what's entered here.", es: 'Crea la cuenta propia del vendedor (pasa por el Primer Acceso como cualquier empleado) — tanto el ID de Vendedor como el correo deben coincidir exactamente con lo ingresado aquí.', pt: 'Cria a conta do próprio vendedor (passa pelo 1º Acesso como qualquer funcionário) — tanto o ID do Vendedor quanto o e-mail precisam bater exatamente com o que foi digitado aqui.', zh: '创建销售代表自己的账户（和任何员工一样需要经过首次访问流程）——Seller ID 和邮箱都必须与此处输入的内容完全一致。' },
  suggested_id_format: { en: 'Suggested ID format:', es: 'Formato de ID sugerido:', pt: 'Formato de ID sugerido:', zh: '建议的 ID 格式：' },
  seller_id_hint_example: { en: 'first two letters of first + last name, plus month/year — e.g.', es: 'las dos primeras letras del nombre + apellido, más mes/año — ej.', pt: 'as duas primeiras letras do primeiro nome + sobrenome, mais mês/ano — ex.', zh: '名字和姓氏的前两个字母，加上月份/年份——例如' },
  seller_id_hint_registered: { en: 'for "Roberto Rodrigues", registered July 2026.', es: 'para "Roberto Rodrigues", registrado en julio de 2026.', pt: 'para "Roberto Rodrigues", registrado em julho de 2026.', zh: '适用于"Roberto Rodrigues"，注册于 2026 年 7 月。' },
  expires_in: { en: 'Expires in:', es: 'Expira en:', pt: 'Expira em:', zh: '过期时间：' },
  markdown_tips: { en: 'Markdown Tips:', es: 'Consejos de Markdown:', pt: 'Dicas de Markdown:', zh: 'Markdown 提示：' },
  markdown_tips_text: { en: 'Use # for titles, ## for subtitles, ### for sections, - for bullet points', es: 'Usa # para títulos, ## para subtítulos, ### para secciones, - para viñetas', pt: 'Use # para títulos, ## para subtítulos, ### para seções, - para marcadores', zh: '使用 # 表示标题，## 表示副标题，### 表示章节，- 表示项目符号' },
  excel_columns_employee: { en: 'Excel columns:', es: 'Columnas de Excel:', pt: 'Colunas do Excel:', zh: 'Excel 列：' },
  keyword_found: { en: 'Keyword found:', es: 'Palabra clave encontrada:', pt: 'Palavra-chave encontrada:', zh: '找到关键词：' },
  set_as_top: { en: 'Set as Top:', es: 'Marcar como Top:', pt: 'Definir como Top:', zh: '设为精选：' },
  import_content_in: { en: 'Import content in:', es: 'Importar contenido en:', pt: 'Importar conteúdo em:', zh: '导入内容语言：' },
  section_header: { en: 'Section', es: 'Sección', pt: 'Seção', zh: '版块' },
  view_edit_access: { en: 'View & Edit access', es: 'Acceso de Vista y Edición', pt: 'Acesso de Visualização e Edição', zh: '查看与编辑权限' },
  select_registered_company: { en: 'Select a registered company...', es: 'Selecciona una empresa registrada...', pt: 'Selecione uma empresa registrada...', zh: '选择一家已注册的公司……' },
  seller_col: { en: 'Seller', es: 'Vendedor', pt: 'Vendedor', zh: '销售代表' },
  companies_col: { en: 'Companies', es: 'Empresas', pt: 'Empresas', zh: '公司' },
  groups_col: { en: 'Groups', es: 'Grupos', pt: 'Grupos', zh: '分组' },
  max_demo_ids_col: { en: 'Max DEMO IDs', es: 'Máx. IDs Demo', pt: 'Máx. IDs Demo', zh: '最大演示 ID 数' },
  active_ids_col: { en: 'Active IDs', es: 'IDs Activos', pt: 'IDs Ativos', zh: '活跃 ID' },
  available_unassigned_col: { en: 'Available (unassigned)', es: 'Disponibles (sin asignar)', pt: 'Disponíveis (não atribuídos)', zh: '可用（未分配）' },
  expired_pending_col: { en: 'Expired (pending cleanup)', es: 'Expirados (pendientes de limpieza)', pt: 'Expirados (aguardando limpeza)', zh: '已过期（待清理）' },
  size_label: { en: 'Size:', es: 'Tamaño:', pt: 'Tamanho:', zh: '大小：' },
  function_practice_colon: { en: 'Function/Practice:', es: 'Función/Práctica:', pt: 'Função/Prática:', zh: '职能/领域：' },
  none_not_rated: { en: 'None (Not rated)', es: 'Ninguno (Sin calificar)', pt: 'Nenhum (Sem avaliação)', zh: '无（未评分）' },
  for_adm_master: { en: 'for ADM Master', es: 'para ADM Master', pt: 'para ADM Master', zh: '面向 ADM Master' },
  to_word: { en: 'to', es: 'a', pt: 'a', zh: '至' },
  ratings_word: { en: 'ratings', es: 'calificaciones', pt: 'avaliações', zh: '条评分' },
  importing_ellipsis: { en: 'Importing...', es: 'Importando...', pt: 'Importando...', zh: '导入中……' },
  import_update: { en: 'Import/Update', es: 'Importar/Actualizar', pt: 'Importar/Atualizar', zh: '导入/更新' },
  // Lote 2 — botões e labels genéricos usados nas seções administrativas
  save: { en: 'Save', es: 'Guardar', pt: 'Salvar', zh: '保存' },
  cancel: { en: 'Cancel', es: 'Cancelar', pt: 'Cancelar', zh: '取消' },
  delete: { en: 'Delete', es: 'Eliminar', pt: 'Excluir', zh: '删除' },
  edit: { en: 'Edit', es: 'Editar', pt: 'Editar', zh: '编辑' },
  add: { en: 'Add', es: 'Agregar', pt: 'Adicionar', zh: '添加' },
  active: { en: 'Active', es: 'Activo', pt: 'Ativo', zh: '激活' },
  inactive: { en: 'Inactive', es: 'Inactivo', pt: 'Inativo', zh: '未激活' },
  enabled: { en: 'Enabled', es: 'Habilitado', pt: 'Habilitado', zh: '已启用' },
  disabled: { en: 'Disabled', es: 'Deshabilitado', pt: 'Desabilitado', zh: '已禁用' },
  // Lote 3 — botões e navegação principal do UI público
  see_what_others_did: { en: 'See What Others Did', es: 'Ver Lo Que Otros Hicieron', pt: 'Veja o Que Outros Fizeram', zh: '查看他人的经验' },
  share_your_experience: { en: 'Share Your Experience', es: 'Comparte Tu Experiencia', pt: 'Compartilhe Sua Experiência', zh: '分享你的经验' },
  individual: { en: 'Individual', es: 'Individuales', pt: 'Individuais', zh: '个人' },
  experiences: { en: 'Experiences', es: 'Experiencias', pt: 'Experiências', zh: '经验' },
  user_stories: { en: '(User Stories)', es: '(Historias de Usuarios)', pt: '(Histórias de Usuários)', zh: '（用户故事）' },
  key: { en: 'Key', es: 'Ideas', pt: 'Principais', zh: '关键' },
  insights: { en: 'Insights', es: 'Clave', pt: 'Insights', zh: '洞察' },
  curated_patterns: { en: '(Curated Patterns)', es: '(Patrones Curados)', pt: '(Padrões Selecionados)', zh: '（精选规律）' },
  top3_this_week: { en: 'Top 3 Experiences This Week', es: 'Top 3 Experiencias de la Semana', pt: 'Top 3 Experiências da Semana', zh: '本周精选前三名经验' },
  handpicked_experiences: { en: 'Handpicked experiences, worth learning from', es: 'Experiencias seleccionadas, que vale la pena conocer', pt: 'Experiências selecionadas, que vale a pena conhecer', zh: '精心挑选、值得借鉴的经验' },
  // Lote 4 — cards de experiência e filtros do UI público
  problem: { en: 'Problem', es: 'Problema', pt: 'Problema', zh: '问题' },
  action: { en: 'Action', es: 'Acción', pt: 'Ação', zh: '行动' },
  result: { en: 'Result', es: 'Resultado', pt: 'Resultado', zh: '结果' },
  your_rating: { en: 'Your rating:', es: 'Tu calificación:', pt: 'Sua avaliação:', zh: '你的评分：' },
  add_a_comment: { en: 'Add a Comment', es: 'Agregar un Comentario', pt: 'Adicionar um Comentário', zh: '添加评论' },
  category: { en: 'Category', es: 'Categoría', pt: 'Categoria', zh: '分类' },
  gender: { en: 'Gender', es: 'Género', pt: 'Gênero', zh: '性别' },
  age: { en: 'Age', es: 'Edad', pt: 'Idade', zh: '年龄' },
  country: { en: 'Country', es: 'País', pt: 'País', zh: '国家' },
  enter_keywords: { en: 'Enter Keywords', es: 'Ingresa Palabras Clave', pt: 'Digite Palavras-chave', zh: '输入关键词' },
  all: { en: 'All', es: 'Todos', pt: 'Todos', zh: '全部' },
  more_filters: { en: '▼ More filters', es: '▼ Más filtros', pt: '▼ Mais filtros', zh: '▼ 更多筛选' },
  less_filters: { en: '▲ Less filters', es: '▲ Menos filtros', pt: '▲ Menos filtros', zh: '▲ 收起筛选' },
  clear_filters: { en: 'Clear filters', es: 'Limpiar filtros', pt: 'Limpar filtros', zh: '清除筛选' },
  rating: { en: 'Rating', es: 'Calificación', pt: 'Avaliação', zh: '评分' },
  function_practice: { en: 'Function / Practice', es: 'Función / Práctica', pt: 'Função / Prática', zh: '职能 / 领域' },
  // Lote 5 — formulário "Share Your Experience"
  select_category: { en: 'Select category', es: 'Selecciona categoría', pt: 'Selecione a categoria', zh: '选择分类' },
  describe_problem: { en: 'Describe the problem you faced...', es: 'Describe el problema que enfrentaste...', pt: 'Descreva o problema que você enfrentou...', zh: '描述你遇到的问题……' },
  what_did_you_do: { en: 'What did you do to solve it?', es: '¿Qué hiciste para resolverlo?', pt: 'O que você fez para resolvê-lo?', zh: '你采取了什么行动来解决它？' },
  how_was_result: { en: 'How was the result?', es: '¿Cómo fue el resultado?', pt: 'Como foi o resultado?', zh: '结果如何？' },
  what_was_outcome: { en: 'What was the outcome?', es: '¿Cuál fue el resultado?', pt: 'Qual foi o resultado?', zh: '结果是什么？' },
  author_optional: { en: 'Author (optional)', es: 'Autor (opcional)', pt: 'Autor (opcional)', zh: '作者（选填）' },
  your_name: { en: 'Your name...', es: 'Tu nombre...', pt: 'Seu nome...', zh: '你的姓名……' },
  gender_optional: { en: 'Gender (optional)', es: 'Género (opcional)', pt: 'Gênero (opcional)', zh: '性别（选填）' },
  age_range_optional: { en: 'Age Range (optional)', es: 'Rango de Edad (opcional)', pt: 'Faixa Etária (opcional)', zh: '年龄段（选填）' },
  country_auto_detected: { en: 'Country (auto-detected)', es: 'País (autodetectado)', pt: 'País (detectado automaticamente)', zh: '国家（自动检测）' },
  prefer_not_to_say: { en: 'Prefer not to say', es: 'Prefiero no decir', pt: 'Prefiro não dizer', zh: '不愿透露' },
  detected: { en: 'Detected:', es: 'Detectado:', pt: 'Detectado:', zh: '检测到：' },
  not_detected: { en: 'Not detected', es: 'No detectado', pt: 'Não detectado', zh: '未检测到' },
  // Lote 6 — rodapé público
  how_it_works: { en: 'How It Works', es: 'Cómo Funciona', pt: 'Como Funciona', zh: '使用说明' },
  community_guidelines: { en: 'Community Guidelines', es: 'Normas de la Comunidad', pt: 'Diretrizes da Comunidade', zh: '社区规范' },
  about: { en: 'About', es: 'Acerca de', pt: 'Sobre', zh: '关于' },
  portal: { en: 'Portal', es: 'Portal', pt: 'Portal', zh: '门户' },
  admin_mode_logout: { en: 'Admin Mode (Click to Logout)', es: 'Modo Admin (Clic para Salir)', pt: 'Modo Admin (Clique para Sair)', zh: '管理员模式（点击退出）' },
  enter_admin_mode: { en: 'Enter Admin Mode', es: 'Entrar en Modo Admin', pt: 'Entrar no Modo Admin', zh: '进入管理员模式' },
  // Lote 7 — paginação
  previous: { en: '← Previous', es: '← Anterior', pt: '← Anterior', zh: '← 上一页' },
  next: { en: 'Next →', es: 'Siguiente →', pt: 'Próxima →', zh: '下一页 →' },
  // Lote 8 — linha de autoria "By:" no UI público
  by: { en: 'By:', es: 'Por:', pt: 'Por:', zh: '发布者：' },
  common_cases: { en: 'COMMON CASES', es: 'CASOS COMUNES', pt: 'CASOS COMUNS', zh: '共性案例' },
  // Lote 9 — modal de instalação do PWA (iOS)
  add_icon_home_screen: { en: 'Add WhatIDid Icon to Home Screen', es: 'Agregar el Ícono de WhatIDid a la Pantalla de Inicio', pt: 'Adicionar o Ícone do WhatIDid à Tela de Início', zh: '将 WhatIDid 图标添加到主屏幕' },
  to_add_icon: { en: 'To add the WhatIDid icon to your phone:', es: 'Para agregar el ícono de WhatIDid a tu teléfono:', pt: 'Para adicionar o ícone do WhatIDid ao seu celular:', zh: '要将 WhatIDid 图标添加到你的手机：' },
  tap_dots_button: { en: 'Tap the "•••" button at the bottom-right of Safari', es: 'Toca el botón "•••" en la esquina inferior derecha de Safari', pt: 'Toque no botão "•••" no canto inferior direito do Safari', zh: '点击 Safari 右下角的"•••"按钮' },
  tap_share: { en: 'Tap Share', es: 'Toca Compartir', pt: 'Toque em Compartilhar', zh: '点击"分享"' },
  tap_add_home_screen: { en: 'Tap "Add to Home Screen"', es: 'Toca "Agregar a la pantalla de inicio"', pt: 'Toque em "Adicionar à Tela de Início"', zh: '点击"添加到主屏幕"' },
  tap_add_done: { en: 'Tap "Add" — done!', es: 'Toca "Agregar" — ¡listo!', pt: 'Toque em "Adicionar" — pronto!', zh: '点击"添加"——完成！' },
  not_now_back_login: { en: 'Not now, Back to login', es: 'Ahora no, volver al inicio de sesión', pt: 'Agora não, voltar ao login', zh: '暂不设置，返回登录' },
  exit: { en: 'Exit', es: 'Salir', pt: 'Sair', zh: '退出' },
  // Lote 10 — faixas do Demo Mode
  demo_mode_leave: { en: '🎬 Demo Mode — Only visible to you. Deleted when you leave.', es: '🎬 Modo Demo — Solo visible para ti. Se elimina cuando te vayas.', pt: '🎬 Modo Demo — Visível apenas para você. Excluído quando você sair.', zh: '🎬 演示模式 — 仅您可见。离开后将被删除。' },
  demo_mode_expires: { en: '🎬 Demo Mode — Only visible to you. Deleted when your demo expires.', es: '🎬 Modo Demo — Solo visible para ti. Se elimina cuando expire tu demo.', pt: '🎬 Modo Demo — Visível apenas para você. Excluído quando sua demo expirar.', zh: '🎬 演示模式 — 仅您可见。演示到期后将被删除。' },
  delete_now: { en: '🗑️ Delete Now', es: '🗑️ Eliminar Ahora', pt: '🗑️ Excluir Agora', zh: '🗑️ 立即删除' },
  // Lote 11 — badges de resultado (Worked / No Change / Got Worse)
  worked: { en: 'Worked', es: 'Funcionó', pt: 'Funcionou', zh: '有效' },
  result_varies: { en: 'Result Varies', es: 'Resultado Varía', pt: 'Resultado Varia', zh: '结果各异' },
  created: { en: 'Created', es: 'Creado', pt: 'Criado', zh: '创建于' },
  exp: { en: 'Exp', es: 'Vence', pt: 'Expira', zh: '到期' },
  days_left: { en: 'days left', es: 'días restantes', pt: 'dias restantes', zh: '天剩余' },
  // Lote 12 — mensagens de confirm/alert do Demo Mode
  confirm_delete_demo_session: { en: 'Delete everything added in this demo session?', es: '¿Eliminar todo lo agregado en esta sesión de demo?', pt: 'Excluir tudo o que foi adicionado nesta sessão de demo?', zh: '删除本次演示会话中添加的所有内容？' },
  confirm_delete_demo_so_far: { en: 'Delete everything you added in this demo so far? This cannot be undone.', es: '¿Eliminar todo lo que agregaste en esta demo hasta ahora? Esto no se puede deshacer.', pt: 'Excluir tudo o que você adicionou nesta demo até agora? Isso não pode ser desfeito.', zh: '删除您到目前为止在此演示中添加的所有内容？此操作无法撤销。' },
  everything_deleted: { en: 'Everything you added has been deleted.', es: 'Todo lo que agregaste ha sido eliminado.', pt: 'Tudo o que você adicionou foi excluído.', zh: '您添加的所有内容均已删除。' },
  // Lote 13 — labels "Viewing/Language/Default/Company" (Default Admin e Seller)
  viewing: { en: 'Viewing:', es: 'Viendo:', pt: 'Visualizando:', zh: '正在查看：' },
  language: { en: 'Language:', es: 'Idioma:', pt: 'Idioma:', zh: '语言：' },
  labels_language: { en: 'Labels Language:', es: 'Idioma de Etiquetas:', pt: 'Idioma dos Rótulos:', zh: '界面标签语言：' },
  edition_label: { en: 'Edition:', es: 'Edición:', pt: 'Edição:', zh: '版本：' },
  industry_sector_label: { en: 'Industry Sector', es: 'Sector Industrial', pt: 'Setor de Atuação', zh: '行业领域' },
  attachment_type_suggestions_title: { en: 'Attachment Type Suggestions (by Edition)', es: 'Sugerencias de Tipo de Anexo (por Edición)', pt: 'Sugestões de Tipo de Anexo (por Edição)', zh: '按版本设置的附件类型建议' },
  doc_type_cv_neutral: { en: '📄 CV only (PDF)', es: '📄 Solo CV (PDF)', pt: '📄 Apenas Currículo (PDF)', zh: '📄 仅限简历（PDF）' },
  no_uploads_option: { en: '🚫 No Uploads', es: '🚫 Sin Subidas', pt: '🚫 Sem Uploads', zh: '🚫 不允许上传' },
  subtitles_empty_explanation: { en: 'No custom subtitles yet for this language — the page is showing the built-in default text below the title instead. Add up to 3 pairs below to replace it.', es: 'Aún no hay subtítulos personalizados para este idioma — la página está mostrando el texto predeterminado debajo del título. Agrega hasta 3 pares abajo para reemplazarlo.', pt: 'Ainda não há subtítulos personalizados para este idioma — a página está mostrando o texto padrão embutido abaixo do título. Adicione até 3 pares abaixo para substituí-lo.', zh: '该语言下还没有自定义副标题——页面目前显示的是标题下方的内置默认文本。可在下方添加最多 3 组来替换它。' },
  doc_type_other_neutral: { en: '📎 Other document types (PPT, XLS, PDF, DOCX)', es: '📎 Otros tipos de documentos (PPT, XLS, PDF, DOCX)', pt: '📎 Outros tipos de documentos (PPT, XLS, PDF, DOCX)', zh: '📎 其他文件类型（PPT、XLS、PDF、DOCX）' },
  use_default_suggestion: { en: 'Use suggestion from Default', es: 'Usar sugerencia de Default', pt: 'Usar sugestão do Default', zh: '使用 Default 的建议' },
  which_edition_item_appears: { en: 'Which edition this item should appear in — blank shows in every edition', es: 'En qué edición debe aparecer este elemento — en blanco se muestra en todas las ediciones', pt: 'Em qual edição este item deve aparecer — em branco aparece em todas as edições', zh: '此项目应显示在哪个版本下——留空则在所有版本中显示' },
  all_editions: { en: 'All editions', es: 'Todas las ediciones', pt: 'Todas as edições', zh: '所有版本' },
  manage_subtitles_title: { en: 'Manage Page Subtitles', es: 'Gestionar Subtítulos de la Página', pt: 'Gerenciar Subtítulos da Página', zh: '管理页面副标题' },
  max_3_subtitles: { en: 'Maximum of 3 subtitle pairs reached for this language.', es: 'Se alcanzó el máximo de 3 pares de subtítulos para este idioma.', pt: 'Máximo de 3 pares de subtítulos atingido para este idioma.', zh: '该语言下的副标题已达到最多 3 组的上限。' },
  subtitle_line1_placeholder: { en: 'First line', es: 'Primera línea', pt: 'Primeira linha', zh: '第一行' },
  subtitle_line2_placeholder: { en: 'Second line (optional)', es: 'Segunda línea (opcional)', pt: 'Segunda linha (opcional)', zh: '第二行（选填）' },
  add_subtitle_btn: { en: 'Add Subtitle', es: 'Agregar Subtítulo', pt: 'Adicionar Subtítulo', zh: '添加副标题' },
  default_suggests: { en: 'Default suggests:', es: 'Default sugiere:', pt: 'Default sugere:', zh: 'Default 建议：' },
  subtitle_if_blank_default: { en: 'If left blank, the following default subtitle will be displayed:', es: 'Si se deja en blanco, se mostrará el siguiente subtítulo predeterminado:', pt: 'Se deixado em branco, o seguinte subtítulo padrão será exibido:', zh: '如果留空，将显示以下默认副标题：' },
  subtitle_overrides_default: { en: 'Your entry overrides the default subtitle:', es: 'Tu entrada reemplaza el subtítulo predeterminado:', pt: 'Sua entrada substitui o subtítulo padrão:', zh: '您的条目将覆盖默认副标题：' },
  subtitle_line1_label: { en: '1st line', es: '1a línea', pt: '1a linha', zh: '第一行' },
  subtitle_line2_label: { en: '2nd line', es: '2a línea', pt: '2a linha', zh: '第二行' },
  session_ended_by_admin: { en: 'Your access has been ended.', es: 'Tu acceso ha finalizado.', pt: 'Seu acesso foi encerrado.', zh: '您的访问已结束。' },
  default_word: { en: 'Default', es: 'Predeterminado', pt: 'Padrão', zh: '默认' },
  company_word: { en: 'Company', es: 'Empresa', pt: 'Empresa', zh: '公司' },
  // Lote 14 — Follow-On, navegação inferior, upload
  delete_experience: { en: 'Delete Experience', es: 'Eliminar Experiencia', pt: 'Excluir Experiência', zh: '删除经验' },
  add_follow_on: { en: '🔗 Add a Follow-On Experience', es: '🔗 Agregar una Experiencia de Continuación', pt: '🔗 Adicionar uma Experiência de Continuação', zh: '🔗 添加续写经验' },
  original_experience: { en: '↑ Original Experience', es: '↑ Experiencia Original', pt: '↑ Experiência Original', zh: '↑ 原始经验' },
  upstream_experience: { en: '↑ Upstream Experience', es: '↑ Experiencia Anterior', pt: '↑ Experiência Anterior', zh: '↑ 上游经验' },
  confirm_delete_click: { en: 'Click to CONFIRM DELETE!', es: 'Haz clic para CONFIRMAR ELIMINACIÓN!', pt: 'Clique para CONFIRMAR EXCLUSÃO!', zh: '点击以确认删除！' },
  browse: { en: 'Browse', es: 'Explorar', pt: 'Explorar', zh: '浏览' },
  top3_short: { en: 'Top3', es: 'Top 3', pt: 'Top 3', zh: '前三' },
  share_your_stories: { en: 'Share your stories', es: 'Comparte tus historias', pt: 'Compartilhe suas histórias', zh: '分享你的故事' },
  max_5mb: { en: 'Max 5MB', es: 'Máx 5MB', pt: 'Máx 5MB', zh: '最大 5MB' },
  file_too_large: { en: 'File too large. Max 5MB', es: 'Archivo demasiado grande. Máx 5MB', pt: 'Arquivo muito grande. Máx 5MB', zh: '文件过大，最大 5MB' },
  upload_cv_optional: { en: 'Upload CV (optional) - PDF only', es: 'Subir CV (opcional) - Solo PDF', pt: 'Enviar Currículo (opcional) - Apenas PDF', zh: '上传简历（选填）- 仅限 PDF' },
  remove: { en: '❌ Remove', es: '❌ Quitar', pt: '❌ Remover', zh: '❌ 移除' },
  edit_tags: { en: 'Edit tags', es: 'Editar etiquetas', pt: 'Editar tags', zh: '编辑标签' },
  add_tags: { en: 'Add tags', es: 'Agregar etiquetas', pt: 'Adicionar tags', zh: '添加标签' },
  // Lote 15 — vídeo, mensagens de erro, tela de carregamento
  previous_word: { en: 'Previous', es: 'Anterior', pt: 'Anterior', zh: '上一个' },
  next_word: { en: 'Next', es: 'Siguiente', pt: 'Próximo', zh: '下一个' },
  something_went_wrong: { en: 'Something went wrong. Please try again.', es: 'Algo salió mal. Por favor, inténtalo de nuevo.', pt: 'Algo deu errado. Por favor, tente novamente.', zh: '出了点问题，请重试。' },
  loading_experiences: { en: 'Loading experiences...', es: 'Cargando experiencias...', pt: 'Carregando experiências...', zh: '正在加载经验……' },
  no_change: { en: 'No Change', es: 'Sin Cambios', pt: 'Sem Mudança', zh: '无变化' },
  got_worse: { en: 'Got Worse', es: 'Empeoró', pt: 'Piorou', zh: '更糟' },
  hide_all_comments: { en: 'Hide all comments', es: 'Ocultar todos los comentarios', pt: 'Ocultar todos os comentários', zh: '隐藏所有评论' },
  // Lote 16 — tela de login e fluxo de 1st Access / Reset Password
  employee_login: { en: 'Employee Login', es: 'Inicio de Sesión de Empleado', pt: 'Login de Funcionário', zh: '员工登录' },
  employee_id: { en: 'Employee ID', es: 'ID de Empleado', pt: 'ID do Funcionário', zh: '员工 ID' },
  enter_your_employee_id: { en: 'Enter your Employee ID', es: 'Ingresa tu ID de Empleado', pt: 'Digite seu ID de Funcionário', zh: '请输入员工 ID' },
  password: { en: 'Password', es: 'Contraseña', pt: 'Senha', zh: '密码' },
  enter_your_password: { en: 'Enter your password', es: 'Ingresa tu contraseña', pt: 'Digite sua senha', zh: '请输入密码' },
  login: { en: 'Login', es: 'Iniciar Sesión', pt: 'Entrar', zh: '登录' },
  back: { en: '← Back', es: '← Atrás', pt: '← Voltar', zh: '← 返回' },
  first_access_reset: { en: '1st Access or Set / Reset Password', es: 'Primer Acceso o Crear / Restablecer Contraseña', pt: '1º Acesso ou Criar / Redefinir Senha', zh: '首次访问或设置/重置密码' },
  password_set: { en: 'Password Set!', es: '¡Contraseña Configurada!', pt: 'Senha Definida!', zh: '密码已设置！' },
  enter_email_employee_id_code: { en: "Enter your email and Employee ID. We'll send a verification code to confirm it's you.", es: 'Ingresa tu correo y tu ID de Empleado. Te enviaremos un código de verificación para confirmar que eres tú.', pt: 'Digite seu e-mail e seu ID de Funcionário. Enviaremos um código de verificação para confirmar que é você.', zh: '请输入您的邮箱和员工 ID。我们将发送验证码以确认身份。' },
  email: { en: 'Email', es: 'Correo Electrónico', pt: 'E-mail', zh: '邮箱' },
  enter_your_email: { en: 'Enter your email', es: 'Ingresa tu correo', pt: 'Digite seu e-mail', zh: '请输入邮箱' },
  send_verification_code: { en: 'Send Verification Code', es: 'Enviar Código de Verificación', pt: 'Enviar Código de Verificação', zh: '发送验证码' },
  found_more_than_one_account: { en: 'We found more than one account with that email and Employee ID. Please select the correct one:', es: 'Encontramos más de una cuenta con ese correo e ID de Empleado. Selecciona la correcta:', pt: 'Encontramos mais de uma conta com esse e-mail e ID de Funcionário. Selecione a correta:', zh: '我们发现使用该邮箱和员工 ID 的账户不止一个，请选择正确的一个：' },
  company_fallback: { en: 'Company', es: 'Empresa', pt: 'Empresa', zh: '公司' },
  we_found_you_at: { en: 'We found you at:', es: 'Te encontramos en:', pt: 'Encontramos você em:', zh: '我们在以下公司找到了您：' },
  unknown_company: { en: 'Unknown Company', es: 'Empresa Desconocida', pt: 'Empresa Desconhecida', zh: '未知公司' },
  is_this_your_company: { en: 'Is this your company?', es: '¿Es esta tu empresa?', pt: 'Esta é a sua empresa?', zh: '这是您的公司吗？' },
  not_me: { en: "No, that's not me", es: 'No, no soy yo', pt: 'Não, não sou eu', zh: '不，这不是我' },
  yes_thats_me: { en: "Yes, that's me", es: 'Sí, soy yo', pt: 'Sim, sou eu', zh: '是的，就是我' },
  contact_hr_if_wrong: { en: "If this doesn't look right, contact your company's HR or Admin instead of continuing.", es: 'Si esto no parece correcto, contacta a RR.HH. o al Admin de tu empresa en lugar de continuar.', pt: 'Se isso não parecer certo, entre em contato com o RH ou Admin da sua empresa em vez de continuar.', zh: '如果这不正确，请联系贵公司的人力资源或管理员，而不要继续操作。' },
  sent_code_to_email: { en: 'We sent a 6-digit code to your email. Enter it below.', es: 'Enviamos un código de 6 dígitos a tu correo. Ingrésalo abajo.', pt: 'Enviamos um código de 6 dígitos para o seu e-mail. Digite-o abaixo.', zh: '我们已向您的邮箱发送了 6 位验证码，请在下方输入。' },
  check_spam_folder: { en: "Don't see it? Check your spam/junk folder too.", es: '¿No lo ves? Revisa también tu carpeta de spam/correo no deseado.', pt: 'Não encontrou? Verifique também sua pasta de spam/lixo eletrônico.', zh: '没看到？也请检查垃圾邮件文件夹。' },
  youre_accessing: { en: "You're accessing", es: 'Estás accediendo a', pt: 'Você está acessando', zh: '您正在访问' },
  verification_code: { en: 'Verification Code', es: 'Código de Verificación', pt: 'Código de Verificação', zh: '验证码' },
  six_digit_code: { en: '6-digit code', es: 'Código de 6 dígitos', pt: 'Código de 6 dígitos', zh: '6 位验证码' },
  verify_code: { en: 'Verify Code', es: 'Verificar Código', pt: 'Verificar Código', zh: '验证代码' },
  new_password: { en: 'New Password', es: 'Nueva Contraseña', pt: 'Nova Senha', zh: '新密码' },
  choose_a_password: { en: 'Choose a password', es: 'Elige una contraseña', pt: 'Escolha uma senha', zh: '设置密码' },
  confirm_password: { en: 'Confirm Password', es: 'Confirmar Contraseña', pt: 'Confirmar Senha', zh: '确认密码' },
  repeat_your_password: { en: 'Repeat your password', es: 'Repite tu contraseña', pt: 'Repita sua senha', zh: '再次输入密码' },
  save_password: { en: 'Save Password', es: 'Guardar Contraseña', pt: 'Salvar Senha', zh: '保存密码' },
  can_now_login: { en: 'You can now login with your Employee ID and new password.', es: 'Ahora puedes iniciar sesión con tu ID de Empleado y tu nueva contraseña.', pt: 'Agora você pode fazer login com seu ID de Funcionário e a nova senha.', zh: '您现在可以使用员工 ID 和新密码登录了。' },
  go_to_login: { en: 'Go to Login', es: 'Ir a Iniciar Sesión', pt: 'Ir para o Login', zh: '前往登录' },
  password_rule_8_chars: { en: 'At least 8 characters', es: 'Al menos 8 caracteres', pt: 'Pelo menos 8 caracteres', zh: '至少 8 个字符' },
  password_rule_uppercase: { en: 'At least one uppercase letter (A-Z)', es: 'Al menos una letra mayúscula (A-Z)', pt: 'Pelo menos uma letra maiúscula (A-Z)', zh: '至少一个大写字母（A-Z）' },
  password_rule_lowercase: { en: 'At least one lowercase letter (a-z)', es: 'Al menos una letra minúscula (a-z)', pt: 'Pelo menos uma letra minúscula (a-z)', zh: '至少一个小写字母（a-z）' },
  password_rule_number: { en: 'At least one number (0-9)', es: 'Al menos un número (0-9)', pt: 'Pelo menos um número (0-9)', zh: '至少一个数字（0-9）' },
  please_enter_email_employee_id: { en: 'Please enter both your email and Employee ID.', es: 'Por favor, ingresa tu correo y tu ID de Empleado.', pt: 'Por favor, digite seu e-mail e seu ID de Funcionário.', zh: '请输入您的邮箱和员工 ID。' },
  no_account_found: { en: 'No account found with that email and Employee ID. Check with your company Admin.', es: 'No se encontró ninguna cuenta con ese correo e ID de Empleado. Consulta con el Admin de tu empresa.', pt: 'Nenhuma conta encontrada com esse e-mail e ID de Funcionário. Verifique com o Admin da sua empresa.', zh: '未找到使用该邮箱和员工 ID 的账户，请联系贵公司管理员确认。' },
  please_enter_id_password: { en: 'Please enter Employee ID and Password', es: 'Por favor, ingresa tu ID de Empleado y Contraseña', pt: 'Por favor, digite o ID de Funcionário e a Senha', zh: '请输入员工 ID 和密码' },
  invalid_id_password: { en: 'Invalid Employee ID or Password', es: 'ID de Empleado o Contraseña inválidos', pt: 'ID de Funcionário ou Senha inválidos', zh: '员工 ID 或密码无效' },
  set_your_new_password: { en: 'Set Your New Password', es: 'Configura Tu Nueva Contraseña', pt: 'Defina Sua Nova Senha', zh: '设置您的新密码' },
  save_new_password: { en: 'Save New Password', es: 'Guardar Nueva Contraseña', pt: 'Salvar Nova Senha', zh: '保存新密码' },
  temp_password_notice: { en: 'You logged in with a temporary password. Please set a permanent one.', es: 'Iniciaste sesión con una contraseña temporal. Por favor, configura una permanente.', pt: 'Você entrou com uma senha temporária. Por favor, defina uma permanente.', zh: '您使用的是临时密码登录。请设置一个永久密码。' },
  at_least_6_chars: { en: 'At least 6 characters', es: 'Al menos 6 caracteres', pt: 'Pelo menos 6 caracteres', zh: '至少 6 个字符' },
  skip_for_now: { en: 'Skip for now', es: 'Omitir por ahora', pt: 'Pular por enquanto', zh: '暂时跳过' },
  please_enter_new_password: { en: 'Please enter a new password', es: 'Por favor, ingresa una nueva contraseña', pt: 'Por favor, digite uma nova senha', zh: '请输入新密码' },
  password_min_6_chars: { en: 'Password must be at least 6 characters', es: 'La contraseña debe tener al menos 6 caracteres', pt: 'A senha deve ter pelo menos 6 caracteres', zh: '密码至少需要 6 个字符' },
  passwords_do_not_match: { en: 'Passwords do not match', es: 'Las contraseñas no coinciden', pt: 'As senhas não coincidem', zh: '两次密码不一致' },
  password_updated_success: { en: 'Password updated successfully!', es: '¡Contraseña actualizada con éxito!', pt: 'Senha atualizada com sucesso!', zh: '密码更新成功！' },
  // Lote 17 — CV Preview
  cv_preview: { en: 'CV Preview', es: 'Vista Previa del CV', pt: 'Pré-visualização do Currículo', zh: '简历预览' },
  download_pdf: { en: '⬇️ Download PDF', es: '⬇️ Descargar PDF', pt: '⬇️ Baixar PDF', zh: '⬇️ 下载 PDF' },
  category_guide: { en: 'Category Guide', es: 'Guía de Categorías', pt: 'Guia de Categorias', zh: '分类指南' },
  search_placeholder: { en: 'Search...', es: 'Buscar...', pt: 'Buscar...', zh: '搜索……' },
  previous_videos: { en: 'Previous videos', es: 'Videos anteriores', pt: 'Vídeos anteriores', zh: '上一批视频' },
  next_videos: { en: 'Next videos', es: 'Videos siguientes', pt: 'Próximos vídeos', zh: '下一批视频' },
  close_video: { en: 'Close video', es: 'Cerrar video', pt: 'Fechar vídeo', zh: '关闭视频' },
  // Lote 18 — varredura final: Logout, Hide, hero, uploads, buscas, rodapé
  logout: { en: 'Logout', es: 'Cerrar Sesión', pt: 'Sair', zh: '退出登录' },
  hide: { en: '✕ Hide', es: '✕ Ocultar', pt: '✕ Ocultar', zh: '✕ 隐藏' },
  check_all_experiences_shared: { en: 'Check all experiences shared', es: 'Ver todas las experiencias compartidas', pt: 'Ver todas as experiências compartilhadas', zh: '查看所有已分享的经验' },
  experiences_shared: { en: 'experiences shared', es: 'experiencias compartidas', pt: 'experiências compartilhadas', zh: '条经验已分享' },
  matching_common_case: { en: '🎯 Matching Common Case →', es: '🎯 Caso Común Coincidente →', pt: '🎯 Caso Comum Correspondente →', zh: '🎯 匹配的共性案例 →' },
  add_matching_common_case_btn: { en: '+ Matching Common Case (Optional)', es: '+ Caso Común Coincidente (Opcional)', pt: '+ Caso Comum Correspondente (Opcional)', zh: '+ 匹配的共性案例（可选）' },
  link_common_case_modal_title: { en: 'Select a Matching Common Case', es: 'Selecciona un Caso Común Coincidente', pt: 'Selecione um Caso Comum Correspondente', zh: '选择一个匹配的共性案例' },
  confirm_link_btn: { en: 'Confirm', es: 'Confirmar', pt: 'Confirmar', zh: '确认' },
  confirm_change_common_case_link: { en: 'This will replace the current Common Case link. Continue?', es: 'Esto reemplazará el enlace actual del Caso Común. ¿Continuar?', pt: 'Isso vai substituir o link de Common Case atual. Continuar?', zh: '这将替换当前的共性案例关联。是否继续？' },
  share_your_thoughts: { en: 'Share your thoughts...', es: 'Comparte tus pensamientos...', pt: 'Compartilhe sua opinião...', zh: '分享你的想法……' },
  copyright_notice: { en: '© 2026 WhatIDid - All rights reserved', es: '© 2026 WhatIDid - Todos los derechos reservados', pt: '© 2026 WhatIDid - Todos os direitos reservados', zh: '© 2026 WhatIDid - 保留所有权利' },
  upload_file_optional: { en: 'Upload File (optional) - PPT, XLS, PDF, DOCX', es: 'Subir Archivo (opcional) - PPT, XLS, PDF, DOCX', pt: 'Enviar Arquivo (opcional) - PPT, XLS, PDF, DOCX', zh: '上传文件（选填）- PPT、XLS、PDF、DOCX' },
  select_function_practice: { en: 'Select Function / Practice', es: 'Selecciona Función / Práctica', pt: 'Selecione a Função / Prática', zh: '选择职能/领域' },
  hero_tagline_public: { en: 'Real problems. Real actions. Real results.', es: 'Problemas reales. Acciones reales. Resultados reales.', pt: 'Problemas reais. Ações reais. Resultados reais.', zh: '真实问题。真实行动。真实结果。' },
  share_work_experiences: { en: 'Share your work experiences.', es: 'Comparte tus experiencias laborales.', pt: 'Compartilhe suas experiências de trabalho.', zh: '分享你的工作经验。' },
  accelerate_org_learning: { en: 'Accelerate organizational learning.', es: 'Acelera el aprendizaje organizacional.', pt: 'Acelere o aprendizado organizacional.', zh: '加速组织学习。' },
  subtitle_line2_pro: { en: 'Share your professional experiences. Be found by companies looking for them.', es: 'Comparte tus experiencias profesionales. Sé encontrado por las empresas que las buscan.', pt: 'Compartilhe suas experiências profissionais. Seja encontrado por empresas que as procuram.', zh: '分享您的职业经历，让正在寻找人才的企业发现您。' },
  subtitle_line2_edu: { en: 'Explore real-world cases. Share your views and related experiences.', es: 'Explora casos del mundo real. Comparte tus puntos de vista y experiencias relacionadas.', pt: 'Explore casos do mundo real. Compartilhe suas opiniões e experiências relacionadas.', zh: '探索真实案例，分享您的观点和相关经历。' },
  curator: { en: 'Curator', es: 'Curador', pt: 'Curador', zh: '策展人' },
  back_to_where_you_were: { en: 'Back to where you were', es: 'Volver a donde estabas', pt: 'Voltar para onde você estava', zh: '返回之前的位置' },
  hide_top3: { en: 'Hide Top 3', es: 'Ocultar Top 3', pt: 'Ocultar Top 3', zh: '隐藏前三名' },
  show_top3: { en: 'Show Top 3', es: 'Mostrar Top 3', pt: 'Mostrar Top 3', zh: '显示前三名' },
  file_badge: { en: '📎 File', es: '📎 Archivo', pt: '📎 Arquivo', zh: '📎 文件' },
  portal_link: { en: 'Portal →', es: 'Portal →', pt: 'Portal →', zh: '门户 →' },
  whatidid_sellers: { en: 'WhatIDid.app Sellers', es: 'WhatIDid.app Sellers', pt: 'WhatIDid.app Sellers', zh: 'WhatIDid.app Sellers' },
  no_problem_blocked: { en: "No problem — for your security, this account has been blocked until your Admin reviews it. Please contact your company's HR or Admin", es: 'No hay problema — por tu seguridad, esta cuenta ha sido bloqueada hasta que tu Admin la revise. Por favor contacta a RR.HH. o al Admin de tu empresa', pt: 'Sem problema — por segurança, esta conta foi bloqueada até que seu Admin a revise. Por favor, entre em contato com o RH ou Admin da sua empresa', zh: '没问题——出于安全考虑，此账户已被暂时锁定，等待管理员审核。请联系贵公司的人力资源或管理员' },
  account_blocked_security: { en: "This account has been blocked for security reasons. Please contact your company's HR or Admin", es: 'Esta cuenta ha sido bloqueada por razones de seguridad. Por favor contacta a RR.HH. o al Admin de tu empresa', pt: 'Esta conta foi bloqueada por motivos de segurança. Por favor, entre em contato com o RH ou Admin da sua empresa', zh: '出于安全原因，此账户已被锁定，请联系贵公司的人力资源或管理员' },
  no_email_registered: { en: 'No email registered for this account. Please contact your Admin.', es: 'No hay correo registrado para esta cuenta. Por favor, contacta a tu Admin.', pt: 'Nenhum e-mail registrado para esta conta. Por favor, entre em contato com seu Admin.', zh: '该账户未注册邮箱，请联系您的管理员。' },
  error_sending_verification: { en: 'Error sending verification email. Please try again.', es: 'Error al enviar el correo de verificación. Por favor, inténtalo de nuevo.', pt: 'Erro ao enviar o e-mail de verificação. Por favor, tente novamente.', zh: '发送验证邮件出错，请重试。' },
  incorrect_code: { en: 'Incorrect code. Please check your email and try again.', es: 'Código incorrecto. Por favor, revisa tu correo e inténtalo de nuevo.', pt: 'Código incorreto. Por favor, verifique seu e-mail e tente novamente.', zh: '验证码不正确，请检查邮箱后重试。' },
  password_requirements_not_met: { en: 'Password does not meet all requirements below.', es: 'La contraseña no cumple con todos los requisitos abajo.', pt: 'A senha não atende a todos os requisitos abaixo.', zh: '密码不满足以下所有要求。' },
  error_saving_password: { en: 'Error saving your password. Please try again.', es: 'Error al guardar tu contraseña. Por favor, inténtalo de nuevo.', pt: 'Erro ao salvar sua senha. Por favor, tente novamente.', zh: '保存密码出错，请重试。' },
  demo_account_inactive: { en: 'This demo account is not currently active. Please contact your Admin.', es: 'Esta cuenta demo no está activa actualmente. Por favor, contacta a tu Admin.', pt: 'Esta conta demo não está ativa no momento. Por favor, entre em contato com seu Admin.', zh: '该演示账户目前未激活，请联系您的管理员。' },
  login_failed: { en: 'Login failed. Please try again.', es: 'Error al iniciar sesión. Por favor, inténtalo de nuevo.', pt: 'Falha no login. Por favor, tente novamente.', zh: '登录失败，请重试。' },
  error_updating_password: { en: 'Error updating password. Please try again.', es: 'Error al actualizar la contraseña. Por favor, inténtalo de nuevo.', pt: 'Erro ao atualizar a senha. Por favor, tente novamente.', zh: '更新密码出错，请重试。' },
  // Lote ADM Default — grande
  add_company_btn: { en: '+ Add Company', es: '+ Agregar Empresa', pt: '+ Adicionar Empresa', zh: '+ 添加公司' },
  company_logo_optional: { en: 'Logo (optional)', es: 'Logo (opcional)', pt: 'Logo (opcional)', zh: '徽标（可选）' },
  add_seller_btn: { en: '+ Add Seller', es: '+ Agregar Vendedor', pt: '+ Adicionar Vendedor', zh: '+ 添加销售代表' },
  creating_ellipsis: { en: 'Creating...', es: 'Creando...', pt: 'Criando...', zh: '创建中……' },
  add_employee_btn: { en: '+ Add Employee', es: '+ Agregar Empleado', pt: '+ Adicionar Funcionário', zh: '+ 添加员工' },
  create_group_btn: { en: '+ Create Group', es: '+ Crear Grupo', pt: '+ Criar Grupo', zh: '+ 创建分组' },
  add_new_id_btn: { en: '+ Add New ID', es: '+ Agregar Nuevo ID', pt: '+ Adicionar Novo ID', zh: '+ 添加新 ID' },
  new_practice_btn: { en: '+ New Practice', es: '+ Nueva Práctica', pt: '+ Nova Prática', zh: '+ 新领域' },
  add_video_btn: { en: 'Add Video', es: 'Agregar Video', pt: 'Adicionar Vídeo', zh: '添加视频' },
  add_quote_btn: { en: 'Add Quote', es: 'Agregar Cita', pt: 'Adicionar Citação', zh: '添加语录' },
  registered_companies_title: { en: 'Registered Companies', es: 'Empresas Registradas', pt: 'Empresas Registradas', zh: '已注册公司' },
  registered_sellers_title: { en: 'Registered Sellers', es: 'Vendedores Registrados', pt: 'Vendedores Registrados', zh: '已注册销售代表' },
  active_groups_title: { en: 'Active Groups', es: 'Grupos Activos', pt: 'Grupos Ativos', zh: '活跃分组' },
  promotional_videos_title: { en: 'Promotional Videos', es: 'Videos Promocionales', pt: 'Vídeos Promocionais', zh: '宣传视频' },
  existing_quotes_title: { en: 'Existing Quotes', es: 'Citas Existentes', pt: 'Citações Existentes', zh: '现有语录' },
  circle_marks_context: { en: 'The ⚪ marks which company "Company" in the context dropdown points to.', es: 'El ⚪ marca a qué empresa apunta "Company" en el menú de contexto.', pt: 'O ⚪ indica para qual empresa a opção "Company" no menu de contexto está apontando.', zh: '⚪ 标记表示上下文下拉菜单中的"Company"当前指向哪家公司。' },
  since_label: { en: 'Since:', es: 'Desde:', pt: 'Desde:', zh: '自：' },
  not_used: { en: 'Not Used', es: 'No Usado', pt: 'Não Usado', zh: '未使用' },
  expired_ids_autoclear: { en: '"Expired" IDs auto-clear the next time anyone loads the app.', es: 'Los IDs "Expirados" se limpian automáticamente la próxima vez que alguien cargue la app.', pt: 'IDs "Expirados" são limpos automaticamente na próxima vez que alguém carregar o app.', zh: '"已过期"的 ID 会在下次有人打开应用时自动清除。' },
  app_configuration_title: { en: '⚙️ Experience Configuration', es: '⚙️ Configuración de la Experiencia', pt: '⚙️ Configuração da Experiência', zh: '⚙️ 体验配置' },
  edition_name: { en: 'Edition Name', es: 'Nombre de Edición', pt: 'Nome da Edição', zh: '版本名称' },
  company_branding_title: { en: '🏢 Company Branding', es: '🏢 Identidad de la Empresa', pt: '🏢 Identidade da Empresa', zh: '🏢 公司品牌形象' },
  manage_company_branding_title: { en: '🏢 Manage Company Branding', es: '🏢 Gestionar Identidad de la Empresa', pt: '🏢 Gerenciar Identidade da Empresa', zh: '🏢 管理公司品牌形象' },
  displayed_below_header: { en: 'Displayed below "WhatIDid Corp" in the header', es: 'Se muestra debajo de "WhatIDid Corp" en el encabezado', pt: 'Exibido abaixo de "WhatIDid Corp" no cabeçalho', zh: '显示在页眉"WhatIDid Corp"下方' },
  size_small: { en: 'small', es: 'pequeño', pt: 'pequeno', zh: '小' },
  size_medium: { en: 'medium', es: 'mediano', pt: 'médio', zh: '中' },
  size_large: { en: 'large', es: 'grande', pt: 'grande', zh: '大' },
  logo_position_hint: { en: 'Top-right on desktop, below header on mobile (PNG, JPG, SVG — max 2MB)', es: 'Arriba a la derecha en escritorio, debajo del encabezado en móvil (PNG, JPG, SVG — máx 2MB)', pt: 'Canto superior direito no desktop, abaixo do cabeçalho no mobile (PNG, JPG, SVG — máx 2MB)', zh: '桌面端显示在右上角，移动端显示在页眉下方（PNG、JPG、SVG — 最大 2MB）' },
  remove_x: { en: '✕ Remove', es: '✕ Quitar', pt: '✕ Remover', zh: '✕ 移除' },
  upload_logo_btn: { en: '📷 Upload Logo', es: '📷 Subir Logo', pt: '📷 Enviar Logotipo', zh: '📷 上传徽标' },
  logo_recommendation: { en: '💡 Recommended: PNG or SVG with transparent background, min 200px wide.', es: '💡 Recomendado: PNG o SVG con fondo transparente, mín 200px de ancho.', pt: '💡 Recomendado: PNG ou SVG com fundo transparente, mín. 200px de largura.', zh: '💡 建议使用透明背景的 PNG 或 SVG 图片，宽度至少 200 像素。' },
  manage_inspirational_quotes: { en: 'Manage Inspirational Quotes', es: 'Gestionar Citas Inspiradoras', pt: 'Gerenciar Citações Inspiradoras', zh: '管理励志语录' },
  author_optional_top: { en: 'Author (optional for Top)', es: 'Autor (opcional para Top)', pt: 'Autor (opcional para Top)', zh: '作者（Top 位置选填）' },
  video_mp4_webm: { en: '🎬 Video (MP4, WebM)', es: '🎬 Video (MP4, WebM)', pt: '🎬 Vídeo (MP4, WebM)', zh: '🎬 视频（MP4、WebM）' },
  presentation_pdf: { en: '📊 Presentation (PDF)', es: '📊 Presentación (PDF)', pt: '📊 Apresentação (PDF)', zh: '📊 演示文稿（PDF）' },
  link_url_option: { en: '🔗 Link (URL)', es: '🔗 Enlace (URL)', pt: '🔗 Link (URL)', zh: '🔗 链接（URL）' },
  video_file_label: { en: 'Video File', es: 'Archivo de Video', pt: 'Arquivo de Vídeo', zh: '视频文件' },
  supported_mp4_webm: { en: 'Supported: MP4, WebM', es: 'Compatible: MP4, WebM', pt: 'Suportado: MP4, WebM', zh: '支持格式：MP4、WebM' },
  carousel_language_hint: { en: 'Only shows in the carousel when this language is being viewed. Leave as "All languages" to show always.', es: 'Solo se muestra en el carrusel cuando se está viendo este idioma. Deja "Todos los idiomas" para mostrarlo siempre.', pt: 'Só aparece no carrossel quando este idioma está sendo visualizado. Deixe "Todos os idiomas" para mostrar sempre.', zh: '仅在浏览该语言时显示于轮播中。保留"所有语言"则始终显示。' },
  duration_example: { en: 'Duration (e.g., 1:30)', es: 'Duración (ej. 1:30)', pt: 'Duração (ex: 1:30)', zh: '时长（例如 1:30）' },
  community_guidelines_default: { en: 'Community Guidelines - Be respectful, honest, and constructive....', es: 'Normas de la Comunidad - Sé respetuoso, honesto y constructivo....', pt: 'Diretrizes da Comunidade - Seja respeitoso, honesto e construtivo....', zh: '社区规范 - 请保持尊重、诚实和建设性……' },
  edit_content_btn: { en: 'Edit Content', es: 'Editar Contenido', pt: 'Editar Conteúdo', zh: '编辑内容' },
  how_it_works_default: { en: 'Share your experience, help others, and learn from the community....', es: 'Comparte tu experiencia, ayuda a otros y aprende de la comunidad....', pt: 'Compartilhe sua experiência, ajude os outros e aprenda com a comunidade....', zh: '分享你的经验，帮助他人，并向社区学习……' },
  about_default: { en: 'WhatIDid Business & Professional - A platform for sharing business experiences....', es: 'WhatIDid Business & Professional - Una plataforma para compartir experiencias empresariales....', pt: 'WhatIDid Business & Professional - Uma plataforma para compartilhar experiências profissionais....', zh: 'WhatIDid Business & Professional - 一个分享职场经验的平台……' },
  is_admin_hint: { en: 'Is Admin (this person can also access the Admin panel)', es: 'Es Admin (esta persona también puede acceder al panel de Admin)', pt: 'É Admin (esta pessoa também pode acessar o painel de Admin)', zh: '是管理员（此人也可以访问管理员面板）' },
  import_excel_btn: { en: '📊 Import Excel', es: '📊 Importar Excel', pt: '📊 Importar Excel', zh: '📊 导入 Excel' },
  export_excel_btn: { en: '📤 Export Excel', es: '📤 Exportar Excel', pt: '📤 Exportar Excel', zh: '📤 导出 Excel' },
  search_employees_title: { en: 'Search Employees', es: 'Buscar Empleados', pt: 'Buscar Funcionários', zh: '搜索员工' },
  manage_problem_categories: { en: '🗂️ Manage Problem Categories', es: '🗂️ Gestionar Categorías de Problemas', pt: '🗂️ Gerenciar Categorias de Problemas', zh: '🗂️ 管理问题分类' },
  import_excel_btn2: { en: '📥 Import Excel', es: '📥 Importar Excel', pt: '📥 Importar Excel', zh: '📥 导入 Excel' },
  assign_ratings_title: { en: '⭐ Assign Ratings to Experiences', es: '⭐ Asignar Calificaciones a Experiencias', pt: '⭐ Atribuir Avaliações às Experiências', zh: '⭐ 为经验分配评分' },
  select_target_step: { en: '1. Select Target:', es: '1. Selecciona el Objetivo:', pt: '1. Selecione o Alvo:', zh: '1. 选择目标：' },
  apply_to_step: { en: '2. Apply To:', es: '2. Aplicar A:', pt: '2. Aplicar A:', zh: '2. 应用范围：' },
  all_experiences_reset_warning: { en: 'ALL experiences (will RESET all ratings to 0 first, then assign new ones!)', es: 'TODAS las experiencias (¡primero RESETEARÁ todas las calificaciones a 0, luego asignará nuevas!)', pt: 'TODAS as experiências (vai RESETAR todas as avaliações para 0 primeiro, depois atribuir novas!)', zh: '所有经验（将先把所有评分重置为 0，然后重新分配！）' },
  percentage_step: { en: '3. Percentage of Target to Receive Ratings:', es: '3. Porcentaje del Objetivo que Recibirá Calificaciones:', pt: '3. Porcentagem do Alvo que Receberá Avaliações:', zh: '3. 目标中获得评分的百分比：' },
  ratings_range_step: { en: '4. Number of Ratings per Experience (Range):', es: '4. Número de Calificaciones por Experiencia (Rango):', pt: '4. Número de Avaliações por Experiência (Intervalo):', zh: '4. 每条经验的评分数量（范围）：' },
  stars_distribution_step: { en: '5. Stars Distribution (Default):', es: '5. Distribución de Estrellas (Predeterminado):', pt: '5. Distribuição de Estrelas (Padrão):', zh: '5. 星级分布（默认）：' },
  execute_assign_ratings: { en: '⭐ Execute: Assign Ratings', es: '⭐ Ejecutar: Asignar Calificaciones', pt: '⭐ Executar: Atribuir Avaliações', zh: '⭐ 执行：分配评分' },
  pdf_file_label: { en: 'PDF File', es: 'Archivo PDF', pt: 'Arquivo PDF', zh: 'PDF 文件' },
  supported_pdf: { en: 'Supported: PDF', es: 'Compatible: PDF', pt: 'Suportado: PDF', zh: '支持格式：PDF' },
  optional_for_top: { en: '(optional for Top)', es: '(opcional para Top)', pt: '(opcional para Top)', zh: '（Top 位置选填）' },
  up_arrow: { en: '↑ Up', es: '↑ Subir', pt: '↑ Subir', zh: '↑ 上移' },
  down_arrow: { en: '↓ Down', es: '↓ Bajar', pt: '↓ Descer', zh: '↓ 下移' },
  delete_trash: { en: '🗑️ Delete', es: '🗑️ Eliminar', pt: '🗑️ Excluir', zh: '🗑️ 删除' },
  promotional_videos_count_title: { en: 'Promotional Videos', es: 'Videos Promocionales', pt: 'Vídeos Promocionais', zh: '宣传视频' },
  community_guidelines_nav: { en: 'Community Guidelines', es: 'Normas de la Comunidad', pt: 'Diretrizes da Comunidade', zh: '社区规范' },
  how_it_works_nav: { en: 'How It Works', es: 'Cómo Funciona', pt: 'Como Funciona', zh: '使用说明' },
  about_nav: { en: 'About', es: 'Acerca de', pt: 'Sobre', zh: '关于' },
  not_set_up_yet: { en: 'Not set up yet — write your own above, or import from Default in Section Settings.', es: 'Aún no configurado — escribe el tuyo arriba, o impórtalo desde Default en Configuración de Secciones.', pt: 'Ainda não configurado — escreva o seu acima, ou importe do Default em Configurações de Seção.', zh: '尚未设置——请在上方撰写内容，或在版块设置中从 Default 导入。' },
  logout_adm: { en: 'Logout ADM', es: 'Salir del ADM', pt: 'Sair do ADM', zh: '退出 ADM' },
  delete_group_btn: { en: '🗑️ Delete Group', es: '🗑️ Eliminar Grupo', pt: '🗑️ Excluir Grupo', zh: '🗑️ 删除分组' },
  del_short: { en: '🗑️ Del', es: '🗑️ Elim.', pt: '🗑️ Exc.', zh: '🗑️ 删除' },
  by_short: { en: 'By:', es: 'Por:', pt: 'Por:', zh: '发布者：' },
  used_word: { en: 'Used', es: 'Usado', pt: 'Usado', zh: '已使用' },
  add_btn_generic: { en: 'Add', es: 'Agregar', pt: 'Adicionar', zh: '添加' },
  admin_badge: { en: '🛡️ Admin', es: '🛡️ Admin', pt: '🛡️ Admin', zh: '🛡️ 管理员' },
  seller_badge: { en: '🧑‍💼 Seller', es: '🧑‍💼 Vendedor', pt: '🧑‍💼 Vendedor', zh: '🧑‍💼 销售代表' },
  editing_in_language: { en: 'Editing in:', es: 'Editando en:', pt: 'Editando em:', zh: '正在编辑语言：' },
  excel_columns_employee_full: { en: 'Excel columns: Employee ID, Name, Country, Email', es: 'Columnas de Excel: ID de Empleado, Nombre, País, Correo', pt: 'Colunas do Excel: ID do Funcionário, Nome, País, E-mail', zh: 'Excel 列：员工 ID、姓名、国家、邮箱' },
  excel_columns_practice_full: { en: 'Excel columns: Practice, Category, Description, Tags', es: 'Columnas de Excel: Práctica, Categoría, Descripción, Etiquetas', pt: 'Colunas do Excel: Prática, Categoria, Descrição, Tags', zh: 'Excel 列：职能/领域、分类、描述、标签' },
  max_2_ids_per_group: { en: 'Maximum of 2 IDs per group reached.', es: 'Se alcanzó el máximo de 2 IDs por grupo.', pt: 'Máximo de 2 IDs por grupo atingido.', zh: '每个分组最多 2 个 ID，已达上限。' },
  status_active_badge: { en: '✓ Active', es: '✓ Activo', pt: '✓ Ativo', zh: '✓ 已激活' },
  status_blocked_badge: { en: '🚫 Blocked', es: '🚫 Bloqueado', pt: '🚫 Bloqueado', zh: '🚫 已封禁' },
  status_pending_badge: { en: '⏳ Pending', es: '⏳ Pendiente', pt: '⏳ Pendente', zh: '⏳ 待处理' },
  members_count_label: { en: 'Members', es: 'Miembros', pt: 'Membros', zh: '成员' },
  expired_word: { en: 'Expired', es: 'Expirado', pt: 'Expirado', zh: '已过期' },
  active_word: { en: 'Active', es: 'Activo', pt: 'Ativo', zh: '活跃' },
  exp_label: { en: 'Exp:', es: 'Exp:', pt: 'Exp:', zh: '到期：' },
  d_left_suffix: { en: 'd left', es: 'd restantes', pt: 'd restantes', zh: '天剩余' },
  error_deleting_group: { en: 'Error deleting group:', es: 'Error al eliminar el grupo:', pt: 'Erro ao excluir o grupo:', zh: '删除分组时出错：' },
  seller_status_active: { en: 'Active', es: 'Activo', pt: 'Ativo', zh: '活跃' },
  seller_status_blocked: { en: 'Blocked', es: 'Bloqueado', pt: 'Bloqueado', zh: '已封禁' },
  seller_status_pending: { en: 'Pending', es: 'Pendiente', pt: 'Pendente', zh: '待处理' },
  // Lote final — Manage Companies/Sellers/Demo Groups/Quotes/Videos/Employees boxes
  company_name_star: { en: 'Company Name *', es: 'Nombre de la Empresa *', pt: 'Nome da Empresa *', zh: '公司名称 *' },
  company_code_hint: { en: 'Company Code (optional, auto-generated if blank)', es: 'Código de la Empresa (opcional, se genera automáticamente si se deja en blanco)', pt: 'Código da Empresa (opcional, gerado automaticamente se em branco)', zh: '公司代码（选填，留空则自动生成）' },
  unknown_seller: { en: 'Unknown seller', es: 'Vendedor desconocido', pt: 'Vendedor desconhecido', zh: '未知销售代表' },
  default_admin_label: { en: 'Default Admin', es: 'Admin del Default', pt: 'Admin do Default', zh: 'Default 管理员' },
  set_as_context_company: { en: "Set as the 'Company' the context dropdown points to", es: "Marcar como la 'Company' a la que apunta el menú de contexto", pt: "Definir como a 'Company' para a qual o menu de contexto aponta", zh: "设为上下文下拉菜单指向的'Company'" },
  name_star: { en: 'Name *', es: 'Nombre *', pt: 'Nome *', zh: '姓名 *' },
  seller_id_star: { en: 'Seller ID *', es: 'ID de Vendedor *', pt: 'ID do Vendedor *', zh: '销售代表 ID *' },
  email_star: { en: 'Email *', es: 'Correo *', pt: 'E-mail *', zh: '邮箱 *' },
  pros_count_label: { en: '#Pros:', es: '#Pros:', pt: '#Pros:', zh: '#潜在:' },
  plt_count_label: { en: '#Plt:', es: '#Plt:', pt: '#Plt:', zh: '#试点:' },
  cust_count_label: { en: '#Cust:', es: '#Cli:', pt: '#Cli:', zh: '#客户:' },
  please_select_company: { en: 'Please select a company', es: 'Por favor, selecciona una empresa', pt: 'Por favor, selecione uma empresa', zh: '请选择一家公司' },
  company_not_found: { en: 'Company not found', es: 'Empresa no encontrada', pt: 'Empresa não encontrada', zh: '未找到该公司' },
  error_creating_group: { en: 'Error creating group:', es: 'Error al crear el grupo:', pt: 'Erro ao criar o grupo:', zh: '创建分组时出错：' },
  read_only_sample: { en: '(read-only — Sample)', es: '(solo lectura — Muestra)', pt: '(somente leitura — Amostra)', zh: '（只读 — 示例）' },
  url_label: { en: 'URL', es: 'URL', pt: 'URL', zh: 'URL' },
  all_languages: { en: '🌐 All languages', es: '🌐 Todos los idiomas', pt: '🌐 Todos os idiomas', zh: '🌐 所有语言' },
  uploading_ellipsis: { en: 'Uploading...', es: 'Subiendo...', pt: 'Enviando...', zh: '上传中……' },
  file_label_colon: { en: 'File:', es: 'Archivo:', pt: 'Arquivo:', zh: '文件：' },
  show_in_carousel: { en: '👁️ Show in carousel', es: '👁️ Mostrar en el carrusel', pt: '👁️ Mostrar no carrossel', zh: '👁️ 在轮播中显示' },
  hide_from_carousel: { en: '🙈 Hide from carousel', es: '🙈 Ocultar del carrusel', pt: '🙈 Ocultar do carrossel', zh: '🙈 从轮播中隐藏' },
  which_language_item_appears: { en: 'Which language this item should appear in — blank shows in every language', es: 'En qué idioma debe aparecer este elemento — en blanco se muestra en todos los idiomas', pt: 'Em qual idioma este item deve aparecer — em branco aparece em todos os idiomas', zh: '此项目应显示在哪种语言下——留空则在所有语言中显示' },
  error_exporting: { en: 'Error exporting:', es: 'Error al exportar:', pt: 'Erro ao exportar:', zh: '导出时出错：' },
  error_adding_category: { en: 'Error adding category', es: 'Error al agregar la categoría', pt: 'Erro ao adicionar a categoria', zh: '添加分类时出错' },
  new_practice_name_prompt: { en: 'New Practice name:', es: 'Nombre de la nueva Práctica:', pt: 'Nome da nova Prática:', zh: '新领域名称：' },
  new_practice_name_label: { en: 'Practice name', es: 'Nombre de la Práctica', pt: 'Nome da Prática', zh: '领域名称' },
  applicable_editions_label: { en: 'Applicable Editions', es: 'Ediciones Aplicables', pt: 'Edições Aplicáveis', zh: '适用版本' },
  create_practice_btn: { en: 'Create', es: 'Crear', pt: 'Criar', zh: '创建' },
  select_at_least_one_edition: { en: 'Select at least one edition', es: 'Selecciona al menos una edición', pt: 'Selecione ao menos uma edição', zh: '请至少选择一个版本' },
  error_updating_practice: { en: 'Error updating practice:', es: 'Error al actualizar la práctica:', pt: 'Erro ao atualizar a prática:', zh: '更新领域时出错：' },
  error_creating_practice: { en: 'Error creating practice:', es: 'Error al crear la práctica:', pt: 'Erro ao criar a prática:', zh: '创建领域时出错：' },
  admin_settings_title: { en: 'Admin Settings', es: 'Configuración de Admin', pt: 'Configurações de Admin', zh: '管理员设置' },
  live_preview_title: { en: 'Live Preview', es: 'Vista Previa en Vivo', pt: 'Pré-visualização ao Vivo', zh: '实时预览' },
  name_placeholder: { en: 'Name', es: 'Nombre', pt: 'Nome', zh: '姓名' },
  admin_label_short: { en: 'Admin', es: 'Admin', pt: 'Admin', zh: '管理员' },
  employee_id_star: { en: 'Employee ID *', es: 'ID de Empleado *', pt: 'ID do Funcionário *', zh: '员工 ID *' },

  // Variantes "_member" — usadas automaticamente pelo t() quando a empresa
  // em contexto for Edu ou Pro (ver companyEdition). Mesma chave base,
  // terminologia Employee→Member.
  manage_employees_member: { en: 'Manage Members', es: 'Gestionar Miembros', pt: 'Gerenciar Membros', zh: '管理成员' },
  add_employee_member: { en: 'Add Member', es: 'Agregar Miembro', pt: 'Adicionar Membro', zh: '添加成员' },
  employee_id_name_required_member: { en: 'Member ID and Name are required', es: 'El ID de Miembro y el Nombre son obligatorios', pt: 'ID de Membro e Nome são obrigatórios', zh: '成员 ID 和姓名为必填项' },
  error_adding_employee_member: { en: 'Error adding member. ID may already exist.', es: 'Error al agregar el miembro. El ID puede que ya exista.', pt: 'Erro ao adicionar o membro. O ID pode já existir.', zh: '添加成员出错，该 ID 可能已存在。' },
  error_updating_employee_member: { en: 'Error updating member', es: 'Error al actualizar el miembro', pt: 'Erro ao atualizar o membro', zh: '更新成员时出错' },
  error_deleting_employee_member: { en: 'Error deleting member', es: 'Error al eliminar el miembro', pt: 'Erro ao excluir o membro', zh: '删除成员时出错' },
  error_reading_excel_member: { en: 'Error reading Excel file. Make sure columns are: Member ID, Name, Country, Email', es: 'Error al leer el archivo Excel. Asegúrate de que las columnas sean: Member ID, Name, Country, Email', pt: 'Erro ao ler o arquivo Excel. Verifique se as colunas são: Member ID, Name, Country, Email', zh: '读取 Excel 文件出错，请确认列名为：Member ID、Name、Country、Email' },
  require_employee_id_member: { en: 'Require Member ID for access', es: 'Requerir ID de Miembro para acceder', pt: 'Exigir ID de Membro para acesso', zh: '需要成员 ID 才能访问' },
  no_employees_yet_member: { en: 'No members yet.', es: 'Aún no hay miembros.', pt: 'Ainda não há membros.', zh: '暂无成员。' },
  employee_login_member: { en: 'Member Login', es: 'Inicio de Sesión de Miembro', pt: 'Login de Membro', zh: '成员登录' },
  employee_id_member: { en: 'Member ID', es: 'ID de Miembro', pt: 'ID do Membro', zh: '成员 ID' },
  enter_your_employee_id_member: { en: 'Enter your Member ID', es: 'Ingresa tu ID de Miembro', pt: 'Digite seu ID de Membro', zh: '请输入成员 ID' },
  found_more_than_one_account_member: { en: 'We found more than one account with that email and Member ID. Please select the correct one:', es: 'Encontramos más de una cuenta con ese correo e ID de Miembro. Selecciona la correcta:', pt: 'Encontramos mais de uma conta com esse e-mail e ID de Membro. Selecione a correta:', zh: '我们发现使用该邮箱和成员 ID 的账户不止一个，请选择正确的一个：' },
  can_now_login_member: { en: 'You can now login with your Member ID and new password.', es: 'Ahora puedes iniciar sesión con tu ID de Miembro y tu nueva contraseña.', pt: 'Agora você pode fazer login com seu ID de Membro e a nova senha.', zh: '您现在可以使用成员 ID 和新密码登录了。' },
  please_enter_email_employee_id_member: { en: 'Please enter both your email and Member ID.', es: 'Por favor, ingresa tu correo y tu ID de Miembro.', pt: 'Por favor, digite seu e-mail e seu ID de Membro.', zh: '请输入您的邮箱和成员 ID。' },
  no_account_found_member: { en: 'No account found with that email and Member ID. Check with your company Admin.', es: 'No se encontró ninguna cuenta con ese correo e ID de Miembro. Consulta con el Admin de tu empresa.', pt: 'Nenhuma conta encontrada com esse e-mail e ID de Membro. Verifique com o Admin da sua empresa.', zh: '未找到使用该邮箱和成员 ID 的账户，请联系贵公司管理员确认。' },
  please_enter_id_password_member: { en: 'Please enter Member ID and Password', es: 'Por favor, ingresa tu ID de Miembro y Contraseña', pt: 'Por favor, digite o ID de Membro e a Senha', zh: '请输入成员 ID 和密码' },
  invalid_id_password_member: { en: 'Invalid Member ID or Password', es: 'ID de Miembro o Contraseña inválidos', pt: 'ID de Membro ou Senha inválidos', zh: '成员 ID 或密码无效' },
  add_employee_btn_member: { en: '+ Add Member', es: '+ Agregar Miembro', pt: '+ Adicionar Membro', zh: '+ 添加成员' },
  search_employees_title_member: { en: 'Search Members', es: 'Buscar Miembros', pt: 'Buscar Membros', zh: '搜索成员' },
  excel_columns_employee_full_member: { en: 'Excel columns: Member ID, Name, Country, Email', es: 'Columnas de Excel: ID de Miembro, Nombre, País, Correo', pt: 'Colunas do Excel: ID do Membro, Nome, País, E-mail', zh: 'Excel 列：成员 ID、姓名、国家、邮箱' },
  employee_id_star_member: { en: 'Member ID *', es: 'ID de Miembro *', pt: 'ID do Membro *', zh: '成员 ID *' },
  full_name_star: { en: 'Full Name *', es: 'Nombre Completo *', pt: 'Nome Completo *', zh: '全名 *' },
  top_above_top3: { en: 'Top (above Top 3)', es: 'Arriba (encima del Top 3)', pt: 'Topo (acima do Top 3)', zh: '顶部（Top 3 上方）' },
  bottom_below_top3: { en: 'Bottom (below Top 3)', es: 'Abajo (debajo del Top 3)', pt: 'Base (abaixo do Top 3)', zh: '底部（Top 3 下方）' },
  video_word: { en: 'Video', es: 'Video', pt: 'Vídeo', zh: '视频' },
  presentation_word: { en: 'Presentation', es: 'Presentación', pt: 'Apresentação', zh: '演示文稿' },
  link_word: { en: 'Link', es: 'Enlace', pt: 'Link', zh: '链接' },
  edit_pencil: { en: '✏️ Edit', es: '✏️ Editar', pt: '✏️ Editar', zh: '✏️ 编辑' },
  no_experiences_found: { en: 'No experiences found.', es: 'No se encontraron experiencias.', pt: 'Nenhuma experiência encontrada.', zh: '未找到任何经验。' },
};

// Reserva embutida dos TEMPLATES (frases com variáveis tipo {count}) —
// mesmo princípio do UI_STRINGS acima: usado só se a tabela `ui_translations`
// ainda não tiver a chave, ou estiver fora do ar.
const TEMPLATE_STRINGS = {
  pagination_template: { en: 'Page {current} of {total} • Showing {from}-{to} of {count} experiences', es: 'Página {current} de {total} • Mostrando {from}-{to} de {count} experiencias', pt: 'Página {current} de {total} • Mostrando {from}-{to} de {count} experiências', zh: '第 {current} 页，共 {total} 页 • 显示第 {from}-{to} 条，共 {count} 条经验' },
  show_all_comments_singular: { en: 'Show all {count} comment', es: 'Mostrar {count} comentario', pt: 'Mostrar {count} comentário', zh: '显示全部 {count} 条评论' },
  show_all_comments_singular_previous: { en: 'Show all {count} previous comment', es: 'Mostrar {count} comentario anterior', pt: 'Mostrar {count} comentário anterior', zh: '显示全部 {count} 条以前的评论' },
  show_all_comments_plural: { en: 'Show all {count} comments', es: 'Mostrar los {count} comentarios', pt: 'Mostrar os {count} comentários', zh: '显示全部 {count} 条评论' },
  show_all_comments_plural_previous: { en: 'Show all {count} previous comments', es: 'Mostrar los {count} comentarios anteriores', pt: 'Mostrar os {count} comentários anteriores', zh: '显示全部 {count} 条以前的评论' },
  count_found_experiences_singular: { en: '{count} experience found - Listed below', es: '{count} experiencia encontrada - Listada abajo', pt: '{count} experiência encontrada - Listada abaixo', zh: '找到 {count} 条经验 - 列表如下' },
  count_found_experiences_plural: { en: '{count} experiences found - Listed below', es: '{count} experiencias encontradas - Listadas abajo', pt: '{count} experiências encontradas - Listadas abaixo', zh: '找到 {count} 条经验 - 列表如下' },
  count_found_common_cases_singular: { en: '{count} common case found - Listed below', es: '{count} caso común encontrado - Listado abajo', pt: '{count} caso comum encontrado - Listado abaixo', zh: '找到 {count} 条共性案例 - 列表如下' },
  count_found_common_cases_plural: { en: '{count} common cases found - Listed below', es: '{count} casos comunes encontrados - Listados abajo', pt: '{count} casos comuns encontrados - Listados abaixo', zh: '找到 {count} 条共性案例 - 列表如下' },
  demo_ids_no_limit: { en: 'You have {count} active Demo ID(s) — no limit set.', es: 'Tienes {count} ID(s) Demo activo(s) — sin límite establecido.', pt: 'Você tem {count} ID(s) Demo ativo(s) — sem limite definido.', zh: '您有 {count} 个活跃的演示 ID — 未设置上限。' },
  demo_ids_available: { en: 'You have {remaining} of {limit} Demo ID(s) available right now.', es: 'Tienes {remaining} de {limit} ID(s) Demo disponibles ahora mismo.', pt: 'Você tem {remaining} de {limit} ID(s) Demo disponíveis agora.', zh: '您现在有 {remaining}/{limit} 个演示 ID 可用。' },
};

// Badge de Function/Practice + Category exibido no bloco "Problem".
// Quando o texto tem "Practice / Category", força quebra de linha após o "/"
// (em vez de deixar o texto encolher/estourar dentro do pill redondo).
// Quando é só a Category (Practice = General/Corporate Areas) e ela é longa
// (ex: "AI, Data, Analytics & Reporting"), quebra em várias linhas.
const LONG_BADGE_TEXT_THRESHOLD = 20; // caracteres — acima disso, a linha pode quebrar

// Quebra o texto em linhas manualmente (em vez de usar max-width do CSS).
// Isso evita um bug onde inline-block + max-width faz a caixa ficar do
// tamanho da max-width inteira mesmo quando a linha quebrada é mais estreita
// que isso, deixando espaço vazio do lado (já que o texto fica alinhado à
// direita dentro de uma caixa maior do que precisa).
function wrapText(text, maxLineLen = 14) {
  const words = text.split(' ');
  const lines = [];
  let current = '';
  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length > maxLineLen && current) {
      lines.push(current);
      current = word;
    } else {
      current = candidate;
    }
  }
  if (current) lines.push(current);
  return lines;
}

function CategoryBadge({ label }) {
  if (!label) return null;
  const parts = label.split(' / ');

  if (parts.length < 2) {
    const isLong = label.length > LONG_BADGE_TEXT_THRESHOLD;
    if (!isLong) {
      return (
        <span className="text-xs bg-red-100 text-red-700 px-3 py-1 rounded-full whitespace-nowrap">
          {label}
        </span>
      );
    }
    const lines = wrapText(label);
    return (
      <span className="text-xs bg-red-100 text-red-700 px-3 py-1 rounded-lg leading-tight inline-flex flex-col items-end">
        {lines.map((line, i) => (
          <span key={i} className="whitespace-nowrap">{line}</span>
        ))}
      </span>
    );
  }

  const [practicePart, ...rest] = parts;
  const categoryPart = rest.join(' / ');
  const categoryLines = categoryPart.length > LONG_BADGE_TEXT_THRESHOLD
    ? wrapText(categoryPart)
    : [categoryPart];

  return (
    <span className="text-xs bg-red-100 text-red-700 px-3 py-1 rounded-lg leading-tight inline-flex flex-col items-end">
      <span className="whitespace-nowrap">{practicePart} /</span>
      {categoryLines.map((line, i) => (
        <span key={i} className="whitespace-nowrap">{line}</span>
      ))}
    </span>
  );
}

export default function WhatIDid() {
  const [isAdmin, setIsAdmin] = useState(() => localStorage.getItem('isAdmin') === 'true');
  // employeeIsAdmin: essa conta PODE ser Admin (vem do banco, fixo até logout completo).
  // isAdmin: a tela de Admin está ATIVA agora (liga/desliga, sem precisar de senha).
  const [employeeIsAdmin, setEmployeeIsAdmin] = useState(() => localStorage.getItem('employeeIsAdmin') === 'true');
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [adminKeywords, setAdminKeywords] = useState('');
  // Filtros extras da seção "Manage Deletion" — Function/Practice e Category,
  // usados junto (ou no lugar) da keyword pra selecionar o que apagar.
  const [deletionPracticeId, setDeletionPracticeId] = useState(null);
  const [deletionCategory, setDeletionCategory] = useState('');
  const [deletionCategoriesForPractice, setDeletionCategoriesForPractice] = useState([]);
  const [deletionDataType, setDeletionDataType] = useState('all');
  const [deletionSource, setDeletionSource] = useState('all');
  const [deletionFiltersRemountKey, setDeletionFiltersRemountKey] = useState(0);
  // Quantos dias de expiração estão marcados no "+ Add New ID" de cada grupo
  // — controla o radio button pra poder mostrar a data calculada ao vivo,
  // antes do usuário confirmar.
  const [addIdExpiryDays, setAddIdExpiryDays] = useState({});
  // Empresa marcada via radio button no "Manage Companies" — é o que a opção
  // "Company"/"Companies" do dropdown de contexto aponta, tanto pro Default
  // Admin quanto pro Seller. Existe separado de adminCompanyContext pra
  // "lembrar" a escolha mesmo quando o dropdown está em "Default".
  const [selectedCompanyForContext, setSelectedCompanyForContext] = useState(null);
  const [expandedCompanyContact, setExpandedCompanyContact] = useState({});
  // Logo + tamanhos atuais de cada empresa (pra mostrar a prévia e os
  // controles P/M/G na lista de Manage Companies, sem carregar toda a
  // app_settings de cada uma).
  const [companyLogosById, setCompanyLogosById] = useState({});
  const [companyBrandingSizesById, setCompanyBrandingSizesById] = useState({});
  const loadCompanyLogos = async () => {
    const { data, error } = await supabase.from('app_settings').select('company_id, company_logo_url, company_name_size, company_logo_size');
    if (error) { console.error('Error loading company logos:', error); return; }
    const logoMap = {};
    const sizeMap = {};
    (data || []).forEach(row => {
      if (row.company_logo_url) logoMap[row.company_id] = row.company_logo_url;
      sizeMap[row.company_id] = { name: row.company_name_size || 'medium', logo: row.company_logo_size || 'medium' };
    });
    setCompanyLogosById(logoMap);
    setCompanyBrandingSizesById(sizeMap);
  };
  // Salva o tamanho (nome ou logo) de uma empresa — checa se já existe
  // linha antes de decidir entre update/insert, mesmo padrão seguro já
  // usado pro upload de logo (essa tabela não tem constraint única em
  // company_id).
  const saveCompanyBrandingSize = async (companyId, field, size) => {
    try {
      const { data: existingSettings } = await supabase
        .from('app_settings').select('company_id').eq('company_id', companyId).maybeSingle();
      // "pro" sugere CV only; qualquer outra edição sugere outros tipos de
      // documento — mesma regra que já vale em qq outro lugar do app.
      const targetEdition = companies.find(comp => comp.id === companyId)?.edition || 'corp';
      const { error } = existingSettings
        ? await supabase.from('app_settings').update({ [field]: size }).eq('company_id', companyId)
        : await supabase.from('app_settings').insert([{
            company_id: companyId, [field]: size,
            require_employee_login: true, allow_cv_upload: true, document_type: targetEdition === 'pro' ? 'cv' : 'other',
            show_top3: false, top3_start_visible: true, show_marquee: false
          }]);
      if (error) throw error;
      setCompanyBrandingSizesById(prev => ({
        ...prev,
        [companyId]: { ...(prev[companyId] || { name: 'medium', logo: 'medium' }), [field === 'company_name_size' ? 'name' : 'logo']: size }
      }));
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };
  const [expandedSellerContact, setExpandedSellerContact] = useState({});
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [loading, setLoading] = useState(true);
  // Traduções de UI carregadas do banco (tabela ui_translations) — formato
  // { chave: { en: '...', es: '...', pt: '...', zh: '...', ... } }.
  // Começa vazio; até carregar, t()/tt() usam a reserva embutida no código.
  const [uiTranslationsDB, setUiTranslationsDB] = useState({});
  const [experiences, setExperiences] = useState([]);
  const shuffleOrderRef = useRef(null);
  // Lembra de qual empresa era o embaralhamento salvo — se a empresa mudar,
  // o embaralhamento precisa ser refeito (senão fica "travado" na primeira
  // empresa que carregou, mesmo trocando de empresa depois).
  const shuffleOrderCompanyRef = useRef(null);
  const shuffleOrderLanguageRef = useRef(null);
  // Protege contra condição de corrida: se duas chamadas de loadExperiences
  // estiverem em andamento, só a resposta da MAIS RECENTE deve realmente
  // atualizar a tela — mesmo que ela termine primeiro.
  const latestExperiencesRequestRef = useRef(0);
  const promoVideoFileInputRef = useRef(null);

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
  // Sugestões de tipo de anexo por edição (Corp/Pro/Edu) — só o Default
  // Admin edita. Cada empresa vê a sugestão da própria edição e decide se
  // quer copiar; nunca aplicado automaticamente.
  const [editionDefaults, setEditionDefaults] = useState({});
  const loadEditionDefaults = async () => {
    const { data, error } = await supabase.from('edition_defaults').select('*');
    if (error) { console.error('Error loading edition_defaults:', error); return; }
    const obj = {};
    (data || []).forEach(row => { obj[row.edition] = row; });
    setEditionDefaults(obj);
  };
  // Branding (nome/logo) do Default por edição (Corp/Pro/Edu) — usado só
  // quando Default Admin/Seller navegam o Default puro pra apresentação;
  // empresas reais continuam com o próprio branding fixo, normal.
  const [editionBranding, setEditionBranding] = useState({});
  const loadEditionBranding = async () => {
    const { data, error } = await supabase.from('edition_branding').select('*');
    if (error) { console.error('Error loading edition_branding:', error); return; }
    const obj = {};
    (data || []).forEach(row => { obj[row.edition] = row; });
    setEditionBranding(obj);
  };

const [companyName, setCompanyName] = useState('');
const [companyLogoUrl, setCompanyLogoUrl] = useState('');
const [companyNameSize, setCompanyNameSize] = useState('medium');
const [companyLogoSize, setCompanyLogoSize] = useState('medium');
const [practices, setPractices] = useState([]);
const [selectedPracticeId, setSelectedPracticeId] = useState(null);
const [showNewPracticeForm, setShowNewPracticeForm] = useState(false);
const [newPracticeName, setNewPracticeName] = useState('');
const [newPracticeEditions, setNewPracticeEditions] = useState(['corp', 'pro']); // padrão: mesmo valor default da migration
const [shareFormPracticeId, setShareFormPracticeId] = useState(null); // practice escolhida no Share Your Experience
const [filterPracticeId, setFilterPracticeId] = useState(null);
const [adminCategories, setAdminCategories] = useState([]);
const [uiPractices, setUiPractices] = useState([]);
const [demoGroups, setDemoGroups] = useState([]);
// Vendedores (Sellers): lista de contas com is_seller=true, e estado do form de criação.
const [sellers, setSellers] = useState([]);
const [sellersLoaded, setSellersLoaded] = useState(false);
const [newSeller, setNewSeller] = useState({ employee_id: '', name: '', email: '' });
const [creatingSeller, setCreatingSeller] = useState(false);
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
const [hoveredFilterCategory, setHoveredFilterCategory] = useState(null); // hover desktop no filtro do See What Others Did
const [showKeyInsightCategoryDropdown, setShowKeyInsightCategoryDropdown] = useState(false);
const [hoveredKeyInsightCategory, setHoveredKeyInsightCategory] = useState(null); // hover desktop no filtro do Key Insights
const [reactions, setReactions] = useState({}); // { comment_id: { emoji: [employee_ids] } }

const REACTION_EMOJIS = ['👍','❤️','💡','🎯','😮','😢','🙂','😀','🤩','😂','👏','🙏','💪','👊'];

// ⭐ FOLLOW-ON EXPERIENCE
const [followOnParentId, setFollowOnParentId] = useState(null); // id da exp que originou o follow-on
const [expandedUpstream, setExpandedUpstream] = useState({});
const [expandedFollowOns, setExpandedFollowOns] = useState({});
const [expandedGaps, setExpandedGaps] = useState({}); // { [gapKey]: true }
const [top3VisibleInSession, setTop3VisibleInSession] = useState(true);
const [activeMainTab, setActiveMainTab] = useState('see'); // 'see' | 'share'
const [activeAdminNavTab, setActiveAdminNavTab] = useState('settings'); // 'settings' | 'preview' — só estilo/scroll, nenhuma seção fica escondida
// ⭐ Snapshot para o botão Back contextual — guarda de onde o usuário veio ao clicar
// em Browse / Top3 / Share no rodapé de um card, e para onde deve voltar
const [navSnapshot, setNavSnapshot] = useState(null); // { destination: 'browse'|'top3'|'share', state: {...}, scrollY: number }
  
  // ⭐ ADICIONAR AQUI - Estados para Employee Login ⭐
  const [isEmployeeLoggedIn, setIsEmployeeLoggedIn] = useState(false);
  // Fluxo de auto-cadastro Pro (Profissional/Contratante) — detectado via
  // ?signup=professional|contratante&code=XXX na URL. null enquanto não
  // detectado; 'invalid' se o código não bater com nenhuma empresa Pro
  // ativa; senão, um objeto com o papel e os dados da empresa.
  const [proSignupInfo, setProSignupInfo] = useState(null);
  const [proSignupStep, setProSignupStep] = useState('confirm'); // 'confirm' | 'form' | 'verify' | 'password' | 'done'
  const [proSignupForm, setProSignupForm] = useState({ email: '', name: '' });
  const [proSignupCode, setProSignupCode] = useState('');
  const [proSignupCodeInput, setProSignupCodeInput] = useState('');
  const [proSignupPassword, setProSignupPassword] = useState('');
  const [proSignupConfirmPassword, setProSignupConfirmPassword] = useState('');
  const [proSignupError, setProSignupError] = useState('');
  const [proSignupExistingPars, setProSignupExistingPars] = useState([]); // PARs encontrados com o mesmo email
  const [proSignupSelectedPars, setProSignupSelectedPars] = useState([]); // ids selecionados pra copiar
  const [mySessionToken, setMySessionToken] = useState(() => localStorage.getItem('mySessionToken') || null);
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
  // Multi-empresa: lista de empresas cadastradas, formulário de nova empresa
  const [companies, setCompanies] = useState([]);
  const [newCompany, setNewCompany] = useState({ name: '', code: '', edition: 'corp', logoFile: null });
  const [companiesLoaded, setCompaniesLoaded] = useState(false);
  // Contexto de navegação do ADM Master: null = Default; caso contrário, id da empresa sendo gerenciada.
  // Sempre reseta pra null (Default) a cada reload da página, por segurança.
  const [adminCompanyContext, setAdminCompanyContext] = useState(null);
  // company_id da própria conta que logou (vem do registro de employee dela).
  const [loggedInEmployeeCompanyId, setLoggedInEmployeeCompanyId] = useState(() => {
    const stored = localStorage.getItem('loggedInEmployeeCompanyId');
    return stored ? parseInt(stored) : null;
  });
  // id (não employee_id) da conta de seller que logou, se for o caso — usado
  // pra escopar "Manage Companies" e "Manage Demo Groups" só ao que esse
  // seller específico criou. null = não é um seller (Default Admin normal,
  // ou employee comum).
  const [loggedInSellerId, setLoggedInSellerId] = useState(() => {
    const stored = localStorage.getItem('loggedInSellerId');
    return stored ? parseInt(stored) : null;
  });
  // Idioma da PRÓPRIA conta que logou (employee comum ou Demo ID) — usado pra
  // decidir em que idioma o Default aparece pra ela, sem precisar do seletor
  // manual (esse é só pro Admin/seller navegando). Ex: um Demo ID marcado como
  // 'es' vê o Default inteiro em espanhol automaticamente ao logar.
  const [loggedInEmployeeLanguage, setLoggedInEmployeeLanguage] = useState(() => {
    return localStorage.getItem('loggedInEmployeeLanguage') || null;
  });
  // Só pra mostrar a faixa "Demo Mode" (versão sem seletor de idioma) quando
  // quem logou é um Demo Group ID (ID0001 etc.) — junto com a própria data de
  // criação/expiração dele, pra exibir "(Created)(Exp)(dias restantes)".
  const [loggedInIsDemoId, setLoggedInIsDemoId] = useState(() => localStorage.getItem('loggedInIsDemoId') === 'true');
  const [loggedInDemoCreatedAt, setLoggedInDemoCreatedAt] = useState(() => localStorage.getItem('loggedInDemoCreatedAt') || null);
  const [loggedInDemoExpiresAt, setLoggedInDemoExpiresAt] = useState(() => localStorage.getItem('loggedInDemoExpiresAt') || null);
  // Pro Admin de uma empresa (não Default): 'own' (visão normal, editável) ou
  // 'sample' (conteúdo do Default, somente leitura, pra decidir o que importar).
  const [companyViewMode, setCompanyViewMode] = useState('own');
  // Visibilidade das seções pro ADM Master (lista de chaves liberadas) + estado de importação
  const [companyMasterVisibility, setCompanyMasterVisibility] = useState([]);
  const [companyMasterVisibilityRowExists, setCompanyMasterVisibilityRowExists] = useState(false);
  const [importingBundle, setImportingBundle] = useState(false);
  const [importingQuotes, setImportingQuotes] = useState(false);
  // Seleção de linhas (por seção) marcadas em cada uma das 3 colunas de ação da
  // tabela "Section Settings" — o botão no título de cada coluna age sobre as
  // linhas marcadas nela.
  const [selectedForImport, setSelectedForImport] = useState([]);
  // Idioma escolhido pra importar o conteúdo do Default (Metadata Model,
  // Synthetic Content, Quotes). Padrão inglês.
  const [importLanguage, setImportLanguage] = useState(() => {
    return localStorage.getItem('importLanguage') || 'en';
  });
  // Obstáculos leves contra cópia casual — não impedem alguém decidido
  // (F12 pelo menu do navegador continua funcionando, "Ver código-fonte"
  // via Ctrl+U geralmente não dá pra bloquear via JS), mas evitam o
  // clique-direito → "Salvar como" e os atalhos mais comuns.
  useEffect(() => {
    const blockContextMenu = (e) => e.preventDefault();
    const blockDevToolsShortcuts = (e) => {
      if (e.key === 'F12') e.preventDefault();
      if (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C')) e.preventDefault();
      if (e.ctrlKey && e.key === 'u') e.preventDefault();
    };
    document.addEventListener('contextmenu', blockContextMenu);
    document.addEventListener('keydown', blockDevToolsShortcuts);
    return () => {
      document.removeEventListener('contextmenu', blockContextMenu);
      document.removeEventListener('keydown', blockDevToolsShortcuts);
    };
  }, []);
  useEffect(() => {
    localStorage.setItem('importLanguage', importLanguage);
  }, [importLanguage]);
  // Idioma em que o Default é EXIBIDO quando alguém está navegando o próprio
  // Default (Admin do Default olhando pra ele mesmo, ou uma empresa em modo
  // Sample) — não afeta empresas vendo os próprios dados (cada uma só tem o
  // idioma que escolheu importar). Padrão inglês.
  const [viewingLanguage, setViewingLanguage] = useState(() => {
    return localStorage.getItem('viewingLanguage') || 'en';
  });
  useEffect(() => {
    localStorage.setItem('viewingLanguage', viewingLanguage);
  }, [viewingLanguage]);
  // Mesma lógica do viewingLanguage, mas pra Edition (Corp/Pro/Edu) — só
  // aparece quando Default Admin/Seller navegam o Default puro, sem
  // empresa selecionada. Padrão 'corp'.
  const [viewingEdition, setViewingEdition] = useState(() => {
    return localStorage.getItem('viewingEdition') || 'corp';
  });
  useEffect(() => {
    localStorage.setItem('viewingEdition', viewingEdition);
  }, [viewingEdition]);
  const defaultCompanyId = companies.find(c => c.code === 'default')?.id || null;
  // Só o Admin do Default pode navegar entre empresas pelo dropdown — qualquer
  // outra empresa só vê e opera sobre os próprios dados, sempre.
  // Sellers ficam com company_id = Default (pra herdar o conteúdo público dele),
  // mas NÃO são o Default Admin de verdade — por isso o "&& !loggedInSellerId".
  // Precisa checar employeeIsAdmin também — sem isso, um Demo Group ID
  // (ID0001 etc.) caía aqui igualzinho ao Master de verdade, já que ambos
  // têm company_id = Default e is_seller = false. Isso fazia o Demo Mode
  // (faixa roxa, sessão efêmera, idioma manual) se aplicar por engano a
  // sessões de demo de prospect também.
  const isDefaultAdmin = !!loggedInEmployeeCompanyId && loggedInEmployeeCompanyId === defaultCompanyId && !loggedInSellerId && employeeIsAdmin;
  // true quando quem logou é uma conta de seller (vendedor). "Um só conceito,
  // não dois": a própria conta do seller circula pelo Default com acesso de
  // leitura/escrita completo, igual um ID de demo — não existe modo travado
  // separado. O seller também pode usar "Managing" (reaproveitando
  // adminCompanyContext) pra entrar numa das PRÓPRIAS empresas e geri-la
  // por completo (necessário pra cadastrar o primeiro ADM dela).
  const isSeller = !!loggedInSellerId;
  // true quando o seller selecionou uma das próprias empresas no "Managing"
  // (em vez de estar navegando o Default puro).
  // true só quando o seller está gerenciando uma empresa que ELE MESMO
  // criou de verdade (created_by_seller_id bate com quem está logado) — não
  // basta "é seller e tem alguma empresa selecionada". Sem essa checagem, um
  // seller que manipulasse adminCompanyContext manualmente (ex: via devtools)
  // poderia se passar por dono de uma empresa de outro seller e enxergar o
  // que ela liberou pro Master.
  const isSellerManagingOwnCompany = isSeller && !!adminCompanyContext &&
    companies.some(c => c.id === adminCompanyContext && c.created_by_seller_id === loggedInSellerId);
  // O company_id que as operações do Admin devem usar agora: se for o Admin do
  // Default (ou um seller) navegando pra outra empresa via dropdown, usa essa;
  // se for o Admin de uma empresa olhando o "Sample", usa a Default (mas em
  // modo leitura); senão, usa sempre o company_id da própria conta logada —
  // que pro seller já É o Default, dando a ele leitura/escrita completa nele.
  const effectiveCompanyId = ((isDefaultAdmin || isSeller) && adminCompanyContext)
    ? adminCompanyContext
    : (!isDefaultAdmin && companyViewMode === 'sample')
      ? defaultCompanyId
      : (loggedInEmployeeCompanyId || defaultCompanyId);
  const effectiveCompanyName = ((isDefaultAdmin || isSeller) && adminCompanyContext)
    ? (companies.find(c => c.id === adminCompanyContext)?.name || 'Unknown')
    : (companies.find(c => c.id === effectiveCompanyId)?.name || 'Default');
  // true quando o contexto ativo (seja por login direto, seja pelo dropdown do
  // Master) é o Default — usado só pra saber QUAL DADO está sendo mostrado.
  const isViewingDefault = effectiveCompanyId === defaultCompanyId;
  // true quando o Master ou um Seller está navegando o Default DIRETAMENTE —
  // não "Managing" nenhuma empresa real. Cobre os dois caminhos de entrada:
  // login direto (signin cai aqui por padrão, sem adminCompanyContext) e saída
  // do ADM ("Logout ADM" zera adminCompanyContext). Em qualquer desses casos,
  // tudo que for criado é tratado como demo: efêmero, invisível pra mais
  // ninguém, apagado ao sair. Precisa vir ANTES de effectiveViewingLanguage,
  // que depende dela.
  const isDemoModeActive =
    ((isDefaultAdmin || isSeller) && isViewingDefault && companyViewMode !== 'sample') ||
    (employeeIsAdmin && !isAdmin && !isDefaultAdmin && !isSeller && !isViewingDefault); // Admin de empresa comum, fora do ADM, testando/apresentando o próprio front-end pra time interno
  // Edição da empresa em contexto (Corp/Pro/Edu) — Default sempre resolve
  // pra 'corp' (é o valor padrão da coluna, e Default nunca é Edu/Pro de
  // verdade), então gerenciar o roster interno da própria WID sempre usa
  // terminologia "Employee", sem precisar de exceção nenhuma pra isso.
  // Edição efetiva: quando Default Admin/Seller navegam o Default puro,
  // sem empresa selecionada (mesma condição de isDemoModeActive), usa o
  // seletor manual — senão, usa a edição real da empresa em contexto.
  // Edição efetiva: quando Default Admin/Seller navegam o Default puro
  // (sem empresa em adminCompanyContext) — cobre "My Seller View", "Sample"
  // e o Default Admin sem empresa selecionada — usa o seletor manual.
  // Assim que uma empresa real entra em contexto (adminCompanyContext),
  // a edição passa a ser sempre a da própria empresa, sem seletor.
  const companyEdition = (!adminCompanyContext && isViewingDefault && (isDefaultAdmin || isSeller))
    ? viewingEdition
    : (companies.find(c => c.id === effectiveCompanyId)?.edition || 'corp');
  // Edição específica pra decidir terminologia Employee/Member — diferente
  // de companyEdition (que também controla o PREVIEW do Demo e pode ser
  // trocada manualmente pelo dropdown). Gerenciar o roster interno da
  // própria WID (Default: Master, Sellers, employees sintéticos) precisa
  // SEMPRE ser "Employee", mesmo que o dropdown de preview esteja em
  // Edu/Pro pra uma apresentação — por isso ignora o seletor manual
  // especificamente quando isViewingDefault, e só usa companyEdition
  // quando uma empresa real de verdade está em contexto.
  const terminologyEdition = isViewingDefault ? 'corp' : companyEdition;
  // Company Branding: quando Default Admin/Seller navegam o Default puro
  // pra apresentação (mesma condição de companyEdition usar o seletor
  // manual), mostra/edita o branding daquela edição em vez do branding
  // fixo do Default — empresas reais nunca entram nesse caminho, sempre
  // usam o próprio branding normal.
  const isPreviewingDefaultEdition = !adminCompanyContext && isViewingDefault && (isDefaultAdmin || isSeller);
  const displayedCompanyName = isPreviewingDefaultEdition ? (editionBranding[companyEdition]?.company_name || '') : companyName;
  const displayedCompanyLogoUrl = isPreviewingDefaultEdition ? (editionBranding[companyEdition]?.company_logo_url || '') : companyLogoUrl;
  const displayedCompanyNameSize = isPreviewingDefaultEdition ? (editionBranding[companyEdition]?.company_name_size || 'medium') : companyNameSize;
  const displayedCompanyLogoSize = isPreviewingDefaultEdition ? (editionBranding[companyEdition]?.company_logo_size || 'medium') : companyLogoSize;
  // Idioma que efetivamente filtra o conteúdo do Default: se quem está
  // navegando é Master/Seller em modo demo (dentro OU fora do painel Admin —
  // por isso "isDemoModeActive" e não "isAdmin", já que o seletor manual
  // agora vive na faixa "Demo Mode", visível mesmo depois de sair do Admin),
  // usa o seletor manual "Viewing language"; senão (Demo ID, employee comum)
  // usa o idioma da própria conta que logou, automaticamente.
  const effectiveViewingLanguage = (
    isDemoModeActive ||
    (isAdmin && isSeller) || // Seller: o idioma escolhido vale em qualquer modo do ADM (My Seller View, Company, Sample), não só Sample
    (isAdmin && !isDefaultAdmin && !isSeller) // Admin de empresa comum: vale em qualquer modo (própria empresa ou Sample) — controla só a UI, nunca o conteúdo real dos funcionários
  ) ? viewingLanguage : (loggedInEmployeeLanguage || 'en');
  // Traduz textos fixos da UI (títulos de seção, botões, labels) — troca
  // junto com o mesmo idioma que já controla o conteúdo (effectiveViewingLanguage),
  // então quando o Demo Mode muda de idioma, a interface administrativa
  // muda junto, não só o conteúdo.
  // Traduz textos fixos da UI. Prioridade: banco (uiTranslationsDB, carregado
  // em loadUITranslations) → reserva embutida no código (UI_STRINGS) → a
  // própria chave, como último recurso pra nunca quebrar a tela.
  const t = (key) => {
    // Terminologia Employee/Member: se essa chave tem uma variante "_member"
    // definida e a empresa em contexto é Edu ou Pro, usa a variante — sem
    // precisar trocar nenhuma chamada t('xxx') espalhada pelo código.
    const effectiveKey = (terminologyEdition === 'edu' || terminologyEdition === 'pro') && (UI_STRINGS[`${key}_member`] || uiTranslationsDB[`${key}_member`])
      ? `${key}_member`
      : key;
    return (
      uiTranslationsDB[effectiveKey]?.[effectiveViewingLanguage] ||
      uiTranslationsDB[effectiveKey]?.en ||
      UI_STRINGS[effectiveKey]?.[effectiveViewingLanguage] ||
      UI_STRINGS[effectiveKey]?.en ||
      key
    );
  };
  // Substitui {variavel} num template — usado pelas frases com números/contagens.
  const tt = (key, vars) => {
    const raw =
      uiTranslationsDB[key]?.[effectiveViewingLanguage] ||
      uiTranslationsDB[key]?.en ||
      TEMPLATE_STRINGS[key]?.[effectiveViewingLanguage] ||
      TEMPLATE_STRINGS[key]?.en ||
      '';
    return raw.replace(/\{(\w+)\}/g, (_, name) => (vars[name] !== undefined ? vars[name] : `{${name}}`));
  };
  const tPagination = (current, total, from, to, count) =>
    tt('pagination_template', { current, total, from, to, count });
  const tHideAllComments = () => t('hide_all_comments');
  const tShowAllComments = (count, includesPrevious) => {
    const key = count === 1
      ? (includesPrevious ? 'show_all_comments_singular_previous' : 'show_all_comments_singular')
      : (includesPrevious ? 'show_all_comments_plural_previous' : 'show_all_comments_plural');
    return tt(key, { count });
  };
  const tCountFound = (count, isCommonCase) => {
    const base = isCommonCase ? 'count_found_common_cases' : 'count_found_experiences';
    const key = count === 1 ? `${base}_singular` : `${base}_plural`;
    return tt(key, { count });
  };
  const tNoExperiencesFound = () => t('no_experiences_found');
  const tMatchingExperiences = (count) => {
    const templates = {
      en: `👥 ${count} Matching ${count === 1 ? 'Experience' : 'Experiences'} →`,
      es: `👥 ${count} Experiencia${count === 1 ? '' : 's'} Coincidente${count === 1 ? '' : 's'} →`,
      pt: `👥 ${count} Experiência${count === 1 ? '' : 's'} Correspondente${count === 1 ? '' : 's'} →`,
      zh: `👥 ${count} 条匹配经验 →`,
    };
    return templates[effectiveViewingLanguage] || templates.en;
  };
  const tLinkingExperience = (category) => {
    const templates = {
      en: `Linking this ${category} experience:`,
      es: `Vinculando esta experiencia de ${category}:`,
      pt: `Vinculando esta experiência de ${category}:`,
      zh: `正在关联此${category}经验：`,
    };
    return templates[effectiveViewingLanguage] || templates.en;
  };
  // "N rating" / "N ratings" — usado nos contadores de avaliação dos cards
  const tRatingCount = (count) => {
    const templates = {
      en: count === 1 ? 'rating' : 'ratings',
      es: count === 1 ? 'calificación' : 'calificaciones',
      pt: count === 1 ? 'avaliação' : 'avaliações',
      zh: '评分',
    };
    return templates[effectiveViewingLanguage] || templates.en;
  };
  // "🔗 Follow-On Experience N"
  const tFollowOnExperience = (threadIndex) => {
    const templates = {
      en: `🔗 Follow-On Experience ${threadIndex}`,
      es: `🔗 Experiencia de Continuación ${threadIndex}`,
      pt: `🔗 Experiência de Continuação ${threadIndex}`,
      zh: `🔗 续写经验 ${threadIndex}`,
    };
    return templates[effectiveViewingLanguage] || templates.en;
  };
  // Diálogos de confirmação do admin que têm nomes/números embutidos —
  // uma função só, com todos os templates, pra não espalhar 16 funções.
  const tConfirm = (key, vars = {}) => {
    const templates = {
      delete_seller: {
        en: (v) => `Delete seller "${v.name}"? Their 10 demo IDs will be removed. Companies/groups they created will stay, just unlinked from them.`,
        es: (v) => `¿Eliminar al vendedor "${v.name}"? Sus 10 IDs demo serán eliminados. Las empresas/grupos que creó permanecerán, solo desvinculados de él.`,
        pt: (v) => `Excluir o vendedor "${v.name}"? Os 10 IDs demo dele serão removidos. As empresas/grupos que ele criou vão permanecer, só ficam desvinculados dele.`,
        zh: (v) => `删除销售代表 "${v.name}"？其 10 个演示 ID 将被移除。他创建的公司/分组会保留，只是不再与其关联。`,
      },
      delete_company: {
        en: (v) => `Delete "${v.name}" permanently? This removes ALL its employees, experiences, comments and settings. This cannot be undone.`,
        es: (v) => `¿Eliminar "${v.name}" permanentemente? Esto elimina TODOS sus empleados, experiencias, comentarios y configuraciones. Esto no se puede deshacer.`,
        pt: (v) => `Excluir "${v.name}" permanentemente? Isso remove TODOS os funcionários, experiências, comentários e configurações dela. Isso não pode ser desfeito.`,
        zh: (v) => `永久删除 "${v.name}"？这将移除其所有员工、经验、评论和设置。此操作无法撤销。`,
      },
      delete_category_full: {
        en: (v) => `Delete "${v.name}"? This will also delete all Experiences, Key Insights and comments linked to this category, and any employee left with no other content. This cannot be undone.`,
        es: (v) => `¿Eliminar "${v.name}"? Esto también eliminará todas las Experiencias, Key Insights y comentarios vinculados a esta categoría, y a cualquier empleado que quede sin otro contenido. Esto no se puede deshacer.`,
        pt: (v) => `Excluir "${v.name}"? Isso também vai excluir todas as Experiências, Key Insights e comentários vinculados a esta categoria, e qualquer funcionário que fique sem outro conteúdo. Isso não pode ser desfeito.`,
        zh: (v) => `删除 "${v.name}"？这也会删除与该分类关联的所有经验、Key Insights 和评论，以及因此不再有任何内容的员工。此操作无法撤销。`,
      },
      delete_employee: {
        en: (v) => `Delete employee ${v.id}? This will not delete their experiences.`,
        es: (v) => `¿Eliminar al empleado ${v.id}? Esto no eliminará sus experiencias.`,
        pt: (v) => `Excluir o funcionário ${v.id}? Isso não vai excluir as experiências dele.`,
        zh: (v) => `删除员工 ${v.id}？这不会删除其经验。`,
      },
      delete_experiences_comments: {
        en: (v) => `Delete ${v.exp} experience(s) and ${v.com} comment(s)? This cannot be undone.`,
        es: (v) => `¿Eliminar ${v.exp} experiencia(s) y ${v.com} comentario(s)? Esto no se puede deshacer.`,
        pt: (v) => `Excluir ${v.exp} experiência(s) e ${v.com} comentário(s)? Isso não pode ser desfeito.`,
        zh: (v) => `删除 ${v.exp} 条经验和 ${v.com} 条评论？此操作无法撤销。`,
      },
      delete_group: {
        en: (v) => `Delete group "${v.name}"? All experiences and comments from its members will be deleted.`,
        es: (v) => `¿Eliminar el grupo "${v.name}"? Se eliminarán todas las experiencias y comentarios de sus miembros.`,
        pt: (v) => `Excluir o grupo "${v.name}"? Todas as experiências e comentários dos membros dele serão excluídos.`,
        zh: (v) => `删除分组 "${v.name}"？其成员的所有经验和评论都将被删除。`,
      },
      delete_id_retire: {
        en: (v) => `Delete ID "${v.id}"? This retires it permanently — it can never be reused.`,
        es: (v) => `¿Eliminar el ID "${v.id}"? Esto lo retira permanentemente — nunca podrá reutilizarse.`,
        pt: (v) => `Excluir o ID "${v.id}"? Isso o aposenta permanentemente — nunca poderá ser reutilizado.`,
        zh: (v) => `删除 ID "${v.id}"？这会将其永久停用——再也无法重复使用。`,
      },
      delete_all_by_employee: {
        en: (v) => `Delete all experiences and comments by ${v.id}? This cannot be undone.`,
        es: (v) => `¿Eliminar todas las experiencias y comentarios de ${v.id}? Esto no se puede deshacer.`,
        pt: (v) => `Excluir todas as experiências e comentários de ${v.id}? Isso não pode ser desfeito.`,
        zh: (v) => `删除 ${v.id} 的所有经验和评论？此操作无法撤销。`,
      },
      delete_practice_keep_categories: {
        en: (v) => `Delete practice "${v.name}"? Categories will not be deleted.`,
        es: (v) => `¿Eliminar la práctica "${v.name}"? Las categorías no se eliminarán.`,
        pt: (v) => `Excluir a prática "${v.name}"? As categorias não serão excluídas.`,
        zh: (v) => `删除领域 "${v.name}"？其分类不会被删除。`,
      },
      delete_category_ki: {
        en: (v) => `Delete Category "${v.name}"? This also deletes its Experiences, Key Insights and comments. This cannot be undone.`,
        es: (v) => `¿Eliminar la Categoría "${v.name}"? Esto también elimina sus Experiencias, Key Insights y comentarios. Esto no se puede deshacer.`,
        pt: (v) => `Excluir a Categoria "${v.name}"? Isso também exclui suas Experiências, Key Insights e comentários. Isso não pode ser desfeito.`,
        zh: (v) => `删除分类 "${v.name}"？这也会删除其经验、Key Insights 和评论。此操作无法撤销。`,
      },
      delete_all_categories_listed: {
        en: (v) => `Delete all ${v.count} Categories listed below (and their Experiences/Key Insights/comments)? This cannot be undone.`,
        es: (v) => `¿Eliminar las ${v.count} Categorías listadas abajo (y sus Experiencias/Key Insights/comentarios)? Esto no se puede deshacer.`,
        pt: (v) => `Excluir todas as ${v.count} Categorias listadas abaixo (e suas Experiências/Key Insights/comentários)? Isso não pode ser desfeito.`,
        zh: (v) => `删除下方列出的全部 ${v.count} 个分类（及其经验/Key Insights/评论）？此操作无法撤销。`,
      },
      delete_whole_function_named: {
        en: (v) => `Delete the whole Function/Practice "${v.name}" (all its Categories, regardless of Source)? This cannot be undone.`,
        es: (v) => `¿Eliminar toda la Función/Práctica "${v.name}" (todas sus Categorías, sin importar la Fuente)? Esto no se puede deshacer.`,
        pt: (v) => `Excluir toda a Função/Prática "${v.name}" (todas as suas Categorias, independente da Fonte)? Isso não pode ser desfeito.`,
        zh: (v) => `删除整个职能/领域 "${v.name}"（其所有分类，无论来源）？此操作无法撤销。`,
      },
      delete_all_functions_listed: {
        en: (v) => `Delete all ${v.count} Functions/Practices listed below (and everything under them)? This cannot be undone.`,
        es: (v) => `¿Eliminar las ${v.count} Funciones/Prácticas listadas abajo (y todo lo que contienen)? Esto no se puede deshacer.`,
        pt: (v) => `Excluir todas as ${v.count} Funções/Práticas listadas abaixo (e tudo que está sob elas)? Isso não pode ser desfeito.`,
        zh: (v) => `删除下方列出的全部 ${v.count} 个职能/领域（及其下的所有内容）？此操作无法撤销。`,
      },
      delete_function_named: {
        en: (v) => `Delete Function/Practice "${v.name}" (all its Categories)? This cannot be undone.`,
        es: (v) => `¿Eliminar la Función/Práctica "${v.name}" (todas sus Categorías)? Esto no se puede deshacer.`,
        pt: (v) => `Excluir a Função/Prática "${v.name}" (todas as suas Categorias)? Isso não pode ser desfeito.`,
        zh: (v) => `删除职能/领域 "${v.name}"（其所有分类）？此操作无法撤销。`,
      },
    };
    const dict = templates[key];
    if (!dict) return key;
    const fn = dict[effectiveViewingLanguage] || dict.en;
    return fn(vars);
  };
  // Mesma lógica do tConfirm, só que pros alert() de sucesso/aviso com
  // nomes/números embutidos.
  // Traduz o rótulo exibido (small/medium/large), mantendo o valor salvo em inglês
  const tSizeLabel = (size) => t(size === 'small' ? 'size_small' : size === 'large' ? 'size_large' : 'size_medium');
  const tAlert = (key, vars = {}) => {
    const templates = {
      seller_created: {
        en: (v) => `Seller "${v.name}" created. Demo IDs are generated on demand when you add them to a Demo Group.`,
        es: (v) => `Vendedor "${v.name}" creado. Los IDs Demo se generan bajo demanda cuando los agregas a un Grupo Demo.`,
        pt: (v) => `Vendedor "${v.name}" criado. Os IDs Demo são gerados sob demanda quando você os adiciona a um Grupo Demo.`,
        zh: (v) => `销售代表 "${v.name}" 已创建。演示 ID 会在您将其添加到演示分组时按需生成。`,
      },
      seller_deleted: {
        en: (v) => `Seller "${v.name}" deleted.`, es: (v) => `Vendedor "${v.name}" eliminado.`,
        pt: (v) => `Vendedor "${v.name}" excluído.`, zh: (v) => `销售代表 "${v.name}" 已删除。`,
      },
      company_deleted: {
        en: (v) => `"${v.name}" deleted.`, es: (v) => `"${v.name}" eliminada.`,
        pt: (v) => `"${v.name}" excluída.`, zh: (v) => `"${v.name}" 已删除。`,
      },
      metadata_updated: {
        en: (v) => `Metadata Model updated — ${v.practices} new Practice(s), ${v.categories} new Categor${v.categories === 1 ? 'y' : 'ies'}.`,
        es: (v) => `Modelo de Metadatos actualizado — ${v.practices} nueva(s) Práctica(s), ${v.categories} nueva(s) Categoría(s).`,
        pt: (v) => `Modelo de Metadados atualizado — ${v.practices} nova(s) Prática(s), ${v.categories} nova(s) Categoria(s).`,
        zh: (v) => `元数据模型已更新——新增 ${v.practices} 个领域，${v.categories} 个分类。`,
      },
      synthetic_content_updated: {
        en: (v) => `Synthetic/Curated Content updated — ${v.employees} new Employee(s), ${v.experiences} new Experience(s)/Key Insight(s), ${v.top3} new Top 3 item(s).`,
        es: (v) => `Contenido Sintético/Curado actualizado — ${v.employees} nuevo(s) Empleado(s), ${v.experiences} nueva(s) Experiencia(s)/Key Insight(s), ${v.top3} nuevo(s) elemento(s) Top 3.`,
        pt: (v) => `Conteúdo Sintético/Selecionado atualizado — ${v.employees} novo(s) Funcionário(s), ${v.experiences} nova(s) Experiência(s)/Key Insight(s), ${v.top3} novo(s) item(s) Top 3.`,
        zh: (v) => `合成/精选内容已更新——新增 ${v.employees} 名员工，${v.experiences} 条经验/Key Insights，${v.top3} 个 Top 3 项目。`,
      },
      quotes_updated: {
        en: (v) => `Quotes updated — ${v.added} new item(s).`, es: (v) => `Citas actualizadas — ${v.added} nuevo(s) elemento(s).`,
        pt: (v) => `Citações atualizadas — ${v.added} novo(s) item(ns).`, zh: (v) => `语录已更新——新增 ${v.added} 项。`,
      },
      videos_updated: {
        en: (v) => `Promotional Videos updated — ${v.added} new item(s).`, es: (v) => `Videos Promocionales actualizados — ${v.added} nuevo(s) elemento(s).`,
        pt: (v) => `Vídeos Promocionais atualizados — ${v.added} novo(s) item(ns).`, zh: (v) => `宣传视频已更新——新增 ${v.added} 项。`,
      },
      content_pages_updated: {
        en: (v) => `Content Pages updated — ${v.added} new item(s).`, es: (v) => `Páginas de Contenido actualizadas — ${v.added} nuevo(s) elemento(s).`,
        pt: (v) => `Páginas de Conteúdo atualizadas — ${v.added} novo(s) item(ns).`, zh: (v) => `内容页面已更新——新增 ${v.added} 项。`,
      },
      employee_added_to_company: {
        en: (v) => `Employee added successfully to ${v.company}!`, es: (v) => `¡Empleado agregado con éxito a ${v.company}!`,
        pt: (v) => `Funcionário adicionado com sucesso a ${v.company}!`, zh: (v) => `已成功将员工添加到 ${v.company}！`,
      },
      upload_complete: {
        en: (v) => `Upload complete! Added: ${v.added}, Errors/Skipped: ${v.errors}`, es: (v) => `¡Carga completa! Agregados: ${v.added}, Errores/Omitidos: ${v.errors}`,
        pt: (v) => `Upload concluído! Adicionados: ${v.added}, Erros/Ignorados: ${v.errors}`, zh: (v) => `上传完成！已添加：${v.added}，出错/跳过：${v.errors}`,
      },
      already_top_position: {
        en: (v) => `This experience is already set as Top ${v.position}`, es: (v) => `Esta experiencia ya está marcada como Top ${v.position}`,
        pt: (v) => `Esta experiência já está definida como Top ${v.position}`, zh: (v) => `这条经验已被设为 Top ${v.position}`,
      },
      deleted_experiences_comments: {
        en: (v) => `Deleted ${v.exp} experience(s) and ${v.com} comment(s).`, es: (v) => `Se eliminaron ${v.exp} experiencia(s) y ${v.com} comentario(s).`,
        pt: (v) => `Excluídas ${v.exp} experiência(s) e ${v.com} comentário(s).`, zh: (v) => `已删除 ${v.exp} 条经验和 ${v.com} 条评论。`,
      },
      group_created_named: {
        en: (v) => `Group "${v.name}" created!`, es: (v) => `¡Grupo "${v.name}" creado!`,
        pt: (v) => `Grupo "${v.name}" criado!`, zh: (v) => `分组 "${v.name}" 已创建！`,
      },
      group_deleted_named: {
        en: (v) => `Group "${v.name}" deleted and data cleared!`, es: (v) => `¡Grupo "${v.name}" eliminado y datos borrados!`,
        pt: (v) => `Grupo "${v.name}" excluído e dados apagados!`, zh: (v) => `分组 "${v.name}" 已删除，数据已清空！`,
      },
      demo_id_limit_reached: {
        en: (v) => `You've reached your limit of ${v.limit} active Demo ID(s). Wait for one to expire, or ask the Default Admin to raise your limit.`,
        es: (v) => `Has alcanzado tu límite de ${v.limit} ID(s) Demo activos. Espera a que uno expire, o pide al Admin Default que aumente tu límite.`,
        pt: (v) => `Você atingiu seu limite de ${v.limit} ID(s) Demo ativo(s). Aguarde um expirar, ou peça ao Admin Default para aumentar seu limite.`,
        zh: (v) => `您已达到 ${v.limit} 个活跃演示 ID 的上限。请等待其中一个到期，或联系 Default 管理员提高您的限额。`,
      },
      employee_login_toggled: {
        en: (v) => `Employee login ${v.state}!`, es: (v) => `¡Inicio de sesión de empleado ${v.state}!`,
        pt: (v) => `Login de funcionário ${v.state}!`, zh: (v) => `员工登录已${v.state}！`,
      },
      document_upload_toggled: {
        en: (v) => `Document upload ${v.state}!`, es: (v) => `¡Subida de documentos ${v.state}!`,
        pt: (v) => `Envio de documentos ${v.state}!`, zh: (v) => `文件上传已${v.state}！`,
      },
      all_data_cleared_for: {
        en: (v) => `All data cleared for ${v.id}!`, es: (v) => `¡Todos los datos borrados para ${v.id}!`,
        pt: (v) => `Todos os dados apagados para ${v.id}!`, zh: (v) => `已清空 ${v.id} 的所有数据！`,
      },
      practice_created_named: {
        en: (v) => `Practice "${v.name}" created!`, es: (v) => `¡Práctica "${v.name}" creada!`,
        pt: (v) => `Prática "${v.name}" criada!`, zh: (v) => `领域 "${v.name}" 已创建！`,
      },
    };
    const dict = templates[key];
    if (!dict) return key;
    const fn = dict[effectiveViewingLanguage] || dict.en;
    return fn(vars);
  };
  // true só quando é o Admin do Default DE VERDADE, olhando pro próprio Default
  // (não um Admin de empresa espiando o Sample, que também usa dados do Default,
  // mas não deve ver as 5 seções exclusivas do Default).
  const showDefaultOnlyTools = isDefaultAdmin && isViewingDefault;
  // true quando um Admin de empresa (não Default, não seller) está no modo
  // "Sample" — nesse caso, tudo que ele vê é somente leitura (não pode editar
  // o conteúdo do Default). Sellers NUNCA caem aqui — eles sempre têm
  // leitura/escrita completa no que estão vendo (Default ou empresa própria),
  // igual um ID de demo.
  const isReadOnlyView = (!isDefaultAdmin && !isSeller && companyViewMode === 'sample') || (isSeller && !isSellerManagingOwnCompany && companyViewMode === 'sample');
  // Sessão de demo "atual" da própria conta (Master ou Seller) — carregada do
  // banco no login, gerada na hora se ainda não existir quando o primeiro
  // conteúdo for criado. Tudo que essa conta cria em modo demo leva essa marca.
  const [currentDemoSessionId, setCurrentDemoSessionId] = useState(() => {
    return localStorage.getItem('currentDemoSessionId') || null;
  });
  const [employeeSearch, setEmployeeSearch] = useState('');
  const [newEmployee, setNewEmployee] = useState({ employee_id: '', name: '', country: '', email: '', is_admin: false });
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [editingEmployeeData, setEditingEmployeeData] = useState({});
  // Fluxo unificado "1st Access or Set / Reset Password" (substitui First Access e Forgot Password separados)
  const [showAccountAccess, setShowAccountAccess] = useState(false);
  const [accountAccessStep, setAccountAccessStep] = useState('lookup'); // 'lookup' | 'choose-match' | 'confirm-company' | 'verify' | 'set-password' | 'done'
  const [accountAccessJustBlocked, setAccountAccessJustBlocked] = useState(false);
  const [accountAccessEmail, setAccountAccessEmail] = useState('');
  const [accountAccessEmployeeId, setAccountAccessEmployeeId] = useState('');
  const [accountAccessMatches, setAccountAccessMatches] = useState([]);
  const [accountAccessRecord, setAccountAccessRecord] = useState(null);
  const [accountAccessCode, setAccountAccessCode] = useState('');
  const [accountAccessCodeInput, setAccountAccessCodeInput] = useState('');
  const [accountAccessPassword, setAccountAccessPassword] = useState('');
  const [accountAccessConfirmPassword, setAccountAccessConfirmPassword] = useState('');
  const [accountAccessError, setAccountAccessError] = useState('');
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
  // Linkagem manual de Experience a Common Case (feita pelo usuário, não
  // sugerida automaticamente pelo app) — guarda a experience sendo linkada
  // (ou null se o popup estiver fechado) e a escolha atual do radio button.
  const [linkingExperience, setLinkingExperience] = useState(null);
  const [selectedCommonCaseForLink, setSelectedCommonCaseForLink] = useState(null);
  
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
  loadCompanies();
  loadCompanyLogos();
  loadSellers();
  loadUITranslations();
  loadEditionDefaults();
  loadEditionBranding();
  (async () => {
    await runExpiredDemoCleanup();
    await loadDemoGroups();
  })();
}, []);

// Carrega/recarrega tudo que depende de qual empresa estamos usando, sempre
// que já soubermos isso (Default assim que companies terminar de carregar,
// ou quando o contexto mudar — dropdown do Master ou modo Sample da empresa).
useEffect(() => {
  // Não roda enquanto "companies" ainda não carregou — antes disso,
  // defaultCompanyId é null e isViewingDefault fica errado (false), fazendo
  // o filtro de idioma ser pulado e trazer as 4 línguas misturadas.
  if (effectiveCompanyId && companies.length > 0) {
    loadEmployees(effectiveCompanyId);
    loadExperiences();
    loadTopExperiences();
    loadQuotes();
    loadContentPages();
    loadPromotionalVideos();
    loadProblemCategories();
    loadPractices();
    loadPageSubtitles();
    loadAllContentPages();
    loadAppSettings();
    // Sem isso, "Manage Demo Groups" ficava com dado parado desde o carregamento
    // inicial do app — trocar de sessão (logar como um Demo ID, sair, entrar
    // como Seller) não recarregava, já que aqui é tudo client-side sem reload
    // de página real.
    loadDemoGroups();
  }
}, [effectiveCompanyId, effectiveViewingLanguage, companyEdition, defaultCompanyId, companies.length, loggedInSellerId]);

// Limpeza automática: assim que o Master/Seller troca o "Managing" pra uma
// empresa real (saindo do Default direto), qualquer sessão de demo ativa é
// apagada — o modo demo só existe enquanto se está navegando o Default puro.
useEffect(() => {
  if (adminCompanyContext && currentDemoSessionId) {
    deleteDemoSession(currentDemoSessionId, { silent: true });
  }
}, [adminCompanyContext]);

// Carrega a visibilidade que a própria empresa (não Default) liberou pro ADM Master
// — usada tanto pra ela mesma configurar (seus próprios checkboxes) quanto pro
// Master ou Seller consultar, quando está "Managing" essa empresa especificamente.
useEffect(() => {
  if (isDefaultAdmin && adminCompanyContext) {
    // Master navegando pra outra empresa via "Managing"
    loadCompanyMasterVisibility(adminCompanyContext);
  } else if (isSeller && adminCompanyContext) {
    // Seller navegando pra uma das próprias empresas via "Managing"
    loadCompanyMasterVisibility(adminCompanyContext);
  } else if (loggedInEmployeeCompanyId && !isDefaultAdmin && !isSeller) {
    // Empresa comum consultando/configurando a própria visibilidade
    loadCompanyMasterVisibility(loggedInEmployeeCompanyId);
  } else {
    setCompanyMasterVisibility([]);
    setCompanyMasterVisibilityRowExists(false);
  }
}, [loggedInEmployeeCompanyId, isDefaultAdmin, isSeller, adminCompanyContext]);

// true quando o Master (ou um Seller navegando pra uma das PRÓPRIAS empresas)
// está gerenciando uma empresa que não é o próprio Default — nesse caso, as
// seções ficam limitadas ao que essa empresa autorizou. Sem isso pro Seller,
// ele veria TODAS as seções de qualquer empresa que criasse, sem restrição
// nenhuma — era exatamente o bug relatado.
const masterMustRespectVisibility = (isDefaultAdmin || isSellerManagingOwnCompany) && !!adminCompanyContext;
// true quando o Master/Seller, gerenciando outra empresa, ainda não foi
// autorizado a ver as abas públicas (See What Others Did / Share Your
// Experience) — a empresa precisa ter liberado "Synthetic/Curated Content"
// pra isso aparecer. Não se aplica à navegação do Master/Seller no PRÓPRIO
// Default (isDemoModeActive) — só quando estão "dentro" de uma empresa real.
// true quando o seller está em "My Seller View" (não gerenciando nenhuma
// empresa) — nesse estado, só Manage Companies e Manage Demo Groups devem
// aparecer; toda a navegação pública (abas, Top 3, marquee, carrossel,
// cabeçalho com nome/logo do Default) fica escondida.
// true quando o seller está em "My Seller View" (não gerenciando nenhuma
// empresa) E ainda dentro do painel Admin — nesse estado, só Manage Companies
// e Manage Demo Groups devem aparecer. Precisa de "&& isAdmin": depois do
// Logout ADM, o seller volta a navegar o Default normalmente (é literalmente
// o propósito do Demo Mode), então essa restrição não pode continuar valendo.
const isSellerBaseView = isSeller && !isSellerManagingOwnCompany && isAdmin && companyViewMode !== 'sample';
const masterBlockedFromPublicTabs = (masterMustRespectVisibility && !companyMasterVisibility.includes('synthetic')) || isSellerBaseView;
// true quando escrever (Share Your Experience, comentar, avaliar) deve ficar
// bloqueado — só o modo Sample de sempre (preview read-only de uma empresa
// comum). Não bloqueia mais o Master/Seller "Managing" outra empresa de
// forma cega: cada seção já é liberada individualmente pela própria empresa
// via Section Settings (companyMasterVisibility) — se ela autorizou ver, a
// intenção é também poder editar aquilo ali, não só olhar.
const isReadOnlyOrMasterManaging = isReadOnlyView;
// Exceção pro problema do ovo-e-galinha: uma empresa recém-criada não tem
// ninguém ainda pra configurar a visibilidade pro Master/Seller — então,
// enquanto essa empresa NUNCA tiver salvo suas próprias configurações de
// "Section Settings" (nem que seja pra não liberar nada), quem está
// gerenciando (Default Admin OU Seller, ambos via "Managing") continua
// vendo Manage Employees, pra poder cadastrar o primeiro ADM. Importante: o
// critério é "a empresa nunca configurou visibilidade" (existe uma LINHA em
// company_master_visibility), não "existe um employee is_admin" — porque o
// próprio ato de cadastrar o ADM já marcaria is_admin=true, fazendo a seção
// sumir antes mesmo desse ADM ter tido a chance de logar e configurar algo.
const canBootstrapFirstAdmin = !!adminCompanyContext && !companyMasterVisibilityRowExists;
// true só quando dá pra gerenciar de verdade os dados de UMA empresa (Manage
// Employees, Manage Categories/Practices, Quotes, Content Pages, App Config,
// etc.). Verdadeiro pra todo mundo (Default Admin, Admin de empresa comum)
// EXCETO um seller navegando o Default puro (sem ter escolhido, via
// "Managing", uma das próprias empresas) — ali ele só tem leitura/escrita nas
// abas públicas (See What Others Did / Share Your Experience) e as ferramentas
// "Manage Companies" / "Manage Demo Groups", nunca as seções administrativas
// exclusivas do Default de verdade.
// Verdadeiro pra todo mundo (Default Admin, Admin de empresa comum — inclusive
// no próprio Sample deles) EXCETO um seller no "My Seller View" ou gerenciando
// outra empresa que não a sua. No "Sample" do seller, TAMBÉM tem que ser
// verdadeiro: é pra ele ver os painéis admin do Default (travados pra leitura),
// exatamente como uma empresa comum vê no Sample dela.
const canManageThisCompany = !isSeller || isSellerManagingOwnCompany || companyViewMode === 'sample';

// Se entrar em modo Sample enquanto estava na aba "Share Your Experience"
// (que não existe mais nesse modo), volta pra "See What Others Did".
useEffect(() => {
  if (isReadOnlyOrMasterManaging && activeMainTab === 'share') {
    setActiveMainTab('see');
  }
}, [isReadOnlyOrMasterManaging]);

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

// Detecta o link de auto-cadastro Pro (?signup=professional|contratante&code=XXX)
// — só resolve depois que companies carregou, já que precisa achar a
// empresa pelo Company Code.
useEffect(() => {
  if (companies.length === 0) return;
  const params = new URLSearchParams(window.location.search);
  const signupRole = params.get('signup');
  const signupCode = params.get('code');
  if (!signupRole || !signupCode) return;
  if (signupRole !== 'professional' && signupRole !== 'contratante') return;
  const company = companies.find(c => c.code === signupCode && c.edition === 'pro' && c.active);
  if (!company) {
    setProSignupInfo('invalid');
    return;
  }
  setProSignupInfo({ role: signupRole, company });
}, [companies]);

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
  if (autoOpenedInstall) {
    // Veio do link do WhatsApp: fechar a aba é uma ação do navegador, não
    // depende de pra onde a página navega. Em vez de tentar navegar (o que
    // se mostrou pouco confiável nesse contexto — risco de Universal
    // Link), só trocamos nossa própria tela por uma com instruções claras
    // de como fechar a aba.
    setInstallLogoutMessage(false);
    setExitRequested(true);
  } else {
    window.history.back();
  }
};

const handleIconInstalled = () => {
  setShowIosInstallModal(false);
  if (autoOpenedInstall) {
    setInstallLogoutMessage(false);
    setExitRequested(true);
  } else {
    window.history.back();
  }
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

// "Chave de desligar na hora" — enquanto alguém está logado (Demo ID,
// employee comum, Seller, Admin), o app escuta em tempo real (Supabase
// Realtime) se o próprio registro dela na tabela employees foi apagado
// OU marcado como "retired" (o botão de Delete de um Demo ID dentro de
// um Grupo não apaga a linha, só aposenta com retired:true/active:false).
// Em qualquer um dos dois casos, ela é deslogada imediatamente, mesmo
// sem recarregar a página ou fazer qualquer ação.
useEffect(() => {
  if (!isEmployeeLoggedIn || !employeeId) return;

  const channel = supabase
    .channel(`employee-kill-switch-${employeeId}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'employees', filter: `employee_id=eq.${employeeId}` },
      (payload) => {
        const wasDeleted = payload.eventType === 'DELETE';
        const wasRetired = payload.eventType === 'UPDATE' && (payload.new?.retired === true || payload.new?.active === false);
        // "Delete Group" não apaga nem aposenta o ID — só solta ele de
        // volta pro pool (group_id: null), pra reuso futuro num grupo
        // novo. Só conta como "derrubar" se for um Demo ID (is_demo) que
        // tinha grupo e ficou sem — um employee comum sempre tem
        // group_id nulo por natureza, isso sozinho não significa nada.
        const wasReleasedFromGroup = payload.eventType === 'UPDATE' && payload.new?.is_demo === true && payload.new?.group_id === null;
        // Sessão única por ID: se o token no banco mudou pra algo diferente
        // do que EU tenho salvo, é porque alguém logou com o mesmo ID em
        // outro lugar — a sessão mais nova vence, essa aqui se desconecta.
        const wasSupersededByNewLogin = payload.eventType === 'UPDATE' && payload.new?.current_session_token && payload.new.current_session_token !== mySessionToken;
        if (wasDeleted || wasRetired || wasReleasedFromGroup || wasSupersededByNewLogin) {
          alert(t('session_ended_by_admin'));
          handleEmployeeLogout();
        }
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}, [isEmployeeLoggedIn, employeeId, mySessionToken]);

// Rede de segurança pro caso do ID já ter sido apagado/aposentado/solto
// do grupo (ou substituído por outro login) ANTES dessa proteção existir,
// ou se o Realtime não estiver disponível por algum motivo — o Realtime só
// avisa de mudanças que acontecem enquanto a escuta já está ativa, não
// "recupera" algo que já aconteceu no passado. Essa checagem pergunta ao
// banco, de tempos em tempos, "meu próprio ID ainda existe e está válido?".
useEffect(() => {
  if (!isEmployeeLoggedIn || !employeeId) return;

  const checkStillValid = async () => {
    const { data, error } = await supabase
      .from('employees')
      .select('retired, active, is_demo, group_id, current_session_token')
      .eq('employee_id', employeeId)
      .maybeSingle();
    if (error) {
      console.error('Kill-switch: erro na consulta de validade da sessão:', error);
      return;
    }
    const wasReleasedFromGroup = data?.is_demo === true && data?.group_id === null;
    const wasSupersededByNewLogin = data?.current_session_token && data.current_session_token !== mySessionToken;
    if (!data || data.retired === true || data.active === false || wasReleasedFromGroup || wasSupersededByNewLogin) {
      alert(t('session_ended_by_admin'));
      handleEmployeeLogout();
    }
  };

  const intervalId = setInterval(checkStillValid, 30000); // a cada 30s
  return () => clearInterval(intervalId);
}, [isEmployeeLoggedIn, employeeId, mySessionToken]);
  
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
  
const loadExperiences = async (skipLoading = false, loggedEmpId = null, overrideDemoSessionId = undefined) => {
  // Um Group Demo ID (Prospect testando o app) vê o CONTEÚDO do Default —
  // mesma experiência que o ADM Default/Seller veem em modo Demo. O
  // branding (nome/logo) continua vindo da própria empresa/Prospect
  // (effectiveCompanyId, sem mudança) — só o CONTEÚDO desviado aqui,
  // contido só dentro dessa função.
  const contentCompanyId = loggedInIsDemoId ? defaultCompanyId : effectiveCompanyId;
  const isContentDefault = contentCompanyId === defaultCompanyId;
  if (!contentCompanyId) {
    console.log('🔴 loadExperiences ABORTOU — contentCompanyId está vazio/nulo');
    return;
  }
  // Se quem chamou já sabe o valor certo de agora (ex: acabou de gerar uma
  // sessão de demo nova nesse mesmo instante), usa esse valor em vez do
  // state — o state só reflete no próximo render, e por isso a chamada
  // explícita logo após criar conteúdo em modo demo pegava um valor
  // "preso" (antigo), fazendo o item recém-criado não aparecer até a
  // próxima ação atualizar o state de verdade.
  const activeDemoSessionId = overrideDemoSessionId !== undefined ? overrideDemoSessionId : currentDemoSessionId;
  // Marca essa chamada como a mais recente.
  latestExperiencesRequestRef.current += 1;
  const thisRequestId = latestExperiencesRequestRef.current;
  console.log(`🔵 loadExperiences #${thisRequestId} INICIOU — company=${contentCompanyId}, lang=${effectiveViewingLanguage}, isContentDefault=${isContentDefault}, demoSession=${activeDemoSessionId}, skipLoading=${skipLoading}`);
  try {
    if (!skipLoading) {
      setLoading(true);
    }

    // Função auxiliar — busca um lote (range) de experiences. Conteúdo real
    // (sem demo_session_id) sempre respeita o idioma escolhido; a sessão de
    // demo ATIVA aparece sempre, em qualquer idioma — sem isso, editar uma
    // experience sintética durante a demo e depois trocar idioma escondia
    // a edição (a linha continuava com o idioma original, e sumia do
    // filtro). Duas consultas simples, combinadas aqui em JS.
    const fetchExperiencesRange = async (rangeStart, rangeEnd) => {
      if (isContentDefault && activeDemoSessionId) {
        const realQuery = supabase.from('experiences').select('*')
          .eq('company_id', contentCompanyId)
          .eq('language', effectiveViewingLanguage)
          .is('demo_session_id', null)
          .order('source', { ascending: true }).order('id', { ascending: false })
          .range(rangeStart, rangeEnd);
        const demoQuery = supabase.from('experiences').select('*')
          .eq('company_id', contentCompanyId)
          .eq('demo_session_id', activeDemoSessionId)
          .order('source', { ascending: true }).order('id', { ascending: false })
          .range(rangeStart, rangeEnd);
        const [realResult, demoResult] = await Promise.all([realQuery, demoQuery]);
        if (realResult.error) throw realResult.error;
        if (demoResult.error) throw demoResult.error;
        return [...(realResult.data || []), ...(demoResult.data || [])];
      }
      let query = supabase.from('experiences').select('*').eq('company_id', contentCompanyId);
      if (isContentDefault) {
        query = query.eq('language', effectiveViewingLanguage);
      }
      query = activeDemoSessionId
        ? query.or(`demo_session_id.is.null,demo_session_id.eq.${activeDemoSessionId}`)
        : query.is('demo_session_id', null);
      const { data, error } = await query
        .order('source', { ascending: true }).order('id', { ascending: false })
        .range(rangeStart, rangeEnd);
      if (error) throw error;
      return data || [];
    };

    // Buscar primeiro lote (0-999) - Supabase limita em 1000
    const batch1 = await fetchExperiencesRange(0, 999);
    // Buscar segundo lote (1000-1999) - pega as 53 restantes
    const batch2 = await fetchExperiencesRange(1000, 1999);
    
    // Combinar os 2 lotes
    let data = [...batch1, ...batch2];

    // Corrige related_common_case_id pra Individual Experiences não-inglesas.
    // Duas causas possíveis, resolvidas juntas: (a) o valor aponta pro id da
    // versão em inglês, que não existe no conjunto do idioma atual; (b) o
    // valor nunca foi gravado nas traduções (fica nulo) — nesse caso, busca
    // o valor da própria linha em inglês (mesmo translation_group_id) e
    // resolve a partir dali. As duas resolvidas via translation_group_id.
    let relatedIdFix = {};
    if (isContentDefault && effectiveViewingLanguage !== 'en') {
      const idsInCurrentSet = new Set(data.map(e => e.id));
      const rowsWithGroup = data.filter(e => e.translation_group_id);
      const ownGroupIds = [...new Set(rowsWithGroup.map(e => e.translation_group_id))];
      const pointedIds = [...new Set(data.map(e => e.related_common_case_id).filter(Boolean))]
        .filter(id => !idsInCurrentSet.has(id));

      // (b) Busca a versão em inglês de cada linha atual, pra pegar o
      // related_common_case_id de lá quando o da tradução estiver vazio.
      let englishRelatedByGroup = {};
      if (ownGroupIds.length > 0) {
        const { data: englishRows } = await supabase
          .from('experiences')
          .select('translation_group_id, related_common_case_id')
          .eq('company_id', contentCompanyId)
          .eq('language', 'en')
          .in('translation_group_id', ownGroupIds);
        (englishRows || []).forEach(r => {
          if (r.related_common_case_id) englishRelatedByGroup[r.translation_group_id] = r.related_common_case_id;
        });
      }

      // Junta os alvos a resolver: os que já apontavam (errado) + os que
      // vieram da versão em inglês por estarem vazios na tradução.
      const allTargetIds = [...new Set([...pointedIds, ...Object.values(englishRelatedByGroup)])]
        .filter(id => !idsInCurrentSet.has(id));

      if (allTargetIds.length > 0) {
        const { data: sourceRows } = await supabase
          .from('experiences')
          .select('id, translation_group_id')
          .in('id', allTargetIds);
        const groupByOriginalId = {};
        (sourceRows || []).forEach(r => { groupByOriginalId[r.id] = r.translation_group_id; });
        const groupIds = [...new Set(Object.values(groupByOriginalId).filter(Boolean))];
        let translatedByGroup = {};
        if (groupIds.length > 0) {
          const { data: translatedRows } = await supabase
            .from('experiences')
            .select('id, translation_group_id')
            .eq('company_id', contentCompanyId)
            .eq('language', effectiveViewingLanguage)
            .in('translation_group_id', groupIds);
          (translatedRows || []).forEach(r => { translatedByGroup[r.translation_group_id] = r.id; });
        }
        // Mapa direto: id apontado (errado ou vindo do inglês) -> id certo no idioma atual
        const resolveTarget = {};
        allTargetIds.forEach(targetId => {
          const groupId = groupByOriginalId[targetId];
          if (groupId && translatedByGroup[groupId]) {
            resolveTarget[targetId] = translatedByGroup[groupId];
          }
        });
        // Aplica: se a própria linha já apontava pra um id resolvível, usa esse;
        // senão, se a versão em inglês tinha um valor, usa o resolvido dele.
        rowsWithGroup.forEach(row => {
          if (row.related_common_case_id && resolveTarget[row.related_common_case_id]) {
            relatedIdFix[row.id] = resolveTarget[row.related_common_case_id];
          } else {
            const englishTarget = englishRelatedByGroup[row.translation_group_id];
            if (englishTarget && resolveTarget[englishTarget]) {
              relatedIdFix[row.id] = resolveTarget[englishTarget];
            }
          }
        });
      }
    }
    
    const transformedData = data.map(exp => ({
      id: exp.id,
      problem: exp.problem,
      problemCategory: exp.problem_category,
      solution: exp.solution,
      result: exp.result,
      resultCategory: exp.result_category,
      industrySector: exp.industry_sector || '', // ⭐ ADICIONAR
      relatedCommonCaseId: relatedIdFix[exp.id] || exp.related_common_case_id || null, // ⭐ ADICIONAR
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
      companyId: exp.company_id || null,
      demoSessionId: exp.demo_session_id || null,
      practiceId: exp.practice_id || null,
      tags: exp.tags || [],
      parentExperienceId: exp.parent_experience_id || null,
      createdAt: exp.created_at || null,
      language: exp.language || 'en',
      comments: []
    }));
    
    let allCommentsQuery = supabase
      .from('comments')
      .select('*')
      .order('created_at', { ascending: true });
    allCommentsQuery = activeDemoSessionId
      ? allCommentsQuery.or(`demo_session_id.is.null,demo_session_id.eq.${activeDemoSessionId}`)
      : allCommentsQuery.is('demo_session_id', null);
    const { data: allComments } = await allCommentsQuery;

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
      cvFilename: c.cv_filename || null,
      createdAt: c.created_at || null
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
  const { data: empData, error: empError } = await supabase
    .from('employees')
    .select('group_id, is_demo')
    .eq('employee_id', resolvedEmpId || '')
    .maybeSingle();
  if (empError) console.log('🔴 ERRO ao buscar empData:', empError);

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

const hasNewSyntheticItems = shuffleOrderRef.current
  ? syntheticExps.some(e => !shuffleOrderRef.current.includes(e.id))
  : false;
if (!shuffleOrderRef.current || shuffleOrderCompanyRef.current !== contentCompanyId || shuffleOrderLanguageRef.current !== effectiveViewingLanguage || hasNewSyntheticItems) {
  for (let i = syntheticExps.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [syntheticExps[i], syntheticExps[j]] = [syntheticExps[j], syntheticExps[i]];
  }
  shuffleOrderRef.current = syntheticExps.map(e => e.id);
  shuffleOrderCompanyRef.current = contentCompanyId;
  shuffleOrderLanguageRef.current = effectiveViewingLanguage;
}

const orderedSynthetic = shuffleOrderRef.current
  .map(id => syntheticExps.find(e => e.id === id))
  .filter(Boolean);

const allExps = [...keyInsights, ...userExps, ...orderedSynthetic];
// A trava de "descartar resultado desatualizado" protege contra um cenário
// real: uma chamada mais LENTA (ex: buscando mais dados sem filtro) terminar
// DEPOIS de uma chamada mais RÁPIDA e correta, sobrescrevendo o resultado
// certo com o errado. A causa raiz de ela disparar sem necessidade (chamada
// automática rodando antes de "companies" carregar) já foi corrigida acima
// (guard "companies.length > 0" no useEffect). Com isso corrigido, chamadas
// EXPLÍCITAS (skipLoading=true — sempre disparadas manualmente logo depois de
// uma ação concluída, tipo import/delete/comentário) voltam a ser imunes:
// representam "acabei de mudar dados, mostre agora" e não podem ser
// descartadas só porque uma automática rodou em paralelo.
if (!skipLoading && latestExperiencesRequestRef.current !== thisRequestId) {
  console.log('🟠 loadExperiences IGNOROU resultado desatualizado — request #', thisRequestId, 'mas o mais recente agora é #', latestExperiencesRequestRef.current);
  return;
}
console.log(`🟢 loadExperiences #${thisRequestId} CONCLUIU — ${allExps.length} total (${keyInsights.length} key insights, ${userExps.length} app, ${orderedSynthetic.length} synthetic)`);
setExperiences(allExps);

// Carregar reações dos últimos comentários visíveis (bloco default)
const lastCommentIds = allExps
  .filter(e => e.comments?.length > 0)
  .map(e => e.comments[e.comments.length - 1].id);
if (lastCommentIds.length > 0) {
  const { data: reactData } = await supabase
    .from('reactions')
    .select('comment_id, emoji, employee_id')
    .in('comment_id', lastCommentIds);
  if (reactData?.length) {
    const grouped = {};
    reactData.forEach(r => {
      if (!grouped[r.comment_id]) grouped[r.comment_id] = {};
      if (!grouped[r.comment_id][r.emoji]) grouped[r.comment_id][r.emoji] = [];
      grouped[r.comment_id][r.emoji].push(r.employee_id);
    });
    setReactions(prev => ({ ...prev, ...grouped }));
  }
  // Inicializar IDs sem reações para o ícone aparecer
  setReactions(prev => {
    const updated = { ...prev };
    lastCommentIds.forEach(id => {
      if (!updated[id]) updated[id] = {};
    });
    return updated;
  });
}
  } catch (error) {
    console.error('Error loading experiences:', error);
    alert(t('error_loading_data'));
  } finally {
    if (!skipLoading) {
      setLoading(false);
    }
  }
};

const loadTopExperiences = async () => {
    if (!effectiveCompanyId) return;
    try {
      const { data, error } = await supabase
        .from('top_experiences')
        .select('position, experience_id')
        .eq('company_id', effectiveCompanyId);
      
      if (error) throw error;
      
      const topExp = { 1: null, 2: null, 3: null };
      const rawIds = (data || []).map(d => d.experience_id).filter(Boolean);

      // O Top 3 guarda o id de UMA linha específica (a que foi marcada na hora
      // de configurar) — mas cada idioma é uma linha diferente. Sem resolver
      // isso, o Top 3 só aparecia quando o idioma ativo era o mesmo em que foi
      // configurado (inglês). Resolve pro id certo no idioma atual via
      // translation_group_id, que já existe desde a tradução do conteúdo.
      let resolvedByOriginalId = {};
      if (rawIds.length > 0 && isViewingDefault) {
        const { data: sourceRows } = await supabase
          .from('experiences')
          .select('id, translation_group_id')
          .in('id', rawIds);
        const groupByOriginalId = {};
        (sourceRows || []).forEach(r => { groupByOriginalId[r.id] = r.translation_group_id; });
        const groupIds = [...new Set(Object.values(groupByOriginalId).filter(Boolean))];
        let translatedByGroup = {};
        if (groupIds.length > 0) {
          const { data: translatedRows } = await supabase
            .from('experiences')
            .select('id, translation_group_id')
            .eq('company_id', effectiveCompanyId)
            .eq('language', effectiveViewingLanguage)
            .in('translation_group_id', groupIds);
          (translatedRows || []).forEach(r => { translatedByGroup[r.translation_group_id] = r.id; });
        }
        rawIds.forEach(origId => {
          const groupId = groupByOriginalId[origId];
          resolvedByOriginalId[origId] = (groupId && translatedByGroup[groupId]) || origId;
        });
      }

      if (data) {
        data.forEach(item => {
          if (item.experience_id) {
            topExp[item.position] = resolvedByOriginalId[item.experience_id] || item.experience_id;
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
  if (!effectiveCompanyId) return;
  try {
    const { data, error } = await supabase
      .from('app_settings')
      .select('*')
      .eq('company_id', effectiveCompanyId)
      .maybeSingle();
    
    if (error) throw error;
    
    if (data) {
  setAppSettings({
    requireEmployeeLogin: data.require_employee_login !== false,
    editionName: data.edition_name,
    allowCvUpload: data.allow_cv_upload !== false,
    documentType: data.document_type || 'cv',
    showTop3: data.show_top3 || false,
    top3StartVisible: data.top3_start_visible !== false,
    showMarquee: data.show_marquee || false
  });
  // Se o campo opcional de nome (usado só pra decoração do cabeçalho)
  // nunca foi preenchido, cai no nome real da empresa — busca direto no
  // banco, sem depender do array `companies` (que pode ainda não estar
  // carregado nesse momento, já que é uma chamada assíncrona separada
  // disparada quase ao mesmo tempo — dependeria de sorte de timing).
  let resolvedName = data.company_name || '';
  if (!resolvedName) {
    const { data: companyRow } = await supabase.from('companies').select('name').eq('id', effectiveCompanyId).maybeSingle();
    resolvedName = companyRow?.name || '';
  }
  setCompanyName(resolvedName);
  setCompanyLogoUrl(data.company_logo_url || '');
  setCompanyNameSize(data.company_name_size || 'medium');
  setCompanyLogoSize(data.company_logo_size || 'medium');
  setTop3VisibleInSession(data.top3_start_visible !== false);
} else {
  // Essa empresa ainda não tem uma linha de app_settings — cria uma com
  // valores padrão, pra não quebrar os updates (que dependem de já existir
  // uma linha pra dar .eq('company_id', ...) e achar algo).
  const companyEditionForDefaults = companies.find(comp => comp.id === effectiveCompanyId)?.edition || 'corp';
  const defaultDocType = companyEditionForDefaults === 'pro' ? 'cv' : 'other';
  const { error: insertError } = await supabase.from('app_settings').insert([{
    company_id: effectiveCompanyId,
    require_employee_login: true,
    edition_name: 'corp',
    allow_cv_upload: true,
    document_type: defaultDocType,
    show_top3: false,
    top3_start_visible: true,
    show_marquee: false
  }]);
  if (!insertError) {
    setAppSettings({
      requireEmployeeLogin: true, editionName: 'corp', allowCvUpload: true,
      documentType: defaultDocType, showTop3: false, top3StartVisible: true, showMarquee: false
    });
    const { data: companyRow } = await supabase.from('companies').select('name').eq('id', effectiveCompanyId).maybeSingle();
    setCompanyName(companyRow?.name || '');
    setCompanyLogoUrl('');
    setCompanyNameSize('medium');
    setCompanyLogoSize('medium');
    setTop3VisibleInSession(true);
  }
}
  } catch (error) {
    console.error('Error loading app settings:', error);
  }
};

const loadProblemCategories = async (practiceId = null) => {
  // Mesma regra de loadExperiences: Group Demo ID vê o conteúdo do
  // Default, mesmo tendo seu próprio branding.
  const contentCompanyId = loggedInIsDemoId ? defaultCompanyId : effectiveCompanyId;
  const isContentDefault = contentCompanyId === defaultCompanyId;
  if (!contentCompanyId) return;
  try {
    let query = supabase
      .from('problem_categories')
      .select('*')
      .eq('active', true)
      .eq('company_id', contentCompanyId)
      .order('display_order', { ascending: true });
    if (isContentDefault) {
      query = query.eq('language', effectiveViewingLanguage);
    }

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
    } else {
      // Sem categorias pra essa empresa/practice — limpa qualquer resíduo de
      // uma empresa anterior, não deixa "herdado" na tela.
      setProblemCategories([]);
      setCategoryData({});
    }
  } catch (error) {
    console.error('Error loading problem categories:', error);
  }
};

const loadDemoGroups = async () => {
  try {
    let query = supabase
      .from('demo_groups')
      .select(`
        *,
        employees!group_id (employee_id, name, is_demo, group_id, demo_expires_at, language, created_at, password, last_login_at)
      `)
      .order('created_at', { ascending: false });
    // Se quem está logado é um seller (não o Default Admin), só vê os grupos
    // que ele mesmo criou.
    if (loggedInSellerId) {
      query = query.eq('created_by_seller_id', loggedInSellerId);
    }
    const { data, error } = await query;
    if (error) throw error;
    setDemoGroups(data || []);
  } catch (error) {
    console.error('Error loading demo groups:', error);
  }
};

// ==================== VENDEDORES (SELLERS) ====================

// Carrega todas as contas de seller (Default-Admin-only — visão geral pra
// supervisão). Traz também a contagem de empresas e grupos de cada um.
const loadSellers = async () => {
  try {
    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .eq('is_seller', true)
      .order('created_at', { ascending: false });
    if (error) throw error;
    setSellers(data || []);
    setSellersLoaded(true);
  } catch (error) {
    console.error('Error loading sellers:', error);
  }
};

// Cria a conta do seller (passa pelo 1st Access normal) + os 10 Demo IDs
// dele, já prontos com senha simples (pw001..pw010) — são descartáveis, o
// seller reusa entre demos diferentes.
const createSeller = async () => {
  const sellerId = newSeller.employee_id.trim();
  const sellerName = newSeller.name.trim();
  const sellerEmail = newSeller.email.trim().toLowerCase();
  if (!sellerId || !sellerName) {
    alert(t('employee_id_name_required'));
    return;
  }
  // Email é obrigatório aqui — o fluxo de "1st Access" busca por email +
  // Employee ID juntos, então sem email o seller nunca consegue completar o
  // cadastro (a busca não encontra nada e a tela trava sem enviar o código).
  if (!sellerEmail) {
    alert(t('seller_email_required'));
    return;
  }
  setCreatingSeller(true);
  try {
    const { data: sellerRow, error: sellerError } = await supabase
      .from('employees')
      .insert([{
        employee_id: sellerId,
        name: sellerName,
        email: sellerEmail,
        company_id: defaultCompanyId,
        is_seller: true,
        // Precisa ser true — todos os painéis do seller (Managing, Manage
        // Companies, Manage Demo Groups) são condicionados a "isAdmin &&
        // isSeller". isDefaultAdmin já exclui sellers separadamente, então
        // isso não dá a ele acesso de Default Admin de verdade.
        is_admin: true,
        status: 'pending',
        active: true
      }])
      .select()
      .single();
    if (sellerError) throw sellerError;

    setNewSeller({ employee_id: '', name: '', email: '' });
    await loadSellers();
    alert(tAlert('seller_created', { name: sellerName }));
  } catch (error) {
    console.error('Error creating seller:', error);
    alert(t('error_creating_seller'));
  } finally {
    setCreatingSeller(false);
  }
};

const toggleSellerActive = async (sellerRowId, active) => {
  try {
    const { error } = await supabase.from('employees').update({ active }).eq('id', sellerRowId);
    if (error) throw error;
    await loadSellers();
  } catch (error) {
    console.error('Error updating seller:', error);
    alert(t('error_updating_seller'));
  }
};

// Apaga um seller: solta as referências em companies/demo_groups que ele
// criou (viram "sem dono", não são apagadas — o trabalho de venda fica de
// pé), limpa e apaga o pool de 10 Demo IDs dele, e por fim apaga a própria
// conta do seller.
const deleteSeller = async (sellerRowId, sellerName) => {
  if (!window.confirm(tConfirm('delete_seller', { name: sellerName }))) return;
  try {
    await supabase.from('companies').update({ created_by_seller_id: null }).eq('created_by_seller_id', sellerRowId);
    await supabase.from('demo_groups').update({ created_by_seller_id: null }).eq('created_by_seller_id', sellerRowId);

    const { data: demoEmps } = await supabase.from('employees').select('employee_id').eq('created_by_seller_id', sellerRowId);
    for (const emp of demoEmps || []) {
      await supabase.from('comments').delete().eq('employee_id', emp.employee_id);
      const { data: exps } = await supabase.from('experiences').select('id, cv_url').eq('employee_id', emp.employee_id);
      for (const exp of exps || []) {
        if (exp.cv_url) await deleteFileFromStorage(exp.cv_url);
      }
      await supabase.from('experiences').delete().eq('employee_id', emp.employee_id);
    }
    await supabase.from('employees').delete().eq('created_by_seller_id', sellerRowId);
    const { error: deleteError } = await supabase.from('employees').delete().eq('id', sellerRowId);
    if (deleteError) throw deleteError;

    await loadSellers();
    await loadCompanies();
    await loadDemoGroups();
    alert(tAlert('seller_deleted', { name: sellerName }));
  } catch (error) {
    console.error('Error deleting seller:', error);
    alert(t('error_deleting_seller') + ' ' + error.message);
  }
};

// Checagem "preguiçosa" de expiração de Demo IDs: roda uma vez por carregamento
// de página, disparada por QUALQUER usuário (não só sellers/Admin) — sem cron,
// sem Edge Function. Libera o ID de volta pro pool (não apaga o employee, ele
// é reutilizável), limpando as experiences/comments que ele gerou na demo.
// Sai do modo Admin — usado tanto pelo botão "Logout ADM" quanto pelo link
// "Admin Mode" do rodapé. Compartilhado de propósito: os dois precisam se
// comportar EXATAMENTE igual, senão um deles fica com o bug de reverter o
// idioma pro inglês (foi exatamente isso que aconteceu quando só um dos dois
// tinha a correção).
const exitAdminMode = () => {
  setIsAdmin(false);
  localStorage.removeItem('isAdmin');
  setAdminKeywords('');
  setShowAdminLogin(false);
  // Ao sair do Admin, sempre volta pro próprio contexto da pessoa — não deixa
  // "preso" navegando como outra empresa.
  setAdminCompanyContext(null);
  setCompanyViewMode('own');
  // Herda o idioma que estava selecionado no seletor manual, pra não voltar de
  // supetão pro inglês só porque saiu do modo Admin — mantém a navegação
  // contínua no mesmo idioma.
  setLoggedInEmployeeLanguage(viewingLanguage);
  localStorage.setItem('loggedInEmployeeLanguage', viewingLanguage);
};

const runExpiredDemoCleanup = async () => {
  try {
    const { data: expired, error } = await supabase
      .from('employees')
      .select('employee_id')
      .eq('is_demo', true)
      .not('demo_expires_at', 'is', null)
      .lt('demo_expires_at', new Date().toISOString());
    if (error || !expired || expired.length === 0) return;

    for (const emp of expired) {
      await supabase.from('comments').delete().eq('employee_id', emp.employee_id);
      const { data: exps } = await supabase.from('experiences').select('id, cv_url').eq('employee_id', emp.employee_id);
      for (const exp of exps || []) {
        if (exp.cv_url) await deleteFileFromStorage(exp.cv_url);
      }
      await supabase.from('experiences').delete().eq('employee_id', emp.employee_id);
      // Retira o ID pra sempre — diferente de antes, que só limpava
      // group_id/demo_expires_at e devolvia ele pro pool pra ser reatribuído.
      // Uma vez expirado, esse ID nunca mais é usado por ninguém.
      await supabase.from('employees').update({ group_id: null, demo_expires_at: null, retired: true, active: false }).eq('employee_id', emp.employee_id);
    }
  } catch (error) {
    // Silencioso de propósito — não deve travar a navegação de ninguém.
    console.error('Error in expired demo cleanup:', error);
  }
};

// ==================== DEMO MODE (Master/Seller navegando o Default) ====================

// Garante que existe uma sessão de demo pra essa conta antes de criar
// Experience/comentário em modo demo — gera uma nova só se ainda não tiver
// uma, e persiste tanto no state/localStorage quanto no próprio employee no
// banco (pra sobreviver a refresh de página).
const ensureDemoSessionId = async () => {
  if (currentDemoSessionId) return currentDemoSessionId;
  const newId = `demo-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  setCurrentDemoSessionId(newId);
  localStorage.setItem('currentDemoSessionId', newId);
  try {
    if (employeeId) {
      await supabase.from('employees').update({ current_demo_session_id: newId }).eq('employee_id', employeeId);
    }
  } catch (error) {
    console.error('Error persisting demo session id:', error);
  }
  return newId;
};

// Apaga tudo que pertence a uma sessão de demo específica: comentários,
// arquivos de CV, e as experiences em si. Usado tanto pelo botão manual
// "Delete Last Demo" quanto pela limpeza automática ao sair do modo demo.
const deleteDemoSession = async (sessionId, { silent } = {}) => {
  if (!sessionId) return;
  try {
    await supabase.from('comments').delete().eq('demo_session_id', sessionId);
    const { data: exps } = await supabase.from('experiences')
      .select('id, cv_url, demo_edit_original_snapshot').eq('demo_session_id', sessionId);

    // Separa em dois grupos: linhas que são edições temporárias de
    // experiences sintéticas JÁ EXISTENTES (têm uma cópia de segurança
    // guardada — precisam ser restauradas, não apagadas) vs linhas
    // genuinamente criadas do zero durante a demo (sem cópia — apaga
    // normalmente, como sempre foi).
    const toRestore = (exps || []).filter(exp => exp.demo_edit_original_snapshot);
    const toDelete = (exps || []).filter(exp => !exp.demo_edit_original_snapshot);

    for (const exp of toRestore) {
      const snap = exp.demo_edit_original_snapshot;
      await supabase.from('experiences').update({
        problem: snap.problem, problem_category: snap.problem_category,
        solution: snap.solution, result: snap.result,
        result_category: snap.result_category, author: snap.author,
        gender: snap.gender, age: snap.age, country: snap.country,
        // related_common_case_id só entra se a cópia de segurança
        // realmente guardou esse campo — snapshots mais antigos (feitos
        // antes de existir o recurso de linkar Common Case manualmente)
        // não têm essa chave, e não queremos apagar um valor real
        // gravando undefined nele.
        ...('related_common_case_id' in snap ? { related_common_case_id: snap.related_common_case_id } : {}),
        demo_session_id: null, demo_edit_original_snapshot: null
      }).eq('id', exp.id);
    }

    for (const exp of toDelete) {
      if (exp.cv_url) await deleteFileFromStorage(exp.cv_url);
    }
    if (toDelete.length > 0) {
      await supabase.from('experiences').delete().in('id', toDelete.map(e => e.id));
    }
    if (employeeId) {
      await supabase.from('employees').update({ current_demo_session_id: null }).eq('employee_id', employeeId);
    }
    setCurrentDemoSessionId(null);
    localStorage.removeItem('currentDemoSessionId');
    if (!silent) {
      await loadExperiences(true);
      alert(t('demo_content_deleted'));
    }
  } catch (error) {
    console.error('Error deleting demo session:', error);
    if (!silent) alert(t('error_deleting_demo_content') + ' ' + error.message);
  }
};

const loadCurrentEmployeeGroup = async (empId) => {
  try {
    const { data, error } = await supabase
      .from('employees')
      .select('group_id, is_demo')
      .eq('employee_id', empId)
      .maybeSingle();
    if (error) throw error;
    setCurrentEmployeeGroup(data?.group_id || null);
  } catch (error) {
    console.error('Error loading employee group:', error);
  }
};
 
const loadPractices = async () => {
  const contentCompanyId = loggedInIsDemoId ? defaultCompanyId : effectiveCompanyId;
  const isContentDefault = contentCompanyId === defaultCompanyId;
  if (!contentCompanyId) return;
  try {
    let query = supabase
      .from('practices')
      .select('*')
      .eq('active', true)
      .eq('company_id', contentCompanyId);
    if (isContentDefault) {
      query = query.eq('language', effectiveViewingLanguage);
    }
    const { data, error } = await query.order('display_order', { ascending: true });
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
    } else {
      // Empresa sem nenhuma Practice ainda (nada importado) — limpa qualquer
      // resíduo de uma empresa anterior, não deixa "herdado" na tela.
      setSelectedPracticeId(null);
      setAdminCategories([]);
    }
  } catch (error) {
    console.error('Error loading practices:', error);
  }
};

const loadAdminCategories = async (practiceId) => {
  const contentCompanyId = loggedInIsDemoId ? defaultCompanyId : effectiveCompanyId;
  const isContentDefault = contentCompanyId === defaultCompanyId;
  if (!contentCompanyId) return;
  try {
    let query = supabase
      .from('problem_categories')
      .select('*')
      .eq('active', true)
      .eq('company_id', contentCompanyId)
      .order('display_order', { ascending: true });
    if (isContentDefault) {
      query = query.eq('language', effectiveViewingLanguage);
    }
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

const loadEmployees = async (companyIdOverride) => {
  const cid = companyIdOverride ?? effectiveCompanyId;
  if (!cid) return; // ainda não sabemos qual empresa (companies não carregou ainda)
  try {
    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .eq('company_id', cid)
      .order('employee_id', { ascending: true });
    if (error) throw error;
    setEmployees(data || []);
  } catch (error) {
    console.error('Error loading employees:', error);
  }
};

// ==================== MULTI-EMPRESA ====================
const loadCompanies = async () => {
  try {
    const { data, error } = await supabase
      .from('companies')
      .select('*')
      .order('created_at', { ascending: true });
    if (error) throw error;
    setCompanies(data || []);
    setCompaniesLoaded(true);
  } catch (error) {
    console.error('Error loading companies:', error);
  }
};

// Carrega as traduções de UI do banco (tabela ui_translations) e monta um
// objeto { chave: { idioma: texto } }, igual ao formato do UI_STRINGS/
// TEMPLATE_STRINGS embutidos no código — assim t()/tt() usam o mesmo
// formato não importa se o texto veio do banco ou da reserva local.
const loadUITranslations = async () => {
  try {
    const { data, error } = await supabase
      .from('ui_translations')
      .select('key, language, text');
    if (error) throw error;
    const grouped = {};
    (data || []).forEach(row => {
      if (!grouped[row.key]) grouped[row.key] = {};
      grouped[row.key][row.language] = row.text;
    });
    setUiTranslationsDB(grouped);
  } catch (error) {
    console.error('Error loading UI translations (usando reserva embutida no código):', error);
  }
};

const addCompany = async () => {
  if (!newCompany.name.trim()) {
    alert(t('company_name_required'));
    return;
  }
  const code = newCompany.code.trim() || newCompany.name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-');
  try {
    const { data, error } = await supabase.from('companies').insert([{
      name: newCompany.name.trim(),
      code: code,
      edition: newCompany.edition,
      active: true,
      created_by_seller_id: isSeller ? loggedInSellerId : null
    }]).select().single();
    if (error) throw error;

    // Se um logo foi selecionado, faz o upload e já cria a linha de
    // app_settings da empresa nova com ele — assim, um Demo ID gerado
    // pra ela já mostra o logo certo desde o primeiro momento, sem
    // depender de nenhum import posterior.
    if (newCompany.logoFile && data) {
      try {
        const ext = newCompany.logoFile.name.split('.').pop();
        const path = `logo-company-${data.id}-${Date.now()}.${ext}`;
        const { error: upErr } = await supabase.storage.from('cvs').upload(path, newCompany.logoFile);
        if (upErr) throw upErr;
        const { data: { publicUrl } } = supabase.storage.from('cvs').getPublicUrl(path);
        const { error: settingsErr } = await supabase.from('app_settings').insert([{
          company_id: data.id, company_logo_url: publicUrl,
          require_employee_login: true, allow_cv_upload: true, document_type: newCompany.edition === 'pro' ? 'cv' : 'other',
          show_top3: false, top3_start_visible: true, show_marquee: false
        }]);
        if (settingsErr) throw settingsErr;
        setCompanyLogosById(prev => ({ ...prev, [data.id]: publicUrl }));
      } catch (logoError) {
        console.error('Error uploading company logo:', logoError);
        alert(t('generic_error') + ' ' + logoError.message);
      }
    }

    setNewCompany({ name: '', code: '', edition: 'corp', logoFile: null });
    await loadCompanies();
    // A empresa recém-criada vira o default de "Company" no dropdown de
    // contexto — não muda o contexto sozinho, só fica pronta caso escolham
    // "Company" a seguir.
    if (data) setSelectedCompanyForContext(data.id);
    alert(t('company_added_success'));
  } catch (error) {
    console.error('Error adding company:', error);
    alert(t('error_adding_company'));
  }
};

const toggleCompanyActive = async (companyId, active) => {
  try {
    const { error } = await supabase.from('companies').update({ active }).eq('id', companyId);
    if (error) throw error;
    await loadCompanies();
  } catch (error) {
    console.error('Error updating company:', error);
  }
};

// Apaga uma empresa e tudo que pertence só a ela: employees, experiences
// (e os arquivos de CV no storage), comments, practices/categories/quotes
// próprias (não as do Default), content pages, promotional videos, e a
// entrada de visibilidade do Master. Nunca mexe no Default.
const deleteCompany = async (companyId, companyName) => {
  if (companyId === defaultCompanyId) {
    alert(t('default_company_cannot_delete'));
    return;
  }
  if (!window.confirm(tConfirm('delete_company', { name: companyName }))) return;
  try {
    // Pega todas as experiences dessa empresa PRIMEIRO, pra poder limpar
    // comments e top_experiences por experience_id antes de apagar as
    // experiences em si — apagar as experiences antes quebra a constraint de
    // chave estrangeira de quem ainda as referencia (esse era o bug real).
    const { data: exps, error: expsError } = await supabase
      .from('experiences').select('id, cv_url').eq('company_id', companyId);
    if (expsError) throw expsError;
    const expIds = (exps || []).map(e => e.id);

    if (expIds.length > 0) {
      await supabase.from('comments').delete().in('experience_id', expIds);
      await supabase.from('top_experiences').delete().in('experience_id', expIds);
      for (const exp of exps) {
        if (exp.cv_url) await deleteFileFromStorage(exp.cv_url);
      }
      const { error: expDeleteError } = await supabase.from('experiences').delete().in('id', expIds);
      if (expDeleteError) throw expDeleteError;
    }
    // Limpa também comentários marcados com o company_id desta empresa
    // diretamente — cobre o caso de comentários feitos (antes de uma
    // correção anterior) num Demo ID, numa experience que pertencia ao
    // Default, mas gravados com o company_id da empresa real. Esses
    // ficam "órfãos": não aparecem no filtro por experience_id acima, mas
    // ainda bloqueiam o apagamento da empresa pela constraint.
    await supabase.from('comments').delete().eq('company_id', companyId);

    const { error: empDeleteError } = await supabase.from('employees').delete().eq('company_id', companyId);
    if (empDeleteError) throw empDeleteError;
    await supabase.from('practices').delete().eq('company_id', companyId);
    await supabase.from('problem_categories').delete().eq('company_id', companyId);
    await supabase.from('quotes').delete().eq('company_id', companyId);
    await supabase.from('content_pages').delete().eq('company_id', companyId);
    await supabase.from('promotional_videos').delete().eq('company_id', companyId);
    await supabase.from('company_master_visibility').delete().eq('company_id', companyId);
    await supabase.from('app_settings').delete().eq('company_id', companyId);
    const { error: deleteError, count } = await supabase.from('companies').delete({ count: 'exact' }).eq('id', companyId);
    if (deleteError) throw deleteError;
    if (!count) {
      throw new Error('Delete returned no rows affected — check RLS policies on the "companies" table (the anon key may not have DELETE permission).');
    }
    await loadCompanies();
    if (adminCompanyContext === companyId) setAdminCompanyContext(null);
    alert(tAlert('company_deleted', { name: companyName }));
  } catch (error) {
    console.error('Error deleting company:', error);
    alert(t('error_deleting_company') + ' ' + error.message);
  }
};

// Carrega quais seções essa empresa liberou pro ADM Master ver
const loadCompanyMasterVisibility = async (companyId) => {
  if (!companyId) return;
  try {
    const { data, error } = await supabase
      .from('company_master_visibility')
      .select('section_key')
      .eq('company_id', companyId)
      .maybeSingle();
    if (error) throw error;
    setCompanyMasterVisibility(data?.section_key || []);
    // Marca se já existe uma linha pra essa empresa — diferente de "section_key
    // vazio", que também pode significar "a empresa já configurou e escolheu
    // não liberar nada". Sem essa distinção não dá pra saber se é bootstrap
    // (empresa nova, ninguém mexeu ainda) ou uma escolha deliberada.
    setCompanyMasterVisibilityRowExists(data !== null);
  } catch (error) {
    console.error('Error loading company master visibility:', error);
  }
};

// Liga/desliga a visibilidade de uma seção específica pro ADM Master
const toggleMasterVisibility = async (sectionKey, checked) => {
  const updated = checked
    ? [...new Set([...companyMasterVisibility, sectionKey])]
    : companyMasterVisibility.filter(k => k !== sectionKey);
  setCompanyMasterVisibility(updated);
  try {
    const { error } = await supabase
      .from('company_master_visibility')
      .upsert({ company_id: effectiveCompanyId, section_key: updated, updated_at: new Date().toISOString() }, { onConflict: 'company_id' });
    if (error) throw error;
  } catch (error) {
    console.error('Error saving visibility:', error);
    alert(t('error_saving_visibility'));
  }
};

// Todas as seções que existem na coluna "View & Edit access" — usado pelo
// checkbox "ALL" no cabeçalho, pra marcar/desmarcar tudo de uma vez numa
// chamada só, em vez da empresa ter que marcar item por item.
const ALL_VISIBILITY_SECTION_KEYS = ['app_config', 'content_pages', 'keyword_filter', 'metadata', 'promotional_videos', 'quotes', 'synthetic'];
const toggleAllMasterVisibility = async (checked) => {
  const updated = checked ? ALL_VISIBILITY_SECTION_KEYS : [];
  setCompanyMasterVisibility(updated);
  try {
    const { error } = await supabase
      .from('company_master_visibility')
      .upsert({ company_id: effectiveCompanyId, section_key: updated, updated_at: new Date().toISOString() }, { onConflict: 'company_id' });
    if (error) throw error;
  } catch (error) {
    console.error('Error saving visibility:', error);
    alert(t('error_saving_visibility'));
  }
};
// Todas as seções que têm opção de Import — usado pelo checkbox "ALL" da
// coluna de Import. Não precisa chamar o banco: é só a seleção antes de
// clicar em "Import/Update".
const ALL_IMPORT_SECTION_KEYS = ['app_config', 'quotes', 'promotional_videos', 'content_pages', 'metadata', 'synthetic'];

// Importa o "pacote" ligado: Practices + Categories + Employees sintéticos +
// Experiences sintéticas (inclui Key Insights, já que são experiences com
// author = 'key_insights'). São importados juntos porque um depende do outro.
// Grupo 1: Metadata Model (Practices + Categories). Pula o que já foi
// importado antes (checa imported_from_id), então rodar de novo só traz
// itens novos do Default — não duplica, não mexe no que a empresa já criou.
const importMetadataModel = async () => {
  if (!effectiveCompanyId || effectiveCompanyId === defaultCompanyId) return;
  setImportingBundle(true);
  const batchId = `metadata-${Date.now()}`;
  try {
    const { data: alreadyImportedPractices } = await supabase
      .from('practices').select('imported_from_id').eq('company_id', effectiveCompanyId).not('imported_from_id', 'is', null).eq('active', true);
    const importedPracticeIds = new Set((alreadyImportedPractices || []).map(r => r.imported_from_id));

    const { data: defaultPractices, error: pErr } = await supabase
      .from('practices').select('*').eq('company_id', defaultCompanyId).eq('language', importLanguage);
    if (pErr) throw pErr;

    // Só importa Practices cuja lista de edições inclui a da própria empresa
    // (ou 'all') — evita uma empresa Corp trazer Practice marcada só como Edu.
    const matchingPractices = (defaultPractices || []).filter(p =>
      p.applicable_editions === 'all' || (p.applicable_editions || 'corp,pro').split(',').includes(companyEdition)
    );

    let addedPractices = 0;
    for (const p of matchingPractices) {
      if (importedPracticeIds.has(p.id)) continue; // já importado antes, pula
      const { error } = await supabase.from('practices').insert([{
        name: p.name, show_in_ui: p.show_in_ui, display_order: p.display_order, active: p.active,
        applicable_editions: p.applicable_editions,
        company_id: effectiveCompanyId, imported_from_id: p.id, import_batch_id: batchId
      }]);
      if (error) throw error;
      addedPractices++;
    }

    const { data: alreadyImportedCategories } = await supabase
      .from('problem_categories').select('id, imported_from_id, practice_id').eq('company_id', effectiveCompanyId).not('imported_from_id', 'is', null).eq('active', true);
    const importedCategoryIds = new Set((alreadyImportedCategories || []).map(r => r.imported_from_id));

    // Recarrega practices já com as novas, pra achar o practice_id correto no destino
    // — SÓ as ativas: se uma practice foi apagada e reimportada, a antiga
    // (inativa) ainda tem o mesmo imported_from_id da nova, e sem esse filtro
    // o mapa podia acabar apontando pra a inativa (ordem do banco não é
    // garantida sem ORDER BY), fazendo o reparo achar que já estava "certo"
    // quando na verdade apontava pro lugar errado.
    const { data: targetPractices } = await supabase.from('practices').select('*').eq('company_id', effectiveCompanyId).eq('active', true);
    const practiceIdByImportedFrom = {};
    (targetPractices || []).forEach(p => { if (p.imported_from_id) practiceIdByImportedFrom[p.imported_from_id] = p.id; });

    // Reparo: categorias já importadas antes, mas com o practice_id errado —
    // seja nulo (Practice-mãe ainda não existia numa tentativa anterior que
    // travou no meio), seja apontando pra uma Practice que foi desativada
    // depois (ex: apagada e reimportada, ganhando um id novo). Confere TODAS
    // as categorias já importadas contra o mapeamento certo, e corrige
    // qualquer uma que não bata — não só as com practice_id nulo.
    if (alreadyImportedCategories && alreadyImportedCategories.length > 0) {
      const { data: sourceCatsForAll } = await supabase
        .from('problem_categories').select('id, practice_id')
        .in('id', alreadyImportedCategories.map(c => c.imported_from_id));
      const sourcePracticeIdByCatId = {};
      (sourceCatsForAll || []).forEach(sc => { sourcePracticeIdByCatId[sc.id] = sc.practice_id; });
      for (const cat of alreadyImportedCategories) {
        const sourcePracticeId = sourcePracticeIdByCatId[cat.imported_from_id];
        const correctPracticeId = sourcePracticeId ? (practiceIdByImportedFrom[sourcePracticeId] || null) : null;
        if (correctPracticeId && correctPracticeId !== cat.practice_id) {
          await supabase.from('problem_categories').update({ practice_id: correctPracticeId }).eq('id', cat.id);
        }
      }
    }

    const { data: defaultCategories, error: cErr } = await supabase
      .from('problem_categories').select('*').eq('company_id', defaultCompanyId).eq('language', importLanguage);
    if (cErr) throw cErr;

    let addedCategories = 0;
    for (const c of (defaultCategories || [])) {
      if (importedCategoryIds.has(c.id)) continue;
      const { error } = await supabase.from('problem_categories').insert([{
        name: c.name, description: c.description, tags: c.tags,
        display_order: c.display_order, active: c.active,
        practice_id: practiceIdByImportedFrom[c.practice_id] || null,
        company_id: effectiveCompanyId, imported_from_id: c.id, import_batch_id: batchId
      }]);
      if (error) throw error;
      addedCategories++;
    }

    await loadPractices();
    await loadProblemCategories();
    alert(tAlert('metadata_updated', { practices: addedPractices, categories: addedCategories }));
    return true;
  } catch (error) {
    console.error('Error importing Metadata Model:', error);
    alert(t('error_during_import') + ' ' + error.message);
    return false;
  } finally {
    setImportingBundle(false);
  }
};

// Grupo 2: Synthetic/Curated Content (Employees + Individual Experiences +
// Top 3 + Key Insights). Depende do Metadata Model já existir (practices e
// categories, importadas antes ou criadas pela própria empresa) — acha o
// destino pelo NOME, não exige que tenha vindo do mesmo import.
const importSyntheticContent = async () => {
  if (!effectiveCompanyId || effectiveCompanyId === defaultCompanyId) return;
  setImportingBundle(true);
  const batchId = `content-${Date.now()}`;
  const companyCode = companies.find(c => c.id === effectiveCompanyId)?.code || String(effectiveCompanyId);
  try {
    // Practices/Categories já existentes no destino (por nome, não por import_from)
    // — só as ativas, pelo mesmo motivo do reparo em importMetadataModel: uma
    // practice apagada e reimportada pode ter o mesmo nome que a antiga
    // (inativa), e sem esse filtro o mapeamento por nome podia pegar a errada.
    const { data: targetPractices } = await supabase.from('practices').select('*').eq('company_id', effectiveCompanyId).eq('active', true);
    if (!targetPractices || targetPractices.length === 0) {
      alert(t('import_metadata_first'));
      setImportingBundle(false);
      return;
    }
    const practiceIdByName = {};
    (targetPractices || []).forEach(p => { practiceIdByName[p.name] = p.id; });

    const { data: defaultPractices } = await supabase.from('practices').select('*').eq('company_id', defaultCompanyId).eq('language', importLanguage);
    const defaultPracticeNameById = {};
    (defaultPractices || []).forEach(p => { defaultPracticeNameById[p.id] = p.name; });

    // Employees: pula quem já foi importado antes
    const { data: alreadyImportedEmployees } = await supabase
      .from('employees').select('imported_from_id').eq('company_id', effectiveCompanyId).not('imported_from_id', 'is', null);
    const importedEmployeeIds = new Set((alreadyImportedEmployees || []).map(r => r.imported_from_id));

    const { data: defaultEmployees, error: eErr } = await supabase
      .from('employees').select('*').eq('company_id', defaultCompanyId).eq('is_demo', true).eq('language', importLanguage);
    if (eErr) throw eErr;

    const employeeIdMap = {};
    let addedEmployees = 0;
    for (const emp of (defaultEmployees || [])) {
      if (importedEmployeeIds.has(emp.id)) continue;
      const newEmployeeId = `${emp.employee_id}-${companyCode}`;
      const { error } = await supabase.from('employees').insert([{
        employee_id: newEmployeeId, name: emp.name, country: emp.country,
        is_demo: true, status: 'active', active: true,
        company_id: effectiveCompanyId, imported_from_id: emp.id, import_batch_id: batchId
      }]);
      if (error) throw error;
      employeeIdMap[emp.employee_id] = newEmployeeId;
      addedEmployees++;
    }
    // Employees já importados antes também precisam entrar no mapa, pra ligar as experiences novas a eles
    if (importedEmployeeIds.size > 0) {
      const { data: existingImported } = await supabase
        .from('employees').select('employee_id, imported_from_id').eq('company_id', effectiveCompanyId).not('imported_from_id', 'is', null);
      const { data: defaultEmployeesAll } = await supabase.from('employees').select('id, employee_id').eq('company_id', defaultCompanyId);
      const defaultEmpIdById = {};
      (defaultEmployeesAll || []).forEach(e => { defaultEmpIdById[e.id] = e.employee_id; });
      (existingImported || []).forEach(row => {
        const originalEmployeeId = defaultEmpIdById[row.imported_from_id];
        if (originalEmployeeId) employeeIdMap[originalEmployeeId] = row.employee_id;
      });
    }

    // Experiences (incluindo Key Insights): pula o que já foi importado antes
    const { data: alreadyImportedExps } = await supabase
      .from('experiences').select('imported_from_id').eq('company_id', effectiveCompanyId).not('imported_from_id', 'is', null);
    const importedExpIds = new Set((alreadyImportedExps || []).map(r => r.imported_from_id));

    const { data: defaultExperiences, error: xErr } = await supabase
      .from('experiences').select('*').eq('company_id', defaultCompanyId).neq('source', 'app').eq('language', importLanguage);
    if (xErr) throw xErr;

    let addedExperiences = 0;
    const expIdMap = {};
    for (const exp of (defaultExperiences || [])) {
      if (importedExpIds.has(exp.id)) continue;
      const practiceName = defaultPracticeNameById[exp.practice_id];
      const { data: inserted, error } = await supabase.from('experiences').insert([{
        problem: exp.problem, problem_category: exp.problem_category, solution: exp.solution,
        result: exp.result, result_category: exp.result_category, industry_sector: exp.industry_sector,
        author: exp.author, gender: exp.gender, age: exp.age, country: exp.country,
        employee_id: employeeIdMap[exp.employee_id] || null,
        practice_id: practiceName ? (practiceIdByName[practiceName] || null) : null,
        tags: exp.tags, avg_rating: exp.avg_rating, total_ratings: exp.total_ratings,
        source: exp.source,
        language: exp.language,
        company_id: effectiveCompanyId, imported_from_id: exp.id, import_batch_id: batchId
      }]).select().single();
      if (error) throw error;
      expIdMap[exp.id] = inserted.id;
      addedExperiences++;
    }
    // Experiences já importadas antes também precisam entrar no mapa, pra o
    // Top 3 conseguir achar o id certo mesmo quando a experience em si não
    // foi recriada agora (mesmo bug/fix já aplicado pros employees acima).
    if (importedExpIds.size > 0) {
      const { data: existingImportedExps } = await supabase
        .from('experiences').select('id, imported_from_id').eq('company_id', effectiveCompanyId).not('imported_from_id', 'is', null);
      (existingImportedExps || []).forEach(row => {
        if (row.imported_from_id) expIdMap[row.imported_from_id] = row.id;
      });
    }

    // Religa related_common_case_id — TANTO nas experiences recém-importadas
    // nessa rodada QUANTO nas que já existiam de tentativas anteriores (o
    // loop roda sobre TODAS as experiences da Default, e expIdMap já cobre
    // as duas situações graças ao backfill acima).
    //
    // Para idiomas não-ingleses, exp.related_common_case_id costuma vir NULO
    // na própria tradução (nunca foi preenchido nela) — só existe na versão
    // em inglês. Por isso, quando estiver vazio, busca o vínculo através da
    // linha em inglês com o mesmo translation_group_id, e resolve esse
    // vínculo de volta pro idioma sendo importado (mesma técnica já usada na
    // exibição, agora aplicada também no import).
    let englishRelatedByGroup = {};
    if (importLanguage !== 'en') {
      const ownGroupIds = [...new Set((defaultExperiences || []).map(e => e.translation_group_id).filter(Boolean))];
      if (ownGroupIds.length > 0) {
        const { data: englishRows } = await supabase
          .from('experiences').select('translation_group_id, related_common_case_id')
          .eq('company_id', defaultCompanyId).eq('language', 'en').in('translation_group_id', ownGroupIds);
        (englishRows || []).forEach(r => {
          if (r.related_common_case_id) englishRelatedByGroup[r.translation_group_id] = r.related_common_case_id;
        });
      }
    }
    // O related_common_case_id (do inglês) aponta pra uma experience em
    // inglês — precisa resolver ISSO também pro idioma sendo importado antes
    // de procurar no expIdMap (que só tem ids desse idioma).
    let resolvedEnglishTargetToOwnLang = {};
    const englishTargetIds = [...new Set(Object.values(englishRelatedByGroup))];
    if (englishTargetIds.length > 0) {
      const { data: englishTargetRows } = await supabase
        .from('experiences').select('id, translation_group_id').in('id', englishTargetIds);
      const groupByEnglishTargetId = {};
      (englishTargetRows || []).forEach(r => { groupByEnglishTargetId[r.id] = r.translation_group_id; });
      const targetGroupIds = [...new Set(Object.values(groupByEnglishTargetId).filter(Boolean))];
      if (targetGroupIds.length > 0) {
        const { data: ownLangTargetRows } = await supabase
          .from('experiences').select('id, translation_group_id')
          .eq('company_id', defaultCompanyId).eq('language', importLanguage).in('translation_group_id', targetGroupIds);
        const ownLangIdByGroup = {};
        (ownLangTargetRows || []).forEach(r => { ownLangIdByGroup[r.translation_group_id] = r.id; });
        englishTargetIds.forEach(engId => {
          const groupId = groupByEnglishTargetId[engId];
          if (groupId && ownLangIdByGroup[groupId]) resolvedEnglishTargetToOwnLang[engId] = ownLangIdByGroup[groupId];
        });
      }
    }

    let relinkAttempted = 0, relinkSucceeded = 0, relinkFailed = 0, relinkSkippedNoSource = 0, relinkSkippedNoMap = 0;
    for (const exp of (defaultExperiences || [])) {
      let relatedSourceId = exp.related_common_case_id;
      if (!relatedSourceId && exp.translation_group_id) {
        const englishTargetId = englishRelatedByGroup[exp.translation_group_id];
        relatedSourceId = englishTargetId ? (resolvedEnglishTargetToOwnLang[englishTargetId] || null) : null;
      }
      if (!relatedSourceId) { relinkSkippedNoSource++; continue; }
      const newOwnId = expIdMap[exp.id];
      const newRelatedId = expIdMap[relatedSourceId];
      if (newOwnId && newRelatedId) {
        relinkAttempted++;
        const { error: relinkErr } = await supabase.from('experiences').update({ related_common_case_id: newRelatedId }).eq('id', newOwnId);
        if (relinkErr) { relinkFailed++; console.error('Relink error:', relinkErr); } else { relinkSucceeded++; }
      } else {
        relinkSkippedNoMap++;
      }
    }
    console.log(`🔗 Relink related_common_case_id: attempted=${relinkAttempted}, succeeded=${relinkSucceeded}, failed=${relinkFailed}, skippedNoSource=${relinkSkippedNoSource}, skippedNoMap=${relinkSkippedNoMap}`);

    // Top 3 — limpa qualquer linha existente dessa empresa antes de inserir de
    // novo. O Top 3 é sempre só até 3 linhas, então é mais seguro reconstruir
    // do zero do que tentar deduplicar por imported_from_id — uma tentativa
    // anterior que travou no meio pode ter deixado uma linha "position" já
    // ocupada sem o imported_from_id bater, causando erro de chave duplicada.
    const { error: clearTop3Error } = await supabase.from('top_experiences').delete().eq('company_id', effectiveCompanyId);
    if (clearTop3Error) throw new Error('Could not clear existing Top 3 rows before re-import: ' + clearTop3Error.message);

    const { data: defaultTop3 } = await supabase.from('top_experiences').select('*').eq('company_id', defaultCompanyId);
    let addedTop3 = 0;
    if (defaultTop3 && defaultTop3.length > 0) {
      // top_experiences do Default aponta pra experiences de UM idioma só (o
      // original, tipicamente inglês) — pra importar em qualquer outro
      // idioma, precisa resolver pra linha equivalente via
      // translation_group_id antes de procurar no expIdMap.
      let resolvedExpIdByTop3ExpId = {};
      if (importLanguage !== 'en') {
        const top3ExpIds = defaultTop3.map(t => t.experience_id).filter(Boolean);
        const { data: top3SourceRows } = await supabase
          .from('experiences').select('id, translation_group_id').in('id', top3ExpIds);
        const groupByTop3ExpId = {};
        (top3SourceRows || []).forEach(r => { groupByTop3ExpId[r.id] = r.translation_group_id; });
        const groupIds = [...new Set(Object.values(groupByTop3ExpId).filter(Boolean))];
        if (groupIds.length > 0) {
          const { data: translatedRows } = await supabase
            .from('experiences').select('id, translation_group_id')
            .eq('company_id', defaultCompanyId).eq('language', importLanguage)
            .in('translation_group_id', groupIds);
          const translatedByGroup = {};
          (translatedRows || []).forEach(r => { translatedByGroup[r.translation_group_id] = r.id; });
          top3ExpIds.forEach(origId => {
            const groupId = groupByTop3ExpId[origId];
            if (groupId && translatedByGroup[groupId]) resolvedExpIdByTop3ExpId[origId] = translatedByGroup[groupId];
          });
        }
      }

      for (const t of defaultTop3) {
        const sourceExpId = importLanguage === 'en' ? t.experience_id : (resolvedExpIdByTop3ExpId[t.experience_id] || t.experience_id);
        const newExpId = expIdMap[sourceExpId];
        if (!newExpId) continue; // a experience correspondente não foi importada (talvez já existisse)
        const { error } = await supabase.from('top_experiences').insert([{
          experience_id: newExpId, position: t.position, company_id: effectiveCompanyId, imported_from_id: t.id, import_batch_id: batchId
        }]);
        if (error) throw error;
        addedTop3++;
      }
    }

    await loadEmployees(effectiveCompanyId);
    await loadExperiences(true);
    await loadTopExperiences();
    alert(tAlert('synthetic_content_updated', { employees: addedEmployees, experiences: addedExperiences, top3: addedTop3 }));
  } catch (error) {
    console.error('Error importing Synthetic Content:', error);
    alert(t('error_during_import') + ' ' + error.message);
  } finally {
    setImportingBundle(false);
  }
};

// Importa Quotes do Default — também pula o que já foi importado antes.
const importQuotesFromDefault = async () => {
  if (!effectiveCompanyId || effectiveCompanyId === defaultCompanyId) return;
  setImportingQuotes(true);
  const batchId = `quotes-${Date.now()}`;
  try {
    const { data: alreadyImported } = await supabase
      .from('quotes').select('imported_from_id').eq('company_id', effectiveCompanyId).not('imported_from_id', 'is', null);
    const importedIds = new Set((alreadyImported || []).map(r => r.imported_from_id));

    // Só importa quotes cuja lista de edições inclui a da própria empresa —
    // filtro feito no cliente, já que a coluna guarda uma lista separada
    // por vírgula (ex: 'corp,edu'), não um valor único.
    const { data: defaultQuotes, error } = await supabase
      .from('quotes').select('*').eq('company_id', defaultCompanyId).eq('language', importLanguage);
    if (error) throw error;
    const matchingQuotes = (defaultQuotes || []).filter(q => (q.edition || 'corp,pro,edu').split(',').includes(companyEdition));

    let added = 0;
    for (const q of matchingQuotes) {
      if (importedIds.has(q.id)) continue;
      const { error: insErr } = await supabase.from('quotes').insert([{
        text: q.text, author: q.author, position: q.position, active: q.active, language: q.language,
        edition: q.edition,
        company_id: effectiveCompanyId, imported_from_id: q.id, import_batch_id: batchId
      }]);
      if (insErr) throw insErr;
      added++;
    }
    await loadQuotes();
    alert(tAlert('quotes_updated', { added }));
  } catch (error) {
    console.error('Error importing quotes:', error);
    alert(t('error_importing_quotes') + ' ' + error.message);
  } finally {
    setImportingQuotes(false);
  }
};

// Importa Promotional Videos/Links do Default — reaproveita o mesmo arquivo já
// hospedado (não faz upload de novo, só copia a linha do banco apontando pra
// mesma URL), e pula o que já foi importado antes.
const importPromotionalVideos = async () => {
  if (!effectiveCompanyId || effectiveCompanyId === defaultCompanyId) return;
  setImportingBundle(true);
  const batchId = `promo-${Date.now()}`;
  try {
    const { data: alreadyImported } = await supabase
      .from('promotional_videos').select('imported_from_id').eq('company_id', effectiveCompanyId).not('imported_from_id', 'is', null);
    const importedIds = new Set((alreadyImported || []).map(r => r.imported_from_id));

    const { data: defaultItems, error } = await supabase
      .from('promotional_videos').select('*').eq('company_id', defaultCompanyId)
      .or(`language.eq.${importLanguage},language.is.null`);
    if (error) throw error;

    // Só importa vídeos cuja lista de edições inclui a da própria empresa
    // (ou null = "todas") — evita uma empresa Corp trazer vídeo marcado só
    // pra Edu.
    const matchingItems = (defaultItems || []).filter(v =>
      v.edition == null || v.edition.split(',').includes(companyEdition)
    );

    let added = 0;
    for (const v of matchingItems) {
      if (importedIds.has(v.id)) continue;
      const { error: insErr } = await supabase.from('promotional_videos').insert([{
        video_url: v.video_url, duration: v.duration, display_order: v.display_order,
        file_type: v.file_type, link_url: v.link_url, link_label: v.link_label,
        language: v.language,
        edition: v.edition,
        company_id: effectiveCompanyId, imported_from_id: v.id, import_batch_id: batchId
      }]);
      if (insErr) throw insErr;
      added++;
    }
    await loadPromotionalVideos();
    alert(tAlert('videos_updated', { added }));
  } catch (error) {
    console.error('Error importing promotional videos:', error);
    alert(t('generic_error') + ' ' + error.message);
  } finally {
    setImportingBundle(false);
  }
};

// Importa Content Pages do Default — como cada página é identificada por
// page_key (um conjunto fixo, tipo "about", "terms"), só copia as que a
// empresa ainda não tem, sem duplicar chaves.
// Importa os Subtítulos "sample" do Default — só traz os que forem da
// própria edição da empresa, sem duplicar os que ela já tem.
const importSubtitles = async () => {
  if (!effectiveCompanyId || effectiveCompanyId === defaultCompanyId) return;
  try {
    const { data: existing } = await supabase
      .from('page_subtitles').select('line1, language').eq('company_id', effectiveCompanyId);
    const existingKeys = new Set((existing || []).map(r => `${r.line1}::${r.language}`));

    const { data: defaultSubtitles, error } = await supabase
      .from('page_subtitles').select('*').eq('company_id', defaultCompanyId).eq('language', importLanguage);
    if (error) throw error;

    const matching = (defaultSubtitles || []).filter(s =>
      s.applicable_editions === 'all' || s.applicable_editions.split(',').includes(companyEdition)
    );

    let added = 0;
    for (const s of matching) {
      const key = `${s.line1}::${s.language}`;
      if (existingKeys.has(key)) continue;
      if (pageSubtitles.length + added >= 3) break; // respeita o limite de 3
      const { error: insErr } = await supabase.from('page_subtitles').insert([{
        company_id: effectiveCompanyId, line1: s.line1, line2: s.line2,
        language: s.language, applicable_editions: s.applicable_editions,
        display_order: pageSubtitles.length + added + 1
      }]);
      if (insErr) throw insErr;
      added++;
    }
    await loadPageSubtitles();
    alert(tAlert('content_pages_updated', { added }));
  } catch (error) {
    console.error('Error importing subtitles:', error);
    alert(t('generic_error') + ' ' + error.message);
  }
};

const importContentPages = async () => {
  if (!effectiveCompanyId || effectiveCompanyId === defaultCompanyId) return;
  setImportingBundle(true);
  try {
    const { data: existing } = await supabase
      .from('content_pages').select('page_key, language').eq('company_id', effectiveCompanyId);
    const existingKeys = new Set((existing || []).map(r => `${r.page_key}::${r.language || 'en'}`));

    // Só importa entradas cuja lista de edições inclui a da própria
    // empresa — filtro feito no cliente, já que a coluna guarda uma lista
    // separada por vírgula, não um valor único.
    const { data: defaultPages, error } = await supabase
      .from('content_pages').select('*').eq('company_id', defaultCompanyId).eq('language', importLanguage);
    if (error) throw error;
    const matchingPages = (defaultPages || []).filter(p =>
      (p.applicable_editions || 'corp,pro,edu').split(',').includes(companyEdition)
    );

    let added = 0;
    for (const p of matchingPages) {
      const key = `${p.page_key}::${p.language || 'en'}`;
      if (existingKeys.has(key)) continue; // já tem uma entrada pra essa página/idioma, pula
      const { error: insErr } = await supabase.from('content_pages').insert([{
        page_key: p.page_key, title: p.title, content: p.content,
        language: p.language || 'en',
        applicable_editions: p.applicable_editions || 'corp,pro,edu',
        company_id: effectiveCompanyId, imported_from_id: p.id
      }]);
      if (insErr) throw insErr;
      added++;
      existingKeys.add(key);
    }
    await loadContentPages();
    await loadAllContentPages();
    alert(tAlert('content_pages_updated', { added }));
  } catch (error) {
    console.error('Error importing content pages:', error);
    alert(t('generic_error') + ' ' + error.message);
  } finally {
    setImportingBundle(false);
  }
};

// Copia a configuração visual/comportamental da Default (nome/logo exibidos,
// exigir login de employee, permitir upload de CV, mostrar Top 3, mostrar
// marquee, etc.) pra empresa de destino — serve como ponto de partida
// ilustrativo, mostrando pro cliente o que dá pra configurar. Como toda
// empresa já tem uma linha própria de app_settings (criada automaticamente
// no primeiro carregamento), isso é sempre um UPDATE, nunca um INSERT.
const importAppConfiguration = async () => {
  if (!effectiveCompanyId || effectiveCompanyId === defaultCompanyId) return;
  setImportingBundle(true);
  try {
    const { data: defaultSettings, error: fetchErr } = await supabase
      .from('app_settings').select('*').eq('company_id', defaultCompanyId).maybeSingle();
    if (fetchErr) throw fetchErr;
    if (!defaultSettings) {
      alert(t('no_app_config_to_copy'));
      return;
    }

    // Branding (nome/logo/tamanhos) não vem mais de app_settings do
    // Default — esse campo ficou desatualizado desde que criamos
    // "Manage Company Branding" (tabela edition_branding, por edição).
    // Puxa da fonte certa, batendo com a edição da própria empresa que
    // está importando.
    const { data: brandingRow } = await supabase
      .from('edition_branding').select('*').eq('edition', companyEdition).maybeSingle();

    const { error } = await supabase.from('app_settings').update({
      require_employee_login: defaultSettings.require_employee_login,
      edition_name: defaultSettings.edition_name,
      allow_cv_upload: defaultSettings.allow_cv_upload,
      document_type: defaultSettings.document_type,
      show_top3: defaultSettings.show_top3,
      top3_start_visible: defaultSettings.top3_start_visible,
      show_marquee: defaultSettings.show_marquee,
      company_name: brandingRow?.company_name || null,
      company_logo_url: brandingRow?.company_logo_url || null,
      company_name_size: brandingRow?.company_name_size || 'medium',
      company_logo_size: brandingRow?.company_logo_size || 'medium'
    }).eq('company_id', effectiveCompanyId);
    if (error) throw error;

    await loadAppSettings();
    alert(t('app_config_copied'));
  } catch (error) {
    console.error('Error importing App Configuration:', error);
    alert(t('generic_error') + ' ' + error.message);
  } finally {
    setImportingBundle(false);
  }
};




// Botão único de import da tabela — age sobre todas as linhas marcadas.
const runImportForSelected = async () => {
  if (selectedForImport.includes('metadata')) {
    const ok = await importMetadataModel();
    if (ok === false) { setSelectedForImport([]); return; } // não segue pro Content se o Metadata falhou
  }
  if (selectedForImport.includes('synthetic')) await importSyntheticContent();
  if (selectedForImport.includes('quotes')) await importQuotesFromDefault();
  if (selectedForImport.includes('promotional_videos')) await importPromotionalVideos();
  if (selectedForImport.includes('content_pages')) await importContentPages();
  if (selectedForImport.includes('page_subtitles')) await importSubtitles();
  if (selectedForImport.includes('app_config')) await importAppConfiguration();
  // Reseta os checkboxes depois de concluído — sem isso ficam "grudados" com
  // a seleção anterior, dando a impressão de que só uma parte ficou disponível.
  setSelectedForImport([]);
};

// Apaga uma Category e, em cascata, as Experiences/Key Insights ligadas a ela
// (mesmo nome de categoria), os comentários delas, e o Employee autor — mas só
// se esse Employee não tiver mais nenhuma outra experience sobrando.
const deleteCategoryCascade = async (cat) => {
  if (!window.confirm(tConfirm('delete_category_full', { name: cat.name }))) return;
  try {
    const { data: exps, error: expErr } = await supabase
      .from('experiences').select('id, employee_id')
      .eq('problem_category', cat.name)
      .eq('company_id', effectiveCompanyId);
    if (expErr) throw expErr;

    const expIds = (exps || []).map(e => e.id);
    const employeeIds = [...new Set((exps || []).map(e => e.employee_id).filter(Boolean))];

    if (expIds.length > 0) {
      // Comments ligados a essas experiences (reactions caem em cascata sozinhas, via FK)
      await supabase.from('comments').delete().in('experience_id', expIds);
      // top_experiences ligadas
      await supabase.from('top_experiences').delete().in('experience_id', expIds);
      // As experiences em si
      await supabase.from('experiences').delete().in('id', expIds);
    }

    // Employees que ficaram sem nenhuma experience sobrando (nessa empresa)
    for (const empId of employeeIds) {
      const { count } = await supabase
        .from('experiences').select('id', { count: 'exact', head: true })
        .eq('employee_id', empId).eq('company_id', effectiveCompanyId);
      if (!count || count === 0) {
        await supabase.from('employees').delete().eq('employee_id', empId).eq('company_id', effectiveCompanyId);
      }
    }

    // A category em si (soft delete, como já era)
    const { error } = await supabase.from('problem_categories').update({ active: false }).eq('id', cat.id);
    if (error) throw error;

    await loadAdminCategories(selectedPracticeId);
    await loadProblemCategories(selectedPracticeId);
    await loadEmployees(effectiveCompanyId);
    await loadExperiences(false, null);
  } catch (error) {
    console.error('Error deleting category (cascade):', error);
    alert(t('error_deleting_category') + ' ' + error.message);
  }
};

// Apaga uma Function/Practice inteira em cascata: todas as Categories dela,
// as Experiences/Key Insights/comments ligadas a essas Categories, e os
// employees que ficarem sem nenhum conteúdo restante.
const deletePracticeCascade = async (practice) => {
  try {
    const { data: cats, error: catErr } = await supabase
      .from('problem_categories').select('id, name')
      .eq('practice_id', practice.id).eq('company_id', effectiveCompanyId).eq('active', true);
    if (catErr) throw catErr;

    for (const cat of cats || []) {
      const { data: exps } = await supabase
        .from('experiences').select('id, employee_id')
        .eq('problem_category', cat.name).eq('company_id', effectiveCompanyId);
      const expIds = (exps || []).map(e => e.id);
      const employeeIds = [...new Set((exps || []).map(e => e.employee_id).filter(Boolean))];
      if (expIds.length > 0) {
        await supabase.from('comments').delete().in('experience_id', expIds);
        await supabase.from('top_experiences').delete().in('experience_id', expIds);
        await supabase.from('experiences').delete().in('id', expIds);
      }
      for (const empId of employeeIds) {
        const { count } = await supabase
          .from('experiences').select('id', { count: 'exact', head: true })
          .eq('employee_id', empId).eq('company_id', effectiveCompanyId);
        if (!count || count === 0) {
          await supabase.from('employees').delete().eq('employee_id', empId).eq('company_id', effectiveCompanyId);
        }
      }
      await supabase.from('problem_categories').update({ active: false }).eq('id', cat.id);
    }

    const { error } = await supabase.from('practices').update({ active: false }).eq('id', practice.id);
    if (error) throw error;

    await loadPractices();
    await loadProblemCategories();
    await loadEmployees(effectiveCompanyId);
    await loadExperiences(true);
  } catch (error) {
    console.error('Error deleting practice (cascade):', error);
    throw error;
  }
};

// Versões em LOTE — uma chamada por tabela, não um loop item-por-item — usadas
// pelos botões "Delete All" do Manage Group Deletion, pra apagar tudo de uma
// vez em vez de ir uma Category/Practice de cada vez (que ficava visivelmente
// lento e sequencial).
const deleteCategoriesBatch = async (cats) => {
  if (!cats || cats.length === 0) return;
  const catIds = cats.map(c => c.id);
  const catNames = [...new Set(cats.map(c => c.name))];

  const { data: exps } = await supabase
    .from('experiences').select('id, employee_id')
    .in('problem_category', catNames).eq('company_id', effectiveCompanyId);
  const expIds = (exps || []).map(e => e.id);
  const employeeIds = [...new Set((exps || []).map(e => e.employee_id).filter(Boolean))];

  if (expIds.length > 0) {
    await supabase.from('comments').delete().in('experience_id', expIds);
    await supabase.from('top_experiences').delete().in('experience_id', expIds);
    await supabase.from('experiences').delete().in('id', expIds);
  }
  if (employeeIds.length > 0) {
    const { data: remaining } = await supabase
      .from('experiences').select('employee_id').eq('company_id', effectiveCompanyId).in('employee_id', employeeIds);
    const stillHasContent = new Set((remaining || []).map(r => r.employee_id));
    const toDeleteEmployees = employeeIds.filter(id => !stillHasContent.has(id));
    if (toDeleteEmployees.length > 0) {
      await supabase.from('employees').delete().in('employee_id', toDeleteEmployees).eq('company_id', effectiveCompanyId);
    }
  }
  await supabase.from('problem_categories').update({ active: false }).in('id', catIds);
};

const deletePracticesBatch = async (practicesList) => {
  if (!practicesList || practicesList.length === 0) return;
  const practiceIds = practicesList.map(p => p.id);
  const { data: cats } = await supabase
    .from('problem_categories').select('id, name')
    .in('practice_id', practiceIds).eq('company_id', effectiveCompanyId).eq('active', true);
  if (cats && cats.length > 0) {
    await deleteCategoriesBatch(cats);
  }
  await supabase.from('practices').update({ active: false }).in('id', practiceIds);
};


const addEmployee = async () => {
  if (!newEmployee.employee_id.trim() || !newEmployee.name.trim()) {
    alert(t('employee_id_name_required'));
    return;
  }
  try {
    const { error } = await supabase.from('employees').insert([{
      employee_id: newEmployee.employee_id.trim(),
      name: newEmployee.name.trim(),
      country: newEmployee.country.trim(),
      email: newEmployee.email.trim(),
      is_admin: newEmployee.is_admin,
      company_id: effectiveCompanyId,
      status: 'pending',
      active: true
    }]);
    if (error) throw error;
    setNewEmployee({ employee_id: '', name: '', country: '', email: '', is_admin: false });
    await loadEmployees();
    alert(tAlert('employee_added_to_company', { company: effectiveCompanyName }));
  } catch (error) {
    console.error('Error adding employee:', error);
    alert(t('error_adding_employee'));
  }
};

const updateEmployee = async (empId) => {
  try {
    const updatePayload = {
      name: editingEmployeeData.name,
      country: editingEmployeeData.country,
      email: editingEmployeeData.email,
      is_admin: editingEmployeeData.is_admin,
      status: editingEmployeeData.status
    };
    // Se o Admin está reabrindo pra "pending" (ex: desbloqueando), limpa a
    // senha antiga — a pessoa passa pelo 1st Access de novo, do zero.
    if (editingEmployeeData.status === 'pending') {
      updatePayload.password = null;
    }
    const { error } = await supabase.from('employees')
      .update(updatePayload)
      .eq('employee_id', empId);
    if (error) throw error;
    setEditingEmployee(null);
    setEditingEmployeeData({});
    await loadEmployees();
  } catch (error) {
    console.error('Error updating employee:', error);
    alert(t('error_updating_employee'));
  }
};

const deleteEmployee = async (empId) => {
  if (!window.confirm(tConfirm('delete_employee', { id: empId }))) return;
  try {
    const { error } = await supabase.from('employees').delete().eq('employee_id', empId);
    if (error) throw error;
    await loadEmployees();
  } catch (error) {
    console.error('Error deleting employee:', error);
    alert(t('error_deleting_employee'));
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
      const empId = String(row['Employee ID'] || row['employee_id'] || row['ID de Empleado'] || row['ID do Funcionário'] || row['员工 ID'] || '').trim();
      const name = String(row['Name'] || row['name'] || row['Nombre'] || row['Nome'] || row['姓名'] || '').trim();
      const country = String(row['Country'] || row['country'] || row['País'] || row['国家'] || '').trim();
      const email = String(row['Email'] || row['email'] || row['Correo'] || row['E-mail'] || row['邮箱'] || '').trim();
      if (!empId || !name) { errors++; continue; }
      const { error } = await supabase.from('employees').insert([{
        employee_id: empId, name, country, email, status: 'pending', active: true
      }]);
      if (error) { errors++; } else { added++; }
    }
    await loadEmployees();
    alert(tAlert('upload_complete', { added, errors }));
  } catch (error) {
    console.error('Error uploading Excel:', error);
    alert(t('error_reading_excel'));
  }
};

// Regras de senha — ajuste os critérios aqui livremente
const PASSWORD_RULES = [
  { label: 'At least 8 characters', test: (pw) => pw.length >= 8 },
  { label: 'At least one uppercase letter (A-Z)', test: (pw) => /[A-Z]/.test(pw) },
  { label: 'At least one lowercase letter (a-z)', test: (pw) => /[a-z]/.test(pw) },
  { label: 'At least one number (0-9)', test: (pw) => /[0-9]/.test(pw) },
];
const isPasswordValid = (pw) => PASSWORD_RULES.every(rule => rule.test(pw));

const sendEmailJs = async (toEmail, name, message) => {
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
    to_email: toEmail,
    name: name,
    email: toEmail,
    message: message
  });
};

// Passo 1: acha a(s) conta(s) por e-mail + Employee ID, manda código de verificação
const handleAccountAccessLookup = async () => {
  setAccountAccessError('');
  if (!accountAccessEmail.trim() || !accountAccessEmployeeId.trim()) {
    setAccountAccessError(t('please_enter_email_employee_id'));
    return;
  }
  try {
    const { data, error } = await supabase
      .from('employees')
      .select('*, companies!company_id(name)')
      .eq('email', accountAccessEmail.trim().toLowerCase())
      .eq('employee_id', accountAccessEmployeeId.trim())
      .eq('active', true);
    if (error) throw error;
    if (!data || data.length === 0) {
      setAccountAccessError(t('no_account_found'));
      return;
    }
    const usableMatches = data.filter(r => r.status !== 'blocked');
    if (usableMatches.length === 0) {
      setAccountAccessJustBlocked(true);
      let adminEmailsText = '';
      try {
        const { data: admins } = await supabase
          .from('employees')
          .select('email')
          .eq('company_id', data[0].company_id)
          .eq('is_admin', true)
          .not('email', 'is', null);
        const emails = (admins || []).map(a => a.email).filter(Boolean);
        if (emails.length > 0) {
          adminEmailsText = ` at:\n${emails.join('\n')}`;
        } else {
          adminEmailsText = '.';
        }
      } catch (err) {
        console.error('Error fetching company admins:', err);
        adminEmailsText = '.';
      }
      setAccountAccessError(`${t('account_blocked_security')}${adminEmailsText}`);
      return;
    }
    if (usableMatches.length > 1) {
      setAccountAccessMatches(usableMatches);
      setAccountAccessStep('choose-match');
      return;
    }
    // Só um resultado — ainda assim, pede confirmação explícita da empresa
    // antes de mandar o código, em vez de avançar direto.
    setAccountAccessRecord(usableMatches[0]);
    setAccountAccessStep('confirm-company');
  } catch (err) {
    console.error('Account access lookup error:', err);
    setAccountAccessError(t('something_went_wrong'));
  }
};

// Quando há mais de uma opção, a própria escolha já é a confirmação — segue direto.
const handleChooseAccountAccessMatch = async (record) => {
  await proceedWithAccountAccessRecord(record);
};

// Confirmação explícita (caso de match único) — só agora o código é enviado de verdade.
const handleConfirmCompany = async () => {
  await proceedWithAccountAccessRecord(accountAccessRecord);
};

const proceedWithAccountAccessRecord = async (record) => {
  if (!record.email) {
    setAccountAccessError(t('no_email_registered'));
    return;
  }
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  setAccountAccessRecord(record);
  setAccountAccessCode(code);
  try {
    await sendEmailJs(
      record.email,
      record.name || accountAccessEmployeeId.trim(),
      `Hi ${record.name || accountAccessEmployeeId.trim()},\n\nYour WhatIDid verification code is: ${code}\n\nEnter this code to continue setting your password.\n\nWhatIDid Team`
    );
    setAccountAccessStep('verify');
  } catch (err) {
    console.error('Error sending verification code:', err);
    setAccountAccessError(t('error_sending_verification'));
  }
};

// Passo 2: confirma o código
const handleVerifyAccountAccessCode = () => {
  setAccountAccessError('');
  if (accountAccessCodeInput.trim() !== accountAccessCode) {
    setAccountAccessError(t('incorrect_code'));
    return;
  }
  setAccountAccessStep('set-password');
};

// Passo 3: cria/troca a senha
const handleSetAccountAccessPassword = async () => {
  setAccountAccessError('');
  if (!isPasswordValid(accountAccessPassword)) {
    setAccountAccessError(t('password_requirements_not_met'));
    return;
  }
  if (accountAccessPassword !== accountAccessConfirmPassword) {
    setAccountAccessError(t('passwords_do_not_match') + '.');
    return;
  }
  try {
    const { error } = await supabase
      .from('employees')
      .update({ password: accountAccessPassword, status: 'active', force_password_change: false })
      .eq('id', accountAccessRecord.id); // usa o id interno da linha, evita ambiguidade
    if (error) throw error;
    setAccountAccessStep('done');
  } catch (err) {
    console.error('Error setting password:', err);
    setAccountAccessError(t('error_saving_password'));
  }
};

// ==================== FLUXO DE AUTO-CADASTRO PRO ====================
// Independente do 1st Access acima (mesma infraestrutura de envio de
// e-mail e regras de senha, mas estado e funções próprias) — evita
// qualquer risco de quebrar o fluxo existente, que empresas reais já usam.
// Só verifica PARs existentes pra quem está se cadastrando como
// Profissional — Contratante não tem PAR pra reaproveitar.
const handleProSignupSendCode = async () => {
  setProSignupError('');
  if (!proSignupForm.email.trim() || !proSignupForm.name.trim()) {
    setProSignupError(t('please_enter_email_employee_id'));
    return;
  }
  if (proSignupInfo.role === 'professional') {
    try {
      const { data: priorProfiles } = await supabase
        .from('employees')
        .select('id, employee_id, company_id')
        .eq('email', proSignupForm.email.trim())
        .eq('pro_role', 'professional');
      if (priorProfiles && priorProfiles.length > 0) {
        const priorEmployeeIds = priorProfiles.map(p => p.employee_id);
        const { data: pars } = await supabase
          .from('experiences')
          .select('*')
          .in('employee_id', priorEmployeeIds);
        if (pars && pars.length > 0) {
          setProSignupExistingPars(pars);
          setProSignupSelectedPars(pars.map(p => p.id)); // pré-marca todos, por padrão
          setProSignupStep('par-choice');
          return;
        }
      }
    } catch (err) {
      console.error('Error checking existing PARs:', err);
      // não bloqueia o cadastro se essa checagem falhar — só segue sem sugerir nada
    }
  }
  await actuallySendProSignupCode();
};

const actuallySendProSignupCode = async () => {
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  setProSignupCode(code);
  try {
    await sendEmailJs(
      proSignupForm.email.trim(),
      proSignupForm.name.trim(),
      `Hi ${proSignupForm.name.trim()},\n\nYour WhatIDid verification code is: ${code}\n\nEnter this code to continue creating your account.\n\nWhatIDid Team`
    );
    setProSignupStep('verify');
  } catch (err) {
    console.error('Error sending Pro signup verification code:', err);
    setProSignupError(t('error_sending_verification'));
  }
};

const handleProSignupVerifyCode = () => {
  setProSignupError('');
  if (proSignupCodeInput.trim() !== proSignupCode) {
    setProSignupError(t('incorrect_code'));
    return;
  }
  setProSignupStep('password');
};

const handleProSignupCreateAccount = async () => {
  setProSignupError('');
  if (!isPasswordValid(proSignupPassword)) {
    setProSignupError(t('password_requirements_not_met'));
    return;
  }
  if (proSignupPassword !== proSignupConfirmPassword) {
    setProSignupError(t('passwords_do_not_match') + '.');
    return;
  }
  try {
    // Usa o próprio email como Employee ID — mais simples pra quem se
    // auto-cadastra, sem precisar lembrar um ID gerado por outra pessoa.
    const newEmployeeId = proSignupForm.email.trim();
    const { error } = await supabase.from('employees').insert([{
      employee_id: newEmployeeId,
      name: proSignupForm.name.trim(),
      email: proSignupForm.email.trim(),
      password: proSignupPassword,
      company_id: proSignupInfo.company.id,
      pro_role: proSignupInfo.role,
      status: 'active',
      is_admin: false
    }]);
    if (error) throw error;

    // Copia os PARs selecionados (se houver) pra essa nova empresa — exclui
    // campos que precisam ser únicos/novos (id, datas, quem é dono, de qual
    // empresa) e mantém todo o resto do conteúdo como está.
    if (proSignupSelectedPars.length > 0) {
      const toCopy = proSignupExistingPars.filter(p => proSignupSelectedPars.includes(p.id));
      for (const original of toCopy) {
        const { id, created_at, updated_at, company_id, employee_id, imported_from_id, demo_session_id, ...rest } = original;
        const { error: copyErr } = await supabase.from('experiences').insert([{
          ...rest,
          company_id: proSignupInfo.company.id,
          employee_id: newEmployeeId
        }]);
        if (copyErr) console.error('Error copying PAR:', copyErr);
      }
    }

    setProSignupStep('done');
  } catch (err) {
    console.error('Error creating Pro signup account:', err);
    setProSignupError(t('error_saving_password'));
  }
};

const resetAccountAccessFlow = () => {
  setShowAccountAccess(false);
  setAccountAccessStep('lookup');
  setAccountAccessEmail('');
  setAccountAccessEmployeeId('');
  setAccountAccessMatches([]);
  setAccountAccessRecord(null);
  setAccountAccessCode('');
  setAccountAccessCodeInput('');
  setAccountAccessPassword('');
  setAccountAccessConfirmPassword('');
  setAccountAccessError('');
  setAccountAccessJustBlocked(false);
};

// ==================== END EMPLOYEE MANAGEMENT ====================

const handleEmployeeLogin = async () => {
  setLoginError('');
  
  if (!employeeId.trim() || !employeePassword.trim()) {
    setLoginError(t('please_enter_id_password'));
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
      setLoginError(t('invalid_id_password'));
      return;
    }

    // Se é demo ID, só pode logar se estiver em um grupo
    if (data.is_demo && !data.group_id) {
      setLoginError(t('demo_account_inactive'));
      return;
    }

    // Registra o acesso — espera terminar e confere erro (era fire-and-forget
    // antes, o que pode ter deixado passar uma falha silenciosa).
    const { error: loginTrackError } = await supabase
      .from('employees').update({ last_login_at: new Date().toISOString() }).eq('id', data.id);
    if (loginTrackError) console.error('Error recording last_login_at:', loginTrackError);

    // Sessão única por ID: gera um token novo e grava no banco — se já
    // havia alguém logado com esse mesmo ID (outro navegador/dispositivo),
    // essa troca de token é o que faz a sessão antiga se desconectar
    // sozinha (ela está de olho nesse mesmo campo).
    const newSessionToken = crypto.randomUUID();
    const { error: sessionTokenError } = await supabase
      .from('employees').update({ current_session_token: newSessionToken }).eq('id', data.id);
    if (sessionTokenError) console.error('Error setting session token:', sessionTokenError);
    setMySessionToken(newSessionToken);
    localStorage.setItem('mySessionToken', newSessionToken);
    
// Login bem-sucedido — tudo que é síncrono roda ANTES de qualquer await, pra
  // o React juntar isso numa única atualização de tela. Se isAdmin fosse
  // setado só depois dos awaits (como estava antes), aparecia uma piscada
  // real: "logado, mas ainda sem admin" (UI do app puro) → Loading
  // Experiences → só então os painéis de admin apareciam.
  setIsEmployeeLoggedIn(true);
  localStorage.setItem('employeeLoggedIn', 'true');
  localStorage.setItem('employeeId', employeeId);
  setEmployeePassword('');
  // Todo login novo começa limpo — nunca herda o contexto de navegação
  // (Managing/Viewing) de uma sessão anterior no mesmo navegador.
  setAdminCompanyContext(null);
  setCompanyViewMode('own');
  setSelectedCompanyForContext(null);
  // Sempre começa em inglês, em vez de herdar o que ficou salvo de uma
  // sessão anterior — evita o descompasso "dropdown mostra um idioma,
  // conteúdo vem em outro" que vinha acontecendo em certas transições.
  setViewingLanguage('en');
  localStorage.setItem('viewingLanguage', 'en');

  // Guarda o company_id da própria conta que logou
  setLoggedInEmployeeCompanyId(data.company_id || null);
  localStorage.setItem('loggedInEmployeeCompanyId', data.company_id || '');

  // Se essa conta é um seller, guarda o id dela pra escopar Manage Companies
  // e Manage Demo Groups só ao que ele mesmo criou.
  if (data.is_seller) {
    setLoggedInSellerId(data.id);
    localStorage.setItem('loggedInSellerId', data.id);
  } else {
    setLoggedInSellerId(null);
    localStorage.removeItem('loggedInSellerId');
  }

  // Guarda o idioma da própria conta (usado pra Demo IDs e employees comuns
  // verem o Default automaticamente no idioma certo, sem precisar de seletor).
  setLoggedInEmployeeLanguage(data.language || 'en');
  localStorage.setItem('loggedInEmployeeLanguage', data.language || 'en');

  // Guarda se é um Demo Group ID + as próprias datas dele, pra mostrar a
  // faixa "Demo Mode" (sem seletor de idioma) com Created/Exp/dias restantes.
  setLoggedInIsDemoId(!!data.is_demo);
  localStorage.setItem('loggedInIsDemoId', data.is_demo ? 'true' : 'false');
  setLoggedInDemoCreatedAt(data.created_at || null);
  localStorage.setItem('loggedInDemoCreatedAt', data.created_at || '');
  setLoggedInDemoExpiresAt(data.demo_expires_at || null);
  localStorage.setItem('loggedInDemoExpiresAt', data.demo_expires_at || '');

  // Retoma uma sessão de demo que já existia (ex: não passou pelo fluxo normal
  // de saída da última vez — navegador fechado sem avisar). Só é relevante pra
  // Master/Seller, mas carregar pra qualquer um é inofensivo.
  if (data.current_demo_session_id) {
    setCurrentDemoSessionId(data.current_demo_session_id);
    localStorage.setItem('currentDemoSessionId', data.current_demo_session_id);
  }

  // Se esse employee é marcado como Admin, libera a PERMISSÃO de entrar em
  // modo Admin (o toggle fica disponível) — mas não entra direto lá. Todo
  // login cai primeiro no UI normal do app, uma porta de entrada mais
  // simpática; quem quiser o painel Admin ativa manualmente pelo toggle.
  if (data.is_admin) {
    setEmployeeIsAdmin(true);
    localStorage.setItem('employeeIsAdmin', 'true');
  }
  setIsAdmin(false);
  localStorage.removeItem('isAdmin');

  // If force_password_change is set, prompt to change password
  if (data.force_password_change || data.status === 'pending') {
    setShowChangePassword(true);
  }

  // Só agora, com todo o state síncrono já certo, dispara a carga de grupo.
  // NÃO chama loadExperiences aqui de propósito: essa chamada usaria o
  // fechamento desse mesmo clique (com effectiveViewingLanguage/isAdmin de
  // ANTES do login, já que o React só recalcula isso no próximo render) —
  // era exatamente isso que causava o idioma errado sendo buscado no login
  // (dropdown mostrando um idioma, conteúdo vindo em outro). O efeito
  // automático (useEffect que já observa effectiveCompanyId/
  // effectiveViewingLanguage) dispara sozinho no próximo render, já com os
  // valores corretos e atualizados.
  await loadCurrentEmployeeGroup(employeeId);
  
  } catch (error) {
    console.error('Login error:', error);
    setLoginError(t('login_failed'));
  }
};

  const handleEmployeeLogout = async () => {
  // Se tinha uma sessão de demo ativa em algum momento, apaga tudo antes
  // de sair — silenciosa, sem alert, pra não travar o fluxo normal de
  // logout. Verifica só a EXISTÊNCIA do id da sessão, não se está
  // "navegando o Default ao vivo" no momento exato do logout — senão,
  // sair enquanto em alguma aba do ADM (não em isDemoModeActive) deixava
  // a sessão pra trás, e o botão "Delete Now" continuava ativo ao voltar.
  if (currentDemoSessionId) {
    await deleteDemoSession(currentDemoSessionId, { silent: true });
  }
  // Limpa o token de sessão única — só se ainda for o meu próprio token
  // (evita apagar por engano o token de um login mais novo, no caso de
  // essa função ter sido chamada justamente porque fomos substituídos).
  if (employeeId && mySessionToken) {
    await supabase.from('employees').update({ current_session_token: null }).eq('employee_id', employeeId).eq('current_session_token', mySessionToken);
  }
  setMySessionToken(null);
  localStorage.removeItem('mySessionToken');
  setIsEmployeeLoggedIn(false);
  setEmployeeId('');
  localStorage.removeItem('employeeLoggedIn');
  localStorage.removeItem('employeeId');
  setIsAdmin(false);
  setEmployeeIsAdmin(false);
  localStorage.removeItem('isAdmin');
  localStorage.removeItem('employeeIsAdmin');
  setLoggedInEmployeeCompanyId(null);
  localStorage.removeItem('loggedInEmployeeCompanyId');
  setLoggedInSellerId(null);
  localStorage.removeItem('loggedInSellerId');
  setLoggedInEmployeeLanguage(null);
  localStorage.removeItem('loggedInEmployeeLanguage');
  setAdminCompanyContext(null);
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
      .maybeSingle();
    
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
      .maybeSingle();
    
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
        alert(tAlert('already_top_position', { position: currentPosition[0] }));
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
      alert(t('error_setting_top_experience'));
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
    // Mesmo raciocínio da Category — preserva a Practice se for Follow-On
    // (já veio pré-preenchida do parent), limpa se for uma entrada nova.
    if (!followOnParentId) {
      setSelectedPracticeId(null);
      setShareFormPracticeId(null);
    }
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
    setSelectedPracticeId(null);
    setShareFormPracticeId(null);
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

  // Common Cases (Key Insights) da mesma Function/Practice + Category de
  // uma experience — usado tanto pra decidir se o botão "+ Matching Common
  // Case" aparece, quanto pra popular a lista de radio buttons no popup.
  const getMatchingCommonCasesFor = (exp) => {
    if (!exp) return [];
    return experiences.filter(e =>
      e.author === 'key_insights' &&
      e.practiceId === exp.practiceId &&
      e.problemCategory === exp.problemCategory
    );
  };

  const openLinkCommonCaseModal = (exp) => {
    setLinkingExperience(exp);
    setSelectedCommonCaseForLink(exp.relatedCommonCaseId || null);
  };

  const saveManualCommonCaseLink = async () => {
    if (!linkingExperience || !selectedCommonCaseForLink) return;
    // Só pede confirmação se já existia um link antes (trocando, não
    // criando pela primeira vez).
    if (linkingExperience.relatedCommonCaseId &&
        linkingExperience.relatedCommonCaseId !== selectedCommonCaseForLink) {
      if (!window.confirm(t('confirm_change_common_case_link'))) return;
    }
    try {
      // Mesma regra usada pra decidir se a canetinha aparece: edição
      // permanente só quando é o dono da própria experience (source=app),
      // ou Admin (não-Seller) gerenciando de fato a empresa dona da linha.
      // Fora disso (Live, ADM Seller, Demo Group vendo conteúdo do
      // Default), a mudança é efêmera — marca a sessão de demo e guarda
      // uma cópia do valor original, pro conteúdo real do Default nunca
      // ser alterado de verdade por essas visualizações.
      const belongsToManagedCompany = linkingExperience.companyId === effectiveCompanyId ||
        (!linkingExperience.companyId && effectiveCompanyId === defaultCompanyId);
      const isPermanentEditAllowed = (isAdmin && !isSeller && belongsToManagedCompany) ||
        (linkingExperience.source === 'app' && (appSettings.requireEmployeeLogin ? linkingExperience.employeeId === employeeId : true));

      const updatePayload = { related_common_case_id: selectedCommonCaseForLink };
      if (!isPermanentEditAllowed) {
        updatePayload.demo_session_id = await ensureDemoSessionId();
        // Só grava a cópia de segurança se essa linha ainda não pertence à
        // sessão de demo atual — a primeira captura é a que representa o
        // estado real original, não quer sobrescrever com um valor que já
        // tinha sido alterado nessa mesma sessão.
        if (!linkingExperience.demoSessionId) {
          updatePayload.demo_edit_original_snapshot = {
            problem: linkingExperience.problem, problem_category: linkingExperience.problemCategory,
            solution: linkingExperience.solution, result: linkingExperience.result,
            result_category: linkingExperience.resultCategory, author: linkingExperience.author,
            gender: linkingExperience.gender, age: linkingExperience.age, country: linkingExperience.country,
            related_common_case_id: linkingExperience.relatedCommonCaseId
          };
        }
      }

      const { error } = await supabase.from('experiences')
        .update(updatePayload)
        .eq('id', linkingExperience.id);
      if (error) throw error;
      setLinkingExperience(null);
      setSelectedCommonCaseForLink(null);
      await loadExperiences(true);
    } catch (error) {
      console.error('Error linking common case:', error);
      alert(t('generic_error') + ' ' + error.message);
    }
  };
  
  const addExperienceToSupabase = async (newExperience, relatedCommonCaseId = null) => {
  const contentCompanyId = loggedInIsDemoId ? defaultCompanyId : effectiveCompanyId;
  try {
    let cvUrl = null;
    let cvFilename = null;
    
    // Se tem CV selecionado, fazer upload primeiro
    if (selectedCv) {
      const cvData = await uploadCvToSupabase(selectedCv);
      cvUrl = cvData.url;
      cvFilename = cvData.filename;
    }

    // Em modo demo (Master/Seller navegando o Default direto, OU um Group
    // Demo ID de um Prospect testando) marca essa experience com a sessão
    // de demo atual — fica invisível pra qualquer outra pessoa até ser
    // apagada, e não polui o conteúdo real do Default permanentemente.
    const demoSessionIdForInsert = (isDemoModeActive || loggedInIsDemoId) ? await ensureDemoSessionId() : null;
    
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
        cv_filename: cvFilename,
        company_id: contentCompanyId,
        demo_session_id: demoSessionIdForInsert,
        language: effectiveViewingLanguage,
        created_at: new Date().toISOString()
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

    await loadExperiences(true, null, demoSessionIdForInsert);

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
    alert(t('error_saving_experience'));
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
  alert(t('can_only_delete_own_experiences'));
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
    // .eq('company_id', ...) é uma segunda trava: mesmo que o id viesse de
    // algum lugar errado, nunca apaga fora da empresa ativa no momento.
    const { error } = await supabase
      .from('experiences')
      .delete()
      .eq('id', id)
      .eq('company_id', effectiveCompanyId);
    
    if (error) throw error;
    await loadExperiences(true);
    
    // Restaurar posição
    setTimeout(() => {
      window.scrollTo({ top: scrollPosition, behavior: 'instant' });
    }, 100);
    
    return true;
  } catch (error) {
    console.error('Error deleting experience:', error);
    alert(t('error_deleting_experience'));
    return false;
  }
};

  const handleAddComment = async (experienceId) => {
    if (isReadOnlyOrMasterManaging) return;
  const contentCompanyId = loggedInIsDemoId ? defaultCompanyId : effectiveCompanyId;
  if (!newComment[experienceId]?.trim()) {
    alert(t('please_enter_comment'));
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

    const demoSessionIdForInsert = (isDemoModeActive || loggedInIsDemoId) ? await ensureDemoSessionId() : null;
    
    const { error } = await supabase
      .from('comments')
      .insert([{
        experience_id: experienceId,
        comment_text: newComment[experienceId],
        author: appSettings.requireEmployeeLogin ? (await getEmployeeName(employeeId)) : '',
        employee_id: appSettings.requireEmployeeLogin ? employeeId : null,
        country: userCountryName || '',
        cv_url: cvUrl,
        cv_filename: cvFilename,
        company_id: contentCompanyId,
        demo_session_id: demoSessionIdForInsert,
        created_at: new Date().toISOString()
      }]);
    
    if (error) throw error;
    
    // Limpar campo e CV
    setNewComment({...newComment, [experienceId]: ''});
    const newFiles = {...commentCvFiles};
    delete newFiles[experienceId];
    setCommentCvFiles(newFiles);
    
    await loadExperiences(true, null, demoSessionIdForInsert);
    // Garantir que os IDs dos comentarios existem no estado de reacoes
    const { data: freshComments } = await supabase
      .from('comments')
      .select('id')
      .eq('experience_id', experienceId);
    if (freshComments?.length) {
      // Inicializar IDs novos com objeto vazio pra o icone aparecer imediatamente
      setReactions(prev => {
        const updated = { ...prev };
        freshComments.forEach(c => {
          if (!updated[c.id]) updated[c.id] = {};
        });
        return updated;
      });
      await loadReactions(freshComments.map(c => c.id));
    }
  } catch (error) {
    console.error('Error adding comment:', error);
    alert(t('error_adding_comment'));
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
    if (isReadOnlyOrMasterManaging) return;
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

  // Categoria, practice e tags são texto específico do idioma (o nome muda
  // por idioma, já que cada tradução é uma linha própria) — se o idioma de
  // visualização mudar com um desses filtros ainda selecionado, o valor
  // antigo nunca vai bater com nada na lista nova, zerando os resultados em
  // silêncio (foi exatamente o bug que zerava "Individual Experiences" ao
  // trocar pra chinês, enquanto "Key Insights" — que usa outro filtro — ficava
  // ok). Resetar tudo isso sempre que o idioma efetivo mudar.
  useEffect(() => {
    setFilters(prev => ({ ...prev, problemCategory: '' }));
    setFilterPracticeId(null);
    setFilterTags([]);
    setKeyInsightCategory('');
  }, [effectiveViewingLanguage]);
  
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
  const [newQuote, setNewQuote] = useState({ text: '', author: '', position: 'top', editions: ['corp', 'pro', 'edu'] });
  // Subtítulos da página (as duplas de frases embaixo do título) — até 3
  // por empresa, cada uma com idioma e edições aplicáveis. Se a empresa
  // não cadastrou nenhuma, cai no texto padrão fixo (hero_tagline_public +
  // share_work_experiences/accelerate_org_learning) — nunca fica em branco.
  const [pageSubtitles, setPageSubtitles] = useState([]);
  const [newSubtitle, setNewSubtitle] = useState({ line1: '', line2: '', editions: ['corp', 'pro', 'edu'] });
  const [editingSubtitle, setEditingSubtitle] = useState(null);
  const [editingSubtitleEditions, setEditingSubtitleEditions] = useState([]);
  const loadPageSubtitles = async () => {
    if (!effectiveCompanyId) return;
    try {
      const { data, error } = await supabase
        .from('page_subtitles')
        .select('*')
        .eq('company_id', effectiveCompanyId)
        .eq('language', effectiveViewingLanguage)
        .order('display_order', { ascending: true });
      if (error) throw error;
      // Sem filtro de edição aqui — a lista de admin mostra tudo (igual
      // Videos/Quotes), independente do dropdown. O filtro de edição
      // acontece só na hora de decidir o que exibir publicamente
      // (ver selectedSubtitle).
      setPageSubtitles(data || []);
    } catch (error) {
      console.error('Error loading page subtitles:', error);
    }
  };
  const addSubtitle = async () => {
    if (!newSubtitle.line1.trim()) { alert(t('please_enter_quote_text')); return; }
    if (newSubtitle.editions.length === 0) { alert(t('select_at_least_one_edition')); return; }
    // Limite é 3 por edição, não 3 no total — senão, uma entrada só pra
    // Corp já ocuparia "espaço" que deveria valer pra Pro/Edu também.
    const wouldExceedLimit = newSubtitle.editions.some(ed => {
      const countForThisEdition = pageSubtitles.filter(s =>
        (s.applicable_editions || 'corp,pro,edu').split(',').includes(ed)
      ).length;
      return countForThisEdition >= 3;
    });
    if (wouldExceedLimit) { alert(t('max_3_subtitles')); return; }
    try {
      const { error } = await supabase.from('page_subtitles').insert([{
        company_id: effectiveCompanyId,
        line1: newSubtitle.line1.trim(),
        line2: newSubtitle.line2.trim() || null,
        language: effectiveViewingLanguage,
        applicable_editions: newSubtitle.editions.length === 3 ? 'all' : newSubtitle.editions.join(','),
        display_order: pageSubtitles.length + 1
      }]);
      if (error) throw error;
      setNewSubtitle({ line1: '', line2: '', editions: ['corp', 'pro', 'edu'] });
      await loadPageSubtitles();
    } catch (error) {
      console.error('Error adding subtitle:', error);
      alert(t('generic_error') + ' ' + error.message);
    }
  };
  const deleteSubtitle = async (id) => {
    if (!window.confirm(t('confirm_delete_experience'))) return;
    try {
      const { error } = await supabase.from('page_subtitles').delete().eq('id', id);
      if (error) throw error;
      await loadPageSubtitles();
    } catch (error) {
      console.error('Error deleting subtitle:', error);
      alert(t('generic_error') + ' ' + error.message);
    }
  };
  const updateSubtitle = async (id, line1, line2, editions) => {
    if (!line1.trim()) { alert(t('please_enter_quote_text')); return; }
    if (editions.length === 0) { alert(t('select_at_least_one_edition')); return; }
    try {
      const { error } = await supabase.from('page_subtitles').update({
        line1: line1.trim(), line2: line2.trim() || null,
        applicable_editions: editions.length === 3 ? 'all' : editions.join(',')
      }).eq('id', id);
      if (error) throw error;
      setEditingSubtitle(null);
      await loadPageSubtitles();
    } catch (error) {
      console.error('Error updating subtitle:', error);
      alert(t('generic_error') + ' ' + error.message);
    }
  };
  // Escolhe uma dupla aleatória entre as cadastradas (se houver), sem
  // re-sortear a cada render — só quando a lista realmente muda.
  const selectedSubtitle = useMemo(() => {
    const matching = pageSubtitles.filter(s =>
      s.applicable_editions === 'all' || s.applicable_editions.split(',').includes(companyEdition)
    );
    if (matching.length === 0) return null;
    return matching[Math.floor(Math.random() * matching.length)];
  }, [pageSubtitles, companyEdition]);
  const [showGuidelinesModal, setShowGuidelinesModal] = useState(false);
  const [showHowItWorksModal, setShowHowItWorksModal] = useState(false);
  const [guidelines, setGuidelines] = useState('');
  const [editingGuidelines, setEditingGuidelines] = useState(false);
  const [contentPages, setContentPages] = useState({});
  // Só usado no ADM do Default — as 3 edições carregadas juntas, pra editar
  // as 3 sempre visíveis ao mesmo tempo, sem depender do dropdown.
  // Todas as entradas de Content Pages (não só a que bate com a edição
  // atual) — usado na tela de administração, igual Quotes: uma lista por
  // página, cada entrada com suas próprias edições marcadas.
  const [allContentPagesByKey, setAllContentPagesByKey] = useState({ community_guidelines: [], how_it_works: [], about: [] });
  const [newContentEntry, setNewContentEntry] = useState({ pageKey: '', content: '', editions: ['corp', 'pro', 'edu'] });
  const [editingContent, setEditingContent] = useState({ key: '', content: '' });
  const [showModal, setShowModal] = useState(null);
  
  // Estados para gerenciar vídeos promocionais
  const [promotionalVideos, setPromotionalVideos] = useState([]);
  // Lista completa, sem filtro de idioma/visibilidade — só pro painel de
  // admin, pra ele conseguir gerenciar itens ocultos ou de outro idioma.
  const [allPromotionalVideosAdmin, setAllPromotionalVideosAdmin] = useState([]);
  const [newVideoFile, setNewVideoFile] = useState(null);
  const [newVideoDuration, setNewVideoDuration] = useState('');
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [editingVideoDuration, setEditingVideoDuration] = useState({});
  const [editingVideoName, setEditingVideoName] = useState({});
  const [newItemType, setNewItemType] = useState('video');
  const [newLinkUrl, setNewLinkUrl] = useState('');
  const [newLinkLabel, setNewLinkLabel] = useState('');
  const [newItemLanguage, setNewItemLanguage] = useState('');
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
    { value: 'worked', label: t('worked'), color: 'bg-green-100 text-green-800' },
    { value: 'no-change', label: t('no_change'), color: 'bg-yellow-100 text-yellow-800' },
    { value: 'got-worse', label: t('got_worse'), color: 'bg-red-100 text-red-800' }
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
  if (isReadOnlyOrMasterManaging) return;
  if (userRatings[expId]) {
    console.log('🔍 Rating:', { expId, rating, filterMode });
    alert(t('already_rated_session'));
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
    setChangePasswordError(t('please_enter_new_password'));
    return;
  }
  if (changePasswordNew.length < 6) {
    setChangePasswordError(t('password_min_6_chars'));
    return;
  }
  if (changePasswordNew !== changePasswordConfirm) {
    setChangePasswordError(t('passwords_do_not_match'));
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
    alert(t('password_updated_success'));
  } catch (error) {
    console.error('Change password error:', error);
    setChangePasswordError(t('error_updating_password'));
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

  // Fechar dropdown de categoria do filtro (See What Others Did) ao clicar fora
  useEffect(() => {
    if (!showFilterCategoryDropdown) return;
    const handleClick = (e) => {
      if (!e.target.closest('.filter-category-dropdown-container')) {
        setShowFilterCategoryDropdown(false);
        setHoveredFilterCategory(null);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [showFilterCategoryDropdown]);

  // Fechar dropdown de categoria do filtro (Key Insights) ao clicar fora
  useEffect(() => {
    if (!showKeyInsightCategoryDropdown) return;
    const handleClick = (e) => {
      if (!e.target.closest('.key-insight-category-dropdown-container')) {
        setShowKeyInsightCategoryDropdown(false);
        setHoveredKeyInsightCategory(null);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [showKeyInsightCategoryDropdown]);

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

      // No desktop, sair do fullscreen só deve voltar pro tamanho reduzido
      // dentro do modal — não fechar tudo. Só no mobile (onde o fullscreen é
      // forçado ao abrir) que "sair do fullscreen" significa "terminei".
      if (window.innerWidth > 640) return;

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
    if (!effectiveCompanyId) return;
    try {
      let query = supabase
        .from('quotes')
        .select('*')
        .eq('active', true)
        .eq('company_id', effectiveCompanyId)
        .order('id', { ascending: true });
      if (isViewingDefault) {
        query = query.eq('language', effectiveViewingLanguage);
      }
      const { data, error } = await query;
      
      if (error) throw error;

      // Filtro de edição — lista separada por vírgula, feito no cliente
      // (o valor 'corp,pro,edu' representa "todas", já que a coluna não
      // aceita nulo). Só filtra quando isViewingDefault, igual idioma.
      const filtered = isViewingDefault
        ? (data || []).filter(q => (q.edition || 'corp,pro,edu').split(',').includes(companyEdition))
        : (data || []);
      
      // Randomize order
      const shuffled = [...filtered].sort(() => Math.random() - 0.5);
      setQuotes(shuffled);
    } catch (error) {
      console.error('Error loading quotes:', error);
    }
  };

  const addQuote = async () => {
    if (!newQuote.text.trim()) {
      alert(t('please_enter_quote_text'));
      return;
    }
    
    if (newQuote.position === 'bottom' && !newQuote.author.trim()) {
      alert(t('author_required_bottom'));
      return;
    }
    if (newQuote.editions.length === 0) {
      alert(t('select_at_least_one_edition'));
      return;
    }
    
    try {
      const { error } = await supabase
        .from('quotes')
        .insert([{
          text: newQuote.text,
          author: newQuote.author,
          position: newQuote.position,
          active: true,
          company_id: effectiveCompanyId,
          language: effectiveViewingLanguage,
          edition: newQuote.editions.join(',')
        }]);
      
      if (error) throw error;
      
      setNewQuote({ text: '', author: '', position: 'top', editions: ['corp', 'pro', 'edu'] });
      await loadQuotes();
    } catch (error) {
      console.error('Error adding quote:', error);
      alert(t('error_adding_quote'));
    }
  };

  const updateQuote = async (id, text, author, position, edition) => {
    try {
      const { error } = await supabase
        .from('quotes')
        .update({ text, author, position, edition: edition || 'corp,pro,edu' })
        .eq('id', id);
      
      if (error) throw error;
      
      setEditingQuote(null);
      await loadQuotes();
    } catch (error) {
      console.error('Error updating quote:', error);
      alert(t('error_updating_quote'));
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
      alert(t('error_deleting_quote'));
    }
  };

  const CONTENT_PAGE_DEFAULTS = {
    community_guidelines: 'Community Guidelines',
    how_it_works: 'How It Works',
    about: 'About'
  };

  // Textos padrão combinados por edição — usados pelo botão "Use suggestion
  // from Default" na edição de Subtítulos, pra reverter caso alguém edite
  // e queira voltar ao texto original acordado. Reaproveita as mesmas
  // chaves do dicionário usadas no fallback de código, já traduzidas nos
  // 4 idiomas — respeita o idioma sendo editado no momento.
  const SUBTITLE_DEFAULTS = {
    corp: { line1: t('hero_tagline_public'), line2: `${t('share_work_experiences')} ${t('accelerate_org_learning')}` },
    pro: { line1: t('hero_tagline_public'), line2: t('subtitle_line2_pro') },
    edu: { line1: t('hero_tagline_public'), line2: t('subtitle_line2_edu') }
  };

  const loadContentPages = async () => {
    if (!effectiveCompanyId) return;
    try {
      const { data, error } = await supabase
        .from('content_pages')
        .select('*')
        .eq('company_id', effectiveCompanyId)
        .eq('language', effectiveViewingLanguage);
      if (error) throw error;

      // Entre as entradas de uma mesma página, pega a primeira que inclui
      // a edição em contexto — pode existir mais de uma (ex: uma genérica
      // pra todas, outra específica só pra Edu).
      const pickMatching = (rows) => {
        const obj = {};
        (rows || []).forEach(page => {
          if (obj[page.page_key]) return; // já achou uma pra essa página
          const editions = (page.applicable_editions || 'corp,pro,edu').split(',');
          if (editions.includes(companyEdition)) obj[page.page_key] = page;
        });
        return obj;
      };

      const pagesObj = pickMatching(data);

      // Fallback pra inglês nas páginas que ainda não têm versão traduzida
      // pro idioma atual (igual já funciona pra experiences) — cobre tanto
      // o Default (conteúdo do Curador) quanto uma empresa que só escreveu
      // em um idioma até agora. Continua na mesma edição, só troca idioma.
      if (effectiveViewingLanguage !== 'en') {
        const missingKeys = ['community_guidelines', 'how_it_works', 'about'].filter(k => !pagesObj[k]);
        if (missingKeys.length > 0) {
          const { data: fallback } = await supabase
            .from('content_pages')
            .select('*')
            .eq('company_id', effectiveCompanyId)
            .eq('language', 'en')
            .in('page_key', missingKeys);
          const fallbackMatched = pickMatching(fallback);
          Object.assign(pagesObj, fallbackMatched);
        }
      }

      setContentPages(pagesObj);
    } catch (error) {
      console.error('Error loading content pages:', error);
    }
  };

  // (updateContentPage antiga removida — substituída por
  // updateContentPageEntry, que trabalha com o novo modelo de lista +
  // checkboxes de edição, igual Quotes)


  // Todas as entradas de Content Pages, agrupadas por página — usado na
  // tela de administração (lista, igual Quotes), independente de edição.
  const loadAllContentPages = async () => {
    if (!effectiveCompanyId) return;
    try {
      const { data, error } = await supabase
        .from('content_pages')
        .select('*')
        .eq('company_id', effectiveCompanyId)
        .eq('language', effectiveViewingLanguage)
        .order('created_at', { ascending: true });
      if (error) throw error;
      const byKey = { community_guidelines: [], how_it_works: [], about: [] };
      (data || []).forEach(page => {
        if (byKey[page.page_key]) byKey[page.page_key].push(page);
      });
      setAllContentPagesByKey(byKey);
    } catch (error) {
      console.error('Error loading all content pages:', error);
    }
  };

  const addContentPageEntry = async () => {
    if (!newContentEntry.pageKey) return;
    if (!newContentEntry.content.trim()) { alert(t('enter_content_markdown')); return; }
    if (newContentEntry.editions.length === 0) { alert(t('select_at_least_one_edition')); return; }
    try {
      const title = CONTENT_PAGE_DEFAULTS[newContentEntry.pageKey] || newContentEntry.pageKey;
      const { error } = await supabase.from('content_pages').insert([{
        page_key: newContentEntry.pageKey, content: newContentEntry.content, title,
        company_id: effectiveCompanyId,
        language: effectiveViewingLanguage,
        applicable_editions: newContentEntry.editions.join(',')
      }]);
      if (error) throw error;
      setNewContentEntry({ pageKey: '', content: '', editions: ['corp', 'pro', 'edu'] });
      await loadAllContentPages();
      await loadContentPages();
      alert(t('content_updated_success'));
    } catch (error) {
      console.error('Error adding content page entry:', error);
      alert(t('error_updating_content'));
    }
  };

  const updateContentPageEntry = async (id, content, editions) => {
    if (editions.length === 0) { alert(t('select_at_least_one_edition')); return; }
    try {
      const { error } = await supabase.from('content_pages').update({
        content, applicable_editions: editions.join(','), updated_at: new Date().toISOString()
      }).eq('id', id);
      if (error) throw error;
      setEditingContent({ key: '', content: '' });
      await loadAllContentPages();
      await loadContentPages();
      alert(t('content_updated_success'));
    } catch (error) {
      console.error('Error updating content page entry:', error);
      alert(t('error_updating_content'));
    }
  };

  const deleteContentPageEntry = async (id) => {
    if (!window.confirm(t('confirm_delete_quote'))) return;
    try {
      const { error } = await supabase.from('content_pages').delete().eq('id', id);
      if (error) throw error;
      await loadAllContentPages();
      await loadContentPages();
    } catch (error) {
      console.error('Error deleting content page entry:', error);
      alert(t('generic_error') + ' ' + error.message);
    }
  };

  // ==================== FUNÇÕES PARA GERENCIAR VÍDEOS PROMOCIONAIS ====================
  
  const loadPromotionalVideos = async () => {
    if (!effectiveCompanyId) return;
    try {
      const { data, error } = await supabase
        .from('promotional_videos')
        .select('*')
        .eq('company_id', effectiveCompanyId)
        .order('display_order', { ascending: true });
      
      if (error) throw error;

      // Filtro pro carrossel PÚBLICO: só itens marcados como visíveis, no
      // idioma sendo visualizado (itens sem idioma continuam aparecendo em
      // qualquer idioma), e na edição em contexto (idem, sem edição definida
      // aparece em qualquer edição — não some conteúdo antigo).
      const filtered = (data || []).filter(v =>
        (v.visible !== false) &&
        (!v.language || v.language === effectiveViewingLanguage) &&
        (v.edition == null || v.edition.split(',').includes(companyEdition))
      );
      
      const videos = filtered.map(video => ({
        id: video.id,
        url: video.video_url,
        duration: video.duration,
        display_order: video.display_order,
        fileType: video.file_type || 'video',
        linkUrl: video.link_url || null,
        linkLabel: video.link_label || null,
        visible: video.visible !== false,
        language: video.language || null
      }));
      
      setPromotionalVideos(videos);
      console.log('✅ Vídeos carregados do banco:', videos.length);

      // Lista completa, sem filtro — usada só pelo painel de admin, pra
      // gerenciar tudo (inclusive itens ocultos ou de outro idioma).
      const allVideos = (data || []).map(video => ({
        id: video.id,
        url: video.video_url,
        duration: video.duration,
        display_order: video.display_order,
        fileType: video.file_type || 'video',
        linkUrl: video.link_url || null,
        linkLabel: video.link_label || null,
        visible: video.visible !== false,
        language: video.language || null
      }));
      setAllPromotionalVideosAdmin(allVideos);

      // Gerar thumbnails para apresentações
      const presentations = allVideos.filter(v => v.fileType === 'presentation');
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
        alert(t('please_enter_url'));
        return;
      }
      try {
        const maxOrder = allPromotionalVideosAdmin.length > 0
          ? Math.max(...allPromotionalVideosAdmin.map(v => v.display_order || 0))
          : 0;
        const { error } = await supabase
          .from('promotional_videos')
          .insert([{
            video_url: '',
            duration: '',
            display_order: maxOrder + 1,
            file_type: 'link',
            link_url: newLinkUrl.trim(),
            link_label: newLinkLabel.trim() || 'Visit Link',
            company_id: effectiveCompanyId,
            language: newItemLanguage || null
          }]);
        if (error) throw error;
        await loadPromotionalVideos();
        setNewLinkUrl('');
        setNewLinkLabel('');
        setNewItemLanguage('');
        alert(t('link_added_success'));
      } catch (error) {
        alert(t('error_adding_link') + ' ' + error.message);
      }
      return;
    }

    if (!newVideoFile) {
      alert(t('please_select_file'));
      return;
    }

    if (newItemType === 'video' && !newVideoDuration) {
      alert(t('please_enter_video_duration'));
      return;
    }

    setUploadingVideo(true);

    try {
      // 1. Upload do arquivo
      const videoUrl = await uploadVideoToSupabase(newVideoFile);

      // 2. Pegar a maior ordem atual
      const maxOrder = allPromotionalVideosAdmin.length > 0 
        ? Math.max(...allPromotionalVideosAdmin.map(v => v.display_order || 0))
        : 0;

      // 3. Inserir no banco
      const { error } = await supabase
        .from('promotional_videos')
        .insert([{
          video_url: videoUrl,
          duration: newItemType === 'video' ? newVideoDuration : '',
          display_order: maxOrder + 1,
          file_type: newItemType,
          company_id: effectiveCompanyId,
          link_label: newLinkLabel.trim() || null,
          language: newItemLanguage || null
        }]);

      if (error) throw error;

      // 4. Recarregar lista
      await loadPromotionalVideos();

      // 5. Limpar campos
      setNewVideoFile(null);
      setNewVideoDuration('');
      setNewLinkLabel('');
      setNewItemLanguage('');
      
      // Limpar input file — usa a ref específica desse input, não um
      // querySelector genérico (que pegava o PRIMEIRO input de arquivo da
      // página inteira, quase sempre um errado, de outra seção).
      if (promoVideoFileInputRef.current) promoVideoFileInputRef.current.value = '';

      alert(t('video_added_success'));
    } catch (error) {
      console.error('Error adding video:', error);
      alert(t('error_adding_video') + ' ' + error.message);
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
      alert(t('video_deleted_success'));
    } catch (error) {
      console.error('Error deleting video:', error);
      alert(t('error_deleting_video'));
    }
  };

  const moveVideoUp = async (index) => {
    if (index === 0) return; // Já está no topo

    const newVideos = [...allPromotionalVideosAdmin];
    [newVideos[index], newVideos[index - 1]] = [newVideos[index - 1], newVideos[index]];
    
    setAllPromotionalVideosAdmin(newVideos);
    await updateVideoOrders(newVideos);
  };

  const moveVideoDown = async (index) => {
    if (index === allPromotionalVideosAdmin.length - 1) return; // Já está no final

    const newVideos = [...allPromotionalVideosAdmin];
    [newVideos[index], newVideos[index + 1]] = [newVideos[index + 1], newVideos[index]];
    
    setAllPromotionalVideosAdmin(newVideos);
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
      alert(t('error_updating_video_order'));
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
      alert(t('duration_updated_success'));
    } catch (error) {
      console.error('Error updating duration:', error);
      alert(t('error_updating_duration'));
    }
  };

  const updateVideoName = async (videoId, newName) => {
    try {
      const { error } = await supabase
        .from('promotional_videos')
        .update({ link_label: newName.trim() || null })
        .eq('id', videoId);

      if (error) throw error;

      await loadPromotionalVideos();
      setEditingVideoName({});
    } catch (error) {
      console.error('Error updating name:', error);
      alert(t('error_updating_name'));
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
      alert(t('comment_not_found'));
      return;
    }
    
    // Verificar se é o dono (modo Corp)
if (appSettings.requireEmployeeLogin && !isAdmin && comment.employeeId !== employeeId) {
  alert(t('can_only_delete_own_comments'));
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
    alert(t('error_deleting_comment'));
  }
};


  const getKeywordMatches = () => {
  const hasKeyword = !!adminKeywords.trim();
  const hasPracticeOrCategory = !!deletionPracticeId || !!deletionCategory;
  const hasDataTypeOrSource = deletionDataType !== 'all' || deletionSource !== 'all';
  if (!hasKeyword && !hasPracticeOrCategory && !hasDataTypeOrSource) return [];
  const keywords = hasKeyword ? adminKeywords.toLowerCase().split(',').map(k => k.trim()).filter(k => k) : [];
  const matches = [];
  experiences.forEach(exp => {
    // Filtro de Practice/Category — se marcado, a experience precisa bater
    if (deletionPracticeId && exp.practiceId !== deletionPracticeId) return;
    if (deletionCategory && exp.problemCategory !== deletionCategory) return;
    // Filtro de Data Type — Individual Experiences vs Common Cases/Key Insights
    if (deletionDataType === 'individual' && exp.author === 'key_insights') return;
    if (deletionDataType === 'key_insights' && exp.author !== 'key_insights') return;
    // Filtro de Source — Curated/Sample vs Entered by Users
    if (deletionSource === 'curated' && exp.source === 'app') return;
    if (deletionSource === 'users' && exp.source !== 'app') return;

    if (hasKeyword) {
      const searchText = `${exp.problem} ${exp.solution} ${exp.result} ${exp.author} ${exp.employeeId || ''} ${exp.source !== 'app' ? 'Curator' : ''}`.toLowerCase();
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
    } else {
      // Sem keyword — Practice/Category/Data Type/Source marcados: toda
      // experience que bater com os filtros ativos entra na lista
      matches.push({
        type: 'experience',
        expId: exp.id,
        keyword: null,
        text: `Problem: ${exp.problem}. Solution: ${exp.solution}. Result: ${exp.result}`
      });
    }
  });
  return matches;
};

// Apaga tudo que estiver batendo com o filtro atual (keyword e/ou Practice/Category)
// Limpa todos os filtros do Manage Group Deletion depois de um "Delete All"
// bem-sucedido — sem isso, os filtros ficavam "grudados" apontando pra algo
// que acabou de ser apagado.
const resetDeletionFilters = () => {
  setAdminKeywords('');
  setDeletionPracticeId(null);
  setDeletionCategory('');
  setDeletionCategoriesForPractice([]);
  setDeletionDataType('all');
  setDeletionSource('all');
  setDeletionFiltersRemountKey(k => k + 1);
};

const handleDeleteAllMatches = async () => {
  const matches = getKeywordMatches();
  const expIds = [...new Set(matches.filter(m => m.type === 'experience').map(m => m.expId))];
  const commentMatches = matches.filter(m => m.type === 'comment');
  if (expIds.length === 0 && commentMatches.length === 0) return;

  if (!window.confirm(tConfirm('delete_experiences_comments', { exp: expIds.length, com: commentMatches.length }))) return;
  try {
    // Comentários que bateram individualmente (sem apagar a experience pai)
    if (commentMatches.length > 0) {
      const commentIds = commentMatches.map(c => c.commentId);
      await supabase.from('comments').delete().in('id', commentIds);
    }
    // Experiences que bateram — apagadas em lote, não uma por uma
    if (expIds.length > 0) {
      const matchedExps = experiences.filter(e => expIds.includes(e.id));
      await supabase.from('comments').delete().in('experience_id', expIds);
      await supabase.from('top_experiences').delete().in('experience_id', expIds);
      for (const exp of matchedExps) {
        if (exp.cvUrl) await deleteFileFromStorage(exp.cvUrl);
        (exp.comments || []).forEach(async (comment) => {
          if (comment.cvUrl) await deleteFileFromStorage(comment.cvUrl);
        });
      }
      const { error } = await supabase.from('experiences').delete().in('id', expIds).eq('company_id', effectiveCompanyId);
      if (error) throw error;
    }
    await loadExperiences(true);
    alert(tAlert('deleted_experiences_comments', { exp: expIds.length, com: commentMatches.length }));
    resetDeletionFilters();
  } catch (error) {
    console.error('Error deleting matches:', error);
    alert(t('error_deleting_items') + ' ' + error.message);
  }
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
    // Limpa qualquer resíduo de Follow-On, já que "Voltar" abandona a
    // entrada que estava sendo preenchida.
    setFollowOnParentId(null);
    setSelectedPracticeId(null);
    setShareFormPracticeId(null);
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

  // ⭐ Hide/Show Top3 — testando remover TODA a compensação manual de scroll.
  // As 3 tentativas anteriores (altura do bloco, delta de posição uma vez,
  // delta contínuo por 20 frames) falharam igualmente em Chrome E Safari
  // desktop — ou seja, o problema não é uma peculiaridade de motor de
  // navegador (scroll anchoring etc), é algo no nosso próprio código de
  // compensação. No mobile, onde NUNCA rodamos nenhum JS de scroll, sempre
  // funcionou perfeitamente. Por isso agora tratamos desktop e mobile do
  // mesmo jeito: deixar o navegador cuidar disso sozinho, sem nenhuma
  // interferência nossa.
  const handleTop3Toggle = (show) => {
    setTop3VisibleInSession(show);
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
    const categoryLabel = practiceName && !HIDDEN_PRACTICE_NAMES.includes(practiceName)
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
              <span className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-medium">{tFollowOnExperience(threadIndex)}</span>
            </div>
            {/* By + delete */}
            <div className="mb-3">
              {(fo.author || fo.gender || fo.age || fo.country || fo.employeeId) && (
                <span className="text-xs text-gray-600 block">
                  {t('by')} {appSettings.requireEmployeeLogin
                    ? [fo.author, fo.employeeId, fo.country].filter(Boolean).join(', ')
                    : [fo.author, fo.gender, fo.age, fo.country].filter(Boolean).join(', ')}
                </span>
              )}
              {fo.source === 'app' && fo.createdAt && (
                <span className="text-xs text-gray-400 block">
                  {new Date(fo.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                </span>
              )}
              {appSettings.requireEmployeeLogin && fo.employeeId === employeeId && (
                <button onClick={async () => { if (window.confirm(t('confirm_delete_experience'))) await deleteExperienceFromSupabase(fo.id); }}
                  className="text-red-600 hover:text-red-800 text-xs mt-3 inline-flex items-center gap-1">
                  {t('delete_experience')}
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
                    <span className="text-xs text-gray-500 ml-1">({fo.totalRatings} {tRatingCount(fo.totalRatings)})</span>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <div className="text-xs text-gray-600 mb-1">{t('your_rating')}</div>
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
                  <h4 className="font-semibold text-red-600 flex items-center gap-2"><AlertCircle size={16}/>{t('problem')}</h4>
                  <CategoryBadge label={categoryLabel} />
                </div>
                <p className="text-sm text-gray-700">{highlightText(fo.problem, searchTerms)}</p>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-blue-600 flex items-center gap-2"><TrendingUp size={16}/>{t('action')}</h4>
                <p className="text-sm text-gray-700">{highlightText(fo.solution, searchTerms)}</p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-green-600 flex items-center gap-2"><Share2 size={16}/>{t('result')}</h4>
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
            {/* Matching Common Case / Matching Experiences — mesmo mecanismo do card principal */}
            {(() => {
              const belongsToManagedCompany = fo.companyId === effectiveCompanyId || (!fo.companyId && effectiveCompanyId === defaultCompanyId);
              const canLinkCommonCase = fo.author !== 'key_insights' && ((isAdmin && !isSeller && belongsToManagedCompany) || (fo.source === 'app' && (appSettings.requireEmployeeLogin ? fo.employeeId === employeeId : true)) || isDemoModeActive || loggedInIsDemoId);
              return ((fo.relatedCommonCaseId && (fo.source === 'uploaded' || fo.source === 'app')) ||
              experiences.some(e => (e.source === 'uploaded' || e.source === 'app') && e.relatedCommonCaseId === fo.id) ||
              (!fo.relatedCommonCaseId && canLinkCommonCase && getMatchingCommonCasesFor(fo).length > 0)) && (
              <div className="mb-4 flex flex-wrap gap-2 justify-end">
                {fo.relatedCommonCaseId && (fo.source === 'uploaded' || fo.source === 'app') && (
                  <span className="inline-flex items-center gap-1">
                  <button
                    onClick={() => navigateToKeyInsight(fo.relatedCommonCaseId)}
                    className="inline-flex items-center gap-1 text-xs bg-purple-100 text-purple-800 px-3 py-1 rounded-full border-2 border-purple-300 hover:bg-purple-200 transition-colors cursor-pointer"
                  >
                    <Target size={12} />
                    {t('matching_common_case')}
                  </button>
                  {canLinkCommonCase && (
                    <button onClick={() => openLinkCommonCaseModal(fo)} className="text-sm text-gray-500 hover:text-purple-600 px-1" title={t('edit')}>✎</button>
                  )}
                  </span>
                )}
                {!fo.relatedCommonCaseId && canLinkCommonCase && getMatchingCommonCasesFor(fo).length > 0 && (
                  <button
                    onClick={() => openLinkCommonCaseModal(fo)}
                    className="inline-flex items-center gap-1 text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-full border-2 border-gray-300 hover:bg-purple-100 hover:text-purple-700 hover:border-purple-300 transition-colors cursor-pointer"
                  >
                    <Target size={12} />
                    {t('add_matching_common_case_btn')}
                  </button>
                )}
                {(() => {
                  const mappedCount = experiences.filter(e => (e.source === 'uploaded' || e.source === 'app') && e.relatedCommonCaseId === fo.id).length;
                  if (mappedCount > 0) {
                    return (
                      <button
                        onClick={() => showMappedExperiences(fo.id)}
                        className="inline-flex items-center gap-1 text-xs bg-green-100 text-green-800 px-3 py-1 rounded-full border-2 border-green-300 hover:bg-green-200 transition-colors cursor-pointer"
                      >
                        <Users size={12} />
                        {tMatchingExperiences(mappedCount)}
                      </button>
                    );
                  }
                  return null;
                })()}
              </div>
            );
            })()}
            {/* Comments */}
            <div className="border-t pt-4 mt-4">
              <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2"><MessageCircle size={18}/>{t('add_a_comment')}</h4>
              <div className="space-y-2">
                <textarea value={newComment[fo.id] || ''}
                  onChange={(e) => { if (e.target.value.length <= maxChars.comment) setNewComment(c => ({...c, [fo.id]: e.target.value})); }}
                  placeholder={t('share_your_thoughts')}
                  className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none resize-none" rows="2" />
                <div className="flex gap-2 items-center">
                  {appSettings.allowCvUpload && (
                    !commentCvFiles[fo.id] ? (
                      <label className="px-3 py-2 bg-gray-100 border-2 border-gray-200 rounded-lg hover:bg-gray-200 cursor-pointer flex items-center gap-1 text-sm">
                        <input type="file" accept={appSettings.documentType === 'cv' ? '.pdf' : '.pdf,.pptx,.xlsx,.docx,.ppt,.xls,.doc'}
                          onChange={(e) => { const file = e.target.files[0]; if (file && file.size <= 5000000) setCommentCvFiles(f => ({...f, [fo.id]: file})); e.target.value = ''; }}
                          className="hidden" />
                        {appSettings.documentType === 'cv' ? '📎 CV' : t('file_badge')}
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
                    {showComments[fo.id] ? tHideAllComments() : tShowAllComments(fo.comments.length, false)}
                  </button>
                  {showComments[fo.id] && (
                    <div className="space-y-3">
                      {fo.comments.map(comment => (
                        <div key={comment.id} className="bg-gray-50 rounded-lg p-3 relative">
                          {/* Autor */}
                          {appSettings.requireEmployeeLogin && (comment.author || comment.employeeId || comment.country) && (
                            <span className="text-xs text-gray-500 block">
                              {t('by')} {[comment.author, comment.country].filter(Boolean).join(', ')}
                            </span>
                          )}
                          {comment.createdAt && (
                            <span className="text-xs text-gray-400 block mb-1">
                              {new Date(comment.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                            </span>
                          )}
                          <p className="text-sm text-gray-700">{comment.text}</p>
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
                              <button className="flex items-center justify-center w-7 h-7 rounded-full border border-gray-300 bg-white text-gray-400 hover:border-purple-400 hover:text-purple-500 transition-colors" title={t('react_tooltip')}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z"/><path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/></svg>
                              </button>
                              <div className="hidden group-hover:block absolute bottom-0 left-0 z-50" style={{ paddingBottom: '28px', width: '196px' }}>
                                <div className="bg-white border border-gray-200 rounded-xl shadow-xl p-2">
                                  <div className="grid grid-cols-7 gap-1">
                                    {REACTION_EMOJIS.map(emoji => (
                                      <button key={emoji} onClick={() => toggleReaction(comment.id, emoji)} className="text-xl hover:scale-125 transition-transform p-0.5 rounded">{emoji}</button>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                          {/* Delete - só para o dono */}
                          {comment.employeeId === employeeId && (
                            <button
                              onClick={() => { if (window.confirm(t('confirm_delete_comment'))) handleDeleteComment(fo.id, comment.id); }}
                              className="text-red-600 hover:text-red-800 text-xs mt-1 inline-flex items-center gap-1"
                            >🗑️ Delete Comment</button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                  {/* Último comentário visível por default */}
                  {showComments[fo.id] !== true && showComments[fo.id] !== false && fo.comments.length > 0 && (() => {
                    const lastComment = fo.comments[fo.comments.length - 1];
                    return (
                      <div className="bg-gray-50 rounded-lg p-3 border-2 border-purple-200 relative">
                        {appSettings.requireEmployeeLogin && (lastComment.author || lastComment.country) && (
                          <span className="text-xs text-gray-500 block mb-1">
                            {t('by')} {[lastComment.author, lastComment.country].filter(Boolean).join(', ')}
                          </span>
                        )}
                        {lastComment.createdAt && (
                          <span className="text-xs text-gray-400 block mb-1">
                            {new Date(lastComment.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                          </span>
                        )}
                        <p className="text-sm text-gray-700">{lastComment.text}</p>
                        <div className="flex flex-wrap gap-1 mt-2 items-center">
                          {Object.entries(reactions[lastComment.id] || {}).map(([emoji, ids]) => (
                            <button
                              key={emoji}
                              onClick={() => toggleReaction(lastComment.id, emoji)}
                              className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-sm border transition-colors ${ids.includes(employeeId) ? 'bg-purple-100 border-purple-300 text-purple-700' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-100'}`}
                            >
                              <span>{emoji}</span>
                              <span className="text-xs font-medium">{ids.length}</span>
                            </button>
                          ))}
                          <div className="relative group">
                            <button className="flex items-center justify-center w-7 h-7 rounded-full border border-gray-300 bg-white text-gray-400 hover:border-purple-400 hover:text-purple-500 transition-colors" title={t('react_tooltip')}>
                              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z"/><path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/></svg>
                            </button>
                            <div className="hidden group-hover:block absolute bottom-0 left-0 z-50" style={{ paddingBottom: '28px', width: '196px' }}>
                              <div className="bg-white border border-gray-200 rounded-xl shadow-xl p-2">
                                <div className="grid grid-cols-7 gap-1">
                                  {REACTION_EMOJIS.map(emoji => (
                                    <button key={emoji} onClick={() => toggleReaction(lastComment.id, emoji)} className="text-xl hover:scale-125 transition-transform p-0.5 rounded">{emoji}</button>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        {lastComment.employeeId === employeeId && (
                          <button
                            onClick={() => { if (window.confirm(t('confirm_delete_comment'))) handleDeleteComment(fo.id, lastComment.id); }}
                            className="text-red-600 hover:text-red-800 text-xs mt-1 inline-flex items-center gap-1"
                          >🗑️ Delete Comment</button>
                        )}
                      </div>
                    );
                  })()}
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
                  captureNavSnapshot('share');
                  setFollowOnParentId(fo.id);
                  if (fo.practiceId) {
                    setSelectedPracticeId(fo.practiceId);
                    setShareFormPracticeId(fo.practiceId);
                    loadProblemCategories(fo.practiceId);
                  }
                  setCurrentEntry(prev => ({ ...prev, problemCategory: fo.problemCategory || '' }));
                  setActiveMainTab('share'); scrollToTabs();
                }} className="mt-3 text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1">
                  {t('add_follow_on')}
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
        <p className="text-gray-600">{t('loading_experiences')}</p>
      </div>
    </div>
  );
}
  return (
    <>

{/* ⭐ TELA DE AUTO-CADASTRO PRO — maior prioridade de todas, aparece antes
    de qualquer outra tela quando o link tem ?signup=... válido ⭐ */}
{proSignupInfo === 'invalid' ? (
  <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center p-6 text-center">
    <div className="max-w-sm">
      <p className="text-xl text-red-600 font-semibold mb-2">{t('pro_signup_invalid_title')}</p>
      <p className="text-gray-500">{t('pro_signup_invalid_message')}</p>
    </div>
  </div>
) : proSignupInfo && proSignupStep === 'confirm' ? (
  <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center p-6">
    <div className="max-w-sm w-full bg-white rounded-2xl shadow-xl p-6 text-center">
      <h2 className="text-lg font-bold text-gray-800 mb-4">{t('pro_signup_confirm_title')}</h2>
      <p className="text-gray-600 mb-6">
        {proSignupInfo.role === 'professional' ? t('pro_signup_confirm_professional') : t('pro_signup_confirm_contratante')}
        {' '}<strong>{proSignupInfo.company.name}</strong>?
      </p>
      <button
        onClick={() => setProSignupStep('form')}
        className="w-full bg-purple-600 text-white py-2.5 rounded-lg hover:bg-purple-700 font-semibold transition-colors"
      >
        {t('pro_signup_confirm_button')}
      </button>
    </div>
  </div>
) : proSignupInfo && proSignupStep === 'form' ? (
  <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center p-6">
    <div className="max-w-sm w-full bg-white rounded-2xl shadow-xl p-6">
      <h2 className="text-lg font-bold text-gray-800 mb-4 text-center">{t('pro_signup_confirm_title')}</h2>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('pro_signup_your_name')}</label>
          <input type="text" value={proSignupForm.name} onChange={(e) => setProSignupForm({...proSignupForm, name: e.target.value})}
            className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('pro_signup_your_email')}</label>
          <input type="email" value={proSignupForm.email} onChange={(e) => setProSignupForm({...proSignupForm, email: e.target.value})}
            className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none" />
        </div>
        {proSignupError && <p className="text-red-600 text-sm">{proSignupError}</p>}
        <button
          onClick={handleProSignupSendCode}
          className="w-full bg-purple-600 text-white py-2.5 rounded-lg hover:bg-purple-700 font-semibold transition-colors"
        >
          {t('pro_signup_continue_btn')}
        </button>
      </div>
    </div>
  </div>
) : proSignupInfo && proSignupStep === 'par-choice' ? (
  <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center p-6">
    <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-6">
      <h2 className="text-lg font-bold text-gray-800 mb-2 text-center">{t('pro_signup_pars_found_title')}</h2>
      <p className="text-sm text-gray-500 mb-4 text-center">{t('pro_signup_pars_found_hint')}</p>
      <div className="space-y-2 max-h-64 overflow-y-auto mb-4">
        {proSignupExistingPars.map(par => (
          <label key={par.id} className="flex items-start gap-2 p-2 border border-gray-200 rounded-lg cursor-pointer">
            <input
              type="checkbox"
              checked={proSignupSelectedPars.includes(par.id)}
              onChange={(e) => {
                setProSignupSelectedPars(prev =>
                  e.target.checked ? [...prev, par.id] : prev.filter(id => id !== par.id)
                );
              }}
              className="mt-1"
            />
            <span className="text-sm text-gray-700">{par.problem}</span>
          </label>
        ))}
      </div>
      {proSignupError && <p className="text-red-600 text-sm mb-3">{proSignupError}</p>}
      <button
        onClick={actuallySendProSignupCode}
        className="w-full bg-purple-600 text-white py-2.5 rounded-lg hover:bg-purple-700 font-semibold transition-colors"
      >
        {t('pro_signup_pars_choice_continue')}
      </button>
    </div>
  </div>
) : proSignupInfo && proSignupStep === 'verify' ? (
  <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center p-6">
    <div className="max-w-sm w-full bg-white rounded-2xl shadow-xl p-6">
      <h2 className="text-lg font-bold text-gray-800 mb-2 text-center">{t('pro_signup_confirm_title')}</h2>
      <p className="text-sm text-gray-500 mb-4 text-center">{t('pro_signup_verify_hint')}</p>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('verification_code')}</label>
          <input type="text" value={proSignupCodeInput} onChange={(e) => setProSignupCodeInput(e.target.value)}
            className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none" />
        </div>
        {proSignupError && <p className="text-red-600 text-sm">{proSignupError}</p>}
        <button
          onClick={handleProSignupVerifyCode}
          className="w-full bg-purple-600 text-white py-2.5 rounded-lg hover:bg-purple-700 font-semibold transition-colors"
        >
          {t('pro_signup_verify_btn')}
        </button>
      </div>
    </div>
  </div>
) : proSignupInfo && proSignupStep === 'password' ? (
  <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center p-6">
    <div className="max-w-sm w-full bg-white rounded-2xl shadow-xl p-6">
      <h2 className="text-lg font-bold text-gray-800 mb-4 text-center">{t('pro_signup_create_password')}</h2>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('new_password')}</label>
          <input type="password" value={proSignupPassword} onChange={(e) => setProSignupPassword(e.target.value)}
            className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
            placeholder={t('choose_a_password')} />
        </div>
        <div className="space-y-1">
          {PASSWORD_RULES.map((rule, i) => {
            const passed = rule.test(proSignupPassword);
            const ruleKeys = {
              'At least 8 characters': 'password_rule_8_chars',
              'At least one uppercase letter (A-Z)': 'password_rule_uppercase',
              'At least one lowercase letter (a-z)': 'password_rule_lowercase',
              'At least one number (0-9)': 'password_rule_number',
            };
            return (
              <div key={i} className={`text-xs flex items-center gap-1.5 ${passed ? 'text-green-600' : 'text-gray-400'}`}>
                <span>{passed ? '✓' : '○'}</span>
                <span>{t(ruleKeys[rule.label] || rule.label)}</span>
              </div>
            );
          })}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('confirm_password')}</label>
          <input type="password" value={proSignupConfirmPassword} onChange={(e) => setProSignupConfirmPassword(e.target.value)}
            className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none" />
        </div>
        {proSignupError && <p className="text-red-600 text-sm">{proSignupError}</p>}
        <button
          onClick={handleProSignupCreateAccount}
          className="w-full bg-purple-600 text-white py-2.5 rounded-lg hover:bg-purple-700 font-semibold transition-colors"
        >
          {t('pro_signup_create_account_btn')}
        </button>
      </div>
    </div>
  </div>
) : proSignupInfo && proSignupStep === 'done' ? (
  <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center p-6 text-center">
    <div className="max-w-sm w-full bg-white rounded-2xl shadow-xl p-6">
      <p className="text-xl text-green-600 font-semibold mb-2">{t('pro_signup_done_title')}</p>
      <p className="text-gray-500 mb-6">{t('pro_signup_done_message')}</p>
      <button
        onClick={() => {
          const url = new URL(window.location.href);
          url.searchParams.delete('signup');
          url.searchParams.delete('code');
          window.location.href = url.toString();
        }}
        className="w-full bg-purple-600 text-white py-2.5 rounded-lg hover:bg-purple-700 font-semibold transition-colors"
      >
        {t('pro_signup_go_to_login')}
      </button>
    </div>
  </div>
) : exitRequested ? (
  <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center p-6 text-center">
    <div>
      <p className="text-xl text-gray-700 font-semibold mb-2">{t('all_done')}</p>
      <p className="text-gray-500">{t('type_next_stop')}</p>
    </div>
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 text-purple-500 animate-bounce pointer-events-none select-none" style={{ fontSize: '36px', lineHeight: 1 }}>
      ↓
    </div>
  </div>
) : installLogoutMessage ? (
  <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 px-4 pt-16 pb-8 flex justify-center">
    <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6">
      <div className="mb-4 flex items-center gap-3">
        <img src="data:image/png;base64,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" alt="WID icon" width="44" height="44" style={{ borderRadius: '8px', flexShrink: 0 }} />
        <h3 className="text-lg font-bold text-gray-800">{t('add_icon_home_screen')}</h3>
      </div>
      <div className="space-y-4 text-sm text-gray-700">
        <p>{t('to_add_icon')}</p>
        <div className="flex items-center gap-3">
          <span className="flex-shrink-0 w-7 h-7 bg-purple-100 text-purple-700 rounded-full flex items-center justify-center font-bold">1</span>
          <img src="data:image/png;base64,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" alt="More options" width="32" height="32" style={{ flexShrink: 0 }} />
          <span>{t('tap_dots_button')}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex-shrink-0 w-7 h-7 bg-purple-100 text-purple-700 rounded-full flex items-center justify-center font-bold">2</span>
          <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEMAAABGCAYAAACXBynAAAAMTGlDQ1BJQ0MgUHJvZmlsZQAASImVVwdYU1cbPndkQggQiICMsJcgIiOAjBBWANlbVEISIIwYE4KKGymtYN0ighOtgihYrYAUF2pdFMW9iwMVpRZrcSv/CQG09B/P/z3Pufe97/nOe77vu+eOAwC9iy+V5qKaAORJ8mUxwf6spOQUFukZQAABMAEZoHyBXMqJigoH0IbPf7fX16A3tMsOSq1/9v9X0xKK5AIAkCiI04VyQR7EPwGAtwqksnwAiFLIm8/KlyrxWoh1ZDBAiGuUOFOFW5U4XYUvDvrExXAhfgQAWZ3Pl2UCoNEHeVaBIBPq0GG2wEkiFEsg9oPYJy9vhhDiRRDbQB84J12pz07/Sifzb5rpI5p8fuYIVuUyaOQAsVyay5/zf5bjf1termJ4DmvY1LNkITHKnGHdHuXMCFNidYjfStIjIiHWBgDFxcJBfyVmZilC4lX+qI1AzoU1g/cZoJPkubG8IT5GyA8Ig9gQ4gxJbkT4kE9RhjhI6QPrh1aI83lxEOtBXCOSB8YO+RyTzYgZnvdahozLGeKf8mWDMSj1Pyty4jkqfUw7S8Qb0sccC7PiEiGmQhxQIE6IgFgD4gh5TmzYkE9qYRY3YthHpohR5mIBsUwkCfZX6WPlGbKgmCH/3Xny4dyxY1liXsQQvpSfFReiqhX2SMAfjB/mgvWJJJz4YR2RPCl8OBehKCBQlTtOFkniY1U8rifN949RjcXtpLlRQ/64vyg3WMmbQRwnL4gdHluQDxenSh8vkeZHxanixCuz+aFRqnjwfSAccEEAYAEFbOlgBsgG4o7epl54peoJAnwgA5lABByGmOERiYM9EniMBYXgd4hEQD4yzn+wVwQKIP9pFKvkxCOc6ugAMob6lCo54DHEeSAM5MJrxaCSZCSCBPAIMuJ/RMSHTQBzyIVN2f/v+WH2C8OBTPgQoxiekUUf9iQGEgOIIcQgoi1ugPvgXng4PPrB5oyzcY/hPL74Ex4TOgkPCFcJXYSb08VFslFRTgZdUD9oqD7pX9cHt4Karrg/7g3VoTLOxA2AA+4C5+HgvnBmV8hyh+JWVoU1SvtvGXx1h4b8KE4UlDKG4kexGT1Sw07DdURFWeuv66OKNX2k3tyRntHzc7+qvhCew0Z7Yt9hB7DT2HHsLNaKNQEWdhRrxtqxw0o8suIeDa644dliBuPJgTqj18yXO6uspNypzqnH6aOqL180O1/5MHJnSOfIxJlZ+SwO/GKIWDyJwHEcy9nJ2Q0A5fdH9Xp7FT34XUGY7V+4Jb8B4H10YGDg5y9c6FEAfnSHr4RDXzgbNvy0qAFw5pBAIStQcbjyQIBvDjp8+vSBMTAHNjAfZ+AGvIAfCAShIBLEgWQwDUafBde5DMwC88BiUALKwEqwDlSCLWA7qAF7wX7QBFrBcfALOA8ugqvgNlw93eA56AOvwQcEQUgIDWEg+ogJYonYI84IG/FBApFwJAZJRtKQTESCKJB5yBKkDFmNVCLbkFrkR+QQchw5i3QiN5H7SA/yJ/IexVB1VAc1Qq3Q8Sgb5aBhaBw6Fc1EZ6KFaDG6HK1Aq9E9aCN6HD2PXkW70OdoPwYwNYyJmWIOGBvjYpFYCpaBybAFWClWjlVj9VgLvM+XsS6sF3uHE3EGzsId4AoOweNxAT4TX4AvwyvxGrwRP4lfxu/jffhnAo1gSLAneBJ4hCRCJmEWoYRQTthJOEg4BZ+lbsJrIpHIJFoT3eGzmEzMJs4lLiNuIjYQjxE7iQ+J/SQSSZ9kT/ImRZL4pHxSCWkDaQ/pKOkSqZv0lqxGNiE7k4PIKWQJuYhcTt5NPkK+RH5C/kDRpFhSPCmRFCFlDmUFZQelhXKB0k35QNWiWlO9qXHUbOpiagW1nnqKeof6Sk1NzUzNQy1aTay2SK1CbZ/aGbX7au/UtdXt1LnqqeoK9eXqu9SPqd9Uf0Wj0axofrQUWj5tOa2WdoJ2j/ZWg6HhqMHTEGos1KjSaNS4pPGCTqFb0jn0afRCejn9AP0CvVeTommlydXkay7QrNI8pHlds1+LoTVBK1IrT2uZ1m6ts1pPtUnaVtqB2kLtYu3t2ie0HzIwhjmDyxAwljB2ME4xunWIOtY6PJ1snTKdvTodOn262rouugm6s3WrdA/rdjExphWTx8xlrmDuZ15jvh9jNIYzRjRm6Zj6MZfGvNEbq+enJ9Ir1WvQu6r3Xp+lH6ifo79Kv0n/rgFuYGcQbTDLYLPBKYPesTpjvcYKxpaO3T/2liFqaGcYYzjXcLthu2G/kbFRsJHUaIPRCaNeY6axn3G28VrjI8Y9JgwTHxOxyVqToybPWLosDiuXVcE6yeozNTQNMVWYbjPtMP1gZm0Wb1Zk1mB215xqzjbPMF9r3mbeZ2FiMdlinkWdxS1LiiXbMstyveVpyzdW1laJVt9aNVk9tdaz5lkXWtdZ37Gh2fjazLSptrliS7Rl2+bYbrK9aIfaudpl2VXZXbBH7d3sxfab7DvHEcZ5jJOMqx533UHdgeNQ4FDncN+R6RjuWOTY5PhivMX4lPGrxp8e/9nJ1SnXaYfT7QnaE0InFE1omfCns52zwLnK+cpE2sSgiQsnNk986WLvInLZ7HLDleE62fVb1zbXT27ubjK3ercedwv3NPeN7tfZOuwo9jL2GQ+Ch7/HQo9Wj3eebp75nvs9//By8Mrx2u31dJL1JNGkHZMeept58723eXf5sHzSfLb6dPma+vJ9q30f+Jn7Cf12+j3h2HKyOXs4L/yd/GX+B/3fcD2587nHArCA4IDSgI5A7cD4wMrAe0FmQZlBdUF9wa7Bc4OPhRBCwkJWhVznGfEEvFpeX6h76PzQk2HqYbFhlWEPwu3CZeEtk9HJoZPXTL4TYRkhiWiKBJG8yDWRd6Oso2ZG/RxNjI6Krop+HDMhZl7M6VhG7PTY3bGv4/zjVsTdjreJV8S3JdATUhNqE94kBiSuTuxKGp80P+l8skGyOLk5hZSSkLIzpX9K4JR1U7pTXVNLUq9NtZ46e+rZaQbTcqcdnk6fzp9+II2Qlpi2O+0jP5Jfze9P56VvTO8TcAXrBc+FfsK1wh6Rt2i16EmGd8bqjKeZ3plrMnuyfLPKs3rFXHGl+GV2SPaW7Dc5kTm7cgZyE3Mb8sh5aXmHJNqSHMnJGcYzZs/olNpLS6RdMz1nrpvZJwuT7ZQj8qny5nwd+KPfrrBRfKO4X+BTUFXwdlbCrAOztWZLZrfPsZuzdM6TwqDCH+bicwVz2+aZzls87/58zvxtC5AF6QvaFpovLF7YvSh4Uc1i6uKcxb8WORWtLvprSeKSlmKj4kXFD78J/qauRKNEVnL9W69vt3yHfyf+rmPpxKUbln4uFZaeK3MqKy/7uEyw7Nz3E76v+H5gecbyjhVuKzavJK6UrLy2yndVzWqt1YWrH66ZvKZxLWtt6dq/1k1fd7bcpXzLeup6xfquivCK5g0WG1Zu+FiZVXm1yr+qYaPhxqUb32wSbrq02W9z/RajLWVb3m8Vb72xLXhbY7VVdfl24vaC7Y93JOw4/QP7h9qdBjvLdn7aJdnVVRNTc7LWvbZ2t+HuFXVonaKuZ0/qnot7A/Y21zvUb2tgNpTtA/sU+579mPbjtf1h+9sOsA/U/2T508aDjIOljUjjnMa+pqymrubk5s5DoYfaWrxaDv7s+POuVtPWqsO6h1ccoR4pPjJwtPBo/zHpsd7jmccftk1vu30i6cSVk9EnO06FnTrzS9AvJ05zTh89432m9azn2UPn2Oeazrudb2x3bT/4q+uvBzvcOhovuF9ovuhxsaVzUueRS76Xjl8OuPzLFd6V81cjrnZei79243rq9a4bwhtPb+befHmr4NaH24vuEO6U3tW8W37P8F71b7a/NXS5dR2+H3C//UHsg9sPBQ+fP5I/+thd/Jj2uPyJyZPap85PW3uCei4+m/Ks+7n0+Yfekt+1ft/4wubFT3/4/dHel9TX/VL2cuDPZa/0X+36y+Wvtv6o/nuv815/eFP6Vv9tzTv2u9PvE98/+TDrI+ljxSfbTy2fwz7fGcgbGJDyZfzBXwEMKLc2GQD8uQsAWjIADLhvpE5R7Q8HDVHtaQcR+E9YtYccNPjnUg//6aN74d/NdQD27QDACurTUwGIogEQ5wHQiRNH2vBebnDfqTQi3BtsjfmUnpcO/o2p9qRfxT36DJSqLmD0+V8beoLekNfRdQAAAERlWElmTU0AKgAAAAgAAgESAAMAAAABAAEAAIdpAAQAAAABAAAAJgAAAAAAAqACAAQAAAABAAAAQ6ADAAQAAAABAAAARgAAAABQ+3k6AAACAmlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iWE1QIENvcmUgNi4wLjAiPgogICA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPgogICAgICA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIgogICAgICAgICAgICB4bWxuczp0aWZmPSJodHRwOi8vbnMuYWRvYmUuY29tL3RpZmYvMS4wLyIKICAgICAgICAgICAgeG1sbnM6ZXhpZj0iaHR0cDovL25zLmFkb2JlLmNvbS9leGlmLzEuMC8iPgogICAgICAgICA8dGlmZjpPcmllbnRhdGlvbj4xPC90aWZmOk9yaWVudGF0aW9uPgogICAgICAgICA8ZXhpZjpQaXhlbFhEaW1lbnNpb24+Njc8L2V4aWY6UGl4ZWxYRGltZW5zaW9uPgogICAgICAgICA8ZXhpZjpQaXhlbFlEaW1lbnNpb24+NzA8L2V4aWY6UGl4ZWxZRGltZW5zaW9uPgogICAgICA8L3JkZjpEZXNjcmlwdGlvbj4KICAgPC9yZGY6UkRGPgo8L3g6eG1wbWV0YT4KEsNBsQAABQFJREFUeAHtnF1L21AYx5+qtWIdIk4UHAjqLtoNJning/khpvsSDjatF9tgG2wO2cU2mG6fZuJg7k6m4MvFVAxMqFoRbRVt1275Hz3paRKbGJOmbfJAyMlJzsv/l+ecnLZ5GvgnG/nGCNT4HPIEfBh5FlQnpA2TuVyOTk9PKZ0+k7cMZbN/CXnlYDU1NVRbW0f19UF5C1FDQwMh7yoWMDNnZDIZOj5Oydux3FA9NTU1KW3guBwsnU6zbmDPt3A4TOFwEwWDQVNdNIRxeHhIqVSSARAhmKrd5YtSqZTc95Tc9xvU3Nxs2JtLYcAbDg4OKBAgBqJcPMBQkc4FAHJ2lqaWlpaiXqILA3PC/v4+NTY2FgwJnXYqJgtATk5OqLW1lc0peh3XzDDwiGoDAeEY4ri50AaNeqaBgaFRTR4hiuZAoFHPCmBgsgyFCp8WeoUqOQ9AMA9Cq9oUGHAd/tRQX1RtxwACrerhosDAOgIXecH4WgmaRWMwsIrEgsorMAAAWqFZXEEzGFhiV/I6Qry7V0lDM7RzYzCwrvAiDHgHtHO7gJHxJAxAwAdObgwGPn161UTtDAYmES8OE2jWTKBe9Qq1buYZ6kyvHrsKY2lpiUaGH7JtcfGX6/fANRi7u7s0+faNAuDd5CQhz01zBQZEv371UqMbeW4CKTkMDiKRSGhgIM9NICWFUQwEJ+MmkJLBUIMINYQoEo1wBiyNPJhbQEoCQw/E82cvKBqJKjCQRp6bQByHcRmISDQPghNBnptAHIfxZWaauT0E465DrB6IYkBQRynMcRjJZJLpMAOCC1Z7yNHRET/l6P5Kv7Va6cnYeIx+zv+ggcH71NnZaboKAJmaek/zKDswaLrcdS50HAYADI88stRHlB2xWNZKg44PEyudcquMD0Mg78PwYQgEhKTvGT4MgYCQ9D3DSRiStEXYzJj4jbyYLlZWkiTT9RerR++crZ6xsrxME7EY29ZWV/XaK8jDqrSt7SbbkDYy1DkRG2f1oy27zdYV6OpaHgDSxT6QQUh7eztNz3xlmgJ4acLA1PXfuXvXoMTVTtsKgyy8eW0Ggq4kC23p1iNk2jpMllfyrrtqYpgI/TCVFOsU2zJV2MRFtsII1uVfPnViTIt1im2Z0GnqEvbq4/b2H+ro6DBVoNhFOztxejw6qlzS1dVFPb091N3do+RZSWxubtDGxgZJW5JS/PP0tDznXL/P8Xhc/mrhFqvX1jkDnevv76eFhQVW+fljUKLZb7OKCDsSaMMOEOq+2DpMUDm+zLnX16dux7Zj1I02nDBbhwnvIOJ51td/06ePH2hvL0EPhobkN/6tcc9mc/R9bo6tRZ48HaPe3tvyq4vGj2HeF6O9OEwcgWHUgXI6L8KwdrvKSY2NfWEwEKTC4zVsrLvsq4JmMUCHwUAEj1dN1M5gIJTJiwbPELVfwAixiB2vATmHcf5jN7QzGAhu8+qcAe3cGAxMIghuQ7SOVwxaoVkzgQJAWI7ywwVe8ZBzGIVRFMwzAAPhjojy84J3QCO0qkM8FRgAgnBHfGdSzUCgDZGMeqGdBTAABOGOiPKrRiDQBG3QqGcaGHAdhDtWGxAOAtrUw4OD0Y1rxUnEbyHKr9ID+PBAAAgMf0tBvpwU9n74t0hDTsNLxD8GwA8+/EcfvlcVKfmhuCSAJ+DY9j8GEFUhNsPzfxkhAqnmtOZpUs1ijbT5MARC/wHsSmc5L6sNwwAAAABJRU5ErkJggg==" alt="Share" width="32" height="32" style={{ flexShrink: 0 }} />
          <span>{t('tap_share')}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex-shrink-0 w-7 h-7 bg-purple-100 text-purple-700 rounded-full flex items-center justify-center font-bold">3</span>
          <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEMAAABECAYAAADaz4jLAAAMTGlDQ1BJQ0MgUHJvZmlsZQAASImVVwdYU1cbPndkQggQiICMsJcgIiOAjBBWANlbVEISIIwYE4KKGymtYN0ighOtgihYrYAUF2pdFMW9iwMVpRZrcSv/CQG09B/P/z3Pufe97/nOe77vu+eOAwC9iy+V5qKaAORJ8mUxwf6spOQUFukZQAABMAEZoHyBXMqJigoH0IbPf7fX16A3tMsOSq1/9v9X0xKK5AIAkCiI04VyQR7EPwGAtwqksnwAiFLIm8/KlyrxWoh1ZDBAiGuUOFOFW5U4XYUvDvrExXAhfgQAWZ3Pl2UCoNEHeVaBIBPq0GG2wEkiFEsg9oPYJy9vhhDiRRDbQB84J12pz07/Sifzb5rpI5p8fuYIVuUyaOQAsVyay5/zf5bjf1termJ4DmvY1LNkITHKnGHdHuXMCFNidYjfStIjIiHWBgDFxcJBfyVmZilC4lX+qI1AzoU1g/cZoJPkubG8IT5GyA8Ig9gQ4gxJbkT4kE9RhjhI6QPrh1aI83lxEOtBXCOSB8YO+RyTzYgZnvdahozLGeKf8mWDMSj1Pyty4jkqfUw7S8Qb0sccC7PiEiGmQhxQIE6IgFgD4gh5TmzYkE9qYRY3YthHpohR5mIBsUwkCfZX6WPlGbKgmCH/3Xny4dyxY1liXsQQvpSfFReiqhX2SMAfjB/mgvWJJJz4YR2RPCl8OBehKCBQlTtOFkniY1U8rifN949RjcXtpLlRQ/64vyg3WMmbQRwnL4gdHluQDxenSh8vkeZHxanixCuz+aFRqnjwfSAccEEAYAEFbOlgBsgG4o7epl54peoJAnwgA5lABByGmOERiYM9EniMBYXgd4hEQD4yzn+wVwQKIP9pFKvkxCOc6ugAMob6lCo54DHEeSAM5MJrxaCSZCSCBPAIMuJ/RMSHTQBzyIVN2f/v+WH2C8OBTPgQoxiekUUf9iQGEgOIIcQgoi1ugPvgXng4PPrB5oyzcY/hPL74Ex4TOgkPCFcJXYSb08VFslFRTgZdUD9oqD7pX9cHt4Karrg/7g3VoTLOxA2AA+4C5+HgvnBmV8hyh+JWVoU1SvtvGXx1h4b8KE4UlDKG4kexGT1Sw07DdURFWeuv66OKNX2k3tyRntHzc7+qvhCew0Z7Yt9hB7DT2HHsLNaKNQEWdhRrxtqxw0o8suIeDa644dliBuPJgTqj18yXO6uspNypzqnH6aOqL180O1/5MHJnSOfIxJlZ+SwO/GKIWDyJwHEcy9nJ2Q0A5fdH9Xp7FT34XUGY7V+4Jb8B4H10YGDg5y9c6FEAfnSHr4RDXzgbNvy0qAFw5pBAIStQcbjyQIBvDjp8+vSBMTAHNjAfZ+AGvIAfCAShIBLEgWQwDUafBde5DMwC88BiUALKwEqwDlSCLWA7qAF7wX7QBFrBcfALOA8ugqvgNlw93eA56AOvwQcEQUgIDWEg+ogJYonYI84IG/FBApFwJAZJRtKQTESCKJB5yBKkDFmNVCLbkFrkR+QQchw5i3QiN5H7SA/yJ/IexVB1VAc1Qq3Q8Sgb5aBhaBw6Fc1EZ6KFaDG6HK1Aq9E9aCN6HD2PXkW70OdoPwYwNYyJmWIOGBvjYpFYCpaBybAFWClWjlVj9VgLvM+XsS6sF3uHE3EGzsId4AoOweNxAT4TX4AvwyvxGrwRP4lfxu/jffhnAo1gSLAneBJ4hCRCJmEWoYRQTthJOEg4BZ+lbsJrIpHIJFoT3eGzmEzMJs4lLiNuIjYQjxE7iQ+J/SQSSZ9kT/ImRZL4pHxSCWkDaQ/pKOkSqZv0lqxGNiE7k4PIKWQJuYhcTt5NPkK+RH5C/kDRpFhSPCmRFCFlDmUFZQelhXKB0k35QNWiWlO9qXHUbOpiagW1nnqKeof6Sk1NzUzNQy1aTay2SK1CbZ/aGbX7au/UtdXt1LnqqeoK9eXqu9SPqd9Uf0Wj0axofrQUWj5tOa2WdoJ2j/ZWg6HhqMHTEGos1KjSaNS4pPGCTqFb0jn0afRCejn9AP0CvVeTommlydXkay7QrNI8pHlds1+LoTVBK1IrT2uZ1m6ts1pPtUnaVtqB2kLtYu3t2ie0HzIwhjmDyxAwljB2ME4xunWIOtY6PJ1snTKdvTodOn262rouugm6s3WrdA/rdjExphWTx8xlrmDuZ15jvh9jNIYzRjRm6Zj6MZfGvNEbq+enJ9Ir1WvQu6r3Xp+lH6ifo79Kv0n/rgFuYGcQbTDLYLPBKYPesTpjvcYKxpaO3T/2liFqaGcYYzjXcLthu2G/kbFRsJHUaIPRCaNeY6axn3G28VrjI8Y9JgwTHxOxyVqToybPWLosDiuXVcE6yeozNTQNMVWYbjPtMP1gZm0Wb1Zk1mB215xqzjbPMF9r3mbeZ2FiMdlinkWdxS1LiiXbMstyveVpyzdW1laJVt9aNVk9tdaz5lkXWtdZ37Gh2fjazLSptrliS7Rl2+bYbrK9aIfaudpl2VXZXbBH7d3sxfab7DvHEcZ5jJOMqx533UHdgeNQ4FDncN+R6RjuWOTY5PhivMX4lPGrxp8e/9nJ1SnXaYfT7QnaE0InFE1omfCns52zwLnK+cpE2sSgiQsnNk986WLvInLZ7HLDleE62fVb1zbXT27ubjK3ercedwv3NPeN7tfZOuwo9jL2GQ+Ch7/HQo9Wj3eebp75nvs9//By8Mrx2u31dJL1JNGkHZMeept58723eXf5sHzSfLb6dPma+vJ9q30f+Jn7Cf12+j3h2HKyOXs4L/yd/GX+B/3fcD2587nHArCA4IDSgI5A7cD4wMrAe0FmQZlBdUF9wa7Bc4OPhRBCwkJWhVznGfEEvFpeX6h76PzQk2HqYbFhlWEPwu3CZeEtk9HJoZPXTL4TYRkhiWiKBJG8yDWRd6Oso2ZG/RxNjI6Krop+HDMhZl7M6VhG7PTY3bGv4/zjVsTdjreJV8S3JdATUhNqE94kBiSuTuxKGp80P+l8skGyOLk5hZSSkLIzpX9K4JR1U7pTXVNLUq9NtZ46e+rZaQbTcqcdnk6fzp9+II2Qlpi2O+0jP5Jfze9P56VvTO8TcAXrBc+FfsK1wh6Rt2i16EmGd8bqjKeZ3plrMnuyfLPKs3rFXHGl+GV2SPaW7Dc5kTm7cgZyE3Mb8sh5aXmHJNqSHMnJGcYzZs/olNpLS6RdMz1nrpvZJwuT7ZQj8qny5nwd+KPfrrBRfKO4X+BTUFXwdlbCrAOztWZLZrfPsZuzdM6TwqDCH+bicwVz2+aZzls87/58zvxtC5AF6QvaFpovLF7YvSh4Uc1i6uKcxb8WORWtLvprSeKSlmKj4kXFD78J/qauRKNEVnL9W69vt3yHfyf+rmPpxKUbln4uFZaeK3MqKy/7uEyw7Nz3E76v+H5gecbyjhVuKzavJK6UrLy2yndVzWqt1YWrH66ZvKZxLWtt6dq/1k1fd7bcpXzLeup6xfquivCK5g0WG1Zu+FiZVXm1yr+qYaPhxqUb32wSbrq02W9z/RajLWVb3m8Vb72xLXhbY7VVdfl24vaC7Y93JOw4/QP7h9qdBjvLdn7aJdnVVRNTc7LWvbZ2t+HuFXVonaKuZ0/qnot7A/Y21zvUb2tgNpTtA/sU+579mPbjtf1h+9sOsA/U/2T508aDjIOljUjjnMa+pqymrubk5s5DoYfaWrxaDv7s+POuVtPWqsO6h1ccoR4pPjJwtPBo/zHpsd7jmccftk1vu30i6cSVk9EnO06FnTrzS9AvJ05zTh89432m9azn2UPn2Oeazrudb2x3bT/4q+uvBzvcOhovuF9ovuhxsaVzUueRS76Xjl8OuPzLFd6V81cjrnZei79243rq9a4bwhtPb+befHmr4NaH24vuEO6U3tW8W37P8F71b7a/NXS5dR2+H3C//UHsg9sPBQ+fP5I/+thd/Jj2uPyJyZPap85PW3uCei4+m/Ks+7n0+Yfekt+1ft/4wubFT3/4/dHel9TX/VL2cuDPZa/0X+36y+Wvtv6o/nuv815/eFP6Vv9tzTv2u9PvE98/+TDrI+ljxSfbTy2fwz7fGcgbGJDyZfzBXwEMKLc2GQD8uQsAWjIADLhvpE5R7Q8HDVHtaQcR+E9YtYccNPjnUg//6aN74d/NdQD27QDACurTUwGIogEQ5wHQiRNH2vBebnDfqTQi3BtsjfmUnpcO/o2p9qRfxT36DJSqLmD0+V8beoLekNfRdQAAAERlWElmTU0AKgAAAAgAAgESAAMAAAABAAEAAIdpAAQAAAABAAAAJgAAAAAAAqACAAQAAAABAAAAQ6ADAAQAAAABAAAARAAAAAAqOypaAAACAmlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iWE1QIENvcmUgNi4wLjAiPgogICA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPgogICAgICA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIgogICAgICAgICAgICB4bWxuczp0aWZmPSJodHRwOi8vbnMuYWRvYmUuY29tL3RpZmYvMS4wLyIKICAgICAgICAgICAgeG1sbnM6ZXhpZj0iaHR0cDovL25zLmFkb2JlLmNvbS9leGlmLzEuMC8iPgogICAgICAgICA8dGlmZjpPcmllbnRhdGlvbj4xPC90aWZmOk9yaWVudGF0aW9uPgogICAgICAgICA8ZXhpZjpQaXhlbFhEaW1lbnNpb24+Njc8L2V4aWY6UGl4ZWxYRGltZW5zaW9uPgogICAgICAgICA8ZXhpZjpQaXhlbFlEaW1lbnNpb24+Njg8L2V4aWY6UGl4ZWxZRGltZW5zaW9uPgogICAgICA8L3JkZjpEZXNjcmlwdGlvbj4KICAgPC9yZGY6UkRGPgo8L3g6eG1wbWV0YT4KVq+wAQAABT5JREFUeAHtnO9PE0kYx5+2lCKFI1xDAmINiSfkOO+lcq+OmugLXmmiaIw/7t2ZGF8azlcihrtc/DuMBrHnS16cifhS31pfgEpIaIUX/KoUhFbR/Q7OMLtdaKHTnbbbJ9l0dnZ3nvl+OjM729mnnq+GUdUYAW+VwzaBmu1k7tTm5iatr69TOr1hbBn68uUzIa8UzOv1ks9XQ7W1fmMLUF1dHSFvL+bJp5tkMhlaXU0Z26rhqJYaGhqED+yXgqXTaVYNfPItGAxSMNhAfr8/ryrmhJFMJimVWmEAZAh5la75pFQqZdQ9ZdS9kZqamnLWZkcYaA1LS0vk8RADUSotIKcimxMAZGMjTc3Nzbu2ElsYGBMWFhaovr7e1CVs/JRNFoCsra1RKBRiY4pdxbNGGLSISgMB4eji+HKhDRrtLAsGukYltQhZNAcCjXZmgoHBMhAw3y3sLirnPADBOAitVhMw0HT4XcN6UqXtAwi0WruLgIF5BE5yg/G5EjTLxmBgFokJlVtgAAC0QrM8g2YwMMUu53mE/O3uJQ3N0M6NwcC8wo0w0Dqgndt3GBlXwgAEPHByYzDw9OlWk7UzGBhE3NhNoFkeQPf0e0a+rWd6eppGRx9TV1cX+10h3+t2Ow8D3cTEBPX3X6COjo7dTt33MfaglkjEqbW1dd+F8AsTiQTdv/8vzX6Y5VlF+Ww72EYDA7epvb294PLn5uaMcg6xclg3KbhEo4DZ2Q80dHew6CBQV8BmvgyfKk1ZN3n69D9aXl421e1o51EKh8OmvP3uzMzM0NvJt+Jy+ILPGzduirxCE8pgjD8fF3W5MzhIx479KvZVJmKx13RvaIgVCZ8qYSjpJvKIjFp2d/+iUr+pLGvZKlc6lMAw1dbhnSqMIgEv+5ahkot2GFNTU4StFEwrjDexGN3+a4BtSOs2rTBib7YByGldULTCIPkFADmtiYZeGJpE7+RW2Qx0Jwdy/ovxcYpGn9CnT2ssO5n8KA5Ho1F69ux/tn/gQD2dO3eeeiMRcdyJhKMt4+HDB4SnRECQQXChPB/n4FynzVEYv/dG8npnwuP1EM512hztJpcvX6EzZ84aK+JbP8KOjDwi/oAXORmhixcvMf2BQEDLsoWjMKAUv0jz9ZnQjyHx5SONFXKd5mg30Sk0H99aYYQPHxZ1lNMi0+GE491E1tfT8xv9ef06y0Jat2mF4fP56NSp07oZCP9au4moRYkkqjCkL6IKQzUM65u48XhccqE2iSUD2ay+5WN7TSsbQI/8dITev3vP/P/z9zC1tLTQ8RMnlC4vvnr5kubn54VG+FRpymBcu/oHDQ/fM96T+kyLi4tsw9posczvryH4VGnKxoyfu7vp1q0B4w1cZXx31Akf8AWfKk3pwjMqtrLykcbGxujJ6Ch1dnbSofDWom6hlY7PxGlycpLO9/dTX18fNTb+UGiR7Hp54Vk5DCU1dLAQGYaybuJg/YvmisHA7YnHaxTNUwkWDM3yrZnBQASPW03WzmAglMmNhpYha/8OI8AidtwGZAtGQMhmMBDc5tYxA9q5MRgYRBDchmgdtxi0QnPWAAoAiPLDCW5pIVswzFEUrGUABsIdEeXnhtYBjdBqDfEUMAAE4Y5Y/61kINCGSEa70E4TDABBuCOi/CoRCDRBGzTaWRYMNB0s5lQaEA4C2qzdg4OxjWvFQcRvIcqv3AP4cEMACHT/fQX5clL4rIZ/yzSMNFqJ/McACE3gIRn803KJ47vylAAtAfuYRyj9YwBZFd4Edv1fRshAKjmddTepZLG5tH0DzWE7Ou0iYEEAAAAASUVORK5CYII=" alt="Add to Home Screen" width="32" height="32" style={{ flexShrink: 0 }} />
          <span>{t('tap_add_home_screen')}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex-shrink-0 w-7 h-7 bg-purple-100 text-purple-700 rounded-full flex items-center justify-center font-bold">4</span>
          <img src="data:image/png;base64,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" alt="Add" width="32" height="32" style={{ flexShrink: 0 }} />
          <span>{t('tap_add_done')}</span>
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
              {t('not_now_back_login')}
            </button>
          )}
          <button
            onClick={handleExit}
            className="flex-1 bg-gray-200 text-gray-700 py-2.5 rounded-lg hover:bg-gray-300 font-semibold transition-colors"
          >
            {t('exit')}
          </button>
        </div>
      </div>
    </div>
  </div>
) : appSettings.requireEmployeeLogin && !isEmployeeLoggedIn ? (
  <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 px-4 pt-16 pb-8">
  <div className="max-w-md mx-auto mb-1">
    <a
      href="https://www.whatidid.app"
      className="block text-right text-sm text-gray-500 hover:text-purple-600 font-medium transition-colors"
    >
      {t('portal_link')}
    </a>
  </div>
  <div className="text-center mb-6">
    <h1 className="text-3xl font-bold text-gray-800 flex items-center justify-center gap-2">
      <Share2 className="text-purple-600" size={28} />
      WhatIDid{' '}
      <span className="text-xl font-normal italic text-gray-600">
        {{corp: 'Corp', pro: 'Pro', edu: 'Edu'}[companyEdition] || 'Corp'}
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
            {t('back')}
          </button>
        )}
        <p className="text-gray-600 text-center mb-6">{t('employee_login')}</p>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('employee_id')}
              </label>
              <input
                type="text"
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleEmployeeLogin()}
                className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
placeholder={t('enter_your_employee_id')}
autoComplete="off"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('password')}
              </label>
              <input
                type="password"
                value={employeePassword}
                onChange={(e) => setEmployeePassword(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleEmployeeLogin()}
                className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
                placeholder={t('enter_your_password')}
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
              {t('login')}
            </button>

            <div className="flex justify-center mt-3">
              <button
                onClick={() => { resetAccountAccessFlow(); setShowAccountAccess(true); }}
                className="text-sm text-purple-600 hover:text-purple-800 font-medium"
              >
                {t('first_access_reset')}
              </button>
            </div>
          </div>
        </div>

        {/* Account Access Modal — unifica "1st Access" e "Forgot Password" */}
        {showAccountAccess && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-800">
                  {accountAccessStep === 'done' ? t('password_set') : t('first_access_reset')}
                </h3>
                <button onClick={resetAccountAccessFlow} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">×</button>
              </div>

              {/* Passo 1: e-mail + Employee ID */}
              {accountAccessStep === 'lookup' && (
                <div className="space-y-4">
                  <p className="text-sm text-gray-600">{t('enter_email_employee_id_code')}</p>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('email')}</label>
                    <input type="email" value={accountAccessEmail} onChange={(e) => { setAccountAccessEmail(e.target.value); setAccountAccessJustBlocked(false); }}
                      className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
                      placeholder={t('enter_your_email')} autoComplete="off" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('employee_id')}</label>
                    <input type="text" value={accountAccessEmployeeId} onChange={(e) => { setAccountAccessEmployeeId(e.target.value); setAccountAccessJustBlocked(false); }}
                      onKeyPress={(e) => e.key === 'Enter' && !accountAccessJustBlocked && handleAccountAccessLookup()}
                      className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
                      placeholder={t('enter_your_employee_id')} autoComplete="off" />
                  </div>
                  {accountAccessError && (
                    <div className="bg-red-50 border-2 border-red-200 rounded-lg p-3">
                      <p className="text-red-700 text-sm whitespace-pre-line">{accountAccessError}</p>
                    </div>
                  )}
                  {!accountAccessJustBlocked && (
                  <button onClick={handleAccountAccessLookup}
                    className="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 font-semibold transition-colors">
                    {t('send_verification_code')}
                  </button>
                  )}
                </div>
              )}

              {/* Passo 1b: escolher qual empresa, se houver mais de um match */}
              {accountAccessStep === 'choose-match' && (
                <div className="space-y-3">
                  <p className="text-sm text-gray-600">{t('found_more_than_one_account')}</p>
                  {accountAccessMatches.map((m) => (
                    <label key={m.id} className="flex items-center gap-3 p-3 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-purple-400">
                      <input type="checkbox" checked={false} readOnly onClick={() => handleChooseAccountAccessMatch(m)} className="w-4 h-4" />
                      <div>
                        <p className="text-sm font-medium text-gray-800">{m.is_seller ? t('whatidid_sellers') : (m.companies?.name || t('company_fallback'))}</p>
                      </div>
                    </label>
                  ))}
                  {accountAccessError && (
                    <div className="bg-red-50 border-2 border-red-200 rounded-lg p-3">
                      <p className="text-red-700 text-sm whitespace-pre-line">{accountAccessError}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Passo 1c: confirmação explícita da empresa (mesmo com um único resultado) */}
              {accountAccessStep === 'confirm-company' && (
                <div className="space-y-4">
                  <p className="text-sm text-gray-600">{t('we_found_you_at')}</p>
                  <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-4 text-center">
                    <p className="text-lg font-semibold text-purple-800">{accountAccessRecord?.is_seller ? t('whatidid_sellers') : (accountAccessRecord?.companies?.name || t('unknown_company'))}</p>
                  </div>
                  <p className="text-sm text-gray-600">{t('is_this_your_company')}</p>
                  {accountAccessError && (
                    <div className="bg-red-50 border-2 border-red-200 rounded-lg p-3">
                      <p className="text-red-700 text-sm whitespace-pre-line">{accountAccessError}</p>
                    </div>
                  )}
                  <div className="flex gap-3">
                    <button onClick={async () => {
                        let adminEmailsText = '.';
                        try {
                          const { data: admins } = await supabase
                            .from('employees')
                            .select('email')
                            .eq('company_id', accountAccessRecord.company_id)
                            .eq('is_admin', true)
                            .not('email', 'is', null);
                          const emails = (admins || []).map(a => a.email).filter(Boolean);
                          if (emails.length > 0) {
                            adminEmailsText = ` at:\n${emails.join('\n')}`;
                          }
                        } catch (err) {
                          console.error('Error fetching company admins:', err);
                        }
                        try {
                          await supabase.from('employees').update({ status: 'blocked' }).eq('id', accountAccessRecord.id);
                        } catch (err) {
                          console.error('Error blocking account:', err);
                        }
                        setAccountAccessStep('lookup');
                        setAccountAccessRecord(null);
                        setAccountAccessJustBlocked(true);
                        setAccountAccessError(`${t('no_problem_blocked')}${adminEmailsText}`);
                      }}
                      className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 font-semibold transition-colors">
                      {t('not_me')}
                    </button>
                    <button onClick={handleConfirmCompany}
                      className="flex-1 bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 font-semibold transition-colors">
                      {t('yes_thats_me')}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 text-center">{t('contact_hr_if_wrong')}</p>
                </div>
              )}

              {/* Passo 2: confirmar código de verificação */}
              {accountAccessStep === 'verify' && (
                <div className="space-y-4">
                  <p className="text-sm text-gray-600">
                    {accountAccessRecord?.companies?.name && (
                      <>{t('youre_accessing')} <strong>{accountAccessRecord.is_seller ? t('whatidid_sellers') : accountAccessRecord.companies.name}</strong>.<br /></>
                    )}
                    {t('sent_code_to_email')}
                    <br /><span className="text-xs text-gray-500">{t('check_spam_folder')}</span>
                  </p>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('verification_code')}</label>
                    <input type="text" value={accountAccessCodeInput} onChange={(e) => setAccountAccessCodeInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleVerifyAccountAccessCode()}
                      className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
                      placeholder={t('six_digit_code')} maxLength={6} autoComplete="off" />
                  </div>
                  {accountAccessError && (
                    <div className="bg-red-50 border-2 border-red-200 rounded-lg p-3">
                      <p className="text-red-700 text-sm whitespace-pre-line">{accountAccessError}</p>
                    </div>
                  )}
                  <button onClick={handleVerifyAccountAccessCode}
                    className="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 font-semibold transition-colors">
                    {t('verify_code')}
                  </button>
                </div>
              )}

              {/* Passo 3: criar a senha */}
              {accountAccessStep === 'set-password' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('new_password')}</label>
                    <input type="password" value={accountAccessPassword} onChange={(e) => setAccountAccessPassword(e.target.value)}
                      className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
                      placeholder={t('choose_a_password')} />
                  </div>
                  <div className="space-y-1">
                    {PASSWORD_RULES.map((rule, i) => {
                      const passed = rule.test(accountAccessPassword);
                      const ruleKeys = {
                        'At least 8 characters': 'password_rule_8_chars',
                        'At least one uppercase letter (A-Z)': 'password_rule_uppercase',
                        'At least one lowercase letter (a-z)': 'password_rule_lowercase',
                        'At least one number (0-9)': 'password_rule_number',
                      };
                      return (
                        <div key={i} className={`text-xs flex items-center gap-1.5 ${passed ? 'text-green-600' : 'text-gray-400'}`}>
                          <span>{passed ? '✓' : '○'}</span>
                          <span>{t(ruleKeys[rule.label] || rule.label)}</span>
                        </div>
                      );
                    })}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('confirm_password')}</label>
                    <input type="password" value={accountAccessConfirmPassword} onChange={(e) => setAccountAccessConfirmPassword(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSetAccountAccessPassword()}
                      className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
                      placeholder={t('repeat_your_password')} />
                  </div>
                  {accountAccessError && (
                    <div className="bg-red-50 border-2 border-red-200 rounded-lg p-3">
                      <p className="text-red-700 text-sm whitespace-pre-line">{accountAccessError}</p>
                    </div>
                  )}
                  <button onClick={handleSetAccountAccessPassword}
                    className="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 font-semibold transition-colors">
                    {t('save_password')}
                  </button>
                </div>
              )}

              {/* Passo 4: sucesso */}
              {accountAccessStep === 'done' && (
                <div className="text-center py-4">
                  <div className="text-4xl mb-3">✅</div>
                  <h4 className="text-lg font-bold text-gray-800 mb-2">{t('password_set')}</h4>
                  <p className="text-gray-600 text-sm mb-4">{t('can_now_login')}</p>
                  <button
                    onClick={resetAccountAccessFlow}
                    className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 font-semibold"
                  >
                    {t('go_to_login')}
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
          <a
            href="https://www.whatidid.app"
            className="sm:hidden block text-right text-sm text-gray-500 hover:text-purple-600 font-medium transition-colors mb-2"
          >
            {t('portal_link')}
          </a>
          <div className="flex items-center justify-between mb-4">
  <div className="flex-1"></div>
  <div className="flex flex-col items-center">
    <h1 className="text-4xl font-bold text-gray-800 mb-2 flex items-center justify-center gap-3">
      <Share2 className="text-purple-600" size={36} />
      WhatIDid{' '}
      <span className="text-2xl font-normal italic text-gray-600">
        {{corp: 'Corp', pro: 'Pro', edu: 'Edu'}[companyEdition] || 'Corp'}
      </span>
    </h1>
    {displayedCompanyName && !isSellerBaseView && (
  <div className={`flex items-center justify-center gap-3 mt-1 ${
    displayedCompanyNameSize === 'small' ? 'text-xs' :
    displayedCompanyNameSize === 'large' ? 'text-xl' : 'text-base'
  }`}>
    <div className="h-px w-8 bg-gray-600 opacity-80"></div>
    <p className="font-semibold text-gray-500 tracking-wide">{displayedCompanyName}</p>
    <div className="h-px w-8 bg-gray-600 opacity-80"></div>
  </div>
)}
  </div>
  <div className="flex-1 flex flex-col items-end gap-3">
    <a
      href="https://www.whatidid.app"
      className="hidden sm:inline text-sm text-gray-500 hover:text-purple-600 font-medium transition-colors"
    >
      {t('portal_link')}
    </a>
    {displayedCompanyLogoUrl && !isSellerBaseView && (
  <img src={displayedCompanyLogoUrl} alt="Company logo"
    className={`hidden sm:block object-contain ${
      displayedCompanyLogoSize === 'small' ? 'h-8 max-w-[100px]' :
      displayedCompanyLogoSize === 'large' ? 'h-20 max-w-[280px]' : 'h-14 max-w-[220px]'
    }`} />
)}
  </div>
</div>
{displayedCompanyLogoUrl && !isSellerBaseView && (
  <div className="flex justify-center sm:hidden mb-3">
<img src={displayedCompanyLogoUrl} alt="Company logo" className={`object-contain ${
      displayedCompanyLogoSize === 'small' ? 'h-10 max-w-[120px]' :
      displayedCompanyLogoSize === 'large' ? 'h-20 max-w-[220px]' : 'h-14 max-w-[160px]'
    }`} />
  </div>
)}          
          {selectedSubtitle ? (
            <>
              <p className="text-gray-700 font-medium mb-1 text-sm sm:text-base">{selectedSubtitle.line1}</p>
              {selectedSubtitle.line2 && (
                <p className="text-gray-600 text-sm sm:text-base">{selectedSubtitle.line2}</p>
              )}
            </>
          ) : (
            <>
              <p className="text-gray-700 font-medium mb-1 text-sm sm:text-base">{t('hero_tagline_public')}</p>
              <p className="text-gray-600 text-sm sm:text-base">
                {companyEdition === 'pro' ? t('subtitle_line2_pro')
                  : companyEdition === 'edu' ? t('subtitle_line2_edu')
                  : (
                    <>
                      <span className="block sm:inline">{t('share_work_experiences')}</span>
                      <span className="hidden sm:inline"> </span>
                      <span className="block sm:inline">{t('accelerate_org_learning')}</span>
                    </>
                  )}
              </p>
            </>
          )}

{!isSellerBaseView && (
<>
{/* Video Carousel Section - Esteira Rolante */}
<div className="my-5">
  <div className="flex items-center justify-center gap-2 max-w-4xl mx-auto">
    
    {/* Coluna Esquerda: 24px fixo */}
    <div className="w-6 flex items-center justify-end">
      {carouselStartIndex > 0 && (
        <button
          onClick={() => setCarouselStartIndex(Math.max(0, carouselStartIndex - 1))}
          className="text-black hover:text-gray-600 transition-colors cursor-pointer"
          aria-label={t('previous_videos')}
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
          aria-label={t('next_videos')}
        >
          <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      )}
    </div>
    
  </div>
</div>
    </>
    )}

{/* Employee Info - Centralizado */}
<div className="flex items-center justify-center gap-3 mt-4 mb-2 flex-wrap">
  {isEmployeeLoggedIn && (
    <>
      <span className="text-sm text-gray-700 font-medium">👤 {employeeId}</span>
      <button
        onClick={handleEmployeeLogout}
        className="text-sm bg-gray-200 text-gray-700 px-3 py-1 rounded hover:bg-gray-300 transition-colors"
      >
        {t("logout")}
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
      {isDesktopDevice ? t('add_to_desktop') : t('add_to_phone')}
    </button>
  )}
</div>
          
{isDemoModeActive && !(isSeller && isAdmin) && !(isDefaultAdmin && isAdmin) && (
  <>
    {/* Desktop — layout original, sem nenhuma alteração */}
    <div className="hidden md:flex mt-4 max-w-3xl mx-auto bg-purple-50 border-2 border-purple-300 rounded-2xl p-3 items-center justify-evenly gap-2 flex-wrap">
      <select
        value={viewingLanguage}
        onChange={(e) => setViewingLanguage(e.target.value)}
        className="p-1.5 border-2 border-purple-300 rounded-lg text-xs font-medium bg-white flex-shrink-0"
        title="Language"
      >
        <option value="en">English</option>
        <option value="es">Español</option>
        <option value="pt">Português</option>
        <option value="zh">中文 (Chinese)</option>
      </select>
      <select
        value={viewingEdition}
        onChange={(e) => setViewingEdition(e.target.value)}
        className="p-1.5 border-2 border-purple-300 rounded-lg text-xs font-medium bg-white flex-shrink-0"
        title={t('edition_label')}
      >
        <option value="corp">Corp</option>
        <option value="pro">Pro</option>
        <option value="edu">Edu</option>
      </select>
      <p className="text-purple-800 text-sm font-medium text-center flex-1 min-w-[180px]">
        {t('demo_mode_leave')}
      </p>
      {currentDemoSessionId && (
        <button
          onClick={() => { if (window.confirm(t('confirm_delete_demo_session'))) deleteDemoSession(currentDemoSessionId); }}
          className="flex-shrink-0 px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-medium whitespace-nowrap"
        >
          {t('delete_now')}
        </button>
      )}
    </div>

    {/* Mobile — language sempre no topo centralizado; "Demo Mode..." centralizado
        na linha seguinte, dividindo espaço com o botão Delete Now (centralizado
        na altura do bloco) quando ele existir. */}
    <div className="flex md:hidden flex-col items-center gap-2 mt-4 max-w-3xl mx-auto bg-purple-50 border-2 border-purple-300 rounded-2xl p-3">
      <div className="flex items-center gap-2">
        <select
          value={viewingLanguage}
          onChange={(e) => setViewingLanguage(e.target.value)}
          className="p-1.5 border-2 border-purple-300 rounded-lg text-xs font-medium bg-white flex-shrink-0"
          title="Language"
        >
          <option value="en">English</option>
          <option value="es">Español</option>
          <option value="pt">Português</option>
          <option value="zh">中文 (Chinese)</option>
        </select>
        <select
          value={viewingEdition}
          onChange={(e) => setViewingEdition(e.target.value)}
          className="p-1.5 border-2 border-purple-300 rounded-lg text-xs font-medium bg-white flex-shrink-0"
          title={t('edition_label')}
        >
          <option value="corp">Corp</option>
          <option value="pro">Pro</option>
          <option value="edu">Edu</option>
        </select>
      </div>
      <div className="flex items-center w-full gap-2">
        <p className={`text-purple-800 text-sm font-medium ${currentDemoSessionId ? 'flex-1 text-center' : 'w-full text-center'}`}>
          {t('demo_mode_leave')}
        </p>
        {currentDemoSessionId && (
          <button
            onClick={() => { if (window.confirm(t('confirm_delete_demo_session'))) deleteDemoSession(currentDemoSessionId); }}
            className="flex-shrink-0 px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-medium whitespace-nowrap"
          >
            {t('delete_now')}
          </button>
        )}
      </div>
    </div>
  </>
)}

{isEmployeeLoggedIn && loggedInIsDemoId && (() => {
  const totalDays = (loggedInDemoCreatedAt && loggedInDemoExpiresAt)
    ? Math.round((new Date(loggedInDemoExpiresAt) - new Date(loggedInDemoCreatedAt)) / (1000 * 60 * 60 * 24))
    : null;
  const daysLeft = loggedInDemoExpiresAt
    ? Math.max(0, Math.ceil((new Date(loggedInDemoExpiresAt) - new Date()) / (1000 * 60 * 60 * 24)))
    : null;
  const createdText = (
    <>
      {loggedInDemoCreatedAt && `(${t('created')} ${new Date(loggedInDemoCreatedAt).toLocaleDateString()})`}
      {loggedInDemoExpiresAt && ` (${t('exp')} ${new Date(loggedInDemoExpiresAt).toLocaleDateString()})`}
      {daysLeft !== null && totalDays !== null && ` (${daysLeft}/${totalDays} ${t('days_left')})`}
    </>
  );
  const hasDeleteButton = experiences.some(e => e.employeeId === employeeId || (e.comments || []).some(c => c.employeeId === employeeId));
  const deleteButton = (
    <button
      onClick={async () => {
        if (!window.confirm(t('confirm_delete_demo_so_far'))) return;
        try {
          await supabase.from('comments').delete().eq('employee_id', employeeId);
          const { data: exps } = await supabase.from('experiences').select('id, cv_url').eq('employee_id', employeeId);
          for (const exp of exps || []) {
            if (exp.cv_url) await deleteFileFromStorage(exp.cv_url);
          }
          await supabase.from('experiences').delete().eq('employee_id', employeeId);
          await loadExperiences(true);
          alert(t('everything_deleted'));
        } catch (error) {
          alert(t('error_deleting') + ' ' + error.message);
        }
      }}
      className="flex-shrink-0 px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-medium whitespace-nowrap"
    >
      {t('delete_now')}
    </button>
  );
  const languageSelect = (
    <select
      value={loggedInEmployeeLanguage || 'en'}
      onChange={(e) => {
        setLoggedInEmployeeLanguage(e.target.value);
        localStorage.setItem('loggedInEmployeeLanguage', e.target.value);
      }}
      className="p-1.5 border-2 border-purple-300 rounded-lg text-xs font-medium bg-white flex-shrink-0"
      title={t('labels_language')}
    >
      <option value="en">English</option>
      <option value="es">Español</option>
      <option value="pt">Português</option>
      <option value="zh">中文 (Chinese)</option>
    </select>
  );
  return (
    <>
      {/* Desktop — layout original, sem nenhuma alteração */}
      <div className="hidden md:flex mt-4 max-w-2xl mx-auto bg-purple-50 border-2 border-purple-300 rounded-2xl p-3 items-center justify-between gap-2 flex-wrap">
        <div className="flex-1 min-w-0">
          <p className="text-purple-800 text-sm font-medium">
            {t('demo_mode_expires')}
          </p>
          {(loggedInDemoCreatedAt || loggedInDemoExpiresAt) && (
            <p className="text-purple-600 text-xs mt-1">
              {createdText}
            </p>
          )}
        </div>
        {languageSelect}
        {hasDeleteButton && deleteButton}
      </div>

      {/* Mobile — language sempre no topo centralizado; "Demo Mode..." centralizado
          sozinho na linha seguinte; "(Created...)" na última linha, dividindo
          espaço com o botão Delete Now (centralizado na altura do bloco) quando
          ele existir. */}
      <div className="flex md:hidden flex-col items-center gap-2 mt-4 max-w-2xl mx-auto bg-purple-50 border-2 border-purple-300 rounded-2xl p-3">
        {languageSelect}
        <p className="text-purple-800 text-sm font-medium text-center">
          {t('demo_mode_expires')}
        </p>
        {(loggedInDemoCreatedAt || loggedInDemoExpiresAt) && (
          <div className="flex items-center w-full gap-2">
            <p className={`text-purple-600 text-xs ${hasDeleteButton ? 'flex-1 text-center' : 'w-full text-center'}`}>
              {createdText}
            </p>
            {hasDeleteButton && deleteButton}
          </div>
        )}
      </div>
    </>
  );
})()}



{isAdmin && (
  <div className="max-w-4xl mx-auto mt-6 mb-1 px-1">
    <div id="admin-nav-tabs-anchor" className="flex relative">
      <button
        onClick={() => {
          setActiveAdminNavTab('settings');
          const el = document.getElementById('admin-nav-tabs-anchor');
          if (el) { const y = el.getBoundingClientRect().top + window.pageYOffset - 12; window.scrollTo({ top: y, behavior: 'smooth' }); }
        }}
        className={`flex-1 px-4 py-2 font-bold text-sm md:text-base transition-all rounded-t-2xl border-2 border-b-0 relative ${
          activeAdminNavTab === 'settings'
            ? 'bg-white text-gray-700 border-gray-300 relative z-10'
            : 'bg-gray-100 text-gray-400 border-gray-200 hover:bg-gray-200'
        }`}
      >
        {t('admin_settings_title')}
      </button>
      <button
        onClick={() => {
          setActiveAdminNavTab('preview');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        className={`flex-1 px-4 py-2 font-bold text-sm md:text-base transition-all rounded-t-2xl border-2 border-b-0 -ml-px relative ${
          activeAdminNavTab === 'preview'
            ? 'bg-white text-indigo-700 border-indigo-300 relative z-10'
            : 'bg-gray-100 text-gray-400 border-gray-200 hover:bg-gray-200'
        }`}
      >
        {t('live_preview_title')}
      </button>
      <div
        className={`absolute bottom-0 h-0.5 ${activeAdminNavTab === 'settings' ? 'bg-gray-300 right-0 left-1/2' : 'bg-indigo-300 left-0 right-1/2'}`}
      ></div>
    </div>
  </div>
)}
{isAdmin && (
  <div id="admin-settings-anchor"></div>
)}
{isAdmin && isDefaultAdmin && activeAdminNavTab === 'settings' && (
  <div className={`mt-4 rounded-lg shadow-md p-4 max-w-4xl mx-auto border-2 ${adminCompanyContext ? 'bg-amber-50 border-amber-400' : 'bg-gray-50 border-gray-300'}`}>
    <div className="flex items-center gap-3 flex-wrap">
      {!adminCompanyContext && (
        <>
          <label className="text-sm font-medium text-gray-700">{t('language')}</label>
          <select
            value={viewingLanguage}
            onChange={(e) => setViewingLanguage(e.target.value)}
            className="p-2 border-2 border-gray-300 rounded-lg text-sm font-medium"
          >
            <option value="en">English</option>
            <option value="es">Español</option>
            <option value="pt">Português</option>
            <option value="zh">中文 (Chinese)</option>
          </select>
          <label className="text-sm font-medium text-gray-700 ml-2">{t('edition_label')}</label>
          <select
            value={viewingEdition}
            onChange={(e) => setViewingEdition(e.target.value)}
            className="p-2 border-2 border-gray-300 rounded-lg text-sm font-medium"
          >
            <option value="corp">Corp</option>
            <option value="pro">Pro</option>
            <option value="edu">Edu</option>
          </select>
        </>
      )}
      <label className="text-sm font-medium text-gray-700 ml-2">{t('viewing')}</label>
      <select
        value={adminCompanyContext ? 'company' : 'default'}
        onChange={(e) => setAdminCompanyContext(e.target.value === 'company' ? (selectedCompanyForContext || companies.filter(c => c.code !== 'default').slice(-1)[0]?.id || null) : null)}
        className="p-2 border-2 border-gray-300 rounded-lg text-sm font-medium"
      >
        <option value="default">{t('default_word')}</option>
        <option value="company">{t('company_word')}</option>
      </select>
      {!adminCompanyContext && currentDemoSessionId && (
        <button
          onClick={() => { if (window.confirm(t('confirm_delete_demo_session'))) deleteDemoSession(currentDemoSessionId); }}
          className="px-2 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-medium whitespace-nowrap"
        >
          {t('delete_now')}
        </button>
      )}
      {adminCompanyContext && (
        <span className="text-sm font-semibold text-amber-700 flex items-center gap-1">
          ⚠️ You are viewing/editing the data fields <strong>{effectiveCompanyName}</strong> has authorized.
        </span>
      )}
      <button
        onClick={exitAdminMode}
        className="ml-auto px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
      >
        {t('logout_adm')}
      </button>
    </div>
  </div>
)}

{isAdmin && isSeller && activeAdminNavTab === 'settings' && (
  <div className={`mt-4 rounded-lg shadow-md p-4 max-w-4xl mx-auto border-2 ${isSellerManagingOwnCompany ? 'bg-amber-50 border-amber-400' : companyViewMode === 'sample' ? 'bg-blue-50 border-blue-400' : 'bg-gray-50 border-gray-300'}`}>
    <div className="flex items-center gap-3 flex-wrap">
      <label className="text-sm font-medium text-gray-700">{t('language')}</label>
      <select
        value={viewingLanguage}
        onChange={(e) => setViewingLanguage(e.target.value)}
        className="p-2 border-2 border-gray-300 rounded-lg text-sm font-medium"
      >
        <option value="en">English</option>
        <option value="es">Español</option>
        <option value="pt">Português</option>
        <option value="zh">中文 (Chinese)</option>
      </select>
      {!adminCompanyContext && (
        <>
          <label className="text-sm font-medium text-gray-700 ml-2">{t('edition_label')}</label>
          <select
            value={viewingEdition}
            onChange={(e) => setViewingEdition(e.target.value)}
            className="p-2 border-2 border-gray-300 rounded-lg text-sm font-medium"
          >
            <option value="corp">Corp</option>
            <option value="pro">Pro</option>
            <option value="edu">Edu</option>
          </select>
        </>
      )}
      <label className="text-sm font-medium text-gray-700 ml-2">{t('viewing')}</label>
      <select
        value={adminCompanyContext ? 'company' : (companyViewMode === 'sample' ? 'sample' : 'seller')}
        onChange={(e) => {
          const val = e.target.value;
          if (val === 'company') {
            setAdminCompanyContext(selectedCompanyForContext || companies.filter(c => c.created_by_seller_id === loggedInSellerId).slice(-1)[0]?.id || null);
            setCompanyViewMode('own');
          } else if (val === 'sample') {
            setAdminCompanyContext(null);
            setCompanyViewMode('sample');
          } else {
            setAdminCompanyContext(null);
            setCompanyViewMode('own');
          }
        }}
        className="p-2 border-2 border-gray-300 rounded-lg text-sm font-medium"
      >
        <option value="seller">{t('my_seller_view')}</option>
        <option value="company">{t('company_word')}</option>
        <option value="sample">Sample (Default's ADM content)</option>
      </select>
      {isSellerManagingOwnCompany && (
        <span className="text-sm font-semibold text-amber-700 flex items-center gap-1">
          ⚠️ You are viewing/editing the data fields <strong>{effectiveCompanyName}</strong> has authorized.
        </span>
      )}
      {!isSellerManagingOwnCompany && companyViewMode === 'sample' && (
        <span className="text-sm font-semibold text-blue-700 flex items-center gap-1">
          👁️ Read-only preview of ADM Default's content.
        </span>
      )}
      <button
        onClick={exitAdminMode}
        className="ml-auto px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
      >
        {t('logout_adm')}
      </button>
    </div>
  </div>
)}

{isAdmin && !isDefaultAdmin && !isSeller && activeAdminNavTab === 'settings' && (
  <div className={`mt-4 rounded-lg shadow-md p-4 max-w-4xl mx-auto border-2 ${companyViewMode === 'sample' ? 'bg-blue-50 border-blue-400' : 'bg-gray-50 border-gray-300'}`}>
    <div className="flex items-center gap-3 flex-wrap">
      <label className="text-sm font-medium text-gray-700">{t("labels_language")}</label>
      <select
        value={viewingLanguage}
        onChange={(e) => setViewingLanguage(e.target.value)}
        className="p-2 border-2 border-gray-300 rounded-lg text-sm font-medium"
      >
        <option value="en">English</option>
        <option value="es">Español</option>
        <option value="pt">Português</option>
        <option value="zh">中文 (Chinese)</option>
      </select>
      <label className="text-sm font-medium text-gray-700 ml-2">{t('viewing')}</label>
      <select
        value={companyViewMode}
        onChange={(e) => setCompanyViewMode(e.target.value)}
        className="p-2 border-2 border-gray-300 rounded-lg text-sm font-medium"
      >
        <option value="own">{t('my_company')}</option>
        <option value="sample">Sample (Default's ADM content)</option>
      </select>
      {companyViewMode === 'sample' && (
        <span className="text-sm font-semibold text-blue-700 flex items-center gap-1">
          👁️ Read-only preview — browse Default's content to decide what to import.
        </span>
      )}
      <button
        onClick={exitAdminMode}
        className="ml-auto px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
      >
        {t('logout_adm')}
      </button>
    </div>
  </div>
)}

{isAdmin && !isDefaultAdmin && !isSeller && companyViewMode === 'own' && activeAdminNavTab === 'settings' && (
  <div className="mt-4 bg-white border-2 border-gray-300 rounded-lg shadow-md p-4 max-w-4xl mx-auto">
    <h3 className="font-semibold text-gray-800 mb-1">{t('section_settings')}</h3>
    <p className="text-xs text-gray-500 mb-3">"View & Edit access for ADM Master" lets the Master see/edit that section for support. Check a row and click "Import/Update" to bring starter content from Default (synthetic examples, not real people) — running it again only brings new items, it never duplicates or overwrites what you already have. To remove something, delete it directly in its own section (Manage Employees, Manage Categories, etc.) — deleting a Category also removes its linked Experiences, Key Insights and comments.</p>
    <div className="flex items-center gap-2 mb-3">
      <label className="text-sm font-medium text-gray-700">{t('import_content_in')}</label>
      <select value={importLanguage} onChange={(e) => setImportLanguage(e.target.value)}
        className="p-1.5 border-2 border-gray-300 rounded-lg text-sm">
        <option value="en">English</option>
        <option value="es">Español</option>
        <option value="pt">Português</option>
        <option value="zh">中文 (Chinese)</option>
      </select>
    </div>
    <table className="w-full text-sm border-collapse">
      <thead>
        <tr className="text-left text-gray-600 border-b">
          <th className="py-1 align-bottom">{t('section_header')}</th>
          <th className="py-1 text-center align-bottom">{t('view_edit_access')}<br/>{t('for_adm_master')}</th>
          <th className="py-2 text-center">
            <button onClick={runImportForSelected} disabled={importingBundle || importingQuotes}
              className="px-3 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 disabled:opacity-50 w-40">
              {(importingBundle || importingQuotes) ? t('importing_ellipsis') : t('import_update')}
            </button>
            <p className="text-xs text-gray-500 mt-1">in {importLanguage === 'en' ? 'English' : importLanguage === 'es' ? 'Español' : importLanguage === 'pt' ? 'Português' : '中文'}</p>
          </th>
        </tr>
      </thead>
      <tbody>
        <tr className="border-b bg-gray-50 font-medium">
          <td className="py-2 text-gray-600">ALL</td>
          <td className="py-2 text-center">
            <input type="checkbox"
              checked={ALL_VISIBILITY_SECTION_KEYS.every(k => companyMasterVisibility.includes(k))}
              onChange={(e) => toggleAllMasterVisibility(e.target.checked)}
              className="w-4 h-4" />
          </td>
          <td className="py-2 text-center">
            <input type="checkbox"
              checked={ALL_IMPORT_SECTION_KEYS.every(k => selectedForImport.includes(k))}
              onChange={(e) => setSelectedForImport(e.target.checked ? ALL_IMPORT_SECTION_KEYS : [])}
              className="w-4 h-4" />
          </td>
        </tr>

        <tr className="border-b">
          <td className="py-2">{t('app_configuration')}</td>
          <td className="py-2 text-center">
            <input type="checkbox" checked={companyMasterVisibility.includes('app_config')}
              onChange={(e) => toggleMasterVisibility('app_config', e.target.checked)} className="w-4 h-4" />
          </td>
          <td className="py-2 text-center">
            <input type="checkbox" checked={selectedForImport.includes('app_config')}
              onChange={(e) => setSelectedForImport(e.target.checked ? [...selectedForImport, 'app_config'] : selectedForImport.filter(k => k !== 'app_config'))}
              className="w-4 h-4" />
          </td>
        </tr>

        <tr className="border-b">
          <td className="py-2">{t('quotes_label')}</td>
          <td className="py-2 text-center">
            <input type="checkbox" checked={companyMasterVisibility.includes('quotes')}
              onChange={(e) => toggleMasterVisibility('quotes', e.target.checked)} className="w-4 h-4" />
          </td>
          <td className="py-2 text-center">
            <input type="checkbox" checked={selectedForImport.includes('quotes')}
              onChange={(e) => setSelectedForImport(e.target.checked ? [...selectedForImport, 'quotes'] : selectedForImport.filter(k => k !== 'quotes'))}
              className="w-4 h-4" />
          </td>
        </tr>

        <tr className="border-b">
          <td className="py-2">
            <p>{t('promotional_videos_label')}</p>
            <p className="text-xs text-gray-400 font-normal">Useful for internal trainings — bring Default's presentations as a starting point</p>
          </td>
          <td className="py-2 text-center">
            <input type="checkbox" checked={companyMasterVisibility.includes('promotional_videos')}
              onChange={(e) => toggleMasterVisibility('promotional_videos', e.target.checked)} className="w-4 h-4" />
          </td>
          <td className="py-2 text-center">
            <input type="checkbox" checked={selectedForImport.includes('promotional_videos')}
              onChange={(e) => setSelectedForImport(e.target.checked ? [...selectedForImport, 'promotional_videos'] : selectedForImport.filter(k => k !== 'promotional_videos'))}
              className="w-4 h-4" />
          </td>
        </tr>

        <tr className="border-b">
          <td className="py-2">{t('content_pages_label')}</td>
          <td className="py-2 text-center">
            <input type="checkbox" checked={companyMasterVisibility.includes('content_pages')}
              onChange={(e) => toggleMasterVisibility('content_pages', e.target.checked)} className="w-4 h-4" />
          </td>
          <td className="py-2 text-center">
            <input type="checkbox" checked={selectedForImport.includes('content_pages')}
              onChange={(e) => setSelectedForImport(e.target.checked ? [...selectedForImport, 'content_pages'] : selectedForImport.filter(k => k !== 'content_pages'))}
              className="w-4 h-4" />
          </td>
        </tr>

        <tr className="border-b">
          <td className="py-2">{t('page_subtitles_label')}</td>
          <td className="py-2 text-center">
            <input type="checkbox" checked={companyMasterVisibility.includes('page_subtitles')}
              onChange={(e) => toggleMasterVisibility('page_subtitles', e.target.checked)} className="w-4 h-4" />
          </td>
          <td className="py-2 text-center">
            <input type="checkbox" checked={selectedForImport.includes('page_subtitles')}
              onChange={(e) => setSelectedForImport(e.target.checked ? [...selectedForImport, 'page_subtitles'] : selectedForImport.filter(k => k !== 'page_subtitles'))}
              className="w-4 h-4" />
          </td>
        </tr>

        <tr className="border-b">
          <td className="py-2">{t('manage_company_branding_title')}</td>
          <td className="py-2 text-center">
            <input type="checkbox" checked={companyMasterVisibility.includes('company_branding')}
              onChange={(e) => toggleMasterVisibility('company_branding', e.target.checked)} className="w-4 h-4" />
          </td>
          <td className="py-2 text-center"></td>
        </tr>

        <tr className="border-b">
          <td className="py-2">
            <p>{t('metadata_model')}</p>
            <p className="text-xs text-gray-400 font-normal">{t('functions_categories_desc')}</p>
            {practices.length > 0 && (
              <p className="text-xs text-amber-600 font-normal">⚠️ Already imported. Re-importing in a different language would mix languages together — delete existing Categories first if you need to switch.</p>
            )}
          </td>
          <td className="py-2 text-center">
            <input type="checkbox" checked={companyMasterVisibility.includes('metadata')}
              onChange={(e) => toggleMasterVisibility('metadata', e.target.checked)} className="w-4 h-4" />
          </td>
          <td className="py-2 text-center">
            <input type="checkbox" checked={selectedForImport.includes('metadata')}
              onChange={(e) => setSelectedForImport(e.target.checked ? [...selectedForImport, 'metadata'] : selectedForImport.filter(k => k !== 'metadata'))}
              className="w-4 h-4" />
          </td>
        </tr>

        <tr className="border-b">
          <td className="py-2">
            <p>{t('synthetic_curated_content')}</p>
            <p className="text-xs text-gray-400 font-normal">Individual Experiences, Top 3, Employees, Key Insights</p>
            {!selectedForImport.includes('metadata') && (
              <p className="text-xs text-amber-600 font-normal">⚠️ Check "Metadata Model" above too — Content can only be imported together with it, to stay linked to the right Categories.</p>
            )}
          </td>
          <td className="py-2 text-center">
            <input type="checkbox" checked={companyMasterVisibility.includes('synthetic')}
              onChange={(e) => toggleMasterVisibility('synthetic', e.target.checked)} className="w-4 h-4" />
          </td>
          <td className="py-2 text-center">
            <input type="checkbox" checked={selectedForImport.includes('synthetic')}
              disabled={!selectedForImport.includes('metadata')}
              onChange={(e) => setSelectedForImport(e.target.checked ? [...selectedForImport, 'synthetic'] : selectedForImport.filter(k => k !== 'synthetic'))}
              className="w-4 h-4 disabled:opacity-30" />
          </td>
        </tr>

        <tr>
          <td className="py-2">{t('manage_group_deletion')}</td>
          <td className="py-2 text-center">
            <input type="checkbox" checked={companyMasterVisibility.includes('keyword_filter')}
              onChange={(e) => toggleMasterVisibility('keyword_filter', e.target.checked)} className="w-4 h-4" />
          </td>
          <td className="py-2 text-center text-gray-300">—</td>
        </tr>
      </tbody>
    </table>
  </div>
)}
{isAdmin && showDefaultOnlyTools && !isSeller && activeAdminNavTab === 'settings' && (
  <div className="mt-4 bg-teal-50 border-2 border-teal-300 rounded-lg shadow-md p-4 max-w-4xl mx-auto">
    <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
      🧑‍💼 {t('manage_sellers')}
    </h3>

    {/* Add Seller */}
    <div className="bg-white rounded p-4 mb-4">
      <h4 className="font-medium text-gray-700 mb-3">{t('add_seller')}</h4>
      <p className="text-xs text-gray-500 mb-3">{t('seller_id_hint_intro')} <strong>{t('suggested_id_format')}</strong> {t('seller_id_hint_example')} <span className="font-mono">RR072026</span> {t('seller_id_hint_registered')}</p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
        <input type="text" value={newSeller.name} onChange={(e) => setNewSeller({...newSeller, name: e.target.value})}
          placeholder={t('name_star')} className="p-2 border-2 border-gray-300 rounded-lg text-sm" />
        <input type="text" value={newSeller.employee_id} onChange={(e) => setNewSeller({...newSeller, employee_id: e.target.value})}
          placeholder={t('seller_id_star')} className="p-2 border-2 border-gray-300 rounded-lg text-sm" />
        <input type="email" value={newSeller.email} onChange={(e) => setNewSeller({...newSeller, email: e.target.value})}
          placeholder={t('email_star')} className="p-2 border-2 border-gray-300 rounded-lg text-sm" />
      </div>
      <button onClick={createSeller} disabled={creatingSeller}
        className="px-4 py-2 bg-teal-600 text-white rounded-lg text-sm hover:bg-teal-700 disabled:opacity-50">
        {creatingSeller ? t('creating_ellipsis') : t('add_seller_btn')}
      </button>
    </div>

    {/* Seller List */}
    <div className="bg-white rounded p-4">
      <h4 className="font-medium text-gray-700 mb-3">{t('registered_sellers_title')} ({sellers.length})</h4>
      {!sellersLoaded ? (
        <p className="text-sm text-gray-400">{t('loading_ellipsis')}</p>
      ) : sellers.length === 0 ? (
        <p className="text-sm text-gray-400">{t('no_sellers_yet')}</p>
      ) : (
        <div className="space-y-2">
          {sellers.map(s => {
            const sellerCompanies = companies.filter(c => c.created_by_seller_id === s.id);
            const prospectCount = sellerCompanies.filter(c => (c.status || 'prospect') === 'prospect').length;
            const pilotCount = sellerCompanies.filter(c => c.status === 'pilot').length;
            const customerCount = sellerCompanies.filter(c => c.status === 'customer').length;
            return (
              <div key={s.id} className="border border-gray-200 rounded-lg">
              <div className="flex items-center gap-2 p-2 flex-wrap">
                <button
                  onClick={() => setExpandedSellerContact(prev => ({ ...prev, [s.id]: !prev[s.id] }))}
                  className="text-gray-500 hover:text-gray-800 font-bold text-sm w-5 h-5 flex-shrink-0 flex items-center justify-center border border-gray-300 rounded"
                  title={t('contact_info_tooltip')}
                >
                  {expandedSellerContact[s.id] ? '−' : '+'}
                </button>
                <span className="text-sm font-medium text-gray-800 text-left whitespace-nowrap w-28 flex-shrink-0 truncate">{s.name}</span>
                <span className="text-xs text-gray-500 font-mono text-left whitespace-nowrap w-20 flex-shrink-0">{s.employee_id}</span>
                <span className="text-xs text-gray-500 text-left whitespace-nowrap w-24 flex-shrink-0">
                  {t('since_label')} {s.created_at ? new Date(s.created_at).toLocaleDateString() : '—'}
                </span>
                <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium text-left whitespace-nowrap w-16 flex-shrink-0 text-center ${
                  s.status === 'active' ? 'bg-green-100 text-green-700'
                  : s.status === 'blocked' ? 'bg-red-100 text-red-700'
                  : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {s.status === 'active' ? t('seller_status_active') : s.status === 'blocked' ? t('seller_status_blocked') : t('seller_status_pending')}
                </span>
                <span className="text-xs text-yellow-700 whitespace-nowrap w-14 flex-shrink-0">{t('pros_count_label')} {prospectCount}</span>
                <span className="text-xs text-blue-700 whitespace-nowrap w-12 flex-shrink-0">{t('plt_count_label')} {pilotCount}</span>
                <span className="text-xs text-green-700 whitespace-nowrap w-14 flex-shrink-0">{t('cust_count_label')} {customerCount}</span>
                <select
                  value={s.active ? 'active' : 'inactive'}
                  onChange={(e) => toggleSellerActive(s.id, e.target.value === 'active')}
                  className={`text-xs px-1.5 py-1 rounded-full font-medium w-24 flex-shrink-0 border-0 ${s.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}
                >
                  <option value="active">{t('enabled')}</option>
                  <option value="inactive">{t('disabled')}</option>
                </select>
                <button onClick={() => deleteSeller(s.id, s.name)}
                  className="px-2 py-1 rounded text-xs bg-red-600 hover:bg-red-700 text-white whitespace-nowrap flex-shrink-0">
                  {t('del_short')}
                </button>
              </div>
              {expandedSellerContact[s.id] && (
                <div className="border-t border-gray-200 p-3 bg-gray-50 space-y-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input type="text" defaultValue={s.contact_name || s.name || ''} id={`seller-contact-name-${s.id}`}
                      placeholder={t('contact_name_placeholder')} className="p-1.5 border border-gray-300 rounded text-sm" />
                    <input type="email" defaultValue={s.contact_email || s.email || ''} id={`seller-contact-email-${s.id}`}
                      placeholder={t('email')} className="p-1.5 border border-gray-300 rounded text-sm" />
                    <input type="text" defaultValue={s.contact_phone || ''} id={`seller-contact-phone-${s.id}`}
                      placeholder={t('phone')} className="p-1.5 border border-gray-300 rounded text-sm" />
                    <input type="text" defaultValue={s.contact_location || ''} id={`seller-contact-location-${s.id}`}
                      placeholder={t('city_country')} className="p-1.5 border border-gray-300 rounded text-sm" />
                  </div>
                  <textarea defaultValue={s.contact_notes || ''} id={`seller-contact-notes-${s.id}`}
                    placeholder={t('comments_optional')} rows="2"
                    className="w-full p-1.5 border border-gray-300 rounded text-sm" />
                  <button
                    onClick={async () => {
                      const { error } = await supabase.from('employees').update({
                        contact_name: document.getElementById(`seller-contact-name-${s.id}`).value.trim() || null,
                        contact_email: document.getElementById(`seller-contact-email-${s.id}`).value.trim() || null,
                        contact_phone: document.getElementById(`seller-contact-phone-${s.id}`).value.trim() || null,
                        contact_location: document.getElementById(`seller-contact-location-${s.id}`).value.trim() || null,
                        contact_notes: document.getElementById(`seller-contact-notes-${s.id}`).value.trim() || null
                      }).eq('id', s.id);
                      if (error) { alert(t('error_saving_contact_info') + ' ' + error.message); return; }
                      await loadSellers();
                      alert(t('contact_info_saved'));
                    }}
                    className="px-3 py-1 bg-indigo-600 text-white rounded text-xs hover:bg-indigo-700"
                  >{t('save_contact_info')}</button>
                </div>
              )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  </div>
)}


{isAdmin && (showDefaultOnlyTools || (isSeller && !isSellerManagingOwnCompany && companyViewMode !== 'sample')) && activeAdminNavTab === 'settings' && (
  <div className="mt-4 bg-indigo-50 border-2 border-indigo-300 rounded-lg shadow-md p-4 max-w-4xl mx-auto">
    <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
      🏢 {t('manage_companies')}
    </h3>

    {/* Add Company */}
    <div className="bg-white rounded p-4 mb-4">
      <h4 className="font-medium text-gray-700 mb-3">{t('add_company')}</h4>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
        <input type="text" value={newCompany.name} onChange={(e) => setNewCompany({...newCompany, name: e.target.value})}
          placeholder={t('company_name_star')} className="p-2 border-2 border-gray-300 rounded-lg text-sm" />
        <input type="text" value={newCompany.code} onChange={(e) => setNewCompany({...newCompany, code: e.target.value})}
          placeholder={t('company_code_hint')} className="p-2 border-2 border-gray-300 rounded-lg text-sm" />
        <select value={newCompany.edition} onChange={(e) => setNewCompany({...newCompany, edition: e.target.value})}
          className="p-2 border-2 border-gray-300 rounded-lg text-sm font-medium">
          <option value="corp">Corp</option>
          <option value="pro">Pro</option>
          <option value="edu">Edu</option>
        </select>
      </div>
      <div className="mb-3">
        <label className="block text-xs font-medium text-gray-600 mb-1">{t('company_logo_optional')}</label>
        <input type="file" accept="image/png,image/jpeg,image/svg+xml,image/gif,image/webp"
          onChange={(e) => setNewCompany({...newCompany, logoFile: e.target.files[0] || null})}
          className="text-sm" />
      </div>
      <button onClick={addCompany} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700">
        {t('add_company_btn')}
      </button>
    </div>

    {/* Company List — pro Default Admin, todas; pro Seller, só as que ele
        mesmo criou. Um painel só, uma lista só — nunca mais dessincroniza. */}
    <div className="bg-white rounded p-4">
      <h4 className="font-medium text-gray-700 mb-1">
        {t('registered_companies_title')} ({companies.filter(c => c.code !== 'default' && (!isSeller || c.created_by_seller_id === loggedInSellerId)).length})
      </h4>
      <p className="text-xs text-gray-400 mb-3">{t('circle_marks_context')}</p>
      {!companiesLoaded ? (
        <p className="text-sm text-gray-400">{t('loading_ellipsis')}</p>
      ) : companies.filter(c => c.code !== 'default' && (!isSeller || c.created_by_seller_id === loggedInSellerId)).length === 0 ? (
        <p className="text-sm text-gray-400">{t('no_companies_yet')}</p>
      ) : (
        <div className="space-y-2">
          {companies.filter(c => c.code !== 'default' && (!isSeller || c.created_by_seller_id === loggedInSellerId)).map(c => (
            <div key={c.id} className="border border-gray-200 rounded-lg">
            <div className="flex items-center gap-3 p-2">
              <button
                onClick={() => setExpandedCompanyContact(prev => ({ ...prev, [c.id]: !prev[c.id] }))}
                className="text-gray-500 hover:text-gray-800 font-bold text-sm w-5 h-5 flex-shrink-0 flex items-center justify-center border border-gray-300 rounded"
                title={t('contact_info_tooltip')}
              >
                {expandedCompanyContact[c.id] ? '−' : '+'}
              </button>
              <input type="radio" name="context-company" checked={selectedCompanyForContext === c.id}
                onChange={() => { setSelectedCompanyForContext(c.id); if (adminCompanyContext) setAdminCompanyContext(c.id); }}
                title={t('set_as_context_company')} className="w-4 h-4 flex-shrink-0" />
              <span className="text-sm font-medium text-gray-800 text-left whitespace-nowrap w-32 flex-shrink-0 truncate">{c.name}</span>
              <span className="text-xs px-1.5 py-0.5 rounded-full font-medium bg-indigo-100 text-indigo-700 text-left whitespace-nowrap w-12 flex-shrink-0 text-center">
                {{corp:'Corp',pro:'Pro',edu:'Edu'}[c.edition] || 'Corp'}
              </span>
              <span className="text-xs text-gray-500 text-left whitespace-nowrap w-24 flex-shrink-0">
                {t('since_label')} {c.created_at ? new Date(c.created_at).toLocaleDateString() : '—'}
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-slate-100 text-slate-600 text-left whitespace-nowrap w-32 flex-shrink-0 truncate">
                {t('by_short')} {c.created_by_seller_id
                  ? (sellers.find(s => s.id === c.created_by_seller_id)?.name || t('unknown_seller'))
                  : t('default_admin_label')}
              </span>
              <select
                value={c.status || 'prospect'}
                onChange={async (e) => {
                  const { error } = await supabase.from('companies').update({ status: e.target.value }).eq('id', c.id);
                  if (error) { alert(t('error_updating_status') + ' ' + error.message); return; }
                  await loadCompanies();
                }}
                className={`text-xs px-1.5 py-1 rounded-full font-medium w-24 flex-shrink-0 border-0 ${
                  c.status === 'customer' ? 'bg-green-100 text-green-700'
                  : c.status === 'pilot' ? 'bg-blue-100 text-blue-700'
                  : 'bg-yellow-100 text-yellow-700'
                }`}
              >
                <option value="prospect">{t('prospect')}</option>
                <option value="pilot">{t('pilot')}</option>
                <option value="customer">{t('customer')}</option>
              </select>
              <select
                value={c.active ? 'active' : 'inactive'}
                onChange={(e) => toggleCompanyActive(c.id, e.target.value === 'active')}
                className={`text-xs px-1.5 py-1 rounded-full font-medium w-20 flex-shrink-0 border-0 ${c.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}
              >
                <option value="active">{t('active')}</option>
                <option value="inactive">{t('inactive')}</option>
              </select>
              <button onClick={() => deleteCompany(c.id, c.name)}
                className="px-2 py-1 rounded text-xs bg-red-600 hover:bg-red-700 text-white whitespace-nowrap flex-shrink-0">
                {t('delete_trash')}
              </button>
            </div>
            {expandedCompanyContact[c.id] && (
              <div className="border-t border-gray-200 p-3 bg-gray-50 space-y-2">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">{t('company_name_star')}</label>
                  <input type="text" defaultValue={c.name} id={`company-name-${c.id}`}
                    className="w-full p-1.5 border border-gray-300 rounded text-sm" />
                  <div className="flex gap-3 bg-white p-1.5 rounded mt-1">
                    <span className="text-xs text-gray-500 self-center">{t('size_label')}</span>
                    {['small', 'medium', 'large'].map(size => (
                      <label key={size} className="flex items-center gap-1 cursor-pointer">
                        <input type="radio" name={`company-name-size-${c.id}`} value={size}
                          checked={(companyBrandingSizesById[c.id]?.name || 'medium') === size}
                          onChange={() => saveCompanyBrandingSize(c.id, 'company_name_size', size)}
                          className="w-3 h-3" />
                        <span className="text-xs">{tSizeLabel(size)}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input type="text" defaultValue={c.contact_name || ''} id={`contact-name-${c.id}`}
                    placeholder={t('contact_name_placeholder')} className="p-1.5 border border-gray-300 rounded text-sm" />
                  <input type="email" defaultValue={c.contact_email || ''} id={`contact-email-${c.id}`}
                    placeholder={t('email')} className="p-1.5 border border-gray-300 rounded text-sm" />
                  <input type="text" defaultValue={c.contact_phone || ''} id={`contact-phone-${c.id}`}
                    placeholder={t('phone')} className="p-1.5 border border-gray-300 rounded text-sm" />
                  <input type="text" defaultValue={c.contact_location || ''} id={`contact-location-${c.id}`}
                    placeholder={t('city_country')} className="p-1.5 border border-gray-300 rounded text-sm" />
                </div>
                <textarea defaultValue={c.contact_notes || ''} id={`contact-notes-${c.id}`}
                  placeholder={t('comments_optional')} rows="2"
                  className="w-full p-1.5 border border-gray-300 rounded text-sm" />
                <div className="border-t border-gray-300 pt-2 mt-2">
                  <label className="block text-xs font-medium text-gray-600 mb-1">{t('company_logo_optional')}</label>
                  {companyLogosById[c.id] && (
                    <div className="flex items-center gap-2 mb-1.5">
                      <img src={companyLogosById[c.id]} alt="logo" className="h-8 object-contain border border-gray-200 rounded p-1 bg-white" />
                      <span className="text-xs text-gray-500">{t('logo_active')}</span>
                      <button
                        onClick={async () => {
                          const { error } = await supabase.from('app_settings').update({ company_logo_url: null }).eq('company_id', c.id);
                          if (error) { alert('Error: ' + error.message); return; }
                          setCompanyLogosById(prev => {
                            const next = { ...prev };
                            delete next[c.id];
                            return next;
                          });
                        }}
                        className="text-xs text-red-600 hover:text-red-800 font-medium"
                      >
                        {t('remove_x')}
                      </button>
                    </div>
                  )}
                  {companyLogosById[c.id] && (
                    <div className="flex gap-3 bg-white p-1.5 rounded mb-1.5">
                      <span className="text-xs text-gray-500 self-center">{t('size_label')}</span>
                      {['small', 'medium', 'large'].map(size => (
                        <label key={size} className="flex items-center gap-1 cursor-pointer">
                          <input type="radio" name={`company-logo-size-${c.id}`} value={size}
                            checked={(companyBrandingSizesById[c.id]?.logo || 'medium') === size}
                            onChange={() => saveCompanyBrandingSize(c.id, 'company_logo_size', size)}
                            className="w-3 h-3" />
                          <span className="text-xs">{tSizeLabel(size)}</span>
                        </label>
                      ))}
                    </div>
                  )}
                  <input type="file" accept="image/png,image/jpeg,image/svg+xml,image/gif,image/webp"
                    onChange={async (e) => {
                      const file = e.target.files[0];
                      if (!file) return;
                      if (file.size > 2000000) { alert('Max 2MB'); return; }
                      try {
                        const ext = file.name.split('.').pop();
                        const path = `logo-company-${c.id}-${Date.now()}.${ext}`;
                        const { error: upErr } = await supabase.storage.from('cvs').upload(path, file);
                        if (upErr) throw upErr;
                        const { data: { publicUrl } } = supabase.storage.from('cvs').getPublicUrl(path);
                        // Sem constraint única em company_id nessa tabela — checa se já
                        // existe uma linha antes de decidir entre update/insert, em vez
                        // de depender de upsert com onConflict.
                        const { data: existingSettings } = await supabase
                          .from('app_settings').select('company_id').eq('company_id', c.id).maybeSingle();
                        const { error: settingsErr } = existingSettings
                          ? await supabase.from('app_settings').update({ company_logo_url: publicUrl }).eq('company_id', c.id)
                          : await supabase.from('app_settings').insert([{
                              company_id: c.id, company_logo_url: publicUrl,
                              require_employee_login: true, allow_cv_upload: true, document_type: c.edition === 'pro' ? 'cv' : 'other',
                              show_top3: false, top3_start_visible: true, show_marquee: false
                            }]);
                        if (settingsErr) throw settingsErr;
                        setCompanyLogosById(prev => ({ ...prev, [c.id]: publicUrl }));
                        alert('Logo uploaded!');
                      } catch (err) {
                        alert('Error: ' + err.message);
                      }
                      e.target.value = '';
                    }}
                    className="text-sm" />
                </div>
                {c.edition === 'pro' && (
                  <div className="border-t border-gray-300 pt-2 mt-2 space-y-1.5">
                    <p className="text-xs font-semibold text-gray-600">{t('pro_signup_links_title')}</p>
                    {[
                      { label: t('professional_link_label'), url: `${window.location.origin}/?signup=professional&code=${c.code}` },
                      { label: t('contratante_link_label'), url: `${window.location.origin}/?signup=contratante&code=${c.code}` }
                    ].map((link, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <span className="text-xs text-gray-500 w-32 flex-shrink-0">{link.label}</span>
                        <input type="text" readOnly value={link.url} className="flex-1 p-1 border border-gray-300 rounded text-xs bg-gray-50 text-gray-600" />
                        <button
                          onClick={() => { navigator.clipboard.writeText(link.url); alert(t('link_copied')); }}
                          className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded text-xs font-medium hover:bg-indigo-200 flex-shrink-0"
                        >
                          {t('copy_link_btn')}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <button
                  onClick={async () => {
                    const newName = document.getElementById(`company-name-${c.id}`).value.trim();
                    if (!newName) { alert(t('company_name_required')); return; }
                    const { error } = await supabase.from('companies').update({
                      name: newName,
                      contact_name: document.getElementById(`contact-name-${c.id}`).value.trim() || null,
                      contact_email: document.getElementById(`contact-email-${c.id}`).value.trim() || null,
                      contact_phone: document.getElementById(`contact-phone-${c.id}`).value.trim() || null,
                      contact_location: document.getElementById(`contact-location-${c.id}`).value.trim() || null,
                      contact_notes: document.getElementById(`contact-notes-${c.id}`).value.trim() || null
                    }).eq('id', c.id);
                    if (error) { alert(t('error_saving_contact_info') + ' ' + error.message); return; }
                    await loadCompanies();
                    alert(t('contact_info_saved'));
                  }}
                  className="px-3 py-1 bg-indigo-600 text-white rounded text-xs hover:bg-indigo-700"
                >{t('save_contact_info')}</button>
              </div>
            )}
            </div>
          ))}
        </div>
      )}
    </div>
  </div>
)}

{isAdmin && (showDefaultOnlyTools || (isSeller && !isSellerManagingOwnCompany && companyViewMode !== 'sample')) && activeAdminNavTab === 'settings' && (
  <div className="mt-4 bg-pink-50 border-2 border-pink-300 rounded-lg shadow-md p-4 max-w-4xl mx-auto">
    <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
      🎯 {t('manage_demo_groups')}
    </h3>

    {isSeller && (() => {
      const myLimit = sellers.find(s => s.id === loggedInSellerId)?.demo_id_limit ?? 10;
      const now = new Date();
      const myActiveCount = employees.filter(e =>
        e.is_demo && e.created_by_seller_id === loggedInSellerId && !e.retired && !!e.group_id &&
        (!e.demo_expires_at || new Date(e.demo_expires_at) >= now)
      ).length;
      const remaining = myLimit > 0 ? Math.max(0, myLimit - myActiveCount) : null;
      return (
        <p className={`text-sm font-medium mb-4 ${remaining === 0 ? 'text-red-600' : 'text-pink-700'}`}>
          {remaining === null
            ? tt('demo_ids_no_limit', { count: myActiveCount })
            : tt('demo_ids_available', { remaining, limit: myLimit })}
        </p>
      );
    })()}

    {/* Create New Group */}
    <div className="bg-white rounded p-4 mb-4">
      <h4 className="font-medium text-gray-700 mb-3">{t('create_new_group')}</h4>
      <div className="flex gap-2 mb-3">
        <select
          id="new-group-company"
          className="flex-1 p-2 border-2 border-gray-300 rounded-lg text-sm"
          defaultValue=""
        >
          <option value="" disabled>{t('select_registered_company')}</option>
          {companies.filter(c => c.code !== 'default' && (!isSeller || c.created_by_seller_id === loggedInSellerId)).map(c => (
            <option key={c.id} value={c.id}>
              {c.name} ({c.status === 'customer' ? t('customer') : c.status === 'pilot' ? t('pilot') : t('prospect')}/{{corp:'Corp',pro:'Pro',edu:'Edu'}[c.edition] || 'Corp'})
            </option>
          ))}
        </select>
        <button
          onClick={async () => {
            const companyId = document.getElementById('new-group-company').value;
            if (!companyId) { alert(t('please_select_company')); return; }
            const company = companies.find(c => String(c.id) === companyId);
            if (!company) { alert(t('company_not_found')); return; }
            const { data, error } = await supabase
              .from('demo_groups')
              .insert([{ name: company.name, company_id: company.id, created_by_seller_id: isSeller ? loggedInSellerId : null }])
              .select();
            if (error) { alert(t('error_creating_group') + ' ' + error.message); return; }
            document.getElementById('new-group-company').value = '';
            await loadDemoGroups();
            alert(tAlert('group_created_named', { name: company.name }));
          }}
          className="px-4 py-2 bg-pink-600 text-white rounded-lg text-sm hover:bg-pink-700"
        >{t('create_group_btn')}</button>
      </div>
    </div>

    {/* Existing Groups — pro seller, só os que ele criou (loadDemoGroups já filtra) */}
    <div className="bg-white rounded p-4">
      <h4 className="font-medium text-gray-700 mb-3">{t('active_groups_title')} ({demoGroups.length})</h4>
      {demoGroups.length === 0 ? (
        <p className="text-sm text-gray-500">{t('no_groups_yet')}</p>
      ) : (
        <div className="space-y-4">
          {demoGroups.map(group => {
            const memberCount = (group.employees || []).length;
            const atLimit = memberCount >= 2;
            return (
            <div key={group.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h5 className="font-semibold text-gray-800 flex items-center gap-2">
                    {group.name}
                    {group.company_id && (() => {
                      const linkedCompany = companies.find(c => c.id === group.company_id);
                      if (!linkedCompany) return null;
                      const status = linkedCompany.status || 'prospect';
                      return (
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          status === 'customer' ? 'bg-green-100 text-green-700'
                          : status === 'pilot' ? 'bg-blue-100 text-blue-700'
                          : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {status === 'customer' ? t('customer') : status === 'pilot' ? t('pilot') : t('prospect')}/{{corp:'Corp',pro:'Pro',edu:'Edu'}[linkedCompany.edition] || 'Corp'}
                        </span>
                      );
                    })()}
                  </h5>
                  <p className="text-xs text-gray-500">
                    {t('by_short')} {group.created_by_seller_id
                      ? (sellers.find(s => s.id === group.created_by_seller_id)?.name || t('unknown_seller'))
                      : t('default_admin_label')}
                    {group.created_at && ` · ${new Date(group.created_at).toLocaleDateString()}`}
                  </p>
                </div>
                <button
                  onClick={async () => {
                    if (!window.confirm(tConfirm('delete_group', { name: group.name }))) return;
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
                        await supabase.from('employees').update({ group_id: null, demo_expires_at: null }).eq('employee_id', member.employee_id);
                      }
                      // Delete group
                      await supabase.from('demo_groups').delete().eq('id', group.id);
                      await loadDemoGroups();
                      await loadEmployees();
                      await loadExperiences(true);
                      alert(tAlert('group_deleted_named', { name: group.name }));
                    } catch (error) {
                      alert(t('error_deleting_group') + ' ' + error.message);
                    }
                  }}
                  className="px-3 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700"
                >{t('delete_group_btn')}</button>
              </div>

              {/* Members */}
              <div className="mb-3">
                <p className="text-xs font-medium text-gray-600 mb-2">{t('members_count_label')} ({memberCount}/2):</p>
                <div className="flex flex-col gap-2">
                  {(group.employees || []).map(emp => {
                    const isExpired = emp.demo_expires_at && new Date(emp.demo_expires_at) < new Date();
                    const isUsed = !!emp.last_login_at;
                    const totalDays = (emp.created_at && emp.demo_expires_at)
                      ? Math.round((new Date(emp.demo_expires_at) - new Date(emp.created_at)) / (1000 * 60 * 60 * 24))
                      : null;
                    const daysLeft = emp.demo_expires_at
                      ? Math.max(0, Math.ceil((new Date(emp.demo_expires_at) - new Date()) / (1000 * 60 * 60 * 24)))
                      : null;
                    return (
                    <div key={emp.employee_id} className="flex items-center gap-3 p-2 border border-pink-200 rounded-lg bg-pink-50">
                      <span className="text-xs font-medium text-pink-800 text-left whitespace-nowrap w-20 flex-shrink-0">ID: {emp.employee_id}</span>
                      <span className="text-xs font-medium text-pink-800 text-left whitespace-nowrap w-24 flex-shrink-0">PW: {emp.password}</span>
                      <span className="text-xs text-pink-500 uppercase text-left w-10 flex-shrink-0">[{emp.language || 'en'}]</span>
                      <span className={`text-xs px-1 py-0.5 rounded-full font-semibold text-left whitespace-nowrap w-14 flex-shrink-0 text-center ${isExpired ? 'bg-red-200 text-red-800' : 'bg-green-200 text-green-800'}`}>{isExpired ? t('expired_word') : t('active_word')}</span>
                      <span className={`text-xs px-1 py-0.5 rounded-full font-semibold text-left whitespace-nowrap w-16 flex-shrink-0 text-center ${isUsed ? 'bg-amber-200 text-amber-800' : 'bg-gray-200 text-gray-600'}`}>{isUsed ? t('used_word') : t('not_used')}</span>
                      <span className="text-xs text-pink-500 text-left whitespace-nowrap w-28 flex-shrink-0">
                        {emp.created_at ? `${t('since_label')} ${new Date(emp.created_at).toLocaleDateString()}` : ''}
                      </span>
                      <span className="text-xs text-pink-500 text-left whitespace-nowrap w-28 flex-shrink-0">
                        {emp.demo_expires_at ? `${t('exp_label')} ${new Date(emp.demo_expires_at).toLocaleDateString()}` : ''}
                      </span>
                      <span className="text-xs text-pink-500 text-left whitespace-nowrap w-16 flex-shrink-0">
                        {daysLeft !== null ? `${isExpired ? '0' : daysLeft}/${totalDays}${t('d_left_suffix')}` : ''}
                      </span>
                      <button
                        onClick={async () => {
                          if (!window.confirm(tConfirm('delete_id_retire', { id: emp.employee_id }))) return;
                          try {
                            await supabase.from('comments').delete().eq('employee_id', emp.employee_id);
                            const { data: exps } = await supabase.from('experiences').select('id, cv_url').eq('employee_id', emp.employee_id);
                            for (const exp of exps || []) {
                              if (exp.cv_url) await deleteFileFromStorage(exp.cv_url);
                            }
                            await supabase.from('experiences').delete().eq('employee_id', emp.employee_id);
                            const { error } = await supabase.from('employees')
                              .update({ group_id: null, demo_expires_at: null, retired: true, active: false })
                              .eq('employee_id', emp.employee_id);
                            if (error) throw error;
                            await loadDemoGroups();
                            await loadEmployees();
                            await loadExperiences(true);
                          } catch (error) {
                            alert('Error deleting ID: ' + error.message);
                          }
                        }}
                        className="px-3 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700 flex-shrink-0 whitespace-nowrap"
                        title={t('retires_id_permanently')}
                      >{t('del_short')}</button>
                    </div>
                    );
                  })}
                  {(group.employees || []).length === 0 && (
                    <span className="text-xs text-gray-400">{t('no_members_yet')}</span>
                  )}
                </div>
              </div>

              {/* Add member — cria o ID na hora (não escolhe de um pool pré-criado)
                  — desabilitado ao atingir o limite de 2 */}
              {atLimit ? (
                <p className="text-xs text-amber-600 font-medium">{t('max_2_ids_per_group')}</p>
              ) : (
              <div className="flex gap-2 items-center flex-wrap">
                <select
                  id={`add-member-lang-${group.id}`}
                  title={t('demo_language_tooltip')}
                  defaultValue="en"
                  className="p-2 border-2 border-gray-200 rounded-lg text-sm"
                >
                  <option value="en">English</option>
                  <option value="es">Español</option>
                  <option value="pt">Português</option>
                  <option value="zh">中文</option>
                </select>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span>{t('expires_in')}</span>
                  {[3, 5, 7].map(days => (
                    <label key={days} className="flex items-center gap-1">
                      <input type="radio" name={`add-member-expiry-${group.id}`} value={days}
                        checked={(addIdExpiryDays[group.id] ?? 5) === days}
                        onChange={() => setAddIdExpiryDays(prev => ({ ...prev, [group.id]: days }))}
                        className="w-4 h-4" />
                      {days}d
                    </label>
                  ))}
                  <span className="text-xs text-gray-400">
                    (Created {new Date().toLocaleDateString()} · Expires {new Date(Date.now() + (addIdExpiryDays[group.id] ?? 5) * 24 * 60 * 60 * 1000).toLocaleDateString()})
                  </span>
                </div>
                <button
                  onClick={async () => {
                    const langVal = document.getElementById(`add-member-lang-${group.id}`).value;
                    const days = addIdExpiryDays[group.id] ?? 5;
                    const expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
                    // Trava o limite de IDs ativos do seller (0 = ilimitado,
                    // configurado pelo Default Admin em "Manage Sellers"). Não
                    // se aplica ao pool da casa (Default Admin criando direto).
                    if (isSeller) {
                      const myLimit = sellers.find(s => s.id === loggedInSellerId)?.demo_id_limit ?? 10;
                      const now = new Date();
                      const myActiveCount = employees.filter(e =>
                        e.is_demo && e.created_by_seller_id === loggedInSellerId && !e.retired && !!e.group_id &&
                        (!e.demo_expires_at || new Date(e.demo_expires_at) >= now)
                      ).length;
                      if (myLimit > 0 && myActiveCount >= myLimit) {
                        alert(tAlert('demo_id_limit_reached', { limit: myLimit }));
                        return;
                      }
                    }
                    try {
                      // Gera um número novo do pool global na hora — não existe
                      // mais um "pool disponível" pra escolher, cada ID nasce
                      // já pertencendo a esse grupo.
                      const { data: seqNumbers, error: seqError } = await supabase.rpc('next_demo_id_numbers', { count: 1 });
                      if (seqError) throw seqError;
                      const padded = String(seqNumbers[0].n).padStart(4, '0');
                      const { error } = await supabase.from('employees').insert([{
                        employee_id: `ID${padded}`,
                        name: `${group.name} Demo ${padded}`,
                        company_id: group.company_id,
                        is_demo: true,
                        password: `PW${padded}`,
                        status: 'active',
                        active: true,
                        language: langVal,
                        created_by_seller_id: isSeller ? loggedInSellerId : null,
                        group_id: group.id,
                        demo_expires_at: expiresAt
                      }]);
                      if (error) throw error;
                      await loadDemoGroups();
                      await loadEmployees();
                    } catch (error) {
                      alert('Error creating ID: ' + error.message);
                    }
                  }}
                  className="px-3 py-2 bg-pink-600 text-white rounded-lg text-sm hover:bg-pink-700"
                >{t('add_new_id_btn')}</button>
              </div>
              )}
            </div>
            );
          })}
        </div>
      )}
    </div>
  </div>
)}

{isAdmin && showDefaultOnlyTools && !isSeller && activeAdminNavTab === 'settings' && (
  <div className="mt-4 bg-cyan-50 border-2 border-cyan-300 rounded-lg shadow-md p-4 max-w-4xl mx-auto">
    <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
      📊 {t('sellers_demo_activity_overview')}
    </h3>
    <div className="bg-white rounded p-4">
      <p className="text-xs text-gray-400 mb-3">{t('expired_ids_autoclear')}</p>
      <div className="overflow-x-auto">
        <table className="w-full text-xs" style={{tableLayout: 'fixed'}}>
          <thead>
            <tr className="border-b-2 border-gray-200 text-gray-500">
              <th className="py-2 pr-2 text-left" style={{width: '22%'}}>{t('seller_col')}</th>
              <th className="py-2 pr-2 text-center" style={{width: '13%'}}>{t('companies_col')}</th>
              <th className="py-2 pr-2 text-center" style={{width: '13%'}}>{t('groups_col')}</th>
              <th className="py-2 pr-2 text-center" style={{width: '13%'}}>{t('max_demo_ids_col')}</th>
              <th className="py-2 pr-2 text-center" style={{width: '13%'}}>{t('active_ids_col')}</th>
              <th className="py-2 pr-2 text-center" style={{width: '13%'}}>{t('available_unassigned_col')}</th>
              <th className="py-2 pr-2 text-center" style={{width: '13%'}}>{t('expired_pending_col')}</th>
            </tr>
          </thead>
          <tbody>
            {(() => {
              const now = new Date();
              const rows = sellers.map(s => {
                const sellerCompanies = companies.filter(c => c.created_by_seller_id === s.id);
                const sellerGroups = demoGroups.filter(g => g.created_by_seller_id === s.id);
                const sellerDemoIds = employees.filter(e => e.is_demo && e.created_by_seller_id === s.id);
                const assigned = sellerDemoIds.filter(e => !!e.group_id);
                const expired = assigned.filter(e => e.demo_expires_at && new Date(e.demo_expires_at) < now);
                const active = assigned.filter(e => !e.demo_expires_at || new Date(e.demo_expires_at) >= now);
                const available = sellerDemoIds.filter(e => !e.group_id && !e.retired);
                return {
                  seller: s,
                  companiesCount: sellerCompanies.length,
                  groupsCount: sellerGroups.length,
                  activeCount: active.length,
                  expiredCount: expired.length,
                  availableCount: available.length
                };
              });
              if (rows.length === 0) {
                return (
                  <tr><td colSpan="7" className="py-4 text-center text-gray-400">{t('no_sellers_yet')}</td></tr>
                );
              }
              return rows.map(r => (
                <tr key={r.seller.id} className="border-b border-gray-100">
                  <td className="py-2 pr-2 font-medium text-gray-800 text-left">{r.seller.name}</td>
                  <td className="py-2 pr-2 text-center">{r.companiesCount}</td>
                  <td className="py-2 pr-2 text-center">{r.groupsCount}</td>
                  <td className="py-2 pr-2 text-center">
                    <input
                      type="number"
                      min="0"
                      defaultValue={r.seller.demo_id_limit ?? 10}
                      title={t('max_active_demo_ids')}
                      onBlur={async (e) => {
                        const val = parseInt(e.target.value);
                        if (isNaN(val) || val < 0) { e.target.value = r.seller.demo_id_limit ?? 10; return; }
                        if (val === (r.seller.demo_id_limit ?? 10)) return;
                        const { error } = await supabase.from('employees').update({ demo_id_limit: val }).eq('id', r.seller.id);
                        if (error) { alert('Error saving limit: ' + error.message); return; }
                        await loadSellers();
                      }}
                      className="w-14 p-1 border-2 border-gray-200 rounded text-xs text-center"
                    />
                  </td>
                  <td className="py-2 pr-2 text-green-700 font-medium text-center">{r.activeCount}</td>
                  <td className="py-2 pr-2 text-gray-500 text-center">{r.availableCount}</td>
                  <td className="py-2 pr-2 text-red-700 font-medium text-center">{r.expiredCount}</td>
                </tr>
              ));
            })()}
          </tbody>
        </table>
      </div>
    </div>
  </div>
)}


{isAdmin && canManageThisCompany && !(isSeller && !isSellerManagingOwnCompany && companyViewMode !== 'sample') && (!masterMustRespectVisibility || companyMasterVisibility.includes('company_branding')) && activeAdminNavTab === 'settings' && (
  <div className="mt-4 bg-purple-50 border-2 border-purple-300 rounded-lg shadow-md p-4 max-w-4xl mx-auto">
    <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
      {t('manage_company_branding_title')}
      {isReadOnlyOrMasterManaging && <span className="text-xs font-normal text-blue-600">{t('read_only_sample')}</span>}
    </h3>
    <div className={`bg-white rounded p-4 ${isReadOnlyOrMasterManaging ? 'pointer-events-none opacity-60' : ''}`}>

        {showDefaultOnlyTools ? (
          <div className="space-y-6">
            {['corp', 'pro', 'edu'].map(ed => {
              const branding = editionBranding[ed] || {};
              return (
                <div key={ed} className="border-2 border-dashed border-indigo-200 rounded-lg p-3">
                  <p className="text-xs font-semibold text-indigo-600 mb-3 capitalize">{ed}</p>

                  <div className="mb-4">
                    <label className="block text-xs font-medium text-gray-600 mb-1">{t('company_name')}</label>
                    <div className="flex gap-2 mb-2">
                      <input type="text" defaultValue={branding.company_name || ''}
                        id={`branding-name-${ed}`}
                        placeholder="e.g. XYZ Financial Services"
                        className="flex-1 p-2 border-2 border-gray-300 rounded-lg text-sm" maxLength={60} />
                      <button onClick={async () => {
                        const value = document.getElementById(`branding-name-${ed}`).value;
                        const { error } = await supabase.from('edition_branding').update({ company_name: value, updated_at: new Date().toISOString() }).eq('edition', ed);
                        if (error) alert(t('generic_error') + ' ' + error.message);
                        else { alert('Company name saved!'); await loadEditionBranding(); }
                      }} className="px-3 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700">{t('save')}</button>
                    </div>
                    <div className="flex gap-3 bg-gray-50 p-2 rounded-lg">
                      <span className="text-xs text-gray-500 self-center">{t('size_label')}</span>
                      {['small', 'medium', 'large'].map(size => (
                        <label key={size} className="flex items-center gap-1 cursor-pointer">
                          <input type="radio" name={`branding-name-size-${ed}`} value={size}
                            checked={(branding.company_name_size || 'medium') === size}
                            onChange={async () => {
                              await supabase.from('edition_branding').update({ company_name_size: size, updated_at: new Date().toISOString() }).eq('edition', ed);
                              await loadEditionBranding();
                            }}
                            className="w-3 h-3" />
                          <span className="text-xs capitalize">{tSizeLabel(size)}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">{t('company_logo')}</label>
                    {branding.company_logo_url && (
                      <div className="mb-3 flex items-center gap-3 p-2 bg-gray-50 rounded-lg border border-gray-200">
                        <img src={branding.company_logo_url} alt="logo" className="h-10 object-contain border border-gray-200 rounded p-1 bg-white" />
                        <span className="text-xs text-gray-500 flex-1">{t('logo_active')}</span>
                        <button onClick={async () => {
                          const { error } = await supabase.from('edition_branding').update({ company_logo_url: null }).eq('edition', ed);
                          if (!error) { await loadEditionBranding(); alert('Logo removed!'); }
                        }} className="text-xs text-red-600 hover:text-red-800 font-medium">{t('remove_x')}</button>
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
                            const path = `logo-${ed}-${Date.now()}.${ext}`;
                            const { error: upErr } = await supabase.storage.from('cvs').upload(path, file);
                            if (upErr) throw upErr;
                            const { data: { publicUrl } } = supabase.storage.from('cvs').getPublicUrl(path);
                            const { error: dbErr } = await supabase.from('edition_branding').update({ company_logo_url: publicUrl, updated_at: new Date().toISOString() }).eq('edition', ed);
                            if (dbErr) throw dbErr;
                            await loadEditionBranding();
                            alert('Logo uploaded!');
                          } catch(err) { alert('Error: ' + err.message); }
                          e.target.value = '';
                        }} />
                      {t('upload_logo_btn')}
                    </label>
                    <div className="flex gap-3 bg-gray-50 p-2 rounded-lg mt-2">
                      <span className="text-xs text-gray-500 self-center">{t('size_label')}</span>
                      {['small', 'medium', 'large'].map(size => (
                        <label key={size} className="flex items-center gap-1 cursor-pointer">
                          <input type="radio" name={`branding-logo-size-${ed}`} value={size}
                            checked={(branding.company_logo_size || 'medium') === size}
                            onChange={async () => {
                              await supabase.from('edition_branding').update({ company_logo_size: size, updated_at: new Date().toISOString() }).eq('edition', ed);
                              await loadEditionBranding();
                            }}
                            className="w-3 h-3" />
                          <span className="text-xs capitalize">{tSizeLabel(size)}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
        <>
        <div className="mb-4">
          <label className="block text-xs font-medium text-gray-600 mb-1">{t('company_name')}</label>
          <p className="text-xs text-gray-400 mb-2">{t('displayed_below_header')}</p>
          <div className="flex gap-2 mb-2">
            <input type="text" value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="e.g. XYZ Financial Services"
              className="flex-1 p-2 border-2 border-gray-300 rounded-lg text-sm" maxLength={60} />
            <button onClick={async () => {
              const { error } = await supabase.from('app_settings').update({ company_name: companyName }).eq('company_id', effectiveCompanyId);
              if (error) alert(t('generic_error') + ' ' + error.message);
              else alert('Company name saved!');
            }} className="px-3 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700">{t('save')}</button>
            {companyName && (
              <button onClick={async () => {
                setCompanyName('');
                await supabase.from('app_settings').update({ company_name: null }).eq('company_id', effectiveCompanyId);
              }} className="px-3 py-2 bg-gray-400 text-white rounded-lg text-sm hover:bg-gray-500">{t('clear')}</button>
            )}
          </div>
          <div className="flex gap-3 bg-gray-50 p-2 rounded-lg">
            <span className="text-xs text-gray-500 self-center">{t('size_label')}</span>
            {['small', 'medium', 'large'].map(size => (
              <label key={size} className="flex items-center gap-1 cursor-pointer">
                <input type="radio" name="companyNameSize" value={size}
                  checked={companyNameSize === size}
                  onChange={async () => {
                    setCompanyNameSize(size);
                    await supabase.from('app_settings').update({ company_name_size: size }).eq('company_id', effectiveCompanyId);
                  }}
                  className="w-3 h-3" />
                <span className="text-xs capitalize">{tSizeLabel(size)}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">{t('company_logo')}</label>
          <p className="text-xs text-gray-400 mb-2">{t('logo_position_hint')}</p>
          {companyLogoUrl && (
            <div className="mb-3 flex items-center gap-3 p-2 bg-gray-50 rounded-lg border border-gray-200">
              <img src={companyLogoUrl} alt="logo" className="h-10 object-contain border border-gray-200 rounded p-1 bg-white" />
              <span className="text-xs text-gray-500 flex-1">{t('logo_active')}</span>
              <button onClick={async () => {
                const { error } = await supabase.from('app_settings').update({ company_logo_url: null }).eq('company_id', effectiveCompanyId);
                if (!error) { setCompanyLogoUrl(''); alert('Logo removed!'); }
              }} className="text-xs text-red-600 hover:text-red-800 font-medium">{t('remove_x')}</button>
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
                  const { error: dbErr } = await supabase.from('app_settings').update({ company_logo_url: publicUrl }).eq('company_id', effectiveCompanyId);
                  if (dbErr) throw dbErr;
                  setCompanyLogoUrl(publicUrl);
                  alert('Logo uploaded!');
                } catch(err) { alert('Error: ' + err.message); }
                e.target.value = '';
              
              }} />
            {t('upload_logo_btn')}
          </label>
          <p className="text-xs text-gray-400 mt-1">{t('logo_recommendation')}</p>
          <div className="flex gap-3 bg-gray-50 p-2 rounded-lg mt-2">
            <span className="text-xs text-gray-500 self-center">{t('size_label')}</span>
            {['small', 'medium', 'large'].map(size => (
              <label key={size} className="flex items-center gap-1 cursor-pointer">
                <input type="radio" name="companyLogoSize" value={size}
                  checked={companyLogoSize === size}
                  onChange={async () => {
                    setCompanyLogoSize(size);
                    await supabase.from('app_settings').update({ company_logo_size: size }).eq('company_id', effectiveCompanyId);
                  }}
                  className="w-3 h-3" />
                <span className="text-xs capitalize">{tSizeLabel(size)}</span>
              </label>
            ))}
          </div>
        </div>
        </>
        )}
    </div>
  </div>
)}

          


{isAdmin && canManageThisCompany && !(isSeller && !isSellerManagingOwnCompany && companyViewMode !== 'sample') && (!masterMustRespectVisibility || companyMasterVisibility.includes('page_subtitles')) && activeAdminNavTab === 'settings' && (
  <div className="mt-4 bg-blue-50 border-2 border-blue-300 rounded-lg shadow-md p-4 max-w-4xl mx-auto">
    <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
      {t('manage_subtitles_title')}
      {isReadOnlyOrMasterManaging && <span className="text-xs font-normal text-blue-600">{t('read_only_sample')}</span>}
    </h3>
    <div className={`bg-white rounded p-4 ${isReadOnlyOrMasterManaging ? 'pointer-events-none opacity-60' : ''}`}>
      {pageSubtitles.length < 3 && (
      <div className="space-y-2 pb-3 mb-3 border-b border-gray-200">
          <input
            type="text"
            value={newSubtitle.line1}
            onChange={(e) => setNewSubtitle({...newSubtitle, line1: e.target.value})}
            placeholder={t('subtitle_line1_placeholder')}
            className="w-full p-2 border-2 border-gray-300 rounded-lg text-sm"
          />
          <input
            type="text"
            value={newSubtitle.line2}
            onChange={(e) => setNewSubtitle({...newSubtitle, line2: e.target.value})}
            placeholder={t('subtitle_line2_placeholder')}
            className="w-full p-2 border-2 border-gray-300 rounded-lg text-sm"
          />
          <div className="flex flex-wrap gap-3">
            {['corp', 'pro', 'edu'].map(ed => (
              <label key={ed} className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={newSubtitle.editions.includes(ed)}
                  onChange={(e) => {
                    setNewSubtitle(prev => ({
                      ...prev,
                      editions: e.target.checked ? [...prev.editions, ed] : prev.editions.filter(x => x !== ed)
                    }));
                  }}
                />
                <span className="text-sm text-gray-700 capitalize">{ed}</span>
              </label>
            ))}
          </div>
          {newSubtitle.editions.length > 0 && (
            <p className="text-xs text-gray-400 italic">
              {t('subtitle_if_blank_default')} {newSubtitle.editions.map(ed => `${ed.toUpperCase()}: ${t('subtitle_line1_label')} - ${SUBTITLE_DEFAULTS[ed]?.line1} / ${t('subtitle_line2_label')} - ${SUBTITLE_DEFAULTS[ed]?.line2}`).join(' | ')}
            </p>
          )}
          <button
            onClick={addSubtitle}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
          >
            {t('add_subtitle_btn')}
          </button>
        </div>
      )}
      {pageSubtitles.length === 0 && (
        <p className="text-sm text-gray-400 italic mb-4">{t('subtitles_empty_explanation')}</p>
      )}
      {pageSubtitles.length > 0 && (
        <div className="space-y-2 mb-4">
          {pageSubtitles.map(sub => {
            const isEditingThis = editingSubtitle === sub.id;
            return (
            <div key={sub.id} className="p-2 border border-gray-200 rounded-lg">
              {isEditingThis ? (
                <div className="space-y-2">
                  <input
                    type="text"
                    defaultValue={sub.line1}
                    id={`edit-subtitle-line1-${sub.id}`}
                    placeholder={t('subtitle_line1_placeholder')}
                    className="w-full p-2 border-2 border-gray-300 rounded-lg text-sm"
                  />
                  <input
                    type="text"
                    defaultValue={sub.line2 || ''}
                    id={`edit-subtitle-line2-${sub.id}`}
                    placeholder={t('subtitle_line2_placeholder')}
                    className="w-full p-2 border-2 border-gray-300 rounded-lg text-sm"
                  />
                  <div className="flex flex-wrap gap-3">
                    {['corp', 'pro', 'edu'].map(ed => {
                      return (
                        <label key={ed} className="flex items-center gap-1.5 cursor-pointer">
                          <input
                            type="checkbox"
                            id={`edit-subtitle-edition-${sub.id}-${ed}`}
                            checked={editingSubtitleEditions.includes(ed)}
                            onChange={(e) => {
                              setEditingSubtitleEditions(prev =>
                                e.target.checked ? [...prev, ed] : prev.filter(x => x !== ed)
                              );
                            }}
                          />
                          <span className="text-sm text-gray-700 capitalize">{ed}</span>
                        </label>
                      );
                    })}
                  </div>
                  <p className="text-xs text-gray-400 italic">
                    {t('subtitle_overrides_default')} {editingSubtitleEditions.map(ed => `${ed.toUpperCase()}: ${t('subtitle_line1_label')} - ${SUBTITLE_DEFAULTS[ed]?.line1} / ${t('subtitle_line2_label')} - ${SUBTITLE_DEFAULTS[ed]?.line2}`).join(' | ')}
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        const line1 = document.getElementById(`edit-subtitle-line1-${sub.id}`).value;
                        const line2 = document.getElementById(`edit-subtitle-line2-${sub.id}`).value;
                        const editions = editingSubtitleEditions;
                        updateSubtitle(sub.id, line1, line2, editions);
                      }}
                      className="px-3 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700"
                    >
                      {t('save')}
                    </button>
                    <button
                      onClick={() => setEditingSubtitle(null)}
                      className="px-3 py-1 bg-gray-500 text-white rounded text-xs hover:bg-gray-600"
                    >
                      {t('cancel')}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{sub.line1}</p>
                    {sub.line2 && <p className="text-xs text-gray-500 truncate">{sub.line2}</p>}
                    <p className="text-xs text-gray-400 mt-0.5 capitalize">{sub.applicable_editions === 'all' ? t('all_editions') : sub.applicable_editions.replaceAll(',', ', ')}</p>
                    <p className="text-xs text-gray-400 italic mt-0.5">
                      {t('subtitle_overrides_default')} {(sub.applicable_editions || 'corp,pro,edu').split(',').map(ed => `${ed.toUpperCase()}: ${t('subtitle_line1_label')} - ${SUBTITLE_DEFAULTS[ed]?.line1} / ${t('subtitle_line2_label')} - ${SUBTITLE_DEFAULTS[ed]?.line2}`).join(' | ')}
                    </p>
                  </div>
                  <div className="flex gap-2 flex-shrink-0 ml-3">
                    <button
                      onClick={() => {
                        setEditingSubtitle(sub.id);
                        setEditingSubtitleEditions((sub.applicable_editions || 'corp,pro,edu').split(','));
                      }}
                      className="px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700"
                    >
                      {t('edit_content_btn')}
                    </button>
                    <button
                      onClick={() => deleteSubtitle(sub.id)}
                      className="px-2 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700"
                    >
                      {t('delete_trash')}
                    </button>
                  </div>
                </div>
              )}
            </div>
            );
          })}
        </div>
      )}
    </div>
  </div>
)}
          {isAdmin && canManageThisCompany && !(isSeller && !isSellerManagingOwnCompany && companyViewMode !== 'sample') && (!masterMustRespectVisibility || companyMasterVisibility.includes('promotional_videos')) && activeAdminNavTab === 'settings' && (
            <div className="mt-4 bg-purple-50 border-2 border-purple-300 rounded-lg shadow-md p-4 max-w-4xl mx-auto">
              <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                🎬 {t('manage_promotional_videos')}
                {isReadOnlyOrMasterManaging && <span className="text-xs font-normal text-blue-600">{t('read_only_sample')}</span>}
              </h3>
              
              <div className={`bg-white rounded p-4 mb-4 ${isReadOnlyOrMasterManaging ? "pointer-events-none opacity-60" : ""}`}>
                <h4 className="font-medium text-gray-700 mb-3">{t('add_new_item')}</h4>
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
                      <span className="text-sm font-medium">{t('video_mp4_webm')}</span>
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
                      <span className="text-sm font-medium">{t('presentation_pdf')}</span>
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
                      <span className="text-sm font-medium">{t('link_url_option')}</span>
                    </label>
                  </div>

                  {newItemType === 'link' ? (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{t('url_label')}</label>
                        <input
                          type="url"
                          value={newLinkUrl}
                          onChange={(e) => setNewLinkUrl(e.target.value)}
                          placeholder="https://intro.corp.whatidid.app"
                          className="w-full p-2 border-2 border-gray-300 rounded-lg text-sm"
                        />
                      </div>
                    </div>
                  ) : (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {newItemType === 'video' ? t('video_file_label') : t('pdf_file_label')}
                      </label>
                      <input
                        type="file"
                        ref={promoVideoFileInputRef}
                        accept={newItemType === 'video' ? 'video/mp4,video/webm' : '.pdf'}
                        onChange={(e) => {
                          const file = e.target.files[0];
                          setNewVideoFile(file);
                          // Preenche o Name com o nome do arquivo automaticamente,
                          // só se o campo ainda estiver vazio — não sobrescreve
                          // se a pessoa já tiver digitado algo.
                          if (file && !newLinkLabel.trim()) {
                            const nameWithoutExt = file.name.replace(/\.[^/.]+$/, '');
                            setNewLinkLabel(nameWithoutExt);
                          }
                        }}
                        className="w-full p-2 border-2 border-gray-300 rounded-lg text-sm"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        {newItemType === 'video' ? t('supported_mp4_webm') : t('supported_pdf')}
                      </p>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('name_optional')}</label>
                    <input
                      type="text"
                      value={newLinkLabel}
                      onChange={(e) => setNewLinkLabel(e.target.value)}
                      placeholder={newItemType === 'video' ? 'e.g., Intro video (Spanish)' : newItemType === 'presentation' ? 'e.g., Product Overview' : 'Intro'}
                      className="w-full p-2 border-2 border-gray-300 rounded-lg text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('language')}</label>
                    <select
                      value={newItemLanguage}
                      onChange={(e) => setNewItemLanguage(e.target.value)}
                      className="w-full p-2 border-2 border-gray-300 rounded-lg text-sm"
                    >
                      <option value="">{t('all_languages')}</option>
                      <option value="en">English</option>
                      <option value="es">Español</option>
                      <option value="pt">Português</option>
                      <option value="zh">中文</option>
                    </select>
                    <p className="text-xs text-gray-500 mt-1">{t('carousel_language_hint')}</p>
                  </div>

                  {newItemType === 'video' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">{t('duration_example')}</label>
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
                    {uploadingVideo ? t('uploading_ellipsis') : `${t('add_btn_generic')} ${newItemType === 'video' ? t('video_word') : newItemType === 'presentation' ? t('presentation_word') : t('link_word')}`}
                  </button>
                </div>
              </div>

              <div className={`bg-white rounded p-4 ${isReadOnlyOrMasterManaging ? "pointer-events-none opacity-60" : ""}`}>
                <h4 className="font-medium text-gray-700 mb-3">{t('promotional_videos_count_title')} ({promotionalVideos.length})</h4>
                {allPromotionalVideosAdmin.length === 0 ? (
                  <p className="text-sm text-gray-500">{t('no_videos_yet')}</p>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {allPromotionalVideosAdmin.map((video, index) => (
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
                                    {t('save')}
                                  </button>
                                  <button
                                    onClick={() => setEditingVideoDuration({})}
                                    className="px-2 py-1 bg-gray-500 text-white rounded text-xs hover:bg-gray-600"
                                  >
                                    {t('cancel')}
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
                            {editingVideoName[video.id] ? (
                              <div className="flex items-center gap-2 mb-1">
                                <input
                                  type="text"
                                  defaultValue={video.linkLabel || ''}
                                  id={`name-${video.id}`}
                                  className="flex-1 p-1 border border-gray-300 rounded text-sm"
                                  placeholder="e.g., Intro video (Spanish)"
                                />
                                <button
                                  onClick={() => {
                                    const newName = document.getElementById(`name-${video.id}`).value;
                                    updateVideoName(video.id, newName);
                                  }}
                                  className="px-2 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700"
                                >
                                  {t('save')}
                                </button>
                                <button
                                  onClick={() => setEditingVideoName({})}
                                  className="px-2 py-1 bg-gray-500 text-white rounded text-xs hover:bg-gray-600"
                                >
                                  {t('cancel')}
                                </button>
                              </div>
                            ) : (
                              <p className="text-sm font-medium text-gray-800 mb-1">
                                {video.linkLabel || <span className="text-gray-400 italic">{t('no_name_set')}</span>}
                              </p>
                            )}
                            <p className="text-xs text-gray-500 truncate mb-2" title={video.url}>
                              {t('file_label_colon')} {video.url ? decodeURIComponent(video.url.split('/').pop()) : '—'}
                            </p>
                            <div className="flex gap-2 mb-2">
                              <select
                                value={video.visible ? 'show' : 'hide'}
                                onChange={async (e) => {
                                  const { error } = await supabase.from('promotional_videos').update({ visible: e.target.value === 'show' }).eq('id', video.id);
                                  if (error) { alert(t('generic_error') + ' ' + error.message); return; }
                                  await loadPromotionalVideos();
                                }}
                                className={`text-xs px-2 py-1 rounded-full font-medium border-0 ${video.visible ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}
                              >
                                <option value="show">{t('show_in_carousel')}</option>
                                <option value="hide">{t('hide_from_carousel')}</option>
                              </select>
                              <select
                                value={video.language || ''}
                                onChange={async (e) => {
                                  const { error } = await supabase.from('promotional_videos').update({ language: e.target.value || null }).eq('id', video.id);
                                  if (error) { alert(t('generic_error') + ' ' + error.message); return; }
                                  await loadPromotionalVideos();
                                }}
                                className="text-xs px-2 py-1 rounded-full font-medium border-0 bg-blue-50 text-blue-700"
                                title={t('which_language_item_appears')}
                              >
                                <option value="">{t('all_languages')}</option>
                                <option value="en">English</option>
                                <option value="es">Español</option>
                                <option value="pt">Português</option>
                                <option value="zh">中文</option>
                              </select>
                              <div className="flex items-center gap-1.5" title={t('which_edition_item_appears')}>
                                {['corp', 'pro', 'edu'].map(ed => {
                                  const currentList = video.edition == null ? ['corp', 'pro', 'edu'] : video.edition.split(',').filter(Boolean);
                                  const isChecked = currentList.includes(ed);
                                  return (
                                    <label key={ed} className="flex items-center gap-0.5 text-xs px-1.5 py-1 rounded-full font-medium bg-amber-50 text-amber-700 cursor-pointer">
                                      <input
                                        type="checkbox"
                                        checked={isChecked}
                                        onChange={async (e) => {
                                          const newList = e.target.checked ? [...currentList, ed] : currentList.filter(x => x !== ed);
                                          const newValue = newList.length === 3 ? null : newList.join(',');
                                          const { error } = await supabase.from('promotional_videos').update({ edition: newValue }).eq('id', video.id);
                                          if (error) { alert(t('generic_error') + ' ' + error.message); return; }
                                          await loadPromotionalVideos();
                                        }}
                                        className="w-3 h-3"
                                      />
                                      {ed}
                                    </label>
                                  );
                                })}
                              </div>
                            </div>
                            
                            {/* Botões de ação */}
                            <div className="flex gap-2 flex-wrap">
                              <button
                                onClick={() => setEditingVideoName({ [video.id]: true })}
                                className="px-2 py-1 bg-indigo-600 text-white rounded text-xs hover:bg-indigo-700"
                              >
                                {t('edit_pencil')}
                              </button>
                              <button
                                onClick={() => moveVideoUp(index)}
                                disabled={index === 0}
                                className="px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 disabled:opacity-30 disabled:cursor-not-allowed"
                              >
                                {t('up_arrow')}
                              </button>
                              <button
                                onClick={() => moveVideoDown(index)}
                                disabled={index === allPromotionalVideosAdmin.length - 1}
                                className="px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 disabled:opacity-30 disabled:cursor-not-allowed"
                              >
                                {t('down_arrow')}
                              </button>
                              <button
                                onClick={() => {
                                  if (window.confirm(t('confirm_delete_video'))) {
                                    deletePromotionalVideo(video.id);
                                  }
                                }}
                                className="px-2 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700"
                              >
                                {t('delete_trash')}
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
          {isAdmin && canManageThisCompany && !(isSeller && !isSellerManagingOwnCompany && companyViewMode !== 'sample') && (!masterMustRespectVisibility || companyMasterVisibility.includes('quotes')) && activeAdminNavTab === 'settings' && (
            <div className="mt-4 bg-green-50 border-2 border-green-300 rounded-lg shadow-md p-4 max-w-4xl mx-auto">
              <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <MessageCircle size={20} />
                {t('manage_inspirational_quotes')}
                {isReadOnlyOrMasterManaging && <span className="text-xs font-normal text-blue-600">{t('read_only_sample')}</span>}
              </h3>

              <div className={isReadOnlyOrMasterManaging ? 'pointer-events-none opacity-60' : ''}>
      {/* Show Marquee */}
      <div className="flex items-center gap-3">
        <input type="checkbox" id="showMarquee" checked={appSettings.showMarquee}
          onChange={async (e) => {
            setAppSettings({...appSettings, showMarquee: e.target.checked});
            await supabase.from('app_settings').update({ show_marquee: e.target.checked }).eq('company_id', effectiveCompanyId);
          }} className="w-5 h-5" />
        <label htmlFor="showMarquee" className="text-sm font-medium text-gray-700 cursor-pointer">{t('show_inspirational_quotes')}</label>
      </div>
              
              <div className="bg-white rounded p-4 mb-4">
                <h4 className="font-medium text-gray-700 mb-3">{t('add_new_quote')}</h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('quote_text')}</label>
                    <textarea
                      value={newQuote.text}
                      onChange={(e) => setNewQuote({...newQuote, text: e.target.value})}
                      placeholder={t('enter_quote_placeholder')}
                      className="w-full p-2 border-2 border-gray-300 rounded-lg resize-none"
                      rows="3"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('author')} {newQuote.position === 'top' && <span className="text-gray-500 font-normal">{t('optional_for_top')}</span>}
                    </label>
                    <input
                      type="text"
                      value={newQuote.author}
                      onChange={(e) => setNewQuote({...newQuote, author: e.target.value})}
                      placeholder={t('author_name_placeholder')}
                      className="w-full p-2 border-2 border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('position')}</label>
                    <select
                      value={newQuote.position}
                      onChange={(e) => setNewQuote({...newQuote, position: e.target.value})}
                      className="w-full p-2 border-2 border-gray-300 rounded-lg"
                    >
                      <option value="top">{t('top_above_top3')}</option>
                      <option value="bottom">{t('bottom_below_top3')}</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('applicable_editions_label')}</label>
                    <div className="flex flex-wrap gap-3">
                      {['corp', 'pro', 'edu'].map(ed => (
                        <label key={ed} className="flex items-center gap-1.5 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={newQuote.editions.includes(ed)}
                            onChange={(e) => {
                              setNewQuote(prev => ({
                                ...prev,
                                editions: e.target.checked ? [...prev.editions, ed] : prev.editions.filter(x => x !== ed)
                              }));
                            }}
                          />
                          <span className="text-sm text-gray-700 capitalize">{ed}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <button
                    onClick={addQuote}
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                  >
                    {t('add_quote_btn')}
                  </button>
                </div>
              </div>

              <div className="bg-white rounded p-4">
                <h4 className="font-medium text-gray-700 mb-3">{t('existing_quotes_title')} ({quotes.length})</h4>
                {quotes.length === 0 ? (
                  <p className="text-sm text-gray-500">{t('no_quotes_yet')}</p>
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
                              <option value="top">{t('top_above_top3')}</option>
                              <option value="bottom">{t('bottom_below_top3')}</option>
                            </select>
                            <div className="flex flex-wrap gap-3 p-2 border-2 border-gray-300 rounded">
                              {['corp', 'pro', 'edu'].map(ed => {
                                const currentList = (quote.edition || 'corp,pro,edu').split(',');
                                return (
                                  <label key={ed} className="flex items-center gap-1.5 cursor-pointer">
                                    <input type="checkbox" id={`edit-edition-${quote.id}-${ed}`} defaultChecked={currentList.includes(ed)} />
                                    <span className="text-sm text-gray-700 capitalize">{ed}</span>
                                  </label>
                                );
                              })}
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => {
                                  const text = document.getElementById(`edit-text-${quote.id}`).value;
                                  const author = document.getElementById(`edit-author-${quote.id}`).value;
                                  const position = document.getElementById(`edit-position-${quote.id}`).value;
                                  const editions = ['corp', 'pro', 'edu'].filter(ed => document.getElementById(`edit-edition-${quote.id}-${ed}`).checked);
                                  if (editions.length === 0) { alert(t('select_at_least_one_edition')); return; }
                                  updateQuote(quote.id, text, author, position, editions.join(','));
                                }}
                                className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                              >
                                {t('save')}
                              </button>
                              <button
                                onClick={() => setEditingQuote(null)}
                                className="px-3 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600"
                              >
                                {t('cancel')}
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
                            <p className="text-xs text-gray-600 mb-1">— {quote.author}</p>
                            <p className="text-xs text-indigo-600 mb-2 capitalize">
                              {(quote.edition || 'corp,pro,edu').split(',').join(' · ')}
                            </p>
                            <div className="flex gap-2">
                              <button
                                onClick={() => setEditingQuote(quote.id)}
                                className="px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => {
                                  if (window.confirm(t('confirm_delete_quote'))) {
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
            </div>
          )}
          {isAdmin && canManageThisCompany && !(isSeller && !isSellerManagingOwnCompany && companyViewMode !== 'sample') && (!masterMustRespectVisibility || companyMasterVisibility.includes('content_pages')) && activeAdminNavTab === 'settings' && (
            <div className="mt-4 bg-blue-50 border-2 border-blue-300 rounded-lg shadow-md p-4 max-w-4xl mx-auto">
              <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <MessageCircle size={20} />
                {t('manage_content_pages')}
                <span className="text-xs font-normal text-blue-600">
                  {t('editing_in_language')} {{en:'English',es:'Español',pt:'Português',zh:'中文'}[effectiveViewingLanguage] || effectiveViewingLanguage}
                </span>
                {isReadOnlyOrMasterManaging && <span className="text-xs font-normal text-blue-600">{t('read_only_sample')}</span>}
              </h3>

              <div className={`space-y-6 ${isReadOnlyOrMasterManaging ? 'pointer-events-none opacity-60' : ''}`}>
                {['community_guidelines', 'how_it_works', 'about'].map(pageKey => {
                  const pageKeyLabels = { community_guidelines: t('community_guidelines_nav'), how_it_works: t('how_it_works_nav'), about: t('about_nav') };
                  const entries = allContentPagesByKey[pageKey] || [];
                  return (
                    <div key={pageKey} className="bg-white rounded p-4">
                      <h4 className="font-medium text-gray-700 mb-3">{pageKeyLabels[pageKey]}</h4>

                      {entries.length === 0 && (
                        <p className="text-sm text-gray-400 italic mb-3">{t('not_set_up_yet')}</p>
                      )}

                      <div className="space-y-3 mb-3">
                        {entries.map(entry => {
                          const isEditingThis = editingContent.key === pageKey && editingContent.id === entry.id;
                          return (
                            <div key={entry.id} className="border border-gray-200 rounded-lg p-3">
                              {isEditingThis ? (
                                <div className="space-y-3">
                                  <textarea
                                    value={editingContent.content}
                                    onChange={(e) => setEditingContent({ ...editingContent, content: e.target.value })}
                                    className="w-full p-3 border-2 border-gray-300 rounded-lg resize-none font-mono text-sm"
                                    rows="15"
                                    placeholder={t('enter_content_markdown')}
                                  />
                                  <div className="text-xs text-gray-600 mb-2">
                                    <strong>{t('markdown_tips')}</strong> {t('markdown_tips_text')}
                                  </div>
                                  <div className="flex flex-wrap gap-3">
                                    {['corp', 'pro', 'edu'].map(ed => (
                                      <label key={ed} className="flex items-center gap-1.5 cursor-pointer">
                                        <input
                                          type="checkbox"
                                          checked={(editingContent.editions || []).includes(ed)}
                                          onChange={(e) => {
                                            setEditingContent(prev => ({
                                              ...prev,
                                              editions: e.target.checked ? [...(prev.editions || []), ed] : (prev.editions || []).filter(x => x !== ed)
                                            }));
                                          }}
                                        />
                                        <span className="text-sm text-gray-700 capitalize">{ed}</span>
                                      </label>
                                    ))}
                                  </div>
                                  <div className="flex gap-2">
                                    <button
                                      onClick={() => updateContentPageEntry(entry.id, editingContent.content, editingContent.editions)}
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
                                <>
                                  <p className="text-sm text-gray-600 mb-2">{entry.content.substring(0, 200)}...</p>
                                  <p className="text-xs text-indigo-600 mb-2 capitalize">
                                    {(entry.applicable_editions || 'corp,pro,edu').split(',').join(' · ')}
                                  </p>
                                  <div className="flex gap-2">
                                    <button
                                      onClick={() => setEditingContent({ key: pageKey, id: entry.id, content: entry.content, editions: (entry.applicable_editions || 'corp,pro,edu').split(',') })}
                                      className="px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700"
                                    >
                                      {t('edit_content_btn')}
                                    </button>
                                    <button
                                      onClick={() => deleteContentPageEntry(entry.id)}
                                      className="px-3 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700"
                                    >
                                      {t('delete_trash')}
                                    </button>
                                  </div>
                                </>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {newContentEntry.pageKey === pageKey ? (
                        <div className="space-y-3 border-t pt-3">
                          <textarea
                            value={newContentEntry.content}
                            onChange={(e) => setNewContentEntry({ ...newContentEntry, content: e.target.value })}
                            className="w-full p-3 border-2 border-gray-300 rounded-lg resize-none font-mono text-sm"
                            rows="15"
                            placeholder={t('enter_content_markdown')}
                          />
                          <div className="flex flex-wrap gap-3">
                            {['corp', 'pro', 'edu'].map(ed => (
                              <label key={ed} className="flex items-center gap-1.5 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={newContentEntry.editions.includes(ed)}
                                  onChange={(e) => {
                                    setNewContentEntry(prev => ({
                                      ...prev,
                                      editions: e.target.checked ? [...prev.editions, ed] : prev.editions.filter(x => x !== ed)
                                    }));
                                  }}
                                />
                                <span className="text-sm text-gray-700 capitalize">{ed}</span>
                              </label>
                            ))}
                          </div>
                          <div className="flex gap-2">
                            <button onClick={addContentPageEntry} className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
                              {t('add_subtitle_btn')}
                            </button>
                            <button
                              onClick={() => setNewContentEntry({ pageKey: '', content: '', editions: ['corp', 'pro', 'edu'] })}
                              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                            >
                              {t('cancel')}
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => setNewContentEntry({ pageKey, content: '', editions: ['corp', 'pro', 'edu'] })}
                          className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm hover:bg-blue-200"
                        >
                          {t('add_subtitle_btn')}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>


       

{isAdmin && canManageThisCompany && !(isSeller && !isSellerManagingOwnCompany && companyViewMode !== 'sample') && (!masterMustRespectVisibility || companyMasterVisibility.includes('synthetic') || canBootstrapFirstAdmin) && activeAdminNavTab === 'settings' && (
  <div className="mt-4 bg-slate-50 border-2 border-slate-300 rounded-lg shadow-md p-4 max-w-4xl mx-auto">
    <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
      👥 {t('manage_employees')}
    </h3>

    {showDefaultOnlyTools && (
      <div className="flex items-center gap-3 mb-4">
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
              .eq('company_id', effectiveCompanyId);
            
            if (error) {
              alert('Error updating setting');
              console.error(error);
            } else {
              alert(tAlert('employee_login_toggled', { state: e.target.checked ? 'enabled' : 'disabled' }));
            }
          }}
          className="w-5 h-5"
        />
        <label htmlFor="employeeLogin" className="text-sm font-medium text-gray-700 cursor-pointer">
          {t('require_employee_id')}
        </label>
      </div>
    )}

    {/* Add Employee */}
    {(!isReadOnlyOrMasterManaging || canBootstrapFirstAdmin) && (
    <div className="bg-white rounded p-4 mb-4">
      <h4 className="font-medium text-gray-700 mb-3">{t('add_employee')}</h4>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
        <input type="text" value={newEmployee.employee_id} onChange={(e) => setNewEmployee({...newEmployee, employee_id: e.target.value})}
          placeholder={t('employee_id_star')} className="p-2 border-2 border-gray-300 rounded-lg text-sm" />
        <input type="text" value={newEmployee.name} onChange={(e) => setNewEmployee({...newEmployee, name: e.target.value})}
          placeholder={t('full_name_star')} className="p-2 border-2 border-gray-300 rounded-lg text-sm" />
        <input type="text" value={newEmployee.country} onChange={(e) => setNewEmployee({...newEmployee, country: e.target.value})}
          placeholder={t('country')} className="p-2 border-2 border-gray-300 rounded-lg text-sm" />
        <input type="email" value={newEmployee.email} onChange={(e) => setNewEmployee({...newEmployee, email: e.target.value})}
          placeholder={t('corporate_email')} className="p-2 border-2 border-gray-300 rounded-lg text-sm" />
      </div>
      <label className="flex items-center gap-2 mb-3 text-sm text-gray-700 cursor-pointer">
        <input type="checkbox" checked={newEmployee.is_admin} onChange={(e) => setNewEmployee({...newEmployee, is_admin: e.target.checked})}
          className="w-4 h-4" />
        {t('is_admin_hint')}
      </label>
      <div className="flex gap-2 flex-wrap">
        <button onClick={addEmployee} className="px-4 py-2 bg-slate-600 text-white rounded-lg text-sm hover:bg-slate-700">
          {t('add_employee_btn')}
        </button>
        <label className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 cursor-pointer">
          {t('import_excel_btn')}
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
            } catch(err) { alert(t('error_exporting') + ' ' + err.message); }
          }}
          className="px-4 py-2 bg-gray-600 text-white rounded-lg text-sm hover:bg-gray-700"
        >
          {t('export_excel_btn')}
        </button>
        <span className="text-xs text-gray-500 self-center">{t('excel_columns_employee_full')}</span>
      </div>
    </div>
    )}

    {/* Search + List */}
    <div className="bg-white rounded p-4">
      <div className="flex items-center gap-3 mb-3">
        <h4 className="font-medium text-gray-700">{t('search_employees_title')} ({employees.length})</h4>
        <input type="text" value={employeeSearch} onChange={(e) => setEmployeeSearch(e.target.value)}
          placeholder={t('search_by_id_name_email')} className="flex-1 p-2 border-2 border-gray-200 rounded-lg text-sm" />
      </div>
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {employees.filter(emp => {
          const q = employeeSearch.toLowerCase();
          return !q || emp.employee_id?.toLowerCase().includes(q) || emp.name?.toLowerCase().includes(q) || emp.email?.toLowerCase().includes(q);
        }).sort((a, b) => {
          // Admin (de verdade, não Seller) -> Seller -> Outros
          const rank = (e) => (e.is_admin && !e.is_seller) ? 0 : e.is_seller ? 1 : 2;
          return rank(a) - rank(b);
        }).map(emp => (
          <div key={emp.employee_id} className="flex items-center gap-2 p-2 border border-gray-200 rounded-lg flex-wrap">
            {editingEmployee === emp.employee_id ? (
              <>
                <span className="text-xs font-bold text-gray-500 w-20 shrink-0">{emp.employee_id}</span>
                <input type="text" defaultValue={emp.name} onChange={(e) => setEditingEmployeeData({...editingEmployeeData, name: e.target.value})}
                  className="flex-1 min-w-24 p-1 border border-gray-300 rounded text-sm" placeholder={t('name_placeholder')} />
                <input type="text" defaultValue={emp.country} onChange={(e) => setEditingEmployeeData({...editingEmployeeData, country: e.target.value})}
                  className="flex-1 min-w-20 p-1 border border-gray-300 rounded text-sm" placeholder={t('country')} />
                <input type="email" defaultValue={emp.email} onChange={(e) => setEditingEmployeeData({...editingEmployeeData, email: e.target.value})}
                  className="flex-1 min-w-32 p-1 border border-gray-300 rounded text-sm" placeholder={t('email')} />
                <label className="flex items-center gap-1 text-xs text-gray-600 shrink-0">
                  <input type="checkbox" defaultChecked={emp.is_admin} onChange={(e) => setEditingEmployeeData({...editingEmployeeData, is_admin: e.target.checked})} />
                  {t("admin_label_short")}
                </label>
                <select defaultValue={emp.status || 'pending'} onChange={(e) => setEditingEmployeeData({...editingEmployeeData, status: e.target.value})}
                  className="text-xs p-1 border border-gray-300 rounded shrink-0">
                  <option value="pending">{t('pending')}</option>
                  <option value="active">{t('active')}</option>
                  <option value="blocked">{t('blocked')}</option>
                </select>
                <button onClick={() => updateEmployee(emp.employee_id)} className="px-2 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700">{t('save')}</button>
                <button onClick={() => { setEditingEmployee(null); setEditingEmployeeData({}); }} className="px-2 py-1 bg-gray-400 text-white rounded text-xs">{t('cancel')}</button>
              </>
            ) : (
              <>
                <span className="text-xs font-bold text-gray-500 w-20 shrink-0">{emp.employee_id}</span>
                <span className="text-sm text-gray-700 flex-1 min-w-24">{emp.name}</span>
                <span className="text-xs text-gray-500 min-w-16">{emp.country}</span>
                <span className="text-xs text-gray-500 flex-1 min-w-32 truncate">{emp.email}</span>
                {emp.is_admin && !emp.is_seller && (
                  <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-purple-100 text-purple-700">
                    {t('admin_badge')}
                  </span>
                )}
                {emp.is_seller && (
                  <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-teal-100 text-teal-700">
                    {t('seller_badge')}
                  </span>
                )}
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${emp.status === 'active' ? 'bg-green-100 text-green-700' : emp.status === 'blocked' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                  {emp.status === 'active' ? t('status_active_badge') : emp.status === 'blocked' ? t('status_blocked_badge') : t('status_pending_badge')}
                </span>
                {!isReadOnlyOrMasterManaging && (
                <>
                <button onClick={() => { setEditingEmployee(emp.employee_id); setEditingEmployeeData({ name: emp.name, country: emp.country, email: emp.email, is_admin: emp.is_admin, status: emp.status || 'pending' }); }}
                  className="px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700">{t('edit')}</button>
                <button onClick={async () => {
                  if (!window.confirm(tConfirm('delete_all_by_employee', { id: emp.employee_id }))) return;
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
                    alert(tAlert('all_data_cleared_for', { id: emp.employee_id }));
                  } catch (error) {
                    console.error('Error clearing data:', error);
                    alert('Error clearing data: ' + error.message);
                  }
                }} className="px-2 py-1 bg-orange-600 text-white rounded text-xs hover:bg-orange-700">{t('clear_data')}</button>
                <button onClick={() => deleteEmployee(emp.employee_id)}
                  className="px-2 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700">{t('delete')}</button>
                </>
                )}
              </>
            )}
          </div>
        ))}
        {employees.length === 0 && <p className="text-sm text-gray-500 text-center py-4">{t('no_employees_yet')}</p>}
      </div>
    </div>
  </div>
)}

{isAdmin && canManageThisCompany && !(isSeller && !isSellerManagingOwnCompany && companyViewMode !== 'sample') && (!masterMustRespectVisibility || companyMasterVisibility.includes('app_config')) && activeAdminNavTab === 'settings' && (
  <div className="mt-4 bg-indigo-50 border-2 border-indigo-300 rounded-lg shadow-md p-4 max-w-4xl mx-auto">
    <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
      {t('app_configuration_title')}
      {isReadOnlyOrMasterManaging && <span className="text-xs font-normal text-blue-600">{t('read_only_sample')}</span>}
    </h3>
    
    <div className={`bg-white rounded p-4 space-y-4 ${isReadOnlyOrMasterManaging ? 'pointer-events-none opacity-60' : ''}`}>
      {showDefaultOnlyTools && (
      <>
      
{showDefaultOnlyTools && (
  <div className="border-2 border-dashed border-indigo-300 rounded-lg p-3">
    <label className="block text-sm font-semibold text-gray-700 mb-2">{t('attachment_type_suggestions_title')}</label>
    <div className="space-y-2">
      {['corp', 'pro', 'edu'].map(ed => (
        <div key={ed} className="flex items-center gap-3">
          <span className="text-sm font-medium text-gray-600 w-14 capitalize">{ed}</span>
          <select
            value={editionDefaults[ed]?.upload_mode || 'cv'}
            onChange={async (e) => {
              const { error } = await supabase
                .from('edition_defaults')
                .update({ upload_mode: e.target.value, updated_at: new Date().toISOString() })
                .eq('edition', ed);
              if (error) { alert('Error updating edition_defaults'); console.error(error); return; }
              await loadEditionDefaults();
            }}
            className="p-1.5 border-2 border-gray-300 rounded-lg text-sm flex-1"
          >
            <option value="none">{t('no_uploads_option')}</option>
            <option value="cv">{t('doc_type_cv_neutral')}</option>
            <option value="other">{t('doc_type_other_neutral')}</option>
            </select>
        </div>
      ))}
    </div>
  </div>
)}

{/* 3. Upload Documents — dropdown único (Sem Upload / CV / Outros),
    substitui o antigo checkbox + rádios separados. Não faz sentido pro
    próprio Default (ele não é uma empresa real recebendo uploads) — só
    aparece pra empresas de verdade. */}
{!showDefaultOnlyTools && (
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">{t('document_type_label')}</label>
        <select
          value={!appSettings.allowCvUpload ? 'none' : appSettings.documentType}
          onChange={async (e) => {
            const mode = e.target.value;
            const allowCvUpload = mode !== 'none';
            const documentType = mode === 'none' ? appSettings.documentType : mode;
            const newSettings = {...appSettings, allowCvUpload, documentType};
            setAppSettings(newSettings);
            const { error } = await supabase
              .from('app_settings')
              .update({ allow_cv_upload: allowCvUpload, document_type: documentType })
              .eq('company_id', effectiveCompanyId);
            if (error) { alert(t('error_updating_doc_type')); console.error(error); return; }
          }}
          className="w-full p-2 border-2 border-gray-300 rounded-lg text-sm"
        >
          <option value="none">{t('no_uploads_option')}</option>
          <option value="cv">{t('doc_type_cv_neutral')}</option>
          <option value="other">{t('doc_type_other_neutral')}</option>
        </select>
        {!showDefaultOnlyTools && editionDefaults[companyEdition] && (
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span>{t('default_suggests')} {
              editionDefaults[companyEdition]?.upload_mode === 'none' ? t('no_uploads_option')
              : editionDefaults[companyEdition]?.upload_mode === 'other' ? t('doc_type_other_neutral')
              : t('doc_type_cv_neutral')
            }</span>
            <button
              onClick={async () => {
                const suggestion = editionDefaults[companyEdition];
                if (!suggestion) return;
                const mode = suggestion.upload_mode || 'cv';
                const allowCvUpload = mode !== 'none';
                const documentType = mode === 'none' ? 'cv' : mode;
                const newSettings = {...appSettings, allowCvUpload, documentType};
                setAppSettings(newSettings);
                const { error } = await supabase
                  .from('app_settings')
                  .update({ allow_cv_upload: allowCvUpload, document_type: documentType })
                  .eq('company_id', effectiveCompanyId);
                if (error) { alert('Error updating setting'); console.error(error); return; }
                alert(t('app_config_copied'));
              }}
              className="px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded text-xs font-medium hover:bg-indigo-200"
            >
              {t('use_default_suggestion')}
            </button>
          </div>
        )}
      </div>
)}
      </>
      )}

      {/* Show Top 3 */}
      <div className="flex items-center gap-3">
        <input type="checkbox" id="showTop3" checked={appSettings.showTop3}
          onChange={async (e) => {
            setAppSettings({...appSettings, showTop3: e.target.checked});
            await supabase.from('app_settings').update({ show_top3: e.target.checked }).eq('company_id', effectiveCompanyId);
          }} className="w-5 h-5" />
        <label htmlFor="showTop3" className="text-sm font-medium text-gray-700 cursor-pointer">{t('show_top3_experiences')}</label>
      </div>

      {appSettings.showTop3 && (
        <div className="ml-8 flex items-center gap-3">
          <input type="checkbox" id="top3StartVisible" checked={appSettings.top3StartVisible}
            onChange={async (e) => {
              setAppSettings({...appSettings, top3StartVisible: e.target.checked});
              setTop3VisibleInSession(e.target.checked);
              await supabase.from('app_settings').update({ top3_start_visible: e.target.checked }).eq('company_id', effectiveCompanyId);
            }} className="w-4 h-4" />
          <label htmlFor="top3StartVisible" className="text-xs text-gray-600 cursor-pointer">{t('start_visible_top3')}</label>
        </div>
      )}



    </div>
  </div>
)}

{isAdmin && canManageThisCompany && !(isSeller && !isSellerManagingOwnCompany && companyViewMode !== 'sample') && (!masterMustRespectVisibility || companyMasterVisibility.includes('metadata')) && activeAdminNavTab === 'settings' && (
  <div className="mt-4 bg-teal-50 border-2 border-teal-300 rounded-lg shadow-md p-4 max-w-4xl mx-auto">
    <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
      {t('manage_problem_categories')}
      {isReadOnlyOrMasterManaging && <span className="text-xs font-normal text-blue-600">{t('read_only_sample')}</span>}
    </h3>

    <div className="">
    {/* Practice selector + New Practice */}
    <div className="bg-white rounded p-4 mb-4">
      <div className="flex items-center gap-3 mb-4">
        <label className="text-sm font-medium text-gray-700 whitespace-nowrap">{t('function_practice_colon')}</label>
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
              disabled={isReadOnlyOrMasterManaging}
              onChange={async (e) => {
                const { error } = await supabase
                  .from('practices')
                  .update({ show_in_ui: e.target.checked })
                  .eq('id', selectedPracticeId);
                if (error) { alert(t('error_updating_practice') + ' ' + error.message); return; }
                await loadPractices();
              }}
              className="w-4 h-4"
            />
            <span className="text-sm text-gray-700">{t('show_in_ui')}</span>
          </label>
        )}
        <button
          onClick={() => {
            setNewPracticeName('');
            setNewPracticeEditions(['corp', 'pro']);
            setShowNewPracticeForm(true);
          }}
          disabled={isReadOnlyOrMasterManaging}
          className={`px-3 py-2 bg-teal-600 text-white rounded-lg text-sm hover:bg-teal-700 whitespace-nowrap ${isReadOnlyOrMasterManaging ? 'opacity-40 cursor-not-allowed' : ''}`}
        >{t('new_practice_btn')}</button>
        {showNewPracticeForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">{t('new_practice_btn')}</h3>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('new_practice_name_label')}</label>
              <input
                type="text"
                value={newPracticeName}
                onChange={(e) => setNewPracticeName(e.target.value)}
                autoFocus
                className="w-full p-2 border-2 border-gray-300 rounded-lg text-sm mb-4"
              />
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('applicable_editions_label')}</label>
              <div className="flex flex-wrap gap-3 mb-6">
                {['corp', 'pro', 'edu'].map(ed => (
                  <label key={ed} className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newPracticeEditions.includes(ed)}
                      onChange={(e) => {
                        setNewPracticeEditions(prev =>
                          e.target.checked ? [...prev, ed] : prev.filter(x => x !== ed)
                        );
                      }}
                    />
                    <span className="text-sm text-gray-700 capitalize">{ed}</span>
                  </label>
                ))}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowNewPracticeForm(false)}
                  className="flex-1 px-3 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm hover:bg-gray-300"
                >{t('cancel')}</button>
                <button
                  onClick={async () => {
                    const name = newPracticeName.trim();
                    if (!name) return;
                    if (newPracticeEditions.length === 0) { alert(t('select_at_least_one_edition')); return; }
                    const maxOrder = practices.length > 0 ? Math.max(...practices.map(p => p.display_order || 0)) : 0;
                    const { data, error } = await supabase
                      .from('practices')
                      .insert([{
                        name, show_in_ui: true, display_order: maxOrder + 1, active: true,
                        company_id: effectiveCompanyId, language: effectiveViewingLanguage,
                        applicable_editions: newPracticeEditions.join(',')
                      }])
                      .select();
                    if (error) { alert(t('error_creating_practice') + ' ' + error.message); return; }
                    await loadPractices();
                    if (data && data[0]) {
                      setSelectedPracticeId(data[0].id);
                      loadProblemCategories(data[0].id);
                    }
                    setShowNewPracticeForm(false);
                    alert(tAlert('practice_created_named', { name }));
                  }}
                  className="flex-1 px-3 py-2 bg-teal-600 text-white rounded-lg text-sm hover:bg-teal-700"
                >{t('create_practice_btn')}</button>
              </div>
            </div>
          </div>
        )}
        {selectedPracticeId && practices.find(p => p.id === selectedPracticeId)?.name !== 'General' && (
          <button
            onClick={async () => {
              const practice = practices.find(p => p.id === selectedPracticeId);
              if (!window.confirm(tConfirm('delete_practice_keep_categories', { name: practice?.name }))) return;
              const { error } = await supabase
                .from('practices')
                .update({ active: false })
                .eq('id', selectedPracticeId);
              if (error) { alert('Error deleting practice'); return; }
              await loadPractices();
              setSelectedPracticeId(practices[0]?.id || null);
              loadProblemCategories(practices[0]?.id || null);
            }}
            disabled={isReadOnlyOrMasterManaging}
            className={`px-3 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 whitespace-nowrap ${isReadOnlyOrMasterManaging ? 'opacity-40 cursor-not-allowed' : ''}`}
          >{t('delete_practice')}</button>
        )}
      </div>
    </div>

    <div className={`bg-white rounded p-4 mb-4 ${isReadOnlyOrMasterManaging ? 'pointer-events-none opacity-40' : ''}`}>
      <h4 className="font-medium text-gray-700 mb-3">{t('add_new_category')}</h4>
      <div className="flex gap-2 mb-3">
        <input
          type="text"
          value={newCategoryName}
          onChange={(e) => setNewCategoryName(e.target.value)}
          placeholder={t('category_name_placeholder')}
          className="flex-1 p-2 border-2 border-gray-300 rounded-lg text-sm"
          onKeyPress={(e) => e.key === 'Enter' && newCategoryName.trim() && (async () => {
            const maxOrder = adminCategories.length;
            const { error } = await supabase.from('problem_categories').insert([{ name: newCategoryName.trim(), display_order: maxOrder + 1, active: true, practice_id: selectedPracticeId, company_id: effectiveCompanyId, language: effectiveViewingLanguage }]);
            if (!error) { setNewCategoryName(''); await loadAdminCategories(selectedPracticeId); await loadProblemCategories(selectedPracticeId); }
            else alert(t('error_adding_category'));
          })()}
        />
        <button
          onClick={async () => {
            if (!newCategoryName.trim()) return;
            const maxOrder = adminCategories.length;
            const { error } = await supabase.from('problem_categories').insert([{ name: newCategoryName.trim(), display_order: maxOrder + 1, active: true, practice_id: selectedPracticeId, company_id: effectiveCompanyId, language: effectiveViewingLanguage }]);
            if (!error) { setNewCategoryName(''); await loadAdminCategories(selectedPracticeId); await loadProblemCategories(selectedPracticeId); }
            else alert(t('error_adding_category'));
          }}
          className="px-4 py-2 bg-teal-600 text-white rounded-lg text-sm hover:bg-teal-700"
        >{t('add_btn_generic')}</button>
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
            } catch(err) { alert(t('error_exporting') + ' ' + err.message); }
          }}
          className="px-3 py-1.5 bg-gray-600 text-white rounded-lg text-xs hover:bg-gray-700 flex items-center gap-1"
        >{t('export_excel_btn')}</button>

        {/* Import */}
        <label className="px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs hover:bg-green-700 cursor-pointer flex items-center gap-1">
          {t('import_excel_btn2')}
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
const { data: allCats } = await supabase.from('problem_categories').select('*').eq('active', true).eq('company_id', effectiveCompanyId);

for (const row of rows) {
  const practiceName = String(row['Practice'] || row['Práctica'] || row['Prática'] || row['职能/领域'] || '').trim();
  const catName = String(row['Category'] || row['Categoría'] || row['Categoria'] || row['分类'] || '').trim();
  const desc = String(row['Description'] || row['Descripción'] || row['Descrição'] || row['描述'] || '').trim();
  const tagsRaw = String(row['Tags'] || row['Etiquetas'] || row['标签'] || '').trim();
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
      display_order: maxOrder + 1, active: true, practice_id: practiceId,
      company_id: effectiveCompanyId, language: effectiveViewingLanguage
    }]);
    if (error) { errors++; } else { added++; }
  }
}
              } catch(err) { alert(t('error_during_import') + ' ' + err.message); }
              e.target.value = '';
            }}
          />
        </label>
        <span className="text-xs text-gray-400 self-center">{t('excel_columns_practice_full')}</span>
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
                    placeholder={t('category_name_placeholder_short')}
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
                  >{t('save')}</button>
                  <button onClick={() => setEditingCategory(null)} className="px-2 py-1 bg-gray-400 text-white rounded text-xs hover:bg-gray-500">{t('cancel')}</button>
                </div>
              </div>
            ) : (
              <>
                <button
                    onClick={async () => {
                      if (isReadOnlyOrMasterManaging || index === 0) return;
                      await supabase.from('problem_categories').update({ display_order: index }).eq('name', cat.name);
                      await supabase.from('problem_categories').update({ display_order: index + 1 }).eq('name', adminCategories[index - 1].name);
                      await loadAdminCategories(selectedPracticeId);
                    }}
                    disabled={isReadOnlyOrMasterManaging || index === 0}
                    className="px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 disabled:opacity-30 disabled:cursor-not-allowed"
                  >{t('up_arrow')}</button>
                  <button
                    onClick={async () => {
                      if (isReadOnlyOrMasterManaging || index === adminCategories.length - 1) return;
                      await supabase.from('problem_categories').update({ display_order: index + 2 }).eq('name', cat.name);
                      await supabase.from('problem_categories').update({ display_order: index + 1 }).eq('name', adminCategories[index + 1].name);
                      await loadAdminCategories(selectedPracticeId);
                    }}
                    disabled={isReadOnlyOrMasterManaging || index === adminCategories.length - 1}
                    className="px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 disabled:opacity-30 disabled:cursor-not-allowed"
                  >{t('down_arrow')}</button>
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
                <button onClick={() => !isReadOnlyOrMasterManaging && setEditingCategory(index)} disabled={isReadOnlyOrMasterManaging}
                  className={`px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 flex-shrink-0 ${isReadOnlyOrMasterManaging ? 'opacity-40 cursor-not-allowed' : ''}`}>{t('edit')}</button>
                <button
                  onClick={() => !isReadOnlyOrMasterManaging && deleteCategoryCascade(cat)}
                  disabled={isReadOnlyOrMasterManaging}
                  className={`px-2 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700 flex-shrink-0 ${isReadOnlyOrMasterManaging ? 'opacity-40 cursor-not-allowed' : ''}`}
                >{t('delete')}</button>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
    </div>
  </div>
)}

{isAdmin && showDefaultOnlyTools && !isSeller && activeAdminNavTab === 'settings' && (
  <div className="mt-4 bg-orange-50 border-2 border-orange-300 rounded-lg shadow-md p-4 max-w-4xl mx-auto">
    <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
      {t('assign_ratings_title')}
    </h3>
    
    <div className="bg-white rounded p-4">
      <div className="space-y-4 mb-4">
        {/* 1. TARGET SELECTION */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('select_target_step')}
          </label>
          <select
            id="rating-target"
            className="w-full p-2 border-2 border-gray-300 rounded"
            defaultValue="upload"
          >
            <option value="upload">{t('upload_user_experiences')}</option>
            <option value="key_insights">{t('key_insights_curated')}</option>
            <option value="both">{t('both')}</option>
          </select>
        </div>

        {/* 2. MODE SELECTION */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('apply_to_step')}
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
              <span className="text-sm">{t('only_without_ratings')}</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="rating-mode"
                value="all"
                className="w-4 h-4"
              />
              <span className="text-sm text-red-600 font-medium">{t('all_experiences_reset_warning')}</span>
            </label>
          </div>
        </div>

        {/* 3. PERCENTAGE */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('percentage_step')}
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
            {t('ratings_range_step')}
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              id="rating-min"
              min="1"
              defaultValue="1"
              className="w-24 p-2 border-2 border-gray-300 rounded"
            />
            <span className="text-sm text-gray-600">{t('to_word')}</span>
            <input
              type="number"
              id="rating-max"
              min="1"
              defaultValue="100"
              className="w-24 p-2 border-2 border-gray-300 rounded"
            />
            <span className="text-sm text-gray-600">{t('ratings_word')}</span>
          </div>
          <p className="text-xs text-gray-500 mt-1">e.g., 1-100, or 20-30</p>
        </div>

        {/* 5. STARS DISTRIBUTION */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('stars_distribution_step')}
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
        {t('execute_assign_ratings')}
      </button>

      <p className="text-xs text-gray-500 mt-3 text-center">
        💡 Tip: Use "ALL" mode to reset and redistribute ratings from scratch
      </p>
    </div>
  </div>
)}
          {isAdmin && canManageThisCompany && !(isSeller && !isSellerManagingOwnCompany && companyViewMode !== 'sample') && (!masterMustRespectVisibility || companyMasterVisibility.includes('keyword_filter')) && activeAdminNavTab === 'settings' && (
            <div className="mt-4 bg-yellow-50 border-2 border-yellow-300 rounded-lg shadow-md p-4 max-w-4xl mx-auto">
              <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <Search size={20} />
                {t('manage_group_deletion')}
              </h3>
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-2">{t("data_type")}</label>
                    <select
                      key={`dt-${deletionFiltersRemountKey}`}
                      value={deletionDataType}
                      onChange={(e) => {
                        setDeletionDataType(e.target.value);
                        if (e.target.value === 'metadata' && deletionSource === 'all') setDeletionSource('curated');
                      }}
                      className="w-full h-9 px-2 py-1 border-2 border-gray-300 rounded-lg bg-white"
                    >
                      <option value="all">All</option>
                      <option value="metadata">{t('metadata')}</option>
                      <option value="individual">{t('individual_experiences_opt')}</option>
                      <option value="key_insights">{t('common_cases_key_insights')}</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-2">{t("source")}</label>
                    <select
                      key={`src-${deletionFiltersRemountKey}`}
                      value={deletionSource}
                      onChange={(e) => setDeletionSource(e.target.value)}
                      className="w-full h-9 px-2 py-1 border-2 border-gray-300 rounded-lg bg-white"
                    >
                      <option value="all">All</option>
                      <option value="curated">{t('curated_sample')}</option>
                      <option value="users">{t('entered_by_users')}</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-2">{t('function_practice')}</label>
                    <div className="relative">
                      <select
                        key={`prac-${deletionFiltersRemountKey}`}
                        value={deletionPracticeId || ''}
                        onChange={async (e) => {
                          const id = e.target.value ? parseInt(e.target.value) : null;
                          setDeletionPracticeId(id);
                          setDeletionCategory('');
                          if (!id) { setDeletionCategoriesForPractice([]); return; }
                          const { data } = await supabase.from('problem_categories').select('*')
                            .eq('practice_id', id).eq('company_id', effectiveCompanyId).eq('active', true);
                          setDeletionCategoriesForPractice(data || []);
                        }}
                        className="w-full h-9 px-2 py-1 pr-8 border-2 border-gray-300 rounded-lg appearance-none bg-white"
                      >
                        <option value="">All</option>
                        {uiPractices
                          .filter(p => deletionDataType !== 'metadata' || deletionSource === 'all' || (deletionSource === 'curated' ? p.imported_from_id : !p.imported_from_id))
                          .map(p => (
                          <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                      </select>
                      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500" style={{ fontSize: '10px' }}>▼</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-2">{t("category")}</label>
                    <div className="relative">
                      <select
                        key={`cat-${deletionFiltersRemountKey}`}
                        value={deletionCategory}
                        onChange={(e) => setDeletionCategory(e.target.value)}
                        disabled={!deletionPracticeId}
                        className="w-full h-9 px-2 py-1 pr-8 border-2 border-gray-300 rounded-lg appearance-none bg-white disabled:bg-gray-100"
                      >
                        <option value="">All</option>
                        {deletionCategoriesForPractice
                          .filter(c => deletionDataType !== 'metadata' || deletionSource === 'all' || (deletionSource === 'curated' ? c.imported_from_id : !c.imported_from_id))
                          .map(c => (
                          <option key={c.id} value={c.name}>{c.name}</option>
                        ))}
                      </select>
                      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500" style={{ fontSize: '10px' }}>▼</span>
                    </div>
                  </div>
                </div>
                {(deletionDataType === 'metadata' || (deletionDataType === 'all' && (adminKeywords || deletionPracticeId || deletionCategory || deletionSource !== 'all'))) && (
                  <div className="bg-white rounded p-3">
                    {deletionDataType === 'all' && (
                      <p className="text-xs text-gray-500 mb-2 font-medium">🗂️ Metadata (Practices / Categories)</p>
                    )}
                    {(() => {
                      const sourceMatches = (item) => deletionSource === 'all' || (deletionSource === 'curated' ? item.imported_from_id : !item.imported_from_id);

                      // Categoria específica escolhida — lista de 1 item.
                      if (deletionPracticeId && deletionCategory) {
                        const cat = deletionCategoriesForPractice.find(c => c.name === deletionCategory);
                        if (!cat) return <p className="text-sm text-gray-500">—</p>;
                        return (
                          <div className="flex items-center justify-between p-2 border border-gray-200 rounded-lg">
                            <span className="text-sm text-gray-800">🗂️ {cat.name}</span>
                            <button
                              onClick={async () => {
                                if (!window.confirm(tConfirm('delete_category_ki', { name: cat.name }))) return;
                                try { await deleteCategoryCascade(cat); } catch (e) { alert('Error: ' + e.message); }
                              }}
                              className="px-2 py-1 rounded text-xs bg-red-600 hover:bg-red-700 text-white"
                            >{t('delete_trash')}</button>
                          </div>
                        );
                      }

                      // Practice escolhida, Category = All — lista as Categories dela.
                      if (deletionPracticeId) {
                        const items = deletionCategoriesForPractice.filter(sourceMatches);
                        const practiceName = uiPractices.find(p => p.id === deletionPracticeId)?.name;
                        return (
                          <div className="space-y-2">
                            <div className="flex items-center justify-between mb-1 flex-wrap gap-2">
                              <p className="text-sm font-semibold">{items.length} Categor{items.length === 1 ? 'y' : 'ies'} in "{practiceName}"</p>
                              {items.length > 0 && (
                                <button
                                  onClick={async () => {
                                    if (!window.confirm(tConfirm('delete_all_categories_listed', { count: items.length }))) return;
                                    try {
                                      await deleteCategoriesBatch(items);
                                      await loadAdminCategories(selectedPracticeId);
                                      await loadProblemCategories(selectedPracticeId);
                                      await loadEmployees(effectiveCompanyId);
                                      await loadExperiences(true);
                                      resetDeletionFilters();
                                    } catch (e) { alert('Error: ' + e.message); }
                                  }}
                                  className="px-3 py-1.5 rounded text-sm text-white bg-red-700 hover:bg-red-800"
                                >🗑️ Delete All</button>
                              )}
                            </div>
                            {items.length === 0 ? (
                              <p className="text-sm text-gray-500">{t('no_categories_match')}</p>
                            ) : items.map(cat => (
                              <div key={cat.id} className="flex items-center justify-between p-2 border border-gray-200 rounded-lg">
                                <span className="text-sm text-gray-800">🗂️ {cat.name}</span>
                                <button
                                  onClick={async () => {
                                    if (!window.confirm(tConfirm('delete_category_ki', { name: cat.name }))) return;
                                    try { await deleteCategoryCascade(cat); } catch (e) { alert('Error: ' + e.message); }
                                  }}
                                  className="px-2 py-1 rounded text-xs bg-red-600 hover:bg-red-700 text-white"
                                >{t('delete_trash')}</button>
                              </div>
                            ))}
                            <button
                              onClick={async () => {
                                const practice = uiPractices.find(p => p.id === deletionPracticeId);
                                if (!window.confirm(tConfirm('delete_whole_function_named', { name: practice.name }))) return;
                                try { await deletePracticeCascade(practice); alert(`"${practice.name}" deleted.`); } catch (e) { alert('Error: ' + e.message); }
                              }}
                              className="text-xs text-red-700 hover:text-red-900 underline mt-1"
                            >{t('delete_whole_function')}</button>
                          </div>
                        );
                      }

                      // Nada escolhido — lista todas as Practices que batem com o Source.
                      const items = uiPractices.filter(sourceMatches);
                      return (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between mb-1 flex-wrap gap-2">
                            <p className="text-sm font-semibold">{items.length} Function/Practice(s)</p>
                            {items.length > 0 && (
                              <button
                                onClick={async () => {
                                  if (!window.confirm(tConfirm('delete_all_functions_listed', { count: items.length }))) return;
                                  try {
                                    await deletePracticesBatch(items);
                                    await loadPractices();
                                    await loadProblemCategories();
                                    await loadEmployees(effectiveCompanyId);
                                    await loadExperiences(true);
                                    resetDeletionFilters();
                                  } catch (e) { alert('Error: ' + e.message); }
                                }}
                                className="px-3 py-1.5 rounded text-sm text-white bg-red-700 hover:bg-red-800"
                              >🗑️ Delete All</button>
                            )}
                          </div>
                          {items.length === 0 ? (
                            <p className="text-sm text-gray-500">{t('no_functions_match')}</p>
                          ) : items.map(p => (
                            <div key={p.id} className="flex items-center justify-between p-2 border border-gray-200 rounded-lg">
                              <span className="text-sm text-gray-800">📁 {p.name}</span>
                              <button
                                onClick={async () => {
                                  if (!window.confirm(tConfirm('delete_function_named', { name: p.name }))) return;
                                  try { await deletePracticeCascade(p); alert(`"${p.name}" deleted.`); } catch (e) { alert('Error: ' + e.message); }
                                }}
                                className="px-2 py-1 rounded text-xs bg-red-600 hover:bg-red-700 text-white"
                              >{t('delete_trash')}</button>
                            </div>
                          ))}
                        </div>
                      );
                    })()}
                  </div>
                )}
                {deletionDataType !== 'metadata' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Keywords (separate with commas)
                  </label>
                  <input
                    type="text"
                    value={adminKeywords}
                    onChange={(e) => setAdminKeywords(e.target.value)}
                    placeholder="e.g., spam, scam, inappropriate, viagra, Curator"
                    className="w-full h-9 px-2 py-1 border-2 border-gray-300 rounded-lg"
                  />
                  <p className="text-xs text-gray-600 mt-1">
                    Will search in problems, solutions, results, and comments. Combine with Function/Practice and Category above to narrow down further.
                  </p>
                </div>
                )}
                {deletionDataType !== 'metadata' && (adminKeywords || deletionPracticeId || deletionCategory || deletionDataType !== 'all' || deletionSource !== 'all') && (
                  <div className="bg-white rounded p-3">
                    <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                      <p className="text-sm font-semibold">
                        Found {getKeywordMatches().length} matches
                      </p>
                      {getKeywordMatches().length > 0 && (
                        <button
                          onClick={handleDeleteAllMatches}
                          className="px-3 py-1.5 rounded text-sm text-white bg-red-600 hover:bg-red-700"
                        >
                          Delete All
                        </button>
                      )}
                    </div>
                    {getKeywordMatches().length === 0 ? (
                      <p className="text-sm text-gray-500">{t('no_matches_found')}</p>
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
                            {match.keyword && (
                              <p className="text-sm text-gray-700 mb-1">
                                <span className="font-medium">{t('keyword_found')}</span>{' '}
                                <span className="bg-yellow-300 px-1 rounded font-semibold">{match.keyword}</span>
                              </p>
                            )}
                            {match.author && (
                              <p className="text-xs text-gray-600 mb-1">{t('by_short')} {match.author}</p>
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
        {/* Inspirational Quotes Marquee - Top */}
        {(!isAdmin || activeAdminNavTab === 'preview') && appSettings.showMarquee && !isSellerBaseView && (() => {
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
        {(!isAdmin || activeAdminNavTab === 'preview') && appSettings.showTop3 && top3VisibleInSession && !isSellerBaseView && (() => {
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
                  title={t('back_to_where_you_were')}
                >
                  {t('back')}
                </button>
              )}
              <button
                onClick={() => handleTop3Toggle(false)}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-sm bg-white bg-opacity-70 hover:bg-opacity-100 rounded-full px-3 py-1 transition-colors"
                title={t('hide_top3')}
              >
                {t("hide")}
              </button>
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center justify-center gap-3 mb-2">
                  <Star className="text-yellow-500 fill-yellow-500" size={28} />
                  {t('top3_this_week')}
                  <Star className="text-yellow-500 fill-yellow-500" size={28} />
                </h2>
                <p className="text-gray-600">{t('handpicked_experiences')}</p>
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
                            {t('problem')}
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
                          {t('action')}
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
                            {t('result')}
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
                  {t("check_all_experiences_shared")}
                  <TrendingUp size={16} className="rotate-180" />
                </button>
              </div>
            </div>
          );
        })()}

        {/* Inspirational Quotes Marquee - Bottom */}
        {(!isAdmin || activeAdminNavTab === 'preview') && appSettings.showMarquee && !isSellerBaseView && (() => {
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
          
{(!isAdmin || activeAdminNavTab === 'preview') && masterBlockedFromPublicTabs && !isSellerBaseView && !isSellerManagingOwnCompany && !(isDefaultAdmin && !!adminCompanyContext) && (
  <div className="mt-5 mb-8 max-w-2xl mx-auto bg-amber-50 border-2 border-amber-300 rounded-2xl p-6 text-center">
    <p className="text-amber-800 font-medium">🔒 {effectiveCompanyName} hasn't authorized ADM Master to view "Synthetic/Curated Content" yet.</p>
    <p className="text-amber-700 text-sm mt-1">Ask the company to check that box in their own "Section Settings" if you need to preview this.</p>
  </div>
)}

<div className={`mt-5 mb-8 ${masterBlockedFromPublicTabs || (isAdmin && activeAdminNavTab !== 'preview') ? 'hidden' : ''}`}>
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
      {t('see_what_others_did')}
      {activeMainTab === 'see' && (navSnapshot?.destination === 'browse') && (
        <span
          onClick={(e) => { e.stopPropagation(); goBackToSnapshot(); }}
          className="block md:hidden text-xs font-medium text-purple-500 hover:text-purple-700 bg-purple-50 rounded-full px-2 py-1 cursor-pointer mt-1"
        >
          {t('back')}
        </span>
      )}
      {activeMainTab === 'see' && (navSnapshot?.destination === 'browse') && (
        <span
          onClick={(e) => { e.stopPropagation(); goBackToSnapshot(); }}
          className="hidden md:block absolute left-3 top-1/2 -translate-y-1/2 text-xs font-medium text-purple-500 hover:text-purple-700 bg-purple-50 rounded-full px-2 py-1 cursor-pointer"
        >
          {t('back')}
        </span>
      )}
    </button>
    <button
      onClick={() => {
        if (isReadOnlyOrMasterManaging) return;
        // Clique direto na aba (não veio de um botão de Follow-On) — limpa
        // qualquer resíduo de um Follow-On anterior, senão a Category/
        // Practice fica "grudada" de uma experience completamente
        // diferente da que o usuário está prestes a criar agora.
        if (followOnParentId) {
          setFollowOnParentId(null);
          setSelectedPracticeId(null);
          setShareFormPracticeId(null);
          setCurrentEntry(prev => ({ ...prev, problemCategory: '' }));
        }
        setActiveMainTab('share');
        scrollToTabs();
      }}
      disabled={isReadOnlyOrMasterManaging}
      className={`flex-1 px-4 py-3 font-bold text-base md:text-xl transition-all rounded-t-2xl border-2 border-b-0 -ml-px relative ${
        isReadOnlyOrMasterManaging
          ? 'bg-gray-50 text-gray-300 border-gray-200 cursor-not-allowed'
          : activeMainTab === 'share'
          ? 'bg-white text-blue-700 border-blue-300 relative z-10'
          : 'bg-gray-100 text-gray-400 border-gray-200 hover:bg-gray-200'
      }`}
    >
      {t('share_your_experience')}
      {activeMainTab === 'share' && (navSnapshot?.destination === 'share') && (
        <span
          onClick={(e) => { e.stopPropagation(); goBackToSnapshot(); }}
          className="block md:hidden text-xs font-medium text-blue-500 hover:text-blue-700 bg-blue-50 rounded-full px-2 py-1 cursor-pointer mt-1"
        >
          {t('back')}
        </span>
      )}
      {activeMainTab === 'share' && (navSnapshot?.destination === 'share') && (
        <span
          onClick={(e) => { e.stopPropagation(); goBackToSnapshot(); }}
          className="hidden md:block absolute left-3 top-1/2 -translate-y-1/2 text-xs font-medium text-blue-500 hover:text-blue-700 bg-blue-50 rounded-full px-2 py-1 cursor-pointer"
        >
          {t('back')}
        </span>
      )}
    </button>
  </div>
  {/* Linha conectora — fecha o friso colorido por baixo da aba inativa, sem sobrepor a aba ativa */}
  <div
    className={`absolute bottom-0 h-0.5 ${activeMainTab === 'see' ? 'bg-purple-300 right-0 left-1/2' : 'bg-blue-300 left-0 right-1/2'}`}
  />
</div>

<div id="share-section" className={`bg-white p-8 rounded-b-2xl border-2 border-t-0 border-blue-300 ${activeMainTab !== 'share' || (isAdmin && activeAdminNavTab !== 'preview') ? 'hidden' : ''} ${isReadOnlyOrMasterManaging ? 'pointer-events-none opacity-60' : ''}`}>

  {/* Clear All — limpa só o que o usuário digitou */}
  <div className="flex justify-end mb-3">
    <button
      onClick={handleClearAll}
      className="text-xs text-gray-500 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-full px-3 py-1 transition-colors"
    >
      {t('clear_all')}
    </button>
  </div>

  {/* ⭐ FOLLOW-ON BANNER */}
  {followOnParentId && (() => {
    const parentExp = experiences.find(e => e.id === followOnParentId);
    return parentExp ? (
      <div className="mb-5 p-3 bg-blue-50 border-2 border-blue-200 rounded-lg flex items-start justify-between gap-3">
        <div className="flex-1">
          <p className="text-xs font-semibold text-blue-700 mb-1">{t('follow_on_to')}</p>
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
                <h3 className="text-lg font-semibold text-gray-800">{t('problem')}</h3>
              </div>
              
              {/* Industry Sector - só no Pro, vem antes do Function/Practice */}
              {companyEdition === 'pro' && (
                <div className="mb-2 relative">
                  <select
                    value={currentEntry.industrySector}
                    onChange={(e) => setCurrentEntry({...currentEntry, industrySector: e.target.value})}
                    className="w-full h-9 px-2 py-1 pr-8 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none bg-gray-100 appearance-none"
                    required
                  >
                    <option value="">{t('select_industry_sector')}</option>
                    {industrySectors.map(sector => (
                      <option key={sector} value={sector}>{sector}</option>
                    ))}
                  </select>
                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500" style={{ fontSize: '10px' }}>▼</span>
                </div>
              )}

              {/* Practice dropdown - sempre aparece, mesmo vazio, pra dar noção da estrutura */}
              <div className="mb-2 relative">
    <select
      value={(uiPractices.length === 1 ? uiPractices[0].id : shareFormPracticeId) || ''}
      onChange={(e) => {
        const id = parseInt(e.target.value);
        setShareFormPracticeId(id);
        setSelectedPracticeId(id);
        setCurrentEntry({...currentEntry, problemCategory: ''});
        loadProblemCategories(id);
      }}
      className={`w-full h-9 px-2 py-1 pr-8 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none bg-gray-100 appearance-none ${uiPractices.length === 1 ? 'cursor-not-allowed' : ''}`}
      disabled={uiPractices.length === 1}
    >
      {uiPractices.length > 1 && <option value="">{t('select_function_practice')}</option>}
      {uiPractices.map(p => (
        <option key={p.id} value={p.id}>{p.name}</option>
      ))}
    </select>
    <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500" style={{ fontSize: '10px' }}>▼</span>
  </div>

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
                          className="w-full h-9 px-2 py-1 border-2 border-gray-200 rounded-lg text-left flex items-center justify-between cursor-default"
                          style={{ fontFamily: 'inherit', fontSize: 'inherit', color: currentEntry.problemCategory ? 'inherit' : '#6b7280', backgroundColor: '#f3f4f6' }}
                        >
                          <span>{currentEntry.problemCategory || t('select_category')}</span>
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

              <div className="relative">
                <textarea
                  value={currentEntry.problem}
                  onChange={(e) => {
                    if (e.target.value.length <= maxChars.problem) {
                      setCurrentEntry({...currentEntry, problem: e.target.value});
                    }
                  }}
                  placeholder={t('describe_problem')}
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
                <h3 className="text-lg font-semibold text-gray-800">{t('action')}</h3>
              </div>
              <div className="relative">
                <textarea
                  value={currentEntry.solution}
                  onChange={(e) => {
                    if (e.target.value.length <= maxChars.solution) {
                      setCurrentEntry({...currentEntry, solution: e.target.value});
                    }
                  }}
                  placeholder={t('what_did_you_do')}
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
                <h3 className="text-lg font-semibold text-gray-800">{t('result')}</h3>
              </div>
              <select
                value={currentEntry.resultCategory}
                onChange={(e) => setCurrentEntry({...currentEntry, resultCategory: e.target.value})}
                className="w-full p-2 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none"
                required
              >
                <option value="">{t('how_was_result')}</option>
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
                  placeholder={t('what_was_outcome')}
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
  {companyEdition === 'pro' && (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">{t('author_optional')}</label>
      <input
        type="text"
        value={currentEntry.author}
        onChange={(e) => setCurrentEntry({...currentEntry, author: e.target.value})}
        placeholder={t('your_name')}
        className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
        maxLength={50}
      />
    </div>
  )}
  
  {/* Gender - só no Pro */}
  {companyEdition === 'pro' && (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">{t('gender_optional')}</label>
      <select
        value={currentEntry.gender}
        onChange={(e) => setCurrentEntry({...currentEntry, gender: e.target.value})}
        className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
      >
        <option value="">{t('prefer_not_to_say')}</option>
        {genderOptions.map(gender => (
          <option key={gender} value={gender}>{gender}</option>
        ))}
      </select>
    </div>
  )}
  
  {/* Age - só no Pro */}
  {companyEdition === 'pro' && (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">{t('age_range_optional')}</label>
      <select
        value={currentEntry.age}
        onChange={(e) => setCurrentEntry({...currentEntry, age: e.target.value})}
        className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none bg-white"
        style={{ backgroundImage: 'none' }} 
      >
        <option value="">{t('prefer_not_to_say')}</option>
        {ageOptions.map(age => (
          <option key={age} value={age}>{age}</option>
        ))}
      </select>
    </div>
  )}
  
  {/* Country - só no Pro */}
  {companyEdition === 'pro' && (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">{t('country_auto_detected')}</label>
      <select
        value={currentEntry.country}
        onChange={(e) => setCurrentEntry({...currentEntry, country: e.target.value})}
        className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
      >
        <option value="">{t('select_country')}</option>
        {countryOptions.map(country => (
          <option key={country} value={country}>{country}</option>
        ))}
      </select>
      <p className="text-xs text-gray-500 mt-1">{t('detected')} {userCountryName || t('not_detected')}</p>
    </div>
  )}
</div>

{/* Upload Document - dinâmico baseado em documentType */}
{appSettings.allowCvUpload && (
  <div className="md:col-span-2">
    <label className="block text-sm font-medium text-gray-700 mb-2">
      {appSettings.documentType === 'cv' 
        ? t('upload_cv_optional')
        : t('upload_file_optional')}
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
          alert(t('file_too_large'));
          e.target.value = '';
        } else {
          setSelectedCv(file);
        }
      }
    }}
    className="hidden"
  />
  {appSettings.documentType === 'cv' ? '📎 CV' : t('file_badge')}
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
            {t('remove')}
          </button>
        </div>
      )}

      <button
        onClick={handleSubmit}
        disabled={!(currentEntry.problem && currentEntry.problemCategory && currentEntry.solution && currentEntry.result && currentEntry.resultCategory)}
        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
        title={t('share_your_experience')}
      >
        <Send size={18} />
      </button>
    </div>
    
    <p className="text-xs text-gray-500 mt-1">{t('max_5mb')}</p>
  </div>
)}

{/* Fallback: se upload não estiver habilitado, mostrar botão de envio sozinho */}
{!appSettings.allowCvUpload && (
  <div className="md:col-span-2 flex justify-end">
    <button
      onClick={handleSubmit}
      disabled={!(currentEntry.problem && currentEntry.problemCategory && currentEntry.solution && currentEntry.result && currentEntry.resultCategory)}
      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
      title={t('share_your_experience')}
    >
      <Send size={18} />
    </button>
  </div>
)}
        </div>
        
<div className={`space-y-6 ${activeMainTab !== 'see' || (isAdmin && activeAdminNavTab !== 'preview') ? 'hidden' : ''} p-4 rounded-b-2xl border-2 border-t-0 border-purple-300`} id="experiences-section">
          
          
          
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
                <span className="font-medium">{experiences.length} {t('experiences_shared')}</span>
                
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
                      {t('show_top3')}
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
  <span className="font-bold text-sm">{t('individual')}</span>
  <span className="font-bold text-sm">{t('experiences')}</span>
  <span className="text-[10px] opacity-80">{t('user_stories')}</span>
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
  <span className="font-bold text-sm">{t('key')}</span>
  <span className="font-bold text-sm">{t('insights')}</span>
  <span className="text-[10px] opacity-80">{t('curated_patterns')}</span>
</button>
            </div>

{/* CONTEÚDO DA TAB INDIVIDUAL EXPERIENCES */}
            {filterMode === 'individual' && (
              <>
                {/* Filtros principais */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                  {/* Industry Sector filter - só no Pro, vem antes do Function/Practice */}
                  {companyEdition === 'pro' && (
  <div>
    <label className="block text-sm font-medium text-gray-600 mb-2">
      <Briefcase className="inline mr-1" size={14} />
      {t('industry_sector_label')}
    </label>
    <div className="relative">
    <select
      value={filters.industrySector}
      onChange={(e) => setFilters({...filters, industrySector: e.target.value})}
      className="w-full h-9 px-2 py-1 pr-8 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none bg-gray-100 appearance-none"
    >
      <option value="">{t('all_sectors')}</option>
      {industrySectors.map(sector => (
        <option key={sector} value={sector}>{sector}</option>
      ))}
    </select>
    <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500" style={{ fontSize: '10px' }}>▼</span>
    </div>
  </div>
)}

                  {/* Practice filter - só aparece se 2+ practices ativas, ou se 1 com nome diferente de General */}
                  <div>
    <label className="block text-sm font-medium text-gray-600 mb-2">{t('function_practice')}</label>
    <div className="relative">
    <select
      value={filterPracticeId || ''}
      onChange={(e) => {
        const id = e.target.value ? parseInt(e.target.value) : null;
        setFilterPracticeId(id);
        setFilters({...filters, problemCategory: ''});
        loadProblemCategories(id);
      }}
      className={`w-full h-9 px-2 py-1 pr-8 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none bg-gray-100 appearance-none ${uiPractices.length === 1 ? 'cursor-not-allowed' : ''}`}
      disabled={uiPractices.length === 1}
    >
      <option value="">{t('all')}</option>
      {uiPractices.map(p => (
        <option key={p.id} value={p.id}>{p.name}</option>
      ))}
    </select>
    <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500" style={{ fontSize: '10px' }}>▼</span>
    </div>
  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-2">{t('category')}</label>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 relative filter-category-dropdown-container">
                        <div
                          role="button"
                          tabIndex={0}
                          onClick={() => setShowFilterCategoryDropdown(!showFilterCategoryDropdown)}
                          onKeyDown={(e) => e.key === 'Enter' && setShowFilterCategoryDropdown(!showFilterCategoryDropdown)}
                          className="w-full h-9 px-2 py-1 border-2 border-gray-200 rounded-lg text-left flex items-center justify-between cursor-default focus:border-purple-500"
                          style={{ fontFamily: 'inherit', fontSize: 'inherit' }}
                        >
                          <span>{filters.problemCategory || t('all')}</span>
                          <span className="text-gray-500" style={{ fontSize: '10px' }}>▼</span>
                        </div>

                        {showFilterCategoryDropdown && (
                          <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white border-2 border-gray-200 rounded-lg shadow-xl" style={{ overflow: 'visible' }}>
                            <button
                              type="button"
                              onClick={() => {
                                setFilters({...filters, problemCategory: ''});
                                setFilterTags([]);
                                setShowFilterCategoryDropdown(false);
                              }}
                              className={`w-full text-left px-3 py-2 hover:bg-purple-50 transition-colors ${!filters.problemCategory ? 'bg-purple-50 text-purple-700 font-medium' : 'text-gray-700'}`}
                              style={{ fontFamily: 'inherit', fontSize: 'inherit' }}
                            >
                              {t('all')}
                            </button>
                            {problemCategories.map(cat => {
                              const desc = categoryData[cat]?.description;
                              return (
                                <div
                                  key={cat}
                                  className="relative flex items-center"
                                  onMouseEnter={() => setHoveredFilterCategory(cat)}
                                  onMouseLeave={() => setHoveredFilterCategory(null)}
                                >
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setFilters({...filters, problemCategory: cat});
                                      setFilterTags([]);
                                      setShowFilterCategoryDropdown(false);
                                      setHoveredFilterCategory(null);
                                    }}
                                    className={`flex-1 text-left px-3 py-2 hover:bg-purple-50 transition-colors ${filters.problemCategory === cat ? 'bg-purple-50 text-purple-700 font-medium' : 'text-gray-700'}`}
                                    style={{ fontFamily: 'inherit', fontSize: 'inherit' }}
                                  >
                                    {cat}
                                  </button>
                                  {desc && (
                                    <>
                                      <span className="pr-2 text-gray-400 text-xs cursor-default select-none">ⓘ</span>
                                      {hoveredFilterCategory === cat && (
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
                      {problemCategories.some(cat => categoryData[cat]?.description) && (
                        <button
                          type="button"
                          onClick={() => setShowCategoryDrawer(true)}
                          className="sm:hidden flex-shrink-0 w-8 h-8 rounded-full border-2 border-gray-300 text-gray-500 hover:border-purple-400 hover:text-purple-600 flex items-center justify-center font-medium transition-colors"
                          style={{ fontSize: '14px' }}
                        >ⓘ</button>
                      )}
                    </div>
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

                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-2">{t('result')}</label>
                    <div className="relative">
                    <select
                      value={filters.resultCategory}
                      onChange={(e) => setFilters({...filters, resultCategory: e.target.value})}
                      className="w-full h-9 px-2 py-1 pr-8 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none appearance-none"
                    >
                      <option value="">{t("all")}</option>
                      {resultCategories.map(cat => <option key={cat.value} value={cat.value}>{cat.label}</option>)}
                    </select>
                    <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500" style={{ fontSize: '10px' }}>▼</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-2">{t('enter_keywords')}</label>
                    <input
                      type="text"
                      value={filters.searchText}
                      onChange={(e) => setFilters({...filters, searchText: e.target.value})}
                      placeholder={t('search_placeholder')}
                      className="w-full h-9 px-2 py-1 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
                    />
                  </div>
                </div>
                
                {/* Botão More/Less filters */}
                <div className="mb-4">
                  <button
                    onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                    className="text-sm text-purple-600 hover:text-purple-800 font-medium flex items-center gap-2"
                  >
                    {showAdvancedFilters ? t('less_filters') : t('more_filters')}
                  </button>
                </div>
                
                {/* Filtros avançados (colapsáveis) */}
{showAdvancedFilters && (
  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
    {/* Rating - mantém em ambos */}
    <div>
      <label className="block text-sm font-medium text-gray-600 mb-2">{t('rating')}</label>
      <select
        value={filters.rating}
        onChange={(e) => setFilters({...filters, rating: e.target.value})}
        className="w-full p-2 border-2 border-gray-200 rounded-lg focus:border-yellow-500 focus:outline-none"
      >
        <option value="">{t('all')}</option>
        <option value="5">⭐⭐⭐⭐⭐ (5)</option>
        <option value="4">⭐⭐⭐⭐ (4)</option>
        <option value="3">⭐⭐⭐ (3)</option>
        <option value="2">⭐⭐ (2)</option>
        <option value="1">⭐ (1)</option>
        <option value="0">{t('none_not_rated')}</option>
      </select>
    </div>
    
    {/* Gender - só no Pro */}
    {companyEdition === 'pro' && (
      <div>
        <label className="block text-sm font-medium text-gray-600 mb-2">{t('gender')}</label>
        <select
          value={filters.gender}
          onChange={(e) => setFilters({...filters, gender: e.target.value})}
          className="w-full p-2 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
        >
          <option value="">{t("all")}</option>
          {genderOptions.map(gender => <option key={gender} value={gender}>{gender}</option>)}
        </select>
      </div>
    )}
    
    {/* Age - só no Pro */}
    {companyEdition === 'pro' && (
      <div>
        <label className="block text-sm font-medium text-gray-600 mb-2">{t('age')}</label>
        <select
          value={filters.age}
          onChange={(e) => setFilters({...filters, age: e.target.value})}
          className="w-full p-2 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
        >
          <option value="">{t('all')}</option>
          {ageOptions.map(age => <option key={age} value={age}>{age}</option>)}
        </select>
      </div>
    )}
    
    {/* Country - só no Pro */}
    {companyEdition === 'pro' && (
      <div>
        <label className="block text-sm font-medium text-gray-600 mb-2">{t('country')}</label>
        <select
          value={filters.country}
          onChange={(e) => setFilters({...filters, country: e.target.value})}
          className="w-full p-2 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
        >
          <option value="">{t('all')}</option>
          {countryOptions.map(country => <option key={country} value={country}>{country}</option>)}
        </select>
      </div>
    )}
  </div>
)}
                
                
                <div className="mt-4">
<div className="text-sm font-bold text-purple-600 mb-2">
  {tCountFound(filteredExperiences.length, false)}
</div>
                  {(filters.problemCategory || filters.searchText || filters.resultCategory || filters.rating || filters.gender || filters.age || filters.country || filters.industrySector || filterPracticeId || filterTags.length > 0) && (
                    <button
                      onClick={() => { setFilters({ problemCategory: '', searchText: '', resultCategory: '', rating: '', gender: '', age: '', country: '', industrySector: '' }); setFilterPracticeId(null); setFilterTags([]); }}
                      className="text-sm text-purple-600 hover:text-purple-800 font-medium"
                    >
                      {t('clear_filters')}
                    </button>
                  )}
                </div>
              </>
            )}

            {/* CONTEÚDO DA TAB KEY INSIGHTS */}
{filterMode === 'key_insights' && (
  <div>
    {/* Filtros principais - mesma largura de coluna da aba Individual Experiences */}
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-3">
      {/* Practice filter - mesma lógica dos outros lugares */}
      <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">{t('function_practice')}:</label>
    <div className="relative">
    <select
      value={filterPracticeId || ''}
      onChange={(e) => {
        const id = e.target.value ? parseInt(e.target.value) : null;
        setFilterPracticeId(id);
        setKeyInsightCategory('');
        setShowKeyInsights(false);
        loadProblemCategories(id);
      }}
      className={`w-full h-9 px-2 py-1 pr-8 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none bg-gray-100 appearance-none ${uiPractices.length === 1 ? 'cursor-not-allowed' : ''}`}
      disabled={uiPractices.length === 1}
    >
      <option value="">{t('all')}</option>
      {uiPractices.map(p => (
        <option key={p.id} value={p.id}>{p.name}</option>
      ))}
    </select>
    <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500" style={{ fontSize: '10px' }}>▼</span>
    </div>
  </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">{t('category')}:</label>
        <div className="flex items-center gap-2">
          <div className="flex-1 relative key-insight-category-dropdown-container">
            <div
              role="button"
              tabIndex={0}
              onClick={() => setShowKeyInsightCategoryDropdown(!showKeyInsightCategoryDropdown)}
              onKeyDown={(e) => e.key === 'Enter' && setShowKeyInsightCategoryDropdown(!showKeyInsightCategoryDropdown)}
              className="w-full h-9 px-2 py-1 border-2 border-gray-200 rounded-lg text-left flex items-center justify-between cursor-default focus:border-purple-500"
              style={{ fontFamily: 'inherit', fontSize: 'inherit' }}
            >
              <span>{keyInsightCategory || t('all')}</span>
              <span className="text-gray-500" style={{ fontSize: '10px' }}>▼</span>
            </div>

            {showKeyInsightCategoryDropdown && (
              <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white border-2 border-gray-200 rounded-lg shadow-xl" style={{ overflow: 'visible' }}>
                <button
                  type="button"
                  onClick={() => {
                    setKeyInsightCategory('');
                    setShowKeyInsights(false);
                    setFilters({ problemCategory: '', searchText: '', resultCategory: '', rating: '', gender: '', age: '', country: '' });
                    setShowKeyInsightCategoryDropdown(false);
                  }}
                  className={`w-full text-left px-3 py-2 hover:bg-purple-50 transition-colors ${!keyInsightCategory ? 'bg-purple-50 text-purple-700 font-medium' : 'text-gray-700'}`}
                  style={{ fontFamily: 'inherit', fontSize: 'inherit' }}
                >
                  {t("all")}
                </button>
                {problemCategories.map(cat => {
                  const desc = categoryData[cat]?.description;
                  return (
                    <div
                      key={cat}
                      className="relative flex items-center"
                      onMouseEnter={() => setHoveredKeyInsightCategory(cat)}
                      onMouseLeave={() => setHoveredKeyInsightCategory(null)}
                    >
                      <button
                        type="button"
                        onClick={() => {
                          setKeyInsightCategory(cat);
                          setShowKeyInsights(true);
                          setFilters({ problemCategory: '', searchText: '', resultCategory: '', rating: '', gender: '', age: '', country: '' });
                          setShowKeyInsightCategoryDropdown(false);
                          setHoveredKeyInsightCategory(null);
                        }}
                        className={`flex-1 text-left px-3 py-2 hover:bg-purple-50 transition-colors ${keyInsightCategory === cat ? 'bg-purple-50 text-purple-700 font-medium' : 'text-gray-700'}`}
                        style={{ fontFamily: 'inherit', fontSize: 'inherit' }}
                      >
                        {cat}
                      </button>
                      {desc && (
                        <>
                          <span className="pr-2 text-gray-400 text-xs cursor-default select-none">ⓘ</span>
                          {hoveredKeyInsightCategory === cat && (
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
          {problemCategories.some(cat => categoryData[cat]?.description) && (
            <button
              type="button"
              onClick={() => setShowCategoryDrawer(true)}
              className="sm:hidden flex-shrink-0 w-8 h-8 rounded-full border-2 border-gray-300 text-gray-500 hover:border-purple-400 hover:text-purple-600 flex items-center justify-center font-medium transition-colors"
              style={{ fontSize: '14px' }}
            >ⓘ</button>
          )}
        </div>
      </div>
    </div>
    
    <div className="mt-4">
      <div className="text-sm font-bold text-purple-600 mb-2">
        {tCountFound(filteredExperiences.length, true)}
      </div>
      {keyInsightCategory && (
        <button
          onClick={() => {
            setShowKeyInsights(false);
            setKeyInsightCategory('');
          }}
          className="text-sm text-purple-600 hover:text-purple-800 font-medium"
        >
          {t('clear_filters')}
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
                {tPagination(currentPage, totalPages, indexOfFirstExperience + 1, Math.min(indexOfLastExperience, filteredExperiences.length), filteredExperiences.length)}
              </div>
              <div className="flex items-center gap-2 flex-wrap justify-center">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-white border-2 border-gray-200 rounded-lg font-medium text-gray-700 hover:bg-purple-50 hover:border-purple-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
                >
                  {t('previous')}
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
                  {t('next')}
                </button>
              </div>
            </div>
          )}

          {filteredExperiences.length === 0 ? (
            <div className="bg-gray-50 rounded-xl p-8 text-center">
              <p className="text-gray-500">{tNoExperiencesFound()}</p>
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
                const catLabel = pname && !HIDDEN_PRACTICE_NAMES.includes(pname) ? `${pname} / ${exp.problemCategory}` : exp.problemCategory;
                const searchTerms = filters.searchText ? filters.searchText.toLowerCase().trim().split(/\s+/) : [];

                return (
                  <React.Fragment key={exp.id}>
                    <div
                      id={`exp-${exp.id}`}
                      className={`bg-white rounded-2xl shadow-lg p-6 transition-opacity ${isRootLevel ? '' : 'sm:mx-6 border-l-4 border-blue-300'} ${!isMatched ? 'opacity-40' : ''}`}
                    >
                      {!isRootLevel && (
                        <div className="mb-3 text-center">
                          <span className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-medium">{tFollowOnExperience(threadIndex)}</span>
                        </div>
                      )}
                      <div className="mb-3">
                        {(exp.author || exp.gender || exp.age || exp.country || exp.employeeId) && (
                          <span className="text-xs text-gray-600 block">
                            {t('by')} {appSettings.requireEmployeeLogin
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
                            <h4 className="font-semibold text-red-600 flex items-center gap-2"><AlertCircle size={16}/>{t('problem')}</h4>
                            <CategoryBadge label={catLabel} />
                          </div>
                          <p className="text-sm text-gray-700">{highlightText(exp.problem, searchTerms)}</p>
                        </div>
                        <div className="space-y-2">
                          <h4 className="font-semibold text-blue-600 flex items-center gap-2"><TrendingUp size={16}/>{t('action')}</h4>
                          <p className="text-sm text-gray-700">{highlightText(exp.solution, searchTerms)}</p>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <h4 className="font-semibold text-green-600 flex items-center gap-2"><Share2 size={16}/>{t('result')}</h4>
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
                      const catLabel = pname && !HIDDEN_PRACTICE_NAMES.includes(pname) ? `${pname} / ${ancestor.problemCategory}` : ancestor.problemCategory;
                      return (
                        <div key={ancestor.id}>
                          {/* Card ancestral: raiz em tamanho normal, intermediários com mx-6 */}
                          <div className={isRoot ? '' : 'sm:mx-6'}>
                            <div className={`bg-white rounded-2xl shadow-lg p-6 border-l-4 ${isRoot ? 'border-purple-400' : 'border-purple-300'}`}>
                              <div className="mb-3 text-center">
                                <span className="text-xs bg-purple-100 text-purple-700 px-3 py-1 rounded-full font-medium">
                                  {isRoot ? t('original_experience') : t('upstream_experience')}
                                </span>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
                                <div className="space-y-2">
                                  <div className="flex items-center justify-between">
                                    <h4 className="font-semibold text-red-600 flex items-center gap-2"><AlertCircle size={16}/>{t('problem')}</h4>
                                    <CategoryBadge label={catLabel} />
                                  </div>
                                  <p className="text-sm text-gray-700">{ancestor.problem}</p>
                                </div>
                                <div className="space-y-2">
                                  <h4 className="font-semibold text-blue-600 flex items-center gap-2"><TrendingUp size={16}/>{t('action')}</h4>
                                  <p className="text-sm text-gray-700">{ancestor.solution}</p>
                                </div>
                                <div className="space-y-2">
                                  <div className="flex items-center justify-between">
                                    <h4 className="font-semibold text-green-600 flex items-center gap-2"><Share2 size={16}/>{t('result')}</h4>
                                    <span className={`text-xs px-3 py-1 rounded-full ${getResultColor(ancestor.resultCategory)}`}>{getResultLabel(ancestor.resultCategory)}</span>
                                  </div>
                                  <p className="text-sm text-gray-700">{ancestor.result}</p>
                                </div>
                              </div>
                              {(ancestor.author || ancestor.employeeId) && (
                                <p className="text-xs text-gray-500 border-t pt-2">
                                  {t('by')} {[ancestor.author, ancestor.employeeId, ancestor.country].filter(Boolean).join(', ')}
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
                  {exp.source !== 'app' && (
                    <span className="inline-flex items-center gap-1 mb-2">
                      <span className="text-[8px] font-semibold uppercase bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                        {t("curator")}
                      </span>
                      {exp.language && exp.language !== 'en' && (
                        <span className="text-[8px] text-gray-400 italic">
                          {exp.language === 'es' && '(Traducido del inglés)'}
                          {exp.language === 'pt' && '(Traduzido do inglês)'}
                          {exp.language === 'zh' && '(从英语翻译)'}
                        </span>
                      )}
                    </span>
                  )}
                  <div className="mb-4">
{/* Linha 1: By à esquerda */}
<div className="mb-3">
  {(exp.author || exp.gender || exp.age || exp.country || exp.employeeId) && (
    <div>
      <span className="text-xs text-gray-600 block">
        {t('by')} {exp.author === 'key_insights' ? t('common_cases') : 
             appSettings.requireEmployeeLogin 
               ? [exp.author, exp.employeeId, exp.country].filter(Boolean).join(', ')
               : [exp.author, exp.gender, exp.age, exp.country].filter(Boolean).join(', ')
            }
      </span>
      {exp.source === 'app' && exp.createdAt && (
        <span className="text-xs text-gray-400 block">
          {new Date(exp.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
        </span>
      )}
      
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
          if (window.confirm(t('confirm_delete_file'))) {
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
        title={t('delete_file_tooltip')}
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
{!isReadOnlyOrMasterManaging && appSettings.requireEmployeeLogin && exp.employeeId === employeeId && exp.author !== 'key_insights' && (
  <button
    onClick={async () => {
      if (window.confirm(t('confirm_delete_experience_comments'))) {
        await deleteExperienceFromSupabase(exp.id);
      }
    }}
    className="text-red-600 hover:text-red-800 text-xs mt-2 inline-flex items-center gap-1"
  >
    {t('delete_experience')}
  </button>
)}                   
                    
{exp.industrySector && companyEdition === 'pro' && (
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
          <span className="text-xs text-gray-500 ml-1">({exp.totalRatings} {tRatingCount(exp.totalRatings)})</span>
        </div>
      </div>
      
      {/* Linhas 3-4: Your rating */}
      <div className="flex flex-col items-end">
        <div className="text-xs text-gray-600 mb-1">{t('your_rating')}</div>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map(star => (
            <button
              key={star}
              onClick={() => !isReadOnlyOrMasterManaging && handleUserRating(exp.id, star)}
              onMouseEnter={() => !isReadOnlyOrMasterManaging && setHoverRating({...hoverRating, [exp.id]: star})}
              onMouseLeave={() => !isReadOnlyOrMasterManaging && setHoverRating({...hoverRating, [exp.id]: 0})}
              disabled={isReadOnlyOrMasterManaging}
              className={`transition-transform ${isReadOnlyOrMasterManaging ? 'cursor-not-allowed opacity-60' : 'hover:scale-110'}`}
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
                          {t('problem')}
                        </h4>
                        <CategoryBadge label={(() => {
                          const pname = practices.find(p => p.id === exp.practiceId)?.name;
                          return pname && !HIDDEN_PRACTICE_NAMES.includes(pname) ? `${pname} / ${exp.problemCategory}` : exp.problemCategory;
                        })()} />
                      </div>
                      <p className="text-sm text-gray-700">
  {highlightText(exp.problem, filters.searchText ? filters.searchText.toLowerCase().trim().split(/\s+/) : [])}
</p>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-semibold text-blue-600 flex items-center gap-2">
                        <TrendingUp size={16} />
                        {t('action')}
                      </h4>
<p className={`text-sm text-gray-700 ${exp.author === 'key_insights' ? 'whitespace-pre-line' : ''}`}>
  {highlightText(exp.solution, filters.searchText ? filters.searchText.toLowerCase().trim().split(/\s+/) : [])}
</p>
                      </div>
                    <div className="space-y-2">
  <div className="flex items-center justify-between">
    <h4 className="font-semibold text-green-600 flex items-center gap-2">
      <Share2 size={16} />
      {t('result')}
    </h4>
    {exp.author === 'key_insights' && exp.resultCategory === 'varies' ? (
      <span className="text-xs px-3 py-1 rounded-full bg-purple-100 text-purple-800">
        {t('result_varies')}
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
                            >{t('save')}</button>
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
                                title={t('edit_tags')}
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
                        title={t('add_tags')}
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
                        >{t('save')}</button>
                        <button onClick={() => setEditingTags(null)} className="px-2 py-0.5 bg-gray-400 text-white rounded text-xs">✕</button>
                      </div>
                    )}
                    {(() => {
                    const belongsToManagedCompany = exp.companyId === effectiveCompanyId || (!exp.companyId && effectiveCompanyId === defaultCompanyId);
                    const canLinkCommonCase = exp.author !== 'key_insights' && ((isAdmin && !isSeller && belongsToManagedCompany) || (exp.source === 'app' && (appSettings.requireEmployeeLogin ? exp.employeeId === employeeId : true)) || isDemoModeActive || loggedInIsDemoId);
                    return (<>
                    {exp.relatedCommonCaseId && (exp.source === 'uploaded' || exp.source === 'app') && (
  <span className="inline-flex items-center gap-1">
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
    {t('matching_common_case')}
  </button>
  {canLinkCommonCase && (
    <button onClick={() => openLinkCommonCaseModal(exp)} className="text-sm text-gray-500 hover:text-purple-600 px-1" title={t('edit')}>✎</button>
  )}
  </span>
)}
                    {!exp.relatedCommonCaseId && canLinkCommonCase && getMatchingCommonCasesFor(exp).length > 0 && (
                      <button
                        onClick={() => openLinkCommonCaseModal(exp)}
                        className="inline-flex items-center gap-1 text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-full border-2 border-gray-300 hover:bg-purple-100 hover:text-purple-700 hover:border-purple-300 transition-colors cursor-pointer"
                      >
                        <Target size={12} />
                        {t('add_matching_common_case_btn')}
                      </button>
                    )}
                    </>);
                    })()}
                    
                    {(() => {
                      const mappedCount = experiences.filter(e => (e.source === 'uploaded' || e.source === 'app') && e.relatedCommonCaseId === exp.id).length;
                      if (mappedCount > 0) {
                        return (
                          <button
                            onClick={() => showMappedExperiences(exp.id)}
                            className="inline-flex items-center gap-1 text-xs bg-green-100 text-green-800 px-3 py-1 rounded-full border-2 border-green-300 hover:bg-green-200 transition-colors cursor-pointer"
                          >
                            <Users size={12} />
                            {tMatchingExperiences(mappedCount)}
                          </button>
                        );
                      }
                      return null;
                    })()}
                  </div>


                  
                  {isAdmin && activeAdminNavTab !== 'preview' && !isReadOnlyOrMasterManaging && (() => {
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
                            {isConfirming ? t('confirm_delete_click') : t('delete_experience')}
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
                            <span className="text-sm font-medium text-gray-700">{t('set_as_top')}</span>
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
                    {!isReadOnlyOrMasterManaging && (
                    <div className="mb-4">
                      <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                        <MessageCircle size={18} />
                        {t('add_a_comment')}
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
    placeholder={t('share_your_thoughts')}
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
                    alert(t('file_too_large'));
                    e.target.value = '';
                  } else {
                    setCommentCvFiles({...commentCvFiles, [exp.id]: file});
                  }
                }
              }}
              className="hidden"
            />
            {appSettings.documentType === 'cv' ? '📎 CV' : t('file_badge')}
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
                  )}

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
      {showComments[exp.id] === true ? tHideAllComments() : 
 showComments[exp.id] === false ? tShowAllComments(exp.comments.length, true) :
 exp.comments.length === 1 ? tHideAllComments() : tShowAllComments(exp.comments.length, true)}
    </button>
   {showComments[exp.id] === true && (
  <div className="space-y-3">
    {exp.comments.map(comment => (
      <div key={comment.id} className="bg-gray-50 rounded-lg p-3 relative">

{/* By: info - SÓ NO CORP */}
        {appSettings.requireEmployeeLogin && (comment.author || comment.employeeId || comment.country) && (
          <div className="mb-2">
            <span className="text-xs text-gray-600 block">
              {t('by')} {[comment.author, comment.employeeId, comment.country].filter(Boolean).join(', ')}
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
          if (window.confirm(t('confirm_delete_file'))) {
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
        title={t('delete_file_tooltip')}
      >
        ✕
      </button>
    )}
  </div>
)}
          </div>
        )}
        {comment.createdAt && (
          <span className="text-xs text-gray-400 block mb-1">
            {new Date(comment.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
          </span>
        )}
        
        {/* Botão delete admin */}
        {isAdmin && activeAdminNavTab !== 'preview' && !isReadOnlyOrMasterManaging && (() => {
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
              title={t('react_tooltip')}
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
        {/* Delete Comment - só para o dono */}
        {comment.employeeId === employeeId && (
          <button
            onClick={() => {
              if (window.confirm(t('confirm_delete_comment'))) {
                handleDeleteComment(exp.id, comment.id);
              }
            }}
            className="text-red-600 hover:text-red-800 text-xs mt-1 inline-flex items-center gap-1"
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
                {t('by')} {[lastComment.author, lastComment.employeeId, lastComment.country].filter(Boolean).join(', ')}
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
          if (window.confirm(t('confirm_delete_file'))) {
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
        title={t('delete_file_tooltip')}
      >
        ✕
      </button>
    )}
  </div>
)}
            </div>
          )}
          {lastComment.createdAt && (
            <span className="text-xs text-gray-400 block mb-1">
              {new Date(lastComment.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
            </span>
          )}
          
          {/* Botão delete admin */}
          {isAdmin && activeAdminNavTab !== 'preview' && !isReadOnlyOrMasterManaging && (() => {
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
          {/* Reações */}
          <div className="flex flex-wrap gap-1 mt-2 items-center">
            {Object.entries(reactions[lastComment.id] || {}).map(([emoji, ids]) => (
              <button
                key={emoji}
                onClick={() => toggleReaction(lastComment.id, emoji)}
                className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-sm border transition-colors ${ids.includes(employeeId) ? 'bg-purple-100 border-purple-300 text-purple-700' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-100'}`}
              >
                <span>{emoji}</span>
                <span className="text-xs font-medium">{ids.length}</span>
              </button>
            ))}
            <div className="relative group">
              <button
                className="flex items-center justify-center w-7 h-7 rounded-full border border-gray-300 bg-white text-gray-400 hover:border-purple-400 hover:text-purple-500 transition-colors"
                title={t('react_tooltip')}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z"/><path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/></svg>
              </button>
              <div className="hidden group-hover:block absolute bottom-0 left-0 z-50" style={{ paddingBottom: '28px', width: '196px' }}>
                <div className="bg-white border border-gray-200 rounded-xl shadow-xl p-2">
                  <div className="grid grid-cols-7 gap-1">
                    {REACTION_EMOJIS.map(emoji => (
                      <button
                        key={emoji}
                        onClick={() => toggleReaction(lastComment.id, emoji)}
                        className="text-xl hover:scale-125 transition-transform p-0.5 rounded"
                      >{emoji}</button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Delete Comment - só para o dono */}
          {lastComment.employeeId === employeeId && (
            <button
              onClick={() => { if (window.confirm(t('confirm_delete_comment'))) handleDeleteComment(exp.id, lastComment.id); }}
              className="text-red-600 hover:text-red-800 text-xs mt-1 inline-flex items-center gap-1"
            >🗑️ Delete Comment</button>
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
        captureNavSnapshot('share');
        setFollowOnParentId(exp.id);
        // Pré-preencher practice e category do parent — precisa setar as
        // DUAS variáveis (selectedPracticeId controla o que é salvo,
        // shareFormPracticeId controla o que o dropdown mostra visualmente;
        // eram tratadas como uma só por engano, causando a tela mostrar
        // errado mesmo com o valor salvo estando correto).
        if (exp.practiceId) {
          setSelectedPracticeId(exp.practiceId);
          setShareFormPracticeId(exp.practiceId);
        }
        setCurrentEntry(prev => ({
          ...prev,
          problemCategory: exp.problemCategory || ''
        }));
        if (exp.practiceId) loadProblemCategories(exp.practiceId);
        setActiveMainTab('share'); scrollToTabs();
      }}
      className="mt-3 text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
    >
      {t('add_follow_on')}
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
                        {t('browse')}
                      </button>
                      {appSettings.showTop3 && top3VisibleInSession && <>
                      <span className="text-gray-400">•</span>
                      <button
                        onClick={() => { captureNavSnapshot('top3'); document.querySelector('.bg-gradient-to-r.from-purple-100.to-blue-100')?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }}
                        className="text-purple-600 hover:text-purple-800 font-medium transition-colors"
                      >
                        {t('top3_short')}
                      </button>
                      </>}
                      <span className="text-gray-400">•</span>
                      <button
                        onClick={() => { captureNavSnapshot('share'); setActiveMainTab('share'); scrollToTabs(); }}
                        className="text-purple-600 hover:text-purple-800 font-medium transition-colors"
                      >
                        {t('share_your_stories')}
                      </button>
                    </div>
                  </div>

              {isAdmin && activeAdminNavTab !== 'preview' && editingExperience === -1 && (
                  <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-4 mt-4">
                    <h4 className="font-semibold text-gray-800 mb-3">Edit Experience #{exp.id}</h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">{t('problem_category')}</label>
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
                        <label className="block text-sm font-medium mb-1">{t('result_category')}</label>
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
                        <label className="block text-sm font-medium mb-1">{t('problem')}</label>
                        <textarea
                          value={editingData[exp.id]?.problem || exp.problem}
                          onChange={(e) => setEditingData({...editingData, [exp.id]: {...(editingData[exp.id] || exp), problem: e.target.value}})}
                          className="w-full p-2 border-2 border-gray-300 rounded"
                          rows="3"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-1">{t('solution')}</label>
                        <textarea
                          value={editingData[exp.id]?.solution || exp.solution}
                          onChange={(e) => setEditingData({...editingData, [exp.id]: {...(editingData[exp.id] || exp), solution: e.target.value}})}
                          className="w-full p-2 border-2 border-gray-300 rounded"
                          rows="3"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-1">{t('result')}</label>
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
                        <label className="block text-sm font-medium mb-1">{t('author')}</label>
                        <input
                          type="text"
                          value={editingData[exp.id]?.author || exp.author}
                          onChange={(e) => setEditingData({...editingData, [exp.id]: {...(editingData[exp.id] || exp), author: e.target.value}})}
                          className="w-full p-2 border-2 border-gray-300 rounded"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-1">{t('gender')}</label>
                        <select
                          value={editingData[exp.id]?.gender || exp.gender}
                          onChange={(e) => setEditingData({...editingData, [exp.id]: {...(editingData[exp.id] || exp), gender: e.target.value}})}
                          className="w-full p-2 border-2 border-gray-300 rounded"
                        >
                          <option value="">{t("none_option")}</option>
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
                          <option value="">{t("none_option")}</option>
                          {ageOptions.map(a => (
                            <option key={a} value={a}>{a}</option>
                          ))}
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-1">{t('country')}</label>
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
                {tPagination(currentPage, totalPages, indexOfFirstExperience + 1, Math.min(indexOfLastExperience, filteredExperiences.length), filteredExperiences.length)}
              </div>
              <div className="flex items-center gap-2 flex-wrap justify-center">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-white border-2 border-gray-200 rounded-lg font-medium text-gray-700 hover:bg-purple-50 hover:border-purple-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {t('previous')}
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
                  {t('next')}
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
{(!isAdmin || activeAdminNavTab === 'preview') && (
<footer className="mt-12 pt-8 border-t-2 border-gray-200">
  <div className="flex flex-col items-center gap-4">
    <div className="flex gap-3 text-sm flex-wrap justify-center">
  <button 
    onClick={() => setShowModal('how_it_works')}
                className="text-gray-600 hover:text-purple-600 font-medium transition-colors"
              >
                {t('how_it_works')}
              </button>
              <span className="text-gray-300">|</span>
              <button 
                onClick={() => setShowModal('community_guidelines')}
                className="text-gray-600 hover:text-purple-600 font-medium transition-colors"
              >
                {t('community_guidelines')}
              </button>
              <span className="text-gray-300">|</span>
              <button 
                onClick={() => setShowModal('about')}
                className="text-gray-600 hover:text-purple-600 font-medium transition-colors"
              >
                {t('about')}
              </button>
              <span className="text-gray-300">|</span>
              <a
                href="https://portal.whatidid.app"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-purple-600 font-medium transition-colors"
              >
                {t('portal')}
              </a>
              {employeeIsAdmin && (
                <>
                  <span className="text-gray-300">|</span>
                  <button
                    onClick={() => {
                      if (isAdmin) {
                        exitAdminMode();
                      } else {
                        setIsAdmin(true);
                        localStorage.setItem('isAdmin', 'true');
                      }
                    }}
                    className={`font-medium transition-colors flex items-center gap-2 ${isAdmin ? 'text-purple-600' : 'text-gray-600 hover:text-purple-600'}`}
                  >
                    <Shield size={14} />
                    {isAdmin ? t('admin_mode_logout') : t('enter_admin_mode')}
                  </button>
                </>
              )}
            </div>
            <div className="text-sm text-gray-500">
              {t('copyright_notice')}
            </div>
          </div>
        </footer>
)}
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

{/* Popup de linkagem manual de Common Case (não sugerida automaticamente) */}
{linkingExperience && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 max-h-[80vh] overflow-y-auto">
      <h3 className="text-xl font-bold text-gray-800 mb-4">
        🎯 {t('link_common_case_modal_title')}
      </h3>

      {/* Banner com a experience sendo linkada, pra não perder o contexto */}
      <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-3 mb-4">
        <p className="text-xs font-semibold text-purple-700 mb-1">{tLinkingExperience(linkingExperience.problemCategory)}</p>
        <p className="text-sm text-gray-700">{linkingExperience.problem?.substring(0, 120)}{linkingExperience.problem?.length > 120 ? '...' : ''}</p>
      </div>

      <div className="space-y-2 mb-6">
        {getMatchingCommonCasesFor(linkingExperience).map(cc => (
          <label
            key={cc.id}
            className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border-2 border-gray-200 hover:border-purple-400 cursor-pointer transition-all"
          >
            <input
              type="radio"
              name="manualCommonCaseSelection"
              checked={selectedCommonCaseForLink === cc.id}
              onChange={() => setSelectedCommonCaseForLink(cc.id)}
              className="mt-0.5 w-4 h-4 text-purple-600 focus:ring-purple-500"
            />
            <span className="text-sm text-gray-800">{cc.problem.substring(0, 60)}{cc.problem.length > 60 ? '...' : ''}</span>
          </label>
        ))}
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => { setLinkingExperience(null); setSelectedCommonCaseForLink(null); }}
          className="flex-1 px-4 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-semibold transition-colors"
        >
          {t('cancel')}
        </button>
        <button
          onClick={saveManualCommonCaseLink}
          disabled={!selectedCommonCaseForLink}
          className="flex-1 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          ✓ {t('confirm_link_btn')}
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
            aria-label={t('close_video')}
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
          
          <div className="hidden">
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
              <span className="hidden sm:inline">{t('previous_word')}</span>
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
              <span className="hidden sm:inline">{t('next_word')}</span>
              <span className="sm:hidden text-xs">▶</span>
              <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    )}

  {isAdmin && activeAdminNavTab !== 'preview' && editingExperience && (() => {
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
            <label className="block text-sm font-medium mb-1">{t('problem_category')}</label>
            <select value={editingData[exp.id]?.problemCategory || exp.problemCategory} onChange={(e) => setEditingData({...editingData, [exp.id]: {...(editingData[exp.id] || exp), problemCategory: e.target.value}})} className="w-full p-2 border-2 border-gray-300 rounded">
              {problemCategories.map(cat => (<option key={cat} value={cat}>{cat}</option>))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">{t('result_category')}</label>
            <select value={editingData[exp.id]?.resultCategory || exp.resultCategory} onChange={(e) => setEditingData({...editingData, [exp.id]: {...(editingData[exp.id] || exp), resultCategory: e.target.value}})} className="w-full p-2 border-2 border-gray-300 rounded">
              {resultCategories.map(cat => (<option key={cat.value} value={cat.value}>{cat.label}</option>))}
            </select>
          </div>
        </div>
        <div className="space-y-3 mb-4">
          <div>
            <label className="block text-sm font-medium mb-1">{t('problem')}</label>
            <textarea value={editingData[exp.id]?.problem || exp.problem} onChange={(e) => setEditingData({...editingData, [exp.id]: {...(editingData[exp.id] || exp), problem: e.target.value}})} className="w-full p-2 border-2 border-gray-300 rounded" rows="3"/>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">{t('solution')}</label>
            <textarea value={editingData[exp.id]?.solution || exp.solution} onChange={(e) => setEditingData({...editingData, [exp.id]: {...(editingData[exp.id] || exp), solution: e.target.value}})} className="w-full p-2 border-2 border-gray-300 rounded" rows="3"/>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">{t('result')}</label>
            <textarea value={editingData[exp.id]?.result || exp.result} onChange={(e) => setEditingData({...editingData, [exp.id]: {...(editingData[exp.id] || exp), result: e.target.value}})} className="w-full p-2 border-2 border-gray-300 rounded" rows="2"/>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
          <div>
            <label className="block text-sm font-medium mb-1">{t('author')}</label>
            <input type="text" value={editingData[exp.id]?.author || exp.author} onChange={(e) => setEditingData({...editingData, [exp.id]: {...(editingData[exp.id] || exp), author: e.target.value}})} className="w-full p-2 border-2 border-gray-300 rounded"/>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">{t('gender')}</label>
            <select value={editingData[exp.id]?.gender || exp.gender} onChange={(e) => setEditingData({...editingData, [exp.id]: {...(editingData[exp.id] || exp), gender: e.target.value}})} className="w-full p-2 border-2 border-gray-300 rounded">
              <option value="">{t("none_option")}</option>
              {genderOptions.map(g => (<option key={g} value={g}>{g}</option>))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">{t('age')}</label>
            <select value={editingData[exp.id]?.age || exp.age} onChange={(e) => setEditingData({...editingData, [exp.id]: {...(editingData[exp.id] || exp), age: e.target.value}})} className="w-full p-2 border-2 border-gray-300 rounded">
              <option value="">{t("none_option")}</option>
              {ageOptions.map(a => (<option key={a} value={a}>{a}</option>))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">{t('country')}</label>
            <input type="text" value={editingData[exp.id]?.country || exp.country} onChange={(e) => setEditingData({...editingData, [exp.id]: {...(editingData[exp.id] || exp), country: e.target.value}})} className="w-full p-2 border-2 border-gray-300 rounded"/>
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={async () => {
            const updatedExp = editingData[exp.id] || exp;
            // Marca a linha como pertencente à sessão de demo ativa (se
            // houver) — sem isso, editar uma experience sintética real
            // durante a demo e depois trocar idioma escondia a edição,
            // já que a linha continuava com o idioma original. Fora do modo
            // demo, não inclui o campo — preserva o que já estava lá.
            //
            // Antes de marcar, se essa linha AINDA NÃO pertence à sessão de
            // demo (ou seja, é a primeira vez que está sendo "emprestada"
            // durante essa sessão), guarda uma cópia do conteúdo original —
            // sem isso, limpar a sessão de demo apagaria a linha inteira
            // (não só a edição), já que ficaria com o mesmo demo_session_id
            // de qualquer conteúdo criado do zero durante a demo.
            let snapshotForUpdate = {};
            if (isDemoModeActive && !exp.demoSessionId) {
              snapshotForUpdate = {
                demo_edit_original_snapshot: {
                  problem: exp.problem, problem_category: exp.problemCategory,
                  solution: exp.solution, result: exp.result,
                  result_category: exp.resultCategory, author: exp.author,
                  gender: exp.gender, age: exp.age, country: exp.country,
                  related_common_case_id: exp.relatedCommonCaseId
                }
              };
            }
            const { error } = await supabase.from('experiences').update({
              problem: updatedExp.problem, problem_category: updatedExp.problemCategory,
              solution: updatedExp.solution, result: updatedExp.result,
              result_category: updatedExp.resultCategory, author: updatedExp.author,
              gender: updatedExp.gender, age: updatedExp.age, country: updatedExp.country,
              ...(isDemoModeActive ? { demo_session_id: await ensureDemoSessionId() } : {}),
              ...snapshotForUpdate
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
            <h3 className="text-xl font-bold text-gray-800">{t('set_your_new_password')}</h3>
            <p className="text-sm text-gray-500 mt-1">{t('temp_password_notice')}</p>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('new_password')}</label>
              <input
                type="password"
                value={changePasswordNew}
                onChange={(e) => setChangePasswordNew(e.target.value)}
                className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
                placeholder={t('at_least_6_chars')}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('confirm_password')}</label>
              <input
                type="password"
                value={changePasswordConfirm}
                onChange={(e) => setChangePasswordConfirm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleChangePassword()}
                className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
                placeholder={t('repeat_your_password')}
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
              {t('save_new_password')}
            </button>
            <button
              onClick={() => setShowChangePassword(false)}
              className="w-full text-gray-500 hover:text-gray-700 text-sm py-1"
            >
              {t('skip_for_now')}
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
            <h3 className="text-lg font-semibold">{t('cv_preview')}</h3>
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
              title={t('cv_preview_tooltip')}
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
              {t('download_pdf')}
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
        <h3 className="font-semibold text-gray-800 text-base">{t('category_guide')}</h3>
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
                <h3 className="text-lg font-bold text-gray-800">{t('add_icon_home_screen')}</h3>
                <button onClick={() => setShowIosInstallModal(false)} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">×</button>
              </div>
                            <div className="space-y-4 text-sm text-gray-700">
                <p>{t('to_add_icon')}</p>
                <div className="flex items-center gap-3">
                  <span className="flex-shrink-0 w-7 h-7 bg-purple-100 text-purple-700 rounded-full flex items-center justify-center font-bold">1</span>
                  <img src="data:image/png;base64,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" alt="More options" width="22" height="22" style={{ flexShrink: 0 }} />
                  <span>{t('tap_dots_button')}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="flex-shrink-0 w-7 h-7 bg-purple-100 text-purple-700 rounded-full flex items-center justify-center font-bold">2</span>
                  <img src="data:image/png;base64,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" alt="Share" width="20" height="20" style={{ flexShrink: 0 }} />
                  <span>{t('tap_share')}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="flex-shrink-0 w-7 h-7 bg-purple-100 text-purple-700 rounded-full flex items-center justify-center font-bold">3</span>
                  <img src="data:image/png;base64,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" alt="Add to Home Screen" width="20" height="20" style={{ flexShrink: 0 }} />
                  <span>{t('tap_add_home_screen')}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="flex-shrink-0 w-7 h-7 bg-purple-100 text-purple-700 rounded-full flex items-center justify-center font-bold">4</span>
                  <img src="data:image/png;base64,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" alt="Add" width="44" height="28" style={{ flexShrink: 0 }} />
                  <span>{t('tap_add_done')}</span>
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
