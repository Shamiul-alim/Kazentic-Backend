import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id?: string;

  @Column({ name: 'first_name' })
  firstName: string="";

  @Column({ name: 'last_name' })
  lastName: string="";

  @Column()
  username: string="";

  @Column()
  phone: string="";

  @Column({ unique: true })
  email: string="";

  @Column()
  password: string="";

  @Column({ nullable: true })
  picture?: string;

  @Column({ name: 'team_name', nullable: true })
  teamName?: string;

  @Column({ name: 'organization_name', nullable: true })
  organizationName?: string;

  @Column({ default: 'personal' })
  role: string="";

  @CreateDateColumn({ name: 'created_at' })
  createdAt?: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt?: Date;
}
