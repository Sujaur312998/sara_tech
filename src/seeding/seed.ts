import { runSeeders, SeederOptions } from 'typeorm-extension';
import { MainSeeder } from './main.seeder';
import { UserFactory } from './user.factory';
import { DataSource, DataSourceOptions } from 'typeorm';
import { User } from '../entity/user.entity';

const options: DataSourceOptions & SeederOptions = {
  type: 'postgres',
  host: process.env.DB_HOST || 'nestjs_db',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || 'sara',
  password: process.env.DB_PASSWORD || 'sara',
  database: process.env.DB_NAME || 'sara',
  entities: [User],
  synchronize: true,
  factories: [UserFactory],
  seeds: [MainSeeder],
};

const datasource = new DataSource(options);

datasource
  .initialize()
  .then(async () => {
    await datasource.synchronize(true);
    await runSeeders(datasource);
  })
  .catch((error) => {
    console.error('❌ Seeding failed:', error);
  })
  .finally(() => process.exit());
