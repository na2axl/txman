import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module.js';
import { configureApp } from '../src/app.setup.js';
import { generateReference } from '../src/db/seed/reference.js';

const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'admin1234';

describe('Transactions API (e2e)', () => {
  let app: INestApplication;
  let token: string;

  const api = () => request(app.getHttpServer());
  const auth = () => ({ Authorization: `Bearer ${token}` });

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleRef.createNestApplication();
    configureApp(app);
    await app.init();

    const login = await api()
      .post('/api/v1/auth/login')
      .send({ username: ADMIN_USERNAME, password: ADMIN_PASSWORD })
      .expect(200);
    token = login.body.access_token;
  });

  afterAll(async () => {
    await app.close();
  });

  it('rejects unauthenticated requests', async () => {
    const res = await api().get('/api/v1/transactions').expect(401);
    expect(res.headers['content-type']).toContain('application/problem+json');
  });

  it('creates a transaction as PENDING, then approves it once', async () => {
    const created = await api()
      .post('/api/v1/transactions')
      .set(auth())
      .send({
        reference: generateReference(),
        customer_name: 'E2E Customer',
        amount: 12550,
        currency: 'USD',
      })
      .expect(201);
    expect(created.body).toMatchObject({
      status: 'PENDING',
      amount: 12550,
      allowed_transitions: ['APPROVED', 'REJECTED'],
    });

    const id = created.body.id;
    await api()
      .patch(`/api/v1/transactions/${id}/status`)
      .set(auth())
      .send({ status: 'APPROVED' })
      .expect(200);

    const invalid = await api()
      .patch(`/api/v1/transactions/${id}/status`)
      .set(auth())
      .send({ status: 'REJECTED' })
      .expect(409);
    expect(invalid.body.detail).toContain('APPROVED');
  });

  it('rejects a duplicate reference with 409', async () => {
    const existing = await api()
      .get('/api/v1/transactions?page_size=1')
      .set(auth())
      .expect(200);
    const { reference, customer } = existing.body.data[0];
    await api()
      .post('/api/v1/transactions')
      .set(auth())
      .send({
        reference,
        customer_id: customer.id,
        amount: 100,
        currency: 'USD',
      })
      .expect(409);
  });

  it('validates the payload with field errors', async () => {
    const res = await api()
      .post('/api/v1/transactions')
      .set(auth())
      .send({
        reference: 'bad',
        customer_name: 'x',
        amount: -1,
        currency: 'USD',
      })
      .expect(422);
    expect(res.body.errors.map((e: { field: string }) => e.field)).toContain(
      'reference',
    );
  });
});
