/**
 * PDF Generator for CourierSlips using the browser's capabilities
 * This bypasses the DOM rendering issues and creates clean PDFs directly
 */

import { CourierSlip } from '@/types/models';
import JsBarcode from 'jsbarcode';

// A4 dimensions in mm
const A4_WIDTH_MM = 210;
const A4_HEIGHT_MM = 297;

// Function to convert SVG barcode to base64 data URL
const generateBarcodeDataURL = (trackingId: string): string => {
  // Create a temporary SVG element
  const svgElement = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  
  // Generate the barcode in the SVG
  JsBarcode(svgElement, trackingId, {
    format: "CODE128",
    displayValue: false,
    lineColor: "#000",
    width: 2,
    height: 50,
    margin: 5,
  });
  
  // Convert the SVG to a string
  const svgString = new XMLSerializer().serializeToString(svgElement);
  
  // Create a base64 encoded data URL
  const dataURL = `data:image/svg+xml;base64,${btoa(svgString)}`;
  
  return dataURL;
};

// Create iframe for printing
const createPrintIframe = (htmlContent: string): void => {
  // Create a hidden iframe to render the HTML
  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  document.body.appendChild(iframe);
  
  // Write the HTML content to the iframe
  const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
  if (iframeDoc) {
    iframeDoc.open();
    iframeDoc.write(htmlContent);
    iframeDoc.close();
    
    // Print the iframe content after a short delay to ensure it's fully rendered
    setTimeout(() => {
      try {
        // Focus the iframe window
        iframe.contentWindow?.focus();
        
        // Print the iframe content
        iframe.contentWindow?.print();
        
        // Remove the iframe after printing
        setTimeout(() => {
          document.body.removeChild(iframe);
        }, 1000);
      } catch (error) {
        console.error('Error printing PDF:', error);
      }
    }, 500);
  }
};

/**
 * Creates a PDF for Steel Cargo slips
 */
