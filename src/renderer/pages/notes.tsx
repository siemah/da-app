import React, { useEffect, useState } from 'react';
import CHANNELS from '@/config/channels';
import { IoSearchOutline, IoChevronForwardOutline } from 'react-icons/io5';
import Layout from '@/renderer/components/layout';
import { Label } from '@/renderer/components/ui/label';
import { Input } from '@/renderer/components/ui/input';
import { Checkbox } from '@/renderer/components/ui/checkbox';
import MDEditor, { commands } from '@uiw/react-md-editor';

export default function Notes() {
  const [notes, setNotes] = useState({
    loading: true,
    data: [],
  });
  const [value, setValue] = useState<string>('');
  const onChange = (noteContent?: string) => setValue(`${noteContent}`);

  useEffect(() => {
    window.electron.ipcRenderer.once(CHANNELS.FETCH_NOTES, (...args: any[]) => {
      const [data] = args;
      setNotes({
        loading: false,
        data,
      });
    });
    window.electron.ipcRenderer.sendMessage(CHANNELS.FETCH_NOTES);
  }, []);

  return (
    <Layout title="Notes">
      <div className="py-6 pr-3 flex flex-row gap-3 w-full">
        <div className="flex flex-col gap-4 w-72">
          <div className="min-w-full flex flex-row gap-2 max-w-52 border-b border-slate-300 border-opacity-50">
            <Label htmlFor="query" className="flex items-center justify-center">
              <IoSearchOutline className="h-6 w-6 text-slate-300" />
            </Label>
            <Input
              id="query"
              name="query"
              placeholder="Search for notes titles"
              className="flex-1 font-light border-0 rounded-none text-white bg-transparent !placeholder-slate-300 text-lg pl-0 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:!outline-none"
            />
          </div>
          {/* notes items */}
          <ul className="notes-list flex flex-col gap-1">
            {notes.data.map((note: Record<string, string>) => (
              <Label
                key={`note-item-${note.id}`}
                className="flex flex-row gap-3 items-center rounded-lg has-[span[data-state=checked]]:bg-black has-[span[data-state=checked]]:bg-opacity-15 hover:bg-black hover:bg-opacity-15 cursor-pointer p-4"
              >
                <Checkbox
                  id="note-id"
                  className="h-6 w-6 rounded-full border-slate-200 data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
                />
                <div className="flex-1 flex flex-col gap-1 w-[calc(100%_-_5rem)]">
                  <h2 className="truncate text-white text-xl font-medium">
                    {note.title}
                  </h2>
                  <p className="truncate text-slate-300 text-sm max-w-full">
                    {note.content}
                  </p>
                </div>
                <IoChevronForwardOutline className="h-6 w-6 text-slate-200" />
              </Label>
            ))}
          </ul>
        </div>
        <div className="flex-1 border-l border-slate-300 border-opacity-50">
          <MDEditor
            value={value}
            onChange={onChange}
            commands={[
              commands.bold,
              commands.italic,
              commands.title,
              commands.strikethrough,
              commands.link,
              commands.orderedListCommand,
              commands.checkedListCommand,
              commands.unorderedListCommand,
              commands.quote,
              commands.code,
              commands.divider,
              commands.table,
              commands.image,
            ]}
            className="!h-full !rounded-none !bg-transparent !shadow-none [&_.w-md-editor-text]:text-slate-200 [&_.w-md-editor-toolbar]:bg-black [&_.w-md-editor-toolbar]:bg-opacity-20 [&_.w-md-editor-preview]:shadow-none [&_.w-md-editor-preview_div]:!text-slate-100 [&_.w-md-editor-text]:h-full [&_.w-md-editor-toolbar]:bg-transparent [&_.w-md-editor-toolbar_button]:text-white [&_.w-md-editor-toolbar]:border-none [&_.w-md-editor-preview_div]:bg-transparent [&_blockquote]:!text-slate-300 [&_blockquote]:!border-slate-400"
            preview="preview"
          />
        </div>
      </div>
    </Layout>
  );
}
