import { ACTIVE_LOAN_STATUSES, LOAN_STATUS } from "../../constants/loan";
import { removeUpload } from "../../middleware/upload";
import { BorrowerProfile } from "../../models/BorrowerProfile";
import { Loan } from "../../models/Loan";
import { ApiError } from "../../utils/ApiError";
import { calculateLoanQuote } from "../../utils/money";
import type { LoanApplicationInput, PersonalDetailsInput } from "./borrower.schema";
import { evaluateEligibility } from "./eligibility";

function assertEligible(input: Parameters<typeof evaluateEligibility>[0]): void {
  const { eligible, failures } = evaluateEligibility(input);
  if (!eligible) {
    throw ApiError.unprocessable("You are not eligible for a loan at this time", { failures });
  }
}

export async function getOverview(userId: string) {
  const [profile, loans] = await Promise.all([
    BorrowerProfile.findOne({ user: userId }),
    Loan.find({ borrower: userId }).sort({ createdAt: -1 }),
  ]);

  const activeLoan = loans.find((loan) => ACTIVE_LOAN_STATUSES.includes(loan.status)) ?? null;
  return { profile, loans, activeLoan };
}

/** Step 2: runs the BRE and stores the details only if every rule passes. */
export async function savePersonalDetails(userId: string, input: PersonalDetailsInput) {
  assertEligible(input);

  return BorrowerProfile.findOneAndUpdate(
    { user: userId },
    { $set: { ...input, user: userId } },
    { upsert: true, returnDocument: "after", runValidators: true, setDefaultsOnInsert: true },
  );
}

/** Step 3: links an uploaded salary slip to the borrower's profile. */
export async function saveSalarySlip(userId: string, file: Express.Multer.File) {
  const profile = await BorrowerProfile.findOne({ user: userId });
  if (!profile) {
    await removeUpload(file.filename);
    throw ApiError.badRequest("Please complete your personal details before uploading a salary slip");
  }

  const previousFile = profile.salarySlip?.fileName;

  profile.salarySlip = {
    fileName: file.filename,
    originalName: file.originalname,
    mimeType: file.mimetype,
    size: file.size,
    uploadedAt: new Date(),
  };
  await profile.save();

  // Loans keep their own reference to the slip they were submitted with.
  if (previousFile && !(await Loan.exists({ "salarySlip.fileName": previousFile }))) {
    await removeUpload(previousFile);
  }

  return profile;
}

/** Step 4: re-validates everything server-side and creates the loan in APPLIED status. */
export async function applyForLoan(userId: string, input: LoanApplicationInput) {
  if (await Loan.exists({ borrower: userId, status: { $in: ACTIVE_LOAN_STATUSES } })) {
    throw ApiError.conflict("You already have a loan in progress");
  }

  const profile = await BorrowerProfile.findOne({ user: userId });
  if (!profile) throw ApiError.badRequest("Please complete your personal details first");
  if (!profile.salarySlip) throw ApiError.badRequest("Please upload your salary slip first");

  const applicant = {
    fullName: profile.fullName,
    pan: profile.pan,
    dateOfBirth: profile.dateOfBirth,
    monthlySalary: profile.monthlySalary,
    employmentMode: profile.employmentMode,
  };
  assertEligible(applicant);

  return Loan.create({
    borrower: userId,
    applicant,
    salarySlip: profile.salarySlip,
    ...calculateLoanQuote(input.principal, input.tenureDays),
    status: LOAN_STATUS.APPLIED,
    statusHistory: [{ status: LOAN_STATUS.APPLIED, changedBy: userId, changedAt: new Date() }],
  });
}
