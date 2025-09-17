import { Module } from '@nestjs/common';
import { AppController } from './app.controlador';
import { AppService } from './app.servicio';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
