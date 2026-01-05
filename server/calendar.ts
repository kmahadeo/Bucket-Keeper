// Google Calendar integration via Replit Connectors
// Note: In production, each user would have their own OAuth connection.
// Currently uses the environment-level Google Calendar connector for demo purposes.
import { google } from 'googleapis';

let connectionSettings: any;

async function getAccessToken() {
  if (connectionSettings && connectionSettings.settings.expires_at && new Date(connectionSettings.settings.expires_at).getTime() > Date.now()) {
    return connectionSettings.settings.access_token;
  }
  
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY 
    ? 'repl ' + process.env.REPL_IDENTITY 
    : process.env.WEB_REPL_RENEWAL 
    ? 'depl ' + process.env.WEB_REPL_RENEWAL 
    : null;

  if (!xReplitToken) {
    throw new Error('X_REPLIT_TOKEN not found for repl/depl');
  }

  connectionSettings = await fetch(
    'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=google-calendar',
    {
      headers: {
        'Accept': 'application/json',
        'X_REPLIT_TOKEN': xReplitToken
      }
    }
  ).then(res => res.json()).then(data => data.items?.[0]);

  const accessToken = connectionSettings?.settings?.access_token || connectionSettings?.settings?.oauth?.credentials?.access_token;

  if (!connectionSettings || !accessToken) {
    throw new Error('Google Calendar not connected');
  }
  return accessToken;
}

export async function getGoogleCalendarClient() {
  const accessToken = await getAccessToken();

  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({
    access_token: accessToken
  });

  return google.calendar({ version: 'v3', auth: oauth2Client });
}

export async function isCalendarConnected(): Promise<boolean> {
  try {
    await getAccessToken();
    return true;
  } catch {
    return false;
  }
}

export async function getCalendarEvents(timeMin?: Date, timeMax?: Date) {
  const calendar = await getGoogleCalendarClient();
  
  const now = new Date();
  const defaultTimeMin = timeMin || now;
  const defaultTimeMax = timeMax || new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  const response = await calendar.events.list({
    calendarId: 'primary',
    timeMin: defaultTimeMin.toISOString(),
    timeMax: defaultTimeMax.toISOString(),
    singleEvents: true,
    orderBy: 'startTime',
    maxResults: 50
  });

  return response.data.items || [];
}

export async function createCalendarEvent(event: {
  title: string;
  description?: string;
  startDate: Date;
  endDate?: Date;
  allDay?: boolean;
}) {
  const calendar = await getGoogleCalendarClient();
  
  const endDate = event.endDate || new Date(event.startDate.getTime() + 60 * 60 * 1000);
  
  const eventData: any = {
    summary: event.title,
    description: event.description || '',
  };

  if (event.allDay) {
    eventData.start = { date: event.startDate.toISOString().split('T')[0] };
    eventData.end = { date: endDate.toISOString().split('T')[0] };
  } else {
    eventData.start = { dateTime: event.startDate.toISOString() };
    eventData.end = { dateTime: endDate.toISOString() };
  }

  const response = await calendar.events.insert({
    calendarId: 'primary',
    requestBody: eventData
  });

  return response.data;
}

export async function deleteCalendarEvent(eventId: string) {
  const calendar = await getGoogleCalendarClient();
  
  await calendar.events.delete({
    calendarId: 'primary',
    eventId
  });
}
