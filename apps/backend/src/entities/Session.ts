import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
} from "typeorm";
import { User } from "./User.js";

@Entity("session")
@Index("IDX_session_userId", ["userId"])
@Index("IDX_session_token", ["token"], { unique: true })
export class Session {
  @PrimaryColumn("text")
  id!: string;

  @Column("timestamptz", { name: "expiresAt" })
  expiresAt!: Date;

  @Column("text", { name: "token" })
  token!: string;

  @Column("timestamptz", { name: "createdAt" })
  createdAt!: Date;

  @Column("timestamptz", { name: "updatedAt" })
  updatedAt!: Date;

  @Column("text", { name: "ipAddress", nullable: true })
  ipAddress!: string | null;

  @Column("text", { name: "userAgent", nullable: true })
  userAgent!: string | null;

  @Column("text", { name: "userId" })
  userId!: string;

  @ManyToOne(() => User, { onDelete: "CASCADE" })
  @JoinColumn({
    name: "userId",
    referencedColumnName: "id",
    foreignKeyConstraintName: "FK_session_userId",
  })
  user!: User;
}
