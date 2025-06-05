
import React from 'react';
import OCRScanner from '../components/OCRScanner';
import DeliveryManager from '../components/DeliveryManager';
import { Truck, MapPin, Scan, Languages } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { Button } from '@/components/ui/button';

const Index = () => {
  const { language, setLanguage, t } = useLanguage();

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'mn' : 'en');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <Truck className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{t('app.title')}</h1>
                <p className="text-sm text-gray-600">{t('app.subtitle')}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                onClick={toggleLanguage}
                variant="outline"
                size="sm"
                className="flex items-center space-x-2"
              >
                <Languages className="h-4 w-4" />
                <span>{language === 'en' ? 'MN' : 'EN'}</span>
              </Button>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Scan className="h-4 w-4" />
                <span>{t('header.ocrReady')}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <MapPin className="h-4 w-4" />
                <span>{t('header.geoLocationActive')}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* OCR Scanner Section */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center space-x-3 mb-6">
                <div className="bg-green-100 p-2 rounded-lg">
                  <Scan className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">{t('ocr.title')}</h2>
                  <p className="text-sm text-gray-600">{t('ocr.subtitle')}</p>
                </div>
              </div>
              <OCRScanner />
            </div>
          </div>

          {/* Delivery Manager Section */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center space-x-3 mb-6">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <MapPin className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">{t('delivery.title')}</h2>
                  <p className="text-sm text-gray-600">{t('delivery.subtitle')}</p>
                </div>
              </div>
              <DeliveryManager />
            </div>
          </div>
        </div>

        {/* Features Overview */}
        <div className="mt-12 bg-white rounded-xl shadow-lg p-8 border border-gray-100">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">{t('features.title')}</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-blue-50 rounded-lg">
              <div className="bg-blue-600 w-12 h-12 rounded-lg mx-auto mb-4 flex items-center justify-center">
                <Scan className="h-6 w-6 text-white" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">{t('features.ocr.title')}</h4>
              <p className="text-sm text-gray-600">{t('features.ocr.description')}</p>
            </div>
            <div className="text-center p-6 bg-green-50 rounded-lg">
              <div className="bg-green-600 w-12 h-12 rounded-lg mx-auto mb-4 flex items-center justify-center">
                <MapPin className="h-6 w-6 text-white" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">{t('features.coordinates.title')}</h4>
              <p className="text-sm text-gray-600">{t('features.coordinates.description')}</p>
            </div>
            <div className="text-center p-6 bg-purple-50 rounded-lg">
              <div className="bg-purple-600 w-12 h-12 rounded-lg mx-auto mb-4 flex items-center justify-center">
                <Truck className="h-6 w-6 text-white" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">{t('features.routing.title')}</h4>
              <p className="text-sm text-gray-600">{t('features.routing.description')}</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
