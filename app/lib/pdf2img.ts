export interface PdfConversionResult {
    imageUrl: string;
    file: File | null;
    error?: string;
}

let pdfjsLib: any = null;

async function loadPdfJs() {
    if (pdfjsLib) return pdfjsLib;

    if (typeof window === "undefined") return null;

    const lib = await import("pdfjs-dist/legacy/build/pdf.mjs");
    const worker = await import("pdfjs-dist/legacy/build/pdf.worker.min.mjs?url");

    lib.GlobalWorkerOptions.workerSrc = worker.default;

    pdfjsLib = lib;
    return lib;
}

export async function convertPdfToImage(
    file: File
): Promise<PdfConversionResult> {
    try {
        if (!file.type.includes("pdf")) {
            return {
                imageUrl: "",
                file: null,
                error: "File is not a PDF",
            };
        }

        const lib = await loadPdfJs();
        if (!lib) {
            return {
                imageUrl: "",
                file: null,
                error: "PDF conversion only supported in browser",
            };
        }

        const arrayBuffer = await file.arrayBuffer();
        const pdf = await lib.getDocument({ data: arrayBuffer }).promise;
        const page = await pdf.getPage(1);

        const viewport = page.getViewport({ scale: 3 });
        const canvas = document.createElement("canvas");

        canvas.width = viewport.width;
        canvas.height = viewport.height;

        await page.render({ canvas, viewport }).promise;

        return new Promise((resolve) => {
            canvas.toBlob((blob) => {
                if (!blob) {
                    resolve({
                        imageUrl: "",
                        file: null,
                        error: "Failed to generate PNG blob",
                    });
                    return;
                }

                const originalName = file.name.replace(/\.pdf$/i, "");
                const imageFile = new File([blob], `${originalName}.png`, {
                    type: "image/png",
                });

                resolve({
                    imageUrl: URL.createObjectURL(blob),
                    file: imageFile,
                });
            }, "image/png", 1);
        });

    } catch (err: any) {
        console.error("PDF conversion error:", err);
        return {
            imageUrl: "",
            file: null,
            error: err?.message || "Unknown PDF conversion error",
        };
    }
}
