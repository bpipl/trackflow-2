import React from 'react';
import { CourierSlip } from '@/types/models';
import JsBarcode from 'jsbarcode';

interface ShreeCourierSlipProps {
  slip: CourierSlip;
}

export const ShreeCourierSlip: React.FC<ShreeCourierSlipProps> = ({ slip }) => {
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
          height: 50,
          margin: 5,
        });
      }
    });
  }, [slip.trackingId]);
  
  // Style for the main slip container - smaller size to fit 3 per page
  const slipStyle: React.CSSProperties = {
    fontFamily: 'Arial, sans-serif',
    border: '2px solid #000',
    borderRadius: '8px',
    margin: '0.1in auto',
    width: '6.5in', // Reduced width (from 7.5in)
    height: '2.7in', // Standardized height to match SteelCargoSlip
    pageBreakInside: 'avoid',
    background: '#f8f8f8',
    transform: 'scale(0.75)', // Scale down to 75% of original size
    transformOrigin: 'top center',
  };
  
  const renderSlip = (copyNum: number) => {
    const copyText = copyNum === 1 ? "Original" : copyNum === 2 ? "Duplicate" : "Triplicate";
    const barcodeRef = copyNum === 1 ? barcodeRef1 : copyNum === 2 ? barcodeRef2 : barcodeRef3;
    
    return (
      <div key={copyNum} className={`shree-slip border-2 border-black rounded-md mb-4 relative ${slip.isCancelled ? 'line-through opacity-70' : ''}`} style={slipStyle}>
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
          {/* Document/Packet Number Area */}
          <div className="col-span-4 border-r border-black p-2 flex flex-col items-center">
            <div className="text-xs font-bold">Document/Packet No.</div>
            <div className="my-2 w-full">
              <svg ref={barcodeRef} className="w-full h-16"></svg>
            </div>
            <div className="text-2xl font-bold text-center">
              {slip.trackingId}
            </div>
          </div>
          
          {/* Shree Logo and Address */}
          <div className="col-span-5 border-r border-black text-center p-1 flex flex-col items-center justify-between">
            <div className="font-bold text-xl text-orange-700">Shree Courier Services (P) Ltd.</div>
            <div className="text-xs font-semibold text-orange-700">FRANCHISER</div>
            <div className="text-xs">
              NEHRU PLACE, NEW DELHI-19
              <br />
              Web: www.shreecourier.com
              <br />
              Email: info@shreecourier.com
            </div>
            <div className="text-[9px] font-bold">
              COURIER SERVICES (P) LTD.
            </div>
          </div>
          
          {/* Destination Area */}
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
            <div className="text-xs font-bold border-b border-black pb-1">From (Sender)</div>
            <div className="p-1 h-24 overflow-hidden relative">
              <div className="text-lg font-bold">{slip.senderName}</div>
              <div className="text-xs">{slip.senderAddress}</div>
              <div className="text-xs pt-1">Phone: {slip.senderAddress.split('Phone: ')[1] || 'N/A'}</div>
            </div>
          </div>
          
          {/* Receiver Details */}
          <div className="col-span-6 p-2">
            <div className="text-xs font-bold border-b border-black pb-1">To (Receiver)</div>
            <div className="p-1 h-24 overflow-hidden">
              <div className="text-lg font-bold">{slip.customerName}</div>
              <div className="text-xs">{slip.customerAddress}</div>
              <div className="text-xs pt-1">Phone: {slip.customerMobile}</div>
            </div>
          </div>
        </div>
        
        {/* Bottom Row - Information and Signature */}
        <div className="grid grid-cols-12 text-xs border-b border-black">
          <div className="col-span-8 border-r border-black p-2">
            <div className="grid grid-cols-3 h-full">
              <div className="border-r border-black p-1">
                <div className="text-xs font-bold text-center">FRANCHISEE NAME ADDRESS & CODE</div>
                <div className="text-center mb-1 text-[10px]">
                  <div className="font-bold">DHRUVI ENTERPRISES</div>
                  <div>NEHRU PLACE, NEW DELHI-19</div>
                  <div>M: 9311611210</div>
                </div>
              </div>
              <div className="col-span-2 p-1">
                <div className="grid grid-cols-2 gap-2">
                  <div className="text-center">
                    <div className="font-bold">CONSIGNMENT</div>
                    <div>RECEIVED</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold">RECEIVER'S SEAL NAME</div>
                    <div className="h-8"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-span-4 p-1">
            <div className="grid grid-cols-2">
              <div className="p-1 text-center">
                <div className="text-xs font-bold">No. of Boxes</div>
                <div className="font-bold">{numberOfBoxes}</div>
              </div>
              <div className="p-1 text-center">
                <div className="text-xs font-bold">Weight</div>
                <div className="font-bold text-xs">
                  {numberOfBoxes > 1 
                    ? <>
                        {Array.from({length: numberOfBoxes}, (_, i) => (
                          <div key={i}>
                            box {i+1}/{numberOfBoxes} = {slip.weight ? (slip.weight / numberOfBoxes).toFixed(1) : '?'} kg
                          </div>
                        ))}
                      </>
                    : (slip.weight ? `${slip.weight} kg` : 'N/A')}
                </div>
              </div>
              <div className="p-1 text-center">
                <div className="text-xs font-bold">SHIPMENT</div>
                <div className="font-bold">{slip.method === 'air' ? 'AIR' : 'SURFACE'}</div>
              </div>
              <div className="p-1 text-center">
                <div className="text-xs font-bold">PAYMENT</div>
                <div className="font-bold text-red-600">
                  {slip.isToPayShipping ? 'TO PAY' : 'PAID'}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Payment Section */}
        <div className="grid grid-cols-12 text-xs border-b border-black">
          <div className="col-span-2 border-r border-black p-1 text-center">
            <div>DATE</div>
            <div className="font-bold">{new Date().toLocaleDateString()}</div>
          </div>
          <div className="col-span-2 border-r border-black p-1 text-center">
            <div>SIGNATURE</div>
          </div>
          <div className="col-span-3 border-r border-black p-1 text-center">
            <div>COMPANY SEAL</div>
          </div>
          <div className="col-span-5 p-1 text-center">
            <div className="grid grid-cols-5">
              <div className="col-span-1 border-r border-black">
                <div>CASH</div>
                <div>{!slip.isToPayShipping ? "✓" : ""}</div>
              </div>
              <div className="col-span-1 border-r border-black">
                <div>CREDIT</div>
                <div></div>
              </div>
              <div className="col-span-3">
                <div>RECEIVED</div>
                <div>₹ {slip.charges || '-'}</div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Terms and Condition Footer */}
        <div className="p-1">
          <div className="text-sm font-bold text-orange-700">Sender Copy</div>
          <div className="text-[8px] italic">
            This is a non-negotiable document. No claim shall be entertained on this consignment in general.
            I hereby declare that this consignment does not contain any prohibited, banned or dangerous goods
            as per the applicable rules. I have read and agree to the terms and conditions of carriage.
          </div>
        </div>
      </div>
    );
  };
  
  return (
    <div id={`slip-${slip.id}`} className="print-only shree-slip-container slip-content">
      {renderSlip(1)}
      {renderSlip(2)}
      {renderSlip(3)}
    </div>
  );
};

export default ShreeCourierSlip;
