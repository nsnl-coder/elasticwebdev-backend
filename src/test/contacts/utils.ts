import { Contact } from '../../models/contactModel';
import { IContact } from '../../yup/contactSchema';
const validContactData = {
  email: 'test@test.com',
  fullname: 'test name',
  phone: '012345678',
  subject: 'test subject',
  content: 'test content',
};

const createContact = async (data?: Partial<IContact>) => {
  const contact = await Contact.create({
    test_string: 'testname',
    test_number: 10,
    test_any: 'draft',
    ...data,
  });

  return JSON.parse(JSON.stringify(contact));
};

export { createContact, validContactData };
