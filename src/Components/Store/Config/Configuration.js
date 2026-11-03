import { createSlice } from "@reduxjs/toolkit";
import { initialData, Reduxaction } from "../Reducer/Reducer";

const { actions, reducer } = createSlice({
  name: "ReactRedux",
  initialState: initialData,
  reducers: Reduxaction,
});
export const {
  UpdateControllerId,
  Updatelightcontrollerlist,
  UpdateAddgroupname,
  Updatemotorscheduleedit,
  Updatevalvescheduleedit,
  UpdateDeletecontrollerview,
  Updateuserlist,
  Updategroupmap,
  Updatecontrollermap,
  Updategroupuser,
  Updategroupcontroller,
  Updatefilterdata,
  Updatedeletefilter,
  Updategroupnames,
  Updatewebtest,
  UpdateCCMail,
  UpdatePageState,
  UpdateDeviceFilter,
  UpdatemotorViewDatas,
  UpdatelightViewDatas,
  UpdateAMCfilters,
  UpdateGroupFilters,
  UpdateUserFilters,
  UpdatedeletepageState,
  UpdateLoginUserData,
} = actions;
export default reducer;
