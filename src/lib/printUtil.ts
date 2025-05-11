/**
 * Enhanced print utility functions for handling printing throughout the application
 */

// Create a print container to isolate print content
const createPrintContainer = (): HTMLElement => {
  // Remove any existing print containers
  const existingContainer = document.getElementById('print-container');
  if (existingContainer) {
    document.body.removeChild(existingContainer);
  }
  
  // Create a new container
  const container = document.createElement('div');
  container.id = 'print-container';
  container.className = 'print-only';
  container.style.position = 'absolute';
  container.style.top = '0';
  container.style.left = '0';
  container.style.width = '100%';
  container.style.height = '100%';
  container.style.backgroundColor = 'white';
  container.style.zIndex = '9999';
  container.style.overflow = 'auto';
  container.style.display = 'none';
  
  document.body.appendChild(container);
  return container;
};

// Prepare the document for printing
export const preparePrint = (slipType?: 'courier' | 'receipt' | 'report'): HTMLElement => {
  // Create print container
  const printContainer = createPrintContainer();
  
  // Add print class to body to apply print styles
  document.body.classList.add('print-only');
  
  // Add slip-specific class if provided
  if (slipType) {
    document.body.classList.add(`print-${slipType}`);
    printContainer.classList.add(`print-${slipType}`);
  }
  
  return printContainer;
};

// Clean up after printing
export const cleanupPrint = (slipType?: 'courier' | 'receipt' | 'report'): void => {
  // Remove print class after printing
  setTimeout(() => {
    document.body.classList.remove('print-only');
    
    // Remove slip-specific class if it was added
    if (slipType) {
      document.body.classList.remove(`print-${slipType}`);
    }
    
    // Remove the print container
    const printContainer = document.getElementById('print-container');
    if (printContainer) {
      document.body.removeChild(printContainer);
    }
  }, 500);
};

// Print the current document
export const printDocument = (slipType?: 'courier' | 'receipt' | 'report'): void => {
  preparePrint(slipType);
  
  // Force a small delay to ensure CSS is applied
  setTimeout(() => {
    // Show print dialog
    window.print();
    
    // Cleanup after printing
    cleanupPrint(slipType);
  }, 300);
};

// Print specific slip by ID
export const printSlip = (slipId: string, slipType: 'courier' | 'receipt'): void => {
  const printContainer = preparePrint(slipType);
  
  // Get the target slip and clone it for printing
  const targetSlip = document.getElementById(`slip-${slipId}`);
  if (targetSlip) {
    const slipClone = targetSlip.cloneNode(true) as HTMLElement;
    slipClone.style.display = 'block';
    printContainer.appendChild(slipClone);
  }
  
  // Show the print container
  printContainer.style.display = 'block';
  
  // Print the document
  setTimeout(() => {
    window.print();
    
    // Cleanup after printing
    cleanupPrint(slipType);
  }, 300);
};

// Print multiple slips - ensuring 3 per page for courier slips
export const printMultipleSlips = (slipIds: string[], slipType: 'courier' | 'receipt'): void => {
  const printContainer = preparePrint(slipType);
  
  // Create a counter for slips per page (only relevant for courier slips)
  let slipsOnCurrentPage = 0;
  
  // For each slip ID
  slipIds.forEach((slipId, index) => {
    // Get the original slip
    const originalSlip = document.getElementById(`slip-${slipId}`);
    if (!originalSlip) return;
    
    // Clone the slip
    const slipClone = originalSlip.cloneNode(true) as HTMLElement;
    slipClone.style.display = 'block';
    
    // For courier slips, we want to ensure 3 per page
    if (slipType === 'courier') {
      // Add specific class for positioning
      slipClone.classList.add('slip-content');
      
      // If this is the first slip on a new page
      if (slipsOnCurrentPage === 0) {
        // Create a page container for this group of 3 slips
        const pageContainer = document.createElement('div');
        pageContainer.className = 'page-container';
        pageContainer.style.width = '100%';
        pageContainer.style.pageBreakAfter = 'always';
        printContainer.appendChild(pageContainer);
        
        // Add the slip to the page container
        pageContainer.appendChild(slipClone);
      } else {
        // Add to the current page container
        const pageContainers = printContainer.querySelectorAll('.page-container');
        if (pageContainers.length > 0) {
          const currentPage = pageContainers[pageContainers.length - 1];
          currentPage.appendChild(slipClone);
        }
      }
      
      // Increment the counter and reset if we've added 3 slips
      slipsOnCurrentPage++;
      if (slipsOnCurrentPage === 3) {
        slipsOnCurrentPage = 0;
      }
    } else {
      // For receipts, just add each one with a page break
      slipClone.style.pageBreakAfter = 'always';
      printContainer.appendChild(slipClone);
    }
  });
  
  // Show the print container
  printContainer.style.display = 'block';
  
  // Print the document
  setTimeout(() => {
    window.print();
    
    // Cleanup after printing
    cleanupPrint(slipType);
  }, 300);
};

