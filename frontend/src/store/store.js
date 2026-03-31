import { configureStore } from '@reduxjs/toolkit';
import interactionsReducer from './interactionsSlice';
import chatReducer from './chatSlice';

const store = configureStore({
  reducer: {
    interactions: interactionsReducer,
    chat: chatReducer,
  },
});

export default store;