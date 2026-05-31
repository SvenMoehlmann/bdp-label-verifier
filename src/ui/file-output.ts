import { DOCUMENT, inject, Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class FileOutput {
  private document = inject(DOCUMENT);
  private windowContext = this.document.defaultView;

  exportTextFile(text: string, filename: string) {
    if (!this.windowContext) return;

    const isFileSystemApiSupported = 'showSaveFilePicker' in this.windowContext;

    if(this.windowContext.isSecureContext && isFileSystemApiSupported) {
      this.exportUsingFileSystemApi(text, filename);
    }
    else {
      this.exportUsingBlob(text, filename);
    }
  }

  private async exportUsingFileSystemApi(text: string, filename: string) {
    try {
      const fileHandle = await (this.windowContext as any).showSaveFilePicker({
        suggestedName: filename,
        types: [
          {
            description: 'Text Files',
            accept: { 'text/plain': ['.txt'] },
          },
        ],
      });

      const writable = await fileHandle.createWritable();
      await writable.write(text);
      await writable.close();

    } catch (error: any) {
      if (error.name === 'AbortError') return;
      console.warn('File System API failed, falling back to Blob...', error);
    }
  }

  private exportUsingBlob(text: string, filename: string) {
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);

    const link = this.document.createElement('a');
    link.href = url;
    link.download = filename;

    this.document.body.appendChild(link);
    link.click();
    this.document.body.removeChild(link);

    URL.revokeObjectURL(url);
  }
}
