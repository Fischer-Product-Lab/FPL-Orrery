import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from './components/AppShell'
import { LandingPage } from './pages/LandingPage'
import { ObservatoryPage } from './pages/ObservatoryPage'
import { StudyPage } from './pages/StudyPage'
import { ConsolePage } from './surfaces/console/ConsolePage'
import { TerminalPage } from './surfaces/terminal/TerminalPage'
import { MobilePage } from './surfaces/mobile/MobilePage'
import { RosettaPage } from './surfaces/rosetta/RosettaPage'
import { PatternDetailPage, PatternsIndexPage } from './patterns/PatternPages'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppShell />}>
          <Route index element={<LandingPage />} />
          <Route path="console" element={<ConsolePage />} />
          <Route path="rosetta" element={<RosettaPage />} />
          <Route path="guide" element={<Navigate to="/rosetta" replace />} />
          <Route path="terminal" element={<TerminalPage />} />
          <Route path="mobile" element={<MobilePage />} />
          <Route path="observatory" element={<ObservatoryPage />} />
          <Route path="patterns" element={<PatternsIndexPage />} />
          <Route path="patterns/:id" element={<PatternDetailPage />} />
          <Route path="study" element={<StudyPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
