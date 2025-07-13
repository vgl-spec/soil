import React, { useEffect, useState, useRef } from 'react';
import { X, Download, ArrowLeft } from 'lucide-react';
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

      // Prepare category chart data
      const categoryDataMap: Record<string, { quantity: number, unit: string }> = {};

      consolidatedInventory.forEach(item => {
        const mainLabel = categories[item.mainCategory]?.label || item.mainCategory;
        const subLabel = categories[item.mainCategory]?.subcategories[item.subcategory]?.label || item.subcategory;
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
        const mainLabel = categories[item.mainCategory]?.label || item.mainCategory;
        const subLabel = categories[item.mainCategory]?.subcategories[item.subcategory]?.label || item.subcategory;
        const key = `${mainLabel} / ${subLabel}`;

        if (!summaryMap[key]) summaryMap[key] = { category: key, totalItems: 0, totalQuantity: 0, avgStock: 0 };

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
      const jsPDF = (await import('jspdf')).default;
      const html2canvas = (await import('html2canvas')).default;

      const report = document.getElementById('reportContainer');
      if (!report) return;

      const originalStyles = report.style.cssText;
      report.style.cssText = "background: white; padding: 20px; width: 800px; max-width: 800px;";

      const canvas = await html2canvas(report, { scale: 1, useCORS: true });
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgData = canvas.toDataURL('image/png');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);

      if (pdfHeight > pdf.internal.pageSize.getHeight()) {
        let heightLeft = pdfHeight;
        let position = 0;

        while (heightLeft >= 0) {
          pdf.addPage();
          position -= pdf.internal.pageSize.getHeight();
          pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
          heightLeft -= pdf.internal.pageSize.getHeight();
        }
      }

      pdf.save("Farm_Inventory_Report.pdf");
      report.style.cssText = originalStyles;
    } catch (err) {
      console.error("PDF Error:", err);
      showToast.error("PDF Generation Failed", "Failed to generate PDF. Try again.");
    }
  };

  return (
    <div
      id="reportContainer"
      className="max-w-6xl mx-auto bg-white rounded-xl shadow-lg p-6 relative flex flex-col"
      style={{ height: "70vh" }} // Fixed height for scroll area
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

        <div>
          <div className="bg-gray-50 rounded-lg p-4 shadow mb-6">
            <h3 className="font-medium text-gray-800 mb-3">Inventory Summary</h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-green-700 text-white">
                    <th className="p-2 text-left">Category</th>
                    <th className="p-2 text-left">Total Items</th>
                    <th className="p-2 text-left">Total Quantity</th>
                    <th className="p-2 text-left">Average Stock</th>
                  </tr>
                </thead>
                <tbody>
                  {summaryData.map((s, i) => (
                    <tr key={i} className="border-b border-gray-200">
                      <td className="p-2">{s.category}</td>
                      <td className="p-2">{s.totalItems}</td>
                      <td className="p-2">{s.totalQuantity}</td>
                      <td className="p-2">{s.avgStock.toFixed(2)}</td>
                    </tr>
                  ))}
                  <tr className="font-bold bg-gray-100">
                    <td className="p-2">TOTAL</td>
                    <td className="p-2">{totalData.totalItems}</td>
                    <td className="p-2">{totalData.totalQuantity}</td>
                    <td className="p-2">{totalData.avgStock.toFixed(2)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 shadow">
            <h3 className="font-medium text-gray-800 mb-3">Stock Movement (Current Month)</h3>
            <div className="h-64">
              <canvas ref={stockMovementChartRef}></canvas>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-4 mt-4 flex-shrink-0">
        <button
          onClick={downloadReportAsPDF}
          className="flex-1 bg-teal-700 hover:bg-teal-800 text-white py-2 px-4 rounded-lg flex items-center justify-center gap-2"
        >
          <Download className="h-5 w-5" /> Download as PDF
        </button>
        <button
          onClick={onClose}
          className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded-lg"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default ReportView;
