import React from 'react';
import { motion } from 'motion/react';

export const renderTitle = (title: string) => {
  if (!title.toLowerCase().includes('aquí')) {
    return title;
  }
  const parts = title.split(/(aquí)/gi);
  return parts.map((part, i) => {
    if (part.toLowerCase() === 'aquí') {
      return (
        <motion.span
          key={i}
          className="text-uniq-cyan"
          animate={{ color: ['#0891b2', '#eab308', '#84cc16', '#0891b2'] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        >
          {part}
        </motion.span>
      );
    }
    return part;
  });
};
