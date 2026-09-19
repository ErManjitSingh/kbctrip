/**
 * Local-only upload queue (no Unotrips CDN).
 * Reads files as data URLs so the Add Property wizard keeps working offline of :8000.
 */

export type UploadResult = { cdnUrl: string; url?: string };
export type CompressResult = { file: File; originalSize: number; compressedSize: number };

export interface QueueCallbacks {
  onCompressing: () => void;
  onUploading: () => void;
  onProgress: (pct: number) => void;
  onRetry: (attempt: number) => void;
  onSuccess: (result: UploadResult, compress: CompressResult) => void;
  onError: (message: string) => void;
  onCancelled: () => void;
}

interface QueueItem {
  id: string;
  rawFile: File;
  controller: AbortController;
  callbacks: QueueCallbacks;
}

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error ?? new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

export class UploadQueue {
  private pending: QueueItem[] = [];
  private active = 0;
  private concurrency: number;

  constructor(_opts: {
    endpoint: string;
    category: string;
    categoryField?: string;
    propertyId: string;
    getToken: () => string | null;
    concurrency?: number;
    maxRetries?: number;
    retryDelayMs?: number;
    compress?: boolean;
    compressMaxPx?: number;
    compressQuality?: number;
  }) {
    this.concurrency = _opts.concurrency ?? 2;
  }

  enqueue(id: string, rawFile: File, controller: AbortController, callbacks: QueueCallbacks): void {
    this.pending.push({ id, rawFile, controller, callbacks });
    this.drain();
  }

  cancel(id: string): void {
    const idx = this.pending.findIndex((i) => i.id === id);
    if (idx !== -1) {
      const [item] = this.pending.splice(idx, 1);
      item.callbacks.onCancelled();
    }
  }

  private drain(): void {
    while (this.active < this.concurrency && this.pending.length > 0) {
      const item = this.pending.shift()!;
      this.active += 1;
      void this.process(item).finally(() => {
        this.active -= 1;
        this.drain();
      });
    }
  }

  private async process(item: QueueItem): Promise<void> {
    const { rawFile, controller, callbacks } = item;
    if (controller.signal.aborted) {
      callbacks.onCancelled();
      return;
    }
    callbacks.onCompressing();
    callbacks.onUploading();
    callbacks.onProgress(10);
    try {
      const cdnUrl = await readAsDataUrl(rawFile);
      callbacks.onProgress(100);
      callbacks.onSuccess(
        { cdnUrl, url: cdnUrl },
        { file: rawFile, originalSize: rawFile.size, compressedSize: rawFile.size },
      );
    } catch (err) {
      callbacks.onError(err instanceof Error ? err.message : 'Upload failed');
    }
  }
}
