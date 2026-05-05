import { memo } from 'react'
import './index.css'

// prettier-ignore
const BUFFS = [
  // Paladin Blessings
  { id: 'bok',     name: 'Blessing of Kings',           icon: 'spell_magic_greaterblessingofkings' },
  { id: 'bow',     name: 'Blessing of Wisdom',          icon: 'spell_holy_greaterblessingofwisdom' },
  { id: 'bos',     name: 'Blessing of Salvation',       icon: 'spell_holy_greaterblessingofsalvation' },
  // Priest buffs
  { id: 'fort',    name: 'Prayer of Fortitude',         icon: 'spell_holy_prayeroffortitude' },
  { id: 'spirit',  name: 'Prayer of Divine Spirit',     icon: 'spell_holy_divinespirit' },
  { id: 'shadowp', name: 'Prayer of Shadow Protection', icon: 'spell_holy_prayerofshadowprotection' },
  // Mage
  { id: 'int',     name: 'Arcane Brilliance',           icon: 'spell_holy_arcaneintellect' },
  // Druid
  { id: 'motw',    name: 'Gift of the Wild',            icon: 'spell_nature_giftofthewild' },
  // Shaman totems
  { id: 'woa',     name: 'Wrath of Air',                icon: 'spell_nature_windfury' },
  { id: 'ms',      name: 'Mana Spring',                 icon: 'spell_nature_manaregentotem' },
  // Draenei racial
  { id: 'heroic',  name: 'Heroic Presence',             icon: 'inv_helmet_21' },
  // Consumables
  { id: 'food',    name: 'Well Fed',                    icon: 'spell_misc_food' },
  { id: 'ehp',     name: 'Elixir of Healing Power',     icon: 'inv_potion_142' },
  { id: 'edw',     name: 'Elixir of Draenic Wisdom',    icon: 'inv_potion_155' },
  { id: 'oil',     name: 'Superior Wizard Oil',         icon: 'inv_mace_72' },
]

const BASE = '/tbc-resto-druid-rotation-game/icons/'

function Buffs() {
  return (
    <div className='Buffs'>
      {BUFFS.map((buff) => (
        <div
          key={buff.id}
          className='Buff'
          title={buff.name}
          style={{ backgroundImage: `url('${BASE}${buff.icon}.jpg')` }}
        />
      ))}
    </div>
  )
}

export default memo(Buffs)
