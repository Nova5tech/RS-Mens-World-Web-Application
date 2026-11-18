import React, { useState } from 'react';
import {
  UploadCloud,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  X,
  ShieldCheck,
  Store,
} from 'lucide-react';
import { parseCSV, generateSamplePetpoojaCSV } from '../../utils/csvParser.js';
import { customerService } from '../../services/customerService.js';
import { useBranch } from '../../context/BranchContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';

export default function PetpoojaImportWizard({ isOpen, onClose, onImportComplete }) {
  if (!isOpen) return null;

  const { branches } = useBranch();
  const { showToast } = useToast();

  const [currentStep, setCurrentStep] = useState(1);
  const [fileName, setFileName] = useState('');
  const [parsedHeaders, setParsedHeaders] = useState([]);
  const [parsedRows, setParsedRows] = useState([]);
  const [defaultBranch, setDefaultBranch] = useState('B1');

  const [fieldMapping, setFieldMapping] = useState({
    name: '',
    mobile: '',
    branch: '',
    email: '',
    birthday: '',
    anniversary: '',
    consent: '',
  });

  const [validationResult, setValidationResult] = useState(null);
  const [validating, setValidating] = useState(false);
  const [activeTab, setActiveTab] = useState('valid');
  const [importing, setImporting] = useState(false);
  const [importReceipt, setImportReceipt] = useState(null);

  const handleLoadSampleData = () => {
    const csv = generateSamplePetpoojaCSV();
    processCSVContent('Petpooja_Export_Sample_Nov2026.csv', csv);
  };

  const handleFileUpload = e => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv') && !file.name.endsWith('.xlsx')) {
      alert('Please upload a CSV or Excel file');
      return;
    }

    const reader = new FileReader();
    reader.onload = event => {
      const text = event.target.result;
      processCSVContent(file.name, text);
    };
    reader.readAsText(file);
  };

  const processCSVContent = (name, text) => {
    try {
      const { headers, rows } = parseCSV(text);
      if (headers.length === 0 || rows.length === 0) {
        alert('File is empty or contains no valid rows');
        return;
      }

      setFileName(name);
      setParsedHeaders(headers);
      setParsedRows(rows);

      const mapping = {
        name: headers.find(h => /name|customer/i.test(h)) || headers[0] || '',
        mobile: headers.find(h => /mobile|phone|contact/i.test(h)) || headers[1] || '',
        branch: headers.find(h => /branch|store|location/i.test(h)) || '',
        email: headers.find(h => /email|mail/i.test(h)) || '',
        birthday: headers.find(h => /birth|dob/i.test(h)) || '',
        anniversary: headers.find(h => /anniversary/i.test(h)) || '',
        consent: headers.find(h => /consent|opt|marketing/i.test(h)) || '',
      };

      setFieldMapping(mapping);
      setCurrentStep(2);
    } catch (err) {
      alert('Error parsing CSV file: ' + err.message);
    }
  };

  const handleRunValidation = async () => {
    if (!fieldMapping.name || !fieldMapping.mobile) {
      alert('Customer name and mobile number columns are required');
      return;
    }

    try {
      setValidating(true);
      const result = await customerService.validateImportRows(
        parsedRows,
        fieldMapping,
        defaultBranch
      );
      setValidationResult(result);
      setCurrentStep(3);
    } catch (err) {
      alert('Validation error: ' + err.message);
    } finally {
      setValidating(false);
    }
  };

  const handleConfirmImport = async () => {
    if (!validationResult || validationResult.validRecords.length === 0) {
      alert('No valid records available to import');
      return;
    }

    try {
      setImporting(true);
      const receipt = await customerService.confirmImport(validationResult.validRecords);
      setImportReceipt(receipt);
      setCurrentStep(4);
      showToast(`Imported ${receipt.importedCount} customer records`, 'success');
      onImportComplete?.();
    } catch (err) {
      alert('Import failed: ' + err.message);
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-[#062b24]/40 backdrop-blur-xs transition-opacity" onClick={onClose} />

      {/* Modal Box */}
      <div className="relative bg-white rounded-3xl shadow-float border border-[#D9E9E8] max-w-2xl w-full overflow-hidden z-10 flex flex-col max-h-[88vh]">
        {/* Header */}
        <div className="p-5 border-b border-[#D9E9E8] bg-[#f8fbfb] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#e6f7f2] flex items-center justify-center text-[#008C83]">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900">
                Petpooja POS Customer Sync
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Step {currentStep} of 4 • Cleanse, validate & link retail profiles
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-slate-200/60 flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Stepper Header */}
        <div className="px-6 py-3 bg-[#f0f7f5]/60 border-b border-[#D9E9E8] flex items-center justify-between text-xs font-sans">
          {[
            { num: 1, label: 'Upload' },
            { num: 2, label: 'Mapping' },
            { num: 3, label: 'Validation' },
            { num: 4, label: 'Confirmed' },
          ].map(s => {
            const isDone = currentStep > s.num;
            const isCurrent = currentStep === s.num;
            return (
              <div
                key={s.num}
                className={`flex items-center gap-2 ${
                  isCurrent
                    ? 'text-[#0f766e] font-bold'
                    : isDone
                    ? 'text-emerald-700 font-semibold'
                    : 'text-slate-400 font-medium'
                }`}
              >
                <span
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                    isCurrent
                      ? 'bg-[#0f766e] text-white shadow-xs'
                      : isDone
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-slate-200 text-slate-500'
                  }`}
                >
                  {isDone ? '✓' : s.num}
                </span>
                <span>{s.label}</span>
              </div>
            );
          })}
        </div>

        {/* Wizard Step Content */}
        <div className="flex-1 p-6 overflow-y-auto text-xs">
          {/* STEP 1: Upload */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div className="p-3.5 bg-[#f0f9f7] rounded-2xl border border-[#D9E9E8] text-slate-700 leading-relaxed text-xs">
                Upload customer exports from your Petpooja POS system in CSV or Excel format. Records will be sanitized, checked for duplicates against existing store customers, and tagged with marketing consent.
              </div>

              <label className="border-2 border-dashed border-[#0f766e]/30 hover:border-[#0f766e] rounded-2xl p-8 flex flex-col items-center justify-center gap-2.5 cursor-pointer bg-[#f8fbfb] hover:bg-[#f0f9f7] transition-all text-center">
                <div className="w-12 h-12 rounded-2xl bg-[#e6f7f2] flex items-center justify-center text-[#008C83]">
                  <UploadCloud className="w-6 h-6" />
                </div>
                <span className="font-bold text-xs text-slate-900">
                  Select Petpooja export file
                </span>
                <span className="text-[11px] text-slate-500">CSV, XLSX up to 10MB</span>
                <input
                  type="file"
                  accept=".csv,.xlsx"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>

              <div className="flex items-center justify-between p-3.5 bg-[#f8fbfb] rounded-2xl border border-[#D9E9E8]">
                <div className="flex items-center gap-2 text-slate-600">
                  <FileSpreadsheet className="w-4 h-4 text-[#008C83]" />
                  <span>Sample dataset available for testing</span>
                </div>
                <button
                  onClick={handleLoadSampleData}
                  className="px-3.5 py-1.5 bg-white border border-slate-200/90 rounded-xl text-slate-700 hover:border-[#0f766e] text-xs font-semibold transition-colors shadow-2xs cursor-pointer"
                >
                  Load sample file
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Map Columns */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-900 block text-xs">Map spreadsheet columns</span>
                  <span className="text-slate-500 text-[11px]">
                    {fileName} ({parsedRows.length} rows loaded)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-[11px] text-slate-500 font-medium">Default store:</label>
                  <select
                    value={defaultBranch}
                    onChange={e => setDefaultBranch(e.target.value)}
                    className="text-xs py-1 px-2.5 bg-[#f8fbfb] border border-slate-200 rounded-xl outline-none focus:border-[#0f766e] font-semibold text-slate-700"
                  >
                    {branches.map(b => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { key: 'name', label: 'Customer Name *' },
                  { key: 'mobile', label: 'Mobile Number *' },
                  { key: 'branch', label: 'Store Branch Tag' },
                  { key: 'email', label: 'Email Address' },
                  { key: 'birthday', label: 'Date of Birth' },
                  { key: 'anniversary', label: 'Anniversary' },
                  { key: 'consent', label: 'Marketing Consent' },
                ].map(field => (
                  <div key={field.key} className="p-3 bg-[#f8fbfb] rounded-2xl border border-slate-200/90">
                    <label className="font-semibold text-slate-700 block mb-1.5 text-[11px]">
                      {field.label}
                    </label>
                    <select
                      value={fieldMapping[field.key] || ''}
                      onChange={e =>
                        setFieldMapping(prev => ({ ...prev, [field.key]: e.target.value }))
                      }
                      className="w-full text-xs p-1.5 bg-white border border-slate-200 rounded-xl outline-none focus:border-[#0f766e] text-slate-800"
                    >
                      <option value="">— Not Mapped —</option>
                      {parsedHeaders.map(h => (
                        <option key={h} value={h}>
                          {h}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 3: Validation */}
          {currentStep === 3 && validationResult && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-3 bg-[#f0f9f7] rounded-2xl border border-emerald-200/80">
                  <div className="text-xl font-bold text-emerald-700">
                    {validationResult.validCount}
                  </div>
                  <div className="text-[11px] text-emerald-600 font-medium">Valid records</div>
                </div>
                <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200/80">
                  <div className="text-xl font-bold text-amber-700">
                    {validationResult.duplicateCount}
                  </div>
                  <div className="text-[11px] text-amber-600 font-medium">Duplicates</div>
                </div>
                <div className="p-3 bg-red-50 rounded-2xl border border-red-200/80">
                  <div className="text-xl font-bold text-red-700">
                    {validationResult.invalidCount}
                  </div>
                  <div className="text-[11px] text-red-600 font-medium">Invalid rows</div>
                </div>
              </div>

              {/* Sub-tabs */}
              <div className="flex border-b border-slate-200 gap-4 text-xs font-semibold">
                <button
                  onClick={() => setActiveTab('valid')}
                  className={`pb-2 border-b-2 cursor-pointer ${
                    activeTab === 'valid'
                      ? 'border-[#0f766e] text-[#0f766e]'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Valid Records ({validationResult.validCount})
                </button>
                <button
                  onClick={() => setActiveTab('invalid')}
                  className={`pb-2 border-b-2 cursor-pointer ${
                    activeTab === 'invalid'
                      ? 'border-[#0f766e] text-[#0f766e]'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Rejected Rows ({validationResult.invalidCount})
                </button>
              </div>

              {activeTab === 'valid' ? (
                <div className="max-h-56 overflow-y-auto rounded-xl border border-slate-200">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#f8fbfb] text-slate-500 font-semibold border-b border-slate-200 text-[10px] uppercase">
                      <tr>
                        <th className="p-2.5">Name</th>
                        <th className="p-2.5">Mobile</th>
                        <th className="p-2.5">Store</th>
                        <th className="p-2.5">Consent</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {validationResult.validRecords.slice(0, 15).map((rec, i) => (
                        <tr key={i} className="hover:bg-[#f0f7f5]/40">
                          <td className="p-2.5 font-medium text-slate-900">{rec.name}</td>
                          <td className="p-2.5 font-mono text-slate-600">+91 {rec.mobile}</td>
                          <td className="p-2.5 text-slate-600">{rec.branchId}</td>
                          <td className="p-2.5">
                            {rec.marketingOptIn ? (
                              <span className="text-emerald-700 font-semibold text-[10px]">Consented</span>
                            ) : (
                              <span className="text-slate-400 font-medium text-[10px]">Opted out</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="max-h-56 overflow-y-auto rounded-xl border border-slate-200">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#f8fbfb] text-slate-500 font-semibold border-b border-slate-200 text-[10px] uppercase">
                      <tr>
                        <th className="p-2.5">Row</th>
                        <th className="p-2.5">Reason</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {validationResult.invalidRecords.map((inv, i) => (
                        <tr key={i}>
                          <td className="p-2.5 font-mono text-slate-500">{inv.rowIndex}</td>
                          <td className="p-2.5 text-red-600">{inv.reason}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* STEP 4: Confirmed */}
          {currentStep === 4 && importReceipt && (
            <div className="py-8 flex flex-col items-center justify-center text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h4 className="font-bold text-base text-slate-900">
                Import completed successfully
              </h4>
              <p className="text-xs text-slate-600 max-w-sm">
                Recorded <span className="font-bold text-[#0f766e]">{importReceipt.importedCount}</span> customer profiles into the store registry.
              </p>
              <div className="text-xs text-slate-400 pt-1">
                Registry total: {importReceipt.totalCustomers} customer records
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-[#D9E9E8] bg-[#f8fbfb] flex items-center justify-between">
          {currentStep > 1 && currentStep < 4 ? (
            <button
              onClick={() => setCurrentStep(prev => prev - 1)}
              className="px-4 py-2 border border-slate-200/90 rounded-xl text-xs font-semibold text-slate-700 hover:bg-white flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back
            </button>
          ) : (
            <div></div>
          )}

          {currentStep === 2 && (
            <button
              onClick={handleRunValidation}
              disabled={validating}
              className="px-5 py-2 bg-[#0f766e] hover:bg-[#0d655f] text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
            >
              <span>{validating ? 'Validating...' : 'Validate records'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}

          {currentStep === 3 && (
            <button
              onClick={handleConfirmImport}
              disabled={importing || validationResult.validCount === 0}
              className="px-5 py-2 bg-[#0f766e] hover:bg-[#0d655f] text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
            >
              <span>{importing ? 'Importing...' : `Confirm Import (${validationResult.validCount} records)`}</span>
            </button>
          )}

          {currentStep === 4 && (
            <button
              onClick={onClose}
              className="px-6 py-2 bg-[#0f766e] hover:bg-[#0d655f] text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              Done
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
