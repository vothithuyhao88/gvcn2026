import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { LoginModal } from './components/LoginModal';

// Dashboard views for 3 roles
import { HomeroomTeacherDashboard } from './components/dashboard/HomeroomTeacherDashboard';
import { StudentDashboardView } from './components/dashboard/StudentDashboardView';
import { ParentDashboardView } from './components/dashboard/ParentDashboardView';

// Core feature views
import { StudentsManager } from './components/students/StudentsManager';
import { AttendanceTracker } from './components/attendance/AttendanceTracker';
import { EmulationManager } from './components/emulation/EmulationManager';
import { TeamScoringView } from './components/emulation/TeamScoringView';
import { LeaderboardView } from './components/leaderboard/LeaderboardView';
import { HomeroomDiaryView } from './components/diary/HomeroomDiaryView';
import { AnnouncementsView } from './components/announcements/AnnouncementsView';
import { ConnectionHubView } from './components/connection/ConnectionHubView';
import { DutyScheduleView } from './components/duty/DutyScheduleView';
import { MomentsGalleryView } from './components/moments/MomentsGalleryView';
import { DocumentVaultView } from './components/documents/DocumentVaultView';
import { ParentsManager } from './components/parents/ParentsManager';
import { AiTeacherAssistantView } from './components/ai/AiTeacherAssistantView';
import { AccountProvisionModal } from './components/settings/AccountProvisionModal';

const MainLayout: React.FC = () => {
  const { currentUser } = useApp();
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  const handleNavigate = (tab: string) => {
    if (tab === 'account-settings') {
      setIsAccountModalOpen(true);
      setMobileMenuOpen(false);
      return;
    }
    const mappedTab = tab === 'team_scoring' ? 'team-scoring' 
      : tab === 'duty_schedule' ? 'duty' 
      : tab;
    setCurrentTab(mappedTab);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Top Header */}
      <Navbar
        currentTab={currentTab}
        activeTab={currentTab}
        onSelectTab={handleNavigate}
        setActiveTab={handleNavigate}
        onOpenLoginModal={() => setIsLoginModalOpen(true)}
        onOpenAiAssistant={() => handleNavigate('ai-assistant')}
        mobileMenuOpen={mobileMenuOpen}
        onToggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)}
      />

      {/* Main Layout: Vertical Sidebar (Dọc) on Left + Scrollable Content on Right */}
      <div className="flex flex-1">
        {/* Vertical Left Sidebar */}
        <Sidebar 
          currentTab={currentTab} 
          onSelectTab={handleNavigate} 
        />

        {/* Content Area */}
        <div className="flex-1 flex flex-col min-w-0 bg-slate-50">
          <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl w-full mx-auto">
            {/* Render Tab Content */}
            {currentTab === 'dashboard' && (
              <>
                {currentUser.role === 'GVCN' && (
                  <HomeroomTeacherDashboard 
                    onNavigate={handleNavigate} 
                    onOpenAiAssistant={() => handleNavigate('ai-assistant')}
                  />
                )}
                {currentUser.role === 'STUDENT' && (
                  <StudentDashboardView onNavigate={handleNavigate} />
                )}
                {currentUser.role === 'PARENT' && (
                  <ParentDashboardView onNavigate={handleNavigate} />
                )}
              </>
            )}

            {currentTab === 'students' && <StudentsManager />}
            {currentTab === 'attendance' && <AttendanceTracker />}
            {currentTab === 'emulation' && <EmulationManager />}
            {currentTab === 'team-scoring' && <TeamScoringView />}
            {currentTab === 'leaderboard' && <LeaderboardView />}
            {currentTab === 'diary' && <HomeroomDiaryView />}
            {currentTab === 'announcements' && <AnnouncementsView />}
            {currentTab === 'connection' && <ConnectionHubView />}
            {currentTab === 'duty' && <DutyScheduleView />}
            {currentTab === 'moments' && <MomentsGalleryView />}
            {currentTab === 'documents' && <DocumentVaultView />}
            {currentTab === 'parents' && <ParentsManager />}
            {currentTab === 'ai-assistant' && <AiTeacherAssistantView />}
          </main>

          {/* Sleek Footer */}
          <footer className="bg-white border-t border-slate-200 py-6 mt-12 text-slate-500 text-xs">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block shrink-0" />
                <span className="font-bold text-slate-800">LỚP 11A3 – KẾT NỐI & TRƯỞNG THÀNH</span>
                <span className="hidden sm:inline">• Trung tâm GDNN-GDTX An Nhơn (2026–2027)</span>
              </div>
              <div className="text-center sm:text-right">
                <span>Giáo viên chủ nhiệm: <strong className="text-slate-800">Cô Võ Thị Thúy Hào</strong></span>
              </div>
            </div>
          </footer>
        </div>
      </div>

      {/* Login & Role Switcher Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />

      {/* Account Provision Modal */}
      <AccountProvisionModal
        isOpen={isAccountModalOpen}
        onClose={() => setIsAccountModalOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
