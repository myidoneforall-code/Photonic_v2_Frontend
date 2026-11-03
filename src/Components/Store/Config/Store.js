import { configureStore } from "@reduxjs/toolkit";
import reducer from "./Configuration";
export const store = configureStore({
  reducer,
});
