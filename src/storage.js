import React, { AsyncStorage } from 'react-native';

const storage = {
  support: function () {
    try {
      if (AsyncStorage && AsyncStorage.getItem && AsyncStorage.setItem) return true;
      return false;
    } catch (error) {
      return false;
    }
  },
  get: async function (key) {
    try {
      const value = await AsyncStorage.getItem(key);
      if (value !== null) {
        const jsonValue = JSON.parse(value);
        return jsonValue;
      }
      return null;
    } catch (error) {
      return null;
    }
  },
  save: async function (key, value) {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.log(error);
    }
  },
  update: function (key, value) {
    return StorageUtil.get(key).then(item => {
      value = typeof value === 'string' ? value : Object.assign({}, item, value);
      return AsyncStorage.setItem(key, JSON.stringify(value));
    });
  },
  delete: async key => {
    await AsyncStorage.removeItem(key);
  }
};

export default storage;
