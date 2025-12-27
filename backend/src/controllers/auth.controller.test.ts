import { Request, Response } from 'express';
import { register, login, getProfile, updateProfile, changePassword } from '../controllers/auth.controller';
import { readDb, writeDb } from '../services/db.service';

jest.mock('../services/db.service', () => ({
  readDb: jest.fn(),
  writeDb: jest.fn(),
}));

const mockRequest = (body: any = {}, user: any = null) => {
  const req = {} as Request;
  req.body = body;
  req.user = user;
  req.userId = user ? user.id : null;
  return req;
};

const mockResponse = () => {
  const res = {} as Response;
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.sendStatus = jest.fn().mockReturnValue(res);
  return res;
};

describe('Auth Controller', () => {
  beforeEach(() => {
    (readDb as jest.Mock).mockReturnValue({
      users: [
        { id: 1, email: 'test@test.com', password: 'hashedpassword', cpf: '12345678900', phone: '1234567890' },
      ],
      orders: [],
    });
    (writeDb as jest.Mock).mockClear();
  });

  describe('register', () => {
    it('should register a new user', async () => {
      const req = mockRequest({
        email: 'new@test.com',
        password: 'Password123',
        name: 'Test User',
        cpf: '12345678901',
        phone: '12345678901',
      });
      const res = mockResponse();

      await (register as any)[1](req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'User registered successfully',
        })
      );
      expect(writeDb).toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('should login an existing user', async () => {
      const req = mockRequest({
        email: 'test@test.com',
        password: 'password',
      });
      const res = mockResponse();
      const { comparePassword } = require('../services/security.service');
      (comparePassword as jest.Mock).mockResolvedValue(true);


      await (login as any)[1](req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Login successful',
        })
      );
    });
  });

  describe('getProfile', () => {
    it('should get user profile', async () => {
      const req = mockRequest({}, { id: 1 });
      const res = mockResponse();

      await (getProfile as any)[1](req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
            user: expect.any(Object)
        })
      );
    });
  });

  describe('updateProfile', () => {
    it('should update user profile', async () => {
      const req = mockRequest({ email: 'newemail@test.com', phone: '12345678901' }, { id: 1 });
      const res = mockResponse();

      await (updateProfile as any)[2](req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Profile updated successfully',
        })
      );
      expect(writeDb).toHaveBeenCalled();
    });
  });

  describe('changePassword', () => {
    it('should change user password', async () => {
        const req = mockRequest({ oldPassword: 'password', newPassword: 'newPassword123' }, { id: 1 });
        const res = mockResponse();
        const { comparePassword, hashPassword } = require('../services/security.service');
        (comparePassword as jest.Mock).mockResolvedValue(true);
        (hashPassword as jest.Mock).mockResolvedValue('newhashedpassword');
  
        await (changePassword as any)[2](req, res);
  
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(
          expect.objectContaining({
            message: 'Password changed successfully',
          })
        );
        expect(writeDb).toHaveBeenCalled();
      });
  });
});
