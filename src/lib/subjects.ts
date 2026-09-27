export type StudentClass = 9 | 10 | 11 | 12;

export const CLASS_SUBJECTS: Record<StudentClass, string[]> = {
  9: ['Maths', 'Science', 'SST', 'English', 'Hindi', 'Urdu'],
  10: ['Maths', 'Science', 'SST', 'English', 'Hindi', 'Urdu'],
  11: ['Maths', 'Biology', 'Physics', 'Chemistry', 'English'],
  12: ['Maths', 'Biology', 'Physics', 'Chemistry', 'English'],
};

export const SUBJECT_DETAILS: Record<string, { icon: string; description: string }> = {
  Maths: { icon: '', description: 'Formulas, worked examples and practice sets.' },
  Science: { icon: '', description: 'Physics, chemistry and biology concepts, diagrams and revision material.' },
  SST: { icon: '', description: 'History, geography, civics, economics and related J&K topics.' },
  English: { icon: '', description: 'Literature, language and writing practice.' },
  Hindi: { icon: '', description: 'Literature, grammar and writing practice.' },
  Urdu: { icon: '', description: 'Literature, grammar and writing practice.' },
  Biology: { icon: '', description: 'Diagrams, concepts and chapter revision.' },
  Physics: { icon: '', description: 'Derivations, numericals and concept revision.' },
  Chemistry: { icon: '', description: 'Reactions, equations and numerical practice.' },
};

export function subjectsForClass(level: number) {
  return CLASS_SUBJECTS[(level as StudentClass)] ?? CLASS_SUBJECTS[10];
}

export function resourceSubjectMatches(resourceSubject: string, selectedSubject: string) {
  const a = resourceSubject.trim().toLowerCase();
  const b = selectedSubject.trim().toLowerCase();
  if (b === 'maths') return a === 'maths' || a === 'mathematics';
  if (b === 'sst') return a === 'sst' || a === 'social science' || a === 'social studies';
  return a === b;
}
