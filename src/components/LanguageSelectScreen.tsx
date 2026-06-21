'use client';

import { useState } from 'react';
import { Play, Star, Lock, ChevronRight, Code2, ChevronDown, ChevronUp } from 'lucide-react';
import { Language } from '@/types';
import { LanguageIcon } from './LanguageIcon';

interface Props {
  languages: Language[];
  onSelect: (index: number) => void;
}

const difficultyStars = { Principiante: 1, Intermedio: 2, Avanzado: 3 };
const difficultyLabel = { Principiante: 'EASY', Intermedio: 'MEDIUM', Avanzado: 'HARD' };

export function LanguageSelectScreen({ languages, onSelect }: Props) {
  const [hovered, setHovered] = useState<number | null>(null);
  const [selected, setSelected] = useState<number>(0);
  const [showcaseOpen, setShowcaseOpen] = useState(false);

  const lang = languages[selected];
  const previewCode = lang.levels[0]?.concepts[0]?.snippets[0]?.code ?? '';
  const totalConcepts = lang.levels.reduce((sum, l) => sum + l.concepts.length, 0);

  return (
    <div className="flex flex-col lg:flex-row gap-4 lg:gap-5 px-3 sm:px-4 lg:px-6 py-4 min-h-[calc(100vh-73px)]">

      {/* Panel izquierdo: showcase */}
      <div className="w-full lg:w-[340px] flex-shrink-0 flex flex-col gap-4">
        <div>
          <h2 className="text-lg sm:text-xl font-bold tracking-tight" style={{ color: 'var(--foreground)' }}>Elige un lenguaje</h2>
          <p className="text-sm mt-1" style={{ color: 'var(--muted-foreground)' }}>Selecciona y empieza a practicar</p>
        </div>

        {/* Mobile: Collapsible showcase toggle */}
        <button
          className="lg:hidden flex items-center justify-between w-full px-4 py-3 rounded-xl text-left transition-colors"
          style={{
            background: `linear-gradient(145deg, var(--card), ${lang.accentColor}08)`,
            border: `1px solid ${lang.accentColor}30`,
          }}
          onClick={() => setShowcaseOpen(!showcaseOpen)}
        >
          <div className="flex items-center gap-3">
            <LanguageIcon name={lang.icon} size={28} />
            <div>
              <span className="font-bold text-base" style={{ color: 'var(--foreground)' }}>{lang.name}</span>
              <span className="ml-2 text-[10px] font-bold tracking-[0.2em] px-2 py-0.5 rounded-md uppercase"
                style={{ background: `${lang.accentColor}15`, color: lang.accentColor, border: `1px solid ${lang.accentColor}30` }}>
                {lang.tag}
              </span>
            </div>
          </div>
          {showcaseOpen ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
        </button>

        {/* Showcase card — always visible on lg, toggled on mobile */}
        <div className={`${showcaseOpen ? 'flex' : 'hidden'} lg:flex flex-1 rounded-[24px] p-4 sm:p-6 flex-col transition-all duration-500 relative overflow-hidden`}
          style={{
            background: `linear-gradient(145deg, var(--card), ${lang.accentColor}08)`,
            border: `1px solid ${lang.accentColor}30`,
            boxShadow: `0 8px 32px -8px ${lang.accentColor}25`,
          }}
        >
          {/* Glow de fondo sutil */}
          <div
            className="absolute -top-20 -right-20 w-56 h-56 rounded-full blur-[60px] opacity-20 pointer-events-none transition-colors duration-500"
            style={{ background: lang.accentColor }}
          />

          {/* Header de la tarjeta */}
          <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6 relative z-10">
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-inner transition-colors duration-500"
              style={{
                background: `linear-gradient(135deg, ${lang.accentColor}20, ${lang.accentColor}05)`,
                border: `1px solid ${lang.accentColor}40`,
                boxShadow: `inset 0 2px 12px ${lang.accentColor}20`
              }}>
              <LanguageIcon name={lang.icon} size={32} />
            </div>
            <div>
              <h3 className="font-extrabold text-xl sm:text-2xl tracking-tight mb-1 sm:mb-1.5" style={{ color: 'var(--foreground)' }}>{lang.name}</h3>
              <span className="text-[10px] font-bold tracking-[0.2em] px-2.5 py-1 rounded-md inline-block uppercase"
                style={{ background: `${lang.accentColor}15`, color: lang.accentColor, border: `1px solid ${lang.accentColor}30` }}>
                {lang.tag}
              </span>
            </div>
          </div>

          {/* Dificultad estilo "Pill" */}
          <div className="flex items-center justify-between p-3 sm:p-3.5 rounded-xl mb-4 sm:mb-5"
            style={{ background: 'rgba(0,0,0,0.15)', border: '1px solid rgba(255,255,255,0.05)' }}>
            <span className="text-xs font-semibold tracking-wider uppercase text-muted-foreground">Dificultad</span>
            <div className="flex gap-2 items-center">
              <div className="flex gap-0.5">
                {[1, 2, 3].map(s => (
                  <Star key={s} className="w-4 h-4 transition-colors duration-300" style={{
                    fill: s <= difficultyStars[lang.difficulty] ? lang.accentColor : 'transparent',
                    color: s <= difficultyStars[lang.difficulty] ? lang.accentColor : 'var(--border)',
                  }} />
                ))}
              </div>
              <span className="text-xs ml-1 font-bold" style={{ color: lang.accentColor }}>
                {difficultyLabel[lang.difficulty]}
              </span>
            </div>
          </div>

          {/* Estadísticas */}
          <div className="flex gap-3 mb-4 sm:mb-6 relative z-10">
            {[{ val: lang.levels.length, lbl: 'Niveles' }, { val: totalConcepts, lbl: 'Conceptos' }].map(({ val, lbl }) => (
              <div key={lbl} className="flex-1 rounded-xl p-3 sm:p-3.5 flex flex-col items-center justify-center"
                style={{ background: 'rgba(0,0,0,0.1)', border: '1px solid rgba(255,255,255,0.03)' }}>
                <span className="text-xl sm:text-2xl font-black mb-1" style={{ color: 'var(--foreground)' }}>{val}</span>
                <span className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground">{lbl}</span>
              </div>
            ))}
          </div>

          {/* Terminal/Preview */}
          <div className="rounded-xl overflow-hidden mb-4 sm:mb-6 shadow-xl relative z-10" style={{ background: '#0d1117', border: '1px solid #30363d' }}>
            <div className="flex items-center gap-2 px-3 sm:px-4 py-2.5 sm:py-3 flex-shrink-0" style={{ background: '#161b22', borderBottom: '1px solid #30363d' }}>
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-[#ff5f56] border border-[#e0443e]" />
                <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-[#ffbd2e] border border-[#dea123]" />
                <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-[#27c93f] border border-[#1aab29]" />
              </div>
              <span className="text-[11px] ml-2 font-mono text-[#8b949e] truncate">
                preview.{lang.name.toLowerCase()}
              </span>
            </div>
            <pre className="p-3 sm:p-4 text-xs sm:text-[13px] leading-relaxed font-mono overflow-auto scrollbar-thin scrollbar-thumb-gray-700" style={{ color: '#e6edf3', maxHeight: '140px' }}>
              {previewCode}
            </pre>
          </div>

          {/* Descripción */}
          <p className="text-sm leading-relaxed flex-1 mb-2 relative z-10" style={{ color: 'var(--muted-foreground)' }}>
            {lang.description}
          </p>

          {/* Botón CTA */}
          <button
            onClick={() => onSelect(selected)}
            className="mt-auto w-full py-3 sm:py-3.5 rounded-xl flex items-center justify-center gap-2 font-bold text-sm tracking-widest text-white transition-all hover:scale-[1.02] active:scale-[0.98] relative overflow-hidden group shadow-lg"
            style={{ background: `linear-gradient(135deg, ${lang.accentColor}, ${lang.accentColor}cc)` }}
          >
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
            <Play className="w-4 h-4 fill-white relative z-10" />
            <span className="relative z-10">INICIAR AHORA</span>
          </button>
        </div>

        {/* Mobile: Direct CTA when showcase is collapsed */}
        {!showcaseOpen && (
          <button
            onClick={() => onSelect(selected)}
            className="lg:hidden w-full py-3 rounded-xl flex items-center justify-center gap-2 font-bold text-sm tracking-widest text-white transition-all active:scale-[0.98] shadow-lg"
            style={{ background: `linear-gradient(135deg, ${lang.accentColor}, ${lang.accentColor}cc)` }}
          >
            <Play className="w-4 h-4 fill-white" />
            <span>INICIAR {lang.name.toUpperCase()}</span>
          </button>
        )}
      </div>

      {/* Panel derecho: grilla dinámica */}
      <div className="flex-1 flex flex-col gap-3 sm:gap-4 lg:pl-2">
        <div>
          <h2 className="text-base sm:text-lg font-semibold" style={{ color: 'var(--foreground)' }}>Todos los lenguajes</h2>
          <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>{languages.length} disponibles</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-3 sm:gap-4 content-start pb-6">
          {languages.map((l, i) => {
            const isSelected = selected === i;
            const isHovered = hovered === i;
            const stars = difficultyStars[l.difficulty];
            return (
              <button
                key={i}
                onClick={() => setSelected(i)}
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
                className="relative rounded-2xl p-3 sm:p-4 text-left transition-all duration-200 overflow-hidden flex flex-col h-full"
                style={{
                  background: isSelected ? `linear-gradient(135deg, ${l.accentColor}22, var(--card))` : isHovered ? `linear-gradient(135deg, ${l.accentColor}12, var(--card))` : 'var(--card)',
                  border: `2px solid ${isSelected ? l.accentColor + '80' : isHovered ? l.accentColor + '40' : 'var(--border)'}`,
                  boxShadow: isSelected ? `0 0 20px ${l.accentColor}22` : 'none',
                  transform: isHovered && !isSelected ? 'translateY(-2px)' : 'none',
                }}
              >
                {isSelected && (
                  <div className="absolute top-3 right-3 w-5 h-5 rounded-full flex items-center justify-center"
                    style={{ background: l.accentColor }}>
                    <ChevronRight className="w-3 h-3 text-white" />
                  </div>
                )}
                <div className="flex items-start gap-3 flex-1">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: `${l.accentColor}22`, border: `1px solid ${l.accentColor}40` }}>
                    <LanguageIcon name={l.icon} size={24} />
                  </div>
                  <div className="flex-1 min-w-0 pr-4">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold truncate text-sm sm:text-base" style={{ color: 'var(--foreground)' }}>{l.name}</span>
                      <span className="px-2 py-0.5 rounded-full flex-shrink-0 font-bold"
                        style={{ background: `${l.accentColor}18`, color: l.accentColor, fontSize: '10px' }}>
                        {difficultyLabel[l.difficulty]}
                      </span>
                    </div>
                    <div className="flex gap-0.5 mb-2">
                      {[1, 2, 3].map(s => (
                        <Star key={s} className="w-3 h-3" style={{
                          fill: s <= stars ? l.accentColor : 'transparent',
                          color: s <= stars ? l.accentColor : 'var(--border)',
                        }} />
                      ))}
                    </div>
                    <p className="leading-snug line-clamp-2" style={{ color: 'var(--muted-foreground)', fontSize: '12px' }}>
                      {l.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-3 pt-3 w-full" style={{ borderTop: '1px solid var(--border)' }}>
                  <div className="flex items-center gap-1.5">
                    <Code2 className="w-3.5 h-3.5" style={{ color: 'var(--muted-foreground)' }} />
                    <span style={{ color: 'var(--muted-foreground)', fontSize: '12px', fontWeight: 500 }}>{l.levels.length} niveles</span>
                  </div>
                  {l.difficulty === 'Avanzado' && (
                    <div className="flex items-center gap-1.5">
                      <Lock className="w-3 h-3" style={{ color: 'var(--chart-1)' }} />
                      <span className="hidden sm:inline" style={{ color: 'var(--chart-1)', fontSize: '11px', fontWeight: 600 }}>Exp. recomendada</span>
                      <span className="sm:hidden" style={{ color: 'var(--chart-1)', fontSize: '11px', fontWeight: 600 }}>Exp.</span>
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}