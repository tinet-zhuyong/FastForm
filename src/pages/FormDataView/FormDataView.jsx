import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import * as XLSX from 'xlsx';
import { WEBAPI, API_CONFIG } from '../../config';
import { getUserId } from '../../utils/auth';
import returnIcon from '../../assets/return.svg';
import QuestionChart from '../../components/QuestionChart/QuestionChart';
import './FormDataView.css';

/**
 * 表单数据查看页面 - 包含数据查询报告和统计分析报告
 */
const FormDataView = () => {
  const { formId } = useParams();
  const navigate = useNavigate();
  
  // 标签页状态
  const [activeTab, setActiveTab] = useState('query'); // 'query' 或 'analytics'
  
  const [form, setForm] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [allSubmissions, setAllSubmissions] = useState([]); // 用于统计分析
  const [stats, setStats] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [questionsWithOptions, setQuestionsWithOptions] = useState([]); // 包含选项的完整问题信息
  
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  
  // 统计分析相关状态
  const [selectedQuestions, setSelectedQuestions] = useState([]); // 用户选择的要分析的问题
  const [analyticsData, setAnalyticsData] = useState({}); // 统计分析数据
  
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
    if (activeTab === 'analytics') {
      loadAllSubmissions();
    }
  }, [formId, startDate, endDate, currentPage, activeTab]);

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
        
        // 提取所有问题（简化版，用于数据查询）
        const allQuestions = [];
        // 提取完整问题信息（包含选项，用于统计分析）
        const fullQuestions = [];
        
        Object.values(formData.jsonSchema).forEach(survey => {
          if (survey.questions) {
            survey.questions.forEach(q => {
              // 简化版问题
              allQuestions.push({
                id: q.id,
                question: q.question
              });
              
              // 完整问题信息
              const questionType = q.options ? 'radio' : 
                                   q.multioptions ? 'checkbox' : 
                                   q.select ? 'select' : 'unknown';
              
              const options = q.options || q.multioptions || q.select || [];
              
              fullQuestions.push({
                id: q.id,
                question: q.question,
                type: questionType,
                options: options
              });
            });
          }
        });
        
        setQuestions(allQuestions);
        setQuestionsWithOptions(fullQuestions);
        
        // 默认选择所有问题进行分析
        setSelectedQuestions(fullQuestions.map(q => q.id));
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
        limit: 10, // 修改为每页10条
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
  
  // 加载所有提交数据用于统计分析
  const loadAllSubmissions = async () => {
    try {
      const params = {
        page: 1,
        limit: 10000, // 获取所有数据
      };

      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const response = await axios.get(WEBAPI.getFormSubmissions(formId), {
        params,
        timeout: API_CONFIG.timeout,
      });

      if (response.data.success) {
        setAllSubmissions(response.data.data);
        // 计算统计数据
        calculateAnalytics(response.data.data);
      }
    } catch (err) {
      console.error('加载所有数据失败:', err);
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
  
  // 计算统计分析数据
  const calculateAnalytics = (submissionsData) => {
    const analytics = {};
    
    questionsWithOptions.forEach(question => {
      if (!selectedQuestions.includes(question.id)) return;
      
      const optionCounts = {};
      let totalResponses = 0;
      
      // 初始化选项计数
      question.options.forEach(option => {
        optionCounts[option.id] = {
          id: option.id,
          text: option.text,
          count: 0,
          percentage: 0
        };
      });
      
      // 统计每个选项的选择次数
      submissionsData.forEach(submission => {
        const answer = submission.responseData[question.id];
        if (answer) {
          totalResponses++;
          if (Array.isArray(answer)) {
            // 多选题
            answer.forEach(optionId => {
              if (optionCounts[optionId]) {
                optionCounts[optionId].count++;
              }
            });
          } else {
            // 单选题或下拉选择
            if (optionCounts[answer]) {
              optionCounts[answer].count++;
            }
          }
        }
      });
      
      // 计算百分比
      Object.keys(optionCounts).forEach(optionId => {
        if (totalResponses > 0) {
          optionCounts[optionId].percentage = 
            ((optionCounts[optionId].count / totalResponses) * 100).toFixed(2);
        }
      });
      
      analytics[question.id] = {
        question: question.question,
        type: question.type,
        totalResponses,
        options: Object.values(optionCounts)
      };
    });
    
    setAnalyticsData(analytics);
  };
  
  // 切换问题选择
  const toggleQuestionSelection = (questionId) => {
    setSelectedQuestions(prev => {
      if (prev.includes(questionId)) {
        return prev.filter(id => id !== questionId);
      } else {
        return [...prev, questionId];
      }
    });
  };
  
  // 应用分析（重新计算）
  const applyAnalytics = () => {
    calculateAnalytics(allSubmissions);
  };
  
  // 导出自定义报表为Excel
  const exportToExcel = () => {
    if (Object.keys(analyticsData).length === 0) {
      alert('没有数据可导出');
      return;
    }
    
    const wb = XLSX.utils.book_new();
    
    // 为每个问题创建一个工作表
    Object.keys(analyticsData).forEach((questionId, index) => {
      const data = analyticsData[questionId];
      const wsData = [
        ['问题', data.question],
        ['总回答数', data.totalResponses],
        [],
        ['选项', '选择人数', '百分比']
      ];
      
      data.options.forEach(option => {
        wsData.push([
          option.text,
          option.count,
          `${option.percentage}%`
        ]);
      });
      
      const ws = XLSX.utils.aoa_to_sheet(wsData);
      XLSX.utils.book_append_sheet(wb, ws, `问题${index + 1}`);
    });
    
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
    const filename = `${form?.title || '表单'}_统计分析_${timestamp}.xlsx`;
    XLSX.writeFile(wb, filename);
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

      {/* 标签页切换 */}
      <div className="tabs-container">
        <button 
          className={`tab-button ${activeTab === 'query' ? 'active' : ''}`}
          onClick={() => setActiveTab('query')}
        >
          数据查询报告
        </button>
        <button 
          className={`tab-button ${activeTab === 'analytics' ? 'active' : ''}`}
          onClick={() => setActiveTab('analytics')}
        >
          统计分析报告
        </button>
      </div>

      <main className="data-view-main">
        {/* 数据查询报告 */}
        {activeTab === 'query' && (
          <div className="query-report">
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
          </div>
        )}

        {/* 统计分析报告 */}
        {activeTab === 'analytics' && (
          <div className="analytics-report">
            {/* 问题选择和操作栏 */}
            <div className="analytics-toolbar">
              <div className="question-selector">
                <h3>选择要分析的问题：</h3>
                <div className="question-checkboxes">
                  {questionsWithOptions.map(question => (
                    <label key={question.id} className="question-checkbox">
                      <input
                        type="checkbox"
                        checked={selectedQuestions.includes(question.id)}
                        onChange={() => toggleQuestionSelection(question.id)}
                      />
                      <span>{question.question}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="analytics-actions">
                <button className="apply-button" onClick={applyAnalytics}>
                  应用分析
                </button>
                <button className="export-button" onClick={exportToExcel}>
                  📥 导出 Excel
                </button>
              </div>
            </div>

            {/* 统计图表 */}
            {Object.keys(analyticsData).length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📈</div>
                <p>请选择问题并点击"应用分析"查看统计结果</p>
              </div>
            ) : (
              <div className="charts-container">
                {Object.keys(analyticsData).map(questionId => (
                  <QuestionChart 
                    key={questionId} 
                    data={analyticsData[questionId]} 
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default FormDataView;
