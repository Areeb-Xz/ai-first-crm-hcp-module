import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../api/axiosInstance';

export const fetchInteractions = createAsyncThunk(
  'interactions/fetchAll',
  async () => {
    const res = await api.get('/api/interactions');
    return res.data;
  }
);

export const createInteraction = createAsyncThunk(
  'interactions/create',
  async (data) => {
    const res = await api.post('/api/interactions', data);
    return res.data;
  }
);

const interactionsSlice = createSlice({
  name: 'interactions',
  initialState: { items: [], status: 'idle', error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchInteractions.pending, (state) => { state.status = 'loading'; })
      .addCase(fetchInteractions.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchInteractions.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      .addCase(createInteraction.fulfilled, (state, action) => {
        state.items.push(action.payload);
      });
  },
});

export default interactionsSlice.reducer;