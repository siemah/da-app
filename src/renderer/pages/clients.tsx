import {
  ChangeEvent,
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
} from 'react';
import CHANNELS from '@/config/channels';
import {
  IoSearchOutline,
  IoChevronForwardOutline,
  IoSaveOutline,
} from 'react-icons/io5';
import Layout from '@/renderer/components/layout';
import { Client } from '@/types/data';
import { Label } from '@/renderer/components/ui/label';
import { Input } from '@/renderer/components/ui/input';
import { Checkbox } from '@/renderer/components/ui/checkbox';
import MDEditor, { commands, RefMDEditor } from '@uiw/react-md-editor';
import { toast } from 'sonner';
import { BsFileEarmarkPlus, BsFileEarmarkMinus } from 'react-icons/bs';
import { FaCircleCheck } from 'react-icons/fa6';
import { Button } from '@/renderer/components/ui/button';
import { globalReducer } from '@/renderer/lib/reducer';
import SideList from '@/renderer/components/side-list';

export default function Clients() {
  const [state, dispatch] = useReducer(globalReducer, {
    loading: false,
    data: {
      list: [],
      selected: null,
      filtredList: [],
    },
  });
  const dataList =
    state.data.filtredList.length > 0
      ? state.data.filtredList
      : state.data.list;

  useEffect(() => {
    const fetchClients = ({ data }: Record<string, any>[]) => {
      dispatch({
        type: 'SET_FIELDS',
        payload: {
          selected: data?.[0]?.id || null,
          list: data,
        },
      });
    };
    window.electron.ipcRenderer.sendMessage(CHANNELS.FETCH_CLIENTS);
    window.electron.ipcRenderer.once(CHANNELS.FETCH_CLIENTS, fetchClients);
    return () => {
      window.electron.ipcRenderer.off(CHANNELS.FETCH_CLIENTS, fetchClients);
    };
  }, []);

  return (
    <Layout title="Clients">
      <div className="pr-3 flex flex-row w-full h-[100vh] overflow-y-scroll">
        <SideList<Client>
          checkedId={state.data.selected}
          data={dataList}
          onCheckedChange={() => () => {}}
          onCreateNew={() => {}}
          onSearch={() => {}}
          renderItem={(dataItem) => (
            <>
              <h2 className="truncate text-white text-xl font-medium first-letter:uppercase">
                {dataItem.name}
              </h2>
              <p className="truncate text-slate-300 text-sm max-w-full">
                {new Date(dataItem.updatedAt).toLocaleDateString()}
              </p>
            </>
          )}
        />
        <div className="py-6 flex-1 border-l border-slate-300 border-opacity-50"></div>
      </div>
    </Layout>
  );
}
