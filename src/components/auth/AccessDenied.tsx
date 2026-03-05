import React from 'react';
import { ShieldAlert, Home } from 'lucide-react';
import { motion } from 'motion/react';

interface AccessDeniedProps {
  onReturnHome: () => void;
}

export const AccessDenied: React.FC<AccessDeniedProps> = ({ onReturnHome }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="w-24 h-24 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mb-6"
      >
        <ShieldAlert size={48} />
      </motion.div>
      
      <motion.h2
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="text-3xl font-bold text-slate-900 mb-4"
      >
        Acesso Negado
      </motion.h2>
      
      <motion.p
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="text-slate-600 max-w-md mb-8"
      >
        Você não possui as permissões necessárias para acessar esta área do portal. 
        Caso acredite que isso seja um erro, entre em contato com o administrador.
      </motion.p>
      
      <motion.button
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        onClick={onReturnHome}
        className="flex items-center space-x-2 bg-lodge-dark text-white px-6 py-3 rounded-xl font-bold hover:bg-slate-800 transition-colors shadow-lg"
      >
        <Home size={20} />
        <span>Voltar para o Início</span>
      </motion.button>
    </div>
  );
};
