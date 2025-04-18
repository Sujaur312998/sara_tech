import { faker } from '@faker-js/faker';
import { User } from '../entity/user.entity';
import { setSeederFactory } from 'typeorm-extension';

export const UserFactory = setSeederFactory(User, () => {
  const user = new User();
  user.name = faker.person.fullName();
  user.deviceToken = faker.string.uuid();
  user.createdAt = faker.date.past();
  user.updatedAt = faker.date.recent();
  return user;
});
