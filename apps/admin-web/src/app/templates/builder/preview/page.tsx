'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Monitor, Tablet, Smartphone, RotateCcw, ExternalLink, Maximize2 } from 'lucide-react';
import { AdminPageShell } from '@/components/layout/admin-page-shell';

type Device = 'desktop' | 'tablet' | 'mobile';

const DEVICE_CONFIG: Record<Device, { width: string; height: string; label: string }> = {
  desktop: { width: '100%', height: '100%', label: '1440 × 900' },
  tablet: { width: '768px', height: '100%', label: '768 × 1024' },
  mobile: { width: '375px', height: '100%', label: '375 × 812' },
};

export default function TemplatePreviewPage() {
  return <AdminPageShell sectionTitle="Public Preview">{() => <PreviewContent />}</AdminPageShell>;
}

function PreviewContent() {
  const router = useRouter();
  const [device, setDevice] = useState<Device>('desktop');
  const [refreshKey, setRefreshKey] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const publicUrl = 'http://localhost:3002';
  const config = DEVICE_CONFIG[device];

  if (isFullscreen) {
    return (
      <div className="fixed inset-0 z-50 bg-black/90 flex flex-col">
        <div className="flex items-center justify-between px-4 py-2 bg-gray-900">
          <div className="flex items-center gap-3">
            <button onClick={() => setIsFullscreen(false)} className="text-white hover:text-gray-300"><ArrowLeft className="h-4 w-4" /></button>
            <span className="text-sm text-white font-medium">Public Preview — {device}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center rounded-md bg-gray-800 p-0.5">
              <button onClick={() => setDevice('desktop')} className={`p-1.5 rounded ${device === 'desktop' ? 'bg-gray-600' : ''}`}><Monitor className="h-4 w-4 text-white" /></button>
              <button onClick={() => setDevice('tablet')} className={`p-1.5 rounded ${device === 'tablet' ? 'bg-gray-600' : ''}`}><Tablet className="h-4 w-4 text-white" /></button>
              <button onClick={() => setDevice('mobile')} className={`p-1.5 rounded ${device === 'mobile' ? 'bg-gray-600' : ''}`}><Smartphone className="h-4 w-4 text-white" /></button>
            </div>
            <button onClick={() => setRefreshKey(k => k + 1)} className="p-1.5 rounded hover:bg-gray-700"><RotateCcw className="h-4 w-4 text-white" /></button>
            <a href={publicUrl} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded hover:bg-gray-700"><ExternalLink className="h-4 w-4 text-white" /></a>
          </div>
        </div>
        <div className="flex-1 flex items-start justify-center overflow-auto p-4">
          <div className="bg-white rounded-lg shadow-2xl overflow-hidden transition-all duration-300" style={{ width: config.width, height: 'calc(100vh - 80px)', maxWidth: '100%' }}>
            <iframe key={refreshKey} src={publicUrl} className="w-full h-full border-0" title="Public website preview" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between rounded-lg border bg-card p-3">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push('/templates/builder')} className="p-1.5 rounded-md hover:bg-muted"><ArrowLeft className="h-4 w-4" /></button>
          <div>
            <h1 className="text-sm font-semibold">Public Website Preview</h1>
            <p className="text-xs text-muted-foreground">Preview how your website looks to visitors</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Device Switcher */}
          <div className="flex items-center rounded-md border bg-muted/50 p-0.5">
            <button onClick={() => setDevice('desktop')} className={`p-1.5 rounded text-xs flex items-center gap-1 ${device === 'desktop' ? 'bg-white shadow-sm font-medium' : 'text-muted-foreground'}`}><Monitor className="h-3.5 w-3.5" /><span className="hidden sm:inline">Desktop</span></button>
            <button onClick={() => setDevice('tablet')} className={`p-1.5 rounded text-xs flex items-center gap-1 ${device === 'tablet' ? 'bg-white shadow-sm font-medium' : 'text-muted-foreground'}`}><Tablet className="h-3.5 w-3.5" /><span className="hidden sm:inline">Tablet</span></button>
            <button onClick={() => setDevice('mobile')} className={`p-1.5 rounded text-xs flex items-center gap-1 ${device === 'mobile' ? 'bg-white shadow-sm font-medium' : 'text-muted-foreground'}`}><Smartphone className="h-3.5 w-3.5" /><span className="hidden sm:inline">Mobile</span></button>
          </div>
          <span className="text-[10px] text-muted-foreground hidden md:inline">{config.label}</span>
          <button onClick={() => setRefreshKey(k => k + 1)} className="p-2 rounded-md hover:bg-muted" title="Refresh preview"><RotateCcw className="h-4 w-4" /></button>
          <button onClick={() => setIsFullscreen(true)} className="p-2 rounded-md hover:bg-muted" title="Fullscreen"><Maximize2 className="h-4 w-4" /></button>
          <a href={publicUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs hover:bg-muted"><ExternalLink className="h-3.5 w-3.5" />Open</a>
        </div>
      </div>

      {/* Preview Frame */}
      <div className="rounded-lg border bg-gray-100 p-4 flex justify-center" style={{ minHeight: 'calc(100vh - 280px)' }}>
        <div
          className="bg-white rounded-lg shadow-lg overflow-hidden border transition-all duration-300"
          style={{ width: config.width, maxWidth: '100%', height: 'calc(100vh - 320px)' }}
        >
          <iframe
            key={refreshKey}
            src={publicUrl}
            className="w-full h-full border-0"
            title="Public website preview"
            sandbox="allow-scripts allow-same-origin allow-forms"
          />
        </div>
      </div>
    </div>
  );
}
