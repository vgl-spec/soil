import React, { useEffect, useState, useRef } from 'react';
import { Download, ArrowLeft } from 'lucide-react';
import { HistoryEntry, Category, ChartData, SummaryData } from '../types';
import { getConsolidatedInventory, formatDate } from '../utils/inventoryUtils';
import { showToast } from '../utils/toastUtils';

interface ReportViewProps {
  historyEntries: HistoryEntry[];
  categories: Category;
  onClose: () => void;
}

const ReportView: React.FC<ReportViewProps> = ({ historyEntries, categories, onClose }) => {
  const [categoryChartData, setCategoryChartData] = useState<ChartData | null>(null);
  const [topItemsChartData, setTopItemsChartData] = useState<ChartData | null>(null);
  const [stockMovementChartData, setStockMovementChartData] = useState<ChartData | null>(null);
  const [summaryData, setSummaryData] = useState<SummaryData[]>([]);
  const [totalData, setTotalData] = useState({ totalItems: 0, totalQuantity: 0, avgStock: 0 });

  const categoryChartRef = useRef<HTMLCanvasElement>(null);
  const topItemsChartRef = useRef<HTMLCanvasElement>(null);
  const stockMovementChartRef = useRef<HTMLCanvasElement>(null);

  const categoryChartInstance = useRef<any>(null);
  const topItemsChartInstance = useRef<any>(null);
  const stockMovementChartInstance = useRef<any>(null);

  const currentDate = new Date();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0, 23, 59, 59, 999);
  const dateRange = `${formatDate(firstDayOfMonth.toISOString())} - ${formatDate(lastDayOfMonth.toISOString())}`;

  useEffect(() => {
    try {
      const consolidatedInventory = getConsolidatedInventory(historyEntries);

      const currentMonthEntries = historyEntries.filter(entry => {
        const entryDate = entry.harvestDate ? new Date(entry.harvestDate) : new Date(0);
        return entryDate >= firstDayOfMonth && entryDate <= lastDayOfMonth;
      });

      // Helper function to find category and subcategory labels by IDs
      const getCategoryLabels = (mainCategoryId: string | number | null, subcategoryId: string | number) => {
        // Convert IDs to strings for comparison
        const mainId = mainCategoryId?.toString();
        const subId = subcategoryId?.toString();

        // Find main category by ID
        let mainLabel = 'Unknown';
        let subLabel = 'Unknown';

        // Search through categories to find matching IDs
        for (const [, categoryData] of Object.entries(categories)) {
          if (categoryData.id?.toString() === mainId) {
            mainLabel = categoryData.label;
            
            // Find subcategory by ID
            for (const [, subData] of Object.entries(categoryData.subcategories)) {
              if (subData.id?.toString() === subId) {
                subLabel = subData.label;
                break;
              }
            }
            break;
          }
        }

        return { mainLabel, subLabel };
      };

      // Prepare category chart data
      const categoryDataMap: Record<string, { quantity: number, unit: string }> = {};

      consolidatedInventory.forEach(item => {
        const { mainLabel, subLabel } = getCategoryLabels(item.mainCategory, item.subcategory);
        const key = `${mainLabel} / ${subLabel}`;

        if (!categoryDataMap[key]) categoryDataMap[key] = { quantity: 0, unit: item.unit };
        categoryDataMap[key].quantity += item.quantity;
      });

      const sortedCategories = Object.entries(categoryDataMap)
        .sort((a, b) => b[1].quantity - a[1].quantity)
        .slice(0, 10);

      setCategoryChartData({
        labels: sortedCategories.map(([key, data]) => `${key} (${data.quantity} ${data.unit})`),
        datasets: [{
          label: 'Quantity',
          data: sortedCategories.map(([, data]) => data.quantity),
          backgroundColor: ["#8a9b6e", "#d4a762", "#6b8c85", "#d77a61", "#92b5a9", "#c6d7a3", "#e6c891", "#a3bfb9", "#e9a48e", "#c1d7cb"],
          borderWidth: 1
        }]
      });

      // Prepare top items chart data
      const topItems = consolidatedInventory.sort((a, b) => b.quantity - a.quantity).slice(0, 5);

      setTopItemsChartData({
        labels: topItems.map(item => `${item.name} (${item.quantity} ${item.unit})`),
        datasets: [{
          label: 'Quantity',
          data: topItems.map(item => item.quantity),
          backgroundColor: "#8a9b6e",
          borderWidth: 0
        }]
      });

      // Prepare stock movement data
      const days = lastDayOfMonth.getDate();
      const dates = Array.from({ length: days }, (_, i) => new Date(currentDate.getFullYear(), currentDate.getMonth(), i + 1));
      const increases = Array(days).fill(0);
      const decreases = Array(days).fill(0);

      currentMonthEntries.forEach(entry => {
        const day = entry.harvestDate ? new Date(entry.harvestDate).getDate() - 1 : 0;
        if (entry.quantity > 0) increases[day] += entry.quantity;
        else decreases[day] += Math.abs(entry.quantity);
      });

      setStockMovementChartData({
        labels: dates.map(d => d.toLocaleDateString()),
        datasets: [
          {
            label: "Stock Added",
            data: increases,
            backgroundColor: "rgba(138, 155, 110, 0.2)",
            borderColor: "#8a9b6e",
            borderWidth: 1,
            fill: true
          },
          {
            label: "Stock Reduced",
            data: decreases,
            backgroundColor: "rgba(215, 122, 97, 0.2)",
            borderColor: "#d77a61",
            borderWidth: 1,
            fill: true
          }
        ]
      });

      // Summary
      const summaryMap: Record<string, SummaryData> = {};

      consolidatedInventory.forEach(item => {
        const { mainLabel, subLabel } = getCategoryLabels(item.mainCategory, item.subcategory);
        const key = `${mainLabel} / ${subLabel}`;

        if (!summaryMap[key]) {
          summaryMap[key] = { 
            category: key, 
            totalItems: 0, 
            totalQuantity: 0, 
            avgStock: 0,
            unit: item.unit || 'pcs'
          };
        }

        summaryMap[key].totalItems += 1;
        summaryMap[key].totalQuantity += item.quantity;
      });

      const summaries = Object.values(summaryMap);
      summaries.forEach(s => s.avgStock = s.totalItems > 0 ? s.totalQuantity / s.totalItems : 0);

      const sortedSummaries = summaries.sort((a, b) => b.totalQuantity - a.totalQuantity);
      setSummaryData(sortedSummaries);

      const totalItems = sortedSummaries.reduce((sum, s) => sum + s.totalItems, 0);
      const totalQuantity = sortedSummaries.reduce((sum, s) => sum + s.totalQuantity, 0);
      const avgStock = totalItems > 0 ? totalQuantity / totalItems : 0;

      setTotalData({ totalItems, totalQuantity, avgStock });
    } catch (error) {
      console.error('Error processing inventory data:', error);
      setCategoryChartData(null);
      setTopItemsChartData(null);
      setStockMovementChartData(null);
      setSummaryData([]);
      setTotalData({ totalItems: 0, totalQuantity: 0, avgStock: 0 });
    }
  }, [historyEntries, categories]);

  useEffect(() => {
    const renderCharts = async () => {
      const Chart = (await import('chart.js/auto')).default;

      const renderChart = (
        ref: React.RefObject<HTMLCanvasElement>,
        data: ChartData,
        type: import('chart.js').ChartType,
        options?: any
      ) => {
        const ctx = ref.current?.getContext('2d');
        if (!ctx) return null;
        return new Chart(ctx, { type, data, options });
      };

      if (categoryChartRef.current && categoryChartData) {
        categoryChartInstance.current?.destroy();
        categoryChartInstance.current = renderChart(categoryChartRef, categoryChartData, 'pie', {
          responsive: true,
          plugins: { legend: { position: 'bottom', labels: { font: { size: 10 }, boxWidth: 12 } } }
        });
      }

      if (topItemsChartRef.current && topItemsChartData) {
        topItemsChartInstance.current?.destroy();
        topItemsChartInstance.current = renderChart(topItemsChartRef, topItemsChartData, 'bar', {
          responsive: true,
          scales: { y: { beginAtZero: true } },
          plugins: { legend: { display: false } }
        });
      }

      if (stockMovementChartRef.current && stockMovementChartData) {
        stockMovementChartInstance.current?.destroy();
        stockMovementChartInstance.current = renderChart(stockMovementChartRef, stockMovementChartData, 'line', {
          responsive: true,
          scales: {
            x: {
              ticks: {
                maxRotation: 90,
                minRotation: 45,
                autoSkip: true,
                maxTicksLimit: 15
              }
            },
            y: { beginAtZero: true }
          }
        });
      }
    };

    renderCharts();

    return () => {
      categoryChartInstance.current?.destroy();
      topItemsChartInstance.current?.destroy();
      stockMovementChartInstance.current?.destroy();
    };
  }, [categoryChartData, topItemsChartData, stockMovementChartData]);

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
      pdf.text('Inventory Monthly Report', pageWidth / 2, yPosition, { align: 'center' });
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

      await addChartToPDF(categoryChartRef, 'Stock Distribution by Category');
      await addChartToPDF(topItemsChartRef, 'Top 5 Items by Quantity');
      await addChartToPDF(stockMovementChartRef, 'Stock Movement Trend');

      // Add summary data
      pdf.addPage();
      yPosition = 20;
      
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Inventory Summary Statistics', 20, yPosition);
      yPosition += 15;
      
      const summaryStatsData = [
        `Total Items: ${totalData.totalItems}`,
        `Total Quantity: ${totalData.totalQuantity}`,
        `Average Stock: ${totalData.avgStock.toFixed(1)}`,
        `Report Period: ${dateRange}`,
        `Generated on: ${new Date().toLocaleDateString()}`
      ];
      
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      summaryStatsData.forEach(line => {
        pdf.text(line, 20, yPosition);
        yPosition += 8;
      });

      // Add detailed inventory table
      yPosition += 10;
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Category & Subcategory Details', 20, yPosition);
      yPosition += 10;

      // Table headers
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'bold');
      const headers = ['Category/Subcategory', 'Items', 'Quantity', 'Unit', 'Avg Stock'];
      const colWidths = [60, 25, 25, 25, 30];
      let xPosition = 20;
      
      headers.forEach((header, index) => {
        pdf.text(header, xPosition, yPosition);
        xPosition += colWidths[index];
      });
      yPosition += 8;

      // Table rows
      pdf.setFont('helvetica', 'normal');
      summaryData.forEach((item: any) => {
        if (yPosition > 270) {
          pdf.addPage();
          yPosition = 20;
          
          // Redraw headers on new page
          pdf.setFont('helvetica', 'bold');
          xPosition = 20;
          headers.forEach((header, index) => {
            pdf.text(header, xPosition, yPosition);
            xPosition += colWidths[index];
          });
          yPosition += 8;
          pdf.setFont('helvetica', 'normal');
        }

        xPosition = 20;
        const rowData = [
          item.category || 'N/A',
          item.totalItems?.toString() || '0',
          item.totalQuantity?.toString() || '0',
          item.unit || 'pcs',
          item.avgStock?.toFixed(1) || '0.0'
        ];

        rowData.forEach((data, index) => {
          const text = data.length > 15 ? data.substring(0, 12) + '...' : data;
          pdf.text(text, xPosition, yPosition);
          xPosition += colWidths[index];
        });
        yPosition += 6;
      });

      // Add units summary
      yPosition += 10;
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Summary by Units', 20, yPosition);
      yPosition += 10;

      // Units summary
      const unitsSummary = Object.entries(
        summaryData.reduce((acc, item) => {
          const unit = item.unit || 'pcs';
          if (!acc[unit]) {
            acc[unit] = { categories: 0, items: 0, quantity: 0 };
          }
          acc[unit].categories += 1;
          acc[unit].items += item.totalItems || 0;
          acc[unit].quantity += item.totalQuantity || 0;
          return acc;
        }, {} as Record<string, { categories: number; items: number; quantity: number }>)
      );

      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      unitsSummary.forEach(([unit, data]) => {
        const percentage = totalData.totalQuantity > 0 ? ((data.quantity / totalData.totalQuantity) * 100).toFixed(1) : '0.0';
        pdf.text(`${unit}: ${data.quantity} (${percentage}%) - ${data.categories} categories, ${data.items} items`, 20, yPosition);
        yPosition += 8;
      });

      // Footer
      const pageHeight = pdf.internal.pageSize.getHeight();
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'italic');
      pdf.text(`© ${new Date().getFullYear()} QCU SBIT1F Group 2 | Barangay Talipapa. All rights reserved.`, 
        pageWidth / 2, pageHeight - 10, { align: 'center' });
      
      pdf.save(`Farm_Inventory_Report_${new Date().toISOString().split('T')[0]}.pdf`);
      
      showToast.success("Report Downloaded", "Inventory Report has been downloaded successfully.");
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      showToast.error("Download Failed", "Failed to generate PDF report.");
    }
  };

  return (
    <div
      id="reportContainer"
      className="w-full h-full bg-white rounded-xl shadow-lg p-6 relative flex flex-col overflow-hidden"
    >
      <button
        onClick={onClose}
        className="absolute top-4 left-4 text-gray-500 hover:text-gray-700 flex items-center gap-1"
      >
        <ArrowLeft className="h-5 w-5" /> <span>Back</span>
      </button>

      <div className="text-center mb-6 mt-4 flex-shrink-0">
        <h2 className="text-2xl font-semibold text-gray-800">
          Brgy. Talipapa Farm and MRF Inventory Monthly Report
        </h2>
        <p className="text-gray-600">{dateRange}</p>
      </div>

      {/* Scrollable content container */}
      <div className="flex-1 overflow-y-auto space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
            <h3 className="text-sm font-medium text-blue-800">Total Items</h3>
            <p className="text-2xl font-bold text-blue-600">{totalData.totalItems}</p>
          </div>
          <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
            <h3 className="text-sm font-medium text-green-800">Total Quantity</h3>
            <p className="text-2xl font-bold text-green-600">{totalData.totalQuantity}</p>
          </div>
          <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
            <h3 className="text-sm font-medium text-purple-800">Avg Stock</h3>
            <p className="text-2xl font-bold text-purple-600">{totalData.avgStock.toFixed(1)}</p>
          </div>
          <div className="bg-gradient-to-r from-orange-50 to-orange-100 p-4 rounded-lg border border-orange-200">
            <h3 className="text-sm font-medium text-orange-800">Categories</h3>
            <p className="text-2xl font-bold text-orange-600">{summaryData.length}</p>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-50 rounded-lg p-4 shadow">
            <h3 className="font-medium text-gray-800 mb-3">Stock Distribution by Category</h3>
            <div className="h-64">
              <canvas ref={categoryChartRef}></canvas>
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg p-4 shadow">
            <h3 className="font-medium text-gray-800 mb-3">Top 5 Items by Quantity</h3>
            <div className="h-64">
              <canvas ref={topItemsChartRef}></canvas>
            </div>
          </div>
        </div>

        {/* Detailed Category Breakdown */}
        <div className="bg-white rounded-lg border border-gray-300 shadow">
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 rounded-t-lg">
            <h3 className="text-lg font-semibold text-gray-800">Inventory by Category & Subcategory</h3>
            <p className="text-sm text-gray-600 mt-1">Detailed breakdown of items organized by category, subcategory, and units</p>
          </div>
          
          <div className="p-6">
            {summaryData.map((categoryData, index) => {
              // Parse category data to extract main category and subcategory
              const [mainCategory, subCategory] = categoryData.category ? categoryData.category.split(' / ') : ['Unknown', 'Unknown'];
              
              return (
                <div key={index} className="mb-6 last:mb-0">
                  {/* Category Header */}
                  <div className="bg-gradient-to-r from-[#8a9b6e] via-[#d4a762] to-[#6b8c85] shadow-md text-white border border-green-200 rounded-lg p-4 mb-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex-1">
                        <h4 className="text-lg font-semibold">{mainCategory}</h4>
                        <p className="text-sm mt-1">Subcategory: {subCategory}</p>
                      </div>
                      <div className="flex gap-6 text-sm">
                        <div className="text-center">
                          <p className="text-white-800 font-medium">{categoryData.totalItems || 0}</p>
                          <p className="text-white-600">Items</p>
                        </div>
                        <div className="text-center">
                          <p className="text-white-800 font-medium">{categoryData.totalQuantity || 0}</p>
                          <p className="text-white-600">Total Qty</p>
                        </div>
                        <div className="text-center">
                          <p className="text-white-800 font-medium">{categoryData.unit || 'pcs'}</p>
                          <p className="text-white-600">Unit</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Individual Items in this Category */}
                  <div className="bg-gray-50 rounded-lg p-4 ml-4">
                    <h5 className="text-sm font-medium text-gray-700 mb-3">Items in this category:</h5>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {/* This would need item-level data - for now showing category summary */}
                      <div className="bg-white border border-gray-200 rounded-lg p-3">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-800">{categoryData.category}</p>
                            <p className="text-xs text-gray-500 mt-1">Category Summary</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-bold text-gray-900">{categoryData.totalQuantity}</p>
                            <p className="text-xs text-gray-500">{categoryData.unit}</p>
                          </div>
                        </div>
                        <div className="mt-2 flex justify-between items-center">
                          <span className="text-xs text-gray-600">Avg Stock:</span>
                          <span className="text-xs font-medium text-gray-700">{categoryData.avgStock?.toFixed(1) || '0.0'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            
            {summaryData.length === 0 && (
              <div className="text-center text-gray-500 py-8">
                <p>No inventory data available for this period</p>
              </div>
            )}
          </div>
        </div>

        {/* Units Summary Table */}
        <div className="bg-white rounded-lg border border-gray-300 shadow">
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 rounded-t-lg">
            <h3 className="text-lg font-semibold text-gray-800">Summary by Units</h3>
            <p className="text-sm text-gray-600 mt-1">Breakdown of inventory quantities by measurement units</p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-[#8a9b6e] text-white">
                  <th className="p-3 text-left">Unit Type</th>
                  <th className="p-3 text-center">Categories</th>
                  <th className="p-3 text-center">Total Items</th>
                  <th className="p-3 text-center">Total Quantity</th>
                  <th className="p-3 text-center">Percentage</th>
                </tr>
              </thead>
              <tbody>
                {/* Group by units */}
                {Object.entries(
                  summaryData.reduce((acc, item) => {
                    const unit = item.unit || 'pcs';
                    if (!acc[unit]) {
                      acc[unit] = { categories: 0, items: 0, quantity: 0 };
                    }
                    acc[unit].categories += 1;
                    acc[unit].items += item.totalItems || 0;
                    acc[unit].quantity += item.totalQuantity || 0;
                    return acc;
                  }, {} as Record<string, { categories: number; items: number; quantity: number }>)
                ).map(([unit, data], index) => {
                  const percentage = totalData.totalQuantity > 0 ? ((data.quantity / totalData.totalQuantity) * 100).toFixed(1) : '0.0';
                  return (
                    <tr key={index} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="p-3 font-medium text-gray-800">{unit}</td>
                      <td className="p-3 text-center text-gray-600">{data.categories}</td>
                      <td className="p-3 text-center text-gray-600">{data.items}</td>
                      <td className="p-3 text-center font-medium text-gray-800">{data.quantity}</td>
                      <td className="p-3 text-center">
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm font-medium">
                          {percentage}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
                <tr className="font-bold bg-gray-100 border-t-2 border-gray-300">
                  <td className="p-3 text-gray-800">TOTAL</td>
                  <td className="p-3 text-center text-gray-800">{summaryData.length}</td>
                  <td className="p-3 text-center text-gray-800">{totalData.totalItems}</td>
                  <td className="p-3 text-center text-gray-800">{totalData.totalQuantity}</td>
                  <td className="p-3 text-center">
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm font-medium">
                      100.0%
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Stock Movement Chart */}
        <div className="bg-gray-50 rounded-lg p-4 shadow">
          <h3 className="font-medium text-gray-800 mb-3">Stock Movement Trend (Current Month)</h3>
          <div className="h-64">
            <canvas ref={stockMovementChartRef}></canvas>
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

export default ReportView;
