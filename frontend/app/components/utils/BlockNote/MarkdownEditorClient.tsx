'use client';

// next
import { useTheme } from 'next-themes';
// react
import { useState, useEffect, useCallback } from 'react';
// blocknote
import '@blocknote/core/fonts/inter.css';
import { BlockNoteView } from '@blocknote/mantine';
import '@blocknote/mantine/style.css';
import {
  BlockColorsItem,
  DragHandleMenu,
  RemoveBlockItem,
  SideMenu,
  SideMenuController,
  useCreateBlockNote,
} from '@blocknote/react';
import { locales } from '@blocknote/core';
import { ResetBlockTypeItem } from './ResetBlockTypeItem';
// shadcn
import { cn } from '@/app/components/lib/shadcn';


// type
type MarkdownEditorClientProps = {
  initialMarkdown?: string;
  onChange?:        (updatedMarkdown: string) => void;
  localeCode?:      keyof typeof locales;
  className?:       string;
};

// MarkdownEditorClient
export function MarkdownEditorClient({ initialMarkdown, onChange, localeCode = 'ja', className }: MarkdownEditorClientProps) {

  const { resolvedTheme } = useTheme();
  const blockNoteTheme    = resolvedTheme === 'dark' ? 'dark' : 'light';
  const [ , setMarkdown ] = useState('');

  // locales
  let dictionary = locales.ja;
  if ( localeCode === 'en') {
    dictionary = locales.en;
  }; // 他に対応言語あれば追加

  // https://www.blocknotejs.org/docs/editor-basics/setup#usecreateblocknote-hook
  const editor = useCreateBlockNote({
    dictionary:    dictionary,
    trailingBlock: true,
    animations:    true,
  });

  // Markdownを読み込んでエディタに反映
  const loadMarkdownIntoEditor = useCallback(async ({md}: {md: string}) => {
    // Markdown -> Blocks
    const blocks = await editor.tryParseMarkdownToBlocks(md);
    // エディタの内容を置き換える
    editor.replaceBlocks(editor.document, blocks);
    // そのまま反映後のMarkdownを再取得して表示ステート更新
    const newMd = await editor.blocksToMarkdownLossy(editor.document);
    setMarkdown(newMd);
  }, [editor]);

  // handleEditorChange
  //  - onChange で渡された関数に対して blocksToMarkdown の Markdown を返す
  const handleEditorChange = useCallback(async () => {
    const md = await editor.blocksToMarkdownLossy(editor.document);
    setMarkdown(md);
    onChange?.(md);
  }, [editor, onChange]);

  // 初回マウント
  useEffect(() => {
    void loadMarkdownIntoEditor({md: initialMarkdown ?? ''});
  }, [initialMarkdown, loadMarkdownIntoEditor]);

  return (
    // https://www.blocknotejs.org/docs/editor-basics/setup#rendering-the-editor-with-blocknoteview
    <BlockNoteView editor    = {editor}
                   onChange  = {handleEditorChange}
                   theme     = {blockNoteTheme}
                   sideMenu  = {false}
                   className={cn(
                    // 見出しスタイル
                    '[&_h1]:!font-bold [&_h2]:!font-bold [&_h3]:!font-bold',
                    '[&_h1]:!text-2xl [&_h2]:!text-xl [&_h3]:!text-lg [&_h4]:!text-base [&_h5]:!text-base [&_h6]:!text-base',
                    // 箇条書きスタイル
                    '[&_ul]:!list-disc [&_ol]:!list-decimal',
                    // テーブルに対するスタイル
                    '[&_table]:!border-collapse',
                    '[&_table]:!text-sm',
                    '[&_table]:!rounded-md',
                    '[&_table]:!overflow-hidden',
                    // - 枠線や背景色
                    '[&_table]:!border [&_th]:!border-b [&_td]:!border-b',
                    '[&_thead_th]:!font-medium [&_thead_th]:!text-muted-foreground',
                    // - ホバー時に行ハイライトする例
                    '[&_tbody_tr:hover]:!bg-muted/50',
                    // 引用文に対するスタイル
                    '[&_blockquote]:!italic',
                    '[&_blockquote]:!border-s-4 [&_blockquote]:!border-gray-300 [&_blockquote]:!dark:border-gray-500',
                    '[&_blockquote]:!bg-gray-50  [&_blockquote]:!dark:bg-gray-800',
                    className,)} >
      <SideMenuController sideMenu = {(props) => (
        <SideMenu
          {...props}
          dragHandleMenu = {(props) => (
            <DragHandleMenu {...props}>
              <BlockColorsItem    {...props}>Color</BlockColorsItem>
              <ResetBlockTypeItem {...props}>Reset block style</ResetBlockTypeItem>
              <RemoveBlockItem    {...props}>Delete block</RemoveBlockItem>
            </DragHandleMenu>
        )} />
      )} />
    </BlockNoteView>
  );
};