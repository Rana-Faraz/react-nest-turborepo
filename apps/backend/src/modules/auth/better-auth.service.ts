import { Injectable } from "@nestjs/common";
import { InjectDataSource } from "@nestjs/typeorm";
import type { DataSource } from "typeorm";
import { createAuth } from "../../lib/auth.js";
import { BackgroundJobsService } from "../background-jobs/background-jobs.service.js";

@Injectable()
export class BetterAuthService {
  readonly auth;

  constructor(
    @InjectDataSource() dataSource: DataSource,
    backgroundJobsService: BackgroundJobsService,
  ) {
    this.auth = createAuth(dataSource, backgroundJobsService);
  }
}
