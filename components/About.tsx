import React from 'react';
import { ArrowLeft, Shield, Zap, FileText, BrainCircuit, Lock, Scale } from 'lucide-react';

interface Props {
  onBack: () => void;
}

const About: React.FC<Props> = ({ onBack }) => {
  return (
    <div className="max-w-4xl mx-auto py-8 animate-fade-in">
      <button onClick={onBack} className="flex items-center text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-50 mb-8 transition-colors">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
      </button>

      <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl overflow-hidden border border-slate-100 dark:border-slate-700 transition-colors duration-300">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-12 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -mr-12 -mt-12"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm">
                    <Scale className="w-10 h-10 text-blue-300" />
                </div>
                <h1 className="text-4xl font-bold font-serif">About Lexi</h1>
            </div>
            <p className="text-xl text-blue-100 max-w-2xl leading-relaxed">
              Bridging the gap between complex legal systems and everyday people using advanced Artificial Intelligence.
            </p>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-8 sm:p-12 space-y-12 text-slate-700 dark:text-slate-300 leading-relaxed">
          
          {/* Mission */}
          <section>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50 mb-4 flex items-center gap-3">
              <Shield className="text-blue-600" /> Our Mission
            </h2>
            <p className="mb-4">
              Access to legal protection is a fundamental right, yet for millions of people, the legal system remains opaque, expensive, and intimidating. <strong>Lexi</strong> was built to democratize this access. 
            </p>
            <p>
              We believe that understanding a contract shouldn't require a law degree, and protecting your interests shouldn't cost a fortune. Lexi serves as an "AI Legal Guardian," empowering freelancers, tenants, small business owners, and everyday individuals to navigate legal documents with confidence and clarity.
            </p>
          </section>

          <hr className="border-slate-100 dark:border-slate-700" />

          {/* The Problem */}
          <section>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50 mb-4">The Problem We Solve</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-slate-50 dark:bg-slate-700 p-6 rounded-xl border border-slate-100 dark:border-slate-600">
                <h3 className="font-bold text-lg mb-2 text-slate-800 dark:text-slate-100">The "Legalese" Barrier</h3>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  Legal documents are often written in archaic, complex language designed to be precise but resulting in confusion for the layperson. This leads to people signing agreements they don't fully understand, exposing them to hidden risks.
                </p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-700 p-6 rounded-xl border border-slate-100 dark:border-slate-600">
                <h3 className="font-bold text-lg mb-2 text-slate-800 dark:text-slate-100">High Costs & Inaccessibility</h3>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  Hiring a lawyer to draft a simple lease or review an NDA can cost hundreds or thousands of dollars. As a result, many transactions go undocumented, or people rely on generic, ill-fitting templates found online.
                </p>
              </div>
            </div>
          </section>

          <hr className="border-slate-100 dark:border-slate-700" />

          {/* How It Works */}
          <section>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50 mb-6 flex items-center gap-3">
              <Zap className="text-amber-500 w-6 h-6" /> How Lexi Works
            </h2>
            
            <div className="space-y-8">
              <div className="flex gap-4">
                <div className="shrink-0 mt-1">
                  <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center text-indigo-600 dark:text-indigo-200 font-bold">1</div>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-slate-50 mb-2">Smart Document Generation</h3>
                  <p>
                    Lexi doesn't just fill in blanks on a PDF. It acts as an intelligent drafter. By asking you for specific key details—like names, dates, amounts, and specific clauses—it uses <strong>Generative AI</strong> to construct a professional, legally robust document formatted in Markdown. It understands context, ensuring that a "Residential Lease" looks and feels different from a "Corporate Bylaw."
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="shrink-0 mt-1">
                  <div className="w-10 h-10 bg-teal-100 dark:bg-teal-900 rounded-full flex items-center justify-center text-teal-600 dark:text-teal-200 font-bold">2</div>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-slate-50 mb-2">Legal X-Ray (Analysis)</h3>
                  <p>
                    Upload a photo or PDF of any contract, and Lexi's vision capabilities kick in. It reads the document, analyzing every clause. It then produces a "Risk Report" that includes:
                  </p>
                  <ul className="list-disc ml-4 mt-2 space-y-1 text-slate-600 dark:text-slate-300">
                    <li><strong>Plain English Summary:</strong> A simple explanation of what the document actually says.</li>
                    <li><strong>Risk Level Assessment:</strong> Categorizing the document as Low, Medium, or High risk.</li>
                    <li><strong>Hidden Clause Detection:</strong> Spotting aggressive terms buried in the fine print (e.g., binding arbitration, automatic renewals).</li>
                    <li><strong>Translation:</strong> Converting specific complex paragraphs into simple language.</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          <hr className="border-slate-100 dark:border-slate-700" />

          {/* Technology */}
          <section>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50 mb-4 flex items-center gap-3">
              <BrainCircuit className="text-violet-600" /> Under the Hood
            </h2>
            <p className="mb-4">
              Lexi is powered by Google's state-of-the-art <strong>Gemini</strong> models.
            </p>
            <ul className="grid sm:grid-cols-2 gap-4">
                <li className="flex items-start gap-3">
                    <div className="w-2 h-2 mt-2 rounded-full bg-violet-500 shrink-0"></div>
                    <div>
                        <strong className="block text-slate-900 dark:text-slate-50">Gemini 3.0 Pro</strong>
                        <span className="text-sm">Used for complex legal reasoning, drafting documents, and deep analysis ("Thinking Mode").</span>
                    </div>
                </li>
                <li className="flex items-start gap-3">
                    <div className="w-2 h-2 mt-2 rounded-full bg-violet-500 shrink-0"></div>
                    <div>
                        <strong className="block text-slate-900 dark:text-slate-50">Gemini 2.5 Flash</strong>
                        <span className="text-sm">Powering fast, real-time tasks like audio transcription and quick summaries.</span>
                    </div>
                </li>
            </ul>
          </section>

          <hr className="border-slate-100 dark:border-slate-700" />

           {/* Disclaimer */}
           <section className="bg-slate-50 dark:bg-slate-700 p-6 rounded-xl border border-slate-200 dark:border-slate-600">
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-50 mb-2 flex items-center gap-2">
              <Lock className="text-slate-500 dark:text-slate-400" /> Important Disclaimer
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Lexi is an Artificial Intelligence tool designed for informational and educational purposes. While we strive for accuracy, <strong>Lexi is not a lawyer and does not provide legal advice.</strong> Laws vary significantly by jurisdiction (state, country, or region). We strongly recommend having any critical legal documents reviewed by a qualified attorney in your area before signing.
            </p>
          </section>

        </div>
      </div>
    </div>
  );
};

export default About;