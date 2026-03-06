import { jest } from '@jest/globals';
import { describe, beforeEach, it, expect } from '@jest/globals';
import { Request, Response } from 'express';
import { register, login, getProfile, updateProfile, changePassword } from '../controllers/auth.controller';
import { readDb, writeDb } from '../services/db.service';
import * as securityService from '../services/security.service';

jest.mock('../services/db.service', () => ({
  readDb: jest.fn(),
  writeDb: jest.fn(),
}));

jest.mock('../services/security.service', () => ({
  comparePassword: jest.fn(),
  hashPassword: jest.fn(),
}));

interface User {
  id: number;
  email?: string;
  password?: string;
  cpf?: string;
  phone?: string;
}

const mockRequest = (body: Record<string, unknown> = {}, user: User | null = null): Request => {
  const req = {} as Request;
  req.body = body;
  req.user = user as any;
  req.userId = user ? user.id : null;
  return req;
};

const mockResponse = (): Response => {
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
    (securityService.comparePassword as jest.Mock).mockClear();
    (securityService.hashPassword as jest.Mock).mockClear();
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
      (securityService.hashPassword as jest.Mock).mockResolvedValue('newhashedpassword');

      await register(req, res, jest.fn());

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
      (securityService.comparePassword as jest.Mock).mockResolvedValue(true);

      await login(req, res, jest.fn());

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

      await getProfile(req, res, jest.fn());

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

      await updateProfile(req, res, jest.fn());

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
        (securityService.comparePassword as jest.Mock).mockResolvedValue(true);
        (securityService.hashPassword as jest.Mock).mockResolvedValue('newhashedpassword');

        await changePassword(req, res, jest.fn());

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
