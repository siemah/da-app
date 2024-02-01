import {
  ChangeEvent,
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
} from 'react';
import CHANNELS from '@/config/channels';
import { IoSaveOutline } from 'react-icons/io5';
import Layout from '@/renderer/components/layout';
import { Note } from '@/types/data';
import MDEditor, { commands, RefMDEditor } from '@uiw/react-md-editor';
import { toast } from 'sonner';
import { BsFileEarmarkMinus } from 'react-icons/bs';
import { Button } from '@/renderer/components/ui/button';
import SuccessCheckIcon from '@/renderer/components/toast-success-icon';
import { globalReducer } from '@/renderer/lib/reducer';
import SideList from '@/renderer/components/side-list';

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
      filtredNotes: [],
    },
  });
  const listOfNotes =
    state.data.filtredNotes.length > 0
      ? state.data.filtredNotes
      : state.data.notes;
  const onSaveNote = useCallback(() => {
    const content = state.data.editorValue;
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
  const onChangeNoteContent = (content?: string) => {
    dispatch({
      type: 'SET_FIELD',
      payload: {
        key: 'editorValue',
        value: content || '',
      },
    });
  };
  const onCheckedChange = (noteId: number) => (isChecked: boolean) => {
    let editorProps;
    if (isChecked === true) {
      const selectedNote = [...state.data.notes].find((note) => {
        return `${note.id}` === `${noteId}`;
      });
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
  const onSearch = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const { value: searchText } = event.currentTarget;
      const filtredNotes = state.data.notes.filter((note: Note) => {
        return `${note?.title}`
          ?.toLowerCase()
          ?.includes(searchText.toLowerCase());
      });
      dispatch({
        type: 'SET_FIELD',
        payload: {
          key: 'filtredNotes',
          value: filtredNotes,
        },
      });
    },
    [state.data.notes],
  );
  const renderItem = useCallback(
    (dataItem: Note) => (
      <>
        <h2 className="truncate text-white text-xl font-medium first-letter:uppercase">
          {dataItem.title}
        </h2>
        <p className="truncate text-slate-300 text-sm max-w-full">
          {dataItem.content}
        </p>
      </>
    ),
    [],
  );

  // save/update note/s
  useEffect(() => {
    const saveNote = (data: any) => {
      const savedNote = data.data;
      toast('Saving Note', {
        description: data.message,
        duration: 5000,
        dismissible: true,
        icon: <SuccessCheckIcon />,
        id: `save-note-item-${savedNote.id}`,
      });
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
        <SideList<Note>
          checkedId={state.data.selectedNote}
          data={listOfNotes}
          onCheckedChange={onCheckedChange}
          onCreateNew={onCreateNew}
          onSearch={onSearch}
          renderItem={renderItem}
        />
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
