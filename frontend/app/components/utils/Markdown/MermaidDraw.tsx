// next
import { useTheme } from 'next-themes';
// react
import { useEffect, useRef } from 'react';
// shadcn
import { cn } from '@/app/components/lib/shadcn';
import { Button } from '@/app/components/ui/shadcn/button';
// features
import { generateUUIDHex } from '@/features/utils';
// icon
import { Download } from 'lucide-react';
// lib
import mermaid from 'mermaid';


// type
type MermaidDrawProps = {
  code:       string;
  className?: string;
};

// MermaidDraw
export function MermaidDraw({ code, className }: MermaidDrawProps) {

    const ref               = useRef<HTMLDivElement>(null);
    const { resolvedTheme } = useTheme();

    useEffect(() => {
      mermaid.initialize({
        startOnLoad:   false,
        securityLevel: 'strict',
        theme:         resolvedTheme,
      });
      const uniqueId = 'mermaid-' + generateUUIDHex();
      if (ref.current) {
        try{
          mermaid.render(uniqueId, code, (svgCode) => {
            ref.current!.innerHTML = svgCode;
          });
        } catch {
          ref.current!.innerHTML = `
            <p style="color:#999999;font-size:0.75rem;font-weight:100;user-select:none;">
              Sorry Mermaid parse error...
            </p>
            <p>${code}</p>
          `;
        };
      };
    }, [code, resolvedTheme]);

    // handleDownloadPng
    const handleDownloadPng = () => {
      if (!ref.current) return;
      const svgEl = ref.current.querySelector('svg');
      if (!svgEl) return;
    
      // SVG を文字列に
      const svgData = new XMLSerializer().serializeToString(svgEl);
      // <canvas> を作成して、SVGを画像として読み込む
      const canvas = document.createElement('canvas');
      // 大きさを設定
      const bbox    = svgEl.getBBox();
      canvas.width  = bbox.width  || 600;
      canvas.height = bbox.height || 400;
      // SVG文字列 → Base64 データURL
      const ctx   = canvas.getContext('2d');
      const image = new Image();
      image.src   = 'data:image/svg+xml;base64,' + window.btoa(unescape(encodeURIComponent(svgData)));
      // ダウンロード
      image.onload = () => {
        ctx?.drawImage(image, 0, 0);
        // PNGデータURLをダウンロード
        const pngUrl  = canvas.toDataURL('image/png');
        const link    = document.createElement('a');
        link.href     = pngUrl;
        link.download = 'image.png';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      };
    };

    return (
      <div className = 'relative rounded-md border'>  
        <div ref       = {ref}
             className = {cn(
              'flex justify-center min-h-[150px]',
              className,
             )} />
        <Button variant   = 'ghost'
                size      = 'fit'
                className = {cn(
                  'flex items-center rounded-md z-dropdown',
                  'absolute top-2 right-2 [&_svg]:size-5',
                  'opacity-20 hover:opacity-100',
                )}
                onClick = {handleDownloadPng}>
          <Download />
        </Button>
      </div>
    );
  };