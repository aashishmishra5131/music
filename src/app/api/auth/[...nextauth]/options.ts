import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GitHubProvider from 'next-auth/providers/github';
import GoogleProvider from 'next-auth/providers/google';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/db.Connect';
import UserModel from '@/model/User';

/** Auto-generate a unique username for OAuth users */
async function makeUsername(base: string): Promise<string> {
  const cleaned = base
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/[^a-z0-9]/g, "")
    .slice(0, 14) || "user";

  let username = cleaned;
  let tries = 0;
  while (await UserModel.exists({ username })) {
    username = `${cleaned}${Math.floor(Math.random() * 9000 + 1000)}`;
    if (++tries > 10) break;
  }
  return username;
}

/** Only include a provider if real keys are set (not placeholder) */
function isRealKey(val: string | undefined): val is string {
  return !!val && !val.startsWith("your_") && val.length > 8;
}

const githubEnabled = isRealKey(process.env.GITHUB_CLIENT_ID) && isRealKey(process.env.GITHUB_CLIENT_SECRET);
const googleEnabled = isRealKey(process.env.GOOGLE_CLIENT_ID) && isRealKey(process.env.GOOGLE_CLIENT_SECRET);

export const authOptions: NextAuthOptions = {
  providers: [
    ...(githubEnabled
      ? [GitHubProvider({ clientId: process.env.GITHUB_CLIENT_ID!, clientSecret: process.env.GITHUB_CLIENT_SECRET! })]
      : []),
    ...(googleEnabled
      ? [GoogleProvider({ clientId: process.env.GOOGLE_CLIENT_ID!, clientSecret: process.env.GOOGLE_CLIENT_SECRET! })]
      : []),
    CredentialsProvider({
      id: 'credentials',
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials: any): Promise<any> {
        await dbConnect();
        try {
          const user = await UserModel.findOne({
            $or: [
              { email: credentials.identifier },
              { username: credentials.identifier },
            ],
          });
          if (!user) throw new Error('No user found with this email');
          if (!user.isVerified) throw new Error('Please verify your account before logging in');
          const isPasswordCorrect = await bcrypt.compare(credentials.password, user.password);
          if (isPasswordCorrect) return user;
          throw new Error('Incorrect password');
        } catch (err: any) {
          throw new Error(err);
        }
      },
    }),
  ],

  callbacks: {
    async signIn({ user, account }) {
      // Handle OAuth providers
      if (account?.provider === 'github' || account?.provider === 'google') {
        if (!user.email) return false;
        await dbConnect();
        const existing = await UserModel.findOne({ email: user.email });
        if (!existing) {
          const username = await makeUsername(user.name || user.email.split('@')[0]);
          await UserModel.create({
            email: user.email,
            username,
            password: '',
            verifyCode: '000000',
            verifyCodeExpiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
            isVerified: true,
            isAcceptingMessage: true,
          });
        }
        return true;
      }
      return true;
    },

    async jwt({ token, user, account }) {
      if (user) {
        if ((user as any)._id) {
          // Credentials login — user object is the Mongoose doc
          token._id = (user as any)._id.toString();
          token.isVerified = (user as any).isVerified;
          token.isAcceptingMessages = (user as any).isAcceptingMessage;
          token.username = (user as any).username;
        } else if (user.email) {
          // OAuth login — look up from DB
          await dbConnect();
          const dbUser = await UserModel.findOne({ email: user.email }).lean() as any;
          if (dbUser) {
            token._id = dbUser._id.toString();
            token.isVerified = dbUser.isVerified;
            token.isAcceptingMessages = dbUser.isAcceptingMessage;
            token.username = dbUser.username;
          }
        }
      }
      return token;
    },

    async session({ session, token }) {
      if (token) {
        session.user._id = token._id;
        session.user.isVerified = token.isVerified;
        session.user.isAcceptingMessages = token.isAcceptingMessages;
        session.user.username = token.username;
      }
      return session;
    },
  },

  session: { strategy: 'jwt' },
  secret: process.env.NEXTAUTH_SECRET,
  pages: { signIn: '/login' },
};
