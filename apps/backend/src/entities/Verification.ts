import { Column, Entity, Index, PrimaryColumn } from "typeorm";

@Entity("verification")
@Index("IDX_verification_identifier", ["identifier"])
export class Verification {
  @PrimaryColumn("text")
  id!: string;

  @Column("text", { name: "identifier" })
  identifier!: string;

  @Column("text", { name: "value" })
  value!: string;

  @Column("timestamptz", { name: "expiresAt" })
  expiresAt!: Date;

  @Column("timestamptz", { name: "createdAt" })
  createdAt!: Date;

  @Column("timestamptz", { name: "updatedAt" })
  updatedAt!: Date;
}
