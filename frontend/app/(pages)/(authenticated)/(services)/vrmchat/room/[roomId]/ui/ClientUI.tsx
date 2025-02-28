'use client';

// react
import { type ReactElement } from 'react';
// shadcn
import { cn } from '@/app/components/lib/shadcn';
import {
  Card,
  CardContent,
} from '@/app/components/ui/shadcn/card';
import { ScrollArea } from '@/app/components/ui/shadcn/scroll-area';
import { Skeleton } from '@/app/components/ui/shadcn/skeleton';
import { Badge } from '@/app/components/ui/shadcn/badge';
// icon
import { MicOff, Loader2 } from 'lucide-react';
// components
import { MarkdownRender } from '@/app/components/utils';
// include
import { RoomSettingsSheet } from './RoomSettings';
// type
import type { ClientUIProps } from '../ClientContext';


// ClientUI ▽
export function ClientUI({
  roomId,
  isWebSocketWaiting,
  recognizedText,
  recognizingText,
  receivedMessages,
  isLoading,
  isRecognizing,
  isStopRecognition,
  toggleRecognition,
  width,
  height,
  containerRef,}: ClientUIProps): ReactElement{

  return ( 
    <div className='relative size-full'>
      {/* VRM */}
      <div ref       = {containerRef}
           className = {cn(
            'absolute top-1/2 left-1/2',
            '-translate-x-1/2 -translate-y-1/2',
            `w-[${width}px] h-[${height}px]`)} />

      {/* ルーム設定 */}
      <RoomSettingsSheet roomId    = {roomId}
                         className = 'absolute right-0 [&_svg]:size-6' />

      {/* 会話テキスト */}
      <Card className={cn(
          'absolute bottom-[4%] left-1/2 -translate-x-1/2',
          'text-xs md:text-base',
          'w-[60rem] h-[10rem] max-w-[95%] max-h-[30%]',
          'bg-transparent shadow-none',)}>

        {/* カード背景のグラデーション */}
        <div className={cn(
            'pointer-events-none absolute inset-0',
            'bg-gradient-to-t from-background from-80% to-background/60',)} />

        <CardContent className='relative z-10 flex h-full flex-col p-4 pr-16'>

          {/* ユーザ発話 or AI レスポンスの表示切り替え */}
          <ScrollArea>
            { (!recognizedText?.length && !recognizingText && !receivedMessages?.length) ? (
              <>
                <p className='select-none text-foreground/60'>Recognizes your voice while pressing the spacebar.</p>
                <p className='select-none text-foreground/60'>You can also start recognition by clicking the microphone icon on the right.</p>
              </>
              
            ) : ( (!isStopRecognition || isWebSocketWaiting) ? (
              <>
                <span className='select-none text-foreground'>{recognizedText}</span>
                <span className='select-none text-foreground/60'>{recognizingText}</span>
              </>
            ) : ( (receivedMessages) ? (
              <MarkdownRender markdownString={receivedMessages}/>
            ) : (
              <>
                <Skeleton className='mt-1 h-[20px] w-[25rem] rounded-full' />
                <Skeleton className='mt-1 h-[20px] w-80 rounded-full' />
              </>
            )
            ))}
          </ScrollArea>

          {/* 会話ターンの表示 */}
          <div className='absolute -left-4 -top-4 z-sticky'>
            { (!isStopRecognition || isWebSocketWaiting) ? (
              <Badge className='bg-info font-semibold text-info-foreground hover:bg-info'>You</Badge>
            ) : (
              <Badge className='bg-success font-semibold text-success-foreground hover:bg-success'>AI</Badge>
            )}
          </div>

          {/* 音声認識の利用可能状態の表示 */}
          <div className='absolute right-4 top-1/2 -translate-y-1/2'>
            <button type    = 'button' 
                    onClick = {toggleRecognition}>
              {isLoading || isWebSocketWaiting ? (
                <Loader2 className='size-9 animate-spin' />
              ) : isRecognizing ? (
                <div className='size-9 animate-spin rounded-bl-[1.9rem] rounded-br-[2.1rem] rounded-tl-[2.1rem] rounded-tr-[1.9rem] bg-gradient-to-r from-teal-400 to-blue-400'/>
              ) : (
                <MicOff className='size-9' />
              )}
            </button>
          </div>

        </CardContent>
      </Card>
    </div>
  );
};
// ClientUI △