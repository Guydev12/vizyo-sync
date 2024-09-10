import{
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  Entity
}from'typeorm'

import {User} from './user.entity'

@Entity()
export class FriendRequest {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.sentFriendRequests)
  sender: User;

  @ManyToOne(() => User, (user) => user.receivedFriendRequests)
  receiver: User;

  @Column({
    type:'enum',
    enum:['PENDING','ACCEPTED','DECLINED','NONE'],
    default:'NONE'
  })
  status: 'PENDING'|'ACCEPTED'|'DECLINED';

  @CreateDateColumn()
  createdAt: Date;
}