import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { WEBAPI, API_CONFIG } from '../../config';
import { getUserId, getUserInfo, clearUserInfo } from '../../utils/auth';
import './Space.css';

const Space = () => {
  const navigate = useNavigate();
  const [forms, setForms] = useState([]);
  const [filteredForms, setFilteredForms] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'starred', 'trash'
  const itemsPerPage = 10;

  const userInfo = getUserInfo();

  // 加载表单列表
  const loadForms = async () => {
    try {
      setIsLoading(true);
      setError('');
      const userId = getUserId();

      const response = await axios.get(WEBAPI.getAllForms, {
        params: { userId, type: activeTab },
        timeout: API_CONFIG.timeout,
      });

      if (response.data.success) {
        setForms(response.data.data);
        setFilteredForms(response.data.data);
      } else {
        setError(response.data.error?.message || '加载表单失败');
      }
    } catch (err) {
      setError(err.message || '加载表单时发生错误');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadForms();
  }, [activeTab]);

  // 搜索功能
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredForms(forms);
      setCurrentPage(1);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = forms.filter(
      (form) =>
        form.title.toLowerCase().includes(query) ||
        form.formId.toLowerCase().includes(query)
    );
    setFilteredForms(filtered);
    setCurrentPage(1);
  }, [searchQuery, forms]);

  // 分页逻辑
  const totalPages = Math.ceil(filteredForms.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentForms = filteredForms.slice(startIndex, endIndex);

  // 格式化时间
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // 获取状态标签
  const getStatusBadge = (status) => {
    const statusMap = {
      draft: { text: '草稿', className: 'status-draft' },
      active: { text: '已发布', className: 'status-active' },
      deleted: { text: '已删除', className: 'status-deleted' },
    };
    const statusInfo = statusMap[status] || { text: status, className: '' };
    return <span className={`status-badge ${statusInfo.className}`}>{statusInfo.text}</span>;
  };

  // 编辑表单
  const handleEdit = (form) => {
    // 检查表单是否已发布
    if (form.status === 'active') {
      alert('该表单正在发布中，请先停用后再进行编辑');
      return;
    }
    navigate(`/form/create?id=${form.formId}`);
  };

  // 查看链接
  const handleViewLink = (form) => {
    const fullUrl = `${window.location.origin}/form/${form.url}`;
    navigator.clipboard.writeText(fullUrl);
    alert(`表单链接已复制到剪贴板：\n${fullUrl}`);
  };

  // 发布/停用表单
  const handleTogglePublish = async (form) => {
    try {
      const newStatus = form.status === 'active' ? 'draft' : 'active';
      const response = await axios.put(
        WEBAPI.updateForm(form.formId),
        { status: newStatus },
        { timeout: API_CONFIG.timeout }
      );

      if (response.data.success) {
        loadForms();
      } else {
        alert(response.data.error?.message || '操作失败');
      }
    } catch (err) {
      alert(err.message || '操作失败');
    }
  };

  // 删除表单（移入回收站）
  const handleDelete = async (form) => {
    if (form.status === 'active') {
      alert('已发布的表单不可直接删除，请先停用');
      return;
    }

    if (!window.confirm(`确定要将表单"${form.title}"移入回收站吗？`)) {
      return;
    }

    try {
      const response = await axios.delete(WEBAPI.deleteForm(form.formId), {
        timeout: API_CONFIG.timeout,
      });

      if (response.data.success) {
        loadForms();
      } else {
        alert(response.data.error?.message || '删除失败');
      }
    } catch (err) {
      alert(err.message || '删除失败');
    }
  };

  // 永久删除表单
  const handlePermanentDelete = async (form) => {
    if (!window.confirm(`确定要永久删除表单"${form.title}"吗？此操作不可恢复！`)) {
      return;
    }

    try {
      const response = await axios.delete(WEBAPI.permanentDeleteForm(form.formId), {
        timeout: API_CONFIG.timeout,
      });

      if (response.data.success) {
        loadForms();
      } else {
        alert(response.data.error?.message || '永久删除失败');
      }
    } catch (err) {
      alert(err.message || '永久删除失败');
    }
  };

  // 恢复表单
  const handleRestore = async (form) => {
    try {
      const response = await axios.put(
        WEBAPI.restoreForm(form.formId),
        {},
        { timeout: API_CONFIG.timeout }
      );

      if (response.data.success) {
        loadForms();
      } else {
        alert(response.data.error?.message || '恢复失败');
      }
    } catch (err) {
      alert(err.message || '恢复失败');
    }
  };

  // 切换星标
  const handleToggleStar = async (form) => {
    try {
      const response = await axios.put(
        WEBAPI.toggleStarForm(form.formId),
        {},
        { timeout: API_CONFIG.timeout }
      );

      if (response.data.success) {
        loadForms();
      } else {
        alert(response.data.error?.message || '操作失败');
      }
    } catch (err) {
      alert(err.message || '操作失败');
    }
  };

  // 退出登录
  const handleLogout = () => {
    clearUserInfo();
    navigate('/', { replace: true });
  };

  return (
    <div className="space-container">
      <header className="space-header">
        <div className="header-left">
          <div className="logo">📋</div>
          <h1>Fast Form</h1>
        </div>
        <div className="header-right">
          <span className="user-info">👤 {userInfo?.username}</span>
          <button className="logout-button" onClick={handleLogout}>
            退出登录
          </button>
        </div>
      </header>

      <main className="space-main">
        <div className="space-tabs">
          <button
            className={`tab-button ${activeTab === 'all' ? 'active' : ''}`}
            onClick={() => setActiveTab('all')}
          >
            全部问卷
          </button>
          <button
            className={`tab-button ${activeTab === 'starred' ? 'active' : ''}`}
            onClick={() => setActiveTab('starred')}
          >
            ⭐ 星标问卷
          </button>
          <button
            className={`tab-button ${activeTab === 'trash' ? 'active' : ''}`}
            onClick={() => setActiveTab('trash')}
          >
            🗑️ 回收站
          </button>
        </div>

        <div className="space-toolbar">
          <div className="toolbar-left">
            <h2>
              {activeTab === 'all' && '全部问卷'}
              {activeTab === 'starred' && '星标问卷'}
              {activeTab === 'trash' && '回收站'}
            </h2>
            <span className="form-count">共 {filteredForms.length} 个表单</span>
          </div>
          <div className="toolbar-right">
            <input
              type="text"
              className="search-input"
              placeholder="搜索表单标题或 ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {activeTab !== 'trash' && (
              <button className="create-button" onClick={() => navigate('/form/create')}>
                + 新建表单
              </button>
            )}
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}

        {isLoading ? (
          <div className="loading">加载中...</div>
        ) : currentForms.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📝</div>
            <p>
              {searchQuery ? '没有找到匹配的表单' : '还没有创建任何表单'}
            </p>
            {!searchQuery && (
              <button className="create-button" onClick={() => navigate('/form/create')}>
                创建第一个表单
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="forms-table">
              <table>
                <thead>
                  <tr>
                    <th>表单标题</th>
                    <th>表单 ID</th>
                    {activeTab !== 'trash' && <th>状态</th>}
                    {activeTab !== 'trash' && <th>答卷数量</th>}
                    <th>创建时间</th>
                    <th>最后修改</th>
                    <th>操作</th>
                  </tr>
                </thead>
                <tbody>
                  {currentForms.map((form) => (
                    <tr key={form.formId}>
                      <td className="form-title">
                        <div className="title-cell">
                          <strong>{form.title}</strong>
                          {form.description && (
                            <span className="form-description">{form.description}</span>
                          )}
                        </div>
                      </td>
                      <td className="form-id">
                        <code>{form.formId.substring(0, 8)}...</code>
                      </td>
                      {activeTab !== 'trash' && <td>{getStatusBadge(form.status)}</td>}
                      {activeTab !== 'trash' && (
                        <td className="response-count">
                          <span className="count-badge">{form.responseCount || 0}</span>
                        </td>
                      )}
                      <td>{formatDate(form.createdAt)}</td>
                      <td>{formatDate(form.updatedAt)}</td>
                      <td className="actions">
                        {activeTab === 'trash' ? (
                          <>
                            <button
                              className="action-btn restore-btn"
                              onClick={() => handleRestore(form)}
                              title="恢复"
                            >
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="23 4 23 10 17 10"></polyline>
                                <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
                              </svg>
                            </button>
                            <button
                              className="action-btn delete-btn"
                              onClick={() => handlePermanentDelete(form)}
                              title="永久删除"
                            >
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="3 6 5 6 21 6"></polyline>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                <line x1="10" y1="11" x2="10" y2="17"></line>
                                <line x1="14" y1="11" x2="14" y2="17"></line>
                              </svg>
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              className={`action-btn star-btn ${form.isStarred ? 'starred' : ''}`}
                              onClick={() => handleToggleStar(form)}
                              title={form.isStarred ? '取消星标' : '添加星标'}
                            >
                              <svg width="18" height="18" viewBox="0 0 24 24" fill={form.isStarred ? 'currentColor' : 'none'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                              </svg>
                            </button>
                            <button
                              className="action-btn edit-btn"
                              onClick={() => handleEdit(form)}
                              title="编辑"
                            >
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                              </svg>
                            </button>
                            <button
                              className="action-btn data-btn"
                              onClick={() => navigate(`/form/${form.formId}/data`)}
                              title="查看数据"
                            >
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="18" y1="20" x2="18" y2="10"></line>
                                <line x1="12" y1="20" x2="12" y2="4"></line>
                                <line x1="6" y1="20" x2="6" y2="14"></line>
                              </svg>
                            </button>
                            <button
                              className="action-btn link-btn"
                              onClick={() => handleViewLink(form)}
                              title="复制链接"
                            >
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
                              </svg>
                            </button>
                            <button
                              className="action-btn publish-btn"
                              onClick={() => handleTogglePublish(form)}
                              title={form.status === 'active' ? '停用' : '发布'}
                            >
                              {form.status === 'active' ? (
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <rect x="6" y="4" width="4" height="16"></rect>
                                  <rect x="14" y="4" width="4" height="16"></rect>
                                </svg>
                              ) : (
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <polygon points="5 3 19 12 5 21 5 3"></polygon>
                                </svg>
                              )}
                            </button>
                            <button
                              className="action-btn delete-btn"
                              onClick={() => handleDelete(form)}
                              title="删除"
                              disabled={form.status === 'active'}
                            >
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="3 6 5 6 21 6"></polyline>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                              </svg>
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="pagination">
                <button
                  className="page-btn"
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  上一页
                </button>
                <span className="page-info">
                  第 {currentPage} / {totalPages} 页
                </span>
                <button
                  className="page-btn"
                  onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  下一页
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default Space;