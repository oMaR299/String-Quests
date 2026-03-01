
import React, { useRef } from 'react';
import { Paragraph } from '../types';

// --- COMPONENT: Highlightable Paragraph ---
interface HighlightableParagraphProps {
  paragraph: Paragraph;
  isActive: boolean;
  currentSelection: string | null;
  onHighlight: (text: string) => void;
}

export const HighlightableParagraph: React.FC<HighlightableParagraphProps> = ({ 
  paragraph, 
  isActive, 
  currentSelection, 
  onHighlight 
}) => {
  const paragraphRef = useRef<HTMLParagraphElement>(null);

  const handleMouseUp = () => {
    if (!isActive) return;

    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    const selectedText = selection.toString().trim();

    // Ensure selection is strictly within this paragraph
    if (
      paragraphRef.current && 
      paragraphRef.current.contains(range.commonAncestorContainer) && 
      selectedText.length > 0
    ) {
      onHighlight(selectedText);
      // Optional: Clear selection after grabbing the text to avoid visual clutter
      // selection.removeAllRanges(); 
    }
  };

  const renderContent = () => {
    // Basic visualization of the selected text if it matches current selection
    // Note: This is a simple exact match highlighter. 
    // For production, you might want index-based slicing if the same phrase appears twice.
    if (currentSelection && paragraph.text.includes(currentSelection)) {
      const parts = paragraph.text.split(currentSelection);
      // This handles the first occurrence only for simplicity in this demo
      return (
        <>
          {parts[0]}
          <mark className="bg-yellow-300 text-slate-900 rounded-sm px-0.5 border-b-2 border-yellow-500 mx-0.5 shadow-sm">
            {currentSelection}
          </mark>
          {parts.slice(1).join(currentSelection)}
        </>
      );
    }
    return paragraph.text;
  };

  return (
    <p 
      ref={paragraphRef}
      onMouseUp={handleMouseUp}
      className={`relative leading-relaxed mb-4 text-lg md:text-xl text-slate-700 font-medium
        ${isActive ? 'cursor-text selection:bg-purple-200 selection:text-purple-900' : ''}`}
    >
      {renderContent()}
    </p>
  );
};

// --- COMPONENT: Clickable Word Paragraph ---
interface ClickableWordParagraphProps {
  paragraph: Paragraph;
  isActive: boolean;
  selectedWord: string | null;
  onWordClick: (word: string) => void;
}

export const ClickableWordParagraph: React.FC<ClickableWordParagraphProps> = ({ 
  paragraph, 
  isActive, 
  selectedWord, 
  onWordClick 
}) => {
  const words = paragraph.text.split(' ');
  
  return (
    <p className="leading-relaxed text-lg md:text-xl text-slate-700 font-medium mb-4">
      {words.map((word, idx) => {
        // Clean word for comparison (remove punctuation)
        const cleanWord = word.replace(/[.,/#!$%^&*;:{}=\-_`~()]/g,"");
        const isSelected = selectedWord === cleanWord;
        
        return (
          <span 
            key={idx}
            className={`inline-block ml-1 px-0.5 rounded-md transition-all duration-200 border border-transparent
              ${isActive ? 'hover:bg-purple-100 hover:text-purple-700 cursor-pointer' : 'opacity-50 blur-[0.5px]'}
              ${isSelected ? 'bg-purple-600 !text-white shadow-md scale-110 !opacity-100 !blur-0' : ''}
            `}
            onClick={(e) => {
              if (isActive) {
                e.stopPropagation();
                onWordClick(cleanWord);
              }
            }}
          >
            {word}{' '}
          </span>
        );
      })}
    </p>
  );
};
