"use client";

import { useCallback, useRef, useState } from "react";

/**
 * Hook untuk download invoice sebagai PDF menggunakan browser print API
 * Tidak memerlukan library eksternal apapun.
 */
export function useInvoiceDownload() {
  const [downloading, setDownloading] = useState(false);

  const downloadInvoice = useCallback(
    (invoiceElementId: string, filename: string = "invoice.pdf") => {
      const el = document.getElementById(invoiceElementId);
      if (!el) {
        console.error("Invoice element not found:", invoiceElementId);
        return;
      }

      setDownloading(true);

      try {
        // Buat iframe tersembunyi khusus untuk print
        const iframe = document.createElement("iframe");
        iframe.style.position = "fixed";
        iframe.style.right = "0";
        iframe.style.bottom = "0";
        iframe.style.width = "0";
        iframe.style.height = "0";
        iframe.style.border = "0";
        document.body.appendChild(iframe);

        const iframeDoc =
          iframe.contentDocument || iframe.contentWindow?.document;
        if (!iframeDoc) {
          throw new Error("Could not access iframe document");
        }

        iframeDoc.open();
        iframeDoc.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8" />
              <title>${filename.replace(".pdf", "")}</title>
              <style>
                @page {
                  size: A4;
                  margin: 0;
                }
                * {
                  -webkit-print-color-adjust: exact !important;
                  print-color-adjust: exact !important;
                  color-adjust: exact !important;
                  box-sizing: border-box;
                }
                body {
                  margin: 0;
                  padding: 0;
                  background: white;
                }
                #print-content {
                  width: 794px;
                  margin: 0 auto;
                }
              </style>
            </head>
            <body>
              <div id="print-content">
                ${el.outerHTML}
              </div>
            </body>
          </html>
        `);
        iframeDoc.close();

        // Trigger print setelah konten dimuat
        iframe.onload = () => {
          setTimeout(() => {
            try {
              iframe.contentWindow?.focus();
              iframe.contentWindow?.print();
            } finally {
              setTimeout(() => {
                document.body.removeChild(iframe);
                setDownloading(false);
              }, 1000);
            }
          }, 500);
        };

        // Fallback timeout
        setTimeout(() => {
          if (document.body.contains(iframe)) {
            try {
              iframe.contentWindow?.focus();
              iframe.contentWindow?.print();
            } finally {
              setTimeout(() => {
                if (document.body.contains(iframe)) {
                  document.body.removeChild(iframe);
                }
                setDownloading(false);
              }, 1000);
            }
          }
        }, 1500);
      } catch (err) {
        console.error("Error printing invoice:", err);
        setDownloading(false);
      }
    },
    [],
  );

  return { downloadInvoice, downloading };
}
