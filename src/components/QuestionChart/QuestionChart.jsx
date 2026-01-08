import { useState } from 'react';
import { PieChart, Pie, BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './QuestionChart.css';

/**
 * 问题统计图表组件
 * 支持表格、饼图、柱状图、条形图展示
 */
const QuestionChart = ({ data }) => {
  const [showPie, setShowPie] = useState(false);
  const [showBar, setShowBar] = useState(false);
  const [showHorizontalBar, setShowHorizontalBar] = useState(false);

  // 颜色配置
  const COLORS = ['#8BC34A', '#4CAF50', '#66BB6A', '#81C784', '#A5D6A7', '#C8E6C9'];

  // 准备图表数据
  const chartData = data.options.map(option => ({
    name: option.text,
    value: option.count,
    percentage: parseFloat(option.percentage)
  }));

  return (
    <div className="question-chart">
      <div className="chart-header">
        <h3 className="chart-title">{data.question}</h3>
        <div className="chart-controls">
          <button 
            className={`chart-btn ${showPie ? 'active' : ''}`}
            onClick={() => setShowPie(!showPie)}
          >
            饼图
          </button>
          <button 
            className={`chart-btn ${showBar ? 'active' : ''}`}
            onClick={() => setShowBar(!showBar)}
          >
            柱状图
          </button>
          <button 
            className={`chart-btn ${showHorizontalBar ? 'active' : ''}`}
            onClick={() => setShowHorizontalBar(!showHorizontalBar)}
          >
            条形图
          </button>
        </div>
      </div>

      {/* 表格展示（常驻） */}
      <div className="chart-table-wrapper">
        <table className="chart-table">
          <thead>
            <tr>
              <th>选项</th>
              <th>选择人数</th>
              <th>总人数</th>
              <th>比例</th>
            </tr>
          </thead>
          <tbody>
            {data.options.map((option, index) => (
              <tr key={option.id}>
                <td>{option.text}</td>
                <td>{option.count}</td>
                <td>{data.totalResponses}</td>
                <td>{option.percentage}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 饼图 */}
      {showPie && (
        <div className="chart-container">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percentage }) => `${name}: ${percentage}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* 柱状图 */}
      {showBar && (
        <div className="chart-container">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#8BC34A" name="选择人数" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* 条形图（横向） */}
      {showHorizontalBar && (
        <div className="chart-container">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" width={150} />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#8BC34A" name="选择人数" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default QuestionChart;
