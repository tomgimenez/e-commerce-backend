import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';
import { ValidRoles } from '../enums/valid-roles';
import { User } from './user.entity';

@Entity('roles')
export class Role {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: ValidRoles, unique: true })
  name: ValidRoles;

  @Column({ type: 'text', nullable: true })
  description: string;

  @ManyToMany(() => User, (user) => user.roles)
  users: User[];
}