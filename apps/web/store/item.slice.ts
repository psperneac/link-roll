import axios from 'axios';
import { ItemDto } from '@link-roll/models';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { alertActions, AppState } from '.';
import { toast } from 'react-toastify';
import { object, string, TypeOf } from 'zod';

export const itemSchema = object({
  name: string().min(1, 'Name is required').max(4096),
  description: string().min(1, 'Description is required').max(4096),
  url: string().min(1, 'URL is required').max(4096),
  tags: string().min(1, 'Tags are required').max(4096),
});

export type ItemInput = TypeOf<typeof itemSchema>;

export interface ItemState {
  items: ItemDto[];
  loading: boolean;
  error: any;
}

const initialState: ItemState = {
  items: [],
  loading: undefined,
  error: undefined,
};

const baseUrl = `${process.env.APP_API_URL}/items`;

export const itemApi = {
  getItems: () => {
    return axios.get(`${baseUrl}`);
  },
  getItem: (id: string) => {
    return axios.get(`${baseUrl}/${id}`);
  },
  addItem: (body) => {
    return axios.post(`${baseUrl}`, body);
  },
  updateItem: (body) => {
    return axios.put(`${baseUrl}/${body.id}`, body);
  },
  deleteItem: (id: string) => {
    return axios.delete(`${baseUrl}/${id}`);
  },
};

const name = 'items';
const slice = createSlice({
  initialState,
  name,
  reducers: {
    itemsGet(state) {
      state.loading = true;
      state.error = undefined;
    },
    itemsGetSuccess(state, { payload }: { payload: ItemDto[] }) {
      state.items = payload;
      state.loading = false;
    },
    itemsGetFailure(state, { payload }: { payload: any }) {
      state.error = payload;
      state.loading = false;
    },
    itemGet(state) {
      state.loading = true;
      state.error = undefined;
    },
    itemGetSuccess(state, { payload }: { payload: ItemDto }) {
      state.items.push(payload);
      state.loading = false;
    },
    itemGetFailure(state, { payload }: { payload: any }) {
      state.error = payload;
      state.loading = false;
    },
    itemAdd(state) {
      state.loading = true;
      state.error = undefined;
    },
    itemAddSuccess(state, { payload }: { payload: ItemDto }) {
      state.items.push(payload);
      state.loading = false;
    },
    itemAddFailure(state, { payload }: { payload: any }) {
      state.error = payload;
      state.loading = false;
    },
    itemUpdate(state) {
      state.loading = true;
      state.error = undefined;
    },
    itemUpdateSuccess(state, { payload }: { payload: ItemDto }) {
      const index = state.items.findIndex((item) => item.id === payload.id);
      state.items[index] = payload;
      state.loading = false;
    },
    itemUpdateFailure(state, { payload }: { payload: any }) {
      state.error = payload;
      state.loading = false;
    },
    itemDelete(state) {
      state.loading = true;
      state.error = undefined;
    },
    itemDeleteSuccess(state, { payload }: { payload: string }) {
      state.items = state.items.filter((item) => item.id !== payload);
      state.loading = false;
    },
    itemDeleteFailure(state, { payload }: { payload: any }) {
      state.error = payload;
      state.loading = false;
    },
  },
});

const { actions, reducer } = slice;

function handleError(dispatch, error) {
  dispatch(alertActions.error(error));

  if (Array.isArray((error as any).response.data.error)) {
    (error as []).forEach((el: any) =>
      toast.error(el.message, { position: 'top-right' })
    );
  } else {
    toast.error(error, {
      position: 'top-right'
    });
    throw error;
  }
}

export const loadItems = createAsyncThunk(
  'items/getItems',
  async(_, { dispatch, getState }) => {
    dispatch(actions.itemsGet());

    itemApi.getItems()
      .then((response) => {
        dispatch(actions.itemsGetSuccess(response.data));
      })
      .catch((error) => {
        handleError(dispatch, error);
        dispatch(actions.itemsGetFailure(error));
      });
  }
);

export const loadItem = createAsyncThunk(
  'items/getItem',
  async(id: string, { dispatch, getState }) => {
    dispatch(actions.itemGet());

    itemApi.getItem(id)
      .then((response) => {
        dispatch(actions.itemGetSuccess(response.data));
      })
      .catch((error) => {
        handleError(dispatch, error);
        dispatch(actions.itemGetFailure(error));
      });
  }
);

export const addItem = createAsyncThunk(
  'items/addItem',
  async(body: ItemDto, { dispatch, getState }) => {
    dispatch(actions.itemAdd());

    itemApi.addItem(body)
      .then((response) => {
        dispatch(actions.itemAddSuccess(response.data));
      })
      .catch((error) => {
        handleError(dispatch, error);
        dispatch(actions.itemAddFailure(error));
      });
  }
);

export const updateItem = createAsyncThunk(
  'items/updateItem',
  async(body: ItemDto, { dispatch, getState }) => {
    dispatch(actions.itemUpdate());

    itemApi.updateItem(body)
      .then((response) => {
        dispatch(actions.itemUpdateSuccess(response.data));
      })
      .catch((error) => {
        handleError(dispatch, error);
        dispatch(actions.itemUpdateFailure(error));
      });
  }
);

export const deleteItem = createAsyncThunk(
  'items/deleteItem',
  async(id: string, { dispatch, getState }) => {
    dispatch(actions.itemDelete());

    itemApi.deleteItem(id)
      .then(() => {
        dispatch(actions.itemDeleteSuccess(id));
      })
      .catch((error) => {
        handleError(dispatch, error);
        dispatch(actions.itemDeleteFailure(error));
      });
  }
);

export const itemActions = { ...actions, loadItems, loadItem, addItem, updateItem, deleteItem };
export const itemsReducer = reducer;

export const getItemsState = (state: AppState) => state.items;
export const getItems = (state: AppState) => getItemsState(state)?.items;
export const getItemsLoading = (state: AppState) => getItemsState(state)?.loading;
export const getItemsError = (state: AppState) => getItemsState(state)?.error;
export const getItem = (state: AppState, id: string) => getItems(state)?.find((item) => item.id === id);
