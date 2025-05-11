
// Enhanced permission structure
export const permissionGroups = {
  customers: {
    title: 'Customer Management',
    permissions: [
      { key: 'viewCustomerDatabase', label: 'View Customer Database' },
      { key: 'editCustomerDatabase', label: 'Edit Customer Database' },
      { key: 'deleteCustomers', label: 'Delete Customers', new: true }
    ]
  },
  reports: {
    title: 'Reporting',
    permissions: [
      { key: 'downloadReports', label: 'Download Reports' },
      { key: 'viewReports', label: 'View Reports', new: true }
    ]
  },
  users: {
    title: 'User Management',
    permissions: [
      { key: 'manageUsers', label: 'Manage Users' }
    ]
  },
  slips: {
    title: 'Shipping Slips',
    permissions: [
      { key: 'generateSlips', label: 'Generate Slips' },
      { key: 'cancelSlips', label: 'Cancel Slips' },
      { key: 'printSlips', label: 'Print Slips' },
      { key: 'reprintSlips', label: 'Reprint Slips' }
    ]
  },
  logs: {
    title: 'System Logs',
    permissions: [
      { key: 'viewLogs', label: 'View Logs' }
    ]
  },
  weights: {
    title: 'Box Weights',
    permissions: [
      { key: 'viewBoxWeights', label: 'View Box Weights' },
      { key: 'editBoxWeights', label: 'Edit Box Weights' },
      { key: 'editCompletedBoxWeights', label: 'Edit Completed Box Weights' }
    ]
  },
  couriers: {
    title: 'Couriers',
    permissions: [
      { key: 'viewCouriers', label: 'View Couriers', new: true },
      { key: 'editCouriers', label: 'Edit Couriers', new: true }
    ]
  },
  senders: {
    title: 'Sender Addresses',
    permissions: [
      { key: 'viewSenders', label: 'View Sender Addresses', new: true },
      { key: 'editSenders', label: 'Edit Sender Addresses', new: true }
    ]
  },
  expressMode: {
    title: 'Express Mode',
    permissions: [
      { key: 'useExpressMode', label: 'Use Express Mode', new: true },
      { key: 'manageExpressMode', label: 'Manage Express Mode', new: true }
    ]
  }
};

// Default permissions object that matches the User interface
export const defaultPermissions = {
  viewCustomerDatabase: false,
  editCustomerDatabase: false,
  downloadReports: false,
  manageUsers: false,
  generateSlips: true,
  viewLogs: false,
  viewBoxWeights: false,
  editBoxWeights: false,
  editCompletedBoxWeights: false,
  cancelSlips: false,
  printSlips: false,
  reprintSlips: false,
  deleteCustomers: false,
  viewReports: false,
  viewCouriers: false,
  editCouriers: false,
  viewSenders: false,
  editSenders: false,
  useExpressMode: false,
  manageExpressMode: false
};
