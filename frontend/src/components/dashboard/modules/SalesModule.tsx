"use client";

import { FileCheck2, UserPlus, Users, UserRoundPen } from "lucide-react";
import { useState } from "react";
import { DataTable, type Column } from "@/components/dashboard/DataTable";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Badge, type BadgeTone } from "@/components/ui/Badge";
import { Card, CardHeader } from "@/components/ui/Card";
import { Avatar, SearchInput, Tabs } from "@/components/ui/misc";
import { StatCard } from "@/components/ui/StatCard";
import { usePaginatedList } from "@/hooks/usePaginatedList";
import { EMPLOYMENT_MODE_LABELS, LEAD_STAGE_LABELS } from "@/lib/constants";
import { formatCurrency, formatDate, formatDateTime } from "@/lib/format";
import type { Lead, LeadStage, LeadsResponse } from "@/types";

const STAGE_TONES: Record<LeadStage, BadgeTone> = {
  REGISTERED: "slate",
  DETAILS_SUBMITTED: "blue",
  SLIP_UPLOADED: "teal",
};

type StageFilter = LeadStage | "ALL";

export function SalesModule() {
  const [stage, setStage] = useState<StageFilter>("ALL");
  const list = usePaginatedList<Lead, LeadsResponse>("/sales/leads", {
    stage: stage === "ALL" ? undefined : stage,
  });

  const counts = list.data?.stageCounts;
  const totalLeads = counts ? Object.values(counts).reduce((sum, count) => sum + count, 0) : undefined;

  const columns: Column<Lead>[] = [
    {
      header: "Lead",
      cell: (lead) => (
        <div className="flex items-center gap-3">
          <Avatar name={lead.name} className="size-8 text-[11px]" />
          <div className="min-w-0">
            <p className="truncate font-semibold text-slate-900">{lead.name}</p>
            <p className="truncate text-xs text-slate-500">{lead.email}</p>
          </div>
        </div>
      ),
    },
    {
      header: "Stage",
      cell: (lead) => (
        <Badge tone={STAGE_TONES[lead.stage]} dot>
          {LEAD_STAGE_LABELS[lead.stage]}
        </Badge>
      ),
    },
    {
      header: "PAN",
      cell: (lead) => (lead.profile ? <span className="font-mono text-xs">{lead.profile.pan}</span> : <Muted />),
    },
    {
      header: "Monthly salary",
      cell: (lead) =>
        lead.profile ? (
          <div>
            <p className="font-medium text-slate-900">{formatCurrency(lead.profile.monthlySalary)}</p>
            <p className="text-xs text-slate-500">{EMPLOYMENT_MODE_LABELS[lead.profile.employmentMode]}</p>
          </div>
        ) : (
          <Muted />
        ),
    },
    { header: "Registered", cell: (lead) => formatDate(lead.createdAt) },
    { header: "Last activity", cell: (lead) => <span className="text-slate-500">{formatDateTime(lead.lastActivityAt)}</span> },
  ];

  return (
    <>
      <PageHeader title="Sales" description="Track borrowers who have signed up but not yet applied for a loan." />

      <div className="mb-8 grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <StatCard label="Open leads" value={totalLeads ?? "—"} icon={Users} tone="brand" hint="Registered, no application yet" />
        <StatCard label="Just registered" value={counts?.REGISTERED ?? "—"} icon={UserPlus} tone="slate" hint="Haven't started the form" />
        <StatCard label="Details submitted" value={counts?.DETAILS_SUBMITTED ?? "—"} icon={UserRoundPen} tone="sky" hint="Passed eligibility check" />
        <StatCard label="Slip uploaded" value={counts?.SLIP_UPLOADED ?? "—"} icon={FileCheck2} tone="emerald" hint="One step from applying" />
      </div>

      <Card>
        <CardHeader
          title={
            <div className="overflow-x-auto">
              <Tabs
                value={stage}
                onChange={(value) => {
                  setStage(value);
                  list.setPage(1);
                }}
                options={[
                  { value: "ALL", label: "All", count: totalLeads },
                  { value: "REGISTERED", label: "Registered", count: counts?.REGISTERED },
                  { value: "DETAILS_SUBMITTED", label: "Details", count: counts?.DETAILS_SUBMITTED },
                  { value: "SLIP_UPLOADED", label: "Slip uploaded", count: counts?.SLIP_UPLOADED },
                ]}
              />
            </div>
          }
          action={
            <SearchInput
              placeholder="Search by name or email"
              value={list.search}
              onChange={(event) => list.setSearch(event.target.value)}
            />
          }
        />
        <DataTable
          data={list.data}
          error={list.error}
          isLoading={list.isLoading}
          columns={columns}
          rowKey={(lead) => lead._id}
          onPageChange={list.setPage}
          empty={{ icon: Users, title: "No leads found", description: "New borrower sign-ups will appear here." }}
        />
      </Card>
    </>
  );
}

function Muted() {
  return <span className="text-slate-300">—</span>;
}
