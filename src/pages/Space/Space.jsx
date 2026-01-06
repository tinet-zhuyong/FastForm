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
  const itemsPerPage = 10;

  const userInfo = getUserInfo();

  // 加载表单列表
  const loadForms = async () => {
    try {
      setIsLoading(true);
      setError('');
      const userId = getUserId();

      const response = await axios.get(WEBAPI.getAllForms, {
        params: { userId },
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
  }, []);

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
  const handleEdit = (formId) => {
    navigate(`/form/create?id=${formId}`);
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

  // 删除表单
  const handleDelete = async (form) => {
    if (form.status === 'active') {
      alert('已发布的表单不可直接删除，请先停用');
      return;
    }

    if (!window.confirm(`确定要删除表单"${form.title}"吗？此操作不可恢复。`)) {
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

  // 退出登录
  const handleLogout = () => {
    clearUserInfo();
    navigate('/');
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
        <div className="space-toolbar">
          <div className="toolbar-left">
            <h2>我的表单</h2>
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
            <button className="create-button" onClick={() => navigate('/form/create')}>
              + 新建表单
            </button>
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
                    <th>状态</th>
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
                      <td>{getStatusBadge(form.status)}</td>
                      <td>{formatDate(form.createdAt)}</td>
                      <td>{formatDate(form.updatedAt)}</td>
                      <td className="actions">
                        <button
                          className="action-btn edit-btn"
                          onClick={() => handleEdit(form.formId)}
                          title="编辑"
                        >
                          ✏️
                        </button>
                        <button
                          className="action-btn data-btn"
                          onClick={() => navigate(`/form/${form.formId}/data`)}
                          title="查看数据"
                        >
                          📊
                        </button>
                        <button
                          className="action-btn link-btn"
                          onClick={() => handleViewLink(form)}
                          title="复制链接"
                        >
                          🔗
                        </button>
                        <button
                          className="action-btn publish-btn"
                          onClick={() => handleTogglePublish(form)}
                          title={form.status === 'active' ? '停用' : '发布'}
                        >
                          {form.status === 'active' ? '⏸️' : '▶️'}
                        </button>
                        <button
                          className="action-btn delete-btn"
                          onClick={() => handleDelete(form)}
                          title="删除"
                          disabled={form.status === 'active'}
                        >
                          🗑️
                        </button>
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