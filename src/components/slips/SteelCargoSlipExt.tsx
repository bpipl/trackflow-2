
import React from 'react';
import { CourierSlip } from '@/types/models';
import JsBarcode from 'jsbarcode';

interface SteelCargoSlipExtProps {
  slip: CourierSlip;
}

/**
 * Extension version of Steel Courier & Cargo slip 
 * This file is meant for easy customization if needed
 */
export const SteelCargoSlipExt: React.FC<SteelCargoSlipExtProps> = ({ slip }) => {
  const numberOfBoxes = slip.numberOfBoxes || 1;
  
  // Create refs for the barcode SVGs
  const barcodeRef1 = React.useRef<SVGSVGElement>(null);
  const barcodeRef2 = React.useRef<SVGSVGElement>(null);
  const barcodeRef3 = React.useRef<SVGSVGElement>(null);
  
  // Generate the barcodes when the component mounts
  React.useEffect(() => {
    [barcodeRef1, barcodeRef2, barcodeRef3].forEach(ref => {
      if (ref.current) {
        JsBarcode(ref.current, slip.trackingId, {
          format: "CODE128",
          displayValue: false,
          lineColor: "#000",
          width: 2,
          height: 50, // Increased height for better visibility
          margin: 5,
        });
      }
    });
  }, [slip.trackingId]);
  
  // Style for the main slip container
  const slipStyle: React.CSSProperties = {
    fontFamily: 'Arial, sans-serif',
    border: '2px solid #000',
    borderRadius: '8px',
    margin: '0.1in auto',
    width: '7.5in',
    pageBreakInside: 'avoid' as const,
    background: '#f8f8f8',
  };
  
  const renderSlip = (copyNum: number) => {
    const copyText = copyNum === 1 ? "Original" : copyNum === 2 ? "Duplicate" : "Triplicate";
    const barcodeRef = copyNum === 1 ? barcodeRef1 : copyNum === 2 ? barcodeRef2 : barcodeRef3;
    
    return (
      <div key={copyNum} className={`steel-slip border-2 border-black rounded-md mb-4 relative ${slip.isCancelled ? 'line-through opacity-70' : ''}`} style={slipStyle}>
        {/* Cancelled overlay if needed */}
        {slip.isCancelled && (
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <div className="bg-red-500 text-white px-4 py-2 transform rotate-45 text-2xl font-bold">
              CANCELLED
            </div>
          </div>
        )}
        
        {/* Top Header Row */}
        <div className="grid grid-cols-12 border-b border-black">
          {/* Document/Packet Number Area - INCREASED WIDTH BY 25% */}
          <div className="col-span-4 border-r border-black p-2 flex flex-col items-center">
            <div className="text-xs font-bold">Document/Packet No.</div>
            <div className="my-2 w-full">
              <svg ref={barcodeRef} className="w-full h-16"></svg>
            </div>
            <div className="text-2xl font-bold text-center">
              {slip.trackingId}
            </div>
          </div>
          
          {/* Steel Courier & Cargo Logo and Address */}
          <div className="col-span-5 border-r border-black text-center p-1 flex flex-col items-center justify-between">
            <div className="font-bold text-xl text-red-600">Steel Courier & Cargo</div>
            <div className="text-xs">
              B-3/B, Skipper House, 62&63, Nehru Place
              <br />
              New Delhi : 110 019, Phone : 45586770
              <br />
              Email : info@steelcargo.com
            </div>
            <div className="text-xs italic text-[6px]">
              I hereby declare that this Consignment does not contain any personal mail, Cash
              or Cash Equivalents or Contraband etc. And also declare that all way bill, octroi's 
              responsibility of consignor or consignee.
            </div>
          </div>
          
          {/* Destination Area - REDUCED WIDTH */}
          <div className="col-span-3 p-1">
            <div className="border-b border-black">
              <div className="text-xs font-bold">Destination</div>
            </div>
            <div className="p-1 h-20 flex items-center justify-center">
              <div className="text-2xl font-bold">
                {slip.customerAddress.split(', ').slice(-3, -2)[0] || 'DESTINATION'}
              </div>
            </div>
            <div className="absolute top-1 right-2 text-xs font-bold">{copyText}</div>
          </div>
        </div>
        
        {/* Middle Row - Sender and Receiver Details side by side */}
        <div className="grid grid-cols-12 border-b border-black">
          {/* Sender Details */}
          <div className="col-span-6 border-r border-black p-2">
            <div className="text-xs font-bold border-b border-black pb-1">Sender's Details</div>
            <div className="p-1 h-24 overflow-hidden relative">
              <div className="text-lg font-bold">{slip.senderName}</div>
              <div className="text-xs">{slip.senderAddress}</div>
              <div className="text-xs pt-1">Phone: {slip.senderAddress.split('Phone: ')[1] || 'N/A'}</div>
            </div>
          </div>
          
          {/* Receiver Details */}
          <div className="col-span-6 p-2">
            <div className="text-xs font-bold border-b border-black pb-1">Receiver's Details</div>
            <div className="p-1 h-24 overflow-hidden">
              <div className="text-lg font-bold">{slip.customerName}</div>
              <div className="text-xs">{slip.customerAddress}</div>
              <div className="text-xs pt-1">Phone: {slip.customerMobile}</div>
            </div>
          </div>
        </div>
        
        {/* Bottom Row - Information and Signature */}
        <div className="grid grid-cols-12 text-xs">
          <div className="col-span-8 border-r border-black p-2">
            <div className="grid grid-cols-3 h-full">
              <div className="border-r border-black p-1">
                {/* REMOVED DATE AS REQUESTED */}
                <div className="text-xs font-bold text-center">Received by STEEL COURIER & CARGO</div>
                <div className="text-center mb-1 text-[10px]">For Receiver's Signature and Seal</div>
              </div>
              <div className="col-span-2 p-1">
                <div className="grid grid-cols-2 mt-2">
                  <div className="text-center">
                    <div>P.M.</div>
                    <div>A.M.</div>
                  </div>
                  <div className="text-center">Time</div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-span-4 p-1">
            <div className="grid grid-cols-4">
              {/* REMOVED DATE FIELD */}
              <div className="p-1 text-center">
                <div className="text-xs font-bold">No. of Pieces</div>
                <div className="font-bold">{numberOfBoxes}</div>
              </div>
              <div className="p-1 text-center">
                <div className="text-xs font-bold">Weight</div>
                <div className="font-bold">{slip.weight ? `${slip.weight} kg` : 'N/A'}</div>
              </div>
              {/* MAKING SHIPMENT INFO BOLDER AND 50% LARGER */}
              <div className="col-span-2 p-1 text-center">
                <div className="text-xs font-bold">Shipment</div>
                <div className="text-xl font-bold">
                  {slip.method === 'air' ? 'Air' : 'Surface'}
                </div>
                {slip.isToPayShipping && <div className="font-bold text-red-600 mt-1">TO PAY</div>}
              </div>
            </div>
          </div>
        </div>
        
        {/* Terms and Condition Footer */}
        <div className="border-t border-black p-1">
          <div className="text-sm font-bold text-red-600">Sender Copy</div>
          <div className="text-[8px] italic">
            N.B. In case of any problem, Instrument subject to clearance from concerned bank, Loss of shipment, limited to Rs. 100/- per
            consignment. Liability limited to extent of our service charges unless specially declared and accepted in writing by an
            officer of the organization
          </div>
        </div>
      </div>
    );
  };
  
  return (
    <div className="print-only steel-slip-container">
      {renderSlip(1)}
      {renderSlip(2)}
      {renderSlip(3)}
    </div>
  );
};

export default SteelCargoSlipExt;
