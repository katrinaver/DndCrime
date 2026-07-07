import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from './components/AppLayout'
import { DevAuthBanner } from './components/DevAuthBanner'
import { ProtectedRoute } from './components/ProtectedRoute'
import { AuthProvider, useAuth } from './context/AuthContext'
import { CalendarPage } from './pages/CalendarPage'
import { CampaignAchievementsPage } from './pages/CampaignAchievementsPage'
import { CampaignAssetsPage } from './pages/CampaignAssetsPage'
import { CampaignChatPage } from './pages/CampaignChatPage'
import { CampaignCreatePage } from './pages/CampaignCreatePage'
import { CampaignMasterAssetsPage } from './pages/CampaignMasterAssetsPage'
import { CampaignMasterChatPage } from './pages/CampaignMasterChatPage'
import { CampaignMasterParticipantsPage } from './pages/CampaignMasterParticipantsPage'
import { CampaignMasterProgressPage } from './pages/CampaignMasterProgressPage'
import { CampaignMasterSettingsPage } from './pages/CampaignMasterSettingsPage'
import { CampaignMenuPage } from './pages/CampaignMenuPage'
import { CampaignProgressPage } from './pages/CampaignProgressPage'
import { CampaignsPage } from './pages/CampaignsPage'
import { CampaignRoomLayout } from './modules/campaigns/CampaignRoomLayout'
import { CampaignMasterLayout } from './modules/campaigns/CampaignMasterLayout'
import { CharacterCampaignFormPage } from './pages/CharacterCampaignFormPage'
import { CharacterCampaignSelectPage } from './pages/CharacterCampaignSelectPage'
import { CharacterClassicPage } from './pages/CharacterClassicPage'
import { CharacterGeneralPage } from './pages/CharacterGeneralPage'
import { CharacterSheetPage } from './pages/CharacterSheetPage'
import { CharactersPage } from './pages/CharactersPage'
import { ForgotPasswordPage } from './pages/ForgotPasswordPage'
import { HomePage } from './pages/HomePage'
import { LandingPage } from './pages/LandingPage'
import { LoginPage } from './pages/LoginPage'
import { NewsPage } from './pages/NewsPage'
import { NotesPage } from './pages/NotesPage'
import { ProfilePage } from './pages/ProfilePage'
import { PrivacyPolicyPage } from './pages/PrivacyPolicyPage'
import { RegisterPage } from './pages/RegisterPage'
import { TermsOfServicePage } from './pages/TermsOfServicePage'

function PublicOnlyRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-dnd-gold border-t-transparent" />
      </div>
    )
  }

  if (user) {
    return <Navigate to="/home" replace />
  }

  return <>{children}</>
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route
        path="/login"
        element={
          <PublicOnlyRoute>
            <LoginPage />
          </PublicOnlyRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicOnlyRoute>
            <RegisterPage />
          </PublicOnlyRoute>
        }
      />
      <Route
        path="/forgot-password"
        element={
          <PublicOnlyRoute>
            <ForgotPasswordPage />
          </PublicOnlyRoute>
        }
      />
      <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
      <Route path="/terms-of-service" element={<TermsOfServicePage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/home" element={<HomePage />} />
          <Route path="/campaigns" element={<CampaignsPage />} />
          <Route path="/campaigns/new" element={<CampaignCreatePage />} />
          <Route path="/campaigns/:campaignId/master" element={<CampaignMasterLayout />}>
            <Route index element={<Navigate to="settings" replace />} />
            <Route path="settings" element={<CampaignMasterSettingsPage />} />
            <Route path="participants" element={<CampaignMasterParticipantsPage />} />
            <Route path="chat" element={<CampaignMasterChatPage />} />
            <Route path="assets" element={<CampaignMasterAssetsPage />} />
            <Route path="progress" element={<CampaignMasterProgressPage />} />
          </Route>
          <Route path="/campaigns/:campaignId" element={<CampaignRoomLayout />}>
            <Route index element={<Navigate to="menu" replace />} />
            <Route path="menu" element={<CampaignMenuPage />} />
            <Route path="chat" element={<CampaignChatPage />} />
            <Route path="assets" element={<CampaignAssetsPage />} />
            <Route path="progress" element={<CampaignProgressPage />} />
            <Route path="achievements" element={<CampaignAchievementsPage />} />
          </Route>
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/characters" element={<CharactersPage />} />
          <Route path="/characters/new/general" element={<CharacterGeneralPage />} />
          <Route path="/characters/new/campaign" element={<CharacterCampaignSelectPage />} />
          <Route path="/characters/new/campaign/:campaignId" element={<CharacterCampaignFormPage />} />
          <Route path="/characters/new/classic" element={<CharacterClassicPage />} />
          <Route path="/characters/:id" element={<CharacterSheetPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/news" element={<NewsPage />} />
          <Route path="/notes" element={<NotesPage />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <DevAuthBanner />
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}
