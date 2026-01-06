import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { WEBAPI, API_CONFIG } from '../../config';
import { getUserId } from '../../utils/auth';
import returnIcon from '../../assets/return.svg';
import './FormDataView.css';

/**
 * 表单数据查看页面
 */
const FormDataView = () => {
  const { formId } = useParams();
  const navigate = useNavigate();
  
  const [form, setForm] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [stats, setStats] = useState(null);
  const [questions, setQuestions] = useState([]);
  
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // 加载表单信息
  useEffect(() => {
    loadFormInfo();
  }, [formId]);

  // 加载提交数据
  useEffect(() => {
    loadSubmissions();
    loadStats();
  }, [formId, startDate, endDate, currentPage]);

  const loadFormInfo = async () => {
    try {
      const response = await axios.get(WEBAPI.getFormById(formId), {
        timeout: API_CONFIG.timeout,
      });

      if (response.data.success) {
        const formData = response.data.data;
        
        // 验证权限
        const userId = getUserId();
        if (formData.createUserId !== userId) {
          setError('您没有权限查看此表单的数据');
          return;
        }

        setForm(formData);
        
        // 提取所有问题
        const allQuestions = [];
        Object.values(formData.jsonSchema).forEach(survey => {
          if (survey.questions) {
            survey.questions.forEach(q => {
              allQuestions.push({
                id: q.id,
                question: q.question
              });
            });
          }
        });
        setQuestions(allQuestions);
      } else {
        setError(response.data.error?.message || '加载表单失败');
      }
    } catch (err) {
      setError(err.message || '加载表单时发生错误');
    }
  };

  const loadSubmissions = async () => {
    try {
      setIsLoading(true);
      setError('');

      const params = {
        page: currentPage,
        limit: 20,
      };

      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const response = await axios.get(WEBAPI.getFormSubmissions(formId), {
        params,
        timeout: API_CONFIG.timeout,
      });

      if (response.data.success) {
        setSubmissions(response.data.data);
        setPagination(response.data.pagination);
      } else {
        setError(response.data.error?.message || '加载数据失败');
      }
    } catch (err) {
      setError(err.message || '加载数据时发生错误');
    } finally {
      setIsLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const params = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const response = await axios.get(WEBAPI.getFormSubmissionStats(formId), {
        params,
        timeout: API_CONFIG.timeout,
      });

      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (err) {
      console.error('加载统计数据失败:', err);
    }
  };

  // 格式化时间
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  // 获取答案文本
  const getAnswerText = (questionId, responseData) => {
    const answer = responseData[questionId];
    if (!answer) return '-';
    
    if (Array.isArray(answer)) {
      return answer.join(', ');
    }
    
    // 确保返回字符串类型
    return String(answer);
  };

  // 导出 CSV - 导出所有数据（不仅仅是当前页）
  const exportToCSV = async () => {
    if (!stats || stats.total === 0) {
      alert('没有数据可导出');
      return;
    }

    try {
      // 获取所有数据（不分页）
      const params = {
        page: 1,
        limit: stats.total, // 获取所有记录
      };

      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const response = await axios.get(WEBAPI.getFormSubmissions(formId), {
        params,
        timeout: API_CONFIG.timeout,
      });

      if (!response.data.success || response.data.data.length === 0) {
        alert('获取数据失败');
        return;
      }

      const allSubmissions = response.data.data;

      // 构建 CSV 内容
      const headers = ['提交时间', 'IP地址', ...questions.map(q => q.question)];
      const csvRows = [];
      
      // 添加 BOM 以支持中文
      csvRows.push('\uFEFF');
      
      // 添加表头
      csvRows.push(headers.map(h => `"${h}"`).join(','));
      
      // 添加数据行
      allSubmissions.forEach(submission => {
        const row = [
          formatDate(submission.submittedAt),
          submission.ipAddress || '-',
          ...questions.map(q => {
            const answer = getAnswerText(q.id, submission.responseData);
            // 确保 answer 是字符串，然后转义双引号
            const answerStr = String(answer);
            return `"${answerStr.replace(/"/g, '""')}"`;
          })
        ];
        csvRows.push(row.join(','));
      });

      // 创建 Blob 并下载
      const csvContent = csvRows.join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
      const filename = `${form?.title || '表单'}_提交数据_${timestamp}.csv`;
      
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // 清理 URL 对象
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('导出失败:', err);
      alert('导出失败，请稍后重试');
    }
  };

  // 应用筛选
  const handleFilter = () => {
    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      alert('开始时间不能晚于结束时间');
      return;
    }
    setCurrentPage(1);
    loadSubmissions();
    loadStats();
  };

  // 清空筛选
  const handleClearFilter = () => {
    setStartDate('');
    setEndDate('');
    setCurrentPage(1);
  };

  if (error && !form) {
    return (
      <div className="data-view-container">
        <div className="error-state">
          <div className="error-icon">❌</div>
          <h2>{error}</h2>
          <button className="back-button-large" onClick={() => navigate('/space')}>
            返回列表
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="data-view-container">
      <header className="data-view-header">
        <button className="back-button" onClick={() => navigate('/space')}>
          <img src={returnIcon} alt="返回" className="back-icon" />
        </button>
        <div className="header-info">
          <h1>{form?.title}</h1>
          <p className="form-description">{form?.description}</p>
        </div>
      </header>

      <main className="data-view-main">
        {/* 统计概览 */}
        {stats && (
          <div className="stats-overview">
            <div className="stat-card">
              <div className="stat-label">总提交数</div>
              <div className="stat-value">{stats.total}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">最早提交</div>
              <div className="stat-value">{formatDate(stats.earliest)}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">最近提交</div>
              <div className="stat-value">{formatDate(stats.latest)}</div>
            </div>
          </div>
        )}

        {/* 筛选和导出工具栏 */}
        <div className="toolbar">
          <div className="filter-section">
            <label>
              开始时间：
              <input
                type="datetime-local"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </label>
            <label>
              结束时间：
              <input
                type="datetime-local"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </label>
            <button className="filter-button" onClick={handleFilter}>
              筛选
            </button>
            <button className="clear-button" onClick={handleClearFilter}>
              清空
            </button>
          </div>
          <button className="export-button" onClick={exportToCSV}>
            📥 导出 CSV
          </button>
        </div>

        {/* 数据表格 */}
        {isLoading ? (
          <div className="loading">加载中...</div>
        ) : submissions.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📊</div>
            <p>暂无提交数据</p>
          </div>
        ) : (
          <>
            <div className="data-table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th className="sticky-col">提交时间</th>
                    <th>IP地址</th>
                    {questions.map((q) => (
                      <th key={q.id}>{q.question}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {submissions.map((submission) => (
                    <tr key={submission.submissionId}>
                      <td className="sticky-col">{formatDate(submission.submittedAt)}</td>
                      <td>{submission.ipAddress || '-'}</td>
                      {questions.map((q) => (
                        <td key={q.id}>{getAnswerText(q.id, submission.responseData)}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 分页 */}
            {pagination && pagination.totalPages > 1 && (
              <div className="pagination">
                <button
                  className="page-btn"
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  上一页
                </button>
                <span className="page-info">
                  第 {currentPage} / {pagination.totalPages} 页 （共 {pagination.total} 条记录）
                </span>
                <button
                  className="page-btn"
                  onClick={() => setCurrentPage((prev) => Math.min(pagination.totalPages, prev + 1))}
                  disabled={currentPage === pagination.totalPages}
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

export default FormDataView;
