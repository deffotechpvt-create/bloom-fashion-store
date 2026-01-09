import { motion, AnimatePresence } from 'framer-motion';
import { X, Ruler } from 'lucide-react';

interface SizeGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: string;
}

const SizeGuideModal = ({ isOpen, onClose, category }: SizeGuideModalProps) => {
  const getSizeData = () => {
    if (category === 'Outerwear' || category === 'Tailoring') {
      return {
        title: 'Outerwear & Tailoring Size Guide',
        headers: ['Size', 'Chest (in)', 'Waist (in)', 'Shoulder (in)', 'Length (in)'],
        rows: [
          ['XS', '34-36', '28-30', '16', '27'],
          ['S', '36-38', '30-32', '17', '28'],
          ['M', '38-40', '32-34', '18', '29'],
          ['L', '40-42', '34-36', '19', '30'],
          ['XL', '42-44', '36-38', '20', '31'],
        ],
      };
    }
    if (category === 'Knitwear' || category === 'Essentials' || category === 'Shirts') {
      return {
        title: 'Tops Size Guide',
        headers: ['Size', 'Chest (in)', 'Length (in)', 'Sleeve (in)'],
        rows: [
          ['XS', '34-36', '26', '32'],
          ['S', '36-38', '27', '33'],
          ['M', '38-40', '28', '34'],
          ['L', '40-42', '29', '35'],
          ['XL', '42-44', '30', '36'],
        ],
      };
    }
    return {
      title: 'Size Guide',
      headers: ['Size', 'US Size', 'UK Size', 'EU Size'],
      rows: [
        ['XS', '0-2', '4-6', '32-34'],
        ['S', '4-6', '8-10', '36-38'],
        ['M', '8-10', '12-14', '40-42'],
        ['L', '12-14', '16-18', '44-46'],
        ['XL', '16-18', '20-22', '48-50'],
      ],
    };
  };

  const sizeData = getSizeData();

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3 }}
            className="relative w-full max-w-2xl max-h-[90vh] overflow-auto bg-background border border-border rounded-3xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="sticky top-0 flex items-center justify-between p-6 border-b border-border bg-background z-10">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-secondary">
                  <Ruler className="w-5 h-5 text-primary" />
                </div>
                <h2 className="text-xl font-semibold">{sizeData.title}</h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-secondary transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Size Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      {sizeData.headers.map((header) => (
                        <th
                          key={header}
                          className="py-3 px-4 text-left font-semibold text-foreground"
                        >
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {sizeData.rows.map((row, index) => (
                      <tr
                        key={index}
                        className="border-b border-border last:border-0 hover:bg-secondary/50 transition-colors"
                      >
                        {row.map((cell, cellIndex) => (
                          <td
                            key={cellIndex}
                            className={`py-3 px-4 ${
                              cellIndex === 0 ? 'font-semibold text-foreground' : 'text-muted-foreground'
                            }`}
                          >
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* How to Measure */}
              <div className="space-y-4 p-4 bg-secondary rounded-2xl">
                <h3 className="font-semibold text-foreground">How to Measure</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="font-semibold text-foreground">Chest:</span>
                    Measure around the fullest part of your chest, keeping the tape horizontal.
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-semibold text-foreground">Waist:</span>
                    Measure around your natural waistline, keeping the tape comfortably loose.
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-semibold text-foreground">Shoulder:</span>
                    Measure from the edge of one shoulder to the other across the back.
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-semibold text-foreground">Length:</span>
                    Measure from the highest point of the shoulder down to the hem.
                  </li>
                </ul>
              </div>

              {/* Fit Notes */}
              <div className="text-sm text-muted-foreground">
                <p>
                  Our garments are designed with a relaxed, contemporary fit. If you prefer a more tailored
                  look, we recommend sizing down. For layering, consider your usual size or sizing up.
                </p>
              </div>

              {/* Contact */}
              <div className="flex items-center justify-between p-4 bg-primary/5 rounded-2xl">
                <div>
                  <p className="font-medium text-foreground">Need help finding your size?</p>
                  <p className="text-sm text-muted-foreground">Our stylists are here to help.</p>
                </div>
                <button className="px-4 py-2 text-sm font-medium text-primary border border-primary rounded-xl hover:bg-primary hover:text-primary-foreground transition-colors">
                  Chat with Us
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SizeGuideModal;
