import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
} from "typeorm";
import { User } from "./User.js";

@Entity("account")
@Index("UQ_account_issuer_accountId", ["issuer", "accountId"], {
  unique: true,
})
@Index("IDX_account_userId", ["userId"])
export class Account {
  @PrimaryColumn("text")
  id!: string;

  @Column("text", { name: "issuer" })
  issuer!: string;

  @Column("text", { name: "accountId" })
  accountId!: string;

  @Column("text", { name: "providerId" })
  providerId!: string;

  @Column("text", { name: "userId" })
  userId!: string;

  @ManyToOne(() => User, { onDelete: "CASCADE" })
  @JoinColumn({
    name: "userId",
    referencedColumnName: "id",
    foreignKeyConstraintName: "FK_account_userId",
  })
  user!: User;

  @Column("text", { name: "accessToken", nullable: true })
  accessToken!: string | null;

  @Column("text", { name: "refreshToken", nullable: true })
  refreshToken!: string | null;

  @Column("text", { name: "idToken", nullable: true })
  idToken!: string | null;

  @Column("timestamptz", { name: "accessTokenExpiresAt", nullable: true })
  accessTokenExpiresAt!: Date | null;

  @Column("timestamptz", { name: "refreshTokenExpiresAt", nullable: true })
  refreshTokenExpiresAt!: Date | null;

  @Column("text", { name: "scope", nullable: true })
  scope!: string | null;

  @Column("text", { name: "password", nullable: true })
  password!: string | null;

  @Column("timestamptz", { name: "createdAt" })
  createdAt!: Date;

  @Column("timestamptz", { name: "updatedAt" })
  updatedAt!: Date;
}
