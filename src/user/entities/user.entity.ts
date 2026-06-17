import { BeforeInsert, BeforeUpdate, Column, Entity, JoinTable, ManyToMany, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Product } from '../../product/entities';
import { Role } from './role.entity';
import { ValidRoles } from '../enums/valid-roles';
import { Address } from 'src/address/entities/address.entity';
import { Order } from 'src/order/entities/order.entity';


@Entity('users')
export class User {
    
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('text', {
      unique: true
    })
    email: string;

    @Column('text', {
      select: false
    })
    password: string;

    @Column('text')
    name: string;

    @Column('text')
    lastname: string;

    @Column('bool', {
      default: true
    })
    isActive: boolean;

    @ManyToMany(() => Role, (role) => role.users, { eager: true })
    @JoinTable({
      name: 'user_roles',
      joinColumn:        { name: 'user_id',  referencedColumnName: 'id' },
      inverseJoinColumn: { name: 'role_id',  referencedColumnName: 'id' },
    })
    roles: Role[];

    @OneToMany(
      () => Product,
      ( product ) => product.user
    )
    product: Product;

    @OneToMany(
      () => Address,
      (addresses) => addresses.user)
    addresses: Address[];

    @OneToMany(() => Order, order => order.user)
    orders: Order[];


    @BeforeInsert()
    checkFieldsBeforeInsert() {
      this.email = this.email.toLowerCase().trim();
    }

    @BeforeUpdate()
    checkFieldsBeforeUpdate() {
      this.checkFieldsBeforeInsert();   
    }

    get roleNames(): ValidRoles[] {
      return this.roles?.map((r) => r.name) ?? [];
    }

}