// Utility function to print all generated slips
export const printAllSlips = (slipType: 'courier' | 'receipt'): void => {
  // Get all slip IDs by querying for elements with IDs starting with "slip-"
  const slips = document.querySelectorAll(`[id^="slip-"]`);
  const slipIds = Array.from(slips).map(slip => 
    (slip as HTMLElement).id.replace('slip-', '')
  );
  
  if (slipIds.length > 0) {
    printMultipleSlips(slipIds, slipType);
  }
};

// Function to print box weights table
export const printBoxWeights = (): void => {
  const printContainer = preparePrint('report');
  
  // Find the box weights table in the document
  const boxWeightsTable = (document.querySelector('.box-weights-table') || 
                          document.querySelector('table')) as HTMLElement;
  
  if (boxWeightsTable) {
    // Create a properly formatted print view
    const printView = document.createElement('div');
    printView.className = 'box-weights-print-view';
    printView.style.width = '100%';
    printView.style.maxWidth = '7.5in';
    printView.style.margin = '0 auto';
    printView.style.pageBreakInside = 'avoid';
    
    // Add title
    const titleElement = document.createElement('h2');
    titleElement.textContent = 'Box Weights Management';
    titleElement.style.textAlign = 'center';
    titleElement.style.marginBottom = '1rem';
    titleElement.style.fontSize = '18pt';
    printView.appendChild(titleElement);
    
    // Clone the table for printing, excluding action buttons
    const tableClone = boxWeightsTable.cloneNode(true) as HTMLElement;
    tableClone.classList.add('box-weights-container');
    
    // Remove any action buttons and other non-printable elements
    const actionCells = tableClone.querySelectorAll('th:last-child, td:last-child');
    actionCells.forEach(cell => {
      if (cell.textContent?.includes('Print') || cell.textContent?.includes('Action') || 
          cell.querySelector('button') || cell.querySelector('[role="button"]')) {
        cell.remove();
      }
    });
    
    // Add date and time of printing
    const dateInfo = document.createElement('div');
    dateInfo.style.textAlign = 'right';
    dateInfo.style.marginBottom = '0.5rem';
    dateInfo.style.fontSize = '10pt';
    dateInfo.textContent = `Printed on: ${new Date().toLocaleString()}`;
    printView.appendChild(dateInfo);
    
    // Add the cleaned table to the print view
    printView.appendChild(tableClone);
    
    // Add the print view to the print container
    printContainer.appendChild(printView);
    
    // Show the print container
    printContainer.style.display = 'block';
    
    // Print the document
    setTimeout(() => {
      window.print();
      
      // Cleanup after printing
      cleanupPrint('report');
    }, 300);
  } else {
    console.error('Box weights table not found');
  }
};

// Function to print reports
export const printReports = (): void => {
  const printContainer = preparePrint('report');
  
  // Find the reports table in the document
  const reportsTable = document.querySelector('table');
  
  if (reportsTable) {
    // Create a properly formatted print view
    const printView = document.createElement('div');
    printView.className = 'report-print-view';
    printView.style.width = '100%';
    printView.style.maxWidth = '7.5in';
    printView.style.margin = '0 auto';
    printView.style.pageBreakInside = 'avoid';
    
    // Add title based on heading in the document
    const pageTitle = document.querySelector('h2')?.textContent || 'Reports';
    const titleElement = document.createElement('h2');
    titleElement.textContent = pageTitle;
    titleElement.style.textAlign = 'center';
    titleElement.style.marginBottom = '1rem';
    titleElement.style.fontSize = '18pt';
    printView.appendChild(titleElement);
    
    // Add date and time of printing
    const dateInfo = document.createElement('div');
    dateInfo.style.textAlign = 'right';
    dateInfo.style.marginBottom = '0.5rem';
    dateInfo.style.fontSize = '10pt';
    dateInfo.textContent = `Printed on: ${new Date().toLocaleString()}`;
    printView.appendChild(dateInfo);
    
    // Clone all tables on the page (might be multiple for different report sections)
    const tables = document.querySelectorAll('table');
    tables.forEach((table, index) => {
      if (index > 0) {
        // Add some spacing between tables
        const spacer = document.createElement('div');
        spacer.style.height = '1rem';
        printView.appendChild(spacer);
      }
      
      // Clone the table for printing
      const tableClone = table.cloneNode(true) as HTMLElement;
      
      // Remove any action buttons and other non-printable elements
      const actionCells = tableClone.querySelectorAll('th:last-child, td:last-child');
      actionCells.forEach(cell => {
        if (cell.textContent?.includes('Action') || 
            cell.querySelector('button') || cell.querySelector('[role="button"]')) {
          cell.remove();
        }
      });
      
      // Add the table to the print view
      printView.appendChild(tableClone);
    });
    
    // Add the print view to the print container
    printContainer.appendChild(printView);
    
    // Show the print container
    printContainer.style.display = 'block';
    
    // Print the document
    setTimeout(() => {
      window.print();
      
      // Cleanup after printing
      cleanupPrint('report');
    }, 300);
  } else {
    console.error('Report tables not found');
  }
};
