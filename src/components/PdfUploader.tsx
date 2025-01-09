import React, { useCallback } from 'react';
import { View, Button, Text } from "@aws-amplify/ui-react";
import * as pdfjsLib from 'pdfjs-dist';

pdfjsLib.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.js`;

interface PdfUploaderProps {
  onPdfContent: (content: string) => void;
}

export const PdfUploader: React.FC<PdfUploaderProps> = ({ onPdfContent }) => {
  const [loading, setLoading] = React.useState(false);

  const extractText = async (file: File) => {
    setLoading(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      let fullText = '';
      
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map((item: any) => item.str).join(' ');
        fullText += pageText + '\n';
      }
      
      onPdfContent(fullText);
    } catch (error) {
      console.error('Error reading PDF:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      extractText(file);
    }
  }, [onPdfContent]);

  return (
    <View>
      <input
        type="file"
        accept=".pdf"
        onChange={handleFileChange}
        style={{ display: 'none' }}
        id="pdf-upload"
      />
      <label htmlFor="pdf-upload">
        <Button as="span" isLoading={loading}>
          Upload PDF
        </Button>
      </label>
      {loading && <Text>Processing PDF...</Text>}
    </View>
  );
}; 