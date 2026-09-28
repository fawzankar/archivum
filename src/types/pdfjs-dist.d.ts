declare module 'pdfjs-dist/build/pdf.mjs' {
  export interface PDFViewport {
    width: number;
    height: number;
  }

  export interface PDFRenderTask {
    promise: Promise<unknown>;
    cancel?: () => void;
  }

  export interface PDFPageProxy {
    getViewport(options: { scale: number }): PDFViewport;
    render(options: {
      canvasContext: CanvasRenderingContext2D;
      viewport: PDFViewport;
      intent?: string;
    }): PDFRenderTask;
  }

  export interface PDFDocumentProxy {
    numPages: number;
    getPage(pageNumber: number): Promise<PDFPageProxy>;
    destroy(): Promise<void>;
  }

  export interface PDFDocumentLoadingTask {
    promise: Promise<PDFDocumentProxy>;
  }

  export interface PDFDocumentInitParameters {
    url: string;
    disableAutoFetch?: boolean;
    disableStream?: boolean;
    rangeChunkSize?: number;
  }

  export const GlobalWorkerOptions: {
    workerSrc: string;
  };

  export function getDocument(
    options: PDFDocumentInitParameters,
  ): PDFDocumentLoadingTask;
}
