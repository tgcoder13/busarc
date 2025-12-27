/**
 * Utility to download text content as a file
 */
export const downloadFile = (content, filename, contentType) => {
    const a = document.createElement('a');
    const file = new Blob([content], { type: contentType });
    a.href = URL.createObjectURL(file);
    a.download = filename;
    a.click();
    URL.revokeObjectURL(a.href);
};

/**
 * Export quiz results to a text file
 */
export const exportQuizResults = (title, questions, selectedAnswers, score) => {
    let content = `PERFORMANCE REPORT: ${title}\n`;
    content += `Score: ${score}%\n`;
    content += `Generated on: ${new Date().toLocaleString()}\n`;
    content += `-------------------------------------------\n\n`;

    questions.forEach((q, i) => {
        const isCorrect = selectedAnswers[i] === q.correct;
        content += `Q${i + 1}: ${q.question}\n`;
        content += `Your Answer: ${q.options[selectedAnswers[i]] || 'Unanswered'}\n`;
        content += `Status: ${isCorrect ? 'CORRECT' : 'INCORRECT'}\n`;
        if (!isCorrect) {
            content += `Correct Answer: ${q.options[q.correct]}\n`;
        }
        content += `\n`;
    });

    content += `-------------------------------------------\n`;
    content += `SECURE CLASSIFICATION SERVER • VERCEL ARCHIVE\n`;

    downloadFile(content, `${title.replace(/\s+/g, '_')}_Results.txt`, 'text/plain');
};
