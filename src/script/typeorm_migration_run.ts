import { dataSourceOptions } from "@/config/.";
import { DataSource } from "typeorm";
import { PostgresConnectionOptions } from "typeorm/driver/postgres/PostgresConnectionOptions";

const migrateRun = () => {
  console.log(`Creating Tables, Please wait a moment.....`);
  const ds = new DataSource({
    ...dataSourceOptions,
  } as PostgresConnectionOptions);
  ds.initialize()
    .then(() => {
      ds.runMigrations()
        .then(() => {
          console.log("All tables created...");
        })
        .catch((err) => console.error(err));
    })
    .catch((err) => console.error(err));
};

migrateRun();
