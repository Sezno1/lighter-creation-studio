import type { ResearchStatus } from '../data';
import { useStore } from '../store';

const cls: Record<ResearchStatus, string> = { not_searched: 'b-neutral', incomplete: 'b-info', similar: 'b-warn', screened: 'b-ok' };

export default function ResearchBadge({ status }: { status: ResearchStatus }) {
  const { t } = useStore();
  return <span className={`badge ${cls[status]}`}>{t(`rs_${status}`)}</span>;
}
