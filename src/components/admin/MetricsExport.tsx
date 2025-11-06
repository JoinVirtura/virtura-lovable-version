import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Download, FileSpreadsheet, FileText, Mail } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

interface MetricsData {
  activeUsers: number;
  avgResponseTime: number;
  tokensLastHour: number;
  revenueToday: number;
  systemHealth: string;
  failedJobs: number;
  lowBalanceUsers: number;
}

interface MetricsExportProps {
  metrics: MetricsData;
}

export function MetricsExport({ metrics }: MetricsExportProps) {
  const exportToCSV = () => {
    const csvData = [
      ["Metric", "Value", "Timestamp"],
      ["Active Users", metrics.activeUsers.toString(), new Date().toISOString()],
      ["Avg Response Time (ms)", metrics.avgResponseTime.toString(), new Date().toISOString()],
      ["Tokens (Last Hour)", metrics.tokensLastHour.toString(), new Date().toISOString()],
      ["Revenue Today ($)", metrics.revenueToday.toFixed(2), new Date().toISOString()],
      ["System Health", metrics.systemHealth, new Date().toISOString()],
      ["Failed Jobs", metrics.failedJobs.toString(), new Date().toISOString()],
      ["Low Balance Users", metrics.lowBalanceUsers.toString(), new Date().toISOString()],
    ];

    const csv = csvData.map(row => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `system-metrics-${new Date().toISOString()}.csv`;
    link.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Success",
      description: "Metrics exported to CSV",
    });
  };

  const exportToPDF = async () => {
    try {
      const element = document.getElementById("metrics-dashboard");
      if (!element) {
        throw new Error("Metrics dashboard not found");
      }

      const canvas = await html2canvas(element, {
        scale: 2,
        backgroundColor: "#ffffff",
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
      pdf.save(`system-metrics-${new Date().toISOString()}.pdf`);

      toast({
        title: "Success",
        description: "Metrics exported to PDF",
      });
    } catch (error) {
      console.error("Error exporting to PDF:", error);
      toast({
        title: "Error",
        description: "Failed to export PDF",
        variant: "destructive",
      });
    }
  };

  const emailReport = () => {
    toast({
      title: "Coming Soon",
      description: "Email reporting will be available soon",
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <Download className="w-4 h-4 mr-2" />
          Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={exportToCSV}>
          <FileSpreadsheet className="w-4 h-4 mr-2" />
          Export as CSV
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportToPDF}>
          <FileText className="w-4 h-4 mr-2" />
          Export as PDF
        </DropdownMenuItem>
        <DropdownMenuItem onClick={emailReport}>
          <Mail className="w-4 h-4 mr-2" />
          Email Report
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}