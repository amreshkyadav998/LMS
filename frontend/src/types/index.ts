export type Role = "admin" | "sales" | "sanction" | "disbursement" | "collection" | "borrower";

export type LoanStatus = "APPLIED" | "SANCTIONED" | "REJECTED" | "DISBURSED" | "CLOSED";

export type EmploymentMode = "SALARIED" | "SELF_EMPLOYED" | "UNEMPLOYED";

export type LeadStage = "REGISTERED" | "DETAILS_SUBMITTED" | "SLIP_UPLOADED";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
}

export interface ApplicantDetails {
  fullName: string;
  pan: string;
  dateOfBirth: string;
  monthlySalary: number;
  employmentMode: EmploymentMode;
}

export interface StoredFile {
  originalName: string;
  mimeType: string;
  size: number;
  uploadedAt: string;
}

export interface BorrowerProfile extends ApplicantDetails {
  _id: string;
  salarySlip?: StoredFile;
  updatedAt: string;
}

export interface StatusChange {
  status: LoanStatus;
  changedBy?: { _id: string; name: string; role: Role } | string;
  note?: string;
  changedAt: string;
}

export interface Loan {
  _id: string;
  borrower: Pick<User, "name" | "email"> & { _id: string };
  applicant: ApplicantDetails;
  salarySlip: StoredFile;
  principal: number;
  tenureDays: number;
  interestRate: number;
  simpleInterest: number;
  totalRepayment: number;
  amountPaid: number;
  outstandingAmount: number;
  status: LoanStatus;
  rejectionReason?: string;
  statusHistory: StatusChange[];
  sanctionedAt?: string;
  rejectedAt?: string;
  disbursedAt?: string;
  closedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  _id: string;
  utr: string;
  amount: number;
  paymentDate: string;
  recordedBy?: { _id: string; name: string };
  createdAt: string;
}

export interface Lead {
  _id: string;
  name: string;
  email: string;
  stage: LeadStage;
  createdAt: string;
  lastActivityAt: string;
  profile: Pick<ApplicantDetails, "fullName" | "pan" | "monthlySalary" | "employmentMode"> | null;
}

export interface Paginated<T> {
  items: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface LeadsResponse extends Paginated<Lead> {
  stageCounts: Record<LeadStage, number>;
}

export interface BorrowerOverview {
  profile: BorrowerProfile | null;
  loans: Loan[];
  activeLoan: Loan | null;
}

export interface AdminOverview {
  loansByStatus: Record<LoanStatus, number>;
  totalLoans: number;
  openLeads: number;
  portfolio: { disbursedPrincipal: number; collected: number; outstanding: number };
  recentLoans: Loan[];
}

export interface EligibilityFailure {
  rule: "AGE" | "SALARY" | "PAN" | "EMPLOYMENT";
  message: string;
}
