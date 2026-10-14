import type { QueryFilter, SortOrder } from "mongoose";
import type { LoanStatus } from "../../constants/loan";
import { ROLES } from "../../constants/roles";
import { Loan, type ILoan } from "../../models/Loan";
import type { AuthUser } from "../../types/express";
import { ApiError } from "../../utils/ApiError";
import { escapeRegex, toPaginated, type PaginationQuery } from "../../utils/pagination";

const BORROWER_FIELDS = "name email";
const ACTOR_FIELDS = "name role";

interface ListLoansOptions extends PaginationQuery {
  statuses: LoanStatus[];
  sort: Record<string, SortOrder>;
}

/** Paginated loan queue for a dashboard module, searchable by applicant name or PAN. */
export async function listLoans({ statuses, sort, search, ...pagination }: ListLoansOptions) {
  const filter: QueryFilter<ILoan> = { status: { $in: statuses } };

  if (search) {
    const pattern = new RegExp(escapeRegex(search), "i");
    filter.$or = [{ "applicant.fullName": pattern }, { "applicant.pan": pattern }];
  }

  const [items, total] = await Promise.all([
    Loan.find(filter)
      .sort(sort)
      .skip((pagination.page - 1) * pagination.limit)
      .limit(pagination.limit)
      .populate("borrower", BORROWER_FIELDS)
      .populate("statusHistory.changedBy", ACTOR_FIELDS),
    Loan.countDocuments(filter),
  ]);

  return toPaginated(items, total, pagination);
}

export async function getLoanById(loanId: string) {
  const loan = await Loan.findById(loanId)
    .populate("borrower", BORROWER_FIELDS)
    .populate("statusHistory.changedBy", ACTOR_FIELDS);

  if (!loan) throw ApiError.notFound("Loan not found");
  return loan;
}

/** Staff may view any slip; a borrower only the slip attached to their own loan. */
export async function getSalarySlipForViewer(loanId: string, viewer: AuthUser) {
  const loan = await Loan.findById(loanId).select("borrower salarySlip").lean();
  if (!loan) throw ApiError.notFound("Loan not found");

  if (viewer.role === ROLES.BORROWER && loan.borrower.toString() !== viewer.id) {
    throw ApiError.forbidden("You can only view your own documents");
  }

  return loan.salarySlip;
}
