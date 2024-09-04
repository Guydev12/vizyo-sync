import { Entity, PrimaryGeneratedColumn, Column, OneToOne, ManyToMany, JoinTable, BeforeInsert,ManyToOne } from 'typeorm';
import { User } from '../../user/entities/user.entity';

@Entity({ name: 'rooms' })
export class Room {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  name: string;

  @Column()
  maxParticipants: number;

@ManyToOne(() => User, user => user.rooms, { eager: true })
  user: User;

  @ManyToMany(() => User, user => user.participatingRooms)
  @JoinTable()
  participants: User[];
 // Remove the array initialization here

/*  @BeforeInsert()
  async addOwner() {
    if (this.user) {
      // Ensure participants is initialized
      if (!this.participants) {
        this.participants = [];
      }

      // Add the owner to participants
      if (!this.participants.includes(this.user)) {
        this.participants.push(this.user);
      }

      this.user.role = "Owner";
    }

    // Update maxParticipant to reflect the number of participants
    this.maxParticipant = this.participants.length + 1;
  }*/
}