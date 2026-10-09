import React from 'react';
import { 
  AppTab 
} from '../types';
import { 
  Shield, 
  Terminal, 
  Trophy, 
  Map, 
  GitPullRequest, 
  Compass, 
  BookOpen, 
  Sparkles,
  Zap
} from 'lucide-react';

interface NavbarProps {
  currentTab: AppTab;
  onSelectTab: (tab: AppTab) => void;
  totalXp: number;
  solvedCount: number;
  totalChallenges: number;
  onOpenAiMentor: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  totalXp,
  solvedCount,
  totalChallenges,
  onOpenAiMentor
}) => {
  const navItems: { tab: AppTab; label: string; icon: React.ReactNode }[] = [
    { tab: 'scenarios', label: 'Input Testing Labs', icon: <Terminal className="w-4 h-4" /> },
    { tab: 'challenges', label: 'Interactive Challenges', icon: <Trophy className="w-4 h-4" /> },
    { tab: 'roadmap', label: '5-Phase Roadmap', icon: <Map className="w-4 h-4" /> },
    { tab: 'cicd', label: 'CI/CD Security Gate', icon: <GitPullRequest className="w-4 h-4" /> },
    { tab: 'stride', label: 'STRIDE Threat Model', icon: <Compass className="w-4 h-4" /> },
    { tab: 'cheatsheet', label: 'Dummies Decoder', icon: <BookOpen className="w-4 h-4" /> },
  ];

  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Subtitle */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => onSelectTab('scenarios')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center shadow-lg shadow-emerald-500/20 border border-emerald-400/30">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-emerald-400 via-teal-200 to-sky-400 bg-clip-text text-transparent">
                  SecQA Learn
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  For Dummies
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Bridging QA Testing &amp; Application Security
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = currentTab === item.tab;
              return (
                <button
                  key={item.tab}
                  onClick={() => onSelectTab(item.tab)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-sm shadow-emerald-500/10'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Actions: XP Counter & AI Mentor */}
          <div className="flex items-center gap-3">
            {/* Gamified XP Indicator */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/60 text-xs">
              <Zap className="w-4 h-4 text-amber-400 fill-amber-400/30" />
              <div className="flex flex-col">
                <span className="font-bold text-amber-300 leading-none">{totalXp} XP</span>
                <span className="text-[10px] text-slate-400 leading-none mt-0.5">
                  {solvedCount}/{totalChallenges} Done
                </span>
              </div>
            </div>

            {/* AI Mentor Trigger */}
            <button
              onClick={onOpenAiMentor}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white text-xs font-semibold shadow-md shadow-emerald-700/20 transition-all active:scale-95 border border-emerald-400/20 cursor-pointer"
              title="Ask SecQA AI Mentor"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-200 animate-pulse" />
              <span className="hidden sm:inline">AI Mentor</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Bar */}
        <div className="lg:hidden flex overflow-x-auto py-2 gap-1 border-t border-slate-800/80 scrollbar-none">
          {navItems.map((item) => {
            const isActive = currentTab === item.tab;
            return (
              <button
                key={item.tab}
                onClick={() => onSelectTab(item.tab)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-colors ${
                  isActive
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : 'text-slate-400 hover:text-white bg-slate-800/40'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

      </div>
    </header>
  );
};
