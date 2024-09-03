import{
  PrimaryGeneratedColumn,
  Column,
  Entity,
  Unique,
  BeforeInsert,
  BeforeUpdate
}from'typeorm'
import{Exclude} from 'class-transformer'
import * as bcrypt from 'bcryptjs'

@Entity({name:"users"})
@Unique(["username"])
@Unique(["email"])
export class User {
  @PrimaryGeneratedColumn("uuid")
  id:string
  
  @Column()
  username:string
  
  @Column()
  email:string
  @Column({default:false})
  isVerified:boolean
  
  @Column({nullable:true})
 @Exclude()
  resetPasswordCode?:string
  
  @Column({nullable:true})
  @Exclude()
  resetPasswordExpires?:Date
  
  @Column()
  @Exclude()
  password:string
  
  @Column({
    type: 'date',
    default: () => 'CURRENT_DATE'
  })
  createdAt: Date;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;
  
  @Column({nullable:true})
  fullname?:string
  
  @Column({nullable:true})
  avatarUrl?:string
  
  @Column({nullable:true})
  bio?:string
  


  //hash the password Before save in the database
 @BeforeInsert()
 async hashPasswordBeforeInsert() {
    if (this.password) {
      this.password = await bcrypt.hash(this.password, 10);
    }
  }
  
  @BeforeUpdate()
  updateTimestamp() {
  this.updatedAt = new Date();
}
  
}
