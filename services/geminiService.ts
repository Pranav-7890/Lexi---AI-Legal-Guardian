import { GoogleGenAI, Modality } from "@google/genai";
import { AnalysisResult, DocumentCategory } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const MAX_FILE_SIZE_MB = 4;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

// --- Helper Functions ---

const cleanJsonString = (text: string): string => {
  // Remove markdown code blocks if present
  let clean = text.replace(/```json\n?|```/g, '');
  // Find the first '{' and last '}' to handle any preamble/postscript text
  const firstOpen = clean.indexOf('{');
  const lastClose = clean.lastIndexOf('}');
  if (firstOpen !== -1 && lastClose !== -1) {
    clean = clean.substring(firstOpen, lastClose + 1);
  }
  return clean.trim();
};

const fileToGenerativePart = async (file: File): Promise<{ inlineData: { data: string; mimeType: string } }> => {
  if (file.size > MAX_FILE_SIZE_BYTES) {
    throw new Error(`File is too large (${(file.size / 1024 / 1024).toFixed(2)}MB). Please upload a file smaller than ${MAX_FILE_SIZE_MB}MB.`);
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      // Remove data url prefix (e.g., "data:image/jpeg;base64,")
      const base64Data = base64String.split(',')[1];
      resolve({
        inlineData: {
          data: base64Data,
          mimeType: file.type,
        },
      });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

// --- API Functions ---

/**
 * Transcribes audio blob using Flash model
 */
export const transcribeAudio = async (audioBlob: Blob): Promise<string> => {
  if (audioBlob.size > MAX_FILE_SIZE_BYTES) {
    throw new Error("Audio recording is too long. Please record shorter segments (under 2 minutes).");
  }

  try {
    const reader = new FileReader();
    return new Promise((resolve, reject) => {
      reader.onloadend = async () => {
        const base64data = (reader.result as string).split(',')[1];
        
        try {
          const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: {
              parts: [
                {
                  inlineData: {
                    mimeType: audioBlob.type || 'audio/webm',
                    data: base64data
                  }
                },
                { text: "Transcribe this audio into English text. Do not translate unrelated languages, just transcribe English speech found. Return only the transcript." }
              ]
            }
          });
          resolve(response.text || "");
        } catch (e) {
          console.error("Gemini Transcription Error:", e);
          reject(new Error("Failed to transcribe. Network error or file too large."));
        }
      };
      reader.readAsDataURL(audioBlob);
    });
  } catch (error) {
    console.error("Transcription error", error);
    throw error;
  }
};

/**
 * Analyzes a legal document image using Pro Vision + Thinking
 */
