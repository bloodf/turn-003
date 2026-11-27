import type { GenOpts } from './gen'
export interface Preset { id: string; name: string; blurb: string; o: GenOpts }
const P = (id: string, name: string, blurb: string, o: Partial<GenOpts> & { kind: GenOpts['kind']; seed: string }): Preset => ({ id, name, blurb, o: { size: 2, theme: 'stone', biome: 'temperate', levels: 1, caves: .15, name, ...o } })
export const PRESETS: Preset[] = [
  P('keep', 'Castle Ravencrest', 'A moated keep with round towers, a working bailey and cells below', { kind: 'castle', seed: 'ravencrest-7', size: 2, moat: true, roofs: 'cone', style: 'ashlar', time: 16.5 }),
  P('crypt', 'The Weeping Crypt', 'Three floors of tombs. Something on the lowest one is awake', { kind: 'dungeon', seed: 'weeping-crypt-3', size: 3, theme: 'crypt', levels: 3, caves: .08 }),
  P('village', 'Willowford', 'A river village with a tavern, a smith and a graveyard nobody visits', { kind: 'village', seed: 'willowford-12', size: 2, time: 10 }),
  P('mine', 'Emberhold', 'A dwarven hold, its forges still hot and its doors barred from inside', { kind: 'dungeon', seed: 'emberhold-5', size: 3, theme: 'dwarven', levels: 2, caves: .3 }),
  P('cavern', 'The Glimmer Hollow', 'Crystal, fungus and black water under the hill', { kind: 'cave', seed: 'glimmer-22', size: 3, theme: 'stone', caves: 1 }),
  P('tower', 'Duskneedle Tower', 'A wizard’s tower in a blighted mire', { kind: 'tower', seed: 'duskneedle-4', biome: 'blight', theme: 'crypt', time: 18.2 }),
  P('tomb', 'Tomb of the Sun King', 'Sandstone halls full of traps and patient dead', { kind: 'dungeon', seed: 'sun-king-9', size: 2, theme: 'desert', levels: 2, caves: .05 }),
  P('frost', 'Frostfell Halls', 'A frozen stronghold cut into a glacier', { kind: 'dungeon', seed: 'frostfell-2', size: 2, theme: 'frost', levels: 1, caves: .3 }),
  P('pit', 'The Brimstone Pit', 'Black brick, chains and rivers of fire', { kind: 'dungeon', seed: 'brimstone-6', size: 2, theme: 'infernal', levels: 2, caves: .3 }),
  P('ruin', 'The Green Abbey', 'The forest came in through the roof a century ago', { kind: 'dungeon', seed: 'green-abbey-8', size: 2, theme: 'overgrown', levels: 1, caves: .25 }),
  P('winter', 'Wolfguard Hold', 'A border castle in deep snow', { kind: 'castle', seed: 'wolfguard-3', size: 1, biome: 'snow', roofs: 'battlement', style: 'stone_wall', moat: false, time: 9, theme: 'frost' }),
  P('autumn', 'The Redleaf March', 'Autumn woods, standing stones, and a stair going down', { kind: 'wilds', seed: 'redleaf-14', size: 3, biome: 'autumn', theme: 'overgrown', time: 17 }),
  P('realm', 'The Vale of Thorns', 'Village, castle, wilds and a deep dungeon in one land', { kind: 'realm', seed: 'thorns-31', size: 3, time: 14 }),
]
