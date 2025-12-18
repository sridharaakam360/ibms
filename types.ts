import React from 'react';

export interface BankAccount {
  id: string;
  ifsc: string;
  bankName: string;
  branch: string;
  accountHolderName: string;
  accountNumber: string;
  passbookFile?: File | null; // File associated specifically with this account
}

export interface OtherDocument {
  id: string;
  docName: string;
  file: File | null;
}

export interface KYCDocuments {
  photo?: File | null;
  aadharCard?: File | null;
  panCard?: File | null;
  others: OtherDocument[];
}

export interface Investment {
  id: string;
  amount: string;
  startDate: string;
  endDate: string;
  interestRate: string;
  bankAccountId?: string; // Linked Bank Account ID (Payout Bank - Investor's Bank)
  senderBankId?: string;  // Linked Bank Account ID (Sender Bank - Admin's Bank)
  payoutDate?: string;    // 10th, 20th, 30th
  
  // Marketing Details (Per Investment)
  portfolioId?: string;       // Marketer
  subMarketorId?: string;     // Sub-Marketer
  marketorCommission?: string;    // %
  subMarketorCommission?: string; // %
}

export interface Investor {
  id: string;
  // Personal Info
  firstName: string;
  lastName: string;
  gender: string;
  dob: string;
  mobile: string;
  email: string;
  aadhar: string;
  pan: string;
  address: string;
  city: string;
  district: string;
  state: string;
  pincode: string;
  
  // Investment Details
  investments: Investment[];

  // Banking
  bankAccounts: BankAccount[];
  
  // KYC Status/Data
  kycDocuments?: KYCDocuments;
  kycStatus: 'Pending' | 'Verified' | 'Incomplete';
  
  notes?: string;
  aiSummary?: string;
}

export interface SubMarketor {
  id: string;
  name: string;
  phone: string;
  email: string;
  // Personal Details
  pan?: string;
  aadhar?: string;
  address?: string;
  city?: string;
  state?: string;
  // Bank Details
  bankAccounts: BankAccount[];
}

export interface Portfolio {
  id: string;
  name: string; // This represents the Marketer Name
  email: string;
  phone: string;
  totalRaised: string;
  investorCount: number;
  logo?: File | null;
  subMarketors: SubMarketor[];
  // Personal Details
  pan?: string;
  aadhar?: string;
  address?: string;
  city?: string;
  state?: string;
  // Bank Details
  bankAccounts: BankAccount[];
}

export interface AdminProfile {
  name: string;
  email: string;
  phone: string;
  bankAccounts: BankAccount[]; // These are the "Sender Banks" available to all
}

export interface NavItem {
  name: string;
  icon: React.ReactNode;
  id: string;
}

export enum ViewState {
  DASHBOARD = 'DASHBOARD',
  INVESTORS = 'INVESTORS',
  PORTFOLIOS = 'PORTFOLIOS',
  REPORTS = 'REPORTS'
}