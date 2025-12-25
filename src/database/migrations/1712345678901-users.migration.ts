import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class CreateUsers1712345678901 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Enable UUID extension first
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

    await queryRunner.createTable(
      new Table({
        name: "users",
        columns: [
          {
            name: "id",
            type: "uuid",
            isPrimary: true,
            generationStrategy: "uuid",
            default: 'uuid_generate_v4()',
          },
          {
            name: "first_name", 
            type: "varchar",
            isNullable: false,
          },
          {
            name: "last_name",
            type: "varchar",
            isNullable: false,
          },
          {
            name: "email",
            type: "varchar",
            isNullable: false,
            isUnique: true,
          },
          {
            name: "username",
            type: "varchar",
            isNullable: false,
          },
          {
            name: "phone",
            type: "varchar",
            isNullable: false,
          },
          {
            name: "password",
            type: "varchar",
            isNullable: false,
          },
          {
            name: "picture",
            type: "varchar",
            isNullable: true,
          },
          {
            name: "team_name", 
            type: "varchar",
            isNullable: true,
          },
          {
            name: "organization_name", 
            type: "varchar",
            isNullable: true,
          },
          {
            name: "role",
            type: "varchar",
            isNullable: false,
            default: "'personal'", 
          },
          {
            name: "created_at",
            type: "timestamp",
            isNullable: true,
            default: "CURRENT_TIMESTAMP(6)",
          },
          {
            name: "updated_at",
            type: "timestamp",
            isNullable: true,
            default: "CURRENT_TIMESTAMP(6)",
          },
        ],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable("users", true);
    await queryRunner.query(`DROP EXTENSION IF EXISTS "uuid-ossp"`);
  }
}
