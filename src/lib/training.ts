import type { Exercise, Profile, Workout } from './types'

const exercise = (name: string, sets: string, reps: string, note: string): Exercise => ({ name, sets, reps, effort: 'RIR 2', rest: name.includes('Підйом') || name.includes('Розгинання') ? '60–90 с' : '2–3 хв', note, progression: 'Верхня межа повторів у всіх підходах — додай 2,5–5 кг.' })
const upper = [exercise('Жим штанги лежачи', '4', '6–8', 'Лопатки зведені, стопи стабільно.'), exercise('Тяга горизонтального блока', '4', '8–10', 'Веди лікоть назад, не крути корпус.'), exercise('Жим гантелей сидячи', '3', '8–10', 'Не прогинай поперек.'), exercise('Підтягування / верхній блок', '3', '8–12', 'Тягни лікті до ребер.'), exercise('Підйом гантелей в сторони', '3', '12–15', 'Контрольований темп.')]
const lower = [exercise('Присідання зі штангою', '4', '6–8', 'Коліна за напрямком носків.'), exercise('Румунська тяга', '3', '8–10', 'Таз назад, спина нейтральна.'), exercise('Жим ногами', '3', '10–12', 'Не відривай таз.'), exercise('Згинання ніг', '3', '10–15', 'Пауза у скороченні.'), exercise('Підйом на носки', '4', '10–15', 'Повна амплітуда.')]
const fullA = [...upper.slice(0, 2), ...lower.slice(0, 3)]
const fullB = [upper[2], upper[3], lower[1], lower[2], exercise('Віджимання на брусах', '3', '8–12', 'Плечі вниз, контроль глибини.')]
const push = [upper[0], upper[2], upper[4], exercise('Розгинання рук на блоці', '3', '10–15', 'Лікті нерухомі.')]
const pull = [upper[1], upper[3], lower[1], exercise('Підйом гантелей на біцепс', '3', '10–15', 'Без розгойдування.')]
const pushComplete = [upper[0], exercise('Жим гантелей на похилій лаві', '3', '8–12', 'Не втрачай контакт лопаток із лавою.'), upper[2], upper[4], exercise('Розгинання рук на блоці', '3', '10–15', 'Лікті нерухомі.')]
const pullComplete = [upper[1], upper[3], exercise('Розведення на задню дельту', '3', '12–15', 'Рухай плечем, не кистю.'), lower[1], exercise('Підйом гантелей на біцепс', '3', '10–15', 'Без розгойдування.')]
const legsComplete = [...lower, exercise('Розгинання ніг', '3', '12–15', 'Контрольовано, без удару у верхній точці.')]

function adjustForExperience(workouts: Workout[], profile: Profile): Workout[] {
  if (profile.experience === 'intermediate') return workouts
  return workouts.map(workout => ({
    ...workout,
    exercises: workout.exercises.map((item, index) => {
      const sets = Number(item.sets)
      if (!Number.isFinite(sets)) return item
      if (profile.experience === 'beginner') return { ...item, sets: String(Math.min(3, sets)), effort: 'RIR 3' }
      return index === 0 ? { ...item, sets: String(sets + 1), effort: 'RIR 1–2' } : { ...item, effort: 'RIR 1–2' }
    }),
  }))
}

export function generateTraining(profile: Profile): Workout[] {
  const day = (i: number, title: string, focus: string, exercises: Exercise[]): Workout => ({ day: `День ${i}`, title, focus, exercises })
  let workouts: Workout[]
  if (profile.trainingDays === 2) workouts = [day(1, 'Full Body A', 'Базові рухи', fullA), day(2, 'Full Body B', 'Повне тіло', fullB)]
  else if (profile.trainingDays === 3) workouts = [day(1, 'Upper', 'Верх тіла', upper), day(2, 'Lower', 'Низ тіла', lower), day(3, 'Full Body', 'Повне тіло', fullB)]
  else if (profile.trainingDays === 4) workouts = [day(1, 'Upper A', 'Сила верху', upper), day(2, 'Lower A', 'Квадрицепс', lower), day(3, 'Upper B', 'Обʼєм верху', upper), day(4, 'Lower B', 'Задня поверхня', lower)]
  else {
    const five = [day(1, 'Push', 'Груди · плечі · трицепс', pushComplete), day(2, 'Pull', 'Спина · біцепс', pullComplete), day(3, 'Legs', 'Ноги', legsComplete), day(4, 'Upper', 'Верх тіла', upper), day(5, 'Lower', 'Низ тіла', lower)]
    workouts = profile.trainingDays === 5 ? five : [...five.slice(0, 3), day(4, 'Push B', 'Обʼєм жимів', pushComplete), day(5, 'Pull B', 'Обʼєм тяг', pullComplete), day(6, 'Legs B', 'Обʼєм ніг', legsComplete)]
  }
  return adjustForExperience(workouts, profile)
}
