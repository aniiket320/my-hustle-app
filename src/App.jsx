import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  CheckCircle, 
  BookOpen, 
  Calendar, 
  BarChart3, 
  AlertCircle, 
  ChevronDown, 
  ChevronRight, 
  TrendingUp,
  Clock,
  RefreshCw,
  X,
  FileText,
  Plus,
  Trash2,
  Edit2,
  Save,
  Link as LinkIcon,
  File,
  GraduationCap,
  UploadCloud,
  MoreVertical,
  Paperclip,
  Image as ImageIcon,
  FileDigit,
  Music,
  Download,
  Eye,
  MinusCircle,
  AlertTriangle,
  Sun,
  Moon,
  Flame,
  Trophy,
  Upload,
  DownloadCloud,
  Play,
  Pause
} from 'lucide-react';

// --- IndexedDB Helper for Real File Storage ---
const DB_NAME = 'CA_Tracker_DB';
const STORE_NAME = 'files';

const initDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

const saveFileToDB = async (id, file) => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const request = store.put(file, id);
    request.onsuccess = () => resolve(true);
    request.onerror = () => reject(request.error);
  });
};

const getFileFromDB = async (id) => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const request = store.get(id);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

const deleteFileFromDB = async (id) => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const request = store.delete(id);
    request.onsuccess = () => resolve(true);
    request.onerror = () => reject(request.error);
  });
};

// --- Constants ---
const SUBJECT_COLORS = [
  'from-blue-500 to-cyan-500',
  'from-purple-500 to-pink-500',
  'from-emerald-500 to-teal-500',
  'from-orange-500 to-amber-500',
  'from-indigo-500 to-blue-600',
  'from-rose-500 to-red-500',
  'from-violet-600 to-indigo-600',
  'from-fuchsia-500 to-pink-600',
  'from-cyan-500 to-blue-600',
  'from-teal-400 to-emerald-600',
  'from-lime-500 to-green-600',
  'from-pink-500 to-rose-500'
];

const DEFAULT_SYLLABUS = [
  {
    id: 'p1',
    name: 'Advanced Accounting',
    color: 'from-blue-500 to-cyan-500',
    chapters: [
      'Introduction to Accounting Standards',
      'Financial Statements of Companies',
      'Buyback of Securities',
      'Amalgamation of Companies',
      'Accounting for Reconstruction',
      'Branch Accounting',
      'Consolidated Financial Statements'
    ],
    resources: [],
    tests: []
  },
  {
    id: 'p2',
    name: 'Corporate & Other Laws',
    color: 'from-purple-500 to-pink-500',
    chapters: [
      'Preliminary & Incorporation of Company',
      'Prospectus and Allotment of Securities',
      'Share Capital and Debentures',
      'Management & Administration',
      'The Indian Contract Act, 1872',
      'The Negotiable Instruments Act, 1881',
      'Interpretation of Statutes',
      'Foreign Exchange Management Act'
    ],
    resources: [],
    tests: []
  },
  {
    id: 'p3a',
    name: 'Direct Taxation',
    color: 'from-emerald-500 to-teal-500',
    chapters: [
      'Basic Concepts & Residence',
      'Salaries',
      'Income from House Property',
      'Profits and Gains of Business or Profession',
      'Capital Gains',
      'Income from Other Sources',
      'Clubbing & Set Off',
      'Deductions from Gross Total Income',
      'TDS & TCS',
      'Filing of Return'
    ],
    resources: [],
    tests: []
  },
  {
    id: 'p3b',
    name: 'Indirect Taxation (GST)',
    color: 'from-orange-500 to-amber-500',
    chapters: [
      'GST in India - An Introduction',
      'Supply under GST',
      'Charge of GST',
      'Exemptions from GST',
      'Time and Value of Supply',
      'Input Tax Credit',
      'Registration',
      'Tax Invoice: Credit and Debit Notes',
      'Payment of Tax',
      'Returns'
    ],
    resources: [],
    tests: []
  },
  {
    id: 'p4',
    name: 'Cost & Management Accounting',
    color: 'from-indigo-500 to-blue-600',
    chapters: [
      'Material Cost',
      'Employee Cost',
      'Overheads: Absorption Costing',
      'Activity Based Costing',
      'Cost Sheet',
      'Cost Accounting Systems',
      'Marginal Costing',
      'Standard Costing',
      'Budget & Budgetary Control'
    ],
    resources: [],
    tests: []
  },
  {
    id: 'p5',
    name: 'Auditing & Ethics',
    color: 'from-rose-500 to-red-500',
    chapters: [
      'Nature, Objective and Scope of Audit',
      'Audit Strategy, Planning and Programme',
      'Risk Assessment and Internal Control',
      'Audit Evidence',
      'Audit of Items of Financial Statements',
      'Audit Report',
      'Bank Audit',
      'Ethics and Terms of Audit Engagements'
    ],
    resources: [],
    tests: []
  },
  {
    id: 'p6',
    name: 'Financial Mgmt & Strategic Mgmt',
    color: 'from-violet-600 to-indigo-600',
    chapters: [
      'FM: Ratio Analysis',
      'FM: Cost of Capital',
      'FM: Capital Structure',
      'FM: Leverage',
      'FM: Capital Budgeting',
      'SM: Introduction to Strategic Management',
      'SM: Strategic Analysis',
      'SM: Strategy Implementation and Control'
    ],
    resources: [],
    tests: []
  }
];

const SRS_INTERVALS = [1, 3, 7, 15, 30, 60];

// --- Helpers ---
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
};

