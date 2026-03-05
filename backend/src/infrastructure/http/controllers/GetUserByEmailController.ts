import { Request, Response } from 'express';
import { GetUserByEmailUseCase } from '../../../application/use-cases/GetUserByEmailUseCase';

export class GetUserByEmailController {
  constructor(private getUserByEmailUseCase: GetUserByEmailUseCase) {}

  async handle(request: Request, response: Response): Promise<Response> {
    try {
      const email = request.params.email?.toString();

      if (!email) {
        return response.status(400).json({ error: 'Email parameter is required.' });
      }

      const user = await this.getUserByEmailUseCase.execute(email);

      if (!user) {
        return response.status(404).json({ error: 'User not found.' });
      }

      return response.status(200).json(user);
    } catch (err: any) {
      return response.status(400).json({
        error: err.message || 'Unexpected error while fetching user.',
      });
    }
  }
}
