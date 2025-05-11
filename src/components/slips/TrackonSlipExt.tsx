
import React from 'react';
import { CourierSlip } from '@/types/models';
import JsBarcode from 'jsbarcode';
import { useEffect, useRef } from 'react';

interface TrackonSlipExtProps {
  slip: CourierSlip;
}

/**
 * Extension version of Trackon slip 
 * This file is meant for easy customization if needed
 */
export const TrackonSlipExt: React.FC<TrackonSlipExtProps> = ({ slip }) => {
  // Create refs for each copy's barcodes
  const barcodeRefs = [useRef<SVGSVGElement>(null), useRef<SVGSVGElement>(null), useRef<SVGSVGElement>(null)];
  const barcodeSideRefs = [useRef<SVGSVGElement>(null), useRef<SVGSVGElement>(null), useRef<SVGSVGElement>(null)];
  
  useEffect(() => {
    // Generate barcodes for each copy
    barcodeRefs.forEach(ref => {
      if (ref.current) {
        JsBarcode(ref.current, slip.trackingId, {
          format: "CODE128",
          lineColor: "#000",
          width: 1.5,
          height: 40,
          displayValue: false
        });
      }
    });
    
    // Generate side barcodes for each copy
    barcodeSideRefs.forEach(ref => {
      if (ref.current) {
        JsBarcode(ref.current, slip.trackingId, {
          format: "CODE128",
          lineColor: "#000",
          width: 1,
          height: 70,
          displayValue: false
        });
      }
    });
  }, [slip.trackingId]);

  const numberOfBoxes = slip.numberOfBoxes || 1;
  
  // Format mobile number with secondary number if available
  const formatMobileNumbers = (mobile: string) => {
    const parts = mobile.split('/');
    return parts.join(' / ');
  };
  
  // Style for the main slip container
  const slipStyle: React.CSSProperties = {
    fontFamily: 'Arial, sans-serif',
    border: '1px solid #000',
    width: '7.5in',
    pageBreakInside: 'avoid',
    background: '#fff',
  };
  
  const renderSlip = (copyNum: number) => {
    const copyText = copyNum === 1 ? "Original" : copyNum === 2 ? "Duplicate" : "Triplicate";
    
    return (
      <div key={copyNum} className={`border border-black mb-4 relative ${slip.isCancelled ? 'line-through opacity-70' : ''}`} style={slipStyle}>
        {slip.isCancelled && (
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <div className="bg-red-500 text-white px-4 py-2 transform rotate-45 text-2xl font-bold">
              CANCELLED
            </div>
          </div>
        )}
        
        {/* Top Header with logo and tracking info */}
        <div className="border-b border-black p-1 flex items-center">
          <div className="w-1/4 text-left text-brown-700 font-bold text-xl pl-2" style={{ color: '#8B4513' }}>
            Trackon
            <div className="text-xs">SWIFT. SAFE. SURE.</div>
          </div>
          <div className="w-1/2 flex flex-col items-center">
            <div className="w-full">
              <svg ref={barcodeRefs[copyNum-1]} className="w-full h-10"></svg>
            </div>
            <div className="text-sm font-bold">{slip.trackingId}</div>
          </div>
          <div className="w-1/4 text-right pr-2 text-xs">
            <div>Track your shipment</div>
            <div>www.trackon.in</div>
            <div className="font-bold text-sm">{copyText}</div>
          </div>
        </div>
        
        {/* Side barcode and main content grid */}
        <div className="flex">
          {/* Left side barcode */}
          <div className="w-16 border-r border-black p-1 flex flex-col items-center">
            <svg ref={barcodeSideRefs[copyNum-1]} width="70" height="200"></svg>
            <div className="text-xs mt-1 rotate-90 transform origin-center" style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}>
              {slip.trackingId}
            </div>
          </div>
          
          {/* Main content area */}
          <div className="flex-1">
            {/* Address Section */}
            <div className="grid grid-cols-2 border-b border-black">
              {/* Consignor / Sender */}
              <div className="border-r border-black p-1">
                <div className="text-xs uppercase font-bold mb-1">CONSIGNOR</div>
                <div className="min-h-20 text-xs">
                  <div className="font-bold">{slip.senderName}</div>
                  <div className="text-[10px] leading-tight">{slip.senderAddress}</div>
                </div>
              </div>
              
              {/* Consignee / Receiver */}
              <div className="p-1">
                <div className="text-xs uppercase font-bold mb-1">CONSIGNEE</div>
                <div className="min-h-20 text-xs">
                  <div className="font-bold">{slip.customerName}</div>
                  <div className="text-[10px] leading-tight">{slip.customerAddress}</div>
                  <div className="text-[10px]">Phone: {formatMobileNumbers(slip.customerMobile)}</div>
                </div>
              </div>
            </div>
            
            {/* Middle section with terms and condition */}
            <div className="border-b border-black p-1">
              <div className="text-[7px] text-center italic">
                I/not covered by special risk surcharges, claim value on this shipment shall in no circumstances exceed Rs. 1000/- (Rupees Two thousand Only) For parcels and RS. 100/- (Rupeed One Hundred Only) For Pack of Documents
                <br />
                I/We have read and agreed to all TERMS & CONDITIONS overleaf, CAREFULLY
              </div>
              <div className="flex justify-between mt-1">
                <div className="text-xs">
                  <div>P.O.D. / RECEIVER COPY</div>
                  <div className="text-[8px]">Received by TCI</div>
                </div>
                <div className="flex flex-col items-center">
                  <div className="text-[8px]">Signature</div>
                  <div className="w-20 h-8 border-b border-black"></div>
                </div>
              </div>
            </div>
            
            {/* Bottom grid with details */}
            <div className="grid grid-cols-11 border-b border-black text-[8px] text-center">
              <div className="col-span-1 border-r border-black p-1">
                <div className="font-bold">ORIGIN</div>
                <div>DELHI</div>
              </div>
              <div className="col-span-1 border-r border-black p-1">
                <div className="font-bold">DESTINATION</div>
                <div>{slip.customerAddress.split(',').pop()?.trim() || 'N/A'}</div>
              </div>
              <div className="col-span-1 border-r border-black p-1">
                <div className="font-bold">DOX/NBOX</div>
                <div>BOX</div>
              </div>
              <div className="col-span-1 border-r border-black p-1">
                <div className="font-bold">PCS.</div>
                <div>{numberOfBoxes}</div>
              </div>
              <div className="col-span-1 border-r border-black p-1">
                <div className="font-bold">WEIGHT</div>
                <div>{slip.weight ? `${slip.weight} kg` : 'N/A'}</div>
              </div>
              {/* MAKING SHIPMENT INFO BOLDER AND 50% LARGER */}
              <div className="col-span-1 border-r border-black p-1">
                <div className="font-bold">AIR/SURFACE</div>
                <div className="uppercase text-lg font-bold">{slip.method}</div>
              </div>
              <div className="col-span-1 border-r border-black p-1">
                <div className="font-bold">COURIER CHARGES</div>
                <div>
                  {slip.isToPayShipping ? (
                    <span className="text-red-600 font-bold">TO PAY</span>
                  ) : (
                    `₹${slip.charges}`
                  )}
                </div>
              </div>
              <div className="col-span-1 border-r border-black p-1">
                <div className="font-bold">RISK CHARGES</div>
                <div>-</div>
              </div>
              <div className="col-span-1 border-r border-black p-1">
                <div className="font-bold">GST</div>
                <div>
                  {!slip.isToPayShipping ? `₹${(slip.charges * 0.18).toFixed(2)}` : '-'}
                </div>
              </div>
              <div className="col-span-1 border-r border-black p-1">
                <div className="font-bold">TOTAL</div>
                <div>
                  {!slip.isToPayShipping ? `₹${(slip.charges * 1.18).toFixed(2)}` : '-'}
                </div>
              </div>
              <div className="col-span-1 p-1">
                <div className="font-bold">CASH</div>
                <div className="h-4">
                  <input type="checkbox" className="h-3 w-3" disabled />
                </div>
              </div>
            </div>
            
            {/* Footer - Removed date as requested */}
            <div className="grid grid-cols-2 text-[8px]">
              <div className="col-span-1 border-r border-black p-1 flex items-center">
                <div>
                  <div>TIME</div>
                  <div>{new Date(slip.generatedAt).toLocaleTimeString()}</div>
                </div>
              </div>
              <div className="col-span-1 p-1">
                <div className="uppercase font-bold text-[7px]">
                  FOR YOUR PERSONAL AND VALUABLE ITEMS, USE OUR EXPRESS SERVICE - PRIME TRACK
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  return (
    <div className="print-only trackon-slip-container">
      {renderSlip(1)}
      {renderSlip(2)}
      {renderSlip(3)}
    </div>
  );
};

export default TrackonSlipExt;
