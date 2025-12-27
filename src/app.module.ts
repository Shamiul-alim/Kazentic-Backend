import { AuthModule } from "@/modules/auth/auth.module";
import { UsersModule } from "@/modules/user/user.module";
import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { PostgresDatabaseProviderModule } from "@/providers/database/postgres/provider.module";
import global_config from "@/config/global_config";
import { EmailModule } from "./modules/email/email.module";

@Module({
  imports: [
    UsersModule,
    AuthModule,
    EmailModule,
    PostgresDatabaseProviderModule,
    ConfigModule.forRoot({
      isGlobal: true,
      load: [global_config],
    }),
  ],
  controllers: [],
  providers: [],
})
export class AppModule { }
