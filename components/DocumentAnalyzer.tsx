import React, { useState, useRef } from 'react';
import { analyzeLegalDocument } from '../services/geminiService';
import { AnalysisResult } from '../types';
import { ArrowLeft, Upload, FileSearch, ShieldAlert, AlertTriangle, Loader2, ScanEye, FileText, Download, X } from 'lucide-react';
import LegalChatbot from './LegalChatbot';

interface Props {
  onBack: () => void;
}

const DocumentAnalyzer: React.FC<Props> = ({ onBack }) => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      
      const reader = new FileReader();
      reader.onload = () => setPreview(reader.result as string);
      reader.readAsDataURL(selectedFile);
      setResult(null);
    }
  };

  const handleRemoveFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFile(null);
    setPreview(null);
    setResult(null);
    if (fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  };

  const handleAnalyze = async () => {
    if (!file) return;
    setIsAnalyzing(true);
    try {
      const analysis = await analyzeLegalDocument(file);
      setResult(analysis);
    } catch (error: any) {
      console.error(error);
      alert(error.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleDownloadReport = () => {
    if (!resultsRef.current || !result) return;
    setIsDownloading(true);

    const element = resultsRef.current;

    // Options for PDF generation
    const opt = {
      margin: [10, 10, 10, 10], // mm
      filename: `Legal_Analysis_Report_${new Date().toISOString().split('T')[0]}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      pagebreak: { mode: ['css', 'legacy'] }
    };

    const html2pdf = (window as any).html2pdf;
    if (html2pdf) {
      html2pdf().set(opt).from(element).save().then(() => {
        setIsDownloading(false);
      }).catch((err: any) => {
        console.error("PDF generation failed", err);
        setIsDownloading(false);
        alert("Failed to download PDF report.");
      });
    } else {
      alert("PDF generator not loaded. Please try again later.");
      setIsDownloading(false);
    }
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'HIGH': return 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-100 dark:border-red-800';
      case 'MEDIUM': return 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950 dark:text-yellow-100 dark:border-yellow-800';
      case 'LOW': return 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-100 dark:border-green-800';
      default: return 'bg-slate-50 text-slate-700 dark:bg-slate-700 dark:text-slate-200';
    }
  };

  const isPdf = file?.type === 'application/pdf';

  return (
    <div className="max-w-5xl mx-auto">
      <button onClick={onBack} className="flex items-center text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-50 mb-6 transition-colors duration-300 no-print">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: Upload & Chat */}
        <div className="space-y-6 no-print">
            {/* Upload Section */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-lg border border-slate-100 dark:border-slate-700 transition-colors duration-300">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-slate-800 dark:text-slate-50">
                    <FileSearch className="text-blue-600" />
                    Upload Document
                </h2>
                <div 
                    onClick={(e) => {
                        // Only open file dialog if not already analyzing
                        if (!isAnalyzing) {
                            fileInputRef.current?.click();
                        }
                    }}
                    className={`relative border-2 border-dashed rounded-xl h-64 flex flex-col items-center justify-center cursor-pointer transition-all overflow-hidden ${preview ? 'border-blue-500 bg-blue-50 dark:bg-blue-950' : 'border-slate-300 dark:border-slate-600 hover:border-blue-400 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
                >
                    {preview ? (
                        <>
                            {/* Close Button */}
                            {!isAnalyzing && (
                                <button 
                                    onClick={handleRemoveFile}
                                    className="absolute top-3 right-3 p-1.5 bg-white dark:bg-slate-600 rounded-full shadow-sm border border-slate-200 dark:border-slate-500 text-slate-400 dark:text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900 transition-all z-20"
                                    title="Remove file"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            )}

                            {/* Content Wrapper */}
                            <div className="relative flex flex-col items-center justify-center p-4">
                                
                                {isPdf ? (
                                    <div className="flex flex-col items-center text-red-600">
                                        <FileText className="w-20 h-20 mb-2" />
                                        <span className="font-semibold text-slate-700 dark:text-slate-200 max-w-[200px] truncate">{file?.name}</span>
                                        <span className="text-sm text-slate-500 dark:text-slate-400">PDF Document Ready</span>
                                    </div>
                                ) : (
                                    <img src={preview} alt="Document" className="h-40 w-full object-contain rounded-lg" />
                                )}
                            </div>
                        </>
                    ) : (
                        <div className="text-center p-6">
                            <Upload className="w-12 h-12 text-slate-400 dark:text-slate-500 mx-auto mb-2" />
                            <p className="text-slate-600 dark:text-slate-300 font-medium">Click to upload photo or PDF</p>
                            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Supports JPG, PNG, PDF</p>
                        </div>
                    )}
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleFileChange} 
                        accept="image/*,application/pdf" 
                        className="hidden" 
                    />
                </div>
                <button
                    onClick={handleAnalyze}
                    disabled={!file || isAnalyzing}
                    className={`w-full mt-6 py-3 rounded-xl text-white font-semibold flex items-center justify-center gap-2 transition-all ${
                        !file || isAnalyzing
                        ? 'bg-slate-300 dark:bg-slate-700 cursor-not-allowed text-slate-500 dark:text-slate-400'
                        : 'bg-indigo-600 hover:bg-indigo-700 shadow-md hover:scale-[1.02]'
                    }`}
                >
                    {isAnalyzing ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" /> Analyzing with Thinking Mode...
                        </>
                    ) : (
                        <>
                            <ScanEye className="w-5 h-5" /> Analyze Document
                        </>
                    )}
                </button>
            </div>

            {/* Chatbot Section - Shows only after analysis */}
            {result && (
                <LegalChatbot analysisResult={result} />
            )}
        </div>

        {/* Right Column: Results */}
        <div className="space-y-6">
            {!result && !isAnalyzing && (
                <div className="h-full bg-slate-100 dark:bg-slate-800 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400 dark:text-slate-500 min-h-[400px] transition-colors duration-300">
                    <p>Results will appear here</p>
                </div>
            )}
            
            {isAnalyzing && (
                <div className="h-full bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-8 flex flex-col items-center justify-center space-y-4 min-h-[400px] transition-colors duration-300">
                    <div className="w-16 h-16 relative">
                        <div className="absolute inset-0 border-4 border-indigo-100 dark:border-indigo-900 rounded-full"></div>
                        <div className="absolute inset-0 border-4 border-indigo-600 dark:border-indigo-400 rounded-full border-t-transparent animate-spin"></div>
                    </div>
                    <div className="text-center">
                        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-50">Legal X-Ray in Progress</h3>
                        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Analyzing clauses, finding loopholes, and translating legalese...</p>
                        <p className="text-indigo-500 dark:text-indigo-300 text-xs mt-4 font-mono">Thinking Budget: 32k tokens utilized</p>
                    </div>
                </div>
            )}

            {result && (
                <div className="animate-fade-in space-y-4">
                     <div className="flex justify-end no-print">
                        <button 
                            onClick={handleDownloadReport}
                            disabled={isDownloading}
                            className="flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-200 bg-white dark:bg-slate-700 px-4 py-2 rounded-lg shadow-sm border border-slate-200 dark:border-slate-600 transition-colors"
                        >
                            {isDownloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                            {isDownloading ? 'Downloading...' : 'Download Report PDF'}
                        </button>
                    </div>

                    <div ref={resultsRef} className="space-y-4 p-4 bg-white dark:bg-slate-800 rounded-xl transition-colors duration-300">
                        {/* Title for PDF only usually, but fine here */}
                        <div className="mb-6 border-b pb-4 border-slate-200 dark:border-slate-700">
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50">Legal X-Ray Report</h2>
                            <p className="text-slate-500 dark:text-slate-400 text-sm">Generated by Lexi AI on {new Date().toLocaleDateString()}</p>
                        </div>

                        {/* Summary Card */}
                        <div className="bg-white dark:bg-slate-700 p-6 rounded-2xl shadow-md border border-slate-100 dark:border-slate-600 transition-colors duration-300">
                            <div className="flex justify-between items-start mb-4">
                                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Plain English Summary</h3>
                            </div>
                            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{result.summary}</p>
                        </div>

                        {/* Risk Assessment */}
                        <div className={`p-6 rounded-2xl border shadow-sm ${getRiskColor(result.riskLevel)}`}>
                            <div className="flex items-center gap-3 mb-3">
                                <ShieldAlert className="w-6 h-6" />
                                <h3 className="text-lg font-bold">Risk Level: {result.riskLevel}</h3>
                            </div>
                            <ul className="list-disc ml-5 space-y-1 opacity-90">
                                {result.risks.map((risk, i) => (
                                    <li key={i}>{risk}</li>
                                ))}
                            </ul>
                        </div>

                        {/* Translation */}
                        <div className="bg-indigo-50 dark:bg-indigo-950 p-6 rounded-2xl border border-indigo-100 dark:border-indigo-800">
                            <h3 className="text-sm font-bold uppercase tracking-wide text-indigo-800 dark:text-indigo-200 mb-2">Translation of hardest clause</h3>
                            <p className="text-indigo-900 dark:text-indigo-100 italic font-serif">"{result.plainEnglishTranslation}"</p>
                        </div>

                        {/* Hidden Clauses */}
                        {result.hiddenClauses.length > 0 && (
                            <div className="bg-amber-50 dark:bg-amber-950 p-6 rounded-2xl border border-amber-100 dark:border-amber-800">
                                <h3 className="text-sm font-bold uppercase tracking-wide text-amber-800 dark:text-amber-200 mb-3 flex items-center gap-2">
                                    <AlertTriangle className="w-4 h-4" /> Hidden Clauses Found
                                </h3>
                                <ul className="space-y-2">
                                    {result.hiddenClauses.map((clause, i) => (
                                        <li key={i} className="flex items-start gap-2 text-amber-900 dark:text-amber-100 text-sm">
                                            <span className="mt-1 block min-w-[6px] min-h-[6px] rounded-full bg-amber-500"></span>
                                            {clause}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                        
                        <div className="mt-8 pt-4 border-t border-slate-200 dark:border-slate-700 text-xs text-slate-400 dark:text-slate-500 text-center">
                            <p>Disclaimer: This analysis is generated by AI and does not constitute professional legal advice.</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default DocumentAnalyzer;