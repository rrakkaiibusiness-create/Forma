import type { Profile } from '../../lib/types'
import { Input } from '../ui/Input'
export function FoodPreferencesForm({ profile, onChange }: { profile: Profile; onChange: (v: Profile) => void }) { return <Input label="Не використовувати у плані" placeholder="Напр. риба, молоко" value={profile.restrictions} onChange={e => onChange({ ...profile, restrictions: e.target.value })}/> }
