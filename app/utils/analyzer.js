import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist/legacy/build/pdf';
import Tesseract from 'tesseract.js';

// Initialize PDF.js worker
if (typeof window !== 'undefined') {
    // Standardize worker source to match package version
    GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;
}

export async function extractTextFromPDF(url) {
    try {
        const loadingTask = getDocument(url);
        const pdf = await loadingTask.promise;
        let fullText = '';
        let pagesScanned = 0;

        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();

            // 1. Try Standard Text Extraction
            if (textContent.items.length > 0) {
                const pageText = textContent.items.map(item => item.str).join(' ');
                fullText += `Page ${i}:\n${pageText}\n\n`;
            } else {
                // 2. Fallback to OCR (Canvas Rendering)
                console.warn(`Page ${i} is scanned. Running OCR...`);

                // Create canvas for rendering
                const viewport = page.getViewport({ scale: 1.5 }); // 1.5x for better OCR accuracy
                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d');
                canvas.height = viewport.height;
                canvas.width = viewport.width;

                await page.render({ canvasContext: context, viewport: viewport }).promise;

                // Recognize text using Tesseract
                const { data: { text } } = await Tesseract.recognize(canvas, 'eng');
                fullText += `Page ${i} (OCR):\n${text}\n\n`;
                pagesScanned++;
            }
        }

        if (fullText.trim().length === 0) return "No text could be extracted from this document.";
        return fullText;
    } catch (error) {
        console.error("PDF Extraction Error:", error);
        return "";
    }
}

export const generateMockTest = (text, config = {}) => {
    // Clean and split text into sentences for better context
    const cleanText = text.replace(/\s+/g, ' ').trim();
    const sentences = cleanText.match(/[^.!?]+[.!?]+/g) || [];

    // Helper to get random items
    const getRandom = (arr, n) => {
        const shuffled = [...arr].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, n);
    };

    const generateMCQ = (count) => {
        // Find sentences with significant words (length > 5) to create questions
        const suitable = sentences.filter(s => s.length > 20 && s.length < 150);
        return getRandom(suitable, count).map((s, i) => {
            // Simple cloze deletion or concept extraction
            const words = s.split(' ');
            const targetIndex = words.findIndex(w => w.length > 6);
            const target = targetIndex > -1 ? words[targetIndex].replace(/[^a-zA-Z]/g, '') : "Concept";

            return {
                id: `mcq-${i}`,
                type: 'mcq',
                question: s.replace(target, "_______"),
                options: [target, "Analysis", "Structure", "Variable"].sort(() => 0.5 - Math.random()),
                correct: target
            };
        });
    };

    const generateShortAnswer = (count) => {
        const suitable = sentences.filter(s => s.length > 30);
        return getRandom(suitable, count).map((s, i) => ({
            id: `sa-${i}`,
            type: 'short_answer',
            question: `Briefly explain the context of this statement: "${s.slice(0, 50)}..."`,
            answer: s
        }));
    };

    const generateTheory = (count) => {
        // Theory needs broader context, maybe chunking paragraphs
        const chunks = cleanText.match(/.{1,200}/g) || [];
        return getRandom(chunks, count).map((c, i) => ({
            id: `th-${i}`,
            type: 'theory',
            question: `Discuss the implications of the following passage: "${c.slice(0, 100)}..."`,
            answer: c.slice(0, 300) // Provide full context as 'model answer' reference
        }));
    };

    if (config.mode === 'grand_test') {
        return {
            questions: [
                ...generateMCQ(40),
                ...generateShortAnswer(20),
                ...generateTheory(10)
            ]
        };
    }

    // Default Behavior (5 Questions based on config)
    return {
        questions: generateMCQ(config.qCount || 5)
    };
};
