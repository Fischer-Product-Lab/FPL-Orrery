import { Button, Chip, HoldToConfirm, SectionLabel } from '../../kit/primitives'
import type { ApprovalRequest } from '../../engine/types'

export function ApprovalGate({
  approval,
  onResolve,
  terminal = false,
}: {
  approval: ApprovalRequest
  onResolve: (decision: 'approved' | 'rejected') => void
  terminal?: boolean
}) {
  const needsHold = approval.risk === 'money' || approval.risk === 'destructive'
  const pending = approval.status === 'pending'

  return (
    <div
      className={`border ${
        pending
          ? 'border-[var(--color-danger)]/50 bg-[var(--color-danger-dim)]'
          : 'border-[var(--color-hairline)] bg-[var(--color-surface)]'
      }`}
    >
      <div className="flex flex-wrap items-center gap-2 border-b border-[var(--color-hairline)] px-3 py-2">
        <SectionLabel>Approval gate</SectionLabel>
        <Chip
          tone={
            approval.status === 'approved'
              ? 'success'
              : approval.status === 'rejected'
                ? 'danger'
                : 'warning'
          }
        >
          {approval.status}
        </Chip>
        <Chip tone={needsHold ? 'danger' : 'warning'}>{approval.risk}</Chip>
        {approval.costUsd != null && (
          <Chip tone="accent" className="tabular">
            ${approval.costUsd.toLocaleString()}
          </Chip>
        )}
      </div>
      <div className="space-y-3 px-3 py-3">
        <div>
          <h3 className="text-[13px] text-[var(--color-text)]">{approval.title}</h3>
          <p className="mt-1 text-[12px] text-[var(--color-text-secondary)]">{approval.summary}</p>
        </div>
        <ul className="space-y-1 text-[11px] text-[var(--color-text-tertiary)]">
          {approval.evidence.map((e) => (
            <li key={e}>· {e}</li>
          ))}
        </ul>
        {pending && (
          <div className="flex flex-wrap items-center gap-2">
            {needsHold ? (
              <HoldToConfirm label="Hold to approve" onConfirm={() => onResolve('approved')} />
            ) : (
              <Button variant="primary" onClick={() => onResolve('approved')}>
                {terminal ? 'y - approve' : 'Approve'}
              </Button>
            )}
            <Button variant="ghost" onClick={() => onResolve('rejected')}>
              {terminal ? 'n - reject' : 'Reject'}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
