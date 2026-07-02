import { useMemo, useState } from 'react'
import type { AvailableFood, Page, Profile, ProgressLog, QualityCriteria } from './lib/types'
import { DEFAULT_PROFILE } from './lib/constants'
import { calculateNutrition } from './lib/nutrition'
import { getAvailableFoods, getMealVariant, getProfile, getProgressLogs, getQuality, saveAvailableFoods, saveNutritionPlan, saveProfile, saveProgressLog, saveQuality } from './lib/storage'
import { applyPantryQuality } from './lib/availableFoods'
import { generateMealPlan } from './lib/meals'
import { AppShell } from './components/layout/AppShell'
import { WeeklyCheckIn } from './components/progress/WeeklyCheckIn'
import { DashboardPage } from './pages/DashboardPage'
import { ProfilePage } from './pages/ProfilePage'
import { NutritionPage } from './pages/NutritionPage'
import { TrainingPage } from './pages/TrainingPage'
import { ProgressPage } from './pages/ProgressPage'

export default function App() {
  const stored = useMemo(() => getProfile(), [])
  const [hasProfile, setHasProfile] = useState(Boolean(stored))
  const [profile, setProfile] = useState<Profile>(stored ?? DEFAULT_PROFILE)
  const [draft, setDraft] = useState<Profile>(stored ?? DEFAULT_PROFILE)
  const [page, setPage] = useState<Page>(stored ? 'dashboard' : 'profile')
  const [quality, setQuality] = useState<QualityCriteria>(getQuality())
  const [availableFoods, setAvailableFoods] = useState<AvailableFood[]>(getAvailableFoods())
  const [logs, setLogs] = useState<ProgressLog[]>(getProgressLogs())
  const [menu, setMenu] = useState(false); const [checkin, setCheckin] = useState(false)
  const plan = useMemo(() => calculateNutrition(profile), [profile])
  const effectiveQuality = useMemo(() => applyPantryQuality(quality, availableFoods), [quality, availableFoods])
  const dashboardMealPlan = useMemo(() => generateMealPlan(plan, profile, getMealVariant(), '', availableFoods), [plan, profile, availableFoods])
  const dashboardProtein = dashboardMealPlan.meals.reduce((total, meal) => total + meal.protein, 0)
  const dashboardFiber = dashboardMealPlan.meals.reduce((total, meal) => total + meal.fiber, 0)
  const dashboardQuality = { ...effectiveQuality, proteinTargetReached: dashboardProtein >= plan.protein * 0.85, fiberEnough: dashboardFiber >= plan.fiber * 0.8 }
  const navigate = (next: Page) => { setPage(next); window.scrollTo({ top: 0, behavior: 'smooth' }) }
  const commitProfile = () => { const normalized = { ...draft, meals: 4 }; setProfile(normalized); setDraft(normalized); saveProfile(normalized); const next = calculateNutrition(normalized); saveNutritionPlan(next); setHasProfile(true); setPage('dashboard') }
  const updateQuality = (next: QualityCriteria) => { setQuality(next); saveQuality(next) }
  const updateAvailableFoods = (next: AvailableFood[]) => { setAvailableFoods(next); saveAvailableFoods(next) }
  const addLog = (log: ProgressLog) => { saveProgressLog(log); setLogs(getProgressLogs()) }
  return <><AppShell page={page} onChange={navigate} menuOpen={menu} setMenuOpen={setMenu} onCheckin={() => setCheckin(true)}>
    {page === 'dashboard' && <DashboardPage profile={profile} plan={plan} quality={dashboardQuality} logs={logs} onNavigate={navigate}/>} 
    {page === 'profile' && <ProfilePage draft={draft} onChange={setDraft} onSave={commitProfile} firstVisit={!hasProfile}/>} 
    {page === 'nutrition' && <NutritionPage profile={profile} plan={plan} quality={effectiveQuality} onQuality={updateQuality} availableFoods={availableFoods} onAvailableFoods={updateAvailableFoods}/>} 
    {page === 'training' && <TrainingPage profile={profile}/>} 
    {page === 'progress' && <ProgressPage profile={profile} plan={plan} logs={logs} onCheckin={() => setCheckin(true)}/>} 
  </AppShell><WeeklyCheckIn open={checkin} onClose={() => setCheckin(false)} currentWeight={profile.weight} onSave={addLog}/></>
}
