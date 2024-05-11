import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    ManyToOne,
    DeleteDateColumn,
    CreateDateColumn,
    JoinColumn
  } from 'typeorm';
  import { Cv } from './cv.entity';
  import { User } from 'src/user/entities/user.entity';
  
  @Entity()
  export class CvHistory {
    @PrimaryGeneratedColumn()
    id: number;
  
    @Column()
    type: string;
  
    @Column()
    userId: number;
  
    @Column()
    cvId: number;
  
    @ManyToOne(() => Cv, (cv) => cv.cvHistories,, {
        eager: true,
      })
    @JoinColumn({ name: 'cvId' }) // Define the foreign key column name
    cv: Cv;
  
    @ManyToOne(() => User, (user) => user.cvHistories)
    user: User;
  
    @CreateDateColumn()
    operationDate: Date;
  }