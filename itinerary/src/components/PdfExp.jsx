
'use client'

// import * as html2pdf from "html2pdf.js";

const PdfExporter = async () => {
  const element = document.getElementById('itinerary-content');
  if (!element) {
    alert('Itinerary content not found!');
    return;
  }

  const html2pdf = (await import('html2pdf.js')).default;

  const opt = {
    margin:       0.5,
    filename:     'travel-itinerary.pdf',
    image:        { type: 'jpeg', quality: 0.98 },
    html2canvas:  { scale: 2 },
    jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
  };

  html2pdf().set(opt).from(element).save();


  return (
     <button 
                    onClick={exportAsPdf}
                    className="flex items-center gap-2 border border-white/30 text-white px-4 py-2 rounded-lg hover:bg-white/10 transition"
                  >
                    {/* <FileText className="w-4 h-4" />x */}
                    <span>Export as PDF</span>
                  </button>
  );
}
