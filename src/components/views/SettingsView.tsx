import React, { useState } from 'react';
import { 
  Settings as SettingsIcon, 
  Download, 
  Upload, 
  RotateCcw, 
  Check, 
  AlertTriangle, 
  Calendar, 
  Database,
  Terminal,
  RefreshCw
} from 'lucide-react';
import { useLearning } from '../../context/LearningContext';
import { PageHeader } from '../ui/PageHeader';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Input, Textarea } from '../ui/Input';
import { Alert } from '../ui/Alert';

export const SettingsView: React.FC = () => {
  const { currentDay, setCurrentDay, exportDataAsJson, importDataFromJson, resetToDemoData } = useLearning();

  const [dayInput, setDayInput] = useState<number>(currentDay);
  const [importJsonText, setImportJsonText] = useState<string>('');
  const [importStatus, setImportStatus] = useState<string | null>(null);

  const handleUpdateDay = (e: React.FormEvent) => {
    e.preventDefault();
    if (dayInput >= 1 && dayInput <= 180) {
      setCurrentDay(dayInput);
    }
  };

  const handleExport = () => {
    const jsonStr = exportDataAsJson();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `senior-java-180-backup-day${currentDay}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    try {
      const success = importDataFromJson(importJsonText);
      if (success) {
        setImportStatus('Successfully restored state from JSON!');
        setImportJsonText('');
      } else {
        setImportStatus('Failed to parse JSON. Please check format.');
      }
    } catch (err) {
      setImportStatus('Invalid JSON payload.');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Page Header */}
      <PageHeader
        title="Settings & Local Storage Engine"
        description="All progress is safely persisted in your browser's LocalStorage. Export your state anytime or adjust simulation parameters."
        badge={
          <Badge variant="outline" size="sm">
            Configuration & Recovery
          </Badge>
        }
      />

      {/* Override Current Day Form */}
      <Card variant="default" className="p-5 space-y-3">
        <h2 className="text-base font-bold text-text-primary flex items-center gap-2">
          <Calendar className="w-4 h-4 text-sky-400" />
          <span>Active Day Override</span>
        </h2>
        <p className="text-xs text-text-secondary">
          Switch your active workspace to any day between 1 and 180.
        </p>

        <form onSubmit={handleUpdateDay} className="flex items-center gap-3 font-mono text-xs pt-1">
          <div className="w-28">
            <Input
              type="number"
              min={1}
              max={180}
              value={dayInput}
              onChange={e => setDayInput(parseInt(e.target.value, 10) || 1)}
            />
          </div>
          <Button
            type="submit"
            variant="primary"
            size="md"
          >
            Update Day
          </Button>
        </form>
      </Card>

      {/* JSON Backup & Restore */}
      <Card variant="default" className="p-5 space-y-4">
        <h2 className="text-base font-bold text-text-primary flex items-center gap-2">
          <Database className="w-4 h-4 text-emerald-400" />
          <span>Data Backup & State Migration</span>
        </h2>

        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            onClick={handleExport}
            variant="outline"
            size="md"
            icon={<Download className="w-4 h-4 text-sky-400" />}
          >
            Export Full State (JSON)
          </Button>
        </div>

        {/* Import JSON Box */}
        <div className="space-y-3 pt-3 border-t border-border font-mono text-xs">
          <Textarea
            label="RESTORE STATE FROM JSON BACKUP:"
            rows={4}
            placeholder="Paste your JSON backup payload here..."
            value={importJsonText}
            onChange={e => setImportJsonText(e.target.value)}
          />

          <div className="flex items-center justify-between">
            {importStatus ? (
              <span className="text-xs text-sky-400 font-mono">{importStatus}</span>
            ) : <span />}

            <Button
              onClick={handleImport}
              disabled={!importJsonText.trim()}
              variant="primary"
              size="md"
              className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 border-emerald-400"
            >
              Restore State
            </Button>
          </div>
        </div>
      </Card>

      {/* Factory Reset */}
      <Card variant="default" className="p-5 space-y-3 border-rose-500/30">
        <h2 className="text-base font-bold text-rose-400 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" />
          <span>Factory Demo Reset</span>
        </h2>
        <p className="text-xs text-text-secondary">
          Reset all study sessions, cards, DSA problems, and task states back to initial pristine seed data.
        </p>

        <Button
          onClick={() => {
            resetToDemoData();
            setDayInput(37);
          }}
          variant="danger"
          size="md"
          icon={<RotateCcw className="w-4 h-4" />}
        >
          Reset All Data to Demo Baseline
        </Button>
      </Card>
    </div>
  );
};
