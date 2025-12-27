import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist/legacy/build/pdf.mjs';

// Initialize PDF.js worker
if (typeof window !== 'undefined' && !GlobalWorkerOptions.workerSrc) {
    GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${import.meta.env?.PDFJS_VERSION || '5.4.449'}/build/pdf.worker.min.mjs`;
}

/**
 * Extract text from a PDF file URL
 */
export const extractTextFromPDF = async (url) => {
    try {
        const loadingTask = getDocument(url);
        const pdf = await loadingTask.promise;
        let fullText = "";

        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            const pageText = textContent.items.map(item => item.str).join(" ");
            fullText += pageText + "\n";
        }

        return fullText;
    } catch (error) {
        console.error("PDF Extraction Error:", error);
        throw new Error("Failed to extract text from PDF: " + error.message);
    }
};

/**
 * Generate a mock test from text content
 * This is a client-side mock implementation. In a production app, 
 * this would typically call an LLM API.
 */
export const generateMockTest = async (text, title) => {
    // Simplified logic to create questions based on document keywords
    const words = text.split(/\s+/).filter(w => w.length > 6);
    const uniqueWords = [...new Set(words)].slice(0, 10);

    const questions = uniqueWords.map((word, index) => {
        const options = [
            word,
            "An alternative concept",
            "A related framework",
            "None of the above"
        ].sort(() => Math.random() - 0.5);

        return {
            id: index,
            question: `Which of the following describes a key element related to "${word}" as mentioned in ${title}?`,
            options: options,
            correct: options.indexOf(word)
        };
    });

    return {
        title: `Mock Test: ${title}`,
        questions: questions
    };
};
