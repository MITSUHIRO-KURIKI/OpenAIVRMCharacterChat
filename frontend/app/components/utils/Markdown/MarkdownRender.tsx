// next
import { useTheme } from 'next-themes';
// react
import { type ReactElement } from 'react';
// shadcn
import { cn } from '@/app/components/lib/shadcn';
import { Button } from '@/app/components/ui/shadcn/button';
import { Badge } from '@/app/components/ui/shadcn/badge';
// icon
import { Copy } from 'lucide-react';
// lib
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import remarkBreaks from 'remark-breaks';
import remarkRuby from 'remark-denden-ruby';
import remarkRehype from 'remark-rehype';
import rehypeKatex from 'rehype-katex';
import rehypeExternalLinks from 'rehype-external-links';
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import {
  coy      as PrismStyleLight,
  a11yDark as PrismStyleDark,
} from 'react-syntax-highlighter/dist/esm/styles/prism';
// features
import { defaultUrlTransform } from '@/features/utils';
// hooks
import { useStringCopy } from '@/app/hooks';
// include
import { MermaidDraw } from './MermaidDraw';


// type
type MarkdownRenderProps = {
  markdownString:     string;
  isStreamingRender?: boolean; // true の場合には mermaid などのストリーム非対応を処理しない
  isUseCopyButton?:   boolean;
  className?:         string;
};

