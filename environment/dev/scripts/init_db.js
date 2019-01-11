
try {

  function initCollection() {

    db = db.getSiblingDB("explorer");
    collection = db['collection'];

    let res = [
      collection.drop(),
      collection.createIndex({ 'name': 1 }),
    ];

    printjson(res);
  }

  initCollection();

} catch (error) {

  print('Error, exiting', error);
  quit(1);

}

quit(0);