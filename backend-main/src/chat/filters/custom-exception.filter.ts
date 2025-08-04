import { GraphQLError } from 'graphql';
import { ArgumentsHost, Catch, BadRequestException } from '@nestjs/common';

import { GqlExceptionFilter } from '@nestjs/graphql';
@Catch(BadRequestException)
export class GraphQLErrorFilter implements GqlExceptionFilter {
  catch(exception: BadRequestException) {
    const response = exception.getResponse();

    if (typeof response === 'object') {
      // Directly throw GraphQLError with the response object.
      throw new GraphQLError('Validation error', {
        extensions: { code: 'VALIDATION_ERROR', ...response },
      });
    } else {
      throw new GraphQLError('Bad Request');
    }
  }
}
