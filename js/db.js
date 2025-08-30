const db = new Dexie('OrderDatabase');
db.version(2).stores({
  products: '++id, name, price',
  orders: '++id, customerInfo, address, deliveryDate, status'
});
db.open().catch(err => console.error(`Failed to open db: ${err.stack || err}`));