// MarkdownRender ▽
export function MarkdownRender({
  markdownString,
  isStreamingRender = false,
  isUseCopyButton   = true,
  className,}:MarkdownRenderProps): ReactElement{

  const { resolvedTheme } = useTheme();
  const handleStringCopy  = useStringCopy();

  return (
    <>
      <span className={cn(
        'text-foreground',
        '[&_p]:py-1',
        // 見出しスタイル
        '[&_h1]:font-bold [&_h2]:font-bold [&_h3]:font-bold',
        '[&_h1]:pt-4 [&_h2]:pt-4 [&_h3]:pt-4 [&_h4]:pt-4 [&_h5]:pt-4 [&_h6]:pt-4',
        '[&_h1]:pb-2 [&_h2]:pb-2 [&_h3]:pb-2 [&_h4]:pb-2 [&_h5]:pb-2 [&_h6]:pb-2',
        // 箇条書きスタイル
        '[&_ul]:list-disc [&_ul]:pl-4 [&_ol]:list-decimal [&_ol]:pl-[1rem] [&_li]:px-1',
        // テーブルに対するスタイル
        '[&_table]:my-2',
        '[&_table]:border-collapse',
        '[&_table]:text-sm',
        '[&_table]:rounded-md',
        '[&_table]:overflow-hidden',
        // - 枠線や背景色
        '[&_table]:border [&_th]:border-b [&_td]:border-b',
        '[&_thead_tr]:bg-muted',
        '[&_thead_th]:text-left',
        '[&_thead_th]:px-4 [&_thead_th]:py-2',
        '[&_thead_th]:font-medium [&_thead_th]:text-muted-foreground',
        // - tbody の各セル
        '[&_tbody_td]:px-4 [&_tbody_td]:py-2',
        // - ホバー時に行ハイライトする例
        '[&_tbody_tr:hover]:bg-muted/50',
        // 引用文に対するスタイル
        '[&_blockquote]:italic',
        '[&_blockquote]:p-1 [&_blockquote]:my-2',
        '[&_blockquote]:border-s-4 [&_blockquote]:border-gray-300 [&_blockquote]:dark:border-gray-500',
        '[&_blockquote]:bg-gray-50  [&_blockquote]:dark:bg-gray-800',
        // 区切り線に対するスタイル
        '[&_hr]:my-2',
        className,)}>
        <ReactMarkdown
            remarkPlugins = {[
              remarkGfm,
              remarkMath,
              remarkBreaks,
              remarkRuby,
              remarkRehype,
            ]}
            rehypePlugins = {[
              [rehypeSanitize,        // XSS対策
                {...defaultSchema,}
              ],
              rehypeKatex,            // 数式
              [rehypeExternalLinks,   // 外部リンク
                { target: '_blank',
                  rel:    ['noopener', 'noreferrer'],}
              ],
            ]}
            urlTransform = {(url: string) => {
              if (url.startsWith('data:image/')) return url; // 画像(dataURL)はそのまま
              return defaultUrlTransform(url);
            }}
            components = {{
              img({ alt, ...props }) {
                return (
                  /* eslint-disable-next-line react-hooks/exhaustive-deps */
                  <img className={cn(
                          'max-w-30 max-h-30',
                          'object-scale-down rounded-lg',
                          'shadow-xl dark:shadow-gray-800',
                        )}
                        alt={alt ?? 'image'}
                        {...props} />
                );
              },
              code({ className, children }) {
                const language = (/language-(\w+)/.exec(className || '') || ['', ''])[1];
                // Mermaid
                if (language === 'mermaid') {
                  if (isStreamingRender) {
                    return children;
                  } else {
                    const copyMermaidCode = String(children)+'\n\n* You can try the mermaid code here: https://mermaid.live/';
                    return (
                      <div className='relative'>
                        <MermaidDraw code={String(children)} />
                        {/* Copy Button */}
                        <Button variant   = 'ghost'
                                size      = 'fit'
                                className = {cn(
                                  'flex items-center rounded-md z-dropdown',
                                  'absolute bottom-1 right-1 text-xs',
                                  'opacity-20 hover:opacity-100',
                                )}
                                onClick = {() => handleStringCopy(copyMermaidCode)}>
                          <Copy />
                        </Button>
                      </div>
                    );
                  };
                // ある程度長めのコードは SyntaxHighlighter を使う
                } else if (language || String(children).length >= 50) {
                  const languageDisplay = language || 'plaintext';
                  const PrismStyle      = resolvedTheme === 'dark' ? PrismStyleDark : PrismStyleLight;
                  return (
                    <div className='relative'>
                      {languageDisplay && (
                        <Badge  variant   = 'secondary'
                                className = {cn(
                                  'absolute right-0 top-0 px-2',
                                  'text-xs font-thin',
                                )}>
                          {languageDisplay.toUpperCase()}
                        </Badge>
                      )}
                      <SyntaxHighlighter
                        language     = {language}
                        PreTag       = 'div'
                        style        = {PrismStyle}
                        customStyle  = {{
                          textShadow: 'none',
                          padding:    '1rem 0.5rem',
                        }}
                        codeTagProps = {{
                          style: {
                            textShadow: 'none',
                            whiteSpace: 'pre-wrap',
                            lineHeight: '1.1',}
                        }}
                        wrapLongLines
                        showLineNumbers
                        lineNumberStyle = {{
                          width:        '0px', // fit
                          marginRight:  '0.75rem',
                          paddingRight: '0.5rem',
                          borderRight:  '1px solid #999999',
                          textAlign:    'right',
                        }} >
                        {String(children).replace(/\n+$/, '')}
                      </SyntaxHighlighter>

                      {/* Copy Button */}
                      <Button variant   = 'ghost'
                              size      = 'fit'
                              className = {cn(
                                'flex items-center rounded-md z-dropdown',
                                'absolute bottom-1 right-1 text-xs',
                                'opacity-20 hover:opacity-100',
                              )}
                              onClick = {() => handleStringCopy(String(children))}>
                        <Copy />
                      </Button>

                    </div>
                  );
                } else {
                  // 'short text' などの単語レベル
                  return (
                    <span className = 'bg-muted font-thin'
                          style     = {{
                            fontFamily: 'Consolas, Monaco, "Andale Mono", "Ubuntu Mono", monospace',
                          }}>
                      {children}
                    </span>
                  );
                };
              },
            }}>
          {markdownString}
        </ReactMarkdown>
      </span>
      {/* Copy Button */}
      {isUseCopyButton && (
        <Button variant   = 'ghost'
                size      = 'fit'
                className = {cn(
                  'flex items-center rounded-md z-dropdown',
                  'mt-2 px-1 py-1 text-xs',
                  'opacity-50 hover:opacity-100',
                  'bg-transparent hover:bg-transparent',
                )}
                onClick = {() => handleStringCopy(markdownString)}>
          <Copy />
        </Button>
      )}
    </>
  );
};
// MarkdownRender △