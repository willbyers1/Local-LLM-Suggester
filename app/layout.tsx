import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Local LLM Advisor — Hardware Compatibility & Model Recommender',
  description:
    'Analyze your PC hardware specifications (RAM, VRAM, GPU, CPU, OS) to discover which open-weight local LLMs you can realistically run with deterministic memory calculations and intelligent AI recommendations.',
  openGraph: {
    title: 'Local LLM Advisor — Hardware Compatibility & Model Recommender',
    description:
      'Analyze your PC hardware specifications to discover which local LLMs you can realistically run.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="antialiased dark">
      <body className="bg-[#09090b] text-slate-100 min-h-screen selection:bg-blue-500/30 selection:text-blue-200" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
