import { component$, useSignal } from '@builder.io/qwik';
import type { ProductDocument } from '../../lib/db';
import PDFFlipbook from './PDFFlipbook';

// Document type labels and grouping order
const DOC_TYPE_LABELS: Record<string, string> = {
  spec_sheet: 'Spec Sheets',
  datasheet: 'Datasheets',
  manual: 'Manuals & Guides',
  quick_start: 'Quick Start Guides',
  wiring_diagram: 'Wiring Diagrams',
  warranty: 'Warranty',
  certification: 'Certifications',
  certificate: 'Certificates',
  video: 'Videos',
  other: 'Other Documents',
};

function formatFileSize(bytes: number | null): string {
  if (!bytes || bytes === 0) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function isPdf(filename: string): boolean {
  return filename.toLowerCase().endsWith('.pdf');
}

export default component$<{ documents: ProductDocument[] }>(({ documents }) => {
  const pdfUrl = useSignal<string | null>(null);
  const pdfTitle = useSignal('');

  if (!documents || documents.length === 0) return null;

  // Filter out images — they're shown in the gallery
  const docs = documents.filter(d => d.document_type !== 'image');
  if (docs.length === 0) return null;

  // Group by type
  const grouped = new Map<string, ProductDocument[]>();
  for (const doc of docs) {
    const type = doc.document_type;
    if (!grouped.has(type)) grouped.set(type, []);
    grouped.get(type)!.push(doc);
  }

  return (
    <>
      <section class="py-8 border-t border-gray-200">
        <div class="px-6">
          <div class="max-w-3xl">
            <h2 class="font-heading font-bold text-xl text-[#042e0d] mb-4">Product Documents</h2>

            <div class="space-y-4">
              {Array.from(grouped.entries()).map(([type, typeDocs]) => (
                <div key={type}>
                  <p class="text-xs font-mono text-[#c3a859] uppercase tracking-wide mb-2">
                    {DOC_TYPE_LABELS[type] || type}
                  </p>
                  <div class="space-y-1">
                    {typeDocs.map((doc) => (
                      <div
                        key={doc.id}
                        class="flex items-center gap-3 py-2 px-3 rounded hover:bg-gray-50 transition-colors group"
                      >
                        {/* File icon */}
                        <div class="flex-shrink-0">
                          {isPdf(doc.filename) ? (
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-red-500" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zM6 20V4h7v5h5v11H6z" />
                              <path d="M8 12h2v2H8v3H7v-3H6v-2h2v-1h2v1zm4 0h2c.6 0 1 .4 1 1v1c0 .6-.4 1-1 1h-1v2h-1v-5zm1 2h1v-1h-1v1zm3-2h2c.6 0 1 .4 1 1v3c0 .6-.4 1-1 1h-2v-5zm1 4h1v-3h-1v3z" />
                            </svg>
                          ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                              <path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          )}
                        </div>

                        {/* Filename */}
                        <span class="flex-1 text-sm text-gray-700 truncate" title={doc.filename}>
                          {doc.filename}
                        </span>

                        {/* File size */}
                        {doc.file_size ? (
                          <span class="text-xs text-gray-400 flex-shrink-0">
                            {formatFileSize(doc.file_size)}
                          </span>
                        ) : null}

                        {/* Actions */}
                        <div class="flex items-center gap-2 flex-shrink-0">
                          {isPdf(doc.filename) && (
                            <button
                              onClick$={() => {
                                pdfUrl.value = doc.r2_url;
                                pdfTitle.value = doc.filename;
                              }}
                              class="text-xs font-semibold text-[#5974c3] hover:text-[#042e0d] transition-colors"
                            >
                              View
                            </button>
                          )}
                          <a
                            href={doc.r2_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            download={doc.filename}
                            class="text-xs font-semibold text-[#042e0d] hover:text-[#56c270] transition-colors"
                          >
                            Download
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* PDF Viewer Modal */}
      {pdfUrl.value && (
        <PDFFlipbook
          url={pdfUrl.value}
          title={pdfTitle.value}
          onClose$={() => { pdfUrl.value = null; }}
        />
      )}
    </>
  );
});
