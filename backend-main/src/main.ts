import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { RequestMethod, ValidationPipe } from "@nestjs/common";
import * as cookieParser from "cookie-parser";
import { WinstonModule } from "nest-winston";
import { winstonConfig } from "./logger/winston-logger";
import { AllExceptionsFilter } from "./logger/error.handling";
import { join } from "path";
import * as bodyParser from "body-parser";
import { NestExpressApplication } from "@nestjs/platform-express";
import * as graphqlUploadExpress from "graphql-upload/graphqlUploadExpress.js";
import * as express from "express";
import * as dotenv from "dotenv";
dotenv.config();

async function start() {
  try {
    const PORT = process.env.PORT || 3030;

    const app = await NestFactory.create<NestExpressApplication>(AppModule, {
      logger: WinstonModule.createLogger(winstonConfig),
    });

    app.use(cookieParser());
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        transformOptions: { enableImplicitConversion: true },
        whitelist: true,
        forbidNonWhitelisted: true,
      })
    );
    // app.useGlobalFilters(new AllExceptionsFilter());

    app.enableCors({
      origin: [
        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:3002",
        "https://inbola.uz",
        "https://www.inbola.uz"
      ],
      allowedHeaders: [
        "Accept",
        "Authorization",
        "Content-Type",
        "X-Requested-With",
        "apollo-require-preflight",
      ],
      methods: "GET, HEAD, PUT, PATCH, POST, DELETE, OPTIONS",
      credentials: true,
    });

    app.setGlobalPrefix('api', {
      exclude: [
        { path: 'graphql', method: RequestMethod.ALL },
        { path: 'graphql/*', method: RequestMethod.ALL },
      ],
    });

    app.use(
      "/graphql",
      graphqlUploadExpress({ maxFileSize: 50_000_000, maxFiles: 1 })
    );

    // Static file serving for uploads with CORS headers
    app.use('/uploads', (req, res, next) => {
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Methods', 'GET');
      res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
      next();
    }, express.static(join(__dirname, '..', 'uploads')));

    const config = new DocumentBuilder()
      .setTitle("INBOLA Marketplace API")
      .setDescription("Bolalar mahsulotlari marketplace API")
      .setVersion("v-01")
      .addBearerAuth(
        {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          name: "JWT",
          description: "Enter JWT token",
          in: "header",
        },
        "inbola"
      )
      .build();

    // Additional static file serving for public folder
    const uploadsPath = join(process.cwd(), 'public', 'uploads');
    console.log('Public uploads path:', uploadsPath);
    app.use('/public/uploads', express.static(uploadsPath));
    app.use('/images', express.static(join(process.cwd(), 'public', 'images')));

    app.use(bodyParser.json({ limit: "50mb" }));
    app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));

    const document = SwaggerModule.createDocument(app, config);

    SwaggerModule.setup("api/docs", app, document, {
      swaggerOptions: { defaultModelsExpandDepth: -1 },
    });

    await app.listen(PORT, () => {
      console.log(
        "\n\n + ====================================================================== +"
      );
      console.log(
        `| |                                                                      | | `
      );
      console.log(
        `| | 🚀          Server started at: http://localhost:${PORT}/api          🚀 | | `
      );
      console.log(
        `| |                                                                      | | `
      );
      console.log(
        `| | 📚  Swagger API documentation at: http://localhost:${PORT}/api/docs  📚 | |`
      );
      console.log(
        `| |                                                                      | | `
      );
      console.log(
        " + ====================================================================== +"
      );
    });
  } catch (error) {
    console.error("❌ Error starting server:", error);
  }
}

start();
