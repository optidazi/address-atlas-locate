import React, { useState, useRef, useCallback } from 'react';
import { Camera, Upload, Scan, CheckCircle, AlertCircle, Info, Globe, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { useLanguage } from '../contexts/LanguageContext';
import Tesseract from 'tesseract.js';

interface ScanResult {
  address: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  confidence: number;
}

const OCRScanner = () => {
  const { t } = useLanguage();
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [ocrProgress, setOcrProgress] = useState(0);
  const [extractedText, setExtractedText] = useState<string>('');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('eng');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Language options for OCR
  const languageOptions = [
    { code: 'eng', name: t('lang.english') },
    { code: 'mon', name: t('lang.mongolianCyrillic') },
    { code: 'eng+mon', name: t('lang.englishMongolian') },
  ];

  // Extract what3words addresses from text using multiple regex patterns
  const extractWhat3Words = (text: string): string[] => {
    console.log('Analyzing text for what3words addresses:', text);
    
    // Multiple patterns to catch different variations
    const patterns = [
      /\/{3}([a-z]+\.){2}[a-z]+/gi,           // Standard: ///word.word.word
      /\/\/\/([a-z]+\.){2}[a-z]+/gi,         // Alternative slashes
      /([a-z]+\.){2}[a-z]+/gi,               // Without slashes: word.word.word
      /\b([a-z]{3,}\.[a-z]{3,}\.[a-z]{3,})\b/gi, // At least 3 chars per word
    ];
    
    let matches: string[] = [];
    
    patterns.forEach((pattern, index) => {
      const found = text.match(pattern);
      if (found) {
        console.log(`Pattern ${index + 1} found:`, found);
        // Normalize found addresses to standard format
        const normalized = found.map(addr => {
          if (!addr.startsWith('///')) {
            return '///' + addr.replace(/^\/+/, '');
          }
          return addr;
        });
        matches.push(...normalized);
      }
    });
    
    // Remove duplicates and filter valid formats
    const unique = [...new Set(matches)];
    const valid = unique.filter(addr => {
      const parts = addr.replace(/^\/+/, '').split('.');
      return parts.length === 3 && parts.every(part => part.length >= 2);
    });
    
    console.log('Valid what3words addresses found:', valid);
    return valid;
  };

  // Convert what3words to coordinates (using mock data for now - in real app would use what3words API)
  const convertToCoordinates = async (address: string): Promise<{ lat: number; lng: number }> => {
    // Mock coordinates - in a real implementation, you'd call the what3words API
    const mockCoordinates = {
      '///filled.count.soap': { lat: 51.521251, lng: -0.203586 },
      '///index.home.raft': { lat: 51.508112, lng: -0.075949 },
      '///daring.lion.race': { lat: 51.495326, lng: -0.191406 },
      '///table.lamp.house': { lat: 51.515419, lng: -0.141204 },
    };
    
    return mockCoordinates[address as keyof typeof mockCoordinates] || 
           { lat: 51.5074 + (Math.random() - 0.5) * 0.1, lng: -0.1278 + (Math.random() - 0.5) * 0.1 };
  };

  // Updated OCR processing function with language support
  const processOCR = useCallback(async (imageData: string): Promise<ScanResult> => {
    return new Promise((resolve, reject) => {
      console.log(`Starting OCR with language: ${selectedLanguage}`);
      Tesseract.recognize(
        imageData,
        selectedLanguage,
        {
          logger: m => {
            if (m.status === 'recognizing text') {
              setOcrProgress(Math.round(m.progress * 100));
            }
          }
        }
      ).then(async ({ data }) => {
        console.log('OCR Text detected:', data.text);
        setExtractedText(data.text);
        
        const what3wordsAddresses = extractWhat3Words(data.text);
        console.log('what3words addresses found:', what3wordsAddresses);
        
        if (what3wordsAddresses.length === 0) {
          throw new Error(`No what3words addresses found. Extracted text: "${data.text.substring(0, 100)}..."`);
        }
        
        // Use the first detected address
        const address = what3wordsAddresses[0];
        const coordinates = await convertToCoordinates(address);
        
        resolve({
          address,
          coordinates,
          confidence: data.confidence / 100,
        });
      }).catch(reject);
    });
  }, [selectedLanguage]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error(t('toast.selectImage'));
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      const imageData = e.target?.result as string;
      setPreviewImage(imageData);
      setIsScanning(true);
      setScanResult(null);
      setOcrProgress(0);
      setExtractedText('');

      try {
        const result = await processOCR(imageData);
        setScanResult(result);
        toast.success(`${t('toast.addressDetected')}: ${result.address}`);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : t('toast.processingFailed');
        toast.error(errorMessage);
        console.error('OCR processing error:', error);
      } finally {
        setIsScanning(false);
        setOcrProgress(0);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleCameraCapture = () => {
    toast.info(t('toast.cameraInfo'));
    
    // Simulate camera capture for demo
    setIsScanning(true);
    setTimeout(async () => {
      try {
        // Use a sample what3words address for camera demo
        const result = {
          address: '///camera.test.demo',
          coordinates: { lat: 51.5074, lng: -0.1278 },
          confidence: 0.88,
        };
        setScanResult(result);
        toast.success(`${t('toast.addressDetected')}: ${result.address}`);
      } catch (error) {
        toast.error(t('toast.processingFailed'));
      } finally {
        setIsScanning(false);
      }
    }, 1500);
  };

  const handleClearImage = () => {
    setPreviewImage(null);
    setScanResult(null);
    setExtractedText('');
    setOcrProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    toast.success(t('toast.imageCleared') || 'Image cleared');
  };

  const addToDeliveryList = () => {
    if (scanResult) {
      window.dispatchEvent(new CustomEvent('addDelivery', {
        detail: {
          id: Date.now().toString(),
          what3words: scanResult.address,
          coordinates: scanResult.coordinates,
          status: 'pending',
          addedAt: new Date().toISOString(),
        }
      }));
      toast.success(t('toast.addedToDelivery'));
      setScanResult(null);
      setPreviewImage(null);
      setExtractedText('');
    }
  };

  return (
    <div className="space-y-6">
      {/* Language Selection */}
      <Card className="p-4">
        <div className="flex items-center space-x-3 mb-3">
          <Globe className="h-5 w-5 text-blue-600" />
          <h4 className="font-medium text-gray-900">{t('ocr.language')}</h4>
        </div>
        <select
          value={selectedLanguage}
          onChange={(e) => setSelectedLanguage(e.target.value)}
          className="w-full border rounded px-3 py-2 text-sm"
          disabled={isScanning}
        >
          {languageOptions.map(lang => (
            <option key={lang.code} value={lang.code}>
              {lang.name}
            </option>
          ))}
        </select>
        <p className="text-xs text-gray-500 mt-2">
          {t('ocr.languageHelp')}
        </p>
      </Card>

      {/* Upload Controls */}
      <div className="grid grid-cols-3 gap-4">
        <Button
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center justify-center space-x-2 h-12"
          variant="outline"
          disabled={isScanning}
        >
          <Upload className="h-4 w-4" />
          <span>{t('ocr.uploadImage')}</span>
        </Button>
        <Button
          onClick={handleCameraCapture}
          className="flex items-center justify-center space-x-2 h-12"
          disabled={isScanning}
        >
          <Camera className="h-4 w-4" />
          <span>{t('ocr.useCamera')}</span>
        </Button>
        <Button
          onClick={handleClearImage}
          className="flex items-center justify-center space-x-2 h-12"
          variant="outline"
          disabled={isScanning || (!previewImage && !scanResult)}
        >
          <X className="h-4 w-4" />
          <span>Clear</span>
        </Button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* Image Preview */}
      {previewImage && (
        <Card className="p-4">
          <img
            src={previewImage}
            alt="Uploaded for OCR"
            className="w-full h-48 object-cover rounded-lg"
          />
        </Card>
      )}

      {/* Extracted Text Display */}
      {extractedText && !isScanning && !scanResult && (
        <Card className="p-4 bg-yellow-50 border-yellow-200">
          <div className="flex items-start space-x-3">
            <Info className="h-5 w-5 text-yellow-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-yellow-800 mb-2">{t('ocr.extractedText')}</h4>
              <p className="text-sm text-yellow-700 bg-white p-2 rounded border">
                "{extractedText}"
              </p>
              <p className="text-xs text-yellow-600 mt-2">
                {t('ocr.noAddressFound')}
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Scanning Status */}
      {isScanning && (
        <Card className="p-6">
          <div className="flex items-center justify-center space-x-3">
            <Scan className="h-6 w-6 text-blue-600 animate-spin" />
            <div>
              <p className="font-medium text-gray-900">{t('ocr.processing')}</p>
              <p className="text-sm text-gray-600">
                {ocrProgress > 0 ? `${t('ocr.recognizing')}: ${ocrProgress}%` : t('ocr.scanning')}
              </p>
            </div>
          </div>
          <div className="mt-4 bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
              style={{ width: `${ocrProgress}%` }}
            ></div>
          </div>
        </Card>
      )}

      {/* Scan Results */}
      {scanResult && !isScanning && (
        <Card className="p-6 border-green-200 bg-green-50">
          <div className="flex items-start space-x-3">
            <CheckCircle className="h-6 w-6 text-green-600 mt-1" />
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 mb-2">{t('ocr.addressDetected')}</h3>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium text-gray-700">{t('ocr.what3words')}</span>
                  <span className="ml-2 font-mono bg-white px-2 py-1 rounded text-blue-600">
                    {scanResult.address}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">{t('ocr.coordinates')}</span>
                  <span className="ml-2 text-gray-600">
                    {scanResult.coordinates.lat.toFixed(6)}, {scanResult.coordinates.lng.toFixed(6)}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">{t('ocr.confidence')}</span>
                  <span className="ml-2 text-gray-600">{(scanResult.confidence * 100).toFixed(1)}%</span>
                </div>
              </div>
              <Button
                onClick={addToDeliveryList}
                className="mt-4 w-full"
                size="sm"
              >
                {t('ocr.addToDelivery')}
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Instructions */}
      <Card className="p-4 bg-blue-50 border-blue-200">
        <div className="flex items-start space-x-3">
          <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">{t('tips.title')}</p>
            <ul className="space-y-1 text-blue-700">
              <li>• {t('tips.format')}</li>
              <li>• {t('tips.language')}</li>
              <li>• {t('tips.lighting')}</li>
              <li>• {t('tips.visibility')}</li>
              <li>• {t('tips.printed')}</li>
              <li>• {t('tips.angles')}</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default OCRScanner;