export const analyzeLegalDocument = async (file: File): Promise<AnalysisResult> => {
  const imagePart = await fileToGenerativePart(file);

  const prompt = `
    You are an expert legal AI assistant called "Legal X-Ray". 
    Analyze this legal document.
    
    Perform the following tasks:
    1. Summarize the document in very simple terms for a 5th grader.
    2. Identify the "Risk Level" (LOW, MEDIUM, HIGH) for the signer.
    3. List specific risks or obligations that are dangerous or unusual.
    4. Translate the most complex "legalese" paragraph into plain English.
    5. Find any "hidden clauses" (things in fine print or weirdly phrased) that the user should know.

    IMPORTANT: Return the response as a strict JSON object with this schema:
    {
      "summary": "string",
      "riskLevel": "LOW" | "MEDIUM" | "HIGH",
      "risks": ["string"],
      "plainEnglishTranslation": "string",
      "hiddenClauses": ["string"]
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: {
        parts: [imagePart, { text: prompt }]
      },
      config: {
        // We remove strict JSON enforcement for Thinking models to prevent timeouts/conflicts
        // responseMimeType: "application/json", 
        thinkingConfig: { thinkingBudget: 32768 } // Max thinking for deep analysis
      }
    });

    const text = response.text || "{}";
    const cleanedJson = cleanJsonString(text);
    
    return JSON.parse(cleanedJson) as AnalysisResult;
  } catch (e: any) {
    console.error("Analysis Error:", e);
    if (e.message?.includes("400") || e.message?.includes("500") || e.message?.includes("xhr")) {
      throw new Error("Analysis failed. The document might be too complex or the server is busy. Please try again.");
    }
    throw new Error("Could not analyze document. Please ensure the image is clear.");
  }
};

/**
 * Generates a new legal document based on user input using Pro model
 */
export const generateLegalDocument = async (
  type: DocumentCategory, 
  formValues: Record<string, string>,
  additionalDetails: string
): Promise<string> => {
  
  const fieldsString = Object.entries(formValues)
    .map(([key, value]) => `- ${key}: ${value}`)
    .join('\n');

  const prompt = `
    You are a world-class lawyer drafting a formal legal document.
    
    DOCUMENT TYPE: ${type}
    
    SPECIFIC DETAILS PROVIDED:
    ${fieldsString}
    
    ADDITIONAL CONTEXT/INSTRUCTIONS:
    ${additionalDetails}

    TASK:
    Draft a complete, legally robust ${type}.
    
    REQUIREMENTS:
    1. Use Markdown formatting.
    2. Use standard legal structure:
       - Start with a Title (centered, uppercase, bold).
       - A Preamble identifying the parties and date (e.g., "THIS AGREEMENT is made this...").
       - Numbered Articles/Sections (e.g., "1. DEFINITIONS", "2. TERMS").
       - Formal tone (use "shall", "parties", etc.).
       - A "Governing Law" clause.
       - A "Signatures" section at the end with lines for dates and names.
    3. Do NOT include any conversational filler (e.g., "Here is your document"). Output ONLY the document text.
    4. Format keys terms in bold where appropriate.
    5. Do NOT use HTML tags like <br> or <hr>. Use standard Markdown syntax for spacing (e.g. double newlines).
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
          temperature: 0.1 // Low temperature for consistent, formal output
      }
    });

    return response.text || "Failed to generate document.";
  } catch (e) {
    console.error("Generation Error:", e);
    throw new Error("Failed to generate document due to network error.");
  }
};

/**
 * Text to Speech using Gemini 2.5 Flash TTS
 */
export const speakText = async (text: string): Promise<ArrayBuffer> => {
  // Truncate text if too long to prevent payload errors (TTS limit)
  const safeText = text.length > 4000 ? text.substring(0, 4000) + "..." : text;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: {
        parts: [{ text: safeText }]
      },
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Fenrir' } // Deep, authoritative but helpful voice
          }
        }
      }
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) throw new Error("No audio generated");

    // Decode base64 to ArrayBuffer
    const binaryString = atob(base64Audio);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
  } catch (e) {
    console.error("TTS Error:", e);
    throw new Error("Failed to generate speech audio.");
  }
};

/**
 * Chat with the legal advisor about the document
 */
// Fix: Use array syntax {text: string}[] instead of tuple syntax [{text: string}] to resolve type compatibility with LegalChatbot.tsx
export const getChatResponse = async (
    history: {role: string, parts: {text: string}[]}[], 
    message: string, 
    context: AnalysisResult
): Promise<string> => {
    
    // Construct the context string from the analysis result
    const contextString = `
      You are an expert legal advisor and attorney. Use the following analysis of a legal document to answer the user's questions.
      
      DOCUMENT SUMMARY: ${context.summary}
      RISK LEVEL: ${context.riskLevel}
      IDENTIFIED RISKS: ${context.risks.join('; ')}
      HIDDEN CLAUSES: ${context.hiddenClauses.join('; ')}
      TRANSLATION OF COMPLEX CLAUSE: ${context.plainEnglishTranslation}
      
      INSTRUCTIONS:
      - Answer based strictly on the provided document context.
      - If the user asks something not covered in the summary/risks, explain that you can only answer based on the analyzed content.
      - Be helpful, professional, but concise. 
      - Use Markdown formatting:
        * Use **bold** for key terms or emphasis.
        * Use bullet points for lists.
        * Use numbered lists for steps.
      - Do not give binding legal advice, always suggest consulting a real lawyer for critical decisions.
    `;

    try {
        const chat = ai.chats.create({
            model: 'gemini-3-pro-preview',
            config: {
                systemInstruction: contextString
            },
            history: history
        });

        const result = await chat.sendMessage({ message });
        return result.text || "I couldn't process that request.";
    } catch (e) {
        console.error("Chat Error:", e);
        throw new Error("Failed to get response from Legal Assistant.");
    }
};