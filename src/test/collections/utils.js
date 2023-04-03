const { Collection } = require('../../models/collectionModel');

const validCollectionData = {
  name: 'test collection name',
  photo: 'this-is-photo-link',
  isPinned: true,
};

const createCollection = async (data) => {
  const one = await Collection.create({
    test_string: 'testname',
    test_number: 10,
    test_any: 'draft',
    ...data,
  });

  return JSON.parse(JSON.stringify(one));
};

module.exports = { createCollection, validCollectionData };
