import { Column, Entity, Index, PrimaryColumn } from "typeorm";

@Entity("user")
@Index("IDX_user_email", ["email"], { unique: true })
export class User {
  @PrimaryColumn("text")
  id!: string;

  @Column("text", { name: "name" })
  name!: string;

  @Column("text", { name: "email" })
  email!: string;

  @Column("boolean", { name: "emailVerified" })
  emailVerified!: boolean;

  @Column("text", { name: "image", nullable: true })
  image!: string | null;

  @Column("timestamptz", { name: "createdAt" })
  createdAt!: Date;

  @Column("timestamptz", { name: "updatedAt" })
  updatedAt!: Date;
}
