const { Collection } = require('../../models/collectionModel');

// TODO:
// 3. Handle data validation in updateCollection, updateManyCollections, createCollection (can copy code)
// 5. Handle side effect when delete collection, or delete many collections

const createCollection = async (data) => {
  const collection = await Collection.create({
    test_string: 'testname',
    test_number: 10,
    test_any: 'draft',
    ...data,
  });

  return JSON.parse(JSON.stringify(collection));
};

module.exports = { createCollection };
