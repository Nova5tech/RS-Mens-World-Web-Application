import React, { useState } from 'react';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import {
  UploadCloud,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  X,
  Download,
  Loader2,
  Store,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Pill } from '@/components/ui/Pill';
import { Branch, Customer } from '@/types/models';
import { normalizePhone } from '@/lib/phone';
import { bulkUpsertCustomers } from '@/services/customers';
import { cn } from '@/lib/utils';

export interface ImportWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  branches: Branch[];
  currentBranchId?: string | null;
  isBranchUser?: boolean;
  existingCustomers: Customer[];
  currentUserFullName: string;
}

type WizardStep = 1 | 2 | 3 | 4 | 5;

interface ParsedRow {
  [key: string]: string;
}

interface ValidatedRow {
  original: ParsedRow;
  name: string;
  phone: string;
  rawPhone: string;
  email?: string;
  branch_id: string;
  birthday?: string;
  anniversary?: string;
  total_purchases?: number;
  order_count?: number;
  status: 'will_create' | 'will_update' | 'duplicate_skipped' | 'invalid_skipped';
  reason?: string;
}

export const ImportWizard: React.FC<ImportWizardProps> = ({
  isOpen,
  onClose,
  onSuccess,
  branches,
  currentBranchId,
  isBranchUser,
  existingCustomers,
  currentUserFullName,
}) => {
  const [step, setStep] = useState<WizardStep>(1);
  const [file, setFile] = useState<File | null>(null);
  const [fileHeaders, setFileHeaders] = useState<string[]>([]);
  const [rawData, setRawData] = useState<ParsedRow[]>([]);
  const [isParsing, setIsParsing] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);

  // Column Mappings
  const [columnMap, setColumnMap] = useState<Record<string, string>>({
    name: '',
    phone: '',
    email: '',
    branch: '',
    birthday: '',
    anniversary: '',
    totalSpent: '',
    orders: '',
  });

  const [defaultBranchId, setDefaultBranchId] = useState<string>(
    currentBranchId || branches[0]?.id || ''
  );
  const [consentGiven, setConsentGiven] = useState(true);

  // Validation results
  const [validatedRows, setValidatedRows] = useState<ValidatedRow[]>([]);
  const [reportFilter, setReportFilter] = useState<'all' | 'valid' | 'invalid' | 'duplicate'>('all');

  // Import Progress
  const [importProgress, setImportProgress] = useState(0);
  const [isImporting, setIsImporting] = useState(false);
  const [importSummary, setImportSummary] = useState<{
    created: number;
    updated: number;
    skipped: number;
  } | null>(null);

  if (!isOpen) return null;

  // Step 1: File Download Sample
  const handleDownloadSample = () => {
    const csvContent =
      'Customer Name,Mobile,Email,Branch,Birthday,Anniversary,Total Spent,Orders\n' +
      'Suresh Varma,9876543210,suresh@example.com,Rajahmundry,1990-05-15,2018-11-20,15400,6\n' +
      'Ananya Reddy,9848012345,ananya@example.com,Kakinada,1994-08-22,,8900,3\n' +
      'Manoj Kumar,9900011223,manoj@example.com,Vijayawada,,,4500,2\n' +
      'Invalid Phone Sample,12345,bad@example.com,Guntur,,,0,0\n';

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'petpooja_customers_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Step 1: Handle File Selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) processFile(selected);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const dropped = e.dataTransfer.files?.[0];
    if (dropped) processFile(dropped);
  };

  const processFile = (uploadedFile: File) => {
    if (uploadedFile.size > 10 * 1024 * 1024) {
      setParseError('File size exceeds 10 MB limit.');
      return;
    }

    setFile(uploadedFile);
    setParseError(null);
    setIsParsing(true);

    const isCsv = uploadedFile.name.endsWith('.csv');
    if (isCsv) {
      Papa.parse(uploadedFile, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          setIsParsing(false);
          if (results.data.length === 0) {
            setParseError('Uploaded CSV file is empty.');
            return;
          }
          const headers = results.meta.fields || [];
          setFileHeaders(headers);
          setRawData(results.data as ParsedRow[]);
          autoMapColumns(headers);
          setStep(2);
        },
        error: (err) => {
          setIsParsing(false);
          setParseError(`CSV Parse Error: ${err.message}`);
        },
      });
    } else {
      // Excel (.xlsx/.xls)
      const reader = new FileReader();
      reader.onload = (evt) => {
        try {
          const data = new Uint8Array(evt.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          const json = XLSX.utils.sheet_to_json<ParsedRow>(worksheet, { defval: '' });

          setIsParsing(false);
          if (json.length === 0) {
            setParseError('Uploaded Excel sheet is empty.');
            return;
          }

          const headers = Object.keys(json[0] || {});
          setFileHeaders(headers);
          setRawData(json);
          autoMapColumns(headers);
          setStep(2);
        } catch (err: unknown) {
          setIsParsing(false);
          setParseError(`Failed to parse Excel file: ${err instanceof Error ? err.message : String(err)}`);
        }
      };
      reader.readAsArrayBuffer(uploadedFile);
    }
  };

  // Step 2: Auto Map Petpooja Columns
  const autoMapColumns = (headers: string[]) => {
    const findMatch = (candidates: string[]) => {
      return (
        headers.find((h) =>
          candidates.some((c) => h.toLowerCase().replace(/[\s_\-]/g, '').includes(c.toLowerCase()))
        ) || ''
      );
    };

    setColumnMap({
      name: findMatch(['customername', 'name', 'fullname', 'clientname']),
      phone: findMatch(['mobile', 'phone', 'contact', 'cell', 'mobileno']),
      email: findMatch(['email', 'mail', 'emailaddress']),
      branch: findMatch(['branch', 'outlet', 'store', 'location']),
      birthday: findMatch(['birthday', 'dob', 'birthdate']),
      anniversary: findMatch(['anniversary', 'weddingdate', 'anniv']),
      totalSpent: findMatch(['totalspent', 'totalsales', 'totalpurchases', 'spent']),
      orders: findMatch(['orders', 'ordercount', 'bills', 'visits']),
    });
  };

  // Fuzzy Match Branch
  const matchBranch = (branchStr: string): string => {
    if (isBranchUser && currentBranchId) return currentBranchId;
    if (!branchStr) return defaultBranchId;

    const lower = branchStr.toLowerCase().trim();
    if (lower.includes('rajahmundry') || lower.includes('rjy') || lower.includes('main') || lower.includes('b1')) {
      const b = branches.find((item) => item.code === 'B1' || item.name.includes('Rajahmundry'));
      if (b) return b.id;
    }
    if (lower.includes('kakinada') || lower.includes('b2')) {
      const b = branches.find((item) => item.code === 'B2' || item.name.includes('Kakinada'));
      if (b) return b.id;
    }
    if (lower.includes('vijayawada') || lower.includes('bza') || lower.includes('b3')) {
      const b = branches.find((item) => item.code === 'B3' || item.name.includes('Vijayawada'));
      if (b) return b.id;
    }
    if (lower.includes('guntur') || lower.includes('b4')) {
      const b = branches.find((item) => item.code === 'B4' || item.name.includes('Guntur'));
      if (b) return b.id;
    }

    return defaultBranchId;
  };

  // Step 3: Run Validation
  const handleProceedToValidation = () => {
    if (!columnMap.name || !columnMap.phone) {
      alert('Please map both Customer Name and Mobile number columns.');
      return;
    }

    const seenPhonesInFile = new Set<string>();
    const validated: ValidatedRow[] = [];

    rawData.forEach((row) => {
      const name = String(row[columnMap.name] || '').trim();
      const rawPhone = String(row[columnMap.phone] || '').trim();
      const email = columnMap.email ? String(row[columnMap.email] || '').trim() : undefined;
      const branchText = columnMap.branch ? String(row[columnMap.branch] || '').trim() : '';
      const branchId = matchBranch(branchText);

      const birthday = columnMap.birthday ? String(row[columnMap.birthday] || '').trim() : undefined;
      const anniversary = columnMap.anniversary
        ? String(row[columnMap.anniversary] || '').trim()
        : undefined;

      const spentNum = columnMap.totalSpent ? parseFloat(String(row[columnMap.totalSpent])) : 0;
      const ordersNum = columnMap.orders ? parseInt(String(row[columnMap.orders]), 10) : 0;

      const norm = normalizePhone(rawPhone);

      if (!norm.isValid) {
        validated.push({
          original: row,
          name: name || 'Unnamed Customer',
          phone: '',
          rawPhone,
          email,
          branch_id: branchId,
          status: 'invalid_skipped',
          reason: norm.error || 'Invalid phone number',
        });
        return;
      }

      // Check duplicates inside the same file
      if (seenPhonesInFile.has(norm.e164)) {
        validated.push({
          original: row,
          name: name || 'Customer',
          phone: norm.e164,
          rawPhone,
          email,
          branch_id: branchId,
          status: 'duplicate_skipped',
          reason: 'Duplicate phone number in file',
        });
        return;
      }
      seenPhonesInFile.add(norm.e164);

      // Check if already in DB
      const existsInDb = existingCustomers.some((c) => c.phone === norm.e164);
      if (existsInDb) {
        validated.push({
          original: row,
          name: name || 'Customer',
          phone: norm.e164,
          rawPhone,
          email,
          branch_id: branchId,
          birthday,
          anniversary,
          total_purchases: isNaN(spentNum) ? 0 : spentNum,
          order_count: isNaN(ordersNum) ? 0 : ordersNum,
          status: 'will_update',
          reason: 'Already exists in database (will update purchases & details)',
        });
      } else {
        validated.push({
          original: row,
          name: name || 'New Customer',
          phone: norm.e164,
          rawPhone,
          email,
          branch_id: branchId,
          birthday,
          anniversary,
          total_purchases: isNaN(spentNum) ? 0 : spentNum,
          order_count: isNaN(ordersNum) ? 0 : ordersNum,
          status: 'will_create',
        });
      }
    });

    setValidatedRows(validated);
    setStep(3);
  };

  // Step 4: Review counts
  const totalRows = validatedRows.length;
  const willCreateCount = validatedRows.filter((r) => r.status === 'will_create').length;
  const willUpdateCount = validatedRows.filter((r) => r.status === 'will_update').length;
  const duplicateCount = validatedRows.filter((r) => r.status === 'duplicate_skipped').length;
  const invalidCount = validatedRows.filter((r) => r.status === 'invalid_skipped').length;

  // Filtered rows for review table
  const displayedRows = validatedRows.filter((r) => {
    if (reportFilter === 'valid') return r.status === 'will_create' || r.status === 'will_update';
    if (reportFilter === 'invalid') return r.status === 'invalid_skipped';
    if (reportFilter === 'duplicate') return r.status === 'duplicate_skipped';
    return true;
  });

  // Download Report CSV
  const handleDownloadReport = () => {
    const reportData = validatedRows.map((r) => ({
      'Customer Name': r.name,
      'Raw Phone': r.rawPhone,
      'Normalized Phone': r.phone,
      'Status': r.status,
      'Reason / Note': r.reason || 'OK',
    }));

    const csv = Papa.unparse(reportData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `import_report_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Step 5: Execute Import
  const handleExecuteImport = async () => {
    setIsImporting(true);
    setStep(5);
    setImportProgress(10);

    const validRows = validatedRows.filter(
      (r) => r.status === 'will_create' || r.status === 'will_update'
    );

    // Simulate progress animation
    const interval = setInterval(() => {
      setImportProgress((prev) => {
        if (prev >= 85) {
          clearInterval(interval);
          return 90;
        }
        return prev + 25;
      });
    }, 200);

    try {
      const itemsToUpsert = validRows.map((r) => ({
        name: r.name,
        phone: r.phone,
        email: r.email,
        branch_id: r.branch_id,
        birthday: r.birthday,
        anniversary: r.anniversary,
        total_purchases: r.total_purchases,
        order_count: r.order_count,
        consent: consentGiven,
      }));

      const reportPayload = validatedRows.map((r) => ({
        name: r.name,
        phone: r.phone || r.rawPhone,
        status: r.status,
        reason: r.reason,
      }));

      await bulkUpsertCustomers(itemsToUpsert, {
        fileName: file?.name || 'import.csv',
        uploadedBy: currentUserFullName,
        report: reportPayload,
      });

      setImportProgress(100);
      setImportSummary({
        created: willCreateCount,
        updated: willUpdateCount,
        skipped: duplicateCount + invalidCount,
      });
    } catch (err: unknown) {
      alert(`Import failed: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      clearInterval(interval);
      setIsImporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl border border-slate-100 overflow-hidden">
        {/* Header with 5-step stepper */}
        <div className="px-8 py-5 border-b border-border-card bg-slate-50/70 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-app-text tracking-tight">
              Import Customers from Petpooja
            </h2>
            <p className="text-xs text-app-muted mt-0.5">
              Upload Petpooja POS customer export (.xlsx, .xls or .csv)
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stepper bar */}
        <div className="px-8 py-3 bg-white border-b border-border-card">
          <div className="flex items-center justify-between text-xs font-semibold">
            {[
              { num: 1, title: 'Upload' },
              { num: 2, title: 'Map Columns' },
              { num: 3, title: 'Validate' },
              { num: 4, title: 'Review Report' },
              { num: 5, title: 'Import' },
            ].map((s) => (
              <div key={s.num} className="flex items-center gap-2">
                <span
                  className={cn(
                    'w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all',
                    step === s.num
                      ? 'bg-primary-brand text-white shadow-xs'
                      : step > s.num
                      ? 'bg-accent-brand text-[#0B3B2E]'
                      : 'bg-slate-100 text-slate-500'
                  )}
                >
                  {step > s.num ? '✓' : s.num}
                </span>
                <span className={step >= s.num ? 'text-app-text' : 'text-slate-400'}>
                  {s.title}
                </span>
                {s.num < 5 && <div className="hidden sm:block w-8 h-0.5 bg-slate-200 ml-2" />}
              </div>
            ))}
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-8">
          {/* STEP 1: Upload */}
          {step === 1 && (
            <div className="space-y-6">
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                className="border-2 border-dashed border-slate-300 hover:border-primary-brand rounded-3xl p-10 text-center bg-slate-50/50 hover:bg-slate-50 transition-all flex flex-col items-center justify-center cursor-pointer"
                onClick={() => document.getElementById('petpooja-file-input')?.click()}
              >
                <div className="w-16 h-16 rounded-2xl bg-emerald-100/60 text-primary-brand flex items-center justify-center mb-4">
                  <UploadCloud className="w-8 h-8" />
                </div>
                <h3 className="text-base font-bold text-app-text">
                  Drag and drop your Petpooja export file here
                </h3>
                <p className="text-xs text-app-muted mt-1 max-w-sm">
                  Supports .xlsx, .xls and .csv files up to 10 MB.
                </p>

                <input
                  id="petpooja-file-input"
                  type="file"
                  accept=".csv, .xlsx, .xls"
                  onChange={handleFileChange}
                  className="hidden"
                />

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mt-5 pointer-events-none"
                >
                  Browse Files
                </Button>
              </div>

              {isParsing && (
                <div className="flex items-center justify-center gap-2 text-sm text-primary-brand font-medium">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Parsing Petpooja file structure...</span>
                </div>
              )}

              {parseError && (
                <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  <span>{parseError}</span>
                </div>
              )}

              <div className="p-4 rounded-2xl bg-slate-50 border border-border-card flex items-center justify-between text-xs">
                <div>
                  <span className="font-semibold text-app-text block">Need a reference format?</span>
                  <span className="text-app-muted">Download our sample CSV template with all standard Petpooja columns.</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownloadSample}
                  className="gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Sample</span>
                </Button>
              </div>
            </div>
          )}

          {/* STEP 2: Map Columns */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-100 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-emerald-900">
                  <FileSpreadsheet className="w-5 h-5 text-emerald-700" />
                  <span>
                    Detected <strong>{rawData.length}</strong> rows in{' '}
                    <strong>{file?.name}</strong>.
                  </span>
                </div>
                <span className="text-emerald-700 font-medium">Auto-matched columns</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-app-text mb-1">
                    Customer Name *
                  </label>
                  <select
                    value={columnMap.name}
                    onChange={(e) => setColumnMap({ ...columnMap, name: e.target.value })}
                    className="w-full h-10 px-3 bg-white border border-border-card rounded-xl text-sm"
                  >
                    <option value="">Select column...</option>
                    {fileHeaders.map((h) => (
                      <option key={h} value={h}>
                        {h}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-app-text mb-1">
                    Mobile / Phone Number *
                  </label>
                  <select
                    value={columnMap.phone}
                    onChange={(e) => setColumnMap({ ...columnMap, phone: e.target.value })}
                    className="w-full h-10 px-3 bg-white border border-border-card rounded-xl text-sm"
                  >
                    <option value="">Select column...</option>
                    {fileHeaders.map((h) => (
                      <option key={h} value={h}>
                        {h}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-app-text mb-1">
                    Email Address
                  </label>
                  <select
                    value={columnMap.email}
                    onChange={(e) => setColumnMap({ ...columnMap, email: e.target.value })}
                    className="w-full h-10 px-3 bg-white border border-border-card rounded-xl text-sm"
                  >
                    <option value="">(None)</option>
                    {fileHeaders.map((h) => (
                      <option key={h} value={h}>
                        {h}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-app-text mb-1">
                    Store Branch / Outlet
                  </label>
                  <select
                    value={columnMap.branch}
                    onChange={(e) => setColumnMap({ ...columnMap, branch: e.target.value })}
                    className="w-full h-10 px-3 bg-white border border-border-card rounded-xl text-sm"
                  >
                    <option value="">(None - use default branch)</option>
                    {fileHeaders.map((h) => (
                      <option key={h} value={h}>
                        {h}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-app-text mb-1">
                    Birthday / Date of Birth
                  </label>
                  <select
                    value={columnMap.birthday}
                    onChange={(e) => setColumnMap({ ...columnMap, birthday: e.target.value })}
                    className="w-full h-10 px-3 bg-white border border-border-card rounded-xl text-sm"
                  >
                    <option value="">(None)</option>
                    {fileHeaders.map((h) => (
                      <option key={h} value={h}>
                        {h}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-app-text mb-1">
                    Wedding Anniversary
                  </label>
                  <select
                    value={columnMap.anniversary}
                    onChange={(e) => setColumnMap({ ...columnMap, anniversary: e.target.value })}
                    className="w-full h-10 px-3 bg-white border border-border-card rounded-xl text-sm"
                  >
                    <option value="">(None)</option>
                    {fileHeaders.map((h) => (
                      <option key={h} value={h}>
                        {h}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-app-text mb-1">
                    Total Spent (₹)
                  </label>
                  <select
                    value={columnMap.totalSpent}
                    onChange={(e) => setColumnMap({ ...columnMap, totalSpent: e.target.value })}
                    className="w-full h-10 px-3 bg-white border border-border-card rounded-xl text-sm"
                  >
                    <option value="">(None)</option>
                    {fileHeaders.map((h) => (
                      <option key={h} value={h}>
                        {h}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-app-text mb-1">
                    Orders Count
                  </label>
                  <select
                    value={columnMap.orders}
                    onChange={(e) => setColumnMap({ ...columnMap, orders: e.target.value })}
                    className="w-full h-10 px-3 bg-white border border-border-card rounded-xl text-sm"
                  >
                    <option value="">(None)</option>
                    {fileHeaders.map((h) => (
                      <option key={h} value={h}>
                        {h}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Default Branch fallback */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-border-card">
                <label className="block text-xs font-semibold text-app-text mb-1.5">
                  Default Store Branch (for unmatched or missing branch rows)
                </label>
                <select
                  disabled={isBranchUser}
                  value={defaultBranchId}
                  onChange={(e) => setDefaultBranchId(e.target.value)}
                  className="w-full h-10 px-3 bg-white border border-border-card rounded-xl text-sm"
                >
                  {branches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.code} – {b.name}
                    </option>
                  ))}
                </select>
                {isBranchUser && (
                  <p className="text-xs text-app-muted mt-1">
                    Branch users are restricted to importing into their assigned store.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* STEP 3: Validate & Consent */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-4 rounded-2xl bg-slate-50 border border-border-card">
                  <span className="text-xs text-app-muted font-medium block">Total Scanned</span>
                  <span className="text-2xl font-bold text-app-text mt-1 block">{totalRows}</span>
                </div>
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100">
                  <span className="text-xs text-emerald-800 font-medium block">Will Create</span>
                  <span className="text-2xl font-bold text-emerald-700 mt-1 block">
                    {willCreateCount}
                  </span>
                </div>
                <div className="p-4 rounded-2xl bg-blue-50 border border-blue-100">
                  <span className="text-xs text-blue-800 font-medium block">Will Update</span>
                  <span className="text-2xl font-bold text-blue-700 mt-1 block">
                    {willUpdateCount}
                  </span>
                </div>
                <div className="p-4 rounded-2xl bg-red-50 border border-red-100">
                  <span className="text-xs text-red-800 font-medium block">Skipped / Invalid</span>
                  <span className="text-2xl font-bold text-red-700 mt-1 block">
                    {duplicateCount + invalidCount}
                  </span>
                </div>
              </div>

              {/* Consent Checkbox */}
              <div className="p-4 rounded-2xl bg-[#E6F7EF] border border-emerald-200/80 flex items-start gap-3">
                <input
                  id="consent-check"
                  type="checkbox"
                  checked={consentGiven}
                  onChange={(e) => setConsentGiven(e.target.checked)}
                  className="mt-1 w-4 h-4 text-primary-brand rounded border-slate-300 focus:ring-accent-brand"
                />
                <label htmlFor="consent-check" className="text-xs text-slate-800 cursor-pointer">
                  <strong className="block font-semibold text-primary-brand text-sm mb-0.5">
                    WhatsApp Marketing Consent Given
                  </strong>
                  Record marketing consent source as <code>petpooja_import</code> for all valid
                  customers in this batch. Uncheck if these customers have not consented to promotional
                  messaging.
                </label>
              </div>

              {/* Sample Validation Table */}
              <div className="border border-border-card rounded-2xl overflow-hidden">
                <div className="bg-[#F8FAFA] px-4 py-2.5 text-xs font-semibold text-slate-600 border-b border-border-card">
                  First 5 Validation Rows Preview
                </div>
                <table className="w-full text-left text-xs">
                  <tbody className="divide-y divide-border-card">
                    {validatedRows.slice(0, 5).map((r, i) => (
                      <tr key={i} className="hover:bg-slate-50">
                        <td className="p-3 font-semibold text-app-text">{r.name}</td>
                        <td className="p-3 font-mono text-slate-600">
                          {r.phone || r.rawPhone}
                        </td>
                        <td className="p-3">
                          {r.status === 'will_create' && <Pill variant="green">Will Create</Pill>}
                          {r.status === 'will_update' && <Pill variant="blue">Will Update</Pill>}
                          {r.status === 'duplicate_skipped' && (
                            <Pill variant="amber">Duplicate Skipped</Pill>
                          )}
                          {r.status === 'invalid_skipped' && <Pill variant="red">Invalid</Pill>}
                        </td>
                        <td className="p-3 text-app-muted text-[11px]">{r.reason || 'Valid row'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* STEP 4: Review Report */}
          {step === 4 && (
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                {/* Filter tabs */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setReportFilter('all')}
                    className={cn(
                      'px-3 py-1.5 rounded-xl text-xs font-semibold transition-all',
                      reportFilter === 'all'
                        ? 'bg-primary-brand text-white'
                        : 'bg-slate-100 text-slate-700'
                    )}
                  >
                    All ({totalRows})
                  </button>
                  <button
                    type="button"
                    onClick={() => setReportFilter('valid')}
                    className={cn(
                      'px-3 py-1.5 rounded-xl text-xs font-semibold transition-all',
                      reportFilter === 'valid'
                        ? 'bg-primary-brand text-white'
                        : 'bg-slate-100 text-slate-700'
                    )}
                  >
                    Valid ({willCreateCount + willUpdateCount})
                  </button>
                  <button
                    type="button"
                    onClick={() => setReportFilter('duplicate')}
                    className={cn(
                      'px-3 py-1.5 rounded-xl text-xs font-semibold transition-all',
                      reportFilter === 'duplicate'
                        ? 'bg-primary-brand text-white'
                        : 'bg-slate-100 text-slate-700'
                    )}
                  >
                    Duplicates ({duplicateCount})
                  </button>
                  <button
                    type="button"
                    onClick={() => setReportFilter('invalid')}
                    className={cn(
                      'px-3 py-1.5 rounded-xl text-xs font-semibold transition-all',
                      reportFilter === 'invalid'
                        ? 'bg-primary-brand text-white'
                        : 'bg-slate-100 text-slate-700'
                    )}
                  >
                    Invalid ({invalidCount})
                  </button>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownloadReport}
                  className="gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Report CSV</span>
                </Button>
              </div>

              {/* Full Report Table */}
              <div className="border border-border-card rounded-2xl max-h-72 overflow-y-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#F8FAFA] text-slate-600 font-semibold sticky top-0 border-b border-border-card">
                    <tr>
                      <th className="p-3">Customer Name</th>
                      <th className="p-3">Mobile</th>
                      <th className="p-3">Branch</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Note</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-card">
                    {displayedRows.map((r, i) => (
                      <tr key={i} className="hover:bg-slate-50">
                        <td className="p-3 font-semibold text-app-text">{r.name}</td>
                        <td className="p-3 font-mono text-slate-600">
                          {r.phone || r.rawPhone}
                        </td>
                        <td className="p-3 text-slate-600">
                          {branches.find((b) => b.id === r.branch_id)?.name || 'Default'}
                        </td>
                        <td className="p-3">
                          {r.status === 'will_create' && <Pill variant="green">Will Create</Pill>}
                          {r.status === 'will_update' && <Pill variant="blue">Will Update</Pill>}
                          {r.status === 'duplicate_skipped' && (
                            <Pill variant="amber">Duplicate</Pill>
                          )}
                          {r.status === 'invalid_skipped' && <Pill variant="red">Invalid</Pill>}
                        </td>
                        <td className="p-3 text-app-muted text-[11px]">{r.reason || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* STEP 5: Import Progress & Summary */}
          {step === 5 && (
            <div className="space-y-8 py-6 text-center max-w-md mx-auto">
              {isImporting ? (
                <div className="space-y-4">
                  <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-primary-brand flex items-center justify-center mx-auto animate-pulse">
                    <Store className="w-8 h-8" />
                  </div>
                  <h3 className="text-lg font-bold text-app-text">
                    Importing Customers into Database...
                  </h3>
                  <p className="text-xs text-app-muted">
                    Processing batches of 500 records and linking store branches.
                  </p>
                  <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden mt-4">
                    <div
                      className="bg-primary-brand h-full rounded-full transition-all duration-300"
                      style={{ width: `${importProgress}%` }}
                    />
                  </div>
                  <span className="text-xs font-mono font-bold text-primary-brand">
                    {importProgress}%
                  </span>
                </div>
              ) : (
                <div className="space-y-6 animate-in zoom-in-95">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-app-text">Import Completed!</h3>
                    <p className="text-xs text-app-muted mt-1">
                      Customer records have been successfully saved and assigned to their respective store branches.
                    </p>
                  </div>

                  {importSummary && (
                    <div className="grid grid-cols-3 gap-3 text-left">
                      <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100">
                        <span className="text-xs text-emerald-800 font-medium block">Created</span>
                        <span className="text-xl font-bold text-emerald-700 mt-1 block">
                          +{importSummary.created}
                        </span>
                      </div>
                      <div className="p-4 rounded-2xl bg-blue-50 border border-blue-100">
                        <span className="text-xs text-blue-800 font-medium block">Updated</span>
                        <span className="text-xl font-bold text-blue-700 mt-1 block">
                          {importSummary.updated}
                        </span>
                      </div>
                      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                        <span className="text-xs text-slate-600 font-medium block">Skipped</span>
                        <span className="text-xl font-bold text-slate-700 mt-1 block">
                          {importSummary.skipped}
                        </span>
                      </div>
                    </div>
                  )}

                  <Button
                    variant="primary"
                    onClick={() => {
                      onSuccess();
                      onClose();
                    }}
                    className="w-full bg-primary-brand h-12 text-sm font-semibold rounded-xl"
                  >
                    View Customers
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Navigation Buttons */}
        {step < 5 && (
          <div className="px-8 py-4 border-t border-border-card bg-slate-50/80 flex items-center justify-between">
            <Button
              variant="outline"
              onClick={() => {
                if (step === 1) onClose();
                else setStep((prev) => (prev - 1) as WizardStep);
              }}
            >
              {step === 1 ? 'Cancel' : 'Back'}
            </Button>

            <div className="flex items-center gap-3">
              {step === 2 && (
                <Button
                  variant="primary"
                  onClick={handleProceedToValidation}
                  className="bg-primary-brand gap-2"
                >
                  <span>Proceed to Validate</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              )}

              {step === 3 && (
                <Button
                  variant="primary"
                  onClick={() => setStep(4)}
                  className="bg-primary-brand gap-2"
                >
                  <span>Review Report</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              )}

              {step === 4 && (
                <Button
                  variant="primary"
                  onClick={handleExecuteImport}
                  className="bg-primary-brand gap-2"
                >
                  <span>Start Import ({willCreateCount + willUpdateCount} rows)</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
