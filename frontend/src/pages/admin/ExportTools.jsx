import { useState } from "react";
import { DownloadCloud, FileText, Package } from "lucide-react";
import toast from "react-hot-toast";
import { exportRequestsCSV, exportInventoryCSV } from "../../api/admin.api";

export default function ExportTools() {
  const [isExportingReq, setIsExportingReq] = useState(false);
  const [isExportingInv, setIsExportingInv] = useState(false);

  // Helper function to trigger blob download
  const triggerDownload = (blob, filename) => {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  };

  const handleExportRequests = async () => {
    setIsExportingReq(true);
    try {
      const response = await exportRequestsCSV();
      triggerDownload(response.data, "scrapbridge-requests.csv");
      toast.success("Requests exported successfully.");
    } catch (error) {
      console.error("Export Requests Error:", error);
      toast.error("Failed to export requests.");
    } finally {
      setIsExportingReq(false);
    }
  };

  const handleExportInventory = async () => {
    setIsExportingInv(true);
    try {
      const response = await exportInventoryCSV();
      triggerDownload(response.data, "scrapbridge-inventory.csv");
      toast.success("Inventory exported successfully.");
    } catch (error) {
      console.error("Export Inventory Error:", error);
      toast.error("Failed to export inventory.");
    } finally {
      setIsExportingInv(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Export Tools</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Download system data as CSV files for offline analysis.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Requests Export Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 flex flex-col h-full">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-green-50 text-green-600 rounded-lg dark:bg-green-900/30 dark:text-green-400">
              <FileText className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">All Requests</h2>
          </div>
          <p className="text-gray-600 dark:text-gray-300 flex-grow mb-6">
            Export a complete log of all scrap requests. The CSV includes user details, contact information, status, materials summary, pricing, collector assignments, and timestamps.
          </p>
          <button
            onClick={handleExportRequests}
            disabled={isExportingReq}
            className="flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isExportingReq ? (
              <span className="animate-spin border-2 border-white/20 border-t-white rounded-full w-5 h-5" />
            ) : (
              <DownloadCloud className="w-5 h-5" />
            )}
            {isExportingReq ? "Exporting..." : "Download CSV"}
          </button>
        </div>

        {/* Inventory Export Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 flex flex-col h-full">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-lg dark:bg-blue-900/30 dark:text-blue-400">
              <Package className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Inventory Data</h2>
          </div>
          <p className="text-gray-600 dark:text-gray-300 flex-grow mb-6">
            Export the current state of the inventory. Includes material types, total weight, reserved weight, availability status, pricing, and original request source IDs.
          </p>
          <button
            onClick={handleExportInventory}
            disabled={isExportingInv}
            className="flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isExportingInv ? (
              <span className="animate-spin border-2 border-white/20 border-t-white rounded-full w-5 h-5" />
            ) : (
              <DownloadCloud className="w-5 h-5" />
            )}
            {isExportingInv ? "Exporting..." : "Download CSV"}
          </button>
        </div>
      </div>
    </div>
  );
}
