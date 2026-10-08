import ImageResizer from '../tools/image-resizer/ImageResizer'
import NameGenerator from '../tools/name-generator/NameGenerator'
import SpinWheel from '../tools/spin-the-wheel/SpinWheel'
import DateCalculator from '../tools/date-calculator/DateCalculator'
import { toolMetadata } from './metadata'

// One entry per tool supplies routes, navigation, home cards, and page metadata.
const presentations = [
  { summary: 'The right dimensions, format, and file size. All on your device.', symbol: '\u2194', component: ImageResizer },
  { summary: 'A fresh name for your next idea. Find a vibe, save your favorites.', symbol: '\u2726', component: NameGenerator },
  { summary: 'Let chance choose. Spin for dinner, drawings, games, and everyday decisions.', symbol: '\u25c9', component: SpinWheel },
  { summary: 'Add days, count the gap, or skip the weekends. A little help with the calendar.', symbol: '\u25a6', component: DateCalculator },
]
export const tools = toolMetadata.map((metadata, index) => ({ ...metadata, ...presentations[index] }))
