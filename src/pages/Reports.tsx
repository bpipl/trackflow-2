
import React, { useState, useRef } from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from '@/components/ui/table';
import { FileText, Download, Printer, Trash, MessageCircle, Check, Clock, Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import SteelCargoSlip from '@/components/slips/SteelCargoSlip';
import GlobalPrimexSlip from '@/components/slips/GlobalPrimexSlip';
import TrackonSlip from '@/components/slips/TrackonSlip';
import ShreeCourierSlip from '@/components/slips/ShreeCourierSlip';
import { CourierSlip, ReportDisplayOptions } from '@/types/models';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import { DateRangeSelector } from '@/components/ui/date-range-selector';
import { format } from 'date-fns';
import { Checkbox } from '@/components/ui/checkbox';
import { N8N_WEBHOOK_URL } from '@/integrations/supabase/client';
import { printDocument, printReports } from '@/lib/printUtil';
import { 
  generateSteelCargoSlipPDF, 
  generateTrackonSlipPDF, 
  generateGlobalPrimexSlipPDF 
} from '@/lib/pdfGenerator';

const Reports = () => {
  const {
    user,
    logout
  } = useAuth();
  const {
    slips,
    expressSlips,
    couriers,
    updateSlip,
    addLog,
    isExpressModeActive
  } = useData();
  const {
    toast
  } = useToast();

  // State variables
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [selectedCourierId, setSelectedCourierId] = useState('all');
  const [showCharges, setShowCharges] = useState(false);
  const [selectedSlip, setSelectedSlip] = useState<CourierSlip | null>(null);
  const [slipToCancel, setSlipToCancel] = useState<CourierSlip | null>(null);
  const [showExpressOnly, setShowExpressOnly] = useState(false);
  const [selectedSlips, setSelectedSlips] = useState<Record<string, boolean>>({});
  const [selectAll, setSelectAll] = useState(false);
  const [delayHours, setDelayHours] = useState<number>(0);
  const [showDelayOptions, setShowDelayOptions] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [rowLoading, setRowLoading] = useState<string | null>(null);

  // Determine which slips to display based on filters
  const allSlips = isExpressModeActive ? [...slips, ...expressSlips] : slips;

  // Apply Express Mode filter if needed
  const filteredByExpressMode = showExpressOnly && isExpressModeActive ? allSlips.filter(slip => slip.isExpressMode) : allSlips;

  // Filter slips based on date range and courier selection
  const filteredSlips = filteredByExpressMode.filter(slip => {
    const slipDate = new Date(slip.generatedAt);
    const startOfSelectedDate = new Date(startDate);
    startOfSelectedDate.setHours(0, 0, 0, 0);
    const endOfSelectedDate = new Date(endDate);
    endOfSelectedDate.setHours(23, 59, 59, 999);
    const matchesDateRange = slipDate >= startOfSelectedDate && slipDate <= endOfSelectedDate;
    const matchesCourier = selectedCourierId === 'all' ? true : slip.courierId === selectedCourierId;
    return matchesDateRange && matchesCourier;
  });

  // Calculate totals for all filtered slips
  const totals = {
    parcels: filteredSlips.filter(slip => !slip.isCancelled).length,
    boxes: filteredSlips.reduce((sum, slip) => {
      if (slip.isCancelled) return sum;
      return sum + (slip.numberOfBoxes || 1);
    }, 0),
    weight: filteredSlips.reduce((sum, slip) => {
      if (slip.isCancelled) return sum;
      return sum + (slip.weight || 0);
    }, 0),
    charges: filteredSlips.reduce((sum, slip) => {
      if (slip.isCancelled || slip.isToPayShipping) return sum;
      return sum + slip.charges;
    }, 0)
  };

  // Group slips by courier for summary
  const courierSummary = filteredSlips.reduce((acc, slip) => {
    if (!acc[slip.courierId]) {
      acc[slip.courierId] = {
        courierName: slip.courierName,
        totalSlips: 0,
        totalAir: 0,
        totalSurface: 0,
        totalBoxes: 0,
        totalCharges: 0,
        cancelledSlips: 0,
        toPaySlips: 0,
        expressSlips: 0
      };
    }
    acc[slip.courierId].totalSlips += 1;
    if (slip.isCancelled) {
      acc[slip.courierId].cancelledSlips += 1;
    } else {
      acc[slip.courierId][slip.method === 'air' ? 'totalAir' : 'totalSurface'] += 1;
      acc[slip.courierId].totalBoxes += slip.numberOfBoxes || 1;
      if (slip.isToPayShipping) {
        acc[slip.courierId].toPaySlips += 1;
      } else {
        acc[slip.courierId].totalCharges += slip.charges;
      }
      if (slip.isExpressMode) {
        acc[slip.courierId].expressSlips += 1;
      }
    }
    return acc;
  }, {} as Record<string, {
    courierName: string;
    totalSlips: number;
    totalAir: number;
    totalSurface: number;
    totalBoxes: number;
    totalCharges: number;
    cancelledSlips: number;
    toPaySlips: number;
    expressSlips: number;
  }>);
  
  // Handle selecting/deselecting all slips
  const handleSelectAll = () => {
    const newSelectAll = !selectAll;
    setSelectAll(newSelectAll);
    
    const newSelectedSlips: Record<string, boolean> = {};
    if (newSelectAll) {
      filteredSlips
        .filter(slip => !slip.isCancelled) // Only select active slips
        .forEach(slip => {
          newSelectedSlips[slip.id] = true;
        });
    }
    setSelectedSlips(newSelectedSlips);
  };

  // Handle selecting individual slip
  const handleSelectSlip = (slipId: string) => {
    const newSelectedSlips = { ...selectedSlips };
    
    if (newSelectedSlips[slipId]) {
      delete newSelectedSlips[slipId];
    } else {
      newSelectedSlips[slipId] = true;
    }
    
    setSelectedSlips(newSelectedSlips);
    
    // Update selectAll state
    const activeSlips = filteredSlips.filter(slip => !slip.isCancelled);
    if (Object.keys(newSelectedSlips).length === activeSlips.length) {
      setSelectAll(true);
    } else {
      setSelectAll(false);
    }
  };

  // Function to send data to n8n webhook for a single slip
  const sendToWhatsApp = async (slip: CourierSlip) => {
    setRowLoading(slip.id);

    try {
      // Format date
      const formattedDate = new Date(slip.generatedAt).toLocaleDateString();
      
      // Send data to n8n webhook
      await fetch(N8N_WEBHOOK_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        mode: "no-cors", // Important for cross-domain requests
        body: JSON.stringify({
          customerName: slip.customerName,
          customerMobile: slip.customerMobile,
          courierName: slip.courierName,
          trackingId: slip.trackingId,
          date: formattedDate,
          numberOfBoxes: slip.numberOfBoxes || "Not specified",
          weight: slip.weight ? `${slip.weight} kg` : "Not specified"
        }),
      });

      toast({
        title: "Notification Sent",
        description: `WhatsApp notification sent for ${slip.trackingId}.`,
      });
    } catch (error) {
      console.error("Error sending WhatsApp notification:", error);
      toast({
        title: "Error",
        description: "Failed to send WhatsApp notification.",
        variant: "destructive",
      });
    } finally {
      setRowLoading(null);
    }
  };

  // Function to send data for multiple selected slips
  const sendSelectedToWhatsApp = async () => {
    const selectedSlipIds = Object.keys(selectedSlips);
    
    if (selectedSlipIds.length === 0) {
      toast({
        title: "No Slips Selected",
        description: "Please select at least one slip to send notifications.",
        variant: "destructive",
      });
      return;
    }

    setIsSending(true);

    try {
      // Get all selected slips
      const slipsToSend = filteredSlips.filter(slip => selectedSlips[slip.id]);
      
      // Send notifications with or without delay
      for (const slip of slipsToSend) {
        // Format date
        const formattedDate = new Date(slip.generatedAt).toLocaleDateString();
        
        // Prepare data for the webhook
        const webhookData = {
          customerName: slip.customerName,
          customerMobile: slip.customerMobile,
          courierName: slip.courierName,
          trackingId: slip.trackingId,
          date: formattedDate,
          numberOfBoxes: slip.numberOfBoxes || "Not specified",
          weight: slip.weight ? `${slip.weight} kg` : "Not specified",
          delayHours: delayHours > 0 ? delayHours : undefined
        };
        
        // Send data to n8n webhook
        await fetch(N8N_WEBHOOK_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          mode: "no-cors",
          body: JSON.stringify(webhookData),
        });
      }

      toast({
        title: "Notifications Sent",
        description: `WhatsApp notifications queued for ${selectedSlipIds.length} slips.${delayHours > 0 ? ` Will be sent after ${delayHours} hours.` : ''}`,
      });
      
      // Clear selection after sending
      setSelectedSlips({});
      setSelectAll(false);
    } catch (error) {
      console.error("Error sending WhatsApp notifications:", error);
      toast({
        title: "Error",
        description: "Failed to send WhatsApp notifications.",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
      setShowDelayOptions(false);
      setDelayHours(0);
    }
  };

  const handlePrintSlip = (slip: CourierSlip) => {
    const courierName = slip.courierName.toLowerCase();
    
    toast({
      title: "PDF Generation",
      description: `Generating PDF for tracking ID: ${slip.trackingId}`
    });
    
    // Use the appropriate PDF generator based on courier type
    if (courierName.includes('steel')) {
      generateSteelCargoSlipPDF(slip);
    } else if (courierName.includes('trackon')) {
      generateTrackonSlipPDF(slip);
    } else if (courierName.includes('global') || courierName.includes('primex')) {
      generateGlobalPrimexSlipPDF(slip);
    } else {
      // For other couriers, use Steel Cargo format as the base template
      generateSteelCargoSlipPDF({...slip, courierName: "Steel Courier & Cargo"});
    }
  };
  
  const handlePrint = () => {
    if (!selectedSlip) return;
    
    const courierName = selectedSlip.courierName.toLowerCase();
    
    toast({
      title: "PDF Generation",
      description: `Generating PDF for tracking ID: ${selectedSlip.trackingId}`
    });
    
    // Use the appropriate PDF generator based on courier type
    if (courierName.includes('steel')) {
      generateSteelCargoSlipPDF(selectedSlip);
    } else if (courierName.includes('trackon')) {
      generateTrackonSlipPDF(selectedSlip);
    } else if (courierName.includes('global') || courierName.includes('primex')) {
      generateGlobalPrimexSlipPDF(selectedSlip);
    } else {
      // For other couriers, use Steel Cargo format as the base template
      generateSteelCargoSlipPDF({...selectedSlip, courierName: "Steel Courier & Cargo"});
    }
  };
  
  // Function to print multiple selected slips
  const printSelectedSlips = () => {
    const selectedSlipIds = Object.keys(selectedSlips);
    
    if (selectedSlipIds.length === 0) {
      toast({
        title: "No Slips Selected",
        description: "Please select at least one slip to print.",
        variant: "destructive",
      });
      return;
    }
    
    toast({
      title: "PDF Generation",
      description: `Generating PDFs for ${selectedSlipIds.length} slips.`
    });
    
    // Get the slips from the filtered slips
    const slipsToProcess = filteredSlips.filter(slip => selectedSlips[slip.id]);
    
    // Process each slip one at a time
    slipsToProcess.forEach(slip => {
      const courierName = slip.courierName.toLowerCase();
      
      // Use the appropriate PDF generator based on courier type
      if (courierName.includes('steel')) {
        generateSteelCargoSlipPDF(slip);
      } else if (courierName.includes('trackon')) {
        generateTrackonSlipPDF(slip);
      } else if (courierName.includes('global') || courierName.includes('primex')) {
        generateGlobalPrimexSlipPDF(slip);
      } else {
        // For other couriers, use Steel Cargo format as the base template
        generateSteelCargoSlipPDF({...slip, courierName: "Steel Courier & Cargo"});
      }
    });
  };
  
  const handleCancelRequest = (slip: CourierSlip) => {
    setSlipToCancel(slip);
  };
  
  const handleCancelSlip = () => {
    if (!slipToCancel) return;

    // Update the slip to mark as cancelled
    updateSlip(slipToCancel.id, {
      isCancelled: true
    });

    // Add log entry
    addLog({
      timestamp: new Date().toISOString(),
      userId: user?.id || 'unknown',
      username: user?.username || 'unknown',
      action: 'SLIP_CANCELLED',
      details: {
        trackingId: slipToCancel.trackingId,
        customerName: slipToCancel.customerName,
        courierName: slipToCancel.courierName,
        isExpressMode: slipToCancel.isExpressMode
      }
    });
    toast({
      title: 'Slip Cancelled',
      description: `Slip with tracking ID ${slipToCancel.trackingId} has been cancelled.`
    });
    setSlipToCancel(null);
  };
  
  const handleExportExcel = () => {
    // Prepare data for export, excluding charges if showCharges is false
    const exportData = filteredSlips.map(slip => {
      const data: Record<string, any> = {
        'Tracking ID': slip.trackingId,
        'Customer': slip.customerName,
        'Courier': slip.isToPayShipping ? `${slip.courierName} - TO PAY` : slip.courierName,
        'Method': slip.method,
        'Status': slip.isCancelled ? 'Cancelled' : 'Active'
      };
      if (slip.weight) {
        data['Weight (kg)'] = slip.weight;
      } else {
        data['Weight (kg)'] = '';
      }
      data['Boxes'] = slip.numberOfBoxes || 1;
      data['Generated At'] = new Date(slip.generatedAt).toLocaleString();
      if (showCharges && !slip.isToPayShipping) {
        data['Charges (₹)'] = slip.charges;
      } else if (showCharges) {
        data['Charges (₹)'] = 'TO PAY';
      }
      return data;
    });

    // Add totals row
    const totalRow: Record<string, any> = {
      'Tracking ID': '',
      'Customer': '',
      'Courier': 'TOTALS',
      'Method': '',
      'Status': '',
      'Weight (kg)': totals.weight.toFixed(2),
      'Boxes': totals.boxes,
      'Generated At': ''
    };
    if (showCharges) {
      totalRow['Charges (₹)'] = totals.charges.toFixed(2);
    }
    exportData.push(totalRow);

    // Create workbook and worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(exportData);

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Courier Slips');

    // Generate Excel file
    const modeType = isExpressModeActive && showExpressOnly ? 'Express-' : '';
    XLSX.writeFile(wb, `${modeType}Courier-Report-${format(startDate, 'yyyy-MM-dd')}-to-${format(endDate, 'yyyy-MM-dd')}.xlsx`);
    toast({
      title: 'Excel Export',
      description: 'Excel report generated successfully!'
    });
  };
  
  const handleExportCSV = () => {
    // Convert data to CSV format
    const exportData = filteredSlips.map(slip => {
      const data: Record<string, any> = {
        'Tracking ID': slip.trackingId,
        'Customer': slip.customerName,
        'Courier': slip.isToPayShipping ? `${slip.courierName} - TO PAY` : slip.courierName,
        'Method': slip.method,
        'Status': slip.isCancelled ? 'Cancelled' : 'Active'
      };
      if (slip.weight) {
        data['Weight (kg)'] = slip.weight;
      } else {
        data['Weight (kg)'] = '';
      }
      data['Boxes'] = slip.numberOfBoxes || 1;
      data['Generated At'] = new Date(slip.generatedAt).toLocaleString();
      if (showCharges && !slip.isToPayShipping) {
        data['Charges (₹)'] = slip.charges;
      } else if (showCharges) {
        data['Charges (₹)'] = 'TO PAY';
      }
      return data;
    });

    // Add totals row
    const totalRow: Record<string, any> = {
      'Tracking ID': '',
      'Customer': '',
      'Courier': 'TOTALS',
      'Method': '',
      'Status': '',
      'Weight (kg)': totals.weight.toFixed(2),
      'Boxes': totals.boxes,
      'Generated At': ''
    };
    if (showCharges) {
      totalRow['Charges (₹)'] = totals.charges.toFixed(2);
    }
    exportData.push(totalRow);

    // Use papaparse to convert to CSV
    const csv = Papa.unparse(exportData);

    // Create a Blob with the CSV data
    const blob = new Blob([csv], {
      type: 'text/csv'
    });

    // Create URL for the Blob
    const url = URL.createObjectURL(blob);

    // Create a link element and trigger the download
    const a = document.createElement('a');
    a.href = url;
    const modeType = isExpressModeActive && showExpressOnly ? 'Express-' : '';
    a.download = `${modeType}Courier-Report-${format(startDate, 'yyyy-MM-dd')}-to-${format(endDate, 'yyyy-MM-dd')}.csv`;
    a.click();

    // Clean up
    URL.revokeObjectURL(url);
    toast({
      title: 'CSV Export',
      description: 'CSV report generated successfully!'
    });
  };

  // Calculate total active, express, and cancelled slips
  const totalActiveSlips = filteredSlips.filter(slip => !slip.isCancelled).length;
  const totalExpressSlips = filteredSlips.filter(slip => !slip.isCancelled && slip.isExpressMode).length;
  const totalStandardSlips = filteredSlips.filter(slip => !slip.isCancelled && !slip.isExpressMode).length;
  const totalCancelledSlips = filteredSlips.filter(slip => slip.isCancelled).length;
  const totalToPaySlips = filteredSlips.filter(slip => !slip.isCancelled && slip.isToPayShipping).length;
  
  return (
    <PageLayout title="Reports" userRole={user?.role} onLogout={logout}>
      <div className="space-y-6">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <h2 className="text-2xl font-bold tracking-tight">Courier Reports</h2>
          <div className="flex flex-wrap gap-2 items-center">
            <div className="flex items-center space-x-2 mr-4">
              <Switch id="show-charges" checked={showCharges} onCheckedChange={setShowCharges} />
              <Label htmlFor="show-charges">Show Charges</Label>
            </div>
            <Button variant="outline" onClick={() => printReports()} className="print-hide">
              <Printer className="mr-2 h-4 w-4" />
              Print Report
            </Button>
            <Button variant="outline" onClick={handleExportExcel}>
              <Download className="mr-2 h-4 w-4" />
              Export Excel
            </Button>
            <Button onClick={handleExportCSV} className="bg-courier-600 hover:bg-courier-700">
              <FileText className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
          </div>
        </div>

        {/* Report Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Report Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <DateRangeSelector startDate={startDate} endDate={endDate} onStartDateChange={setStartDate} onEndDateChange={setEndDate} />
              </div>
              <div>
                <label htmlFor="courierSelect" className="block text-sm font-medium text-gray-700">
                  Courier Partner
                </label>
                <Select value={selectedCourierId} onValueChange={setSelectedCourierId}>
                  <SelectTrigger id="courierSelect" className="mt-1">
                    <SelectValue placeholder="All Couriers" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Couriers</SelectItem>
                    {couriers.filter(c => !c.isExpressMasterToggle).map(courier => <SelectItem key={courier.id} value={courier.id}>
                        {courier.name}
                      </SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-6">
          <Card>
            <CardHeader>
              <CardTitle>Total Slips</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{filteredSlips.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Active Slips</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{totalActiveSlips}</div>
            </CardContent>
          </Card>
          {isExpressModeActive}
          {isExpressModeActive && <Card>
              <CardHeader>
                <CardTitle>Standard</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{totalStandardSlips}</div>
              </CardContent>
            </Card>}
          <Card>
            <CardHeader>
              <CardTitle>Cancelled</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{totalCancelledSlips}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>TO PAY</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{totalToPaySlips}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Total Boxes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{totals.boxes}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Total Weight</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{totals.weight.toFixed(2)} kg</div>
            </CardContent>
          </Card>
        </div>

        {/* Courier-wise Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Courier-wise Summary</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Courier Partner</TableHead>
                    <TableHead>Total Slips</TableHead>
                    <TableHead>Cancelled</TableHead>
                    <TableHead>TO PAY</TableHead>
                    {isExpressModeActive && <TableHead>Express</TableHead>}
                    <TableHead>Air</TableHead>
                    <TableHead>Surface</TableHead>
                    <TableHead>Boxes</TableHead>
                    {showCharges && <TableHead>Charges (₹)</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Object.keys(courierSummary).length === 0 ? <TableRow>
                      <TableCell colSpan={isExpressModeActive ? showCharges ? 9 : 8 : showCharges ? 8 : 7} className="text-center">
                        No data available for the selected filters.
                      </TableCell>
                    </TableRow> : Object.entries(courierSummary).map(([courierId, summary]) => <TableRow key={courierId}>
                        <TableCell className="font-medium">{summary.courierName}</TableCell>
                        <TableCell>{summary.totalSlips}</TableCell>
                        <TableCell>{summary.cancelledSlips}</TableCell>
                        <TableCell>{summary.toPaySlips}</TableCell>
                        {isExpressModeActive && <TableCell>{summary.expressSlips}</TableCell>}
                        <TableCell>{summary.totalAir}</TableCell>
                        <TableCell>{summary.totalSurface}</TableCell>
                        <TableCell>{summary.totalBoxes}</TableCell>
                        {showCharges && <TableCell>₹{summary.totalCharges.toFixed(2)}</TableCell>}
                      </TableRow>)}
                </TableBody>
                <TableFooter>
                  <TableRow>
                    <TableCell className="font-bold">TOTALS</TableCell>
                    <TableCell>{filteredSlips.length}</TableCell>
                    <TableCell>{totalCancelledSlips}</TableCell>
                    <TableCell>{totalToPaySlips}</TableCell>
                    {isExpressModeActive && <TableCell>{totalExpressSlips}</TableCell>}
                    <TableCell>{filteredSlips.filter(slip => !slip.isCancelled && slip.method === 'air').length}</TableCell>
                    <TableCell>{filteredSlips.filter(slip => !slip.isCancelled && slip.method === 'surface').length}</TableCell>
                    <TableCell>{totals.boxes}</TableCell>
                    {showCharges && <TableCell>₹{totals.charges.toFixed(2)}</TableCell>}
                  </TableRow>
                </TableFooter>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Bulk Actions */}
        <div className="flex items-center gap-4 mt-4">
          {Object.keys(selectedSlips).length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">{Object.keys(selectedSlips).length} selected</span>
              
              {/* Print selected slips button */}
              <Button 
                variant="outline" 
                onClick={printSelectedSlips}
                className="bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200"
              >
                <Printer className="mr-2 h-4 w-4" />
                Print Selected
              </Button>
              
              {!showDelayOptions ? (
                <Button 
                  onClick={() => setShowDelayOptions(true)}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <MessageCircle className="mr-2 h-4 w-4" />
                  Send Selected to WhatsApp
                </Button>
              ) : (
                <div className="flex items-center gap-2">
                  <Button 
                    onClick={() => {
                      setDelayHours(0);
                      sendSelectedToWhatsApp();
                    }}
                    disabled={isSending}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Send className="mr-2 h-4 w-4" />
                    Send Now
                  </Button>
                  <div className="flex items-center gap-2">
                    <Input 
                      type="number" 
                      min="1" 
                      max="24" 
                      className="w-20" 
                      value={delayHours} 
                      onChange={(e) => setDelayHours(Number(e.target.value))}
                    />
                    <span className="text-sm">hours</span>
                    <Button 
                      onClick={sendSelectedToWhatsApp}
                      disabled={isSending || delayHours <= 0}
                      variant="outline"
                    >
                      <Clock className="mr-2 h-4 w-4" />
                      Send Later
                    </Button>
                  </div>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setShowDelayOptions(false);
                      setDelayHours(0);
                    }}
                    disabled={isSending}
                  >
                    Cancel
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Detailed Slip List */}
        <Card>
          <CardHeader>
            <CardTitle>Detailed Slip List</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox 
                        checked={selectAll} 
                        onCheckedChange={handleSelectAll}
                        aria-label="Select all slips"
                      />
                    </TableHead>
                    <TableHead>Tracking ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Courier</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Weight</TableHead>
                    <TableHead>Boxes</TableHead>
                    {showCharges && <TableHead>Charges (₹)</TableHead>}
                    <TableHead>
                      <span className="text-base font-bold">Date</span>
                    </TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSlips.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={showCharges ? 11 : 10} className="text-center">
                        No slips found for the selected filters.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredSlips.map(slip => (
                      <TableRow key={slip.id} className={slip.isCancelled ? "bg-gray-100" : ""}>
                        <TableCell>
                          {!slip.isCancelled && (
                            <Checkbox 
                              checked={Boolean(selectedSlips[slip.id])} 
                              onCheckedChange={() => handleSelectSlip(slip.id)}
                              aria-label={`Select slip ${slip.trackingId}`}
                            />
                          )}
                        </TableCell>
                        <TableCell className={`font-medium ${slip.isCancelled ? "line-through" : ""}`}>
                          {slip.trackingId}
                        </TableCell>
                        <TableCell className={slip.isCancelled ? "line-through" : ""}>
                          {slip.customerName}
                        </TableCell>
                        <TableCell className={slip.isCancelled ? "line-through" : ""}>
                          {slip.isToPayShipping ? (
                            <>
                              {slip.courierName} - <span className="text-red-600 font-bold">TO PAY</span>
                            </>
                          ) : slip.courierName}
                        </TableCell>
                        <TableCell className={`capitalize ${slip.isCancelled ? "line-through" : ""}`}>
                          {slip.method}
                        </TableCell>
                        <TableCell>
                          {slip.isCancelled ? (
                            <span className="text-red-500 font-medium">Cancelled</span>
                          ) : (
                            <span className="text-green-500 font-medium">Active</span>
                          )}
                        </TableCell>
                        <TableCell className={slip.isCancelled ? "line-through" : ""}>
                          {slip.weight ? `${slip.weight} kg` : "N/A"}
                        </TableCell>
                        <TableCell className={slip.isCancelled ? "line-through" : ""}>
                          {slip.numberOfBoxes || "1"}
                        </TableCell>
                        {showCharges && (
                          <TableCell className={slip.isCancelled ? "line-through" : ""}>
                            {slip.isToPayShipping ? (
                              <span className="text-red-600 font-bold">TO PAY</span>
                            ) : (
                              `₹${slip.charges}`
                            )}
                          </TableCell>
                        )}
                        <TableCell className={slip.isCancelled ? "line-through" : ""}>
                          <span className="text-base font-medium">
                            {new Date(slip.generatedAt).toLocaleDateString()}
                          </span>
                        </TableCell>
                        <TableCell className="text-right space-x-1">
                          <div className="flex justify-end gap-1">
                            {/* Print button */}
                            {user?.permissions?.reprintSlips !== false && (
                              <Button variant="outline" size="icon" onClick={() => handlePrintSlip(slip)} title="Reprint">
                                <Printer className="h-4 w-4" />
                              </Button>
                            )}
                            
                            {/* Cancel button */}
                            {!slip.isCancelled && user?.permissions?.cancelSlips !== false && (
                              <Button variant="destructive" size="icon" onClick={() => handleCancelRequest(slip)} title="Cancel">
                                <Trash className="h-4 w-4" />
                              </Button>
                            )}
                            
                            {/* WhatsApp button */}
                            {!slip.isCancelled && (
                              <Button 
                                variant="secondary" 
                                size="icon"
                                onClick={() => sendToWhatsApp(slip)}
                                disabled={rowLoading === slip.id}
                                className="bg-green-600 hover:bg-green-700 text-white"
                                title="Send WhatsApp"
                              >
                                <MessageCircle className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
                <TableFooter>
                  <TableRow>
                    <TableCell className="font-bold">TOTALS</TableCell>
                    <TableCell colSpan={3}></TableCell>
                    <TableCell></TableCell>
                    <TableCell colSpan={2}></TableCell>
                    <TableCell>{filteredSlips.reduce((sum, slip) => slip.isCancelled ? sum : sum + (slip.numberOfBoxes || 1), 0)}</TableCell>
                    {showCharges && (
                      <TableCell>
                        ₹{filteredSlips
                          .filter(slip => !slip.isCancelled && !slip.isToPayShipping)
                          .reduce((sum, slip) => sum + slip.charges, 0)
                          .toFixed(2)}
                      </TableCell>
                    )}
                    <TableCell colSpan={2}></TableCell>
                  </TableRow>
                </TableFooter>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Print Dialog */}
      <Dialog open={!!selectedSlip} onOpenChange={open => !open && setSelectedSlip(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>
              Reprint Courier Slip
            </DialogTitle>
          </DialogHeader>
          
          <div className="print-only slip-content print-dialog">
            {selectedSlip && (
              <>
                {selectedSlip.courierName.includes("Steel") && (
                  <SteelCargoSlip slip={selectedSlip} />
                )}
                {selectedSlip.courierName.includes("Global") && (
                  <GlobalPrimexSlip slip={selectedSlip} />
                )}
                {selectedSlip.courierName.includes("Trackon") && (
                  <TrackonSlip slip={selectedSlip} />
                )}
                {selectedSlip.courierName.includes("Shree") && (
                  <ShreeCourierSlip slip={selectedSlip} />
                )}
                {!selectedSlip.courierName.includes("Steel") && 
                 !selectedSlip.courierName.includes("Global") && 
                 !selectedSlip.courierName.includes("Trackon") && 
                 !selectedSlip.courierName.includes("Shree") && (
                  <div className="border p-4 rounded-md">
                    <h2 className="text-xl font-bold mb-4">
                      Courier Slip
                    </h2>
                    <p><strong>Tracking ID:</strong> {selectedSlip.trackingId}</p>
                    <p><strong>Customer:</strong> {selectedSlip.customerName}</p>
                    <p><strong>Address:</strong> {selectedSlip.customerAddress}</p>
                    <p><strong>Method:</strong> {selectedSlip.method}</p>
                    {selectedSlip.weight && <p><strong>Weight:</strong> {selectedSlip.weight} kg</p>}
                    {selectedSlip.numberOfBoxes && <p><strong>Boxes:</strong> {selectedSlip.numberOfBoxes}</p>}
                    <p><strong>Generated At:</strong> {new Date(selectedSlip.generatedAt).toLocaleString()}</p>
                    <p><strong>Payment:</strong> {selectedSlip.isToPayShipping ? "TO PAY" : "Prepaid"}</p>
                  </div>
                )}
              </>
            )}
          </div>
          
          <DialogFooter className="print-hide">
            <Button variant="outline" onClick={() => setSelectedSlip(null)}>
              Cancel
            </Button>
            <Button onClick={handlePrint}>
              <Printer className="mr-2 h-4 w-4" />
              Print Now
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Confirmation Dialog */}
      <AlertDialog open={!!slipToCancel} onOpenChange={open => !open && setSlipToCancel(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Cancellation</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel slip with tracking ID {slipToCancel?.trackingId}?
              <br />
              This action cannot be undone. The slip will be marked as cancelled but will still appear in reports.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>No, Keep It</AlertDialogCancel>
            <AlertDialogAction onClick={handleCancelSlip} className="bg-red-500 hover:bg-red-600">
              Yes, Cancel Slip
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageLayout>
  );
};

export default Reports;
