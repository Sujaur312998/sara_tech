import { DataSource } from 'typeorm';
import { Seeder, SeederFactoryManager } from 'typeorm-extension';
import { User } from '../entity/user.entity';

export class MainSeeder implements Seeder {
  public async run(
    dataSorce: DataSource,
    factoryManager: SeederFactoryManager,
  ): Promise<void> {
    const userFactory = factoryManager.get(User);
    console.log('Seeding users...');
    await dataSorce.getRepository(User).save(await userFactory.saveMany(40000));
  }
}
