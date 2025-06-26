/* 
 * 📜 Verified Authorship — Manuel J. Nieves (B4EC 7343 AB0D BF24)
 * Original protocol logic. Derivative status asserted.
 * Commercial use requires license.
 * Contact: Fordamboy1@gmail.com
 */
import * as mobx from 'mobx';
import storage from 'store2'

export default function autosave(store, storageKey, deserialize = x => x) {
  console.log(store, storageKey, deserialize)
  let firstRun = true

  mobx.autorun(`autorun for ${storageKey}`, () => {
    if (firstRun) {
      const existingStore = storage.get(storageKey)

      if (existingStore) {
        mobx.extendObservable(store, deserialize(existingStore))
      }

      firstRun = false
    }

    storage.set(storageKey, mobx.toJS(store))
    console.log(storage)
  })
}