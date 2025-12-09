import React, { useState } from 'react';
import { AppView, DocumentCategory, DocumentTemplate } from '../types';
import { 
  FileText, Home, Briefcase, FileSignature, 
  ShieldCheck, ScrollText, Users, Building2, 
  Scale, FileWarning, Search 
} from 'lucide-react';

const DOC_TEMPLATES: DocumentTemplate[] = [
  { id: '1', name: DocumentCategory.RESIDENTIAL_LEASE, description: "For renting out a house or apartment.", icon: 'Home', requiredFields: ['Landlord', 'Tenant', 'Rent', 'Term'] },
  { id: '2', name: DocumentCategory.COMMERCIAL_LEASE, description: "Leasing office or retail space.", icon: 'Building2', requiredFields: ['Lessor', 'Lessee', 'Premises'] },
  { id: '3', name: DocumentCategory.SERVICE_AGREEMENT, description: "Hiring a freelancer or agency.", icon: 'Briefcase', requiredFields: ['Client', 'Provider', 'Services'] },
  { id: '4', name: DocumentCategory.CONSULTING_AGREEMENT, description: "Professional advice services.", icon: 'Users', requiredFields: ['Consultant', 'Company', 'Scope'] },
  { id: '5', name: DocumentCategory.NDA, description: "Protect confidential information.", icon: 'ShieldCheck', requiredFields: ['Disclosing Party', 'Receiving Party'] },
  { id: '6', name: DocumentCategory.SALES_CONTRACT, description: "Selling goods or high-value items.", icon: 'ScrollText', requiredFields: ['Buyer', 'Seller', 'Item'] },
  { id: '7', name: DocumentCategory.EMPLOYMENT_AGREEMENT, description: "Hiring a new employee.", icon: 'Users', requiredFields: ['Employer', 'Employee', 'Role'] },
  { id: '8', name: DocumentCategory.SUBLEASE, description: "Renting your rented space to others.", icon: 'Home', requiredFields: ['Sublessor', 'Sublessee'] },
  { id: '9', name: DocumentCategory.CORPORATE, description: "Operating agreements, bylaws.", icon: 'Building2', requiredFields: ['Company', 'Members'] },
  { id: '10', name: DocumentCategory.POLICY, description: "Privacy policy, Terms of use.", icon: 'FileWarning', requiredFields: ['Company Name'] },
  { id: '11', name: DocumentCategory.FORM, description: "Eviction notice, demand letter.", icon: 'FileText', requiredFields: ['Recipient', 'Sender'] },
];

interface Props {
  onSelectTemplate: (template: DocumentTemplate) => void;
  onAnalyze: () => void;
}

const Dashboard: React.FC<Props> = ({ onSelectTemplate, onAnalyze }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const getIcon = (name: string) => {
    switch (name) {
      case 'Home': return <Home className="w-6 h-6" />;
      case 'Briefcase': return <Briefcase className="w-6 h-6" />;
      case 'Building2': return <Building2 className="w-6 h-6" />;
      case 'ShieldCheck': return <ShieldCheck className="w-6 h-6" />;
      case 'ScrollText': return <ScrollText className="w-6 h-6" />;
      case 'Users': return <Users className="w-6 h-6" />;
      case 'FileWarning': return <FileWarning className="w-6 h-6" />;
      default: return <FileText className="w-6 h-6" />;
    }
  };

  const filteredTemplates = DOC_TEMPLATES.filter(template => 
    template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    template.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto py-8">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-900 rounded-3xl p-8 sm:p-12 mb-12 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
        <div className="relative z-10 max-w-2xl">
            <h1 className="text-4xl sm:text-5xl font-bold mb-4 font-serif">Legal help for <br/>everyday people.</h1>
            <p className="text-blue-100 text-lg mb-8">
                Create rock-solid contracts or analyze existing ones instantly with AI. 
                No jargon, no expensive fees.
            </p>
            <button 
                onClick={onAnalyze}
                className="bg-white text-blue-900 px-8 py-4 rounded-xl font-bold text-lg hover:bg-blue-50 transition-colors shadow-lg flex items-center gap-3"
            >
                <Search className="w-5 h-5" />
                Analyze a Document (X-Ray)
            </button>
        </div>
      </div>

      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-50 flex items-center gap-2">
                <FileSignature className="text-blue-600" />
                Create a Document
            </h2>
            
            <div className="relative w-full md:w-80">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-slate-400 dark:text-slate-500" />
                </div>
                <input
                    type="text"
                    className="block w-full pl-10 pr-3 py-3 border border-slate-200 dark:border-slate-600 rounded-xl leading-5 bg-white dark:bg-slate-700 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:placeholder-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm shadow-sm transition-all text-slate-900 dark:text-slate-50"
                    placeholder="Search templates (e.g. Lease, NDA)..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
        </div>

        {filteredTemplates.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredTemplates.map((template) => (
                <button
                    key={template.id}
                    onClick={() => onSelectTemplate(template)}
                    className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-md hover:border-blue-300 dark:hover:border-blue-500 transition-all text-left group"
                >
                    <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                        {getIcon(template.icon)}
                    </div>
                    <h3 className="font-bold text-slate-800 dark:text-slate-50 text-lg mb-2">{template.name}</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{template.description}</p>
                </button>
                ))}
            </div>
        ) : (
            <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-2xl border border-dashed border-slate-300 dark:border-slate-600">
                <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search className="w-8 h-8 text-slate-400 dark:text-slate-500" />
                </div>
                <h3 className="text-lg font-medium text-slate-900 dark:text-slate-50">No documents found</h3>
                <p className="text-slate-500 dark:text-slate-400 mt-1">Try adjusting your search for "{searchTerm}"</p>
            </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;