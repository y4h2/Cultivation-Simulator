import React from 'react';
import { createPortal } from 'react-dom';
import { useLanguage } from '../i18n';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  const { t } = useLanguage();

  if (!isOpen) return null;

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative z-10 bg-gray-900 rounded-xl border border-amber-900/50 p-6 max-w-3xl w-full max-h-[80vh] overflow-y-auto shadow-2xl shadow-black/50">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors text-2xl leading-none"
        >
          &times;
        </button>

        <h2 className="text-xl font-bold text-amber-400 mb-4">{t.help.title}</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-gray-800/50 rounded-lg">
            <h3 className="text-lg font-semibold text-cyan-400 mb-2">{t.help.realms.title}</h3>
            <ul className="text-sm text-gray-400 space-y-1">
              {t.help.realms.items.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </div>

          <div className="p-4 bg-gray-800/50 rounded-lg">
            <h3 className="text-lg font-semibold text-green-400 mb-2">{t.help.tips.title}</h3>
            <ul className="text-sm text-gray-400 space-y-1">
              {t.help.tips.items.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </div>

          <div className="p-4 bg-gray-800/50 rounded-lg">
            <h3 className="text-lg font-semibold text-yellow-400 mb-2">{t.help.market.title}</h3>
            <ul className="text-sm text-gray-400 space-y-1">
              {t.help.market.items.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </div>

          <div className="p-4 bg-gray-800/50 rounded-lg">
            <h3 className="text-lg font-semibold text-purple-400 mb-2">{t.help.attributes.title}</h3>
            <ul className="text-sm text-gray-400 space-y-1">
              {t.help.attributes.items.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );

  // Use portal to render modal at document body level
  return createPortal(modalContent, document.body);
};
