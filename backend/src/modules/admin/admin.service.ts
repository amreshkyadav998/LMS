import { ALL_LOAN_STATUSES, LOAN_STATUS, type LoanStatus } from "../../constants/loan";
import { ROLES } from "../../constants/roles";
import { Loan } from "../../models/Loan";
import { User } from "../../models/User";
import { roundCurrency } from "../../utils/money";

interface PortfolioTotals {
  disbursedPrincipal: number;
  collected: number;
  outstanding: number;
}

/** Portfolio-wide snapshot for the admin overview. */
export async function getOverview() {
  const [statusCounts, [totals], borrowerCount, borrowersWithLoans, recentLoans] = await Promise.all([
    Loan.aggregate<{ _id: LoanStatus; count: number }>([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
    Loan.aggregate<PortfolioTotals>([
      { $match: { status: { $in: [LOAN_STATUS.DISBURSED, LOAN_STATUS.CLOSED] } } },
      {
        $group: {
          _id: null,
          disbursedPrincipal: { $sum: "$principal" },
          collected: { $sum: "$amountPaid" },
          outstanding: {
            $sum: {
              $cond: [
                { $eq: ["$status", LOAN_STATUS.DISBURSED] },
                { $subtract: ["$totalRepayment", "$amountPaid"] },
                0,
              ],
            },
          },
        },
      },
    ]),
    User.countDocuments({ role: ROLES.BORROWER }),
    Loan.distinct("borrower"),
    Loan.find().sort({ updatedAt: -1 }).limit(6).populate("borrower", "name email"),
  ]);

  const loansByStatus = Object.fromEntries(ALL_LOAN_STATUSES.map((status) => [status, 0])) as Record<
    LoanStatus,
    number
  >;
  for (const { _id, count } of statusCounts) loansByStatus[_id] = count;

  return {
    loansByStatus,
    totalLoans: Object.values(loansByStatus).reduce((sum, count) => sum + count, 0),
    openLeads: borrowerCount - borrowersWithLoans.length,
    portfolio: {
      disbursedPrincipal: roundCurrency(totals?.disbursedPrincipal ?? 0),
      collected: roundCurrency(totals?.collected ?? 0),
      outstanding: roundCurrency(totals?.outstanding ?? 0),
    },
    recentLoans,
  };
}
