// Curated prompt scaffolding for the AI Product Photos tool. Most weak generations come from
// vague freeform prompts, not bad reference photos — these presets encode wording that works
// reliably with nano banana (Gemini 2.5 Flash Image) so merchants don't have to know how to
// prompt an image model themselves.

export type ScenePreset = 'studio' | 'outdoor-park' | 'urban-street' | 'beach' | 'indoor-lifestyle' | 'flat-lay'
export type SubjectPreset = 'model-female' | 'model-male' | 'no-model'
export type LightingPreset = 'bright-clean' | 'golden-hour' | 'moody' | 'soft-natural'

export const SCENE_PRESETS: ScenePreset[] = ['studio', 'outdoor-park', 'urban-street', 'beach', 'indoor-lifestyle', 'flat-lay']
export const SUBJECT_PRESETS: SubjectPreset[] = ['model-female', 'model-male', 'no-model']
export const LIGHTING_PRESETS: LightingPreset[] = ['bright-clean', 'golden-hour', 'moody', 'soft-natural']

const SCENE_PHRASES: Record<ScenePreset, string> = {
  studio: 'in a clean studio setting with a plain white background',
  'outdoor-park': 'outdoors in a park, with trees and grass in the background',
  'urban-street': 'on an urban city street, with buildings and street details in the background',
  beach: 'on a beach, with sand and ocean in the background',
  'indoor-lifestyle': 'in a cozy home interior, lifestyle setting',
  'flat-lay': 'as a flat lay product shot on a clean, neatly styled surface',
}

const SUBJECT_PHRASES: Record<SubjectPreset, string> = {
  'model-female': 'Show this product being worn by a female model',
  'model-male': 'Show this product being worn by a male model',
  'no-model': 'Show this product by itself, no model',
}

const LIGHTING_PHRASES: Record<LightingPreset, string> = {
  'bright-clean': 'bright, clean, even lighting',
  'golden-hour': 'warm golden hour sunset lighting',
  moody: 'moody, dramatic lighting with strong shadows',
  'soft-natural': 'soft natural daylight',
}

// "flat-lay" already implies no model — forcing the subject phrase to match avoids a
// contradictory prompt like "worn by a female model ... flat lay, no model".
export function effectiveSubject(scene: ScenePreset, subject: SubjectPreset): SubjectPreset {
  return scene === 'flat-lay' ? 'no-model' : subject
}

export function composePrompt(scene: ScenePreset, subject: SubjectPreset, lighting: LightingPreset, details: string): string {
  const subjectPhrase = SUBJECT_PHRASES[effectiveSubject(scene, subject)]
  const parts = [subjectPhrase, SCENE_PHRASES[scene], LIGHTING_PHRASES[lighting]]
  let prompt = `${parts.join(', ')}.`
  if (details.trim()) prompt += ` ${details.trim()}.`
  return prompt
}
