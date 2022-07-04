import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as pactum from 'pactum';
import { PrismaService } from '../src/prisma/prisma.service';
import { AppModule } from '../src/app.module';
import { AuthDto } from '../src/auth/dto';
import { EditUserDto } from 'src/user/dto';

describe('App e2e test', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
      }),
    );
    await app.init();
    await app.listen(3061);

    prisma = app.get(PrismaService);

    await prisma.cleanDb();
    pactum.request.setBaseUrl('http://localhost:3061');
  });
  afterAll(async () => {
    app.close();
  });

  describe('Auth', () => {
    const dto: AuthDto = {
      email: 'kayrabtuncer@gmail.com',
      password: '123456',
    };
    describe('Signup', () => {
      it('should throw if email empty', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody({
            ...dto,
            email: '',
          })
          .expectStatus(400);
      });
      it('should throw if password empty', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody({
            ...dto,
            password: '',
          })
          .expectStatus(400);
      });
      it('should throw if no body', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody({})
          .expectStatus(400);
      });
      it('should signup', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody(dto)
          .expectStatus(201);
      });
    });

    describe('Signin', () => {
      it('should throw if email empty', () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody({
            ...dto,
            email: '',
          })
          .expectStatus(400);
      });
      it('should throw if password empty', () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody({
            ...dto,
            password: '',
          })
          .expectStatus(400);
      });
      it('should throw if no body', () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody({})
          .expectStatus(400);
      });
      it('should signin', () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody(dto)
          .expectStatus(200)
          .stores('userAt', 'access_token');
      });
    });
  });

  describe('User', () => {
    describe('Get me', () => {
      it('should get current user', () => {
        return pactum
          .spec()
          .get('/users/me')
          .withHeaders({ Authorization: 'Bearer $S{userAt}' })
          .expectStatus(200);
      });
    });

    describe('Edit user', () => {
      it('should edit user', () => {
        const dto: EditUserDto = {
          firstName: 'Kayra',
          email: 'kayrabtuncer@gmail.com',
        };
        return pactum
          .spec()
          .patch('/users')
          .withHeaders({ Authorization: 'Bearer $S{userAt}' })
          .withBody(dto)
          .expectStatus(200)
          .expectBodyContains(dto.firstName)
          .expectBodyContains(dto.email);
      });
    });
  });

  describe('Bookmarks', () => {
    describe('Get bookmarks', () => {});

    describe('Create bookmark', () => {});

    describe('Get bookmark by Id', () => {});

    describe('Edit bookmark by Id', () => {});

    describe('Delete bookmark by Id', () => {});
  });
});
