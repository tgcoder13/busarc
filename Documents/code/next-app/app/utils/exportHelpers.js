// Export Utility Functions

/**
 * Convert data to CSV format
 */
export function toCSV(data, headers) {
    const csvHeaders = headers.join(',');
    const csvRows = data.map(row =>
        headers.map(header => {
            const value = row[header] || '';
            // Escape quotes and wrap in quotes if contains comma
            return typeof value === 'string' && (value.includes(',') || value.includes('"'))
                ? `"${value.replace(/"/g, '""')}"`
                : value;
        }).join(',')
    );
    return [csvHeaders, ...csvRows].join('\n');
}

/**
 * Trigger browser download
 */
export function downloadFile(content, filename, mimeType = 'text/plain') {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

/**
 * Export flashcards in various formats
 */
export function exportFlashcards(cards, format = 'json', filename = 'flashcards') {
    switch (format) {
        case 'json':
            downloadFile(
                JSON.stringify(cards, null, 2),
                `${filename}.json`,
                'application/json'
            );
            break;

        case 'csv':
            const csv = toCSV(
                cards.map(c => ({ question: c.q, answer: c.a })),
                ['question', 'answer']
            );
            downloadFile(csv, `${filename}.csv`, 'text/csv');
            break;

        case 'txt':
            const text = cards.map((c, i) =>
                `Card ${i + 1}:\nQ: ${c.q}\nA: ${c.a}\n${'-'.repeat(50)}\n`
            ).join('\n');
            downloadFile(text, `${filename}.txt`, 'text/plain');
            break;
    }
}

/**
 * Export test questions
 */
export function exportTest(questions, format = 'json', filename = 'test') {
    switch (format) {
        case 'json':
            downloadFile(
                JSON.stringify(questions, null, 2),
                `${filename}.json`,
                'application/json'
            );
            break;

        case 'csv':
            const csv = toCSV(
                questions.map(q => ({
                    question: q.q || q.question,
                    option_a: q.opts?.[0] || q.options?.[0] || '',
                    option_b: q.opts?.[1] || q.options?.[1] || '',
                    option_c: q.opts?.[2] || q.options?.[2] || '',
                    option_d: q.opts?.[3] || q.options?.[3] || '',
                    correct_answer: q.a?.toString() || q.correct?.toString() || '',
                    type: q.type || 'mcq'
                })),
                ['question', 'option_a', 'option_b', 'option_c', 'option_d', 'correct_answer', 'type']
            );
            downloadFile(csv, `${filename}.csv`, 'text/csv');
            break;

        case 'answer_key':
            const answerKey = questions.map((q, i) => {
                const correctIndex = typeof q.a === 'number' ? q.a : (typeof q.correct === 'number' ? q.correct : 0);
                const correctAnswer = q.opts?.[correctIndex] || q.options?.[correctIndex] || q.correct;
                return `${i + 1}. ${String.fromCharCode(65 + correctIndex)} - ${correctAnswer}`;
            }).join('\n');
            downloadFile(answerKey, `${filename}_answer_key.txt`, 'text/plain');
            break;
    }
}
