export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatDuration(minutes: number): string {
  return `${minutes} Min`;
}

export function formatQuestionCount(count: number): string {
  return `${count} Q's`;
}

export function formatMarks(marks: number): string {
  return `${marks} Marks`;
}
