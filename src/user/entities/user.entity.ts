import { Cv } from '../../cv/entities/cv.entity';
import { Entity, PrimaryGeneratedColumn, Column, OneToMany, BeforeInsert } from 'typeorm';
import * as bcrypt from 'bcrypt';

  export enum UserRole {
    ADMIN = 'admin',
    USER = 'user',
  }

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true,nullable:true })
  username: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;
  
  @Column()
  salt: string;
  
  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER, 
  })
  role: UserRole;


  @OneToMany(() => Cv, (cv) => cv.user)
  cvs: Cv[];

  @BeforeInsert()
  async hashPassword() {
    const saltRounds = 10; 
    this.salt = await bcrypt.genSalt(saltRounds);
    this.password = await bcrypt.hash(this.password, this.salt);
  }
}
