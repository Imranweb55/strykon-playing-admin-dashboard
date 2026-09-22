import { Waves, Dribbble, CircleDot, Zap } from "lucide-react";

const iconMap = { Waves, Dribbble, CircleDot, Zap };

const SportTabs = ({ tabs, activeId }) => {
  return (
    <div className="flex flex-wrap gap-3">
      {tabs.map((tab) => {
        const Icon = iconMap[tab.icon] || Waves;
        const isActive = tab.id === activeId;

        return (
          <button
            key={tab.id}
            className={`flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition-colors ${
              isActive
                ? "bg-blue-600 text-white shadow-sm"
                : "border border-gray-200 bg-white text-slate-700 hover:bg-slate-50"
            }`}
          >
            <Icon size={18} color={isActive ? "#ffffff" : tab.color} />
            {tab.label}
          </button>
        );
      })}
    </div>
  );
};

export default SportTabs;
