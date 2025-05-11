import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Check, Edit, X, Printer } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { printDocument } from '@/lib/printUtil';
import { 
  generateSteelCargoSlipPDF, 
  generateTrackonSlipPDF, 
  generateGlobalPrimexSlipPDF 
} from '@/lib/pdfGenerator';
import { CourierSlip } from '@/types/models';

interface BoxWeightProps {
  numberOfBoxes: number;
  initialWeights: number[];
  onUpdate: (weights: number[]) => void;
  disabled?: boolean;
  readOnly?: boolean;
  completedAt?: string;
  completedBy?: string;
  slipId?: string; // Optional slip ID for printing
  slip?: CourierSlip; // Full slip data for PDF generation
}

export const BoxWeight: React.FC<BoxWeightProps> = ({
  numberOfBoxes,
  initialWeights,
  onUpdate,
  disabled = false,
  readOnly = false,
  completedAt,
  completedBy,
  slip,
}) => {
  const [weights, setWeights] = useState<number[]>(initialWeights);
  const [isEditing, setIsEditing] = useState<boolean>(!completedAt);

  useEffect(() => {
    // If initialWeights change from parent, update the state
    setWeights(initialWeights);
  }, [initialWeights]);

  // Ensure we have the right number of weights
  useEffect(() => {
    if (weights.length !== numberOfBoxes) {
      const newWeights = [...weights];
      
      // Add missing weights
      while (newWeights.length < numberOfBoxes) {
        newWeights.push(0);
      }
      
      // Remove extra weights
      while (newWeights.length > numberOfBoxes) {
        newWeights.pop();
      }
      
      setWeights(newWeights);
    }
  }, [numberOfBoxes, weights.length]);

  const handleWeightChange = (index: number, value: string) => {
    const newWeights = [...weights];
    newWeights[index] = parseFloat(value) || 0;
    setWeights(newWeights);
  };

  const handleSaveAndPrint = () => {
    onUpdate(weights);
    setIsEditing(false);
    
    // Small delay to ensure the data is updated first
    setTimeout(() => {
      if (slip) {
        // Update the slip with the latest weights data
        const updatedSlip = {
          ...slip,
          boxWeights: weights,
          weight: weights.reduce((sum, w) => sum + w, 0)
        };
        
        // Use the appropriate PDF generator based on courier type
        const courierName = updatedSlip.courierName.toLowerCase();
        
        if (courierName.includes('steel')) {
          generateSteelCargoSlipPDF(updatedSlip);
        } else if (courierName.includes('trackon')) {
          generateTrackonSlipPDF(updatedSlip);
        } else if (courierName.includes('global') || courierName.includes('primex')) {
          generateGlobalPrimexSlipPDF(updatedSlip);
        } else {
          // For other couriers, use Steel Cargo format as the base template
          generateSteelCargoSlipPDF({...updatedSlip, courierName: "Steel Courier & Cargo"});
        }
      } else {
        // Log error for debugging
        console.error('Error: Slip data not available for printing. Using PDF is required.');
        
        // Create a temporary alert to notify the user
        alert('Error: Slip data not available for PDF printing. Please use the Print button in the actions column instead.');
      }
    }, 300);
  };

  const handleCancel = () => {
    setWeights(initialWeights);
    setIsEditing(false);
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  // If read-only and completed, show a static display
  if (readOnly && completedAt) {
    const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
    
    return (
      <div className="text-sm">
        <div className="flex items-center justify-between mb-1">
          <span className="font-medium">
            {totalWeight.toFixed(2)} kg ({weights.length} box{weights.length !== 1 ? 'es' : ''})
          </span>
          {!disabled && (
            <Button variant="ghost" size="sm" onClick={handleEdit} className="h-6 px-2">
              <Edit className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
        
        {completedAt && completedBy && (
          <div className="text-xs text-gray-500">
            Recorded {formatDistanceToNow(new Date(completedAt), { addSuffix: true })} by {completedBy}
          </div>
        )}
      </div>
    );
  }

  // Otherwise, show editable weights
  return (
    <div className="space-y-2">
      {isEditing ? (
        <>
          <div className="space-y-2">
            {weights.map((weight, index) => (
              <div key={index} className="flex items-center space-x-2">
                <span className="text-sm w-10">Box {index + 1}:</span>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={weight || ''}
                  onChange={(e) => handleWeightChange(index, e.target.value)}
                  className="w-20"
                  disabled={disabled}
                />
                <span className="text-sm">kg</span>
              </div>
            ))}
          </div>
          
          <div className="flex items-center space-x-2">
            <Button 
              size="sm"
              onClick={handleSaveAndPrint}
              disabled={disabled}
              className="h-7"
            >
              <Check className="h-3.5 w-3.5 mr-1" /> Save & Print
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleCancel}
              disabled={disabled}
              className="h-7"
            >
              <X className="h-3.5 w-3.5 mr-1" /> Cancel
            </Button>
          </div>
        </>
      ) : (
        <Button 
          variant="outline" 
          size="sm"
          onClick={handleEdit}
          disabled={disabled}
        >
          <Edit className="h-3.5 w-3.5 mr-1" /> Edit Weights
        </Button>
      )}
    </div>
  );
};

export default BoxWeight;
