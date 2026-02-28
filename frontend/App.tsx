import React, { useState, useEffect } from 'react';
import Report from './components/Report';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { toPng } from 'html-to-image';
import { initialReportData } from './mockData';
import { fetchAndAnalyzeMmiData } from './services/mmiService';
import { fetchAndParseGoldData } from './services/goldService';
import { fetchAndParseSilverData } from './services/silverService';
import { fetchAndParseGlobalIndicesData } from './services/globalIndicesService';
import { fetchAndParseCurrencyData } from './services/currencyService';
import { fetchAndParseFiiDiiData } from './services/fiiDiiService';
import { fetchAndParseNiftyMoversData } from './services/niftyMoversService';
import { fetchAndParseMarketBulletinData } from './services/marketBulletinService';
import { fetchAndParseKeyStocksPage3Data } from './services/keyStocksService';
import { fetchAndGenerateNiftyOiAnalysis, fetchAndGenerateNiftyTechAnalysis } from './services/niftyOiService';
import { fetchAndGeneratePcrAnalysis } from './services/pcrService';
import { fetchAndGenerateVixAnalysis } from './services/vixService';
import { fetchAndParseNiftyDashboardData } from './services/niftyDashboardService';
import { fetchAndParseHighLowData } from './services/highLowService';
import { fetchAndGenerateHeatmapAnalysis } from './services/heatmapService';
import { fetchGiftNiftyData } from './services/giftNiftyService';
import { fetchRealTimeOiAnalysis } from './services/realTimeOiService';
import { fetchAndParseMarketVerdict } from './services/verdictService'; // Added
import { ReportData } from './services/types';
import { Eye, Loader, FileText, AlertTriangle, Globe, FileDown, Camera } from 'lucide-react';
import PdfGenerator from './components/PdfGenerator';

