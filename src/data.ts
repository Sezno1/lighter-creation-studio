export type ResearchStatus = 'not_searched' | 'incomplete' | 'similar' | 'screened';
export type ViewKey = 'front' | 'three_q' | 'side' | 'back' | 'top' | 'open';
export type ViewState = 'original' | 'ok' | 'drift' | 'todo' | 'working';

export interface Swatch { name: string; hex: string }
export interface Family { id: string; en: string; zh: string; palette: Swatch[]; materials: { en: string; zh: string } }
export interface Folder { id: string; name: string; emoji: string; createdAt: number }
export interface Concept {
  id: string; // stable: sample file name without extension
  code: string; // short display code, e.g. C-001
  familyId: string;
  folderId: string | null;
  note: string;
  rev: number;
  name: { en: string; zh: string };
  img: string;
  palette: Swatch[];
  tags: string[];
  liked: boolean;
  shortlisted: boolean;
  research: ResearchStatus;
  provider: string;
  createdAt: number;
  views: Partial<Record<ViewKey, ViewState>>;
}

export const FAMILIES: Family[] = [
  { id: 'F01', en: 'Faceted monolith', zh: '多面晶体', palette: [{ name: 'Gunmetal', hex: '#4A4D52' }, { name: 'Satin steel', hex: '#B9BCC0' }, { name: 'Graphite', hex: '#2B2C2F' }], materials: { en: 'Zinc alloy, PVD gunmetal', zh: '锌合金,PVD枪色' } },
  { id: 'F02', en: 'Soft pebble', zh: '圆润卵石', palette: [{ name: 'Sand', hex: '#D8CBB4' }, { name: 'Pearl', hex: '#EEEAE3' }, { name: 'Bronze', hex: '#9C7A4E' }], materials: { en: 'Zinc alloy, soft-touch coat', zh: '锌合金,肤感漆' } },
  { id: 'F03', en: 'Architectural ribs', zh: '建筑竖纹', palette: [{ name: 'Brushed chrome', hex: '#C7C9CC' }, { name: 'Matte black', hex: '#222222' }, { name: 'Steel', hex: '#8E9296' }], materials: { en: 'Brass, alternating polish', zh: '黄铜,亮哑相间' } },
  { id: 'F04', en: 'Leather wrap', zh: '皮革包裹', palette: [{ name: 'Cognac', hex: '#8A4B2A' }, { name: 'Antique brass', hex: '#A88A5A' }, { name: 'Espresso', hex: '#3B2A22' }], materials: { en: 'Brass + stitched leather', zh: '黄铜+缝线皮革' } },
  { id: 'F05', en: 'Art deco', zh: '装饰艺术', palette: [{ name: 'Polished gold', hex: '#C9A45C' }, { name: 'Onyx', hex: '#1E1E20' }, { name: 'Ivory', hex: '#EFE8DA' }], materials: { en: 'Brass, engraved lid', zh: '黄铜,盖面雕刻' } },
  { id: 'F06', en: 'Industrial knurl', zh: '工业滚花', palette: [{ name: 'Raw steel', hex: '#9EA2A6' }, { name: 'Titanium', hex: '#6F7378' }, { name: 'Safety orange', hex: '#D9622B' }], materials: { en: 'Stainless steel, diamond knurl', zh: '不锈钢,菱形滚花' } },
  { id: 'F07', en: 'Two-tone split', zh: '双色斜切', palette: [{ name: 'Gunmetal', hex: '#4A4D52' }, { name: 'Brushed brass', hex: '#B89A5E' }, { name: 'Smoke', hex: '#77797C' }], materials: { en: 'Zinc alloy, dual plating', zh: '锌合金,双色电镀' } },
  { id: 'F08', en: 'Window reveal', zh: '视窗透芯', palette: [{ name: 'Silver', hex: '#C4C6C8' }, { name: 'Sapphire', hex: '#3E5C86' }, { name: 'Graphite', hex: '#2B2C2F' }], materials: { en: 'Steel, mineral glass window', zh: '钢,矿物玻璃视窗' } },
  { id: 'F09', en: 'Wave forged', zh: '锻造波纹', palette: [{ name: 'Damascus', hex: '#6A6C70' }, { name: 'Oil black', hex: '#1F2023' }, { name: 'Silver', hex: '#C4C6C8' }], materials: { en: 'Steel, etched wave pattern', zh: '钢,蚀刻波纹' } },
  { id: 'F10', en: 'Slim card', zh: '超薄卡片', palette: [{ name: 'Aluminium', hex: '#D3D5D7' }, { name: 'Midnight', hex: '#23262D' }, { name: 'Copper', hex: '#B4704A' }], materials: { en: 'Anodized aluminium', zh: '阳极氧化铝' } },
  { id: 'F11', en: 'Hex barrel', zh: '六角柱体', palette: [{ name: 'Gunmetal', hex: '#4A4D52' }, { name: 'Bronze', hex: '#9C7A4E' }, { name: 'Steel', hex: '#8E9296' }], materials: { en: 'Brass, bevelled hex', zh: '黄铜,六角倒边' } },
  { id: 'F12', en: 'Enamel inlay', zh: '珐琅镶嵌', palette: [{ name: 'Mirror chrome', hex: '#D9DBDD' }, { name: 'Jade enamel', hex: '#3F7F6E' }, { name: 'Ink', hex: '#22252A' }], materials: { en: 'Chrome, enamel stripe', zh: '镀铬,珐琅色带' } }
];

