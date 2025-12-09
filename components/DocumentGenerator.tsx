import React, { useState, useRef } from 'react';
import { DocumentTemplate } from '../types';
import { generateLegalDocument } from '../services/geminiService';
import { ArrowLeft, Download, Loader2, Sparkles, PenTool } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface Props {
  template: DocumentTemplate;
  onBack: () => void;
}

const DocumentGenerator: React.FC<Props> = ({ template, onBack }) => {
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [additionalDetails, setAdditionalDetails] = useState('');
  const [generatedContent, setGeneratedContent] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  
  const documentRef = useRef<HTMLDivElement>(null);

  // Handle dynamic field changes
  const handleFieldChange = (field: string, value: string) => {
    setFormValues(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleGenerate = async () => {
    // Double check validation before generating
    if (!isFormValid()) return;

    setIsLoading(true);
    try {
      const result = await generateLegalDocument(template.name, formValues, additionalDetails);
      setGeneratedContent(result);
    } catch (error: any) {
      console.error(error);
      alert(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = () => {
    if (!documentRef.current) return;
    setIsDownloading(true);

    const element = documentRef.current;
    
    // PDF Configuration
    // We capture the inner content which has NO padding.
    // We rely on html2pdf 'margin' to add the 25mm (1 inch) border to EVERY page evenly.
    const opt = {
      margin: [25, 25, 25, 25], // Top, Left, Bottom, Right in mm (Standard 1 inch)
      filename: `${template.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, letterRendering: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      pagebreak: { mode: ['css', 'legacy'] }
    };

    // Use window.html2pdf if available via CDN
    const html2pdf = (window as any).html2pdf;
    if (html2pdf) {
        html2pdf().set(opt).from(element).save().then(() => {
            setIsDownloading(false);
        }).catch((err: any) => {
            console.error("PDF generation failed", err);
            setIsDownloading(false);
            alert("Failed to download PDF.");
        });
    } else {
        alert("PDF generator not loaded. Please try printing using your browser.");
        setIsDownloading(false);
    }
  };

  const isFormValid = () => {
     // Strictly check that ALL required fields from the template are filled
     const requiredFieldsFilled = template.requiredFields.every(field => {
       const value = formValues[field];
       return value && value.trim().length > 0;
     });

     // Check additional details is filled
     const additionalDetailsFilled = additionalDetails.trim().length > 0;

     return requiredFieldsFilled && additionalDetailsFilled;
  };

  if (generatedContent) {
    // Remove <br> tags that might have been generated
    const cleanContent = generatedContent.replace(/<br\s*\/?>/gi, '');

    return (
      <div className="max-w-5xl mx-auto p-4 sm:p-8">
        <div className="flex items-center justify-between mb-6 no-print">
          <button onClick={() => setGeneratedContent(null)} className="flex items-center text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-50 font-medium">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Edit
          </button>
          <div className="flex gap-3">
             <button 
                onClick={handleDownload}
                disabled={isDownloading}
                className="flex items-center px-6 py-2 bg-slate-900 dark:bg-blue-700 text-white rounded-lg hover:bg-slate-800 dark:hover:bg-blue-800 shadow-md transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isDownloading ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                    <Download className="w-4 h-4 mr-2" />
                )} 
                {isDownloading ? 'Generating PDF...' : 'Download PDF'}
            </button>
          </div>
        </div>

        {/* Realistic Paper View - A4 Dimensions */}
        <div className="flex justify-center overflow-auto pb-8">
            {/* 
                Visual Container (The Paper on Screen):
                - Has padding (p-[25mm]) to look like paper.
                - Has shadow and white bg.
            */}
            <div className="bg-white dark:bg-slate-900 shadow-2xl min-h-[297mm] w-[210mm] p-[25mm] shrink-0 relative transition-colors duration-300">
                {/* 
                    Capture Target (documentRef):
                    - Has NO padding. 
                    - This ensures html2pdf adds the margin evenly to all pages.
                */}
                <div ref={documentRef} className="font-[Times_New_Roman] text-[11pt] leading-[1.5] text-justify legal-content text-black dark:text-slate-100 h-full w-full bg-white dark:bg-slate-900 transition-colors duration-300">
                    <ReactMarkdown
                        components={{
                            h1: ({node, ...props}) => <h1 className="text-[16pt] font-bold mb-8 text-center uppercase tracking-widest border-b-2 border-black dark:border-slate-300 pb-4" {...props} />,
                            h2: ({node, ...props}) => <h2 className="text-[13pt] font-bold mt-8 mb-4 uppercase" {...props} />,
                            h3: ({node, ...props}) => <h3 className="text-[11pt] font-bold mt-6 mb-2 underline" {...props} />,
                            p: ({node, ...props}) => <p className="mb-4" {...props} />,
                            ul: ({node, ...props}) => <ul className="list-disc ml-8 mb-4" {...props} />,
                            ol: ({node, ...props}) => <ol className="list-decimal ml-8 mb-4" {...props} />,
                            li: ({node, ...props}) => <li className="pl-2 mb-2" {...props} />,
                            strong: ({node, ...props}) => <strong className="font-bold" {...props} />,
                        }}
                    >
                        {cleanContent}
                    </ReactMarkdown>
                </div>
            </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto mb-12">
      <button onClick={onBack} className="flex items-center text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-50 mb-6 transition-colors duration-300">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
      </button>

      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl overflow-hidden border border-slate-100 dark:border-slate-700 transition-colors duration-300">
        <div className="bg-slate-900 dark:bg-slate-950 p-8 text-white transition-colors duration-300">
            <div className="flex items-center gap-4">
                <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm">
                    <PenTool className="w-8 h-8 text-blue-300" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold">{template.name} Generator</h2>
                    <p className="text-slate-400 mt-1">Please fill in the fields below. The more details you provide, the better the contract.</p>
                </div>
            </div>
        </div>

        <div className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {template.requiredFields.map((field) => (
                <div key={field}>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-200 mb-2 uppercase tracking-wide">
                        {field} <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        value={formValues[field] || ''}
                        onChange={(e) => handleFieldChange(field, e.target.value)}
                        placeholder={`Enter ${field}...`}
                        className="w-full p-3 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-50 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-400"
                    />
                </div>
            ))}
          </div>

          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wide">
                    Additional Details / Specific Clauses <span className="text-red-500">*</span>
                </label>
            </div>
            <textarea
              value={additionalDetails}
              onChange={(e) => setAdditionalDetails(e.target.value)}
              placeholder="Describe any specific terms, payment schedules, special conditions, or custom clauses you want included..."
              className="w-full p-4 h-40 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-50 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none placeholder:text-slate-400 dark:placeholder:text-slate-400"
            />
          </div>

          <button
            onClick={handleGenerate}
            disabled={!isFormValid() || isLoading}
            className={`w-full py-4 rounded-xl text-white font-bold text-lg flex items-center justify-center gap-3 transition-all shadow-lg ${
              !isFormValid() || isLoading
                ? 'bg-slate-300 dark:bg-slate-700 cursor-not-allowed text-slate-500 dark:text-slate-400'
                : 'bg-blue-600 hover:bg-blue-700 hover:shadow-xl hover:-translate-y-1'
            }`}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-6 h-6 animate-spin" /> Drafting Professional Agreement...
              </>
            ) : (
              <>
                <Sparkles className="w-6 h-6" /> Generate {template.name}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DocumentGenerator;