/** Cursos de Tecnologia da Unisanta (ajustável conforme a grade oficial). */
export const COURSES = [
  "Sistemas de Informação",
  "Análise e Desenvolvimento de Sistemas",
  "Inteligência Artificial",
] as const;

export type Course = (typeof COURSES)[number];

/** Períodos (semestres) possíveis. */
export const PERIODS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as const;
