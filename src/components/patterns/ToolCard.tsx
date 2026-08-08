import { Chip } from '../../kit/primitives'
import type { ToolCall } from '../../engine/types'

const riskBorder: Record<ToolCall['risk'], string> = {
  low: 'border-[var(--color-hairline)]',
  medium: 'border-[var(--color-warning)]/40',
  high: 'border-[var(--color-danger)]/40',
  destructive: 'border-[var(--color-danger)]',
}

export function ToolCard({ tool }: { tool: ToolCall }) {
  return (
    <div className={`border bg-[var(--color-surface)] ${riskBorder[tool.risk]}`}>
      <div className="flex flex-wrap items-center gap-2 border-b border-[var(--color-hairline)] px-3 py-2">
        <span className="text-[12px] text-[var(--color-text)]">{tool.name}</span>
        <Chip tone={tool.status === 'running' ? 'accent' : tool.status === 'failed' ? 'danger' : 'success'}>
          {tool.status}
        </Chip>
        {tool.risk !== 'low' && (
          <Chip tone={tool.risk === 'destructive' || tool.risk === 'high' ? 'danger' : 'warning'}>
            {tool.risk}
          </Chip>
        )}
        {tool.resultChip && <Chip tone="accent">{tool.resultChip}</Chip>}
      </div>
      <div className="space-y-2 px-3 py-2">
        <p className="text-[12px] text-[var(--color-text-secondary)]">{tool.intent}</p>
        <pre className="overflow-x-auto text-[11px] text-[var(--color-text-tertiary)]">
          {tool.invocation}
        </pre>
        {tool.output && (
          <pre className="max-h-32 overflow-auto border border-[var(--color-hairline)] bg-[var(--color-bg)] px-2 py-1.5 text-[11px] text-[var(--color-text-secondary)] whitespace-pre-wrap">
            {tool.output}
            {tool.status === 'running' && <span className="cursor-block" />}
          </pre>
        )}
      </div>
    </div>
  )
}
