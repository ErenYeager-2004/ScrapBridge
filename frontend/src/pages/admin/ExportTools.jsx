import { useState } from "react";
import { Download, ClipboardList, Warehouse } from "lucide-react";
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
    <div className="p-6 lg:p-8 space-y-6 animate-fade-in max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Export Tools</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Download system data as CSV files for offline analysis.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
        {/* Requests Export Card */}
        <div className="relative bg-white dark:bg-gray-800 rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-700 p-8 flex flex-col h-full overflow-hidden">
          {/* Decorative Background Shape */}
          <div className="absolute -top-16 -right-16 w-48 h-48 bg-slate-50 dark:bg-slate-800/50 rounded-full pointer-events-none"></div>

          {/* Icon */}
          <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-6 relative z-10">
            <ClipboardList className="w-5 h-5 text-gray-800 dark:text-gray-200" />
          </div>

          {/* Title */}
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3 relative z-10">All Requests</h2>

          {/* Description */}
          <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed mb-8 flex-grow relative z-10">
            Export a comprehensive log of all internal and external data requests spanning the current fiscal quarter. Includes timestamp, requester ID, and status.
          </p>

          {/* Button */}
          <div className="relative z-10">
            <button
              onClick={handleExportRequests}
              disabled={isExportingReq}
              className="inline-flex items-center gap-2 py-2.5 px-6 bg-[#00875A] hover:bg-[#00704a] text-white text-sm font-medium rounded-full transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isExportingReq ? (
                <span className="animate-spin border-2 border-white/20 border-t-white rounded-full w-4 h-4" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              {isExportingReq ? "Exporting..." : "Download CSV"}
            </button>
          </div>
        </div>

        {/* Inventory Export Card */}
        <div className="relative bg-white dark:bg-gray-800 rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-700 p-8 flex flex-col h-full overflow-hidden">
          {/* Decorative Background Shape */}
          <div className="absolute -top-16 -right-16 w-48 h-48 bg-emerald-50/80 dark:bg-emerald-900/20 rounded-full pointer-events-none"></div>

          {/* Icon */}
          <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-6 relative z-10">
            <Warehouse className="w-5 h-5 text-gray-800 dark:text-gray-200" />
          </div>

          {/* Title */}
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3 relative z-10">Inventory Data</h2>

          {/* Description */}
          <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed mb-8 flex-grow relative z-10">
            Generate snapshot reports of current stock levels across all regional facilities. Includes SKU breakdowns, variance analysis, and recent intake logs.
          </p>

          {/* Button */}
          <div className="relative z-10">
            <button
              onClick={handleExportInventory}
              disabled={isExportingInv}
              className="inline-flex items-center gap-2 py-2.5 px-6 bg-[#00875A] hover:bg-[#00704a] text-white text-sm font-medium rounded-full transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isExportingInv ? (
                <span className="animate-spin border-2 border-white/20 border-t-white rounded-full w-4 h-4" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              {isExportingInv ? "Exporting..." : "Download CSV"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
