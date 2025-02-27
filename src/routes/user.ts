import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { verifyAuth } from '../middleware/auth';

export const userRoutes = async (
  fastify: FastifyInstance,
  options: FastifyPluginOptions
) => {
  // Define interface for user preferences
  interface UserPreferences {
    theme: 'light' | 'dark' | 'system';
    contentStyle: 'casual' | 'professional';
    calendarView: 'month' | 'week' | 'list';
    defaultKeywordMode: 'exact' | 'balanced' | 'related';
  }

  // Define interface for user settings request
  interface UpdateSettingsRequest {
    preferences: UserPreferences;
  }

  // Define interface for calendar entries
  interface CalendarEntry {
    id: string;
    title: string;
    date: string;
    format: string;
    description: string;
  }

  // Define interface for calendar entries request
  interface SaveCalendarRequest {
    entries: CalendarEntry[];
  }

  // Get user settings/preferences
  fastify.get('/user/settings', {
    preValidation: [verifyAuth],
  }, async (request, reply) => {
    try {
      const userId = request.userId;
      
      // In a real implementation, you'd fetch user settings from database
      // For now, let's return placeholder data
      
      return {
        status: 'success',
        data: {
          userId,
          preferences: {
            defaultStyle: 'casual',
            calendarView: 'month',
            defaultKeywordMode: 'exact',
          },
        },
      };
    } catch (error) {
      request.log.error(error);
      return reply.status(500).send({
        status: 'error',
        message: 'Failed to fetch user settings',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      });
    }
  });

  // Update user settings
  fastify.put('/user/settings', {
    preValidation: [verifyAuth],
    schema: {
      body: {
        type: 'object',
        required: ['preferences'],
        properties: {
          preferences: {
            type: 'object',
            properties: {
              theme: { type: 'string', enum: ['light', 'dark', 'system'] },
              contentStyle: { type: 'string', enum: ['casual', 'professional'] },
              calendarView: { type: 'string', enum: ['month', 'week', 'list'] },
              defaultKeywordMode: { type: 'string', enum: ['exact', 'balanced', 'related'] },
            },
          },
        },
      },
    },
  }, async (request, reply) => {
    try {
      const userId = request.userId;
      const { preferences } = request.body as UpdateSettingsRequest;
      
      // In a real implementation, you'd update settings in the database
      // For now, just return success
      
      return {
        status: 'success',
        message: 'User settings updated successfully',
        data: {
          userId,
          preferences,
        },
      };
    } catch (error) {
      request.log.error(error);
      return reply.status(500).send({
        status: 'error',
        message: 'Failed to update user settings',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      });
    }
  });

  // Save calendar entries
  fastify.post('/user/calendar', {
    preValidation: [verifyAuth],
    schema: {
      body: {
        type: 'object',
        required: ['entries'],
        properties: {
          entries: {
            type: 'array',
            items: {
              type: 'object',
              required: ['id', 'title', 'date'],
              properties: {
                id: { type: 'string' },
                title: { type: 'string' },
                format: { type: 'string' },
                description: { type: 'string' },
                date: { type: 'string', format: 'date-time' },
              },
            },
          },
        },
      },
    },
  }, async (request, reply) => {
    try {
      const userId = request.userId;
      const { entries } = request.body as SaveCalendarRequest;
      
      // In a real implementation, you'd save entries to the database
      // For now, just return success
      
      return {
        status: 'success',
        message: 'Calendar entries saved successfully',
        data: {
          userId,
          savedCount: entries.length,
        },
      };
    } catch (error) {
      request.log.error(error);
      return reply.status(500).send({
        status: 'error',
        message: 'Failed to save calendar entries',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      });
    }
  });

  // Get calendar entries
  fastify.get('/user/calendar', {
    preValidation: [verifyAuth],
  }, async (request, reply) => {
    try {
      const userId = request.userId;
      
      // In a real implementation, you'd fetch entries from the database
      // For now, return empty array
      
      return {
        status: 'success',
        data: {
          userId,
          entries: [],
        },
      };
    } catch (error) {
      request.log.error(error);
      return reply.status(500).send({
        status: 'error',
        message: 'Failed to fetch calendar entries',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      });
    }
  });
}; 