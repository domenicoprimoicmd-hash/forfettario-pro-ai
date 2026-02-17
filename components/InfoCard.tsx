
import React from 'react';

interface InfoCardProps {
  label: string;
  value: string;
  icon?: React.ReactNode;
  subValue?: string;
  colorClass?: string;
}

const InfoCard: React.FC<InfoCardProps> = ({ label, value, icon, subValue, colorClass = "text-slate-900" }) => {
  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-slate-500 uppercase tracking-wider">{label}</span>
        {icon && <div className="text-slate-400">{icon}</div>}
      </div>
      <div className={`text-2xl font-bold ${colorClass}`}>
        {value}
      </div>
      {subValue && (
        <div className="text-xs text-slate-400 mt-1 font-medium">
          {subValue}
        </div>
      )}
    </div>
  );
};

export default InfoCard;
