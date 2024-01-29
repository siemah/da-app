import { useCallback, useEffect, useMemo, useReducer, useRef } from 'react';
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
import MDEditor, { commands, RefMDEditor } from '@uiw/react-md-editor';
import { toast } from 'sonner';
import { BsFileEarmarkPlus, BsFileEarmarkMinus } from 'react-icons/bs';
import { FaCircleCheck } from 'react-icons/fa6';
import { Button } from '../components/ui/button';
import { globalReducer } from '../lib/reducer';

function SuccessCheckIcon() {
  return (
    <div className="flex items-center justify-center">
      <FaCircleCheck className="h-6 w-6 text-green-500" />
    </div>
  );
}

const mdxCommands = [
  commands.bold,
  commands.italic,
  commands.strikethrough,
  commands.divider,
  commands.link,
  commands.group(
    [commands.title1, commands.title2, commands.title3, commands.title4],
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
];
export default function Notes() {
  const saveBtnRef = useRef<HTMLButtonElement>(null);
  const deleteBtnRef = useRef<HTMLButtonElement>(null);
  const mdeRef = useRef<RefMDEditor>(null);
  const [state, dispatch] = useReducer(globalReducer, {
    loading: false,
    data: {
      notes: [],
      editorValue: '',
      selectedNote: null,
      editorMode: 'edit',
    },
  });
  const onSaveNote = useCallback(() => {
    const content = state.data.editorValue;
    console.log(`saving btn clicked ${state.data.selectedNote}`);
    const [rawTitle] = content.split(`\n`);
    const title = rawTitle.replaceAll('#', '').trim();

    if (title.length > 0) {
      window.electron.ipcRenderer.sendMessage(CHANNELS.SAVE_NOTE, {
        content,
        title,
        id: state.data.selectedNote,
      });
    }
  }, [state.data.editorValue, state.data.selectedNote]);
  const onDeleteNote = useCallback(() => {
    window.electron.ipcRenderer.sendMessage(
      CHANNELS.DELETE_NOTE,
      state.data.selectedNote,
    );
  }, [state.data.selectedNote]);
  const mdxExtraCommands = useMemo(
    () => [
      commands.codeEdit,
      commands.codePreview,
      {
        name: 'Save',
        keyCommand: 'title5',
        shortcuts: 'ctrlcmd+s',
        buttonProps: { 'aria-label': 'Save note' },
        render(_, disabled) {
          return (
            <Button
              ref={saveBtnRef}
              onClick={(event) => {
                event.stopPropagation();
                onSaveNote();
              }}
              disabled={disabled}
            >
              <IoSaveOutline
                title="Save note (cmd or ctrl + s)"
                className="h-3 w-3"
              />
            </Button>
          );
        },
        execute: () => {
          saveBtnRef.current?.click();
        },
      },
      {
        name: 'Delete',
        keyCommand: 'title6',
        shortcuts: 'ctrlcmd+d',
        buttonProps: { 'aria-label': 'Delete note' },
        render(_, disabled) {
          return (
            <Button
              ref={deleteBtnRef}
              onClick={(event) => {
                event.stopPropagation();
                onDeleteNote();
              }}
              disabled={disabled}
            >
              <BsFileEarmarkMinus
                title="Save note (cmd or ctrl + d)"
                className="h-3 w-3"
              />
            </Button>
          );
        },
        execute: () => {
          deleteBtnRef.current?.click();
        },
      },
    ],
    [onSaveNote, onDeleteNote],
  );
  const onChangeNoteContent = (content: string) => {
    dispatch({
      type: 'SET_FIELD',
      payload: {
        key: 'editorValue',
        value: content,
      },
    });
  };
  const onCheckedChange = (noteId: number) => (isChecked: boolean) => {
    // todo: verify the checked state
    // todo: if true get note id&content then update the state accordingly
    // todo: otherwise set content to empty string and a selected note to null
    let editorProps;
    console.log(`mode ${isChecked ? 'preview' : 'edit'}`);
    if (isChecked === true) {
      const selectedNote = [...state.data.notes].find((note) => {
        return `${note.id}` === `${noteId}`;
      });
      console.log(`selected ${noteId}`);
      editorProps = {
        selectedNote: noteId,
        editorValue: selectedNote.content,
        editorMode: 'preview',
      };
    } else {
      editorProps = {
        selectedNote: null,
        editorValue: '',
        editorMode: 'preview',
      };
    }
    dispatch({
      type: 'SET_FIELDS',
      payload: editorProps,
    });
  };
  const onCreateNew = useCallback(() => {
    dispatch({
      type: 'SET_FIELDS',
      payload: {
        editorMode: 'edit',
        editorValue: '',
        selectedNote: null,
      },
    });
    const timeID = setTimeout(() => {
      mdeRef.current?.textarea?.focus();
      clearTimeout(timeID);
    }, 300);
  }, []);

  // save/update note/s
  useEffect(() => {
    const saveNote = (data: any) => {
      const savedNote = data.data;
      console.log(`save-note-item-${data.data.id}`);
      toast('Saving Note', {
        description: data.message,
        duration: 5000,
        dismissible: true,
        icon: <SuccessCheckIcon />,
        id: `save-note-item-${savedNote.id}`,
      });
      console.log(`it is an update ${data.isUpdate ? 'yes' : 'nope'}`);
      // update note
      if (data.isUpdate === true && state.data.notes.length > 0) {
        const updatedNoteIndex = [...state.data.notes].findIndex(
          (note) => `${note.id}` === `${savedNote.id}`,
        );
        // update only if there is an element
        if (updatedNoteIndex > -1) {
          let midNotes = [...state.data.notes];
          midNotes[updatedNoteIndex] = savedNote;
          midNotes = midNotes.sort((a, b) => b.updatedAt - a.updatedAt);
          dispatch({
            type: 'SET_FIELD',
            payload: {
              key: 'notes',
              value: midNotes,
            },
          });
        }
      } else {
        // create new note
        dispatch({
          type: 'SET_FIELDS',
          payload: {
            notes: [savedNote, ...state.data.notes],
            selectedNote: savedNote.id,
          },
        });
      }
    };
    window.electron.ipcRenderer.once(CHANNELS.SAVE_NOTE, saveNote);

    return () => {
      window.electron.ipcRenderer.off(CHANNELS.SAVE_NOTE, saveNote);
    };
  }, [state.data.notes, state.data.selectedNote]);
  // delete note/s
  useEffect(() => {
    const deleteNote = ({ message, data }: any) => {
      const removedNoteId = data.id;
      const newNotes = [...state.data.notes].filter(
        (note) => `${note.id}` !== `${removedNoteId}`,
      );
      const nextSelectedNote = newNotes?.[0]?.id || null;
      const nextEditorValue = newNotes?.[0]?.content || '';
      dispatch({
        type: 'SET_FIELDS',
        payload: {
          selectedNote: nextSelectedNote,
          editorValue: nextEditorValue,
          notes: newNotes,
        },
      });
      toast('Removing Note', {
        description: message,
        duration: 5000,
        dismissible: true,
        icon: <SuccessCheckIcon />,
        id: `delete-note-item-${removedNoteId}`,
      });
    };
    window.electron.ipcRenderer.once(CHANNELS.DELETE_NOTE, deleteNote);

    return () => {
      window.electron.ipcRenderer.off(CHANNELS.DELETE_NOTE, deleteNote);
    };
  }, [state.data.notes]);
  // fetch notes events
  useEffect(() => {
    const fetchNotes = (notesList: Record<string, string>[]) => {
      console.log('fetching notes..');
      dispatch({
        type: 'SET_FIELDS',
        payload: {
          editorMode: 'preview',
          selectedNote: notesList?.[0]?.id || null,
          editorValue: notesList?.[0]?.content || '',
          notes: notesList,
        },
      });
    };
    window.electron.ipcRenderer.sendMessage(CHANNELS.FETCH_NOTES);
    window.electron.ipcRenderer.once(CHANNELS.FETCH_NOTES, fetchNotes);
    return () => {
      window.electron.ipcRenderer.off(CHANNELS.FETCH_NOTES, fetchNotes);
    };
  }, []);

  return (
    <Layout title="Notes">
      <div className="pr-3 flex flex-row w-full h-[100vh] overflow-y-scroll">
        <div className="py-6 flex flex-col gap-4 w-72 h-full overflow-y-scroll">
          <div className="group/parent min-w-full flex flex-row gap-2 max-w-52 border-b border-slate-300 has-[:focus]:border-white items-center">
            <Label
              htmlFor="query"
              className="flex items-center justify-center text-slate-300 group-focus-within/parent:text-white"
            >
              <IoSearchOutline className="h-6 w-6" />
            </Label>
            <Input
              id="query"
              name="query"
              placeholder="Search for notes"
              className="flex-1 font-light border-0 rounded-none text-white bg-transparent !placeholder-slate-300 text-lg pl-0 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:!outline-none"
            />
            <Button
              variant="outline"
              className="p-1 group/btn bg-transparent hover:bg-black hover:bg-opacity-20 border-none mr-2"
              onClick={onCreateNew}
            >
              <BsFileEarmarkPlus className="h-6 w-6 text-slate-300 group-hover/btn:text-white" />
            </Button>
          </div>
          {/* notes items */}
          <ul className="notes-list flex flex-col gap-1">
            {state.data.notes.map((note: Record<string, string>) => (
              <Label
                key={`note-item-${note.id}`}
                className="flex flex-row gap-3 items-center rounded-lg has-[span[data-state=checked]]:bg-black has-[span[data-state=checked]]:bg-opacity-15 hover:bg-black hover:bg-opacity-15 cursor-pointer p-4"
              >
                <Checkbox
                  id="note-id"
                  className="h-6 w-6 rounded-full border-slate-200 data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
                  onCheckedChange={onCheckedChange(Number(note.id))}
                  checked={`${state.data.selectedNote}` === `${note.id}`}
                />
                <div className="flex-1 flex flex-col gap-1 w-[calc(100%_-_5rem)]">
                  <h2 className="truncate text-white text-xl font-medium first-letter:uppercase">
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
        <div className="py-6 flex-1 border-l border-slate-300 border-opacity-50">
          <MDEditor
            commands={mdxCommands}
            value={state.data.editorValue}
            onChange={onChangeNoteContent}
            extraCommands={mdxExtraCommands}
            className="!h-full !rounded-none !bg-transparent !shadow-none [&_.w-md-editor-text]:text-slate-200 [&_.w-md-editor-toolbar]:bg-black [&_.w-md-editor-toolbar]:bg-opacity-20 [&_.w-md-editor-preview]:shadow-none [&_.w-md-editor-preview_div]:!text-slate-100 [&_.w-md-editor-text]:h-full [&_.w-md-editor-toolbar]:bg-transparent [&_.w-md-editor-toolbar_button]:text-white [&_.w-md-editor-toolbar]:border-none [&_.w-md-editor-preview_div]:bg-transparent [&_blockquote]:!text-slate-300 [&_blockquote]:!border-slate-400"
            preview={state.data.editorMode}
            ref={mdeRef}
          />
        </div>
      </div>
    </Layout>
  );
}
