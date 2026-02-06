import { component$, useSignal, useVisibleTask$, $, type QRL } from '@builder.io/qwik';

interface PDFFlipbookProps {
  url: string;
  title: string;
  onClose$: QRL<() => void>;
}

export default component$<PDFFlipbookProps>(({ url, title, onClose$ }) => {
  const canvasRef = useSignal<HTMLCanvasElement>();
  const currentPage = useSignal(1);
  const totalPages = useSignal(0);
  const scale = useSignal(1.0);
  const loading = useSignal(true);
  const errorMsg = useSignal('');

  const doRenderPage = $(async (pageNum: number, renderScale: number) => {
    const pdfDoc = (window as any).__currentPdfDoc;
    const canvas = canvasRef.value;
    if (!pdfDoc || !canvas) return;

    const page = await pdfDoc.getPage(pageNum);
    const viewport = page.getViewport({ scale: renderScale });

    const container = canvas.parentElement;
    if (container) {
      const containerWidth = container.clientWidth - 32;
      const fitScale = containerWidth / viewport.width;
      const adjustedScale = Math.min(fitScale, renderScale);
      const adjustedViewport = page.getViewport({ scale: adjustedScale });

      canvas.height = adjustedViewport.height;
      canvas.width = adjustedViewport.width;

      const ctx = canvas.getContext('2d')!;
      await page.render({ canvasContext: ctx, viewport: adjustedViewport }).promise;
    }
  });

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(async ({ cleanup }) => {
    const pdfjsVersion = '3.11.174';
    const cdnBase = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsVersion}`;

    try {
      if (!(window as any).pdfjsLib) {
        const scriptTag = document.createElement('script');
        scriptTag.src = `${cdnBase}/pdf.min.js`;
        scriptTag.async = true;

        await new Promise<void>((resolve, reject) => {
          scriptTag.onload = () => resolve();
          scriptTag.onerror = () => reject(new Error('Failed to load pdf.js'));
          document.head.appendChild(scriptTag);
        });
      }

      const pdfjsLib = (window as any).pdfjsLib;
      if (!pdfjsLib) {
        errorMsg.value = 'PDF viewer failed to initialize';
        loading.value = false;
        return;
      }

      pdfjsLib.GlobalWorkerOptions.workerSrc = `${cdnBase}/pdf.worker.min.js`;

      const loadingTask = pdfjsLib.getDocument(url);
      const pdfDoc = await loadingTask.promise;

      (window as any).__currentPdfDoc = pdfDoc;
      totalPages.value = pdfDoc.numPages;

      await doRenderPage(1, scale.value);
      loading.value = false;
    } catch (err) {
      console.error('PDF loading error:', err);
      errorMsg.value = 'Failed to load PDF. Try downloading instead.';
      loading.value = false;
    }

    const handleKeydown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose$();
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        const pdfDoc = (window as any).__currentPdfDoc;
        if (pdfDoc && currentPage.value > 1) {
          currentPage.value--;
          doRenderPage(currentPage.value, scale.value);
        }
      } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        const pdfDoc = (window as any).__currentPdfDoc;
        if (pdfDoc && currentPage.value < totalPages.value) {
          currentPage.value++;
          doRenderPage(currentPage.value, scale.value);
        }
      }
    };

    document.addEventListener('keydown', handleKeydown);

    cleanup(() => {
      document.removeEventListener('keydown', handleKeydown);
      delete (window as any).__currentPdfDoc;
    });
  });

  return (
    <div
      class="fixed inset-0 z-50 bg-black/80 flex items-center justify-center"
      onClick$={(e) => {
        if ((e.target as HTMLElement).classList.contains('fixed')) {
          onClose$();
        }
      }}
    >
      <div class="bg-white rounded-lg shadow-2xl w-full max-w-4xl max-h-[95vh] flex flex-col mx-4">
        {/* Header */}
        <div class="flex items-center justify-between px-4 py-3 border-b border-gray-200">
          <h3 class="font-heading font-bold text-[#042e0d] text-sm truncate flex-1 mr-4">
            {title}
          </h3>

          <div class="flex items-center gap-2">
            {/* Page controls */}
            {totalPages.value > 1 && (
              <div class="flex items-center gap-1 text-sm">
                <button
                  onClick$={async () => {
                    if (currentPage.value > 1) {
                      currentPage.value--;
                      await doRenderPage(currentPage.value, scale.value);
                    }
                  }}
                  disabled={currentPage.value <= 1}
                  class="px-2 py-1 rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <span class="text-gray-600 min-w-[60px] text-center">
                  {currentPage.value} / {totalPages.value}
                </span>
                <button
                  onClick$={async () => {
                    if (currentPage.value < totalPages.value) {
                      currentPage.value++;
                      await doRenderPage(currentPage.value, scale.value);
                    }
                  }}
                  disabled={currentPage.value >= totalPages.value}
                  class="px-2 py-1 rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            )}

            {/* Zoom controls */}
            <div class="flex items-center gap-1 border-l border-gray-200 pl-2 ml-1">
              <button
                onClick$={async () => {
                  if (scale.value > 0.5) {
                    scale.value = Math.max(0.5, scale.value - 0.25);
                    await doRenderPage(currentPage.value, scale.value);
                  }
                }}
                class="px-2 py-1 rounded hover:bg-gray-100 text-sm font-bold"
                title="Zoom out"
              >
                -
              </button>
              <span class="text-xs text-gray-500 min-w-[40px] text-center">
                {Math.round(scale.value * 100)}%
              </span>
              <button
                onClick$={async () => {
                  if (scale.value < 3.0) {
                    scale.value = Math.min(3.0, scale.value + 0.25);
                    await doRenderPage(currentPage.value, scale.value);
                  }
                }}
                class="px-2 py-1 rounded hover:bg-gray-100 text-sm font-bold"
                title="Zoom in"
              >
                +
              </button>
            </div>

            {/* Download */}
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              download={title}
              class="px-2 py-1 rounded hover:bg-gray-100 border-l border-gray-200 pl-2 ml-1"
              title="Download PDF"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            </a>

            {/* Close */}
            <button
              onClick$={() => onClose$()}
              class="px-2 py-1 rounded hover:bg-gray-100 border-l border-gray-200 pl-2 ml-1"
              title="Close (Esc)"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Canvas area */}
        <div class="flex-1 overflow-auto bg-gray-100 flex items-start justify-center p-4">
          {loading.value && (
            <div class="flex items-center justify-center py-20">
              <div class="animate-spin rounded-full h-8 w-8 border-2 border-[#042e0d] border-t-transparent" />
              <span class="ml-3 text-gray-500">Loading PDF...</span>
            </div>
          )}

          {errorMsg.value && (
            <div class="text-center py-20">
              <p class="text-gray-500 mb-4">{errorMsg.value}</p>
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                class="inline-flex items-center gap-2 bg-[#042e0d] text-white font-heading font-bold px-5 py-2 rounded hover:bg-[#042e0d]/80 transition-colors"
              >
                Download PDF
              </a>
            </div>
          )}

          <canvas
            ref={canvasRef}
            class={[
              'shadow-lg bg-white',
              loading.value || errorMsg.value ? 'hidden' : ''
            ].join(' ')}
          />
        </div>
      </div>
    </div>
  );
});
