const { Collection } = require('../../models/collectionModel');

// TODO:
// 1. Handle all auth check in all route
// 2. Handle required fields in create route
// 2.1 Handle successful case in create route
// 3. Handle data validation in updateCollection, updateManyCollections, createCollection (can copy code)
// 4. Handle objectid does not exist in req.body (if has)
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
