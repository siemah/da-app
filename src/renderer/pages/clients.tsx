import {
  ChangeEvent,
  FormEvent,
  useCallback,
  useEffect,
  useReducer,
  useRef,
} from 'react';
import CHANNELS from '@/config/channels';
import Layout from '@/renderer/components/layout';
import { Client } from '@/types/data';
import { globalReducer } from '@/renderer/lib/reducer';
import SideList from '@/renderer/components/side-list';
import { toast } from 'sonner';
import SuccessCheckIcon from '@/renderer/components/toast-success-icon';
import DangerIcon from '@/renderer/components/toast-danger-icon';
import ClientForm from '@/renderer/components/client-form';
import { GoAlertFill } from 'react-icons/go';
import Modal from '../components/modal';

export default function Clients() {
  const clientFormRef = useRef<HTMLFormElement>(null);
  const [state, dispatch] = useReducer(globalReducer, {
    loading: true,
    data: {
      list: [],
      selected: null,
      filtredList: [],
      ui: {
        showModal: false,
      },
    },
  });
  const selectedClientData = state.data.list.find(
    (client: Client) => client.id === state.data?.selected,
  );
  const dataList =
    state.data.filtredList.length > 0
      ? state.data.filtredList
      : state.data.list;

  const renderItem = useCallback(
    (dataItem: Client) => (
      <>
        <h2 className="truncate text-white text-xl font-medium first-letter:uppercase">
          {dataItem.name}
        </h2>
        <p className="truncate text-slate-300 text-sm max-w-full">
          {new Date(dataItem.updatedAt).toLocaleDateString()}
        </p>
      </>
    ),
    [],
  );
  const onCreateNew = () => {
    dispatch({
      type: 'SET_FIELDS',
      payload: {
        selected: null,
      },
    });
  };
  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    dispatch({
      type: 'SET_LOADING',
      payload: true,
    });
    const formData = new FormData(event.currentTarget);
    const id = formData.get('id');
    let newClient = {
      name: formData.get('name') || null,
      phone_number: formData.get('phone_number') || null,
      email: formData.get('email') || null,
    };

    if (id !== '' && id !== null) {
      // @ts-ignore
      newClient = { ...newClient, id };
    }

    clientFormRef.current?.reset();
    window.electron.ipcRenderer.sendMessage(CHANNELS.SAVE_CLIENT, newClient);
  };
  const onCheckedChange = (currentId: number) => (isChecked: boolean) => {
    let updatedProps;

    if (isChecked === true) {
      updatedProps = {
        selected: currentId,
      };
    } else {
      updatedProps = {
        selectedNote: null,
      };
    }

    dispatch({
      type: 'SET_FIELDS',
      payload: updatedProps,
    });
  };
  const onSearch = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const { value: searchText } = event.currentTarget;
      const filtredClients = state.data.list.filter((clnt: Client) => {
        return (
          `${clnt?.name}`?.toLowerCase()?.includes(searchText.toLowerCase()) ||
          `${clnt?.phone_number}`
            ?.toLowerCase()
            ?.includes(searchText.toLowerCase()) ||
          `${clnt?.email}`?.toLowerCase()?.includes(searchText.toLowerCase())
        );
      });

      dispatch({
        type: 'SET_FIELDS',
        payload: {
          filtredList: filtredClients,
        },
      });
    },
    [state.data.list],
  );
  const onToggleModal = useCallback(() => {
    dispatch({
      type: 'SET_FIELDS',
      payload: {
        ui: {
          showModal: !state.data.ui.showModal,
        },
      },
    });
  }, [state.data.ui.showModal]);
  const onSubmitRemoval = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (state.data.selected === null) return;

    dispatch({
      type: 'SET_LOADING',
      payload: true,
    });
    window.electron.ipcRenderer.sendMessage(
      CHANNELS.DELETE_CLIENT,
      state.data.selected,
    );
  };
  // save client
  useEffect(() => {
    const saveClient = ({
      data: clientData,
      message,
      errors,
      isUpdate,
    }: any) => {
      const isSuccess = message !== undefined;
      const toastId = isUpdate
        ? `update-client-${clientData?.id}`
        : `save-client-${clientData?.id}`;
      const toastConfig = {
        description: isSuccess ? message : errors?.global,
        id: toastId,
        duration: 5000,
        dismissible: true,
        icon: isSuccess ? <SuccessCheckIcon /> : <DangerIcon />,
      };
      const toastTitle =
        isUpdate === true ? `Updating client` : `Saving client`;
      toast(toastTitle, toastConfig);
      dispatch({
        type: 'SET_LOADING',
        payload: false,
      });

      if (isUpdate === true) {
        // todo: update client
        const list = [...state.data.list];
        const updatedClientIndex = list.findIndex(
          (clnt: Client) => clnt.id === clientData.id,
        );

        if (updatedClientIndex >= 0) {
          list[updatedClientIndex] = clientData;
        }

        dispatch({
          type: 'SET_FIELDS',
          payload: {
            list,
            selected: clientData?.id || null,
          },
        });
      } else {
        dispatch({
          type: 'SET_FIELDS',
          payload: {
            list: [clientData, ...state.data.list],
            selected: clientData?.id || null,
          },
        });
      }
    };
    const deleteClient = ({ data, message, errors }: any) => {
      const isSuccess = message !== undefined;
      const toastConfig = {
        description: isSuccess ? message : errors?.global,
        id: `delete-client-toast-${data?.id}`,
        duration: 5000,
        dismissible: true,
        icon: isSuccess ? <SuccessCheckIcon /> : <DangerIcon />,
      };
      toast('Client removal!', toastConfig);
      dispatch({
        type: 'SET_LOADING',
        payload: false,
      });
      const newList = [...state.data.list].filter(
        (clnt: Client) => clnt.id !== data.id,
      );
      dispatch({
        type: 'SET_FIELDS',
        payload: {
          list: newList,
          selected: newList?.[0]?.id || null,
          ui: {
            showModal: false,
          },
        },
      });
    };
    window.electron.ipcRenderer.once(CHANNELS.SAVE_CLIENT, saveClient);
    window.electron.ipcRenderer.once(CHANNELS.DELETE_CLIENT, deleteClient);

    return () => {
      window.electron.ipcRenderer.off(CHANNELS.SAVE_CLIENT, saveClient);
      window.electron.ipcRenderer.off(CHANNELS.DELETE_CLIENT, deleteClient);
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
          onCheckedChange={onCheckedChange}
          onCreateNew={onCreateNew}
          onSearch={onSearch}
          renderItem={renderItem}
        />
        <div className="py-6 flex-1 border-l border-slate-300 border-opacity-50">
          <ClientForm
            data={selectedClientData}
            ref={clientFormRef}
            onSubmit={onSubmit}
            disabled={state.loading}
            className="px-3 flex flex-col gap-6"
            onDelete={onToggleModal}
          />
          <Modal
            show={state.data.ui.showModal}
            onClose={onToggleModal}
            onConfirm={onSubmitRemoval}
            header="Remove the selected client!"
            icon={<GoAlertFill className="h-32 w-32 text-red-500" />}
            description={
              <>
                All related data will be removed as well. Are you sure about
                this? {` `}
                <span className="text-red-500 text-base italic bg-red-100 p-0.5 rounded">
                  {`you can't undo this action`}
                </span>
                .
              </>
            }
          />
        </div>
      </div>
    </Layout>
  );
}