const App: React.FC = () => {
  const [showPreview, setShowPreview] = useState(true);
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [isCapturingScreenshot, setIsCapturingScreenshot] = useState(false);
  const [isCapturingFromWebsite, setIsCapturingFromWebsite] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        setError(null);
        setIsLoading(true);

        // BUG FIX #1: Fetch reliable report date from backend
        let formattedDate = "";
        try {
          const dateRes = await fetch('/Data/report_date.txt');
          if (dateRes.ok) {
            formattedDate = (await dateRes.text()).trim();
          }
        } catch (e) {
          console.warn("Failed to fetch report_date.txt, using fallback");
        }

        if (!formattedDate) {
          const today = new Date();
          // Fallback: Yesterday
          today.setDate(today.getDate() - 1);
          const dayOfWeek = today.toLocaleDateString('en-US', { weekday: 'short' });
          const dayOfMonth = today.getDate();
          const month = today.toLocaleDateString('en-US', { month: 'long' });
          const year = today.getFullYear();
          formattedDate = `${dayOfWeek}, ${dayOfMonth} ${month} ${year}`;
        }

        const [
          marketMood,
          goldData,
          silverData,
          globalIndices,
          globalCurrencies,
          fiiDiiActivity,
          niftyMovers,
          marketBulletin,
          keyStocksPage3,
          niftyOiSummary,
          niftyPcrData,
          vixAnalysis,
          niftyDashboardData,
          niftyTechAnalysis,
          highLowData,
          heatmapDataRaw,
          giftNiftyDataRaw,
          realTimeOiDataRaw,
          marketVerdict, // Added
        ] = await Promise.all([
          fetchAndAnalyzeMmiData(),
          fetchAndParseGoldData(),
          fetchAndParseSilverData(),
          fetchAndParseGlobalIndicesData(),
          fetchAndParseCurrencyData(),
          fetchAndParseFiiDiiData(),
          fetchAndParseNiftyMoversData(),
          fetchAndParseMarketBulletinData(),
          fetchAndParseKeyStocksPage3Data(),
          fetchAndGenerateNiftyOiAnalysis(),
          fetchAndGeneratePcrAnalysis(),
          fetchAndGenerateVixAnalysis(),
          fetchAndParseNiftyDashboardData(),
          fetchAndGenerateNiftyTechAnalysis(),
          fetchAndParseHighLowData(),
          fetchAndGenerateHeatmapAnalysis(),
          fetchGiftNiftyData(),
          fetchRealTimeOiAnalysis(),
          fetchAndParseMarketVerdict(), // Added
        ]);
        setReportData({
          ...initialReportData,
          date: formattedDate,
          marketMood,
          goldData,
          silverData,
          globalIndices,
          globalCurrencies,
          fiiDiiActivity,
          niftyMovers,
          marketBulletin,
          keyStocksPage3,
          niftyOiAnalysis: { summary: niftyOiSummary },
          niftyPcrAnalysis: niftyPcrData,
          vixAnalysis,
          niftyDashboardData,
          niftyTechAnalysis,
          highLowData,
          heatmapAnalysis: heatmapDataRaw.analysis,
          heatmapStocks: heatmapDataRaw.stocks,
          giftNiftyData: giftNiftyDataRaw,
          realTimeOiData: realTimeOiDataRaw,
          marketVerdict, // Added
        } as ReportData);
      } catch (e: any) {
        console.error('Failed to load report data:', e);
        setError(`Could not load and parse dynamic data. ${e.message}`);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  const handleViewAsWebsiteAndGetWindow = () => {
    if (!reportData) return null;

    const previewContainer = document.getElementById('report-preview-container');
    if (!previewContainer) {
      console.error('Preview container not found');
      return null;
    }

    const reportHtml = previewContainer.outerHTML;

    const newWindow = window.open("", "_blank");
    if (newWindow) {
      newWindow.document.write(`
        <!DOCTYPE html>
        <html lang="en">
          <head>
            <meta charset="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <title>Market Report Preview</title>
            <link rel="preconnect" href="https://fonts.googleapis.com">
            <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
            <link href="https://fonts.googleapis.com/css2?family=Fredoka:wght@400;700&family=Inter:wght@400;700&display=swap" rel="stylesheet">
            <script src="https://cdn.tailwindcss.com"></script>
            <script>
              tailwind.config = {
                theme: {
                  extend: {
                    colors: {
                      'brand-beige': '#FDF6E9',
                      'brand-black': '#1E293B',
                      'brand-green': '#16A34A',
                      'brand-red': '#DC2626',
                      'brand-yellow': '#FBBF24',
                    },
                    fontFamily: {
                      sans: ['Inter', 'sans-serif'],
                      heading: ['Fredoka', 'sans-serif'],
                      mono: ['ui-monospace', 'monospace'],
                    },
                  },
                },
              };
            </script>
            <style>
               body {
                   display: flex;
                   justify-content: center;
                   padding-top: 2rem;
                   padding-bottom: 2rem;
               }
            </style>
          </head>
          <body class="bg-brand-beige">
            ${reportHtml}
          </body>
        </html>
      `);
      newWindow.document.close();
      return newWindow;
    }
    return null;
  };

  const handleViewAsWebsite = () => {
    handleViewAsWebsiteAndGetWindow();
  };

  const handleCaptureFromWebsite = async () => {
    if (isLoading || !reportData) return;
    setIsCapturingFromWebsite(true);

    try {
      // Open the website in new window
      const newWindow = await handleViewAsWebsiteAndGetWindow();
      if (!newWindow) throw new Error('Could not open website window');

      // Initial page load delay
      await new Promise(resolve => setTimeout(resolve, 5000));

      // Wait for page and images to load completely
      await Promise.all([
        new Promise(resolve => {
          if (newWindow.document.readyState === 'complete') {
            resolve(true);
          } else {
            newWindow.onload = () => resolve(true);
          }
        }),
        // Wait for images
        Promise.all(
          Array.from(newWindow.document.images)
            .map(img => {
              if (img.complete) return Promise.resolve();
              return new Promise(resolve => {
                img.onload = resolve;
                img.onerror = resolve; // Handle errors as complete
              });
            })
        ),
        // Wait for fonts
        newWindow.document.fonts.ready,
        // Verify required data
        new Promise((resolve, reject) => {
          if (!reportData.goldData || !reportData.silverData) {
            reject(new Error('Gold or Silver data not loaded'));
          }
          resolve(true);
        })
      ]);

      // Get all pages
      const allPages = newWindow.document.querySelectorAll('.a4-page-container');
      if (allPages.length === 0) throw new Error('Could not find any page elements');

      const zip = new JSZip();

      // Capture all pages
      for (let i = 0; i < Math.min(11, allPages.length); i++) {
        // Add extra delay for pages 9-11
        if (i >= 8) {
          await new Promise(r => setTimeout(r, 1000));
        }
        const page = allPages[i];
        const imageData = await toPng(page as HTMLElement, {
          quality: 1.0,
          pixelRatio: 3,
          skipAutoScale: true,
          cacheBust: true,
          style: {
            transform: 'scale(1)',
            transformOrigin: 'top left'
          },
          backgroundColor: '#FDF6E9',
          width: page.clientWidth,
          height: page.clientHeight
        });
        zip.file(`page${i + 1}.png`, imageData.split('base64,')[1], { base64: true });
      }

      // Generate and save zip
      const content = await zip.generateAsync({ type: "blob" });
      saveAs(content, "website-screenshot.zip");

      // Close the window
      newWindow.close();
    } catch (error) {
      console.error('Failed to capture from website:', error);
      alert('Could not capture from website. Please try again.');
    } finally {
      setIsCapturingFromWebsite(false);
    }
  };

  const handleSaveAsPdf = () => {
    if (isLoading || !reportData) return;
    setIsGeneratingPdf(true);
  };

  const handleCaptureScreenshot = async () => {
    if (isLoading || !reportData) return;
    setIsCapturingScreenshot(true);

    try {
      // Enhanced loading checks
      await Promise.all([
        document.fonts.ready,
        new Promise(r => setTimeout(r, 2000)),
        new Promise((resolve, reject) => {
          if (!reportData.goldData || !reportData.silverData) {
            reject(new Error('Gold or Silver data not loaded'));
          }
          resolve(true);
        })
      ]);

      // Get all page elements
      const pageElements = document.querySelectorAll('.a4-page-container');
      if (pageElements.length === 0) {
        throw new Error('Could not find any page elements');
      }

      const zip = new JSZip();

      // Capture all pages
      for (let i = 0; i < Math.min(11, pageElements.length); i++) {
        // Add extra delay for pages 9-11
        if (i >= 8) {
          await new Promise(r => setTimeout(r, 1000));
        }
        // Capture the page
        const imageData = await toPng(pageElements[i] as HTMLElement, {
          quality: 1.0,
          pixelRatio: 3,
          skipAutoScale: true,
          cacheBust: true,
          style: {
            transform: 'scale(1)',
            transformOrigin: 'top left'
          },
          backgroundColor: '#FDF6E9'
        });
        zip.file(`page${i + 1}.png`, imageData.split('base64,')[1], { base64: true });
      }

      // Generate and save zip
      const content = await zip.generateAsync({ type: "blob" });
      saveAs(content, "report-screenshot.zip");
    } catch (error) {
      console.error('Failed to capture screenshot:', error);
      alert('Could not capture screenshot. Please try again.');
    } finally {
      setIsCapturingScreenshot(false);
    }
  };

  return (
    <div className="min-h-screen bg-retro-paper font-mono text-retro-border flex flex-col items-center p-4 sm:p-8">
      {isGeneratingPdf && reportData && (
        <PdfGenerator
          onFinish={() => setIsGeneratingPdf(false)}
        />
      )}
      <div className="w-full max-w-4xl text-center">
        <div className="flex items-center justify-center gap-4 mb-4">
          <FileText size={40} className="text-retro-border" />
          <h1 className="text-4xl sm:text-5xl font-bold uppercase tracking-wider">Market Report Generator</h1>
        </div>
        <p className="text-lg mb-8 text-retro-muted font-semibold tracking-wide">
          Generate a beautiful, multi-page financial report. View it, or save it as a PDF.
        </p>

        <div className="bg-retro-card p-6 rounded-lg border-2 border-retro-border shadow-retro flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
          <button
            onClick={handleViewAsWebsite}
            disabled={isLoading || !reportData || isGeneratingPdf}
            className="flex items-center justify-center gap-3 w-full sm:w-auto px-6 py-3 bg-retro-green text-white font-bold rounded-md border-2 border-retro-border text-lg hover:brightness-110 disabled:bg-slate-400 retro-btn uppercase"
          >
            <Globe size={20} />
            <span>View Website</span>
          </button>

          <button
            onClick={handleSaveAsPdf}
            disabled={isLoading || !reportData || isGeneratingPdf || isCapturingScreenshot}
            className="flex items-center justify-center gap-3 w-full sm:w-auto px-6 py-3 bg-blue-500 text-white font-bold rounded-md border-2 border-retro-border text-lg hover:brightness-110 disabled:bg-slate-400 retro-btn uppercase"
          >
            <FileDown size={20} />
            <span>Save PDF</span>
          </button>

          <button
            onClick={handleCaptureFromWebsite}
            disabled={isLoading || !reportData || isGeneratingPdf || isCapturingScreenshot || isCapturingFromWebsite}
            className="flex items-center justify-center gap-3 w-full sm:w-auto px-6 py-3 bg-teal-500 text-white font-bold rounded-md border-2 border-retro-border text-lg hover:brightness-110 disabled:bg-slate-400 retro-btn uppercase"
          >
            <Globe size={20} />
            <span>{isCapturingFromWebsite ? 'Capturing...' : 'Capture Web'}</span>
          </button>

          <button
            onClick={handleCaptureScreenshot}
            disabled={isLoading || !reportData || isGeneratingPdf || isCapturingScreenshot}
            className="flex items-center justify-center gap-3 w-full sm:w-auto px-6 py-3 bg-purple-500 text-white font-bold rounded-md border-2 border-retro-border text-lg hover:brightness-110 disabled:bg-slate-400 retro-btn uppercase"
          >
            <Camera size={20} />
            <span>{isCapturingScreenshot ? 'Capturing...' : 'Capture All'}</span>
          </button>

          <button
            onClick={() => setShowPreview(!showPreview)}
            disabled={isLoading || isGeneratingPdf}
            className="flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3 bg-amber-400 text-retro-border font-bold rounded-md border-2 border-retro-border text-lg hover:brightness-110 disabled:bg-slate-400 retro-btn uppercase"
          >
            <Eye size={20} />
            <span>{showPreview ? 'Hide' : 'Show'} Preview</span>
          </button>
        </div>
      </div>

      {/* Report Content Area */}
      <div className="w-full">
        {isLoading && (
          <div className="mt-8 flex flex-col items-center justify-center text-retro-border font-bold p-8">
            <Loader className="animate-spin mb-4" size={48} />
            <p className="text-xl uppercase tracking-widest animate-pulse">Loading Data...</p>
          </div>
        )}

        {error && (
          <div className="mt-8 flex flex-col items-center justify-center text-center text-white p-6 bg-retro-red border-2 border-retro-border rounded-lg shadow-retro max-w-2xl mx-auto">
            <AlertTriangle size={48} className="mb-4" />
            <h2 className="text-2xl font-bold uppercase tracking-wider mb-2">System Error</h2>
            <p className="font-semibold">{error}</p>
          </div>
        )}

        {reportData && (
          <div className={`transition-opacity duration-300 w-full flex justify-center ${showPreview ? 'opacity-100 mt-4' : 'opacity-100 absolute -left-[9999px]'}`}>
            <div id="report-preview-container" className="bg-white border-2 border-retro-border shadow-retro p-2 rounded-lg">
              <Report data={reportData} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
