const { Menu } = require('../../models/menuModel');

const validMenuData = {
  name: 'test name',
  link: 'test link',
  photo: 'test photo',
  ordering: 5,
};

const createMenu = async (data) => {
  const menu = await Menu.create({
    test_string: 'testname',
    test_number: 10,
    test_any: 'draft',
    ...data,
  });

  return JSON.parse(JSON.stringify(menu));
};

module.exports = { createMenu, validMenuData };
