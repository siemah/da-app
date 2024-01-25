import { useEffect, useState } from 'react';
import CHANNELS from '@/config/channels';
import {
  IoSearchOutline,
  IoChevronForwardOutline,
  IoSaveOutline,
} from 'react-icons/io5';
import Layout from '@/renderer/components/layout';
import { Label } from '@/renderer/components/ui/label';
import { Input } from '@/renderer/components/ui/input';
import { Checkbox } from '@/renderer/components/ui/checkbox';
import MDEditor, { commands } from '@uiw/react-md-editor';
import { toast } from 'sonner';

export default function Notes() {
  const [notes, setNotes] = useState<{
    loading: boolean;
    data: any[];
    selectedNote: null | number;
  }>({
    loading: true,
    data: [],
    selectedNote: null,
  });
  const [value, setValue] = useState<string>('');
  const onChange = (noteContent?: string) => setValue(`${noteContent}`);
  const onCheckedChange = (noteId: number) => (isChecked: boolean) => {
    setNotes((prevState) => ({
      ...prevState,
      selectedNote: isChecked ? noteId : null,
    }));
    const selectedNote = notes.data.find((note) => {
      return `${note.id}` === `${noteId}`;
    });
    setValue(selectedNote.content);
  };

  useEffect(() => {
    const saveNote = ({ message, data, isUpdate }: any) => {
      toast('Saving Note', {
        description: message,
      });

      if (isUpdate === true) {
        const updatedNoteIndex = notes.data.findIndex((note) => {
          return `${note.id}` === `${data.id}`;
        });
        let midNotes = [...notes.data];
        midNotes[updatedNoteIndex] = data;
        midNotes = midNotes.sort((a, b) => b.updatedAt - a.updatedAt);
        setNotes((prevState) => ({
          ...prevState,
          data: midNotes,
        }));
      } else {
        setNotes((prevState) => ({
          ...prevState,
          data: [data, ...prevState.data],
        }));
      }
    };
    window.electron.ipcRenderer.on(CHANNELS.SAVE_NOTE, saveNote);

    return () => {
      window.electron.ipcRenderer.off(CHANNELS.SAVE_NOTE, saveNote);
    };
  }, [notes.data]);

  useEffect(() => {
    window.electron.ipcRenderer.once(CHANNELS.FETCH_NOTES, (...args: any[]) => {
      const [data] = args;
      setNotes((prevState) => ({
        ...prevState,
        loading: false,
        selectedNote: data.id,
        data,
      }));
    });
    window.electron.ipcRenderer.sendMessage(CHANNELS.FETCH_NOTES);
  }, []);

  return (
    <Layout title="Notes">
      <div className="py-6 pr-3 flex flex-row gap-3 w-full max-h-[100vh] overflow-y-scroll">
        <div className="flex flex-col gap-4 w-72 h-full overflow-y-scroll">
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
            {notes.data.map((note: Record<string, string>, index) => (
              <Label
                key={`note-item-${note.id}-${index.toString(16)}`}
                className="flex flex-row gap-3 items-center rounded-lg has-[span[data-state=checked]]:bg-black has-[span[data-state=checked]]:bg-opacity-15 hover:bg-black hover:bg-opacity-15 cursor-pointer p-4"
              >
                <Checkbox
                  id="note-id"
                  className="h-6 w-6 rounded-full border-slate-200 data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
                  checked={`${notes.selectedNote}` === `${note.id}`}
                  onCheckedChange={onCheckedChange(Number(note.id))}
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
              commands.strikethrough,
              commands.divider,
              commands.link,
              commands.group(
                [
                  commands.title1,
                  commands.title2,
                  commands.title3,
                  commands.title4,
                ],
                {
                  name: 'title',
                  groupName: 'title',
                  buttonProps: { 'aria-label': 'Insert title' },
                },
              ),
              commands.divider,
              commands.unorderedListCommand,
              commands.orderedListCommand,
              commands.checkedListCommand,
              commands.divider,
              commands.quote,
              commands.code,
              commands.divider,
              commands.table,
              commands.image,
            ]}
            extraCommands={[
              commands.codeEdit,
              commands.codePreview,
              {
                name: 'Save',
                keyCommand: 'title5',
                shortcuts: 'ctrlcmd+s',
                buttonProps: { 'aria-label': 'Save note' },
                icon: (
                  <IoSaveOutline
                    title="Save note (ctrl + s)"
                    className="h-3 w-3"
                  />
                ),
                execute: (state) => {
                  const content = state.text;
                  // todo: get title if its a new note
                  const [rawTitle] = content.split(`\n`);
                  const title = rawTitle.replaceAll('#', '').trim();
                  window.electron.ipcRenderer.sendMessage(CHANNELS.SAVE_NOTE, {
                    content: state.text,
                    title,
                    id: notes.selectedNote,
                  });
                },
              },
            ]}
            className="!h-full !rounded-none !bg-transparent !shadow-none [&_.w-md-editor-text]:text-slate-200 [&_.w-md-editor-toolbar]:bg-black [&_.w-md-editor-toolbar]:bg-opacity-20 [&_.w-md-editor-preview]:shadow-none [&_.w-md-editor-preview_div]:!text-slate-100 [&_.w-md-editor-text]:h-full [&_.w-md-editor-toolbar]:bg-transparent [&_.w-md-editor-toolbar_button]:text-white [&_.w-md-editor-toolbar]:border-none [&_.w-md-editor-preview_div]:bg-transparent [&_blockquote]:!text-slate-300 [&_blockquote]:!border-slate-400"
            preview="preview"
          />
        </div>
      </div>
    </Layout>
  );
}