const getDaysDifference = (dateString) => {
  if (!dateString) return Infinity;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(dateString);
  target.setHours(0, 0, 0, 0);
  const diffTime = target - today;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

const generateId = () => Math.random().toString(36).substr(2, 9);

const formatBytes = (bytes, decimals = 2) => {
  if (!+bytes) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
};

// --- Sub-Components ---

const DashboardCard = ({ title, value, subtitle, gradient, icon: Icon }) => (
  <div className="relative overflow-hidden bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl p-6 rounded-2xl border border-white/40 dark:border-slate-700/50 shadow-xl hover:shadow-2xl transition-all duration-300 group">
    <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${gradient} opacity-10 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110`}></div>
    <div className="relative z-10 flex items-start justify-between">
      <div>
        <p className="text-slate-500 dark:text-slate-400 text-sm font-bold tracking-wider uppercase mb-1">{title}</p>
        <h3 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100">{value}</h3>
        {subtitle && <p className="text-xs mt-2 font-medium text-slate-600 dark:text-slate-300 bg-white/50 dark:bg-slate-800/50 inline-block px-2 py-1 rounded-lg">{subtitle}</p>}
      </div>
      <div className={`p-3.5 rounded-xl bg-gradient-to-br ${gradient} text-white shadow-lg transform group-hover:rotate-12 transition-transform`}>
        <Icon className="w-6 h-6" />
      </div>
    </div>
  </div>
);

const EditableText = ({ text, onSave, isEditing, className = "" }) => {
  const [value, setValue] = useState(text);
  useEffect(() => setValue(text), [text]);

  if (!isEditing) return <span className={className}>{text}</span>;

  return (
    <input
      type="text"
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onBlur={() => onSave(value)}
      onKeyDown={(e) => e.key === 'Enter' && onSave(value)}
      onClick={(e) => e.stopPropagation()}
      className={`border-b-2 border-purple-500 focus:outline-none bg-white/50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 px-2 py-1 rounded max-w-[80%] ${className}`}
      autoFocus
    />
  );
};

// --- Resource Manager Component ---
const ResourceManager = ({ resources, onAdd, onDelete }) => {
  const [newRes, setNewRes] = useState({ name: '', url: '' });
  const fileInputRef = useRef(null);

  const handleAddLink = () => {
    if (newRes.name.trim()) {
      onAdd({ ...newRes, id: generateId(), type: 'link', date: new Date().toISOString() });
      setNewRes({ name: '', url: '' });
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const id = generateId();
      try {
        await saveFileToDB(id, file);
        onAdd({
          id: id,
          name: file.name,
          type: 'file',
          size: file.size,
          fileType: file.type,
          date: new Date().toISOString()
        });
      } catch (err) {
        console.error("Failed to save file", err);
        alert("Failed to save file. Please try again.");
      }
    }
    e.target.value = null;
  };

  const handleOpenFile = async (res) => {
    if (res.type === 'link') {
      window.open(res.url, '_blank');
    } else if (res.type === 'file') {
      try {
        const fileBlob = await getFileFromDB(res.id);
        if (fileBlob) {
          const url = URL.createObjectURL(fileBlob);
          const link = document.createElement('a');
          link.href = url;
          if (res.fileType.includes('pdf') || res.fileType.includes('image')) {
             window.open(url, '_blank');
          } else {
             link.download = res.name;
             document.body.appendChild(link);
             link.click();
             document.body.removeChild(link);
          }
          setTimeout(() => URL.revokeObjectURL(url), 1000);
        } else {
          alert("File not found. It may have been cleared from browser storage.");
        }
      } catch (err) {
        console.error(err);
        alert("Error opening file.");
      }
    }
  };

  return (
    <div className="space-y-4 p-2 animate-fade-in">
      <div className="flex items-center justify-between">
         <h4 className="font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2">
            <BookOpen size={18} className="text-purple-600 dark:text-purple-400" /> Study Material
         </h4>
         <button 
            onClick={() => fileInputRef.current?.click()}
            className="text-xs flex items-center gap-1 bg-slate-800 dark:bg-slate-700 text-white px-3 py-1.5 rounded-lg hover:bg-slate-700 dark:hover:bg-slate-600 transition-colors shadow-md"
         >
            <UploadCloud size={14} /> Upload File
         </button>
         <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileUpload} />
      </div>
      
      <div className="grid grid-cols-1 gap-2">
        {resources && resources.map(res => (
          <div 
            key={res.id} 
            className="flex items-center justify-between p-3 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-xl border border-white/60 dark:border-slate-700 shadow-sm hover:shadow-md transition-all group cursor-pointer"
            onClick={() => handleOpenFile(res)}
          >
            <div className="flex items-center gap-3 overflow-hidden">
               <div className={`p-2.5 rounded-lg shrink-0 ${res.type === 'file' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400' : 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'}`}>
                 {res.type === 'file' ? <Paperclip size={18} /> : <LinkIcon size={18} />}
               </div>
               <div className="truncate min-w-0">
                 <div className="font-bold text-slate-800 dark:text-slate-200 truncate text-sm hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">{res.name}</div>
                 <div className="flex items-center gap-2 text-[10px] text-slate-500 dark:text-slate-400">
                    <span>{formatDate(res.date)}</span>
                    {res.size && <span>• {formatBytes(res.size)}</span>}
                    {res.url && <span className="truncate max-w-[150px]">{res.url}</span>}
                 </div>
               </div>
            </div>
            <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
               <button onClick={(e) => { e.stopPropagation(); handleOpenFile(res); }} className="p-2 text-slate-400 hover:text-indigo-600 dark:text-slate-500 dark:hover:text-indigo-400 opacity-0 group-hover:opacity-100 transition-all">
                  {res.type === 'file' ? <Download size={16} /> : <Eye size={16} />}
               </button>
               <button 
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    // Direct delete for smooth UX
                    onDelete(res.id);
                  }} 
                  className="p-2 text-slate-400 hover:text-red-500 dark:text-slate-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg opacity-0 group-hover:opacity-100 transition-all z-50"
                  title="Remove"
               >
                 <X size={16} />
               </button>
            </div>
          </div>
        ))}
        {(!resources || resources.length === 0) && (
            <div className="text-center py-8 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl">
                <div className="inline-flex p-3 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-400 mb-2"><UploadCloud size={24} /></div>
                <p className="text-sm text-slate-500 dark:text-slate-400">No files or links yet.</p>
            </div>
        )}
      </div>

      <div className="flex gap-2 items-end pt-4 border-t border-slate-200/50 dark:border-slate-700/50">
        <div className="flex-1 space-y-2">
          <input 
            type="text" 
            placeholder="Link Title (e.g. YouTube Lecture)" 
            className="w-full p-2.5 text-sm bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none transition-all text-slate-800 dark:text-slate-200 placeholder-slate-400"
            value={newRes.name}
            onChange={e => setNewRes({...newRes, name: e.target.value})}
          />
          <input 
            type="text" 
            placeholder="https://..." 
            className="w-full p-2.5 text-sm bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none transition-all text-slate-800 dark:text-slate-200 placeholder-slate-400"
            value={newRes.url}
            onChange={e => setNewRes({...newRes, url: e.target.value})}
          />
        </div>
        <button 
          onClick={handleAddLink}
          className="p-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors h-[42px] w-[42px] flex items-center justify-center shadow-lg shadow-purple-200 dark:shadow-none"
        >
          <Plus size={20} />
        </button>
      </div>
    </div>
  );
};

// --- Test Manager Component ---
const TestManager = ({ tests, onAdd, onDelete, onUpdate }) => {
  const [newTest, setNewTest] = useState({ name: '', date: '', marks: '' });
  const fileInputRef = useRef(null);

  const handleAdd = () => {
    if (newTest.name.trim()) {
      onAdd({ ...newTest, id: generateId(), status: 'Pending', type: 'manual' });
      setNewTest({ name: '', date: '', marks: '' });
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const id = generateId();
      try {
        await saveFileToDB(id, file);
        onAdd({
          id: id,
          name: file.name, 
          status: 'Pending',
          type: 'file',
          size: file.size,
          fileType: file.type,
          date: new Date().toISOString()
        });
      } catch (err) {
        console.error(err);
        alert("Failed to save test paper.");
      }
    }
    e.target.value = null;
  };

  const handleViewTest = async (test) => {
    if (test.type !== 'file') return;
    try {
      const fileBlob = await getFileFromDB(test.id);
      if (fileBlob) {
        const url = URL.createObjectURL(fileBlob);
        const link = document.createElement('a');
        link.href = url;
        if (test.fileType?.includes('pdf') || test.fileType?.includes('image')) {
           window.open(url, '_blank');
        } else {
           link.download = test.name;
           document.body.appendChild(link);
           link.click();
           document.body.removeChild(link);
        }
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      } else {
        alert("File not found locally.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-4 p-2 animate-fade-in">
      <div className="flex items-center justify-between">
        <h4 className="font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2">
            <GraduationCap size={18} className="text-pink-600 dark:text-pink-400" /> Test Papers
        </h4>
        <button 
            onClick={() => fileInputRef.current?.click()}
            className="text-xs flex items-center gap-1 bg-slate-800 dark:bg-slate-700 text-white px-3 py-1.5 rounded-lg hover:bg-slate-700 dark:hover:bg-slate-600 transition-colors shadow-md"
         >
            <UploadCloud size={14} /> Upload Paper
         </button>
         <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileUpload} />
      </div>

      <div className="space-y-2">
        {tests && tests.map(test => (
          <div key={test.id} className="flex items-center justify-between p-3 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-xl border border-white/60 dark:border-slate-700 shadow-sm hover:shadow-md transition-all group">
            <div className="flex items-center gap-3">
               <div 
                 onClick={(e) => {
                   e.stopPropagation();
                   onUpdate(test.id, { status: test.status === 'Done' ? 'Pending' : 'Done' });
                 }}
                 className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center cursor-pointer transition-colors ${test.status === 'Done' ? 'bg-green-500 border-green-500 text-white' : 'border-slate-300 dark:border-slate-600 text-transparent hover:border-green-400'}`}
               >
                 <CheckCircle size={14} />
               </div>
               
               <div 
                 className={`${test.type === 'file' ? 'cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400' : ''}`}
                 onClick={() => handleViewTest(test)}
               >
                 <div className="flex items-center gap-2">
                    <p className={`font-bold text-sm ${test.status === 'Done' ? 'text-slate-400 dark:text-slate-500 line-through' : 'text-slate-800 dark:text-slate-200'}`}>{test.name}</p>
                    {test.type === 'file' && <span className="bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-300 text-[10px] px-1 rounded border border-slate-200 dark:border-slate-600">File</span>}
                 </div>
                 <div className="flex gap-3 text-[10px] font-medium text-slate-500 dark:text-slate-400 mt-0.5">
                   {test.date && <span className="flex items-center gap-1"><Calendar size={10} /> {formatDate(test.date)}</span>}
                   {test.marks && <span className="flex items-center gap-1"><BarChart3 size={10} /> {test.marks} Marks</span>}
                 </div>
               </div>
            </div>
            
            <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
               {test.type === 'file' && (
                   <button onClick={(e) => { e.stopPropagation(); handleViewTest(test); }} className="p-2 text-slate-400 hover:text-indigo-600 dark:text-slate-500 dark:hover:text-indigo-400 opacity-0 group-hover:opacity-100 transition-all">
                     <Download size={16} />
                   </button>
               )}
               <button 
                   onClick={(e) => {
                     e.preventDefault();
                     e.stopPropagation();
                     // Direct delete
                     onDelete(test.id);
                   }} 
                   className="p-2 text-slate-400 hover:text-red-500 dark:text-slate-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg opacity-0 group-hover:opacity-100 transition-all z-50"
                   title="Remove"
               >
                 <X size={16} />
               </button>
            </div>
          </div>
        ))}
        {(!tests || tests.length === 0) && (
             <div className="text-center py-8 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl">
                <div className="inline-flex p-3 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-400 mb-2"><GraduationCap size={24} /></div>
                <p className="text-sm text-slate-500 dark:text-slate-400">No tests added.</p>
            </div>
        )}
      </div>

      <div className="flex flex-wrap gap-2 items-end pt-4 border-t border-slate-200/50 dark:border-slate-700/50">
        <input 
          type="text" 
          placeholder="Manual Test Name" 
          className="flex-1 min-w-[150px] p-2.5 text-sm bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-pink-500 transition-all text-slate-800 dark:text-slate-200 placeholder-slate-400"
          value={newTest.name}
          onChange={e => setNewTest({...newTest, name: e.target.value})}
        />
        <input 
          type="date" 
          className="w-[130px] p-2.5 text-sm bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-pink-500 transition-all text-slate-800 dark:text-slate-200"
          value={newTest.date}
          onChange={e => setNewTest({...newTest, date: e.target.value})}
        />
        <input 
          type="text" 
          placeholder="Marks" 
          className="w-[80px] p-2.5 text-sm bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-pink-500 transition-all text-slate-800 dark:text-slate-200 placeholder-slate-400"
          value={newTest.marks}
          onChange={e => setNewTest({...newTest, marks: e.target.value})}
        />
        <button 
          onClick={handleAdd}
          className="p-2 bg-pink-600 text-white rounded-xl hover:bg-pink-700 transition-colors h-[42px] w-[42px] flex items-center justify-center shadow-lg shadow-pink-200 dark:shadow-none"
        >
          <Plus size={20} />
        </button>
      </div>
    </div>
  );
};


