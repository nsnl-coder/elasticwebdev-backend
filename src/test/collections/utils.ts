import { Collection } from '../../models/collectionModel';
import { ICollection } from '../../yup/collectionSchema';
const validCollectionData = {
  name: 'test collection name',
  photo: 'this-is-photo-link',
  isPinned: true,
  status: 'draft',
};

const createCollection = async (data?: Partial<ICollection>) => {
  const one = await Collection.create({
    test_string: 'testname',
    test_number: 10,
    test_any: 'draft',
    ...data,
  });

  return JSON.parse(JSON.stringify(one));
};

export { createCollection, validCollectionData };
