import React from 'react';

export interface BankAccount {
  id: string;
  ifsc: string;
  bankName: string;
  branch: string;
  accountHolderName: string;
  accountNumber: string;
  passbookFile?: File | null;
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
  bankAccountId?: string;
  senderBankId?: string;
  payoutDate?: string;
  
  portfolioId?: string;
  subMarketorId?: string;
  marketorCommission?: string;
  subMarketorCommission?: string;
}

export interface Investor {
  id: string;
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
  investments: Investment[];
  bankAccounts: BankAccount[];
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
  pan?: string;
  aadhar?: string;
  address?: string;
  city?: string;
  state?: string;
  bankAccounts: BankAccount[];
}

export interface Portfolio {
  id: string;
  name: string;
  email: string;
  phone: string;
  totalRaised: string;
  investorCount: number;
  logo?: File | null;
  subMarketors: SubMarketor[];
  pan?: string;
  aadhar?: string;
  address?: string;
  city?: string;
  state?: string;
  bankAccounts: BankAccount[];
}

export interface AdminProfile {
  name: string;
  email: string;
  phone: string;
  bankAccounts: BankAccount[];
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