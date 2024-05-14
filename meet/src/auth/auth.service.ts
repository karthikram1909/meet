// auth.service.ts

import { Headers, Injectable } from '@nestjs/common';
import { Configuration, PublicClientApplication, AuthenticationResult, LogLevel } from '@azure/msal-node';
import { Request } from 'express';
import { Client, ClientOptions } from "@microsoft/microsoft-graph-client";
import { config } from 'process';
import * as fs from 'fs';


@Injectable()
export class AuthService {
  private readonly msalClient: PublicClientApplication;
  constructor() {
    const config: Configuration = {
      auth: { 
        clientId: '9929b4cd-858a-4866-9000-659df59f48c3', // client id
        authority: 'https://login.microsoftonline.com/66df2680-2f88-4513-81c2-65cd0c5dbef2', //tenent id
        //redirectUri: 'http://localhost:3000/auth/callback',
      },
      system: {
        loggerOptions: {
          loggerCallback(logLevel, message, containsPii) {
            console.log(message);
          },
          piiLoggingEnabled: false,
          logLevel: LogLevel.Error,
        },
      },
    };
    
    this.msalClient = new PublicClientApplication(config);
  }

  async getLoginUrl(): Promise<string> {
    const authCodeUrlParameters = {
      scopes: ['openid', 'profile', 'offline_access','Calendars.Read','User.Read'], 
      redirectUri: 'http://localhost:3000/auth/callback', 
    };

//   // Authenticate to get the user's account
//   const authResult = await this.msalClient.acquireTokenPopup({
//     scopes: ['User.Read'],
//   });
  
//   if (!authResult.account) {
//     throw new Error('Could not authenticate');
//   }

//   if(!authResult.accessToken) {
//     throw new Error('Could not get access token');
//   }
  
//   // @microsoft/microsoft-graph-client/authProviders/authCodeMsalBrowser
//   const authProvider = new AuthCodeMSALBrowserAuthenticationProvider(this.msalClient, {
//     account: authResult.account,
//     interactionType: InteractionType.Popup,
//     scopes: ['openid', 'profile', 'offline_access', 'https://graph.microsoft.com/Calendars.Read', 'User.Read'],
//   });
  
//   const graphClient = Client.initWithMiddleware({ authProvider: authProvider });
//   return authResult.accessToken;

    try {
      const response = await this.msalClient.getAuthCodeUrl(authCodeUrlParameters);
      return response;
    } catch (error) {
      console.error('Error getting login URL:', error);
      throw error;
    }
  }

  async handleCallback(req: Request): Promise<void> {
    console.log("entering handle callback");
    console.trace();
    console.log(req.query.code);
    const tokenRequest = {
      code: req.query.code as string,
      scopes: ['Calendars.Read','User.Read'], // Add any required scopes
      redirectUri: 'http://localhost:3000/auth/callback', // Adjust as needed
    };

    try {
      const authResult: AuthenticationResult = await this.msalClient.acquireTokenByCode(tokenRequest);
      console.log('Token acquired:', authResult.accessToken);
      console.log(authResult.scopes);
      // Handle successful authentication result, such as storing tokens in session
      const rawResult = await fetch('https://graph.microsoft.com/v1.0/me/events', { headers: {
        'Authorization': `Bearer ${authResult.accessToken}`
        
        }});
        console.log("Response Received from fetch");
        console.log(await rawResult.json());
    } catch (error) {
      console.error('Error acquiring token:', error);
      throw error;

    }

  }

  
  async logout(req: Request): Promise<void> {
    try {
        // Path to the cache file, modify as per your MSAL configuration
       
       
        console.log('Logout successful');
    } catch (error) {
        console.error('Error during logout:', error);
        throw error;
    }
}

}

