import './globals.css';
import './sara.css';
import SaraAssistant from '@/components/SaraAssistant';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from "@vercel/speed-insights/next"
export const metadata = {
  title: 'RMinios — AI Research Operating System',
  description: 'Learn, research, brainstorm, write papers, and publish — all from one intelligent workspace powered by AI.',
  keywords: 'research, AI, academic writing, literature review, paper writing, brainstorming',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth">
      <head>
        <script dangerouslySetInnerHTML={{
          __html: `
            try {
              let theme = localStorage.getItem('rminios-theme') || 'midnight';
              
              if (theme === 'custom') {
                const bgHex = localStorage.getItem('rminios-custom-bg') || '#0a0b0f';
                const accentHex = localStorage.getItem('rminios-custom-accent') || '#6366f1';
                
                const hexToRgb = (hex) => {
                  let r=0,g=0,b=0; if(hex.length===4){r=parseInt(hex[1]+hex[1],16);g=parseInt(hex[2]+hex[2],16);b=parseInt(hex[3]+hex[3],16);}
                  else if(hex.length===7){r=parseInt(hex.substring(1,3),16);g=parseInt(hex.substring(3,5),16);b=parseInt(hex.substring(5,7),16);}
                  return r+","+g+","+b;
                };
                const adj = (hex, p) => {
                  let r=parseInt(hex.substring(1,3),16),g=parseInt(hex.substring(3,5),16),b=parseInt(hex.substring(5,7),16);
                  r=Math.min(255,Math.max(0,r+(r*p/100))); g=Math.min(255,Math.max(0,g+(g*p/100))); b=Math.min(255,Math.max(0,b+(b*p/100)));
                  return "#"+Math.round(r).toString(16).padStart(2,'0')+Math.round(g).toString(16).padStart(2,'0')+Math.round(b).toString(16).padStart(2,'0');
                };
                const lum = (hex) => {
                  let r=parseInt(hex.substring(1,3),16)/255,g=parseInt(hex.substring(3,5),16)/255,b=parseInt(hex.substring(5,7),16)/255;
                  let a=[r,g,b].map(v=>v<=0.03928?v/12.92:Math.pow((v+0.055)/1.055,2.4));
                  return a[0]*0.2126+a[1]*0.7152+a[2]*0.0722;
                };
                
                const isLight = lum(bgHex) > 0.5;
                const root = document.documentElement;
                root.style.setProperty('--bg-primary', bgHex);
                root.style.setProperty('--bg-secondary', adj(bgHex, isLight ? -5 : 5));
                root.style.setProperty('--bg-tertiary', adj(bgHex, isLight ? -10 : 10));
                root.style.setProperty('--bg-card', "rgba("+hexToRgb(adj(bgHex, isLight ? -5 : 5))+", 0.8)");
                root.style.setProperty('--bg-glass', "rgba("+hexToRgb(bgHex)+", 0.8)");
                root.style.setProperty('--accent', accentHex);
                root.style.setProperty('--accent-light', adj(accentHex, 20));
                root.style.setProperty('--accent-glow', "rgba("+hexToRgb(accentHex)+", 0.4)");
                root.style.setProperty('--bg-hover', "rgba("+hexToRgb(accentHex)+", 0.08)");
                
                if (isLight) {
                  root.style.setProperty('--text-primary', '#0f172a');
                  root.style.setProperty('--text-secondary', '#334155');
                  root.style.setProperty('--text-muted', '#64748b');
                  root.style.setProperty('--border', 'rgba(0,0,0, 0.1)');
                  root.style.setProperty('--border-hover', 'rgba(0,0,0, 0.2)');
                } else {
                  root.style.setProperty('--text-primary', '#ffffff');
                  root.style.setProperty('--text-secondary', '#a1a1aa');
                  root.style.setProperty('--text-muted', '#71717a');
                  root.style.setProperty('--border', 'rgba(255,255,255, 0.1)');
                  root.style.setProperty('--border-hover', 'rgba(255,255,255, 0.2)');
                }
                root.setAttribute('data-theme', 'custom');
              } else {
                document.documentElement.setAttribute('data-theme', theme);
              }
            } catch (e) {}
          `
        }} />
      </head>
      <body suppressHydrationWarning>
        {children}
        <SaraAssistant />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
