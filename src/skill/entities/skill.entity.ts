import { Cv } from '../../cv/entities/cv.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToMany } from 'typeorm';

@Entity()
export class Skill {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100, nullable: true })
  Designation: string;

  @ManyToMany(() => Cv, (cv) => cv.skills)
  cvs: Cv[];
}
