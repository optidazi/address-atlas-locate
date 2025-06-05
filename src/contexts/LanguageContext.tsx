
import React, { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'en' | 'mn';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Translation dictionary
const translations = {
  en: {
    // Header
    'app.title': 'DeliveryPro',
    'app.subtitle': 'what3words OCR Integration',
    'header.ocrReady': 'OCR Ready',
    'header.geoLocationActive': 'Geo-Location Active',
    
    // OCR Scanner
    'ocr.title': 'OCR Scanner',
    'ocr.subtitle': 'Scan what3words addresses from images or documents',
    'ocr.language': 'OCR Language',
    'ocr.languageHelp': 'Select the language for text recognition. Mongolian Cyrillic is supported for what3words addresses.',
    'ocr.uploadImage': 'Upload Image',
    'ocr.useCamera': 'Use Camera',
    'ocr.processing': 'Processing Image...',
    'ocr.recognizing': 'Recognizing text',
    'ocr.scanning': 'Scanning for what3words addresses',
    'ocr.addressDetected': 'Address Detected',
    'ocr.what3words': 'what3words:',
    'ocr.coordinates': 'Coordinates:',
    'ocr.confidence': 'Confidence:',
    'ocr.addToDelivery': 'Add to Delivery List',
    'ocr.extractedText': 'Extracted Text',
    'ocr.noAddressFound': 'No what3words addresses found in this format: ///word.word.word',
    
    // Delivery Manager
    'delivery.title': 'Delivery Management',
    'delivery.subtitle': 'Sort and optimize delivery routes by location',
    
    // Features
    'features.title': 'Platform Features',
    'features.ocr.title': 'OCR Recognition',
    'features.ocr.description': 'Advanced OCR technology to extract what3words addresses from images and documents',
    'features.coordinates.title': 'Coordinate Conversion',
    'features.coordinates.description': 'Instantly convert what3words addresses to precise latitude/longitude coordinates',
    'features.routing.title': 'Route Optimization',
    'features.routing.description': 'Smart sorting and routing algorithms to optimize delivery schedules',
    
    // OCR Tips
    'tips.title': 'OCR Tips for Better Recognition',
    'tips.format': 'Ensure what3words addresses are in format: ///word.word.word',
    'tips.language': 'Select appropriate language: English, Mongolian Cyrillic, or both',
    'tips.lighting': 'Use good lighting and avoid blur or shadows',
    'tips.visibility': 'Make sure text is clearly visible and not too small',
    'tips.printed': 'Avoid handwritten text - printed text works better',
    'tips.angles': 'Try different angles if recognition fails',
    
    // Toast messages
    'toast.selectImage': 'Please select an image file',
    'toast.addressDetected': 'what3words address detected',
    'toast.addedToDelivery': 'Added to delivery list',
    'toast.processingFailed': 'Failed to process image',
    'toast.cameraInfo': 'Camera feature would open here in a real implementation',
    
    // Language options
    'lang.english': 'English',
    'lang.mongolianCyrillic': 'Mongolian Cyrillic',
    'lang.englishMongolian': 'English + Mongolian',
  },
  mn: {
    // Header
    'app.title': 'Хүргэлтийн Про',
    'app.subtitle': 'what3words OCR Холболт',
    'header.ocrReady': 'OCR Бэлэн',
    'header.geoLocationActive': 'Газарзүйн Байршил Идэвхтэй',
    
    // OCR Scanner
    'ocr.title': 'OCR Сканнер',
    'ocr.subtitle': 'Зургаас what3words хаягийг уншиж авах',
    'ocr.language': 'OCR Хэл',
    'ocr.languageHelp': 'Текст танихад ашиглах хэлийг сонгоно уу. Монгол кирилл what3words хаягийг дэмжинэ.',
    'ocr.uploadImage': 'Зураг Оруулах',
    'ocr.useCamera': 'Камер Ашиглах',
    'ocr.processing': 'Зураг Боловсруулж байна...',
    'ocr.recognizing': 'Текст танилцуулж байна',
    'ocr.scanning': 'what3words хаяг хайж байна',
    'ocr.addressDetected': 'Хаяг Олдлоо',
    'ocr.what3words': 'what3words:',
    'ocr.coordinates': 'Координат:',
    'ocr.confidence': 'Итгэлцэл:',
    'ocr.addToDelivery': 'Хүргэлтийн Жагсаалтад Нэмэх',
    'ocr.extractedText': 'Гаргасан Текст',
    'ocr.noAddressFound': 'Энэ форматаар what3words хаяг олдсонгүй: ///үг.үг.үг',
    
    // Delivery Manager
    'delivery.title': 'Хүргэлтийн Удирдлага',
    'delivery.subtitle': 'Байршлаар эрэмбэлж, хүргэлтийн замыг оновчтой болгох',
    
    // Features
    'features.title': 'Платформын Боломжууд',
    'features.ocr.title': 'OCR Танилт',
    'features.ocr.description': 'Зураг болон бичиг баримтаас what3words хаягийг гаргаж авах дэвшилтэт OCR технологи',
    'features.coordinates.title': 'Координат Хөрвүүлэлт',
    'features.coordinates.description': 'what3words хаягийг нарийвчлалтай өргөрөг/уртрагийн координат болгон шууд хөрвүүлэх',
    'features.routing.title': 'Замын Оновчлол',
    'features.routing.description': 'Хүргэлтийн хуваарийг оновчтой болгох ухаалаг эрэмбэлэлт болон замын алгоритм',
    
    // OCR Tips
    'tips.title': 'Илүү Сайн Танилтын Талаар OCR Зөвлөмж',
    'tips.format': 'what3words хаягийг дараах форматаар бичсэн эсэхийг шалгана уу: ///үг.үг.үг',
    'tips.language': 'Тохирох хэлийг сонгоно уу: Англи, Монгол кирилл, эсвэл хоёулаа',
    'tips.lighting': 'Сайн гэрэлтэй байж, бүдгэрсэн эсвэл сүүдэртэй байхаас зайлсхийнэ үү',
    'tips.visibility': 'Текст тод харагдаж, хэтэрхий жижиг биш байхыг анхаарна уу',
    'tips.printed': 'Гар бичмэлээс зайлсхийж, хэвлэмэл текст ашиглана уу',
    'tips.angles': 'Танилт амжилтгүй бол өөр өнцгөөс оролдоно уу',
    
    // Toast messages
    'toast.selectImage': 'Зургийн файл сонгоно уу',
    'toast.addressDetected': 'what3words хаяг олдлоо',
    'toast.addedToDelivery': 'Хүргэлтийн жагсаалтад нэмэгдлээ',
    'toast.processingFailed': 'Зураг боловсруулж чадсангүй',
    'toast.cameraInfo': 'Жинхэнэ хэрэгжүүлэлтэд камерын функц энд нээгдэх байсан',
    
    // Language options
    'lang.english': 'Англи',
    'lang.mongolianCyrillic': 'Монгол Кирилл',
    'lang.englishMongolian': 'Англи + Монгол',
  }
};

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations['en']] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
