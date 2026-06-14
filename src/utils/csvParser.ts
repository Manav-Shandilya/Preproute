import Papa from 'papaparse';
import { QuestionFormValues, CorrectOption } from '../types';

const VALID_CORRECT_OPTIONS: CorrectOption[] = ['option1', 'option2', 'option3', 'option4'];

export function parseQuestionsCSV(file: File): Promise<QuestionFormValues[]> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          const questions: QuestionFormValues[] = results.data.map((row: any, index: number) => {
            if (!row.question || !row.option1 || !row.option2 || !row.option3 || !row.option4 || !row.correct_option) {
              throw new Error(`Row ${index + 1}: Missing required fields (question, option1-4, correct_option)`);
            }

            const correctOption = row.correct_option.trim() as CorrectOption;
            if (!VALID_CORRECT_OPTIONS.includes(correctOption)) {
              throw new Error(
                `Row ${index + 1}: Invalid correct_option "${row.correct_option}". Must be option1, option2, option3, or option4.`
              );
            }

            return {
              question: row.question.trim(),
              option1: row.option1.trim(),
              option2: row.option2.trim(),
              option3: row.option3.trim(),
              option4: row.option4.trim(),
              correct_option: correctOption,
              explanation: row.explanation?.trim() || undefined,
              difficulty: row.difficulty?.trim() || undefined,
              topic_id: row.topic_id?.trim() || undefined,
              sub_topic_id: row.sub_topic_id?.trim() || undefined,
              media_url: row.media_url?.trim() || undefined,
            };
          });
          resolve(questions);
        } catch (err) {
          reject(err);
        }
      },
      error: (error) => {
        reject(new Error(`CSV parsing failed: ${error.message}`));
      },
    });
  });
}
