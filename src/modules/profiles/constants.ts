/** Cursos de Tecnologia da Unisanta (ajustável conforme a grade oficial). */
export const COURSES = [
  "Ciência da Computação",
  "Engenharia de Software",
  "Análise e Desenvolvimento de Sistemas",
  "Jogos Digitais",
  "Gestão da Tecnologia da Informação",
  "Redes de Computadores",
] as const;

export type Course = (typeof COURSES)[number];

/** Períodos (semestres) possíveis. */
export const PERIODS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as const;
