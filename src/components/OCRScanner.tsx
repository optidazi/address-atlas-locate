
import React, { useState, useRef, useCallback } from 'react';
import { Camera, Upload, Scan, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';

interface ScanResult {
  address: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  confidence: number;
}

const OCRScanner = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Mock OCR processing function (in real implementation, this would use what3words OCR)
  const processOCR = useCallback(async (imageData: string): Promise<ScanResult> => {
    // Simulate OCR processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Mock OCR results with various what3words addresses
    const mockResults = [
      { address: '///filled.count.soap', coordinates: { lat: 51.521251, lng: -0.203586 }, confidence: 0.95 },
      { address: '///index.home.raft', coordinates: { lat: 51.508112, lng: -0.075949 }, confidence: 0.89 },
      { address: '///daring.lion.race', coordinates: { lat: 51.495326, lng: -0.191406 }, confidence: 0.92 },
      { address: '///table.lamp.house', coordinates: { lat: 51.515419, lng: -0.141204 }, confidence: 0.87 },
    ];
    
    return mockResults[Math.floor(Math.random() * mockResults.length)];
  }, []);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      const imageData = e.target?.result as string;
      setPreviewImage(imageData);
      setIsScanning(true);
      setScanResult(null);

      try {
        const result = await processOCR(imageData);
        setScanResult(result);
        toast.success(`what3words address detected: ${result.address}`);
      } catch (error) {
        toast.error('Failed to process image. Please try again.');
        console.error('OCR processing error:', error);
      } finally {
        setIsScanning(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleCameraCapture = () => {
    // In a real implementation, this would open camera interface
    toast.info('Camera feature would open here in a real implementation');
    
    // Simulate camera capture for demo
    setIsScanning(true);
    setTimeout(async () => {
      try {
        const result = await processOCR('mock_camera_data');
        setScanResult(result);
        toast.success(`what3words address detected: ${result.address}`);
      } catch (error) {
        toast.error('Failed to process camera image');
      } finally {
        setIsScanning(false);
      }
    }, 1500);
  };

  const addToDeliveryList = () => {
    if (scanResult) {
      // Dispatch custom event to add to delivery list
      window.dispatchEvent(new CustomEvent('addDelivery', {
        detail: {
          id: Date.now().toString(),
          what3words: scanResult.address,
          coordinates: scanResult.coordinates,
          status: 'pending',
          addedAt: new Date().toISOString(),
        }
      }));
      toast.success('Added to delivery list');
      setScanResult(null);
      setPreviewImage(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Upload Controls */}
      <div className="grid grid-cols-2 gap-4">
        <Button
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center justify-center space-x-2 h-12"
          variant="outline"
        >
          <Upload className="h-4 w-4" />
          <span>Upload Image</span>
        </Button>
        <Button
          onClick={handleCameraCapture}
          className="flex items-center justify-center space-x-2 h-12"
        >
          <Camera className="h-4 w-4" />
          <span>Use Camera</span>
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

      {/* Scanning Status */}
      {isScanning && (
        <Card className="p-6">
          <div className="flex items-center justify-center space-x-3">
            <Scan className="h-6 w-6 text-blue-600 animate-spin" />
            <div>
              <p className="font-medium text-gray-900">Processing Image...</p>
              <p className="text-sm text-gray-600">Scanning for what3words addresses</p>
            </div>
          </div>
          <div className="mt-4 bg-gray-200 rounded-full h-2">
            <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: '70%' }}></div>
          </div>
        </Card>
      )}

      {/* Scan Results */}
      {scanResult && !isScanning && (
        <Card className="p-6 border-green-200 bg-green-50">
          <div className="flex items-start space-x-3">
            <CheckCircle className="h-6 w-6 text-green-600 mt-1" />
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 mb-2">Address Detected</h3>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium text-gray-700">what3words:</span>
                  <span className="ml-2 font-mono bg-white px-2 py-1 rounded text-blue-600">
                    {scanResult.address}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Coordinates:</span>
                  <span className="ml-2 text-gray-600">
                    {scanResult.coordinates.lat.toFixed(6)}, {scanResult.coordinates.lng.toFixed(6)}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Confidence:</span>
                  <span className="ml-2 text-gray-600">{(scanResult.confidence * 100).toFixed(1)}%</span>
                </div>
              </div>
              <Button
                onClick={addToDeliveryList}
                className="mt-4 w-full"
                size="sm"
              >
                Add to Delivery List
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
            <p className="font-medium mb-1">OCR Instructions</p>
            <ul className="space-y-1 text-blue-700">
              <li>• Ensure what3words addresses are clearly visible</li>
              <li>• Use good lighting and minimal blur</li>
              <li>• Addresses should be in format: ///word.word.word</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default OCRScanner;
