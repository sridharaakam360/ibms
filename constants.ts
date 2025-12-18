import { Investor, Portfolio, AdminProfile } from './types';

export const INITIAL_ADMIN_PROFILE: AdminProfile = {
    name: 'Admin User',
    email: 'admin@horizon-ibms.com',
    phone: '9876543210',
    bankAccounts: [
        {
            id: 'admin_bank_1',
            ifsc: 'HDFC0001234',
            bankName: 'HDFC Bank',
            branch: 'Corporate Branch',
            accountHolderName: 'Horizon Investments LLP',
            accountNumber: '50200012345678',
            passbookFile: null
        }
    ]
};

export const INITIAL_INVESTORS: Investor[] = [
  { 
    id: '1', 
    firstName: 'Rajesh', lastName: 'Kumar', gender: 'Male', dob: '1980-05-15', 
    mobile: '9876543210', email: 'rajesh.k@example.com', 
    aadhar: '1234-5678-9012', pan: 'ABCDE1234F', 
    state: 'Karnataka', district: 'Bengaluru Urban', city: 'Bengaluru', address: '123 Tech Park, Indiranagar', pincode: '560038',
    investments: [
        { 
          id: 'inv1', 
          amount: '5000000', 
          startDate: '2023-01-15', 
          endDate: '2028-01-15', 
          interestRate: '12', 
          bankAccountId: 'bank1',
          senderBankId: 'admin_bank_1',
          payoutDate: '10th',
          portfolioId: '15', // SABARI RAJAN
          subMarketorId: 'sm1', // John Doe
          marketorCommission: '2',
          subMarketorCommission: '1'
        }
    ],
    kycStatus: 'Verified',
    bankAccounts: [
      { id: 'bank1', ifsc: 'HDFC0000240', bankName: 'HDFC Bank', branch: 'Indiranagar', accountHolderName: 'Rajesh Kumar', accountNumber: '50100234567890', passbookFile: null }
    ],
    kycDocuments: { others: [] }
  },
  { 
    id: '2', 
    firstName: 'Priya', lastName: 'Sharma', gender: 'Female', dob: '1985-08-20',
    mobile: '9898989898', email: 'priya.s@example.com',
    aadhar: '9876-5432-1098', pan: 'FGHIJ5678K',
    state: 'Maharashtra', district: 'Mumbai City', city: 'Mumbai', address: '45 Financial District', pincode: '400051',
    investments: [
        { 
          id: 'inv2', 
          amount: '25000000', 
          startDate: '2023-06-01', 
          endDate: '2026-06-01', 
          interestRate: '15',
          payoutDate: '20th',
          portfolioId: '13', // SALES SHARKS
          marketorCommission: '1.5'
        }
    ],
    kycStatus: 'Pending',
    bankAccounts: [],
    kycDocuments: { others: [] }
  },
  { 
    id: '3', 
    firstName: 'Amit', lastName: 'Verma', gender: 'Male', dob: '1975-11-10', 
    mobile: '9123456780', email: 'amit.v@example.com', 
    aadhar: '1122-3344-5566', pan: 'ZYXWV9876A', 
    state: 'Delhi', district: 'South Delhi', city: 'New Delhi', address: '78 Greater Kailash', pincode: '110048',
    investments: [
        { 
          id: 'inv3', 
          amount: '10000000', 
          startDate: '2022-11-01', 
          endDate: '2025-11-01', 
          interestRate: '11.5',
          payoutDate: '30th'
        },
        { 
          id: 'inv4', 
          amount: '5000000', 
          startDate: '2023-02-20', 
          endDate: '2026-02-20', 
          interestRate: '12.2',
          payoutDate: '10th'
        }
    ],
    kycStatus: 'Verified',
    bankAccounts: [],
    kycDocuments: { others: [] }
  },
  { 
    id: '4', 
    firstName: 'Sneha', lastName: 'Reddy', gender: 'Female', dob: '1990-03-25', 
    mobile: '9988776655', email: 'sneha.r@example.com', 
    aadhar: '9988-7766-5544', pan: 'LMNOP1234Q', 
    state: 'Telangana', district: 'Hyderabad', city: 'Hyderabad', address: 'Plot 45, Jubilee Hills', pincode: '500033',
    investments: [
        { 
          id: 'inv5', 
          amount: '7500000', 
          startDate: '2023-08-10', 
          endDate: '2028-08-10', 
          interestRate: '13',
          payoutDate: '20th'
        }
    ],
    kycStatus: 'Incomplete',
    bankAccounts: [],
    kycDocuments: { others: [] }
  },
];

export const INITIAL_PORTFOLIOS: Portfolio[] = [
  { 
      id: '15', 
      name: 'SABARI RAJAN', 
      email: 'portfolio@gmail.com', 
      phone: '9876543224', 
      totalRaised: '5000000', 
      investorCount: 1, 
      pan: 'ABCDE1234F',
      aadhar: '123456789012',
      address: '123 Street',
      city: 'Chennai',
      state: 'Tamil Nadu',
      bankAccounts: [
          { id: 'b1', ifsc: 'HDFC0001234', bankName: 'HDFC Bank', branch: 'Chennai Main', accountHolderName: 'Sabari Rajan', accountNumber: '1234567890', passbookFile: null }
      ],
      subMarketors: [
          { 
            id: 'sm1', name: 'John Doe', email: 'john@marketor.com', phone: '9000000001',
            pan: 'ZYXW9876V', aadhar: '987654321098', address: '456 Lane', city: 'Madurai', state: 'Tamil Nadu',
            bankAccounts: [
                { id: 'sb1', ifsc: 'SBI0005678', bankName: 'SBI', branch: 'Madurai', accountHolderName: 'John Doe', accountNumber: '0987654321', passbookFile: null }
            ]
          },
          { 
            id: 'sm2', name: 'Alice Smith', email: 'alice@marketor.com', phone: '9000000002',
             pan: 'LKJI5432M', aadhar: '112233445566', address: '789 Road', city: 'Trichy', state: 'Tamil Nadu',
             bankAccounts: [
                 { id: 'sb2', ifsc: 'ICIC0009876', bankName: 'ICICI', branch: 'Trichy', accountHolderName: 'Alice Smith', accountNumber: '1122334455', passbookFile: null }
             ]
          }
      ] 
  },
  { 
      id: '13', 
      name: 'SALES SHARKS', 
      email: 'portfolio@gmail.com', 
      phone: '9876543222', 
      totalRaised: '25000000', 
      investorCount: 1, 
      bankAccounts: [],
      subMarketors: [] 
  },
  { 
      id: '14', 
      name: 'MONEY SEEKERS', 
      email: 'portfolio@gmail.com', 
      phone: '9876543223', 
      totalRaised: '0', 
      investorCount: 0, 
      bankAccounts: [],
      subMarketors: [] 
  },
];