// --- Subject Component ---
const SubjectSection = ({ 
  subject, 
  progress, 
  onToggleChapter, 
  onReviewChapter, 
  isOpen, 
  onToggleOpen, 
  isEditMode,
  onUpdateSubject,
  onUpdateProgressDate
}) => {
  const [activeTab, setActiveTab] = useState('chapters'); // chapters, resources, tests
  const [newChapterName, setNewChapterName] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false); // Local state for confirmation

  const completedCount = subject.chapters.filter(ch => progress[subject.id + ch]?.status).length;
  const percentage = subject.chapters.length > 0 ? Math.round((completedCount / subject.chapters.length) * 100) : 0;

  // --- FIX: Safe Toggle Handler ---
  const handleSafeToggle = (e) => {
    // Prevents the accordion from toggling if the user clicked on an input, button, or SVG icon inside a button
    if (e.target.closest('input') || e.target.closest('button')) {
      return;
    }
    onToggleOpen();
  };

  // Subject Management Handlers
  const handleRenameSubject = (newName) => onUpdateSubject(subject.id, { ...subject, name: newName });
  
  const handleDeleteSubject = (e) => {
    e.preventDefault();
    e.stopPropagation(); // Strictly prevent bubble up
    
    // REPLACED window.confirm with Inline Confirmation
    if (showDeleteConfirm) {
      onUpdateSubject(subject.id, null);
    } else {
      setShowDeleteConfirm(true);
      // Auto-reset after 3 seconds so it doesn't get stuck
      setTimeout(() => setShowDeleteConfirm(false), 3000);
    }
  };

  // Chapter Management Handlers
  const handleAddChapter = () => {
    if (newChapterName.trim()) {
      onUpdateSubject(subject.id, { ...subject, chapters: [...subject.chapters, newChapterName.trim()] });
      setNewChapterName("");
    }
  };
  const handleRenameChapter = (oldName, newName) => {
    const newChapters = subject.chapters.map(c => c === oldName ? newName : c);
    onUpdateSubject(subject.id, { ...subject, chapters: newChapters });
  };
  
  const handleDeleteChapter = (e, index) => {
    e.preventDefault();
    e.stopPropagation(); // Strictly prevent bubble up
    // Removed confirm dialog to prevent blocking issues - direct delete
    const newChapters = [...subject.chapters];
    newChapters.splice(index, 1); // Remove exactly 1 item at the specific index
    onUpdateSubject(subject.id, { ...subject, chapters: newChapters });
  };

  // Resource & Test Handlers
  const handleAddResource = (res) => onUpdateSubject(subject.id, { ...subject, resources: [...(subject.resources || []), res] });
  const handleDeleteResource = async (resId) => {
      try { await deleteFileFromDB(resId); } catch(e) { console.log('File not in DB or already deleted'); }
      onUpdateSubject(subject.id, { ...subject, resources: (subject.resources || []).filter(r => r.id !== resId) });
  };
  
  const handleAddTest = (test) => onUpdateSubject(subject.id, { ...subject, tests: [...(subject.tests || []), test] });
  const handleDeleteTest = async (testId) => {
    try { await deleteFileFromDB(testId); } catch(e) { console.log('File not in DB or already deleted'); }
    onUpdateSubject(subject.id, { ...subject, tests: (subject.tests || []).filter(t => t.id !== testId) });
  };
  const handleUpdateTest = (testId, updates) => {
    const newTests = (subject.tests || []).map(t => t.id === testId ? { ...t, ...updates } : t);
    onUpdateSubject(subject.id, { ...subject, tests: newTests });
  };

  return (
    <div className="relative bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-2xl shadow-lg shadow-slate-200/50 dark:shadow-slate-900/50 border border-white/60 dark:border-slate-700/60 overflow-hidden mb-6 transition-all hover:shadow-xl">
      {/* Subject Header */}
      <div 
        className="p-5 cursor-pointer flex items-center justify-between hover:bg-white/40 dark:hover:bg-slate-700/40 transition-colors group select-none"
        onClick={handleSafeToggle}
      >
        <div className="flex items-center gap-5 flex-1">
          <div className={`p-3 rounded-xl bg-gradient-to-br ${subject.color || 'from-slate-500 to-slate-700'} text-white shadow-lg`}>
            {isOpen ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-1">
              <EditableText 
                text={subject.name} 
                isEditing={isEditMode} 
                onSave={handleRenameSubject} 
                className="font-bold text-slate-800 dark:text-slate-100 text-xl tracking-tight"
              />
              {isEditMode && (
                <div onClick={(e) => e.stopPropagation()}>
                    <button 
                      type="button"
                      onClick={handleDeleteSubject} 
                      className={`px-3 py-1 text-xs font-bold rounded-full border transition-all duration-200 z-50 relative flex items-center gap-1 ${showDeleteConfirm ? 'bg-red-600 text-white border-red-600 scale-110' : 'bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400 border-red-100 dark:border-red-800 hover:bg-red-500 hover:text-white dark:hover:bg-red-600'}`}
                      title="Delete Subject"
                    >
                      {showDeleteConfirm ? (
                        <span className="flex items-center gap-1 animate-pulse"><AlertTriangle size={12} /> Sure?</span>
                      ) : (
                        <span className="flex items-center gap-1"><X size={14} /> Remove</span>
                      )}
                    </button>
                </div>
              )}
            </div>
            <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400 font-medium">
              <span className="flex items-center gap-1.5">
                <FileDigit size={14} className="text-slate-400 dark:text-slate-500" />
                {completedCount} / {subject.chapters.length} Chapters
              </span>
              <span className="w-1 h-1 bg-slate-300 dark:bg-slate-600 rounded-full"></span>
              <span className="text-slate-600 dark:text-slate-300">{percentage}% Done</span>
            </div>
          </div>
        </div>
        <div className="w-32 hidden sm:block">
           <div className="w-full bg-slate-200/70 dark:bg-slate-700/70 rounded-full h-3 overflow-hidden">
            <div className={`h-full rounded-full transition-all duration-1000 ease-out bg-gradient-to-r ${subject.color || 'from-indigo-500 to-purple-500'}`} style={{ width: `${percentage}%` }}></div>
          </div>
        </div>
      </div>

      {/* Accordion Content */}
      {isOpen && (
        <div className="border-t border-slate-100 dark:border-slate-700">
          {/* Tabs */}
          <div className="flex border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50">
            {[
              { id: 'chapters', icon: FileText, label: 'Chapters', color: 'text-indigo-600 dark:text-indigo-400' },
              { id: 'resources', icon: BookOpen, label: 'Material', color: 'text-purple-600 dark:text-purple-400' },
              { id: 'tests', icon: GraduationCap, label: 'Tests', color: 'text-pink-600 dark:text-pink-400' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-3.5 text-sm font-bold flex items-center justify-center gap-2 border-b-2 transition-all ${activeTab === tab.id ? `border-${tab.color.split('-')[1]}-500 ${tab.color} bg-white dark:bg-slate-800` : 'border-transparent text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
              >
                <tab.icon size={16} />
                {tab.label}
                {tab.id === 'tests' && subject.tests?.length > 0 && <span className="bg-pink-100 dark:bg-pink-900 text-pink-700 dark:text-pink-300 text-[10px] px-1.5 py-0.5 rounded-full shadow-sm">{subject.tests.length}</span>}
                {tab.id === 'resources' && subject.resources?.length > 0 && <span className="bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 text-[10px] px-1.5 py-0.5 rounded-full shadow-sm">{subject.resources.length}</span>}
              </button>
            ))}
          </div>

          <div className="p-5 bg-white/40 dark:bg-slate-900/40">
            {/* Chapters Tab */}
            {activeTab === 'chapters' && (
              <div className="space-y-2">
                {subject.chapters.map((chapter, index) => {
                  const key = subject.id + chapter;
                  const chapterData = progress[key];
                  const isDone = !!chapterData?.status;
                  const nextRev = chapterData?.nextRevision;
                  const isDue = isDone && getDaysDifference(nextRev) <= 0;

                  // Use composite key to avoid duplicates warning
                  const uniqueKey = `${chapter}-${index}`;

                  return (
                    <div key={uniqueKey} className={`group p-3.5 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all border ${isDue ? 'bg-amber-50/80 dark:bg-amber-900/20 border-amber-100 dark:border-amber-800/50 shadow-amber-100/50' : 'bg-white/60 dark:bg-slate-800/60 border-white/60 dark:border-slate-700/60 hover:border-indigo-200 dark:hover:border-indigo-800 hover:shadow-md'}`}>
                      <div className="flex items-start gap-4 flex-1">
                        <button 
                          onClick={(e) => { e.stopPropagation(); onToggleChapter(subject.id, chapter); }}
                          className={`mt-0.5 flex-shrink-0 rounded-full p-1 transition-all duration-300 ${isDone ? 'bg-gradient-to-r from-emerald-400 to-emerald-600 text-white shadow-md shadow-emerald-200 dark:shadow-none' : 'bg-slate-100 dark:bg-slate-700 text-slate-300 dark:text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-600'}`}
                        >
                          <CheckCircle size={18} />
                        </button>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <EditableText 
                              text={chapter} 
                              isEditing={isEditMode} 
                              onSave={(newName) => handleRenameChapter(chapter, newName)}
                              className={`text-sm font-semibold truncate transition-colors ${isDone ? 'text-slate-500 dark:text-slate-500' : 'text-slate-800 dark:text-slate-200'}`}
                            />
                             {isEditMode && (
                              <div onClick={(e) => e.stopPropagation()}>
                                  <button 
                                    type="button"
                                    onClick={(e) => handleDeleteChapter(e, index)} 
                                    className="p-1.5 ml-2 bg-white dark:bg-slate-700 text-slate-300 dark:text-slate-500 hover:text-white hover:bg-red-500 dark:hover:bg-red-600 rounded-full border border-slate-100 dark:border-slate-600 shadow-sm transition-all duration-200 opacity-0 group-hover:opacity-100 transform hover:scale-110"
                                    title="Remove Chapter"
                                  >
                                    <X size={16} />
                                  </button>
                              </div>
                            )}
                          </div>
                          {isDone && (
                            <div className="flex flex-wrap gap-3 mt-2 items-center">
                               <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-1 rounded-lg border border-indigo-100 dark:border-indigo-800 flex items-center gap-1">
                                 <Clock size={10} /> Level {chapterData.srsLevel + 1}
                               </span>
                               {/* Manual Date Override */}
                               <div className="relative group/date cursor-pointer">
                                  <input 
                                    type="date" 
                                    className="absolute inset-0 opacity-0 cursor-pointer w-full z-10"
                                    onChange={(e) => onUpdateProgressDate(subject.id, chapter, e.target.value)}
                                  />
                                  <div className="px-2 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm hover:border-indigo-300 transition-all">
                                    {getDaysDifference(nextRev) <= 0 ? (
                                      <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1 animate-pulse"><AlertCircle size={10} /> Due Today</span>
                                    ) : (
                                      <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">Next: {formatDate(nextRev)}</span>
                                    )}
                                  </div>
                               </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {isDone && isDue && (
                        <button onClick={() => onReviewChapter(subject.id, chapter)} className="self-end sm:self-center px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-lg shadow-indigo-200 dark:shadow-none transition-all transform hover:scale-105">
                          <RefreshCw size={14} className="animate-spin-slow" /> Review Now
                        </button>
                      )}
                    </div>
                  );
                })}

                {/* Add Chapter Input */}
                {(isEditMode || subject.chapters.length === 0) && (
                  <div className="flex items-center gap-3 mt-4 p-3 bg-white/50 dark:bg-slate-800/50 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-600 hover:border-indigo-400 dark:hover:border-indigo-500 transition-colors group">
                    <div className="p-1 bg-indigo-100 dark:bg-indigo-900/50 rounded-lg text-indigo-500 dark:text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white transition-colors">
                        <Plus size={18} />
                    </div>
                    <input 
                      type="text" 
                      placeholder="Add new chapter..." 
                      className="bg-transparent flex-1 text-sm outline-none text-slate-700 dark:text-slate-300 placeholder-slate-400"
                      value={newChapterName}
                      onChange={(e) => setNewChapterName(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddChapter()}
                    />
                    <button onClick={handleAddChapter} className="text-xs font-bold bg-indigo-500 text-white px-3 py-1.5 rounded-lg shadow-md hover:bg-indigo-600 transition-all">Add</button>
                  </div>
                )}
              </div>
            )}

            {/* Resources Tab */}
            {activeTab === 'resources' && (
              <ResourceManager 
                resources={subject.resources} 
                onAdd={handleAddResource} 
                onDelete={handleDeleteResource} 
              />
            )}

            {/* Tests Tab */}
            {activeTab === 'tests' && (
              <TestManager 
                tests={subject.tests} 
                onAdd={handleAddTest} 
                onDelete={handleDeleteTest}
                onUpdate={handleUpdateTest}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// --- Main Application ---

export default function App() {
  // State: Syllabus (Now Editable)
  const [syllabus, setSyllabus] = useState(() => {
    const saved = localStorage.getItem('ca_inter_syllabus_v3');
    return saved ? JSON.parse(saved) : DEFAULT_SYLLABUS;
  });

  // State: Progress
  const [progress, setProgress] = useState(() => {
    const saved = localStorage.getItem('ca_inter_progress');
    return saved ? JSON.parse(saved) : {};
  });
  
  // State: Theme (Persistent)
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('app_theme') || 'light';
  });
  
  // State: Audio
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const toggleMusic = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };
  
  const [openSubjects, setOpenSubjects] = useState({});
  const [view, setView] = useState('dashboard'); 
  const [isEditMode, setIsEditMode] = useState(false);
  const [showAddSubject, setShowAddSubject] = useState(false);
  const [newSubjectName, setNewSubjectName] = useState("");

  // Persist Data
  useEffect(() => {
    localStorage.setItem('ca_inter_progress', JSON.stringify(progress));
  }, [progress]);

  useEffect(() => {
    localStorage.setItem('ca_inter_syllabus_v3', JSON.stringify(syllabus));
  }, [syllabus]);

  // Persist Theme
  useEffect(() => {
    localStorage.setItem('app_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  // --- NEW: Data Export/Import Handlers ---
  const handleExportData = () => {
    const data = {
      syllabus,
      progress,
      theme,
      version: '1.0',
      exportedAt: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `CA_Inter_Backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportData = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        if (data.syllabus && data.progress) {
          if(window.confirm("This will overwrite your current progress with the backup. Are you sure?")) {
            setSyllabus(data.syllabus);
            setProgress(data.progress);
            if (data.theme) setTheme(data.theme);
            alert("Data restored successfully!");
          }
        } else {
          alert("Invalid backup file.");
        }
      } catch (err) {
        alert("Error reading backup file.");
      }
    };
    reader.readAsText(file);
    e.target.value = null; // Reset input
  };

  // Handlers
  const handleUpdateSubject = (id, updatedSubject) => {
    if (updatedSubject === null) {
      // Delete
      setSyllabus(prev => prev.filter(s => s.id !== id));
    } else {
      // Update
      setSyllabus(prev => prev.map(s => s.id === id ? updatedSubject : s));
    }
  };

  const handleAddSubject = () => {
    if (newSubjectName.trim()) {
      // --- CHANGED: Pick random color instead of static gray ---
      const randomColor = SUBJECT_COLORS[Math.floor(Math.random() * SUBJECT_COLORS.length)];
      
      const newSub = {
        id: generateId(),
        name: newSubjectName,
        chapters: [],
        resources: [],
        tests: [],
        color: randomColor
      };
      setSyllabus([...syllabus, newSub]);
      setNewSubjectName("");
      setShowAddSubject(false);
    }
  };

  const handleToggleChapter = (subjectId, chapterName) => {
    const key = subjectId + chapterName;
    setProgress(prev => {
      if (prev[key]) {
        const newState = { ...prev };
        delete newState[key];
        return newState;
      }
      const today = new Date();
      const nextDue = new Date(today);
      nextDue.setDate(today.getDate() + SRS_INTERVALS[0]);
      return {
        ...prev,
        [key]: {
          status: true,
          finishedDate: today.toISOString(),
          srsLevel: 0,
          nextRevision: nextDue.toISOString(),
          lastReviewDate: today.toISOString()
        }
      };
    });
  };

  const handleReview = (subjectId, chapterName) => {
    const key = subjectId + chapterName;
    setProgress(prev => {
      const current = prev[key];
      if (!current) return prev;
      const nextLevel = Math.min(current.srsLevel + 1, SRS_INTERVALS.length - 1);
      const today = new Date();
      const nextDue = new Date(today);
      nextDue.setDate(today.getDate() + SRS_INTERVALS[nextLevel]);
      return {
        ...prev,
        [key]: {
          ...current,
          srsLevel: nextLevel,
          nextRevision: nextDue.toISOString(),
          lastReviewDate: today.toISOString()
        }
      };
    });
  };

  const handleUpdateProgressDate = (subjectId, chapterName, newDateStr) => {
    const key = subjectId + chapterName;
    if (newDateStr && progress[key]) {
      setProgress(prev => ({
        ...prev,
        [key]: {
          ...prev[key],
          nextRevision: new Date(newDateStr).toISOString()
        }
      }));
    }
  };

  // Analytics
  const stats = useMemo(() => {
    let totalChapters = 0, completedChapters = 0, dueRevisions = 0, dueTodayList = [];
    syllabus.forEach(sub => {
      totalChapters += sub.chapters.length;
      sub.chapters.forEach(ch => {
        const data = progress[sub.id + ch];
        if (data?.status) {
          completedChapters++;
          if (getDaysDifference(data.nextRevision) <= 0) {
            dueRevisions++;
            dueTodayList.push({ subject: sub.name, chapter: ch, id: sub.id });
          }
        }
      });
    });
    return { totalChapters, completedChapters, percentage: totalChapters === 0 ? 0 : Math.round((completedChapters / totalChapters) * 100), dueRevisions, dueTodayList };
  }, [progress, syllabus]);

  return (
    <div className={`${theme === 'dark' ? 'dark' : ''}`}>
      <div className="min-h-screen bg-[#F3F4F6] dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 pb-24 relative transition-colors duration-300">
        {/* Background Mesh Gradient - Adjusted for Dark Mode */}
        <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-300/30 dark:bg-purple-900/20 rounded-full blur-[100px] animate-pulse"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-300/30 dark:bg-indigo-900/20 rounded-full blur-[100px] animate-pulse delay-700"></div>
          <div className="absolute top-[20%] right-[20%] w-[30%] h-[30%] bg-pink-200/30 dark:bg-pink-900/20 rounded-full blur-[100px] animate-pulse delay-1000"></div>
        </div>

        {/* Header */}
        <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-white/60 dark:border-slate-800 sticky top-0 z-30 shadow-sm transition-colors duration-300">
          <div className="max-w-5xl mx-auto px-4 h-20 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-orange-400/50 dark:shadow-orange-900/50 transform hover:scale-110 hover:rotate-6 transition-all duration-300 border-2 border-white/20">
                <Trophy size={24} className="fill-white" />
              </div>
              <div>
                 <h1 className="font-extrabold text-2xl tracking-tight text-slate-800 dark:text-white leading-none">Fuck <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600 dark:from-indigo-400 dark:to-violet-400">it</span></h1>
                 <p className="text-[10px] font-bold tracking-widest uppercase flex items-center gap-1 mt-0.5">
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-red-500 to-yellow-500 drop-shadow-sm filter">
                      Ye hai Meri kahani
                    </span>
                    <Flame size={12} className="text-orange-500 fill-orange-500 animate-pulse" />
                 </p>
                 <p className="text-[9px] font-medium text-slate-400 dark:text-slate-500 mt-0.5 tracking-wide">
                   Created by <span className="text-indigo-500 dark:text-indigo-400 font-bold">Aniket</span>
                 </p>
              </div>
            </div>
            
            <div className="flex gap-3 items-center">
              {/* Music Toggle */}
              <button
                onClick={toggleMusic}
                className={`p-2 rounded-xl transition-all shadow-sm flex items-center gap-2 ${isPlaying ? 'bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400 ring-2 ring-rose-200 dark:ring-rose-800' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'}`}
                title={isPlaying ? "Pause Hustle Anthem" : "Play Hustle Anthem"}
              >
                {isPlaying ? <Pause size={18} className="animate-pulse" /> : <Play size={18} />}
                <span className="text-xs font-bold hidden sm:block">Vibe</span>
              </button>
              <audio ref={audioRef} loop>
                <source src="/hustle-tune.mp3" type="audio/mpeg" />
              </audio>

              <div className="h-8 w-px bg-slate-200 dark:bg-slate-700 mx-1"></div>

              {/* Theme Toggle Button */}
              <button 
                onClick={toggleTheme}
                className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-yellow-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all shadow-sm"
                title="Toggle Theme"
              >
                 {theme === 'light' ? <Sun size={18} className="text-amber-500" /> : <Moon size={18} />}
              </button>

              <div className="h-8 w-px bg-slate-200 dark:bg-slate-700 mx-1"></div>

              {view === 'syllabus' && (
                <div className="flex items-center gap-2">
                   {/* Export/Import Actions (Visible only in Edit Mode) */}
                   {isEditMode && (
                     <>
                       <label className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer transition-all shadow-sm" title="Import Backup">
                          <Upload size={16} />
                          <input type="file" className="hidden" accept=".json" onChange={handleImportData} />
                       </label>
                       <button 
                          onClick={handleExportData}
                          className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all shadow-sm"
                          title="Export Backup"
                       >
                          <DownloadCloud size={16} />
                       </button>
                       <div className="h-8 w-px bg-slate-200 dark:bg-slate-700 mx-1"></div>
                     </>
                   )}

                  <button 
                    onClick={() => setIsEditMode(!isEditMode)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm ${isEditMode ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800 ring-2 ring-amber-100 dark:ring-amber-900/20' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'}`}
                  >
                    {isEditMode ? <Save size={16} /> : <Edit2 size={16} />}
                    {isEditMode ? 'Save Changes' : 'Edit Syllabus'}
                  </button>
                </div>
              )}

              <div className="flex bg-slate-100/80 dark:bg-slate-800/80 p-1.5 rounded-xl backdrop-blur-sm">
                <button onClick={() => setView('dashboard')} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${view === 'dashboard' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-md' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}>Dashboard</button>
                <button onClick={() => setView('syllabus')} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${view === 'syllabus' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-md' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}>Syllabus</button>
              </div>
            </div>
          </div>
        </header>

        <main className="relative z-10 max-w-5xl mx-auto px-4 py-10">
          {view === 'dashboard' && (
            <div className="space-y-8 animate-fade-in">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-4">
                <div>
                  <h2 className="text-4xl font-black text-slate-800 dark:text-white mb-2">Hello, <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-pink-500">Topper!</span></h2>
                  <p className="text-slate-500 dark:text-slate-400 font-medium">You have <span className="text-indigo-600 dark:text-indigo-400 font-bold">{stats.dueRevisions}</span> topics requiring active recall today.</p>
                </div>
                <div className="text-right hidden md:block">
                  <p className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Total Progress</p>
                  <p className="text-3xl font-black text-slate-700 dark:text-slate-200">{stats.percentage}%</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <DashboardCard title="Completion" value={`${stats.percentage}%`} subtitle={`${stats.completedChapters}/${stats.totalChapters} Topics`} gradient="from-blue-500 to-cyan-400" icon={TrendingUp} />
                <DashboardCard title="Due Today" value={stats.dueRevisions} subtitle="SRS Active" gradient={stats.dueRevisions > 0 ? "from-amber-500 to-orange-400" : "from-emerald-500 to-teal-400"} icon={AlertCircle} />
                <DashboardCard title="Tests Taken" value={syllabus.reduce((acc, sub) => acc + (sub.tests?.filter(t => t.status === 'Done').length || 0), 0)} subtitle="Across Subjects" gradient="from-purple-600 to-pink-500" icon={GraduationCap} />
              </div>

              {stats.dueRevisions > 0 ? (
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-3xl border border-amber-100 dark:border-amber-800/50 shadow-xl shadow-orange-100/50 dark:shadow-none overflow-hidden">
                  <div className="px-8 py-6 border-b border-amber-100/50 dark:border-amber-800/30 flex items-center gap-4">
                    <div className="p-3 bg-amber-100 dark:bg-amber-900/40 rounded-xl text-amber-600 dark:text-amber-400">
                      <Clock size={24} />
                    </div>
                    <div>
                       <h3 className="font-bold text-xl text-amber-900 dark:text-amber-100">Revision Required</h3>
                       <p className="text-amber-700 dark:text-amber-400 text-sm">Spaced repetition is key to retention.</p>
                    </div>
                  </div>
                  <div className="divide-y divide-amber-100/50 dark:divide-amber-800/30">
                    {stats.dueTodayList.map((item, idx) => (
                      <div key={idx} className="p-5 flex items-center justify-between hover:bg-amber-100/20 dark:hover:bg-amber-900/10 transition-colors">
                        <div>
                          <p className="text-[10px] font-bold text-amber-500 dark:text-amber-400 uppercase tracking-wider mb-1">{item.subject}</p>
                          <p className="text-base font-bold text-slate-800 dark:text-slate-200">{item.chapter}</p>
                        </div>
                        <button onClick={() => handleReview(item.id, item.chapter)} className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl shadow-lg shadow-amber-200 dark:shadow-none transition-all transform active:scale-95">Mark Reviewed</button>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                 <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-3xl border border-emerald-100 dark:border-emerald-800/50 p-8 flex items-center justify-center text-center">
                    <div>
                      <div className="inline-block p-4 bg-emerald-100 dark:bg-emerald-900/40 rounded-full text-emerald-600 dark:text-emerald-400 mb-4">
                          <CheckCircle size={32} />
                      </div>
                      <h3 className="text-xl font-bold text-emerald-900 dark:text-emerald-100">All Caught Up!</h3>
                      <p className="text-emerald-700 dark:text-emerald-400 mt-2">Great job maintaining your streak. Go learn something new!</p>
                    </div>
                 </div>
              )}
            </div>
          )}

          {view === 'syllabus' && (
            <div className="space-y-8 animate-fade-in">
              <div className="flex justify-between items-end">
                 <div>
                   <h2 className="text-3xl font-black text-slate-800 dark:text-white mb-2">Master Syllabus</h2>
                   <p className="text-slate-500 dark:text-slate-400 font-medium">Organize subjects, manage files, and track tests.</p>
                 </div>
                 {isEditMode && (
                   <button 
                     onClick={() => setShowAddSubject(true)} 
                     className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-200 dark:shadow-none transition-all transform hover:-translate-y-1"
                   >
                     <Plus size={18} /> Add Subject
                   </button>
                 )}
              </div>

              {showAddSubject && (
                <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md p-6 rounded-2xl shadow-xl border border-white/60 dark:border-slate-700 flex gap-3 items-center animate-slide-down">
                  <input 
                    type="text" 
                    placeholder="Enter New Subject Name..." 
                    className="flex-1 p-3 border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                    value={newSubjectName}
                    onChange={e => setNewSubjectName(e.target.value)}
                    autoFocus
                  />
                  <button onClick={handleAddSubject} className="px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 shadow-md">Save</button>
                  <button onClick={() => setShowAddSubject(false)} className="px-6 py-3 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 font-bold rounded-xl">Cancel</button>
                </div>
              )}

              <div className="grid grid-cols-1 gap-6">
                {syllabus.map(subject => (
                  <SubjectSection 
                    key={subject.id}
                    subject={subject}
                    progress={progress}
                    onToggleChapter={handleToggleChapter}
                    onReviewChapter={handleReview}
                    isOpen={!!openSubjects[subject.id]}
                    onToggleOpen={() => setOpenSubjects(prev => ({ ...prev, [subject.id]: !prev[subject.id] }))}
                    isEditMode={isEditMode}
                    onUpdateSubject={handleUpdateSubject}
                    onUpdateProgressDate={handleUpdateProgressDate}
                  />
                ))}
              </div>

              {syllabus.length === 0 && (
                <div className="text-center py-20 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm rounded-3xl border-2 border-dashed border-slate-300 dark:border-slate-700 text-slate-400 dark:text-slate-500">
                  <BookOpen size={48} className="mx-auto mb-4 opacity-20" />
                  <p className="font-medium">No subjects found. Add a subject to get started.</p>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}