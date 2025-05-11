
import React, { useState } from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BoxWeight } from '@/components/BoxWeight';
import { useToast } from '@/hooks/use-toast';
import { Search, Printer } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { printDocument, printBoxWeights } from '@/lib/printUtil';
import { 
  generateSteelCargoSlipPDF, 
  generateTrackonSlipPDF, 
  generateGlobalPrimexSlipPDF 
} from '@/lib/pdfGenerator';

const BoxWeights = () => {
  const { user, logout } = useAuth();
  const { slips, expressSlips, updateSlip, isExpressModeActive } = useData();
  const { toast } = useToast();

  const [searchTerm, setSearchTerm] = useState('');
  const [pendingOnly, setPendingOnly] = useState(true);

  // Get all slips that need weights
  const allSlips = isExpressModeActive ? [...slips, ...expressSlips] : slips;
  
  // Filter by search term
  const filteredBySearch = allSlips.filter((slip) => {
    const searchTermLower = searchTerm.toLowerCase();
    return (
      slip.trackingId.toLowerCase().includes(searchTermLower) ||
      slip.customerName.toLowerCase().includes(searchTermLower)
    );
  });
  
  // Filter by pending status if needed
  const filteredSlips = pendingOnly
    ? filteredBySearch.filter(
        (slip) => 
          !slip.isCancelled && 
          (!slip.boxWeights || slip.boxWeights.length === 0 || slip.boxWeights.some(w => w === 0))
      )
    : filteredBySearch.filter(slip => !slip.isCancelled);

  const handleUpdateWeights = (
    slipId: string, 
    weights: number[], 
    username: string = user?.username || 'unknown'
  ) => {
    const timestamp = new Date().toISOString();
    
    updateSlip(slipId, {
      boxWeights: weights,
      weighedAt: timestamp,
      weighedBy: username,
    });

    toast({
      title: 'Weights Updated',
      description: 'Box weights have been recorded successfully.',
    });
  };

  const handlePrintSlip = (slip) => {
    const courierName = slip.courierName.toLowerCase();
    
    toast({
      title: 'PDF Generation',
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

  const canPrintSlips = user?.permissions?.printSlips;

  return (
    <PageLayout title="Box Weights" userRole={user?.role} onLogout={logout}>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-2xl font-bold tracking-tight">Box Weights Management</h2>
          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by tracking ID or customer..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <Switch 
                  id="pending-only" 
                  checked={pendingOnly} 
                  onCheckedChange={setPendingOnly}
                />
                <Label htmlFor="pending-only">Pending Only</Label>
              </div>
              <Button
                variant="outline" 
                size="sm"
                onClick={() => printBoxWeights()}
                className="print-hide"
                title="Print Box Weights Report"
              >
                <Printer className="h-4 w-4 mr-1" />
                Print All
              </Button>
            </div>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Box Weights</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tracking ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Courier</TableHead>
                    <TableHead className="hidden sm:table-cell">Generated</TableHead>
                    <TableHead className="text-right">Boxes</TableHead>
                    <TableHead>Weights</TableHead>
                    {canPrintSlips && <TableHead className="text-right">Actions</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSlips.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={canPrintSlips ? 7 : 6} className="text-center py-10">
                        No shipments found requiring weights.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredSlips.map((slip) => (
                      <TableRow key={slip.id}>
                        <TableCell className="font-medium">
                          {slip.trackingId}
                        </TableCell>
                        <TableCell>{slip.customerName}</TableCell>
                        <TableCell>{slip.courierName}</TableCell>
                        <TableCell className="hidden sm:table-cell">
                          {new Date(slip.generatedAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">{slip.numberOfBoxes || 1}</TableCell>
                        <TableCell>
                          <BoxWeight
                            numberOfBoxes={slip.numberOfBoxes || 1}
                            initialWeights={slip.boxWeights || []}
                            onUpdate={(weights) => handleUpdateWeights(slip.id, weights)}
                            disabled={!user?.permissions?.editBoxWeights}
                            completedAt={slip.weighedAt}
                            completedBy={slip.weighedBy}
                            readOnly={
                              (slip.weighedAt && !user?.permissions?.editCompletedBoxWeights) ||
                              !user?.permissions?.editBoxWeights
                            }
                            slip={slip}
                          />
                        </TableCell>
                        {canPrintSlips && (
                          <TableCell className="text-right">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handlePrintSlip(slip)}
                              className="print-hide"
                              disabled={!slip.weighedAt}
                              title={!slip.weighedAt ? "Complete weights before printing" : "Print slip"}
                            >
                              <Printer className="h-4 w-4 mr-1" />
                              Print
                            </Button>
                          </TableCell>
                        )}
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
};

export default BoxWeights;
