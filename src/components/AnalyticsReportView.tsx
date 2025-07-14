import React, { useEffect, useState, useRef } from 'react';
import { Download, ArrowLeft } from 'lucide-react';
import { Chart } from 'chart.js/auto';
import jsPDF from 'jspdf';
import { showToast } from '../utils/toastUtils';

interface LogEntry {
  id: number;
  user_id: number;
  action_type: string;
  description: string;
  timestamp: string;
}

interface User {
  id: number;
  username: string;
  role: string;
}

interface AnalyticsReportViewProps {
  logs: LogEntry[];
  users: User[];
  onClose: () => void;
}

const AnalyticsReportView: React.FC<AnalyticsReportViewProps> = ({ logs, users, onClose }) => {
  const [isLoading, setIsLoading] = useState(false);

  const renderChart = (chartRef: React.RefObject<HTMLCanvasElement>, data: any, type: string, options: any) => {
    if (!chartRef.current) return null;
    
    const ctx = chartRef.current.getContext('2d');
    if (!ctx) return null;
    
    return new Chart(ctx, {
      type: type as any,
      data,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        ...options
      }
    });
  };
  
  // Chart refs
  const visitsChartRef = useRef<HTMLCanvasElement>(null);
  const userRolesChartRef = useRef<HTMLCanvasElement>(null);
  const activityChartRef = useRef<HTMLCanvasElement>(null);
  const dailyActivityChartRef = useRef<HTMLCanvasElement>(null);

  // Chart instances
  const visitsChartInstance = useRef<any>(null);
  const userRolesChartInstance = useRef<any>(null);
  const activityChartInstance = useRef<any>(null);
  const dailyActivityChartInstance = useRef<any>(null);

  // Calculate analytics data
  const totalUsers = users.length;
  const operators = users.filter(u => u.role === 'operator').length;
  const regularUsers = users.filter(u => u.role === 'user').length;
  const supervisors = users.filter(u => u.role === 'supervisor').length;
  
  const today = new Date().toDateString();
  const todayLogs = logs.filter(log => new Date(log.timestamp).toDateString() === today);

  // Website visits tracking (login events)
  const loginLogs = logs.filter(log => log.action_type === 'login');
  const totalWebsiteVisits = loginLogs.length;
  const todayVisits = loginLogs.filter(log => new Date(log.timestamp).toDateString() === today).length;
  const thisWeekStart = new Date();
  thisWeekStart.setDate(thisWeekStart.getDate() - 7);
  const weeklyVisits = loginLogs.filter(log => new Date(log.timestamp) >= thisWeekStart).length;
  const thisMonthStart = new Date();
  thisMonthStart.setDate(1);
  const monthlyVisits = loginLogs.filter(log => new Date(log.timestamp) >= thisMonthStart).length;

  // Unique visitors
  const uniqueVisitors = new Set(loginLogs.map(log => log.user_id)).size;
  const todayUniqueVisitors = new Set(
    loginLogs.filter(log => new Date(log.timestamp).toDateString() === today)
      .map(log => log.user_id)
  ).size;

  // Action type distribution
  const actionCounts = logs.reduce((acc, log) => {
    acc[log.action_type] = (acc[log.action_type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Daily activity for the last 7 days
  const getDailyActivity = () => {
    const dailyData = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateString = date.toDateString();
      const count = logs.filter(log => new Date(log.timestamp).toDateString() === dateString).length;
      dailyData.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        count
      });
    }
    return dailyData;
  };

  const dailyActivity = getDailyActivity();

  const currentDate = new Date();
  const dateRange = `Analytics Report - ${currentDate.toLocaleDateString()}`;

  // Initialize charts
  useEffect(() => {
    const renderCharts = async () => {
      const Chart = (await import('chart.js/auto')).default;

      const renderChart = (
        ref: React.RefObject<HTMLCanvasElement>,
        data: any,
        type: import('chart.js').ChartType,
        options?: any
      ) => {
        const ctx = ref.current?.getContext('2d');
        if (!ctx) return null;
        return new Chart(ctx, { type, data, options });
      };

      // Cleanup existing charts
      [visitsChartInstance, userRolesChartInstance, activityChartInstance, dailyActivityChartInstance].forEach(instance => {
        if (instance.current) {
          instance.current.destroy();
        }
      });

      // Website Visits Chart (Doughnut)
      if (visitsChartRef.current) {
        const visitsData = {
          labels: ['Today', 'This Week', 'This Month', 'Total'],
          datasets: [{
            data: [todayVisits, weeklyVisits, monthlyVisits, totalWebsiteVisits],
            backgroundColor: [
              '#10b981', // green
              '#8b5cf6', // purple
              '#f59e0b', // orange
              '#3b82f6'  // blue
            ],
            borderWidth: 2,
            borderColor: '#ffffff'
          }]
        };
        
        visitsChartInstance.current = renderChart(visitsChartRef, visitsData, 'doughnut', {
          responsive: true,
          plugins: {
            legend: { position: 'bottom', labels: { font: { size: 10 }, boxWidth: 12 } },
            title: { display: true, text: 'Website Visits Distribution' }
          }
        });
      }

      // User Roles Chart (Pie)
      if (userRolesChartRef.current) {
        const rolesData = {
          labels: ['Supervisors', 'Operators', 'Users'],
          datasets: [{
            data: [supervisors, operators, regularUsers],
            backgroundColor: [
              '#ef4444', // red
              '#10b981', // green
              '#8b5cf6'  // purple
            ],
            borderWidth: 2,
            borderColor: '#ffffff'
          }]
        };
        
        userRolesChartInstance.current = renderChart(userRolesChartRef, rolesData, 'pie', {
          responsive: true,
          plugins: {
            legend: { position: 'bottom', labels: { font: { size: 10 }, boxWidth: 12 } },
            title: { display: true, text: 'User Roles Distribution' }
          }
        });
      }

      // Activity Distribution Chart (Bar)
      if (activityChartRef.current) {
        const actionLabels = Object.keys(actionCounts).map(action => 
          action.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
        );
        const actionData = Object.values(actionCounts);

        const activityData = {
          labels: actionLabels,
          datasets: [{
            label: 'Activity Count',
            data: actionData,
            backgroundColor: [
              '#3b82f6', '#10b981', '#f59e0b', '#ef4444', 
              '#8b5cf6', '#06b6d4', '#84cc16', '#f97316'
            ],
            borderWidth: 1,
            borderColor: '#ffffff'
          }]
        };
        
        activityChartInstance.current = renderChart(activityChartRef, activityData, 'bar', {
          responsive: true,
          scales: { y: { beginAtZero: true } },
          plugins: {
            legend: { display: false },
            title: { display: true, text: 'Activity Types Distribution' }
          }
        });
      }

      // Daily Activity Chart (Line)
      if (dailyActivityChartRef.current) {
        const dailyData = {
          labels: dailyActivity.map(d => d.date),
          datasets: [{
            label: 'Daily Activity',
            data: dailyActivity.map(d => d.count),
            borderColor: '#3b82f6',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            borderWidth: 3,
            fill: true,
            tension: 0.4,
            pointBackgroundColor: '#3b82f6',
            pointBorderColor: '#ffffff',
            pointBorderWidth: 2,
            pointRadius: 6
          }]
        };
        
        dailyActivityChartInstance.current = renderChart(dailyActivityChartRef, dailyData, 'line', {
          responsive: true,
          scales: { y: { beginAtZero: true } },
          plugins: {
            legend: { display: false },
            title: { display: true, text: 'Daily Activity (Last 7 Days)' }
          }
        });
      }
    };

    renderCharts();
  }, [logs, users, todayVisits, weeklyVisits, monthlyVisits, totalWebsiteVisits, supervisors, operators, regularUsers, actionCounts, dailyActivity]);

  // Download PDF function
  const downloadReportAsPDF = async () => {
    try {
      // Dynamic import for jsPDF
      const { default: jsPDF } = await import('jspdf');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'legal'
      });
      
      // Generate PDF content (same as before but with chart images)
      const pageWidth = pdf.internal.pageSize.getWidth();
      let yPosition = 20;
      
      // Title
      pdf.setFontSize(20);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Brgy. Talipapa Farm and MRF', pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 10;
      
      pdf.setFontSize(16);
      pdf.text('Web Analytics Report', pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 8;
      
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      const currentDate = new Date().toLocaleDateString();
      pdf.text(`Generated on: ${currentDate}`, pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 20;

      // Add charts as images
      const addChartToPDF = async (chartRef: React.RefObject<HTMLCanvasElement>, title: string) => {
        if (chartRef.current) {
          const canvas = chartRef.current;
          const imgData = canvas.toDataURL('image/png');
          
          if (yPosition > 300) {
            pdf.addPage();
            yPosition = 20;
          }
          
          pdf.setFontSize(12);
          pdf.setFont('helvetica', 'bold');
          pdf.text(title, 20, yPosition);
          yPosition += 8;
          
          const imgWidth = 120;
          const imgHeight = (canvas.height * imgWidth) / canvas.width;
          pdf.addImage(imgData, 'PNG', 20, yPosition, imgWidth, imgHeight);
          yPosition += imgHeight + 15;
        }
      };

      await addChartToPDF(visitsChartRef, 'Website Visits Distribution');
      await addChartToPDF(userRolesChartRef, 'User Roles Distribution');
      await addChartToPDF(activityChartRef, 'Activity Types Distribution');
      await addChartToPDF(dailyActivityChartRef, 'Daily Activity Trend');

      // Add summary data
      pdf.addPage();
      yPosition = 20;
      
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Summary Statistics', 20, yPosition);
      yPosition += 15;
      
      const summaryData = [
        `Total Website Visits: ${totalWebsiteVisits}`,
        `Today's Visits: ${todayVisits}`,
        `Weekly Visits: ${weeklyVisits}`,
        `Monthly Visits: ${monthlyVisits}`,
        `Unique Visitors: ${uniqueVisitors}`,
        `Today's Unique Visitors: ${todayUniqueVisitors}`,
        `Total Users: ${totalUsers}`,
        `Supervisors: ${supervisors}`,
        `Operators: ${operators}`,
        `Regular Users: ${regularUsers}`
      ];
      
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      summaryData.forEach(line => {
        pdf.text(line, 20, yPosition);
        yPosition += 8;
      });

      // Footer
      const pageHeight = pdf.internal.pageSize.getHeight();
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'italic');
      pdf.text(`© ${new Date().getFullYear()} QCU SBIT1F Group 2 | Barangay Talipapa. All rights reserved.`, 
        pageWidth / 2, pageHeight - 10, { align: 'center' });
      
      pdf.save(`Web_Analytics_Report_${new Date().toISOString().split('T')[0]}.pdf`);
      
      showToast.success("Report Downloaded", "Web Analytics Report has been downloaded successfully.");
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      showToast.error("Download Failed", "Failed to generate PDF report.");
    }
  };

  if (isLoading) {
    return (
      <div className="w-full h-full bg-white rounded-xl shadow-lg p-6 relative flex flex-col overflow-hidden">
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-700 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading analytics report...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      id="analyticsReportContainer"
      className="w-full h-full bg-white rounded-xl shadow-lg p-6 relative flex flex-col overflow-hidden"
    >
      <button
        onClick={onClose}
        className="absolute top-4 left-4 text-gray-500 hover:text-gray-700 flex items-center gap-1 z-10"
      >
        <ArrowLeft className="h-5 w-5" /> <span>Back</span>
      </button>

      <div className="text-center mb-6 mt-4 flex-shrink-0">
        <h2 className="text-2xl font-semibold text-gray-800">
          Brgy. Talipapa Farm and MRF Web Analytics Report
        </h2>
        <p className="text-gray-600">{dateRange}</p>
      </div>

      {/* Scrollable content container */}
      <div className="flex-1 overflow-y-auto space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
            <h3 className="text-sm font-medium text-blue-800">Total Visits</h3>
            <p className="text-2xl font-bold text-blue-600">{totalWebsiteVisits}</p>
          </div>
          <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
            <h3 className="text-sm font-medium text-green-800">Today's Visits</h3>
            <p className="text-2xl font-bold text-green-600">{todayVisits}</p>
          </div>
          <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
            <h3 className="text-sm font-medium text-purple-800">Unique Visitors</h3>
            <p className="text-2xl font-bold text-purple-600">{uniqueVisitors}</p>
          </div>
          <div className="bg-gradient-to-r from-orange-50 to-orange-100 p-4 rounded-lg border border-orange-200">
            <h3 className="text-sm font-medium text-orange-800">Total Users</h3>
            <p className="text-2xl font-bold text-orange-600">{totalUsers}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-50 rounded-lg p-4 shadow">
            <h3 className="font-medium text-gray-800 mb-3">Website Visits Distribution</h3>
            <div className="h-64 flex items-center justify-center">
              <canvas ref={visitsChartRef} className="max-w-full max-h-full"></canvas>
              {totalWebsiteVisits === 0 && (
                <div className="text-gray-500 text-sm">No visit data available</div>
              )}
            </div>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4 shadow">
            <h3 className="font-medium text-gray-800 mb-3">User Roles Distribution</h3>
            <div className="h-64 flex items-center justify-center">
              <canvas ref={userRolesChartRef} className="max-w-full max-h-full"></canvas>
              {totalUsers === 0 && (
                <div className="text-gray-500 text-sm">No user data available</div>
              )}
            </div>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4 shadow">
            <h3 className="font-medium text-gray-800 mb-3">Activity Types Distribution</h3>
            <div className="h-64 flex items-center justify-center">
              <canvas ref={activityChartRef} className="max-w-full max-h-full"></canvas>
              {Object.keys(actionCounts).length === 0 && (
                <div className="text-gray-500 text-sm">No activity data available</div>
              )}
            </div>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4 shadow">
            <h3 className="font-medium text-gray-800 mb-3">Daily Activity Trend</h3>
            <div className="h-64 flex items-center justify-center">
              <canvas ref={dailyActivityChartRef} className="max-w-full max-h-full"></canvas>
              {dailyActivity.every(d => d.count === 0) && (
                <div className="text-gray-500 text-sm">No daily activity data available</div>
              )}
            </div>
          </div>
        </div>

        {/* Detailed Statistics */}
        <div className="bg-gray-50 rounded-lg p-4 shadow">
          <h3 className="font-medium text-gray-800 mb-3">Detailed Statistics</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-white p-3 rounded border">
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Visit Statistics</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Total Visits:</span>
                  <span className="font-medium">{totalWebsiteVisits}</span>
                </div>
                <div className="flex justify-between">
                  <span>Today:</span>
                  <span className="font-medium">{todayVisits}</span>
                </div>
                <div className="flex justify-between">
                  <span>This Week:</span>
                  <span className="font-medium">{weeklyVisits}</span>
                </div>
                <div className="flex justify-between">
                  <span>This Month:</span>
                  <span className="font-medium">{monthlyVisits}</span>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-3 rounded border">
              <h4 className="text-sm font-semibold text-gray-700 mb-2">User Statistics</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Total Users:</span>
                  <span className="font-medium">{totalUsers}</span>
                </div>
                <div className="flex justify-between">
                  <span>Supervisors:</span>
                  <span className="font-medium">{supervisors}</span>
                </div>
                <div className="flex justify-between">
                  <span>Operators:</span>
                  <span className="font-medium">{operators}</span>
                </div>
                <div className="flex justify-between">
                  <span>Regular Users:</span>
                  <span className="font-medium">{regularUsers}</span>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-3 rounded border">
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Activity Summary</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Total Activities:</span>
                  <span className="font-medium">{logs.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Today's Activities:</span>
                  <span className="font-medium">{todayLogs.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Unique Visitors:</span>
                  <span className="font-medium">{uniqueVisitors}</span>
                </div>
                <div className="flex justify-between">
                  <span>Today's Unique:</span>
                  <span className="font-medium">{todayUniqueVisitors}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-4 mt-4 flex-shrink-0">
        <button
          onClick={downloadReportAsPDF}
          className="flex-1 bg-[#8a9b6e] hover:bg-[#7a8b5e] text-white py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-all duration-200 shadow-md hover:shadow-lg"
        >
          <Download className="h-5 w-5" /> Download as PDF
        </button>
        <button
          onClick={onClose}
          className="flex-1 bg-[#b85c57] hover:bg-[#a54c47] text-white py-2 px-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default AnalyticsReportView;
