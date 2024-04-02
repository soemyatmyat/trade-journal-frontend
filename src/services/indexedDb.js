// IndexDB:: Non-blocking //

// const indexedDbName = 'trades-journal'
// const indexedTbName = 'tickers'
// const indexedTbKey = 'ticker'

export const accessIndexedDB = (indexedDbName, objectStores) => {

  const openIndexedDB = () =>  {
    return new Promise((resolve, reject) => {
      let request = indexedDB.open(indexedDbName, 1);
      request.onupgradeneeded = (event) => {
        // The database did not previously exist, so create object stores and indexes.
        let db = event.target.result;
        for (const objectStore of objectStores) {
          db.createObjectStore(objectStore[0], { keyPath: objectStore[1]});                
        }
      };
      request.onsuccess = (event) => {
        resolve(event.target.result);
      };
      request.onerror = (event) => {
        reject('Database error: ' + event.target.errorCode);
      };
    });
  }

  const storeData = async (payload, objectStoreName) => {
    let db;
    try {
      db = await openIndexedDB();
      let transaction = db.transaction([objectStoreName], 'readwrite');
      let objectStore = transaction.objectStore(objectStoreName);

      let request = objectStore.add(payload);
      request.onsuccess = (event) => {
        console.log('Data addded successfully to IndexedDb.');
      }
      request.onerror = (event) => {
        console.log('Error adding data: ' + event.target.error)
      }

    } catch (error) {
      console.error("Error in storing data in indexedDb: ", error);
    } finally {
      if (db) db.close();
    }
  }

  const getDataIndexedDb = async (id, objectStoreName) => {
    let db;
    try {
      db = await openIndexedDB();
      const transaction = db.transaction([objectStoreName], 'readonly');
      const objectStore = transaction.objectStore(objectStoreName);
      const request = objectStore.get(id);

      return new Promise((resolve, reject) => {
        request.onsuccess = (event) => {
          const data = event.target.result;
          resolve(data);
        };

        request.onerror = (event) => {
          reject('Error retrieving data: ' + event.target.error);
        }

      })

    } catch (error) {
      console.error("Error in retrieving data from IndexedDb: ", error);
      throw error;
    } finally {
      if (db) db.close();
    }
  }

  const retrieveData = async () => {
    let db;
    try {
      db = await openIndexedDB();
      let transaction = db.transaction([indexedTbName], 'readonly');
      let objectStore = transaction.objectStore(indexedTbName);
      let request = objectStore.getAll();
      
      request.onsuccess = (event) => {
        resolve(event.target.result);
      };

      request.onerror = (event) => {
        console.log('Error getting data: ' + event.target.errorCode);
        reject('Error retrieving data: ' + event.target.error);
      }
      
    } catch (error) {
      console.error(error);
      throw error;
    } finally {
      if (db) db.close();
    }
  }

  return {
    storeData,
    getDataIndexedDb
  };

}
