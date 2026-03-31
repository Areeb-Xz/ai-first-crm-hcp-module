import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../api/axiosInstance';

export const sendChatMessage = createAsyncThunk(
  'chat/send',
  async (message) => {
    const res = await api.post('/api/chat', { message });
    return res.data.messages;
  }
);

const chatSlice = createSlice({
  name: 'chat',
  initialState: { messages: [], status: 'idle', error: null },
  reducers: {
    addUserMessage: (state, action) => {
      state.messages.push({ role: 'user', content: action.payload });
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(sendChatMessage.pending, (state) => { state.status = 'loading'; })
      .addCase(sendChatMessage.fulfilled, (state, action) => {
        state.status = 'idle';
        action.payload.forEach((msg, i) => {
          if (i > 0) state.messages.push({ role: 'assistant', content: msg });
        });
      })
      .addCase(sendChatMessage.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      });
  },
});

export const { addUserMessage } = chatSlice.actions;
export default chatSlice.reducer;