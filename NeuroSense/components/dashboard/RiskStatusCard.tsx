import { Shield, AlertTriangle, XCircle, CheckCircle } from 'lucide-react';
import { SessionResult } from '../../types';

interface RiskStatusCardProps {
  history: SessionResult[];
}

const RiskStatusCard: React.FC<RiskStatusCardProps> = ({ history }) => {
  const averageScore = history.length > 0
    ? history.reduce((acc, curr) => acc + curr.score, 0) / history.length
    : 100;

  const getRiskStatus = () => {
    if (averageScore >= 80) return { icon: CheckCircle, label: 'Stable', color: 'text-[#10b981]', bg: 'bg-[#10b981]/10' };
    if (averageScore >= 60) return { icon: Shield, label: 'Monitoring', color: 'text-[#48c1cf]', bg: 'bg-[#48c1cf]/10' };
    if (averageScore >= 40) return { icon: AlertTriangle, label: 'At Risk', color: 'text-[#f59e0b]', bg: 'bg-[#f59e0b]/10' };
    return { icon: XCircle, label: 'Critical', color: 'text-[#ef4444]', bg: 'bg-[#ef4444]/10' };
  };

  const status = getRiskStatus();

  return (
    <div className="dashboard-card card-purple">
      <div className="dashboard-card-header">
        <Shield className="w-4 h-4" />
        <span>Risk Status</span>
      </div>

      <div className="flex flex-col items-center justify-center h-28 gap-4">
        <div className={`p-4 rounded-full ${status.bg} border border-current opacity-80 animate-pulse`}>
          <status.icon className={`w-8 h-8 ${status.color}`} />
        </div>
        <div className="text-center">
          <span className={`text-[10px] font-black uppercase tracking-[0.4em] ${status.color}`}>{status.label}</span>
          <p className="text-[8px] text-muted-foreground mt-1 opacity-50 font-bold uppercase">Dynamic Risk Vector</p>
        </div>
      </div>
    </div>
  );
};

export default RiskStatusCard;
