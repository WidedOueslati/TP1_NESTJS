import { User } from '../../user/entities/user.entity';
import { Skill } from '../../skill/entities/skill.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, ManyToMany, JoinTable, JoinColumn } from 'typeorm';
import { Timestamp } from "../../common/database/timestamp.entity";

@Entity()
export class Cv extends Timestamp {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  name: string;

  @Column({ length: 100,nullable:true })
  firstname: string;

  @Column({ nullable: true, })
  age: number;

  @Column({ length: 20, nullable: true })
  Cin: string;

  @Column({ length: 100, nullable: true })
  Job: string;

  @Column({ length: 255, nullable: true })
  path: string;

  @ManyToOne(() => User, (user) => user.cvs, {
    eager: true,
  })
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToMany(() => Skill, (skill) => skill.cvs)
  @JoinTable()
  skills: Skill[];
 
}
