import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Apple from "next-auth/providers/apple";
import Credentials from "next-auth/providers/credentials";
import { getJson, setJson } from "@/lib/storage";

export const { handlers, auth, signIn, signOut } = NextAuth({
    providers: [
        Google({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        }),
        Apple({
            clientId: process.env.APPLE_ID,
            clientSecret: process.env.APPLE_SECRET,
        }),
        Credentials({
            name: "credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    return null;
                }

                try {
                    let users = await getJson("users.json") || [];

                    // Find user by email
                    const user = users.find(u => u.email === credentials.email);

                    if (!user) {
                        // New user registration
                        const newUser = {
                            id: `user-${Date.now()}`,
                            email: credentials.email,
                            nickname: credentials.email.split('@')[0],
                            office: 'Member',
                            role: 'user',
                            createdAt: new Date().toISOString(),
                        };
                        users.push(newUser);
                        await setJson("users.json", users);
                        return newUser;
                    }

                    // For demo, accept any password for existing users
                    return user;
                } catch (error) {
                    console.error("Authorize error:", error);
                    return null;
                }
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.role = user.role;
                token.office = user.office;
                token.nickname = user.nickname;
            }
            return token;
        },
        async session({ session, token }) {
            if (token) {
                session.user.id = token.sub;
                session.user.role = token.role;
                session.user.office = token.office;
                session.user.nickname = token.nickname;
            }
            return session;
        },
    },
    pages: {
        signIn: "/",
    },
    secret: process.env.AUTH_SECRET,
});
