import type { NutritionPlan, Profile, ProgressLog } from './types'

export function todayLocalDate(now = new Date()) {
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function strengthDropped(newest: ProgressLog, oldest: ProgressLog) {
  const lifts = ['bench', 'squat', 'deadlift'] as const
  return lifts.some(lift => {
    const current = newest[lift]
    const previous = oldest[lift]
    return current && previous ? current < previous * 0.95 : false
  })
}

export function weeklyRecommendation(logs: ProgressLog[], profile: Profile, plan: NutritionPlan) {
  const ordered = [...logs].sort((a, b) => b.date.localeCompare(a.date))
  if (ordered.length < 3) return 'Потрібні 3 щотижневі check-in, щоб оцінити два повні тижні без поспішних змін калорій.'

  const newest = ordered[0]
  const oldest = ordered[2]
  const spanDays = Math.round((new Date(`${newest.date}T12:00:00`).getTime() - new Date(`${oldest.date}T12:00:00`).getTime()) / 86_400_000)
  if (spanDays < 12) return 'Між записами ще замало часу. Зачекай два повні тижні — денні коливання ваги не є трендом.'

  if (newest.energy <= 2 && (newest.sleep < 7 || strengthDropped(newest, oldest))) {
    return 'Енергія низька, а сон або силові погіршилися. Не урізай калорії: спочатку перевір сон, відновлення й розмір дефіциту.'
  }
  if (!ordered[0].dietDone && !ordered[1].dietDone) {
    return 'Два останні тижні план не виконувався стабільно. Не змінюй цільові калорії — спочатку спробуй підвищити дотримання.'
  }

  const weeklyChange = (newest.weight - oldest.weight) / (spanDays / 7)
  if (profile.goal === 'bulk' && weeklyChange < 0.1) return `Вага не зростає два тижні. Додай приблизно 150–200 ккал; новий орієнтир — ${plan.calories + 175} ккал.`
  if (profile.goal === 'bulk' && weeklyChange > profile.weight * 0.0075) return `Вага зростає швидше ніж ≈0,75% на тиждень. Зменш орієнтир до ${Math.max(plan.calories - 125, 1400)} ккал.`
  if (profile.goal === 'cut' && weeklyChange > -0.1) return `Вага не знижується два тижні. Якщо дотримання було стабільним, новий орієнтир — ${Math.max(plan.calories - 175, profile.sex === 'male' ? 1700 : 1400)} ккал.`
  if (profile.goal === 'cut' && weeklyChange < -profile.weight * 0.012) return 'Вага знижується швидше ніж ≈1,2% на тиждень. Додай 100–150 ккал і стеж за силою та енергією.'
  return 'Двотижневий тренд адекватний. Залиш план без змін і збери ще один check-in.'
}