export const familyById = (id: string) => FAMILIES.find(f => f.id === id)!;

export interface ProviderOption { id: string; label: string; origin: 'CN' | 'Western'; perImageCny?: number; connected: boolean }
export const PROVIDERS: Record<'draft' | 'final' | 'views' | 'brain', ProviderOption[]> = {
  draft: [
    { id: 'seedream', label: 'Seedream 5.5', origin: 'CN', perImageCny: 0.13, connected: false },
    { id: 'nanobanana', label: 'Nano Banana 2.1', origin: 'Western', perImageCny: 0.24, connected: false },
    { id: 'qwen', label: 'Qwen-Image 3.0', origin: 'CN', perImageCny: 0.18, connected: false },
    { id: 'gptimage', label: 'GPT Image 2.6', origin: 'Western', perImageCny: 1.5, connected: false }
  ],
  final: [
    { id: 'gptimage', label: 'GPT Image 2.6', origin: 'Western', perImageCny: 1.5, connected: false },
    { id: 'seedream', label: 'Seedream 5.5', origin: 'CN', perImageCny: 0.13, connected: false }
  ],
  views: [
    { id: 'seedream', label: 'Seedream 5.5', origin: 'CN', perImageCny: 0.13, connected: false },
    { id: 'gptimage', label: 'GPT Image 2.6', origin: 'Western', perImageCny: 1.5, connected: false },
    { id: 'nanobanana', label: 'Nano Banana 2.1', origin: 'Western', perImageCny: 0.24, connected: false }
  ],
  brain: [
    { id: 'gpt', label: 'GPT-6.1 Sol', origin: 'Western', connected: false },
    { id: 'claude', label: 'Claude Sonnet 5.5', origin: 'Western', connected: false },
    { id: 'gemini', label: 'Gemini 4 Hydrogen', origin: 'Western', connected: false },
    { id: 'qwenchat', label: 'qwen3.7-plus', origin: 'CN', connected: false }
  ]
};

import coral from './samples/coral.webp';
import indigo from './samples/indigo.webp';
import silver from './samples/silver.webp';
import demoMetadata from './samples/samples.json';

interface SampleMeta { provider?: string; family?: string; name?: { en: string; zh: string }; palette?: Swatch[]; tags?: string[] }
const sampleFiles: Record<string, string> = { 'coral.webp': coral, 'indigo.webp': indigo, 'silver.webp': silver };
const sampleMeta: Record<string, SampleMeta> = demoMetadata;

const BASE_TIME = Date.parse('2026-11-17T21:30:00+07:00');
const pretty = (stem: string) => stem.replace(/^\d+[-_ ]*/, '').replace(/[-_]+/g, ' ').replace(/\b\w/g, m => m.toUpperCase()) || stem;

// Builds one concept per real image. No placeholder designs.
export function buildConcepts(): Concept[] {
  return Object.keys(sampleFiles).sort().map((key, i) => {
    const file = key.split('/').pop()!;
    const stem = file.replace(/\.[^.]+$/, '');
    const meta = sampleMeta[file] ?? {};
    const fam = (meta.family && FAMILIES.find(f => f.id === meta.family)) || FAMILIES[i % FAMILIES.length];
    return {
      id: stem,
      code: `C-${String(i + 1).padStart(3, '0')}`,
      familyId: fam.id,
      folderId: null,
      note: '',
      rev: 1,
      name: meta.name ?? { en: pretty(stem), zh: pretty(stem) },
      img: sampleFiles[key],
      palette: meta.palette ?? fam.palette,
      tags: meta.tags ?? [],
      liked: false,
      shortlisted: false,
      research: 'not_searched' as ResearchStatus,
      provider: meta.provider ?? '—',
      createdAt: BASE_TIME + i * 60_000,
      views: { front: 'original' as ViewState }
    };
  });
}

export const MARKETS = [
  { id: 'us', en: 'United States', zh: '美国', flag: '🇺🇸' },
  { id: 'eu', en: 'European Union', zh: '欧盟', flag: '🇪🇺' },
  { id: 'me', en: 'Middle East', zh: '中东', flag: '🌍' },
  { id: 'sea', en: 'Southeast Asia', zh: '东南亚', flag: '🌏' },
  { id: 'cn', en: 'China', zh: '国内', flag: '🇨🇳' }
];

export const RESEARCH_SOURCES = [
  { id: 'catalog', en: 'Factory catalogue (local)', zh: '工厂产品库(本地)', method: 'auto' as const, status: 'incomplete' as ResearchStatus, last: '—' },
  { id: 'cnipa', en: 'CNIPA design patents', zh: '国家知识产权局 外观专利', method: 'assisted' as const, status: 'not_searched' as ResearchStatus, last: '—' },
  { id: 'designview', en: 'DesignView (EU + global)', zh: 'DesignView 国际外观库', method: 'assisted' as const, status: 'not_searched' as ResearchStatus, last: '—' },
  { id: 'wipo', en: 'WIPO Global Design Database', zh: 'WIPO 全球外观数据库', method: 'assisted' as const, status: 'not_searched' as ResearchStatus, last: '—' },
  { id: 'market', en: 'Marketplaces (1688, Amazon)', zh: '电商平台(1688、亚马逊)', method: 'assisted' as const, status: 'not_searched' as ResearchStatus, last: '—' }
];
