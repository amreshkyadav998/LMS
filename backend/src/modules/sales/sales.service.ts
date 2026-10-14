import type { PipelineStage } from "mongoose";
import { ROLES } from "../../constants/roles";
import { BorrowerProfile } from "../../models/BorrowerProfile";
import { Loan } from "../../models/Loan";
import { User } from "../../models/User";
import { escapeRegex, toPaginated } from "../../utils/pagination";
import { LEAD_STAGES, type LeadStage, type LeadsQuery } from "./sales.schema";

/**
 * Leads are borrowers who have signed up but never submitted a loan
 * application. Their stage shows how far they got in the application journey.
 */
export async function listLeads({ page, limit, search, stage }: LeadsQuery) {
  const matchUsers: Record<string, unknown> = { role: ROLES.BORROWER };
  if (search) {
    const pattern = new RegExp(escapeRegex(search), "i");
    matchUsers.$or = [{ name: pattern }, { email: pattern }];
  }

  const stageFilter: PipelineStage.FacetPipelineStage[] = stage ? [{ $match: { stage } }] : [];

  const pipeline: PipelineStage[] = [
    { $match: matchUsers },
    {
      $lookup: {
        from: Loan.collection.name,
        localField: "_id",
        foreignField: "borrower",
        pipeline: [{ $limit: 1 }, { $project: { _id: 1 } }],
        as: "loans",
      },
    },
    { $match: { loans: { $size: 0 } } },
    {
      $lookup: {
        from: BorrowerProfile.collection.name,
        localField: "_id",
        foreignField: "user",
        as: "profile",
      },
    },
    { $unwind: { path: "$profile", preserveNullAndEmptyArrays: true } },
    {
      $addFields: {
        stage: {
          $switch: {
            branches: [
              { case: { $ifNull: ["$profile.salarySlip", false] }, then: "SLIP_UPLOADED" },
              { case: { $ifNull: ["$profile", false] }, then: "DETAILS_SUBMITTED" },
            ],
            default: "REGISTERED",
          },
        },
      },
    },
    {
      $facet: {
        items: [
          ...stageFilter,
          { $sort: { createdAt: -1 } },
          { $skip: (page - 1) * limit },
          { $limit: limit },
          {
            $project: {
              name: 1,
              email: 1,
              stage: 1,
              createdAt: 1,
              lastActivityAt: { $ifNull: ["$profile.updatedAt", "$createdAt"] },
              profile: {
                $cond: [
                  { $ifNull: ["$profile", false] },
                  {
                    fullName: "$profile.fullName",
                    pan: "$profile.pan",
                    monthlySalary: "$profile.monthlySalary",
                    employmentMode: "$profile.employmentMode",
                  },
                  null,
                ],
              },
            },
          },
        ],
        total: [...stageFilter, { $count: "count" }],
        stageCounts: [{ $group: { _id: "$stage", count: { $sum: 1 } } }],
      },
    },
  ];

  const [result] = await User.aggregate<{
    items: unknown[];
    total: { count: number }[];
    stageCounts: { _id: LeadStage; count: number }[];
  }>(pipeline);

  const stageCounts = Object.fromEntries(LEAD_STAGES.map((key) => [key, 0])) as Record<LeadStage, number>;
  for (const { _id, count } of result?.stageCounts ?? []) stageCounts[_id] = count;

  return {
    ...toPaginated(result?.items ?? [], result?.total[0]?.count ?? 0, { page, limit }),
    stageCounts,
  };
}