export const generateSteelCargoSlipPDF = (slip: CourierSlip): void => {
  const numberOfBoxes = slip.numberOfBoxes || 1;
  const barcodeDataURL = generateBarcodeDataURL(slip.trackingId);
  const slipHeight = Math.floor(A4_HEIGHT_MM / 3) - 5;
  
  const weightDisplay = numberOfBoxes > 1 
    ? Array.from({length: numberOfBoxes}, (_, i) => 
        `box ${i+1}/${numberOfBoxes} = ${slip.weight ? (slip.weight / numberOfBoxes).toFixed(1) : '?'} kg`
      ).join('<br>') 
    : (slip.weight ? `${slip.weight} kg` : 'N/A');
  
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Steel Cargo Courier Slip</title>
      <meta charset="utf-8">
      <style>
        @page { size: A4 portrait; margin: 5mm; margin-bottom: 0; }
        body { font-family: Arial, sans-serif; margin: 0; padding: 0; background: white; }
        .slip-container { width: 100%; height: ${slipHeight}mm; margin-bottom: 2mm; position: relative; }
        .slip { border: 2px solid #000; border-radius: 5px; background: #f8f8f8; width: 100%; height: 100%; }
        .grid { display: flex; flex-wrap: wrap; height: 100%; }
        .row { display: flex; width: 100%; border-bottom: 1px solid black; }
        .row:last-child { border-bottom: none; }
        .col { padding: 5px; box-sizing: border-box; }
        .col-border-right { border-right: 1px solid black; }
        .header-row { height: 30%; }
        .middle-row { height: 40%; }
        .footer-row { height: 20%; }
        .terms-row { height: 10%; }
        .barcode-col { width: 33.3%; display: flex; flex-direction: column; align-items: center; justify-content: space-between; }
        .company-col { width: 41.7%; display: flex; flex-direction: column; align-items: center; justify-content: space-between; text-align: center; }
        .destination-col { width: 25%; position: relative; }
        .sender-col, .receiver-col { width: 50%; overflow: hidden; }
        .info-col { width: 66.7%; }
        .details-col { width: 33.3%; }
        .tiny-text { font-size: 7px; }
        .small-text { font-size: 10px; }
        .medium-text { font-size: 12px; }
        .large-text { font-size: 16px; font-weight: bold; }
        .red-text { color: #c00; }
        .barcode-img { width: 90%; height: auto; max-height: 60px; }
        .tracking-id { font-size: 18px; font-weight: bold; text-align: center; }
        .copy-type { position: absolute; top: 5px; right: 5px; font-weight: bold; font-size: 10px; }
        .bold { font-weight: bold; }
        .text-center { text-align: center; }
        .details-label { font-weight: bold; font-size: 10px; }
        .details-value { font-weight: bold; font-size: 14px; }
        .to-pay { color: #c00; font-weight: bold; }
      </style>
    </head>
    <body>
      ${[
        { type: 'Original', copyName: 'Sender Copy' },
        { type: 'Duplicate', copyName: 'Receiver Copy' },
        { type: 'Triplicate', copyName: 'Office Copy' }
      ].map(copy => `
        <div class="slip-container">
          <div class="slip">
            <div class="grid">
              <div class="row header-row">
                <div class="col col-border-right barcode-col">
                  <div class="small-text bold">Document/Packet No.</div>
                  <img class="barcode-img" src="${barcodeDataURL}" alt="Barcode">
                  <div class="tracking-id">${slip.trackingId}</div>
                </div>
                <div class="col col-border-right company-col">
                  <div class="large-text red-text">Steel Courier & Cargo</div>
                  <div class="small-text red-text">EXPRESS DISTRIBUTION SERVICES</div>
                  <div class="small-text">
                    B-38, Skipper House, 62-63, Nehru Place,<br>
                    New Delhi - 110 019, Phone: +91-9213097800<br>
                    Email: steelcourier@gmail.com<br>
                    GST IN NO: 07AARJJ1080C1ZL
                  </div>
                </div>
                <div class="col destination-col">
                  <div class="small-text bold" style="border-bottom: 1px solid black; padding-bottom: 2px;">Destination</div>
                  <div class="large-text text-center" style="margin-top: 20px;">
                    ${slip.customerAddress.split(', ').slice(-3, -2)[0] || 'DESTINATION'}
                  </div>
                  <div class="copy-type">${copy.type}</div>
                </div>
              </div>
              
              <div class="row middle-row">
                <div class="col col-border-right sender-col">
                  <div class="small-text bold" style="border-bottom: 1px solid black; padding-bottom: 2px;">From (Sender)</div>
                  <div style="padding: 5px 0;">
                    <div class="medium-text bold">${slip.senderName}</div>
                    <div class="small-text">${slip.senderAddress}</div>
                  </div>
                </div>
                <div class="col receiver-col">
                  <div class="small-text bold" style="border-bottom: 1px solid black; padding-bottom: 2px;">To (Receiver)</div>
                  <div style="padding: 5px 0;">
                    <div class="medium-text bold">${slip.customerName}</div>
                    <div class="small-text">${slip.customerAddress}</div>
                    <div class="small-text">Phone: ${slip.customerMobile}</div>
                  </div>
                </div>
              </div>
              
              <div class="row footer-row">
                <div class="col col-border-right info-col">
                  <div style="display: flex; height: 100%;">
                    <div style="width: 33%; border-right: 1px solid black; padding: 5px; box-sizing: border-box;">
                      <div class="small-text bold text-center">Received by STEEL COURIER</div>
                    </div>
                    <div style="width: 67%; padding: 5px; box-sizing: border-box;">
                      <div style="display: flex; margin-top: 10px;">
                        <div style="width: 50%; text-align: center;" class="small-text">Time</div>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="col details-col">
                  <div style="display: flex; flex-wrap: wrap; height: 100%;">
                    <div style="width: 50%; text-align: center; padding: 5px; box-sizing: border-box;">
                      <div class="details-label">No. of Boxes</div>
                      <div class="details-value">${numberOfBoxes}</div>
                    </div>
                    <div style="width: 50%; text-align: center; padding: 5px; box-sizing: border-box;">
                      <div class="details-label">Weight</div>
                      <div class="details-value small-text">${weightDisplay}</div>
                    </div>
                    <div style="width: 100%; text-align: center; padding: 5px; box-sizing: border-box;">
                      <div class="details-label">Shipment</div>
                      <div style="font-size: 18px; font-weight: bold;">
                        ${slip.method === 'air' ? 'Air' : 'Surface'}
                      </div>
                      ${slip.isToPayShipping ? '<div class="to-pay">TO PAY</div>' : ''}
                    </div>
                  </div>
                </div>
              </div>
              
              <div class="row terms-row">
                <div class="col" style="width: 100%;">
                  <div class="medium-text bold red-text">${copy.copyName}</div>
                  <div class="tiny-text">
                    N.B. Liability limited to extent of our service charges.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      `).join('')}
    </body>
    </html>
  `;
  
  createPrintIframe(htmlContent);
};

/**
 * Creates a PDF for Trackon slips
 */
export const generateTrackonSlipPDF = (slip: CourierSlip): void => {
  const numberOfBoxes = slip.numberOfBoxes || 1;
  const barcodeDataURL = generateBarcodeDataURL(slip.trackingId);
  const slipHeight = Math.floor(A4_HEIGHT_MM / 3) - 5;
  
  const weightDisplay = numberOfBoxes > 1 
    ? Array.from({length: numberOfBoxes}, (_, i) => 
        `box ${i+1}/${numberOfBoxes} = ${slip.weight ? (slip.weight / numberOfBoxes).toFixed(1) : '?'} kg`
      ).join('<br>') 
    : (slip.weight ? `${slip.weight} kg` : 'N/A');
  
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Trackon Courier Slip</title>
      <meta charset="utf-8">
      <style>
        @page { size: A4 portrait; margin: 5mm; margin-bottom: 0; }
        body { font-family: Arial, sans-serif; margin: 0; padding: 0; background: white; }
        .slip-container { width: 100%; height: ${slipHeight}mm; margin-bottom: 2mm; position: relative; }
        .slip { border: 2px solid #000; border-radius: 5px; background: #f8f8f8; width: 100%; height: 100%; }
        .grid { display: flex; flex-wrap: wrap; height: 100%; }
        .row { display: flex; width: 100%; border-bottom: 1px solid black; }
        .row:last-child { border-bottom: none; }
        .col { padding: 5px; box-sizing: border-box; }
        .col-border-right { border-right: 1px solid black; }
        .header-row { height: 30%; }
        .middle-row { height: 40%; }
        .footer-row { height: 20%; }
        .terms-row { height: 10%; }
        .barcode-col { width: 33.3%; display: flex; flex-direction: column; align-items: center; justify-content: space-between; }
        .company-col { width: 41.7%; display: flex; flex-direction: column; align-items: center; justify-content: space-between; text-align: center; }
        .destination-col { width: 25%; position: relative; }
        .sender-col, .receiver-col { width: 50%; overflow: hidden; }
        .info-col { width: 66.7%; }
        .details-col { width: 33.3%; }
        .tiny-text { font-size: 7px; }
        .small-text { font-size: 10px; }
        .medium-text { font-size: 12px; }
        .large-text { font-size: 16px; font-weight: bold; }
        .blue-text { color: #0066cc; }
        .barcode-img { width: 90%; height: auto; max-height: 60px; }
        .tracking-id { font-size: 18px; font-weight: bold; text-align: center; }
        .copy-type { position: absolute; top: 5px; right: 5px; font-weight: bold; font-size: 10px; }
        .bold { font-weight: bold; }
        .text-center { text-align: center; }
        .details-label { font-weight: bold; font-size: 10px; }
        .details-value { font-weight: bold; font-size: 14px; }
        .to-pay { color: #c00; font-weight: bold; }
      </style>
    </head>
    <body>
      ${[
        { type: 'Original', copyName: 'Customer Copy' },
        { type: 'Duplicate', copyName: 'POD Copy' },
        { type: 'Triplicate', copyName: 'Office Copy' }
      ].map(copy => `
        <div class="slip-container">
          <div class="slip">
            <div class="grid">
              <div class="row header-row">
                <div class="col col-border-right barcode-col">
                  <div class="small-text bold">Consignment No.</div>
                  <img class="barcode-img" src="${barcodeDataURL}" alt="Barcode">
                  <div class="tracking-id">${slip.trackingId}</div>
                </div>
                <div class="col col-border-right company-col">
                  <div class="large-text blue-text">TRACKON COURIERS</div>
                  <div class="small-text blue-text">EXPRESS DELIVERY SERVICES</div>
                  <div class="small-text">
                    56, Nehru Place Commercial Complex,<br>
                    New Delhi - 110019, Ph: 011-41619930<br>
                    Email: info@trackoncouriers.com
                  </div>
                </div>
                <div class="col destination-col">
                  <div class="small-text bold" style="border-bottom: 1px solid black; padding-bottom: 2px;">Destination</div>
                  <div class="large-text text-center" style="margin-top: 20px;">
                    ${slip.customerAddress.split(', ').slice(-3, -2)[0] || 'DESTINATION'}
                  </div>
                  <div class="copy-type">${copy.type}</div>
                </div>
              </div>
              
              <div class="row middle-row">
                <div class="col col-border-right sender-col">
                  <div class="small-text bold" style="border-bottom: 1px solid black; padding-bottom: 2px;">From (Sender)</div>
                  <div style="padding: 5px 0;">
                    <div class="medium-text bold">${slip.senderName}</div>
                    <div class="small-text">${slip.senderAddress}</div>
                  </div>
                </div>
                <div class="col receiver-col">
                  <div class="small-text bold" style="border-bottom: 1px solid black; padding-bottom: 2px;">To (Receiver)</div>
                  <div style="padding: 5px 0;">
                    <div class="medium-text bold">${slip.customerName}</div>
                    <div class="small-text">${slip.customerAddress}</div>
                    <div class="small-text">Phone: ${slip.customerMobile}</div>
                  </div>
                </div>
              </div>
              
              <div class="row footer-row">
                <div class="col col-border-right info-col">
                  <div style="display: flex; height: 100%;">
                    <div style="width: 33%; border-right: 1px solid black; padding: 5px; box-sizing: border-box;">
                      <div class="small-text bold text-center">Receiver's Signature</div>
                    </div>
                    <div style="width: 67%; padding: 5px; box-sizing: border-box;">
                      <div class="small-text bold">Date of Booking: ${new Date().toLocaleDateString()}</div>
                      <div class="small-text bold">Service Type: ${slip.method === 'air' ? 'Air' : 'Surface'}</div>
                    </div>
                  </div>
                </div>
                <div class="col details-col">
                  <div style="display: flex; flex-wrap: wrap; height: 100%;">
                    <div style="width: 50%; text-align: center; padding: 5px; box-sizing: border-box;">
                      <div class="details-label">No. of Boxes</div>
                      <div class="details-value">${numberOfBoxes}</div>
                    </div>
                    <div style="width: 50%; text-align: center; padding: 5px; box-sizing: border-box;">
                      <div class="details-label">Weight</div>
                      <div class="details-value small-text">${weightDisplay}</div>
                    </div>
                    <div style="width: 100%; text-align: center; padding: 5px; box-sizing: border-box;">
                      ${slip.isToPayShipping ? '<div class="to-pay">TO PAY</div>' : ''}
                    </div>
                  </div>
                </div>
              </div>
              
              <div class="row terms-row">
                <div class="col" style="width: 100%;">
                  <div class="medium-text bold blue-text">${copy.copyName}</div>
                  <div class="tiny-text">
                    Subject to standard terms and conditions. Visit trackoncouriers.com for details.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      `).join('')}
    </body>
    </html>
  `;
  
  createPrintIframe(htmlContent);
};

/**
 * Creates a PDF for Global Primex slips
 */
export const generateGlobalPrimexSlipPDF = (slip: CourierSlip): void => {
  const numberOfBoxes = slip.numberOfBoxes || 1;
  const barcodeDataURL = generateBarcodeDataURL(slip.trackingId);
  const slipHeight = Math.floor(A4_HEIGHT_MM / 3) - 5;
  
  const weightDisplay = numberOfBoxes > 1 
    ? Array.from({length: numberOfBoxes}, (_, i) => 
        `box ${i+1}/${numberOfBoxes} = ${slip.weight ? (slip.weight / numberOfBoxes).toFixed(1) : '?'} kg`
      ).join('<br>') 
    : (slip.weight ? `${slip.weight} kg` : 'N/A');
  
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Global Primex Courier Slip</title>
      <meta charset="utf-8">
      <style>
        @page { size: A4 portrait; margin: 5mm; margin-bottom: 0; }
        body { font-family: Arial, sans-serif; margin: 0; padding: 0; background: white; }
        .slip-container { width: 100%; height: ${slipHeight}mm; margin-bottom: 2mm; position: relative; }
        .slip { border: 2px solid #000; border-radius: 5px; background: #f8f8f8; width: 100%; height: 100%; }
        .grid { display: flex; flex-wrap: wrap; height: 100%; }
        .row { display: flex; width: 100%; border-bottom: 1px solid black; }
        .row:last-child { border-bottom: none; }
        .col { padding: 5px; box-sizing: border-box; }
        .col-border-right { border-right: 1px solid black; }
        .header-row { height: 30%; }
        .middle-row { height: 40%; }
        .footer-row { height: 20%; }
        .terms-row { height: 10%; }
        .barcode-col { width: 33.3%; display: flex; flex-direction: column; align-items: center; justify-content: space-between; }
        .company-col { width: 41.7%; display: flex; flex-direction: column; align-items: center; justify-content: space-between; text-align: center; }
        .destination-col { width: 25%; position: relative; }
        .sender-col, .receiver-col { width: 50%; overflow: hidden; }
        .info-col { width: 66.7%; }
        .details-col { width: 33.3%; }
        .tiny-text { font-size: 7px; }
        .small-text { font-size: 10px; }
        .medium-text { font-size: 12px; }
        .large-text { font-size: 16px; font-weight: bold; }
        .green-text { color: #006633; }
        .barcode-img { width: 90%; height: auto; max-height: 60px; }
        .tracking-id { font-size: 18px; font-weight: bold; text-align: center; }
        .copy-type { position: absolute; top: 5px; right: 5px; font-weight: bold; font-size: 10px; }
        .bold { font-weight: bold; }
        .text-center { text-align: center; }
        .details-label { font-weight: bold; font-size: 10px; }
        .details-value { font-weight: bold; font-size: 14px; }
        .to-pay { color: #c00; font-weight: bold; }
      </style>
    </head>
    <body>
      ${[
        { type: 'Original', copyName: 'Customer Copy' },
        { type: 'Duplicate', copyName: 'POD Copy' },
        { type: 'Triplicate', copyName: 'Office Copy' }
      ].map(copy => `
        <div class="slip-container">
          <div class="slip">
            <div class="grid">
              <div class="row header-row">
                <div class="col col-border-right barcode-col">
                  <div class="small-text bold">AWB No.</div>
                  <img class="barcode-img" src="${barcodeDataURL}" alt="Barcode">
                  <div class="tracking-id">${slip.trackingId}</div>
                </div>
                <div class="col col-border-right company-col">
                  <div class="large-text green-text">GLOBAL PRIMEX</div>
                  <div class="small-text green-text">INTERNATIONAL COURIER & CARGO</div>
                  <div class="small-text">
                    F-16, Lajpat Nagar II, New Delhi - 110024<br>
                    Ph: 011-40503000, 29830000<br>
                    Email: info@globalprimex.com
                  </div>
                </div>
                <div class="col destination-col">
                  <div class="small-text bold" style="border-bottom: 1px solid black; padding-bottom: 2px;">Destination</div>
                  <div class="large-text text-center" style="margin-top: 20px;">
                    ${slip.customerAddress.split(', ').slice(-3, -2)[0] || 'DESTINATION'}
                  </div>
                  <div class="copy-type">${copy.type}</div>
                </div>
              </div>
              
              <div class="row middle-row">
                <div class="col col-border-right sender-col">
                  <div class="small-text bold" style="border-bottom: 1px solid black; padding-bottom: 2px;">From (Sender)</div>
                  <div style="padding: 5px 0;">
                    <div class="medium-text bold">${slip.senderName}</div>
                    <div class="small-text">${slip.senderAddress}</div>
                  </div>
                </div>
                <div class="col receiver-col">
                  <div class="small-text bold" style="border-bottom: 1px solid black; padding-bottom: 2px;">To (Receiver)</div>
                  <div style="padding: 5px 0;">
                    <div class="medium-text bold">${slip.customerName}</div>
                    <div class="small-text">${slip.customerAddress}</div>
                    <div class="small-text">Phone: ${slip.customerMobile}</div>
                  </div>
                </div>
              </div>
              
              <div class="row footer-row">
                <div class="col col-border-right info-col">
                  <div style="display: flex; height: 100%;">
                    <div style="width: 33%; border-right: 1px solid black; padding: 5px; box-sizing: border-box;">
                      <div class="small-text bold text-center">Receiver's Signature</div>
                    </div>
                    <div style="width: 67%; padding: 5px; box-sizing: border-box;">
                      <div class="small-text bold">Date: ${new Date().toLocaleDateString()}</div>
                      <div class="small-text bold">Type: ${slip.method === 'air' ? 'Air' : 'Surface'}</div>
                    </div>
                  </div>
                </div>
                <div class="col details-col">
                  <div style="display: flex; flex-wrap: wrap; height: 100%;">
                    <div style="width: 50%; text-align: center; padding: 5px; box-sizing: border-box;">
                      <div class="details-label">No. of Boxes</div>
                      <div class="details-value">${numberOfBoxes}</div>
                    </div>
                    <div style="width: 50%; text-align: center; padding: 5px; box-sizing: border-box;">
                      <div class="details-label">Weight</div>
                      <div class="details-value small-text">${weightDisplay}</div>
                    </div>
                    <div style="width: 100%; text-align: center; padding: 5px; box-sizing: border-box;">
                      ${slip.isToPayShipping ? '<div class="to-pay">TO PAY</div>' : ''}
                    </div>
                  </div>
                </div>
              </div>
              
              <div class="row terms-row">
                <div class="col" style="width: 100%;">
                  <div class="medium-text bold green-text">${copy.copyName}</div>
                  <div class="tiny-text">
                    Subject to standard terms and conditions.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      `).join('')}
    </body>
    </html>
  `;
  
  createPrintIframe(htmlContent);
};
