import { FormEvent, useEffect, useReducer, useRef } from 'react';
import CHANNELS from '@/config/channels';
import Layout from '@/renderer/components/layout';
import { Client } from '@/types/data';
import { globalReducer } from '@/renderer/lib/reducer';
import SideList from '@/renderer/components/side-list';
import FormInput from '@/renderer/components/form-input';
import {
  IoBusiness,
  IoPhonePortraitOutline,
  IoMailOutline,
} from 'react-icons/io5';
import { Button } from '../components/ui/button';
import { toast } from 'sonner';
import SuccessCheckIcon from '../components/toast-success-icon';
import DangerIcon from '../components/toast-danger-icon';

export default function Clients() {
  const clientFormRef = useRef<HTMLFormElement>(null);
  const [state, dispatch] = useReducer(globalReducer, {
    loading: false,
    data: {
      list: [],
      selected: null,
      filtredList: [],
      ui: {
        showCreate: false,
      },
    },
  });
  const dataList =
    state.data.filtredList.length > 0
      ? state.data.filtredList
      : state.data.list;

  const renderItem = (dataItem: Client) => (
    <>
      <h2 className="truncate text-white text-xl font-medium first-letter:uppercase">
        {dataItem.name}
      </h2>
      <p className="truncate text-slate-300 text-sm max-w-full">
        {new Date(dataItem.updatedAt).toLocaleDateString()}
      </p>
    </>
  );
  const onCreateNew = () => {
    // todo: show a form in the main ui
  };
  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    dispatch({
      type: 'SET_LOADING',
      payload: true,
    });
    const formData = new FormData(event.currentTarget);
    const newClient = {
      name: formData.get('name') || null,
      phone_number: formData.get('phone_number') || null,
      email: formData.get('email') || null,
    };
    window.electron.ipcRenderer.sendMessage(CHANNELS.SAVE_CLIENT, newClient);
  };
  // save client
  useEffect(() => {
    const saveClient = ({ data: clientData, message, errors }: any) => {
      const isSuccess = message !== undefined;
      const toastConfig = {
        description: isSuccess ? message : errors?.global,
        id: `save-client-${clientData?.id}`,
        duration: 5000,
        dismissible: true,
        icon: isSuccess ? <SuccessCheckIcon /> : <DangerIcon />,
      };
      toast('Save client', toastConfig);
      dispatch({
        type: 'SET_LOADING',
        payload: false,
      });
      dispatch({
        type: 'SET_FIELDS',
        payload: {
          list: [clientData, ...state.data.list],
          selected: clientData?.id || state.data.list?.[0]?.id || null,
        },
      });

      if (isSuccess === true) {
        clientFormRef.current?.reset();
      }
    };
    window.electron.ipcRenderer.once(CHANNELS.SAVE_CLIENT, saveClient);
    return () => {
      window.electron.ipcRenderer.off(CHANNELS.SAVE_CLIENT, saveClient);
    };
  }, [state.data.list]);
  // fetch clients
  useEffect(() => {
    const fetchClients = ({ data }: Record<string, any>) => {
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
          onCreateNew={onCreateNew}
          onSearch={() => {}}
          renderItem={renderItem}
        />
        <form
          onSubmit={onSubmit}
          className="py-6 px-3 flex-1 flex flex-col gap-6 border-l border-slate-300 border-opacity-50"
          ref={clientFormRef}
        >
          <FormInput name="name" label="Client name" Icon={IoBusiness} />
          <FormInput
            name="phone_number"
            label="Phone number"
            Icon={IoPhonePortraitOutline}
          />
          <FormInput name="email" label="Email" Icon={IoMailOutline} />
          <Button
            variant="default"
            className="rounded-lg w-fit px-14 py-2 h-9 bg-blue-500 hover:bg-blue-400 focus-visible:ring-blue-500"
            type="submit"
            disabled={state.loading}
          >
            Save
          </Button>
        </form>
      </div>
    </Layout>
  );
}
