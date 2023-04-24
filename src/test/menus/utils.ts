import { Menu } from '../../models/menuModel';
import { IMenu } from '../../yup/menuSchema';

const validMenuData: Partial<IMenu> = {
  name: 'test name',
  link: 'test link',
  photo: 'test photo',
  menuType: 'root',
  position: 'header',
  ordering: 5,
  childMenus: [],
};

const createMenu = async (data?: Partial<IMenu>): Promise<IMenu> => {
  const menu = await Menu.create({
    test_string: 'testname',
    test_number: 10,
    test_any: 'draft',
    ...data,
  });

  return JSON.parse(JSON.stringify(menu));
};

export { createMenu, validMenuData };
