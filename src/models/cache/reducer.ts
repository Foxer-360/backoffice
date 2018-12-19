import * as types from './types';
import { indexOf } from 'lodash';

const initState = {};

/**
 * Interface for general data object. Each data object has its own data,
 * but also there is *name* of this data object, *update* is last date&time
 * of update and *valid* is a flag if data are valid.
 */
interface GeneralData {
  name: string;
  update: Date;
  valid: boolean;

  // tslint:disable-next-line:no-any
  data: Array<LooseObject> | LooseObject;
}

const reducer = (state = initState, action: ReduxAction) => {
  const { payload } = action;

  switch (action.type) {
    case types.SAVE_DATA:
      return {
        ...state,
        [payload.name]: {
          name: payload.name,
          update: new Date(),
          valid: true,

          data: payload.data,
        },
      };
    case types.APPEND_DATA_WITH_ID: {
      const ids = state[payload.name].data.map((item: LooseObject) => item.id);
      let data = state[payload.name].data;
      payload.data.forEach((item: LooseObject) => {
        if (indexOf(ids, item.id) > -1) {
          data[indexOf(ids, item.id)] = item;
        } else {
          data.push(item);
        }
      }, this);

      const dataObj = {
        ...state[payload.name],
        update: new Date(),
        valid: true,
        data: [...data],
      };

      return {
        ...state,
        [payload.name]: dataObj,
      };
    }
    case types.ADD_ITEM:
      let dataObject: GeneralData;
      if (state[payload.name]) {
        dataObject = {
          ...state[payload.name],
          update: new Date(),
          data: [...state[payload.name].data, payload.item],
        };
      } else {
        // If data object doesnt exist, create new
        dataObject = {
          name: payload.name,
          update: new Date(),
          valid: true,
          data: [payload.item],
        };
      }

      return {
        ...state,
        [payload.name]: dataObject,
      };
    case types.EDIT_ITEM:
      // No data, create empty data object and mark as invalid
      if (!state[payload.name]) {
        dataObject = {
          name: payload.name,
          update: new Date(),
          valid: false,
          data: [],
        };

        return {
          ...state,
          [payload.name]: dataObject,
        };
      }

      {
        // tslint:disable-next-line:no-any
        const mapFce = (item: any) => {
          if (item.id === payload.id) {
            return {
              ...item,
              ...payload.item,
            };
          }

          return item;
        };

        dataObject = {
          ...state[payload.name],
          data: state[payload.name].data.map(mapFce),
        };
      }

      return {
        ...state,
        [payload.name]: dataObject,
      };
    case types.REMOVE_ITEM:
      // Nothing to remove
      if (!state[payload.name]) {
        return state;
      }

      {
        // tslint:disable-next-line:no-any
        const filterFce = (item: any) => {
          if (item.id === payload.id) {
            return false;
          }

          return true;
        };

        dataObject = {
          ...state[payload.name],
          data: state[payload.name].data.filter(filterFce),
        };
      }

      return {
        ...state,
        [payload.name]: dataObject,
      };
    default:
      return state;
  }
};

export default reducer;
