import { deepCopy } from '@source/composer/utils';
import createHash from 'object-hash';

interface IStorageProperty {
  name: string;
  hash: string;
  updates: number;
  data: any; // tslint:disable-line:no-any
}

interface IStorage {
  [property: string]: IStorageProperty;
}

type Listener = (property?: string) => void;

interface IListener {
  id: string;
  listener: Listener;
  pattern: string;
}

/**
 * Context class. This is something like data stream used in Composer to
 * handle context data and plugin data, etc.
 */
class Context {

  private lastListenerId: number;

  private listeners: IListener[];

  private properties: string[];

  private storage: IStorage;

  constructor() {
    this.lastListenerId = 0;
    this.listeners = [] as IListener[];
    this.properties = [] as string[];
    this.storage = {} as IStorage;
  }

  /**
   * Add listener for some pattern (matching property)
   *
   * @param  {string} pattern which will match property
   * @param  {Listener} listener function
   * @return {string} id of created listener
   */
  public addListener(pattern: string, listener: Listener): string {
    const listenerObject = {
      id: `#${this.lastListenerId}`,
      listener,
      pattern,
    } as IListener;
    this.listeners.push(listenerObject);
    this.lastListenerId++;

    return listenerObject.id;
  }

  /**
   * Remove listener
   *
   * @param  {string} id of listener, given from addListener method
   * @return {boolean} returns true if listeren was removed, otherwise false
   */
  public removeListener(id: string): boolean {
    let found = false;
    const listeners = this.listeners.filter((item: IListener) => {
      if (item.id === id) {
        found = true;
        return false;
      }

      return true;
    });
    this.listeners = listeners;

    return found;
  }

  /**
   * Just returns hash of given property or null, if property doesn't exists
   *
   * @param {string} property name
   * @return {string | null}
   */
  public getHashOfProperty(property: string): string | null {
    if (!this.isPropertyExists(property)) {
      return null;
    }

    return this.storage[property].hash;
  }

  /**
   * Simple read data from given property. If property doesn't exists, returns
   * undefined.
   *
   * @param  {string} property name
   * @return {any} returns undefined if doesn't exists
   */
  public readProperty(property: string): any | undefined { // tslint:disable-line:no-any
    if (!this.isPropertyExists(property)) {
      return undefined;
    }

    return this.storage[property].data;
  }

  /**
   * Simply write property into storage. This property can be anything
   * (string, number, object, array)
   *
   * @param {string} property name
   * @param {any} data which you want to store
   * @return {void}
   */
  public writeProperty(property: string, data: any): void { // tslint:disable-line:no-any
    const hash = createHash(data);
    let storageProperty: IStorageProperty;
    if (!this.isPropertyExists(property)) {
      storageProperty = {
        data,
        hash,
        name: property,
        updates: 0,
      } as IStorageProperty;

      this.properties.push(property);
    } else {
      storageProperty = this.storage[property];
      storageProperty.hash = hash;
      storageProperty.updates++;

      if (typeof data === 'object') {
        storageProperty.data = deepCopy(data);
      } else if (Array.isArray(data)) {
        storageProperty.data = [ ...data ];
      } else {
        storageProperty.data = data;
      }
    }

    this.fireListeners(property);
    this.storage[property] = storageProperty;
  }

  /**
   * Check if given propery exists in context.
   *
   * @param {string} property name
   * @return {boolean} true if exists
   */
  public isPropertyExists(property: string): boolean {
    const index = this.properties.indexOf(property);
    return index >= 0;
  }

  /**
   * Simply check if pattern match property
   *
   * @param  {string} pattern
   * @param  {string} property
   * @return {boolean} returns true if match
   */
  private isPatternMatch(pattern: string, property: string): boolean {
    const regex = new RegExp(`^${pattern.replace('.', '\.').replace('*', '.*')}$`, 'gi');
    const result = regex.test(property);

    return result;
  }

  /**
   * Fire all listeners which patterns match given property
   *
   * @param {string} property [description]
   */
  private fireListeners(property: string): void {
    this.listeners.forEach((listener: IListener) => {
      if (this.isPatternMatch(listener.pattern, property)) {
        listener.listener(property);
      }
    });
  }

}

export {
  Context,
};
